import { useStore } from "./store";

// Plain HTML UI reading the same store as the 3D scene.
export function Panel() {
  const fixtures = useStore((s) => s.fixtures);
  const selectedId = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);
  const add = useStore((s) => s.add);

  return (
    <aside style={{ width: 220, padding: 12, background: "#1a1b26", color: "#c0caf5", fontFamily: "system-ui" }}>
      <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Fixtures</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {fixtures.map((f) => (
          <li
            key={f.id}
            onClick={() => select(f.id)}
            style={{
              padding: "6px 8px",
              cursor: "pointer",
              borderRadius: 4,
              background: f.id === selectedId ? "#ff9e64" : "transparent",
              color: f.id === selectedId ? "#1a1b26" : undefined,
            }}
          >
            {f.name} <small>({f.position[0]}, {f.position[1]})</small>
          </li>
        ))}
      </ul>
      <button onClick={add} style={{ marginTop: 12, width: "100%", padding: 8 }}>
        Add fixture
      </button>
      <p style={{ fontSize: 12, opacity: 0.7 }}>Click a box to select, arrow keys to move, drag to orbit.</p>
    </aside>
  );
}
