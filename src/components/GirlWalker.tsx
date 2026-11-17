import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface GirlWalkerProps {
  enabled: boolean;
  onYawChange?: (yawDeg: number) => void;
}

export function GirlWalker({ enabled, onYawChange }: GirlWalkerProps) {
  const { camera, gl } = useThree();
  const girlRef = useRef<THREE.Group>(null);
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
  const trolleyRef = useRef<THREE.Group>(null);

  const keys = useRef<Record<string, boolean>>({});
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const yaw = useRef(0.45);
  const pitch = useRef(0.18);
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
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      yaw.current -= dx * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.003, -0.15, 0.75);
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [enabled, gl]);

  useFrame((_, rawDelta) => {
    if (!enabled || !girlRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    const isSprint = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    const maxSpeed = isSprint ? 8.8 : 4.4;

    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    const inputDir = new THREE.Vector3();
    if (keys.current['KeyW'] || keys.current['ArrowUp']) inputDir.add(forward);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) inputDir.sub(forward);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) inputDir.add(right);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) inputDir.sub(right);

    // Real-world momentum: smooth acceleration & ground friction deceleration
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

      // Smoothly turn body toward velocity vector
      const targetAngle = Math.atan2(-vel.current.x, -vel.current.z);
      const diff = Math.atan2(
        Math.sin(targetAngle - girlRef.current.rotation.y),
        Math.cos(targetAngle - girlRef.current.rotation.y)
      );
      girlRef.current.rotation.y += diff * Math.min(1, delta * 9);

      // Stride-locked phase advance (prevents foot sliding)
      walkPhase.current += speed * delta * 2.4;
    }

    girlRef.current.position.copy(pos.current);

    // Biomechanical Gait Kinematics
    const p = walkPhase.current;
    const amp = Math.min(1.25, speed / 4.0);

    // Double-frequency vertical center-of-mass bob + subtle lateral hip sway
    const bob = Math.abs(Math.sin(p)) * 0.042 * amp;
    const swayX = Math.cos(p) * 0.022 * amp;
    if (pelvisRef.current) {
      pelvisRef.current.position.y = 0.64 + bob;
      pelvisRef.current.position.x = swayX;
      pelvisRef.current.rotation.y = Math.sin(p) * 0.09 * amp;
      pelvisRef.current.rotation.z = Math.cos(p) * 0.035 * amp;
    }

    // Counter-rotating torso + speed-proportional forward lean
    if (torsoRef.current) {
      torsoRef.current.rotation.y = -Math.sin(p) * 0.14 * amp;
      torsoRef.current.rotation.x = -0.05 * speedRatio - (isSprint ? 0.08 * speedRatio : 0);
    }

    // Ponytail out-of-phase spring bounce
    if (ponytailRef.current) {
      ponytailRef.current.rotation.x = 0.42 + Math.sin(p * 2 - 0.6) * 0.14 * amp;
    }

    // 2-Segment Leg Kinematics (Thigh + Knee Bend + Ankle Pitch)
    const applyLeg = (
      phaseOffset: number,
      thigh: THREE.Group | null,
      shin: THREE.Group | null,
      foot: THREE.Group | null
    ) => {
      const lp = p + phaseOffset;
      const sinP = Math.sin(lp);
      const cosP = Math.cos(lp);
      if (thigh) {
        thigh.rotation.x = sinP * 0.52 * amp;
      }
      if (shin) {
        // Knee bends deeply during swing (when cosP > 0), stays near straight on stance
        const swingBend = Math.max(0, cosP) * 0.85 * amp;
        const stanceCushion = Math.max(0, -sinP) * 0.12 * amp;
        shin.rotation.x = -(swingBend + stanceCushion);
      }
      if (foot) {
        foot.rotation.x = cosP * 0.22 * amp;
      }
    };

    applyLeg(0, leftThighRef.current, leftShinRef.current, leftFootRef.current);
    applyLeg(Math.PI, rightThighRef.current, rightShinRef.current, rightFootRef.current);

    // 2-Segment Arm Swing (Left arm swings freely; Right arm holds rolling schoolbag handle!)
    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.x = -Math.sin(p) * 0.45 * amp;
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.x = 0.25 + Math.max(0, -Math.sin(p)) * 0.35 * amp;
    }
    if (rightUpperArmRef.current) {
      // Right arm reaches slightly back-down to pull the rolling schoolbag
      rightUpperArmRef.current.rotation.x = -0.32 + Math.sin(p) * 0.14 * amp;
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.x = 0.18;
    }
    if (trolleyRef.current) {
      trolleyRef.current.rotation.x = 0.58 + Math.sin(p * 2) * 0.03 * amp;
    }

    // Side-back over-the-shoulder third-person camera
    const camOffset = new THREE.Vector3(
      1.05,
      1.85 + Math.sin(pitch.current) * 1.4,
      3.8 * Math.cos(pitch.current)
    );
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const desiredCamPos = pos.current.clone().add(camOffset);
    desiredCamPos.y = Math.max(1.2, desiredCamPos.y);

    camera.position.lerp(desiredCamPos, 1 - Math.exp(-10 * delta));

    const lookTarget = pos.current
      .clone()
      .add(new THREE.Vector3(0, 1.32, 0))
      .add(forward.clone().multiplyScalar(2.4));
    camera.lookAt(lookTarget);

    if (onYawChange) {
      onYawChange(THREE.MathUtils.radToDeg(yaw.current));
    }
  });

  if (!enabled) return null;

  return (
    <group ref={girlRef} position={pos.current}>
      {/* Pelvis / Hip Root */}
      <group ref={pelvisRef} position={[0, 0.64, 0]}>
        {/* Left Leg (White WFLS Track Pants + White Sneaker) */}
        <group ref={leftThighRef} position={[-0.095, 0, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.062, 0.32, 10]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.75} />
          </mesh>
          {/* Navy side stripe */}
          <mesh position={[-0.066, -0.16, 0]}>
            <boxGeometry args={[0.012, 0.3, 0.025]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
          </mesh>
          {/* Knee & Shin */}
          <group ref={leftShinRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.058, 0.048, 0.3, 10]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.75} />
            </mesh>
            <group ref={leftFootRef} position={[0, -0.3, 0]}>
              <mesh position={[0, -0.03, -0.04]} castShadow>
                <boxGeometry args={[0.095, 0.07, 0.19]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightThighRef} position={[0.095, 0, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.062, 0.32, 10]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.75} />
          </mesh>
          <mesh position={[0.066, -0.16, 0]}>
            <boxGeometry args={[0.012, 0.3, 0.025]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
          </mesh>
          <group ref={rightShinRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.058, 0.048, 0.3, 10]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.75} />
            </mesh>
            <group ref={rightFootRef} position={[0, -0.3, 0]}>
              <mesh position={[0, -0.03, -0.04]} castShadow>
                <boxGeometry args={[0.095, 0.07, 0.19]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Upper Torso: Navy WFLS Parka with Yellow Zipper & Hood Collar */}
        <group ref={torsoRef} position={[0, 0.06, 0]}>
          {/* Long Navy Parka Coat */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.155, 0.21, 0.56, 14]} />
            <meshStandardMaterial color="#1e3358" roughness={0.72} />
          </mesh>
          {/* Bright Yellow Vertical Zipper Strip (Front = -Z) */}
          <mesh position={[0, 0.18, -0.182]} rotation={[-0.08, 0, 0]}>
            <boxGeometry args={[0.024, 0.52, 0.02]} />
            <meshStandardMaterial color="#facc15" roughness={0.45} />
          </mesh>
          {/* Yellow Hood Lining Collar */}
          <mesh position={[0, 0.45, 0.02]} castShadow>
            <cylinderGeometry args={[0.135, 0.155, 0.07, 14]} />
            <meshStandardMaterial color="#facc15" roughness={0.6} />
          </mesh>
          {/* White Round School Crest on Left Chest */}
          <mesh position={[-0.1, 0.33, -0.145]} rotation={[0, -0.45, 0]}>
            <circleGeometry args={[0.032, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Yellow Pocket Snap Buttons */}
          <mesh position={[-0.11, 0.06, -0.185]}>
            <sphereGeometry args={[0.013, 8, 8]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
          <mesh position={[0.11, 0.06, -0.185]}>
            <sphereGeometry args={[0.013, 8, 8]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>

          {/* Left Arm (2-segment) */}
          <group ref={leftUpperArmRef} position={[-0.2, 0.4, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <cylinderGeometry args={[0.052, 0.048, 0.22, 10]} />
              <meshStandardMaterial color="#1e3358" roughness={0.72} />
            </mesh>
            <group ref={leftForearmRef} position={[0, -0.22, 0]}>
              <mesh position={[0, -0.1, 0]} castShadow>
                <cylinderGeometry args={[0.045, 0.038, 0.2, 10]} />
                <meshStandardMaterial color="#1e3358" roughness={0.72} />
              </mesh>
              <mesh position={[0, -0.22, 0]}>
                <sphereGeometry args={[0.038, 10, 10]} />
                <meshStandardMaterial color="#f5d0b5" roughness={0.65} />
              </mesh>
            </group>
          </group>

          {/* Right Arm + Rolling Schoolbag Trolley (拉杆书包) */}
          <group ref={rightUpperArmRef} position={[0.2, 0.4, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <cylinderGeometry args={[0.052, 0.048, 0.22, 10]} />
              <meshStandardMaterial color="#1e3358" roughness={0.72} />
            </mesh>
            <group ref={rightForearmRef} position={[0, -0.22, 0]}>
              <mesh position={[0, -0.1, 0]} castShadow>
                <cylinderGeometry args={[0.045, 0.038, 0.2, 10]} />
                <meshStandardMaterial color="#1e3358" roughness={0.72} />
              </mesh>
              <mesh position={[0, -0.22, 0]}>
                <sphereGeometry args={[0.038, 10, 10]} />
                <meshStandardMaterial color="#f5d0b5" roughness={0.65} />
              </mesh>

              {/* Rolling Schoolbag Trolley */}
              <group ref={trolleyRef} position={[0.06, -0.22, 0.02]}>
                {/* Telescoping Handle */}
                <mesh position={[0, -0.22, 0]} castShadow>
                  <boxGeometry args={[0.025, 0.44, 0.025]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Purple/White Schoolbag Body */}
                <mesh position={[0, -0.48, 0]} castShadow>
                  <boxGeometry args={[0.22, 0.3, 0.16]} />
                  <meshStandardMaterial color="#c4b5fd" roughness={0.65} />
                </mesh>
                <mesh position={[0, -0.45, -0.085]}>
                  <boxGeometry args={[0.18, 0.2, 0.02]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.6} />
                </mesh>
                {/* Trolley Wheels */}
                <mesh position={[-0.08, -0.65, 0.04]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.025, 10]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.5} />
                </mesh>
                <mesh position={[0.08, -0.65, 0.04]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.025, 10]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.5} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Head, Facial Features & Hair with White Clip */}
          <group position={[0, 0.62, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.145, 18, 18]} />
              <meshStandardMaterial color="#f7d3ba" roughness={0.62} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.048, 0.02, -0.132]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#1c1917" roughness={0.2} />
            </mesh>
            <mesh position={[0.048, 0.02, -0.132]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#1c1917" roughness={0.2} />
            </mesh>
            {/* Rosy Cheeks */}
            <mesh position={[-0.075, -0.015, -0.12]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#fda4af" roughness={0.8} transparent opacity={0.55} />
            </mesh>
            <mesh position={[0.075, -0.015, -0.12]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#fda4af" roughness={0.8} transparent opacity={0.55} />
            </mesh>
            {/* Hair Cap */}
            <mesh position={[0, 0.035, 0.02]} castShadow>
              <sphereGeometry args={[0.154, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.64]} />
              <meshStandardMaterial color="#1c1917" roughness={0.75} />
            </mesh>
            {/* Cute White Hair Clip on top-front */}
            <mesh position={[-0.04, 0.145, -0.06]} rotation={[0.3, 0.2, 0]}>
              <boxGeometry args={[0.036, 0.014, 0.022]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            {/* Bouncing Ponytail */}
            <group ref={ponytailRef} position={[0, 0.02, 0.15]}>
              <mesh position={[0, -0.1, 0.02]} castShadow>
                <coneGeometry args={[0.052, 0.24, 10]} />
                <meshStandardMaterial color="#1c1917" roughness={0.75} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
