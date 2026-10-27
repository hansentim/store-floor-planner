import { useGLTF } from "@react-three/drei";

// shortcut: the canvas stays blank until the 2 MB model has downloaded, add a placeholder box as Suspense fallback if that bothers you
// glTF is the standard interchange format for 3D assets (geometry, materials, textures in one file).
// useGLTF loads it with three's GLTFLoader and suspends until it is ready, so wrap it in <Suspense>.
const URL = "https://threejs.org/examples/models/gltf/Soldier.glb";

export function Shopper() {
  const { scene } = useGLTF(URL);
  scene.traverse((o) => (o.castShadow = true));
  // primitive mounts an existing three.js object into the R3F scene graph.
  return <primitive object={scene} position={[3, 0, 3]} rotation={[0, Math.PI, 0]} />;
}

useGLTF.preload(URL);
