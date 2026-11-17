import { useLayoutEffect, useMemo, useRef } from 'react';
import { Environment, Lightformer, Sky } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { pxToWorld } from '../data/campusLayout';

export type TimeOfDay = 'morning' | 'noon' | 'golden' | 'night';

interface TimePresetConfig {
  sunPosition: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  ambientIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  skyColor: string;
  fogColor: string;
  turbidity: number;
  rayleigh: number;
}

export const TIME_PRESETS: Record<TimeOfDay, TimePresetConfig> = {
  morning: {
    sunPosition: [260, 140, 120],
    sunColor: '#fff1db',
    sunIntensity: 2.1,
    ambientIntensity: 0.42,
    hemiSky: '#bae6fd',
    hemiGround: '#64748b',
    hemiIntensity: 0.55,
    skyColor: '#dbeafe',
    fogColor: '#dbeafe',
    turbidity: 4,
    rayleigh: 1.4,
  },
  noon: {
    sunPosition: [140, 320, 140],
    sunColor: '#ffffff',
    sunIntensity: 2.4,
    ambientIntensity: 0.5,
    hemiSky: '#e0f2fe',
    hemiGround: '#64748b',
    hemiIntensity: 0.65,
    skyColor: '#cde6fe',
    fogColor: '#cde6fe',
    turbidity: 2.5,
    rayleigh: 0.8,
  },
  golden: {
    sunPosition: [-320, 68, 160],
    sunColor: '#ffad5c',
    sunIntensity: 2.3,
    ambientIntensity: 0.32,
    hemiSky: '#fed7aa',
    hemiGround: '#475569',
    hemiIntensity: 0.45,
    skyColor: '#fde6c4',
    fogColor: '#fed7aa',
    turbidity: 8.5,
    rayleigh: 2.8,
  },
  night: {
    sunPosition: [-120, 220, -140],
    sunColor: '#7dd3fc',
    sunIntensity: 0.45,
    ambientIntensity: 0.22,
    hemiSky: '#1e3a5f',
    hemiGround: '#0f172a',
    hemiIntensity: 0.35,
    skyColor: '#09111f',
    fogColor: '#0b1528',
    turbidity: 10,
    rayleigh: 0.2,
  },
};

function CampusStreetlights({ isNight }: { isNight: boolean }) {
  const positions = useMemo(() => {
    const pts: [number, number][] = [];
    // Red main pedestrian avenue
    for (let px = 215; px <= 595; px += 38) {
      pts.push(pxToWorld(px, 535));
      pts.push(pxToWorld(px, 553));
    }
    // 中心花坛 ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      pts.push([Math.cos(a) * 23, Math.sin(a) * 23]);
    }
    // N-S avenue east of 寻真园
    for (let py = 395; py <= 525; py += 35) {
      pts.push(pxToWorld(625, py));
    }
    // North avenue
    for (let py = 290; py <= 395; py += 35) {
      pts.push(pxToWorld(822, py));
    }
    return pts;
  }, []);

  const poleRef = useRef<THREE.InstancedMesh>(null);
  const bulbRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    positions.forEach(([x, z], i) => {
      dummy.position.set(x, 2.4, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poleRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, 4.9, z);
      dummy.updateMatrix();
      bulbRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (poleRef.current) poleRef.current.instanceMatrix.needsUpdate = true;
    if (bulbRef.current) bulbRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <group>
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 4.8, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[undefined, undefined, positions.length]}>
        <sphereGeometry args={[0.28, 10, 10]} />
        <meshStandardMaterial
          color={isNight ? '#fde68a' : '#e2e8f0'}
          emissive={isNight ? '#f59e0b' : '#000000'}
          emissiveIntensity={isNight ? 2.4 : 0}
          roughness={0.2}
        />
      </instancedMesh>
    </group>
  );
}

export function EnvironmentEffects({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const cfg = TIME_PRESETS[timeOfDay];
  const isNight = timeOfDay === 'night';

  return (
    <>
      <color attach="background" args={[cfg.skyColor]} />
      <fog attach="fog" args={[cfg.fogColor, 500, 1400]} />

      {!isNight && (
        <Sky
          distance={4500}
          sunPosition={cfg.sunPosition}
          turbidity={cfg.turbidity}
          rayleigh={cfg.rayleigh}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}

      {/* Self-contained procedural IBL Environment (zero external HDR fetch) */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={isNight ? 0.35 : 1.6}
          color={isNight ? '#1e3a8a' : '#e0f2fe'}
          scale={[40, 20, 1]}
          position={[0, 15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={isNight ? 0.5 : 3.2}
          color={cfg.sunColor}
          scale={12}
          position={[20, 12, 15]}
        />
      </Environment>

      <ambientLight intensity={cfg.ambientIntensity} />
      <hemisphereLight args={[cfg.hemiSky, cfg.hemiGround, cfg.hemiIntensity]} />
      <directionalLight
        position={cfg.sunPosition}
        color={cfg.sunColor}
        intensity={cfg.sunIntensity}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-440}
        shadow-camera-right={240}
        shadow-camera-top={340}
        shadow-camera-bottom={-240}
        shadow-camera-near={10}
        shadow-camera-far={1050}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
      />

      <CampusStreetlights isNight={isNight} />

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={isNight ? 0.65 : 0.25}
          luminanceThreshold={0.92}
          mipmapBlur
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}
