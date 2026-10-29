import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { FLOOR_SIZE, useStore } from "./store";
import { Fixture } from "./Fixture";
import { Shopper } from "./Shopper";

export function Scene() {
  const fixtures = useStore((s) => s.fixtures);
  const select = useStore((s) => s.select);

  return (
    // Canvas creates the renderer, the scene graph root and the camera.
    // Everything inside is a three.js object declared as JSX.
    <Canvas
      shadows
      camera={{ position: [14, 14, 14], fov: 40 }} // isometric-ish view from a corner
      onPointerMissed={() => select(null)} // click that hits no mesh clears the selection
    >
      {/* Lights: ambient fills everything evenly, directional acts like the sun and casts shadows. */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        // Without a bias, surfaces shadow themselves ("shadow acne") and shimmer while the camera moves.
        shadow-normalBias={0.03}
        shadow-bias={-0.0002}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Floor: a plane is vertical by default, so rotate it -90° around X to lay it flat. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <Grid args={[FLOOR_SIZE, FLOOR_SIZE]} cellColor="#bbb" sectionColor="#888" position={[0, 0.01, 0]} />

      {fixtures.map((f) => (
        <Fixture key={f.id} fixture={f} />
      ))}

      {/* A glTF model streams in asynchronously; the rest of the scene renders meanwhile. */}
      <Suspense fallback={null}>
        <Shopper />
      </Suspense>

      {/* OrbitControls: drag to orbit, scroll to zoom, right-drag to pan. */}
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
