import { useMemo } from 'react';
import * as THREE from 'three';
import {
  getCveNormalMap,
  getFacadeWindowTexture,
  getRoofRibTexture,
} from '../../materials/proceduralTextures';

interface WingBlockProps {
  position?: [number, number, number];
  rotationY?: number;
  width: number;
  height: number;
  depth: number;
  stories: number;
  wallColor?: string;
  roofColor?: string;
  roofHeight?: number;
  roofType?: 'gable' | 'hip' | 'flat';
  windowCols?: number;
  archedTop?: boolean;
  eaveOverhang?: number;
}

/**
 * Multi-story architectural wing with base plinth, window-band facade,
 * protruding concrete floor-slab ledges, and overhanging pitched or flat roof.
 */
export function WingBlock({
  position = [0, 0, 0],
  rotationY = 0,
  width,
  height,
  depth,
  stories,
  wallColor = '#eef2f6',
  roofColor = '#2f3947',
  roofHeight = 2.8,
  roofType = 'gable',
  windowCols = 10,
  archedTop = false,
  eaveOverhang = 0.7,
}: WingBlockProps) {
  const facadeTex = useMemo(
    () => getFacadeWindowTexture(wallColor, stories, windowCols, archedTop),
    [wallColor, stories, windowCols, archedTop]
  );
  const stuccoNormal = useMemo(() => getCveNormalMap('stucco', 4, 2), []);
  const concreteNormal = useMemo(() => getCveNormalMap('concrete', 6, 2), []);
  const roofTex = useMemo(() => getRoofRibTexture(roofColor), [roofColor]);

  const gableGeometry = useMemo(() => {
    if (roofType === 'flat') return null;
    const hw = width / 2 + eaveOverhang;
    const hd = depth / 2 + eaveOverhang;
    const shape = new THREE.Shape();
    shape.moveTo(-hd, 0);
    shape.lineTo(0, roofHeight);
    shape.lineTo(hd, 0);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: hw * 2,
      bevelEnabled: false,
    });
    // Rotate so extrusion runs along X axis (width) and peak along Z (depth)
    geo.rotateY(Math.PI / 2);
    geo.translate(-hw, 0, 0);
    geo.computeVertexNormals();
    return geo;
  }, [width, depth, roofHeight, roofType, eaveOverhang]);

  const storyHeight = height / stories;
  const pilasterCount = Math.max(2, Math.floor(width / 8));

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Base stone plinth with CVE concrete normal map */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.5, 0.7, depth + 0.5]} />
        <meshStandardMaterial
          color="#b8b7aa"
          normalMap={concreteNormal}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          roughness={0.86}
        />
      </mesh>

      {/* Main articulated facade body with CVE stucco normal relief */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          map={facadeTex}
          normalMap={stuccoNormal}
          normalScale={new THREE.Vector2(0.32, 0.32)}
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* 3D Vertical Pilasters / Mullion Fins along Front & Back Facades */}
      {Array.from({ length: pilasterCount + 1 }, (_, i) => {
        const px = -width / 2 + (i / pilasterCount) * width;
        return (
          <mesh key={`pil-${i}`} position={[px, height / 2, 0]} castShadow>
            <boxGeometry args={[0.28, height - 0.2, depth + 0.28]} />
            <meshStandardMaterial color="#dde3ea" roughness={0.78} />
          </mesh>
        );
      })}

      {/* Protruding concrete floor-slab stringcourses & window sunshade ledges */}
      {Array.from({ length: stories }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * storyHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.42, 0.26, depth + 0.42]} />
          <meshStandardMaterial
            color="#e2e8f0"
            normalMap={concreteNormal}
            normalScale={new THREE.Vector2(0.25, 0.25)}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* CVE Ground-Floor Entrance Canopy & Glass Lobby Bay (for primary wings) */}
      {width >= 18 && (
        <group position={[0, 0, depth / 2]}>
          <mesh position={[0, 1.7, 0.08]}>
            <boxGeometry args={[4.4, 3.2, 0.14]} />
            <meshStandardMaterial color="#2b4c59" roughness={0.18} metalness={0.5} />
          </mesh>
          <mesh position={[0, 3.45, 0.75]} castShadow>
            <boxGeometry args={[5.2, 0.22, 1.5]} />
            <meshStandardMaterial color="#476f68" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* CVE Exterior AC Condenser Units (空调外机) on upper stories */}
      {stories >= 3 &&
        Array.from({ length: Math.min(4, Math.floor(width / 10)) }, (_, ci) => {
          const cx = -width * 0.32 + ci * (width * 0.22);
          const cy = storyHeight * 1.6 + (ci % 2) * storyHeight;
          return (
            <group key={`ac-${ci}`} position={[cx, cy, -depth / 2 - 0.22]}>
              <mesh castShadow>
                <boxGeometry args={[0.92, 0.68, 0.42]} />
                <meshStandardMaterial color="#dedbd1" roughness={0.75} />
              </mesh>
              <mesh position={[0.15, 0, -0.22]}>
                <cylinderGeometry args={[0.22, 0.22, 0.03, 12]} />
                <meshStandardMaterial color="#25373b" roughness={0.8} />
              </mesh>
            </group>
          );
        })}

      {/* Roof */}
      {roofType === 'flat' ? (
        <group position={[0, height, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[width + 0.5, 0.8, depth + 0.5]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.82, 0]} receiveShadow>
            <boxGeometry args={[width - 0.8, 0.15, depth - 0.8]} />
            <meshStandardMaterial map={roofTex} color={roofColor} roughness={0.78} />
          </mesh>
        </group>
      ) : (
        gableGeometry && (
          <group position={[0, height, 0]}>
            <mesh geometry={gableGeometry} castShadow receiveShadow>
              <meshStandardMaterial map={roofTex} color={roofColor} roughness={0.72} metalness={0.12} />
            </mesh>
            {/* Ridge cap */}
            <mesh position={[0, roofHeight + 0.1, 0]} castShadow>
              <boxGeometry args={[width + eaveOverhang * 2, 0.22, 0.45]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
          </group>
        )
      )}
    </group>
  );
}

