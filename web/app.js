// Study Hub (web version). Runs as a claude.ai artifact: Claude is the tutor through the
// `sample` capability (billed to your Claude plan, not an API key), and your due dates and
// generated lessons are kept in the artifact's private `db` store.

/* ---------- tiny DOM helper ---------- */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
  return el;
}
const $ = (sel) => document.querySelector(sel);
// replaceChildren/append turn null into the text "null"; skip empty slots instead.
for (const m of ["replaceChildren", "append", "prepend"]) {
  const orig = Element.prototype[m];
  Element.prototype[m] = function (...nodes) { return orig.apply(this, nodes.filter((n) => n != null && n !== false)); };
}
const md = (t) => DOMPurify.sanitize(marked.parse(t || ""));
const DEFAULT_CHART = ["Cash", "Accounts Receivable", "Supplies", "Prepaid Insurance", "Prepaid Rent", "Equipment", "Accounts Payable", "Notes Payable", "Unearned Revenue", "Wages Payable", "Common Stock", "Retained Earnings", "Dividends", "Service Revenue", "Rent Expense", "Wages Expense", "Utilities Expense", "Supplies Expense", "Insurance Expense", "Depreciation Expense", "Accumulated Depreciation", "Interest Expense", "Interest Payable"];
const money = (n) => (typeof n === "number" ? "$" + n.toLocaleString("en-US") : "");
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- classes ---------- */
const COURSES = [
  { key: "accounting", title: "Accounting", match: /acc(oun)?t/i, tutor: "an accounting tutor for an introductory financial accounting college course" },
  { key: "sql", title: "SQL", match: /sql|database|\bdb\b|data management|information systems|\b(ISA|IT|CS|IS|CIS|DBA|MIS)[\s-]?\d{4}/i, tutor: "a SQL and database tutor for ISA 2050 Management Information Systems, a college MIS course" },
  { key: "language-arts", title: "Language Arts 3010", match: /3010|language arts|professional writing|\bengl\b/i, tutor: "a writing tutor for ENGL 3010 Professional Writing and Business Ethics, covering professional and business writing, audience and purpose, document design, and ethical reasoning in business" },
  { key: "biology", title: "Biology 1010", match: /\bbiol|biology/i, tutor: "a biology tutor for BIOL 1010 General Biology, an introductory life-science college course" },
];
const courseOf = (key) => COURSES.find((c) => c.key === key) || (key === "explore"
  ? { key: "explore", title: state.explore?.topic ? `Explore: ${state.explore.topic.name}` : "Explore", tutor: `a patient, expert tutor on ${state.explore?.topic?.name || "the topic the student is exploring"}` }
  : { key, title: key, tutor: "a patient, expert tutor" });
const guessCourse = (text) => COURSES.find((c) => c.match.test(text))?.key || null;

/* ---------- capabilities ---------- */
let sample = null;
let downloads = null;
let db = null;
let me = null;
const ready = (async () => {
  if (!window.claude?.use) return;
  [sample, db] = await Promise.all([claude.use("sample"), claude.use("db")]);
  downloads = await claude.use("downloads");
  const user = await claude.use("user");
  me = user ? await user.id() : null;
  if (!me) db = null; // no private subtree: keep data in this browser instead
})();

/* ---------- celebrations: a dancing unicorn or monkey for every right answer ---------- */
const CHEERS = ["Nailed it!", "Yesss!", "You got it!", "So smart!", "Correct!", "Boom!", "Look at you go!", "Perfect!"];
const GUMDROP_COLORS = ["#ff6fb5", "#ffd84d", "#5fe0d0", "#9f8cff", "#7fe3a0", "#ff9a5c", "#ff5c7a"];
let celebrating = false, grumpy = false, pendingFx = null;
// A new answer always wins: stop whatever is playing, then play the reaction to the latest answer.
function interruptFx(kind) { pendingFx = kind; window.FX?.stop(); document.querySelector(".celebrate")?.remove(); }
function fxDone() {
  celebrating = false; grumpy = false;
  const next = pendingFx; pendingFx = null;
  if (next === "cheer") celebrate(); else if (next === "grump") grumble();
}
function celebrationsOn() { try { return localStorage.getItem("studyhub:celebrate") !== "off"; } catch { return true; } }
// Right answers in a row, across lessons (a wrong answer resets it).
function bumpStreak(ok) {
  let n = 0;
  try { n = Number(localStorage.getItem("studyhub:inarow")) || 0; } catch {}
  n = ok ? n + 1 : 0;
  try { localStorage.setItem("studyhub:inarow", String(n)); } catch {}
  return n;
}
let queuedSpecial = null;
function celebrate(special = null, streak = 0) {
  if (!celebrationsOn()) return;
  if (special) queuedSpecial = { special, streak };
  // Got it right while the monster is still stomping? Cut it short and cheer.
  if (celebrating) { if (grumpy || special) interruptFx("cheer"); return; }
  celebrating = true;
  const sp = queuedSpecial; queuedSpecial = null;
  const animal = sp ? sp.special : nextAnimal();
  const monkey = animal === "monkey";
  const cheer = animal === "chipmunk" ? `🍎 ${sp.streak} in a row! Would a pretty girl like an apple? 😉` : `${window.FX?.emoji[animal] || "😉"} ${CHEERS[Math.floor(Math.random() * CHEERS.length)]} 😉`;
  const fx = window.FX ? FX.play(animal, cheer) : Promise.resolve(false);
  fx.then((ok) => { if (ok) fxDone(); else flatCelebrate(monkey, cheer, animal === "chipmunk" ? "🐿️🍎" : window.FX?.emoji[animal]); });
}
// A different animal every time: go through the whole zoo in a shuffled order before any repeats.
function nextAnimal(all = window.FX?.animals || ["unicorn", "monkey"], key = "zoo") {
  let z;
  try { z = JSON.parse(localStorage.getItem("studyhub:" + key)) || {}; } catch { z = {}; }
  if (!Array.isArray(z.bag) || !z.bag.length || z.bag.some((a) => !all.includes(a))) {
    z.bag = [...all].sort(() => Math.random() - 0.5);
    if (z.bag[0] === z.last && z.bag.length > 1) z.bag.push(z.bag.shift());
  }
  const a = z.bag.shift();
  z.last = a;
  try { localStorage.setItem("studyhub:" + key, JSON.stringify(z)); } catch {}
  return a;
}
// The 2D version, for when 3D can't run.
function flatCelebrate(monkey, cheer, emoji) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const drops = reduced ? [] : Array.from({ length: 26 }, () => {
    const d = h("span", { class: "gumdrop" });
    d.style.left = `${Math.random() * 100}%`;
    d.style.background = GUMDROP_COLORS[Math.floor(Math.random() * GUMDROP_COLORS.length)];
    d.style.animationDelay = `${Math.random() * 0.9}s`;
    d.style.animationDuration = `${1.4 + Math.random() * 0.9}s`;
    d.style.setProperty("--spin", `${Math.random() < 0.5 ? -1 : 1}turn`);
    return d;
  });
  const el = h("div", { class: `celebrate${reduced ? " still" : ""}`, "aria-hidden": "true" },
    drops,
    h("div", { class: "stage-pop" },
      h("div", { class: "rainbow" }),
      h("div", { class: `dancer ${monkey ? "monkey" : "unicorn"}` }, emoji || (monkey ? "🐒" : "🦄")),
      monkey ? h("div", { class: "prop" }, "🍌") : null,
      h("div", { class: "bubble" }, cheer)));
  document.body.append(el);
  const t = setTimeout(end, reduced ? 1400 : 2600);
  let ended = false;
  function end() { if (ended) return; ended = true; clearTimeout(t); clearInterval(w); el.remove(); fxDone(); }
  const w = setInterval(() => { if (!el.isConnected) end(); }, 150);
}
// Wrong answer: a very grumpy (cartoon) monster.
const GROWLS = {
  monster: ["GRRRRR!! Try again!", "RAAAWR!! Not quite!", "GRAAAH! Check that one!", "ROOOAR!! So close!"],
  brat: ["WHAAAT?! That's NOT right!", "UGH! I'm SO mad right now!", "NO NO NO! Wrong wrong WRONG!", "That is SO not fair! Try again!"],
  ogre: ["GRRAAH! Ogre not happy!", "BLEH! Wrong! Try again!", "HRRMPH! Swamp says NO!"],
  ape: ["OOH OOH AAH AAAH!!", "RAAAH! WRONG ANSWER!", "OOK! OOK! NOPE!"],
  elf: ["NAUGHTY LIST! Try again!", "HMPH! Santa would NOT approve!", "Jingle NOPE! Try again!"],
};
function grumble() {
  if (!celebrationsOn()) return;
  // Wrong while an animal is still dancing? Cut it short and bring out the monster.
  if (celebrating) { if (!grumpy) interruptFx("grump"); return; }
  celebrating = true; grumpy = true;
  const who = nextAnimal(window.FX?.grumps || ["monster"], "grumps");
  const lines = GROWLS[who] || GROWLS.monster;
  const text = ["😡 ", "💢 ", "😤 ", "🤬 "][Math.floor(Math.random() * 4)] + lines[Math.floor(Math.random() * lines.length)];
  const fx = window.FX ? FX.play(who, text) : Promise.resolve(false);
  fx.then((ok) => {
    if (ok) { fxDone(); return; }
    const el = h("div", { class: "celebrate", "aria-hidden": "true" }, h("div", { class: "stage-pop" }, h("div", { class: "dancer monster" }, ({ brat: "😫", ape: "🦍", elf: "🧝" })[who] || "👹"), h("div", { class: "bubble angry" }, text)));
    document.body.append(el);
    let ended = false;
    const done = () => { if (ended) return; ended = true; clearTimeout(timer); clearInterval(watch); el.remove(); fxDone(); };
    const timer = setTimeout(done, 2000);
    const watch = setInterval(() => { if (!el.isConnected) done(); }, 100);
  });
}
if (celebrationsOn()) setTimeout(() => window.FX?.preload(), 4000); // warm up 3D so the first one plays instantly

/* ---------- Explore's gold sea: follows the pointer, ripples on taps and moves, drifts with scroll ---------- */
let sea = null;
function goldSea(on) {
  if (!on) { sea?.remove(); sea = null; return; }
  if (sea) return;
  sea = h("div", { class: "gold-sea", "aria-hidden": "true" },
    h("div", { class: "caustic" }), h("div", { class: "caustic two" }), h("div", { class: "glint" }), h("div", { class: "glitter" }), h("div", { class: "glitter two" }));
  document.body.prepend(sea);
}
{
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastRipple = 0, raf = 0, px = 0, py = 0;
  const ripple = (x, y, small) => {
    if (!sea || calm()) return;
    const r = h("span", { class: `ripple${small ? " small" : ""}` });
    r.style.left = `${x}px`; r.style.top = `${y}px`;
    r.style.setProperty("--r", small ? 4 + Math.random() * 3 : 10 + Math.random() * 4);
    sea.append(r);
    setTimeout(() => r.remove(), 1500);
  };
  addEventListener("pointermove", (e) => {
    if (!sea) return;
    px = e.clientX; py = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; sea?.style.setProperty("--mx", `${px}px`); sea?.style.setProperty("--my", `${py}px`); });
    const now = performance.now();
    if (now - lastRipple > 140 && Math.hypot(e.movementX || 0, e.movementY || 0) > 6) { lastRipple = now; ripple(px, py, true); }
  }, { passive: true });
  addEventListener("pointerdown", (e) => ripple(e.clientX, e.clientY, false), { passive: true });
  addEventListener("scroll", () => sea?.style.setProperty("--sea-scroll", `${-(scrollY * 0.15) % 400}px`), { passive: true });
}

/* ---------- storage: private db docs, falling back to this browser ---------- */
const local = {
  get(k) { try { return JSON.parse(localStorage.getItem("studyhub:" + k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem("studyhub:" + k, JSON.stringify(v)); } catch {} },
};
const store = {
  async get(name) {
    if (db) {
      // Saved data comes back read-only; work on an editable copy.
      try { const s = await db.doc(`data/users/${me}/${name}`).get(); if (s.exists) return JSON.parse(JSON.stringify(s.data())); } catch (e) { console.warn(e); }
    }
    return local.get(name);
  },
  async set(name, value) {
    local.set(name, value);
    if (db) { try { await db.doc(`data/users/${me}/${name}`).set(value); } catch (e) { console.warn(e); } }
  },
};

/* ---------- state ---------- */
const state = {
  view: "home",
  course: null,
  lessonId: null,
  deadlines: [],     // {id, title, due (ISO), courseKey, courseLabel, url, description}
  lessons: [],       // generated: {id, courseKey, title, source, createdAt, data}
  chats: {},         // courseKey -> [{role, content}]
  activity: [],
  builder: null,     // prefill for the lesson builder
  progress: {},      // "course:lessonId" -> completion + missed concepts
  worksheets: [],    // interactive worksheets: {id, courseKey, title, assignment, instructions, sections, answers}
  stats: { days: {} }, // "YYYY-MM-DD" -> courseKey -> {q, right, first, firstRight, secs, done, practice}
  scholarships: [],  // {id, name, amount, deadline, url, eligibility, requirements, questions, status, fit, drafts, interview}
  profile: {},       // the student's "about me" answers for scholarships
  inbox: [],         // readings brought in from Claude in Chrome, not built into lessons yet: {id, courseKey, title, text, module}
  readings: {},      // courseKey -> every reading kept for weekly notes: [{id, title, module, kind, url, text, addedAt}]
  pathBuilding: {},  // courseKey -> {started} | {error} while the next path lesson is being made
  weekNotes: {},     // "courseKey|module" -> {overview, mustKnow, readings, terms, questions, readingIds, createdAt}
};

async function loadState() {
  await ready;
  const [d, l, p] = await Promise.all([store.get("deadlines"), store.get("lessons"), store.get("progress")]);
  mergeProgress(state.progress, p?.lessons); // merge in place: open lessons keep their references
  state.inbox = (await store.get("inbox"))?.items || [];
  await Promise.all(COURSES.map(async (c) => { state.readings[c.key] = (await store.get("readings-" + c.key))?.items || []; }));
  for (const r of state.inbox) keepReading(r.courseKey, r, false); // readings imported before the library existed
  state.weekNotes = (await store.get("weeknotes"))?.notes || {};
  state.worksheets = (await store.get("worksheets"))?.items || [];
  state.scholarships = (await store.get("scholarships"))?.items || [];
  state.profile = (await store.get("profile")) || {};
  state.goals = { vision: "", goals: [], plan: null, chat: [], ...((await store.get("goals")) || {}) };
  state.explore.topics = (await store.get("explore"))?.topics || state.explore.topics;
  mergeStats(state.stats, await store.get("stats"));
  state.deadlines = (d?.items || []).map(normalizeDeadline);
  state.deadlinesUpdatedAt = d?.updatedAt || null;
  state.doneDeadlines = d?.done || {};
  mergeLessons(l);
  state.chats = local.get("chats") || {};
}
const saveDeadlines = () => { state.deadlinesUpdatedAt = new Date().toISOString(); return store.set("deadlines", { items: state.deadlines, updatedAt: state.deadlinesUpdatedAt, done: state.doneDeadlines || {} }); };
// Assignments she has marked done. Remembered by Canvas id and by class + title, so re-importing never brings them back.
const dlKeys = (d) => [d.id, `${d.courseKey || d.courseLabel || ""}|${String(d.title).toLowerCase().trim()}`].filter(Boolean);
const dlDone = (d) => dlKeys(d).some((k) => state.doneDeadlines?.[k]);
const openDeadlines = () => state.deadlines.filter((d) => !dlDone(d));
function markDeadline(d, done) {
  state.doneDeadlines ||= {};
  for (const k of dlKeys(d)) { if (done) state.doneDeadlines[k] = new Date().toISOString(); else delete state.doneDeadlines[k]; }
  saveDeadlines();
  if (done) celebrate();
  render();
}
const doneButton = (d) => h("button", { class: "btn quiet small done-btn", title: "Mark this assignment done", "aria-label": `Mark ${d.title} done`, onclick: () => markDeadline(d, true) }, "✓ Done");
/* Saving without clobbering: Study Hub may be open in two places at once (the Claude app and
   a browser tab, or phone and computer). Each save first folds in what the other copy saved,
   so finishing a lesson in one place can't be erased by an older copy somewhere else. */
function mergeProgress(into, other = {}) {
  for (const [k, r] of Object.entries(other || {})) {
    if (!r) continue;
    const l = (into[k] ||= {});
    const done = Boolean(l.done || r.done);
    const completedAt = l.completedAt || r.completedAt;
    const solved = Math.max(l.solved || 0, r.solved || 0);
    const total = Math.max(l.total || 0, r.total || 0);
    const localEmpty = !Object.keys(l).length;
    if (localEmpty || (r.updatedAt || "") > (l.updatedAt || "")) Object.assign(l, r); // newer copy wins for the mistake list and practice set
    else for (const [f, v] of Object.entries(r)) if (l[f] === undefined) l[f] = v; // fill anything this copy is missing
    Object.assign(l, { done, completedAt, solved, total });
    if (!l.done) delete l.done;
    if (!l.completedAt) delete l.completedAt;
  }
  return into;
}
function mergeStats(into, other) {
  into.days ||= {};
  for (const [day, courses] of Object.entries(other?.days || {}))
    for (const [c, rec] of Object.entries(courses || {})) {
      const mine = ((into.days[day] ||= {})[c] ||= {});
      for (const [f, v] of Object.entries(rec || {})) mine[f] = Math.max(mine[f] || 0, Number(v) || 0);
    }
  return into;
}
let deletedLessons = [];
function mergeLessons(remote) {
  deletedLessons = [...new Set([...deletedLessons, ...(remote?.deleted || [])])];
  const have = new Set(state.lessons.map((x) => x.id));
  for (const x of remote?.items || []) if (!have.has(x.id)) state.lessons.push(x);
  state.lessons = state.lessons.filter((x) => !deletedLessons.includes(x.id));
}

let progressTimer, progressPending = false;
async function flushProgress() {
  clearTimeout(progressTimer);
  if (!progressPending) return;
  progressPending = false;
  if (db) mergeProgress(state.progress, (await store.get("progress"))?.lessons);
  await store.set("progress", { lessons: state.progress });
}
const saveProgress = () => { progressPending = true; clearTimeout(progressTimer); progressTimer = setTimeout(flushProgress, 600); };
let statsTimer, statsPending = false;
async function flushStats() {
  clearTimeout(statsTimer);
  if (!statsPending) return;
  statsPending = false;
  if (db) mergeStats(state.stats, await store.get("stats"));
  await store.set("stats", state.stats);
}
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function bumpStat(courseKey, add) {
  if (!courseKey) return;
  const day = (state.stats.days[dayKey()] ||= {});
  const rec = (day[courseKey] ||= {});
  for (const [k, v] of Object.entries(add)) rec[k] = (rec[k] || 0) + v;
  clearTimeout(statsTimer);
  statsPending = true;
  statsTimer = setTimeout(flushStats, 1500);
}
// Count study time only while a class page is open, visible, and being used.
let lastActive = 0;
["pointerdown", "keydown", "scroll", "input"].forEach((ev) => addEventListener(ev, () => (lastActive = Date.now()), { passive: true, capture: true }));
setInterval(() => {
  if (state.view === "class" && document.visibilityState === "visible" && Date.now() - lastActive < 120000) bumpStat(state.course, { secs: 15 });
}, 15000);
let wsTimer;
const saveWorksheets = () => { clearTimeout(wsTimer); wsTimer = setTimeout(() => store.set("worksheets", { items: state.worksheets }), 500); };
const saveInbox = () => store.set("inbox", { items: state.inbox });

// Reading library for weekly notes. One doc per class; text is capped so the doc stays small.
const MAX_READINGS = 80, READING_CHARS = 14000;
function keepReading(courseKey, r, save = true) {
  if (!courseKey || !r?.text) return;
  const list = (state.readings[courseKey] ||= []);
  const module = String(r.module || "").trim() || weekOf(new Date(r.addedAt || Date.now()));
  const old = list.find((x) => x.title === r.title && x.module === module);
  const rec = { id: old?.id || r.id || "r-" + uid(), title: String(r.title || "Reading").slice(0, 140), module, kind: r.kind || "page", url: r.url || "",
    text: String(r.text).slice(0, READING_CHARS), addedAt: old?.addedAt || r.addedAt || new Date().toISOString() };
  if (old) Object.assign(old, rec); else list.push(rec);
  if (list.length > MAX_READINGS) list.splice(0, list.length - MAX_READINGS);
  if (save) saveReadings(courseKey);
}
const saveReadings = (courseKey) => store.set("readings-" + courseKey, { items: state.readings[courseKey] || [] });
const saveWeekNotes = () => store.set("weeknotes", { notes: state.weekNotes });
function weekOf(d) {
  const m = new Date(d); m.setHours(0, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return "Week of " + m.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
async function saveLessons() {
  if (db) mergeLessons(await store.get("lessons"));
  return store.set("lessons", { items: state.lessons, deleted: deletedLessons.slice(-200) });
}
// Don't lose a save that was waiting on its timer when the page is closed or hidden.
const flushAll = () => { flushProgress(); flushStats(); };
addEventListener("pagehide", flushAll);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushAll(); });
const saveChats = () => local.set("chats", Object.fromEntries(Object.entries(state.chats).map(([k, v]) => [k, v.slice(-30)])));

/* ---------- Canvas calendar (.ics) import ---------- */
function parseIcs(text) {
  const lines = text.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const events = [];
  let ev = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") ev = {};
    else if (line === "END:VEVENT") { if (ev) events.push(ev); ev = null; }
    else if (ev) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const [name, ...params] = line.slice(0, i).split(";");
      ev[name] = { value: line.slice(i + 1), params: params.join(";") };
    }
  }
  const unescape = (s = "") => s.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
  const parseDate = ({ value, params }) => {
    const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
    if (!m) return null;
    const [, y, mo, d, hh = "23", mi = "59", ss = "00", z] = m;
    if (z) return new Date(Date.UTC(+y, mo - 1, +d, +hh, +mi, +ss));
    // All-day or local times: treat as the student's own local time.
    return new Date(+y, mo - 1, +d, +hh, +mi, +ss);
  };
  return events
    .filter((e) => e.SUMMARY && e.DTSTART)
    .map((e) => {
      const summary = unescape(e.SUMMARY.value);
      const bracket = summary.match(/\[([^\]]+)\]\s*$/);
      const courseLabel = bracket ? bracket[1] : "";
      const title = bracket ? summary.slice(0, bracket.index).trim() : summary;
      const due = parseDate(e.DTSTART);
      return {
        id: (e.UID?.value || uid()).replace(/[^\w.-]/g, "_"),
        title,
        due: due?.toISOString(),
        courseLabel,
        courseKey: guessCourse(courseLabel || summary),
        url: e.URL?.value || "",
        description: unescape(e.DESCRIPTION?.value || "").trim().slice(0, 6000),
      };
    })
    .filter((e) => e.due);
}

