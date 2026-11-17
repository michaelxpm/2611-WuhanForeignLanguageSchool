import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { pxPos, pxToWorld } from '../data/campusLayout';
import {
  getAsphaltTexture,
  getBrickWalkwayTexture,
  getGrassTexture,
  getStonePavingTexture,
  getVerticalPlaqueTexture,
  getWaterNormalTexture,
} from '../materials/proceduralTextures';

const LOTUS_CLUSTERS: { px: number; py: number; radius: number }[] = [
  { px: 548, py: 108, radius: 16 },
  { px: 542, py: 232, radius: 16 },
  { px: 615, py: 250, radius: 10 },
  { px: 590, py: 35, radius: 18 },
  { px: 975, py: 105, radius: 18 },
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
      <boxGeometry args={[length + width * 0.25, 0.04, width]} />
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

  // Triangular lawn (三角绿地, bounded by top road py=442, left road px=632, and diagonal (738,446)->(668,512))
  // Note: ShapeGeometry is in XY plane; rotateX(-Math.PI/2) maps +Y_shape -> -Z_world!
  const triLawnGeo = useMemo(() => {
    const [x1, z1] = pxToWorld(640, 449);
    const [x2, z2] = pxToWorld(722, 449);
    const [x3, z3] = pxToWorld(662, 506);
    const [x4, z4] = pxToWorld(640, 506);
    const shape = new THREE.Shape();
    shape.moveTo(x1, -z1);
    shape.lineTo(x2, -z2);
    shape.lineTo(x3, -z3);
    shape.lineTo(x4, -z4);
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Radial fan plaza rings (px=770, py=430, outer radius = 115px = 75m)
  const thetaStart = -2.08; // (px=720, py=520)
  const thetaLength = 2.71; // up to +0.63 rad (px=855, py=368)
  const ringRadii = [23, 36, 49, 62, 75];

  const fanSpokes: [number, number][] = [
    pxToWorld(855, 368),
    pxToWorld(884, 430),
    pxToWorld(865, 495),
    pxToWorld(805, 535),
    pxToWorld(720, 520),
  ];

  return (
    <group>
      {/* Base Earth / Campus Lawn (strictly at y = 0.00) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.0, -45]} receiveShadow>
        <planeGeometry args={[980, 780]} />
        <meshStandardMaterial map={grassTex} color="#7ab55c" roughness={0.94} />
      </mesh>

      {/* ==================== 北太子湖 (North Taizihu Lake, px=500..668, py=0..305) ==================== */}
      <group>
        {/* Main lake bay west of 小操场 and north of 寻真园 */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={pxPos(584, 150, 0.02)}
          receiveShadow
        >
          <planeGeometry args={[112, 198]} />
          <meshStandardMaterial
            ref={waterRef}
            color="#1c474d"
            roughness={0.14}
            metalness={0.28}
            normalMap={waterNormalTex}
            normalScale={new THREE.Vector2(0.35, 0.35)}
          />
        </mesh>
        {/* Northern lake extension wrapping around the north shore */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={pxPos(740, 12, 0.02)}
          receiveShadow
        >
          <planeGeometry args={[340, 55]} />
          <meshStandardMaterial
            color="#1c474d"
            roughness={0.14}
            metalness={0.28}
            normalMap={waterNormalTex}
            normalScale={new THREE.Vector2(0.35, 0.35)}
          />
        </mesh>

        {/* Circular Lotus Leaf Clusters (荷叶群) */}
        {LOTUS_CLUSTERS.map((cluster, idx) => {
          const [lx, lz] = pxToWorld(cluster.px, cluster.py);
          return (
            <mesh
              key={idx}
              rotation={[-Math.PI / 2, 0, idx * 0.7]}
              position={[lx, 0.04, lz]}
              receiveShadow
            >
              <circleGeometry args={[cluster.radius, 24]} />
              <meshStandardMaterial color="#4e8c3f" roughness={0.85} />
            </mesh>
          );
        })}

        {/* Lakeside Walking Path along North & NW shore */}
        <RoadSegment from={pxToWorld(668, 295)} to={pxToWorld(698, 95)} width={3.5} y={0.07} color="#b87356" map={brickTex} />
        <RoadSegment from={pxToWorld(698, 95)} to={pxToWorld(755, 34)} width={3.5} y={0.07} color="#b87356" map={brickTex} />
        <RoadSegment from={pxToWorld(755, 34)} to={pxToWorld(915, 34)} width={3.5} y={0.07} color="#b87356" map={brickTex} />
      </group>

      {/* ==================== 中心花坛 (Central Roundabout, px=770, py=430) ==================== */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
          <ringGeometry args={[14.2, 23.5, 64]} />
          <meshStandardMaterial map={stoneTex} color="#d6cfc4" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.24, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[14.3, 14.5, 0.4, 48]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.45, 0]} receiveShadow>
          <circleGeometry args={[14.0, 48]} />
          <meshStandardMaterial map={grassTex} color="#4d943c" roughness={0.92} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.48, 0]} receiveShadow>
          <ringGeometry args={[4.2, 5.8, 36]} />
          <meshStandardMaterial color="#be123c" roughness={0.85} />
        </mesh>
      </group>

      {/* ==================== 扇形广场 (Radial Fan Plaza, r = 23..75m) ==================== */}
      <group position={[0, 0, 0]}>
        {ringRadii.slice(0, -1).map((r, i) => (
          <mesh
            key={`fan-grass-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.04 + i * 0.01, 0]}
            receiveShadow
          >
            <ringGeometry args={[r + 1.1, ringRadii[i + 1] - 1.1, 48, 1, thetaStart, thetaLength]} />
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
            position={[0, 0.08 + i * 0.008, 0]}
            receiveShadow
          >
            <ringGeometry args={[r - 1.1, r + 1.1, 48, 1, thetaStart, thetaLength]} />
            <meshStandardMaterial map={brickTex} color="#b5674c" roughness={0.85} />
          </mesh>
        ))}

        {fanSpokes.map((endPt, i) => {
          const angle = Math.atan2(endPt[1], endPt[0]);
          const startPt: [number, number] = [Math.cos(angle) * 23, Math.sin(angle) * 23];
          return (
            <RoadSegment
              key={`spoke-${i}`}
              from={startPt}
              to={endPt}
              width={2.6}
              y={0.12}
              color="#b5674c"
              map={brickTex}
            />
          );
        })}
      </group>

      {/* ==================== MAIN ENTRANCE PLAZA, FOUNTAIN PARTERRE & TRIANGULAR LAWN ==================== */}
      <group>
        {/* Triangular lawn (三角绿地) between X=-86..-60, Z=+13..+53 */}
        <mesh geometry={triLawnGeo} position={[0, 0.09, 0]} receiveShadow>
          <meshStandardMaterial map={grassTex} color="#53963e" roughness={0.92} />
        </mesh>

        {/* Grand stone-paved square (px=604..692, py=505..595 -> center px=648, py=550) */}
        <mesh position={pxPos(648, 550, 0.07)} receiveShadow>
          <boxGeometry args={[58, 0.04, 58]} />
          <meshStandardMaterial map={stoneTex} color="#d2cbc0" roughness={0.84} />
        </mesh>

        {/* Formal Circular Fountain Parterre (px=558, py=580 -> cleanly East of the 8 courts) */}
        <group position={pxPos(558, 580, 0.06)}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[38, 30]} />
            <meshStandardMaterial map={grassTex} color="#589643" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[38, 0.02, 2.8]} />
            <meshStandardMaterial map={stoneTex} color="#ded8ce" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[2.8, 0.02, 30]} />
            <meshStandardMaterial map={stoneTex} color="#ded8ce" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <cylinderGeometry args={[7.5, 7.8, 0.3, 36]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[6.4, 6.4, 0.08, 36]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.2} />
          </mesh>
        </group>
      </group>

      {/* ==================== 寻真园 · 种植区 (px=502..620, py=342..532) ==================== */}
      <group position={pxPos(561, 437, 0.04)}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[76, 122]} />
          <meshStandardMaterial map={grassTex} color="#5da346" roughness={0.93} />
        </mesh>
      </group>
      {/* Stepped horizontal white garden path through 寻真园 (py=446 -> py=436) */}
      <RoadSegment from={pxToWorld(482, 446)} to={pxToWorld(548, 446)} width={3.0} y={0.08} color="#e2ddd5" map={stoneTex} />
      <RoadSegment from={pxToWorld(548, 446)} to={pxToWorld(548, 436)} width={3.0} y={0.08} color="#e2ddd5" map={stoneTex} />
      <RoadSegment from={pxToWorld(548, 436)} to={pxToWorld(632, 436)} width={3.0} y={0.08} color="#e2ddd5" map={stoneTex} />
      {/* Southern vertical path in 寻真园 */}
      <RoadSegment from={pxToWorld(602, 495)} to={pxToWorld(602, 544)} width={3.0} y={0.08} color="#e2ddd5" map={stoneTex} />

      {/* ==================== SATELLITE-CALIBRATED CAMPUS ROAD NETWORK ==================== */}
      <group>
        {/* 1. RED LINE: Main Entrance Pedestrian Avenue (py=544, cleanly between Stadium py<=515 and Courts py>=555) */}
        <RoadSegment from={pxToWorld(195, 544)} to={pxToWorld(610, 544)} width={7.5} y={0.08} color="#ded8ce" map={stoneTex} />

        {/* 2. BLUE LINE: Vehicle Loop around Stadium (West curve -> North of Grandstand py=345 -> N-S avenue px=482) */}
        <RoadSegment from={pxToWorld(195, 544)} to={pxToWorld(166, 488)} width={6.0} y={0.07} color="#cfd6df" map={stoneTex} />
        <RoadSegment from={pxToWorld(166, 488)} to={pxToWorld(166, 396)} width={6.0} y={0.07} color="#cfd6df" map={stoneTex} />
        <RoadSegment from={pxToWorld(166, 396)} to={pxToWorld(215, 345)} width={6.0} y={0.07} color="#cfd6df" map={stoneTex} />
        <RoadSegment from={pxToWorld(215, 345)} to={pxToWorld(482, 345)} width={7.0} y={0.07} color="#cfd6df" map={stoneTex} />
        <RoadSegment from={pxToWorld(482, 345)} to={pxToWorld(482, 544)} width={9.0} y={0.07} color="#cfd6df" map={stoneTex} />

        {/* 3. TRANSITION ZONE & BLACK LINES around 中心花坛 */}
        {/* N-S Avenue at px=632 (east of 寻真园, leading into Main Entrance Stone Plaza) */}
        <RoadSegment from={pxToWorld(632, 395)} to={pxToWorld(632, 520)} width={8.0} y={0.08} color="#d6cfc4" map={stoneTex} />
        {/* E-W Avenue from px=632 to 中心花坛 */}
        <RoadSegment from={pxToWorld(632, 442)} to={pxToWorld(736, 442)} width={8.0} y={0.09} color="#d6cfc4" map={stoneTex} />
        {/* Diagonal Avenue (hypotenuse of Triangular Lawn) from 中心花坛 SW to Main Plaza */}
        <RoadSegment from={pxToWorld(738, 446)} to={pxToWorld(668, 512)} width={8.0} y={0.09} color="#d6cfc4" map={stoneTex} />

        {/* NW Walkway from 中心花坛 between 小学部教学楼 and 报告厅 */}
        <RoadSegment from={pxToWorld(745, 412)} to={pxToWorld(708, 355)} width={6.5} y={0.08} color="#d6cfc4" map={stoneTex} />

        {/* NNE Avenue from 中心花坛 between 小学部教学楼 and 东侧三角中庭楼 */}
        <RoadSegment from={pxToWorld(788, 400)} to={pxToWorld(822, 355)} width={7.5} y={0.08} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={pxToWorld(822, 355)} to={pxToWorld(852, 290)} width={7.5} y={0.08} color="#d6cfc4" map={stoneTex} />

        {/* North Zone Roads (between 梅苑/竹苑 px=790 and 小学部食堂/北翼楼 px=876) */}
        <RoadSegment from={pxToWorld(832, 270)} to={pxToWorld(832, 75)} width={6.5} y={0.08} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={pxToWorld(852, 290)} to={pxToWorld(832, 270)} width={6.5} y={0.08} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={pxToWorld(832, 265)} to={pxToWorld(758, 265)} width={6.0} y={0.08} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={pxToWorld(758, 265)} to={pxToWorld(758, 120)} width={5.5} y={0.08} color="#d6cfc4" map={stoneTex} />

        {/* 4. YELLOW LINES: East Perimeter Road (cleanly at px=888 between 扇形广场/附楼 and 桂苑/松苑) */}
        <RoadSegment from={pxToWorld(822, 355)} to={pxToWorld(888, 415)} width={7.0} y={0.07} color="#d6cfc4" map={stoneTex} />
        <RoadSegment from={pxToWorld(888, 415)} to={pxToWorld(888, 605)} width={7.0} y={0.07} color="#d6cfc4" map={stoneTex} />

        {/* 太子湖北路 (Taizihu N Rd - South Boundary, py=625) */}
        <mesh position={pxPos(550, 628, 0.04)} receiveShadow>
          <boxGeometry args={[720, 0.05, 22]} />
          <meshStandardMaterial map={asphaltTex} color="#474d57" roughness={0.88} />
        </mesh>

        {/* 东风大道 (Dongfeng Blvd - West Boundary, px=95) */}
        <mesh position={pxPos(95, 340, 0.04)} receiveShadow>
          <boxGeometry args={[24, 0.05, 580]} />
          <meshStandardMaterial map={asphaltTex} color="#474d57" roughness={0.88} />
        </mesh>

        {/* 东风大道高架桥 (Dongfeng Blvd Elevated Viaduct, px=35) */}
        <group position={pxPos(35, 340, 0)}>
          <mesh position={[0, 9.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[22, 1.4, 580]} />
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

      {/* ==================== 西北门 · 校园主入口 (px=195, py=544) ==================== */}
      <group position={pxPos(195, 544, 0)}>
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[20, 0.05, 18]} />
          <meshStandardMaterial map={asphaltTex} color="#434954" roughness={0.85} />
        </mesh>
        {[-4.5, -1.5, 1.5, 4.5].map((dz, i) => (
          <mesh key={i} position={[-5, 0.1, dz]} receiveShadow>
            <boxGeometry args={[3.0, 0.02, 1.1]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#facc15' : '#e2e8f0'} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 2.4, -6.5]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 4.8, 2.0]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.4, 6.5]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 4.8, 2.0]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh position={[-1.02, 2.4, -6.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 3.6]} />
          <meshStandardMaterial map={plaqueLeft} roughness={0.4} />
        </mesh>
        <mesh position={[-1.02, 2.4, 6.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 3.6]} />
          <meshStandardMaterial map={plaqueRight} roughness={0.4} />
        </mesh>
        <mesh position={[2.5, 1.6, -9.2]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 3.2, 3.2]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.1, -3.2]} castShadow>
          <boxGeometry args={[0.25, 2.2, 4.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.1, 3.2]} castShadow>
          <boxGeometry args={[0.25, 2.2, 4.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-1.2, 1.3, 0]} rotation={[0.28, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, 4.8]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
