import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";
import type { Object3D } from "three";
import { productBySku, useStore } from "./store";

export const SKU_MIME = "application/x-sku"; // set by the panel's catalog chips when a drag starts

// Accepts products dragged from the HTML panel onto the canvas. HTML drag and drop knows nothing
// about the 3D scene, so on drop we cast our own ray from the camera through the drop point,
// find the fixture it hits, and turn the hit height into a shelf level.
export function DropTarget() {
  const { gl, camera, scene } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new Raycaster();

    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes(SKU_MIME)) return;
      e.preventDefault(); // allows the drop
      e.dataTransfer.dropEffect = "copy";
    };

    const onDrop = (e: DragEvent) => {
      const sku = e.dataTransfer?.getData(SKU_MIME);
      if (!sku) return;
      e.preventDefault();
      const { notify, addProduct, select, fixtures } = useStore.getState();

      // Pointer position in normalised device coordinates: -1..1 on both axes, y up.
      const rect = el.getBoundingClientRect();
      const ndc = new Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(scene.children, true)[0];

      // The nearest hit may be a plank or a product; walk up the scene graph to the fixture's group.
      let group: Object3D | null = hit?.object ?? null;
      while (group && group.userData.fixtureId === undefined) group = group.parent;
      const fixture = group && fixtures.find((f) => f.id === group!.userData.fixtureId);
      if (!hit || !group || !fixture) return notify("Drop the product on a shelf or table");

      // In the group's own coordinates y is the height above the floor, whatever its position and rotation.
      const y = group.worldToLocal(hit.point.clone()).y;
      const levels = fixture.shelves.length;
      const level = fixture.kind === "table" ? 0 : Math.min(levels - 1, Math.max(0, Math.floor(y / (fixture.size[1] / levels))));

      select(fixture.id);
      if (!addProduct(fixture.id, sku, level)) notify(`No room for ${productBySku(sku).name} on level ${level + 1}`);
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("drop", onDrop);
    };
  }, [gl, camera, scene]);

  return null;
}
