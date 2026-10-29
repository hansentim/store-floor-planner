import { useGLTF } from "@react-three/drei";

// glTF is the standard interchange format for 3D assets (geometry, materials, textures in one file).
// useGLTF loads it with three's GLTFLoader and suspends until it is ready, so wrap it in <Suspense>.
// The chair is the Khronos "SheenChair" sample asset, served from /public so the demo works offline.
const URL = `${import.meta.env.BASE_URL}chair.glb`;

export function DisplayItem() {
  const { scene } = useGLTF(URL);
  scene.traverse((o) => (o.castShadow = true));
  // primitive mounts an existing three.js object into the R3F scene graph.
  return <primitive object={scene} position={[3, 0, 3]} rotation={[0, Math.PI / 4, 0]} />;
}

useGLTF.preload(URL);
