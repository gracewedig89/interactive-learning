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
    const fur = K.mat(0x8e3fe8, { roughness: 0.7 }), belly = K.mat(0xc79bff, { roughness: 0.7 });
    const spike = K.mat(0x57e39a), horn = K.mat(0xff9f3a, { roughness: 0.35 }), black = K.mat(0x14050f), white = K.mat(0xffffff, { roughness: 0.3 });
    const g = new T.Group();
    const body = K.ball(1.5, fur, 0, 1.7, 0, 1.12, 1, 0.9);
    g.add(body, K.ball(1, belly, 0, 1.35, 0.72, 1, 0.9, 0.5));
    for (let a = -70; a <= 70; a += 20) {
      const r = (a * Math.PI) / 180, s = K.cone(0.2, 0.55, spike, Math.sin(r) * 1.55, 1.7 + Math.cos(r) * 1.45, -0.45);
      s.rotation.z = -r; g.add(s);
    }
    for (const s of [-1, 1]) { const h = K.cone(0.22, 0.85, horn, s * 0.95, 3.15, 0.1); h.rotation.z = -s * 0.55; g.add(h); }
    const brows = [], pupils = [];
    for (const s of [-1, 1]) {
      g.add(K.ball(0.34, white, s * 0.5, 2.2, 1.12));
      const iris = K.ball(0.15, K.mat(0xff2d2d, { emissive: 0xff0000, emissiveIntensity: 0.5 }), s * 0.47, 2.15, 1.42); g.add(iris); pupils.push(iris);
      g.add(K.ball(0.07, black, s * 0.46, 2.14, 1.55));
      const brow = new T.Mesh(new T.BoxGeometry(0.7, 0.16, 0.2), black); brow.position.set(s * 0.48, 2.62, 1.3); brow.rotation.z = s * 0.5; g.add(brow); brows.push(brow);
    }
    const mouth = K.group(0, 1.3, 1.22, K.ball(0.55, black, 0, 0, 0, 1.5, 0.45, 0.35));
    [-0.52, -0.26, 0, 0.26, 0.52].forEach((x) => { const t = K.cone(0.09, 0.22, white, x, 0.15, 0.15); t.rotation.z = Math.PI; mouth.add(t); });
    [-0.36, 0.36].forEach((x) => mouth.add(K.cone(0.09, 0.26, white, x, -0.12, 0.15)));
    g.add(mouth);
    const arms = [-1, 1].map((s) => {
      const p = K.group(s * 1.55, 2.05, 0.1, K.cyl(0.26, 0.22, 1.2, fur, 0, -0.6, 0), K.ball(0.36, fur, 0, -1.25, 0));
      [-0.18, 0, 0.18].forEach((x) => { const c = K.cone(0.06, 0.25, white, x, -1.6, 0.12); c.rotation.z = Math.PI; p.add(c); });
      g.add(p); return p;
    });
    const feet = [-1, 1].map((s) => { const f = K.ball(0.45, fur, s * 0.75, 0.25, 0.35, 1.2, 0.55, 1.4); g.add(f); return f; });
    return { g, body, brows, pupils, mouth, arms, feet, furMat: fur, headTop: new T.Vector3(0.6, 3.9, 0) };
  }

  function gumdrop(T, color) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * (Math.PI / 2); pts.push(new T.Vector2(Math.cos(a) * 0.32 * (1 + 0.15 * Math.sin(a)), Math.sin(a) * 0.38)); }
    pts.unshift(new T.Vector2(0, 0));
    const m = new T.Mesh(new T.LatheGeometry(pts.reverse(), 28), new T.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2, sheen: 1, sheenColor: 0xffffff, side: T.DoubleSide }));
    return m;
  }

  /* ---------- animation ---------- */
  const ease = { outBack: (p) => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }, inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2) };
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  let playing = false;

  async function play(kind, text) {
    if (playing) return true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const T = await load();
    if (!T) return false;
    R ||= setup(T);
    if (!R) return false;
    playing = true;
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

    const angry = kind === "monster";
    stage.position.set(0, -halfH + (angry ? 0.75 : 0.25), 0);
    let who;
    if (angry) { who = monster(T, K); stage.add(who.g); }
    else {
      stage.add(rainbow(T, K));
      who = kind === "monkey" ? monkey(T, K) : unicorn(T, K);
      who.g.position.y = 2.95;
      stage.add(who.g);
      if (who.banana) stage.add(who.banana);
    }
    const drops = angry ? [] : Array.from({ length: 34 }, () => {
      const d = gumdrop(T, [0xff6fb5, 0xffd84d, 0x5fe0d0, 0x9f8cff, 0x7fe3a0, 0xff9a5c, 0xff5c7a][Math.floor(Math.random() * 7)]);
      d.position.set((Math.random() * 2 - 1) * halfW, halfH + 1 + Math.random() * 6, -2 + Math.random() * 4);
      d.userData = { v: 3 + Math.random() * 3, spin: new T.Vector3(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2) };
      d.scale.setScalar(0.8 + Math.random() * 0.8);
      root.add(d); return d;
    });
    const puffs = [];
    const puffMat = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 1 });

    document.body.append(canvas, bubble);
    bubble.textContent = text;
    bubble.className = `fx-bubble${angry ? " angry" : ""}`;
    bubble.style.opacity = "0";
    if (angry) document.body.classList.add("fx-grr");
    const DUR = angry ? 2.5 : 3.0;
    const start = performance.now();
    let last = start;
    const headWorld = new T.Vector3();

    await new Promise((done) => {
      const frame = (now) => {
        const t = (now - start) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
        const inP = ease.outBack(seg(t, 0, 0.45)), outP = seg(t, DUR - 0.4, DUR);
        stage.scale.setScalar(s * Math.max(0.001, inP * (1 - ease.inOut(outP))));
        camera.position.x = 0; camera.position.y = 0;

        if (kind === "unicorn") {
          const u = who, dance = seg(t, 0.3, 1.45), twirl = seg(t, 1.45, 2.05), wink = seg(t, 2.05, 2.55);
          const beat = Math.sin(t * Math.PI * 5);
          u.g.position.y = 2.95 + (dance > 0 && dance < 1 ? Math.abs(beat) * 0.45 : 0) + Math.sin(twirl * Math.PI) * 1.3;
          u.legs.forEach((l, i) => (l.rotation.z = dance > 0 && dance < 1 ? beat * 0.55 * (i % 2 ? 1 : -1) : 0));
          u.head.rotation.z = dance < 1 ? Math.sin(t * Math.PI * 5) * 0.15 : wink > 0 ? 0.12 : 0;
          u.tail.rotation.x = Math.sin(t * 9) * 0.5;
          u.g.rotation.y = -0.65 + Math.PI * 2 * ease.inOut(twirl) + (wink > 0 ? 0.35 * Math.sin(wink * Math.PI) : 0);
          u.winkEye.scale.y = wink > 0.15 && wink < 0.75 ? 0.12 : 1;
        } else if (kind === "monkey") {
          const m = who, dance = seg(t, 0.3, 2.4), beat = Math.sin(t * Math.PI * 4.5);
          m.g.position.y = 2.95 + (dance > 0 && dance < 1 ? Math.abs(beat) * 0.5 : 0);
          m.g.rotation.z = dance < 1 ? beat * 0.15 : 0;
          m.arms[0].rotation.z = dance > 0 && dance < 1 ? -2.4 + Math.sin(t * 14) * 0.5 : -0.2;
          m.arms[1].rotation.z = dance > 0 && dance < 1 ? 1.2 + beat * 1.1 : 0.2;
          m.legs.forEach((l, i) => (l.rotation.x = dance > 0 && dance < 1 ? Math.max(0, beat * (i ? 1 : -1)) * 0.8 : 0));
          m.head.rotation.z = Math.sin(t * Math.PI * 4.5 + 1) * 0.18;
          m.g.rotation.y = 0.2 + Math.sin(t * 3) * 0.35;
          const toss = seg(t, 0.6, 2.2);
          m.banana.visible = toss > 0 && toss < 1;
          m.banana.position.set(-1.1, 4.6 + Math.abs(Math.sin(toss * Math.PI * 2)) * 2.2, 0.6);
          m.banana.rotation.z = toss * Math.PI * 6;
          m.winkEye.scale.y = t > 2.3 && t < 2.6 ? 0.12 : 1;
        } else {
          const m = who, enter = seg(t, 0, 0.35), roar = seg(t, 0.45, 1.9);
          m.g.position.y = -3 * (1 - ease.outBack(enter)) - 3.5 * ease.inOut(outP);
          const stomp = Math.sin(t * Math.PI * 6);
          m.feet[0].position.y = 0.25 + Math.max(0, stomp) * 0.4; m.feet[1].position.y = 0.25 + Math.max(0, -stomp) * 0.4;
          m.g.rotation.z = stomp * 0.06;
          const shake = roar > 0 && roar < 1 ? (1 - roar) * 0.18 : 0;
          camera.position.x = (Math.random() - 0.5) * shake; camera.position.y = (Math.random() - 0.5) * shake;
          m.mouth.scale.y = 1 + (roar > 0 && roar < 1 ? 1.4 + Math.sin(t * 22) * 0.4 : 0);
          m.mouth.scale.x = 1 + (roar > 0 && roar < 1 ? 0.2 : 0);
          m.arms.forEach((a, i) => (a.rotation.z = (i ? 1 : -1) * (roar > 0 && roar < 1 ? 2.5 + Math.sin(t * 20 + i) * 0.35 : 0.3)));
          m.brows.forEach((b, i) => (b.position.y = 2.62 - (roar > 0 && roar < 1 ? 0.1 + Math.abs(Math.sin(t * 16)) * 0.08 : 0)));
          m.furMat.emissive.setRGB(0.55 * (roar > 0 && roar < 1 ? 0.5 + 0.5 * Math.sin(t * 12) : 0), 0, 0.05);
          m.body.scale.set(1.12 + (roar > 0 && roar < 1 ? 0.06 * Math.sin(t * 12) : 0), 1, 0.9);
          if (roar > 0 && roar < 1 && Math.random() < 0.35) {
            for (const side of [-1, 1]) {
              const p = new T.Mesh(new T.SphereGeometry(0.22, 12, 10), puffMat.clone());
              p.position.set(side * 1.25, 3.55, 0.1); p.userData = { vx: side * (0.6 + Math.random()), vy: 2 + Math.random() * 1.5, life: 0 };
              stage.add(p); puffs.push(p);
            }
          }
        }
        for (const p of puffs) {
          p.userData.life += dt; p.position.x += p.userData.vx * dt; p.position.y += p.userData.vy * dt;
          p.scale.setScalar(1 + p.userData.life * 3); p.material.opacity = Math.max(0, 0.85 - p.userData.life * 1.2);
        }
        for (const d of drops) {
          d.userData.v += 9 * dt;
          d.position.y -= d.userData.v * dt;
          d.rotation.x += d.userData.spin.x * dt; d.rotation.y += d.userData.spin.y * dt; d.rotation.z += d.userData.spin.z * dt;
        }
        // Speech bubble floats above the character's head.
        who.g.localToWorld(headWorld.copy(who.headTop));
        headWorld.project(camera);
        bubble.style.left = `${((headWorld.x + 1) / 2) * W}px`;
        bubble.style.top = `${((1 - headWorld.y) / 2) * H}px`;
        const showAt = angry ? 0.45 : kind === "unicorn" ? 2.0 : 0.9;
        bubble.style.opacity = t > showAt && t < DUR - 0.35 ? "1" : "0";

        renderer.render(scene, camera);
        if (t < DUR) requestAnimationFrame(frame); else done();
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

  return { play, preload: load, get playing() { return playing; } };
})();
