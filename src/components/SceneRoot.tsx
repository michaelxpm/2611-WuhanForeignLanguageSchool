import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BUILDINGS, BuildingSpec, CameraPreset } from '../data/campusLayout';
import { CampusGround } from './CampusGround';
import { HeroBuildings } from './buildings/HeroBuildings';

const PHASE3_HERO_IDS = new Set([
  'middle-school-main',
  'middle-school-annex',
  'elementary-teaching',
  'auditorium',
  'triangular-atrium',
  'guiyuan',
  'songyuan',
]);

interface CameraRigProps {
  activePreset: CameraPreset | null;
  selectedBuilding: BuildingSpec | null;
  onTransitionEnd: () => void;
}

function CameraRig({ activePreset, selectedBuilding, onTransitionEnd }: CameraRigProps) {
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

    // Prevent camera from going below ground
    if (camera.position.y < 1.5) {
      camera.position.y = 1.5;
    }
    controls.update();
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

interface MassingBlockProps {
  spec: BuildingSpec;
  isSelected: boolean;
  showLabels: boolean;
  onSelect: (spec: BuildingSpec) => void;
}

function MassingBlock({ spec, isSelected, showLabels, onSelect }: MassingBlockProps) {
  const [w, h, d] = spec.dimensions;

  return (
    <group
      position={spec.position}
      rotation={[0, spec.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(spec);
      }}
    >
      {/* Building body massing */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : spec.wallColor}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      {/* Roof cap massing */}
      <mesh position={[0, h + 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.8, 0.8, d + 0.8]} />
        <meshStandardMaterial
          color={isSelected ? '#0284c7' : spec.roofColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {showLabels && (
        <Html
          position={[0, h + 5, 0]}
          center
          distanceFactor={260}
          occlude={false}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap shadow-md border ${
              isSelected
                ? 'bg-sky-500/95 text-white border-sky-200'
                : 'bg-slate-900/80 text-slate-100 border-slate-700/80'
            }`}
          >
            {spec.nameZh}
          </div>
        </Html>
      )}
    </group>
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
  onSelectBuilding: (spec: BuildingSpec | null) => void;
  onTransitionEnd: () => void;
}

export function SceneRoot({
  activePreset,
  selectedBuilding,
  showLabels,
  showGrid,
  onSelectBuilding,
  onTransitionEnd,
}: SceneRootProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [-210, 210, 260], fov: 45, near: 1, far: 2500 }}
      onPointerMissed={() => onSelectBuilding(null)}
    >
      <color attach="background" args={['#dbeafe']} />
      <fog attach="fog" args={['#dbeafe', 450, 1200]} />

      {/* Base Lighting */}
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#e0f2fe', '#64748b', 0.6]} />
      <directionalLight
        position={[180, 260, 160]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-380}
        shadow-camera-right={220}
        shadow-camera-top={320}
        shadow-camera-bottom={-220}
        shadow-camera-near={10}
        shadow-camera-far={900}
        shadow-bias={-0.0005}
      />

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

      {/* Remaining Massing Blocks (to be replaced in Phase 4 & 5) */}
      {BUILDINGS.filter(
        (b) =>
          b.id !== 'central-roundabout' &&
          b.id !== 'west-gate' &&
          !PHASE3_HERO_IDS.has(b.id)
      ).map((b) => (
        <MassingBlock
          key={b.id}
          spec={b}
          isSelected={selectedBuilding?.id === b.id}
          showLabels={showLabels}
          onSelect={onSelectBuilding}
        />
      ))}

      {/* Floating 3D Labels for Phase 3 Hero Buildings */}
      {showLabels &&
        BUILDINGS.filter((b) => PHASE3_HERO_IDS.has(b.id)).map((b) => (
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
      <CameraRig
        activePreset={activePreset}
        selectedBuilding={selectedBuilding}
        onTransitionEnd={onTransitionEnd}
      />
    </Canvas>
  );
}