// Canvas calendar feeds link to the calendar page; point straight at the assignment instead.
function directCanvasUrl(url = "") {
  const m = url.match(/^(https:\/\/[^/]+)\/calendar\?[^#]*include_contexts=course_(\d+)[^#]*#assignment_(\d+)/);
  return m ? `${m[1]}/courses/${m[2]}/assignments/${m[3]}` : url;
}

// Re-match classes (new classes get picked up) and spot quizzes/exams by name.
function normalizeDeadline(x) {
  x = { ...x, url: directCanvasUrl(x.url) };
  const courseKey = x.courseKey || guessCourse(x.courseLabel || "") || null;
  const kind = x.kind || (/\b(quiz|exam|test|midterm|final)\b/i.test(x.title) && !/\bparticipation\b/i.test(x.title) ? "quiz" : undefined);
  return kind ? { ...x, courseKey, kind } : { ...x, courseKey };
}

function importIcs(text) {
  const events = parseIcs(text).map(normalizeDeadline);
  if (!events.length) throw new Error("That file has no calendar events. Make sure it's the .ics file from Canvas Calendar Feed.");
  const cutoff = Date.now() - 2 * 864e5;
  const upcoming = events.filter((e) => new Date(e.due).getTime() > cutoff);
  const manual = state.deadlines.filter((d) => d.manual);
  state.deadlines = [...upcoming, ...manual].sort((a, b) => new Date(a.due) - new Date(b.due));
  saveDeadlines();
  return { total: events.length, upcoming: upcoming.length };
}

/* ---------- Claude in Chrome bridge ---------- */
// Claude in Chrome reads Canvas in the student's own logged-in browser and replies with a
// JSON "pack"; the student pastes it here. No password or token ever reaches this page.
const CHROME_PROMPT = `I'm logged into Utah Tech Canvas (https://utahtech.instructure.com). Please gather what I need to study. Only read. Don't submit, post, or change anything.

My classes: ACCT 2010 Principles of Accounting I, ISA 2050 Management Information Systems (the SQL/database part matters most), ENGL 3010 Professional Writing and Business Ethics, and BIOL 1010 General Biology.

For each class:
1. Open the course and go to Modules. Find the current module and the next one (use dates in the module names, or the first module with items I haven't completed). Also check the Announcements from the last 2 weeks for readings or links my teacher wants me to look at.
   For ENGL 3010, also include the readings from the previous module (last week) so my weekly notes are complete.
2. Open every reading, page, PDF, and outside link (websites, articles, videos with descriptions or transcripts) in those modules and announcements. For each one, write detailed study notes that keep all key concepts, rules, definitions, formulas, and worked examples. Up to about 800 words each, written so someone could learn from them without the original.
   McGraw Hill Connect: ACCT 2010's textbook lives in McGraw Hill Connect (SmartBook and the eBook), opened from links in Canvas. Open the Connect link for the current chapter in a new tab. If it loads, open the eBook (or the SmartBook reading) for the assigned chapters and write notes organized by learning objective, with worked examples. Only read the textbook. Don't answer, practice, or submit any SmartBook, homework, or quiz question, and don't start anything timed. If Connect won't open, add one reading titled "McGraw Hill Connect: couldn't open" whose notes list the assigned chapters and sections, so I know what to upload myself.
3. Open Assignments and list everything due in the next 14 days, with the full instructions.
4. If an assignment comes with a worksheet, template, or required layout (usually a PDF or Word file, like a form to fill in or a journal-entry table), describe its layout as fields I need to fill in. Keep the questions and prompts exactly as written. Do NOT fill in any answers.
5. For quizzes and exams due in the next 14 days, read ONLY the quiz's front page (the part shown BEFORE the "Take the Quiz" button): its instructions, topics or chapters covered, number of questions, time limit, and attempts. Never click "Take the Quiz", "Start", or "Resume", and never open quiz questions. Also include any study guide or practice quiz the teacher posted as a reading.

When you're finished, reply with ONLY one JSON code block in exactly this shape:
{
  "studyhub": 2,
  "courses": [
    {
      "course": "course name and code as shown in Canvas",
      "readings": [{ "module": "the module or week name exactly as Canvas shows it, like Week 5: Ethical Frameworks", "title": "title", "kind": "page" | "pdf" | "link" | "ebook", "url": "where it lives", "notes": "your detailed study notes" }],
      "assignments": [{ "title": "...", "due": "ISO 8601 date with time zone offset, like 2026-09-24T23:59:00-06:00", "instructions": "full instructions", "url": "link to it in Canvas" }],
      "worksheets": [{ "assignment": "title of the assignment it belongs to", "title": "worksheet title", "instructions": "instructions printed on it", "sections": [{ "heading": "section heading", "fields": [{ "label": "the exact question or blank", "type": "short" | "paragraph" | "number" | "journal", "rows": 4 }] }] }],
      "quizzes": [{ "title": "...", "due": "ISO 8601 with offset", "covers": "topics or chapters listed on the quiz page", "details": "instructions, number of questions, time limit, attempts", "url": "link" }]
    }
  ]
}
Use "journal" for accounting journal-entry tables (rows = number of blank lines) and leave "rows" out for other types.`;

function parsePack(text) {
  if (/"page" \| "pdf"|ISO 8601 date with time zone offset, like/.test(text)) throw new Error("That's the prompt itself, not Claude's answer. Paste the prompt into the Claude extension in Chrome (with Canvas open), wait for Claude to finish, then copy Claude's reply and paste that here.");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("I couldn't find the Study Hub data in that. Paste Claude's whole reply, including the { } block.");
  let pack;
  try { pack = JSON.parse(text.slice(start, end + 1)); } catch { throw new Error("That reply got cut off or isn't complete. Ask Claude in Chrome: “Please send the full JSON again.”"); }
  if (!Array.isArray(pack.courses)) throw new Error("That doesn't look like a Study Hub reply. Use the prompt from the Copy button.");
  return pack;
}

function importPack(text) {
  const pack = parsePack(text);
  let readings = 0, assignments = 0, worksheets = 0, quizzes = 0;
  const skipped = [], readingCourses = new Set();
  for (const c of pack.courses) {
    const courseKey = guessCourse(String(c.course || ""));
    if (!courseKey) { skipped.push(c.course); continue; }
    for (const r of c.readings || []) {
      if (!r?.notes || String(r.notes).length < 40) continue;
      const title = String(r.title || "Reading").slice(0, 140);
      state.inbox = state.inbox.filter((x) => !(x.courseKey === courseKey && x.title === title));
      state.inbox.push({ id: "r-" + uid(), courseKey, title, module: String(r.module || ""), kind: String(r.kind || "page"), url: String(r.url || ""),
        text: String(r.notes).slice(0, 30000), addedAt: new Date().toISOString() });
      keepReading(courseKey, state.inbox.at(-1), false);
      readingCourses.add(courseKey);
      readings++;
    }
    for (const w of c.worksheets || []) {
      const sections = (w.sections || []).map((sec) => ({
        heading: String(sec.heading || ""),
        fields: (sec.fields || []).filter((f) => f?.label).map((f) => ({
          id: "f-" + uid(), label: String(f.label), type: ["short", "paragraph", "number", "journal"].includes(f.type) ? f.type : "short",
          rows: Math.min(Math.max(Number(f.rows) || 4, 1), 20),
        })),
      })).filter((sec) => sec.fields.length);
      if (!sections.length) continue;
      const title = String(w.title || w.assignment || "Worksheet").slice(0, 160);
      const old = state.worksheets.find((x) => x.courseKey === courseKey && x.title === title);
      if (old) { old.sections = sections; old.instructions = String(w.instructions || ""); continue; } // keep answers already typed
      state.worksheets.push({ id: "w-" + uid(), courseKey, title, assignment: String(w.assignment || ""), instructions: String(w.instructions || ""), sections, answers: {} });
      worksheets++;
    }
    for (const q of c.quizzes || []) {
      const due = new Date(q?.due);
      if (!q?.title || isNaN(due)) continue;
      const title = String(q.title).slice(0, 200);
      const existing = state.deadlines.find((d) => d.courseKey === courseKey && d.title.toLowerCase() === title.toLowerCase());
      const rec = { id: existing?.id || "q-" + uid(), kind: "quiz", title, due: due.toISOString(), courseKey, courseLabel: String(c.course || ""),
        url: String(q.url || ""), covers: String(q.covers || ""), description: String(q.details || "") };
      if (existing) Object.assign(existing, rec); else state.deadlines.push(rec);
      quizzes++;
    }
    for (const a of c.assignments || []) {
      const due = new Date(a?.due);
      if (!a?.title || isNaN(due)) continue;
      const title = String(a.title).slice(0, 200);
      const existing = state.deadlines.find((d) => d.courseKey === courseKey && d.title.toLowerCase() === title.toLowerCase());
      const rec = { id: existing?.id || "c-" + uid(), title, due: due.toISOString(), courseKey, courseLabel: String(c.course || ""),
        url: String(a.url || existing?.url || ""), description: String(a.instructions || existing?.description || "").slice(0, 6000) };
      if (existing) Object.assign(existing, rec); else state.deadlines.push(rec);
      assignments++;
    }
  }
  state.deadlines.sort((x, y) => new Date(x.due) - new Date(y.due));
  saveDeadlines();
  saveInbox();
  readingCourses.forEach(saveReadings);
  saveWorksheets();
  return { readings, assignments, worksheets, quizzes, skipped };
}

function chromePanel() {
  const status = h("div");
  const box = h("textarea", { id: "pack", rows: 4, placeholder: "Paste Claude in Chrome's reply here…" });
  const copy = h("button", { class: "btn small", onclick: async () => {
    try { await navigator.clipboard.writeText(CHROME_PROMPT); copy.textContent = "Copied ✓"; }
    catch { promptBox.hidden = false; promptBox.select(); copy.textContent = "Select the text below and copy it"; }
  } }, "Copy the Canvas prompt");
  const promptBox = h("textarea", { id: "chrome-prompt", rows: 6, readonly: true, hidden: true }, CHROME_PROMPT);
  return h("section", { class: "panel", "aria-labelledby": "chrome-h" },
    h("div", { class: "panel-head" }, h("h2", { id: "chrome-h" }, "Pull from Canvas with Claude in Chrome"), h("span", { class: "chip done" }, "Recommended")),
    h("ol", { class: "steps" },
      h("li", {}, "Click ", h("b", {}, "Copy the Canvas prompt"), "."),
      h("li", {}, "In Chrome, open ", h("a", { href: "https://utahtech.instructure.com", target: "_blank", rel: "noopener" }, "Canvas"), " (logged in), open the Claude extension, paste the prompt, and send it. Claude reads your modules, readings and assignments. Approve if it asks."),
      h("li", {}, "When it finishes, copy its whole reply and paste it here. Do this once a week.")),
    h("div", { class: "row" }, copy), promptBox,
    h("label", { for: "pack" }, "Claude in Chrome's reply", box),
    h("div", { class: "row" }, h("button", { class: "btn", onclick: () => {
      try {
        const r = importPack(box.value);
        status.replaceChildren(h("p", { class: "note good" },
          `Brought in ${[[r.readings, "reading"], [r.assignments, "assignment"], [r.worksheets, "worksheet"], [r.quizzes, "quiz"]]
            .filter(([n]) => n).map(([n, w]) => `${n} ${w}${n === 1 ? "" : w === "quiz" ? "zes" : "s"}`).join(", ") || "nothing new"}.`,
          r.skipped.length ? ` Skipped classes I don't track: ${r.skipped.join(", ")}.` : "",
          r.readings ? " Open a class to turn the readings into lessons." : ""));
        box.value = "";
        setTimeout(render, 1400);
      } catch (e) { status.replaceChildren(h("p", { class: "note bad" }, e.message)); }
    } }, "Import")), status);
}

/* ---------- in-browser SQLite for SQL practice ---------- */
let sqlDb;
async function getSqlDb() {
  if (!sqlDb) {
    const SQL = await initSqlJs();
    sqlDb = new SQL.Database();
    sqlDb.run(PRACTICE.schema);
    sqlDb.run(PRACTICE.data);
  }
  return sqlDb;
}
async function runQuery(sql) {
  let target = await getSqlDb();
  if (!/^\s*(select|with|pragma)\b/i.test(sql)) {
    // Keep practice data intact: run changes on a throwaway copy.
    const SQL = await initSqlJs();
    target = new SQL.Database(target.export());
  }
  const res = target.exec(sql);
  const last = res.at(-1) || { columns: [], values: [] };
  return { columns: last.columns, rows: last.values };
}
const norm = (v) => (typeof v === "number" ? String(Math.round(v * 100) / 100) : v === null ? "NULL" : String(v));
function sameResult(a, b, ordered) {
  if (a.columns.length !== b.columns.length || a.rows.length !== b.rows.length) return false;
  const ra = a.rows.map((r) => r.map(norm).join("\u0000"));
  const rb = b.rows.map((r) => r.map(norm).join("\u0000"));
  if (!ordered) { ra.sort(); rb.sort(); }
  return ra.every((r, i) => r === rb[i]);
}

/* ---------- lesson rendering ---------- */
function feedback(ok, why, askText, miss) {
  return h("div", { class: `fb ${ok ? "good" : "bad"}` },
    h("b", {}, ok ? "✓ Correct. " : "✗ Not quite. "), why || "",
    !ok && askText ? h("button", { class: "linkish", onclick: () => tutor.ask(askText) }, "Ask the tutor why") : null,
    !ok && miss && sample ? h("button", { class: "linkish", onclick: () => practice.make([miss]) }, "Practice this") : null,
    !ok && miss && sample ? h("button", { class: "linkish", onclick: () => {
      const lesson = currentLesson();
      openVideo({ key: `miss:${state.course}:${state.lessonId}:${miss.concept.slice(0, 80)}`, courseKey: state.course, topic: miss.concept.slice(0, 90), lessonTitle: lesson?.title,
        focus: `She just got this wrong: ${miss.concept}. ${miss.detail || ""} Walk her through how to figure out the right answer herself, step by step, and why her answer doesn't work.`,
        material: lesson ? lessonMaterial(lesson) : miss.concept });
    } }, "🎬 Show me in a video") : null);
}
const note = (t) => state.activity.push(t);

/* ---------- difficulty that grows as you master things ---------- */
// How she's doing lately in a class, from first-try accuracy over the last two weeks.
function courseLevel(key) {
  const a = statsFor(startOfDay(-13), new Date(Date.now() + 1), key);
  const pct = a.first ? a.firstRight / a.first : null;
  const level = a.first >= 8 && pct >= 0.85 ? "mastering" : a.first >= 8 && pct < 0.6 ? "building" : "steady";
  return { level, pct, n: a.first };
}
function difficultyNote(key, round) {
  const { level, pct, n } = courseLevel(key);
  const lines = [];
  if (pct != null && n >= 4) lines.push(`Lately she gets ${Math.round(pct * 100)}% right on the first try in this class (${n} questions).`);
  if (round && round.total) lines.push(`On the last practice round she got ${round.right} of ${round.total} right on the first try.`);
  const roundPct = round?.total ? round.right / round.total : null;
  if (level === "mastering" || (roundPct != null && roundPct >= 0.8))
    lines.push("She's mastering this, so make this round clearly HARDER than the last: multi-step problems, compound transactions or queries, closer distractors, less familiar situations, and questions that ask why, not just what. Hints should be lighter.");
  else if (level === "building" || (roundPct != null && roundPct < 0.5))
    lines.push("She's still building this: keep it approachable, one step at a time, with clear hints, then build up.");
  else lines.push("Pitch it a notch above her last round so she keeps growing.");
  return lines.join(" ");
}

/* ---------- progress: lesson completion and what you missed ---------- */
// state.progress[lessonKey] = { courseKey, title, total, solved, firstTryRight, done, completedAt, missed: [{concept, detail}], practice }
let track = null;
const lessonKey = () => `${state.course}:${state.lessonId}`;
function newTracker(lesson) {
  const key = lessonKey();
  const saved = (state.progress[key] ||= { courseKey: state.course, title: lesson.title, missed: [] });
  saved.courseKey ||= state.course;
  if (!Array.isArray(saved.missed)) saved.missed = [];
  saved.title = lesson.title;
  if (!saved.answers || typeof saved.answers !== "object") saved.answers = {};
  if (!saved.firstTry || typeof saved.firstTry !== "object") saved.firstTry = {};
  const t = {
    key, saved, count: 0, solved: new Set(), first: new Map(), lastOk: new Map(), listeners: [], els: new Map(),
    add() { return "i" + this.count++; },
    at(id, el) { this.els.set(id, el); return el; },
    answer(k) { return saved.answers[k]; },
    // Save what she picked or typed so leaving and coming back keeps her place.
    record(k, v) { saved.answers[k] = v; saved.updatedAt = new Date().toISOString(); saveProgress(); },
    attempt(id, ok, miss, restore = false) {
      if (restore) {
        // Replaying saved work: show it, but don't count it again.
        if (!this.first.has(id)) this.first.set(id, saved.firstTry[id] ?? ok);
        this.lastOk.set(id, ok);
        if (ok) this.solved.add(id);
        this.listeners.forEach((f) => f());
        return;
      }
      saved.updatedAt = new Date().toISOString();
      const isFirst = !this.first.has(id);
      bumpStat(state.course, { q: 1, right: ok ? 1 : 0, first: isFirst ? 1 : 0, firstRight: isFirst && ok ? 1 : 0 });
      if (isFirst) { this.first.set(id, ok); if (saved.firstTry[id] == null) saved.firstTry[id] = ok; }
      if (!ok && miss && !saved.missed.some((m) => m.concept === miss.concept)) {
        saved.missed = [...saved.missed, miss].slice(-20);
      }
      // Party every time she goes from not-right to right (first try, or fixing a mistake).
      if (ok && this.lastOk.get(id) !== true) { const n = bumpStreak(true); celebrate(n > 0 && n % 5 === 0 ? "chipmunk" : null, n); }
      else if (!ok) { bumpStreak(false); grumble(); }
      this.lastOk.set(id, ok);
      if (ok) this.solved.add(id);
      saved.total = this.count;
      saved.solved = Math.max(saved.solved || 0, this.solved.size);
      saved.firstTryRight = [...this.first.values()].filter(Boolean).length;
      if (!saved.done && this.count && this.solved.size >= this.count) this.complete(true);
      saveProgress();
      this.listeners.forEach((f) => f());
    },
    complete(auto) {
      if (!saved.done) bumpStat(state.course, { done: 1 });
      if (state.course === "explore" && state.explore.topic) setTimeout(() => updateKnowledge(state.explore.topic, { quiet: true }), 500);
      saved.done = true;
      saved.updatedAt = new Date().toISOString();
      saved.completedAt = new Date().toISOString();
      const key = state.course;
      if (key !== "explore" && !state.lessons.some((l) => l.id === lesson.id && !l.path)) setTimeout(() => { if (pathCaughtUp(key)) buildNextLesson(key, { quiet: true }); }, 800);
      note(`Finished the lesson${auto ? " (every question answered correctly)" : ""}.`);
      saveProgress();
      this.listeners.forEach((f) => f());
      // Update the page in place so answers already on screen stay put.
      document.querySelector(".side [aria-current='true']")?.classList.add("is-done");
      const title = document.querySelector(".lesson h1");
      if (title && !title.parentElement.querySelector(".chip.done")) title.after(h("span", { class: "chip done" }, "✓ Completed"));
    },
  };
  return t;
}

const RENDER = {
  objectives: (b) => h("section", { class: "block objectives" }, h("span", { class: "eyebrow" }, "What you need to know"), h("p", {}, b.text)),
  text: (b) => h("section", { class: "block prose", html: b.html }),
  keyPoints: (b) => h("section", { class: "block" }, h("h2", {}, "Key points"), h("ul", { class: "points" }, b.items.map((p) => h("li", {}, p)))),
  definitions: (b) => h("section", { class: "block" }, h("h2", {}, "Definitions"),
    h("ul", { class: "defs" }, b.items.map(([t, d]) => h("li", {}, h("b", {}, t), ": ", d, " ",
      h("button", { class: "term-video", title: `${TEACHER} explains “${t}”`, "aria-label": `Watch ${TEACHER} explain ${t}`, onclick: () => {
        const lesson = currentLesson();
        openVideo({ key: `term:${state.course}:${state.lessonId}:${t.toLowerCase()}`, courseKey: state.course, topic: t, term: { term: t, definition: d }, lessonTitle: lesson?.title, material: lesson ? lessonMaterial(lesson) : d });
      } }, "🎬 explain"))))),

  classify(b) {
    let right = 0;
    const score = h("span", {}, `0 / ${b.items.length}`);
    return h("section", { class: "block" },
      h("div", { class: "panel-head" }, h("h2", {}, b.title || "Sort it"), h("span", { class: "muted" }, "Score: ", score)),
      b.items.map((item) => {
        const slot = h("div", { class: "fbslot" });
        const id = track.add();
        let counted = false;
        const choose = (cat, restore) => {
          const ok = cat === item.answer;
          btns.forEach((x) => x.classList.toggle("right", ok && x.textContent === cat));
          btns.forEach((x) => x.classList.toggle("wrong", !ok && x.textContent === cat));
          const miss = { concept: `"${item.label}" is ${item.answer}`, detail: `I sorted "${item.label}" as ${cat}.` };
          slot.replaceChildren(feedback(ok, ok ? item.why : "Try another.", `I thought "${item.label}" was ${cat}. Why is that wrong?`, miss));
          if (!restore) { note(`Sorted "${item.label}" as ${cat} (${ok ? "right" : "wrong"}).`); track.record(id, cat); }
          track.attempt(id, ok, miss, restore);
          if (ok && !counted) { counted = true; score.textContent = `${++right} / ${b.items.length}`; }
        };
        const btns = b.categories.map((cat) => h("button", { class: "choice", onclick: () => choose(cat, false) }, cat));
        const row = track.at(id, h("div", { class: "sort-row" }, h("b", {}, item.label), h("div", { class: "choices" }, btns), slot));
        if (track.answer(id) != null) choose(track.answer(id), true);
        return row;
      }));
  },

  debitCredit(b) {
    const body = h("tbody");
    for (const row of b.rows) {
      const picks = new Map();
      const status = h("td", { colspan: 4, class: "balance" });
      body.append(h("tr", { class: "txn" }, h("td", { colspan: 4 }, row.transaction)));
      for (const entry of row.entries) {
        const dr = h("td", { class: "amt dr" });
        const cr = h("td", { class: "amt" });
        const why = h("div");
        const id = track.add();
        const pick = (side, restore) => {
          const ok = side === entry.side;
          picks.set(entry, side);
          btns.forEach((x) => x.classList.remove("right", "wrong"));
          btns[side === "debit" ? 0 : 1].classList.add(ok ? "right" : "wrong");
          dr.replaceChildren(); cr.replaceChildren();
          dr.className = "amt dr"; cr.className = "amt";
          const cell = side === "debit" ? dr : cr;
          cell.append(money(entry.amount) || side);
          cell.classList.add(ok ? "good-cell" : "bad-cell");
          const miss = { concept: `${entry.account} is a ${entry.side} in "${row.transaction}"`, detail: `I put ${entry.account} as a ${side}.` };
          why.replaceChildren(feedback(ok, ok ? entry.why : `${entry.account} doesn't go on the ${side} side here.`,
            `For "${row.transaction}", I put ${entry.account} as a ${side}. Why is that wrong?`, miss));
          if (!restore) { note(`"${row.transaction}": ${entry.account} as ${side} (${ok ? "right" : "wrong"}).`); track.record(id, side); }
          track.attempt(id, ok, miss, restore);
          if (picks.size === row.entries.length) {
            const all = row.entries.every((e) => picks.get(e) === e.side);
            const sum = (s) => row.entries.filter((e) => e.side === s).reduce((t, e) => t + (e.amount || 0), 0);
            status.replaceChildren(all
              ? h("span", { style: "color: var(--good)" }, `✓ Balanced: debits ${money(sum("debit"))} = credits ${money(sum("credit"))}`)
              : h("span", { style: "color: var(--bad)" }, "Some sides are off. Fix the red ones."));
          }
        };
        const btns = ["debit", "credit"].map((side) => h("button", { class: "choice", "aria-label": `${entry.account}: ${side}`, onclick: () => pick(side, false) }, side === "debit" ? "Dr" : "Cr"));
        body.append(track.at(id, h("tr", {}, h("td", { class: "acct" }, entry.account, why), h("td", { class: "pick" }, btns), dr, cr)));
        if (track.answer(id)) pick(track.answer(id), true);
      }
      body.append(h("tr", {}, status));
    }
    return h("section", { class: "block" }, h("h2", {}, b.title || "Debit or credit?"),
      h("p", { class: "muted", style: "margin:0" }, "Pick Dr (debit, left) or Cr (credit, right) for each account. The amount moves into that column."),
      h("div", { class: "scroll" }, h("table", { class: "journal" },
        h("thead", {}, h("tr", {}, h("th", {}, "Account"), h("th", {}, "Your pick"), h("th", {}, "Debit"), h("th", {}, "Credit"))), body)));
  },

  // Build the whole entry: pick accounts from a dropdown and type amounts on the debit or credit side.
  journalBuilder(b) {
    const chart = [...new Set([...(b.accounts || []), ...b.rows.flatMap((r) => r.entries.map((e) => e.account)), ...DEFAULT_CHART])].sort();
    return h("section", { class: "block" }, h("h2", {}, b.title || "Build the journal entries"),
      h("p", { class: "muted", style: "margin:0" }, "Choose each account, then type its amount under Debit or Credit. Press Check entry when you're done with a transaction."),
      b.rows.map((row, n) => {
        const id = track.add();
        const key = "jb:" + row.transaction.slice(0, 120);
        const lines = row.entries.map(() => {
          const acct = h("select", { "aria-label": "Account" }, h("option", { value: "" }, "Choose account…"), chart.map((a) => h("option", { value: a }, a)));
          const dr = h("input", { inputmode: "decimal", class: "mono", placeholder: "Debit", "aria-label": "Debit amount" });
          const cr = h("input", { inputmode: "decimal", class: "mono", placeholder: "Credit", "aria-label": "Credit amount" });
          const mark = h("td", { class: "jb-mark" });
          return { acct, dr, cr, mark, tr: h("tr", {}, h("td", {}, acct), h("td", {}, dr), h("td", {}, cr), mark) };
        });
        const fb = h("div");
        const save = () => track.record(key, lines.map((l) => ({ a: l.acct.value, d: l.dr.value, c: l.cr.value })));
        lines.forEach((l) => [l.acct, l.dr, l.cr].forEach((el) => el.addEventListener("change", save)));
        const check = (restore) => {
          const want = row.entries.map((e) => ({ ...e, used: false }));
          let allOk = true;
          const got = lines.map((l) => {
            const d = num(l.dr.value), c = num(l.cr.value);
            const side = d && !c ? "debit" : c && !d ? "credit" : null;
            return { l, account: l.acct.value, side, amount: side === "debit" ? d : c };
          });
          for (const g of got) {
            const exact = want.find((w) => !w.used && w.account === g.account && w.side === g.side && w.amount === g.amount);
            let msg, ok = false;
            if (exact) { exact.used = true; ok = true; msg = "✓"; }
            else if (!g.account) msg = "Pick an account";
            else if (!g.side) msg = "Put the amount in one column";
            else {
              const sameAcct = want.find((w) => !w.used && w.account === g.account);
              if (!sameAcct) msg = `${g.account} isn't part of this entry`;
              else if (sameAcct.side !== g.side) msg = `${g.account} goes on the other side`;
              else msg = "Check the amount";
            }
            if (!ok) allOk = false;
            g.l.mark.replaceChildren(h("span", { class: ok ? "good" : "bad" }, msg));
            g.l.tr.classList.toggle("good-cell", ok);
            g.l.tr.classList.toggle("bad-cell", !ok);
          }
          if (want.some((w) => !w.used)) allOk = false;
          const drT = got.filter((g) => g.side === "debit").reduce((t, g) => t + (g.amount || 0), 0);
          const crT = got.filter((g) => g.side === "credit").reduce((t, g) => t + (g.amount || 0), 0);
          const correct = row.entries.map((e) => `${e.side === "debit" ? "Dr" : "Cr"} ${e.account} ${money(e.amount)}`).join("; ");
          const miss = { concept: `Journal entry: ${row.transaction}`, detail: `I entered: ${got.map((g) => `${g.side === "debit" ? "Dr" : g.side === "credit" ? "Cr" : "?"} ${g.account || "?"} ${g.amount ? money(g.amount) : ""}`).join("; ")}.` };
          fb.replaceChildren(allOk
            ? feedback(true, `Balanced: debits ${money(drT)} = credits ${money(crT)}.`)
            : feedback(false, drT !== crT ? `Your debits (${money(drT)}) and credits (${money(crT)}) don't balance yet.` : "Some lines are off. Fix the red ones and check again.",
              `For "${row.transaction}" I entered: ${miss.detail} What am I getting wrong? Don't just give me the answer.`, miss),
            !allOk ? h("button", { class: "linkish", onclick: (e) => { e.currentTarget.replaceWith(h("span", { class: "muted", style: "font-size:.88rem" }, "Answer: " + correct)); } }, "Show the answer") : null);
          if (!restore) { save(); note(`Built entry for "${row.transaction}" (${allOk ? "right" : "wrong"}).`); }
          track.attempt(id, allOk, miss, restore);
        };
        const saved = track.answer(key);
        if (Array.isArray(saved)) {
          saved.forEach((v, i) => { if (!lines[i]) return; lines[i].acct.value = v.a || ""; lines[i].dr.value = v.d || ""; lines[i].cr.value = v.c || ""; });
          if (saved.some((v) => v.a && (v.d || v.c))) queueMicrotask(() => check(true));
        }
        return track.at(id, h("div", { class: "jb" },
          h("p", { style: "margin:0" }, h("b", {}, `${n + 1}. `), row.transaction),
          h("div", { class: "scroll" }, h("table", { class: "jb-table" }, h("thead", {}, h("tr", {}, h("th", {}, "Account"), h("th", {}, "Debit"), h("th", {}, "Credit"), h("th", {}, ""))), h("tbody", {}, lines.map((l) => l.tr)))),
          h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => check(false) }, "Check entry")), fb));
      }));
  },

  quiz: (b) => h("section", { class: "block" }, h("h2", {}, b.title || "Check yourself"), b.intro ? h("p", { style: "margin:0" }, b.intro) : null, b.items.map((q) => {
    const slot = h("div");
    const id = track.add();
    const hint = q.hint ? h("p", { class: "note", hidden: true }, "💡 ", q.hint) : null;
    const opts = q.options.map((opt, i) => h("button", { class: "choice", onclick: () => choose(i, false) }, opt));
    const prev = track.answer(id);
    if (Array.isArray(prev)) queueMicrotask(() => prev.forEach((i) => choose(i, true)));
    return track.at(id, h("div", { class: "quiz" }, h("b", {}, q.question),
      hint ? h("div", {}, h("button", { class: "linkish", onclick: (e) => { hint.hidden = false; e.currentTarget.remove(); } }, "Show a hint"), hint) : null,
      h("div", { class: "options" }, opts), slot));
    function choose(i, restore) {
      const ok = i === q.answerIndex, opt = q.options[i];
      opts[i]?.classList.add(ok ? "right" : "wrong");
      const miss = { concept: q.question, detail: `I picked "${opt}" instead of "${q.options[q.answerIndex]}".` };
      slot.replaceChildren(feedback(ok, ok ? q.explanation : "Try another option.", `Quiz: "${q.question}" I picked "${opt}". Why is that wrong?`, miss));
      if (!restore) { note(`Quiz "${q.question}": picked "${opt}" (${ok ? "right" : "wrong"}).`); track.record(id, [...(track.answer(id) || []), i]); }
      track.attempt(id, ok, miss, restore);
    }
  })),

  practice: (b) => h("section", { class: "block" }, h("h2", {}, "Explain it back"), b.prompts.map((p, i) => {
    const key = "practice:" + p.slice(0, 80);
    const box = h("textarea", { rows: 4, id: `practice-${i}`, placeholder: "Answer in your own words…" }, track.answer(key) || "");
    box.addEventListener("input", () => track.record(key, box.value));
    return h("div", { class: "quiz" }, h("label", { for: `practice-${i}` }, p), box,
      h("div", {}, h("button", { class: "btn small", onclick: () => box.value.trim() &&
        tutor.ask(`Practice question: "${p}"\n\nMy answer: ${box.value.trim()}\n\nIs this right? What am I missing?`) }, "Check with the tutor")));
  })),

  schema() {
    const el = h("div", { class: "schema" }, "Loading practice database…");
    getSqlDb().then((d) => {
      const tables = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0].values.map((r) => r[0]);
      el.replaceChildren(...tables.map((t) => {
        const cols = d.exec(`PRAGMA table_info(${t})`)[0].values;
        const fks = d.exec(`PRAGMA foreign_key_list(${t})`)[0]?.values || [];
        return h("div", {}, h("b", {}, t), h("ul", {}, cols.map((c) => {
          const fk = fks.find((f) => f[3] === c[1]);
          return h("li", {}, c[1], c[5] ? " 🔑" : "", fk ? ` → ${fk[2]}` : "");
        })));
      }));
    });
    return h("section", { class: "block" }, h("h2", {}, "Practice database"), el,
      h("details", { class: "steps-toggle" }, h("summary", {}, "Open the data sheets (see every row)"), dataSheets()));
  },

  sql: (b) => h("section", { class: "block" }, h("h2", {}, b.title || "Write the query"), b.intro ? h("p", { style: "margin:0" }, b.intro) : null, b.tasks.map((task, n) => {
    const id = `sql-${uid()}`;
    const editor = h("textarea", { class: "code", id, rows: 3, spellcheck: "false", placeholder: "SELECT …" });
    const out = h("div", { class: "sql-out" });
    const tid = track.add();
    const hint = task.hint ? h("p", { class: "note", hidden: true }, "💡 ", task.hint) : null;
    let tries = 0;
    const reveal = h("button", { class: "linkish", hidden: true, onclick: () => { editor.value = task.solution; out.replaceChildren(stepsPanel(task.solution, "How the answer works, one step at a time")); } }, "Show an answer and how it works");
    const saved = track.answer(tid);
    if (saved?.q) { editor.value = saved.q; tries = saved.tries || 0; }
    editor.addEventListener("input", () => track.record(tid, { q: editor.value, tries }));
    const run = async (restore = false) => {
      const q = editor.value.trim();
      if (!q) return;
      if (!restore) { tries++; track.record(tid, { q: editor.value, tries, ran: true }); }
      let want;
      try { want = await runQuery(task.solution); } catch { want = { columns: [], rows: [] }; }
      try {
        const mine = await runQuery(q);
        const ok = sameResult(mine, want, task.ordered);
        const diff = diffRows(mine, want);
        const why = ok ? [] : diagnoseSql(q, mine, want, task, diff);
        const miss = { concept: task.prompt, detail: `My query was: ${q}` };
        out.replaceChildren(
          h("div", { class: "fb " + (ok ? "good" : "bad") }, h("b", {}, ok ? "✓ Correct. Your result matches." : "✗ Not quite."),
            why.length ? h("ul", { class: "why-list" }, why.map((w) => h("li", {}, w))) : null,
            !ok ? h("div", { class: "row" },
              h("button", { class: "linkish", onclick: () => tutor.ask(`Task: "${task.prompt}"\nMy query:\n${q}\nMy result had ${mine.rows.length} row(s) with columns ${mine.columns.join(", ") || "(none)"}; the answer needs ${want.rows.length} row(s) with ${want.columns.length} column(s).\nWhat the app spotted: ${why.join(" ")}\nWalk me through what's wrong without just giving me the query.`) }, "Ask the tutor why"),
              sample ? h("button", { class: "linkish", onclick: () => practice.make([miss]) }, "Practice this") : null) : null),
          h("div", { class: "result-pair" },
            h("div", {}, h("span", { class: "tile-label" }, `Your result (${mine.rows.length} row${mine.rows.length === 1 ? "" : "s"})`), resultTable(mine, ok ? null : diff.extra)),
            !ok ? h("details", { class: "target", open: tries > 1 },
              h("summary", {}, `The result you're aiming for (${want.rows.length} row${want.rows.length === 1 ? "" : "s"})`),
              resultTable(want, diff.missing)) : null),
          h("details", { class: "steps-toggle" }, h("summary", {}, ok ? "See how your query works, step by step" : "See what your query does, step by step"), stepsPanel(q)));
        if (!restore) note(`SQL "${task.prompt}": \`${q}\` (${ok ? "right" : "wrong"}).`);
        track.attempt(tid, ok, miss, restore);
      } catch (e) {
        const tip = sqlErrorTip(e.message);
        out.replaceChildren(h("div", { class: "fb bad" }, h("b", {}, "SQL error: "), e.message, tip ? h("p", { style: "margin:.35rem 0 0" }, "💡 ", tip) : null,
          h("button", { class: "linkish", onclick: () => tutor.ask(`Task: "${task.prompt}"\nMy query:\n${q}\nError: ${e.message}\nWhat does this mean and how do I fix it?`) }, "Ask the tutor")));
        if (!restore) note(`SQL "${task.prompt}": error ${e.message}`);
        track.attempt(tid, false, { concept: task.prompt, detail: `My query ${q} failed: ${e.message}` }, restore);
      }
      if (tries >= 2) reveal.hidden = false;
    };
    editor.addEventListener("keydown", (e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && run());
    if (saved?.ran) queueMicrotask(() => run(true));
    if (tries >= 2) reveal.hidden = false;
    return track.at(tid, h("div", { class: "sql-task" }, h("label", { for: id }, `${n + 1}. ${task.prompt}`),
      hint ? h("div", {}, h("button", { class: "linkish", onclick: (e) => { hint.hidden = false; e.currentTarget.remove(); } }, "Show a hint"), hint) : null, editor,
      h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => run() }, "Run ▸"), h("span", { class: "muted" }, "Ctrl/⌘ + Enter"), reveal), out));
  })),

  statements: (b) => statementBuilder(b),
  formulas: (b) => formulaSheet(b.course),
};

/* ---------- SQL: explain mistakes, show steps, show data ---------- */
const rowKey = (r) => r.map(norm).join("\u0000");
function diffRows(mine, want) {
  const wantKeys = want.rows.map(rowKey), mineKeys = mine.rows.map(rowKey);
  const pool = [...wantKeys];
  const extra = new Set();
  mineKeys.forEach((k, i) => { const j = pool.indexOf(k); if (j >= 0) pool.splice(j, 1); else extra.add(i); });
  const pool2 = [...mineKeys];
  const missing = new Set();
  wantKeys.forEach((k, i) => { const j = pool2.indexOf(k); if (j >= 0) pool2.splice(j, 1); else missing.add(i); });
  return { extra, missing };
}

function diagnoseSql(q, mine, want, task, diff) {
  const sol = task.solution;
  const has = (re, t) => re.test(t);
  const out = [];
  if (has(/[=!<>]\s*null\b/i, q)) out.push("To check for missing values use IS NULL (or IS NOT NULL). Nothing ever equals NULL, so = NULL finds no rows.");
  if (has(/"[^"]*"/, q)) out.push("Put text values in single quotes: 'UT', not \"UT\".");
  if (mine.columns.length !== want.columns.length) {
    out.push(`Your result has ${mine.columns.length} column${mine.columns.length === 1 ? "" : "s"}; the question needs ${want.columns.length}. Re-read what it asks you to show and fix your SELECT list.`);
    if (has(/\bselect\s+\*/i, q) && !has(/\bselect\s+\*/i, sol)) out.push("SELECT * shows every column. List only the columns the question asks for.");
  }
  if (has(/\bgroup\s+by\b/i, sol) && !has(/\bgroup\s+by\b/i, q)) out.push("The question wants a number for each group (\"for each\", \"per\", \"by\"). That's GROUP BY on the column you're grouping by.");
  if (has(/\bhaving\b/i, sol) && !has(/\bhaving\b/i, q)) out.push("You need to filter the groups after counting them. Conditions on COUNT/SUM/AVG go in HAVING, after GROUP BY.");
  if (has(/\bleft\s+join\b/i, sol) && !has(/\bleft\s+join\b/i, q)) out.push("A plain JOIN drops rows that have no match. To keep every row from the first table (or find the ones with no match), use LEFT JOIN.");
  else if (has(/\bjoin\b/i, sol) && !has(/\bjoin\b/i, q)) out.push("The information you need lives in more than one table. JOIN them on their shared key column.");
  if (has(/\bwhere\b/i, sol) && !has(/\bwhere\b/i, q)) out.push("The question only wants some rows. Add a WHERE filter.");
  if (task.ordered && has(/\border\s+by\b/i, sol) && !has(/\border\s+by\b/i, q)) out.push("The order matters here. Add ORDER BY (ASC is smallest first, DESC is biggest first).");
  if (mine.columns.length === want.columns.length) {
    if (mine.rows.length > want.rows.length) out.push(`You have ${mine.rows.length - want.rows.length} extra row(s), highlighted in red. Your filter lets too much through: check the condition, AND vs OR, and the comparison (< vs <=).`);
    else if (mine.rows.length < want.rows.length) out.push(`You're missing ${want.rows.length - mine.rows.length} row(s), highlighted in the result you're aiming for. Your filter is too strict: check spelling and capitalization of text values, AND vs OR, and < vs <=.`);
    else if (diff.extra.size) out.push("Right number of rows, but some values are different (highlighted). Check which column you picked, any math, and which rows your filter keeps.");
    else if (!out.length) out.push("Right rows, wrong order. Check your ORDER BY column and ASC vs DESC.");
  }
  return out;
}

function sqlErrorTip(msg) {
  if (/no such column: (\S+)/i.test(msg)) return `"${msg.match(/no such column: (\S+)/i)[1]}" isn't a column there. Check the exact names in the data sheets. If the column is in another table, you need to JOIN that table.`;
  if (/no such table/i.test(msg)) return "The tables are named customers, products, orders, and order_items.";
  if (/ambiguous column/i.test(msg)) return "Both tables have a column with that name. Put the table alias in front, like o.customer_id.";
  if (/misuse of aggregate/i.test(msg)) return "COUNT, SUM, and AVG can't go in WHERE. Use GROUP BY … HAVING instead.";
  if (/incomplete input/i.test(msg)) return "The query ends too early. Check for a missing closing quote, parenthesis, or clause.";
  if (/syntax error/i.test(msg)) return "Check the clause order (SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY), commas between column names but not before FROM, and single quotes around text.";
  return "";
}

// Splits a simple SELECT into its top-level clauses so each step can be run and shown.
function sqlClauses(sql) {
  const q = sql.trim().replace(/;\s*$/, "");
  if (!/^select\b/i.test(q)) return null;
  const words = ["from", "where", "group by", "having", "order by", "limit"];
  const at = {};
  let depth = 0, quote = null;
  for (let i = 0; i < q.length; i++) {
    const c = q[i];
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"') { quote = c; continue; }
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && /\s/.test(q[i - 1] || " ")) {
      for (const w of words) {
        if (at[w] == null && q.slice(i, i + w.length).toLowerCase() === w && !/\w/.test(q[i + w.length] || "")) {
          at[w] = i;
        }
      }
    }
  }
  if (at.from == null) return null;
  const order = words.filter((w) => at[w] != null).sort((a, b) => at[a] - at[b]);
  const part = (w) => { if (at[w] == null) return ""; const next = order[order.indexOf(w) + 1]; return q.slice(at[w] + w.length, next ? at[next] : q.length).trim(); };
  return { select: q.slice(6, at.from).trim(), from: part("from"), where: part("where"), group: part("group by"), having: part("having"), order: part("order by"), limit: part("limit"), full: q };
}

