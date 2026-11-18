import { useMemo } from 'react';
import { pxToWorld } from '../data/campusLayout';
import { WingBlock } from './buildings/ArchitecturalKit';

function StreetLamp({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 6.8, 8]} />
        <meshStandardMaterial color="#4a5556" roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0.9, 6.7, 0]} castShadow>
        <boxGeometry args={[1.8, 0.11, 0.13]} />
        <meshStandardMaterial color="#4a5556" roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[1.65, 6.62, 0]}>
        <boxGeometry args={[0.72, 0.14, 0.42]} />
        <meshStandardMaterial color="#f0e4c5" emissive="#fef3c7" emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
    </group>
  );
}

function StonePlanter({ position, width = 5.5, rotationY = 0 }: { position: [number, number, number]; width?: number; rotationY?: number }) {
  const shrubColors = ['#386b43', '#4d8251', '#638b54', '#46734a'];
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.76, 1.8]} />
        <meshStandardMaterial color="#c3c0b0" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[width - 0.35, 0.08, 1.45]} />
        <meshStandardMaterial color="#79694c" roughness={0.95} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const sx = -width / 2 + 0.55 + i * ((width - 1.1) / 5);
        return (
          <mesh key={i} position={[sx, 1.15, 0]} scale={[1, 0.68, 1]} castShadow>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color={shrubColors[i % shrubColors.length]} roughness={0.86} />
          </mesh>
        );
      })}
    </group>
  );
}

function CampusBench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[2.4, 0.12, 0.6]} />
        <meshStandardMaterial color="#8c6950" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.82, -0.25]} castShadow>
        <boxGeometry args={[2.4, 0.42, 0.1]} />
        <meshStandardMaterial color="#8c6950" roughness={0.82} />
      </mesh>
      {[-0.95, 0.95].map((dx, i) => (
        <mesh key={i} position={[dx, 0.26, 0]} castShadow>
          <boxGeometry args={[0.12, 0.52, 0.54]} />
          <meshStandardMaterial color="#4a5556" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function CveStreetscape() {
  const lamps = useMemo(() => {
    const list: { pos: [number, number, number]; rot: number }[] = [];
    for (let px = 225; px <= 585; px += 45) {
      const [x1, z1] = pxToWorld(px, 536);
      const [x2, z2] = pxToWorld(px, 552);
      list.push({ pos: [x1, 0, z1], rot: -Math.PI / 2 });
      list.push({ pos: [x2, 0, z2], rot: Math.PI / 2 });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      list.push({ pos: [Math.cos(a) * 23.5, 0, Math.sin(a) * 23.5], rot: -a + Math.PI });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Gooseneck Street Lamps */}
      {lamps.map((l, i) => (
        <StreetLamp key={`lamp-${i}`} position={l.pos} rotationY={l.rot} />
      ))}

      {/* Raised Stone Planters around Main Plaza & Roundabout */}
      <StonePlanter position={[-68, 0, 58]} width={6} />
      <StonePlanter position={[-32, 0, 58]} width={6} />
      <StonePlanter position={[-18, 0, -45]} width={5.5} />
      <StonePlanter position={[18, 0, -45]} width={5.5} />

      {/* Campus Benches around Roundabout */}
      <CampusBench position={[-18, 0, 14]} rotationY={0.7} />
      <CampusBench position={[18, 0, 14]} rotationY={-0.7} />
      <CampusBench position={[-18, 0, -14]} rotationY={2.4} />
      <CampusBench position={[18, 0, -14]} rotationY={-2.4} />

      {/* Bollards at Main Plaza Pedestrian Entry */}
      {[-60, -56, -52, -48, -44].map((bx, i) => (
        <mesh key={`bol-${i}`} position={[bx, 0.45, 72]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.9, 8]} />
          <meshStandardMaterial color="#4a5556" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}

      {/* ==================== REALISTIC OFF-CAMPUS NEIGHBORHOODS (Matched to Satellite Map!) ==================== */}

      {/* 1. South of 太子湖北路 (Z = 164..225): Blue-roofed commercial strip + 新民花园 terracotta villas */}
      <group>
        <WingBlock
          position={[45, 0, 166]}
          width={96}
          height={9}
          depth={16}
          stories={2}
          wallColor="#e2e8f0"
          roofColor="#2563eb"
          roofHeight={1.8}
          windowCols={18}
        />
        {[-15, 35, 85].map((vx, i) => (
          <WingBlock
            key={`villa1-${i}`}
            position={[vx, 0, 196]}
            width={38}
            height={14}
            depth={14}
            stories={4}
            wallColor="#ede5d8"
            roofColor="#a34836"
            roofHeight={2.4}
            windowCols={10}
          />
        ))}
        {[-15, 35, 85].map((vx, i) => (
          <WingBlock
            key={`villa2-${i}`}
            position={[vx, 0, 224]}
            width={38}
            height={14}
            depth={14}
            stories={4}
            wallColor="#ede5d8"
            roofColor="#a34836"
            roofHeight={2.4}
            windowCols={10}
          />
        ))}

        {/* Sofitel / 奥林花园 Towers (South-West of 太子湖北路) */}
        <WingBlock
          position={[-135, 0, 178]}
          width={48}
          height={24}
          depth={22}
          stories={6}
          wallColor="#dcd7cc"
          roofColor="#475569"
          roofType="flat"
          windowCols={12}
        />
        <WingBlock
          position={[-225, 0, 188]}
          width={38}
          height={28}
          depth={20}
          stories={7}
          wallColor="#e2e8f0"
          roofColor="#334155"
          roofHeight={2.2}
          windowCols={10}
        />
        <WingBlock
          position={[-315, 0, 185]}
          width={34}
          height={22}
          depth={18}
          stories={6}
          wallColor="#e5e0d5"
          roofColor="#4b5563"
          roofType="flat"
          windowCols={9}
        />
      </group>

      {/* 2. North-West across road (金桥·太子湖1号 angled residential blocks, cleanly North of Stadium) */}
      <group>
        {[
          { x: -375, z: -95, rot: 0.55, h: 24, s: 6 },
          { x: -315, z: -125, rot: 0.55, h: 26, s: 7 },
          { x: -255, z: -155, rot: 0.55, h: 24, s: 6 },
          { x: -345, z: -175, rot: 0.55, h: 28, s: 7 },
          { x: -275, z: -205, rot: 0.55, h: 26, s: 7 },
        ].map((b, i) => (
          <WingBlock
            key={`nw-res-${i}`}
            position={[b.x, 0, b.z]}
            rotationY={b.rot}
            width={44}
            height={b.h}
            depth={15}
            stories={b.s}
            wallColor="#e2e8f0"
            roofColor="#3b4452"
            roofHeight={2.0}
            windowCols={11}
          />
        ))}
      </group>

      {/* 3. West of 东风大道高架桥 (X = -530..-560, cleanly behind the viaduct at X = -478!) */}
      <group>
        {[-160, -75, 10, 95, 175].map((wz, i) => (
          <WingBlock
            key={`west-tower-${i}`}
            position={[-535 - (i % 2) * 28, 0, wz]}
            rotationY={Math.PI / 2}
            width={42}
            height={26 + (i % 3) * 6}
            depth={18}
            stories={7 + (i % 2)}
            wallColor={i % 2 === 0 ? '#e5e7eb' : '#dfd9ce'}
            roofColor="#334155"
            roofHeight={2.0}
            windowCols={11}
          />
        ))}
      </group>
    </group>
  );
}
