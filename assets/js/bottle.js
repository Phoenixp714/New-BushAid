// BushAid 3D bottle: a Three.js model with a drawn wrap-around label.
// Each <canvas data-bottle="hero|inside"> gets its own small renderer. Until the
// model is ready (or if WebGL is unavailable) the <img> fallback beside it shows.
// Loaded by full URL rather than through an import map: some hosts inject
// their own module scripts first, and browsers ignore an import map that
// arrives after that, which silently broke the 3D bottle.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LABEL = {
  brown: '#57423A',
  brownDark: '#3E2E28',
  gold: '#DDB871',
  goldDeep: '#B8913F',
  white: '#F4EEE8',
};

// ---------- Label texture ----------
function drawLabel() {
  const W = 3200, H = 1100;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');

  // base + subtle vertical shading so it reads as printed paper
  g.fillStyle = LABEL.brown;
  g.fillRect(0, 0, W, H);
  const edge = g.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, 'rgba(0,0,0,.28)');
  edge.addColorStop(0.06, 'rgba(0,0,0,0)');
  edge.addColorStop(0.94, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(0,0,0,.28)');
  g.fillStyle = edge;
  g.fillRect(0, 0, W, H);

  const font = (w, s) => `${w} ${s}px Inter, Arial, Helvetica, sans-serif`;
  const goldFill = (y0, y1) => {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, LABEL.gold);
    gr.addColorStop(1, LABEL.goldDeep);
    return gr;
  };
  const logo = (x, y, size, align = 'left') => {
    g.textBaseline = 'alphabetic';
    g.font = font(300, size);
    const w1 = g.measureText('Bush').width;
    g.font = font(700, size);
    const w2 = g.measureText('aid').width;
    let sx = align === 'center' ? x - (w1 + w2) / 2 : x;
    g.fillStyle = LABEL.white;
    g.textAlign = 'left';
    g.font = font(300, size); g.fillText('Bush', sx, y);
    g.font = font(700, size); g.fillText('aid', sx + w1, y);
  };

  // ---- Front panel (centered at u = 0.5) ----
  const fx = W / 2;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.font = font(800, 112);
  g.fillStyle = goldFill(110, 200);
  g.fillText('GUT-SKIN AXIS', fx, 200);
  g.fillStyle = LABEL.white;
  g.fillRect(fx - 400, 240, 800, 4);
  g.font = font(600, 44);
  g.fillText('OPTIMIZES ABSORPTION, CLEARS SKIN', fx, 298);
  g.fillRect(fx - 400, 330, 800, 4);
  g.font = font(600, 50);
  g.fillText('WITH PROBIOTICS, ANTIOXIDANTS', fx, 404);
  g.fillText('& HERBAL EXTRACTS', fx, 468);

  g.textAlign = 'left';
  g.font = font(600, 28);
  g.fillText('DIETARY SUPPLEMENT', fx - 400, 960);
  g.fillText('60 CAPSULES', fx - 400, 1004);
  logo(fx - 20, 1004, 128);

  // ---- Back panel: Supplement Facts (centered on the seam, drawn twice) ----
  const facts = (cx) => {
    const x0 = cx - 380, x1 = cx + 380;
    g.fillStyle = LABEL.white;
    g.strokeStyle = LABEL.white;
    g.textAlign = 'left';
    g.font = font(800, 76);
    g.fillText('Supplement Facts', x0, 150);
    g.font = font(400, 32);
    g.fillText('Serving Size 1 Capsule', x0, 200);
    g.fillText('Servings Per Container 60', x0, 240);
    g.fillRect(x0, 262, 760, 12);
    g.font = font(700, 30);
    g.fillText('Amount Per Serving', x0, 312);
    g.textAlign = 'right';
    g.fillText('% Daily Value', x1, 312);
    g.fillRect(x0, 328, 760, 5);
    const rows = [
      ['Vitamin C (Ascorbic Acid)', '50mg', '56%'],
      ['Zinc (Zinc Gluconate)', '10mg', '91%'],
      ['Probiotic Blend (5 strains)', '5 Billion CFU', '**'],
      ['Turmeric (Curcuma longa)', '80mg', '**'],
      ['Hyaluronic Acid', '30mg', '**'],
      ['Black Pepper (Piper nigrum)', '10mg', '**'],
      ['Inulin', '9mg', '**'],
    ];
    let y = 382;
    g.font = font(400, 30);
    for (const [n, a, d] of rows) {
      g.textAlign = 'left'; g.fillText(n, x0, y);
      g.textAlign = 'right'; g.fillText(a, x1 - 110, y); g.fillText(d, x1, y);
      g.fillRect(x0, y + 18, 760, 2);
      y += 62;
    }
    g.fillRect(x0, y - 38, 760, 10);
    g.textAlign = 'left';
    g.font = font(400, 24);
    g.fillText('Probiotic Blend: L. acidophilus, L. rhamnosus, L. crispatus,', x0, y + 12);
    g.fillText('L. reuteri, L. gasseri.   ** Daily Value not established.', x0, y + 46);
  };
  facts(0);
  facts(W);

  // ---- Side panels ----
  const side = (cx) => {
    g.textAlign = 'center';
    g.fillStyle = goldFill(200, 300);
    g.font = font(800, 60);
    g.fillText('GUT · SKIN · IMMUNE', cx, 300);
    g.fillStyle = LABEL.white;
    g.fillRect(cx - 300, 340, 600, 3);
    g.font = font(500, 36);
    g.fillText('Inspired by the 1930 research', cx, 420);
    g.fillText('of Stokes & Pillsbury on the', cx, 470);
    g.fillText('gut–skin connection.', cx, 520);
    logo(cx, 880, 110, 'center');
  };
  side(W * 0.25);
  side(W * 0.75);

  return c;
}

