import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TreeItem, TreeSpecies } from '../data/editableDefaults';

export type TreeDisplayStyle = 'mixed' | 'oak' | 'maple' | 'lowpoly' | 'procedural';

interface MergedTreeAsset {
  trunkGeo: THREE.BufferGeometry;
  trunkMat: THREE.Material;
  leafGeo: THREE.BufferGeometry;
  leafMat: THREE.Material;
}

function extractMergedTree(scene: THREE.Object3D, targetHeight = 7.5): MergedTreeAsset | null {
  scene.updateMatrixWorld(true);
  const trunkGeos: THREE.BufferGeometry[] = [];
  const leafGeos: THREE.BufferGeometry[] = [];
  let trunkMat: THREE.Material | null = null;
  let leafMat: THREE.Material | null = null;

  scene.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const matName = (mat?.name || '').toLowerCase();

    // Strip groundcover/grass patches from maple_tree
    if (matName.includes('ground') || matName.includes('grass')) return;

    const cloned = mesh.geometry.clone();
    cloned.applyMatrix4(mesh.matrixWorld);
    // Keep only position, normal, uv for safe merging
    const keep = new THREE.BufferGeometry();
    if (cloned.attributes.position) keep.setAttribute('position', cloned.attributes.position);
    if (cloned.attributes.normal) keep.setAttribute('normal', cloned.attributes.normal);
    if (cloned.attributes.uv) keep.setAttribute('uv', cloned.attributes.uv);
    if (cloned.index) keep.setIndex(cloned.index);
    const nonIndexed = keep.index ? keep.toNonIndexed() : keep;
    if (!nonIndexed.attributes.normal) nonIndexed.computeVertexNormals();

    if (matName.includes('leaf') || matName.includes('leaves')) {
      leafGeos.push(nonIndexed);
      if (!leafMat && mat) {
        const lm = mat.clone() as THREE.MeshStandardMaterial;
        lm.alphaTest = 0.42;
        lm.transparent = false;
        lm.side = THREE.DoubleSide;
        lm.roughness = 0.78;
        leafMat = lm;
      }
    } else {
      trunkGeos.push(nonIndexed);
      if (!trunkMat && mat) {
        const tm = mat.clone() as THREE.MeshStandardMaterial;
        tm.roughness = 0.9;
        trunkMat = tm;
      }
    }
  });

  if (!trunkGeos.length || !leafGeos.length || !trunkMat || !leafMat) return null;

  const trunkGeo = mergeGeometries(trunkGeos, false);
  const leafGeo = mergeGeometries(leafGeos, false);
  if (!trunkGeo || !leafGeo) return null;

  // Normalize scale and ground pivot (min.y = 0)
  const box = new THREE.Box3();
  trunkGeo.computeBoundingBox();
  leafGeo.computeBoundingBox();
  if (trunkGeo.boundingBox) box.union(trunkGeo.boundingBox);
  if (leafGeo.boundingBox) box.union(leafGeo.boundingBox);

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const scale = size.y > 0.001 ? targetHeight / size.y : 1;
  const normMatrix = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z));

  trunkGeo.applyMatrix4(normMatrix);
  leafGeo.applyMatrix4(normMatrix);

  return { trunkGeo, trunkMat, leafGeo, leafMat };
}

function InstancedGltfSpecies({
  url,
  items,
  editMode,
  onSelectTree,
  onStartDrag,
}: {
  url: string;
  items: TreeItem[];
  editMode: boolean;
  onSelectTree: (tree: TreeItem) => void;
  onStartDrag: (kind: 'building' | 'road' | 'tree', id: string, e: ThreeEvent<PointerEvent>) => void;
}) {
  const gltf = useGLTF(url);
  const asset = useMemo(() => extractMergedTree(gltf.scene, 7.6), [gltf.scene]);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!asset || items.length === 0) return;
    const dummy = new THREE.Object3D();
    items.forEach((t, i) => {
      dummy.position.set(t.x, 0, t.z);
      dummy.rotation.set(0, ((i * 137.5) % 360) * (Math.PI / 180), 0);
      dummy.scale.setScalar(t.scale);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);
      leafRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (leafRef.current) leafRef.current.instanceMatrix.needsUpdate = true;
  }, [asset, items]);

  if (!asset || items.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[asset.trunkGeo, asset.trunkMat, items.length]}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          if (!editMode || e.instanceId === undefined) return;
          e.stopPropagation();
          const t = items[e.instanceId];
          if (t) {
            onSelectTree(t);
            onStartDrag('tree', t.id, e);
          }
        }}
      />
      <instancedMesh
        ref={leafRef}
        args={[asset.leafGeo, asset.leafMat, items.length]}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          if (!editMode || e.instanceId === undefined) return;
          e.stopPropagation();
          const t = items[e.instanceId];
          if (t) {
            onSelectTree(t);
            onStartDrag('tree', t.id, e);
          }
        }}
      />
    </group>
  );
}

