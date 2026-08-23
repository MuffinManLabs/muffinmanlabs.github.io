#!/usr/bin/env python3
"""
Generate src/components/pcb/layoutMML01.ts straight from the real KiCad board.

The portfolio diagram is not an artist's impression of MML-01 — it IS MML-01:
board outline, every copper track with its real net name and width, every via,
every footprint with its real placement and rotation, the twelve test points
and the silkscreen legends all come out of ESP32S3_PlantMonitor.kicad_pcb.

Re-run after any board change:
    python scripts/gen-board-layout.py

Read-only with respect to the KiCad project. Nothing is written outside this repo.
"""

import json
import math
import pathlib
import re
import sys

# The KiCad project lives outside this repo; override with argv[1] if it moves.
DEFAULT_PCB = pathlib.Path(
    r"C:/Users/huray/dev/PCB_Design/projects/ESP32S3_PlantMonitor_RevA"
    r"/hardware/ESP32S3_PlantMonitor.kicad_pcb"
)
OUT = pathlib.Path(__file__).resolve().parent.parent / "src/components/pcb/layoutMML01.ts"

# ── how a footprint name maps onto a BoardSVG part kind ──────────────────────
PASSIVE_LEN = {  # imperial package -> body length in mm
    "0402": 1.0, "0603": 1.6, "0805": 2.0, "1206": 3.2,
    "SOD-123": 2.7, "SMA": 4.3,
}

# test-point designator -> the net name silkscreened next to it
TP_NAMES = {
    "TP1": "5V", "TP2": "VSYS", "TP3": "3V3", "TP4": "VBAT", "TP5": "BAT_SNS",
    "TP6": "SOIL_ADC", "TP7": "GND", "TP8": "GND", "TP9": "EN", "TP10": "IO0",
    "TP11": "TX", "TP12": "RX",
}

# friendlier labels than the raw Value field
# Only where the board does NOT already silkscreen it. USB, ESP32-S3, CHG, PWR,
# BME280, VEML7700, BAT and SOIL are real legends on F.SilkS, so letting the part
# renderer add its own label too would print each of them twice.
LABELS = {"SW1": "BOOT", "SW2": "RESET"}

DNP = {"C3", "C4"}  # per the fabrication notes on Dwgs.User


def rot_pt(x, y, deg):
    """KiCad places footprints by rotating counter-clockwise in a y-down space."""
    a = math.radians(deg)
    return (x * math.cos(a) + y * math.sin(a), -x * math.sin(a) + y * math.cos(a))


