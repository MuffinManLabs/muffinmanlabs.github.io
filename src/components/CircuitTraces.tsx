"use client";

import { useEffect, useRef } from "react";

const GREEN = "#00ff41";

interface Point {
  x: number;
  y: number;
}

interface TracePath {
  points: Point[];
  triggerY: number; // scroll position that triggers drawing
  width: number;
  dim: boolean;
}

interface Signal {
  pathIndex: number;
  t: number;
  speed: number;
  brightness: number;
}

export default function CircuitTraces() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.innerWidth < 768) return;

    const dpr = window.devicePixelRatio || 1;
    const sectionIds = ["home", "about", "projects", "blog", "contact"];
    const signals: Signal[] = [];
    let lastSignalSpawn = 0;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();

    const getSections = () =>
      sectionIds
        .map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return { id, top: el.offsetTop, height: el.offsetHeight };
        })
        .filter(Boolean) as { id: string; top: number; height: number }[];

    const buildPaths = () => {
      const w = window.innerWidth;
      const pageH = document.documentElement.scrollHeight;
      const secs = getSections();
      if (secs.length === 0)
        return { traces: [] as TracePath[], pads: [] as Point[] };

      const traces: TracePath[] = [];
      const pads: Point[] = [];

      // X positions across the page
      const L0 = w * 0.10;
      const L1 = w * 0.14;
      const L2 = w * 0.19;
      const L3 = w * 0.25;
      const M1 = w * 0.34;
      const M2 = w * 0.5;
      const R3 = w * 0.68;
      const R2 = w * 0.78;
      const R1 = w * 0.84;
      const R0 = w * 0.90;

      // Section Y positions
      const sy = secs.map((s) => s.top + s.height * 0.3);
      const mid = (a: number, b: number) =>
        a < sy.length && b < sy.length ? (sy[a] + sy[b]) / 2 : sy[a] + 300;

      // Helper to add a trace
      const add = (points: Point[], triggerY: number, width = 1.5) => {
        traces.push({ points, triggerY, width, dim: false });
      };

      // Jog offset for breaking up verticals
      const jog = w * 0.015; // small horizontal step

      // ===================================================
      // LEFT BUS — broken into segments with jogs
      // ===================================================

      // Segment 1: top → above hero (jog right)
      const lJog1 = sy[0] - 120;
      add(
        [
          { x: L0, y: 0 },
          { x: L0, y: lJog1 },
          { x: L0 + jog, y: lJog1 },
          { x: L0 + jog, y: sy[0] - 30 },
          { x: L0, y: sy[0] - 30 },
        ],
        0,
        1.5
      );

      // Segment 2: hero → about (jog left then back)
      if (secs.length >= 2) {
        const j2start = sy[0] + 80;
        const j2mid = mid(0, 1) - 40;
        add(
          [
            { x: L0, y: sy[0] - 30 },
            { x: L0, y: j2start },
            { x: L0 - jog, y: j2start },
            { x: L0 - jog, y: j2mid },
            { x: L0, y: j2mid },
            { x: L0, y: sy[1] - 30 },
          ],
          sy[0] - 200,
          1.5
        );
      }

      // Segment 3: about → projects (jog right)
      if (secs.length >= 3) {
        const j3mid = mid(1, 2);
        add(
          [
            { x: L0, y: sy[1] - 30 },
            { x: L0, y: j3mid - 50 },
            { x: L0 + jog, y: j3mid - 50 },
            { x: L0 + jog, y: j3mid + 50 },
            { x: L0, y: j3mid + 50 },
            { x: L0, y: sy[2] - 30 },
          ],
          sy[1] - 200,
          1.5
        );
      }

      // Segment 4: projects → blog (jog left)
      if (secs.length >= 4) {
        const j4mid = mid(2, 3);
        add(
          [
            { x: L0, y: sy[2] - 30 },
            { x: L0, y: j4mid - 40 },
            { x: L0 - jog, y: j4mid - 40 },
            { x: L0 - jog, y: j4mid + 40 },
            { x: L0, y: j4mid + 40 },
            { x: L0, y: sy[3] - 30 },
          ],
          sy[2] - 200,
          1.5
        );
      }

      // Segment 5: blog → contact → bottom
      if (secs.length >= 5) {
        const j5mid = mid(3, 4);
        add(
          [
            { x: L0, y: sy[3] - 30 },
            { x: L0, y: j5mid },
            { x: L0 + jog, y: j5mid },
            { x: L0 + jog, y: sy[4] + 60 },
            { x: L0, y: sy[4] + 60 },
            { x: L0, y: pageH },
          ],
          sy[3] - 200,
          1.5
        );
      }

      // Left bus branches to section pads
      secs.forEach((_, i) => {
        add(
          [
            { x: L0, y: sy[i] },
            { x: L1, y: sy[i] },
            { x: L2, y: sy[i] },
          ],
          sy[i] - 200
        );
        pads.push({ x: L2, y: sy[i] });
      });

      // ===================================================
      // RIGHT BUS — broken into segments with jogs
      // ===================================================

      if (secs.length >= 2) {
        const rStart = sy[1] - 80;

        // Segment R1: start → projects (jog left)
        if (secs.length >= 3) {
          const rj1 = mid(1, 2);
          add(
            [
              { x: R0, y: rStart },
              { x: R0, y: rj1 - 45 },
              { x: R0 - jog, y: rj1 - 45 },
              { x: R0 - jog, y: rj1 + 45 },
              { x: R0, y: rj1 + 45 },
              { x: R0, y: sy[2] + 30 },
            ],
            rStart - 200,
            1.5
          );
        }

        // Segment R2: projects → blog (jog right)
        if (secs.length >= 4) {
          const rj2 = mid(2, 3);
          add(
            [
              { x: R0, y: sy[2] + 30 },
              { x: R0, y: rj2 - 35 },
              { x: R0 + jog * 0.5, y: rj2 - 35 },
              { x: R0 + jog * 0.5, y: rj2 + 35 },
              { x: R0, y: rj2 + 35 },
              { x: R0, y: sy[3] + 30 },
            ],
            sy[2] - 200,
            1.5
          );
        }

        // Segment R3: blog → bottom
        if (secs.length >= 5) {
          add(
            [
              { x: R0, y: sy[3] + 30 },
              { x: R0, y: mid(3, 4) - 30 },
              { x: R0 - jog, y: mid(3, 4) - 30 },
              { x: R0 - jog, y: mid(3, 4) + 30 },
              { x: R0, y: mid(3, 4) + 30 },
              { x: R0, y: pageH * 0.93 },
            ],
            sy[3] - 200,
            1.5
          );
        }

        // Right bus branches at sections 1, 2, 3
        [1, 2, 3].forEach((i) => {
          if (i < secs.length) {
            add(
              [
                { x: R0, y: sy[i] },
                { x: R1, y: sy[i] },
                { x: R2, y: sy[i] },
              ],
              sy[i] - 200
            );
            pads.push({ x: R2, y: sy[i] });
          }
        });
      }

      // ===================================================
      // LEFT → CENTER routing
      // ===================================================

      if (secs.length >= 2) {
        const y0 = mid(0, 1);
        add(
          [
            { x: L0, y: y0 },
            { x: L1, y: y0 },
            { x: L1, y: y0 + 50 },
            { x: L3, y: y0 + 50 },
            { x: L3, y: y0 + 120 },
            { x: M1, y: y0 + 120 },
          ],
          y0 - 200
        );
        pads.push({ x: M1, y: y0 + 120 });
      }

      // Center-left vertical with jog
      if (secs.length >= 3) {
        const startY = mid(0, 1) + 120;
        const endY = sy[2] - 40;
        const jogY = (startY + endY) / 2;
        add(
          [
            { x: M1, y: startY },
            { x: M1, y: jogY - 30 },
            { x: M1 + jog, y: jogY - 30 },
            { x: M1 + jog, y: jogY + 30 },
            { x: M1, y: jogY + 30 },
            { x: M1, y: endY },
          ],
          startY - 200,
          1
        );
      }

      // ===================================================
      // CENTER — cross-traces connecting left ↔ right
      // ===================================================

      // Cross-trace 1: at projects section
      if (secs.length >= 3) {
        const baseY = sy[2] - 40;
        add(
          [
            { x: M1, y: baseY },
            { x: M2 - 30, y: baseY },
            { x: M2 - 30, y: baseY + 35 },
            { x: M2 + 30, y: baseY + 35 },
            { x: M2 + 30, y: baseY + 50 },
            { x: R3, y: baseY + 50 },
          ],
          baseY - 250
        );
        pads.push({ x: M2, y: baseY + 35 });

        // Step down from R3 to right network
        add(
          [
            { x: R3, y: baseY + 50 },
            { x: R3, y: baseY + 90 },
            { x: R3 + jog, y: baseY + 90 },
            { x: R3 + jog, y: baseY + 130 },
            { x: R2, y: baseY + 130 },
          ],
          baseY - 100,
          1
        );
      }

      // Cross-trace 2: between blog and contact
      if (secs.length >= 5) {
        const crossY = mid(3, 4) + 20;
        add(
          [
            { x: L0, y: crossY },
            { x: L1, y: crossY },
            { x: L1, y: crossY + 40 },
            { x: L3, y: crossY + 40 },
            { x: L3, y: crossY + 80 },
            { x: M1, y: crossY + 80 },
            { x: M1, y: crossY + 40 },
            { x: M2, y: crossY + 40 },
          ],
          crossY - 200,
          1
        );
        pads.push({ x: M2, y: crossY + 40 });
      }

      // ===================================================
      // RIGHT step pattern between sections 2–3
      // ===================================================

      if (secs.length >= 4) {
        const baseY = mid(2, 3);
        add(
          [
            { x: R0, y: baseY },
            { x: R1, y: baseY },
            { x: R1, y: baseY + 35 },
            { x: R2, y: baseY + 35 },
            { x: R2, y: baseY + 70 },
            { x: R3, y: baseY + 70 },
          ],
          baseY - 200,
          1
        );
      }

      // ===================================================
      // DECORATIVE — forks, stubs, T-junctions, zigzags
      // ===================================================

      // T-fork above hero (left)
      if (secs.length >= 1) {
        const y = sy[0] - 80;
        add(
          [
            { x: L0, y },
            { x: L1 + 5, y },
            { x: L1 + 5, y: y - 30 },
          ],
          0,
          1
        );
        add(
          [
            { x: L1 + 5, y },
            { x: L1 + 5, y: y + 30 },
            { x: L2, y: y + 30 },
          ],
          0,
          1
        );
      }

      // Zigzag off left bus between about–projects
      if (secs.length >= 3) {
        const y = sy[1] + 80;
        add(
          [
            { x: L0, y },
            { x: L1, y },
            { x: L1, y: y + 25 },
            { x: L2, y: y + 25 },
            { x: L2, y: y + 50 },
            { x: L3, y: y + 50 },
          ],
          y - 200,
          1
        );
      }

      // T-fork off right bus at section 2
      if (secs.length >= 3) {
        const y = sy[2] + 60;
        add(
          [
            { x: R0, y },
            { x: R1 - 5, y },
            { x: R1 - 5, y: y - 25 },
          ],
          y - 200,
          1
        );
        add(
          [
            { x: R1 - 5, y },
            { x: R1 - 5, y: y + 25 },
            { x: R2, y: y + 25 },
          ],
          y - 200,
          1
        );
      }

      // Step branch near bottom (left side)
      if (secs.length >= 4) {
        const y = mid(3, 4);
        add(
          [
            { x: L0, y },
            { x: L1, y },
            { x: L1, y: y + 30 },
            { x: L2, y: y + 30 },
            { x: L2, y: y + 60 },
            { x: L3, y: y + 60 },
          ],
          y - 200,
          1
        );
      }

      // Center stub with jog between sections 1–2
      if (secs.length >= 3) {
        const y = mid(1, 2) - 40;
        add(
          [
            { x: M1, y },
            { x: M1 + 30, y },
            { x: M1 + 30, y: y + 25 },
            { x: M1 + 50, y: y + 25 },
            { x: M1 + 50, y: y + 50 },
          ],
          y - 200,
          1
        );
      }

      // Bottom right zigzag
      if (secs.length >= 5) {
        const y = sy[4] - 50;
        add(
          [
            { x: R0, y },
            { x: R1, y },
            { x: R1, y: y + 30 },
            { x: R2, y: y + 30 },
            { x: R2, y: y + 60 },
            { x: R3, y: y + 60 },
            { x: R3, y: y + 90 },
          ],
          y - 200,
          1
        );
      }

      // Extra right-to-center branch at about section
      if (secs.length >= 2) {
        const y = sy[1] + 40;
        add(
          [
            { x: R0, y },
            { x: R1, y },
            { x: R1, y: y - 30 },
            { x: R2 - 20, y: y - 30 },
          ],
          y - 200,
          1
        );
      }

      // Small stub off left bus near hero
      if (secs.length >= 1) {
        const y = sy[0] + 40;
        add(
          [
            { x: L0, y },
            { x: L1, y },
            { x: L1, y: y + 20 },
          ],
          sy[0] - 100,
          1
        );
      }

      // Parallel trace fragment near projects (left side)
      if (secs.length >= 3) {
        const y = sy[2] + 30;
        add(
          [
            { x: L2, y: sy[2] },
            { x: L2, y },
            { x: L3, y },
            { x: L3, y: y + 40 },
          ],
          sy[2] - 200,
          1
        );
      }

      return { traces, pads };
    };

    let geometry = buildPaths();

    // Path math
    const pathLength = (pts: Point[]) => {
      let len = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
      }
      return len;
    };

    const pointAtT = (pts: Point[], t: number): Point => {
      const total = pathLength(pts);
      const target = total * Math.max(0, Math.min(1, t));
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        const seg = Math.sqrt(dx * dx + dy * dy);
        if (acc + seg >= target) {
          const f = seg > 0 ? (target - acc) / seg : 0;
          return { x: pts[i - 1].x + dx * f, y: pts[i - 1].y + dy * f };
        }
        acc += seg;
      }
      return pts[pts.length - 1];
    };

    const partialPath = (pts: Point[], progress: number): Point[] => {
      if (progress <= 0) return [];
      const total = pathLength(pts);
      const drawLen = total * Math.min(progress, 1);
      const out: Point[] = [pts[0]];
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        const seg = Math.sqrt(dx * dx + dy * dy);
        if (acc + seg <= drawLen) {
          out.push(pts[i]);
          acc += seg;
        } else {
          const rem = drawLen - acc;
          const f = seg > 0 ? rem / seg : 0;
          out.push({
            x: pts[i - 1].x + dx * f,
            y: pts[i - 1].y + dy * f,
          });
          break;
        }
      }
      return out;
    };

    // Drawing
    const strokePath = (
      screenPts: Point[],
      width: number,
      alpha: number,
      blur: number
    ) => {
      if (screenPts.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i < screenPts.length; i++) {
        ctx.lineTo(screenPts[i].x, screenPts[i].y);
      }
      ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (blur > 0) {
        ctx.shadowColor = GREEN;
        ctx.shadowBlur = blur;
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawTrace = (
      pts: Point[],
      progress: number,
      width: number,
      scrollY: number,
      viewH: number,
      dim: boolean
    ) => {
      const drawn = partialPath(pts, progress);
      if (drawn.length < 2) return;
      const screen = drawn.map((p) => ({ x: p.x, y: p.y - scrollY }));
      if (screen.every((p) => p.y < -50 || p.y > viewH + 50)) return;

      const a = 0.18;
      strokePath(screen, width + 10, a * 0.12, 25);
      strokePath(screen, width + 4, a * 0.25, 12);
      strokePath(screen, width, a, 4);
    };

    const drawPad = (
      pos: Point,
      scrollY: number,
      viewH: number,
      active: boolean,
      time: number
    ) => {
      const sy = pos.y - scrollY;
      if (sy < -40 || sy > viewH + 40) return;
      ctx.save();

      if (active) {
        for (let k = 0; k < 2; k++) {
          const phase = (Math.sin(time * 2.5 + k * 1.8) + 1) / 2;
          const r = 10 + phase * 14;
          const a = 0.35 * (1 - phase);
          ctx.beginPath();
          ctx.arc(pos.x, sy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 65, ${a})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(pos.x, sy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = active ? GREEN : "rgba(0, 255, 65, 0.2)";
      ctx.lineWidth = 1.5;
      if (active) {
        ctx.shadowColor = GREEN;
        ctx.shadowBlur = 18;
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pos.x, sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = active ? GREEN : "rgba(0, 255, 65, 0.25)";
      if (active) {
        ctx.shadowColor = GREEN;
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.restore();
    };

    const drawVia = (pos: Point, scrollY: number, viewH: number) => {
      const sy = pos.y - scrollY;
      if (sy < -10 || sy > viewH + 10) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, sy, 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 255, 65, 0.2)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pos.x, sy, 1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 65, 0.2)";
      ctx.fill();
      ctx.restore();
    };

    const drawSignalDot = (
      pathPts: Point[],
      t: number,
      scrollY: number,
      viewH: number,
      alpha: number
    ) => {
      const pos = pointAtT(pathPts, t);
      const sy = pos.y - scrollY;
      if (sy < -10 || sy > viewH + 10) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, sy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 65, ${alpha * 0.5})`;
      ctx.shadowColor = GREEN;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pos.x, sy, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 255, 220, ${alpha * 0.8})`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    };

    // Render loop
    const render = () => {
      const now = performance.now() / 1000;
      const scrollTop = window.scrollY;
      const viewH = window.innerHeight;
      const w = window.innerWidth;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, viewH);

      const { traces, pads } = geometry;
      if (traces.length === 0) {
        geometry = buildPaths();
        animRef.current = requestAnimationFrame(render);
        return;
      }

      // Each trace draws based on when scroll reaches its triggerY
      const drawWindow = viewH * 0.5;

      traces.forEach((tp, i) => {
        const reached = scrollTop + viewH * 0.65;
        const progress = (reached - tp.triggerY) / drawWindow;
        const p = Math.max(0, Math.min(1, progress));
        if (p > 0) {
          drawTrace(tp.points, p, tp.width, scrollTop, viewH, tp.dim);
        }

        // Vias at joints
        if (p >= 1) {
          tp.points.forEach((pt, j) => {
            if (j > 0 && j < tp.points.length - 1) {
              drawVia(pt, scrollTop, viewH);
            }
          });
        }
      });

      // Pads
      pads.forEach((pad) => {
        const reached = scrollTop + viewH * 0.6 > pad.y;
        const active =
          scrollTop + viewH * 0.35 > pad.y &&
          scrollTop < pad.y + viewH * 0.35;
        if (reached) drawPad(pad, scrollTop, viewH, active, now);
      });

      // Signals
      if (now - lastSignalSpawn > 0.5 && scrollTop > 10) {
        lastSignalSpawn = now;
        const eligible = traces
          .map((tp, i) => ({ tp, i }))
          .filter(({ tp }) => {
            const reached = scrollTop + viewH * 0.65;
            return (reached - tp.triggerY) / drawWindow >= 0.8;
          });
        if (eligible.length > 0) {
          const { i: pi } =
            eligible[Math.floor(Math.random() * eligible.length)];
          signals.push({
            pathIndex: pi,
            t: 0,
            speed: 0.2 + Math.random() * 0.5,
            brightness: 0.5 + Math.random() * 0.5,
          });
        }
      }

      for (let i = signals.length - 1; i >= 0; i--) {
        const s = signals[i];
        s.t += s.speed / 60;
        if (s.t > 1) {
          signals.splice(i, 1);
          continue;
        }
        const tp = traces[s.pathIndex];
        if (tp) {
          const fade =
            s.brightness *
            Math.min(s.t * 6, 1) *
            Math.min((1 - s.t) * 6, 1);
          drawSignalDot(tp.points, s.t, scrollTop, viewH, fade);
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    const rebuildTimer = setTimeout(() => {
      geometry = buildPaths();
    }, 500);

    animRef.current = requestAnimationFrame(render);

    const onResize = () => {
      if (window.innerWidth < 768) {
        canvas.style.display = "none";
        return;
      }
      canvas.style.display = "";
      resize();
      geometry = buildPaths();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(rebuildTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2] hidden md:block"
      aria-hidden="true"
    />
  );
}
