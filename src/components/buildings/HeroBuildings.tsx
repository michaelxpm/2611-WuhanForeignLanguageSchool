import { ThreeEvent } from '@react-three/fiber';
import { BuildingSpec } from '../../data/campusLayout';
import { CourtyardRing, RotundaDrum, WingBlock } from './ArchitecturalKit';

interface HeroBuildingsProps {
  buildings: BuildingSpec[];
  selectedId: string | null;
  editMode: boolean;
  onSelect: (spec: BuildingSpec) => void;
  onStartDrag: (kind: 'building' | 'road' | 'tree', id: string, e: ThreeEvent<PointerEvent>) => void;
}

function findSpec(buildings: BuildingSpec[], id: string): BuildingSpec {
  return buildings.find((b) => b.id === id)!;
}

export function HeroBuildings({ buildings, editMode, onSelect, onStartDrag }: HeroBuildingsProps) {
  const bindEvents = (spec: BuildingSpec) => ({
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(spec);
    },
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (!editMode) return;
      e.stopPropagation();
      onSelect(spec);
      onStartDrag('building', spec.id, e);
    },
  });
  const middleMain = findSpec(buildings, 'middle-school-main');
  const middleAnnex = findSpec(buildings, 'middle-school-annex');
  const elemTeaching = findSpec(buildings, 'elementary-teaching');
  const auditorium = findSpec(buildings, 'auditorium');
  const triAtrium = findSpec(buildings, 'triangular-atrium');
  const guiyuan = findSpec(buildings, 'guiyuan');
  const songyuan = findSpec(buildings, 'songyuan');

  return (
    <group>
      {/* ==================== 1. 初中部 · 初中教学楼 + 圆柱报告厅 ==================== */}
      <group
        position={middleMain.position}
        rotation={[0, middleMain.rotationY, 0]}
        {...bindEvents(middleMain)}
      >
        <WingBlock
          width={110}
          height={18}
          depth={24}
          stories={5}
          wallColor="#edf0f5"
          roofColor="#384250"
          roofHeight={3.2}
          windowCols={24}
        />
        {Array.from({ length: 18 }, (_, i) => (
          <mesh key={i} position={[-46 + i * 5.4, 20.6, 0]} castShadow>
            <boxGeometry args={[3.5, 1.1, 6.2]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.12} metalness={0.35} />
          </mesh>
        ))}
        <RotundaDrum
          position={[-58, 0, -20]}
          radius={11.5}
          height={14}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#384250"
        />
        <WingBlock
          position={[-72, 0, -22]}
          rotationY={-0.72}
          width={18}
          height={11}
          depth={11}
          stories={2}
          wallColor="#e2e8f0"
          roofColor="#3f4a59"
          roofHeight={1.8}
          windowCols={6}
        />
      </group>

      {/* 初中部北侧附楼 */}
      <group
        position={middleAnnex.position}
        rotation={[0, middleAnnex.rotationY, 0]}
        {...bindEvents(middleAnnex)}
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

      {/* ==================== 2. 小学部教学楼 ==================== */}
      <group
        position={elemTeaching.position}
        rotation={[0, elemTeaching.rotationY, 0]}
        {...bindEvents(elemTeaching)}
      >
        <CourtyardRing
          width={46}
          depth={46}
          wingThickness={7.8}
          height={15}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#255769"
          courtyardColor="#4f9442"
        />
        <WingBlock
          position={[2, 0, 0]}
          rotationY={Math.PI / 2}
          width={30}
          height={14}
          depth={6.5}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#255769"
          windowCols={8}
        />
        <mesh position={[-8, 11.5, 0]} castShadow>
          <boxGeometry args={[12, 0.5, 26]} />
          <meshStandardMaterial color="#93c5fd" roughness={0.15} metalness={0.25} transparent opacity={0.75} />
        </mesh>
        {[
          [-19, -19],
          [19, -19],
          [-19, 19],
          [19, 19],
        ].map(([tx, tz], idx) => (
          <mesh key={idx} position={[tx, 19.5, tz]} castShadow>
            <coneGeometry args={[2.8, 4.5, 4]} />
            <meshStandardMaterial color="#255769" roughness={0.65} />
          </mesh>
        ))}
        <WingBlock
          position={[31, 0, -24]}
          rotationY={0}
          width={18}
          height={13}
          depth={24}
          stories={3}
          wallColor="#f1f5f9"
          roofColor="#384250"
          roofHeight={2.2}
          windowCols={8}
        />
      </group>

      {/* ==================== 3. 报告厅与艺术圆楼 ==================== */}
      <group
        position={auditorium.position}
        rotation={[0, auditorium.rotationY, 0]}
        {...bindEvents(auditorium)}
      >
        <WingBlock
          position={[-12, 0, -4]}
          width={24}
          height={12.5}
          depth={15}
          stories={3}
          wallColor="#ede9e3"
          roofColor="#84523b"
          roofHeight={2.5}
          windowCols={8}
        />
        <RotundaDrum
          position={[11, 0, 8]}
          radius={9.0}
          height={12.5}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#384250"
        />
        <CourtyardRing
          position={[6, 0, -8]}
          width={20}
          depth={16}
          wingThickness={4.5}
          height={10.5}
          stories={3}
          wallColor="#e2e8f0"
          roofColor="#3f4a59"
          courtyardColor="#64748b"
        />
      </group>

      {/* ==================== 4. 东侧三角中庭楼 (3-Wing Parametric Triangle + Central Atrium Drum) ==================== */}
      <group
        position={triAtrium.position}
        rotation={[0, triAtrium.rotationY, 0]}
        {...bindEvents(triAtrium)}
      >
        {/* East Wing (N-S) */}
        <WingBlock
          position={[22, 0, -5]}
          rotationY={Math.PI / 2}
          width={48}
          height={15}
          depth={10}
          stories={4}
          wallColor="#e5e7eb"
          roofColor="#475569"
          roofHeight={2.2}
          windowCols={14}
        />
        {/* NW Diagonal Wing */}
        <WingBlock
          position={[-5, 0, -16]}
          rotationY={0.48}
          width={56}
          height={15}
          depth={10}
          stories={4}
          wallColor="#e5e7eb"
          roofColor="#475569"
          roofHeight={2.2}
          windowCols={16}
        />
        {/* SW Diagonal Wing */}
        <WingBlock
          position={[-5, 0, 10]}
          rotationY={-0.36}
          width={54}
          height={15}
          depth={10}
          stories={4}
          wallColor="#e5e7eb"
          roofColor="#475569"
          roofHeight={2.2}
          windowCols={16}
        />
        {/* Central Circular Atrium Rotunda */}
        <RotundaDrum
          position={[6, 0, -3]}
          radius={9.5}
          height={14}
          stories={4}
          wallColor="#cbd5e1"
          roofColor="#334155"
        />
      </group>

      {/* ==================== 5. 桂苑 & 松苑 ==================== */}
      <group
        position={guiyuan.position}
        rotation={[0, guiyuan.rotationY, 0]}
        {...bindEvents(guiyuan)}
      >
        <CourtyardRing
          width={34}
          depth={30}
          wingThickness={7.2}
          height={15}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#384250"
        />
      </group>

      <group
        position={songyuan.position}
        rotation={[0, songyuan.rotationY, 0]}
        {...bindEvents(songyuan)}
      >
        <CourtyardRing
          width={34}
          depth={30}
          wingThickness={7.2}
          height={15}
          stories={4}
          wallColor="#f1f5f9"
          roofColor="#384250"
        />
      </group>
    </group>
  );
}
