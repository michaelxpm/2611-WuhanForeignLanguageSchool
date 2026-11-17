import { useLayoutEffect, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeItem } from '../data/editableDefaults';

interface CampusFoliageProps {
  trees: TreeItem[];
  editMode: boolean;
  selectedTreeId: string | null;
  onSelectTree: (tree: TreeItem) => void;
  onStartDrag: (kind: 'building' | 'road' | 'tree', id: string, e: ThreeEvent<PointerEvent>) => void;
}

export function CampusFoliage({
  trees,
  editMode,
  selectedTreeId,
  onSelectTree,
  onStartDrag,
}: CampusFoliageProps) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopy1Ref = useRef<THREE.InstancedMesh>(null);
  const canopy2Ref = useRef<THREE.InstancedMesh>(null);
  const canopy3Ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    trees.forEach((t, i) => {
      // Trunk
      dummy.position.set(t.x, 1.8 * t.scale, t.z);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      // Main broadleaf crown
      dummy.position.set(t.x, 4.3 * t.scale, t.z);
      dummy.scale.set(t.scale * 1.15, t.scale * 0.85, t.scale * 1.15);
      dummy.updateMatrix();
      canopy1Ref.current?.setMatrixAt(i, dummy.matrix);
      color.setHSL(0.25 + t.shade * 0.05, 0.45, 0.28 + t.shade * 0.1);
      canopy1Ref.current?.setColorAt(i, color);

      // Side-top lobe
      dummy.position.set(t.x + 0.9 * t.scale, 5.1 * t.scale, t.z - 0.5 * t.scale);
      dummy.scale.set(t.scale * 0.85, t.scale * 0.75, t.scale * 0.85);
      dummy.updateMatrix();
      canopy2Ref.current?.setMatrixAt(i, dummy.matrix);
      color.setHSL(0.24 + t.shade * 0.05, 0.48, 0.34 + t.shade * 0.1);
      canopy2Ref.current?.setColorAt(i, color);

      // Opposite-lower lobe
      dummy.position.set(t.x - 0.85 * t.scale, 4.6 * t.scale, t.z + 0.65 * t.scale);
      dummy.scale.set(t.scale * 0.82, t.scale * 0.72, t.scale * 0.82);
      dummy.updateMatrix();
      canopy3Ref.current?.setMatrixAt(i, dummy.matrix);
      color.setHSL(0.26 + t.shade * 0.04, 0.44, 0.31 + t.shade * 0.1);
      canopy3Ref.current?.setColorAt(i, color);
    });

    [trunkRef, canopy1Ref, canopy2Ref, canopy3Ref].forEach((ref) => {
      if (ref.current) {
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
      }
    });
  }, [trees]);

  const selectedTree = editMode ? trees.find((t) => t.id === selectedTreeId) : null;

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.22, 0.34, 3.6, 7]} />
        <meshStandardMaterial color="#5c4033" roughness={0.95} />
      </instancedMesh>
      <instancedMesh
        ref={canopy1Ref}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          if (!editMode || e.instanceId === undefined) return;
          e.stopPropagation();
          const t = trees[e.instanceId];
          if (t) {
            onSelectTree(t);
            onStartDrag('tree', t.id, e);
          }
        }}
      >
        <icosahedronGeometry args={[2.35, 1]} />
        <meshStandardMaterial roughness={0.86} />
      </instancedMesh>
      <instancedMesh ref={canopy2Ref} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[2.0, 1]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={canopy3Ref} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.95, 1]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>

      {/* Selection ring in Edit Mode */}
      {selectedTree && (
        <mesh
          position={[selectedTree.x, 0.25, selectedTree.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[2.8, 3.6, 28]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}
    </group>
  );
}
