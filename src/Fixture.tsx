import { useRef, useState } from "react";
import { Plane, Vector3 } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { Fixture as FixtureData } from "./store";
import { GAP, productBySku, useStore } from "./store";

const PLANK = 0.05; // thickness of shelf planks and the back panel
const FLOOR = new Plane(new Vector3(0, 1, 0), 0); // the plane y = 0, used to turn a pointer ray into a floor point

export function Fixture({ fixture }: { fixture: FixtureData }) {
  const selected = useStore((s) => s.selectedId === fixture.id);
  const blocked = useStore((s) => s.blocked && s.selectedId === fixture.id);
  const select = useStore((s) => s.select);
  const focus = useStore((s) => s.focus);
  const setPosition = useStore((s) => s.setPosition);
  const setDragging = useStore((s) => s.setDragging);
  const [hovered, setHovered] = useState(false);
  // Offset from the grabbed floor point to the fixture origin, so it doesn't jump to the cursor.
  const grab = useRef<Vector3 | null>(null);
  const hit = new Vector3();

  // Dragging: every pointer event carries the ray R3F cast from the camera through the cursor.
  // Intersecting that ray with the floor plane gives the world point under the cursor.
  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    select(fixture.id);
    if (!e.ray.intersectPlane(FLOOR, hit)) return;
    grab.current = hit.clone().sub(new Vector3(fixture.position[0], 0, fixture.position[1]));
    (e.target as HTMLElement).setPointerCapture(e.pointerId); // keep receiving moves even off the mesh
    setDragging(true);
  };
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!grab.current || !e.ray.intersectPlane(FLOOR, hit)) return;
    setPosition(fixture.id, hit.x - grab.current.x, hit.z - grab.current.z);
  };
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!grab.current) return;
    grab.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };
  const [w, h, d] = fixture.size;
  const color = blocked ? "#f7768e" : selected ? "#ff9e64" : fixture.color; // red while a move is refused
  const emissive = blocked ? "#f7768e" : selected ? "#ff9e64" : hovered ? "#ffffff" : "#000000";
  const levelHeight = h / fixture.shelves.length;

  // Height of the surface each level's products stand on (relative to the group).
  const surfaceY = (level: number) => (fixture.kind === "table" ? h : level * levelHeight + PLANK);

  return (
    // A group is a node in the scene graph: children inherit its transform, so moving the
    // group moves the planks and every product on them. Pointer events bubble up to it too,
    // so grabbing a product drags its fixture.
    <group
      position={[fixture.position[0], 0, fixture.position[1]]}
      rotation={[0, (fixture.rotation * Math.PI) / 2, 0]} // rotating the group turns planks and products together
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        focus(fixture.id);
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
          {/* One plank per level, plus a top. The bottom plank stands on the floor rather than
              inside it: two coplanar faces would z-fight and shimmer as the camera moves. */}
          {[...fixture.shelves.map((_, i) => i * levelHeight + PLANK / 2), h - PLANK / 2].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
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
