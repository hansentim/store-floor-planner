import { useEffect } from "react";
import { Panel } from "./Panel";
import { Loader, Scene } from "./Scene";
import { useStore } from "./store";

const keys: Record<string, [dx: number, dz: number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export default function App() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { selectedId, move, rotate, undo, redo } = useStore.getState();
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "z" || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        return e.key.toLowerCase() === "y" || e.shiftKey ? redo() : undo();
      }
      if (selectedId !== null && e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) return rotate(selectedId);
      const delta = keys[e.key];
      if (selectedId === null || !delta) return;
      e.preventDefault();
      move(selectedId, ...delta);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Panel />
      <main style={{ flex: 1, position: "relative" }}>
        <Scene />
        <Loader />
      </main>
    </div>
  );
}
