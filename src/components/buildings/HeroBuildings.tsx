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

  // Triangular Atrium ExtrudeGeometry with circular center hole (calibrated to px=885..995, py=315..400)
  // Note: ExtrudeGeometry is in XY plane, then rotateX(-Math.PI/2) maps +Y_shape -> -Z_world (North)!
  const triGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-40, -14); // West tip (world dx=-40, dz=+14)
    shape.lineTo(28, 32);   // NE corner (world dx=+28, dz=-32)
    shape.lineTo(28, -20);  // SE corner (world dx=+28, dz=+20)
    shape.closePath();

    const hole = new THREE.Path();
    hole.absarc(5, 0, 8.0, 0, Math.PI * 2, true);
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
        {/* Main 5-story linear wing (px=705..875 -> 110m wide, py=555..595 -> 25m deep) */}
        <WingBlock
          width={110}
          height={18}
          depth={24}
          stories={5}
          wallColor="#edf0f5"
          roofColor="#2b323c"
          roofHeight={3.2}
          windowCols={24}
        />
        {/* Signature central skylight spine along the ridge */}
        {Array.from({ length: 18 }, (_, i) => (
          <mesh key={i} position={[-46 + i * 5.4, 20.6, 0]} castShadow>
            <boxGeometry args={[3.5, 1.1, 6.2]} />
            <meshStandardMaterial color="#7dd3fc" roughness={0.12} metalness={0.35} />
          </mesh>
        ))}
        {/* Attached NW Cylindrical Rotunda Pavilion (px=696, py=542 -> dx=-60, dz=-21) */}
        <RotundaDrum
          position={[-58, 0, -20]}
          radius={11.5}
          height={14}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#2b323c"
        />
        {/* Angled link wing on NW side of Rotunda */}
        <WingBlock
          position={[-72, 0, -22]}
          rotationY={-0.72}
          width={18}
          height={11}
          depth={11}
          stories={2}
          wallColor="#e2e8f0"
          roofColor="#374151"
          roofHeight={1.8}
          windowCols={6}
        />
      </group>

      {/* 初中部北侧附楼 (px=822..865, py=492..548 -> N-S oriented block at NE of 初中部) */}
      <group
        position={middleAnnex.position}
        rotation={[0, middleAnnex.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(middleAnnex);
        }}
      >
        <WingBlock
          width={24}
          height={13}
          depth={36}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#64748b"
          roofType="flat"
          windowCols={10}
        />
        <mesh position={[0, 14.2, -4]} castShadow>
          <boxGeometry args={[10, 2.2, 14]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.75} />
        </mesh>
      </group>

      {/* ==================== 2. 小学部教学楼 (px=735..805, py=278..350 -> 46m x 46m) ==================== */}
      <group
        position={elemTeaching.position}
        rotation={[0, elemTeaching.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(elemTeaching);
        }}
      >
        <CourtyardRing
          width={46}
          depth={46}
          wingThickness={7.8}
          height={15}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#1f4e5f"
          courtyardColor="#4f9442"
        />
        {/* Central N-S divider wing creating double courtyard */}
        <WingBlock
          position={[2, 0, 0]}
          rotationY={Math.PI / 2}
          width={30}
          height={14}
          depth={6.5}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#1f4e5f"
          windowCols={8}
        />
        {/* Glass atrium skylight over west inner courtyard */}
        <mesh position={[-8, 11.5, 0]} castShadow>
          <boxGeometry args={[12, 0.5, 26]} />
          <meshStandardMaterial color="#93c5fd" roughness={0.15} metalness={0.25} transparent opacity={0.75} />
        </mesh>
        {/* 4 Pointed corner turret peaks */}
        {[
          [-19, -19],
          [19, -19],
          [-19, 19],
          [19, 19],
        ].map(([tx, tz], idx) => (
          <mesh key={idx} position={[tx, 19.5, tz]} castShadow>
            <coneGeometry args={[2.8, 4.5, 4]} />
            <meshStandardMaterial color="#1f4e5f" roughness={0.65} />
          </mesh>
        ))}
        {/* NE annex wing (px=810..842, py=245..285) */}
        <WingBlock
          position={[31, 0, -24]}
          rotationY={0}
          width={18}
          height={13}
          depth={24}
          stories={3}
          wallColor="#f1f5f9"
          roofColor="#2b323c"
          roofHeight={2.2}
          windowCols={8}
        />
      </group>

      {/* ==================== 3. 报告厅与艺术圆楼 (px=648..722, py=308..375) ==================== */}
      <group
        position={auditorium.position}
        rotation={[0, auditorium.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(auditorium);
        }}
      >
        {/* Terracotta/brown pitched-roof main auditorium hall (NW side) */}
        <WingBlock
          position={[-12, 0, -4]}
          width={24}
          height={12.5}
          depth={15}
          stories={3}
          wallColor="#ede9e3"
          roofColor="#7c4a33"
          roofHeight={2.5}
          windowCols={8}
        />
        {/* Adjacent cylindrical drum building (SE side) */}
        <RotundaDrum
          position={[11, 0, 8]}
          radius={9.0}
          height={12.5}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#2b323c"
        />
        {/* Connecting NE small courtyard wing */}
        <CourtyardRing
          position={[6, 0, -8]}
          width={20}
          depth={16}
          wingThickness={4.5}
          height={10.5}
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
        <mesh position={[5, 16.3, 0]} castShadow>
          <cylinderGeometry args={[8.4, 8.4, 0.8, 32, 1, true]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[5, 16.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[8.0, 32]} />
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
          width={34}
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
          width={34}
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
