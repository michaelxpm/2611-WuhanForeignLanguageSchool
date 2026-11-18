import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BuildingSpec, CameraPreset } from '../data/campusLayout';
import { RoadNode, TreeItem } from '../data/editableDefaults';
import { AthleticsZone } from './AthleticsZone';
import { CampusFoliage, TreeDisplayStyle } from './CampusFoliage';
import { CampusGround } from './CampusGround';
import { CveStreetscape } from './CveStreetscape';
import { EnvironmentEffects } from './EnvironmentEffects';
import { ExternalTraffic, TrafficConfig } from './ExternalTraffic';
import { GirlWalker, MobileJoystickInput, WalkerCharacter } from './GirlWalker';
import { HeroBuildings } from './buildings/HeroBuildings';
import { NorthZoneBuildings } from './buildings/NorthZoneBuildings';

export type CameraMode = 'orbit' | 'girl';
export type DragKind = 'building' | 'road' | 'tree';

interface DragInfo {
  kind: DragKind;
  id: string;
  offsetX: number;
  offsetZ: number;
}

interface CameraRigProps {
  activePreset: CameraPreset | null;
  selectedBuilding: BuildingSpec | null;
  autoOrbit: boolean;
  editMode: boolean;
  controlsEnabled: boolean;
  onTransitionEnd: () => void;
  onYawChange?: (yawDeg: number) => void;
}

function CameraRig({
  activePreset,
  selectedBuilding,
  autoOrbit,
  editMode,
  controlsEnabled,
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
      enabled={controlsEnabled}
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
  treeStyle: TreeDisplayStyle;
  activePreset: CameraPreset | null;
  selectedBuilding: BuildingSpec | null;
  selectedRoadNodeId: string | null;
  selectedTreeId: string | null;
  showLabels: boolean;
  showGrid: boolean;
  cameraMode: CameraMode;
  walkerCharacter: WalkerCharacter;
  mobileInputRef: React.MutableRefObject<MobileJoystickInput>;
  trafficConfig: TrafficConfig;
  autoOrbit: boolean;
  editMode: boolean;
  clickToMove: boolean;
  plantTreeMode: boolean;
  onSelectBuilding: (spec: BuildingSpec | null) => void;
  onSelectRoadNode: (node: RoadNode) => void;
  onSelectTree: (tree: TreeItem) => void;
  onGroundClickInEdit: (x: number, z: number) => void;
  onPlantTreeAt: (x: number, z: number) => void;
  onDragStart: () => void;
  onDragMove: (kind: DragKind, id: string, x: number, z: number) => void;
  onDragEnd: () => void;
  onTransitionEnd: () => void;
  onYawChange?: (yawDeg: number) => void;
}

export function SceneRoot({
  buildings,
  roadNodes,
  trees,
  treeStyle,
  activePreset,
  selectedBuilding,
  selectedRoadNodeId,
  selectedTreeId,
  showLabels,
  showGrid,
  cameraMode,
  walkerCharacter,
  mobileInputRef,
  trafficConfig,
  autoOrbit,
  editMode,
  clickToMove,
  plantTreeMode,
  onSelectBuilding,
  onSelectRoadNode,
  onSelectTree,
  onGroundClickInEdit,
  onPlantTreeAt,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransitionEnd,
  onYawChange,
}: SceneRootProps) {
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const westGate = buildings.find((b) => b.id === 'west-gate')!;

  const handleStartDrag = useCallback(
    (kind: DragKind, id: string, e: ThreeEvent<PointerEvent>) => {
      if (!editMode) return;
      let curX = 0;
      let curZ = 0;
      if (kind === 'building') {
        const b = buildings.find((item) => item.id === id);
        if (b) {
          curX = b.position[0];
          curZ = b.position[2];
        }
      } else if (kind === 'road') {
        const r = roadNodes.find((item) => item.id === id);
        if (r) {
          curX = r.x;
          curZ = r.z;
        }
      } else if (kind === 'tree') {
        const t = trees.find((item) => item.id === id);
        if (t) {
          curX = t.x;
          curZ = t.z;
        }
      }

      onDragStart();
      setDragInfo({
        kind,
        id,
        offsetX: curX - e.point.x,
        offsetZ: curZ - e.point.z,
      });
    },
    [editMode, buildings, roadNodes, trees, onDragStart]
  );

  useEffect(() => {
    if (!dragInfo) return;
    const stop = () => {
      setDragInfo(null);
      onDragEnd();
    };
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, [dragInfo, onDragEnd]);

  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    const x = Math.round(e.point.x * 10) / 10;
    const z = Math.round(e.point.z * 10) / 10;
    if (plantTreeMode) {
      e.stopPropagation();
      onPlantTreeAt(x, z);
      return;
    }
    if (editMode && clickToMove) {
      e.stopPropagation();
      onGroundClickInEdit(x, z);
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

      {/* Invisible drag-capture plane active only while dragging an element in Edit Mode */}
      {dragInfo && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.25, 0]}
          onPointerMove={(e) => {
            e.stopPropagation();
            const nx = Math.round((e.point.x + dragInfo.offsetX) * 10) / 10;
            const nz = Math.round((e.point.z + dragInfo.offsetZ) * 10) / 10;
            onDragMove(dragInfo.kind, dragInfo.id, nx, nz);
          }}
        >
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Ground + Editable Road Network + Movable West Gate */}
      <group onClick={handleGroundClick}>
        <CampusGround
          westGate={westGate}
          roadNodes={roadNodes}
          editMode={editMode}
          selectedRoadNodeId={selectedRoadNodeId}
          onSelectBuilding={(b) => onSelectBuilding(b)}
          onSelectRoadNode={onSelectRoadNode}
          onStartDrag={handleStartDrag}
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
        editMode={editMode}
        onSelect={(b) => onSelectBuilding(b)}
        onStartDrag={handleStartDrag}
      />
      <NorthZoneBuildings
        buildings={buildings}
        editMode={editMode}
        onSelect={(b) => onSelectBuilding(b)}
        onStartDrag={handleStartDrag}
      />
      <AthleticsZone
        buildings={buildings}
        editMode={editMode}
        onSelect={(b) => onSelectBuilding(b)}
        onStartDrag={handleStartDrag}
      />

      {/* CVE Streetscape Props & Real GLTF Moving Cars/Buses on 太子湖北路 & 东风大道 */}
      <CveStreetscape />
      <ExternalTraffic config={trafficConfig} />

      {/* Instanced Foliage (GLTF Oak/Maple/LowPoly + draggable in Edit Mode) */}
      <CampusFoliage
        trees={trees}
        treeStyle={treeStyle}
        editMode={editMode}
        selectedTreeId={selectedTreeId}
        onSelectTree={onSelectTree}
        onStartDrag={handleStartDrag}
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
          controlsEnabled={!dragInfo}
          onTransitionEnd={onTransitionEnd}
          onYawChange={onYawChange}
        />
      )}
      {cameraMode === 'girl' && (
        <GirlWalker
          enabled={true}
          character={walkerCharacter}
          mobileInputRef={mobileInputRef}
          onYawChange={onYawChange}
        />
      )}
    </Canvas>
  );
}