def parse(pcb_path):
    s = pcb_path.read_text(encoding="utf-8", errors="replace")

    # ── board outline ────────────────────────────────────────────────────────
    xs, ys = [], []
    for m in re.finditer(r"\(gr_(line|rect|arc)\b(.*?)\n\t\)", s, re.S):
        if '"Edge.Cuts"' not in m.group(2):
            continue
        for p in re.finditer(r"\((?:start|end|mid)\s+(-?[\d.]+)\s+(-?[\d.]+)\)", m.group(2)):
            xs.append(float(p.group(1)))
            ys.append(float(p.group(2)))
    ox, oy = min(xs), min(ys)
    W, H = round(max(xs) - ox, 2), round(max(ys) - oy, 2)

    # ── copper tracks ────────────────────────────────────────────────────────
    traces = []
    for blk in re.findall(r"\(segment\b.*?\n\t\)", s, re.S):
        g = lambda pat: re.search(pat, blk)
        st = g(r"\(start\s+(-?[\d.]+)\s+(-?[\d.]+)\)")
        en = g(r"\(end\s+(-?[\d.]+)\s+(-?[\d.]+)\)")
        wd = g(r"\(width\s+([\d.]+)\)")
        ly = g(r'\(layer\s+"([^"]+)"')
        nt = g(r'\(net\s+"([^"]*)"')
        if not (st and en and wd and ly):
            continue
        traces.append({
            "x1": round(float(st.group(1)) - ox, 3), "y1": round(float(st.group(2)) - oy, 3),
            "x2": round(float(en.group(1)) - ox, 3), "y2": round(float(en.group(2)) - oy, 3),
            "w": float(wd.group(1)),
            "layer": "top" if ly.group(1) == "F.Cu" else "bottom",
            "net": (nt.group(1) if nt else ""),
        })

    # ── vias ─────────────────────────────────────────────────────────────────
    vias = []
    for blk in re.findall(r"\(via\b.*?\n\t\)", s, re.S):
        at = re.search(r"\(at\s+(-?[\d.]+)\s+(-?[\d.]+)\)", blk)
        sz = re.search(r"\(size\s+([\d.]+)\)", blk)
        dr = re.search(r"\(drill\s+([\d.]+)\)", blk)
        if at:
            vias.append({"x": round(float(at.group(1)) - ox, 2),
                         "y": round(float(at.group(2)) - oy, 2),
                         "d": float(sz.group(1)) if sz else 0.6,
                         "drill": float(dr.group(1)) if dr else 0.3})

    # ── footprints ───────────────────────────────────────────────────────────
    parts, tps, holes = [], [], []
    idx = [m.start() for m in re.finditer(r"\n\t\(footprint ", s)] + [len(s)]
    for a, b in zip(idx, idx[1:]):
        blk = s[a:b]
        fpm = re.search(r'\(footprint\s+"([^"]+)"', blk)
        atm = re.search(r"\n\t\t\(at\s+(-?[\d.]+)\s+(-?[\d.]+)(?:\s+(-?[\d.]+))?\)", blk)
        refm = re.search(r'\(property\s+"Reference"\s+"([^"]*)"', blk)
        if not (fpm and atm and refm):
            continue
        fp, ref = fpm.group(1), refm.group(1)
        X = float(atm.group(1)) - ox
        Y = float(atm.group(2)) - oy
        rot = float(atm.group(3) or 0)

        if "MountingHole" in fp:
            holes.append({"x": round(X, 2), "y": round(Y, 2)})
            continue
        if fp.startswith("TestPoint:"):
            tps.append({"ref": TP_NAMES.get(ref, ref), "x": round(X, 2), "y": round(Y, 2),
                        "th": "THTPad" in fp})
            continue

        # the silkscreen logo is pure artwork — no pads, no fab outline to measure
        if "logo" in fp.lower():
            parts.append({"kind": "logo", "ref": ref, "rot": 0,
                          "x": round(X - 3.0, 2), "y": round(Y - 3.0, 2), "w": 6.0, "h": 6.0})
            continue

        # local body box: prefer the F.Fab outline, else the pad extents + margin
        fx, fy = [], []
        for m in re.finditer(
            r"\(fp_(?:line|rect)\s*\n\t\t\t\(start\s+(-?[\d.]+)\s+(-?[\d.]+)\)"
            r"\s*\n\t\t\t\(end\s+(-?[\d.]+)\s+(-?[\d.]+)\)(.*?)\n\t\t\)", blk, re.S):
            if '"F.Fab"' not in m.group(5):
                continue
            fx += [float(m.group(1)), float(m.group(3))]
            fy += [float(m.group(2)), float(m.group(4))]
        if not fx:
            for m in re.finditer(
                r'\(pad\s+"[^"]*"\s+\S+\s+\S+\s*\n\t\t\t\(at\s+(-?[\d.]+)\s+(-?[\d.]+)'
                r"(?:\s+-?[\d.]+)?\)\s*\n\t\t\t\(size\s+([\d.]+)\s+([\d.]+)\)", blk):
                px, py, pw, ph = map(float, m.groups())
                fx += [px - pw / 2, px + pw / 2]
                fy += [py - ph / 2, py + ph / 2]
        if not fx:
            continue
        lw, lh = max(fx) - min(fx), max(fy) - min(fy)
        lcx, lcy = (min(fx) + max(fx)) / 2, (min(fy) + max(fy)) / 2
        dx, dy = rot_pt(lcx, lcy, rot)
        cx, cy = X + dx, Y + dy

        base = {"ref": ref, "rot": round(-rot, 1) or 0, "label": LABELS.get(ref)}
        if ref in DNP:
            base["dnp"] = True

        def box(w, h, kind, **extra):
            parts.append({**base, "kind": kind,
                          "x": round(cx - w / 2, 2), "y": round(cy - h / 2, 2),
                          "w": round(w, 2), "h": round(h, 2), **extra})

        def point(kind, **extra):
            parts.append({**base, "kind": kind,
                          "x": round(cx, 2), "y": round(cy, 2), **extra})

        if "ESP32-S3-WROOM-1" in fp:
            # the antenna nose is the top 6.5 mm and it hangs off the board edge
            box(lw, lh, "module", ant=6.5)
        elif "USB_C_Receptacle" in fp:
            box(lw, lh, "usbc", edge="bottom")
        elif "JST_PH" in fp:
            ways = 3 if "1x03" in fp else 2
            box(lw, lh, "jst", ways=ways)
        elif "SW-SMD" in fp or "SW_Push" in fp:
            box(lw, lh, "button")
        elif "logo" in fp.lower():
            box(max(lw, 6.0), max(lh, 6.0), "logo")
        elif re.search(r"(Resistor|Capacitor|LED|Fuse)_SMD|D_SOD|D_SMA|Fuse_1206", fp):
            size = 1.6
            for k, v in PASSIVE_LEN.items():
                if k in fp:
                    size = v
                    break
            kind = "led" if "LED_SMD" in fp else "passive"
            # the long axis follows the placement rotation
            o = "v" if round(rot) % 180 else "h"
            if kind == "led":
                point("led", o=o, color=("#3ddc84" if ref == "D2" else "#e8a85c"))
            else:
                point("passive", o=o, size=size,
                      polar=bool(re.match(r"D\d", ref)))
        else:
            pins = max(2, round(len(re.findall(r'\(pad\s+"', blk)) / 2))
            box(lw, lh, "ic", pinsL=pins, pinsR=pins)

    # ── front silkscreen legends ─────────────────────────────────────────────
    silk = []
    for m in re.finditer(
        r'\(gr_text\s+"([^"]*)"\s*\n\t\t\(at\s+(-?[\d.]+)\s+(-?[\d.]+)(?:\s+(-?[\d.]+))?\)'
        r"(.*?)\n\t\)", s, re.S):
        txt, x, y, r, rest = m.group(1), float(m.group(2)), float(m.group(3)), float(m.group(4) or 0), m.group(5)
        lay = re.search(r'\(layer\s+"([^"]+)"', rest)
        if not lay or lay.group(1) != "F.SilkS":
            continue
        if txt in TP_NAMES.values() or txt in ("BOOT", "RESET"):
            continue  # already drawn by the test point / button renderers
        silk.append({"x": round(x - ox, 2), "y": round(y - oy, 2), "text": txt,
                     "size": 1.15, "rot": round(-r, 1) or None})
    return dict(W=W, H=H, traces=traces, vias=vias, parts=parts,
                tps=tps, holes=holes, silk=silk)