function stepsPanel(sql, heading) {
  const el = h("div", { class: "steps-panel" }, heading ? h("b", {}, heading) : null);
  const c = sqlClauses(sql);
  if (!c) { el.append(h("p", { class: "muted" }, "Step-by-step view works on SELECT queries.")); return el; }
  const steps = [];
  const joined = /\bjoin\b/i.test(c.from);
  steps.push({ label: joined ? "FROM + JOIN: line up the tables" : "FROM: start with the whole table", sql: `SELECT * FROM ${c.from}`,
    note: (n) => joined ? `JOIN put matching rows from both tables side by side: ${n} combined row${n === 1 ? "" : "s"}.` : `The table has ${n} row${n === 1 ? "" : "s"}.` });
  const base = `FROM ${c.from}${c.where ? ` WHERE ${c.where}` : ""}`;
  if (c.where) steps.push({ label: `WHERE ${c.where}`, sql: `SELECT * ${base}`, note: (n, prev) => `WHERE kept ${n} of ${prev} rows. Every other row was thrown out.` });
  if (c.group) {
    steps.push({ label: `GROUP BY ${c.group}`, sql: `SELECT ${c.group}, COUNT(*) AS rows_in_group ${base} GROUP BY ${c.group}`,
      note: (n) => `GROUP BY squeezed the rows into ${n} group${n === 1 ? "" : "s"}, one per ${c.group}. Aggregates like COUNT and SUM are calculated inside each group.` });
    if (c.having) steps.push({ label: `HAVING ${c.having}`, sql: `SELECT ${c.group}, COUNT(*) AS rows_in_group ${base} GROUP BY ${c.group} HAVING ${c.having}`, note: (n, prev) => `HAVING kept ${n} of ${prev} groups.` });
  }
  steps.push({ label: `SELECT ${c.select}${c.order ? ` … ORDER BY ${c.order}` : ""}${c.limit ? ` LIMIT ${c.limit}` : ""}`, sql: c.full,
    note: (n) => [`SELECT kept only the columns you listed.`, c.order ? `ORDER BY sorted the rows by ${c.order}.` : "", c.limit ? `LIMIT kept the first ${c.limit}.` : "", `Final result: ${n} row${n === 1 ? "" : "s"}.`].filter(Boolean).join(" ") });
  const list = h("ol", { class: "sql-steps" });
  el.append(list);
  (async () => {
    let prev = null;
    for (const st of steps) {
      try {
        const r = await runQuery(st.sql);
        list.append(h("li", {}, h("code", {}, st.label), h("p", { class: "muted", style: "margin:.2rem 0" }, st.note(r.rows.length, prev)), resultTable({ columns: r.columns, rows: r.rows.slice(0, 6) }),
          r.rows.length > 6 ? h("p", { class: "muted", style: "margin:.2rem 0;font-size:.82rem" }, `…and ${r.rows.length - 6} more`) : null));
        prev = r.rows.length;
      } catch (e) {
        list.append(h("li", {}, h("code", {}, st.label), h("p", { class: "fb bad" }, `This step fails: ${e.message}`)));
        break;
      }
    }
  })();
  return el;
}

// Pinned list of tables and columns that stays in view while scrolling through SQL questions.
// Tapping a name types it into the query box you were last in.
let lastEditor = null;
document.addEventListener("focusin", (e) => { if (e.target.matches?.("textarea.code")) lastEditor = e.target; });
function insertIntoEditor(text) {
  const ed = lastEditor && document.contains(lastEditor) ? lastEditor : document.querySelector("textarea.code");
  if (!ed) return;
  const a = ed.selectionStart ?? ed.value.length, b = ed.selectionEnd ?? a;
  const before = ed.value.slice(0, a), after = ed.value.slice(b);
  const pad = before && !/[\s(,.]$/.test(before) ? " " : "";
  ed.value = before + pad + text + after;
  const pos = (before + pad + text).length;
  ed.focus();
  ed.setSelectionRange(pos, pos);
}
let dockOpen = null;
function schemaDock() {
  const body = h("div", { class: "dock-body" }, h("span", { class: "muted" }, "Loading tables…"));
  const narrow = matchMedia("(max-width: 760px)").matches;
  const open = dockOpen ?? !narrow;
  const toggle = h("button", { class: "linkish", "aria-expanded": String(open), onclick: () => { dockOpen = body.hidden; body.hidden = !body.hidden; toggle.setAttribute("aria-expanded", String(!body.hidden)); toggle.textContent = body.hidden ? "Show" : "Hide"; } }, open ? "Hide" : "Show");
  body.hidden = !open;
  getSqlDb().then((d) => {
    const tables = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0].values.map((r) => r[0]);
    body.replaceChildren(...tables.map((t) => {
      const cols = d.exec(`PRAGMA table_info(${t})`)[0].values;
      const fks = d.exec(`PRAGMA foreign_key_list(${t})`)[0]?.values || [];
      return h("div", { class: "dock-row" },
        h("button", { class: "tname", title: `Insert ${t}`, onclick: () => insertIntoEditor(t) }, t),
        h("span", { class: "cols" }, cols.map((c) => {
          const fk = fks.find((f) => f[3] === c[1]);
          return h("button", { class: "cname", title: fk ? `${c[1]} links to ${fk[2]}` : `Insert ${c[1]}`, onclick: () => insertIntoEditor(c[1]) }, c[1], c[5] ? " 🔑" : "", fk ? ` → ${fk[2]}` : "");
        })));
    }), h("p", { class: "muted dock-tip" }, "Tap a name to type it into your query. 🔑 = primary key, → = links to another table."));
  });
  return h("div", { class: "schema-dock", role: "region", "aria-label": "Practice database tables" },
    h("div", { class: "dock-head" }, h("b", {}, "🗂️ Tables"), toggle), body);
}

function dataSheets() {
  const wrap = h("div", { class: "sheets" });
  getSqlDb().then((d) => {
    const tables = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0].values.map((r) => r[0]);
    const body = h("div");
    const tabs = tables.map((t, i) => h("button", { type: "button", "aria-pressed": String(i === 0), onclick: () => show(i) }, t));
    const show = (i) => {
      tabs.forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
      const r = d.exec(`SELECT * FROM ${tables[i]}`)[0];
      body.replaceChildren(resultTable({ columns: r.columns, rows: r.values }));
    };
    wrap.append(h("div", { class: "seg", role: "group", "aria-label": "Tables" }, tabs), body);
    show(0);
  });
  return wrap;
}

function formulaSheet(courseKey) {
  const rows = FORMULAS[courseKey] || [];
  return h("section", { class: "block" }, h("h2", {}, courseKey === "sql" ? "SQL formula sheet" : "Accounting formula sheet"),
    h("p", { class: "muted", style: "margin:0" }, courseKey === "sql" ? "Find what the question is asking for on the left, then use the pattern. Words like “per”, “for each” and “by” almost always mean GROUP BY." : "The formulas and rules you'll use over and over."),
    h("div", { class: "scroll" }, h("table", { class: "ref formulas" },
      h("thead", {}, h("tr", {}, h("th", {}, "When you need to…"), h("th", {}, courseKey === "sql" ? "Pattern" : "Formula"), h("th", {}, "Example"))),
      h("tbody", {}, rows.map(([goal, pattern, ex]) => h("tr", {}, h("td", {}, goal), h("td", {}, h("code", {}, pattern)), h("td", {}, ex ? h("code", {}, ex) : "")))))));
}

/* ---------- Accounting: build the financial statements ---------- */
const PLACES = [
  ["", "Choose where it goes…"],
  ["rev", "Income statement: Revenue"],
  ["exp", "Income statement: Expense"],
  ["re", "Retained earnings: Beginning balance"],
  ["div", "Retained earnings: Dividends (subtract)"],
  ["ca", "Balance sheet: Current asset"],
  ["la", "Balance sheet: Long-term asset"],
  ["cl", "Balance sheet: Current liability"],
  ["ll", "Balance sheet: Long-term liability"],
  ["eq", "Balance sheet: Equity (stock)"],
];
const placeOf = (a) => ({ revenue: "rev", expense: "exp", dividends: "div", re: "re", equity: "eq" })[a.type] || (a.type === "asset" ? (a.current ? "ca" : "la") : a.current ? "cl" : "ll");
const PLACE_WHY = {
  rev: "Revenues go on the income statement. They're what the company earned this period.",
  exp: "Expenses go on the income statement. They're costs used up to earn revenue.",
  re: "Beginning retained earnings starts the statement of retained earnings.",
  div: "Dividends aren't an expense. They're subtracted on the statement of retained earnings.",
  ca: "A current asset: cash, or something that will turn into cash or be used up within a year.",
  la: "A long-term asset: used for more than a year, like equipment or buildings.",
  cl: "A current liability: due within a year.",
  ll: "A long-term liability: due more than a year from now.",
  eq: "Stock the owners bought goes in equity on the balance sheet.",
};
const num = (v) => { const n = Number(String(v).replace(/[^\d.-]/g, "")); return String(v).trim() === "" || isNaN(n) ? null : n; };

function statementTotals(accts) {
  const sum = (p) => accts.filter((a) => placeOf(a) === p).reduce((t, a) => t + a.balance, 0);
  const ni = sum("rev") - sum("exp");
  const endRe = sum("re") + ni - sum("div");
  const ta = sum("ca") + sum("la"), tl = sum("cl") + sum("ll"), te = sum("eq") + endRe;
  return { rev: sum("rev"), exp: sum("exp"), ni, endRe, ta, tl, te, tle: tl + te };
}

function statementBuilder(b) {
  const box = h("section", { class: "block statements" });
  const draw = (data) => {
    const picks = new Map();
    const T = statementTotals(data.accounts);
    const preview = h("div", { class: "fs-grid" });
    const sk = (k) => `st:${data.company}:${k}`; // saved-answer keys for this company
    const totals = Object.fromEntries(["ni", "re", "ta", "tl", "te", "tle"].map((k) => [k, track.answer(sk("tot:" + k)) || ""]).filter(([, v]) => v));
    const carry = {}; // cells that show a total carried to the next statement
    const totalIds = new Map();

    const line = (name, amt, cls = "") => h("tr", { class: cls }, h("td", {}, name), h("td", { class: "amt" }, amt == null ? "" : money(amt)));
    const totalInput = (key, label, correct, howTo) => {
      const inp = h("input", { id: `tot-${key}-${uid()}`, inputmode: "decimal", class: "mono", value: totals[key] ?? "", "aria-label": label, placeholder: "$" });
      const fb = h("div");
      const tid = totalIds.get(key) || track.add();
      totalIds.set(key, tid);
      let lastChecked = null;
      const check = (silent) => {
        const v = num(inp.value);
        totals[key] = inp.value;
        if (v == null || (!silent && v === lastChecked)) return;
        if (!silent) { lastChecked = v; track.record(sk("tot:" + key), inp.value); }
        const ok = v === correct;
        const miss = { concept: `${label} for ${data.company}`, detail: `I entered ${money(v)}. How to get it: ${howTo}.` };
        fb.replaceChildren(feedback(ok, ok ? howTo : `Not ${money(v)}. ${howTo}.`, `On ${data.company}'s statements I got ${label} = ${money(v)}. How do I work it out? Don't just give me the number.`, miss));
        track.attempt(tid, ok, miss, silent);
        if (carry[key]) carry[key].textContent = ok ? money(v) : "";
      };
      inp.addEventListener("change", () => check());
      inp.addEventListener("keydown", (e) => e.key === "Enter" && check());
      if (totals[key]) queueMicrotask(() => check(true)); // restore feedback after a redraw without re-scoring
      return h("tr", { class: "total" }, h("td", {}, h("label", { for: inp.id }, label), fb), h("td", { class: "amt" }, inp));
    };

    const renderPreview = () => {
      const placed = (p) => data.accounts.filter((a) => picks.get(a) === p);
      const rows = (p) => placed(p).map((a) => line(a.name, a.balance, placeOf(a) === p ? "" : "wrong-line"));
      const empty = (p) => (placed(p).length ? null : h("tr", {}, h("td", { class: "muted", colspan: 2 }, "(nothing placed yet)")));
      preview.replaceChildren(
        h("div", { class: "fs" }, h("h3", {}, data.company), h("p", { class: "fs-sub" }, `Income Statement · ${data.period}`),
          h("table", {}, h("tbody", {},
            h("tr", { class: "sec" }, h("td", { colspan: 2 }, "Revenues")), rows("rev"), empty("rev"),
            h("tr", { class: "sec" }, h("td", { colspan: 2 }, "Expenses")), rows("exp"), empty("exp"),
            totalInput("ni", "Net income", T.ni, `Net income = total revenues (${money(T.rev)}) − total expenses. Add up the expenses and subtract`)))),
        h("div", { class: "fs" }, h("h3", {}, data.company), h("p", { class: "fs-sub" }, `Statement of Retained Earnings · ${data.period}`),
          h("table", {}, h("tbody", {},
            ...(placed("re").length ? rows("re") : [line("Retained earnings, beginning", null, "muted")]),
            (() => { const r = line("Add: Net income (from statement 1)", totals.ni && num(totals.ni) === T.ni ? T.ni : null); carry.ni = r.lastChild; return r; })(),
            rows("div"), empty("div"),
            totalInput("re", "Retained earnings, ending", T.endRe, "Ending RE = beginning RE + net income − dividends")))),
        h("div", { class: "fs" }, h("h3", {}, data.company), h("p", { class: "fs-sub" }, `Balance Sheet · end of the ${data.period.replace(/^year ended /i, "year, ")}`),
          h("table", {}, h("tbody", {},
            h("tr", { class: "sec" }, h("td", { colspan: 2 }, "Current assets")), rows("ca"), empty("ca"),
            h("tr", { class: "sec" }, h("td", { colspan: 2 }, "Long-term assets")), rows("la"), empty("la"),
            totalInput("ta", "Total assets", T.ta, "Total assets = current assets + long-term assets"),
            h("tr", { class: "sec" }, h("td", { colspan: 2 }, "Current liabilities")), rows("cl"), empty("cl"),
            h("tr", { class: "sec" }, h("td", { colspan: 2 }, "Long-term liabilities")), rows("ll"), empty("ll"),
            totalInput("tl", "Total liabilities", T.tl, "Total liabilities = current liabilities + long-term liabilities"),
            h("tr", { class: "sec" }, h("td", { colspan: 2 }, "Stockholders' equity")), rows("eq"),
            (() => { const r = line("Retained earnings (ending, from statement 2)", totals.re && num(totals.re) === T.endRe ? T.endRe : null); carry.re = r.lastChild; return r; })(),
            totalInput("te", "Total equity", T.te, "Total equity = common stock + ending retained earnings"),
            totalInput("tle", "Total liabilities + equity", T.tle, "Add total liabilities and total equity. It should equal total assets"),
          ))));
    };

    const sortRows = data.accounts.map((a) => {
      const sel = h("select", { id: `pl-${uid()}`, "aria-label": `Where does ${a.name} go?` }, PLACES.map(([v, t]) => h("option", { value: v }, t)));
      const fb = h("div", { class: "fbslot" });
      const tid = track.add();
      const place = (restore) => {
        if (!sel.value) return;
        picks.set(a, sel.value);
        const ok = sel.value === placeOf(a);
        const miss = { concept: `Where ${a.name} goes on the financial statements`, detail: `I put it under "${PLACES.find((p) => p[0] === sel.value)[1]}".` };
        fb.replaceChildren(feedback(ok, ok ? PLACE_WHY[placeOf(a)] : "Try another spot.", `Why doesn't ${a.name} go under "${PLACES.find((p) => p[0] === sel.value)[1]}"?`, miss));
        if (!restore) { note(`Placed ${a.name} under ${sel.value} (${ok ? "right" : "wrong"}).`); track.record(sk(a.name), sel.value); }
        track.attempt(tid, ok, miss, restore);
        if (!restore) renderPreview();
      };
      sel.addEventListener("change", () => place(false));
      if (track.answer(sk(a.name))) { sel.value = track.answer(sk(a.name)); place(true); }
      return track.at(tid, h("tr", {}, h("td", {}, a.name, fb), h("td", { class: "amt" }, money(a.balance)), h("td", {}, sel)));
    });

    box.replaceChildren(
      h("div", { class: "panel-head" }, h("h2", {}, `Build ${data.company}'s statements`),
        sample ? h("button", { class: "btn quiet small", onclick: () => newCompany(draw) }, "New practice company") : null),
      h("p", { style: "margin:0" }, h("b", {}, "Step 1. "), "Sort each account from the trial balance. The statements below fill in as you go, and anything in the wrong place shows in red."),
      h("div", { class: "scroll" }, h("table", { class: "tb" }, h("thead", {}, h("tr", {}, h("th", {}, "Account"), h("th", { class: "amt" }, "Balance"), h("th", {}, "Where does it go?"))), h("tbody", {}, sortRows))),
      h("p", { style: "margin:0" }, h("b", {}, "Step 2. "), "Work out each total and type it in (press Enter). Do the statements in order: net income feeds retained earnings, and ending retained earnings feeds the balance sheet."),
      preview,
      h("p", { class: "muted", style: "margin:0;font-size:.88rem" }, "The balance sheet balances when total assets = total liabilities + equity. If yours doesn't, look for an account in the wrong spot."));
    renderPreview();
  };
  draw(track.answer("st:company") || b); // a generated practice company is remembered too
  return box;
}

async function newCompany(draw) {
  const lesson = currentLesson();
  const prompt = `Create a realistic trial balance for a small fictional business, for a student practicing building an income statement, statement of retained earnings, and balance sheet in an intro financial accounting course (ACCT 2010). Use 14-20 accounts with round-ish numbers: several current assets, 1-2 long-term assets, current and long-term liabilities, Common Stock, beginning Retained Earnings, Dividends, 1-2 revenues, and 4-6 expenses. Pick a different kind of business than a bike rental shop.${lesson ? ` The student is on the lesson "${lesson.title}".` : ""}
The numbers MUST balance: total assets = total liabilities + common stock + (beginning retained earnings + revenues − expenses − dividends).
Reply with ONLY JSON: {"company": string, "period": "year ended December 31", "accounts": [{"name": string, "balance": number, "type": "asset"|"liability"|"equity"|"re"|"dividends"|"revenue"|"expense", "current": boolean}]}
Use "re" only for beginning Retained Earnings and "equity" only for Common Stock. "current" matters only for assets and liabilities.`;
  try {
    const data = await sample.json(prompt, { cache: false });
    const accts = (data?.accounts || []).filter((a) => a?.name && Number(a.balance) > 0 && ["asset", "liability", "equity", "re", "dividends", "revenue", "expense"].includes(a.type))
      .map((a) => ({ name: String(a.name), balance: Math.round(Number(a.balance)), type: a.type, current: Boolean(a.current) }));
    if (accts.length < 8) throw { code: "invalid_json" };
    // Make sure it balances: plug any difference into Cash.
    const T = statementTotals(accts);
    const gap = T.tle - T.ta;
    if (gap) {
      const cash = accts.find((a) => a.type === "asset" && /cash/i.test(a.name)) || accts.find((a) => a.type === "asset");
      if (!cash || cash.balance + gap <= 0) throw { code: "invalid_json" };
      cash.balance += gap;
    }
    const co = { company: String(data.company || "Practice Company"), period: String(data.period || "year ended December 31"), accounts: accts };
    track.record("st:company", co);
    draw(co);
  } catch (e) {
    alertNote(sampleErrorText(e));
  }
}
const alertNote = (t) => document.querySelector(".statements")?.prepend(h("p", { class: "note bad" }, t));

function resultTable({ columns, rows }, mark) {
  if (!columns.length) return h("p", { class: "muted" }, "No rows returned.");
  return h("div", { class: "scroll" }, h("table", { class: "result" }, h("thead", {}, h("tr", {}, columns.map((c) => h("th", {}, c)))),
    h("tbody", {}, rows.slice(0, 200).map((r, i) => h("tr", { class: mark?.has(i) ? "flag" : null }, r.map((v) => h("td", {}, v === null ? "NULL" : v)))))));
}

function renderLesson(lesson) {
  track = newTracker(lesson);
  const done = track.saved.done;
  const course = state.course;
  const article = h("article", { class: "lesson" },
    h("div", { class: "row" }, h("h1", { style: "flex:1" }, lesson.title), done ? h("span", { class: "chip done" }, "✓ Completed") : null),
    h("button", { class: "watch-btn", onclick: () => openVideo({ key: `${course}:${state.lessonId || lesson.title}`, courseKey: course, topic: lesson.title, lessonTitle: lesson.title, material: lessonMaterial(lesson) }) },
      h("span", { class: "watch-face", "aria-hidden": "true" }, "👨‍🏫"), h("span", {}, h("b", {}, `🎬 Watch ${TEACHER} explain this lesson`), h("small", {}, "A short video with chalkboard visuals, read out loud"))),
    lesson.blocks.map((b, bi) => { const el = RENDER[b.type]?.(b); if (el?.dataset) el.dataset.bi = bi; return el; }));
  // A 🎬 button on each section: a short video on just that part of this lesson.
  article.querySelectorAll(":scope > [data-bi]").forEach((sec) => {
    const n = Number(sec.dataset.bi);
    const h2 = sec.querySelector("h2");
    const b = lesson.blocks[n];
    if (!b || b.type === "definitions" || b.type === "schema") return;
    const title = h2?.textContent.trim() || (b.type === "objectives" ? "What you need to know"
      : sec.querySelector("table") ? "the reference table" : (sec.querySelector("h3, p b, p")?.textContent || "this part").trim().replace(/\s+/g, " ").replace(/:$/, "").slice(0, 50));
    const btnHost = h2 || sec.insertBefore(h("div", { class: "section-video" }), sec.firstChild);
    btnHost.append(" ", h("button", { class: "term-video", title: `${TEACHER} explains this part`, "aria-label": `Watch ${TEACHER} explain ${title}`, onclick: () => {
      const obj = lesson.blocks.find((x) => x.type === "objectives")?.text || "";
      openVideo({ key: `${course}:${state.lessonId || lesson.title}:s${n}`, courseKey: course, topic: `${lesson.title}: ${title}`, lessonTitle: lesson.title,
        focus: `Explain just the "${title}" part of this lesson so she can do it on her own.`,
        material: `Lesson objectives: ${obj}\nThis part: ${b.type === "text" ? String(b.html || "").replace(/<[^>]+>/g, " ") : JSON.stringify({ ...b, html: undefined })}\n\nWhole lesson for context: ${lessonMaterial(lesson).slice(0, 5000)}` });
    } }, "🎬 explain"));
  });
  track.base = track.count; // items after this belong to the extra practice set
  practice.area = h("div", { class: "lesson", id: "extra-practice" });
  article.append(practice.area, progressBlock());
  if (track.saved.practice) practice.show(track.saved.practice, false);
  const banner = resumeBanner();
  if (banner) article.querySelector("h1").parentElement.after(banner);
  return article;
}

const itemNum = (id) => Number(String(id).slice(1));
// "Welcome back" for a lesson in progress, "review your work" for a finished one.
function resumeBanner() {
  const t = track, saved = t.saved;
  const answered = Object.keys(saved.answers || {}).length;
  if (!answered) return null;
  const jump = () => {
    const open = [...t.els.entries()].filter(([id]) => !t.solved.has(id)).sort((a, b) => itemNum(a[0]) - itemNum(b[0]))[0];
    (open?.[1] || document.querySelector(".progress"))?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const fresh = () => {
    saved.answers = {}; saved.firstTry = {}; saved.solved = 0; saved.updatedAt = new Date().toISOString();
    saveProgress();
    go("class", state.course, state.lessonId);
  };
  return saved.done
    ? h("p", { class: "note good resume", style: "margin:0" }, "✓ You finished this lesson. Your answers are saved below so you can review them. ",
        h("button", { class: "linkish", onclick: fresh }, "Start fresh and redo it"))
    : h("p", { class: "note resume", style: "margin:0" }, "Welcome back! Your answers are saved. ",
        h("button", { class: "btn small", onclick: jump }, "Jump to where I left off"), " ",
        h("button", { class: "linkish", onclick: fresh }, "Start over"));
}

function progressBlock() {
  const el = h("section", { class: "block progress", "aria-live": "polite" });
  const draw = () => {
    const s = track.saved;
    const total = track.count;
    const solved = track.solved.size;
    const pct = total ? Math.round((solved / total) * 100) : 100;
    el.replaceChildren(
      h("div", { class: "panel-head" }, h("h2", {}, s.done ? "Lesson complete ✓" : "Your progress"),
        total ? h("span", { class: "muted" }, `${solved} of ${total} answered correctly`) : null),
      total ? h("div", { class: "bar", role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 }, h("span", { style: `width:${pct}%` })) : null,
      track.first.size ? h("p", { class: "muted", style: "margin:0" }, `Right on the first try: ${[...track.first.values()].filter(Boolean).length} of ${track.first.size}.`) : null,
      s.missed.length ? h("div", {}, h("b", {}, "Things to practice"), h("ul", { class: "points" }, s.missed.slice(-6).map((m) => h("li", {}, m.concept)))) : null,
      h("div", { class: "row" },
        s.missed.length && sample ? h("button", { class: "btn", onclick: () => practice.make(s.missed.slice(-6)) }, `Practice what I missed (${Math.min(s.missed.length, 6)})`) : null,
        sample && (s.done || (track.first.size >= 3 && [...track.first.values()].filter(Boolean).length / track.first.size >= 0.8))
          ? h("button", { class: "btn quiet", onclick: () => practice.make([], { challenge: true }) }, "🔥 Challenge me (harder)") : null,
        !s.done ? h("button", { class: "btn quiet", onclick: () => track.complete(false) }, "Mark lesson complete") : null,
        s.done ? nextUpButton() : null,
        s.missed.length ? h("button", { class: "linkish", onclick: () => { s.missed = []; s.updatedAt = new Date().toISOString(); saveProgress(); draw(); } }, "Clear list") : null));
  };
  track.listeners.push(draw);
  draw();
  return el;
}

/* ---------- extra practice from mistakes ---------- */
const practice = {
  area: null,
  async make(misses, { challenge = false } = {}) {
    if (!sample || !this.area) return;
    const course = courseOf(state.course);
    const lesson = currentLesson();
    // How did the last practice round go? (items after the lesson's own questions)
    const lastRound = [...track.first.entries()].filter(([id]) => itemNum(id) >= track.base);
    const round = lastRound.length ? { right: lastRound.filter(([, ok]) => ok).length, total: lastRound.length } : null;
    const ctl = new AbortController();
    this.area.replaceChildren(h("section", { class: "block working" }, h("div", { class: "spinner" }),
      h("b", {}, challenge ? "Making a harder challenge round…" : "Making practice questions for what you missed…"), h("button", { class: "btn quiet small", onclick: () => ctl.abort() }, "Stop")));
    this.area.scrollIntoView({ behavior: "smooth", block: "start" });
    const prompt = [
      `You are ${course.tutor}. A student is working through the lesson "${lesson?.title}".`,
      `Lesson objectives: ${lesson?.blocks.find((b) => b.type === "objectives")?.text || ""}`,
      challenge ? "They've done well on this lesson. Write a CHALLENGE round that stretches what they know: harder, multi-step, applied to new situations." : "They got these wrong:",
      ...(challenge ? [] : misses.map((m, i) => `${i + 1}. ${m.concept}. ${m.detail}`)),
      difficultyNote(state.course, round),
      "Write a short practice set that helps them actually understand these ideas, not memorize answers. Break each idea into smaller steps: start with an easier question that isolates the core rule, then build to applying it in a new situation. Use fresh examples, not the same ones they missed. Every item gets a hint that nudges their thinking (a question to ask themselves) without giving the answer, and an explanation that walks through the reasoning.",
      state.course === "accounting" ? "Include 2-4 debitCredit transactions (debits equal credits; she'll build these entries herself from a list of accounts, so compound entries with 3 lines are great when she's ready) plus 3-5 quiz questions." : "",
      state.course === "sql" ? `Include 2-4 sqlExercises (solutions must run in SQLite on this database) plus 2-3 quiz questions:\n${PRACTICE.schema}` : "",
      state.course === "language-arts" ? "Include 4-6 quiz questions." : "",
      `Reply with ONLY one JSON object:
{
  "intro": string,  // 1-2 sentences: what these have in common and what to focus on
  "quiz": [{"question": string, "options": string[], "answerIndex": number, "hint": string, "explanation": string}],
  "debitCredit": [{"transaction": string, "entries": [{"account": string, "side": "debit"|"credit", "amount": number, "why": string}]}],
  "sqlExercises": [{"prompt": string, "solution": string, "hint": string}]
}`,
    ].filter(Boolean).join("\n");
    try {
      const set = await sample.json(prompt, { signal: ctl.signal, cache: false });
      if (!set?.quiz && !set?.debitCredit && !set?.sqlExercises) throw { code: "invalid_json" };
      // Clear saved answers from the previous practice set before showing the new one.
      for (const k of Object.keys(track.saved.answers)) if (/^i\d+$/.test(k) && itemNum(k) >= track.base) { delete track.saved.answers[k]; delete track.saved.firstTry[k]; }
      track.saved.practice = set;
      track.saved.updatedAt = new Date().toISOString();
      bumpStat(state.course, { practice: 1 });
      saveProgress();
      this.show(set, true);
    } catch (e) {
      this.area.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e)));
    }
  },
  show(set, scroll) {
    // A new set reuses the item numbers after the lesson, so forget the old set's items.
    for (const id of [...track.els.keys()]) if (itemNum(id) >= track.base) { track.els.delete(id); track.solved.delete(id); track.first.delete(id); }
    track.count = track.base;
    const blocks = [];
    if (set.debitCredit?.length) blocks.push(state.course === "accounting"
      ? { type: "journalBuilder", title: "Practice: build these entries yourself", rows: set.debitCredit }
      : { type: "debitCredit", title: "Practice: debit or credit?", rows: set.debitCredit });
    if (set.sqlExercises?.length) blocks.push({ type: "sql", title: "Practice queries", tasks: set.sqlExercises });
    const quiz = (set.quiz || []).filter((q) => q.options?.[q.answerIndex] != null);
    if (quiz.length) blocks.push({ type: "quiz", title: "Practice: check yourself", items: quiz });
    this.area.replaceChildren(
      h("div", { class: "practice-head" }, h("span", { class: "eyebrow" }, "Extra practice from your mistakes"),
        set.intro ? h("p", { style: "margin:.25rem 0 0" }, set.intro) : null),
      ...blocks.map((b) => RENDER[b.type](b)));
    track.listeners.forEach((f) => f());
    if (scroll) this.area.scrollIntoView({ behavior: "smooth", block: "start" });
  },
};

// Converts a lesson Claude generated into blocks.
function fromGenerated(g) {
  const blocks = [{ type: "objectives", text: g.objectives }];
  if (g.keyPoints?.length) blocks.push({ type: "keyPoints", items: g.keyPoints });
  if (g.debitCredit?.length) blocks.push({ type: "debitCredit", title: "Try it: debit or credit?", rows: g.debitCredit });
  if (g.sqlExercises?.length) blocks.push({ type: "schema" }, { type: "sql", title: "Try it", tasks: g.sqlExercises });
  if (g.definitions?.length) blocks.push({ type: "definitions", items: g.definitions.map((d) => [d.term, d.definition]) });
  if (g.quiz?.length) blocks.push({ type: "quiz", items: g.quiz.filter((q) => q.options?.[q.answerIndex] != null) });
  if (g.practicePrompts?.length) blocks.push({ type: "practice", prompts: g.practicePrompts });
  return { title: g.title, blocks };
}

/* ---------- Claude: lesson builder ---------- */
const LESSON_SHAPE = `Reply with ONLY one JSON object of this shape:
{
  "title": string,
  "objectives": string,            // one short paragraph: what the student must be able to do
  "keyPoints": string[],           // the most important ideas, as tight bullet points
  "definitions": [{"term": string, "definition": string}],
  "debitCredit": [{"transaction": string, "entries": [{"account": string, "side": "debit"|"credit", "amount": number, "why": string}]}],
  "quiz": [{"question": string, "options": string[], "answerIndex": number, "explanation": string}],
  "sqlExercises": [{"prompt": string, "solution": string}],
  "practicePrompts": string[]
}`;

/* ---------- learning path: new lessons that build on finished ones ---------- */
function nextUpButton() {
  const key = state.course;
  if (!key || key === "explore") return null;
  const next = [...(LESSONS[key] || []), ...pathLessons(key)].find((l) => l.id !== state.lessonId && !isDone(key, l.id));
  if (next) return h("button", { class: "btn", onclick: () => go("class", key, next.id) }, `Next: ${next.title || next.data?.title} →`);
  return state.pathBuilding[key]?.started ? h("span", { class: "muted" }, "🌱 Building your next lesson… it'll show in the sidebar.") : null;
}

const pathAutoTried = new Set();
const pathLessons = (key) => state.lessons.filter((l) => l.courseKey === key && l.path);
const isDone = (key, id) => !!state.progress[`${key}:${id}`]?.done;
// Everything in the class's lesson list is finished (built-in lessons, then path lessons).
const pathCaughtUp = (key) => [...(LESSONS[key] || []), ...pathLessons(key)].every((l) => isDone(key, l.id));

