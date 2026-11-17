import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FirstPersonControlsProps {
  enabled: boolean;
  onYawChange?: (yawDeg: number) => void;
}

export function FirstPersonControls({ enabled, onYawChange }: FirstPersonControlsProps) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    if (!enabled) return;

    // Place camera at human eye height near 中心花坛 or keep current XZ if inside campus
    const clampedX = THREE.MathUtils.clamp(camera.position.x, -380, 150);
    const clampedZ = THREE.MathUtils.clamp(camera.position.z, -280, 150);
    camera.position.set(clampedX, 1.75, clampedZ);
    euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
    euler.current.x = THREE.MathUtils.clamp(euler.current.x, -0.45, 0.45);
    camera.quaternion.setFromEuler(euler.current);

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

      euler.current.y -= dx * 0.0032;
      euler.current.x = THREE.MathUtils.clamp(euler.current.x - dy * 0.0028, -1.1, 1.1);
      camera.quaternion.setFromEuler(euler.current);
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
  }, [enabled, camera, gl]);

  useFrame((_, delta) => {
    if (!enabled) return;

    const speed = keys.current['ShiftLeft'] || keys.current['ShiftRight'] ? 22 : 8.5;
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, euler.current.y, 0));
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, euler.current.y, 0));

    const move = new THREE.Vector3();
    if (keys.current['KeyW'] || keys.current['ArrowUp']) move.add(forward);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) move.sub(forward);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) move.add(right);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * delta);
      camera.position.add(move);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -390, 165);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -295, 165);
    }
    camera.position.y = 1.75;

    if (onYawChange) {
      onYawChange(THREE.MathUtils.radToDeg(euler.current.y));
    }
  });

  return null;
}
