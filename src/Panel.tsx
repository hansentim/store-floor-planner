import { CATALOG, productBySku, useStore } from "./store";

// Plain HTML UI reading the same store as the 3D scene.
export function Panel() {
  const fixtures = useStore((s) => s.fixtures);
  const selectedId = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);
  const add = useStore((s) => s.add);
  const addProduct = useStore((s) => s.addProduct);
  const removeProduct = useStore((s) => s.removeProduct);
  const view = useStore((s) => s.view);
  const toggleView = useStore((s) => s.toggleView);
  const selected = fixtures.find((f) => f.id === selectedId);

  return (
    <aside style={{ width: 260, padding: 12, background: "#1a1b26", color: "#c0caf5", fontFamily: "system-ui", overflowY: "auto" }}>
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
        Add shelf
      </button>
      <button onClick={toggleView} style={{ marginTop: 6, width: "100%", padding: 8 }}>
        {view === "3d" ? "Show 2D plan" : "Show 3D view"}
      </button>

      {selected && (
        <>
          <h2 style={{ fontSize: 16, margin: "20px 0 8px" }}>Planogram: {selected.name}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {CATALOG.map((p) => (
              <button
                key={p.sku}
                onClick={() => addProduct(selected.id, p.sku) || alert(`No room for ${p.name} on ${selected.name}`)}
                style={{ padding: "4px 8px", borderLeft: `6px solid ${p.color}` }}
              >
                + {p.name}
              </button>
            ))}
          </div>
          {/* Levels listed top to bottom, like a planogram sheet */}
          {[...selected.shelves].map((_, i, arr) => arr.length - 1 - i).map((level) => (
            <div key={level} style={{ marginTop: 8, fontSize: 13 }}>
              <div style={{ opacity: 0.7 }}>Level {level + 1}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {selected.shelves[level].length === 0 && <span style={{ opacity: 0.4 }}>empty</span>}
                {selected.shelves[level].map((sku, i) => (
                  <span
                    key={i}
                    onClick={() => removeProduct(selected.id, level, i)}
                    title="Click to remove"
                    style={{ cursor: "pointer", padding: "2px 6px", borderRadius: 3, background: productBySku(sku).color, color: "#1a1b26" }}
                  >
                    {productBySku(sku).name} ✕
                  </span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 20 }}>Drag a fixture to move it (or arrow keys), drag the floor to orbit, scroll to zoom.</p>
    </aside>
  );
}
