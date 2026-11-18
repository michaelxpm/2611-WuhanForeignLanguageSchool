import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export interface TrafficConfig {
  paused: boolean;
  speedMultiplier: number;
  density: number; // 0..16
  filter: 'all' | 'bus' | 'car';
}

interface VehicleBlueprint {
  scene: THREE.Group;
  scale: number;
  offset: [number, number, number];
  autoRotY: number;
}

function useNormalizedVehicle(url: string, targetLength: number): VehicleBlueprint {
  const gltf = useGLTF(url);
  return useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const isXLongest = size.x > size.z;
    const rawLen = Math.max(size.x, size.z, 0.001);
    const scale = targetLength / rawLen;

    return {
      scene: c,
      scale,
      offset: [-center.x * scale, -box.min.y * scale, -center.z * scale],
      autoRotY: isXLongest ? Math.PI / 2 : 0,
    };
  }, [gltf.scene, targetLength]);
}

function VehicleInstance({
  blueprint,
  position,
  rotationY = 0,
}: {
  blueprint: VehicleBlueprint;
  position: [number, number, number];
  rotationY?: number;
}) {
  const cloned = useMemo(() => blueprint.scene.clone(true), [blueprint.scene]);
  return (
    <group position={position} rotation={[0, rotationY + blueprint.autoRotY, 0]}>
      <group position={blueprint.offset} scale={[blueprint.scale, blueprint.scale, blueprint.scale]}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

interface LaneVehicle {
  kind: 'car' | 'city_bus' | 'isuzu_bus';
  axis: 'x' | 'z';
  dir: 1 | -1;
  laneCoord: number;
  startOffset: number;
  speed: number;
  minBound: number;
  maxBound: number;
}

const TRAFFIC_LANES: LaneVehicle[] = [
  // 太子湖北路 (Westbound Z = 123 / 125.5)
  { kind: 'isuzu_bus', axis: 'x', dir: -1, laneCoord: 123, startOffset: -80, speed: 11, minBound: -480, maxBound: 220 },
  { kind: 'car', axis: 'x', dir: -1, laneCoord: 123, startOffset: -260, speed: 14, minBound: -480, maxBound: 220 },
  { kind: 'car', axis: 'x', dir: -1, laneCoord: 125.5, startOffset: 110, speed: 16, minBound: -480, maxBound: 220 },
  { kind: 'car', axis: 'x', dir: -1, laneCoord: 125.5, startOffset: -370, speed: 15, minBound: -480, maxBound: 220 },

  // 太子湖北路 (Eastbound Z = 133 / 135.5)
  { kind: 'city_bus', axis: 'x', dir: 1, laneCoord: 133, startOffset: -210, speed: 10.5, minBound: -480, maxBound: 220 },
  { kind: 'car', axis: 'x', dir: 1, laneCoord: 133, startOffset: -390, speed: 15, minBound: -480, maxBound: 220 },
  { kind: 'car', axis: 'x', dir: 1, laneCoord: 135.5, startOffset: 20, speed: 17, minBound: -480, maxBound: 220 },
  { kind: 'isuzu_bus', axis: 'x', dir: 1, laneCoord: 133, startOffset: 140, speed: 11.5, minBound: -480, maxBound: 220 },

  // 东风大道 (Northbound X = -434)
  { kind: 'isuzu_bus', axis: 'z', dir: -1, laneCoord: -434, startOffset: 100, speed: 11, minBound: -330, maxBound: 220 },
  { kind: 'car', axis: 'z', dir: -1, laneCoord: -434, startOffset: -120, speed: 15, minBound: -330, maxBound: 220 },
  { kind: 'car', axis: 'z', dir: -1, laneCoord: -431.5, startOffset: -20, speed: 16.5, minBound: -330, maxBound: 220 },
  { kind: 'car', axis: 'z', dir: -1, laneCoord: -431.5, startOffset: -240, speed: 14, minBound: -330, maxBound: 220 },

  // 东风大道 (Southbound X = -444)
  { kind: 'city_bus', axis: 'z', dir: 1, laneCoord: -444, startOffset: -190, speed: 11.5, minBound: -330, maxBound: 220 },
  { kind: 'car', axis: 'z', dir: 1, laneCoord: -444, startOffset: 40, speed: 16, minBound: -330, maxBound: 220 },
  { kind: 'car', axis: 'z', dir: 1, laneCoord: -446.5, startOffset: -80, speed: 15.5, minBound: -330, maxBound: 220 },
  { kind: 'car', axis: 'z', dir: 1, laneCoord: -446.5, startOffset: 160, speed: 14.5, minBound: -330, maxBound: 220 },
];

function MovingTrafficContent({ config }: { config: TrafficConfig }) {
  const carBp = useNormalizedVehicle('./models/volvo_v50/scene.gltf', 4.5);
  const cityBusBp = useNormalizedVehicle('./models/city_bus/scene.gltf', 10.2);
  const isuzuBusBp = useNormalizedVehicle('./models/isuzu_bus/scene.gltf', 10.5);

  const refs = useRef<(THREE.Group | null)[]>([]);
  const offsets = useRef<number[]>(TRAFFIC_LANES.map((v) => v.startOffset));

  useFrame((_, rawDelta) => {
    if (config.paused) return;
    const dt = Math.min(rawDelta, 0.05) * config.speedMultiplier;
    TRAFFIC_LANES.forEach((v, i) => {
      const grp = refs.current[i];
      if (!grp || !grp.visible) return;
      let posVal = offsets.current[i] + v.dir * v.speed * dt;
      if (v.dir === 1 && posVal > v.maxBound) posVal = v.minBound;
      if (v.dir === -1 && posVal < v.minBound) posVal = v.maxBound;
      offsets.current[i] = posVal;

      if (v.axis === 'x') {
        grp.position.set(posVal, 0.06, v.laneCoord);
      } else {
        grp.position.set(v.laneCoord, 0.06, posVal);
      }
    });
  });

  return (
    <group>
      {TRAFFIC_LANES.map((v, i) => {
        const matchesFilter =
          config.filter === 'all' ||
          (config.filter === 'car' && v.kind === 'car') ||
          (config.filter === 'bus' && v.kind !== 'car');
        const visible = i < config.density && matchesFilter;

        const bp =
          v.kind === 'car' ? carBp : v.kind === 'city_bus' ? cityBusBp : isuzuBusBp;
        // All normalized blueprints face -Z forward:
        // +X (East) -> -PI/2, -X (West) -> +PI/2, +Z (South) -> PI, -Z (North) -> 0
        const rotY =
          v.axis === 'x' ? (v.dir === 1 ? -Math.PI / 2 : Math.PI / 2) : v.dir === 1 ? Math.PI : 0;
        const initPos: [number, number, number] =
          v.axis === 'x' ? [offsets.current[i], 0.06, v.laneCoord] : [v.laneCoord, 0.06, offsets.current[i]];
        return (
          <group
            key={i}
            visible={visible}
            ref={(el) => {
              refs.current[i] = el;
            }}
            position={initPos}
          >
            <VehicleInstance blueprint={bp} position={[0, 0, 0]} rotationY={rotY} />
          </group>
        );
      })}
    </group>
  );
}

export function ExternalTraffic({ config }: { config: TrafficConfig }) {
  return (
    <Suspense fallback={null}>
      <MovingTrafficContent config={config} />
    </Suspense>
  );
}