function ProceduralFallbackFoliage({
  trees,
  editMode,
  onSelectTree,
  onStartDrag,
}: {
  trees: TreeItem[];
  editMode: boolean;
  onSelectTree: (tree: TreeItem) => void;
  onStartDrag: (kind: 'building' | 'road' | 'tree', id: string, e: ThreeEvent<PointerEvent>) => void;
}) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopy1Ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    trees.forEach((t, i) => {
      dummy.position.set(t.x, 1.8 * t.scale, t.z);
      dummy.scale.setScalar(t.scale);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, 4.3 * t.scale, t.z);
      dummy.scale.set(t.scale * 1.15, t.scale * 0.9, t.scale * 1.15);
      dummy.updateMatrix();
      canopy1Ref.current?.setMatrixAt(i, dummy.matrix);
      color.setHSL(0.25 + t.shade * 0.05, 0.45, 0.3 + t.shade * 0.1);
      canopy1Ref.current?.setColorAt(i, color);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (canopy1Ref.current) {
      canopy1Ref.current.instanceMatrix.needsUpdate = true;
      if (canopy1Ref.current.instanceColor) canopy1Ref.current.instanceColor.needsUpdate = true;
    }
  }, [trees]);

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
    </group>
  );
}

interface CampusFoliageProps {
  trees: TreeItem[];
  treeStyle: TreeDisplayStyle;
  editMode: boolean;
  selectedTreeId: string | null;
  onSelectTree: (tree: TreeItem) => void;
  onStartDrag: (kind: 'building' | 'road' | 'tree', id: string, e: ThreeEvent<PointerEvent>) => void;
}

export function CampusFoliage({
  trees,
  treeStyle,
  editMode,
  selectedTreeId,
  onSelectTree,
  onStartDrag,
}: CampusFoliageProps) {
  const { oakItems, mapleItems, lowpolyItems } = useMemo(() => {
    const oak: TreeItem[] = [];
    const maple: TreeItem[] = [];
    const lowpoly: TreeItem[] = [];
    const speciesCycle: TreeSpecies[] = ['oak', 'maple', 'lowpoly'];

    trees.forEach((t, idx) => {
      const sp: TreeSpecies =
        treeStyle === 'oak'
          ? 'oak'
          : treeStyle === 'maple'
          ? 'maple'
          : treeStyle === 'lowpoly'
          ? 'lowpoly'
          : t.species ?? speciesCycle[idx % 3];
      if (sp === 'oak') oak.push(t);
      else if (sp === 'maple') maple.push(t);
      else lowpoly.push(t);
    });
    return { oakItems: oak, mapleItems: maple, lowpolyItems: lowpoly };
  }, [trees, treeStyle]);

  const selectedTree = editMode ? trees.find((t) => t.id === selectedTreeId) : null;

  return (
    <group>
      {treeStyle === 'procedural' ? (
        <ProceduralFallbackFoliage
          trees={trees}
          editMode={editMode}
          onSelectTree={onSelectTree}
          onStartDrag={onStartDrag}
        />
      ) : (
        <Suspense
          fallback={
            <ProceduralFallbackFoliage
              trees={trees}
              editMode={editMode}
              onSelectTree={onSelectTree}
              onStartDrag={onStartDrag}
            />
          }
        >
          <InstancedGltfSpecies
            url="./models/oak_tree/scene.gltf"
            items={oakItems}
            editMode={editMode}
            onSelectTree={onSelectTree}
            onStartDrag={onStartDrag}
          />
          <InstancedGltfSpecies
            url="./models/maple_tree/scene.gltf"
            items={mapleItems}
            editMode={editMode}
            onSelectTree={onSelectTree}
            onStartDrag={onStartDrag}
          />
          <InstancedGltfSpecies
            url="./models/lowpoly_tree/scene.gltf"
            items={lowpolyItems}
            editMode={editMode}
            onSelectTree={onSelectTree}
            onStartDrag={onStartDrag}
          />
        </Suspense>
      )}

      {selectedTree && (
        <mesh position={[selectedTree.x, 0.25, selectedTree.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.6, 28]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}
    </group>
  );
}
