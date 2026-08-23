"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   Board3D — the real KiCad board, rotatable.

   The model is exported straight out of KiCad by scripts/export-board-3d.sh
   — components, board body, soldermask, silkscreen, tracks, pads, zones and
   filled vias — then Draco-compressed from ~11 MB down to ~430 KB. Nothing
   loads until the visitor asks for it: three.js and the model are both
   dynamically imported on click, so a reader who never touches it pays
   nothing.
   ════════════════════════════════════════════════════════════════════════ */
type State = "idle" | "loading" | "ready" | "error";

/* ── the board's finish, in sRGB ─────────────────────────────────────────
   KiCad's own mask colour renders as a pale mint, because the mask is
   translucent and what sits underneath it is a 95 000-triangle copper pour
   covering nearly the whole 62.5 x 44.5 mm board. However dark the mask is
   made, that pour bleeds through the alpha and drags the whole surface
   yellow-green — so getting a genuinely dark board means turning three dials
   together: a deep mask colour, a mask opaque enough that only a little
   copper shows, and a copper albedo dialled back from KiCad's near-neon
   yellow to something closer to real ENIG. The bleed that survives is what
   makes the tracks legible as slightly warmer green under the mask, exactly
   as they are on the real board. */
const MASK_GREEN = 0x0c3a1e; // soldermask — deep, faintly blue-shifted green
const MASK_OPACITY = 0.92; // just open enough for the copper to read through
const FR4_BODY = 0x2a2a1c; // substrate: dark khaki, so the mask stays dark
const SILK_WHITE = 0xf2f0e6;
/* how far KiCad's warm metals get pulled back; 1.0 is its own bright gold */
const METAL_GAIN = 0.62;

/* the tilt that puts the component side toward the camera; glTF is Y-up and
   KiCad puts the top face on +Y, so a positive rotation about X swings that
   face toward the viewer. Subtracting a half-turn shows the bare underside. */
const TILT = Math.PI / 2.9;
const YAW = -0.32;