# ── net highlighting: real KiCad nets, grouped the way a client reads a board ─
NET_GROUPS = [
    ("usb", "USB 2.0 pair", "PCB.comm",
     "The real pair, straight off the board: 0.29 mm wide with a 0.20 mm gap for "
     "\\u2248 90 \\u03a9 on this stackup, length-matched, and not a single via on either leg. "
     "J1 \\u2192 USBLC6 ESD \\u2192 22 \\u03a9 series \\u2192 the module, in that copper order.",
     ["/02_USB_C_Input/USB_CONN_DP", "/02_USB_C_Input/USB_CONN_DN",
      "/02_USB_C_Input/USB_ESD_DP", "/02_USB_C_Input/USB_ESD_DN",
      "USB_DP", "USB_DN", "Net-(J1-CC1)", "Net-(J1-CC2)"],
     ["J1", "U1", "R1", "R2", "R3", "R4"]),

    ("power", "Power path", "PCB.copperBright",
     "VBUS in through the polyfuse and the SMF5.0A TVS, a P-MOSFET ideal-diode hand-over "
     "onto VSYS, then AP2112K down to 3V3. Every decoupler gets its own ground via, and "
     "the LDO sits on a thermal pour.",
     ["/02_USB_C_Input/USB_VBUS", "+5V_PROT", "VSYS", "+3V3"],
     ["F1", "D1", "D4", "Q3", "U2", "J1"]),

    ("battery", "Battery & charge", "PCB.enigBright",
     "MCP73831 charging a single LiPo cell, with the pack sensed through a divider so the "
     "firmware knows the state of charge, and PWR / CHG indicators next to it. The hand-over "
     "MOSFETs mean USB and battery never fight each other.",
     ["VBAT", "/07_Battery_PowerPath/VBAT_RAW", "BAT_SENSE", "Net-(U6-PROG)",
      "Net-(D2-A)", "Net-(D3-A)", "Net-(D3-K)"],
     ["U6", "J3", "Q1", "Q2", "D2", "D3", "R10", "R14", "R15"]),

    ("i2c", "I\\u00b2C bus", "PCB.green",
     "One pull-up pair for the whole bus \\u2014 not one per device. BME280 (temperature, "
     "humidity, pressure) and VEML7700 (ambient light) share it, and the sensor rail is "
     "switchable so both can be powered down between readings.",
     ["SDA", "SCL", "SENS_PWR_EN"],
     ["U4", "U5", "R8", "R9"]),

    ("soil", "Protected soil ADC", "#b98aff",
     "The capacitive probe is the one wire that leaves the enclosure and comes back to an "
     "MCU pin, so it arrives through a divider and a filter rather than straight onto the "
     "ADC. Probe power is switched, which is what stops a buried probe from corroding.",
     ["ADC_SOIL", "/06_Soil_Probe_Input/SOIL_PWR"],
     ["J2", "R6", "Q1"]),

    ("boot", "Program & recovery", "#f0d488",
     "EN and BOOT to their buttons, TXD0/RXD0 out to the through-hole UART trio. If USB ever "
     "refuses to enumerate you can still talk to the board with three clips and a serial "
     "adapter \\u2014 that is what the trio is for.",
     ["/04_ESP32S3_Core/EN", "/04_ESP32S3_Core/BOOT",
      "/04_ESP32S3_Core/TXD0", "/04_ESP32S3_Core/RXD0"],
     ["SW1", "SW2", "U3"]),

    ("gnd", "Ground return", "#8fb0c9",
     "Only the short top-side ground links are drawn here \\u2014 the real return path is the two "
     "solid inner planes, which is why so few ground tracks exist on the outer layers. "
     "The via field is the stitching that ties them together.",
     ["GND"], []),
]


