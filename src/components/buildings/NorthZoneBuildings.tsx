import { useMemo } from 'react';
import * as THREE from 'three';
import { BUILDINGS, BuildingSpec } from '../../data/campusLayout';
import { getFacadeWindowTexture, getFlagWallTexture } from '../../materials/proceduralTextures';
import { CourtyardRing, WingBlock } from './ArchitecturalKit';

interface NorthZoneBuildingsProps {
  onSelect: (spec: BuildingSpec) => void;
}

function getSpec(id: string): BuildingSpec {
  return BUILDINGS.find((b) => b.id === id)!;
}

export function NorthZoneBuildings({ onSelect }: NorthZoneBuildingsProps) {
  const middleCanteen = getSpec('middle-canteen');
  const zhuyuan = getSpec('zhuyuan');
  const meiyuan = getSpec('meiyuan');
  const elemCanteen = getSpec('elementary-canteen');
  const dormOct = getSpec('dorm-octagonal');
  const dormNorth = getSpec('dorm-north-wing');

  // Crescent / Arc-shaped 初中部食堂 geometry
  const crescentGeo = useMemo(() => {
    const outerR = 46;
    const innerR = 34;
    const startA = -0.62;
    const endA = 0.62;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerR, startA, endA, false);
    shape.absarc(0, 0, innerR, endA, startA, true);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 12,
      bevelEnabled: false,
      curveSegments: 28,
    });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, 38);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 8-wing octagonal ring parameters for 初中部宿舍 · 八角楼
  const octSides = useMemo(() => {
    const r = 15.6;
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return {
        x: Math.sin(angle) * r,
        z: Math.cos(angle) * r,
        rotY: angle,
      };
    });
  }, []);

  const crescentTex = useMemo(() => getFacadeWindowTexture('#e5e7eb', 3, 18, false), []);
  const flagWallTex = useMemo(() => getFlagWallTexture(), []);

  return (
    <group>
      {/* ==================== 1. 初中部食堂 (新月弧形主楼 + 后侧配楼) ==================== */}
      <group
        position={middleCanteen.position}
        rotation={[0, middleCanteen.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(middleCanteen);
        }}
      >
        <mesh geometry={crescentGeo} castShadow receiveShadow>
          <meshStandardMaterial map={crescentTex} roughness={0.62} metalness={0.08} />
        </mesh>
        {/* Dark brown/grey roof cap on crescent */}
        <mesh geometry={crescentGeo} position={[0, 12.1, 0]} scale={[1.01, 0.08, 1.01]} castShadow>
          <meshStandardMaterial color="#4b453f" roughness={0.75} />
        </mesh>
        {/* Rectangular north annex behind crescent */}
        <WingBlock
          position={[8, 0, -14]}
          rotationY={-0.18}
          width={30}
          height={10}
          depth={13}
          stories={2}
          wallColor="#e2e8f0"
          roofColor="#cbd5e1"
          roofType="flat"
          windowCols={10}
        />
      </group>

      {/* ==================== 2. 竹苑 & 梅苑 (拱形顶层窗庭院宿舍) ==================== */}
      <group
        position={zhuyuan.position}
        rotation={[0, zhuyuan.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(zhuyuan);
        }}
      >
        <CourtyardRing
          width={30}
          depth={28}
          wingThickness={6.8}
          height={15}
          stories={4}
          wallColor="#e5e7eb"
          roofColor="#2f3947"
          archedTop={true}
        />
      </group>

      <group
        position={meiyuan.position}
        rotation={[0, meiyuan.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(meiyuan);
        }}
      >
        <CourtyardRing
          width={30}
          depth={28}
          wingThickness={6.8}
          height={15}
          stories={4}
          wallColor="#e5e7eb"
          roofColor="#2f3947"
          archedTop={true}
        />
      </group>

      {/* ==================== 3. 小学部食堂 (大跨度采光天窗屋顶) ==================== */}
      <group
        position={elemCanteen.position}
        rotation={[0, elemCanteen.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(elemCanteen);
        }}
      >
        <WingBlock
          width={42}
          height={11}
          depth={26}
          stories={2}
          wallColor="#f1f5f9"
          roofColor="#cbd5e1"
          roofType="flat"
          windowCols={14}
        />
        {/* Dual raised clerestory skylight monitors */}
        {[-5.5, 5.5].map((dz, i) => (
          <mesh key={i} position={[0, 12.4, dz]} castShadow>
            <boxGeometry args={[36, 1.4, 5.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ==================== 4. 初中部宿舍 · 八角楼 (8-Wing Parametric Octagon) ==================== */}
      <group
        position={dormOct.position}
        rotation={[0, dormOct.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(dormOct);
        }}
      >
        {/* Inner octagonal courtyard lawn */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[12.5, 8]} />
          <meshStandardMaterial color="#5da346" roughness={0.92} />
        </mesh>
        {octSides.map((side, i) => (
          <WingBlock
            key={i}
            position={[side.x, 0, side.z]}
            rotationY={side.rotY}
            width={14.8}
            height={15}
            depth={6.5}
            stories={4}
            wallColor="#e5e7eb"
            roofColor="#2d3748"
            roofHeight={2.4}
            windowCols={6}
            archedTop={true}
          />
        ))}
      </group>

      {/* ==================== 5. 初中部宿舍 · 北翼楼 (L型临湖宿舍) ==================== */}
      <group
        position={dormNorth.position}
        rotation={[0, dormNorth.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(dormNorth);
        }}
      >
        <WingBlock
          position={[0, 0, -8]}
          width={56}
          height={16}
          depth={14}
          stories={4}
          wallColor="#e5e7eb"
          roofColor="#334155"
          windowCols={16}
        />
        <WingBlock
          position={[-20, 0, 8]}
          rotationY={Math.PI / 2}
          width={24}
          height={16}
          depth={14}
          stories={4}
          wallColor="#e5e7eb"
          roofColor="#334155"
          windowCols={8}
        />
        {/* Corner turret accents seen in aerial photos */}
        {[-26, 26].map((tx, i) => (
          <mesh key={i} position={[tx, 20, -8]} castShadow>
            <coneGeometry args={[2.8, 4.2, 4]} />
            <meshStandardMaterial color="#3f6272" roughness={0.68} />
          </mesh>
        ))}
      </group>

      {/* ==================== 6. 小操场升旗台 (Flag-Raising Platform) ==================== */}
      <group position={[-93, 0, -150]} rotation={[0, 0.34, 0]}>
        {/* Raised stone stage & steps */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 0.9, 18]} />
          <meshStandardMaterial color="#d6d0c4" roughness={0.82} />
        </mesh>
        <mesh position={[-2.6, 0.22, 0]} receiveShadow>
          <boxGeometry args={[1.4, 0.44, 18.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
        </mesh>

        {/* Cream stone-clad gabled motto backdrop wall */}
        <mesh position={[1.4, 3.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 5.6, 16.5]} />
          <meshStandardMaterial color="#dfd3be" roughness={0.78} />
        </mesh>
        {/* Front motto plaque face (facing West onto 小操场) */}
        <mesh position={[0.98, 3.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[16, 5.4]} />
          <meshStandardMaterial map={flagWallTex} roughness={0.65} />
        </mesh>

        {/* 3 Silver Flagpoles & Red Flags */}
        {[-3.2, 0, 3.2].map((fz, i) => (
          <group key={i} position={[-0.6, 0.9, fz]}>
            <mesh position={[0, 5.5, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.1, 11, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.25} metalness={0.85} />
            </mesh>
            {/* Red flag */}
            <mesh position={[0, 10.2, 0.85]} castShadow>
              <boxGeometry args={[0.05, 1.1, 1.65]} />
              <meshStandardMaterial color="#dc2626" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