export default function Board3D({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const prefetchRef = useRef<Promise<unknown> | null>(null);
  const apiRef = useRef<{ reset: () => void; flip: () => void } | null>(null);
  const [state, setState] = useState<State>("idle");
  const [flipped, setFlipped] = useState(false);

  useEffect(() => () => cleanupRef.current?.(), []);

  /* three.js and the model are ~1 MB between them. Start pulling them the
     moment the pointer lands on the button, so the click itself feels
     instant — and never before that. */
  const prefetch = useCallback(() => {
    if (prefetchRef.current) return prefetchRef.current;
    prefetchRef.current = Promise.all([
      import("three"),
      import("three/examples/jsm/loaders/GLTFLoader.js"),
      import("three/examples/jsm/loaders/DRACOLoader.js"),
      import("three/examples/jsm/controls/OrbitControls.js"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
    ]);
    return prefetchRef.current;
  }, []);

  async function load() {
    if (state !== "idle") return;
    setState("loading");
    try {
      const [THREE, { GLTFLoader }, { DRACOLoader }, { OrbitControls }, { RoomEnvironment }] =
        (await prefetch()) as [
          typeof import("three"),
          typeof import("three/examples/jsm/loaders/GLTFLoader.js"),
          typeof import("three/examples/jsm/loaders/DRACOLoader.js"),
          typeof import("three/examples/jsm/controls/OrbitControls.js"),
          typeof import("three/examples/jsm/environments/RoomEnvironment.js"),
        ];

      const mount = mountRef.current;
      if (!mount) return;

      const scene = new THREE.Scene();
      scene.background = null;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      /* ACES rolls bright highlights toward white, which on a glossy
         soldermask turns the grazing edge of the board into a pale wash and
         undoes the dark finish. Khronos' neutral tone map is the one built
         for product renders: it compresses the same range while holding hue,
         so the green stays green all the way into the highlight. */
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.0;
      mount.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(
        34,
        mount.clientWidth / mount.clientHeight,
        0.001,
        10
      );

      /* KiCad exports almost every surface as metalness 1.0, and a metal with
         nothing to reflect renders as a flat dark blob. A small procedural
         studio environment gives the gold pads and the module can something
         to pick up, which is most of what makes this look like a photograph
         rather than a diagram. */
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environmentIntensity = 0.45;
      scene.environment = envRT.texture;

      /* directional lights on top of the environment for shape and highlights */
      scene.add(new THREE.HemisphereLight(0xffffff, 0x35301f, 0.28));
      const key = new THREE.DirectionalLight(0xfff4e2, 1.15);
      key.position.set(60, 90, 70);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdfe8ff, 0.32);
      fill.position.set(-70, 40, -50);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffd9a0, 0.25);
      rim.position.set(-20, -50, -60);
      scene.add(rim);

      const draco = new DRACOLoader();
      // self-hosted so the page has no third-party dependency at runtime
      draco.setDecoderPath("/draco/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);

      const gltf = await loader.loadAsync(src);
      const board = gltf.scene;

      /* ── material pass ──────────────────────────────────────────────────
         KiCad's glTF gives every surface `doubleSided: true` and, for
         everything except the mask / body / silk, leaves metalness and
         roughness unset — which glTF defines as fully metallic and fully
         rough. That combination renders as a dead grey blob, so each family
         gets corrected here:

         1. FrontSide everywhere, or the back-side silkscreen punches through
            the board as mirrored text.
         2. The three non-metallic materials are the soldermask, the FR-4
            body and the silkscreen. The mask is the one with a strong green
            bias; the body is the yellower green next to it; the silk is the
            near-white. All three get an explicit colour so the board's
            finish is a decision rather than whatever KiCad defaulted to.
         3. Everything else is nominally metal. Rough-1.0 metal is lifeless,
            so it gets a real roughness — and the near-black materials (IC
            bodies, connector shrouds, drill interiors) are plastic in
            reality, so they lose most of their metalness instead of
            rendering as black mirrors. */
      const seen = new Set<unknown>();
      board.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          if ("side" in m) m.side = THREE.FrontSide;
          if (!(m instanceof THREE.MeshStandardMaterial)) return;
          /* Meshes share materials — the module alone reuses the same black
             plastic a dozen times. Classifying per mesh means the second pass
             re-reads a metalness this pass has already lowered and files the
             material somewhere else entirely, which is how the silkscreen
             ended up painted the colour of the substrate. Once each. */
          if (seen.has(m)) return;
          seen.add(m);

          const { r, g, b } = m.color;

          if (m.metalness < 0.5) {
            if (r > 0.85 && g > 0.85 && b > 0.85) {
              /* silkscreen */
              m.color.setHex(SILK_WHITE);
              m.roughness = 0.82;
              m.polygonOffset = true;
              m.polygonOffsetFactor = -4;
              m.polygonOffsetUnits = -4;
              m.userData.role = "silk";
            } else if (g > r * 1.5 && g > b * 1.2) {
              /* the soldermask: the one strongly green non-metal. Keeping it
                 translucent is what lets the copper read through as tracks. */
              m.color.setHex(MASK_GREEN);
              m.transparent = true;
              m.opacity = MASK_OPACITY;
              /* the silkscreen is a second translucent skin sitting microns
                 above this one, so the mask must not stamp its depth over it */
              m.depthWrite = false;
              /* real matte mask, not lacquer — a glossy mask picks up the
                 environment at grazing angles and washes the board out */
              m.roughness = 0.6;
              m.userData.role = "mask";
            } else {
              /* the FR-4 substrate under the mask, and the board edge */
              m.color.setHex(FR4_BODY);
              m.roughness = 0.9;
              m.metalness = 0;
            }
            return;
          }

          /* everything below is nominally metal, straight out of KiCad */
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          if (lum < 0.1) {
            /* IC bodies, connector shrouds, black plastic — not metal at all */
            m.metalness = 0.15;
            m.roughness = 0.6;
          } else if (r > b * 1.5) {
            /* gold, copper, tinned pads: the warm ones really are metal.
               Scaling the albedo rather than replacing it keeps KiCad's own
               distinction between bare copper, ENIG and tinned finish. */
            m.color.multiplyScalar(METAL_GAIN);
            m.metalness = 1;
            m.roughness = 0.3;
          } else if (m.roughness >= 0.99) {
            m.roughness = 0.45;
          }
        });
      });

      /* ── draw order ────────────────────────────────────────────────────
         The mask and the silkscreen are both translucent and both cover the
         whole board, so their centroids are microns apart and three.js's
         back-to-front sort between them is effectively a coin toss. Half the
         time the mask painted over the legends and the board came out blank.
         Ordering them explicitly settles it: mask first, silk on top. */
      board.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const role = mats.find((m) => m?.userData?.role)?.userData.role;
        if (role === "mask") o.renderOrder = 1;
        else if (role === "silk") o.renderOrder = 2;
      });

      /* Centre the board on the origin, then tip it so the COMPONENT side
         faces the camera. */
      const box = new THREE.Box3().setFromObject(board);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      board.position.sub(centre);

      /* Two nested groups, because the tilt and the flip are different
         motions. `pivot` holds the presentation angle. `flipper` turns the
         board over about its own vertical axis — the way you would turn a
         page — which is the one axis that leaves the back-side silkscreen
         the right way up. Flipping about the horizontal axis instead shows
         the same face with the ID block upside down. */
      const flipper = new THREE.Group();
      flipper.add(board);
      const pivot = new THREE.Group();
      pivot.add(flipper);
      pivot.rotation.x = TILT;
      pivot.rotation.y = YAW;
      scene.add(pivot);

      /* ── framing ────────────────────────────────────────────────────────
         The model comes out of KiCad in metres, so a 62 mm board is ~0.06
         units across. The near plane therefore has to be derived from the
         model rather than assumed: a fixed 0.1 sat right in front of the
         board and sliced it in half the moment anyone zoomed in, which is
         also why the zoom appeared to stop early. Deriving near and far from
         the board's own size fixes the clipping and, as a bonus, tightens
         the depth range from 20000:1 to 4000:1 — which is what keeps the
         silkscreen from z-fighting the mask underneath it. */
      const radius = Math.max(size.x, size.y, size.z);
      camera.near = radius / 200;
      camera.far = radius * 20;
      const home = new THREE.Vector3(0, radius * 0.5, radius * 2.25);
      camera.position.copy(home);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.zoomToCursor = true;
      /* close enough to read a 0402 refdes, far enough to see the whole board
         with room around it */
      controls.minDistance = radius * 0.3;
      controls.maxDistance = radius * 4;
      controls.target.set(0, 0, 0);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      controls.autoRotate = !reduced;
      controls.autoRotateSpeed = 0.9;
      /* once someone takes hold of it, stop spinning under their fingers */
      controls.addEventListener("start", () => {
        controls.autoRotate = false;
      });

      /* ── render on demand ───────────────────────────────────────────────
         The old loop rendered every frame for as long as the page was open,
         including while the board was scrolled well off-screen. Now a frame
         is only drawn when something actually moved, and never while the
         canvas is out of view or the tab is in the background. */
      let dirty = true;
      let onScreen = true;
      const invalidate = () => {
        dirty = true;
      };
      controls.addEventListener("change", invalidate);

      const io = new IntersectionObserver(
        ([e]) => {
          onScreen = e.isIntersecting;
          if (onScreen) invalidate();
        },
        { rootMargin: "120px" }
      );
      io.observe(mount);

      const onVisibility = () => invalidate();
      document.addEventListener("visibilitychange", onVisibility);

      const onResize = () => {
        if (!mount.clientWidth) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        invalidate();
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);

      /* ── view controls ──────────────────────────────────────────────────
         A short tween rather than a snap, because a board that jumps to its
         other side reads as a different board. */
      let tween: { from: number; to: number; t0: number } | null = null;
      const TWEEN_MS = 480;

      const goHome = () => {
        camera.position.copy(home);
        controls.target.set(0, 0, 0);
        controls.update();
        invalidate();
      };

      apiRef.current = {
        reset: () => {
          controls.autoRotate = !reduced;
          tween = { from: flipper.rotation.z, to: 0, t0: performance.now() };
          pivot.rotation.x = TILT;
          pivot.rotation.y = YAW;
          goHome();
        },
        flip: () => {
          const showingFront = Math.abs(flipper.rotation.z) < 0.01;
          controls.autoRotate = false;
          pivot.rotation.x = TILT;
          pivot.rotation.y = YAW;
          tween = {
            from: flipper.rotation.z,
            to: showingFront ? Math.PI : 0,
            t0: performance.now(),
          };
          goHome();
        },
      };

      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!onScreen || document.hidden) return;

        if (tween) {
          const k = Math.min(1, (performance.now() - tween.t0) / TWEEN_MS);
          /* ease-in-out cubic */
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          flipper.rotation.z = tween.from + (tween.to - tween.from) * e;
          if (k === 1) tween = null;
          dirty = true;
        }

        const moved = controls.update();
        if (!moved && !dirty) return;
        dirty = false;
        renderer.render(scene, camera);
      };
      tick();

      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        controls.dispose();
        draco.dispose();
        envRT.dispose();
        pmrem.dispose();
        scene.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          o.geometry?.dispose();
          const mat = o.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
        apiRef.current = null;
      };

      setState("ready");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <span className="eyebrow">3D model</span>
        {state === "ready" && (
          <span className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11.5px]" style={{ color: "var(--text-3)" }}>
              Drag to rotate · scroll to zoom
            </span>
            <button
              onClick={() => {
                apiRef.current?.flip();
                setFlipped((v) => !v);
              }}
              className="seg text-[11.5px] px-2.5 py-1"
            >
              {flipped ? "Front" : "Back"}
            </button>
            <button
              onClick={() => {
                apiRef.current?.reset();
                setFlipped(false);
              }}
              className="seg text-[11.5px] px-2.5 py-1"
            >
              Reset
            </button>
          </span>
        )}
      </div>

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          border: "1px solid var(--border)",
          background:
            "radial-gradient(120% 90% at 50% 0%, #232019 0%, #131211 60%, #0d0c0b 100%)",
          aspectRatio: "16 / 10",
        }}
      >
        <div ref={mountRef} className="absolute inset-0" aria-label={label} role="img" />

        {state !== "ready" && (
          <>
            {poster && (
              <Image
                src={poster}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain p-5 opacity-35"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              {state === "error" ? (
                <p className="text-[12.5px]" style={{ color: "var(--text-3)" }}>
                  The 3D model could not be loaded.
                </p>
              ) : (
                <button
                  onClick={load}
                  onPointerEnter={prefetch}
                  onFocus={prefetch}
                  disabled={state === "loading"}
                  className="inline-flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-full transition-transform"
                  style={{
                    background: "var(--text)",
                    color: "var(--bg)",
                    boxShadow: "0 8px 26px -10px rgba(0,0,0,0.9)",
                  }}
                >
                  {state === "loading" ? "Loading…" : "Rotate in 3D"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
