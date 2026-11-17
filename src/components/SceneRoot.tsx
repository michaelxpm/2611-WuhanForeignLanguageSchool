import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BUILDINGS, BuildingSpec, CameraPreset } from '../data/campusLayout';
import { AthleticsZone } from './AthleticsZone';
import { CampusFoliage } from './CampusFoliage';
import { CampusGround } from './CampusGround';
import { EnvironmentEffects, TimeOfDay } from './EnvironmentEffects';
import { FirstPersonControls } from './FirstPersonControls';
import { HeroBuildings } from './buildings/HeroBuildings';
import { NorthZoneBuildings } from './buildings/NorthZoneBuildings';

interface CameraRigProps {
  activePreset: CameraPreset | null;
  selectedBuilding: BuildingSpec | null;
  onTransitionEnd: () => void;
  onYawChange?: (yawDeg: number) => void;
}

function CameraRig({ activePreset, selectedBuilding, onTransitionEnd, onYawChange }: CameraRigProps) {
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
    if (selectedBuilding) {
      const [bx, by, bz] = selectedBuilding.position;
      const [ox, oy, oz] = selectedBuilding.cameraOffset;
      desiredPos.current = new THREE.Vector3(bx + ox, by + oy, bz + oz);
      desiredTarget.current = new THREE.Vector3(bx, by + selectedBuilding.dimensions[1] * 0.4, bz);
    }
  }, [selectedBuilding]);

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
    { label: '西 W (-X)', pos: [-365, 2, 0], color: '#94a3b8' },
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
  activePreset: CameraPreset | null;
  selectedBuilding: BuildingSpec | null;
  showLabels: boolean;
  showGrid: boolean;
  timeOfDay: TimeOfDay;
  cameraMode: 'orbit' | 'walk';
  onSelectBuilding: (spec: BuildingSpec | null) => void;
  onTransitionEnd: () => void;
  onYawChange?: (yawDeg: number) => void;
}

export function SceneRoot({
  activePreset,
  selectedBuilding,
  showLabels,
  showGrid,
  timeOfDay,
  cameraMode,
  onSelectBuilding,
  onTransitionEnd,
  onYawChange,
}: SceneRootProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [-120, 260, 240], fov: 45, near: 0.5, far: 2800 }}
      onPointerMissed={() => onSelectBuilding(null)}
    >
      <EnvironmentEffects timeOfDay={timeOfDay} />

      {/* Campus Ground, Plazas, Roads, Gatehouse & 北太子湖 */}
      <CampusGround />

      {showGrid && (
        <Grid
          position={[-80, 0.12, -40]}
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

      {/* Phase 3 Hero Buildings (Zone A & Zone B) */}
      <HeroBuildings
        selectedId={selectedBuilding?.id ?? null}
        onSelect={(b) => onSelectBuilding(b)}
      />

      {/* Phase 4 North Zone Buildings & 升旗台 */}
      <NorthZoneBuildings onSelect={(b) => onSelectBuilding(b)} />

      {/* Phase 5 Athletics & Instanced Foliage */}
      <AthleticsZone onSelect={(b) => onSelectBuilding(b)} />
      <CampusFoliage />

      {/* Floating 3D Labels for All Campus Landmarks */}
      {showLabels &&
        BUILDINGS.map((b) => (
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
      {cameraMode === 'orbit' ? (
        <CameraRig
          activePreset={activePreset}
          selectedBuilding={selectedBuilding}
          onTransitionEnd={onTransitionEnd}
          onYawChange={onYawChange}
        />
      ) : (
        <FirstPersonControls enabled={true} onYawChange={onYawChange} />
      )}
    </Canvas>
  );
}
