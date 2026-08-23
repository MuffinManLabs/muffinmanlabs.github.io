#!/usr/bin/env bash
# Export the KiCad board as a web-ready 3D model.
#
#   bash scripts/export-board-3d.sh
#
# Everything that is visible on the real board goes in: components, board body,
# soldermask, silkscreen, copper tracks, pads, zones and filled vias. Inner
# copper is deliberately left out — the board body is opaque, so it would be
# invisible geometry.
#
# KiCad writes an ~11 MB GLB; gltf-transform dedupes, welds, joins and Draco-
# compresses it to ~430 KB with the geometry fully intact (no mesh
# simplification, so nothing is distorted). Re-run after a board revision.
set -euo pipefail

KICAD_CLI="/c/Program Files/KiCad/10.0/bin/kicad-cli.exe"
PCB="C:/Users/huray/dev/PCB_Design/projects/ESP32S3_PlantMonitor_RevA/hardware/ESP32S3_PlantMonitor.kicad_pcb"
RAW="$(mktemp -d)/board.glb"
OUT="public/boards/mml01.glb"

"$KICAD_CLI" pcb export glb \
  --output "$RAW" --force --no-dnp --subst-models \
  --include-tracks --include-pads --include-zones \
  --include-silkscreen --include-soldermask --fill-all-vias "$PCB"

npx gltf-transform optimize "$RAW" "$OUT" \
  --compress draco --no-texture-compress --simplify false

ls -la "$OUT"
