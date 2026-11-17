import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  getAsphaltTexture,
  getBrickWalkwayTexture,
  getGrassTexture,
  getStonePavingTexture,
  getVerticalPlaqueTexture,
  getWaterNormalTexture,
} from '../materials/proceduralTextures';

const LOTUS_CLUSTERS: { pos: [number, number]; radius: number }[] = [
  { pos: [-215, -110], radius: 18 },
  { pos: [-190, -155], radius: 14 },
  { pos: [-240, -165], radius: 22 },
  { pos: [-200, -210], radius: 16 },
  { pos: [-175, -260], radius: 20 },
  { pos: [-125, -295], radius: 15 },
  { pos: [-75, -310], radius: 17 },
];

export function CampusGround() {
  const stoneTex = useMemo(() => getStonePavingTexture(20, 20), []);
  const brickTex = useMemo(() => getBrickWalkwayTexture(14, 4), []);
  const grassTex = useMemo(() => getGrassTexture(36, 36), []);
  const asphaltTex = useMemo(() => getAsphaltTexture(18, 2), []);
  const waterNormalTex = useMemo(() => getWaterNormalTexture(), []);
  const plaqueLeft = useMemo(() => getVerticalPlaqueTexture('武汉外国语学校'), []);
  const plaqueRight = useMemo(() => getVerticalPlaqueTexture('武汉实验外国语学校'), []);

  const waterRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (waterRef.current?.normalMap) {
      waterRef.current.normalMap.offset.x += delta * 0.015;
      waterRef.current.normalMap.offset.y += delta * 0.01;
    }
  });

  // Radial fan plaza spokes & concentric rings
  // Opens toward East-Southeast (+X, +Z) from 中心花坛 (0,0)
  const fanStartAngle = -0.38; // ~ -22 deg
  const fanEndAngle = 1.18; // ~ +67 deg
  const fanSpan = fanEndAngle - fanStartAngle;
  const spokeAngles = useMemo(() => {
    const count = 6;
    return Array.from({ length: count }, (_, i) => fanStartAngle + (i / (count - 1)) * fanSpan);
  }, []);

  const ringRadii = [26, 46, 66, 86, 106];

  return (
    <group>
      {/* Base Earth / Campus Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, -0.05, -45]} receiveShadow>
        <planeGeometry args={[920, 760]} />
        <meshStandardMaterial map={grassTex} color="#7ab55c" roughness={0.94} />
      </mesh>

      {/* ==================== 北太子湖 (North Taizihu Lake) ==================== */}
      <group>
        {/* Lake water plane covering NW and North perimeter */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-250, -0.35, -210]} receiveShadow>
          <planeGeometry args={[360, 320]} />
          <meshStandardMaterial
            ref={waterRef}
            color="#1c474d"
            roughness={0.14}
            metalness={0.28}
            normalMap={waterNormalTex}
            normalScale={new THREE.Vector2(0.35, 0.35)}
          />
        </mesh>
        {/* Northern extension of lake */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-60, -0.35, -330]} receiveShadow>
          <planeGeometry args={[340, 140]} />
          <meshStandardMaterial
            color="#1c474d"
            roughness={0.14}
            metalness={0.28}
            normalMap={waterNormalTex}
            normalScale={new THREE.Vector2(0.35, 0.35)}
          />
        </mesh>

        {/* Campus Shoreline Embankment (Peninsula) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-60, -0.03, -175]} receiveShadow>
          <boxGeometry args={[175, 225, 0.2]} />
          <meshStandardMaterial map={grassTex} color="#6ca84e" roughness={0.95} />
        </mesh>

        {/* Circular Lotus Leaf Clusters (荷叶群) */}
        {LOTUS_CLUSTERS.map((cluster, idx) => (
          <mesh
            key={idx}
            rotation={[-Math.PI / 2, 0, idx * 0.7]}
            position={[cluster.pos[0], -0.22, cluster.pos[1]]}
            receiveShadow
          >
            <circleGeometry args={[cluster.radius, 24]} />
            <meshStandardMaterial color="#4e8c3f" roughness={0.85} />
          </mesh>
        ))}

        {/* Lakeside Walking Path */}
        <mesh position={[-148, 0.04, -175]} rotation={[0, 0.12, 0]} receiveShadow>
          <boxGeometry args={[3.5, 0.08, 220]} />
          <meshStandardMaterial map={brickTex} color="#b87356" roughness={0.88} />
        </mesh>
      </group>

      {/* ==================== 中心花坛 (Central Roundabout) ==================== */}
      <group position={[0, 0, 0]}>
        {/* Outer paved ring road */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
          <ringGeometry args={[14.5, 24.5, 64]} />
          <meshStandardMaterial map={stoneTex} color="#d6cfc4" roughness={0.85} />
        </mesh>
        {/* Inner stone curb */}
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[14.6, 14.8, 0.4, 48]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        {/* Inner manicured lawn */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]} receiveShadow>
          <circleGeometry args={[14.2, 48]} />
          <meshStandardMaterial map={grassTex} color="#4d943c" roughness={0.92} />
        </mesh>
        {/* Central floral parterre ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.45, 0]} receiveShadow>
          <ringGeometry args={[4.5, 6.2, 36]} />
          <meshStandardMaterial color="#be123c" roughness={0.85} />
        </mesh>
      </group>

      {/* ==================== 扇形广场 (Radial Fan Plaza) ==================== */}
      <group position={[0, 0, 0]}>
        {/* Grass terraces between rings */}
        {ringRadii.slice(0, -1).map((r, i) => (
          <mesh
            key={`fan-grass-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02 + i * 0.04, 0]}
            receiveShadow
          >
            <ringGeometry args={[r + 1.2, ringRadii[i + 1] - 1.2, 48, 1, -fanEndAngle, fanSpan]} />
            <meshStandardMaterial
              map={grassTex}
              color={i % 2 === 0 ? '#5c9c46' : '#53913e'}
              roughness={0.92}
            />
          </mesh>
        ))}

        {/* Concentric red-brick walkway rings */}
        {ringRadii.map((r, i) => (
          <mesh
            key={`fan-ring-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.06 + i * 0.03, 0]}
            receiveShadow
          >
            <ringGeometry args={[r - 1.2, r + 1.2, 48, 1, -fanEndAngle, fanSpan]} />
            <meshStandardMaterial map={brickTex} color="#b5674c" roughness={0.85} />
          </mesh>
        ))}

        {/* 6 Radial brick spokes */}
        {spokeAngles.map((angle, i) => {
          const midR = 66;
          const length = 82;
          return (
            <mesh
              key={`spoke-${i}`}
              position={[Math.cos(angle) * midR, 0.09, Math.sin(angle) * midR]}
              rotation={[0, -angle, 0]}
              receiveShadow
            >
              <boxGeometry args={[length, 0.12, 2.8]} />
              <meshStandardMaterial map={brickTex} color="#b5674c" roughness={0.85} />
            </mesh>
          );
        })}
      </group>

      {/* ==================== MAIN ENTRANCE PLAZA & PARTERRE ==================== */}
      <group>
        {/* Grand stone-paved square South-Southwest of Roundabout */}
        <mesh position={[-48, 0.04, 82]} rotation={[0, -0.14, 0]} receiveShadow>
          <boxGeometry args={[74, 0.08, 62]} />
          <meshStandardMaterial map={stoneTex} color="#d2cbc0" roughness={0.84} />
        </mesh>
        {/* Axial stone walkway strip */}
        <mesh position={[-32, 0.06, 46]} rotation={[0, 0.56, 0]} receiveShadow>
          <boxGeometry args={[12, 0.08, 88]} />
          <meshStandardMaterial map={stoneTex} color="#ded8ce" roughness={0.82} />
        </mesh>

        {/* Formal Circular Fountain Parterre (South-Center, west of Main Plaza) */}
        <group position={[-94, 0.04, 122]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[36, 32]} />
            <meshStandardMaterial map={grassTex} color="#589643" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <cylinderGeometry args={[8.5, 8.8, 0.3, 36]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[7.4, 7.4, 0.08, 36]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.2} />
          </mesh>
        </group>
      </group>

      {/* ==================== 寻真园 · 种植区 (Xunzhen Garden & Planting Area) ==================== */}
      <group position={[-138, 0.03, 35]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[92, 108]} />
          <meshStandardMaterial map={grassTex} color="#5da346" roughness={0.93} />
        </mesh>
        {/* Garden stone paths */}
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[92, 0.06, 2.8]} />
          <meshStandardMaterial map={stoneTex} color="#d6d0c6" roughness={0.85} />
        </mesh>
        {/* Planting beds */}
        {[-22, -8, 8, 22].map((dx, i) => (
          <mesh key={i} position={[dx, 0.08, -28]} receiveShadow>
            <boxGeometry args={[9, 0.15, 22]} />
            <meshStandardMaterial color="#5c4033" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* ==================== CAMPUS AVENUES & EXTERNAL ROADS ==================== */}
      <group>
        {/* Avenue from Roundabout SW toward Stadium & Main Gate */}
        <mesh position={[-160, 0.03, 0]} rotation={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[320, 0.06, 11]} />
          <meshStandardMaterial map={stoneTex} color="#cfc8bc" roughness={0.86} />
        </mesh>
        {/* Avenue from Roundabout NW toward 小学部 & 小操场 */}
        <mesh position={[-35, 0.03, -108]} rotation={[0, 0.24, 0]} receiveShadow>
          <boxGeometry args={[12, 0.06, 195]} />
          <meshStandardMaterial map={stoneTex} color="#cfc8bc" roughness={0.86} />
        </mesh>
        {/* East perimeter road (past 桂苑 & 松苑) */}
        <mesh position={[92, 0.03, 25]} rotation={[0, -0.14, 0]} receiveShadow>
          <boxGeometry args={[10, 0.06, 165]} />
          <meshStandardMaterial map={stoneTex} color="#cfc8bc" roughness={0.86} />
        </mesh>

        {/* 太子湖北路 (Taizihu N Rd - South Boundary) */}
        <mesh position={[-80, 0.02, 154]} receiveShadow>
          <boxGeometry args={[620, 0.08, 20]} />
          <meshStandardMaterial map={asphaltTex} color="#474d57" roughness={0.88} />
        </mesh>

        {/* 东风大道 (Dongfeng Blvd - West Boundary) */}
        <mesh position={[-346, 0.02, -40]} receiveShadow>
          <boxGeometry args={[24, 0.08, 560]} />
          <meshStandardMaterial map={asphaltTex} color="#474d57" roughness={0.88} />
        </mesh>
        {/* 东风大道高架桥 (Dongfeng Blvd Elevated Viaduct) */}
        <group position={[-374, 0, -40]}>
          <mesh position={[0, 9.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[22, 1.4, 560]} />
            <meshStandardMaterial color="#64748b" roughness={0.85} />
          </mesh>
          {[-200, -140, -80, -20, 40, 100, 160].map((pz, i) => (
            <mesh key={i} position={[0, 4.5, pz]} castShadow>
              <cylinderGeometry args={[1.6, 1.8, 9, 12]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.85} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ==================== 西北门 · 校园主入口 (Main Gatehouse) ==================== */}
      <group position={[-325, 0, 18]}>
        {/* Gate asphalt apron */}
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[24, 0.08, 22]} />
          <meshStandardMaterial map={asphaltTex} color="#434954" roughness={0.85} />
        </mesh>
        {/* Yellow/Blue crosswalk stripes */}
        {[-6, -3, 0, 3, 6].map((dz, i) => (
          <mesh key={i} position={[-6, 0.09, dz]} receiveShadow>
            <boxGeometry args={[3.2, 0.02, 1.2]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#facc15' : '#e2e8f0'} roughness={0.7} />
          </mesh>
        ))}
        {/* North & South Stone Gate Pillars */}
        <mesh position={[0, 2.4, -8.5]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 4.8, 2.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.4, 8.5]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 4.8, 2.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        {/* Vertical School Name Plaques */}
        <mesh position={[-1.12, 2.4, -8.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 3.6]} />
          <meshStandardMaterial map={plaqueLeft} roughness={0.4} />
        </mesh>
        <mesh position={[-1.12, 2.4, 8.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 3.6]} />
          <meshStandardMaterial map={plaqueRight} roughness={0.4} />
        </mesh>
        {/* Gatehouse Guard Booth */}
        <mesh position={[2.5, 1.6, -11.5]} castShadow receiveShadow>
          <boxGeometry args={[5.5, 3.2, 3.6]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        {/* Wrought-iron gate wings & barrier arm */}
        <mesh position={[0, 1.1, -4.2]} castShadow>
          <boxGeometry args={[0.25, 2.2, 6.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.1, 4.2]} castShadow>
          <boxGeometry args={[0.25, 2.2, 6.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Barrier arm */}
        <mesh position={[-1.2, 1.3, 0]} rotation={[0.28, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, 5.5]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
