import type { Fixture } from "./store";
import { GAP, productBySku } from "./store";

// The planogram sheet: the fixture seen straight from the front, true to scale.
// SVG's y axis points down, so world heights are flipped with top - y to keep the floor at the bottom.
export function FrontView({ fixture }: { fixture: Fixture }) {
  const [w, h] = fixture.size;
  const isTable = fixture.kind === "table";
  const levelHeight = h / fixture.shelves.length;
  const top = isTable ? h + 0.8 : h; // tables leave room above for the products standing on them
  const surface = (level: number) => (isTable ? h : level * levelHeight);
  const pad = 0.1;

  return (
    <svg className="front-view" viewBox={`${-pad} ${-pad} ${w + pad * 2} ${top + pad * 2}`} role="img" aria-label={`Front view of ${fixture.name}`}>
      {isTable ? (
        <rect x={0} y={top - h} width={w} height={h} className="front-body" />
      ) : (
        <>
          <rect x={0} y={0} width={w} height={h} className="front-frame" />
          {fixture.shelves.map((_, level) => (
            <line key={level} x1={0} x2={w} y1={top - surface(level)} y2={top - surface(level)} className="front-plank" />
          ))}
        </>
      )}
      {fixture.shelves.map((skus, level) => {
        let x = GAP;
        return skus.map((sku, i) => {
          const p = productBySku(sku);
          const [pw, ph] = p.size;
          const rect = (
            <rect key={`${level}-${i}`} x={x} y={top - surface(level) - ph} width={pw} height={ph} fill={p.color} className="front-product">
              <title>{p.name}</title>
            </rect>
          );
          x += pw + GAP;
          return rect;
        });
      })}
    </svg>
  );
}
