import { useEffect, useRef } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BuildingSpec, CameraPreset } from '../data/campusLayout';
import { RoadNode, TreeItem } from '../data/editableDefaults';
import { AthleticsZone } from './AthleticsZone';
import { CampusFoliage } from './CampusFoliage';
import { CampusGround } from './CampusGround';
import { EnvironmentEffects } from './EnvironmentEffects';
import { FirstPersonControls } from './FirstPersonControls';
import { GirlWalker } from './GirlWalker';
import { HeroBuildings } from './buildings/HeroBuildings';
import { NorthZoneBuildings } from './buildings/NorthZoneBuildings';

export type CameraMode = 'orbit' | 'walk' | 'girl';

interface CameraRigProps {
  activePreset: CameraPreset | null;
  selectedBuilding: BuildingSpec | null;
  autoOrbit: boolean;
  editMode: boolean;
  onTransitionEnd: () => void;
  onYawChange?: (yawDeg: number) => void;
}

function CameraRig({
  activePreset,
  selectedBuilding,
  autoOrbit,
  editMode,
  onTransitionEnd,
  onYawChange,
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const desiredPos = useRef<THREE.Vector3 | null>(null);
  const desiredTarget = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (activePreset) {
      desiredPos.current = new THREE.Vector3(...activePreset.position);
      desiredTarget.current = new THREE.Vector3(...activePreset.target);
    }
  }, [activePreset]);

  useEffect(() => {
    if (selectedBuilding && !editMode) {
      const [bx, by, bz] = selectedBuilding.position;
      const [ox, oy, oz] = selectedBuilding.cameraOffset;
      desiredPos.current = new THREE.Vector3(bx + ox, by + oy, bz + oz);
      desiredTarget.current = new THREE.Vector3(bx, by + selectedBuilding.dimensions[1] * 0.4, bz);
    }
  }, [selectedBuilding, editMode]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (desiredPos.current && desiredTarget.current) {
      const alpha = 1 - Math.exp(-4.5 * delta);
      camera.position.lerp(desiredPos.current, alpha);
      controls.target.lerp(desiredTarget.current, alpha);

      if (
        camera.position.distanceTo(desiredPos.current) < 0.6 &&
        controls.target.distanceTo(desiredTarget.current) < 0.6
      ) {
        desiredPos.current = null;
        desiredTarget.current = null;
        onTransitionEnd();
      }
    }

    if (camera.position.y < 1.5) {
      camera.position.y = 1.5;
    }
    controls.update();

    if (onYawChange) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      onYawChange(THREE.MathUtils.radToDeg(Math.atan2(-dir.x, -dir.z)));
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      autoRotate={autoOrbit}
      autoRotateSpeed={1.2}
      maxPolarAngle={Math.PI / 2 - 0.03}
      minDistance={10}
      maxDistance={650}
      onStart={() => {
        desiredPos.current = null;
        desiredTarget.current = null;
      }}
    />
  );
}

function CompassMarkers() {
  const markers: { label: string; pos: [number, number, number]; color: string }[] = [
    { label: '北 N (-Z)', pos: [0, 2, -310], color: '#ef4444' },
    { label: '南 S (+Z)', pos: [0, 2, 185], color: '#94a3b8' },
    { label: '东 E (+X)', pos: [185, 2, 0], color: '#94a3b8' },
    { label: '西 W (-X)', pos: [-395, 2, 0], color: '#94a3b8' },
  ];
  return (
    <>
      {markers.map((m) => (
        <Html key={m.label} position={m.pos} center style={{ pointerEvents: 'none' }}>
          <div
            className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider bg-slate-950/85 border border-slate-700 shadow"
            style={{ color: m.color }}
          >
            {m.label}
          </div>
        </Html>
      ))}
    </>
  );
}

