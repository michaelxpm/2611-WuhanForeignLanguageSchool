import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export type WalkerCharacter = 'girl' | 'kuromi' | 'ironman';

export interface MobileJoystickInput {
  x: number; // -1..1 (strafe / turn)
  y: number; // -1..1 (forward / back)
  sprint: boolean;
}

interface GirlWalkerProps {
  enabled: boolean;
  character: WalkerCharacter;
  mobileInputRef: React.MutableRefObject<MobileJoystickInput>;
  onYawChange?: (yawDeg: number) => void;
}

function NormalizedGltfCharacter({ url, targetHeight }: { url: string; targetHeight: number }) {
  const gltf = useGLTF(url);
  const { cloned, scale, offset } = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = size.y > 0.001 ? targetHeight / size.y : 1;
    return {
      cloned: c,
      scale: s,
      offset: [-center.x * s, -box.min.y * s, -center.z * s] as [number, number, number],
    };
  }, [gltf.scene, targetHeight]);

  return (
    <group rotation={[0, Math.PI, 0]}>
      <group position={offset} scale={[scale, scale, scale]}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

export function GirlWalker({ enabled, character, mobileInputRef, onYawChange }: GirlWalkerProps) {
  const { camera, gl } = useThree();
  const charRootRef = useRef<THREE.Group>(null);
  const gltfMotionRef = useRef<THREE.Group>(null);

  // Girl articulated rig refs
  const pelvisRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const ponytailRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const leftFootRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const rightFootRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  const keys = useRef<Record<string, boolean>>({});
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);
  const yaw = useRef(0.45);
  const pitch = useRef(0.18);
  const camDist = useRef(3.8);
  const walkPhase = useRef(0);
  const pos = useRef(new THREE.Vector3(-42, 0, 72));
  const vel = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current || e.pointerType === 'touch') return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      yaw.current -= dx * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.003, -0.15, 0.78);
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist.current = THREE.MathUtils.clamp(camDist.current + e.deltaY * 0.0035, 1.6, 12.0);
    };

    // Touch drag + Two-finger pinch zoom for Mobile
    let lastTouch: { x: number; y: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        pinchDist.current = null;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDist.current = Math.hypot(dx, dy);
        lastTouch = null;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && lastTouch) {
        const dx = e.touches[0].clientX - lastTouch.x;
        const dy = e.touches[0].clientY - lastTouch.y;
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        yaw.current -= dx * 0.006;
        pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.004, -0.15, 0.78);
      } else if (e.touches.length === 2 && pinchDist.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.hypot(dx, dy);
        const delta = pinchDist.current - newDist;
        pinchDist.current = newDist;
        camDist.current = THREE.MathUtils.clamp(camDist.current + delta * 0.025, 1.6, 12.0);
      }
    };
    const onTouchEnd = () => {
      lastTouch = null;
      pinchDist.current = null;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, gl]);

  useFrame((_, rawDelta) => {
    if (!enabled || !charRootRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    const joy = mobileInputRef.current;
    const isSprint =
      keys.current['ShiftLeft'] || keys.current['ShiftRight'] || joy.sprint;
    const maxSpeed = isSprint ? 8.8 : 4.4;

    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    const inputDir = new THREE.Vector3();
    if (keys.current['KeyW'] || keys.current['ArrowUp']) inputDir.add(forward);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) inputDir.sub(forward);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) inputDir.add(right);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) inputDir.sub(right);

    if (Math.abs(joy.x) > 0.05 || Math.abs(joy.y) > 0.05) {
      inputDir.addScaledVector(forward, joy.y);
      inputDir.addScaledVector(right, joy.x);
    }

    if (inputDir.lengthSq() > 0.001) {
      inputDir.normalize();
      const targetVel = inputDir.multiplyScalar(maxSpeed);
      vel.current.lerp(targetVel, 1 - Math.exp(-8.5 * delta));
    } else {
      vel.current.lerp(new THREE.Vector3(0, 0, 0), 1 - Math.exp(-10.5 * delta));
    }

    const speed = vel.current.length();
    const speedRatio = Math.min(1, speed / 4.4);

    if (speed > 0.05) {
      pos.current.addScaledVector(vel.current, delta);
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -385, 160);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z, -290, 160);

      const targetAngle = Math.atan2(-vel.current.x, -vel.current.z);
      const diff = Math.atan2(
        Math.sin(targetAngle - charRootRef.current.rotation.y),
        Math.cos(targetAngle - charRootRef.current.rotation.y)
      );
      charRootRef.current.rotation.y += diff * Math.min(1, delta * 9);
      walkPhase.current += speed * delta * 2.4;
    }

    charRootRef.current.position.copy(pos.current);

    const p = walkPhase.current;
    const amp = Math.min(1.25, speed / 4.0);

    // Animate Girl Rig
    if (character === 'girl') {
      const bob = Math.abs(Math.sin(p)) * 0.042 * amp;
      const swayX = Math.cos(p) * 0.022 * amp;
      if (pelvisRef.current) {
        pelvisRef.current.position.y = 0.64 + bob;
        pelvisRef.current.position.x = swayX;
        pelvisRef.current.rotation.y = Math.sin(p) * 0.09 * amp;
        pelvisRef.current.rotation.z = Math.cos(p) * 0.035 * amp;
      }
      if (torsoRef.current) {
        torsoRef.current.rotation.y = -Math.sin(p) * 0.14 * amp;
        torsoRef.current.rotation.x = -0.05 * speedRatio - (isSprint ? 0.08 * speedRatio : 0);
      }
      if (ponytailRef.current) {
        ponytailRef.current.rotation.x = 0.35 + Math.sin(p * 2 - 0.6) * 0.15 * amp;
      }

      const applyLeg = (
        phaseOffset: number,
        thigh: THREE.Group | null,
        shin: THREE.Group | null,
        foot: THREE.Group | null
      ) => {
        const lp = p + phaseOffset;
        const sinP = Math.sin(lp);
        const cosP = Math.cos(lp);
        if (thigh) thigh.rotation.x = sinP * 0.52 * amp;
        if (shin) {
          const swingBend = Math.max(0, cosP) * 0.85 * amp;
          const stanceCushion = Math.max(0, -sinP) * 0.12 * amp;
          shin.rotation.x = -(swingBend + stanceCushion);
        }
        if (foot) foot.rotation.x = cosP * 0.22 * amp;
      };

      applyLeg(0, leftThighRef.current, leftShinRef.current, leftFootRef.current);
      applyLeg(Math.PI, rightThighRef.current, rightShinRef.current, rightFootRef.current);

      // Free symmetrical arm swing (no trolley!)
      if (leftUpperArmRef.current) leftUpperArmRef.current.rotation.x = -Math.sin(p) * 0.45 * amp;
      if (leftForearmRef.current) leftForearmRef.current.rotation.x = 0.25 + Math.max(0, -Math.sin(p)) * 0.35 * amp;
      if (rightUpperArmRef.current) rightUpperArmRef.current.rotation.x = Math.sin(p) * 0.45 * amp;
      if (rightForearmRef.current) rightForearmRef.current.rotation.x = 0.25 + Math.max(0, Math.sin(p)) * 0.35 * amp;
    } else if (gltfMotionRef.current) {
      // Procedural physics locomotion for Kuromi & Iron Man
      const bounceHeight = character === 'kuromi' ? 0.085 : 0.045;
      gltfMotionRef.current.position.y = Math.abs(Math.sin(p)) * bounceHeight * amp;
      gltfMotionRef.current.rotation.z = Math.cos(p) * (character === 'kuromi' ? 0.08 : 0.03) * amp;
      gltfMotionRef.current.rotation.x = -0.07 * speedRatio;
      gltfMotionRef.current.rotation.y = Math.sin(p) * 0.06 * amp;
    }

    // Zoomable side-back over-the-shoulder camera
    const d = camDist.current;
    const camOffset = new THREE.Vector3(
      0.27 * d,
      0.48 * d + Math.sin(pitch.current) * (0.4 * d),
      d * Math.cos(pitch.current)
    );
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const desiredCamPos = pos.current.clone().add(camOffset);
    desiredCamPos.y = Math.max(1.0, desiredCamPos.y);

    camera.position.lerp(desiredCamPos, 1 - Math.exp(-10 * delta));

    const lookTarget = pos.current
      .clone()
      .add(new THREE.Vector3(0, character === 'ironman' ? 1.45 : 1.18, 0))
      .add(forward.clone().multiplyScalar(2.0));
    camera.lookAt(lookTarget);

    if (onYawChange) {
      onYawChange(THREE.MathUtils.radToDeg(yaw.current));
    }
  });

  if (!enabled) return null;

  return (
    <group ref={charRootRef} position={pos.current}>
      {character === 'girl' && (
        <group ref={pelvisRef} position={[0, 0.64, 0]}>
          {/* Left Leg (Smooth CapsuleGeometry + Rounded Sneakers) */}
          <group ref={leftThighRef} position={[-0.09, 0, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <capsuleGeometry args={[0.064, 0.19, 8, 12]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.72} />
            </mesh>
            <mesh position={[-0.062, -0.15, 0]}>
              <boxGeometry args={[0.01, 0.24, 0.022]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
            </mesh>
            <group ref={leftShinRef} position={[0, -0.31, 0]}>
              <mesh position={[0, -0.14, 0]} castShadow>
                <capsuleGeometry args={[0.052, 0.18, 8, 12]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.72} />
              </mesh>
              <group ref={leftFootRef} position={[0, -0.3, 0]}>
                <mesh position={[0, -0.02, -0.035]} castShadow>
                  <capsuleGeometry args={[0.044, 0.11, 6, 10]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.45} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Right Leg */}
          <group ref={rightThighRef} position={[0.09, 0, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <capsuleGeometry args={[0.064, 0.19, 8, 12]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.72} />
            </mesh>
            <mesh position={[0.062, -0.15, 0]}>
              <boxGeometry args={[0.01, 0.24, 0.022]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
            </mesh>
            <group ref={rightShinRef} position={[0, -0.31, 0]}>
              <mesh position={[0, -0.14, 0]} castShadow>
                <capsuleGeometry args={[0.052, 0.18, 8, 12]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.72} />
              </mesh>
              <group ref={rightFootRef} position={[0, -0.3, 0]}>
                <mesh position={[0, -0.02, -0.035]} castShadow>
                  <capsuleGeometry args={[0.044, 0.11, 6, 10]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.45} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Sculpted Upper Body: WFLS Navy Parka + Hood + Rounded Shoulders */}
          <group ref={torsoRef} position={[0, 0.04, 0]}>
            {/* Rounded Shoulder Cap & Upper Chest */}
            <mesh position={[0, 0.38, 0]} scale={[1.15, 0.72, 0.88]} castShadow>
              <sphereGeometry args={[0.16, 16, 14]} />
              <meshStandardMaterial color="#1e3358" roughness={0.7} />
            </mesh>
            {/* Tapered A-Line Parka */}
            <mesh position={[0, 0.18, 0]} scale={[1.05, 1, 0.85]} castShadow>
              <cylinderGeometry args={[0.145, 0.205, 0.48, 18]} />
              <meshStandardMaterial color="#1e3358" roughness={0.72} />
            </mesh>
            {/* Bright Yellow Zipper + Hood Trim */}
            <mesh position={[0, 0.19, -0.155]} rotation={[-0.09, 0, 0]}>
              <boxGeometry args={[0.022, 0.46, 0.02]} />
              <meshStandardMaterial color="#facc15" roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.44, 0.02]} rotation={[0.15, 0, 0]} castShadow>
              <torusGeometry args={[0.11, 0.035, 10, 20]} />
              <meshStandardMaterial color="#facc15" roughness={0.6} />
            </mesh>
            {/* School Crest */}
            <mesh position={[-0.095, 0.32, -0.13]} rotation={[0, -0.45, 0]}>
              <circleGeometry args={[0.03, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>

            {/* Smooth Rounded Left Arm */}
            <group ref={leftUpperArmRef} position={[-0.19, 0.39, 0]}>
              <mesh position={[0, -0.1, 0]} castShadow>
                <capsuleGeometry args={[0.048, 0.14, 8, 12]} />
                <meshStandardMaterial color="#1e3358" roughness={0.72} />
              </mesh>
              <group ref={leftForearmRef} position={[0, -0.2, 0]}>
                <mesh position={[0, -0.09, 0]} castShadow>
                  <capsuleGeometry args={[0.042, 0.12, 8, 12]} />
                  <meshStandardMaterial color="#1e3358" roughness={0.72} />
                </mesh>
                <mesh position={[0, -0.19, 0]}>
                  <sphereGeometry args={[0.036, 10, 10]} />
                  <meshStandardMaterial color="#f7d3ba" roughness={0.62} />
                </mesh>
              </group>
            </group>

            {/* Smooth Rounded Right Arm */}
            <group ref={rightUpperArmRef} position={[0.19, 0.39, 0]}>
              <mesh position={[0, -0.1, 0]} castShadow>
                <capsuleGeometry args={[0.048, 0.14, 8, 12]} />
                <meshStandardMaterial color="#1e3358" roughness={0.72} />
              </mesh>
              <group ref={rightForearmRef} position={[0, -0.2, 0]}>
                <mesh position={[0, -0.09, 0]} castShadow>
                  <capsuleGeometry args={[0.042, 0.12, 8, 12]} />
                  <meshStandardMaterial color="#1e3358" roughness={0.72} />
                </mesh>
                <mesh position={[0, -0.19, 0]}>
                  <sphereGeometry args={[0.036, 10, 10]} />
                  <meshStandardMaterial color="#f7d3ba" roughness={0.62} />
                </mesh>
              </group>
            </group>

            {/* Neck & Sculpted Head */}
            <mesh position={[0, 0.49, 0]} castShadow>
              <cylinderGeometry args={[0.042, 0.048, 0.08, 12]} />
              <meshStandardMaterial color="#f7d3ba" roughness={0.62} />
            </mesh>
            <group position={[0, 0.62, 0]}>
              <mesh scale={[0.96, 1.04, 0.94]} castShadow>
                <sphereGeometry args={[0.135, 22, 22]} />
                <meshStandardMaterial color="#f7d3ba" roughness={0.6} />
              </mesh>
              {/* Ears */}
              <mesh position={[-0.132, -0.01, 0]}>
                <sphereGeometry args={[0.024, 10, 10]} />
                <meshStandardMaterial color="#f7d3ba" roughness={0.62} />
              </mesh>
              <mesh position={[0.132, -0.01, 0]}>
                <sphereGeometry args={[0.024, 10, 10]} />
                <meshStandardMaterial color="#f7d3ba" roughness={0.62} />
              </mesh>
              {/* Expressive Eyes with White Specular Highlights */}
              {[-0.045, 0.045].map((ex, idx) => (
                <group key={idx} position={[ex, 0.012, -0.12]}>
                  <mesh>
                    <sphereGeometry args={[0.016, 10, 10]} />
                    <meshStandardMaterial color="#1c1917" roughness={0.15} />
                  </mesh>
                  <mesh position={[0.005, 0.006, -0.013]}>
                    <sphereGeometry args={[0.005, 6, 6]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
              ))}
              {/* Subtle Nose & Smile */}
              <mesh position={[0, -0.015, -0.128]}>
                <sphereGeometry args={[0.011, 8, 8]} />
                <meshStandardMaterial color="#eec1a3" roughness={0.65} />
              </mesh>
              <mesh position={[0, -0.052, -0.118]} rotation={[0.1, 0, Math.PI]}>
                <torusGeometry args={[0.018, 0.004, 6, 12, Math.PI * 0.8]} />
                <meshStandardMaterial color="#e11d48" roughness={0.5} />
              </mesh>
              {/* Hair Cap & Side Bangs */}
              <mesh position={[0, 0.032, 0.018]} castShadow>
                <sphereGeometry args={[0.143, 22, 20, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
                <meshStandardMaterial color="#1c1917" roughness={0.72} />
              </mesh>
              <mesh position={[-0.09, 0.03, -0.08]} rotation={[0.2, 0.4, 0.3]}>
                <capsuleGeometry args={[0.025, 0.07, 6, 8]} />
                <meshStandardMaterial color="#1c1917" roughness={0.72} />
              </mesh>
              <mesh position={[0.09, 0.03, -0.08]} rotation={[0.2, -0.4, -0.3]}>
                <capsuleGeometry args={[0.025, 0.07, 6, 8]} />
                <meshStandardMaterial color="#1c1917" roughness={0.72} />
              </mesh>
              {/* Cute White Hair Clip */}
              <mesh position={[-0.04, 0.135, -0.05]} rotation={[0.3, 0.2, 0]}>
                <boxGeometry args={[0.036, 0.014, 0.022]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
              </mesh>
              {/* Flowing Ponytail */}
              <group ref={ponytailRef} position={[0, 0.02, 0.135]}>
                <mesh position={[0, -0.11, 0.03]} rotation={[0.25, 0, 0]} castShadow>
                  <capsuleGeometry args={[0.038, 0.18, 8, 10]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.72} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      )}

      {character === 'kuromi' && (
        <group ref={gltfMotionRef}>
          <Suspense fallback={null}>
            <NormalizedGltfCharacter url="./models/kuromi/scene.gltf" targetHeight={1.35} />
          </Suspense>
        </group>
      )}

      {character === 'ironman' && (
        <group ref={gltfMotionRef}>
          <Suspense fallback={null}>
            <NormalizedGltfCharacter url="./models/iron_man/scene.gltf" targetHeight={1.82} />
          </Suspense>
        </group>
      )}
    </group>
  );
}