// ---------- Studio reflections ----------
// Compact port of three.js's RoomEnvironment (from Google's model-viewer, MIT):
// a lit box room that gives the glossy plastic something to reflect.
function roomEnvironment() {
  const scene = new THREE.Scene();
  const geo = new THREE.BoxGeometry();
  geo.deleteAttribute('uv');
  const light = new THREE.PointLight(0xffffff, 900, 28, 2);
  light.position.set(0.418, 16.199, 0.3);
  scene.add(light);
  const add = (mat, p, s, ry = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p); m.scale.set(...s); m.rotation.y = ry;
    scene.add(m);
  };
  add(new THREE.MeshStandardMaterial({ side: THREE.BackSide }), [-0.757, 13.219, 0.717], [31.713, 28.305, 28.591]);
  const box = new THREE.MeshStandardMaterial();
  add(box, [-10.906, 2.009, 1.846], [2.328, 7.905, 4.651], -0.195);
  add(box, [-5.607, -0.754, -0.758], [1.97, 1.534, 3.955], 0.994);
  add(box, [6.167, 0.857, 7.803], [3.927, 6.285, 3.687], 0.561);
  add(box, [-2.017, 0.018, 6.124], [2.002, 4.566, 2.064], 0.333);
  add(box, [2.291, -0.756, -2.621], [1.546, 1.552, 1.496], -0.286);
  add(box, [-2.193, -0.369, -5.547], [3.875, 3.487, 2.986], 0.516);
  const glow = (i) => { const m = new THREE.MeshBasicMaterial(); m.color.setScalar(i); return m; };
  add(glow(50), [-16.116, 14.37, 8.208], [0.1, 2.428, 2.739]);
  add(glow(50), [-16.109, 18.021, -8.207], [0.1, 2.425, 2.751]);
  add(glow(17), [14.904, 12.198, -1.832], [0.15, 4.265, 6.331]);
  add(glow(43), [-0.462, 8.89, 14.52], [4.38, 5.441, 0.088]);
  add(glow(20), [3.235, 11.486, -12.541], [2.5, 2.0, 0.1]);
  add(glow(100), [0, 20, 0], [1.0, 0.1, 1.0]);
  return scene;
}

