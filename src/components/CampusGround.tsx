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

interface RoadSegmentProps {
  from: [number, number];
  to: [number, number];
  width: number;
  y?: number;
  color?: string;
  map?: THREE.Texture;
}

function RoadSegment({ from, to, width, y = 0.08, color = '#d6cfc4', map }: RoadSegmentProps) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const midX = (from[0] + to[0]) / 2;
  const midZ = (from[1] + to[1]) / 2;

  return (
    <mesh position={[midX, y, midZ]} rotation={[0, -angle, 0]} receiveShadow>
      <boxGeometry args={[length + width * 0.3, 0.04, width]} />
      <meshStandardMaterial map={map} color={color} roughness={0.86} />
    </mesh>
  );
}

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

  // Triangular lawn (三角绿地) between 中心花坛 and 主入口广场
  const triLawnGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-4, 24);
    shape.lineTo(-34, 72);
    shape.lineTo(14, 72);
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Radial fan plaza spokes & concentric rings
  const fanStartAngle = -0.38;
  const fanEndAngle = 1.18;
  const fanSpan = fanEndAngle - fanStartAngle;
  const spokeAngles = useMemo(() => {
    const count = 6;
    return Array.from({ length: count }, (_, i) => fanStartAngle + (i / (count - 1)) * fanSpan);
  }, []);

  const ringRadii = [26, 46, 66, 86, 106];

  return (
    <group>
      {/* Base Earth / Campus Lawn (strictly at y = 0.00 to prevent any Z-fighting) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.0, -45]} receiveShadow>
        <planeGeometry args={[920, 760]} />
        <meshStandardMaterial map={grassTex} color="#7ab55c" roughness={0.94} />
      </mesh>

      {/* ==================== 北太子湖 (North Taizihu Lake) ==================== */}
      <group>
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

        {/* Campus Peninsula Lawn (top strictly at y = 0.01) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-60, 0.01, -175]} receiveShadow>
          <planeGeometry args={[175, 225]} />
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
        <RoadSegment from={[-154, -70]} to={[-144, -278]} width={3.6} y={0.07} color="#b87356" map={brickTex} />
        <RoadSegment from={[-144, -278]} to={[-20, -288]} width={3.6} y={0.07} color="#b87356" map={brickTex} />
      </group>

      {/* ==================== 中心花坛 (Central Roundabout) ==================== */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
          <ringGeometry args={[14.5, 24.5, 64]} />
          <meshStandardMaterial map={stoneTex} color="#d6cfc4" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.24, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[14.6, 14.8, 0.4, 48]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.45, 0]} receiveShadow>
          <circleGeometry args={[14.2, 48]} />
          <meshStandardMaterial map={grassTex} color="#4d943c" roughness={0.92} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.48, 0]} receiveShadow>
          <ringGeometry args={[4.5, 6.2, 36]} />
          <meshStandardMaterial color="#be123c" roughness={0.85} />
        </mesh>
      </group>

      {/* ==================== 扇形广场 (Radial Fan Plaza) ==================== */}
      <group position={[0, 0, 0]}>
        {ringRadii.slice(0, -1).map((r, i) => (
          <mesh
            key={`fan-grass-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.05 + i * 0.015, 0]}
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

        {ringRadii.map((r, i) => (
          <mesh
            key={`fan-ring-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.09 + i * 0.012, 0]}
            receiveShadow
          >
            <ringGeometry args={[r - 1.2, r + 1.2, 48, 1, -fanEndAngle, fanSpan]} />
            <meshStandardMaterial map={brickTex} color="#b5674c" roughness={0.85} />
          </mesh>
        ))}

        {spokeAngles.map((angle, i) => {
          const midR = 66;
          const length = 82;
          return (
            <mesh
              key={`spoke-${i}`}
              position={[Math.cos(angle) * midR, 0.12, Math.sin(angle) * midR]}
              rotation={[0, -angle, 0]}
              receiveShadow
            >
              <boxGeometry args={[length, 0.05, 2.8]} />
              <meshStandardMaterial map={brickTex} color="#b5674c" roughness={0.85} />
            </mesh>
          );
        })}
      </group>

      {/* ==================== MAIN ENTRANCE PLAZA & TRIANGULAR LAWN ==================== */}
      <group>
        {/* Triangular lawn south of 中心花坛 */}
        <mesh geometry={triLawnGeo} position={[0, 0.09, 0]} receiveShadow>
          <meshStandardMaterial map={grassTex} color="#53963e" roughness={0.92} />
        </mesh>

        {/* Grand stone-paved square South of Roundabout */}
        <mesh position={[-42, 0.07, 88]} rotation={[0, -0.08, 0]} receiveShadow>
          <boxGeometry args={[72, 0.05, 52]} />
          <meshStandardMaterial map={stoneTex} color="#d2cbc0" roughness={0.84} />
        </mesh>

        {/* Formal Circular Fountain Parterre (South-Center, west of Main Plaza) */}
        <group position={[-94, 0.06, 122]}>
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

      {/* ==================== 寻真园 · 种植区 (with Zig-Zag White Path) ==================== */}
      <group position={[-138, 0.05, 35]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[92, 92]} />
          <meshStandardMaterial map={grassTex} color="#5da346" roughness={0.93} />
        </mesh>
        {/* Planting beds */}
        {[-22, -8, 8, 22].map((dx, i) => (
          <mesh key={i} position={[dx, 0.07, -24]} receiveShadow>
            <boxGeometry args={[9, 0.14, 20]} />
            <meshStandardMaterial color="#5c4033" roughness={0.95} />
          </mesh>
        ))}
      </group>
      {/* Zig-zag white garden path through 寻真园 */}
      <RoadSegment from={[-138, -10]} to={[-138, 25]} width={3.2} y={0.08} color="#e2ddd5" map={stoneTex} />
      <RoadSegment from={[-138, 25]} to={[-125, 38]} width={3.2} y={0.08} color="#e2ddd5" map={stoneTex} />
      <RoadSegment from={[-125, 38]} to={[-125, 78]} width={3.2} y={0.08} color="#e2ddd5" map={stoneTex} />

      {/* ==================== ACCURATE CAMPUS ROAD NETWORK (Aligned to 40ebdf7a.jpg) ==================== */}
      <group>
        {/* 1. RED LINE: Main Entrance Pedestrian Avenue (from SW Gate along south side of Stadium to Main Plaza) */}
        <RoadSegment from={[-318, 100]} to={[-95, 94]} width={7.5} y={0.08} color="#ded8ce" map={stoneTex} />
        <RoadSegment from={[-95, 94]} to={[-52, 86]} width={8.5} y={0.08} color="#ded8ce" map={stoneTex} />

        {/* 2. BLUE LINE: Vehicle Road (behind stadium grandstand, past parking lot, south of 寻真园) */}
        <RoadSegment from={[-318, 92]} to={[-318, 24]} width={6.5} y={0.07} color="#cfd6df" map={stoneTex} />
        <RoadSegment from={[-318, 24]} to={[-285, -8]} width={6.5} y={0.07} color="#cfd6df" map={stoneTex} />
        <RoadSegment from={[-285, -8]} to={[-165, -8]} width={6.5} y={0.07} color="#cfd6df" map={stoneTex} />
        <RoadSegment from={[-165, -8]} to={[-95, 8]} width={6.5} y={0.07} color="#cfd6df" map={stoneTex} />

        {/* 3. BLACK LINES: Asymmetric avenues around 中心花坛 */}
        {/* South avenue & SE diagonal flanking the triangular lawn */}
        <RoadSegment from={[-4, 20]} to={[-36, 76]} width={8} y={0.09} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={[6, 18]} to={[16, 76]} width={8} y={0.09} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={[-36, 76]} to={[-95, 76]} width={7} y={0.08} color="#d6cfc4" map={stoneTex} />

        {/* WNW walkway between 小学部教学楼 and 报告厅 */}
        <RoadSegment from={[-16, -8]} to={[-72, -32]} width={6.5} y={0.08} color="#d6cfc4" map={stoneTex} />

        {/* North avenue from 中心花坛 past 小学部教学楼 & 三角中庭楼 */}
        <RoadSegment from={[0, -20]} to={[14, -108]} width={8} y={0.08} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={[14, -108]} to={[34, -172]} width={7.5} y={0.08} color="#d6cfc4" map={stoneTex} />

        {/* NW fork behind 小学部教学楼, 初中部食堂, 竹苑 & 梅苑 */}
        <RoadSegment from={[14, -108]} to={[-28, -138]} width={7} y={0.08} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={[-28, -138]} to={[-46, -212]} width={6.5} y={0.08} color="#d6cfc4" map={stoneTex} />

        {/* 4. YELLOW LINES: East perimeter road past 桂苑, 松苑 & 初中部北侧附楼 */}
        <RoadSegment from={[45, -135]} to={[86, -82]} width={6.5} y={0.07} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={[86, -82]} to={[92, 62]} width={7} y={0.07} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={[92, 62]} to={[125, 118]} width={6.5} y={0.07} color="#d6cfc4" map={stoneTex} />

        {/* 太子湖北路 (Taizihu N Rd - South Boundary) */}
        <mesh position={[-80, 0.04, 154]} receiveShadow>
          <boxGeometry args={[620, 0.05, 20]} />
          <meshStandardMaterial map={asphaltTex} color="#474d57" roughness={0.88} />
        </mesh>

        {/* 东风大道 (Dongfeng Blvd - West Boundary) */}
        <mesh position={[-346, 0.04, -40]} receiveShadow>
          <boxGeometry args={[24, 0.05, 560]} />
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

      {/* ==================== 西北门 · 校园主入口 (SW Main Gatehouse) ==================== */}
      <group position={[-318, 0, 112]}>
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[24, 0.05, 22]} />
          <meshStandardMaterial map={asphaltTex} color="#434954" roughness={0.85} />
        </mesh>
        {[-6, -3, 0, 3, 6].map((dz, i) => (
          <mesh key={i} position={[-6, 0.1, dz]} receiveShadow>
            <boxGeometry args={[3.2, 0.02, 1.2]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#facc15' : '#e2e8f0'} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 2.4, -8.5]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 4.8, 2.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.4, 8.5]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 4.8, 2.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh position={[-1.12, 2.4, -8.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 3.6]} />
          <meshStandardMaterial map={plaqueLeft} roughness={0.4} />
        </mesh>
        <mesh position={[-1.12, 2.4, 8.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 3.6]} />
          <meshStandardMaterial map={plaqueRight} roughness={0.4} />
        </mesh>
        <mesh position={[2.5, 1.6, -11.5]} castShadow receiveShadow>
          <boxGeometry args={[5.5, 3.2, 3.6]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.1, -4.2]} castShadow>
          <boxGeometry args={[0.25, 2.2, 6.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.1, 4.2]} castShadow>
          <boxGeometry args={[0.25, 2.2, 6.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-1.2, 1.3, 0]} rotation={[0.28, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, 5.5]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
