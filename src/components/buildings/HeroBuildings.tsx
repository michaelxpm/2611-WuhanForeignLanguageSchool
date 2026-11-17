import { useMemo } from 'react';
import * as THREE from 'three';
import { BUILDINGS, BuildingSpec } from '../../data/campusLayout';
import { getFacadeWindowTexture } from '../../materials/proceduralTextures';
import { CourtyardRing, RotundaDrum, WingBlock } from './ArchitecturalKit';

interface HeroBuildingsProps {
  selectedId: string | null;
  onSelect: (spec: BuildingSpec) => void;
}

function getSpec(id: string): BuildingSpec {
  return BUILDINGS.find((b) => b.id === id)!;
}

export function HeroBuildings({ onSelect }: HeroBuildingsProps) {
  const middleMain = getSpec('middle-school-main');
  const middleAnnex = getSpec('middle-school-annex');
  const elemTeaching = getSpec('elementary-teaching');
  const auditorium = getSpec('auditorium');
  const triAtrium = getSpec('triangular-atrium');
  const guiyuan = getSpec('guiyuan');
  const songyuan = getSpec('songyuan');

  // Triangular Atrium ExtrudeGeometry with circular center hole
  const triGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-26, 20);
    shape.lineTo(28, 12);
    shape.lineTo(14, -24);
    shape.closePath();

    const hole = new THREE.Path();
    hole.absarc(4, 2, 8.2, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 16,
      bevelEnabled: false,
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const triFacadeTex = useMemo(() => getFacadeWindowTexture('#e5e7eb', 4, 14, false), []);

  return (
    <group>
      {/* ==================== 1. 初中部 · 初中教学楼 + 圆柱报告厅 ==================== */}
      <group
        position={middleMain.position}
        rotation={[0, middleMain.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(middleMain);
        }}
      >
        {/* Main 5-story linear wing */}
        <WingBlock
          width={114}
          height={18}
          depth={23}
          stories={5}
          wallColor="#edf0f5"
          roofColor="#2b323c"
          roofHeight={3.2}
          windowCols={24}
        />
        {/* Signature central skylight spine along the ridge */}
        {Array.from({ length: 18 }, (_, i) => (
          <mesh key={i} position={[-48 + i * 5.6, 20.6, 0]} castShadow>
            <boxGeometry args={[3.6, 1.1, 6.2]} />
            <meshStandardMaterial color="#7dd3fc" roughness={0.12} metalness={0.35} />
          </mesh>
        ))}
        {/* Attached NW Cylindrical Rotunda Pavilion */}
        <RotundaDrum
          position={[-64, 0, -10]}
          radius={12.5}
          height={14}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#2b323c"
        />
        {/* Connecting link wing between rotunda and main block */}
        <WingBlock
          position={[-68, 0, -24]}
          rotationY={0.18}
          width={18}
          height={10}
          depth={12}
          stories={2}
          wallColor="#e2e8f0"
          roofColor="#374151"
          roofHeight={1.8}
          windowCols={6}
        />
      </group>

      {/* 初中部北侧附楼 */}
      <group
        position={middleAnnex.position}
        rotation={[0, middleAnnex.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(middleAnnex);
        }}
      >
        <WingBlock
          width={42}
          height={13}
          depth={18}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#64748b"
          roofType="flat"
          windowCols={12}
        />
        {/* Rooftop mechanical penthouse */}
        <mesh position={[6, 14.2, 0]} castShadow>
          <boxGeometry args={[12, 2.2, 7]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.75} />
        </mesh>
      </group>

      {/* ==================== 2. 小学部教学楼 (双内庭院 + 青灰尖顶屋面) ==================== */}
      <group
        position={elemTeaching.position}
        rotation={[0, elemTeaching.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(elemTeaching);
        }}
      >
        <CourtyardRing
          width={64}
          depth={44}
          wingThickness={8.5}
          height={15}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#1f4e5f"
          courtyardColor="#4f9442"
        />
        {/* Central divider wing creating double courtyard */}
        <WingBlock
          position={[4, 0, 0]}
          rotationY={Math.PI / 2}
          width={28}
          height={14}
          depth={7}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#1f4e5f"
          windowCols={8}
        />
        {/* Glass atrium skylight strips over inner courtyards */}
        <mesh position={[-12, 11.5, 0]} castShadow>
          <boxGeometry args={[16, 0.5, 22]} />
          <meshStandardMaterial color="#93c5fd" roughness={0.15} metalness={0.25} transparent opacity={0.75} />
        </mesh>
        {/* 4 Pointed corner turret peaks (castle-style dormers seen in photos) */}
        {[
          [-28, -18],
          [28, -18],
          [-28, 18],
          [28, 18],
        ].map(([tx, tz], idx) => (
          <mesh key={idx} position={[tx, 19.5, tz]} castShadow>
            <coneGeometry args={[3.2, 4.8, 4]} />
            <meshStandardMaterial color="#1f4e5f" roughness={0.65} />
          </mesh>
        ))}
        {/* East angled annex wing */}
        <WingBlock
          position={[41, 0, -6]}
          rotationY={-0.35}
          width={24}
          height={13}
          depth={14}
          stories={3}
          wallColor="#f1f5f9"
          roofColor="#2b323c"
          roofHeight={2.2}
          windowCols={8}
        />
      </group>

      {/* ==================== 3. 报告厅与艺术圆楼 ==================== */}
      <group
        position={auditorium.position}
        rotation={[0, auditorium.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(auditorium);
        }}
      >
        {/* Terracotta/brown pitched-roof main auditorium hall */}
        <WingBlock
          position={[-8, 0, 4]}
          width={28}
          height={13}
          depth={18}
          stories={3}
          wallColor="#ede9e3"
          roofColor="#7c4a33"
          roofHeight={2.6}
          windowCols={10}
        />
        {/* Adjacent cylindrical drum building */}
        <RotundaDrum
          position={[15, 0, 3]}
          radius={10.5}
          height={13}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#2b323c"
        />
        {/* Connecting north courtyard wing */}
        <CourtyardRing
          position={[2, 0, -14]}
          width={32}
          depth={18}
          wingThickness={5.5}
          height={11}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#334155"
          courtyardColor="#64748b"
        />
      </group>

      {/* ==================== 4. 东侧三角中庭楼 ==================== */}
      <group
        position={triAtrium.position}
        rotation={[0, triAtrium.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(triAtrium);
        }}
      >
        <mesh geometry={triGeometry} castShadow receiveShadow>
          <meshStandardMaterial map={triFacadeTex} roughness={0.62} metalness={0.1} />
        </mesh>
        {/* Central atrium glass skylight ring */}
        <mesh position={[4, 16.3, 2]} castShadow>
          <cylinderGeometry args={[8.6, 8.6, 0.8, 32, 1, true]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[4, 16.5, 2]}>
          <circleGeometry args={[8.2, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ==================== 5. 桂苑 & 松苑 ==================== */}
      <group
        position={guiyuan.position}
        rotation={[0, guiyuan.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(guiyuan);
        }}
      >
        <CourtyardRing
          width={32}
          depth={30}
          wingThickness={7.2}
          height={15}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#2d3748"
        />
      </group>

      <group
        position={songyuan.position}
        rotation={[0, songyuan.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(songyuan);
        }}
      >
        <CourtyardRing
          width={32}
          depth={30}
          wingThickness={7.2}
          height={15}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#2d3748"
        />
      </group>
    </group>
  );
}
