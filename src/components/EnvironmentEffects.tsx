import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Lightformer, Sky } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export function EnvironmentEffects() {
  const { gl } = useThree();
  // CVE V2B golden-afternoon sun angle & warm sunlight
  const sunPosition: [number, number, number] = [-190, 260, 175];

  useEffect(() => {
    gl.toneMappingExposure = 1.18;
  }, [gl]);

  return (
    <>
      <color attach="background" args={['#a7c7d6']} />

      <Sky
        distance={4500}
        sunPosition={sunPosition}
        turbidity={3.2}
        rayleigh={1.1}
        mieCoefficient={0.005}
        mieDirectionalG={0.82}
      />

      {/* Self-contained procedural IBL Environment for crisp glass, car & lake reflections */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={2.1}
          color="#e7f4fa"
          scale={[50, 24, 1]}
          position={[0, 18, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={3.5}
          color="#fff0d5"
          scale={14}
          position={[-20, 14, 15]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#728271"
          scale={[60, 20, 1]}
          position={[0, -10, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </Environment>

      {/* CVE V2B High-Bounce Hemisphere + Warm Directional Sun */}
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#e7f4fa', '#728271', 1.75]} />
      <directionalLight
        position={sunPosition}
        color="#fff0d5"
        intensity={2.85}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-440}
        shadow-camera-right={240}
        shadow-camera-top={340}
        shadow-camera-bottom={-240}
        shadow-camera-near={10}
        shadow-camera-far={1050}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
      />

      <EffectComposer multisampling={4}>
        <Bloom intensity={0.16} luminanceThreshold={0.95} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}
