import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Grid, OrbitControls, OrthographicCamera, PerspectiveCamera, useProgress } from "@react-three/drei";
import { FLOOR_SIZE, useStore } from "./store";
import { Fixture } from "./Fixture";
import { DisplayItem } from "./DisplayItem";

export function Scene() {
  const fixtures = useStore((s) => s.fixtures);
  const select = useStore((s) => s.select);
  const dragging = useStore((s) => s.dragging);
  const view = useStore((s) => s.view);

  return (
    // Canvas creates the renderer and the scene graph root.
    // Everything inside is a three.js object declared as JSX.
    <Canvas
      shadows
      onPointerMissed={() => select(null)} // click that hits no mesh clears the selection
    >
      {/* Two cameras: perspective (lines converge, like the eye) for the 3D view, orthographic
          (parallel projection, no foreshortening) straight down for a true-to-scale floor plan.
          makeDefault tells R3F and OrbitControls which one to render through. */}
      {view === "3d" ? (
        <PerspectiveCamera makeDefault position={[14, 14, 14]} fov={40} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 30, 0]} zoom={28} />
      )}

      {/* Lights: ambient fills everything evenly, directional acts like the sun and casts shadows,
          and Environment adds image-based lighting from an HDRI so PBR materials get reflections. */}
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.4} />
      </Suspense>
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
        <DisplayItem />
      </Suspense>

      {/* OrbitControls: drag to orbit, scroll to zoom, right-drag to pan. Remounted (key) when the
          camera changes, and rotation is off in plan view so it stays a top-down drawing. */}
      <OrbitControls key={view} makeDefault enabled={!dragging} enableRotate={view === "3d"} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}

// useProgress reports three.js loader progress and works outside the Canvas too, so the indicator
// is ordinary DOM layered over the canvas. (drei's <Html> as a Suspense fallback crashed React
// on unmount in production, so the overlay lives outside the 3D tree.)
export function Loader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div style={{ position: "absolute", top: 12, right: 12, padding: "6px 10px", borderRadius: 6, background: "#1a1b26", color: "#c0caf5", fontSize: 13, fontFamily: "system-ui" }}>
      Loading {Math.round(progress)} %
    </div>
  );
}