function pathMaterial(key) {
  const done = [...(LESSONS[key] || []).map((l) => ({ id: l.id, title: l.title, objectives: l.blocks.find((b) => b.type === "objectives")?.text || "" })),
    ...pathLessons(key).map((l) => ({ id: l.id, title: l.data.title, objectives: l.data.objectives || "" })),
    ...state.lessons.filter((l) => l.courseKey === key && !l.path).map((l) => ({ id: l.id, title: l.data.title, objectives: l.data.objectives || "" }))]
    .map((l) => ({ ...l, p: state.progress[`${key}:${l.id}`] })).filter((l) => l.p);
  const lessons = done.map((l) => {
    const v = Object.values(l.p.firstTry || {});
    const pctRight = v.length ? Math.round((v.filter(Boolean).length / v.length) * 100) : null;
    return `- ${l.title} (${l.p.done ? "finished" : "in progress"}${pctRight != null ? `, ${pctRight}% right on first try` : ""}): ${l.objectives.slice(0, 300)}`;
  }).join("\n");
  const missed = done.flatMap((l) => l.p.missed || []).slice(-12).map((m) => `- ${m.concept}`).join("\n");
  const soon = openDeadlines().filter((d) => d.courseKey === key && new Date(d.due) > new Date() && new Date(d.due) - Date.now() < 21 * 864e5)
    .map((d) => `- ${d.kind === "quiz" ? "Quiz/test" : "Assignment"}: ${d.title} (due ${new Date(d.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })})${d.covers ? ` covers: ${d.covers}` : ""}${d.description ? ` — ${String(d.description).slice(0, 300)}` : ""}`).join("\n");
  const weeks = readingWeeks(key).slice(0, 2).map((w) => {
    const n = state.weekNotes[w.key];
    return `- ${w.module}: ${w.list.map((r) => r.title).join("; ")}${n ? `\n  Key ideas: ${n.mustKnow.join(" | ")}` : ""}`;
  }).join("\n");
  return [`Lessons she has done in ${courseOf(key).title}, in order:\n${lessons || "(none yet: start with the first core topic of this course)"}`,
    missed ? `Concepts she missed and should see again:\n${missed}` : "",
    soon ? `Coming up in Canvas (next 3 weeks):\n${soon}` : "",
    weeks ? `Current readings:\n${weeks}` : ""].filter(Boolean).join("\n\n");
}

async function buildNextLesson(key, { quiet = false } = {}) {
  if (!sample || state.pathBuilding[key]) return;
  state.pathBuilding[key] = { started: Date.now() };
  refreshPathUI(key);
  try {
    const { data } = await buildLesson({ courseKey: key, title: "Next lesson", text: pathMaterial(key), next: true });
    const n = (LESSONS[key] || []).length + pathLessons(key).length + 1;
    data.title = `${n}. ${String(data.title).replace(/^\s*\d+[.)]\s*/, "")}`;
    const rec = { id: "p-" + uid(), courseKey: key, path: true, title: data.title, source: "Next step in your path", createdAt: new Date().toISOString(), data };
    state.lessons.push(rec);
    await saveLessons();
    delete state.pathBuilding[key];
    note(`Built the next lesson: ${data.title}.`);
    if (state.view === "class" && state.course === key) {
      const here = state.lessonId;
      render(); // adds it to the sidebar
      if (!quiet && !here) go("class", key, rec.id);
    }
  } catch (e) {
    state.pathBuilding[key] = { error: sampleErrorText(e) };
    refreshPathUI(key);
  }
}
function refreshPathUI(key) {
  document.querySelectorAll(`[data-path="${key}"]`).forEach((el) => el.replaceWith(pathControl(key)));
}
// Sidebar control: build the next lesson, or show that one is being built.
function pathControl(key) {
  const st = state.pathBuilding[key];
  const box = h("div", { class: "path-ctl", "data-path": key });
  if (st?.started) box.append(h("p", { class: "muted", role: "status" }, h("span", { class: "spinner small" }), " Building your next lesson…"));
  else box.append(
    h("button", { class: `btn small${pathCaughtUp(key) ? "" : " quiet"}`, disabled: !sample || null, onclick: () => buildNextLesson(key) }, "🌱 Build my next lesson"),
    h("small", { class: "muted" }, !sample ? "Works when Study Hub is open in Claude."
      : pathCaughtUp(key) ? "You've finished everything here. The next one builds on it." : "Builds on what you've done. One is made for you automatically when you finish the list."),
    st?.error ? h("small", { class: "bad" }, st.error) : null);
  return box;
}

async function buildLesson({ courseKey, title, text, assignment, next = false, signal, onProgress }) {
  const course = courseOf(courseKey);
  const material = text.slice(0, 40000);
  const prompt = [
    `You are ${course.tutor}. Write an interactive study lesson from the student's actual course material below.`,
    assignment
      ? `This is an upcoming assignment ("${assignment.title}", due ${new Date(assignment.due).toLocaleString()}). Build a PREP lesson: teach what they need to know to do it well. Do not complete the assignment for them.`
      : next
        ? `This is the NEXT lesson in the student's own learning path for this class. The notes below show what she has already finished, how she did, and what's coming up in Canvas. Teach ONE new skill or concept that follows logically from what she's done (the next step in a typical intro course sequence), and weave in quick review of anything she missed. When the upcoming Canvas work or current readings point to a topic, prefer it, so this also helps her homework and tests. Never repeat a lesson she's already done. Start the title with a short, specific topic name.`
        : `Source: "${title}". Pull out only what matters most so the student doesn't have to read all of it.`,
    courseKey === "accounting" ? "Include 3-5 debitCredit transactions that fit the material; debits must equal credits in each." : "Leave debitCredit empty.",
    courseKey === "sql" ? `Include 3-5 sqlExercises answerable against this SQLite practice database (solutions must run on it):\n${PRACTICE.schema}` : "Leave sqlExercises empty.",
    "Include 4-10 definitions, 3-6 quiz questions (answerIndex is 0-based), and 1-3 practicePrompts.",
    difficultyNote(courseKey),
    LESSON_SHAPE,
    `\n--- COURSE MATERIAL ---\n${material}`,
  ].join("\n\n");
  let chars = 0;
  const data = await sample.json(prompt, { signal, cache: false, onText: ({ text }) => onProgress?.((chars = text.length)) });
  if (!data?.objectives || !data?.title) throw { code: "invalid_json", message: "The lesson came back incomplete." };
  return { data, truncatedInput: text.length > material.length };
}

async function pdfToText(file) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const content = await (await pdf.getPage(i)).getTextContent();
    pages.push(content.items.map((it) => it.str).join(" "));
  }
  return pages.join("\n\n").replace(/[ \t]+/g, " ").trim();
}

function sampleErrorText(e) {
  switch (e?.code) {
    case "not_granted": return "Claude wasn't allowed for this page. Reload and choose Allow when asked.";
    case "sampling_disabled": return "Claude isn't available on this account.";
    case "rate_limited": return "You've hit your Claude usage limit for now. Try again a bit later.";
    case "prompt_too_large": return "That's too much text at once. Try one chapter or section.";
    case "invalid_json": return "The lesson came back in the wrong format. Try again.";
    case "refused": return "Claude declined this one. Try different material.";
    case "cancelled": return "Stopped.";
    case "images_unavailable": return "Images can't be sent from here. Try the claude.ai website or the Claude app.";
    case "image_invalid": case "invalid_image": return "That image couldn't be read. Try a PNG or JPG screenshot.";
    default: return "Something went wrong reaching Claude. Try again.";
  }
}

/* ---------- images in chat: paste, drop, or attach ---------- */
let imageCaps = null;
const getImageCaps = () => (imageCaps ||= sample?.limits ? sample.limits().then((c) => c?.images || null).catch(() => null) : Promise.resolve(null));

// Adds image paste/drop to a chat box. Returns the tray (thumbnails + 📎 button) and the picked files.
function imageTray(input) {
  const files = [];
  let caps = null;
  const picker = h("input", { type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", multiple: true, hidden: true });
  const attach = h("button", { class: "btn quiet small attach", type: "button", hidden: true, title: "Attach an image (or paste one into the box)", "aria-label": "Attach an image", onclick: () => picker.click() }, "📎");
  const thumbs = h("div", { class: "thumbs", hidden: true });
  const draw = () => {
    thumbs.hidden = !files.length;
    thumbs.replaceChildren(...files.map((f, i) => h("span", { class: "thumb" },
      h("img", { src: f.url, alt: f.file.name || "pasted image" }),
      h("button", { type: "button", "aria-label": "Remove image", onclick: () => { URL.revokeObjectURL(f.url); files.splice(i, 1); draw(); } }, "✕"))));
  };
  const add = (list) => {
    if (!caps) { showOops("Images can't be sent from here. Open Study Hub on claude.ai or in the Claude app."); return; }
    const ok = [...list].filter((f) => f.type.startsWith("image/") && (!caps.mediaTypes || caps.mediaTypes.includes(f.type)));
    if (list.length && !ok.length) { showOops("That file type isn't supported. Use a PNG, JPG, WebP, or GIF."); return; }
    for (const file of ok) {
      if (files.length >= (caps.maxCount || 4)) { showOops(`You can send up to ${caps.maxCount || 4} images at a time.`); break; }
      files.push({ file, url: URL.createObjectURL(file) });
    }
    draw();
  };
  picker.addEventListener("change", () => { add(picker.files); picker.value = ""; });
  input.addEventListener("paste", (e) => {
    const imgs = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return; // plain text pastes as usual
    e.preventDefault();
    add(imgs);
  });
  input.addEventListener("dragover", (e) => { if ([...(e.dataTransfer?.items || [])].some((i) => i.type.startsWith("image/"))) e.preventDefault(); });
  input.addEventListener("drop", (e) => { const imgs = [...(e.dataTransfer?.files || [])].filter((f) => f.type.startsWith("image/")); if (imgs.length) { e.preventDefault(); add(imgs); } });
  ready.then(getImageCaps).then((c) => { caps = c; attach.hidden = !c; if (c) input.placeholder = input.placeholder.replace("(Enter to send)", "(Enter to send · paste images)"); });
  return {
    attach, picker, thumbs,
    get count() { return files.length; },
    take() { const out = files.map((f) => f.file); files.forEach((f) => URL.revokeObjectURL(f.url)); files.length = 0; draw(); return out; },
  };
}
const imageNote = (n) => (n ? `\n\n[${n === 1 ? "An image is" : `${n} images are`} attached. Look at ${n === 1 ? "it" : "them"} carefully and use what you see.]` : "");
const imageChip = (m) => (m.images ? h("span", { class: "img-chip" }, `🖼️ ${m.images} image${m.images === 1 ? "" : "s"}`) : null);

/* ---------- Claude: tutor chat ---------- */
const tutor = {
  el: null, log: null, input: null, sendBtn: null, busy: false, ctl: null,
  mount() {
    this.log = h("div", { class: "log", "aria-live": "polite" });
    this.input = h("textarea", { id: "tutor-input", rows: 2, placeholder: "Ask anything… (Enter to send)", "aria-label": "Message the tutor" });
    this.sendBtn = h("button", { class: "btn", onclick: () => this.send() }, "Send");
    this.input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.send(); } });
    this.tray = imageTray(this.input);
    this.el = h("aside", { class: "tutor", "aria-label": "Tutor" },
      h("header", {}, h("h2", {}, "Tutor"),
        h("button", { class: "linkish", onclick: () => { state.chats[this.key] = []; saveChats(); this.draw(); } }, "Clear"),
        h("button", { class: "btn quiet small close", onclick: () => document.body.classList.remove("tutor-open"), "aria-label": "Close tutor" }, "✕")),
      this.log, this.tray.thumbs, h("div", { class: "composer" }, this.input, h("div", { class: "composer-btns" }, this.tray.attach, this.sendBtn), this.tray.picker));
    return this.el;
  },
  get key() { return state.course === "explore" && state.explore.topic ? "explore:" + state.explore.topic.id : state.course; },
  get turns() { return (state.chats[this.key] ||= []); },
  draw() {
    if (!this.log) return;
    const turns = this.turns;
    this.log.replaceChildren(...(turns.length ? turns.map((m) => this.bubble(m)) : [h("p", { class: "muted" },
      sample ? "Stuck? Ask me anything about this lesson. When you get something wrong, tap “Ask the tutor why” and I'll explain."
             : "The tutor works when this page is open in Claude (claude.ai or the Claude app).")]));
    this.log.scrollTop = this.log.scrollHeight;
  },
  bubble(m) {
    return m.role === "assistant" ? h("div", { class: "msg assistant", html: md(m.content || "…") }) : h("div", { class: "msg user" }, imageChip(m), m.content);
  },
  context() {
    const course = courseOf(state.course);
    const lesson = currentLesson();
    return [
      `You are ${course.tutor}. You're chatting with a college student inside their study app while they work.`,
      "Teach, don't lecture: answer exactly what they're stuck on, then check understanding with one short question.",
      "Keep replies short and skimmable: a few sentences, bullets, or a small markdown table (great for debits/credits and query results).",
      "When they share an answer, say clearly if it's right; if not, point to the specific mistake and why.",
      "For graded assignments, guide them with steps and examples instead of writing the submission for them.",
      state.course === "explore" && state.explore.topic ? `What they know about ${state.explore.topic.name}:\n${knowledgeText(state.explore.topic)}` : "",
      currentWorksheet() ? worksheetContext(currentWorksheet()) : "",
      state.lessonId === "notes" ? weekNotesContext(state.course) : "",
      lesson ? `They're on the lesson "${lesson.title}". Objectives: ${lesson.blocks.find((b) => b.type === "objectives")?.text || ""}` : "",
      state.activity.length ? `What they just did:\n${state.activity.slice(-8).join("\n")}` : "",
      state.course === "sql" ? `Their practice SQLite database:\n${PRACTICE.schema}` : "",
    ].filter(Boolean).join("\n");
  },
  ask(text) {
    document.body.classList.add("tutor-open");
    this.send(text);
  },
  async send(text = this.input.value.trim()) {
    if (this.busy || (!text && !this.tray?.count)) return;
    const images = this.tray?.count ? this.tray.take() : [];
    if (!text) text = "What's in this image? Help me understand it.";
    if (!sample) { this.turns.push({ role: "user", content: text }, { role: "assistant", content: "_Open this page in Claude to chat with the tutor._" }); this.draw(); return; }
    this.busy = true;
    this.sendBtn.disabled = true;
    this.input.value = "";
    const turns = this.turns;
    turns.push({ role: "user", content: text, ...(images.length ? { images: images.length } : {}) });
    const reply = { role: "assistant", content: "" };
    this.draw();
    const bubble = this.bubble({ role: "assistant", content: "_Thinking…_" });
    this.log.append(bubble);
    this.log.scrollTop = this.log.scrollHeight;
    const history = turns.slice(-16).filter((t) => t.content).map(({ role, content }) => ({ role, content }));
    if (images.length) history[history.length - 1].content += imageNote(images.length);
    this.ctl = new AbortController();
    try {
      const { text: full, truncated } = await sample([{ role: "user", content: this.context() }, ...history], {
        cache: false, signal: this.ctl.signal, ...(images.length ? { images } : {}),
        onText: ({ text }) => { bubble.innerHTML = md(text); this.log.scrollTop = this.log.scrollHeight; },
      });
      reply.content = full + (truncated ? "\n\n_(Cut short. Ask me to continue.)_" : "");
    } catch (e) {
      reply.content = (e.text ? e.text + "\n\n" : "") + `_${sampleErrorText(e)}_`;
    }
    turns.push(reply);
    saveChats();
    this.busy = false;
    this.sendBtn.disabled = false;
    this.draw();
  },
};

/* ---------- interactive worksheets ---------- */
const currentWorksheet = () => state.lessonId?.startsWith("ws-") ? state.worksheets.find((w) => "ws-" + w.id === state.lessonId) : null;
const JOURNAL_COLS = ["Date", "Account", "Debit", "Credit"];

function answerText(f, v) {
  if (f.type !== "journal") return String(v || "").trim();
  return (v || []).filter((r) => r?.some((c) => String(c || "").trim()))
    .map((r) => JOURNAL_COLS.map((c, i) => `${c}: ${r[i] || "-"}`).join(", ")).join("\n");
}

function worksheetContext(w) {
  const lines = w.sections.flatMap((sec) => sec.fields.map((f) => `- ${f.label}: ${answerText(f, w.answers[f.id]) || "(blank)"}`));
  return [
    `They're filling in the graded worksheet "${w.title}"${w.assignment ? ` for the assignment "${w.assignment}"` : ""}.`,
    w.instructions ? `Worksheet instructions: ${w.instructions}` : "",
    `Their answers so far:\n${lines.join("\n")}`,
    "This is graded homework: give hints, explain the concept, and point out what's wrong in their answers, but never write the answer for a blank. Let them do the filling in.",
  ].filter(Boolean).join("\n");
}

function worksheetView(w) {
  const save = () => saveWorksheets();
  const filled = () => w.sections.flatMap((s) => s.fields).filter((f) => answerText(f, w.answers[f.id])).length;
  const total = w.sections.reduce((t, s) => t + s.fields.length, 0);
  const count = h("span", { class: "muted" }, `${filled()} of ${total} filled in`);
  const bump = () => { count.textContent = `${filled()} of ${total} filled in`; save(); };

  const field = (f) => {
    let input;
    if (f.type === "journal") {
      const rows = (w.answers[f.id] ||= Array.from({ length: f.rows }, () => ["", "", "", ""]));
      input = h("div", { class: "scroll" }, h("table", { class: "journal ws-journal" },
        h("thead", {}, h("tr", {}, JOURNAL_COLS.map((c) => h("th", {}, c)))),
        h("tbody", {}, rows.map((r, ri) => h("tr", {}, JOURNAL_COLS.map((c, ci) => {
          const cell = h("input", { id: `${f.id}-${ri}-${ci}`, "aria-label": `${f.label}: row ${ri + 1} ${c}`, value: r[ci] || "", inputmode: ci > 1 ? "decimal" : null, class: ci > 1 ? "mono" : null });
          cell.addEventListener("input", () => { r[ci] = cell.value; bump(); });
          return h("td", {}, cell);
        }))))));
    } else {
      input = f.type === "paragraph"
        ? h("textarea", { id: f.id, rows: 5 }, w.answers[f.id] || "")
        : h("input", { id: f.id, value: w.answers[f.id] || "", inputmode: f.type === "number" ? "decimal" : null });
      input.addEventListener("input", () => { w.answers[f.id] = input.value; bump(); });
    }
    const ask = (kind) => {
      const mine = answerText(f, w.answers[f.id]);
      tutor.ask(kind === "hint"
        ? `I'm on this part of "${w.title}": "${f.label}". ${mine ? `So far I have: ${mine}. ` : ""}Give me a hint to get started. Don't tell me the answer.`
        : `Check my answer for "${f.label}" on "${w.title}":\n${mine || "(I haven't written anything yet)"}\nIs it right? If not, tell me what to fix, but let me fix it.`);
    };
    return h("div", { class: "ws-field" },
      h("label", { for: f.type === "journal" ? `${f.id}-0-0` : f.id }, f.label), input,
      h("div", { class: "row" }, h("button", { class: "btn quiet small", onclick: () => ask("hint") }, "💡 Hint"),
        h("button", { class: "btn quiet small", onclick: () => ask("check") }, "✓ Check my answer")));
  };

  const dl = h("button", { class: "btn", onclick: async () => {
    try {
      await downloads.save({ filename: `${w.title.replace(/[^\w .-]/g, "").trim() || "worksheet"}.pdf`, data: worksheetPdf(w) });
    } catch (e) { if (e?.code !== "declined") dlNote.textContent = "Couldn't save the PDF here. Try again in the Claude app or on claude.ai."; }
  } }, "Download as PDF");
  const dlNote = h("span", { class: "muted", style: "font-size:.88rem" });

  return h("article", { class: "lesson" },
    h("span", { class: "eyebrow" }, "Worksheet"),
    h("h1", {}, w.title),
    w.assignment ? h("p", { class: "muted", style: "margin:0" }, `For: ${w.assignment}`) : null,
    h("p", { class: "note", style: "margin:0" }, "Fill in each blank yourself. Tap 💡 Hint when you're stuck or ✓ Check my answer to have the tutor look it over. It won't fill in blanks for you, so the work stays yours."),
    w.instructions ? h("section", { class: "block objectives" }, h("span", { class: "eyebrow" }, "Instructions"), h("p", {}, w.instructions)) : null,
    w.sections.map((sec) => h("section", { class: "block" }, sec.heading ? h("h2", {}, sec.heading) : null, sec.fields.map(field))),
    h("section", { class: "block progress" },
      h("div", { class: "panel-head" }, h("h2", {}, "When you're done"), count),
      h("div", { class: "row" },
        sample ? h("button", { class: "btn quiet", onclick: () => tutor.ask(`I finished "${w.title}". Review all my answers and tell me which ones look wrong and why, without rewriting them for me.`) }, "Review my whole worksheet") : null,
        downloads ? dl : h("span", { class: "muted" }, "PDF download works when this page is open in Claude."), dlNote),
      h("p", { class: "muted", style: "margin:0;font-size:.88rem" }, "Then upload the PDF (or copy your answers) to the assignment in Canvas.")));
}

function worksheetPdf(w) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const M = 54, W = 612 - M * 2;
  let y = M;
  const need = (hgt) => { if (y + hgt > 792 - M) { doc.addPage(); y = M; } };
  const text = (t, size = 11, style = "normal", gap = 4) => {
    doc.setFont("helvetica", style); doc.setFontSize(size);
    for (const line of doc.splitTextToSize(String(t), W)) { need(size + gap); doc.text(line, M, y + size); y += size + gap; }
  };
  text(w.title, 18, "bold", 6);
  if (w.assignment) text(`Assignment: ${w.assignment}`, 10, "normal");
  y += 8;
  if (w.instructions) { text(w.instructions, 10, "italic"); y += 8; }
  for (const sec of w.sections) {
    if (sec.heading) { y += 6; text(sec.heading, 13, "bold", 6); }
    for (const f of sec.fields) {
      y += 4;
      text(f.label, 11, "bold");
      if (f.type === "journal") {
        const colW = [70, W - 70 - 160, 80, 80];
        const rows = (w.answers[f.id] || []).filter((r) => r?.some((c) => String(c || "").trim()));
        const drawRow = (cells, bold) => {
          need(18); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(10);
          let x = M;
          cells.forEach((c, i) => { doc.rect(x, y, colW[i], 18); doc.text(doc.splitTextToSize(String(c || ""), colW[i] - 8)[0] || "", i > 1 ? x + colW[i] - 4 : x + 4, y + 13, { align: i > 1 ? "right" : "left" }); x += colW[i]; });
          y += 18;
        };
        drawRow(JOURNAL_COLS, true);
        (rows.length ? rows : [["", "", "", ""]]).forEach((r) => drawRow(r, false));
        y += 6;
      } else {
        text(answerText(f, w.answers[f.id]) || "(blank)", 11, "normal");
      }
    }
  }
  return doc.output("blob");
}

/* ---------- practice tests for upcoming quizzes ---------- */
function classMaterial(courseKey, limit = 30000) {
  const parts = [];
  for (const l of LESSONS[courseKey] || []) parts.push(`Lesson: ${l.title}. ${l.blocks.find((b) => b.type === "objectives")?.text || ""}`);
  for (const l of state.lessons.filter((x) => x.courseKey === courseKey)) parts.push(`Lesson: ${l.data.title}. ${l.data.objectives} Key points: ${(l.data.keyPoints || []).join("; ")}`);
  for (const r of state.inbox.filter((x) => x.courseKey === courseKey)) parts.push(`Reading notes: ${r.title}\n${r.text}`);
  return parts.join("\n\n").slice(0, limit);
}

function practiceTestView(d) {
  const course = courseOf(state.course);
  const status = h("div");
  const stage = h("div");
  const start = async () => {
    const ctl = new AbortController();
    stage.replaceChildren(h("div", { class: "working" }, h("div", { class: "spinner" }), h("b", {}, `Writing a practice test for “${d.title}”…`),
      h("p", { class: "muted" }, "Usually 30–90 seconds."), h("button", { class: "btn quiet small", onclick: () => ctl.abort() }, "Stop")));
    const prompt = [
      `You are ${course.tutor}. Write a PRACTICE TEST to get a student ready for an upcoming quiz. You have not seen the real quiz; write your own original questions from the topics and course material below.`,
      `Quiz: ${d.title}, due ${new Date(d.due).toLocaleString()}.`,
      d.covers ? `The quiz page says it covers: ${d.covers}` : "",
      d.description ? `Quiz details: ${d.description}` : "",
      "Write 10-15 multiple-choice questions that mix recall, application, and 'which is NOT' style questions, from easier to harder, each with a hint and an explanation of the reasoning.",
      difficultyNote(state.course),
      state.course === "accounting" ? "Also include 3 debitCredit transactions (debits equal credits)." : "",
      state.course === "sql" ? `Also include 3 sqlExercises that run in SQLite on:\n${PRACTICE.schema}` : "",
      "objectives: one paragraph on what this quiz most likely tests and how to study for it. keyPoints: a last-minute review sheet of the must-know facts.",
      LESSON_SHAPE.replace('"explanation": string}', '"hint": string, "explanation": string}'),
      `--- COURSE MATERIAL ---\n${classMaterial(state.course) || "(No readings imported yet: base it on the quiz topics.)"}`,
    ].filter(Boolean).join("\n\n");
    try {
      const data = await sample.json(prompt, { signal: ctl.signal, cache: false });
      if (!data?.quiz?.length) throw { code: "invalid_json" };
      data.title = `Practice test: ${d.title}`;
      const rec = { id: "g-" + uid(), courseKey: state.course, title: data.title, source: "practice test", createdAt: new Date().toISOString(), data };
      state.lessons.push(rec);
      saveLessons();
      go("class", state.course, rec.id);
    } catch (e) {
      stage.replaceChildren(wrap);
      status.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e)));
    }
  };
  const wrap = h("div", { class: "lesson" },
    h("span", { class: "eyebrow" }, `${course.title} · quiz`),
    h("h1", {}, d.title),
    h("p", { class: "muted", style: "margin:0" }, `Due ${new Date(d.due).toLocaleString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`),
    d.covers || d.description ? h("section", { class: "block objectives" }, h("span", { class: "eyebrow" }, "From the quiz page"), d.covers ? h("p", {}, `Covers: ${d.covers}`) : null, d.description ? h("p", { class: "muted" }, d.description) : null) : null,
    h("section", { class: "block" },
      h("h2", {}, "Get ready"),
      h("p", { style: "margin:0" }, "Claude writes an original practice test from what this quiz covers and your class readings, with hints, explanations, and a review sheet. Your mistakes feed into “Practice what I missed.”"),
      status,
      h("div", { class: "row" }, sample ? h("button", { class: "btn", onclick: start }, "Make my practice test") : h("span", { class: "muted" }, "Open this page in Claude to make practice tests."),
        d.url ? h("a", { href: d.url, target: "_blank", rel: "noopener" }, "Quiz in Canvas ↗") : null)));
  stage.append(wrap);
  return stage;
}

/* ---------- learning stats ---------- */
function statsFor(from, to, courseKey) {
  const t = { q: 0, right: 0, first: 0, firstRight: 0, secs: 0, done: 0, practice: 0 };
  for (let d = new Date(from); d < to; d.setDate(d.getDate() + 1)) {
    const day = state.stats.days[dayKey(d)] || {};
    for (const [k, rec] of Object.entries(day)) {
      if (courseKey && k !== courseKey) continue;
      for (const f in t) t[f] += rec[f] || 0;
    }
  }
  return t;
}
const startOfDay = (offset = 0) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + offset); return d; };
const pct = (t) => (t.first ? Math.round((t.firstRight / t.first) * 100) : null);
const fmtTime = (secs) => (secs < 3600 ? `${Math.round(secs / 60)}m` : `${Math.floor(secs / 3600)}h ${Math.round((secs % 3600) / 60)}m`);

function delta(now, before, unit, fmt = (v) => v) {
  if (before == null || now == null) return h("span", { class: "delta flat" }, "no data last week");
  const d = now - before;
  if (!d) return h("span", { class: "delta flat" }, "same as last week");
  return h("span", { class: `delta ${d > 0 ? "up" : "down"}` }, `${d > 0 ? "▲" : "▼"} ${fmt(Math.abs(d))}${unit} vs last week`);
}

function streak() {
  let n = 0;
  const d = startOfDay();
  if (!state.stats.days[dayKey(d)]) d.setDate(d.getDate() - 1); // today not started yet
  while (Object.values(state.stats.days[dayKey(d)] || {}).some((r) => r.q || r.secs >= 60)) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// Chart colors per class (checked for color-blind separation in light and dark).
const SERIES = [
  { key: "accounting", title: "Accounting", color: "#c9357a" },
  { key: "sql", title: "SQL", color: "#22a6ae" },
  { key: "language-arts", title: "Language Arts", color: "#5f6ce0" },
  { key: "biology", title: "Biology", color: "#42a366" },
  { key: "explore", title: "Explore", color: "#a8660c" },
];
const svgEl = (svg, tag, attrs) => { const n = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) n.setAttribute(k, attrs[k]); svg.append(n); return n; };

function statsPanel() {
  const now = new Date(Date.now() + 1);
  const wk = statsFor(startOfDay(-6), now), prev = statsFor(startOfDay(-13), startOfDay(-6));
  const hasAny = Object.keys(state.stats.days).length > 0;
  const tile = (label, value, d) => h("div", { class: "tile" }, h("span", { class: "tile-label" }, label), h("span", { class: "tile-value" }, value), d);
  const s = streak();
  return h("section", { class: "panel stats", "aria-labelledby": "stats-h" },
    h("div", { class: "panel-head" }, h("h2", { id: "stats-h" }, "Your learning"), h("span", { class: "muted" }, s ? `🔥 ${s}-day streak` : "Last 7 days")),
    !hasAny ? h("p", { class: "note", style: "margin:0" }, "Open a lesson and answer a few questions. Your study time, accuracy, and improvement show up here.") : null,
    h("div", { class: "tiles" },
      tile("Study time", fmtTime(wk.secs), delta(wk.secs ? Math.round(wk.secs / 60) : 0, prev.secs || prev.q ? Math.round(prev.secs / 60) : null, " min")),
      tile("Questions answered", String(wk.q), delta(wk.q, prev.q || prev.secs ? prev.q : null, "")),
      tile("Right on first try", pct(wk) == null ? "–" : `${pct(wk)}%`, delta(pct(wk), pct(prev), " pts")),
      tile("Lessons completed", String(wk.done), h("span", { class: "delta flat" }, `${wk.practice} practice set${wk.practice === 1 ? "" : "s"}`))),
    dailyChart(),
    h("h3", { class: "eyebrow", style: "margin:.5rem 0 0" }, "By class"),
    h("div", { class: "class-stats" }, [...COURSES.map((c) => classStatCard(c)), exploreStatCard()]));
}

