import { create } from "zustand";

// One store shared by the 3D scene and the plain HTML panel.
// R3F components are ordinary React components, so they can use zustand like any other.

export const FLOOR_SIZE = 20; // floor is FLOOR_SIZE x FLOOR_SIZE units, centred on the origin

export type Product = { sku: string; name: string; color: string; size: [w: number, h: number, d: number] };

// Tiny product catalog; a real planogram tool would load this from a PIM system.
export const CATALOG: Product[] = [
  { sku: "milk", name: "Milk", color: "#f4f4f4", size: [0.3, 0.5, 0.3] },
  { sku: "cereal", name: "Cereal", color: "#f7768e", size: [0.4, 0.6, 0.15] },
  { sku: "juice", name: "Juice", color: "#e0af68", size: [0.25, 0.45, 0.25] },
  { sku: "pasta", name: "Pasta", color: "#2ac3de", size: [0.3, 0.4, 0.12] },
  { sku: "plant", name: "Plant", color: "#9ece6a", size: [0.5, 0.7, 0.5] },
];
export const productBySku = (sku: string) => CATALOG.find((p) => p.sku === sku)!;

export type Fixture = {
  id: number;
  name: string;
  kind: "shelf" | "table"; // shelf = back panel with planks, table = solid block with products on top
  position: [x: number, z: number]; // y is derived: fixtures always sit on the floor
  size: [w: number, h: number, d: number];
  color: string;
  shelves: string[][]; // one array of SKUs per level, bottom to top, facings left to right
};

type State = {
  fixtures: Fixture[];
  selectedId: number | null;
  dragging: boolean; // true while a fixture is being dragged, so OrbitControls can be paused
  view: "3d" | "plan";
  select: (id: number | null) => void;
  setDragging: (dragging: boolean) => void;
  toggleView: () => void;
  setPosition: (id: number, x: number, z: number) => void;
  move: (id: number, dx: number, dz: number) => void;
  add: () => void;
  addProduct: (fixtureId: number, sku: string, level: number) => boolean; // false when the level has no room
  removeProduct: (fixtureId: number, level: number, index: number) => void;
};

const seed: Fixture[] = [
  { id: 1, name: "Shelf A", kind: "shelf", position: [-6, -5], size: [4, 2, 1], color: "#7aa2f7", shelves: [["milk", "milk", "milk", "juice"], ["cereal", "cereal", "pasta", "pasta"], ["juice", "juice"]] },
  { id: 2, name: "Shelf B", kind: "shelf", position: [-6, 0], size: [4, 2, 1], color: "#7aa2f7", shelves: [["pasta", "pasta", "pasta"], [], ["cereal"]] },
  { id: 3, name: "Table 1", kind: "table", position: [2, -3], size: [2, 0.8, 2], color: "#e0af68", shelves: [["plant", "plant"]] },
  { id: 4, name: "Table 2", kind: "table", position: [6, 3], size: [2, 0.8, 2], color: "#e0af68", shelves: [[]] },
  { id: 5, name: "Checkout", kind: "table", position: [0, 7], size: [3, 1, 1.5], color: "#9ece6a", shelves: [["juice", "milk"]] },
];

const clamp = (v: number) => Math.max(-FLOOR_SIZE / 2 + 1, Math.min(FLOOR_SIZE / 2 - 1, v));
export const GAP = 0.05; // space between facings and from the fixture edge

export const usedWidth = (skus: string[]) => skus.reduce((sum, sku) => sum + productBySku(sku).size[0] + GAP, GAP);

export const useStore = create<State>((set, get) => ({
  fixtures: seed,
  selectedId: null,
  dragging: false,
  view: "3d",
  select: (id) => set({ selectedId: id }),
  setDragging: (dragging) => set({ dragging }),
  toggleView: () => set((s) => ({ view: s.view === "3d" ? "plan" : "3d" })),
  // Snap to a 1-unit grid and keep the fixture on the floor.
  setPosition: (id, x, z) =>
    set((s) => ({
      fixtures: s.fixtures.map((f) => (f.id === id ? { ...f, position: [clamp(Math.round(x)), clamp(Math.round(z))] } : f)),
    })),
  move: (id, dx, dz) => {
    const f = get().fixtures.find((x) => x.id === id);
    if (f) get().setPosition(id, f.position[0] + dx, f.position[1] + dz);
  },
  add: () =>
    set((s) => {
      const id = Math.max(0, ...s.fixtures.map((f) => f.id)) + 1;
      return {
        fixtures: [...s.fixtures, { id, name: `Shelf ${id}`, kind: "shelf", position: [0, 0], size: [3, 2, 1], color: "#bb9af7", shelves: [[], [], []] }],
        selectedId: id,
      };
    }),
  // Add one facing on the given level if it has room for the product's width and height.
  addProduct: (fixtureId, sku, level) => {
    const f = get().fixtures.find((x) => x.id === fixtureId);
    if (!f) return false;
    const [pw, ph] = productBySku(sku).size;
    const levelHeight = f.kind === "table" ? Infinity : f.size[1] / f.shelves.length; // tall items only fit on tables
    if (ph > levelHeight || usedWidth(f.shelves[level]) + pw > f.size[0]) return false;
    set((s) => ({
      fixtures: s.fixtures.map((x) =>
        x.id === fixtureId ? { ...x, shelves: x.shelves.map((skus, i) => (i === level ? [...skus, sku] : skus)) } : x,
      ),
    }));
    return true;
  },
  removeProduct: (fixtureId, level, index) =>
    set((s) => ({
      fixtures: s.fixtures.map((x) =>
        x.id === fixtureId ? { ...x, shelves: x.shelves.map((skus, i) => (i === level ? skus.filter((_, j) => j !== index) : skus)) } : x,
      ),
    })),
}));
