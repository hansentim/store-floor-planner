import { create } from "zustand";

// One store shared by the 3D scene and the plain HTML panel.
// R3F components are ordinary React components, so they can use zustand like any other.

export const FLOOR_SIZE = 20; // floor is FLOOR_SIZE x FLOOR_SIZE units, centred on the origin

export type Fixture = {
  id: number;
  name: string;
  position: [x: number, z: number]; // y is derived: boxes always sit on the floor
  size: [w: number, h: number, d: number];
  color: string;
};

type State = {
  fixtures: Fixture[];
  selectedId: number | null;
  select: (id: number | null) => void;
  move: (id: number, dx: number, dz: number) => void;
  add: () => void;
};

const seed: Fixture[] = [
  { id: 1, name: "Shelf A", position: [-6, -5], size: [4, 2, 1], color: "#7aa2f7" },
  { id: 2, name: "Shelf B", position: [-6, 0], size: [4, 2, 1], color: "#7aa2f7" },
  { id: 3, name: "Table 1", position: [2, -3], size: [2, 0.8, 2], color: "#e0af68" },
  { id: 4, name: "Table 2", position: [6, 3], size: [2, 0.8, 2], color: "#e0af68" },
  { id: 5, name: "Checkout", position: [0, 7], size: [3, 1, 1.5], color: "#9ece6a" },
];

const clamp = (v: number) => Math.max(-FLOOR_SIZE / 2 + 1, Math.min(FLOOR_SIZE / 2 - 1, v));

export const useStore = create<State>((set) => ({
  fixtures: seed,
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  // Snap to a 1-unit grid and keep the fixture on the floor.
  move: (id, dx, dz) =>
    set((s) => ({
      fixtures: s.fixtures.map((f) =>
        f.id === id
          ? { ...f, position: [clamp(Math.round(f.position[0] + dx)), clamp(Math.round(f.position[1] + dz))] }
          : f,
      ),
    })),
  add: () =>
    set((s) => {
      const id = Math.max(0, ...s.fixtures.map((f) => f.id)) + 1;
      return {
        fixtures: [...s.fixtures, { id, name: `Fixture ${id}`, position: [0, 0], size: [2, 1.5, 1], color: "#bb9af7" }],
        selectedId: id,
      };
    }),
}));