// ---------- Geometry helpers ----------
function knurl(geo, rMin, yMin, yMax, ridges, depth) {
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const r = Math.hypot(v.x, v.z);
    if (r < rMin || v.y < yMin || v.y > yMax) continue;
    const a = Math.atan2(v.x, v.z);
    const k = 1 + depth * Math.cos(a * ridges);
    p.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,.55)');
  gr.addColorStop(0.5, 'rgba(0,0,0,.22)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function buildBottle(labelCanvas, maxAniso) {
  const group = new THREE.Group();

  // Body: black glossy PET
  const bodyPts = [
    [0, 0], [0.82, 0], [0.95, 0.03], [0.995, 0.1], [1.0, 0.18],
    [1.0, 2.36], [0.985, 2.46], [0.94, 2.55], [0.86, 2.63], [0.8, 2.68], [0.78, 2.72], [0.78, 2.8],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(bodyPts, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x08080a, roughness: 0.16, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.06,
    }),
  );
  group.add(body);

  // Label
  const tex = new THREE.CanvasTexture(labelCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(1.006, 1.006, 2.12, 128, 1, true),
    new THREE.MeshPhysicalMaterial({
      map: tex, roughness: 0.55, metalness: 0,
      clearcoat: 0.35, clearcoatRoughness: 0.35,
    }),
  );
  label.position.y = 0.2 + 1.06;
  label.rotation.y = Math.PI; // bring the front panel (u = .5) to face the camera
  group.add(label);

  // Cap with knurled grip
  const capPts = [
    [0, 3.36], [0.72, 3.36], [0.79, 3.34], [0.82, 3.3], [0.825, 3.24],
    [0.825, 2.8], [0.815, 2.74], [0.79, 2.72], [0, 2.72],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const cap = new THREE.Mesh(
    knurl(new THREE.LatheGeometry(capPts, 360), 0.8, 2.78, 3.26, 120, 0.01),
    new THREE.MeshPhysicalMaterial({
      color: 0x0c0c0e, roughness: 0.42, metalness: 0,
      clearcoat: 0.4, clearcoatRoughness: 0.3,
    }),
  );
  group.add(cap);

  // Capsules for the finale: hidden inside the cap until the cap lifts off.
  // Two-tone: cream shell with a warm gold half.
  const capsuleGeo = new THREE.CapsuleGeometry(0.13, 0.34, 8, 20);
  const colors = [];
  const pos = capsuleGeo.attributes.position;
  const cream = new THREE.Color(0xf1e9da), gold = new THREE.Color(0xc9a45c);
  for (let i = 0; i < pos.count; i++) {
    const c = pos.getY(i) > 0 ? cream : gold;
    colors.push(c.r, c.g, c.b);
  }
  capsuleGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const capsuleMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15,
  });
  const capsuleEnds = [
    [-1.35, 3.55, 0.5], [-0.75, 4.15, 0.7], [0.0, 4.45, 0.85],
    [0.8, 4.2, 0.7], [1.4, 3.7, 0.5], [0.35, 3.85, 1.05],
  ];
  const capsules = capsuleEnds.map((end, i) => {
    const m = new THREE.Mesh(capsuleGeo, capsuleMat);
    m.visible = false;
    m.userData = { end: new THREE.Vector3(...end), tilt: 0.6 + i * 0.9, spin: i % 2 ? 1 : -1 };
    group.add(m);
    return m;
  });

  // Soft contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  group.add(shadow);

  group.position.y = -1.68; // center vertically around origin
  return { group, cap, capsules };
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
const easeOutBack = (t) => { const c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

// ---------- One viewer per canvas ----------
function createViewer(canvas, labelCanvas, mode) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(roomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  // Cinematic lighting: warm key, gold rim, cool fill
  const key = new THREE.DirectionalLight(0xfff1dc, 1.6);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xe2b66a, 2.4);
  rim.position.set(-4, 2.5, -3);
  const rim2 = new THREE.DirectionalLight(0xe2b66a, 1.2);
  rim2.position.set(4, 1.5, -3);
  const fill = new THREE.DirectionalLight(0xb9c4ff, 0.35);
  fill.position.set(-3, 0, 4);
  scene.add(key, rim, rim2, fill);

  const { group: bottle, cap, capsules } = buildBottle(labelCanvas, renderer.capabilities.getMaxAnisotropy());
  const pivot = new THREE.Group();
  pivot.add(bottle);
  pivot.rotation.x = 0.06;
  scene.add(pivot);

  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
  let baseDist = 10;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // fit bottle (≈3.5 tall, ≈2.1 wide incl. margin) in view
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    baseDist = Math.max(2.0 / t, 1.3 / (t * camera.aspect));
    placeCamera(0);
    camera.updateProjectionMatrix();
  }
  function placeCamera(f) {
    // During the finale, pull back and look up a little so the capsules fit.
    camera.position.set(0, 0.15 + 0.75 * f, baseDist * (1 + 0.38 * f));
    camera.lookAt(0, 0.6 * f, 0);
  }

  // Scroll progress of the element that drives this viewer
  const driver = canvas.closest('[data-bottle-driver]') || canvas;
  function progress() {
    const r = driver.getBoundingClientRect();
    const vh = window.innerHeight;
    if (mode === 'inside') {
      const total = r.height - vh;
      return total > 0 ? clamp01(-r.top / total) : 0;
    }
    return clamp01(-r.top / Math.max(r.height, 1));
  }

  // ── Drag / swipe to spin. Horizontal drags turn the bottle; vertical swipes
  //    still scroll the page (touch-action: pan-y on the canvas).
  const stage = canvas.closest('.bottle-stage');
  const drag = { active: false, offset: 0, vel: 0, x: 0, t: 0, id: null };
  canvas.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary) return;
    drag.active = true; drag.id = e.pointerId; drag.x = e.clientX; drag.t = performance.now(); drag.vel = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    stage?.classList.add('is-dragging', 'interacted');
    kick();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag.active || e.pointerId !== drag.id) return;
    const now = performance.now();
    const d = (e.clientX - drag.x) * 0.012;
    drag.offset += d;
    drag.vel = THREE.MathUtils.clamp(d / Math.max((now - drag.t) / 1000, 0.008), -10, 10);
    drag.x = e.clientX; drag.t = now;
  });
  const release = (e) => {
    if (!drag.active || (e && e.pointerId !== drag.id)) return;
    drag.active = false;
    if (performance.now() - drag.t > 80) drag.vel = 0; // finger held still before lifting
    stage?.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);

  let visible = false, raf = 0, last = performance.now(), idle = 0;
  let current = null;
  const base = mode === 'hero' ? -0.35 : 0;
  const TAU = Math.PI * 2;

  function updateDrag(dt) {
    if (drag.active) return;
    if (Math.abs(drag.vel) > 0.05) {
      drag.offset += drag.vel * dt;            // coast briefly after a flick
      drag.vel *= Math.exp(-dt * 4.5);
    } else if (mode === 'inside') {
      // settle back in step with the ingredient walkthrough (nearest full turn)
      const home = Math.round(drag.offset / TAU) * TAU;
      drag.offset += (home - drag.offset) * (1 - Math.exp(-dt * 3));
    }
  }

  function finale(f, now) {
    cap.position.set(f * 0.45, f * 1.05, f * 0.1);
    cap.rotation.z = -f * 0.5;
    capsules.forEach((m, i) => {
      const fi = clamp01((f - i * 0.07) / 0.58);
      m.visible = fi > 0.001;
      if (!m.visible) return;
      const e = easeOutBack(fi);
      const { end, tilt, spin } = m.userData;
      m.position.set(end.x * e, 2.95 + (end.y - 2.95) * e + Math.sin(now / 900 + i) * 0.04 * fi, end.z * e);
      m.rotation.set(tilt + fi * 1.2 * spin, 0, tilt * 0.7 + fi * 2.4 * spin + Math.sin(now / 1300 + i) * 0.08);
      m.scale.setScalar(0.4 + 0.6 * clamp01(fi * 2));
    });
    placeCamera(f);
  }

  function frame(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    updateDrag(dt);
    let target;
    if (reduceMotion) {
      target = base + drag.offset;
    } else if (mode === 'hero') {
      idle += dt * 0.25;
      target = base + idle + progress() * Math.PI * 1.25 + drag.offset;
      pivot.position.y = Math.sin(now / 1400) * 0.05; // gentle float
    } else {
      // six ingredients over one full turn, then the cap comes off for the finale
      const p = progress();
      target = clamp01(p / (6 / 7)) * TAU + drag.offset;
      finale(smooth(clamp01((p - 0.86) / 0.12)), now);
    }
    current = current === null ? target : current + (target - current) * (1 - Math.exp(-dt * (drag.active ? 16 : 8)));
    pivot.rotation.y = current;
    renderer.render(scene, camera);
    const settling = Math.abs(current - target) > 0.0005 || drag.active || Math.abs(drag.vel) > 0.05;
    if (!reduceMotion || settling) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '100px' }).observe(canvas);
  new ResizeObserver(() => { resize(); kick(); }).observe(canvas);

  resize();
  renderer.render(scene, camera);
  stage?.classList.add('is-3d');
}

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

async function init() {
  const canvases = document.querySelectorAll('canvas[data-bottle]');
  if (!canvases.length || !webglOK()) return;
  try {
    await Promise.all([
      document.fonts.load('300 100px Inter'),
      document.fonts.load('400 100px Inter'),
      document.fonts.load('600 100px Inter'),
      document.fonts.load('700 100px Inter'),
      document.fonts.load('800 100px Inter'),
    ]);
  } catch { /* fall back to Arial on the label */ }
  const label = drawLabel();
  canvases.forEach((cv) => {
    try { createViewer(cv, label, cv.dataset.bottle); } catch (e) { console.warn('3D bottle unavailable', e); }
  });
}

init();
