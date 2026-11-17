import { useMemo } from 'react';
import * as THREE from 'three';
import { getFacadeWindowTexture, getRoofRibTexture } from '../../materials/proceduralTextures';

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

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Base plinth */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.4, 0.6, depth + 0.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.88} />
      </mesh>

      {/* Main articulated facade body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial map={facadeTex} roughness={0.62} metalness={0.08} />
      </mesh>

      {/* Protruding concrete floor-slab stringcourses */}
      {Array.from({ length: stories }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * storyHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.35, 0.24, depth + 0.35]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.82} />
        </mesh>
      ))}

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
