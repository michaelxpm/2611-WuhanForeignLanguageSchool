import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { pxToWorld } from '../data/campusLayout';

interface TreePlacement {
  x: number;
  z: number;
  scale: number;
  shade: number;
}

function generateTreePlacements(): TreePlacement[] {
  const trees: TreePlacement[] = [];
  const addPx = (px: number, py: number, scale = 1, seed = 0) => {
    const [x, z] = pxToWorld(px, py);
    const jitterX = Math.sin(seed * 12.9898) * 0.7;
    const jitterZ = Math.cos(seed * 78.233) * 0.7;
    trees.push({
      x: x + jitterX,
      z: z + jitterZ,
      scale: scale * (0.85 + ((seed * 37) % 10) * 0.03),
      shade: ((seed * 19) % 10) / 10,
    });
  };

  let idx = 1;

  // 1. 中心花坛 ring trees (16 trees around r=16.5m)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    trees.push({
      x: Math.cos(a) * 16.5,
      z: Math.sin(a) * 16.5,
      scale: 0.9,
      shade: (i % 5) * 0.2,
    });
  }

  // 2. 北太子湖 & 小操场 shoreline grove (px=660..700, py=90..300 and north shore py=25..42)
  for (let py = 95; py <= 295; py += 16) {
    const px = 668 + ((295 - py) / 200) * 28;
    addPx(px - 6, py, 1.05, idx++);
  }
  for (let px = 755; px <= 920; px += 18) {
    addPx(px, 28, 1.05, idx++);
  }

  // 3. 太子湖北路 (South avenue boulevard, py=612 & py=642)
  for (let px = 190; px <= 940; px += 22) {
    addPx(px, 612, 1.05, idx++);
    addPx(px + 8, 642, 1.1, idx++);
  }

  // 4. Red Main Pedestrian Avenue (py=534 & py=552, cleanly between Stadium py<=515 and Courts py>=556)
  for (let px = 215; px <= 595; px += 20) {
    addPx(px, 533, 0.95, idx++);
    addPx(px, 553, 0.95, idx++);
  }

  // 5. N-S Avenue between Stadium and 寻真园 (px=470 & px=495, py=355..525)
  for (let py = 355; py <= 525; py += 20) {
    addPx(468, py, 1.0, idx++);
    addPx(496, py, 1.0, idx++);
  }

  // 6. 寻真园 East border & Triangular Lawn border (px=622 & px=644, py=350..520)
  for (let py = 355; py <= 515; py += 20) {
    addPx(620, py, 1.0, idx++);
  }
  // Diagonal avenue trees along Triangular Lawn (px=730..674, py=452..508)
  for (let t = 0; t < 5; t++) {
    addPx(730 - t * 13, 452 + t * 13, 0.9, idx++);
  }

  // 7. North of 寻真园 / South shore of 北太子湖 (px=495..645, py=325)
  for (let px = 495; px <= 640; px += 20) {
    addPx(px, 326, 1.05, idx++);
  }

  // 8. West of Stadium (px=152, py=355..530)
  for (let py = 355; py <= 530; py += 22) {
    addPx(152, py, 1.05, idx++);
  }

  // 9. East Perimeter Road (px=900, py=415..590)
  for (let py = 415; py <= 590; py += 22) {
    addPx(900, py, 0.95, idx++);
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
      dummy.position.set(t.x, 1.9 * t.scale, t.z);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, 4.4 * t.scale, t.z);
      dummy.scale.set(t.scale * 1.1, t.scale * 0.9, t.scale * 1.1);
      dummy.updateMatrix();
      canopyRef.current?.setMatrixAt(i, dummy.matrix);
      color.setHSL(0.28 + t.shade * 0.04, 0.48, 0.3 + t.shade * 0.1);
      canopyRef.current?.setColorAt(i, color);

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