interface SceneRootProps {
  buildings: BuildingSpec[];
  roadNodes: RoadNode[];
  trees: TreeItem[];
  activePreset: CameraPreset | null;
  selectedBuilding: BuildingSpec | null;
  selectedRoadNodeId: string | null;
  selectedTreeId: string | null;
  showLabels: boolean;
  showGrid: boolean;
  cameraMode: CameraMode;
  autoOrbit: boolean;
  editMode: boolean;
  clickToMove: boolean;
  onSelectBuilding: (spec: BuildingSpec | null) => void;
  onSelectRoadNode: (node: RoadNode) => void;
  onSelectTree: (tree: TreeItem) => void;
  onGroundClickInEdit: (x: number, z: number) => void;
  onTransitionEnd: () => void;
  onYawChange?: (yawDeg: number) => void;
}

export function SceneRoot({
  buildings,
  roadNodes,
  trees,
  activePreset,
  selectedBuilding,
  selectedRoadNodeId,
  selectedTreeId,
  showLabels,
  showGrid,
  cameraMode,
  autoOrbit,
  editMode,
  clickToMove,
  onSelectBuilding,
  onSelectRoadNode,
  onSelectTree,
  onGroundClickInEdit,
  onTransitionEnd,
  onYawChange,
}: SceneRootProps) {
  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (editMode && clickToMove) {
      e.stopPropagation();
      onGroundClickInEdit(Math.round(e.point.x * 10) / 10, Math.round(e.point.z * 10) / 10);
    }
  };

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [-120, 260, 240], fov: 45, near: 0.5, far: 2800 }}
      onPointerMissed={() => {
        if (!editMode) onSelectBuilding(null);
      }}
    >
      <EnvironmentEffects />

      {/* Ground + Editable Road Network */}
      <group onClick={handleGroundClick}>
        <CampusGround
          roadNodes={roadNodes}
          editMode={editMode}
          selectedRoadNodeId={selectedRoadNodeId}
          onSelectRoadNode={onSelectRoadNode}
        />
      </group>

      {showGrid && (
        <Grid
          position={[-80, 0.2, -40]}
          args={[800, 650]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#475569"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#1e293b"
          fadeDistance={750}
        />
      )}

      {/* Buildings & Athletics */}
      <HeroBuildings
        buildings={buildings}
        selectedId={selectedBuilding?.id ?? null}
        onSelect={(b) => onSelectBuilding(b)}
      />
      <NorthZoneBuildings buildings={buildings} onSelect={(b) => onSelectBuilding(b)} />
      <AthleticsZone buildings={buildings} onSelect={(b) => onSelectBuilding(b)} />

      {/* Instanced Foliage (editable in Edit Mode) */}
      <CampusFoliage
        trees={trees}
        editMode={editMode}
        selectedTreeId={selectedTreeId}
        onSelectTree={onSelectTree}
      />

      {/* Selected Building Highlight Ring in Edit Mode */}
      {editMode && selectedBuilding && (
        <mesh
          position={[selectedBuilding.position[0], 0.3, selectedBuilding.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              Math.max(selectedBuilding.dimensions[0], selectedBuilding.dimensions[2]) * 0.52,
              Math.max(selectedBuilding.dimensions[0], selectedBuilding.dimensions[2]) * 0.56,
              48,
            ]}
          />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}

      {/* Floating 3D Labels */}
      {showLabels &&
        buildings.map((b) => (
          <Html
            key={`label-${b.id}`}
            position={[b.position[0], b.dimensions[1] + 5, b.position[2]]}
            center
            distanceFactor={260}
            style={{ pointerEvents: 'none' }}
          >
            <div
              className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap shadow-md border ${
                selectedBuilding?.id === b.id
                  ? 'bg-sky-500/95 text-white border-sky-200'
                  : 'bg-slate-900/80 text-slate-100 border-slate-700/80'
              }`}
            >
              {b.nameZh}
            </div>
          </Html>
        ))}

      <CompassMarkers />

      {cameraMode === 'orbit' && (
        <CameraRig
          activePreset={activePreset}
          selectedBuilding={selectedBuilding}
          autoOrbit={autoOrbit}
          editMode={editMode}
          onTransitionEnd={onTransitionEnd}
          onYawChange={onYawChange}
        />
      )}
      {cameraMode === 'walk' && <FirstPersonControls enabled={true} onYawChange={onYawChange} />}
      {cameraMode === 'girl' && <GirlWalker enabled={true} onYawChange={onYawChange} />}
    </Canvas>
  );
}