// Minutes per day for the last 14 days, stacked by class.
function dailyChart() {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = startOfDay(i - 13), e = startOfDay(i - 12);
    return { d, parts: SERIES.map((sr) => statsFor(d, e, sr.key).secs / 60), q: statsFor(d, e).q };
  });
  const totalMax = Math.max(30, ...days.map((x) => x.parts.reduce((a, b) => a + b, 0)));
  const niceMax = Math.ceil(totalMax / 15) * 15;
  const Wd = 860, Ht = 190, padL = 34, padB = 22, padT = 8, bw = (Wd - padL) / 14;
  const y = (m) => padT + (Ht - padT - padB) * (1 - m / niceMax);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${Wd} ${Ht}`);
  svg.setAttribute("class", "chart");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Minutes studied per day for each class, last 14 days. Totals by class are in the cards below.");
  for (const m of [0, niceMax / 3, (niceMax * 2) / 3, niceMax]) {
    svgEl(svg, "line", { x1: padL, x2: Wd, y1: y(m), y2: y(m), class: m ? "grid" : "axis" });
    svgEl(svg, "text", { x: padL - 6, y: y(m) + 4, class: "tick", "text-anchor": "end" }).textContent = Math.round(m);
  }
  const tip = h("div", { class: "tip", hidden: true, role: "status" });
  days.forEach((x, i) => {
    const bx = padL + i * bw + 3, w = bw - 6;
    let acc = 0;
    const segs = x.parts.map((m, k) => ({ m, k })).filter((sg) => sg.m > 0);
    segs.forEach((sg, j) => {
      const top = y(acc + sg.m), bottom = y(acc);
      acc += sg.m;
      const hgt = Math.max(0, bottom - top - (j ? 2 : 0)); // 2px surface gap between classes
      if (hgt <= 0) return;
      const yTop = bottom - (j ? 2 : 0) - hgt;
      const isTop = j === segs.length - 1, r = isTop ? Math.min(4, w / 2, hgt) : 0;
      svgEl(svg, "path", { fill: SERIES[sg.k].color, d: `M${bx},${yTop + hgt} V${yTop + r} Q${bx},${yTop} ${bx + r},${yTop} H${bx + w - r} Q${bx + w},${yTop} ${bx + w},${yTop + r} V${yTop + hgt} Z` });
    });
    if (i % 2 === 1 || i === 13) svgEl(svg, "text", { x: bx + w / 2, y: Ht - 6, class: "tick", "text-anchor": "middle" }).textContent = i === 13 ? "Today" : x.d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    const hit = svgEl(svg, "rect", { x: padL + i * bw, y: padT, width: bw, height: Ht - padT - padB, class: "hit", tabindex: 0 });
    const show = () => {
      const list = SERIES.map((sr, k) => [sr, x.parts[k]]).filter(([, m]) => m >= 0.25);
      tip.hidden = false;
      tip.replaceChildren(h("b", {}, x.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })),
        list.length ? h("div", {}, list.map(([sr, m]) => h("div", { class: "tip-row" }, h("span", { class: "sw", style: `background:${sr.color}` }), `${sr.title}: ${fmtTime(m * 60)}`))) : h("div", {}, "No study time"));
      const frac = (padL + i * bw + bw / 2) / Wd;
      tip.style.left = `${frac * 100}%`;
      tip.style.transform = `translateX(${frac > 0.7 ? -100 : frac < 0.3 ? 0 : -50}%)`;
    };
    hit.addEventListener("pointerenter", show); hit.addEventListener("focus", show);
    hit.addEventListener("pointerleave", () => (tip.hidden = true)); hit.addEventListener("blur", () => (tip.hidden = true));
  });
  return h("div", { class: "chart-wrap" },
    h("div", { class: "panel-head" }, h("span", { class: "tile-label" }, "Minutes studied per day, by class"),
      h("div", { class: "legend" }, SERIES.map((sr) => h("span", {}, h("span", { class: "sw", style: `background:${sr.color}` }), sr.title)))),
    svg, tip);
}

// Lessons in a class, with how well she did on each (first try).
function classTopics(key) {
  return Object.entries(state.progress).filter(([k, p]) => p.courseKey === key && k.startsWith(key + ":")).map(([k, p]) => {
    const v = Object.values(p.firstTry || {});
    const pctRight = v.length ? v.filter(Boolean).length / v.length : null;
    const status = p.done && pctRight != null && pctRight >= 0.8 ? "mastered" : p.done ? "done" : v.length ? "working" : null;
    return { title: p.title || k, pct: pctRight, status, missed: p.missed || [] };
  }).filter((t) => t.status);
}

function sparkline(values, color) {
  const pts = values.map((v, i) => [i, v]).filter(([, v]) => v != null);
  if (pts.length < 2) return null;
  const W = 110, H = 34, px = (i) => 4 + (i / (values.length - 1)) * (W - 8), py = (v) => 4 + (1 - v / 100) * (H - 8);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("class", "spark"); svg.setAttribute("aria-hidden", "true");
  svgEl(svg, "line", { x1: 4, x2: W - 4, y1: py(80), y2: py(80), class: "grid" });
  svgEl(svg, "polyline", { points: pts.map(([i, v]) => `${px(i)},${py(v)}`).join(" "), fill: "none", stroke: color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" });
  const [li, lv] = pts.at(-1);
  svgEl(svg, "circle", { cx: px(li), cy: py(lv), r: 3.5, fill: color, stroke: "var(--surface)", "stroke-width": 1.5 });
  return svg;
}

function classStatCard(c) {
  const color = SERIES.find((x) => x.key === c.key)?.color;
  const now = new Date(Date.now() + 1);
  const today = statsFor(startOfDay(0), now, c.key), wk = statsFor(startOfDay(-6), now, c.key), prev = statsFor(startOfDay(-13), startOfDay(-6), c.key);
  const weeks = [3, 2, 1, 0].map((i) => pct(statsFor(startOfDay(-7 * i - 6), startOfDay(-7 * i + 1), c.key)));
  const lvl = courseLevel(c.key);
  const topics = classTopics(c.key);
  const mastered = topics.filter((t) => t.status === "mastered"), working = topics.filter((t) => t.status !== "mastered");
  const review = topics.flatMap((t) => t.missed.map((m) => m.concept)).slice(-3);
  const levelChip = lvl.n >= 8 ? h("span", { class: `chip lvl-${lvl.level}` }, { mastering: "Mastering 🔥", steady: "Steady", building: "Building up" }[lvl.level]) : null;
  return h("article", { class: "cstat", style: `--c:${color}` },
    h("div", { class: "row", style: "justify-content:space-between" }, h("b", {}, c.title), levelChip),
    h("div", { class: "cstat-nums" },
      h("div", {}, h("span", { class: "tile-label" }, "Today"), h("b", {}, today.secs ? fmtTime(today.secs) : "–")),
      h("div", {}, h("span", { class: "tile-label" }, "This week"), h("b", {}, wk.secs ? fmtTime(wk.secs) : "–")),
      h("div", {}, h("span", { class: "tile-label" }, "Right on 1st try"), h("b", {}, wk.first ? `${wk.firstRight} of ${wk.first}` : "–"), wk.first ? h("small", {}, `${pct(wk)}%`) : null)),
    h("div", { class: "row", style: "justify-content:space-between;align-items:center" },
      h("div", {}, h("span", { class: "tile-label" }, "Improving?"), h("div", {}, delta(pct(wk), pct(prev), " pts"))),
      sparkline(weeks, color)),
    mastered.length ? h("div", {}, h("span", { class: "tile-label" }, "✓ Mastered"), h("div", { class: "chips" }, mastered.map((t) => h("span", { class: "chip done" }, t.title)))) : null,
    working.length ? h("div", {}, h("span", { class: "tile-label" }, "Working on"), h("div", { class: "chips" }, working.slice(0, 4).map((t) => h("span", { class: "chip" }, t.pct != null ? `${t.title} · ${Math.round(t.pct * 100)}%` : t.title)))) : null,
    review.length ? h("div", {}, h("span", { class: "tile-label" }, "Review next"), h("ul", { class: "xlist shaky" }, review.map((r) => h("li", {}, r)))) : null,
    !topics.length && !wk.secs ? h("p", { class: "muted", style: "margin:0;font-size:.85rem" }, "No practice yet this week.") : null);
}

function exploreStatCard() {
  const color = SERIES.find((x) => x.key === "explore").color;
  const wk = statsFor(startOfDay(-6), new Date(Date.now() + 1), "explore");
  const topics = [...state.explore.topics].sort((a, b) => (b.mastered || 0) - (a.mastered || 0));
  return h("article", { class: "cstat", style: `--c:${color}` },
    h("b", {}, "Explore"),
    h("div", { class: "cstat-nums" },
      h("div", {}, h("span", { class: "tile-label" }, "This week"), h("b", {}, wk.secs ? fmtTime(wk.secs) : "–")),
      h("div", {}, h("span", { class: "tile-label" }, "Topics"), h("b", {}, String(topics.length))),
      h("div", {}, h("span", { class: "tile-label" }, "Right on 1st try"), h("b", {}, wk.first ? `${wk.firstRight} of ${wk.first}` : "–"))),
    topics.length ? h("div", {}, h("span", { class: "tile-label" }, "Concepts mastered"),
      h("ul", { class: "xlist good" }, topics.slice(0, 4).map((t) => h("li", {}, `${t.name}: ${t.mastered || 0} (${t.level || "new"})`)))) : h("p", { class: "muted", style: "margin:0;font-size:.85rem" }, "Start a topic in Explore."));
}

/* ---------- scholarships ---------- */
// Claude in Chrome reads the scholarship portal (read-only); Study Hub ranks fit, tracks
// deadlines, and helps write answers from the student's own story. The student submits.
const SCHOLARSHIP_PROMPT = `I'm a Utah Tech University student. Please look through my scholarship options. Only read. Don't click Apply, Submit, Save, or Accept, don't fill in any forms, and don't change anything.

1. Open Utah Tech's scholarship portal, Scholarship Universe: https://utahtech.scholarshipuniverse.com/student/dashboard (I'm already logged in). Look at my matched scholarships and any other open opportunities there.
2. Start with the scholarships it says I match or am eligible for, then other open ones. Include outside scholarships the school lists if they look like a fit for a college student in Utah.
3. For each scholarship with a deadline in the next 90 days, collect: its name, award amount, deadline, link, who is eligible (major, year, GPA, residency, need, etc.), what it requires (essays, letters, transcripts), every question or essay prompt word for word with any word limit, and whether I've already started or submitted it.

When you're finished, reply with ONLY one JSON code block in exactly this shape:
{
  "studyhub_scholarships": 1,
  "scholarships": [
    { "name": "...", "amount": "...", "deadline": "ISO 8601 with offset, like 2026-10-15T23:59:00-06:00", "url": "...",
      "eligibility": "...", "requirements": ["..."], "questions": [{ "prompt": "exact wording", "limit": "e.g. 500 words, or empty" }],
      "status": "not started" | "started" | "submitted" }
  ]
}`;

const PROFILE_FIELDS = [
  ["major", "Major and minor", "e.g. Accounting, minor in Information Systems"],
  ["year", "Year in school and expected graduation", "e.g. Sophomore, graduating May 2028"],
  ["gpa", "GPA (optional)", ""],
  ["from", "Where you're from", "e.g. St. George, Utah"],
  ["activities", "Clubs, activities, leadership", ""],
  ["work", "Jobs and work experience", ""],
  ["service", "Volunteer or community service", ""],
  ["goals", "Career goals and why", ""],
  ["challenges", "Challenges you've overcome", "Only what you're comfortable sharing"],
  ["need", "Financial situation (optional)", "e.g. first-generation student, working to pay tuition"],
  ["other", "Anything else that makes you, you", "Hobbies, family, what you care about"],
];

const STATUSES = [["new", "Not started"], ["drafting", "Drafting"], ["ready", "Ready to submit"], ["submitted", "Submitted ✓"], ["skip", "Skipping"]];
let schTimer;
const saveScholarships = () => { clearTimeout(schTimer); schTimer = setTimeout(() => store.set("scholarships", { items: state.scholarships }), 600); };
const saveProfile = () => store.set("profile", state.profile);

function syncScholarshipDeadlines() {
  state.deadlines = state.deadlines.filter((d) => d.kind !== "scholarship");
  for (const s of state.scholarships) {
    if (!s.deadline || ["submitted", "skip"].includes(s.status)) continue;
    state.deadlines.push({ id: "sch-" + s.id, kind: "scholarship", scholarshipId: s.id, title: `💰 ${s.name}`, due: s.deadline, courseKey: null, courseLabel: "Scholarship", url: s.url || "" });
  }
  state.deadlines.sort((a, b) => new Date(a.due) - new Date(b.due));
  saveDeadlines();
}

const PASTED_PROMPT = "That's the prompt itself, not Claude's answer. Paste the prompt into the Claude extension in Chrome (with Scholarship Universe open), wait for Claude to finish, then copy Claude's reply and paste that here.";
function importScholarships(text) {
  if (/"not started" \| "started"|ISO 8601 with offset/.test(text)) throw new Error(PASTED_PROMPT);
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("I couldn't find the scholarship data. Paste Claude's whole reply, including the { } block.");
  let pack;
  try { pack = JSON.parse(text.slice(start, end + 1)); } catch { throw new Error("That reply got cut off. Ask Claude in Chrome: “Please send the full JSON again.”"); }
  if (!Array.isArray(pack.scholarships)) throw new Error("That doesn't look like the scholarship reply. Use the Copy the scholarship prompt button.");
  let added = 0, updated = 0;
  for (const s of pack.scholarships) {
    if (!s?.name) continue;
    const due = new Date(s.deadline);
    const rec = {
      name: String(s.name).slice(0, 200), amount: String(s.amount || ""), deadline: isNaN(due) ? null : due.toISOString(), url: String(s.url || ""),
      eligibility: String(s.eligibility || "").slice(0, 3000), requirements: (s.requirements || []).map(String).slice(0, 20),
      questions: (s.questions || []).filter((q) => q?.prompt).map((q) => ({ prompt: String(q.prompt).slice(0, 2000), limit: String(q.limit || "") })).slice(0, 10),
    };
    const old = state.scholarships.find((x) => x.name.toLowerCase() === rec.name.toLowerCase());
    if (old) { Object.assign(old, rec); if (/submitted/i.test(s.status)) old.status = "submitted"; updated++; }
    else { state.scholarships.push({ id: uid(), status: /submitted/i.test(s.status) ? "submitted" : /^\s*started/i.test(s.status || "") ? "drafting" : "new", drafts: {}, interview: {}, ...rec }); added++; }
  }
  saveScholarships();
  syncScholarshipDeadlines();
  return { added, updated };
}

const profileText = () => PROFILE_FIELDS.map(([k, label]) => state.profile[k] ? `${label}: ${state.profile[k]}` : "").filter(Boolean).join("\n") || "(The student hasn't filled in their profile yet.)";
const words = (t) => (t.trim().match(/\S+/g) || []).length;

async function rankScholarships(statusEl, { rerender = true } = {}) {
  const open = state.scholarships.filter((s) => !["submitted", "skip"].includes(s.status));
  if (!open.length) return;
  statusEl.replaceChildren(h("p", { class: "note" }, "Claude is comparing each scholarship to your profile…"));
  const prompt = `A college student at Utah Tech wants to know which scholarships to apply for. Judge each one ONLY against the eligibility rules and the student's profile below. Don't assume facts the profile doesn't state; if eligibility depends on something unknown, say what to check.

Student profile:
${profileText()}

Scholarships:
${open.map((s, i) => `${i}. ${s.name} (${s.amount || "amount not listed"}, due ${s.deadline ? new Date(s.deadline).toDateString() : "unknown"}). Eligibility: ${s.eligibility || "not listed"}. Requires: ${s.requirements.join("; ") || "not listed"}.`).join("\n")}

Reply with ONLY a JSON array, one object per scholarship in the same order: [{"index": number, "fit": "strong" | "possible" | "unlikely", "why": "one short sentence", "effort": "low" | "medium" | "high"}]`;
  try {
    const res = await sample.json(prompt, { modelTier: "default", cache: false });
    for (const r of Array.isArray(res) ? res : []) {
      const s = open[Number(r.index)];
      if (s && ["strong", "possible", "unlikely"].includes(r.fit)) s.fit = { level: r.fit, why: String(r.why || ""), effort: String(r.effort || "") };
    }
    saveScholarships();
    if (rerender) render();
    return true;
  } catch (e) { statusEl.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e))); return false; }
}

// Drafts every unanswered question for the scholarships that fit, one at a time.
async function prepareAll(statusEl) {
  if (!sample) return;
  const ctl = new AbortController();
  const stop = h("button", { class: "btn quiet small", onclick: () => ctl.abort() }, "Stop");
  const line = h("span", {});
  statusEl.replaceChildren(h("div", { class: "note row" }, h("div", { class: "spinner", style: "width:20px;height:20px;border-width:3px;margin:0" }), line, stop));
  const filled = PROFILE_FIELDS.filter(([k]) => state.profile[k]).length;
  if (filled < 4) { statusEl.replaceChildren(h("p", { class: "note bad" }, "Fill in at least 4 of the About-you boxes first. Your drafts are built from them.")); return; }
  const open = state.scholarships.filter((s) => !["submitted", "skip"].includes(s.status));
  if (open.some((s) => !s.fit)) { line.textContent = "Checking which scholarships fit you…"; await rankScholarships(statusEl, { rerender: false }); statusEl.replaceChildren(h("div", { class: "note row" }, h("div", { class: "spinner", style: "width:20px;height:20px;border-width:3px;margin:0" }), line, stop)); }
  const targets = open.filter((s) => s.fit?.level !== "unlikely");
  const jobs = targets.flatMap((s) => s.questions.map((q, i) => ({ s, q, i })).filter(({ s, i }) => !(s.drafts[String(i)] || "").trim()));
  let done = 0;
  for (const { s, q, i } of jobs) {
    if (ctl.signal.aborted) break;
    line.textContent = `Drafting ${done + 1} of ${jobs.length}: ${s.name}, question ${i + 1}…`;
    try {
      const { text } = await sample(`Draft a scholarship answer for a college student, in first person and in their own plain, genuine voice (not flowery), using ONLY facts from their profile below. Never invent experiences, numbers, names, or awards. Where a specific detail would make it stronger but isn't in the profile, put a bracketed note like [add: a specific example of when you did this]. Stay under the word limit (if none is given, aim for 250-350 words). Reply with only the answer text.

Scholarship: ${s.name}. Who it's for: ${s.eligibility || "n/a"}
Prompt: "${q.prompt}" ${q.limit ? `(limit: ${q.limit})` : ""}

Profile:
${profileText()}`, { cache: false, signal: ctl.signal });
      s.drafts[String(i)] = text.trim();
      if (s.status === "new") s.status = "drafting";
      saveScholarships();
      done++;
    } catch (e) {
      if (e?.code === "cancelled") break;
      statusEl.replaceChildren(h("p", { class: "note bad" }, `${sampleErrorText(e)} ${done} draft${done === 1 ? "" : "s"} finished before this. Press Prepare again to continue.`));
      return render();
    }
  }
  render();
  const msg = document.querySelector(".rank-status");
  msg?.replaceChildren(h("p", { class: "note good" }, jobs.length
    ? `Drafted ${done} answer${done === 1 ? "" : "s"} across ${targets.length} scholarship${targets.length === 1 ? "" : "s"}. Open each one, read it, fill in every [add: …], then download its packet and apply.`
    : "Every question for your matching scholarships already has a draft. Open each one to review."));
}

// A review packet: link, deadline, checklist, and every question with its answer.
function scholarshipPdf(list) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const M = 54, W = 612 - M * 2;
  let y = M;
  const need = (hgt) => { if (y + hgt > 792 - M) { doc.addPage(); y = M; } };
  const text = (t, size = 11, style = "normal", gap = 4, color = [20, 30, 30]) => {
    doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
    for (const line of doc.splitTextToSize(String(t), W)) { need(size + gap); doc.text(line, M, y + size); y += size + gap; }
  };
  list.forEach((s, n) => {
    if (n) { doc.addPage(); y = M; }
    text(s.name, 18, "bold", 6);
    text([s.amount, s.deadline ? `Due ${new Date(s.deadline).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""].filter(Boolean).join("  ·  "), 11, "normal");
    const link = s.url || "https://utahtech.scholarshipuniverse.com/student/dashboard";
    need(18); doc.setFontSize(11); doc.setTextColor(10, 124, 132); doc.textWithLink(`Apply here: ${link}`.slice(0, 95), M, y + 11, { url: link }); y += 18;
    if (s.eligibility) { y += 4; text("Who can apply", 11, "bold"); text(s.eligibility, 10); }
    if (s.requirements.length) { y += 4; text("Checklist", 11, "bold"); s.requirements.forEach((r) => text(`[  ] ${r}`, 10)); }
    s.questions.forEach((q, i) => {
      y += 10;
      text(`Question ${i + 1}${q.limit ? ` (${q.limit})` : ""}`, 12, "bold", 5);
      text(q.prompt, 10, "italic", 4, [80, 90, 90]);
      y += 4;
      const ans = (s.drafts[String(i)] || "").trim();
      text(ans || "(no answer yet)", 11, "normal", 5);
      const gaps = (ans.match(/\[add:[^\]]*\]/gi) || []).length;
      if (gaps) text(`NOTE: ${gaps} spot${gaps === 1 ? "" : "s"} marked [add: …]${gaps === 1 ? " still needs" : " still need"} your details.`, 10, "bold", 4, [179, 38, 30]);
    });
  });
  return doc.output("blob");
}

async function downloadPacket(list, name) {
  if (!downloads) return;
  try { await downloads.save({ filename: name, data: scholarshipPdf(list) }); } catch (e) { if (e?.code !== "declined") alertScholarship("Couldn't save the PDF here. Try again in the Claude app or on claude.ai."); }
}
const alertScholarship = (t) => document.querySelector(".rank-status")?.replaceChildren(h("p", { class: "note bad" }, t));

function scholarshipsView() {
  const status = h("div");
  const box = h("textarea", { id: "sch-pack", rows: 3, placeholder: "Paste Claude in Chrome's scholarship reply here…" });
  const copy = h("button", { class: "btn small", onclick: async () => {
    try { await navigator.clipboard.writeText(SCHOLARSHIP_PROMPT); copy.textContent = "Copied ✓"; } catch { pbox.hidden = false; pbox.select(); copy.textContent = "Select the text below and copy it"; }
  } }, "Copy the scholarship prompt");
  const pbox = h("textarea", { id: "sch-prompt", rows: 5, readonly: true, hidden: true }, SCHOLARSHIP_PROMPT);
  const fitOrder = { strong: 0, possible: 1, undefined: 2, unlikely: 3 };
  const list = [...state.scholarships].sort((a, b) =>
    (["submitted", "skip"].includes(a.status) - ["submitted", "skip"].includes(b.status)) || (fitOrder[a.fit?.level] - fitOrder[b.fit?.level]) || (new Date(a.deadline || 8e15) - new Date(b.deadline || 8e15)));
  const filled = PROFILE_FIELDS.filter(([k]) => state.profile[k]).length;

  return h("main", { class: "home" },
    h("div", { class: "hello" }, h("span", { class: "eyebrow" }, "Scholarships"), h("h1", {}, "Money for school, without the busywork")),
    h("p", { class: "note", style: "margin:0" }, "Study Hub finds and ranks scholarships, tracks deadlines (they show up in Due this week and your reminders), and helps you write answers from your own story. You review, personalize, and click Submit yourself. Applications ask you to certify your answers, and some don't allow AI-written essays, so check each one's rules."),
    h("div", { class: "split even" },
      h("section", { class: "panel" }, h("h2", {}, "1. Find scholarships"),
        h("ol", { class: "steps" }, h("li", {}, "Click ", h("b", {}, "Copy the scholarship prompt"), "."),
          h("li", {}, "In Chrome, open ", h("a", { href: "https://utahtech.scholarshipuniverse.com/student/dashboard", target: "_blank", rel: "noopener" }, "Scholarship Universe"), " (logged in), open the Claude extension, paste the prompt, and send. Claude reads your matches. It won't apply or submit anything."),
          h("li", {}, "Paste its reply here and click Import. Do this every couple of weeks.")),
        h("div", { class: "row" }, copy), pbox, h("label", { for: "sch-pack" }, "Claude in Chrome's reply", box),
        h("div", { class: "row" }, h("button", { class: "btn", onclick: () => {
          try { const r = importScholarships(box.value); status.replaceChildren(h("p", { class: "note good" }, `Added ${r.added} and updated ${r.updated} scholarship${r.added + r.updated === 1 ? "" : "s"}.`)); box.value = ""; setTimeout(render, 900); }
          catch (e) { status.replaceChildren(h("p", { class: "note bad" }, e.message)); }
        } }, "Import")), status),
      profilePanel(filled)),
    h("section", { class: "panel" },
      h("div", { class: "panel-head" }, h("h2", {}, `2. Your scholarships (${state.scholarships.length})`),
        h("div", { class: "row" },
          state.scholarships.length && sample ? h("button", { class: "btn", onclick: (e) => prepareAll(e.currentTarget.closest(".panel").querySelector(".rank-status")) }, "✨ Prepare my applications") : null,
          state.scholarships.length && sample ? h("button", { class: "btn quiet small", onclick: (e) => rankScholarships(e.currentTarget.closest(".panel").querySelector(".rank-status")) }, "Re-rank fit") : null,
          downloads && state.scholarships.some((s) => Object.values(s.drafts || {}).some(Boolean)) ? h("button", { class: "btn quiet small", onclick: () => downloadPacket(state.scholarships.filter((s) => !["submitted", "skip"].includes(s.status) && Object.values(s.drafts || {}).some(Boolean)), "Scholarship applications.pdf") }, "Download all (PDF)") : null)),
      state.scholarships.length ? h("p", { class: "muted", style: "margin:0;font-size:.9rem" }, "✨ Prepare checks your fit, then drafts every question for the scholarships that match, using your About-you info. Then open each one, review and personalize it, download its packet, and apply with the link.") : null,
      h("div", { class: "rank-status" }),
      list.length ? list.map(scholarshipCard) : h("p", { class: "muted", style: "margin:0" }, "Nothing here yet. Import from the scholarship portal above.")));
}

