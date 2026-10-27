import { useState } from "react";
import type { Fixture as FixtureData } from "./store";
import { useStore } from "./store";

export function Fixture({ fixture }: { fixture: FixtureData }) {
  const selected = useStore((s) => s.selectedId === fixture.id);
  const select = useStore((s) => s.select);
  const [hovered, setHovered] = useState(false);
  const [w, h, d] = fixture.size;

  return (
    // A mesh = geometry (shape) + material (surface). Position is the box centre,
    // so lift it by half its height to make it sit on the floor (y = 0).
    <mesh
      position={[fixture.position[0], h / 2, fixture.position[1]]}
      castShadow
      receiveShadow
      // R3F raycasts from the camera through the pointer for us; onClick fires on the hit mesh.
      onClick={(e) => {
        e.stopPropagation(); // don't let the click fall through to meshes behind this one
        select(fixture.id);
      }}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial
        color={selected ? "#ff9e64" : fixture.color}
        emissive={selected ? "#ff9e64" : hovered ? "#ffffff" : "#000000"}
        emissiveIntensity={selected ? 0.4 : 0.15}
      />
    </mesh>
  );
}