interface CourtyardRingProps {
  position?: [number, number, number];
  rotationY?: number;
  width: number;
  depth: number;
  wingThickness?: number;
  height: number;
  stories: number;
  wallColor?: string;
  roofColor?: string;
  archedTop?: boolean;
  courtyardColor?: string;
}

/**
 * 4-wing perimeter courtyard building (used for 桂苑, 松苑, 梅苑, 竹苑, 小学部教学楼).
 */
export function CourtyardRing({
  position = [0, 0, 0],
  rotationY = 0,
  width,
  depth,
  wingThickness = 7.5,
  height,
  stories,
  wallColor = '#eef2f6',
  roofColor = '#2f3947',
  archedTop = false,
  courtyardColor = '#5da346',
}: CourtyardRingProps) {
  const innerW = width - wingThickness * 2;
  const innerD = depth - wingThickness * 2;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Central courtyard surface */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[innerW + 0.5, innerD + 0.5]} />
        <meshStandardMaterial color={courtyardColor} roughness={0.92} />
      </mesh>

      {/* North & South wings */}
      <WingBlock
        position={[0, 0, -depth / 2 + wingThickness / 2]}
        width={width}
        height={height}
        depth={wingThickness}
        stories={stories}
        wallColor={wallColor}
        roofColor={roofColor}
        windowCols={10}
        archedTop={archedTop}
      />
      <WingBlock
        position={[0, 0, depth / 2 - wingThickness / 2]}
        width={width}
        height={height}
        depth={wingThickness}
        stories={stories}
        wallColor={wallColor}
        roofColor={roofColor}
        windowCols={10}
        archedTop={archedTop}
      />

      {/* West & East wings */}
      <WingBlock
        position={[-width / 2 + wingThickness / 2, 0, 0]}
        rotationY={Math.PI / 2}
        width={innerD}
        height={height}
        depth={wingThickness}
        stories={stories}
        wallColor={wallColor}
        roofColor={roofColor}
        windowCols={6}
        archedTop={archedTop}
      />
      <WingBlock
        position={[width / 2 - wingThickness / 2, 0, 0]}
        rotationY={Math.PI / 2}
        width={innerD}
        height={height}
        depth={wingThickness}
        stories={stories}
        wallColor={wallColor}
        roofColor={roofColor}
        windowCols={6}
        archedTop={archedTop}
      />
    </group>
  );
}

interface RotundaDrumProps {
  position?: [number, number, number];
  radius: number;
  height: number;
  stories: number;
  wallColor?: string;
  roofColor?: string;
}

/**
 * Cylindrical pavilion / rotunda with curved curtain-wall glazing, floor rings, and radial roof ribs.
 */
export function RotundaDrum({
  position = [0, 0, 0],
  radius,
  height,
  stories,
  wallColor = '#e2e8f0',
  roofColor = '#2b323c',
}: RotundaDrumProps) {
  const facadeTex = useMemo(() => getFacadeWindowTexture(wallColor, stories, 18, false), [wallColor, stories]);
  const storyH = height / stories;

  return (
    <group position={position}>
      {/* Plinth */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius + 0.4, radius + 0.5, 0.7, 36]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.85} />
      </mesh>
      {/* Drum facade */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 36]} />
        <meshStandardMaterial map={facadeTex} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Horizontal slab rings */}
      {Array.from({ length: stories }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * storyH, 0]} castShadow>
          <cylinderGeometry args={[radius + 0.3, radius + 0.3, 0.28, 36]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
      ))}
      {/* Conical / radial roof */}
      <mesh position={[0, height + 1.1, 0]} castShadow receiveShadow>
        <coneGeometry args={[radius + 0.9, 2.2, 36]} />
        <meshStandardMaterial color={roofColor} roughness={0.68} metalness={0.18} />
      </mesh>
      {/* Radial roof ribs */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * (radius * 0.5), height + 1.15, Math.sin(a) * (radius * 0.5)]}
            rotation={[0, -a, 0.19]}
          >
            <boxGeometry args={[radius, 0.15, 0.16]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}