function profilePanel(filled) {
  const body = h("div", { class: "profile-fields", hidden: filled >= 5 });
  const saved = h("span", { class: "save-state", role: "status" }, filled ? "✓ Saved to your account" : "");
  const count = h("span", { class: "muted" }, `${filled} of ${PROFILE_FIELDS.length} filled`);
  let timer;
  const saveNow = async () => {
    clearTimeout(timer);
    body.querySelectorAll("input, textarea").forEach((el) => (state.profile[el.id.slice(3)] = el.value.trim()));
    saved.textContent = "Saving…";
    await saveProfile();
    saved.textContent = `✓ Saved ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    count.textContent = `${PROFILE_FIELDS.filter(([k]) => state.profile[k]).length} of ${PROFILE_FIELDS.length} filled`;
  };
  for (const [k, label, ph] of PROFILE_FIELDS) {
    const id = "pf-" + k;
    const input = ["gpa", "year", "from", "major"].includes(k) ? h("input", { id, value: state.profile[k] || "", placeholder: ph }) : h("textarea", { id, rows: 2, placeholder: ph }, state.profile[k] || "");
    // Saves on its own a moment after you stop typing, and again when you leave the box.
    input.addEventListener("input", () => { saved.textContent = "Unsaved changes…"; clearTimeout(timer); timer = setTimeout(saveNow, 1200); });
    input.addEventListener("change", saveNow);
    body.append(h("label", { for: id }, label, input));
  }
  body.append(h("div", { class: "row" }, h("button", { class: "btn small", onclick: saveNow }, "Save"), saved));
  return h("section", { class: "panel" },
    h("div", { class: "panel-head" }, h("h2", {}, "About you"), count),
    h("p", { class: "muted", style: "margin:0" }, "Fill this in once. It's how Claude judges your fit and drafts answers that are true to you. It saves by itself as you type, privately to your account."),
    body.hidden ? h("div", { class: "row" }, h("button", { class: "btn quiet small", onclick: (e) => { body.hidden = false; e.currentTarget.parentElement.remove(); } }, "Edit my profile"), saved) : null,
    body);
}

function scholarshipCard(s) {
  const fitChip = s.fit ? h("span", { class: `chip fit-${s.fit.level}` }, { strong: "Strong fit", possible: "Possible fit", unlikely: "Unlikely fit" }[s.fit.level]) : null;
  const statusSel = h("select", { id: "st-" + s.id, "aria-label": `Status for ${s.name}` }, STATUSES.map(([v, t]) => h("option", { value: v, selected: s.status === v }, t)));
  statusSel.addEventListener("change", () => { s.status = statusSel.value; saveScholarships(); syncScholarshipDeadlines(); render(); });
  const open = state.lessonId === s.id;
  return h("details", { class: `sch ${["submitted", "skip"].includes(s.status) ? "sch-done" : ""}`, open, id: "sch-" + s.id, ontoggle: (e) => { if (e.currentTarget.open) state.lessonId = s.id; } },
    h("summary", {},
      h("div", { class: "sch-main" }, h("b", {}, s.name), h("div", { class: "row" }, s.amount ? h("span", { class: "chip" }, s.amount) : null, fitChip,
        s.deadline ? h("span", { class: "muted", style: "font-size:.85rem" }, `Due ${new Date(s.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`) : null, s.deadline ? dueChip(s.deadline) : null)),
      h("div", { class: "row", style: "justify-content:flex-end" },
        (() => { const gaps = Object.values(s.drafts || {}).join(" ").match(/\[add:[^\]]*\]/gi)?.length || 0; return gaps ? h("span", { class: "chip soon" }, `${gaps} to fill in`) : null; })(),
        h("span", { class: "chip" }, STATUSES.find(([v]) => v === s.status)?.[1]))),
    h("div", { class: "sch-body" },
      s.fit?.why ? h("p", { style: "margin:0" }, h("b", {}, "Fit: "), s.fit.why, s.fit.effort ? ` Effort: ${s.fit.effort}.` : "") : null,
      s.eligibility ? h("p", { style: "margin:0" }, h("b", {}, "Who can apply: "), s.eligibility) : null,
      s.requirements.length ? h("div", {}, h("b", {}, "You'll need"), h("ul", { class: "points" }, s.requirements.map((r) => h("li", {}, r)))) : null,
      s.questions.map((q, i) => answerBox(s, q, i)),
      h("div", { class: "row" }, h("label", { for: "st-" + s.id, style: "display:flex;gap:.5rem;align-items:center" }, "Status", statusSel),
        downloads && Object.values(s.drafts || {}).some(Boolean) ? h("button", { class: "btn quiet small", onclick: () => downloadPacket([s], `${s.name.replace(/[^\w .-]/g, "").trim() || "scholarship"}.pdf`) }, "Download packet (PDF)") : null,
        h("a", { class: "btn small", href: s.url || "https://utahtech.scholarshipuniverse.com/student/dashboard", target: "_blank", rel: "noopener" }, "Apply here ↗"))));
}

function answerBox(s, q, i) {
  const key = String(i);
  const draft = h("textarea", { id: `dr-${s.id}-${i}`, rows: 9, placeholder: "Your answer. Write it here, or get help drafting it below." }, s.drafts[key] || "");
  const count = h("span", { class: "muted", style: "font-size:.85rem" });
  const upd = () => { count.textContent = `${words(draft.value)} words${q.limit ? ` · limit: ${q.limit}` : ""}`; };
  draft.addEventListener("input", () => { s.drafts[key] = draft.value; if (s.status === "new") s.status = "drafting"; upd(); saveScholarships(); });
  upd();
  const helper = h("div", { class: "interview" });
  const busy = (msg) => helper.replaceChildren(h("div", { class: "row" }, h("div", { class: "spinner", style: "width:20px;height:20px;border-width:3px;margin:0" }), h("span", { class: "muted" }, msg)));

  const startInterview = async () => {
    busy("Thinking of questions that will pull out your best story…");
    try {
      const res = await sample.json(`Help a college student answer this scholarship prompt with their OWN true story. Ask 3-4 short, specific questions whose answers would give them the material for a strong answer. Build on what their profile already says instead of asking for it again.

Scholarship: ${s.name}. Eligibility: ${s.eligibility || "n/a"}.
Prompt: "${q.prompt}" ${q.limit ? `(limit: ${q.limit})` : ""}
Profile:
${profileText()}

Reply with ONLY JSON: {"questions": ["...", "..."]}`, { cache: false });
      const qs = (res?.questions || []).map(String).slice(0, 5);
      if (!qs.length) throw { code: "invalid_json" };
      s.interview[key] ||= {};
      helper.replaceChildren(h("p", { style: "margin:0" }, h("b", {}, "Answer in your own words. Short notes are fine.")),
        ...qs.map((qq, j) => {
          const id = `iv-${s.id}-${i}-${j}`;
          const t = h("textarea", { id, rows: 2 }, s.interview[key][qq] || "");
          t.addEventListener("change", () => { s.interview[key][qq] = t.value; saveScholarships(); });
          return h("label", { for: id }, qq, t);
        }),
        h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => writeDraft(qs) }, "Draft it from my answers")));
    } catch (e) { helper.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e))); }
  };

  const writeDraft = async (qs) => {
    const answers = (qs || Object.keys(s.interview[key] || {})).map((qq) => `Q: ${qq}\nA: ${s.interview[key]?.[qq] || "(no answer)"}`).join("\n\n");
    busy("Drafting in your voice from your answers…");
    try {
      const { text } = await sample(`Draft a scholarship answer for a college student, in first person and in their own plain, genuine voice (not flowery), using ONLY facts from their profile and interview answers below. Never invent experiences, numbers, names, or awards. Where a specific detail would make it stronger but wasn't given, put a bracketed note like [add: the name of the club]. Stay under the word limit. Reply with only the answer text.

Scholarship: ${s.name}
Prompt: "${q.prompt}" ${q.limit ? `(limit: ${q.limit})` : ""}

Profile:
${profileText()}

Interview:
${answers}`, { cache: false, onText: ({ text }) => { draft.value = text; upd(); } });
      draft.value = text.trim();
      s.drafts[key] = draft.value;
      if (s.status === "new") s.status = "drafting";
      saveScholarships();
      upd();
      helper.replaceChildren(h("p", { class: "note good", style: "margin:0" }, "Draft ready. Read it out loud, fix anything that doesn't sound like you, and fill in every [add: …] before you submit."));
    } catch (e) { helper.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e))); }
  };

  const feedback = async () => {
    if (!draft.value.trim()) return;
    busy("Reading your answer like a scholarship committee would…");
    try {
      const { text } = await sample(`You're a scholarship committee reader giving a student feedback on their answer. Don't rewrite it. Give 3-5 short, specific bullets: what's strong, what's vague, what's missing for this prompt, and whether it fits the word limit (it has ${words(draft.value)} words). End with the single most important fix.

Prompt: "${q.prompt}" ${q.limit ? `(limit: ${q.limit})` : ""}
Answer:
${draft.value}`, { cache: false });
      helper.replaceChildren(h("div", { class: "note", html: md(text) }));
    } catch (e) { helper.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e))); }
  };

  const copyBtn = h("button", { class: "btn quiet small", onclick: async () => { try { await navigator.clipboard.writeText(draft.value); copyBtn.textContent = "Copied ✓"; } catch { draft.select(); copyBtn.textContent = "Selected: press Ctrl/⌘+C"; } } }, "Copy answer");
  return h("div", { class: "sch-q" },
    h("label", { for: `dr-${s.id}-${i}` }, `Question ${i + 1}: ${q.prompt}`), draft, count,
    h("div", { class: "row" },
      sample ? h("button", { class: "btn small", onclick: startInterview }, s.drafts[key] ? "Start over with questions" : "Help me answer this") : null,
      sample && Object.keys(s.interview[key] || {}).length ? h("button", { class: "btn quiet small", onclick: () => writeDraft() }, "Redraft from my answers") : null,
      sample ? h("button", { class: "btn quiet small", onclick: feedback }, "Get feedback") : null, copyBtn),
    helper);
}

/* ---------- Explore: learn any topic, and keep building on it ---------- */
// Each topic keeps a running "knowledge map" (what you've got, what's shaky, what's next),
// summaries of past sessions, and its lessons. Every visit starts from that map, plus what
// your classes show about how you learn.
state.explore = { topics: [], topic: null, dirty: 0, saving: false, cache: {} };
const topicKey = (id) => "topic-" + id;
let topicTimer;
function saveTopic(t = state.explore.topic) {
  if (!t) return;
  t.updatedAt = new Date().toISOString();
  const idx = state.explore.topics.find((x) => x.id === t.id);
  const meta = { id: t.id, name: t.name, updatedAt: t.updatedAt, level: t.knowledge?.level || "", mastered: t.knowledge?.mastered?.length || 0, sessions: t.sessions.length };
  if (idx) Object.assign(idx, meta); else state.explore.topics.push(meta);
  state.explore.cache[t.id] = t;
  pendingTopic = t;
  clearTimeout(topicTimer);
  topicTimer = setTimeout(flushTopic, 500);
}
let pendingTopic = null;
function flushTopic() {
  clearTimeout(topicTimer);
  const t = pendingTopic;
  pendingTopic = null;
  if (!t) return;
  store.set(topicKey(t.id), t);
  store.set("explore", { topics: state.explore.topics });
}
addEventListener("pagehide", flushTopic);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushTopic(); });
async function openTopic(id) {
  // Reuse the copy already open in this page (it may have unsaved messages); otherwise load it.
  const t = state.explore.cache[id] || (await store.get(topicKey(id))) || null;
  if (t) state.explore.cache[id] = t;
  if (!t) return;
  t.sessions ||= []; t.knowledge ||= {};
  state.explore.topic = t;
  state.explore.dirty = 0;
  const today = dayKey();
  let s = t.sessions.at(-1);
  if (!s || s.day !== today) { s = { id: uid(), day: today, startedAt: new Date().toISOString(), messages: [] }; t.sessions.push(s); t.sessions = t.sessions.slice(-30); }
  go("explore", "explore", null);
  if (!s.messages.length) exploreSend(null, { kickoff: true });
}
async function newTopic(name) {
  name = name.trim().replace(/\s+/g, " ").slice(0, 80);
  if (!name) return;
  const same = state.explore.topics.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (same) return openTopic(same.id);
  const t = { id: uid(), name, createdAt: new Date().toISOString(), knowledge: {}, sessions: [] };
  state.explore.cache[t.id] = t;
  saveTopic(t);
  openTopic(t.id);
}
// Explore: how the last lessons/quizzes on this topic went, so the next one steps up.
function topicRoundNote(t) {
  const results = topicLessons(t).map((l) => state.progress[`explore:${l.id}`]).filter((p) => p?.firstTry && Object.keys(p.firstTry).length);
  const last = results.at(-1);
  const level = t.knowledge?.level || "";
  if (!last) return level ? `Her level on this topic: ${level}.` : "";
  const v = Object.values(last.firstTry), pct = v.filter(Boolean).length / v.length;
  return `On her last ${last.title?.startsWith("Quiz") ? "quiz" : "lesson"} here she got ${Math.round(pct * 100)}% right on the first try (level: ${level || "unknown"}). ` +
    (pct >= 0.8 ? "She's mastering it: make this one clearly harder, with multi-step and applied questions and lighter hints." : pct < 0.5 ? "Keep this one approachable and rebuild the basics she missed." : "Go a notch harder than last time.");
}
const topicLessons = (t) => state.lessons.filter((l) => l.courseKey === "explore" && l.topicId === t.id);

// What Study Hub knows about how she learns, from her classes.
function learnerContext() {
  const lines = [];
  if (state.profile.major || state.profile.year) lines.push(`Student: ${[state.profile.year, state.profile.major].filter(Boolean).join(", ")}. Goals: ${(state.profile.goals || "").slice(0, 300)}`);
  for (const c of COURSES) {
    const mine = Object.entries(state.progress).filter(([k, p]) => p.courseKey === c.key);
    if (!mine.length) continue;
    const done = mine.filter(([, p]) => p.done).map(([, p]) => p.title);
    const missed = mine.flatMap(([, p]) => (p.missed || []).map((m) => m.concept)).slice(-4);
    const a = statsFor(startOfDay(-27), new Date(Date.now() + 1), c.key);
    lines.push(`${c.title}: ${done.length ? `finished ${done.join("; ")}` : "in progress"}${a.first ? `; ${Math.round((a.firstRight / a.first) * 100)}% right on first try lately` : ""}${missed.length ? `; recently missed: ${missed.join("; ")}` : ""}.`);
  }
  return lines.join("\n") || "(No class data yet.)";
}

function knowledgeText(t) {
  const k = t.knowledge || {};
  if (!k.summary && !k.mastered?.length) return "(Brand new topic: nothing learned yet.)";
  return [`Level: ${k.level || "unknown"}`, k.summary ? `Where she is: ${k.summary}` : "", k.mastered?.length ? `Already understands: ${k.mastered.join("; ")}` : "",
    k.shaky?.length ? `Still shaky on: ${k.shaky.join("; ")}` : "", k.next?.length ? `Planned next: ${k.next.join("; ")}` : ""].filter(Boolean).join("\n");
}

function exploreRules(t) {
  const past = t.sessions.slice(0, -1).filter((s) => s.summary).slice(-5).map((s) => `- ${s.day}: ${s.summary}`).join("\n");
  return [
    `You are Grace's personal tutor for "${t.name}", inside her study app. You pick up where you left off and build on what she already knows.`,
    `What she knows about ${t.name} so far:\n${knowledgeText(t)}`,
    past ? `Past sessions:\n${past}` : "This is your first session on this topic.",
    `Her classes and how she's doing (use this to pitch the level and to connect new ideas to things she already knows):\n${learnerContext()}`,
    "How to teach: small chunks, plain language, one real-world example at a time. End most replies with ONE short question that checks understanding or lets her choose where to go next. When she answers, say clearly whether she's right and why. If she's shaky, back up a step. When she gets several right in a row, or something is already on her 'already understands' list, step the difficulty up: harder examples, multi-step problems, and why/what-if questions. Keep replies short and skimmable: a few sentences, bullets, or a small markdown table. When something matters for money or legal decisions (like real estate deals), note what she'd verify with a professional.",
  ].join("\n\n");
}

async function exploreSend(text, { kickoff = false, images = [] } = {}) {
  const t = state.explore.topic;
  if (!t || !sample) return;
  const s = t.sessions.at(-1);
  if (text) { s.messages.push({ role: "user", content: text, ...(images.length ? { images: images.length } : {}) }); state.explore.dirty++; }
  const reply = { role: "assistant", content: "" };
  s.messages.push(reply);
  drawExploreLog();
  const bubble = document.querySelector(".xlog .msg:last-child");
  const history = s.messages.slice(0, -1).slice(-24).filter((m) => m.content).map(({ role, content }) => ({ role, content }));
  if (images.length) history[history.length - 1].content += imageNote(images.length);
  const opener = kickoff
    ? (t.sessions.length > 1 || t.knowledge?.summary
      ? "(Session start: welcome me back in one line, remind me in one or two bullets where we left off, suggest what to do today, and ask me one question to get going.)"
      : "(Session start: this topic is new. In a few lines, say what you'd start with given my classes, ask one or two quick questions to find my level, and give me 2-3 directions we could go.)")
    : null;
  try {
    const { text: full } = await sample([{ role: "user", content: exploreRules(t) }, ...history, ...(opener ? [{ role: "user", content: opener }] : [])], {
      cache: false, ...(images.length ? { images } : {}), onText: ({ text }) => { if (bubble) bubble.innerHTML = md(text); const log = document.querySelector(".xlog"); if (log) log.scrollTop = log.scrollHeight; },
    });
    reply.content = full;
  } catch (e) {
    reply.content = (e.text ? e.text + "\n\n" : "") + `_${sampleErrorText(e)}_`;
  }
  saveTopic(t);
  drawExploreLog();
  if (state.explore.dirty >= 6) updateKnowledge(t, { quiet: true }); // keep the map fresh during long chats
}

async function updateKnowledge(t, { quiet = false } = {}) {
  if (!sample || state.explore.saving) return;
  state.explore.saving = true;
  const note = document.querySelector(".xsave");
  if (note && !quiet) note.textContent = "Saving what you learned…";
  const s = t.sessions.at(-1);
  const results = topicLessons(t).map((l) => state.progress[`explore:${l.id}`]).filter(Boolean)
    .map((p) => `${p.title}: ${p.done ? "finished" : "in progress"}, ${p.firstTryRight ?? 0} right on first try; missed: ${(p.missed || []).map((m) => m.concept).join("; ") || "nothing"}`).join("\n");
  const prompt = `You keep a student's running knowledge map for the topic "${t.name}". Update it from today's conversation and her practice results. Be specific and honest: only mark something mastered if she showed she understands it.

Current map:
${knowledgeText(t)}

Today's conversation:
${s.messages.slice(-30).map((m) => `${m.role === "user" ? "Grace" : "Tutor"}: ${m.content}`).join("\n").slice(-20000)}

Practice results on this topic:
${results || "(none yet)"}

Reply with ONLY JSON: {"level": "beginner" | "getting there" | "solid" | "advanced", "summary": "2-3 sentences on where she is and how she learns best", "mastered": ["short concept", ...], "shaky": ["short concept", ...], "next": ["what to learn next", ...], "sessionSummary": "one sentence on what today's session covered"}`;
  try {
    const k = await sample.json(prompt, { cache: false });
    if (k?.summary) {
      t.knowledge = { level: String(k.level || ""), summary: String(k.summary), mastered: (k.mastered || []).map(String).slice(0, 25),
        shaky: (k.shaky || []).map(String).slice(0, 12), next: (k.next || []).map(String).slice(0, 8), updatedAt: new Date().toISOString() };
      if (k.sessionSummary) s.summary = String(k.sessionSummary);
      state.explore.dirty = 0;
      saveTopic(t);
      if (state.view === "explore" && state.explore.topic === t) drawKnowledge();
    }
    if (note && !quiet) note.textContent = "✓ Saved to your knowledge map";
  } catch (e) {
    if (note && !quiet) note.textContent = sampleErrorText(e);
  } finally { state.explore.saving = false; }
}

async function makeTopicLesson(kind) {
  const t = state.explore.topic;
  if (!t || !sample) return;
  const status = document.querySelector(".xsave");
  if (status) status.textContent = kind === "quiz" ? "Writing your quiz…" : "Building your lesson…";
  const recent = (t.sessions.at(-1)?.messages || []).slice(-12).map((m) => `${m.role === "user" ? "Grace" : "Tutor"}: ${m.content}`).join("\n").slice(-8000);
  const prompt = [
    `Write an interactive ${kind === "quiz" ? "check-yourself quiz" : "lesson"} on "${t.name}" for Grace, pitched exactly at where she is. Build on what she knows, focus on what's shaky or next, and use fresh real-world examples.`,
    topicRoundNote(t),
    `Her knowledge map:\n${knowledgeText(t)}`,
    `What you've been talking about today:\n${recent || "(nothing yet)"}`,
    `Her classes (for level and connections):\n${learnerContext()}`,
    kind === "quiz"
      ? "Make objectives one sentence, keyPoints a 3-5 bullet review, 6-8 quiz questions from easier to harder (each with a hint), and leave definitions, debitCredit, sqlExercises, practicePrompts empty."
      : "Include 4-8 definitions, 4-6 quiz questions (each with a hint), and 1-2 practicePrompts. Include debitCredit transactions ONLY if the topic involves accounting entries, and sqlExercises ONLY if it involves databases (they must run on this SQLite schema: " + PRACTICE.schema.replace(/\s+/g, " ") + "). Otherwise leave them empty.",
    LESSON_SHAPE.replace('"explanation": string}', '"hint": string, "explanation": string}'),
  ].join("\n\n");
  try {
    const data = await sample.json(prompt, { cache: false });
    if (!data?.title || !data?.quiz) throw { code: "invalid_json" };
    if (kind === "quiz") data.title = `Quiz: ${data.title.replace(/^quiz:\s*/i, "")}`;
    const rec = { id: "x-" + uid(), courseKey: "explore", topicId: t.id, title: data.title, source: t.name, createdAt: new Date().toISOString(), data };
    state.lessons.push(rec);
    saveLessons();
    t.sessions.at(-1).messages.push({ role: "assistant", content: `📘 I made you a ${kind === "quiz" ? "quiz" : "lesson"}: **${data.title}**. Open it from the list on the left, or tap below.` , lessonId: rec.id });
    saveTopic(t);
    go("class", "explore", rec.id);
  } catch (e) { if (status) status.textContent = sampleErrorText(e); }
}

function drawKnowledge() {
  const box = document.querySelector(".xknow");
  if (!box) return;
  const t = state.explore.topic, k = t.knowledge || {};
  const list = (title, items, cls) => items?.length ? h("div", {}, h("span", { class: "eyebrow" }, title), h("ul", { class: `xlist ${cls}` }, items.map((x) => h("li", {}, x)))) : null;
  box.replaceChildren(
    h("div", { class: "row" }, h("h2", { style: "flex:1" }, "What you know"), k.level ? h("span", { class: "chip done" }, k.level) : null),
    k.summary ? h("p", { style: "margin:0;font-size:.92rem" }, k.summary) : h("p", { class: "muted", style: "margin:0;font-size:.9rem" }, "This fills in as we talk. Tap 💾 Save what I learned any time."),
    list("✓ Got it", k.mastered, "good"), list("⚠ Still shaky", k.shaky, "shaky"), list("→ Next up", k.next, ""));
}

function drawExploreLog() {
  const log = document.querySelector(".xlog");
  const t = state.explore.topic;
  if (!log || !t) return;
  const s = t.sessions.at(-1);
  log.replaceChildren(...s.messages.map((m) => {
    const b = m.role === "assistant" ? h("div", { class: "msg assistant", html: md(m.content || "_Thinking…_") }) : h("div", { class: "msg user" }, imageChip(m), m.content);
    if (m.lessonId && state.lessons.some((l) => l.id === m.lessonId)) b.append(h("div", {}, h("button", { class: "btn small", onclick: () => go("class", "explore", m.lessonId) }, "Open it")));
    return b;
  }));
  log.scrollTop = log.scrollHeight;
}

function exploreView() {
  const t = state.explore.topic;
  return t && state.course === "explore" ? topicView(t) : exploreHome();
}

function exploreHome() {
  const input = h("input", { id: "x-topic", placeholder: "e.g. Real estate investing, how credit scores work, the stock market…", autocomplete: "off" });
  const start = () => newTopic(input.value);
  input.addEventListener("keydown", (e) => e.key === "Enter" && start());
  const topics = [...state.explore.topics].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const ideas = ["Real estate investing", "How credit scores work", "Budgeting and saving", "How the stock market works", "Reading a company's financial statements", "Excel for business"];
  return h("main", { class: "home" },
    h("div", { class: "hello" }, h("span", { class: "eyebrow" }, "Explore"), h("h1", {}, "What do you want to learn today?")),
    h("section", { class: "panel" },
      h("label", { for: "x-topic" }, "Any topic"), h("div", { class: "row", style: "flex-wrap:nowrap" }, input, h("button", { class: "btn", onclick: start }, "Start")),
      h("div", { class: "row" }, h("span", { class: "muted", style: "font-size:.88rem" }, "Ideas:"), ideas.map((x) => h("button", { class: "choice", onclick: () => newTopic(x) }, x))),
      !sample ? h("p", { class: "note bad", style: "margin:0" }, "Explore works when this page is open in Claude (claude.ai or the Claude app).") : null),
    h("section", { class: "panel" },
      h("h2", {}, "Keep building"),
      topics.length ? h("div", { class: "xtopics" }, topics.map((x) => h("button", { class: "class-card", onclick: () => openTopic(x.id) },
        h("span", { class: "code" }, x.level || "new"), h("h3", {}, x.name),
        h("span", { class: "meta" }, [x.mastered ? `${x.mastered} concept${x.mastered === 1 ? "" : "s"} learned` : "", x.sessions ? `${x.sessions} session${x.sessions === 1 ? "" : "s"}` : "",
          x.updatedAt ? `last ${new Date(x.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""].filter(Boolean).join(" · ")))))
        : h("p", { class: "muted", style: "margin:0" }, "Topics you explore show up here, with everything you've learned so far. Come back any time to keep going.")));
}

function topicView(t) {
  const input = h("textarea", { id: "x-input", rows: 2, placeholder: `Ask anything about ${t.name}… (Enter to send)` });
  const tray = imageTray(input);
  const send = () => { const v = input.value.trim(); if (!v && !tray.count) return; input.value = ""; exploreSend(v || "What's in this image? Help me understand it.", { images: tray.take() }); };
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  const lessons = topicLessons(t);
  const side = h("nav", { class: "side", "aria-label": `${t.name}` },
    h("button", { class: "item", onclick: () => { state.explore.topic = null; go("explore"); } }, "← All topics"),
    h("section", { class: "xknow" }),
    lessons.length ? h("span", { class: "eyebrow" }, "Lessons and quizzes") : null,
    lessons.map((l) => h("button", { class: `item${state.progress["explore:" + l.id]?.done ? " is-done" : ""}`, onclick: () => go("class", "explore", l.id) }, l.title,
      h("small", {}, new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })))),
    t.sessions.length > 1 ? h("span", { class: "eyebrow" }, "Past sessions") : null,
    t.sessions.slice(0, -1).reverse().map((s) => h("details", { class: "xpast" }, h("summary", {}, new Date(s.startedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      s.summary ? h("small", {}, s.summary) : null),
      h("div", { class: "xpast-log" }, s.messages.map((m) => m.role === "assistant" ? h("div", { class: "msg assistant", html: md(m.content) }) : h("div", { class: "msg user" }, imageChip(m), m.content))))));
  const view = h("div", { class: "classview xview" }, side,
    h("main", { class: "stage xstage" },
      h("div", { class: "xhead" }, h("span", { class: "eyebrow" }, "Explore"), h("h1", {}, t.name)),
      h("div", { class: "xlog log", "aria-live": "polite" }),
      h("div", { class: "xactions row" },
        h("button", { class: "btn small", onclick: () => makeTopicLesson("lesson") }, "🧩 Make me a lesson"),
        h("button", { class: "btn small", onclick: () => makeTopicLesson("quiz") }, "❓ Quiz me"),
        h("button", { class: "btn quiet small", onclick: () => updateKnowledge(t) }, "💾 Save what I learned"),
        h("span", { class: "xsave muted", role: "status" })),
      tray.thumbs,
      h("div", { class: "composer xcomposer" }, input, h("div", { class: "composer-btns" }, tray.attach, h("button", { class: "btn", onclick: send }, "Send")), tray.picker)));
  queueMicrotask(() => { drawKnowledge(); drawExploreLog(); });
  return view;
}

/* ---------- goals: vision, goal check-ins, and a 1 / 5 / 10 year plan ---------- */
let goalsTimer;
const saveGoals = () => { clearTimeout(goalsTimer); goalsTimer = setTimeout(() => store.set("goals", state.goals), 500); };
const HORIZONS = [
  { key: "year", label: "This year", by: () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return `by ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`; } },
  { key: "five", label: "5 years", by: () => `by ${new Date().getFullYear() + 5}` },
  { key: "decade", label: "This decade", by: () => `by ${new Date().getFullYear() + 10}` },
];

function goalsContext() {
  const g = state.goals, p = state.profile || {};
  const about = ["major", "year", "careerGoals", "about", "activities", "challenges"].map((k) => (p[k] ? `${k}: ${p[k]}` : "")).filter(Boolean).join("\n");
  return [
    `Today is ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. The student is at Utah Tech University taking ${COURSES.map((c) => c.title).join(", ")}.`,
    `Her greater vision, in her words:\n${g.vision.trim() || "(not written yet)"}`,
    g.goals.length ? `Her goals:\n${g.goals.map((x) => `- [${x.id}] ${x.text}${x.done ? " (done)" : ""}${x.horizon ? ` (she put it in: ${x.horizon})` : ""}`).join("\n")}` : "",
    about ? `From her scholarship "about me":\n${about}` : "",
  ].filter(Boolean).join("\n\n");
}
const COACH_RULES = "You're a warm, honest life and career coach for a college student. Use only what she has told you; never invent facts about her. Be specific and practical, point out conflicts or gaps kindly, and keep her in charge of her own goals.";

// Claude only places HER goals on the timeline; it never adds, renames, or splits them.
async function placeGoals() {
  const g = state.goals;
  const data = await sample.json(`${COACH_RULES}

${goalsContext()}

Place each of her goals in the time frame where it belongs: "year" (within the next 12 months), "five" (within 5 years), or "decade" (within 10 years). Use only her goals, exactly as listed. Don't add, rename, merge, or split anything.

Reply with JSON only: { "placements": [{ "id": "goal id from the list", "horizon": "year" | "five" | "decade" }] }`, { cache: false });
  for (const pl of Array.isArray(data.placements) ? data.placements : []) {
    const goal = g.goals.find((x) => x.id === pl.id);
    if (goal && HORIZONS.some((hz) => hz.key === pl.horizon)) goal.horizon = pl.horizon;
  }
  saveGoals();
}

// The career advisor: a chat on the right, like the class tutor.
const advisor = {
  log: null, input: null, sendBtn: null, busy: false, tray: null,
  mount() {
    const g = state.goals;
    this.log = h("div", { class: "log", "aria-live": "polite" });
    this.input = h("textarea", { id: "advisor-input", rows: 2, placeholder: "Ask your career advisor… (Enter to send)", "aria-label": "Message your career advisor" });
    this.sendBtn = h("button", { class: "btn", onclick: () => this.send() }, "Send");
    this.input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.send(); } });
    this.tray = imageTray(this.input);
    const el = h("aside", { class: "tutor advisor", "aria-label": "Career advisor" },
      h("header", {}, h("h2", {}, "Career advisor"),
        h("button", { class: "linkish", onclick: () => { g.chat = []; saveGoals(); this.draw(); } }, "Clear"),
        h("button", { class: "btn quiet small close", onclick: () => document.body.classList.remove("tutor-open"), "aria-label": "Close advisor" }, "✕")),
      this.log, this.tray.thumbs, h("div", { class: "composer" }, this.input, h("div", { class: "composer-btns" }, this.tray.attach, this.sendBtn), this.tray.picker));
    this.draw();
    return el;
  },
  draw() {
    const chat = state.goals.chat;
    this.log.replaceChildren(...(chat.length ? chat.map((m) => m.role === "assistant" ? h("div", { class: "msg assistant", html: md(m.content || "…") }) : h("div", { class: "msg user" }, imageChip(m), m.content))
      : [h("p", { class: "muted" }, sample ? "Hi! I'm your career advisor. Bounce any goal or idea off me and I'll tell you honestly how it fits the life you're building." : "The advisor works when this page is open in Claude (claude.ai or the Claude app).")]));
    this.log.scrollTop = this.log.scrollHeight;
  },
  ask(text) { document.body.classList.add("tutor-open"); this.send(text); },
  async send(text = this.input.value.trim()) {
    const g = state.goals;
    if (this.busy || (!text && !this.tray?.count)) return;
    const images = this.tray?.count ? this.tray.take() : [];
    if (!text) text = "What do you think of this?";
    if (!sample) return;
    this.busy = true; this.sendBtn.disabled = true; this.input.value = "";
    g.chat.push({ role: "user", content: text, ...(images.length ? { images: images.length } : {}) });
    const reply = { role: "assistant", content: "" };
    this.draw();
    const bubble = h("div", { class: "msg assistant", html: md("_Thinking…_") });
    this.log.append(bubble); this.log.scrollTop = this.log.scrollHeight;
    const history = g.chat.slice(-20).filter((m) => m.content).map(({ role, content }) => ({ role, content }));
    if (images.length) history[history.length - 1].content += imageNote(images.length);
    try {
      const { text: full } = await sample([{ role: "user", content: `${COACH_RULES} You're her career advisor. Keep replies short and conversational: say honestly how an idea fits her vision, what would make it stronger, and end with one question when it helps.\n\n${goalsContext()}` }, ...history],
        { cache: false, ...(images.length ? { images } : {}), onText: ({ text }) => { bubble.innerHTML = md(text); this.log.scrollTop = this.log.scrollHeight; } });
      reply.content = full;
    } catch (e) { reply.content = (e.text ? e.text + "\n\n" : "") + `_${sampleErrorText(e)}_`; }
    g.chat.push(reply);
    g.chat = g.chat.slice(-80);
    saveGoals();
    this.busy = false; this.sendBtn.disabled = false;
    this.draw();
  },
};

function goalsView() {
  const g = state.goals;
  const main = h("main", { class: "stage goals-page" });

  const vision = h("textarea", { id: "g-vision", rows: 4, placeholder: "Who do you want to be? What kind of life, work, and impact do you want in 10 years?" }, g.vision);
  const visionNote = h("small", { class: "muted", role: "status" }, g.vision ? "Saved" : "");
  vision.addEventListener("input", () => { g.vision = vision.value; visionNote.textContent = "Saving…"; saveGoals(); clearTimeout(vision._t); vision._t = setTimeout(() => (visionNote.textContent = "Saved ✓"), 700); });

  const newGoal = h("input", { id: "g-new", placeholder: "Type a goal, like “Land an accounting internship”", autocomplete: "off" });
  const when = h("select", { id: "g-when", "aria-label": "When" }, h("option", { value: "" }, "When?"), HORIZONS.map((hz) => h("option", { value: hz.key }, `${hz.label} · ${hz.by()}`)));
  const add = () => {
    const text = newGoal.value.trim();
    if (!text) return;
    g.goals.push({ id: uid(), text, createdAt: new Date().toISOString(), horizon: when.value, done: false });
    newGoal.value = ""; saveGoals(); drawTimeline();
    newGoal.focus();
  };
  newGoal.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); add(); } });

  const timeline = h("div", { class: "timeline" });
  const placeStatus = h("span", { class: "muted", role: "status" });
  const bubble = (goal) => h("div", { class: `goal-bubble${goal.done ? " is-done" : ""}` },
    h("label", { class: "goal-text" },
      h("input", { type: "checkbox", checked: goal.done || null, "aria-label": "Done", onchange: (e) => { goal.done = e.target.checked; saveGoals(); drawTimeline(); if (goal.done) celebrate(); } }),
      h("span", {}, goal.text)),
    h("div", { class: "bubble-actions" },
      h("button", { class: "linkish", disabled: !sample || null, onclick: () => advisor.ask(`How does my goal "${goal.text}" fit my greater vision? Be honest, and tell me what would make it stronger.`) }, "💬 Ask advisor"),
      h("select", { class: "move", "aria-label": "Move to", onchange: (e) => { goal.horizon = e.target.value; saveGoals(); drawTimeline(); } },
        h("option", { value: "" }, "Not placed"), HORIZONS.map((hz) => h("option", { value: hz.key, selected: goal.horizon === hz.key || null }, hz.label))),
      h("button", { class: "linkish", "aria-label": "Delete goal", onclick: () => { if (confirm(`Delete "${goal.text}"?`)) { g.goals = g.goals.filter((x) => x !== goal); saveGoals(); drawTimeline(); } } }, "✕")));
  const drawTimeline = () => {
    const loose = g.goals.filter((x) => !HORIZONS.some((hz) => hz.key === x.horizon));
    timeline.replaceChildren(
      loose.length ? h("section", { class: "tl-stage loose" },
        h("header", {}, h("span", { class: "tl-dot" }), h("div", {}, h("h2", {}, "Not placed yet"),
          h("div", { class: "row" }, h("button", { class: "btn small", disabled: !sample || null, onclick: async (e) => {
            e.currentTarget.disabled = true; placeStatus.textContent = "Placing your goals…";
            try { await placeGoals(); placeStatus.textContent = ""; drawTimeline(); } catch (err) { placeStatus.textContent = sampleErrorText(err); e.currentTarget.disabled = false; }
          } }, "✨ Place them for me"), placeStatus))),
        h("div", { class: "bubbles" }, loose.map(bubble))) : null,
      ...HORIZONS.map((hz, i) => {
        const list = g.goals.filter((x) => x.horizon === hz.key);
        return h("section", { class: `tl-stage h${i}` },
          h("header", {}, h("span", { class: "tl-dot" }), h("div", {}, h("span", { class: "eyebrow" }, hz.label), h("h2", {}, hz.by().replace("by ", "By ")))),
          h("div", { class: "bubbles" }, list.length ? list.map(bubble) : h("p", { class: "muted", style: "margin:0" }, "No goals here yet.")));
      }));
  };

  main.append(h("div", { class: "goals-inner" },
    h("div", { class: "hello" }, h("span", { class: "eyebrow" }, "Goals"), h("h1", {}, "Where are you headed?")),
    h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", {}, "Your greater vision"), visionNote), vision),
    h("section", { class: "panel add-goal" }, h("label", { for: "g-new" }, "Add a goal"),
      h("div", { class: "row add-row" }, newGoal, when, h("button", { class: "btn", onclick: add }, "Add"))),
    timeline));
  drawTimeline();
  document.body.append(h("button", { class: "btn fab", onclick: () => { document.body.classList.add("tutor-open"); advisor.input.focus(); } }, "Career advisor"));
  return h("div", { class: "goalsview" }, main, advisor.mount());
}

/* ---------- Mr. Mikey, drawn in 2D: giant head, tiny body, big glasses, bushy mustache ---------- */
function mikey2D(container) {
  const NS = "http://www.w3.org/2000/svg";
  const wrap = document.createElement("div");
  wrap.className = "mikey";
  wrap.innerHTML = `<svg viewBox="0 0 300 380" role="img" aria-label="Mr. Mikey, your teacher">
  <defs>
    <radialGradient id="mk-skin" cx="45%" cy="38%" r="65%"><stop offset="0" stop-color="#ffe6cf"/><stop offset="1" stop-color="#f2c49c"/></radialGradient>
    <pattern id="mk-tweed" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#6b5230"/><path d="M0 8 L8 0 M-2 2 L2 -2 M6 10 L10 6" stroke="#8a6c42" stroke-width="1.6"/><circle cx="2" cy="6" r=".9" fill="#4a3620"/></pattern>
    <pattern id="mk-check" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f5efe0"/><path d="M0 4 H8 M4 0 V8" stroke="#d8c7a0" stroke-width="1.2"/></pattern>
    <radialGradient id="mk-nose" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffb9a0"/><stop offset="1" stop-color="#e98a6f"/></radialGradient>
  </defs>
  <g class="mk-office" opacity=".95">
    <rect x="-40" y="-20" width="380" height="420" fill="#d9ceb0"/>
    <rect x="228" y="120" width="70" height="200" fill="#8a5a34" stroke="#5a3a1a" stroke-width="3"/>
    <g stroke="#5a3a1a" stroke-width="3"><line x1="228" y1="170" x2="298" y2="170"/><line x1="228" y1="220" x2="298" y2="220"/><line x1="228" y1="270" x2="298" y2="270"/></g>
    <g><rect x="234" y="136" width="9" height="32" fill="#b83a3a"/><rect x="245" y="140" width="8" height="28" fill="#3a6a8a"/><rect x="255" y="134" width="10" height="34" fill="#d8a83a"/><rect x="236" y="186" width="10" height="32" fill="#4a7a4a"/><rect x="248" y="190" width="8" height="28" fill="#8a4a8a"/></g>
    <circle cx="276" cy="200" r="14" fill="#4a8ad8" stroke="#2a4a6a" stroke-width="2"/><path d="M268 196 Q276 190 282 198 Q278 206 270 204 Z" fill="#6ab04a"/>
    <path d="M8 120 Q30 90 20 60 M20 120 Q44 100 50 70 M14 120 Q4 96 -6 86" fill="none" stroke="#3a8a3a" stroke-width="4"/>
    <g fill="#4aa04a"><ellipse cx="20" cy="60" rx="9" ry="6"/><ellipse cx="50" cy="70" rx="9" ry="6"/><ellipse cx="-6" cy="86" rx="9" ry="6"/><ellipse cx="34" cy="92" rx="8" ry="5"/></g>
    <path d="M0 120 L36 120 L30 150 L6 150 Z" fill="#c46a3a" stroke="#6a3a1a" stroke-width="2"/>
  </g>
  <g class="mk-body">
    <path d="M62 380 Q56 316 150 298 Q244 316 238 380 Z" fill="url(#mk-tweed)" stroke="#2a1d10" stroke-width="4"/>
    <path d="M126 300 L150 380 L174 300 Z" fill="url(#mk-check)" stroke="#2a1d10" stroke-width="2.5"/>
    <path d="M126 300 L112 322 L134 330 L150 380 L104 380 Q96 330 126 300 Z M174 300 L188 322 L166 330 L150 380 L196 380 Q204 330 174 300 Z" fill="url(#mk-tweed)" stroke="#2a1d10" stroke-width="3" stroke-linejoin="round"/>
    <path d="M140 300 L150 312 L160 300 Z" fill="#2f6b3a" stroke="#1a3a20" stroke-width="2"/>
    <path d="M144 312 L156 312 L160 360 L150 374 L140 360 Z" fill="#2f6b3a" stroke="#1a3a20" stroke-width="2"/>
    <g fill="#c98a3a"><circle cx="148" cy="326" r="2"/><circle cx="153" cy="340" r="2"/><circle cx="147" cy="352" r="2"/></g>
    <circle cx="186" cy="356" r="3.5" fill="#5a3a1a"/><circle cx="186" cy="372" r="3.5" fill="#5a3a1a"/>
    <g class="mk-arm-l"><path d="M82 324 Q52 336 52 352" fill="none" stroke="#6b5230" stroke-width="20" stroke-linecap="round"/><ellipse cx="60" cy="336" rx="8" ry="10" fill="#4a3018"/>
      <rect x="30" y="336" width="30" height="34" rx="4" fill="#fff" stroke="#2a1d10" stroke-width="3"/><path d="M30 344 Q18 346 20 356 Q22 364 30 362" fill="none" stroke="#2a1d10" stroke-width="3"/>
      <text x="45" y="357" font-size="9" font-weight="700" text-anchor="middle" fill="#c42636" font-family="sans-serif">TEACH</text>
      <circle cx="52" cy="356" r="11" fill="#f7d3b0" stroke="#2a1d10" stroke-width="3"/>
      <path class="mk-steam" d="M40 330 Q36 322 42 316 Q48 310 44 302" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></g>
    <g class="mk-arm-r"><path d="M218 324 Q248 336 250 352" fill="none" stroke="#6b5230" stroke-width="20" stroke-linecap="round"/><ellipse cx="240" cy="336" rx="8" ry="10" fill="#4a3018"/>
      <rect x="232" y="314" width="44" height="58" rx="3" fill="#8a5a34" stroke="#2a1d10" stroke-width="3" transform="rotate(12 254 343)"/><rect x="238" y="322" width="32" height="44" fill="#fff" transform="rotate(12 254 343)"/>
      <rect x="246" y="310" width="16" height="8" rx="2" fill="#b0b0b8" stroke="#2a1d10" stroke-width="2" transform="rotate(12 254 343)"/>
      <g stroke="#9aa" stroke-width="1.5" transform="rotate(12 254 343)"><line x1="242" y1="330" x2="266" y2="330"/><line x1="242" y1="338" x2="266" y2="338"/><line x1="242" y1="346" x2="262" y2="346"/></g>
      <circle cx="250" cy="356" r="11" fill="#f7d3b0" stroke="#2a1d10" stroke-width="3"/></g>
  </g>
  <rect x="140" y="268" width="20" height="32" fill="#f2c49c" stroke="#3a2a1a" stroke-width="3"/>
  <g class="mk-head">
    <ellipse cx="24" cy="160" rx="20" ry="30" fill="url(#mk-skin)" stroke="#3a2a1a" stroke-width="4"/><ellipse cx="276" cy="160" rx="20" ry="30" fill="url(#mk-skin)" stroke="#3a2a1a" stroke-width="4"/>
    <ellipse cx="150" cy="150" rx="128" ry="122" fill="url(#mk-skin)" stroke="#3a2a1a" stroke-width="5"/>
    <path d="M78 238 Q150 300 222 238 Q214 272 150 280 Q86 272 78 238 Z" fill="url(#mk-skin)" stroke="#3a2a1a" stroke-width="4"/>
    <g fill="#6a5a50" opacity=".45"><circle cx="112" cy="252" r="1.8"/><circle cx="124" cy="262" r="1.8"/><circle cx="138" cy="258" r="1.8"/><circle cx="162" cy="260" r="1.8"/><circle cx="178" cy="255" r="1.8"/><circle cx="190" cy="248" r="1.8"/><circle cx="150" cy="266" r="1.8"/><circle cx="100" cy="240" r="1.8"/><circle cx="202" cy="238" r="1.8"/></g>
    <path d="M140 28 Q146 8 138 -2 M156 30 Q170 12 166 0 M124 34 Q116 16 104 14" fill="none" stroke="#7a6a5a" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 96 Q70 70 96 68 M40 128 Q42 96 64 88" fill="none" stroke="#9a9a9a" stroke-width="9" stroke-linecap="round"/>
    <path d="M240 96 Q230 70 204 68 M260 128 Q258 96 236 88" fill="none" stroke="#9a9a9a" stroke-width="9" stroke-linecap="round"/>
    <g class="mk-combover"><path d="M92 50 Q150 12 214 44" fill="none" stroke="#7a6a5a" stroke-width="4" stroke-linecap="round"/><path d="M100 58 Q152 26 208 52" fill="none" stroke="#7a6a5a" stroke-width="4" stroke-linecap="round"/><path d="M110 66 Q156 40 200 60" fill="none" stroke="#7a6a5a" stroke-width="4" stroke-linecap="round"/></g>
    <g class="mk-brows"><path d="M70 106 Q98 84 130 100 Q150 94 170 100 Q202 84 230 106" fill="none" stroke="#4a3626" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g class="mk-eyes"><circle class="mk-pupil" cx="100" cy="140" r="6" fill="#1b1030"/><circle class="mk-pupil" cx="202" cy="134" r="9" fill="#1b1030"/></g>
    <g class="mk-lids"><rect class="mk-lid" x="66" y="100" width="72" height="0" fill="#f5cfab"/><rect class="mk-lid" x="162" y="100" width="72" height="0" fill="#f5cfab"/></g>
    <g class="mk-glasses" fill="rgba(190,225,255,.22)" stroke="#2a1a3a" stroke-width="7"><circle cx="102" cy="138" r="36"/><circle cx="198" cy="138" r="36"/><path d="M138 136 Q150 128 162 136" fill="none"/><path d="M66 132 L28 124 M234 132 L272 124" fill="none"/></g>
    <path d="M86 118 L96 110" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/><path d="M182 118 L192 110" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="70" cy="196" rx="18" ry="11" fill="#ff9fa8" opacity=".55"/><ellipse cx="230" cy="196" rx="18" ry="11" fill="#ff9fa8" opacity=".55"/>
    <ellipse cx="152" cy="184" rx="31" ry="25" fill="url(#mk-nose)" stroke="#3a2a1a" stroke-width="4"/><circle cx="143" cy="176" r="5" fill="#fff" opacity=".7"/><circle cx="168" cy="194" r="4" fill="#c46a50"/><path d="M168 190 L172 184" stroke="#3a2a1a" stroke-width="1.5"/>
    <g class="mk-mouth" transform="translate(150 230)">
      <path class="mk-m closed" d="M-26 0 Q0 10 26 0" fill="none" stroke="#3a1a24" stroke-width="6" stroke-linecap="round"/>
      <g class="mk-m open" style="display:none"><path d="M-28 -6 Q0 -10 28 -6 Q24 26 0 28 Q-24 26 -28 -6 Z" fill="#5a1a24" stroke="#3a1a24" stroke-width="4"/><path d="M-24 -5 L-14 -6 L-14 4 L-24 3 Z M-10 -7 L0 -7 L-1 6 L-10 5 Z M8 -7 L16 -6 L16 3 L9 2 Z" fill="#fff4c2" stroke="#3a1a24" stroke-width="1.5"/><ellipse cx="0" cy="18" rx="14" ry="7" fill="#ff7f93"/></g>
      <g class="mk-m wide" style="display:none"><path d="M-34 -6 Q0 -2 34 -6 Q26 16 0 18 Q-26 16 -34 -6 Z" fill="#5a1a24" stroke="#3a1a24" stroke-width="4"/><path d="M-30 -4 L-18 -3 L-19 5 L-29 3 Z M-12 -3 L-2 -2 L-3 8 L-12 7 Z M10 -2 L22 -3 L21 5 L11 6 Z" fill="#fff4c2" stroke="#3a1a24" stroke-width="1.5"/></g>
      <g class="mk-m oh" style="display:none"><ellipse cx="0" cy="6" rx="13" ry="17" fill="#5a1a24" stroke="#3a1a24" stroke-width="4"/><ellipse cx="0" cy="14" rx="8" ry="5" fill="#ff7f93"/></g>
    </g>
    <path class="mk-stache" d="M104 214 Q116 196 150 206 Q184 196 196 214 Q186 226 170 218 Q160 224 150 216 Q140 224 130 218 Q114 226 104 214 Z" fill="#6a5040" stroke="#3a2a1a" stroke-width="3.5"/>
  </g>
</svg>`;
  container.append(wrap);
  const q = (sel) => wrap.querySelector(sel), qa = (sel) => [...wrap.querySelectorAll(sel)];
  const head = q(".mk-head"), brows = q(".mk-brows"), pupils = qa(".mk-pupil"), lids = qa(".mk-lid"), stache = q(".mk-stache"), armR = q(".mk-arm-r"), armL = q(".mk-arm-l"), body = q(".mk-body");
  const shapes = { closed: q(".mk-m.closed"), open: q(".mk-m.open"), wide: q(".mk-m.wide"), oh: q(".mk-m.oh") };
  let talking = false, alive = true, shape = "closed", pointUntil = 0, look = 0, lookAt = 0, blinkAt = performance.now() + 1800, browPop = 0, lastWordAt = 0;
  const setMouth = (m) => { if (m === shape) return; shape = m; for (const [k, el] of Object.entries(shapes)) el.style.display = k === m ? "" : "none"; };
  let lastDraw = 0;
  const frame = (now) => {
    if (!alive) return;
    // Cheap-cartoon look on purpose: only redraw ~7 times a second, and twitch now and then.
    if (now - lastDraw < 140) { requestAnimationFrame(frame); return; }
    lastDraw = now;
    const t = Math.round(now / 140) * 0.14 + (Math.random() < 0.06 ? 0.4 : 0);
    head.setAttribute("transform", `rotate(${Math.round(Math.sin(t * 1.1) * 2 + (talking ? Math.sin(t * 3.7) * 4 : 0))} 150 270) translate(${Math.random() < 0.08 ? 3 : 0} ${Math.round(Math.sin(t * 1.6) * 3)})`);
    body.setAttribute("transform", `translate(0 ${Math.sin(t * 1.6) * 1.2})`);
    // Eyes wander, and glance at the board while pointing.
    if (now > lookAt) { look = now < pointUntil ? 6 : (Math.random() - 0.5) * 8; lookAt = now + 900 + Math.random() * 1600; }
    pupils.forEach((p, i) => p.setAttribute("transform", `translate(${look} ${Math.sin(t * 0.7 + i) * 1.5})`));
    const blink = now > blinkAt ? (now - blinkAt < 130 ? 1 : ((blinkAt = now + 2200 + Math.random() * 2800), 0)) : 0;
    lids.forEach((l) => l.setAttribute("height", blink ? 74 : 0));
    browPop = Math.max(0, browPop - 0.04);
    brows.setAttribute("transform", `translate(0 ${-browPop * 12 - (talking ? Math.abs(Math.sin(t * 2.3)) * 3 : 0)})`);
    stache.setAttribute("transform", talking ? `translate(0 ${Math.abs(Math.sin(t * 13)) * 2.5}) rotate(${Math.sin(t * 9) * 2} 150 212)` : "");
    // If the voice doesn't report words, flap on a rhythm instead.
    if (talking && now - lastWordAt > 260) setMouth(["open", "wide", "closed", "oh", "open", "closed"][Math.floor(t * 9) % 6]);
    if (!talking) setMouth("closed");
    const pointing = now < pointUntil;
    armR.setAttribute("transform", pointing ? `rotate(${-30 + Math.sin(t * 5) * 3} 218 324)` : `rotate(${Math.sin(t * 1.3) * 3} 218 324)`);
    armL.setAttribute("transform", talking ? `rotate(${10 + Math.sin(t * 2.8) * 10} 82 324)` : "");
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return {
    talk: (on) => { talking = on; if (on) browPop = 1; },
    point: () => { pointUntil = performance.now() + 2400; browPop = 1; },
    // Lip-sync from the word being spoken.
    word: (w) => {
      lastWordAt = performance.now();
      const s = String(w).toLowerCase();
      setMouth(/^[mbp]/.test(s) ? "closed" : /[ou]/.test(s) ? "oh" : /[ei]/.test(s) ? "wide" : "open");

      if (/mkay|kay/.test(s)) browPop = 1;
    },
    destroy: () => { alive = false; wrap.remove(); },
  };
}

/* ---------- video lessons: Mr. Mikey explains with a chalkboard ---------- */
const TEACHER = "Mr. Mikey";
let videoCache = null;
async function getVideo(key) { videoCache ||= (await store.get("videos-mikey4"))?.items || {}; return videoCache[key]; }
function putVideo(key, script) {
  videoCache[key] = { ...script, at: Date.now() };
  const keys = Object.keys(videoCache).sort((a, b) => videoCache[b].at - videoCache[a].at);
  for (const k of keys.slice(30)) delete videoCache[k];
  store.set("videos-mikey4", { items: videoCache });
}

async function makeVideoScript({ courseKey, topic, material, term, focus, lessonTitle }) {
  const course = courseOf(courseKey);
  const prefer = courseKey === "accounting" ? "Lean on equation, tAccount, and journal visuals with real dollar amounts."
    : courseKey === "sql" ? "Lean on sql visuals (a short query plus its small result) and table visuals, using the practice database tables: customers, products, orders, order_items."
    : "Lean on steps, compare, term, and table visuals.";
  const data = await sample.json(`You are ${TEACHER}, ${course.tutor}, recording a short video lesson for a college student. ${TEACHER} is a friendly, very earnest school counselor who got asked to teach: sincere and upbeat, explains simple things with plain everyday examples, a little awkward, and he LOVES corny dad jokes. Slip in a quick, groan-worthy dad joke or pun whenever there's a chance (about one every scene or two), ideally about the topic itself (like "Why did the accountant break up with the calculator? She felt he was always counting on her."), then get right back to teaching. Keep the jokes clean and never at the student's expense. He also and says "mkay" once in a while, about once per scene at most, never after every sentence. Write the way people really talk: contractions, short sentences, commas where he'd take a breath, little fillers like "so," "now," and "alright." Never mention any TV show or real person. Keep every fact exactly right.

${lessonTitle ? `She's on the lesson "${lessonTitle}". Build this video ONLY from that lesson's material below: follow its objectives, use its own examples, accounts, numbers, tables, terms, and questions, and teach exactly what the lesson expects her to be able to do. Don't drift into general or unrelated topics.` : ""}
${focus ? `Focus: ${focus}` : ""}
${term ? `Explain just this one term so it really clicks: "${term.term}" (${term.definition}). Use 3-4 scenes: what it is, how this lesson uses it (with the lesson's own example), a real-life comparison, and a quick check question.`
  : focus ? `Use 3-5 scenes: say in one line what this part is about, walk through it step by step with the lesson's own example, show the reasoning she needs to figure it out herself, point out the usual mistake, and end with a quick check question (don't give away graded answers).`
  : `Teach "${topic}" in 6-8 scenes: first say in one sentence what this lesson is about and what she'll be able to do after it, then cover each objective in order with the lesson's own examples, one worked example, a common mistake, and a quick check question at the end.`}
Each scene has "say" (what he says out loud: 20-50 words, conversational, no markdown or symbols he'd have to read) and ONE "visual" for the chalkboard that shows what he's saying. ${prefer}

Visual types (use the exact fields):
{"type":"term","term":"","definition":"","example":""}
{"type":"equation","left":[{"label":"","value":""}],"right":[{"label":"","value":""}],"note":""}
{"type":"tAccount","account":"","debits":[{"label":"","amount":0}],"credits":[{"label":"","amount":0}]}
{"type":"journal","entries":[{"account":"","side":"debit","amount":0}]}
{"type":"table","columns":[""],"rows":[[""]],"highlight":0}
{"type":"sql","query":"","columns":[""],"rows":[[""]]}
{"type":"steps","items":[""]}
{"type":"compare","left":{"title":"","items":[""]},"right":{"title":"","items":[""]}}
{"type":"bullets","items":[""]}

Reply with JSON only: {"title": "", "scenes": [{"say": "", "visual": {}}]}

--- THE LESSON MATERIAL ---
${String(material || "").slice(0, 14000)}`, { cache: false, modelTier: "default" });
  const scenes = (Array.isArray(data?.scenes) ? data.scenes : []).filter((x) => x?.say).map((x) => ({ say: mkayify(String(x.say)), visual: x.visual && typeof x.visual === "object" ? x.visual : { type: "bullets", items: [] } }));
  if (!scenes.length) throw { code: "invalid_json" };
  return { title: String(data.title || topic || term?.term || "Lesson"), scenes };
}

// "Mkay" only now and then: at most once per scene, on the last sentence.
function mkayify(text) {
  const sens = (text.match(/[^.!?]+[.!?]*/g) || [text]).map((x) => x.trim()).filter(Boolean);
  const had = sens.some((x) => /\bm+'?kay\b/i.test(x));
  return sens.map((x, i) => {
    const last = i === sens.length - 1;
    if (!last || !had) return x.replace(/,?\s*\bm+'?kay\b\s*([.!?]*)$/i, (_, p) => p || ".");
    return x;
  }).join(" ");
}
// Chalkboard visuals.
const vtxt = (v) => String(v ?? "");
const vmoney = (n) => (typeof n === "number" ? money(n) : vtxt(n));
const BOARD = {
  term: (v) => h("div", { class: "b-term" }, h("div", { class: "b-big" }, vtxt(v.term)), h("p", {}, vtxt(v.definition)), v.example ? h("p", { class: "b-ex" }, "e.g. ", vtxt(v.example)) : null),
  equation: (v) => h("div", { class: "b-eq" },
    ...(v.left || []).flatMap((x, i) => [i ? h("span", { class: "b-op" }, "+") : null, h("div", { class: "b-box" }, h("b", {}, vtxt(x.label)), x.value ? h("span", {}, vtxt(x.value)) : null)]),
    h("span", { class: "b-op" }, "="),
    ...(v.right || []).flatMap((x, i) => [i ? h("span", { class: "b-op" }, "+") : null, h("div", { class: "b-box" }, h("b", {}, vtxt(x.label)), x.value ? h("span", {}, vtxt(x.value)) : null)]),
    v.note ? h("p", { class: "b-note" }, vtxt(v.note)) : null),
  tAccount: (v) => {
    const sum = (a) => (a || []).reduce((t, x) => t + (Number(x.amount) || 0), 0);
    const side = (items) => h("div", { class: "b-tside" }, (items || []).map((x) => h("div", { class: "b-trow" }, h("span", {}, vtxt(x.label)), h("b", {}, vmoney(Number(x.amount))))));
    return h("div", { class: "b-t" }, h("div", { class: "b-big" }, vtxt(v.account)),
      h("div", { class: "b-tgrid" }, h("div", { class: "b-thead" }, "Debit"), h("div", { class: "b-thead" }, "Credit"), side(v.debits), side(v.credits)),
      h("p", { class: "b-note" }, `Balance: ${money(Math.abs(sum(v.debits) - sum(v.credits)))} ${sum(v.debits) >= sum(v.credits) ? "debit" : "credit"}`));
  },
  journal: (v) => h("table", { class: "b-table" }, h("thead", {}, h("tr", {}, h("th", {}, "Account"), h("th", {}, "Debit"), h("th", {}, "Credit"))),
    h("tbody", {}, (v.entries || []).map((e) => h("tr", {}, h("td", { class: e.side === "credit" ? "b-indent" : "" }, vtxt(e.account)), h("td", {}, e.side === "debit" ? vmoney(Number(e.amount)) : ""), h("td", {}, e.side === "credit" ? vmoney(Number(e.amount)) : ""))))),
  table: (v) => h("table", { class: "b-table" }, h("thead", {}, h("tr", {}, (v.columns || []).map((c) => h("th", {}, vtxt(c))))),
    h("tbody", {}, (v.rows || []).slice(0, 8).map((r, i) => h("tr", { class: i === v.highlight ? "b-hl" : "" }, (Array.isArray(r) ? r : [r]).map((c) => h("td", {}, vtxt(c))))))),
  sql: (v) => h("div", { class: "b-sql" }, h("pre", {}, vtxt(v.query)), v.columns?.length ? BOARD.table(v) : null),
  steps: (v) => h("ol", { class: "b-steps" }, (v.items || []).map((x) => h("li", {}, vtxt(x)))),
  compare: (v) => h("div", { class: "b-compare" }, [v.left, v.right].map((c) => h("div", {}, h("div", { class: "b-big small" }, vtxt(c?.title)), h("ul", {}, (c?.items || []).map((x) => h("li", {}, vtxt(x))))))),
  bullets: (v) => h("ul", { class: "b-bullets" }, (v.items || []).map((x) => h("li", {}, vtxt(x)))),
};

// Speech: the browser's built-in voice (free, no downloads). Falls back to timed captions.
const speech = {
  get ok() { return "speechSynthesis" in window; },
  // Natural / neural / enhanced voices sound far less robotic than the basic ones.
  score(v) {
    let n = 0;
    if (/natural|neural|online|premium|enhanced|siri/i.test(v.name)) n += 10;
    if (/google/i.test(v.name)) n += 5;
    if (/en-US/i.test(v.lang)) n += 2;
    if (/guy|davis|andrew|brian|christopher|eric|roger|steffan|daniel|aaron|evan|nathan|tom|fred|alex|male/i.test(v.name)) n += 3;
    return n;
  },
  list() { return speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)).sort((a, b) => speech.score(b) - speech.score(a)); },
  saved() { try { return JSON.parse(localStorage.getItem("studyhub:voice")) || {}; } catch { return {}; } },
  save(o) { try { localStorage.setItem("studyhub:voice", JSON.stringify({ ...speech.saved(), ...o })); } catch {} },
  voice() { const vs = speech.list(), want = speech.saved().name; return vs.find((v) => v.name === want) || vs[0] || null; },
  get pitch() { return Number(speech.saved().pitch) || 1.05; },
};
function voicePanel(onChange) {
  const box = h("div", { class: "voice-panel" });
  const draw = () => {
    const vs = speech.list(), cur = speech.voice();
    const sel = h("select", { "aria-label": "Voice", onchange: (e) => { speech.save({ name: e.target.value }); onChange?.(); } },
      vs.length ? vs.map((v) => h("option", { value: v.name, selected: v === cur || null }, `${v.name}${speech.score(v) >= 10 ? " ✨ natural" : ""}`)) : h("option", {}, "No voices found on this device"));
    const pitch = h("input", { type: "range", min: 0.7, max: 1.4, step: 0.05, value: speech.pitch, "aria-label": "Pitch", oninput: (e) => speech.save({ pitch: e.target.value }) });
    box.replaceChildren(
      h("label", {}, "Mr. Mikey's voice", sel),
      h("label", {}, "Pitch (lower ↔ higher)", pitch),
      h("button", { class: "btn quiet small", onclick: () => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance("Hi there. I'm Mr. Mikey, and we're gonna learn this together. mmm kay?"); const v = speech.voice(); if (v) u.voice = v; u.pitch = speech.pitch; u.rate = 0.92; speechSynthesis.speak(u); } }, "🔊 Test voice"),
      h("p", { class: "muted", style: "margin:0;font-size:.82rem" }, "Voices marked ✨ natural sound the most human. For even better ones: in Microsoft Edge pick one that says “Online (Natural)”. On iPhone or Mac, go to Settings → Accessibility → Spoken Content → Voices and download an Enhanced or Premium voice, then reload."));
  };
  draw();
  if (speech.ok) speechSynthesis.addEventListener?.("voiceschanged", draw);
  return box;
}

async function openVideo({ key, courseKey, topic, material, term, focus, lessonTitle }) {
  document.querySelector(".vplayer")?.remove();
  const board = h("div", { class: "board", "aria-live": "polite" });
  const caption = h("p", { class: "vcaption" });
  const teacherBox = h("div", { class: "vteacher" });
  const dots = h("div", { class: "vdots" });
  const status = h("div", { class: "vstatus" }, h("span", { class: "spinner" }), h("p", {}, `${TEACHER} is getting his chalk ready…`));
  let script = null, i = 0, playing = false, token = 0, muted = !speech.ok, rate = 1, tch = null;
  const playBtn = h("button", { class: "btn", onclick: () => (playing ? pause() : play()) }, "▶ Play");
  const muteBtn = h("button", { class: "btn quiet small", onclick: () => { muted = !muted; muteBtn.textContent = muted ? "🔇 Voice off" : "🔊 Voice on"; if (playing) show(i, true); } }, muted ? "🔇 Voice off" : "🔊 Voice on");
  if (!speech.ok) muteBtn.disabled = true;
  const speedBtn = h("button", { class: "btn quiet small", onclick: () => { rate = rate === 1 ? 1.2 : rate === 1.2 ? 0.85 : 1; speedBtn.textContent = `${rate}×`; if (playing) show(i, true); } }, "1×");
  const vp = speech.ok ? voicePanel() : h("div");
  vp.hidden = true;
  const close = () => { token++; if (speech.ok) speechSynthesis.cancel(); tch?.destroy(); el.remove(); removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); else if (e.key === " " && e.target === document.body) { e.preventDefault(); playing ? pause() : play(); } };
  addEventListener("keydown", onKey);
  const el = h("div", { class: "vplayer", role: "dialog", "aria-modal": "true", "aria-label": `Video lesson with ${TEACHER}` },
    h("div", { class: "vcard" },
      h("header", { class: "vhead" }, h("span", { class: "eyebrow" }, `🎬 ${TEACHER} explains`), h("h2", { class: "vtitle" }, term ? term.term : topic), h("button", { class: "btn quiet small", "aria-label": "Close video", onclick: close }, "✕")),
      h("div", { class: "vstage" }, h("div", { class: "vroom" }, teacherBox), board),
      caption,
      vp,
      h("div", { class: "vcontrols" },
        h("button", { class: "btn quiet small", "aria-label": "Previous", onclick: () => show(Math.max(0, i - 1)) }, "⏮"),
        playBtn,
        h("button", { class: "btn quiet small", "aria-label": "Next", onclick: () => show(Math.min(script.scenes.length - 1, i + 1)) }, "⏭"),
        dots, muteBtn, speedBtn,
        speech.ok ? h("button", { class: "btn quiet small", "aria-expanded": "false", onclick: (e) => { const open = vp.hidden; vp.hidden = !open; e.currentTarget.setAttribute("aria-expanded", String(open)); } }, "🎙️ Voice") : null,
        h("button", { class: "linkish", onclick: () => { tutor.ask(`${TEACHER} just explained "${term ? term.term : topic}" in a video and I still don't totally get it. Can you explain it another way?`); close(); } }, "Still confused? Ask the tutor"))));
  document.body.append(el);
  board.append(status);
  tch = mikey2D(teacherBox);

  const drawDots = () => dots.replaceChildren(...script.scenes.map((_, k) => h("button", { class: `vdot${k === i ? " on" : ""}${k < i ? " seen" : ""}`, "aria-label": `Scene ${k + 1}`, onclick: () => show(k) })));
  // Speak phrase by phrase with human-ish rhythm: short breaths at commas, a longer beat between
  // sentences, a small pause before "mkay", and slight changes in speed and pitch so it isn't flat.
  const phrasesOf = (text) => {
    const out = [];
    for (const sen of text.match(/[^.!?]+[.!?]*/g) || [text]) {
      const m = sen.trim().match(/^(.*?)[,\s]*\b(m+'?kay)([.!?]*)$/i);
      const body = m ? m[1] : sen.trim();
      const bits = body.split(/(?<=[,;:—])\s+/).filter((b) => b.trim());
      bits.forEach((b, j) => out.push({ text: b.trim(), pause: j < bits.length - 1 ? 40 + Math.random() * 50 : m ? 60 : 150, lift: j === 0 ? 0.04 : 0 }));
      if (m) out.push({ text: "mmm kay" + (m[3].includes("!") ? "!" : "?"), pause: 170, mkay: true });
    }
    return out;
  };
  const sayIt = (text, my) => new Promise((done) => {
    if (muted) { setTimeout(done, Math.max(2500, (text.split(/\s+/).length / (2.6 * rate)) * 1000)); return; }
    speechSynthesis.cancel();
    const parts = phrasesOf(text);
    let k = 0;
    const next = () => {
      if (my !== token) return;
      if (k >= parts.length) return done();
      const ph = parts[k++], line = ph.text;
      const u = new SpeechSynthesisUtterance(line);
      const v = speech.voice(); if (v) u.voice = v;
      const jitter = 1 + (Math.random() - 0.5) * 0.08;
      u.rate = (ph.mkay ? 1.1 : 1.25) * rate * jitter;
      u.pitch = Math.max(0.5, Math.min(2, speech.pitch * (ph.mkay ? 0.9 : 1 + (ph.lift || 0) + (Math.random() - 0.5) * 0.06)));
      u.onboundary = (e) => { if (e.name === "word" || e.charLength) tch?.word?.(line.substr(e.charIndex, e.charLength || 6)); };
      // Some devices never report the end of speech; don't let the video get stuck.
      let moved = false;
      const go = () => { if (moved) return; moved = true; clearTimeout(guard); tch?.talk(false); setTimeout(() => { if (my === token) { if (k < parts.length) tch?.talk(true); next(); } }, ph.pause / rate); };
      const guard = setTimeout(go, (line.split(/\s+/).length / (1.6 * rate) + 2.5) * 1000);
      // No voice on this device? Leave the caption up for reading time instead.
      u.onend = go; u.onerror = () => { clearTimeout(guard); setTimeout(go, Math.max(1500, (line.split(/\s+/).length / (2.6 * rate)) * 1000)); };
      speechSynthesis.speak(u);
    };
    next();
  });
  const show = async (k, keepPlaying = playing) => {
    const my = ++token;
    if (speech.ok) speechSynthesis.cancel();
    i = k; drawDots();
    const sc = script.scenes[i];
    const v = BOARD[sc.visual.type] ? BOARD[sc.visual.type](sc.visual) : BOARD.bullets({ items: [] });
    board.replaceChildren(h("div", { class: "board-in" }, v));
    caption.textContent = sc.say;
    tch?.point();
    if (!keepPlaying) { tch?.talk(false); return; }
    playing = true; playBtn.textContent = "⏸ Pause";
    tch?.talk(true);
    await sayIt(sc.say, my);
    if (my !== token) return;
    tch?.talk(false);
    if (i < script.scenes.length - 1) setTimeout(() => { if (my === token && playing) show(i + 1); }, 700);
    else { playing = false; playBtn.textContent = "↺ Watch again"; }
  };
  const play = () => { if (!script) return; if (playBtn.textContent.startsWith("↺")) i = 0; show(i, true); };
  const pause = () => { token++; playing = false; if (speech.ok) speechSynthesis.cancel(); tch?.talk(false); playBtn.textContent = "▶ Play"; };

  try {
    script = await getVideo(key);
    if (!script) {
      if (!sample) throw { code: "not_granted" };
      script = await makeVideoScript({ courseKey, topic, material, term, focus, lessonTitle });
      putVideo(key, script);
    }
    if (!el.isConnected) return;
    el.querySelector(".vtitle").textContent = script.title;
    show(0, false);
    caption.textContent = `Press Play and ${TEACHER} will walk you through it${speech.ok ? " out loud" : ""}. ${script.scenes.length} parts.`;
  } catch (e) {
    board.replaceChildren(h("p", { class: "bad" }, e?.code === "not_granted" && !sample ? "Video lessons work when Study Hub is open in Claude." : sampleErrorText(e)));
  }
}
const lessonMaterial = (lesson) => (track?.saved?.missed?.length ? `Things she has gotten wrong in this lesson so far (make sure the video clears these up): ${track.saved.missed.slice(-6).map((m) => m.concept).join("; ")}\n` : "") + lesson.blocks.map((b) => b.type === "objectives" ? `Objectives: ${b.text}` : b.type === "text" ? String(b.html || "").replace(/<[^>]+>/g, " ")
  : JSON.stringify({ ...b, html: undefined })).join("\n").replace(/\s+/g, " ");

/* ---------- views ---------- */
const app = $("#app");
function currentLesson() {
  if (!state.lessonId) return null;
  const built = (LESSONS[state.course] || []).find((l) => l.id === state.lessonId);
  if (built) return built;
  const g = state.lessons.find((l) => l.id === state.lessonId);
  return g ? fromGenerated(g.data) : null;
}

function go(view, course = null, lessonId = null) {
  const t = state.explore?.topic;
  if (t && state.view === "explore" && !(view === "explore" && course === "explore") && state.explore.dirty >= 2) updateKnowledge(t, { quiet: true });
  state.view = view;
  state.course = course;
  state.lessonId = lessonId;
  state.activity = [];
  render();
  window.scrollTo(0, 0);
}

function topbar() {
  return h("header", { class: "topbar" },
    h("button", { class: "brand", onclick: () => go("home") }, h("span", { class: "mark", "aria-hidden": "true" }, "UT"), "Study Hub"),
    h("nav", { class: "tabs", "aria-label": "Classes" }, COURSES.map((c) =>
      h("button", { class: "tab", "data-course": c.key, "aria-current": state.course === c.key ? "page" : null, onclick: () => go("class", c.key, (LESSONS[c.key] || [])[0]?.id || null) }, c.title)),
      h("button", { class: "tab", "data-course": "explore", "aria-current": state.view === "explore" || state.course === "explore" ? "page" : null, onclick: () => { state.explore.topic = null; go("explore"); } }, "🧭 Explore"),
      h("button", { class: "tab", "aria-current": state.view === "scholarships" ? "page" : null, onclick: () => go("scholarships") }, "💰 Scholarships"),
      h("button", { class: "tab", "data-course": "goals", "aria-current": state.view === "goals" ? "page" : null, onclick: () => go("goals") }, "🎯 Goals")),
    h("button", { class: "linkish cheer-toggle", "aria-pressed": String(celebrationsOn()), title: "3D unicorn or monkey when you're right, grumpy monster when you're not",
      onclick: (e) => { const on = !celebrationsOn(); try { localStorage.setItem("studyhub:celebrate", on ? "on" : "off"); } catch {} e.currentTarget.setAttribute("aria-pressed", String(on)); e.currentTarget.textContent = on ? "🦄 Party on" : "🦄 Party off"; if (on) celebrate(); } },
      celebrationsOn() ? "🦄 Party on" : "🦄 Party off"));
}

function render() {
  document.body.classList.remove("tutor-open");
  if (state.view === "class" && COURSES.some((c) => c.key === state.course)) document.body.dataset.course = state.course;
  else if (state.view === "explore" || state.course === "explore") document.body.dataset.course = "explore";
  else if (state.view === "goals") document.body.dataset.course = "goals";
  else delete document.body.dataset.course;
  document.body.querySelector(".fab")?.remove();
  goldSea(document.body.dataset.course === "explore");
  app.replaceChildren(topbar(), state.view === "home" ? homeView() : state.view === "scholarships" ? scholarshipsView() : state.view === "goals" ? goalsView() : state.view === "explore" ? exploreView() : classView());
  document.documentElement.style.setProperty("--topbar-h", `${document.querySelector(".topbar")?.offsetHeight || 56}px`);
  if (state.view === "scholarships" && state.lessonId) document.getElementById("sch-" + state.lessonId)?.scrollIntoView({ block: "start" });
}

const EXAMPLES = [
  { title: "Chapter 3 homework: adjusting entries", courseKey: "accounting", days: 1 },
  { title: "Lab 4: JOIN practice", courseKey: "sql", days: 3 },
  { title: "Reading response", courseKey: "language-arts", days: 5 },
].map((e) => ({ ...e, id: "example-" + e.courseKey, example: true, due: new Date(Date.now() + e.days * 864e5).toISOString() }));

function dueChip(iso) {
  const days = Math.floor((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);
  if (days < 0) return h("span", { class: "chip" }, "past");
  if (days === 0) return h("span", { class: "chip today" }, "today");
  if (days === 1) return h("span", { class: "chip soon" }, "tomorrow");
  return h("span", { class: "chip" }, `in ${days} days`);
}

function thisWeek() {
  const end = Date.now() + 7 * 864e5;
  return openDeadlines().filter((d) => { const t = new Date(d.due).getTime(); return t > Date.now() - 864e5 && t < end; });
}

function resumePanel() {
  const open = Object.entries(state.progress)
    .filter(([k, p]) => !p.done && Object.keys(p.answers || {}).length && COURSES.some((c) => k.startsWith(c.key + ":")))
    .sort((a, b) => (b[1].updatedAt || "").localeCompare(a[1].updatedAt || "")).slice(0, 3);
  if (!open.length) return null;
  return h("section", { class: "panel" }, h("h2", {}, "Pick up where you left off"),
    h("ul", { class: "due" }, open.map(([k, p]) => {
      const [course, ...rest] = k.split(":");
      const lessonId = rest.join(":");
      const total = p.total || 0, solved = p.solved || 0;
      return h("li", { "data-course": course },
        h("span", { class: "day" }, h("b", {}, courseOf(course).title.split(" ")[0]), p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""),
        h("div", {}, h("div", { class: "title" }, p.title || "Lesson"), total ? h("div", { class: "bar", style: "margin-top:.35rem;max-width:240px" }, h("span", { style: `width:${Math.round((solved / total) * 100)}%` })) : null),
        h("button", { class: "btn small", onclick: () => go("class", course, lessonId) }, "Continue"));
    })));
}

function homeView() {
  const week = thisWeek();
  const showing = state.deadlines.length ? week : EXAMPLES;
  const labelOf = (d) => courseOf(d.courseKey)?.title || d.courseLabel || "Other";
  const counts = (key) => {
    const n = openDeadlines().filter((d) => d.courseKey === key && new Date(d.due) > new Date()).length;
    const lessons = (LESSONS[key]?.length || 0) + state.lessons.filter((l) => l.courseKey === key).length;
    const mine = Object.values(state.progress).filter((p) => p.courseKey === key);
    const done = mine.filter((p) => p.done).length;
    const review = mine.reduce((t, p) => t + (p.missed?.length || 0), 0);
    const fresh = state.inbox.filter((r) => r.courseKey === key).length;
    return [`${done} of ${lessons} lesson${lessons === 1 ? "" : "s"} done`, fresh ? `${fresh} new from Canvas` : "", review ? `${review} to review` : "", state.deadlines.length ? `${n} upcoming` : ""].filter(Boolean).join(" · ");
  };
  const codes = { accounting: "ACCT 2010", sql: "ISA 2050", "language-arts": "ENGL 3010", biology: "BIOL 1010" };

  const copyBtn = h("button", { class: "btn quiet small", onclick: async (e) => {
    const lines = week.map((d) => `• ${new Date(d.due).toLocaleString("en-US", { weekday: "short", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" })} – ${labelOf(d)}: ${d.title}`);
    const text = `Due this week (${week.length}):\n${lines.join("\n")}`;
    try { await navigator.clipboard.writeText(text); e.target.textContent = "Copied"; } catch { e.target.textContent = "Couldn't copy"; }
  } }, "Copy list");

  return h("main", { class: "home" },
    h("div", { class: "hello" }, h("span", { class: "eyebrow" }, new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })),
      h("h1", {}, "What are we learning today?")),
    h("div", { class: "classes" }, COURSES.map((c) => h("button", { class: "class-card", "data-course": c.key, onclick: () => go("class", c.key, (LESSONS[c.key] || [])[0]?.id || null) },
      h("span", { class: "code" }, codes[c.key]), h("h3", {}, c.title), h("span", { class: "meta" }, counts(c.key))))),
      h("section", { class: "panel", "aria-labelledby": "due-h" },
        h("div", { class: "panel-head" }, h("h2", { id: "due-h" }, "Due this week"),
          state.deadlines.length ? (week.length ? copyBtn : null) : h("span", { class: "example-tag" }, "Examples: import Canvas to see yours")),
        showing.length ? h("ul", { class: "due" }, showing.map((d) => {
          const dt = new Date(d.due);
          return h("li", { "data-course": d.courseKey || null },
            h("span", { class: "day" }, h("b", {}, dt.toLocaleDateString("en-US", { weekday: "short" })), dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })),
            h("div", {}, h("div", { class: "title" }, d.title), h("div", { class: "row" }, h("span", { class: "muted", style: "font-size:.85rem" }, labelOf(d)), dueChip(d.due))),
            d.kind === "scholarship" ? h("button", { class: "btn small", onclick: () => go("scholarships", null, d.scholarshipId) }, "Work on it") :
            d.courseKey && !d.example ? (d.kind === "quiz"
              ? h("button", { class: "btn small", onclick: () => go("class", d.courseKey, "quiz-" + d.id) }, "Practice test")
              : h("button", { class: "btn small", onclick: () => { state.builder = { assignment: d }; go("class", d.courseKey, "build"); } }, "Prep")) : null,
            !d.example ? doneButton(d) : null);
        })) : h("p", { class: "muted" }, state.deadlines.length ? "Nothing left due in the next 7 days. 🎉" : "Nothing due in the next 7 days. 🎉"),
        (() => {
          const end = Date.now() + 7 * 864e5;
          const doneWeek = state.deadlines.filter((d) => dlDone(d) && new Date(d.due).getTime() > Date.now() - 3 * 864e5 && new Date(d.due).getTime() < end);
          return doneWeek.length ? h("details", { class: "done-list" }, h("summary", {}, `✓ ${doneWeek.length} done this week`),
            h("ul", { class: "due" }, doneWeek.map((d) => h("li", { "data-course": d.courseKey || null, class: "is-done" },
              h("span", { class: "day" }, h("b", {}, new Date(d.due).toLocaleDateString("en-US", { weekday: "short" }))),
              h("div", {}, h("div", { class: "title" }, d.title), h("span", { class: "muted", style: "font-size:.85rem" }, labelOf(d))),
              h("button", { class: "linkish", onclick: () => markDeadline(d, false) }, "Undo"))))) : null;
        })(),
        openDeadlines().length > week.length ? h("p", { class: "muted", style: "margin:0;font-size:.9rem" }, `${openDeadlines().length - week.length} more after this week.`) : null,
        state.deadlinesUpdatedAt && Date.now() - new Date(state.deadlinesUpdatedAt) > 6 * 864e5
          ? h("p", { class: "note", style: "margin:0" }, `Your Canvas dates were last updated ${new Date(state.deadlinesUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Re-import (below) so new assignments show up.`) : null),
    resumePanel(),
    statsPanel(),
    h("div", { class: "split even" }, chromePanel(), canvasPanel()));
}

function canvasPanel() {
  const status = h("div");
  const fileInput = h("input", { type: "file", id: "ics-file", accept: ".ics,text/calendar", hidden: true });
  const handle = async (file) => {
    if (!file) return;
    try {
      const r = importIcs(await file.text());
      status.replaceChildren(h("p", { class: "note good" }, `Imported ${r.upcoming} upcoming due dates (of ${r.total} events).`));
      setTimeout(render, 900);
    } catch (e) {
      status.replaceChildren(h("p", { class: "note bad" }, e.message));
    }
  };
  fileInput.addEventListener("change", () => handle(fileInput.files[0]));
  const drop = h("div", { class: "drop" }, h("b", {}, "Drop your Canvas calendar file here"),
    h("button", { class: "btn small", onclick: () => fileInput.click() }, "Choose .ics file"), fileInput);
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); handle(e.dataTransfer.files[0]); });

  const updated = state.deadlines.length ? h("p", { class: "note good", style: "margin:0" }, `✓ ${state.deadlines.length} Canvas due dates loaded. Re-import each week to stay current.`) : null;

  return h("section", { class: "panel", "aria-labelledby": "canvas-h" },
    h("h2", { id: "canvas-h" }, "Due dates only: calendar file"),
    updated,
    h("ol", { class: "steps" },
      h("li", {}, "Open ", h("a", { href: "https://utahtech.instructure.com/calendar", target: "_blank", rel: "noopener" }, "Canvas Calendar"), "."),
      h("li", {}, "Bottom right, click ", h("b", {}, "Calendar Feed"), ", then click the link. A ", h("code", {}, ".ics"), " file downloads."),
      h("li", {}, "Drop that file below. Your due dates for every class load in.")),
    drop, status,
    h("p", { class: "muted", style: "margin:0;font-size:.88rem" }, "For readings: open a class, choose ", h("b", {}, "Add from Canvas"), ", and upload the PDF or paste the page text."),
    h("details", {}, h("summary", { class: "muted", style: "cursor:pointer;font-size:.9rem" }, "Add a due date by hand"), manualForm()));
}

function manualForm() {
  const title = h("input", { id: "m-title", placeholder: "Assignment name" });
  const course = h("select", { id: "m-course" }, COURSES.map((c) => h("option", { value: c.key }, c.title)));
  const due = h("input", { id: "m-due", type: "datetime-local" });
  return h("form", { class: "form-grid", style: "margin-top:.6rem", onsubmit: (e) => {
    e.preventDefault();
    if (!title.value.trim() || !due.value) return;
    state.deadlines.push({ id: "m-" + uid(), manual: true, title: title.value.trim(), courseKey: course.value, due: new Date(due.value).toISOString(), description: "" });
    state.deadlines.sort((a, b) => new Date(a.due) - new Date(b.due));
    saveDeadlines();
    render();
  } }, h("label", { for: "m-title" }, "Name", title), h("label", { for: "m-course" }, "Class", course), h("label", { for: "m-due" }, "Due", due),
    h("div", {}, h("button", { class: "btn small", type: "submit" }, "Add")));
}

/* ---------- weekly reading notes ---------- */
// Group a class's readings by module/week, newest week first.
function readingWeeks(courseKey) {
  const groups = new Map();
  for (const r of state.readings[courseKey] || []) {
    if (!groups.has(r.module)) groups.set(r.module, []);
    groups.get(r.module).push(r);
  }
  const num = (m) => Number(/(?:week|module|unit|wk)\s*(\d+)/i.exec(m)?.[1]);
  const latest = (list) => Math.max(...list.map((r) => new Date(r.addedAt).getTime() || 0));
  return [...groups.entries()].map(([module, list]) => ({ module, list, key: `${courseKey}|${module}` }))
    .sort((a, b) => (num(b.module) - num(a.module)) || (latest(b.list) - latest(a.list)));
}

function weekNotesContext(courseKey) {
  const w = readingWeeks(courseKey)[0];
  const n = w && state.weekNotes[w.key];
  return n ? `They're reviewing their weekly reading notes for "${w.module}". Must-know points: ${n.mustKnow.join(" | ")}` : "";
}

async function summarizeWeek(courseKey, week, onProgress) {
  const course = courseOf(courseKey);
  const budget = Math.floor(60000 / week.list.length);
  const due = openDeadlines().filter((d) => d.courseKey === courseKey && new Date(d.due) > new Date() && new Date(d.due) - Date.now() < 14 * 864e5)
    .map((d) => `- ${d.title} (due ${new Date(d.due).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })})`).join("\n");
  const prompt = `You are ${course.tutor}. A busy college student has these readings for "${week.module}" in ${course.title}. Read all of them and tell her what she actually needs to know, so she could discuss them in class, write about them, and answer quiz questions without rereading everything.

Rules:
- Bullets are short (one line, under 25 words), specific, and in plain language. Name the author, framework, or example when it matters.
- Only use what's in the readings. Don't invent quotes, page numbers, or facts.
- "useIt" says how the reading connects to her upcoming work, if it does.

Upcoming work in this class:
${due || "(none listed)"}

Reply with JSON only:
{
  "overview": "2-3 sentences: what this week is about and why it matters",
  "mustKnow": ["6-10 bullets: the most important ideas across all the readings"],
  "readings": [{ "title": "exact reading title", "points": ["3-6 bullets"], "useIt": "one sentence, or empty" }],
  "terms": [["term", "plain definition"]],
  "questions": ["3-4 questions she should be able to answer or discuss"]
}

--- READINGS ---
${week.list.map((r) => `### ${r.title}${r.kind ? ` (${r.kind})` : ""}\n${r.text.slice(0, budget)}`).join("\n\n")}`;
  let chars = 0;
  const data = await sample.json(prompt, { cache: false, modelTier: "default", onText: ({ text }) => onProgress?.((chars = text.length)) });
  const arr = (x) => (Array.isArray(x) ? x : []);
  return {
    overview: String(data.overview || ""),
    mustKnow: arr(data.mustKnow).map(String).slice(0, 12),
    readings: arr(data.readings).map((r) => ({ title: String(r?.title || ""), points: arr(r?.points).map(String).slice(0, 8), useIt: String(r?.useIt || "") })),
    terms: arr(data.terms).filter((t) => Array.isArray(t) && t[0]).map((t) => [String(t[0]), String(t[1] || "")]).slice(0, 12),
    questions: arr(data.questions).map(String).slice(0, 6),
    readingIds: week.list.map((r) => r.id + ":" + r.text.length),
    createdAt: new Date().toISOString(),
  };
}

function weekNotesText(module, n) {
  return [`${module}`, "", n.overview, "", "What to know:", ...n.mustKnow.map((b) => `- ${b}`), "",
    ...n.readings.flatMap((r) => [r.title, ...r.points.map((b) => `- ${b}`), r.useIt ? `  Use it: ${r.useIt}` : "", ""]),
    n.terms.length ? "Terms:" : "", ...n.terms.map(([t, d]) => `- ${t}: ${d}`), "",
    n.questions.length ? "Be ready to answer:" : "", ...n.questions.map((q) => `- ${q}`)].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
}

function weeklyNotesView(courseKey) {
  const course = courseOf(courseKey);
  const el = h("article", { class: "lesson notes" });
  const draw = () => {
    const ws = readingWeeks(courseKey);
    el.replaceChildren(...[
      h("span", { class: "eyebrow" }, course.title),
      h("h1", {}, "Weekly reading notes"),
      h("p", { class: "muted", style: "margin:0" }, "Claude reads everything assigned for a week and gives you bullet points of what to know. Readings come in from Canvas with Claude in Chrome, or add one below."),
      ws.length ? null : h("p", { class: "note" }, "No readings yet. On the Home page, use ", h("b", {}, "Claude in Chrome → Copy the prompt"), " to bring this week's readings in from Canvas, or add one below."),
      ws.map((w, i) => weekCard(w, i === 0)),
      addReadingForm()].flat());
  };
  const weekCard = (w, open) => {
    const n = state.weekNotes[w.key];
    const ids = w.list.map((r) => r.id + ":" + r.text.length);
    const stale = n && ids.some((id) => !n.readingIds.includes(id));
    const body = h("div", { class: "week-body" });
    const status = h("p", { class: "muted", role: "status", style: "margin:0" });
    const run = async () => {
      if (!sample) return status.replaceChildren(h("span", { class: "bad" }, "Open Study Hub in Claude to summarize readings."));
      btn.disabled = true;
      status.textContent = `Claude is reading ${w.list.length} reading${w.list.length === 1 ? "" : "s"}. This takes about a minute…`;
      try {
        state.weekNotes[w.key] = await summarizeWeek(courseKey, w, (c) => (status.textContent = `Writing your notes… ${c.toLocaleString()} characters`));
        saveWeekNotes();
        note(`Summarized the readings for ${w.module}.`);
        draw();
      } catch (e) {
        btn.disabled = false;
        status.replaceChildren(h("span", { class: "bad" }, sampleErrorText(e)));
      }
    };
    const btn = h("button", { class: n ? "btn quiet small" : "btn small", onclick: run }, n ? (stale ? "Update with new readings" : "Redo notes") : "✨ Summarize this week");
    if (n) body.append(...[
      n.overview ? h("p", {}, n.overview) : null,
      h("h3", {}, "What to know"), h("ul", { class: "points" }, n.mustKnow.map((b) => h("li", {}, b))),
      n.readings.map((r) => {
        const src = w.list.find((x) => x.title === r.title);
        return h("details", { class: "reading-notes" }, h("summary", {}, r.title),
          h("ul", { class: "points" }, r.points.map((b) => h("li", {}, b))),
          r.useIt ? h("p", { class: "note", style: "margin:.3rem 0 0" }, "Use it: ", r.useIt) : null,
          src?.url ? h("a", { href: src.url, target: "_blank", rel: "noopener", style: "font-size:.88rem" }, "Open the original ↗") : null);
      }),
      n.terms.length ? h("details", { class: "reading-notes" }, h("summary", {}, `Key terms (${n.terms.length})`),
        h("dl", { class: "defs" }, n.terms.map(([t, d]) => [h("dt", {}, t), h("dd", {}, d)]))) : null,
      n.questions.length ? [h("h3", {}, "Be ready to answer"), h("ul", { class: "points" }, n.questions.map((q) => h("li", {}, q,
        " ", h("button", { class: "linkish", onclick: () => tutor.ask(`Quiz me on this from my ${w.module} readings: "${q}". Let me answer first, then tell me what I got right and what I missed.`) }, "Practice with the tutor"))))] : null,
      h("p", { class: "muted", style: "font-size:.85rem;margin:.4rem 0 0" }, `Made ${new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. `,
        h("button", { class: "linkish", onclick: async (e) => { try { await navigator.clipboard.writeText(weekNotesText(w.module, n)); e.target.textContent = "Copied ✓"; } catch { showOops("Couldn't copy. Select the notes and copy them instead."); } } }, "Copy notes"))].flat(2));
    return h("details", { class: "week", open: open || null },
      h("summary", {}, h("b", {}, w.module), h("span", { class: "muted" }, ` · ${w.list.length} reading${w.list.length === 1 ? "" : "s"}${n ? (stale ? " · new readings" : " · notes ready ✓") : ""}`)),
      h("p", { class: "muted", style: "margin:.2rem 0;font-size:.88rem" }, w.list.map((r) => r.title).join(" · ")),
      h("div", { class: "row" }, btn,
        h("button", { class: "linkish", onclick: () => { if (!confirm(`Remove all ${w.list.length} readings for ${w.module} from your notes?`)) return; state.readings[courseKey] = state.readings[courseKey].filter((r) => r.module !== w.module); delete state.weekNotes[w.key]; saveReadings(courseKey); saveWeekNotes(); draw(); } }, "Remove week")),
      status, body);
  };
  const addReadingForm = () => {
    let fileText = "";
    const wk = h("input", { id: "rn-week", value: weekOf(new Date()), list: "rn-weeks" });
    const weeksList = h("datalist", { id: "rn-weeks" }, readingWeeks(courseKey).map((w) => h("option", { value: w.module })));
    const title = h("input", { id: "rn-title", placeholder: "e.g. Chapter 3: Ethical decision making" });
    const text = h("textarea", { id: "rn-text", rows: 5, placeholder: "Paste the reading here, or upload a PDF below…" });
    const file = h("input", { id: "rn-file", type: "file", accept: "application/pdf,.pdf,.txt,text/plain" });
    const msg = h("p", { class: "muted", role: "status", style: "margin:0" });
    file.addEventListener("change", async () => {
      const f = file.files[0]; if (!f) return;
      msg.textContent = "Reading the file…";
      try {
        fileText = /pdf/i.test(f.type) || /\.pdf$/i.test(f.name) ? await pdfToText(f) : await f.text();
        if (!title.value) title.value = f.name.replace(/\.[^.]+$/, "");
        msg.textContent = fileText.length > 200 ? `Read ${fileText.split(/\s+/).length.toLocaleString()} words.` : "I couldn't find text in that file (it may be scanned). Paste the text instead.";
      } catch (e) { msg.textContent = `Couldn't read that file: ${e.message}`; }
    });
    return h("details", { class: "week add-reading" }, h("summary", {}, h("b", {}, "+ Add a reading yourself")),
      h("div", { class: "form-grid" }, h("label", { for: "rn-week" }, "Week", wk, weeksList), h("label", { for: "rn-title" }, "Title", title)),
      h("label", { for: "rn-text" }, "Text", text), h("label", { for: "rn-file" }, "Or upload a PDF", file), msg,
      h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => {
        const body = (text.value.trim() || fileText).trim();
        if (body.length < 80) { msg.textContent = "Add the reading first: paste at least a paragraph or upload a PDF."; return; }
        keepReading(courseKey, { title: title.value.trim() || "Reading", module: wk.value.trim() || weekOf(new Date()), text: body, kind: fileText && !text.value.trim() ? "pdf" : "page" });
        draw();
      } }, "Save reading")));
  };
  draw();
  return el;
}

