import { useState } from "react";
import type { Fixture as FixtureData } from "./store";
import { GAP, productBySku, useStore } from "./store";

const PLANK = 0.05; // thickness of shelf planks and the back panel

export function Fixture({ fixture }: { fixture: FixtureData }) {
  const selected = useStore((s) => s.selectedId === fixture.id);
  const select = useStore((s) => s.select);
  const [hovered, setHovered] = useState(false);
  const [w, h, d] = fixture.size;
  const color = selected ? "#ff9e64" : fixture.color;
  const emissive = selected ? "#ff9e64" : hovered ? "#ffffff" : "#000000";
  const levelHeight = h / fixture.shelves.length;

  // Height of the surface each level's products stand on (relative to the group).
  const surfaceY = (level: number) => (fixture.kind === "table" ? h : level * levelHeight);

  return (
    // A group is a node in the scene graph: children inherit its transform, so moving the
    // group moves the planks and every product on them. Pointer events bubble up to it too,
    // so clicking a product selects its fixture.
    <group
      position={[fixture.position[0], 0, fixture.position[1]]}
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
      {fixture.kind === "table" ? (
        // A mesh = geometry (shape) + material (surface). Position is the box centre,
        // so lift it by half its height to make it sit on the floor (y = 0).
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={selected ? 0.4 : 0.15} />
        </mesh>
      ) : (
        <>
          {/* Back panel */}
          <mesh position={[0, h / 2, -d / 2 + PLANK / 2]} castShadow receiveShadow>
            <boxGeometry args={[w, h, PLANK]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={selected ? 0.4 : 0.15} />
          </mesh>
          {/* One plank per level, plus a top */}
          {[...fixture.shelves.map((_, i) => i * levelHeight), h].map((y) => (
            <mesh key={y} position={[0, y - PLANK / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, PLANK, d]} />
              <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={selected ? 0.4 : 0.15} />
            </mesh>
          ))}
        </>
      )}

      {/* Products: facings laid out left to right on each level */}
      {fixture.shelves.map((skus, level) => {
        let x = -w / 2 + GAP;
        return skus.map((sku, i) => {
          const p = productBySku(sku);
          const [pw, ph, pd] = p.size;
          const cx = x + pw / 2;
          x += pw + GAP;
          return (
            <mesh key={`${level}-${i}`} position={[cx, surfaceY(level) + ph / 2, 0]} castShadow>
              <boxGeometry args={[pw, ph, pd]} />
              <meshStandardMaterial color={p.color} />
            </mesh>
          );
        });
      })}
    </group>
  );
}
