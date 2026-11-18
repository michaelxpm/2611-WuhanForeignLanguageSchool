import { useMemo } from 'react';
import { pxToWorld } from '../data/campusLayout';

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
  // Street lamps along main pedestrian avenue & roundabout
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

  // Distant muted urban context skyline (across Taizihu N Rd & Dongfeng Blvd)
  const distantBuildings = useMemo(() => {
    const blocks: { x: number; z: number; w: number; d: number; h: number; color: string }[] = [];
    const palette = ['#94a7a6', '#9aa9a4', '#a8b0a9', '#8f9e9d'];
    // South of Taizihu N Rd (Z = 185..255)
    for (let i = 0; i < 16; i++) {
      const x = -340 + i * 32;
      const z = 195 + (i % 3) * 22;
      const h = 18 + ((i * 13) % 26);
      blocks.push({ x, z, w: 22, d: 16, h, color: palette[i % palette.length] });
    }
    // West of Dongfeng Blvd (X = -465..-430)
    for (let i = 0; i < 10; i++) {
      const z = -220 + i * 38;
      const x = -445 - (i % 2) * 24;
      const h = 24 + ((i * 17) % 34);
      blocks.push({ x, z, w: 18, d: 24, h, color: palette[(i + 1) % palette.length] });
    }
    return blocks;
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

      {/* Campus Benches around Roundabout & Lakeside */}
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

      {/* Distant Muted Urban Context Skyline */}
      {distantBuildings.map((b, i) => (
        <mesh key={`dist-${i}`} position={[b.x, b.h / 2, b.z]} receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} roughness={0.88} />
        </mesh>
      ))}
    </group>
  );
}