function classView() {
  const course = courseOf(state.course);
  const builtIn = LESSONS[state.course] || [];
  const mine = state.lessons.filter((l) => l.courseKey === state.course);
  const upcoming = openDeadlines().filter((d) => d.courseKey === state.course && new Date(d.due) > new Date()).slice(0, 6);
  const worksheets = state.worksheets.filter((w) => w.courseKey === state.course);
  if (!state.lessonId && !builtIn.length && (state.readings[state.course] || []).length) state.lessonId = "notes";
  const item = (id, label, sub, onclick) => h("button", {
    class: `item${state.progress[`${state.course}:${id}`]?.done ? " is-done" : ""}`, "aria-current": state.lessonId === id ? "true" : null, onclick,
  }, label, sub ? h("small", {}, sub) : null);

  const side = state.course === "explore" && state.explore.topic ? h("nav", { class: "side", "aria-label": course.title },
    h("button", { class: "item", onclick: () => openTopic(state.explore.topic.id) }, `← Back to ${state.explore.topic.name}`),
    h("span", { class: "eyebrow" }, "Lessons and quizzes"),
    topicLessons(state.explore.topic).map((l) => item(l.id, l.title, new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }), () => go("class", "explore", l.id))))
  : h("nav", { class: "side", "aria-label": `${course.title} lessons` },
    item("notes", "📚 Weekly reading notes", (state.readings[state.course] || []).length ? "what to know each week" : "bullet points from your readings", () => go("class", state.course, "notes")),
    FORMULAS[state.course] ? item("formulas", "📋 Formula sheet", state.course === "sql" ? "patterns for pulling data" : "equations and rules", () => go("class", state.course, "formulas")) : null,
    builtIn.length ? h("span", { class: "eyebrow" }, "Lessons") : null,
    builtIn.map((l) => item(l.id, l.title, null, () => go("class", state.course, l.id))),
    h("span", { class: "eyebrow" }, "🌱 Your learning path"),
    pathLessons(state.course).map((l) => item(l.id, l.title, `made ${new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, () => go("class", state.course, l.id))),
    pathControl(state.course),
    h("span", { class: "eyebrow" }, "From your Canvas"),
    mine.filter((l) => !l.path).map((l) => item(l.id, l.title, l.source, () => go("class", state.course, l.id))),
    state.inbox.filter((r) => r.courseKey === state.course).map((r) => item("inbox-" + r.id, r.title, "New from Canvas: tap to build",
      () => { state.builder = { reading: r }; go("class", state.course, "inbox-" + r.id); })),
    item("build", "+ Add from Canvas", "PDF or page text", () => { state.builder = null; go("class", state.course, "build"); }),
    worksheets.length ? h("span", { class: "eyebrow" }, "Worksheets") : null,
    worksheets.map((w) => item("ws-" + w.id, w.title, w.assignment || "fill in with the tutor", () => go("class", state.course, "ws-" + w.id))),
    upcoming.length ? h("span", { class: "eyebrow" }, "Coming up") : null,
    upcoming.map((d) => h("div", { class: "side-row" }, item((d.kind === "quiz" ? "quiz-" : "prep-") + d.id, d.title,
      `${d.kind === "quiz" ? "Quiz · " : ""}${new Date(d.due).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
      () => { if (d.kind === "quiz") go("class", state.course, "quiz-" + d.id); else { state.builder = { assignment: d }; go("class", state.course, "build"); } }),
      h("button", { class: "side-done", title: "Mark done", "aria-label": `Mark ${d.title} done`, onclick: () => markDeadline(d, true) }, "✓"))));

  const stage = h("main", { class: "stage" });
  // Caught up on this class? Start the next lesson in the background (once per visit).
  if (sample && state.course !== "explore" && pathCaughtUp(state.course) && !state.pathBuilding[state.course] && !pathAutoTried.has(state.course)) {
    pathAutoTried.add(state.course);
    const key = state.course;
    setTimeout(() => buildNextLesson(key, { quiet: true }), 1200);
  }
  const ws = currentWorksheet();
  const quiz = state.lessonId?.startsWith("quiz-") ? state.deadlines.find((d) => "quiz-" + d.id === state.lessonId) : null;
  if (state.lessonId === "formulas") stage.append(h("article", { class: "lesson" }, h("h1", {}, "Formula sheet"), formulaSheet(state.course),
    state.course === "sql" ? h("section", { class: "block" }, h("h2", {}, "The data"), dataSheets()) : null));
  else if (state.lessonId === "notes") stage.append(weeklyNotesView(state.course));
  else if (ws) stage.append(worksheetView(ws));
  else if (quiz) stage.append(practiceTestView(quiz));
  else if (state.lessonId === "build" || state.lessonId?.startsWith("inbox-") || (!state.lessonId && !builtIn.length)) stage.append(builderView());
  else {
    const lesson = currentLesson();
    if (lesson) {
      stage.append(renderLesson(lesson));
      const g = state.lessons.find((l) => l.id === state.lessonId);
      if (g) stage.querySelector(".lesson").append(h("p", { class: "muted", style: "font-size:.88rem" }, `Built from “${g.source}”. `,
        h("button", { class: "linkish", onclick: () => { deletedLessons.push(g.id); state.lessons = state.lessons.filter((x) => x.id !== g.id); saveLessons(); if (state.course === "explore" && state.explore.topic) openTopic(state.explore.topic.id); else go("class", state.course, "build"); } }, "Delete this lesson")));
    } else stage.append(builderView());
  }

  if (state.course === "sql" && !stage.querySelector("#b-title")) stage.prepend(schemaDock());
  const view = h("div", { class: "classview" }, side, stage, tutor.mount());
  document.body.append(h("button", { class: "btn fab", onclick: () => { document.body.classList.add("tutor-open"); tutor.input.focus(); } }, "Ask the tutor"));
  tutor.draw();
  return view;
}

