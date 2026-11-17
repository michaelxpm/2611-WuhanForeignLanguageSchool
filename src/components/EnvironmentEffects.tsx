import { Environment, Lightformer, Sky } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export function EnvironmentEffects() {
  const sunPosition: [number, number, number] = [180, 310, 150];

  return (
    <>
      <color attach="background" args={['#cfe6ff']} />

      <Sky
        distance={4500}
        sunPosition={sunPosition}
        turbidity={2.2}
        rayleigh={0.75}
        mieCoefficient={0.004}
        mieDirectionalG={0.8}
      />

      {/* Self-contained procedural IBL Environment */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={1.7}
          color="#e0f2fe"
          scale={[40, 20, 1]}
          position={[0, 15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={3.0}
          color="#fffbeb"
          scale={12}
          position={[20, 12, 15]}
        />
      </Environment>

      <ambientLight intensity={0.52} />
      <hemisphereLight args={['#e0f2fe', '#64748b', 0.68]} />
      <directionalLight
        position={sunPosition}
        color="#fffdf8"
        intensity={2.35}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-440}
        shadow-camera-right={240}
        shadow-camera-top={340}
        shadow-camera-bottom={-240}
        shadow-camera-near={10}
        shadow-camera-far={1050}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
      />

      <EffectComposer multisampling={4}>
        <Bloom intensity={0.18} luminanceThreshold={0.95} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}
