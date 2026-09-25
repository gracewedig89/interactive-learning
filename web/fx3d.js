// 3D celebrations built from simple shapes with three.js (loaded the first time one plays).
// FX.play("unicorn" | "monkey" | "monster", text) resolves true when it finished, false if 3D isn't available.
window.FX = (() => {
  let loading = null, R = null;
  const load = () => (loading ||= new Promise((res) => {
    if (window.THREE) return res(window.THREE);
    const s = document.createElement("script");
    s.src = "vendor/three.min.js";
    s.onload = () => res(window.THREE || null);
    s.onerror = () => res(null);
    document.head.append(s);
  }));

  function setup(T) {
    const canvas = document.createElement("canvas");
    canvas.className = "fx3d";
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 20);
    scene.add(new T.HemisphereLight(0xffffff, 0xffc8ea, 2.2));
    const key = new T.DirectionalLight(0xffffff, 2.6); key.position.set(4, 8, 10); scene.add(key);
    const rim = new T.DirectionalLight(0xffd8ff, 1.6); rim.position.set(-6, 4, -5); scene.add(rim);
    const bubble = document.createElement("div");
    bubble.className = "fx-bubble";
    bubble.setAttribute("aria-hidden", "true");
    return { T, renderer, scene, camera, canvas, bubble };
  }

  /* ---------- building blocks ---------- */
  const kit = (T) => {
    const mat = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0, ...o });
    const at = (m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); return m; };
    const ball = (r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const b = at(new T.Mesh(new T.SphereGeometry(r, 32, 24), m), x, y, z); b.scale.set(sx, sy, sz); return b; };
    const cyl = (rt, rb, h, m, x, y, z) => at(new T.Mesh(new T.CylinderGeometry(rt, rb, h, 20), m), x, y, z);
    const cone = (r, h, m, x, y, z) => at(new T.Mesh(new T.ConeGeometry(r, h, 24), m), x, y, z);
    const group = (x = 0, y = 0, z = 0, ...kids) => { const g = at(new T.Group(), x, y, z); kids.forEach((k) => g.add(k)); return g; };
    const eye = (x, y, z, r = 0.1) => group(x, y, z, ball(r, mat(0x1b1030, { roughness: 0.15 }), 0, 0, 0), ball(r * 0.35, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }), r * 0.35, r * 0.35, r * 0.75));
    return { mat, at, ball, cyl, cone, group, eye };
  };
  const RAINBOW = [0xff5b7f, 0xff9b4a, 0xffd84d, 0x62dd8a, 0x4fb8ff, 0x7d6bff, 0xc77dff];

  function rainbow(T, K) {
    const g = new T.Group();
    RAINBOW.slice().reverse().forEach((c, i) => {
      const arc = new T.Mesh(new T.TorusGeometry(2.0 + i * 0.15, 0.085, 12, 72, Math.PI), K.mat(c, { emissive: c, emissiveIntensity: 0.3, roughness: 0.3 }));
      g.add(arc);
    });
    for (const side of [-1, 1]) {
      const cloud = K.group(side * 2.45, 0.05, 0.3);
      [[0, 0, 0.45], [0.4, 0.1, 0.35], [-0.4, 0.05, 0.38], [0.15, 0.35, 0.33], [-0.2, 0.3, 0.3]].forEach(([x, y, r]) => cloud.add(K.ball(r, K.mat(0xffffff, { roughness: 0.8 }), x, y, 0)));
      g.add(cloud);
    }
    return g;
  }

  function unicorn(T, K) {
    const white = K.mat(0xfff5fb), pink = K.mat(0xffbfe0), gold = K.mat(0xffcf3f, { metalness: 0.55, roughness: 0.25 });
    const g = new T.Group();
    g.add(K.ball(1, white, 0, 1.3, 0, 1.25, 0.85, 0.8));
    const legs = [[-0.7, 0.38], [0.7, 0.38], [-0.7, -0.38], [0.7, -0.38]].map(([x, z]) => {
      const p = K.group(x, 1.05, z, K.cyl(0.17, 0.15, 1, white, 0, -0.5, 0), K.cyl(0.19, 0.21, 0.18, gold, 0, -1.02, 0));
      g.add(p); return p;
    });
    const head = K.group(1.05, 1.95, 0);
    const neck = K.cyl(0.33, 0.45, 1, white, -0.12, -0.2, 0); neck.rotation.z = -0.5;
    head.add(neck, K.ball(0.55, white, 0.25, 0.35, 0, 1.1, 0.95, 0.9), K.ball(0.36, pink, 0.78, 0.17, 0, 1.1, 0.85, 0.95));
    head.add(K.ball(0.05, K.mat(0x9b4d7a), 1.12, 0.22, 0.14), K.ball(0.05, K.mat(0x9b4d7a), 1.12, 0.22, -0.14));
    const winkEye = K.eye(0.62, 0.52, 0.33, 0.1), otherEye = K.eye(0.62, 0.52, -0.33, 0.1);
    head.add(winkEye, otherEye, K.ball(0.13, K.mat(0xff8fc6, { emissive: 0xff7ab8, emissiveIntensity: 0.25 }), 0.58, 0.28, 0.42, 1, 0.6, 0.4));
    const horn = K.group(0.38, 0.92, 0, K.cone(0.13, 0.9, gold, 0, 0.45, 0));
    [0.18, 0.4, 0.62].forEach((y, i) => { const ring = new T.Mesh(new T.TorusGeometry(0.11 - i * 0.03, 0.025, 8, 24), K.mat(0xff8fc6)); ring.rotation.x = Math.PI / 2; ring.position.y = y; horn.add(ring); });
    horn.rotation.z = -0.35;
    head.add(horn);
    for (const z of [-0.26, 0.26]) { const ear = K.cone(0.12, 0.35, white, 0.05, 0.85, z); ear.rotation.z = 0.2; head.add(ear); }
    RAINBOW.forEach((c, i) => {
      const t = i / (RAINBOW.length - 1);
      head.add(K.ball(0.2, K.mat(c, { roughness: 0.35 }), 0.1 - t * 0.6, 0.85 - t * 1.25, 0.08 * (i % 2 ? 1 : -1)));
    });
    g.add(head);
    const tail = K.group(-1.2, 1.45, 0);
    RAINBOW.forEach((c, i) => tail.add(K.ball(0.2 - i * 0.012, K.mat(c, { roughness: 0.35 }), -0.15 - i * 0.12, -i * 0.16, (i % 2 ? 0.06 : -0.06))));
    g.add(tail);
    g.rotation.y = -0.65;
    return { g, legs, head, tail, winkEye, headTop: new T.Vector3(1.2, 3.2, 0) };
  }

  function monkey(T, K) {
    const brown = K.mat(0x8a5634), tan = K.mat(0xf3c99c), dark = K.mat(0x2a160c);
    const g = new T.Group();
    g.add(K.ball(0.85, brown, 0, 1.35, 0, 1, 1.1, 0.9), K.ball(0.58, tan, 0, 1.25, 0.42, 1, 1.1, 0.6));
    const head = K.group(0, 2.55, 0, K.ball(0.75, brown, 0, 0, 0), K.ball(0.55, tan, 0, 0.05, 0.38, 1.15, 0.85, 0.7), K.ball(0.36, tan, 0, -0.28, 0.6, 1.25, 0.8, 0.8));
    for (const s of [-1, 1]) head.add(K.ball(0.28, brown, s * 0.8, 0.08, 0), K.ball(0.17, tan, s * 0.84, 0.08, 0.12, 1, 1, 0.5));
    const winkEye = K.eye(0.21, 0.14, 0.78, 0.09), otherEye = K.eye(-0.21, 0.14, 0.78, 0.09);
    const smile = new T.Mesh(new T.TorusGeometry(0.2, 0.035, 8, 24, Math.PI), dark); smile.rotation.z = Math.PI; smile.position.set(0, -0.25, 0.9);
    head.add(winkEye, otherEye, smile, K.ball(0.04, dark, 0.07, -0.12, 0.92), K.ball(0.04, dark, -0.07, -0.12, 0.92));
    g.add(head);
    const arms = [-1, 1].map((s) => { const p = K.group(s * 0.78, 1.85, 0, K.cyl(0.15, 0.13, 1.05, brown, 0, -0.52, 0), K.ball(0.18, tan, 0, -1.08, 0)); g.add(p); return p; });
    const legs = [-1, 1].map((s) => { const p = K.group(s * 0.42, 0.62, 0, K.cyl(0.17, 0.15, 0.55, brown, 0, -0.27, 0), K.ball(0.22, tan, 0, -0.56, 0.1, 1, 0.6, 1.4)); g.add(p); return p; });
    const curve = new T.CatmullRomCurve3([[0, 0.95, -0.7], [0.35, 0.6, -1.15], [0.95, 0.85, -1.2], [1.15, 1.45, -0.95], [0.85, 1.75, -0.75]].map((p) => new T.Vector3(...p)));
    g.add(new T.Mesh(new T.TubeGeometry(curve, 40, 0.08, 10), brown));
    const bananaCurve = new T.QuadraticBezierCurve3(new T.Vector3(-0.35, 0, 0), new T.Vector3(0, -0.28, 0), new T.Vector3(0.35, 0, 0));
    const banana = K.group(0, 0, 0, new T.Mesh(new T.TubeGeometry(bananaCurve, 20, 0.1, 10), K.mat(0xffe14d)), K.ball(0.05, dark, 0.36, 0.01, 0), K.ball(0.05, dark, -0.36, 0.01, 0));
    g.rotation.y = 0.2;
    return { g, head, arms, legs, winkEye, banana, headTop: new T.Vector3(0.3, 3.5, 0) };
  }

  function monster(T, K) {
    const fur = K.mat(0x8e2fd8, { roughness: 0.7 }), belly = K.mat(0xc08bff, { roughness: 0.7 });
    const spike = K.mat(0x3fe07f), horn = K.mat(0xff7a1a, { roughness: 0.35 }), black = K.mat(0x14050f), white = K.mat(0xffffff, { roughness: 0.3 });
    const g = new T.Group();
    const body = K.ball(1.5, fur, 0, 1.7, 0, 1.12, 1, 0.9);
    g.add(body, K.ball(1, belly, 0, 1.35, 0.72, 1, 0.9, 0.5));
    for (let a = -75; a <= 75; a += 15) {
      const r = (a * Math.PI) / 180, s = K.cone(0.2, 0.7, spike, Math.sin(r) * 1.55, 1.7 + Math.cos(r) * 1.45, -0.45);
      s.rotation.z = -r; g.add(s);
    }
    for (const s of [-1, 1]) { const h = K.cone(0.26, 1.1, horn, s * 0.95, 3.25, 0.1); h.rotation.z = -s * 0.6; g.add(h); }
    const brows = [], lids = [];
    for (const s of [-1, 1]) {
      g.add(K.ball(0.36, white, s * 0.5, 2.18, 1.12));
      g.add(K.ball(0.17, K.mat(0xff1a1a, { emissive: 0xff0000, emissiveIntensity: 1.2 }), s * 0.47, 2.12, 1.43));
      g.add(K.ball(0.07, black, s * 0.46, 2.12, 1.58, 0.45, 1.3, 1)); // slit pupils
      // Heavy lids and a deep V-shaped scowl.
      const lid = K.ball(0.4, fur, s * 0.5, 2.42, 1.1, 1.05, 0.55, 1); lid.rotation.z = s * 0.55; g.add(lid); lids.push(lid);
      const brow = new T.Mesh(new T.BoxGeometry(0.85, 0.24, 0.26), black); brow.position.set(s * 0.46, 2.52, 1.36); brow.rotation.z = s * 0.75; g.add(brow); brows.push(brow);
    }
    // Throbbing anger mark.
    const vein = K.group(1.05, 2.95, 0.95);
    for (const [x, y, rz] of [[-0.1, 0.1, 0.8], [0.1, 0.1, -0.8], [-0.1, -0.1, -0.8], [0.1, -0.1, 0.8]]) {
      const b = new T.Mesh(new T.BoxGeometry(0.22, 0.07, 0.07), K.mat(0xff1a1a, { emissive: 0xff0000, emissiveIntensity: 0.9 })); b.position.set(x, y, 0); b.rotation.z = rz; vein.add(b);
    }
    g.add(vein);
    const nostrils = [-1, 1].map((s) => { const n = K.ball(0.08, black, s * 0.16, 1.78, 1.36); g.add(n); return n; });
    const mouth = K.group(0, 1.25, 1.22, K.ball(0.62, K.mat(0x3a0010), 0, 0, 0, 1.6, 0.45, 0.35));
    [-0.62, -0.42, -0.21, 0, 0.21, 0.42, 0.62].forEach((x, i) => { const t = K.cone(0.08, i % 2 ? 0.2 : 0.3, white, x, 0.14, 0.16); t.rotation.z = Math.PI; mouth.add(t); });
    [-0.45, -0.15, 0.15, 0.45].forEach((x) => mouth.add(K.cone(0.08, 0.26, white, x, -0.12, 0.16)));
    g.add(mouth);
    const arms = [-1, 1].map((s) => {
      const p = K.group(s * 1.55, 2.05, 0.1, K.cyl(0.28, 0.24, 1.2, fur, 0, -0.6, 0), K.ball(0.4, fur, 0, -1.25, 0));
      [-0.2, 0, 0.2].forEach((x) => { const c = K.cone(0.07, 0.32, white, x, -1.66, 0.12); c.rotation.z = Math.PI; p.add(c); });
      g.add(p); return p;
    });
    const feet = [-1, 1].map((s) => { const f = K.ball(0.45, fur, s * 0.75, 0.25, 0.35, 1.2, 0.55, 1.4); g.add(f); return f; });
    g.rotation.x = 0.12; // leaning in at you
    return { g, body, brows, lids, vein, nostrils, mouth, arms, feet, furMat: fur, headTop: new T.Vector3(0.6, 3.9, 0) };
  }

  /* ---------- the zoo: one builder, many animals ---------- */
  const ZOO = {
    panda:   { body: 0xffffff, belly: 0xffffff, limbs: 0x1d1d24, hand: 0x1d1d24, ears: "round", ear: 0x1d1d24, muzzle: 0xffffff, nose: 0x1d1d24, patches: 0x1d1d24, dance: "bounce", emoji: "🐼" },
    bunny:   { body: 0xf6effa, belly: 0xffffff, ears: "long", earInner: 0xffb3d1, muzzle: 0xffffff, nose: 0xff8fb8, teeth: true, tail: "cotton", dance: "hop", emoji: "🐰" },
    kitten:  { body: 0xf7a24d, belly: 0xfff0dc, ears: "pointy", earInner: 0xffb3c8, muzzle: 0xfff0dc, nose: 0xff7aa2, whiskers: true, tail: "cat", dance: "twirl", emoji: "🐱" },
    puppy:   { body: 0xd9a066, belly: 0xfff0dc, ears: "floppy", ear: 0x7a4a26, muzzle: 0xfff0dc, nose: 0x1d1d24, tongue: true, spot: 0x7a4a26, tail: "cat", dance: "wave", emoji: "🐶" },
    penguin: { body: 0x22263a, belly: 0xffffff, face: 0xffffff, limbs: 0x22263a, hand: 0x22263a, flippers: true, beak: 0xffa31a, feet: 0xffa31a, dance: "twirl", emoji: "🐧" },
    frog:    { body: 0x5ccf5a, belly: 0xc6f5a8, limbs: 0x5ccf5a, hand: 0x7fe07a, frogEyes: true, cheeks: true, dance: "flip", emoji: "🐸" },
    piggy:   { body: 0xffb3c8, belly: 0xffd1de, limbs: 0xffb3c8, hand: 0xff9fba, ears: "pointy", earInner: 0xff8fb0, snout: 0xff8fb0, tail: "curl", dance: "bounce", emoji: "🐷" },
    fox:     { body: 0xff7a2e, belly: 0xffffff, ears: "pointy", earInner: 0x2a160c, muzzle: 0xffffff, nose: 0x1d1d24, tail: "bushy", limbs: 0x2a160c, hand: 0x2a160c, dance: "flip", emoji: "🦊" },
    koala:   { body: 0x9aa3ad, belly: 0xe6e9ee, ears: "fluffy", earInner: 0xffffff, muzzle: 0xb8bfc8, bigNose: true, dance: "wave", emoji: "🐨" },
    chick:   { body: 0xffd84d, belly: 0xffe98a, limbs: 0xffd84d, hand: 0xffd84d, wings: true, beak: 0xff9f1a, feet: 0xff9f1a, tuft: true, dance: "hop", emoji: "🐤" },
    bear:    { body: 0x9b6b43, belly: 0xe8c39a, ears: "round", earInner: 0xe8c39a, muzzle: 0xe8c39a, nose: 0x1d1d24, dance: "twirl", emoji: "🐻" },
  };
  function critter(T, K, sp) {
    const M = (c, o) => K.mat(c, o);
    const body = M(sp.body), belly = M(sp.belly), limbs = M(sp.limbs ?? sp.body), hand = M(sp.hand ?? sp.belly), dark = M(0x2a160c);
    const g = new T.Group();
    g.add(K.ball(0.85, body, 0, 1.35, 0, 1, 1.1, 0.9), K.ball(0.58, belly, 0, 1.25, 0.42, 1, 1.1, 0.6));
    const head = K.group(0, 2.55, 0, K.ball(0.75, M(sp.head ?? sp.body), 0, 0, 0));
    if (sp.face) head.add(K.ball(0.56, M(sp.face), 0, -0.05, 0.36, 1.1, 0.95, 0.7));
    let front = 0.75;
    if (sp.muzzle) { head.add(K.ball(0.36, M(sp.muzzle), 0, -0.25, 0.6, 1.25, 0.8, 0.8)); front = 0.92; }
    let winkEye, otherEye;
    if (sp.frogEyes) {
      for (const s of [-1, 1]) head.add(K.ball(0.28, M(0xffffff), s * 0.34, 0.62, 0.3));
      winkEye = K.eye(0.34, 0.66, 0.56, 0.12); otherEye = K.eye(-0.34, 0.66, 0.56, 0.12);
    } else {
      if (sp.patches) for (const s of [-1, 1]) { const p = K.ball(0.19, M(sp.patches), s * 0.25, 0.12, 0.66, 1, 1.35, 0.5); p.rotation.z = s * -0.5; head.add(p); }
      if (sp.spot) head.add(K.ball(0.2, M(sp.spot), 0.25, 0.16, 0.64, 1.1, 1.1, 0.5));
      winkEye = K.eye(0.24, 0.14, 0.72, 0.1); otherEye = K.eye(-0.24, 0.14, 0.72, 0.1);
    }
    head.add(winkEye, otherEye);
    const smile = new T.Mesh(new T.TorusGeometry(sp.frogEyes ? 0.34 : 0.17, 0.035, 8, 24, Math.PI), dark);
    smile.rotation.z = Math.PI; smile.position.set(0, sp.frogEyes ? -0.1 : -0.3, (sp.frogEyes ? 0.72 : front) - 0.02); head.add(smile);
    if (sp.nose) head.add(K.ball(sp.bigNose ? 0.16 : 0.08, M(sp.nose), 0, -0.12, front, sp.bigNose ? 1 : 1.2, sp.bigNose ? 1.3 : 0.9, 0.8));
    if (sp.bigNose) head.add(K.ball(0.16, M(0x2b2b33, { roughness: 0.2 }), 0, -0.1, 0.86, 1, 1.35, 0.8));
    if (sp.beak) { const b = K.cone(0.17, 0.38, M(sp.beak), 0, -0.08, 0.86); b.rotation.x = Math.PI / 2; head.add(b); }
    if (sp.snout) { const sn = K.cyl(0.26, 0.26, 0.2, M(sp.snout), 0, -0.18, 0.8); sn.rotation.x = Math.PI / 2; head.add(sn, K.ball(0.05, dark, -0.08, -0.18, 0.91), K.ball(0.05, dark, 0.08, -0.18, 0.91)); }
    if (sp.tongue) head.add(K.ball(0.12, M(0xff6f91), 0.05, -0.47, 0.84, 0.8, 1, 0.4));
    if (sp.teeth) for (const s of [-1, 1]) head.add(K.at(new T.Mesh(new T.BoxGeometry(0.08, 0.12, 0.04), M(0xffffff)), s * 0.045, -0.44, 0.9));
    if (sp.whiskers) for (const s of [-1, 1]) for (const k of [-1, 0, 1]) { const w = K.cyl(0.012, 0.012, 0.55, dark, s * 0.45, -0.22 + k * 0.07, 0.8); w.rotation.z = Math.PI / 2 + k * 0.15 * s; head.add(w); }
    if (sp.cheeks || sp.frogEyes) for (const s of [-1, 1]) head.add(K.ball(0.1, M(0xff9fc0, { emissive: 0xff7ab8, emissiveIntensity: 0.2 }), s * 0.45, -0.12, 0.58, 1, 0.6, 0.4));
    if (sp.tuft) [-0.12, 0, 0.12].forEach((x, i) => { const c = K.cone(0.07, 0.35, body, x, 0.8, 0); c.rotation.z = (i - 1) * -0.4; head.add(c); });
    const ears = [];
    for (const s of [-1, 1]) {
      let e;
      if (sp.ears === "round") e = K.group(s * 0.55, 0.55, 0, K.ball(0.27, M(sp.ear ?? sp.body), 0, 0, 0), K.ball(0.15, M(sp.earInner ?? sp.ear ?? sp.body), 0, 0, 0.14, 1, 1, 0.4));
      else if (sp.ears === "long") { e = K.group(s * 0.26, 0.6, 0, K.ball(0.2, body, 0, 0.55, 0, 0.8, 2.8, 0.5), K.ball(0.12, M(sp.earInner), 0, 0.55, 0.07, 0.7, 2.6, 0.3)); e.rotation.z = s * -0.15; }
      else if (sp.ears === "pointy") { e = K.group(s * 0.45, 0.6, 0, K.cone(0.26, 0.55, body, 0, 0.2, 0), K.cone(0.15, 0.35, M(sp.earInner), 0, 0.15, 0.1)); e.rotation.z = s * -0.45; }
      else if (sp.ears === "floppy") { e = K.group(s * 0.66, 0.2, 0, K.ball(0.26, M(sp.ear), 0, -0.3, 0, 0.7, 1.6, 0.4)); e.rotation.z = s * 0.35; }
      else if (sp.ears === "fluffy") e = K.group(s * 0.72, 0.45, 0, K.ball(0.4, body, 0, 0, 0), K.ball(0.25, M(sp.earInner), 0, 0, 0.2, 1, 1, 0.4));
      if (e) { head.add(e); ears.push(e); }
    }
    g.add(head);
    const arms = [-1, 1].map((s) => {
      const p = K.group(s * 0.78, 1.85, 0);
      if (sp.flippers || sp.wings) p.add(K.ball(0.3, limbs, 0, -0.45, 0, 0.35, 1.5, 0.8));
      else p.add(K.cyl(0.15, 0.13, 1.05, limbs, 0, -0.52, 0), K.ball(0.18, hand, 0, -1.08, 0));
      g.add(p); return p;
    });
    const legs = [-1, 1].map((s) => { const p = K.group(s * 0.42, 0.62, 0, K.cyl(0.17, 0.15, 0.55, limbs, 0, -0.27, 0), K.ball(0.22, M(sp.feet ?? sp.hand ?? sp.belly), 0, -0.56, 0.1, 1, 0.6, 1.4)); g.add(p); return p; });
    let tail = null;
    if (sp.tail === "cotton") tail = K.ball(0.24, M(0xffffff), 0, 1.0, -0.82);
    else if (sp.tail === "curl") { tail = new T.Mesh(new T.TorusGeometry(0.16, 0.05, 8, 24, Math.PI * 1.6), body); tail.position.set(0, 1.1, -0.85); tail.rotation.y = Math.PI / 2; }
    else if (sp.tail === "bushy") tail = K.group(0, 1.0, -0.9, K.ball(0.32, body, 0, 0.3, -0.35, 0.9, 1.6, 0.9), K.ball(0.2, M(0xffffff), 0, 0.85, -0.5));
    else if (sp.tail === "cat") tail = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[0, 1, -0.75], [0.2, 1.3, -1.1], [0.1, 1.9, -1.15], [0.35, 2.2, -1.0]].map((p) => new T.Vector3(...p))), 30, 0.07, 10), body);
    if (tail) g.add(tail);
    g.rotation.y = 0.15;
    return { g, head, arms, legs, ears, tail, winkEye, dance: sp.dance, headTop: new T.Vector3(0.3, 3.55, 0) };
  }

  function gumdrop(T, color) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * (Math.PI / 2); pts.push(new T.Vector2(Math.cos(a) * 0.32 * (1 + 0.15 * Math.sin(a)), Math.sin(a) * 0.38)); }
    pts.unshift(new T.Vector2(0, 0));
    const m = new T.Mesh(new T.LatheGeometry(pts.reverse(), 28), new T.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2, sheen: 1, sheenColor: 0xffffff, side: T.DoubleSide }));
    return m;
  }

  /* ---------- each animal's own little world ---------- */
  function skyDisc(T, top, bottom) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d");
    const lin = x.createLinearGradient(0, 0, 0, 256); lin.addColorStop(0, top); lin.addColorStop(1, bottom);
    x.fillStyle = lin; x.fillRect(0, 0, 256, 256);
    x.globalCompositeOperation = "destination-in";
    const rad = x.createRadialGradient(128, 128, 60, 128, 128, 128); rad.addColorStop(0, "rgba(0,0,0,1)"); rad.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = rad; x.fillRect(0, 0, 256, 256);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(new T.CircleGeometry(4.6, 48), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.position.set(0, 2.6, -3);
    return m;
  }
  const mound = (T, K, color) => K.ball(2.8, K.mat(color, { roughness: 0.8 }), 0, -1.75, 0, 1, 0.95, 0.6);
  function flower(T, K, x, y, z, color) {
    const f = K.group(x, y, z, K.cyl(0.03, 0.03, 0.5, K.mat(0x3fa34d), 0, 0.25, 0), K.ball(0.08, K.mat(0xffe14d), 0, 0.52, 0.02));
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; f.add(K.ball(0.09, K.mat(color), Math.cos(a) * 0.12, 0.52 + Math.sin(a) * 0.12, 0)); }
    return f;
  }
  function palm(T, K, x, h) {
    const p = K.group(x, 0.4, -0.6);
    for (let i = 0; i < 6; i++) p.add(K.cyl(0.13, 0.16, h / 6, K.mat(i % 2 ? 0x9b6b3c : 0x87582c), Math.sin(i * 0.5) * 0.12, (i + 0.5) * (h / 6), 0));
    for (let i = 0; i < 6; i++) { const l = K.ball(0.6, K.mat(0x3fbf5f, { roughness: 0.6 }), 0, h, 0, 1.3, 0.12, 0.35); l.rotation.set(0, (i / 6) * Math.PI * 2, -0.45); l.position.x += Math.cos((i / 6) * Math.PI * 2) * 0.5; l.position.z += Math.sin((i / 6) * Math.PI * 2) * 0.5; p.add(l); }
    return p;
  }
  const SCENES = {
    unicorn: { sky: ["#ffd8f4", "#c7e6ff"], drop: "gumdrop", build: (T, K) => ({ g: rainbow(T, K), stand: 2.95 }) },
    monkey: { sky: ["#d6ffd8", "#7fd69a"], drop: "leaf", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0x5cbf4a), palm(T, K, -3.4, 5.6), palm(T, K, 3.5, 5.4));
      // Leafy canopy with two hanging vines to swing on.
      for (let i = 0; i < 11; i++) g.add(K.ball(0.75 + (i % 3) * 0.15, K.mat([0x3fbf5f, 0x2f9f4a, 0x5ccf5a][i % 3], { roughness: 0.7 }), -4 + i * 0.8, 6.5 + Math.sin(i * 1.7) * 0.25, -0.8 + (i % 2) * 0.3, 1.2, 0.7, 0.8));
      const vineMat = K.mat(0x4e8a2a, { roughness: 0.8 });
      const vines = [-1.6, 1.6].map((x) => {
        const v = K.cyl(0.05, 0.05, 1, vineMat, 0, 0, 0.3);
        const leaves = [0.3, 0.6].map(() => K.ball(0.1, K.mat(0x5ccf5a), 0, 0, 0.35, 1.6, 0.5, 0.5));
        g.add(v, ...leaves);
        return { x, top: 6.1, len: 2.6, mesh: v, leaves, angle: 0 };
      });
      const setVine = (vn) => {
        const ex = vn.x + Math.sin(vn.angle) * vn.len, ey = vn.top - Math.cos(vn.angle) * vn.len;
        vn.mesh.position.set((vn.x + ex) / 2, (vn.top + ey) / 2, 0.3); vn.mesh.scale.y = vn.len; vn.mesh.rotation.z = vn.angle;
        vn.leaves.forEach((l, i) => { const f = [0.3, 0.6][i]; l.position.set(vn.x + Math.sin(vn.angle) * vn.len * f + 0.08, vn.top - Math.cos(vn.angle) * vn.len * f, 0.35); });
        return { x: ex, y: ey };
      };
      vines.forEach(setVine);
      return { g, stand: 0.87, vines, setVine, tick: (t) => vines.forEach((vn) => { if (!vn.held) { vn.angle = Math.sin(t * 2 + vn.x) * 0.12; setVine(vn); } }) }; } },
    panda: { sky: ["#eaffe4", "#9fdd96"], drop: "leaf", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0x76c95b));
      [[-2.6, 4], [-1.9, 3.2], [2.0, 3.6], [2.7, 2.8]].forEach(([x, h]) => {
        const st = K.group(x, 0.2, -0.5);
        for (let y = 0; y < h; y += 0.6) st.add(K.cyl(0.11, 0.11, 0.56, K.mat(0x6fbf3a), 0, y + 0.3, 0), K.cyl(0.13, 0.13, 0.05, K.mat(0x4e9a26), 0, y + 0.6, 0));
        const leaf = K.ball(0.35, K.mat(0x4fbf3f), 0.3, h * 0.8, 0, 1.2, 0.1, 0.35); leaf.rotation.z = -0.5; st.add(leaf);
        g.add(st);
      });
      return { g, stand: 0.87, tick: (t) => g.children.slice(1).forEach((st, i) => (st.rotation.z = Math.sin(t * 2 + i) * 0.05)) }; } },
    bunny: { sky: ["#fff0f8", "#c9f0ff"], drop: "petal", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0x7fd65b));
      [[-1.8, 0.4], [1.9, 0.35], [-1.2, 0.7]].forEach(([x, y]) => { const c = K.group(x, y, 0.6, K.cone(0.14, 0.6, K.mat(0xff8c2a), 0, 0, 0)); c.children[0].rotation.z = Math.PI; for (const r of [-0.3, 0, 0.3]) { const l = K.cone(0.05, 0.35, K.mat(0x3fbf3f), r * 0.2, 0.45, 0); l.rotation.z = r; c.add(l); } g.add(c); });
      [[-2.4, 0.1, 0xff8fc6], [1.3, 0.62, 0xb48cff], [2.5, 0.05, 0xff6f91], [-0.9, 0.78, 0xffe14d], [0.8, 0.78, 0x6fc7ff]].forEach(([x, y, c]) => g.add(flower(T, K, x, y, 0.4, c)));
      return { g, stand: 0.87 }; } },
    kitten: { sky: ["#fff1e0", "#ffc9e2"], drop: "gumdrop", build: (T, K) => {
      const g = new T.Group(); g.add(K.ball(2.3, K.mat(0xb58cff, { roughness: 0.9 }), 0, 0.1, 0, 1.2, 0.35, 0.8));
      [[-1.1, 0.95], [1.1, 0.95], [-2.2, 0.45], [2.2, 0.45]].forEach(([x, y]) => g.add(K.ball(0.18, K.mat(0xffd84d), x * 1.08, y - 0.5, 0.9)));
      [[-2.5, 1.0, 0xff6fb5], [2.5, 1.0, 0x5fc8ff]].forEach(([x, y, c]) => { const yarn = K.group(x, y, 0.3, K.ball(0.45, K.mat(c, { roughness: 0.9 }), 0, 0, 0)); for (let i = 0; i < 4; i++) { const r = new T.Mesh(new T.TorusGeometry(0.45, 0.03, 6, 32), K.mat(c)); r.rotation.set(i * 0.8, i * 0.5, 0); yarn.add(r); } g.add(yarn); });
      return { g, stand: 0.85 }; } },
    puppy: { sky: ["#e2f5ff", "#9fd6ff"], drop: "gumdrop", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0x72cf5e));
      const house = K.group(-2.3, 0.3, -0.6, K.at(new T.Mesh(new T.BoxGeometry(1.3, 1.1, 1.1), K.mat(0xff6f6f)), 0, 0.55, 0));
      const roof = new T.Mesh(new T.ConeGeometry(1.1, 0.8, 4), K.mat(0x7a4a26)); roof.position.y = 1.5; roof.rotation.y = Math.PI / 4; house.add(roof, K.ball(0.3, K.mat(0x2a160c), 0, 0.4, 0.5, 1, 1.3, 0.2)); g.add(house);
      const bone = K.group(1.8, 0.45, 0.8, K.cyl(0.07, 0.07, 0.6, K.mat(0xffffff), 0, 0, 0)); bone.children[0].rotation.z = Math.PI / 2;
      for (const x of [-0.3, 0.3]) for (const y of [-0.08, 0.08]) bone.add(K.ball(0.1, K.mat(0xffffff), x, y, 0));
      bone.rotation.z = 0.3; g.add(bone);
      return { g, stand: 0.87 }; } },
    penguin: { sky: ["#eefaff", "#8fcff2"], drop: "snow", build: (T, K) => {
      const g = new T.Group();
      g.add(K.at(new T.Mesh(new T.CylinderGeometry(3.2, 3.4, 0.4, 36), K.mat(0x3f8fd6, { roughness: 0.2 })), 0, -0.2, -0.3));
      const floe = K.at(new T.Mesh(new T.CylinderGeometry(1.6, 1.8, 0.7, 7), K.mat(0xf2fbff, { roughness: 0.4 })), 0, 0.25, 0); g.add(floe);
      [[-2.4, 1.8], [2.5, 1.3], [-1.7, 1.0]].forEach(([x, h]) => g.add(K.at(new T.Mesh(new T.ConeGeometry(0.7, h, 5), K.mat(0xdff4ff, { roughness: 0.3 })), x, h / 2, -0.8)));
      return { g, stand: 0.6 }; } },
    frog: { sky: ["#dcfff1", "#8fdcc4"], drop: "bubble", build: (T, K) => {
      const g = new T.Group();
      g.add(K.ball(3.2, K.mat(0x4fb6d9, { roughness: 0.15, metalness: 0.1 }), 0, -0.1, -0.3, 1, 0.08, 0.5));
      const pad = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 0.08, 40, 1, false, 0.3, Math.PI * 2 - 0.6), K.mat(0x4fc257)); pad.position.y = 0.2; g.add(pad);
      [[-2.2, 0xff8fc6], [2.1, 0xffffff]].forEach(([x, c]) => { const lo = K.group(x, 0.25, 0.4); for (let i = 0; i < 7; i++) { const pe = K.ball(0.18, K.mat(c), Math.cos(i) * 0.14, 0.12, Math.sin(i) * 0.14, 0.6, 1.4, 0.6); pe.rotation.z = Math.cos(i) * 0.6; lo.add(pe); } lo.add(K.ball(0.09, K.mat(0xffe14d), 0, 0.2, 0)); g.add(lo); });
      [[-2.8, 2.2], [2.8, 1.9]].forEach(([x, h]) => g.add(K.cyl(0.03, 0.03, h, K.mat(0x3f8f3a), x, h / 2, -0.6), K.at(new T.Mesh(new T.CapsuleGeometry(0.1, 0.4, 4, 8), K.mat(0x7a4a26)), x, h, -0.6)));
      return { g, stand: 0.25 }; } },
    piggy: { sky: ["#fff3e8", "#ffcadb"], drop: "gumdrop", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0x86d15e));
      g.add(K.ball(1.5, K.mat(0x7a4b2a, { roughness: 0.15 }), 0, 0.82, 0.2, 1.1, 0.06, 0.5));
      [[-1.9, 0.4], [-1.4, 0.6], [1.6, 0.55]].forEach(([x, y]) => g.add(K.ball(0.1, K.mat(0x7a4b2a, { roughness: 0.15 }), x, y + 0.4, 0.6)));
      [[-2.4, 0.05, 0xffe14d], [2.3, 0.1, 0xff8fc6], [2.0, 0.4, 0xffffff]].forEach(([x, y, c]) => g.add(flower(T, K, x, y, 0.4, c)));
      return { g, stand: 0.87 }; } },
    fox: { sky: ["#fff2dc", "#ffba7a"], drop: "leafFall", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0xc9a24a));
      const log = K.cyl(0.55, 0.55, 3.2, K.mat(0x8a5a34), 0, 1.3, 0); log.rotation.z = Math.PI / 2; g.add(log);
      for (const x of [-1.6, 1.6]) { const end = K.cyl(0.5, 0.5, 0.02, K.mat(0xe8c39a), x * 1.005, 1.3, 0); end.rotation.z = Math.PI / 2; g.add(end); }
      [[-2.4, 0.3], [2.3, 0.35]].forEach(([x, y]) => { g.add(K.cyl(0.08, 0.1, 0.35, K.mat(0xfff5e6), x, y + 0.17, 0.6)); const cap = K.ball(0.28, K.mat(0xff3b30), x, y + 0.38, 0.6, 1, 0.6, 1); g.add(cap); [[-0.1, 0.1], [0.12, 0.05], [0, 0.17]].forEach(([dx, dz]) => g.add(K.ball(0.05, K.mat(0xffffff), x + dx, y + 0.52, 0.6 + dz))); });
      return { g, stand: 1.85 }; } },
    koala: { sky: ["#eefaf0", "#b3e1c2"], drop: "leaf", build: (T, K) => {
      const g = new T.Group();
      g.add(K.cyl(0.45, 0.6, 5, K.mat(0x9c8a7a), 2.4, 1.5, -0.6));
      const br = K.cyl(0.3, 0.38, 4.6, K.mat(0x9c8a7a), 0.2, 1.1, 0); br.rotation.z = Math.PI / 2 - 0.08; g.add(br);
      for (let i = 0; i < 9; i++) { const l = K.ball(0.3, K.mat(0x6fb58a), -2 + i * 0.5, 1.45 + (i % 2) * 0.25, -0.3 + (i % 3) * 0.2, 1.4, 0.3, 0.5); l.rotation.z = i % 2 ? 0.6 : -0.6; g.add(l); }
      return { g, stand: 1.35 }; } },
    chick: { sky: ["#fffbe0", "#ffe08a"], drop: "petalYellow", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0x9ad65b));
      const nest = new T.Mesh(new T.TorusGeometry(1.1, 0.35, 12, 40), K.mat(0xc9964a, { roughness: 1 })); nest.rotation.x = Math.PI / 2; nest.position.y = 1.05; nest.scale.z = 0.8; g.add(nest);
      for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2, st = K.cyl(0.025, 0.025, 0.7, K.mat(0xe0b060), Math.cos(a) * 1.1, 1.1, Math.sin(a) * 1.1); st.rotation.set(Math.random(), a, 1.2); g.add(st); }
      [[-0.55, 0.15], [0.6, 0.2]].forEach(([x, z]) => g.add(K.ball(0.26, K.mat(0xfffaf0), x, 1.1, z, 0.85, 1.1, 0.85)));
      return { g, stand: 0.95 }; } },
    bear: { sky: ["#fff7da", "#ffcf66"], drop: "honey", build: (T, K) => {
      const g = new T.Group(); g.add(mound(T, K, 0x7fcf5a));
      const pot = K.group(-2.1, 0.35, 0.5, K.ball(0.5, K.mat(0xd9894a), 0, 0.4, 0, 1, 0.9, 1), K.cyl(0.36, 0.38, 0.15, K.mat(0xd9894a), 0, 0.85, 0), K.ball(0.3, K.mat(0xffb81a, { roughness: 0.15, metalness: 0.2 }), 0, 0.92, 0, 1, 0.4, 1));
      g.add(pot);
      const hive = K.group(2.3, 1.8, -0.4);
      [0.5, 0.58, 0.55, 0.42, 0.28].forEach((r, i) => { const ring = new T.Mesh(new T.TorusGeometry(r, 0.16, 10, 24), K.mat(0xffc93a)); ring.rotation.x = Math.PI / 2; ring.position.y = i * 0.26; hive.add(ring); });
      g.add(hive);
      const bees = [0, 1, 2].map(() => { const b = K.group(0, 0, 0, K.ball(0.12, K.mat(0xffd21a), 0, 0, 0, 1.3, 1, 1), K.ball(0.1, K.mat(0xffffff, { transparent: true, opacity: 0.8 }), 0, 0.12, 0, 0.6, 0.3, 1)); g.add(b); return b; });
      return { g, stand: 0.87, tick: (t) => bees.forEach((b, i) => b.position.set(2.3 + Math.cos(t * 4 + i * 2) * 0.9, 2.2 + Math.sin(t * 6 + i) * 0.5, Math.sin(t * 4 + i * 2) * 0.6)) }; } },
    turtle: { sky: ["#8fe3ff", "#1d6fb8"], drop: "riseBubble", build: (T, K) => reefScene(T, K) },
    octopus: { sky: ["#8fe3ff", "#1d6fb8"], drop: "riseBubble", build: (T, K) => reefScene(T, K) },
    seahorse: { sky: ["#8fe3ff", "#1d6fb8"], drop: "riseBubble", build: (T, K) => reefScene(T, K) },
    clownfish: { sky: ["#8fe3ff", "#1d6fb8"], drop: "riseBubble", build: (T, K) => reefScene(T, K) },
    crab: { sky: ["#8fe3ff", "#1d6fb8"], drop: "riseBubble", build: (T, K) => reefScene(T, K) },
    whale: { sky: ["#e2f7ff", "#6cc8ff"], drop: "bubble", build: (T, K) => SCENES.dolphin.build(T, K) },
    otter: { sky: ["#e2f7ff", "#6cc8ff"], drop: "bubble", build: (T, K) => SCENES.dolphin.build(T, K) },
    chipmunk: { sky: ["#ffe3f3", "#c9b8ff"], drop: "petal", build: (T, K) => castleScene(T, K) },
    dolphin: { sky: ["#e2f7ff", "#6cc8ff"], drop: "bubble", build: (T, K) => {
      const g = new T.Group();
      const sun = K.ball(0.7, K.mat(0xffe14d, { emissive: 0xffc21a, emissiveIntensity: 0.9 }), 2.4, 4.3, -2.6); g.add(sun);
      const layers = [[0x9fe6ff, -0.6, 0.0, 1.35], [0x39a9e8, 0.15, 1.3, 1.15], [0x1f7fd0, 0.5, 2.6, 0.9]].map(([c, z, ph, top]) => {
        const geo = new T.PlaneGeometry(9, top + 1.2, 90, 1);
        const m = new T.Mesh(geo, K.mat(c, { roughness: 0.25, metalness: 0.05, transparent: z > 0, opacity: z > 0.3 ? 0.92 : 0.97, side: T.DoubleSide }));
        m.position.set(0, (top - 1.2) / 2, z);
        m.userData = { ph, top, base: geo.attributes.position.array.slice() };
        g.add(m); return m;
      });
      const foam = Array.from({ length: 14 }, (_, i) => { const f = K.ball(0.09, K.mat(0xffffff), -4 + i * 0.6, 0, 0.55); g.add(f); return f; });
      const wave = (x, t, ph) => 0.2 * Math.sin(x * 1.6 + t * 3 + ph) + 0.09 * Math.sin(x * 4.1 - t * 5 + ph);
      return { g, stand: 0.9, tick: (t) => {
        for (const m of layers) {
          const pos = m.geometry.attributes.position, b = m.userData.base, hh = (m.userData.top + 1.2) / 2;
          for (let i = 0; i < pos.count; i++) if (b[i * 3 + 1] > 0) pos.array[i * 3 + 1] = hh + wave(b[i * 3], t, m.userData.ph);
          pos.needsUpdate = true; m.geometry.computeVertexNormals();
        }
        const front = layers[2];
        foam.forEach((f) => { f.position.x = ((f.position.x + 4 + 0.02) % 8.4) - 4; f.position.y = front.userData.top + wave(f.position.x, t, front.userData.ph) + 0.02; });
      } }; } },
  };

  function dolphin(T, K) {
    const blue = K.mat(0x5aa9e6, { roughness: 0.25 }), belly = K.mat(0xe4f5ff, { roughness: 0.3 });
    const g = new T.Group();
    g.add(K.ball(1, blue, 0, 0, 0, 1.6, 0.62, 0.62), K.ball(0.9, belly, 0.1, -0.2, 0, 1.45, 0.38, 0.52), K.ball(0.56, blue, 1.12, 0.12, 0));
    const snout = K.cyl(0.13, 0.2, 0.6, blue, 1.75, -0.08, 0); snout.rotation.z = -Math.PI / 2; g.add(snout);
    const fin = K.cone(0.28, 0.65, blue, -0.15, 0.7, 0); fin.rotation.z = 0.55; g.add(fin);
    for (const s of [-1, 1]) { const fl = K.ball(0.32, blue, 0.5, -0.38, s * 0.5, 0.9, 0.18, 0.55); fl.rotation.x = s * 0.5; g.add(fl); }
    const tail = K.group(-1.5, 0, 0, K.cyl(0.14, 0.26, 0.6, blue, 0.1, 0, 0));
    tail.children[0].rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) { const fk = K.ball(0.4, blue, -0.35, 0, s * 0.32, 0.45, 0.1, 0.9); fk.rotation.y = s * 0.5; tail.add(fk); }
    g.add(tail);
    const winkEye = K.eye(1.28, 0.2, 0.4, 0.085), other = K.eye(1.28, 0.2, -0.4, 0.085);
    g.add(winkEye, other, K.ball(0.09, K.mat(0xff9fc0, { emissive: 0xff7ab8, emissiveIntensity: 0.2 }), 1.5, -0.08, 0.36, 1, 0.6, 0.4));
    const smile = new T.Mesh(new T.TorusGeometry(0.16, 0.03, 8, 20, Math.PI), K.mat(0x1b1030)); smile.position.set(1.62, -0.12, 0.2); smile.rotation.set(0, 0.6, Math.PI); g.add(smile);
    return { g, tail, winkEye, headTop: new T.Vector3(1.4, 1.1, 0), swimmer: true };
  }

  function makeDrop(T, K, kind) {
    const colors = [0xff6fb5, 0xffd84d, 0x5fe0d0, 0x9f8cff, 0x7fe3a0, 0xff9a5c, 0xff5c7a];
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    if (kind === "leaf" || kind === "leafFall") { const l = K.ball(0.22, K.mat(pick(kind === "leafFall" ? [0xff7a1a, 0xff3b30, 0xffb21a, 0xc9541a] : [0x3fbf5f, 0x6fd65b, 0x2f9f4a])), 0, 0, 0, 1.4, 0.12, 0.7); return { m: l, v: 1, flutter: true }; }
    if (kind === "petal" || kind === "petalYellow") return { m: K.ball(0.14, K.mat(pick(kind === "petal" ? [0xffb3d9, 0xff8fc6, 0xffffff, 0xd9b3ff] : [0xffe14d, 0xfff3a6, 0xffffff])), 0, 0, 0, 1, 0.3, 0.8), v: 1, flutter: true };
    if (kind === "snow") return { m: new T.Mesh(new T.IcosahedronGeometry(0.12, 0), K.mat(0xffffff, { emissive: 0xdff4ff, emissiveIntensity: 0.6 })), v: 0.8, flutter: true };
    if (kind === "riseBubble") return { m: new T.Mesh(new T.SphereGeometry(0.15, 14, 10), new T.MeshPhysicalMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.5, roughness: 0, clearcoat: 1 })), v: 2.2, flutter: true, rise: true };
    if (kind === "bubble") return { m: new T.Mesh(new T.SphereGeometry(0.18, 16, 12), new T.MeshPhysicalMaterial({ color: 0xbfeaff, transparent: true, opacity: 0.45, roughness: 0, clearcoat: 1 })), v: 1.2, flutter: true };
    if (kind === "honey") return { m: K.ball(0.14, K.mat(0xffb81a, { roughness: 0.1, metalness: 0.3 }), 0, 0, 0, 1, 1.3, 1), v: 3 };
    return { m: gumdrop(T, pick(colors)), v: 3 };
  }

  /* ---------- more grumps for wrong answers (original characters) ---------- */
  const angryBrows = (T, K, g, x, y, z, w = 0.42, color = 0x2a160c) => [-1, 1].map((s) => { const b = new T.Mesh(new T.BoxGeometry(w, 0.1, 0.1), K.mat(color)); b.position.set(s * x, y, z); b.rotation.z = s * 0.6; g.add(b); return b; });
  // A bratty kid throwing a full-body tantrum.
  function brat(T, K) {
    const coat = K.mat(0x7b4fe0), skin = K.mat(0xffd2b0), hat = K.mat(0xff8a1a), dark = K.mat(0x2a160c);
    const g = new T.Group();
    const body = K.ball(1.25, coat, 0, 1.25, 0, 1.15, 0.95, 0.95); g.add(body);
    [0.95, 1.35, 1.75].forEach((y) => g.add(K.ball(0.06, K.mat(0x2a1a5a), 0, y, 1.13)));
    const head = K.group(0, 2.75, 0.1, K.ball(1.0, skin, 0, 0, 0, 1.12, 0.95, 1));
    head.add(K.ball(1.0, hat, 0, 0.35, -0.05, 1.08, 0.72, 1.02), K.cyl(1.02, 1.1, 0.22, K.mat(0xffd84d), 0, 0.12, 0), K.ball(0.22, K.mat(0xffffff), 0, 1.05, 0));
    for (const s of [-1, 1]) head.add(K.ball(0.16, K.mat(0xffffff), s * 0.28, -0.05, 0.9), K.ball(0.07, dark, s * 0.26, -0.07, 1.04));
    const brows = angryBrows(T, K, head, 0.28, 0.14, 0.98, 0.34);
    const mouth = K.group(0, -0.45, 0.85, K.ball(0.3, K.mat(0x5a0010), 0, 0, 0, 1.4, 0.55, 0.4));
    mouth.add(K.at(new T.Mesh(new T.BoxGeometry(0.4, 0.07, 0.05), K.mat(0xffffff)), 0, 0.12, 0.1));
    head.add(mouth);
    g.add(head);
    const arms = [-1, 1].map((s) => { const a = K.group(s * 1.25, 1.7, 0, K.cyl(0.22, 0.2, 0.9, coat, 0, -0.45, 0), K.ball(0.24, K.mat(0xffd84d), 0, -0.95, 0)); g.add(a); return a; });
    const feet = [-1, 1].map((s) => { const f = K.ball(0.34, dark, s * 0.5, 0.15, 0.3, 1.2, 0.5, 1.4); g.add(f); return f; });
    return { g, head, headTop: new T.Vector3(0.4, 4.1, 0), update(t, dt, fx) {
      const on = t > 0.35 && t < 2.3, beat = Math.sin(t * 22);
      g.position.y = -3 * (1 - fx.ease.outBack(fx.seg(t, 0, 0.35))) - 3.5 * fx.ease.inOut(fx.outP) + (on ? Math.abs(Math.sin(t * 11)) * 0.35 : 0);
      feet[0].position.y = 0.15 + (on ? Math.max(0, beat) * 0.45 : 0); feet[1].position.y = 0.15 + (on ? Math.max(0, -beat) * 0.45 : 0);
      arms[0].rotation.z = on ? -2.2 + Math.sin(t * 25) * 0.9 : -0.2; arms[1].rotation.z = on ? 2.2 + Math.sin(t * 25 + 2) * 0.9 : 0.2;
      head.rotation.z = on ? Math.sin(t * 16) * 0.25 : 0;
      mouth.scale.y = on ? 1.3 + Math.abs(Math.sin(t * 14)) * 0.9 : 1;
      skin.emissive.setRGB(on ? 0.5 + 0.3 * Math.sin(t * 10) : 0, 0, 0);
      brows.forEach((b) => (b.position.y = 0.14 - (on ? 0.05 : 0)));
      fx.shake(on ? 0.12 : 0);
      if (on && Math.random() < 0.25) fx.puff(0xffffff, (Math.random() < 0.5 ? -1 : 1) * 1.1, 3.9, 0.2, (Math.random() - 0.5) * 2, 2.2);
    } };
  }
  // A big round swamp ogre with a stinky roar.
  function ogre(T, K) {
    const green = K.mat(0x86b83c, { roughness: 0.7 }), vest = K.mat(0x7a5230, { roughness: 0.9 }), shirt = K.mat(0xe8dcc0), dark = K.mat(0x1e140a);
    const g = new T.Group();
    const belly = K.ball(1.6, shirt, 0, 1.6, 0, 1.2, 1.05, 1); g.add(belly);
    for (const s of [-1, 1]) { const v = K.ball(1.62, vest, s * 0.55, 1.65, -0.05, 0.75, 1.02, 0.98); g.add(v); }
    g.add(K.cyl(1.55, 1.55, 0.25, K.mat(0x3a2410), 0, 0.85, 0));
    const head = K.group(0, 3.35, 0.2, K.ball(0.95, green, 0, 0, 0, 1.15, 0.95, 1));
    for (const s of [-1, 1]) head.add(K.ball(0.25, green, s * 1.1, 0.15, 0, 0.6, 1, 0.8));
    for (const s of [-1, 1]) head.add(K.ball(0.13, K.mat(0xffffff), s * 0.3, 0.18, 0.85), K.ball(0.06, dark, s * 0.3, 0.17, 0.97));
    const unibrow = new T.Mesh(new T.BoxGeometry(1.0, 0.16, 0.16), dark); unibrow.position.set(0, 0.38, 0.86); head.add(unibrow);
    head.add(K.ball(0.2, K.mat(0x6f9f2c), 0, -0.02, 1.0, 1.2, 0.8, 0.8));
    const jaw = K.group(0, -0.45, 0.6, K.ball(0.55, green, 0, 0, 0, 1.3, 0.55, 0.8), K.ball(0.4, K.mat(0x3a0a10), 0, 0.1, 0.25, 1.3, 0.35, 0.3));
    for (const s of [-1, 1]) { const tusk = K.cone(0.08, 0.3, K.mat(0xfff7e0), s * 0.3, 0.3, 0.35); jaw.add(tusk); }
    head.add(jaw); g.add(head);
    const arms = [-1, 1].map((s) => { const a = K.group(s * 1.85, 2.4, 0, K.cyl(0.35, 0.3, 1.3, green, 0, -0.65, 0), K.ball(0.45, green, 0, -1.35, 0)); g.add(a); return a; });
    const feet = [-1, 1].map((s) => { const f = K.ball(0.5, vest, s * 0.8, 0.2, 0.4, 1.3, 0.5, 1.5); g.add(f); return f; });
    return { g, headTop: new T.Vector3(0.6, 4.6, 0), update(t, dt, fx) {
      const on = t > 0.4 && t < 2.2, stomp = Math.sin(t * Math.PI * 4);
      g.position.y = -4 * (1 - fx.ease.outBack(fx.seg(t, 0, 0.4))) - 4.5 * fx.ease.inOut(fx.outP);
      g.rotation.z = stomp * 0.05;
      feet[0].position.y = 0.2 + Math.max(0, stomp) * 0.35; feet[1].position.y = 0.2 + Math.max(0, -stomp) * 0.35;
      belly.scale.set(1.2 + Math.sin(t * 18) * 0.05, 1.05 - Math.sin(t * 18) * 0.04, 1);
      jaw.position.y = -0.45 - (on ? 0.2 + Math.abs(Math.sin(t * 9)) * 0.15 : 0);
      arms.forEach((a, i) => (a.rotation.z = (i ? 1 : -1) * (on ? 2.3 + Math.sin(t * 12 + i * 3) * 0.4 : 0.25)));
      fx.shake(on && Math.abs(stomp) > 0.95 ? 0.3 : 0.05);
      if (on && Math.random() < 0.45) fx.puff([0x9acd32, 0x6b8e23, 0xb5d86a][Math.floor(Math.random() * 3)], (Math.random() - 0.5) * 0.6, 2.9, 1.3, (Math.random() - 0.5) * 3, 0.8 + Math.random(), 0.5);
    } };
  }
  // A huge ape that pounds its chest, then punches the screen.
  function ape(T, K) {
    const fur = K.mat(0x3a3a44, { roughness: 0.85 }), face = K.mat(0x6b5a55, { roughness: 0.6 }), dark = K.mat(0x121216);
    const g = new T.Group();
    g.add(K.ball(1.5, fur, 0, 1.8, 0, 1.25, 1.05, 0.95), K.ball(0.95, face, 0, 2.0, 0.8, 1.2, 0.9, 0.5));
    const head = K.group(0, 3.4, 0.15, K.ball(0.85, fur, 0, 0, 0), K.ball(0.62, face, 0, -0.1, 0.45, 1.1, 0.95, 0.7));
    head.add(K.ball(0.4, fur, 0, 0.55, -0.1, 1.2, 0.6, 1));
    for (const s of [-1, 1]) head.add(K.ball(0.1, K.mat(0xff2020, { emissive: 0xff0000, emissiveIntensity: 0.8 }), s * 0.25, 0.08, 0.95));
    const brow = new T.Mesh(new T.BoxGeometry(0.9, 0.2, 0.25), fur); brow.position.set(0, 0.28, 0.85); head.add(brow);
    const mouth = K.group(0, -0.4, 0.95, K.ball(0.28, K.mat(0x3a0010), 0, 0, 0, 1.5, 0.6, 0.4));
    [-0.22, 0.22].forEach((x) => { const f = K.cone(0.05, 0.18, K.mat(0xffffff), x, 0.08, 0.08); f.rotation.z = Math.PI; mouth.add(f); });
    head.add(mouth); g.add(head);
    const arms = [-1, 1].map((s) => { const a = K.group(s * 1.75, 2.7, 0.1, K.cyl(0.36, 0.3, 1.6, fur, 0, -0.8, 0), K.ball(0.5, face, 0, -1.65, 0)); g.add(a); return a; });
    let cracked = false;
    return { g, headTop: new T.Vector3(0.6, 4.4, 0), dur: 3.4, update(t, dt, fx) {
      g.position.y = -4 * (1 - fx.ease.outBack(fx.seg(t, 0, 0.4))) - 4.5 * fx.ease.inOut(fx.outP);
      const beat = fx.seg(t, 0.4, 1.3), wind = fx.seg(t, 1.3, 1.55), punch = fx.seg(t, 1.55, 1.72), back = fx.seg(t, 1.9, 2.5);
      if (t < 0.4) {
        mouth.scale.y = 1;
      } else if (beat < 1) {
        arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * 0.2; a.rotation.x = -1.2 - Math.max(0, Math.sin(t * 20 + i * Math.PI)) * 0.6; });
        mouth.scale.y = 1.4 + Math.abs(Math.sin(t * 10)) * 0.6;
        fx.shake(0.08);
      } else if (punch < 1) {
        arms[0].rotation.set(-0.4 + wind * 0.9, 0, -0.3);
        arms[1].rotation.set(-0.3 * wind - ease.inOut(punch) * 1.4, 0, 0.2);
        g.position.z = ease.inOut(punch) * 9;
        g.position.x = -ease.inOut(punch) * 0.9;
        mouth.scale.y = 2;
      } else {
        if (!cracked) { cracked = true; fx.crack(); fx.setText("😜 Kidding! Your computer's fine. Try again!"); }
        g.position.z = 9 * (1 - ease.inOut(back)); g.position.x = -0.9 * (1 - back);
        arms.forEach((a, i) => a.rotation.set(-0.3, 0, (i ? 1 : -1) * (0.3 + Math.abs(Math.sin(t * 12)) * 0.5)));
        head.rotation.z = Math.sin(t * 14) * 0.15; mouth.scale.y = 1 + Math.abs(Math.sin(t * 14));
        fx.shake(back < 0.3 ? 0.5 * (1 - back / 0.3) : 0);
      }
    } };
  }
  // A tiny, furious elf.
  function elf(T, K) {
    const tunic = K.mat(0x2fa84f), skin = K.mat(0xffd6b8), red = K.mat(0xe8323c), white = K.mat(0xffffff), gold = K.mat(0xffcf3f, { metalness: 0.6, roughness: 0.25 }), dark = K.mat(0x2a160c);
    const g = new T.Group();
    g.add(K.ball(0.8, tunic, 0, 1.35, 0, 1, 1.1, 0.9), K.cyl(0.82, 0.82, 0.18, dark, 0, 1.05, 0), K.at(new T.Mesh(new T.BoxGeometry(0.28, 0.24, 0.1), gold), 0, 1.05, 0.8));
    for (let i = 0; i < 6; i++) g.add(K.cone(0.14, 0.3, tunic, Math.cos((i / 6) * Math.PI * 2) * 0.72, 0.62, Math.sin((i / 6) * Math.PI * 2) * 0.72));
    const head = K.group(0, 2.6, 0, K.ball(0.7, skin, 0, 0, 0));
    for (const s of [-1, 1]) { const ear = K.cone(0.16, 0.7, skin, s * 0.8, 0.1, 0); ear.rotation.z = -s * 1.2; head.add(ear); head.add(K.ball(0.14, K.mat(0xff9fb0, { emissive: 0xff5c7a, emissiveIntensity: 0.3 }), s * 0.36, -0.15, 0.55, 1, 0.7, 0.5)); }
    for (const s of [-1, 1]) head.add(K.ball(0.1, dark, s * 0.23, 0.08, 0.64));
    const brows = angryBrows(T, K, head, 0.23, 0.28, 0.66, 0.3);
    const mouth = K.group(0, -0.3, 0.64, K.ball(0.14, K.mat(0x5a0010), 0, 0, 0, 1.4, 0.6, 0.4)); head.add(mouth);
    const hat = K.group(0, 0.45, -0.05, K.cyl(0.72, 0.74, 0.18, white, 0, 0, 0));
    const cone = K.cone(0.62, 1.5, K.mat(0xe8323c), 0, 0.8, 0); hat.add(cone);
    const bell = K.ball(0.14, gold, 0.55, 1.35, 0); hat.add(bell); hat.rotation.z = -0.3;
    head.add(hat); g.add(head);
    const arms = [-1, 1].map((s) => { const a = K.group(s * 0.75, 1.8, 0, K.cyl(0.13, 0.12, 0.8, tunic, 0, -0.4, 0), K.ball(0.16, skin, 0, -0.85, 0)); g.add(a); return a; });
    const legs = [-1, 1].map((s) => {
      const l = K.group(s * 0.35, 0.65, 0);
      for (let i = 0; i < 4; i++) l.add(K.cyl(0.12, 0.12, 0.13, i % 2 ? white : red, 0, -0.07 - i * 0.13, 0));
      const shoe = K.ball(0.18, tunic, 0, -0.6, 0.18, 1, 0.6, 1.8); l.add(shoe);
      const curl = new T.Mesh(new T.TorusGeometry(0.1, 0.04, 6, 16, Math.PI * 1.4), tunic); curl.position.set(0, -0.5, 0.5); curl.rotation.y = Math.PI / 2; l.add(curl);
      g.add(l); return l;
    });
    g.scale.setScalar(1.15);
    return { g, headTop: new T.Vector3(0.3, 4.2, 0), update(t, dt, fx) {
      const on = t > 0.35 && t < 2.2, hop = Math.abs(Math.sin(t * Math.PI * 3.5)), spin = fx.seg(t, 1.1, 1.5);
      g.position.y = -3 * (1 - fx.ease.outBack(fx.seg(t, 0, 0.35))) - 3.5 * fx.ease.inOut(fx.outP) + (on ? hop * 0.9 : 0);
      g.rotation.y = Math.PI * 2 * ease.inOut(spin);
      legs.forEach((l, i) => (l.rotation.x = on ? Math.sin(t * 20 + i * Math.PI) * 0.5 : 0));
      arms[0].rotation.z = on ? -2.6 + Math.sin(t * 28) * 0.4 : -0.2; arms[1].rotation.z = on ? 0.4 + Math.abs(Math.sin(t * 9)) * 0.6 : 0.2;
      head.rotation.z = on ? Math.sin(t * 13) * 0.15 : 0;
      bell.position.x = 0.55 + Math.sin(t * 30) * 0.06;
      mouth.scale.y = on ? 1.4 + Math.abs(Math.sin(t * 15)) : 1;
      skin.emissive.setRGB(on ? 0.35 + 0.25 * Math.sin(t * 12) : 0, 0, 0);
      brows.forEach((b) => (b.position.y = 0.28 - (on ? 0.04 : 0)));
      fx.shake(on && hop < 0.1 ? 0.15 : 0);
    } };
  }
  const GRUMPS = { brat, ogre, ape, elf };

  // Draws cracked glass where the ape's fist "hit" the screen.
  function crackScreen() {
    const c = document.createElement("canvas");
    c.className = "fx-crack"; c.setAttribute("aria-hidden", "true");
    c.width = innerWidth * (devicePixelRatio || 1); c.height = innerHeight * (devicePixelRatio || 1);
    const x = c.getContext("2d"), dpr = devicePixelRatio || 1, cx = c.width * 0.46, cy = c.height * 0.55;
    x.lineCap = "round";
    const line = (x0, y0, a, len, w, depth) => {
      let px = x0, py = y0;
      x.beginPath(); x.moveTo(px, py);
      const steps = 6 + Math.floor(Math.random() * 5);
      for (let i = 0; i < steps; i++) { a += (Math.random() - 0.5) * 0.5; px += Math.cos(a) * (len / steps); py += Math.sin(a) * (len / steps); x.lineTo(px, py);
        if (depth < 2 && Math.random() < 0.3) { x.stroke(); line(px, py, a + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random()), len * 0.4, w * 0.6, depth + 1); x.beginPath(); x.moveTo(px, py); } }
      x.lineWidth = w; x.strokeStyle = "rgba(255,255,255,.9)"; x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 4 * dpr; x.stroke();
    };
    for (let i = 0; i < 16; i++) line(cx, cy, (i / 16) * Math.PI * 2 + Math.random() * 0.3, (180 + Math.random() * 500) * dpr, (2 + Math.random() * 2) * dpr, 0);
    for (let r = 1; r <= 3; r++) { x.beginPath(); for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI * 2, rr = r * 38 * dpr * (0.8 + Math.random() * 0.4); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.lineWidth = 1.5 * dpr; x.stroke(); }
    const flash = x.createRadialGradient(cx, cy, 0, cx, cy, 90 * dpr); flash.addColorStop(0, "rgba(255,255,255,.85)"); flash.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = flash; x.fillRect(0, 0, c.width, c.height);
    document.body.append(c);
    document.body.classList.add("fx-smash");
    setTimeout(() => document.body.classList.remove("fx-smash"), 450);
    setTimeout(() => c.classList.add("fade"), 1100);
    setTimeout(() => c.remove(), 1900);
  }

  /* ---------- Mr. Mikey, the video teacher (an original big-headed school counselor) ---------- */
  function teacherModel(T, K) {
    const skin = K.mat(0xf6d2b4), vest = K.mat(0x6f9bd6, { roughness: 0.8 }), shirt = K.mat(0xffffff), tie = K.mat(0xd8323c), hair = K.mat(0x8a6a4a), dark = K.mat(0x1b1030);
    const g = new T.Group();
    g.add(K.ball(1.3, shirt, 0, -0.35, -0.05, 1.12, 0.95, 0.72), K.ball(1.4, vest, 0, -0.8, 0.02, 1.12, 0.88, 0.8));
    for (const s of [-1, 1]) { const c = K.cone(0.22, 0.4, shirt, s * 0.25, 0.45, 0.85); c.rotation.set(1.3, 0, s * 2.5); g.add(c); }
    g.add(K.at(new T.Mesh(new T.BoxGeometry(0.22, 0.18, 0.12), tie), 0, 0.38, 1.02));
    const tieBody = K.cone(0.2, 1.1, tie, 0, -0.2, 1.08); tieBody.rotation.z = Math.PI; g.add(tieBody);
    const head = K.group(0, 1.95, 0);
    head.add(K.ball(1.35, skin, 0, 0, 0, 1.12, 1.0, 0.95)); // the big, round head
    for (const s of [-1, 1]) { head.add(K.ball(0.32, hair, s * 1.3, 0.2, -0.2, 0.7, 1, 1)); head.add(K.ball(0.22, skin, s * 1.48, 0.05, 0, 0.5, 1, 0.8)); }
    head.add(K.ball(0.5, hair, 0, 1.2, -0.3, 1.2, 0.35, 0.9));
    const eyes = [-1, 1].map((s) => { const e = K.eye(s * 0.42, 0.15, 1.2, 0.12); head.add(e); return e; });
    for (const s of [-1, 1]) { const r = new T.Mesh(new T.TorusGeometry(0.3, 0.045, 10, 32), dark); r.position.set(s * 0.42, 0.15, 1.25); head.add(r); }
    const bridge = K.cyl(0.03, 0.03, 0.25, dark, 0, 0.18, 1.3); bridge.rotation.z = Math.PI / 2; head.add(bridge);
    const brows = [-1, 1].map((s) => { const b = new T.Mesh(new T.BoxGeometry(0.4, 0.08, 0.08), hair); b.position.set(s * 0.42, 0.58, 1.18); b.rotation.z = s * -0.12; head.add(b); return b; });
    head.add(K.ball(0.18, K.mat(0xf0bf9c), 0, -0.2, 1.33, 1, 0.9, 0.8));
    const mouth = K.group(0, -0.62, 1.12, K.ball(0.26, K.mat(0x5a1a24), 0, 0, 0, 1.3, 0.5, 0.4), K.ball(0.13, K.mat(0xff8fa0), 0, -0.06, 0.05, 1.2, 0.4, 0.4));
    head.add(mouth);
    g.add(head);
    const arms = [-1, 1].map((s) => {
      const a = K.group(s * 1.35, 0.25, 0.2, K.cyl(0.22, 0.2, 1.2, shirt, 0, -0.6, 0), K.ball(0.24, skin, 0, -1.25, 0));
      if (s > 0) { const stick = K.cyl(0.035, 0.035, 1.6, K.mat(0x8a5a34), 0, -1.3, 0.8); stick.rotation.x = Math.PI / 2; a.add(stick, K.ball(0.06, K.mat(0xffffff), 0, -1.3, 1.6)); }
      g.add(a); return a;
    });
    return { g, head, eyes, brows, mouth, arms };
  }

  async function teacher(container) {
    const T = await load();
    if (!T) return null;
    let renderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true }); } catch { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    container.append(renderer.domElement);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 1.2, 11);
    camera.lookAt(0, 1.0, 0);
    scene.add(new T.HemisphereLight(0xffffff, 0xd8e6ff, 2.2));
    const key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(3, 6, 8); scene.add(key);
    const K = kit(T), m = teacherModel(T, K);
    scene.add(m.g);
    let talking = false, gesture = null, gestureAt = 0, alive = true, blinkAt = 2;
    const size = () => { const w = container.clientWidth || 300, h = container.clientHeight || 300; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    size();
    const ro = new ResizeObserver(size); ro.observe(container);
    const t0 = performance.now();
    const frame = (now) => {
      if (!alive) return;
      const t = (now - t0) / 1000;
      m.g.position.y = Math.sin(t * 1.6) * 0.04;
      m.head.rotation.z = Math.sin(t * 0.9) * 0.04 + (talking ? Math.sin(t * 3.1) * 0.05 : 0);
      m.head.rotation.x = talking ? Math.sin(t * 4.3) * 0.05 : 0;
      m.mouth.scale.y = talking ? 0.35 + Math.abs(Math.sin(t * 17) * Math.sin(t * 5.3)) * 1.5 : 0.35;
      m.mouth.scale.x = talking ? 1 - Math.abs(Math.sin(t * 11)) * 0.15 : 1;
      if (t > blinkAt) { m.eyes.forEach((e) => (e.scale.y = 0.1)); if (t > blinkAt + 0.12) { m.eyes.forEach((e) => (e.scale.y = 1)); blinkAt = t + 2 + Math.random() * 3; } }
      m.brows.forEach((b, i) => (b.position.y = 0.58 + (talking && Math.sin(t * 1.7) > 0.7 ? 0.1 : 0)));
      const gp = gesture ? Math.min(1, (t - gestureAt) / 0.4) : 0, gout = gesture && t - gestureAt > 2.2 ? Math.min(1, (t - gestureAt - 2.2) / 0.4) : 0;
      const amt = gp * (1 - gout);
      if (gout >= 1) gesture = null;
      // Right arm points the stick at the board; left hand talks.
      m.arms[1].rotation.z = 0.15 + amt * 1.9;
      m.arms[1].rotation.x = -0.2 - amt * 0.3;
      m.arms[0].rotation.z = -0.15 - (talking ? 0.35 + Math.sin(t * 2.7) * 0.25 : 0);
      m.arms[0].rotation.x = talking ? -0.5 - Math.sin(t * 3.3) * 0.2 : 0;
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return {
      talk: (on) => (talking = on),
      point: () => { gesture = "point"; gestureAt = (performance.now() - t0) / 1000; },
      destroy: () => { alive = false; ro.disconnect(); scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((x) => x.dispose()); }); renderer.dispose(); renderer.domElement.remove(); },
    };
  }

  /* ---------- five in a row: a chipmunk offers an apple, with a princess and castle behind (original characters) ---------- */
  function castleScene(T, K) {
    const g = new T.Group();
    g.add(mound(T, K, 0x7fd65b));
    const castle = K.group(0.6, 0.4, -2.6);
    const wall = K.mat(0xf4ecff, { roughness: 0.6 }), roof = K.mat(0xff8fc6, { roughness: 0.4 });
    castle.add(K.at(new T.Mesh(new T.BoxGeometry(3, 1.8, 0.8), wall), 0, 0.9, 0));
    [[-1.6, 3.2], [1.6, 3.2], [-0.6, 3.8], [0.7, 4.4]].forEach(([x, h]) => {
      castle.add(K.cyl(0.35, 0.38, h, wall, x, h / 2, 0.1), K.cone(0.5, 1.0, roof, x, h + 0.5, 0.1));
      castle.add(K.cyl(0.015, 0.015, 0.5, K.mat(0x8a5a34), x, h + 1.25, 0.1), K.at(new T.Mesh(new T.BoxGeometry(0.28, 0.16, 0.02), K.mat(0xffd84d)), x + 0.15, h + 1.4, 0.1));
      castle.add(K.ball(0.1, K.mat(0x9fd8ff, { emissive: 0x9fd8ff, emissiveIntensity: 0.4 }), x, h * 0.7, 0.45, 0.8, 1.3, 0.3));
    });
    castle.add(K.ball(0.35, K.mat(0x8a5a34), 0, 0.35, 0.42, 1, 1.3, 0.2));
    g.add(castle);
    // A princess waving from beside the castle.
    const princess = K.group(-2.35, 0.55, -0.7);
    const gown = K.mat(0x9fd0ff, { roughness: 0.35 }), skin = K.mat(0xffd9c2), hair = K.mat(0xb5652d);
    princess.add(K.cone(0.9, 1.8, gown, 0, 0.9, 0), K.ball(0.3, gown, 0, 1.95, 0, 1, 1.2, 0.8));
    princess.add(K.cyl(0.08, 0.08, 0.2, skin, 0, 2.3, 0));
    const phead = K.group(0, 2.62, 0, K.ball(0.3, skin, 0, 0, 0), K.ball(0.34, hair, 0, 0.06, -0.1, 1, 1, 0.95), K.ball(0.28, hair, 0, -0.35, -0.2, 0.9, 1.6, 0.6));
    for (const s of [-1, 1]) phead.add(K.ball(0.05, K.mat(0x1b1030), s * 0.11, 0.02, 0.27), K.ball(0.06, K.mat(0xff9fc0), s * 0.18, -0.08, 0.23, 1, 0.6, 0.4));
    const tiara = new T.Mesh(new T.TorusGeometry(0.24, 0.03, 8, 24), K.mat(0xffcf3f, { metalness: 0.7, roughness: 0.2 })); tiara.rotation.x = Math.PI / 2 - 0.3; tiara.position.set(0, 0.28, 0.02); phead.add(tiara);
    [-0.12, 0, 0.12].forEach((x) => phead.add(K.cone(0.04, x ? 0.1 : 0.16, K.mat(0xffcf3f, { metalness: 0.7, roughness: 0.2 }), x, 0.36, 0.12)));
    princess.add(phead);
    const wave = K.group(0.28, 2.1, 0, K.cyl(0.06, 0.06, 0.6, skin, 0, 0.3, 0)); princess.add(wave);
    const other = K.group(-0.28, 2.05, 0, K.cyl(0.06, 0.06, 0.55, skin, 0, -0.27, 0)); other.rotation.z = -0.3; princess.add(other);
    g.add(princess);
    const stump = K.group(0, 0.5, 0.4, K.cyl(0.75, 0.85, 0.7, K.mat(0x8a5a34), 0, 0, 0), K.cyl(0.72, 0.72, 0.02, K.mat(0xe8c39a), 0, 0.36, 0));
    g.add(stump);
    [[-1.5, 0.35, 0xff8fc6], [1.9, 0.2, 0xffe14d], [2.5, 0.0, 0xb48cff], [-2.9, 0.0, 0xffffff]].forEach(([x, y, c]) => g.add(flower(T, K, x, y, 0.5, c)));
    return { g, stand: 1.4, tick: (t) => { wave.rotation.z = -0.4 + Math.sin(t * 6) * 0.5; princess.rotation.z = Math.sin(t * 1.5) * 0.04; phead.rotation.z = Math.sin(t * 2) * 0.1; } };
  }
  function chipmunk(T, K) {
    const fur = K.mat(0xb8743a), light = K.mat(0xf6dcb8), dark = K.mat(0x3a2410), red = K.mat(0xe8242e, { roughness: 0.25 });
    const g = new T.Group();
    g.add(K.ball(0.7, fur, 0, 0.95, 0, 0.95, 1.1, 0.85), K.ball(0.48, light, 0, 0.85, 0.35, 1, 1.2, 0.6));
    for (const s of [-1, 1]) { const st = K.ball(0.1, dark, s * 0.45, 1.05, -0.2, 0.5, 2.8, 0.5); st.rotation.z = s * 0.2; g.add(st); }
    const head = K.group(0, 1.95, 0.05, K.ball(0.55, fur, 0, 0, 0));
    for (const s of [-1, 1]) head.add(K.ball(0.26, light, s * 0.3, -0.18, 0.35, 1, 0.85, 0.8));
    head.add(K.ball(0.07, K.mat(0x3a1a24), 0, -0.02, 0.55), K.ball(0.3, dark, 0, 0.3, 0.2, 0.25, 0.7, 1));
    const winkEye = K.eye(0.2, 0.12, 0.48, 0.1), other = K.eye(-0.2, 0.12, 0.48, 0.1);
    head.add(winkEye, other);
    for (const s of [-1, 1]) head.add(K.ball(0.14, fur, s * 0.38, 0.45, -0.05, 1, 1.1, 0.5), K.ball(0.08, light, s * 0.38, 0.45, 0.02, 1, 1.1, 0.4));
    const smile = new T.Mesh(new T.TorusGeometry(0.1, 0.022, 6, 16, Math.PI), dark); smile.rotation.z = Math.PI; smile.position.set(0, -0.2, 0.56); head.add(smile);
    head.add(K.at(new T.Mesh(new T.BoxGeometry(0.1, 0.09, 0.03), K.mat(0xffffff)), 0, -0.3, 0.55));
    g.add(head);
    const tail = K.group(0, 0.6, -0.6);
    for (let i = 0; i < 7; i++) tail.add(K.ball(0.32 - i * 0.015, i % 3 === 1 ? dark : fur, 0, i * 0.28, -Math.sin(i * 0.45) * 0.55 - 0.1));
    g.add(tail);
    const arms = [-1, 1].map((s) => { const a = K.group(s * 0.5, 1.35, 0.2, K.cyl(0.08, 0.07, 0.45, fur, 0, -0.22, 0), K.ball(0.09, light, 0, -0.46, 0)); g.add(a); return a; });
    const apple = K.group(0, 0, 0, K.ball(0.26, red, 0, 0, 0, 1, 0.92, 1), K.cyl(0.02, 0.02, 0.14, K.mat(0x5a3a1a), 0, 0.27, 0));
    const leaf = K.ball(0.08, K.mat(0x3fbf3f), 0.08, 0.3, 0, 1.4, 0.4, 0.6); leaf.rotation.z = -0.6; apple.add(leaf);
    apple.add(K.ball(0.06, K.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.5 }), -0.1, 0.1, 0.2));
    g.add(apple);
    for (const s of [-1, 1]) g.add(K.ball(0.16, fur, s * 0.3, 0.12, 0.2, 1, 0.5, 1.4));
    g.scale.setScalar(1.3);
    return { g, head, winkEye, headTop: new T.Vector3(0.3, 2.9, 0), dur: 3.9, update(t, dt, fx) {
      const twirl = fx.seg(t, 0.4, 1.6), offer = fx.seg(t, 1.7, 2.2), wink = fx.seg(t, 2.3, 2.8);
      g.position.y = fx.base + Math.abs(Math.sin(twirl * Math.PI * 2)) * 0.9;
      g.rotation.y = Math.PI * 4 * ease.inOut(twirl) + (offer > 0 ? Math.sin(t * 2) * 0.1 : 0);
      arms[0].rotation.set(-offer * 1.3, 0, twirl > 0 && twirl < 1 ? -2.4 : -0.2);
      arms[1].rotation.set(-offer * 1.3, 0, twirl > 0 && twirl < 1 ? 2.4 : 0.2);
      apple.position.set(0, 1.0 + offer * 0.3, 0.55 + offer * 0.55);
      apple.rotation.y = t * 1.5;
      head.rotation.z = wink > 0 ? 0.22 * Math.sin(Math.min(1, wink * 2) * Math.PI / 2) : Math.sin(t * 6) * 0.08;
      winkEye.scale.y = wink > 0.1 && wink < 0.7 ? 0.12 : 1;
      tail.rotation.x = Math.sin(t * 5) * 0.2;
      fx.shake(0);
    } };
  }

  /* ---------- sea creatures (reef and ocean scenes) ---------- */
  function reefScene(T, K) {
    const g = new T.Group();
    g.add(K.ball(3.2, K.mat(0xf2d59a, { roughness: 0.9 }), 0, -2.3, 0, 1.1, 0.9, 0.6));
    const weeds = [-2.8, -2.2, 2.3, 2.9, -0.9].map((x, i) => {
      const w = K.group(x, 0.55, -0.4 + (i % 2) * 0.3);
      let parent = w; const segs = [];
      for (let k = 0; k < 6; k++) { const seg = K.group(0, k ? 0.38 : 0, 0, K.ball(0.13, K.mat(i % 2 ? 0x2faa5a : 0x4fcf6a, { roughness: 0.6 }), 0, 0.19, 0, 0.8, 1.6, 0.5)); parent.add(seg); segs.push(seg); parent = seg; }
      g.add(w); return segs;
    });
    [[1.4, 0.45, 0xff6f91], [-1.6, 0.4, 0xff9f4a], [0.6, 0.55, 0xb48cff]].forEach(([x, y, c]) => {
      const cor = K.group(x, y, 0.2);
      for (let k = 0; k < 5; k++) { const b = K.cone(0.09, 0.6, K.mat(c, { roughness: 0.5 }), Math.cos(k * 1.3) * 0.2, 0.25, Math.sin(k * 1.3) * 0.15); b.rotation.z = Math.cos(k * 1.3) * 0.6; cor.add(b, K.ball(0.09, K.mat(c), Math.cos(k * 1.3) * 0.38, 0.55, Math.sin(k * 1.3) * 0.15)); }
      g.add(cor);
    });
    g.add(K.ball(0.4, K.mat(0x8a8f9a, { roughness: 0.9 }), -0.2, 0.5, 0.5, 1.3, 0.6, 1), K.ball(0.3, K.mat(0x9aa0aa, { roughness: 0.9 }), 2.1, 0.45, 0.6, 1.2, 0.6, 1));
    const shell = K.group(-2.5, 0.55, 0.8, K.ball(0.2, K.mat(0xffc2d9), 0, 0, 0, 1.2, 0.4, 1), K.ball(0.07, K.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }), 0, 0.08, 0.05)); g.add(shell);
    return { g, stand: 2.2, tick: (t) => weeds.forEach((segs, i) => segs.forEach((sg, k) => (sg.rotation.z = Math.sin(t * 1.6 + i + k * 0.6) * 0.12))) };
  }
  const swimTo = (g, t, fx) => g.position.set(-5 + 5 * ease.inOut(fx.seg(t, 0.15, 0.9)), fx.base + Math.sin(t * 2.4) * 0.25, 0.3);
  function turtle(T, K) {
    const g = new T.Group(), body = K.group();
    body.add(K.ball(1, K.mat(0x3f9a4a, { roughness: 0.5 }), 0, 0.1, 0, 1.25, 0.55, 1), K.ball(0.95, K.mat(0xe8d49a), 0, -0.05, 0, 1.2, 0.3, 0.95));
    [[0, 0.62, 0], [0.55, 0.5, 0.35], [-0.55, 0.5, 0.35], [0.55, 0.5, -0.35], [-0.55, 0.5, -0.35], [0, 0.45, 0.62], [0, 0.45, -0.62]].forEach(([x, y, z]) => body.add(K.ball(0.26, K.mat(0x2a6f35), x, y, z, 1, 0.25, 1)));
    const head = K.group(1.45, 0.15, 0, K.ball(0.36, K.mat(0x8fd08a), 0, 0, 0, 1.2, 0.95, 0.95));
    const winkEye = K.eye(0.25, 0.12, 0.28, 0.07), other = K.eye(0.25, 0.12, -0.28, 0.07);
    const smile = new T.Mesh(new T.TorusGeometry(0.1, 0.02, 6, 16, Math.PI), K.mat(0x1b1030)); smile.position.set(0.38, -0.08, 0.1); smile.rotation.set(0, 1.2, Math.PI);
    head.add(winkEye, other, smile); body.add(head);
    const flip = [[0.7, 1], [0.7, -1], [-0.8, 1], [-0.8, -1]].map(([x, s], i) => { const f = K.group(x, -0.05, s * 0.85, K.ball(i < 2 ? 0.5 : 0.3, K.mat(0x8fd08a), 0, 0, s * 0.25, i < 2 ? 1.1 : 0.9, 0.15, 0.55)); body.add(f); return f; });
    g.add(body);
    return { g, winkEye, headTop: new T.Vector3(1.4, 1.3, 0), showAt: 2.0, update(t, dt, fx) {
      const loop = fx.seg(t, 1.0, 1.8), turn = fx.seg(t, 1.9, 2.3);
      swimTo(g, t, fx);
      g.position.y += Math.sin(loop * Math.PI * 2) * 1.2; g.position.x += Math.sin(loop * Math.PI * 2) * 0.8;
      body.rotation.z = loop * Math.PI * 2;
      g.rotation.y = -Math.PI / 2 * ease.inOut(turn) * 0.8;
      flip.forEach((f, i) => (f.rotation.x = Math.sin(t * 7 + (i % 2) * Math.PI) * 0.6 * (i % 2 ? -1 : 1)));
      winkEye.scale.y = t > 2.3 && t < 2.7 ? 0.12 : 1;
    } };
  }
  function octopus(T, K) {
    const purple = K.mat(0xb06ae8, { roughness: 0.45 }), g = new T.Group();
    const head = K.group(0, 1.9, 0, K.ball(0.95, purple, 0, 0, 0, 1, 1.15, 1));
    [[0.4, 0.5, 0.75], [-0.35, 0.7, 0.7], [0.1, 0.9, 0.8]].forEach(([x, y, z]) => head.add(K.ball(0.11, K.mat(0xd9a6ff), x, y, z, 1, 1, 0.4)));
    const winkEye = K.eye(0.32, -0.05, 0.85, 0.14), other = K.eye(-0.32, -0.05, 0.85, 0.14);
    const smile = new T.Mesh(new T.TorusGeometry(0.16, 0.03, 6, 16, Math.PI), K.mat(0x1b1030)); smile.rotation.z = Math.PI; smile.position.set(0, -0.4, 0.88);
    head.add(winkEye, other, smile, K.ball(0.1, K.mat(0xff9fc0), 0.5, -0.3, 0.75, 1, 0.6, 0.4), K.ball(0.1, K.mat(0xff9fc0), -0.5, -0.3, 0.75, 1, 0.6, 0.4));
    g.add(head);
    const arms = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2, root = K.group(Math.cos(a) * 0.55, 1.2, Math.sin(a) * 0.45);
      root.rotation.y = -a; let parent = root; const segs = [];
      for (let k = 0; k < 5; k++) { const sg = K.group(k ? 0.3 : 0, 0, 0, K.ball(0.17 - k * 0.025, purple, 0.15, 0, 0, 1.3, 1, 1)); parent.add(sg); segs.push(sg); parent = sg; }
      g.add(root); return segs;
    });
    return { g, winkEye, headTop: new T.Vector3(0.3, 3.3, 0), update(t, dt, fx) {
      const spin = fx.seg(t, 1.1, 1.8);
      g.position.set(0, fx.base + Math.abs(Math.sin(t * 4)) * 0.6, 0.2);
      g.rotation.y = Math.PI * 2 * ease.inOut(spin) + Math.sin(t * 2) * 0.2;
      arms.forEach((segs, i) => segs.forEach((sg, k) => (sg.rotation.z = -0.5 + Math.sin(t * 6 + i * 0.8 + k * 0.7) * 0.45)));
      head.scale.set(1 + Math.sin(t * 8) * 0.03, 1 - Math.sin(t * 8) * 0.03, 1);
      winkEye.scale.y = t > 2.2 && t < 2.6 ? 0.12 : 1;
    } };
  }
  function seahorse(T, K) {
    const gold = K.mat(0xffb84a, { roughness: 0.4 }), g = new T.Group();
    const spine = [[0, 2.4, 0.9], [0.15, 2.0, 0.85], [0.2, 1.55, 0.8], [0.1, 1.1, 0.75], [-0.05, 0.7, 0.6], [0, 0.35, 0.45], [0.2, 0.1, 0.32], [0.38, 0.12, 0.24], [0.4, 0.32, 0.18]];
    spine.forEach(([x, y, r]) => g.add(K.ball(r * 0.5, gold, x, y, 0)));
    const head = K.group(-0.05, 2.75, 0, K.ball(0.42, gold, 0, 0, 0));
    const snout = K.cyl(0.08, 0.12, 0.55, gold, -0.45, -0.12, 0); snout.rotation.z = Math.PI / 2 + 0.3; head.add(snout);
    [-0.15, 0.05, 0.25].forEach((x) => head.add(K.cone(0.06, 0.2, gold, x, 0.42, 0)));
    const winkEye = K.eye(-0.08, 0.08, 0.36, 0.09); head.add(winkEye, K.ball(0.08, K.mat(0xff9fc0), -0.2, -0.12, 0.3, 1, 0.6, 0.4));
    g.add(head);
    const fin = K.ball(0.3, K.mat(0xffe08a, { transparent: true, opacity: 0.8 }), 0.4, 1.7, 0, 0.3, 1, 0.9); g.add(fin);
    g.rotation.y = -0.4;
    return { g, winkEye, headTop: new T.Vector3(0, 3.6, 0), update(t, dt, fx) {
      const spin = fx.seg(t, 1.0, 1.7);
      g.position.set(Math.sin(t * 1.5) * 0.6, fx.base + 0.3 + Math.sin(t * 3) * 0.4, 0.3);
      g.rotation.y = -0.4 + Math.PI * 2 * ease.inOut(spin);
      g.rotation.z = Math.sin(t * 2.5) * 0.1;
      fin.scale.set(0.3 + Math.abs(Math.sin(t * 30)) * 0.15, 1, 0.9);
      winkEye.scale.y = t > 2.1 && t < 2.5 ? 0.12 : 1;
    } };
  }
  function clownfish(T, K) {
    const orange = K.mat(0xff7a1a, { roughness: 0.35 }), white = K.mat(0xffffff), black = K.mat(0x1b1030), g = new T.Group();
    g.add(K.ball(0.8, orange, 0, 0, 0, 1.3, 0.8, 0.55));
    [0.55, 0, -0.55].forEach((x, i) => { const band = K.ball(0.82, white, x, 0, 0, 0.12, 0.82 - Math.abs(x) * 0.25, 0.57); g.add(band); });
    const tail = K.group(-1.05, 0, 0, K.ball(0.4, orange, -0.25, 0, 0, 0.6, 1, 0.2)); g.add(tail);
    g.add(K.ball(0.3, orange, 0.1, 0.62, 0, 1.2, 0.6, 0.15), K.ball(0.22, orange, 0.3, -0.35, 0.45, 1, 0.4, 0.3));
    const winkEye = K.eye(0.7, 0.15, 0.4, 0.11), other = K.eye(0.7, 0.15, -0.4, 0.11);
    const smile = new T.Mesh(new T.TorusGeometry(0.1, 0.025, 6, 16, Math.PI), black); smile.position.set(0.95, -0.15, 0.2); smile.rotation.set(0, 1.1, Math.PI);
    g.add(winkEye, other, smile);
    return { g, winkEye, headTop: new T.Vector3(0.4, 1.2, 0), update(t, dt, fx) {
      const eight = fx.seg(t, 0.2, 2.0), turn = fx.seg(t, 2.0, 2.3), a = eight * Math.PI * 2;
      g.position.set(Math.sin(a) * 2.6, fx.base + 0.6 + Math.sin(a * 2) * 0.9, 0.4);
      const dx = Math.cos(a), dy = Math.cos(a * 2) * 2 * 0.9 / 2.6;
      g.rotation.set(0, turn > 0 ? -Math.PI / 2 * ease.inOut(turn) * 0.8 : dx < 0 ? Math.PI : 0, turn > 0 ? 0 : Math.atan(dy) * (dx < 0 ? -1 : 1));
      tail.rotation.y = Math.sin(t * 18) * 0.5;
      winkEye.scale.y = t > 2.35 && t < 2.7 ? 0.12 : 1;
    } };
  }
  function crab(T, K) {
    const red = K.mat(0xff4a3a, { roughness: 0.4 }), g = new T.Group();
    g.add(K.ball(0.85, red, 0, 0.6, 0, 1.3, 0.6, 0.9));
    const eyes = [-1, 1].map((s) => { const st = K.group(s * 0.3, 1.0, 0.3, K.cyl(0.05, 0.05, 0.4, red, 0, 0.2, 0)); const e = K.eye(0, 0.45, 0.05, 0.12); e.children[0].scale.setScalar(1); st.add(K.ball(0.14, K.mat(0xffffff), 0, 0.45, 0), e); g.add(st); return { st, e }; });
    const smile = new T.Mesh(new T.TorusGeometry(0.15, 0.03, 6, 16, Math.PI), K.mat(0x1b1030)); smile.rotation.z = Math.PI; smile.position.set(0, 0.55, 0.78); g.add(smile);
    const claws = [-1, 1].map((s) => {
      const arm = K.group(s * 1.0, 0.7, 0.3, K.cyl(0.09, 0.09, 0.6, red, s * 0.25, 0.2, 0));
      arm.children[0].rotation.z = -s * 0.8;
      const top = K.group(s * 0.5, 0.55, 0, K.cone(0.16, 0.5, red, 0, 0.25, 0)), bot = K.group(s * 0.5, 0.55, 0, K.cone(0.13, 0.4, red, 0, 0.2, 0));
      top.rotation.z = -s * 0.3; bot.rotation.z = s * 0.9; arm.add(top, bot); g.add(arm); return { arm, top, bot, s };
    });
    const legs = [];
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const l = K.group(s * 0.9, 0.45, -0.2 + k * 0.25, K.cyl(0.05, 0.04, 0.6, red, s * 0.25, -0.2, 0)); l.children[0].rotation.z = s * 0.9; g.add(l); legs.push(l); }
    return { g, winkEye: eyes[1].e, headTop: new T.Vector3(0.3, 1.9, 0), update(t, dt, fx) {
      const walk = Math.sin(t * 3);
      g.position.set(walk * 1.8, fx.base - 1.6 + Math.abs(Math.sin(t * 12)) * 0.08, 0.6);
      g.rotation.z = Math.sin(t * 12) * 0.05;
      claws.forEach((c, i) => { c.top.rotation.z = -c.s * (0.3 + Math.max(0, Math.sin(t * 14 + i)) * 0.5); c.arm.rotation.z = c.s * (Math.sin(t * 6 + i) * 0.3 - 0.3); });
      legs.forEach((l, i) => (l.rotation.x = Math.sin(t * 16 + i) * 0.4));
      eyes.forEach((e, i) => (e.st.rotation.z = Math.sin(t * 4 + i) * 0.2));
      eyes[1].e.scale.y = t > 2.2 && t < 2.6 ? 0.12 : 1;
    } };
  }
  function whale(T, K) {
    const blue = K.mat(0x3f7fd0, { roughness: 0.35 }), g = new T.Group();
    g.add(K.ball(1.5, blue, 0, 0, 0, 1.8, 0.95, 1), K.ball(1.3, K.mat(0xdff0ff), 0.3, -0.45, 0, 1.6, 0.5, 0.9));
    const tail = K.group(-2.4, 0.3, 0, K.cyl(0.25, 0.45, 0.8, blue, 0.3, 0, 0));
    tail.children[0].rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) { const f = K.ball(0.55, blue, -0.2, 0.25, s * 0.45, 0.5, 0.12, 1); f.rotation.x = s * 0.4; tail.add(f); }
    g.add(tail);
    const winkEye = K.eye(1.9, 0.2, 0.75, 0.12), other = K.eye(1.9, 0.2, -0.75, 0.12);
    const smile = new T.Mesh(new T.TorusGeometry(0.5, 0.04, 6, 24, Math.PI * 0.8), K.mat(0x1b1030)); smile.position.set(2.2, -0.25, 0.35); smile.rotation.set(0, 1.1, Math.PI * 1.1);
    g.add(winkEye, other, smile, K.ball(0.14, K.mat(0xff9fc0), 2.2, -0.05, 0.75, 1, 0.6, 0.4));
    return { g, winkEye, headTop: new T.Vector3(1.0, 2.6, 0), showAt: 1.8, update(t, dt, fx) {
      const rise = fx.seg(t, 0.1, 0.7), slap = fx.seg(t, 1.4, 1.9);
      g.position.set(-0.3, fx.base - 2.0 + ease.outBack(rise) * 2.9 + Math.sin(t * 2) * 0.1, -0.3);
      g.rotation.set(0, 0.35, Math.sin(t * 1.8) * 0.06);
      tail.rotation.z = Math.sin(slap * Math.PI) * 1.1 + Math.sin(t * 3) * 0.1;
      if (t > 0.7 && t < 1.5 && Math.random() < 0.8) fx.spray(1.6 + (Math.random() - 0.5) * 0.2, fx.base + 2.3, (Math.random() - 0.5) * 1.8, 5 + Math.random() * 2.5);
      if (slap > 0.8 && slap < 1 && Math.random() < 0.9) fx.spray(-2.6, fx.base, (Math.random() - 0.5) * 4, 3 + Math.random() * 2);
      winkEye.scale.y = t > 2.1 && t < 2.5 ? 0.12 : 1;
    } };
  }
  function otter(T, K) {
    const brown = K.mat(0x7a4a2a, { roughness: 0.6 }), cream = K.mat(0xe8c8a0), g = new T.Group(), body = K.group();
    body.add(K.ball(0.7, brown, 0, 0, 0, 1.7, 0.6, 0.7), K.ball(0.6, cream, 0.1, 0.18, 0, 1.4, 0.4, 0.55));
    const head = K.group(1.25, 0.35, 0, K.ball(0.45, brown, 0, 0, 0), K.ball(0.28, cream, 0.3, -0.08, 0, 1, 0.8, 1));
    const winkEye = K.eye(0.25, 0.15, 0.3, 0.07), other = K.eye(0.25, 0.15, -0.3, 0.07);
    head.add(winkEye, other, K.ball(0.07, K.mat(0x1b1030), 0.55, 0, 0), K.ball(0.12, brown, -0.05, 0.35, 0.3), K.ball(0.12, brown, -0.05, 0.35, -0.3));
    body.add(head);
    const paws = [-1, 1].map((s) => { const p = K.group(0.6, 0.45, s * 0.25, K.ball(0.12, brown, 0, 0, 0)); body.add(p); return p; });
    const shellMesh = K.group(0.55, 0.55, 0, K.ball(0.22, K.mat(0xffc2d9), 0, 0, 0, 1, 0.4, 1)); body.add(shellMesh);
    const tail = K.ball(0.3, brown, -1.35, 0, 0, 1.8, 0.3, 0.6); body.add(tail);
    g.add(body);
    return { g, winkEye, headTop: new T.Vector3(1.2, 1.5, 0), update(t, dt, fx) {
      const roll = fx.seg(t, 1.0, 1.7), turn = fx.seg(t, 1.9, 2.2);
      g.position.set(-4 + 4 * ease.outBack(fx.seg(t, 0.1, 0.8)), fx.base + 0.35 + Math.sin(t * 3) * 0.12, 0.2);
      g.scale.setScalar(1.3);
      body.rotation.x = Math.PI * 2 * ease.inOut(roll);
      g.rotation.set(0, -0.5 * ease.inOut(turn), Math.sin(t * 2.5) * 0.08);
      paws.forEach((p, i) => (p.position.x = 0.6 + Math.abs(Math.sin(t * 10 + i * Math.PI)) * 0.15));
      winkEye.scale.y = t > 2.2 && t < 2.6 ? 0.12 : 1;
    } };
  }
  const SEA = { turtle, octopus, seahorse, clownfish, crab, whale, otter };

  /* ---------- animation ---------- */
  const ease = { outBack: (p) => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }, inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2) };
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  let playing = false, stopReq = false;

  async function play(kind, text) {
    if (playing) return true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const T = await load();
    if (!T) return false;
    R ||= setup(T);
    if (!R) return false;
    playing = true; stopReq = false;
    const { renderer, scene, camera, canvas, bubble } = R;
    const K = kit(T);
    const W = innerWidth, H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const halfH = camera.position.z * Math.tan((camera.fov * Math.PI) / 360), halfW = halfH * camera.aspect;
    const root = new T.Group(); scene.add(root);
    const stage = new T.Group();
    const s = Math.min(0.62, (halfW * 2 * 0.8) / 6.4);
    stage.scale.setScalar(s);
    root.add(stage);

    const angry = kind === "monster" || !!GRUMPS[kind];
    stage.position.set(0, -halfH + (angry ? 0.75 : 0.25), 0);
    let who, base = 0, scene3 = null;
    if (angry) { who = GRUMPS[kind] ? GRUMPS[kind](T, K) : monster(T, K); stage.add(who.g); }
    else {
      const sc = SCENES[kind] || SCENES.unicorn;
      scene3 = sc.build(T, K);
      base = scene3.stand;
      stage.add(skyDisc(T, ...sc.sky), scene3.g);
      who = SEA[kind] ? SEA[kind](T, K) : kind === "chipmunk" ? chipmunk(T, K) : kind === "dolphin" ? dolphin(T, K) : kind === "monkey" ? monkey(T, K) : ZOO[kind] ? critter(T, K, ZOO[kind]) : unicorn(T, K);
      who.g.position.y = base;
      if (who.swimmer) who.g.position.z = -0.2;
      stage.add(who.g);
      if (who.banana) stage.add(who.banana);
    }
    const dropKind = angry ? null : (SCENES[kind] || SCENES.unicorn).drop;
    const drops = angry ? [] : Array.from({ length: 34 }, (_, i) => {
      const { m: d, v, flutter, rise } = makeDrop(T, K, i % 2 && dropKind !== "gumdrop" ? dropKind : "gumdrop");
      d.position.set((Math.random() * 2 - 1) * halfW, rise ? -halfH - 1 - Math.random() * 6 : halfH + 1 + Math.random() * 6, -2 + Math.random() * 4);
      d.userData = { v: v + Math.random() * (flutter ? 1 : 3), flutter, rise, sway: Math.random() * 6, spin: new T.Vector3(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2) };
      d.scale.setScalar(0.8 + Math.random() * 0.8);
      root.add(d); return d;
    });
    const puffs = [];
    const puffMat = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 1 });
    const splash = (x) => {
      for (let k = 0; k < 4; k++) {
        const d = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), new T.MeshStandardMaterial({ color: k % 2 ? 0xffffff : 0x9fe0ff, transparent: true, opacity: 0.95, roughness: 0.1 }));
        d.position.set(x + (Math.random() - 0.5) * 0.6, base, 0.3);
        d.userData = { vx: (Math.random() - 0.5) * 3, vy: 2.5 + Math.random() * 2.5, life: 0, drop: true };
        stage.add(d); puffs.push(d);
      }
    };

    document.body.append(canvas, bubble);
    bubble.textContent = text;
    bubble.className = `fx-bubble${angry ? " angry" : ""}`;
    bubble.style.opacity = "0";
    if (angry) document.body.classList.add("fx-grr");
    const DUR = who.dur || (angry ? 2.6 : 3.0);
    let shakeAmt = 0;
    const fxc = {
      ease, seg, base, get outP() { return seg((performance.now() - start) / 1000, DUR - 0.4, DUR); },
      shake: (a) => (shakeAmt = a),
      crack: crackScreen,
      setText: (t) => (bubble.textContent = t),
      spray: (x, y, vx, vy) => {
        const d = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), new T.MeshStandardMaterial({ color: Math.random() < 0.5 ? 0xffffff : 0x9fe0ff, transparent: true, opacity: 0.95, roughness: 0.1 }));
        d.position.set(x, y, 0.3); d.userData = { vx, vy, life: 0, drop: true }; stage.add(d); puffs.push(d);
      },
      puff: (color, x, y, z, vx, vy, size = 0.22) => {
        const p = new T.Mesh(new T.SphereGeometry(size, 12, 10), new T.MeshStandardMaterial({ color, transparent: true, opacity: 0.85, roughness: 1 }));
        p.position.set(x, y, z); p.userData = { vx, vy, life: 0 }; stage.add(p); puffs.push(p);
      },
    };
    const start = performance.now();
    let last = start;
    const headWorld = new T.Vector3();

    await new Promise((done) => {
      const frame = (now) => {
        const t = (now - start) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
        const inP = ease.outBack(seg(t, 0, 0.45)), outP = seg(t, DUR - 0.4, DUR);
        stage.scale.setScalar(s * Math.max(0.001, inP * (1 - ease.inOut(outP))));
        camera.position.x = 0; camera.position.y = 0;

        if (who.update) {
          who.update(t, dt, fxc);
          camera.position.x = (Math.random() - 0.5) * shakeAmt; camera.position.y = (Math.random() - 0.5) * shakeAmt;
        } else if (kind === "unicorn") {
          const u = who, dance = seg(t, 0.3, 1.45), twirl = seg(t, 1.45, 2.05), wink = seg(t, 2.05, 2.55);
          const beat = Math.sin(t * Math.PI * 5);
          u.g.position.y = base + (dance > 0 && dance < 1 ? Math.abs(beat) * 0.45 : 0) + Math.sin(twirl * Math.PI) * 1.3;
          u.legs.forEach((l, i) => (l.rotation.z = dance > 0 && dance < 1 ? beat * 0.55 * (i % 2 ? 1 : -1) : 0));
          u.head.rotation.z = dance < 1 ? Math.sin(t * Math.PI * 5) * 0.15 : wink > 0 ? 0.12 : 0;
          u.tail.rotation.x = Math.sin(t * 9) * 0.5;
          u.g.rotation.y = -0.65 + Math.PI * 2 * ease.inOut(twirl) + (wink > 0 ? 0.35 * Math.sin(wink * Math.PI) : 0);
          u.winkEye.scale.y = wink > 0.15 && wink < 0.75 ? 0.12 : 1;
        } else if (kind === "monkey" && scene3?.vines) {
          // Swing vine to vine, then hang one-handed and wink.
          const m = who, [A, B] = scene3.vines, sA = seg(t, 0.25, 1.05), fly = seg(t, 1.05, 1.2), sB = seg(t, 1.2, 1.9), hang = seg(t, 1.9, 3.0);
          A.held = sA > 0 && sA < 1; B.held = t >= 1.2;
          let hand;
          if (sA < 1) { A.angle = -1.0 + 2.0 * ease.inOut(sA); hand = scene3.setVine(A); }
          else if (fly < 1) { A.angle = 1.0 - fly; scene3.setVine(A); B.angle = -0.5; const a = { x: A.x + Math.sin(1.0) * A.len, y: A.top - Math.cos(1.0) * A.len }, b = scene3.setVine(B); hand = { x: a.x + (b.x - a.x) * fly, y: a.y + (b.y - a.y) * fly + Math.sin(fly * Math.PI) * 0.5 }; }
          else if (sB < 1) { B.angle = -0.5 + 1.4 * ease.inOut(sB); hand = scene3.setVine(B); }
          else { B.angle = 0.9 * Math.cos(hang * Math.PI * 3) * (1 - hang); hand = scene3.setVine(B); }
          const swingAngle = sA < 1 ? A.angle : B.angle;
          m.g.position.set(hand.x - 0.78, hand.y - 2.93, 0.4);
          m.g.rotation.set(0, 0.2, swingAngle * 0.5);
          m.arms[1].rotation.z = Math.PI - 0.05;
          m.arms[0].rotation.z = sB >= 1 ? -2.2 + Math.sin(t * 12) * 0.5 : -0.9 - Math.sin(t * 8) * 0.3;
          m.legs.forEach((l, i) => (l.rotation.x = Math.sin(t * 6 + i * Math.PI) * 0.5));
          m.head.rotation.z = sB >= 1 ? 0.15 : Math.sin(t * 5) * 0.1;
          m.banana.visible = false;
          m.winkEye.scale.y = t > 2.35 && t < 2.7 ? 0.12 : 1;
        } else if (kind === "monkey") {
          const m = who, dance = seg(t, 0.3, 2.4), beat = Math.sin(t * Math.PI * 4.5);
          m.g.position.y = base + (dance > 0 && dance < 1 ? Math.abs(beat) * 0.5 : 0);
          m.g.rotation.z = dance < 1 ? beat * 0.15 : 0;
          m.arms[0].rotation.z = dance > 0 && dance < 1 ? -2.4 + Math.sin(t * 14) * 0.5 : -0.2;
          m.arms[1].rotation.z = dance > 0 && dance < 1 ? 1.2 + beat * 1.1 : 0.2;
          m.legs.forEach((l, i) => (l.rotation.x = dance > 0 && dance < 1 ? Math.max(0, beat * (i ? 1 : -1)) * 0.8 : 0));
          m.head.rotation.z = Math.sin(t * Math.PI * 4.5 + 1) * 0.18;
          m.g.rotation.y = 0.2 + Math.sin(t * 3) * 0.35;
          const toss = seg(t, 0.6, 2.2);
          m.banana.visible = toss > 0 && toss < 1;
          m.banana.position.set(-1.1, base + 1.65 + Math.abs(Math.sin(toss * Math.PI * 2)) * 2.2, 0.6);
          m.banana.rotation.z = toss * Math.PI * 6;
          m.winkEye.scale.y = t > 2.3 && t < 2.6 ? 0.12 : 1;
        } else if (who.swimmer) {
          const m = who, swim = seg(t, 0.2, 0.75), leap = seg(t, 0.75, 1.75), pop = seg(t, 1.8, 2.3), wink = seg(t, 2.2, 2.7);
          m.tail.rotation.z = Math.sin(t * 14) * 0.45;
          if (leap === 0) { m.g.position.set(-4 + swim * 2, base - 0.7 + Math.sin(t * 8) * 0.08, -0.2); m.g.rotation.set(0, 0, Math.sin(t * 8) * 0.1); }
          else if (leap < 1) {
            m.g.position.set(-2 + leap * 4, base - 0.4 + Math.sin(leap * Math.PI) * 3.4, -0.2);
            m.g.rotation.set(Math.PI * 2 * ease.inOut(leap), 0, Math.cos(leap * Math.PI) * 0.9);
            if (Math.random() < 0.5 && (leap < 0.12 || leap > 0.9)) splash(leap < 0.5 ? -2 : 2);
          } else {
            // Pops up in the middle and "tail-walks" while waving a flipper.
            m.g.position.set(0, base - 0.7 + ease.outBack(pop) * 1.1 + Math.sin(t * 10) * 0.06, -0.2);
            m.g.rotation.set(0, pop * 0.4, 0.9 * ease.inOut(pop) + Math.sin(t * 7) * 0.08);
            if (pop > 0 && pop < 0.25 && Math.random() < 0.5) splash(0);
          }
          m.winkEye.scale.y = wink > 0.15 && wink < 0.75 ? 0.12 : 1;
        } else if (who.dance) {
          const m = who, d = seg(t, 0.3, 2.1), on = d > 0 && d < 1, beat = Math.sin(t * Math.PI * 4.5), up = Math.abs(beat);
          const wink = seg(t, 2.1, 2.6);
          let y = 0, ry = 0.15, rx = 0, rz = 0, a0 = -0.2, a1 = 0.2;
          if (m.dance === "bounce") { y = on ? up * 0.5 : 0; rz = on ? beat * 0.15 : 0; a0 = on ? -2.4 + Math.sin(t * 14) * 0.5 : -0.2; a1 = on ? 1.2 + beat * 1.1 : 0.2; }
          else if (m.dance === "hop") { const hop = Math.abs(Math.sin(t * Math.PI * 3)); y = on ? hop * 1.1 : 0; a0 = on ? -2.6 : -0.2; a1 = on ? 2.6 : 0.2; m.g.scale.set(1 + (on ? (1 - hop) * 0.12 : 0), 1 - (on ? (1 - hop) * 0.12 : 0), 1); }
          else if (m.dance === "twirl") { const sp = seg(t, 1.0, 1.8); y = on ? up * 0.35 + Math.sin(sp * Math.PI) * 1.2 : 0; ry = 0.15 + Math.PI * 2 * ease.inOut(sp) + (on ? Math.sin(t * 5) * 0.3 * (sp === 0 || sp === 1 ? 1 : 0) : 0); a0 = on ? -1.6 - up : -0.2; a1 = on ? 1.6 + up : 0.2; }
          else if (m.dance === "flip") { const fl = seg(t, 1.0, 1.7); y = on ? up * 0.3 + Math.sin(fl * Math.PI) * 2.0 : 0; rx = -Math.PI * 2 * ease.inOut(fl); a0 = on ? -2.8 : -0.2; a1 = on ? 2.8 : 0.2; }
          else { y = on ? up * 0.3 : 0; rz = on ? Math.sin(t * 6) * 0.2 : 0; ry = 0.15 + (on ? Math.sin(t * 3) * 0.4 : 0); a0 = on ? -2.7 + Math.sin(t * 16) * 0.45 : -0.2; a1 = on ? 0.4 + up * 0.4 : 0.2; }
          m.g.position.y = base + y;
          m.g.rotation.set(rx, ry + (wink > 0 ? 0.25 * Math.sin(wink * Math.PI) : 0), rz);
          m.arms[0].rotation.z = a0; m.arms[1].rotation.z = a1;
          m.legs.forEach((l, i) => (l.rotation.x = on ? Math.max(0, beat * (i ? 1 : -1)) * 0.7 : 0));
          m.head.rotation.z = on ? Math.sin(t * Math.PI * 4.5 + 1) * 0.16 : wink > 0 ? 0.15 : 0;
          m.ears.forEach((e, i) => (e.rotation.x = on ? Math.sin(t * 12 + i) * 0.25 : 0));
          if (m.tail) m.tail.rotation.z = Math.sin(t * 10) * 0.4;
          m.winkEye.scale.y = wink > 0.15 && wink < 0.75 ? 0.12 : 1;
        } else {
          const m = who, enter = seg(t, 0, 0.35), roar = seg(t, 0.4, 2.0);
          m.g.position.y = -3 * (1 - ease.outBack(enter)) - 3.5 * ease.inOut(outP);
          const stomp = Math.sin(t * Math.PI * 6);
          m.feet[0].position.y = 0.25 + Math.max(0, stomp) * 0.4; m.feet[1].position.y = 0.25 + Math.max(0, -stomp) * 0.4;
          m.g.rotation.z = stomp * 0.06;
          const shake = roar > 0 && roar < 1 ? 0.32 * (1 - roar * 0.6) : 0;
          camera.position.x = (Math.random() - 0.5) * shake; camera.position.y = (Math.random() - 0.5) * shake;
          m.mouth.scale.y = 1 + (roar > 0 && roar < 1 ? 1.4 + Math.sin(t * 22) * 0.4 : 0);
          m.mouth.scale.x = 1 + (roar > 0 && roar < 1 ? 0.2 : 0);
          m.arms.forEach((a, i) => (a.rotation.z = (i ? 1 : -1) * (roar > 0 && roar < 1 ? 2.5 + Math.sin(t * 20 + i) * 0.35 : 0.3)));
          m.brows.forEach((b, i) => (b.position.y = 2.62 - (roar > 0 && roar < 1 ? 0.1 + Math.abs(Math.sin(t * 16)) * 0.08 : 0)));
          const rage = roar > 0 && roar < 1 ? 0.6 + 0.4 * Math.sin(t * 14) : 0;
          m.furMat.emissive.setRGB(0.9 * rage, 0, 0.02);
          m.vein.scale.setScalar(1 + (roar > 0 && roar < 1 ? 0.35 * Math.abs(Math.sin(t * 18)) : 0));
          m.nostrils.forEach((n) => n.scale.setScalar(1 + 0.6 * rage));
          m.lids.forEach((l) => (l.position.y = 2.42 - 0.08 * rage));
          if (roar > 0.1 && roar < 0.9) for (let k = 0; k < 3; k++) {
            const f = new T.Mesh(new T.SphereGeometry(0.16, 10, 8), new T.MeshStandardMaterial({ color: [0xff3b1a, 0xff8a1a, 0xffd21a][k], emissive: [0xff2a00, 0xff6a00, 0xffc400][k], emissiveIntensity: 1.4, transparent: true, opacity: 0.95 }));
            f.position.set((Math.random() - 0.5) * 0.4, 1.25, 1.6);
            f.userData = { vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.3) * 1.5, vz: 5 + Math.random() * 3, life: 0, fire: true };
            stage.add(f); puffs.push(f);
          }
          m.body.scale.set(1.12 + (roar > 0 && roar < 1 ? 0.06 * Math.sin(t * 12) : 0), 1, 0.9);
          if (roar > 0 && roar < 1 && Math.random() < 0.35) {
            for (const side of [-1, 1]) {
              const p = new T.Mesh(new T.SphereGeometry(0.22, 12, 10), puffMat.clone());
              p.position.set(side * 1.25, 3.55, 0.1); p.userData = { vx: side * (0.6 + Math.random()), vy: 2 + Math.random() * 1.5, life: 0 };
              stage.add(p); puffs.push(p);
            }
          }
        }
        scene3?.tick?.(t);
        for (const p of puffs) {
          p.userData.life += dt; p.position.x += p.userData.vx * dt; p.position.y += p.userData.vy * dt; p.position.z += (p.userData.vz || 0) * dt;
          if (p.userData.drop) { p.userData.vy -= 9 * dt; p.material.opacity = Math.max(0, 0.95 - p.userData.life * 0.9); continue; }
          p.scale.setScalar(1 + p.userData.life * (p.userData.fire ? 5 : 3)); p.material.opacity = Math.max(0, 0.9 - p.userData.life * (p.userData.fire ? 2.2 : 1.2));
        }
        for (const d of drops) {
          if (d.userData.flutter) { d.position.x += Math.sin(t * 3 + d.userData.sway) * 0.9 * dt; d.userData.v += 1.5 * dt; } else d.userData.v += 9 * dt;
          d.position.y += (d.userData.rise ? 1 : -1) * d.userData.v * dt;
          d.rotation.x += d.userData.spin.x * dt; d.rotation.y += d.userData.spin.y * dt; d.rotation.z += d.userData.spin.z * dt;
        }
        // Speech bubble floats above the character's head.
        who.g.localToWorld(headWorld.copy(who.headTop));
        headWorld.project(camera);
        bubble.style.left = `${((headWorld.x + 1) / 2) * W}px`;
        bubble.style.top = `${((1 - headWorld.y) / 2) * H}px`;
        const showAt = who.showAt ?? (angry ? 0.45 : kind === "unicorn" || kind === "dolphin" ? 2.0 : kind === "chipmunk" ? 1.75 : 0.9);
        bubble.style.opacity = t > showAt && t < DUR - 0.35 ? "1" : "0";

        renderer.render(scene, camera);
        if (t < DUR && !stopReq) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });

    scene.remove(root);
    root.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((m) => m.dispose()); });
    renderer.clear();
    canvas.remove(); bubble.remove();
    document.body.classList.remove("fx-grr");
    playing = false;
    return true;
  }

  return { play, preload: load, animals: ["unicorn", "monkey", "dolphin", ...Object.keys(SEA), ...Object.keys(ZOO)], emoji: { unicorn: "🦄", monkey: "🐒", dolphin: "🐬", turtle: "🐢", octopus: "🐙", seahorse: "🌊", clownfish: "🐠", crab: "🦀", whale: "🐳", otter: "🦦", ...Object.fromEntries(Object.entries(ZOO).map(([k, v]) => [k, v.emoji])) }, teacher, stop: () => { if (playing) stopReq = true; }, grumps: ["monster", ...Object.keys(GRUMPS)], get playing() { return playing; } };
})();