function builderView() {
  const course = courseOf(state.course);
  const a = state.builder?.assignment;
  const reading = state.builder?.reading;
  let mode = "pdf";
  let pdfText = "";
  const status = h("div");
  const title = h("input", { id: "b-title", value: a ? a.title : reading ? reading.title : "", placeholder: course.key === "accounting" ? "e.g. Chapter 4: Adjusting entries" : "e.g. Week 5 reading" });
  const paste = h("textarea", { id: "b-text", rows: 10, placeholder: "Paste the Canvas page, reading, or assignment instructions here…" }, a?.description || reading?.text || "");
  const file = h("input", { id: "b-file", type: "file", accept: "application/pdf,.pdf,.txt,text/plain" });
  const fileRow = h("label", { for: "b-file" }, "PDF from Canvas (one chapter works best)", file);
  const pasteRow = h("label", { for: "b-text" }, a ? "Assignment instructions (from Canvas)" : "Text from Canvas", paste);
  const segBtns = ["pdf", "paste"].map((m) => h("button", { type: "button", "aria-pressed": String(m === mode), onclick: () => setMode(m) }, m === "pdf" ? "Upload PDF" : "Paste text"));
  const setMode = (m) => { mode = m; segBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(["pdf", "paste"][i] === m))); fileRow.hidden = m !== "pdf"; pasteRow.hidden = m !== "paste"; };
  setMode(a || reading ? "paste" : "pdf");

  file.addEventListener("change", async () => {
    const f = file.files[0];
    if (!f) return;
    status.replaceChildren(h("p", { class: "note" }, "Reading the file…"));
    try {
      pdfText = /pdf/i.test(f.type) || /\.pdf$/i.test(f.name) ? await pdfToText(f) : await f.text();
      if (!title.value) title.value = f.name.replace(/\.[^.]+$/, "");
      status.replaceChildren(h("p", { class: `note ${pdfText.length > 200 ? "good" : "bad"}` }, pdfText.length > 200
        ? `Read ${pdfText.split(/\s+/).length.toLocaleString()} words.${pdfText.length > 40000 ? " That's long; I'll use about the first 6,000 words. Upload one chapter for the best lesson." : ""}`
        : "I couldn't find text in that PDF (it may be scanned images). Paste the text instead."));
    } catch (e) {
      status.replaceChildren(h("p", { class: "note bad" }, `Couldn't read that file: ${e.message}`));
    }
  });

  const go_ = h("button", { class: "btn", onclick: async () => {
    const text = (mode === "pdf" ? pdfText : paste.value).trim();
    if (!sample) return status.replaceChildren(h("p", { class: "note bad" }, "Open this page in Claude to build lessons."));
    if (text.length < 80 && !a) return status.replaceChildren(h("p", { class: "note bad" }, "Add the reading first: upload a PDF or paste at least a paragraph."));
    const ctl = new AbortController();
    const progress = h("p", { class: "muted" }, "Claude is reading it. This usually takes 30–90 seconds.");
    stage.replaceChildren(h("div", { class: "working" }, h("div", { class: "spinner" }), h("b", {}, `Building “${title.value || "your lesson"}”…`), progress,
      h("button", { class: "btn quiet small", onclick: () => ctl.abort() }, "Stop")));
    try {
      const { data, truncatedInput } = await buildLesson({
        courseKey: state.course, title: title.value || "Canvas reading", assignment: a,
        text: text || `(No instructions were posted. The assignment is titled "${a.title}".)`, signal: ctl.signal,
        onProgress: (n) => (progress.textContent = `Writing the lesson… ${n.toLocaleString()} characters so far`),
      });
      if (a) data.title = `Prep: ${a.title}`;
      const rec = { id: "g-" + uid(), courseKey: state.course, title: data.title, source: a ? "assignment prep" : (title.value || "Canvas reading") + (truncatedInput ? " (first part)" : ""), createdAt: new Date().toISOString(), data };
      state.lessons.push(rec);
      saveLessons();
      if (!a && !reading) keepReading(state.course, { title: title.value || data.title, text, kind: mode === "pdf" ? "pdf" : "page" });
      if (reading) { state.inbox = state.inbox.filter((x) => x.id !== reading.id); saveInbox(); }
      state.builder = null;
      go("class", state.course, rec.id);
    } catch (e) {
      stage.replaceChildren(wrap);
      status.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e)));
    }
  } }, a ? "Build my prep lesson" : "Build lesson");

  const wrap = h("div", { class: "lesson builder" },
    h("span", { class: "eyebrow" }, course.title),
    h("div", { class: "row" }, h("h1", { style: "flex:1" }, a ? `Prep: ${a.title}` : reading ? reading.title : "Add from Canvas"),
      a && a.id ? (dlDone(a) ? h("button", { class: "btn quiet small", onclick: () => markDeadline(a, false) }, "↩ Not done yet") : h("button", { class: "btn small", onclick: () => markDeadline(a, true) }, "✓ I turned this in")) : null),
    reading ? h("p", { class: "note good", style: "margin:0" }, `Pulled from Canvas${reading.module ? ` (${reading.module})` : ""} by Claude in Chrome. Press Build lesson to turn it into a short interactive lesson. `,
      reading.url ? h("a", { href: reading.url, target: "_blank", rel: "noopener" }, reading.kind === "link" ? "Open the original link ↗" : "Open the original ↗") : null) : null,
    h("p", { class: "muted", style: "margin:0" }, a
      ? `Due ${new Date(a.due).toLocaleString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}. Paste the instructions (Canvas usually includes them) and I'll build a lesson on what you need to know to do it well.`
      : "Upload a reading or paste a Canvas page. Claude pulls out the objectives, key points, definitions and practice so you don't have to read everything."),
    a?.url ? h("a", { href: a.url, target: "_blank", rel: "noopener" }, "Open the assignment in Canvas ↗") : null,
    h("section", { class: "block" },
      h("div", { class: "seg", role: "group", "aria-label": "Source" }, segBtns),
      h("label", { for: "b-title" }, "Title", title), fileRow, pasteRow, status, h("div", { class: "row" }, go_)));
  const stage = h("div", {}, wrap);
  return stage;
}

/* ---------- if something breaks, say so instead of failing silently ---------- */
addEventListener("error", (e) => showOops(e.message));
addEventListener("unhandledrejection", (e) => showOops(e.reason?.message || String(e.reason)));
function showOops(msg) {
  if (!msg || document.querySelector(".oops")) return;
  document.body.append(h("div", { class: "oops", role: "alert" },
    h("b", {}, "Something went wrong. "), "Refresh the page to try again. If it keeps happening, tell Claude this message: ", h("code", {}, String(msg).slice(0, 200)),
    h("button", { class: "linkish", onclick: (e) => e.currentTarget.parentElement.remove() }, "Dismiss")));
  setTimeout(() => document.querySelector(".oops")?.remove(), 15000); // never leave it sitting over the page
}

/* ---------- boot ---------- */
render();
loadState().then(render);

// Stay on today's date: redraw when the day changes, and pick up fresh data when you come back.
let shownDay = dayKey();
const refreshIfNewDay = () => {
  if (dayKey() === shownDay) return;
  shownDay = dayKey();
  loadState().then(() => { if (state.view === "home") render(); });
};
setInterval(refreshIfNewDay, 60000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (dayKey() !== shownDay) refreshIfNewDay();
  else if (state.view === "home") loadState().then(render); // an import on another device shows up here
});
