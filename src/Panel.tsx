import { useEffect, useState } from "react";
import { CATALOG, productBySku, useStore } from "./store";
import "./panel.css";
import { FrontView } from "./FrontView";

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
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <aside className="panel">
      <section className="section">
        <h2>Fixtures</h2>
        <ul className="fixture-list">
          {fixtures.map((f) => (
            <li key={f.id} onClick={() => select(f.id)} className={f.id === selectedId ? "fixture selected" : "fixture"}>
              {f.name}
              <span className="badge">{f.position[0]}, {f.position[1]}</span>
            </li>
          ))}
        </ul>
        <div className="row">
          <button className="btn btn-primary" onClick={add}>+ Add shelf</button>
          <button className="btn" onClick={toggleView}>{view === "3d" ? "2D plan" : "3D view"}</button>
        </div>
      </section>

      {selected && (
        <section className="section">
          <h2>Planogram</h2>
          <div className="subtitle">{selected.name}</div>
          <FrontView fixture={selected} />
          {/* Levels listed top to bottom, like a planogram sheet, each with its own catalog row */}
          {[...selected.shelves].map((_, i, arr) => arr.length - 1 - i).map((level) => (
            <div key={level} className="level">
              <div className="level-header">
                Level {level + 1}
                <span>{selected.shelves[level].length} {selected.shelves[level].length === 1 ? "facing" : "facings"}</span>
              </div>
              <div className="chips">
                {selected.shelves[level].length === 0 && <div className="empty">Empty shelf</div>}
                {selected.shelves[level].map((sku, i) => (
                  <button
                    key={i}
                    className="chip facing"
                    onClick={() => removeProduct(selected.id, level, i)}
                    aria-label={`Remove ${productBySku(sku).name}`}
                    style={{ borderLeftColor: productBySku(sku).color }}
                  >
                    {productBySku(sku).name} <span className="remove">✕</span>
                  </button>
                ))}
              </div>
              <div className="chips">
                {CATALOG.map((p) => (
                  <button
                    key={p.sku}
                    className="chip"
                    onClick={() => addProduct(selected.id, p.sku, level) || setNotice(`No room for ${p.name} on level ${level + 1}`)}
                  >
                    <span className="dot" style={{ background: p.color }} />+ {p.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
      {notice && <div className="toast" role="status">{notice}</div>}
      <p className="hint">Drag a fixture to move it (or arrow keys), drag the floor to orbit, scroll to zoom.</p>
    </aside>
  );
}
