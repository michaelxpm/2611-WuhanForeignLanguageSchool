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
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const keys = useRef<Record<string, boolean>>({});
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const yaw = useRef(0.45);
  const pitch = useRef(0.18);
  const walkPhase = useRef(0);
  const pos = useRef(new THREE.Vector3(-42, 0, 72)); // Start near Main Entrance Plaza facing 中心花坛

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

  useFrame((_, delta) => {
    if (!enabled || !girlRef.current) return;

    const isSprint = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    const speed = isSprint ? 10.5 : 4.8;

    // A/D can either strafe or turn; W/S moves forward/backward along facing yaw
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    const move = new THREE.Vector3();
    if (keys.current['KeyW'] || keys.current['ArrowUp']) move.add(forward);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) move.sub(forward);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) move.add(right);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) move.sub(right);

    const moving = move.lengthSq() > 0.001;
    if (moving) {
      move.normalize().multiplyScalar(speed * delta);
      pos.current.add(move);
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -385, 160);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z, -290, 160);

      // Smoothly face movement direction
      const targetAngle = Math.atan2(-move.x, -move.z);
      const diff = Math.atan2(
        Math.sin(targetAngle - girlRef.current.rotation.y),
        Math.cos(targetAngle - girlRef.current.rotation.y)
      );
      girlRef.current.rotation.y += diff * Math.min(1, delta * 10);

      walkPhase.current += delta * (isSprint ? 14 : 9);
    } else {
      walkPhase.current = THREE.MathUtils.lerp(walkPhase.current, Math.round(walkPhase.current / Math.PI) * Math.PI, delta * 6);
    }

    girlRef.current.position.copy(pos.current);

    // Limb swing animation
    const swing = moving ? Math.sin(walkPhase.current) * (isSprint ? 0.65 : 0.45) : 0;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.75;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.75;

    // Side-back over-the-shoulder third-person camera
    const camOffset = new THREE.Vector3(1.05, 1.85 + Math.sin(pitch.current) * 1.4, 3.8 * Math.cos(pitch.current));
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const desiredCamPos = pos.current.clone().add(camOffset);
    desiredCamPos.y = Math.max(1.2, desiredCamPos.y);

    camera.position.lerp(desiredCamPos, 1 - Math.exp(-10 * delta));

    const lookTarget = pos.current
      .clone()
      .add(new THREE.Vector3(0, 1.35, 0))
      .add(forward.clone().multiplyScalar(2.2));
    camera.lookAt(lookTarget);

    if (onYawChange) {
      onYawChange(THREE.MathUtils.radToDeg(yaw.current));
    }
  });

  if (!enabled) return null;

  return (
    <group ref={girlRef} position={pos.current}>
      {/* Left & Right Legs (white socks + sneakers) */}
      <group ref={leftLegRef} position={[-0.1, 0.52, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.048, 0.46, 10]} />
          <meshStandardMaterial color="#f5d0b5" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.45, 0.03]} castShadow>
          <boxGeometry args={[0.1, 0.09, 0.18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.1, 0.52, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.048, 0.46, 10]} />
          <meshStandardMaterial color="#f5d0b5" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.45, 0.03]} castShadow>
          <boxGeometry args={[0.1, 0.09, 0.18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      </group>

      {/* Navy-plaid pleated skirt */}
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.24, 0.3, 14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* White school uniform shirt */}
      <mesh position={[0, 0.96, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.38, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Red Young Pioneer scarf */}
      <mesh position={[0, 1.07, -0.06]} rotation={[0.25, 0, 0]} castShadow>
        <coneGeometry args={[0.12, 0.22, 4]} />
        <meshStandardMaterial color="#dc2626" roughness={0.65} />
      </mesh>

      {/* Left & Right Arms */}
      <group ref={leftArmRef} position={[-0.19, 1.08, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.042, 0.038, 0.34, 8]} />
          <meshStandardMaterial color="#f5d0b5" roughness={0.7} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.19, 1.08, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.042, 0.038, 0.34, 8]} />
          <meshStandardMaterial color="#f5d0b5" roughness={0.7} />
        </mesh>
      </group>

      {/* Head & Ponytail */}
      <group position={[0, 1.29, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#f5d0b5" roughness={0.65} />
        </mesh>
        {/* Hair cap */}
        <mesh position={[0, 0.04, 0.02]} castShadow>
          <sphereGeometry args={[0.158, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color="#1e1b18" roughness={0.75} />
        </mesh>
        {/* Ponytail at back (+Z is back since forward is -Z) */}
        <mesh position={[0, -0.02, 0.18]} rotation={[0.45, 0, 0]} castShadow>
          <coneGeometry args={[0.055, 0.24, 8]} />
          <meshStandardMaterial color="#1e1b18" roughness={0.75} />
        </mesh>
      </group>
    </group>
  );
}
