import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface TreePlacement {
  x: number;
  z: number;
  scale: number;
  shade: number;
}

function generateTreePlacements(): TreePlacement[] {
  const trees: TreePlacement[] = [];
  const add = (x: number, z: number, scale = 1, seed = 0) => {
    const jitterX = Math.sin(seed * 12.9898) * 1.1;
    const jitterZ = Math.cos(seed * 78.233) * 1.1;
    trees.push({
      x: x + jitterX,
      z: z + jitterZ,
      scale: scale * (0.82 + ((seed * 37) % 10) * 0.035),
      shade: ((seed * 19) % 10) / 10,
    });
  };

  let idx = 1;

  // 1. 中心花坛 ring trees (16 trees)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    add(Math.cos(a) * 17.5, Math.sin(a) * 17.5, 0.9, idx++);
  }

  // 2. 北太子湖 shoreline avenue trees
  for (let z = -280; z <= -70; z += 11) {
    add(-144 + Math.sin(z * 0.03) * 4, z, 1.15, idx++);
    add(-154 + Math.sin(z * 0.03) * 4, z + 5, 1.0, idx++);
  }
  for (let x = -140; x <= 30; x += 12) {
    add(x, -286, 1.15, idx++);
  }

  // 3. 太子湖北路 (South avenue boulevard)
  for (let x = -320; x <= 145; x += 13) {
    add(x, 141, 1.1, idx++);
    add(x + 4, 167, 1.15, idx++);
  }

  // 4. 东风大道 (West perimeter)
  for (let z = -200; z <= 135; z += 14) {
    add(-332, z, 1.15, idx++);
  }

  // 5. Main avenue from Roundabout SW & NW
  for (let x = -310; x <= -35; x += 14) {
    const z = x * -0.08;
    add(x, z - 8, 1.0, idx++);
    add(x, z + 8, 1.0, idx++);
  }
  for (let t = 0; t < 12; t++) {
    const z = -30 - t * 14;
    const x = -18 - t * 3.5;
    add(x - 8, z, 0.95, idx++);
    add(x + 8, z, 0.95, idx++);
  }

  // 6. 寻真园 & 种植区 perimeter grove
  for (let x = -180; x <= -95; x += 14) {
    add(x, -16, 1.1, idx++);
    add(x, 86, 1.1, idx++);
  }
  for (let z = -10; z <= 80; z += 15) {
    add(-182, z, 1.05, idx++);
    add(-94, z, 1.05, idx++);
  }

  // 7. 扇形广场 outer rim & East road
  for (let i = 0; i < 14; i++) {
    const a = -0.38 + (i / 13) * 1.56;
    add(Math.cos(a) * 112, Math.sin(a) * 112, 1.05, idx++);
  }

  // 8. Stadium perimeter trees
  for (let x = -315; x <= -155; x += 15) {
    add(x, 104, 1.1, idx++);
  }
  for (let z = -20; z <= 95; z += 16) {
    add(-320, z, 1.1, idx++);
    add(-150, z, 1.05, idx++);
  }

  return trees;
}

export function CampusFoliage() {
  const trees = useMemo(() => generateTreePlacements(), []);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);
  const topCanopyRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    trees.forEach((t, i) => {
      // Trunk
      dummy.position.set(t.x, 1.9 * t.scale, t.z);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      // Lower lush canopy
      dummy.position.set(t.x, 4.4 * t.scale, t.z);
      dummy.scale.set(t.scale * 1.1, t.scale * 0.9, t.scale * 1.1);
      dummy.updateMatrix();
      canopyRef.current?.setMatrixAt(i, dummy.matrix);
      color.setHSL(0.28 + t.shade * 0.04, 0.48, 0.3 + t.shade * 0.1);
      canopyRef.current?.setColorAt(i, color);

      // Upper offset canopy crown
      dummy.position.set(t.x + 0.4 * t.scale, 5.7 * t.scale, t.z - 0.3 * t.scale);
      dummy.scale.set(t.scale * 0.8, t.scale * 0.78, t.scale * 0.8);
      dummy.updateMatrix();
      topCanopyRef.current?.setMatrixAt(i, dummy.matrix);
      color.setHSL(0.27 + t.shade * 0.04, 0.52, 0.36 + t.shade * 0.1);
      topCanopyRef.current?.setColorAt(i, color);
    });

    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (canopyRef.current) {
      canopyRef.current.instanceMatrix.needsUpdate = true;
      if (canopyRef.current.instanceColor) canopyRef.current.instanceColor.needsUpdate = true;
    }
    if (topCanopyRef.current) {
      topCanopyRef.current.instanceMatrix.needsUpdate = true;
      if (topCanopyRef.current.instanceColor) topCanopyRef.current.instanceColor.needsUpdate = true;
    }
  }, [trees]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.24, 0.36, 3.8, 7]} />
        <meshStandardMaterial color="#5c4033" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial roughness={0.86} />
      </instancedMesh>
      <instancedMesh ref={topCanopyRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.1, 1]} />
        <meshStandardMaterial roughness={0.84} />
      </instancedMesh>
    </group>
  );
}
