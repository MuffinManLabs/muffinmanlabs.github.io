/* ════════════════════════════════════════════════════════════════════════
   Stackup — the layers of the board, as a table rather than a picture.

   The earlier version drew a to-scale cross-section with labels floating
   beside it, so thin layers got illegible slivers of space and the text
   collided. A stackup is really a table, which is how every fab presents
   one: aligned rows, a swatch for the material, and the thickness written
   down instead of implied by three pixels of height.
   ════════════════════════════════════════════════════════════════════════ */

export type StackLayer = {
  name: string;
  role: string;
  /** finished thickness, written out — not implied by pixel height */
  thickness: string;
  kind: "copper" | "core" | "prepreg" | "mask";
};

const SWATCH: Record<StackLayer["kind"], string> = {
  copper: "linear-gradient(90deg, #8a5c2c, #d09a58 55%, #8a5c2c)",
  mask: "linear-gradient(90deg, #123a20, #1c522e)",
  core: "#4a4238",
  prepreg: "#3a342c",
};

const BAR_HEIGHT: Record<StackLayer["kind"], number> = {
  copper: 8,
  mask: 5,
  core: 13,
  prepreg: 10,
};

export function Stackup({ layers, note }: { layers: StackLayer[]; note?: string }) {
  const copper = layers.filter((l) => l.kind === "copper").length;

  return (
    <div className="min-w-0">
      <span className="eyebrow block mb-2.5">Stackup</span>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-baseline justify-between gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <span className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
            {copper}-layer
          </span>
          <span className="text-[11.5px]" style={{ color: "var(--text-3)" }}>
            1.6 mm FR-4
          </span>
        </div>

        <ul className="m-0 p-0 list-none">
          {layers.map((l, i) => (
            <li
              key={`${l.name}-${i}`}
              className="grid items-center gap-3 px-4 py-2"
              style={{
                gridTemplateColumns: "14px minmax(0,1fr) auto",
                borderTop: i === 0 ? "none" : "1px solid var(--border-soft)",
              }}
            >
              <span
                aria-hidden
                className="rounded-sm"
                style={{
                  background: SWATCH[l.kind],
                  height: BAR_HEIGHT[l.kind],
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              />
              <span className="min-w-0">
                <span
                  className="block text-[12.5px] leading-5 truncate"
                  style={{
                    color: l.kind === "copper" ? "var(--text)" : "var(--text-2)",
                    fontWeight: l.kind === "copper" ? 500 : 400,
                  }}
                >
                  {l.name}
                </span>
                <span
                  className="block text-[11px] leading-4 truncate"
                  style={{ color: "var(--text-3)" }}
                >
                  {l.role}
                </span>
              </span>
              <span
                className="text-[11px] tabular-nums whitespace-nowrap"
                style={{ color: "var(--text-3)" }}
              >
                {l.thickness}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {note && (
        <p className="mt-3 text-[12px] leading-5" style={{ color: "var(--text-3)" }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** MML-01 — 4-layer on the fab's 7628 stackup, both inner layers solid ground */
export const STACK_4L: StackLayer[] = [
  { name: "F.Mask", role: "Soldermask", thickness: "—", kind: "mask" },
  { name: "F.Cu", role: "Signal + pours", thickness: "1 oz", kind: "copper" },
  { name: "Prepreg", role: "7628", thickness: "0.21 mm", kind: "prepreg" },
  { name: "In1.Cu", role: "Solid ground, no signals", thickness: "0.5 oz", kind: "copper" },
  { name: "Core", role: "FR-4", thickness: "1.06 mm", kind: "core" },
  { name: "In2.Cu", role: "Solid ground, no signals", thickness: "0.5 oz", kind: "copper" },
  { name: "Prepreg", role: "7628", thickness: "0.21 mm", kind: "prepreg" },
  { name: "B.Cu", role: "Signal + pours", thickness: "1 oz", kind: "copper" },
  { name: "B.Mask", role: "Soldermask + ID block", thickness: "—", kind: "mask" },
];

/** MML-02 — 2-layer, 1 oz, bottom copper unbroken under logic + converter */
export const STACK_2L: StackLayer[] = [
  { name: "F.Mask", role: "Soldermask", thickness: "—", kind: "mask" },
  { name: "F.Cu", role: "Signal + field power", thickness: "1 oz", kind: "copper" },
  { name: "Core", role: "FR-4", thickness: "1.53 mm", kind: "core" },
  { name: "B.Cu", role: "Unbroken ground return", thickness: "1 oz", kind: "copper" },
  { name: "B.Mask", role: "Soldermask + ID block", thickness: "—", kind: "mask" },
];
