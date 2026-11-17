import { useMemo } from 'react';
import * as THREE from 'three';
import { BUILDINGS, BuildingSpec, pxPos } from '../data/campusLayout';
import {
  getAsphaltTexture,
  getCourtTexture,
  getFootballPitchTexture,
  getStadiumTrackTexture,
} from '../materials/proceduralTextures';
import { WingBlock } from './buildings/ArchitecturalKit';

interface AthleticsZoneProps {
  onSelect: (spec: BuildingSpec) => void;
}

function getSpec(id: string): BuildingSpec {
  return BUILDINGS.find((b) => b.id === id)!;
}

/** Creates a stadium-oval (rounded rectangle) flat shape */
function makeTrackShape(straightLen: number, radius: number): THREE.Shape {
  const hs = straightLen / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hs, -radius);
  shape.lineTo(hs, -radius);
  shape.absarc(hs, 0, radius, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-hs, radius);
  shape.absarc(-hs, 0, radius, Math.PI / 2, (Math.PI * 3) / 2, false);
  return shape;
}

function FootballGoal({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Left & Right posts */}
      <mesh position={[-3.66, 1.22, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 2.44, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
      <mesh position={[3.66, 1.22, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 2.44, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 2.44, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 7.45, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
    </group>
  );
}

export function AthleticsZone({ onSelect }: AthleticsZoneProps) {
  const mainStadium = getSpec('main-stadium');
  const smallTrack = getSpec('small-track');

  const pitchTex = useMemo(() => getFootballPitchTexture(), []);
  const trackTex = useMemo(() => getStadiumTrackTexture(), []);
  const redCourtTex = useMemo(() => getCourtTexture('#b94a3e', '#f8fafc'), []);
  const tealCourtTex = useMemo(() => getCourtTexture('#1d6f72', '#f8fafc'), []);
  const asphaltTex = useMemo(() => getAsphaltTexture(6, 4), []);

  // Main 400m track geometry & true stadium-oval white lane lines
  const mainTrackGeo = useMemo(() => {
    const outer = makeTrackShape(84, 42);
    const inner = makeTrackShape(84, 31);
    outer.holes.push(inner);
    const geo = new THREE.ShapeGeometry(outer, 32);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const mainLaneGeos = useMemo(() => {
    return [33.2, 36.2, 39.2].map((r) => {
      const outer = makeTrackShape(84, r + 0.12);
      const inner = makeTrackShape(84, r - 0.12);
      outer.holes.push(inner);
      const geo = new THREE.ShapeGeometry(outer, 32);
      geo.rotateX(-Math.PI / 2);
      return geo;
    });
  }, []);

  // Small 200m track geometry
  const smallTrackGeo = useMemo(() => {
    const outer = makeTrackShape(46, 19);
    const inner = makeTrackShape(46, 13.5);
    outer.holes.push(inner);
    const geo = new THREE.ShapeGeometry(outer, 28);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  return (
    <group>
      {/* ==================== 1. MAIN 400M STADIUM & GRANDSTAND ==================== */}
      <group
        position={mainStadium.position}
        rotation={[0, mainStadium.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(mainStadium);
        }}
      >
        {/* Red EPDM 400m Track (strictly y = 0.14, centered at [0, 0]) */}
        <mesh geometry={mainTrackGeo} position={[0, 0.14, 0]} receiveShadow>
          <meshStandardMaterial map={trackTex} color="#b9483b" roughness={0.84} />
        </mesh>
        {/* True stadium-oval white lane rings (strictly y = 0.16) */}
        {mainLaneGeos.map((geo, i) => (
          <mesh key={i} geometry={geo} position={[0, 0.16, 0]}>
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
        ))}

        {/* Inner Striped Football Pitch (strictly y = 0.18) */}
        <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[104, 62]} />
          <meshStandardMaterial map={pitchTex} roughness={0.9} />
        </mesh>

        {/* Football Goals */}
        <FootballGoal position={[-50, 0.18, 0]} rotationY={Math.PI / 2} />
        <FootballGoal position={[50, 0.18, 0]} rotationY={-Math.PI / 2} />

        {/* North Grandstand / Bleachers + 5-bay Tensile Membrane Canopy */}
        <group position={[0, 0, -54]}>
          {/* Stepped concrete seating tiers */}
          {[0, 1, 2, 3, 4].map((tier) => (
            <mesh key={tier} position={[0, 0.4 + tier * 0.75, -tier * 1.4]} castShadow receiveShadow>
              <boxGeometry args={[62, 0.75, 1.5]} />
              <meshStandardMaterial color={tier % 2 === 0 ? '#cbd5e1' : '#94a3b8'} roughness={0.85} />
            </mesh>
          ))}

          {/* Flanking 2-story locker/equipment wings */}
          <WingBlock
            position={[-43, 0, -4]}
            width={22}
            height={7.5}
            depth={12}
            stories={2}
            wallColor="#e2e8f0"
            roofColor="#334155"
            roofType="flat"
            windowCols={6}
          />
          <WingBlock
            position={[43, 0, -4]}
            width={22}
            height={7.5}
            depth={12}
            stories={2}
            wallColor="#e2e8f0"
            roofColor="#334155"
            roofType="flat"
            windowCols={6}
          />

          {/* 5 White Tensile-Membrane Arched Canopies */}
          {[-24, -12, 0, 12, 24].map((cx, i) => (
            <group key={i} position={[cx, 6.2, -3.5]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.42]} castShadow>
                <cylinderGeometry args={[6.1, 6.1, 14, 20, 1, true, -Math.PI / 2, Math.PI]} />
                <meshStandardMaterial
                  color="#f8fafc"
                  roughness={0.4}
                  metalness={0.05}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Steel support mast */}
              <mesh position={[-5.8, -3, -5.5]} castShadow>
                <cylinderGeometry args={[0.18, 0.22, 7.5, 8]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.35} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Paved Parking Lot East of Grandstand */}
        <group position={[84, 0.05, -56]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[46, 26]} />
            <meshStandardMaterial map={asphaltTex} color="#474d57" roughness={0.88} />
          </mesh>
          {/* Parking bay divider lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[-18 + i * 4, 0.02, -7]} receiveShadow>
              <boxGeometry args={[0.15, 0.02, 5]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.7} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ==================== 2. 小操场 & 小足球场 (SMALL TRACK, px=722, py=180) ==================== */}
      <group
        position={smallTrack.position}
        rotation={[0, Math.PI / 2 - 0.23, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(smallTrack);
        }}
      >
        {/* 200m Red EPDM Track (strictly y = 0.14) */}
        <mesh geometry={smallTrackGeo} position={[0, 0.14, 0]} receiveShadow>
          <meshStandardMaterial map={trackTex} color="#b9483b" roughness={0.84} />
        </mesh>
        {/* Inner Turf Field (strictly y = 0.18) */}
        <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[48, 26]} />
          <meshStandardMaterial map={pitchTex} roughness={0.9} />
        </mesh>
        {/* 小足球场 (Mini Football Turf at North End, strictly y = 0.16) */}
        <mesh position={[-46, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[24, 34]} />
          <meshStandardMaterial map={pitchTex} roughness={0.9} />
        </mesh>
        {/* Multi-use red/teal courts at South End (strictly y = 0.16) */}
        <mesh position={[44, 0.16, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
          <planeGeometry args={[34, 24]} />
          <meshStandardMaterial map={redCourtTex} roughness={0.82} />
        </mesh>
      </group>

      {/* ==================== 3. SOUTH OUTDOOR COURTS STRIP (px=235..485, py=580 -> Z=97.5) ==================== */}
      <group position={pxPos(360, 580, 0.14)}>
        {/* West Teal Tennis Court (px=238 -> dx=-79) */}
        <mesh position={[-79, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28, 30]} />
          <meshStandardMaterial map={tealCourtTex} roughness={0.82} />
        </mesh>
        {/* 6 Red/Teal Basketball Courts (px=278..438 -> dx=-52..+48) */}
        {Array.from({ length: 6 }, (_, i) => {
          const cx = -50 + i * 19.5;
          return (
            <group key={i} position={[cx, 0, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[16, 28]} />
                <meshStandardMaterial map={redCourtTex} roughness={0.82} />
              </mesh>
              {[-13.5, 13.5].map((hz, hi) => (
                <group key={hi} position={[0, 0, hz]}>
                  <mesh position={[0, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.09, 0.11, 3.0, 8]} />
                    <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
                  </mesh>
                  <mesh position={[0, 2.9, hz < 0 ? 0.4 : -0.4]} castShadow>
                    <boxGeometry args={[1.8, 1.05, 0.08]} />
                    <meshStandardMaterial color="#f8fafc" roughness={0.3} />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })}
        {/* East Teal Tennis Court (px=482 -> dx=+79) */}
        <mesh position={[79, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28, 30]} />
          <meshStandardMaterial map={tealCourtTex} roughness={0.82} />
        </mesh>
      </group>
    </group>
  );
}