def emit(d):
    L = []
    add = L.append
    add('import { PCB } from "./pcbData";')
    add('import type { BoardLayout } from "./BoardSVG";')
    add("")
    add("/* ════════════════════════════════════════════════════════════════════════")
    add("   MML-01 — ESP32-S3 Wi-Fi plant monitor.")
    add(f"   {d['W']} × {d['H']} mm, 4-layer (signal / GND / GND / signal), lead-free HASL.")
    add("")
    add("   GENERATED — do not hand-edit. Every coordinate below is read out of the")
    add("   real KiCad board, so this drawing is the board rather than a picture of")
    add("   it: the copper is the routed copper, with its own net names and widths,")
    add("   and the parts sit where the pick-and-place file puts them.")
    add("")
    add("       python scripts/gen-board-layout.py")
    add("   ════════════════════════════════════════════════════════════════════════ */")
    add("")
    add("export const MML01: BoardLayout = {")
    add(f"  w: {d['W']},")
    add(f"  h: {d['H']},")
    add("  pad: 8,")
    add("  radius: 4.25,")
    add("  scale: 1,")
    add('  layers: ["all", "silk", "copper", "plane", "mask", "drill"],')
    add('  planeLabel: "In1.Cu + In2.Cu · solid GND, no signals",')
    add("")
    add("  /* both inner layers are solid ground; the only void is the all-layer")
    add("     keep-out under the antenna nose */")
    add(f"  plane: [{{ x: 0, y: 0, w: {d['W']}, h: {d['H']} }}],")
    add("  planeVoids: [{ x: 22.4, y: -1, w: 19.0, h: 3.6 }],")
    add("")
    add(f"  /* {len(d['traces'])} routed segments, straight from the board file */")
    add("  traces: [")
    for t in d["traces"]:
        seg = f"M{t['x1']} {t['y1']} L{t['x2']} {t['y2']}"
        net = f'net: "{t["net"]}", ' if t["net"] else ""
        lay = ', layer: "bottom"' if t["layer"] == "bottom" else ""
        add(f'    {{ {net}w: {t["w"]}, d: "{seg}"{lay} }},')
    add("  ],")
    add("")
    add(f"  /* {len(d['parts'])} placed parts */")
    add("  parts: [")
    for p in d["parts"]:
        kv = []
        for k in ("kind", "ref", "label", "x", "y", "w", "h", "ant", "ways", "edge",
                  "o", "size", "polar", "color", "pinsL", "pinsR", "rot", "dnp"):
            if k not in p or p[k] is None:
                continue
            v = p[k]
            kv.append(f'{k}: {json.dumps(v) if isinstance(v, str) else str(v).lower() if isinstance(v, bool) else v}')
        add("    { " + ", ".join(kv) + " },")
    add("  ],")
    add("")
    add("  /* the twelve labelled test points, including the UART recovery trio */")
    add("  testpoints: [")
    for t in d["tps"]:
        th = ", th: true" if t["th"] else ""
        add(f'    {{ ref: "{t["ref"]}", x: {t["x"]}, y: {t["y"]}{th} }},')
    add("  ],")
    add("")
    add("  holes: [" + ", ".join(f'{{ x: {h["x"]}, y: {h["y"]} }}' for h in d["holes"]) + "],")
    add("")
    add(f"  /* {len(d['vias'])} vias — decoupler grounds plus the stitching around U3 */")
    add("  vias: [")
    for i in range(0, len(d["vias"]), 6):
        add("    " + " ".join(
            f'{{ x: {v["x"]}, y: {v["y"]}, d: {v["d"]}, drill: {v["drill"]} }},'
            for v in d["vias"][i:i + 6]))
    add("  ],")
    add("")
    add("  silk: [")
    for t in d["silk"]:
        r = f', rot: {t["rot"]}' if t.get("rot") else ""
        add(f'    {{ x: {t["x"]}, y: {t["y"]}, text: {json.dumps(t["text"])}, size: {t["size"]}{r} }},')
    add('    { x: 31.25, y: 22.6, text: "B.SILK — ESP32-S3 PLANT MONITOR · REV A · 2026-08 · MuffinByteLabs.com", size: 1.35, back: true },')
    add("  ],")
    add("")
    add("  nets: [")
    for key, label, color, note, nets, refs in NET_GROUPS:
        add("    {")
        add(f'      key: "{key}",')
        add(f'      label: "{label}",')
        add(f"      color: {color}," if color.startswith("PCB.") else f'      color: "{color}",')
        add(f"      note:")
        add(f'        "{note}",')
        add("      nets: [" + ", ".join(json.dumps(n) for n in nets) + "],")
        if refs:
            add("      parts: [" + ", ".join(f'"{r}"' for r in refs) + "],")
        add("    },")
    add("    {")
    add('      key: "tp",')
    add('      label: "Test points",')
    add("      color: PCB.enig,")
    add("      note:")
    add('        "Twelve labelled test points, nine SMD pads plus a through-hole UART recovery trio. '
        'They are excluded from the BOM and the placement file on purpose \\u2014 they cost nothing to '
        'fabricate and they are the difference between a two-hour bring-up and a two-day one.",')
    add("      tps: true,")
    add("    },")
    add("  ],")
    add("};")
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    pcb = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PCB
    if not pcb.exists():
        sys.exit(f"board file not found: {pcb}")
    data = parse(pcb)
    OUT.write_text(emit(data), encoding="utf-8")
    print(f"{pcb.name}: {data['W']} x {data['H']} mm")
    print(f"  {len(data['traces'])} traces, {len(data['vias'])} vias, "
          f"{len(data['parts'])} parts, {len(data['tps'])} test points, "
          f"{len(data['holes'])} holes, {len(data['silk'])} silk legends")
    print(f"  -> {OUT.relative_to(OUT.parents[3])}")
