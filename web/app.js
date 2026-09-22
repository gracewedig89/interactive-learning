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
const md = (t) => DOMPurify.sanitize(marked.parse(t || ""));
const money = (n) => (typeof n === "number" ? "$" + n.toLocaleString("en-US") : "");
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- classes ---------- */
const COURSES = [
  { key: "accounting", title: "Accounting", match: /acc(oun)?t/i, tutor: "an accounting tutor for an introductory financial accounting college course" },
  { key: "sql", title: "SQL", match: /sql|database|\bdb\b|data management|information systems|\b(ISA|IT|CS|IS|CIS|DBA|MIS)[\s-]?\d{4}/i, tutor: "a SQL and database tutor for ISA 2050 Management Information Systems, a college MIS course" },
  { key: "language-arts", title: "Language Arts 3010", match: /3010|language arts|professional writing|\bengl\b/i, tutor: "a writing tutor for ENGL 3010 Professional Writing and Business Ethics, covering professional and business writing, audience and purpose, document design, and ethical reasoning in business" },
  { key: "biology", title: "Biology 1010", match: /\bbiol|biology/i, tutor: "a biology tutor for BIOL 1010 General Biology, an introductory life-science college course" },
];
const courseOf = (key) => COURSES.find((c) => c.key === key);
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

/* ---------- storage: private db docs, falling back to this browser ---------- */
const local = {
  get(k) { try { return JSON.parse(localStorage.getItem("studyhub:" + k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem("studyhub:" + k, JSON.stringify(v)); } catch {} },
};
const store = {
  async get(name) {
    if (db) {
      try { const s = await db.doc(`data/users/${me}/${name}`).get(); if (s.exists) return s.data(); } catch (e) { console.warn(e); }
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
  inbox: [],         // readings brought in from Claude in Chrome, not built into lessons yet: {id, courseKey, title, text, module}
};

async function loadState() {
  await ready;
  const [d, l, p] = await Promise.all([store.get("deadlines"), store.get("lessons"), store.get("progress")]);
  state.progress = p?.lessons || {};
  state.inbox = (await store.get("inbox"))?.items || [];
  state.worksheets = (await store.get("worksheets"))?.items || [];
  state.stats = (await store.get("stats")) || { days: {} };
  state.stats.days ||= {};
  state.deadlines = (d?.items || []).map(normalizeDeadline);
  state.deadlinesUpdatedAt = d?.updatedAt || null;
  state.lessons = l?.items || [];
  state.chats = local.get("chats") || {};
}
const saveDeadlines = () => { state.deadlinesUpdatedAt = new Date().toISOString(); return store.set("deadlines", { items: state.deadlines, updatedAt: state.deadlinesUpdatedAt }); };
let progressTimer;
const saveProgress = () => { clearTimeout(progressTimer); progressTimer = setTimeout(() => store.set("progress", { lessons: state.progress }), 600); };
let statsTimer;
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function bumpStat(courseKey, add) {
  if (!courseKey) return;
  const day = (state.stats.days[dayKey()] ||= {});
  const rec = (day[courseKey] ||= {});
  for (const [k, v] of Object.entries(add)) rec[k] = (rec[k] || 0) + v;
  clearTimeout(statsTimer);
  statsTimer = setTimeout(() => store.set("stats", state.stats), 1500);
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
const saveLessons = () => store.set("lessons", { items: state.lessons });
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

// Re-match classes (new classes get picked up) and spot quizzes/exams by name.
function normalizeDeadline(x) {
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
      "readings": [{ "module": "module name", "title": "title", "kind": "page" | "pdf" | "link" | "ebook", "url": "where it lives", "notes": "your detailed study notes" }],
      "assignments": [{ "title": "...", "due": "ISO 8601 date with time zone offset, like 2026-09-24T23:59:00-06:00", "instructions": "full instructions", "url": "link to it in Canvas" }],
      "worksheets": [{ "assignment": "title of the assignment it belongs to", "title": "worksheet title", "instructions": "instructions printed on it", "sections": [{ "heading": "section heading", "fields": [{ "label": "the exact question or blank", "type": "short" | "paragraph" | "number" | "journal", "rows": 4 }] }] }],
      "quizzes": [{ "title": "...", "due": "ISO 8601 with offset", "covers": "topics or chapters listed on the quiz page", "details": "instructions, number of questions, time limit, attempts", "url": "link" }]
    }
  ]
}
Use "journal" for accounting journal-entry tables (rows = number of blank lines) and leave "rows" out for other types.`;

function parsePack(text) {
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
  const skipped = [];
  for (const c of pack.courses) {
    const courseKey = guessCourse(String(c.course || ""));
    if (!courseKey) { skipped.push(c.course); continue; }
    for (const r of c.readings || []) {
      if (!r?.notes || String(r.notes).length < 40) continue;
      const title = String(r.title || "Reading").slice(0, 140);
      state.inbox = state.inbox.filter((x) => !(x.courseKey === courseKey && x.title === title));
      state.inbox.push({ id: "r-" + uid(), courseKey, title, module: String(r.module || ""), kind: String(r.kind || "page"), url: String(r.url || ""),
        text: String(r.notes).slice(0, 30000), addedAt: new Date().toISOString() });
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
    !ok && miss && sample ? h("button", { class: "linkish", onclick: () => practice.make([miss]) }, "Practice this") : null);
}
const note = (t) => state.activity.push(t);

/* ---------- progress: lesson completion and what you missed ---------- */
// state.progress[lessonKey] = { courseKey, title, total, solved, firstTryRight, done, completedAt, missed: [{concept, detail}], practice }
let track = null;
const lessonKey = () => `${state.course}:${state.lessonId}`;
function newTracker(lesson) {
  const key = lessonKey();
  const saved = (state.progress[key] ||= { courseKey: state.course, title: lesson.title, missed: [] });
  saved.title = lesson.title;
  const t = {
    key, saved, count: 0, solved: new Set(), first: new Map(), listeners: [],
    add() { return "i" + this.count++; },
    attempt(id, ok, miss) {
      const isFirst = !this.first.has(id);
      bumpStat(state.course, { q: 1, right: ok ? 1 : 0, first: isFirst ? 1 : 0, firstRight: isFirst && ok ? 1 : 0 });
      if (isFirst) this.first.set(id, ok);
      if (!ok && miss && !saved.missed.some((m) => m.concept === miss.concept)) {
        saved.missed = [...saved.missed, miss].slice(-20);
      }
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
      saved.done = true;
      saved.completedAt = new Date().toISOString();
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
    h("ul", { class: "defs" }, b.items.map(([t, d]) => h("li", {}, h("b", {}, t), ": ", d)))),

  classify(b) {
    let right = 0;
    const score = h("span", {}, `0 / ${b.items.length}`);
    return h("section", { class: "block" },
      h("div", { class: "panel-head" }, h("h2", {}, b.title || "Sort it"), h("span", { class: "muted" }, "Score: ", score)),
      b.items.map((item) => {
        const slot = h("div", { class: "fbslot" });
        const id = track.add();
        let counted = false;
        const btns = b.categories.map((cat) => h("button", { class: "choice", onclick: (e) => {
          const ok = cat === item.answer;
          btns.forEach((x) => x.classList.remove("right", "wrong"));
          e.currentTarget.classList.add(ok ? "right" : "wrong");
          const miss = { concept: `"${item.label}" is ${item.answer}`, detail: `I sorted "${item.label}" as ${cat}.` };
          slot.replaceChildren(feedback(ok, ok ? item.why : "Try another.", `I thought "${item.label}" was ${cat}. Why is that wrong?`, miss));
          note(`Sorted "${item.label}" as ${cat} (${ok ? "right" : "wrong"}).`);
          track.attempt(id, ok, miss);
          if (ok && !counted) { counted = true; score.textContent = `${++right} / ${b.items.length}`; }
        } }, cat));
        return h("div", { class: "sort-row" }, h("b", {}, item.label), h("div", { class: "choices" }, btns), slot);
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
        const btns = ["debit", "credit"].map((side) => h("button", { class: "choice", "aria-label": `${entry.account}: ${side}`, onclick: () => {
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
          note(`"${row.transaction}": ${entry.account} as ${side} (${ok ? "right" : "wrong"}).`);
          track.attempt(id, ok, miss);
          if (picks.size === row.entries.length) {
            const all = row.entries.every((e) => picks.get(e) === e.side);
            const sum = (s) => row.entries.filter((e) => e.side === s).reduce((t, e) => t + (e.amount || 0), 0);
            status.replaceChildren(all
              ? h("span", { style: "color: var(--good)" }, `✓ Balanced: debits ${money(sum("debit"))} = credits ${money(sum("credit"))}`)
              : h("span", { style: "color: var(--bad)" }, "Some sides are off. Fix the red ones."));
          }
        } }, side === "debit" ? "Dr" : "Cr"));
        body.append(h("tr", {}, h("td", { class: "acct" }, entry.account, why), h("td", { class: "pick" }, btns), dr, cr));
      }
      body.append(h("tr", {}, status));
    }
    return h("section", { class: "block" }, h("h2", {}, b.title || "Debit or credit?"),
      h("p", { class: "muted", style: "margin:0" }, "Pick Dr (debit, left) or Cr (credit, right) for each account. The amount moves into that column."),
      h("div", { class: "scroll" }, h("table", { class: "journal" },
        h("thead", {}, h("tr", {}, h("th", {}, "Account"), h("th", {}, "Your pick"), h("th", {}, "Debit"), h("th", {}, "Credit"))), body)));
  },

  quiz: (b) => h("section", { class: "block" }, h("h2", {}, b.title || "Check yourself"), b.intro ? h("p", { style: "margin:0" }, b.intro) : null, b.items.map((q) => {
    const slot = h("div");
    const id = track.add();
    const hint = q.hint ? h("p", { class: "note", hidden: true }, "💡 ", q.hint) : null;
    return h("div", { class: "quiz" }, h("b", {}, q.question),
      hint ? h("div", {}, h("button", { class: "linkish", onclick: (e) => { hint.hidden = false; e.currentTarget.remove(); } }, "Show a hint"), hint) : null,
      h("div", { class: "options" }, q.options.map((opt, i) =>
      h("button", { class: "choice", onclick: (e) => {
        const ok = i === q.answerIndex;
        e.currentTarget.classList.add(ok ? "right" : "wrong");
        const miss = { concept: q.question, detail: `I picked "${opt}" instead of "${q.options[q.answerIndex]}".` };
        slot.replaceChildren(feedback(ok, ok ? q.explanation : "Try another option.", `Quiz: "${q.question}" I picked "${opt}". Why is that wrong?`, miss));
        note(`Quiz "${q.question}": picked "${opt}" (${ok ? "right" : "wrong"}).`);
        track.attempt(id, ok, miss);
      } }, opt))), slot);
  })),

  practice: (b) => h("section", { class: "block" }, h("h2", {}, "Explain it back"), b.prompts.map((p, i) => {
    const box = h("textarea", { rows: 4, id: `practice-${i}`, placeholder: "Answer in your own words…" });
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
    const run = async () => {
      const q = editor.value.trim();
      if (!q) return;
      tries++;
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
        note(`SQL "${task.prompt}": \`${q}\` (${ok ? "right" : "wrong"}).`);
        track.attempt(tid, ok, miss);
      } catch (e) {
        const tip = sqlErrorTip(e.message);
        out.replaceChildren(h("div", { class: "fb bad" }, h("b", {}, "SQL error: "), e.message, tip ? h("p", { style: "margin:.35rem 0 0" }, "💡 ", tip) : null,
          h("button", { class: "linkish", onclick: () => tutor.ask(`Task: "${task.prompt}"\nMy query:\n${q}\nError: ${e.message}\nWhat does this mean and how do I fix it?`) }, "Ask the tutor")));
        note(`SQL "${task.prompt}": error ${e.message}`);
        track.attempt(tid, false, { concept: task.prompt, detail: `My query ${q} failed: ${e.message}` });
      }
      if (tries >= 2) reveal.hidden = false;
    };
    editor.addEventListener("keydown", (e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && run());
    return h("div", { class: "sql-task" }, h("label", { for: id }, `${n + 1}. ${task.prompt}`),
      hint ? h("div", {}, h("button", { class: "linkish", onclick: (e) => { hint.hidden = false; e.currentTarget.remove(); } }, "Show a hint"), hint) : null, editor,
      h("div", { class: "row" }, h("button", { class: "btn small", onclick: run }, "Run ▸"), h("span", { class: "muted" }, "Ctrl/⌘ + Enter"), reveal), out);
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
    const totals = {};
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
        if (!silent) lastChecked = v;
        const ok = v === correct;
        const miss = { concept: `${label} for ${data.company}`, detail: `I entered ${money(v)}. How to get it: ${howTo}.` };
        fb.replaceChildren(feedback(ok, ok ? howTo : `Not ${money(v)}. ${howTo}.`, `On ${data.company}'s statements I got ${label} = ${money(v)}. How do I work it out? Don't just give me the number.`, miss));
        if (!silent) track.attempt(tid, ok, miss);
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
      sel.addEventListener("change", () => {
        if (!sel.value) return;
        picks.set(a, sel.value);
        const ok = sel.value === placeOf(a);
        const miss = { concept: `Where ${a.name} goes on the financial statements`, detail: `I put it under "${PLACES.find((p) => p[0] === sel.value)[1]}".` };
        fb.replaceChildren(feedback(ok, ok ? PLACE_WHY[placeOf(a)] : "Try another spot.", `Why doesn't ${a.name} go under "${PLACES.find((p) => p[0] === sel.value)[1]}"?`, miss));
        note(`Placed ${a.name} under ${sel.value} (${ok ? "right" : "wrong"}).`);
        track.attempt(tid, ok, miss);
        renderPreview();
      });
      return h("tr", {}, h("td", {}, a.name, fb), h("td", { class: "amt" }, money(a.balance)), h("td", {}, sel));
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
  draw(b);
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
    draw({ company: String(data.company || "Practice Company"), period: String(data.period || "year ended December 31"), accounts: accts });
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
  const article = h("article", { class: "lesson" },
    h("div", { class: "row" }, h("h1", { style: "flex:1" }, lesson.title), done ? h("span", { class: "chip done" }, "✓ Completed") : null),
    lesson.blocks.map((b) => RENDER[b.type]?.(b)));
  practice.area = h("div", { class: "lesson", id: "extra-practice" });
  article.append(practice.area, progressBlock());
  if (track.saved.practice) practice.show(track.saved.practice, false);
  return article;
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
        !s.done ? h("button", { class: "btn quiet", onclick: () => track.complete(false) }, "Mark lesson complete") : null,
        s.missed.length ? h("button", { class: "linkish", onclick: () => { s.missed = []; saveProgress(); draw(); } }, "Clear list") : null));
  };
  track.listeners.push(draw);
  draw();
  return el;
}

/* ---------- extra practice from mistakes ---------- */
const practice = {
  area: null,
  async make(misses) {
    if (!sample || !this.area) return;
    const course = courseOf(state.course);
    const lesson = currentLesson();
    const ctl = new AbortController();
    this.area.replaceChildren(h("section", { class: "block working" }, h("div", { class: "spinner" }),
      h("b", {}, "Making practice questions for what you missed…"), h("button", { class: "btn quiet small", onclick: () => ctl.abort() }, "Stop")));
    this.area.scrollIntoView({ behavior: "smooth", block: "start" });
    const prompt = [
      `You are ${course.tutor}. A student is working through the lesson "${lesson?.title}".`,
      `Lesson objectives: ${lesson?.blocks.find((b) => b.type === "objectives")?.text || ""}`,
      "They got these wrong:",
      ...misses.map((m, i) => `${i + 1}. ${m.concept}. ${m.detail}`),
      "Write a short practice set that helps them actually understand these ideas, not memorize answers. Break each idea into smaller steps: start with an easier question that isolates the core rule, then build to applying it in a new situation. Use fresh examples, not the same ones they missed. Every item gets a hint that nudges their thinking (a question to ask themselves) without giving the answer, and an explanation that walks through the reasoning.",
      state.course === "accounting" ? "Include 2-4 debitCredit transactions (debits equal credits) plus 3-5 quiz questions." : "",
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
      track.saved.practice = set;
      bumpStat(state.course, { practice: 1 });
      saveProgress();
      this.show(set, true);
    } catch (e) {
      this.area.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e)));
    }
  },
  show(set, scroll) {
    const blocks = [];
    if (set.debitCredit?.length) blocks.push({ type: "debitCredit", title: "Practice: debit or credit?", rows: set.debitCredit });
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

async function buildLesson({ courseKey, title, text, assignment, signal, onProgress }) {
  const course = courseOf(courseKey);
  const material = text.slice(0, 40000);
  const prompt = [
    `You are ${course.tutor}. Write an interactive study lesson from the student's actual course material below.`,
    assignment
      ? `This is an upcoming assignment ("${assignment.title}", due ${new Date(assignment.due).toLocaleString()}). Build a PREP lesson: teach what they need to know to do it well. Do not complete the assignment for them.`
      : `Source: "${title}". Pull out only what matters most so the student doesn't have to read all of it.`,
    courseKey === "accounting" ? "Include 3-5 debitCredit transactions that fit the material; debits must equal credits in each." : "Leave debitCredit empty.",
    courseKey === "sql" ? `Include 3-5 sqlExercises answerable against this SQLite practice database (solutions must run on it):\n${PRACTICE.schema}` : "Leave sqlExercises empty.",
    "Include 4-10 definitions, 3-6 quiz questions (answerIndex is 0-based), and 1-3 practicePrompts.",
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
    default: return "Something went wrong reaching Claude. Try again.";
  }
}

/* ---------- Claude: tutor chat ---------- */
const tutor = {
  el: null, log: null, input: null, sendBtn: null, busy: false, ctl: null,
  mount() {
    this.log = h("div", { class: "log", "aria-live": "polite" });
    this.input = h("textarea", { id: "tutor-input", rows: 2, placeholder: "Ask anything… (Enter to send)", "aria-label": "Message the tutor" });
    this.sendBtn = h("button", { class: "btn", onclick: () => this.send() }, "Send");
    this.input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.send(); } });
    this.el = h("aside", { class: "tutor", "aria-label": "Tutor" },
      h("header", {}, h("h2", {}, "Tutor"),
        h("button", { class: "linkish", onclick: () => { state.chats[state.course] = []; saveChats(); this.draw(); } }, "Clear"),
        h("button", { class: "btn quiet small close", onclick: () => document.body.classList.remove("tutor-open"), "aria-label": "Close tutor" }, "✕")),
      this.log, h("div", { class: "composer" }, this.input, this.sendBtn));
    return this.el;
  },
  get turns() { return (state.chats[state.course] ||= []); },
  draw() {
    if (!this.log) return;
    const turns = this.turns;
    this.log.replaceChildren(...(turns.length ? turns.map((m) => this.bubble(m)) : [h("p", { class: "muted" },
      sample ? "Stuck? Ask me anything about this lesson. When you get something wrong, tap “Ask the tutor why” and I'll explain."
             : "The tutor works when this page is open in Claude (claude.ai or the Claude app).")]));
    this.log.scrollTop = this.log.scrollHeight;
  },
  bubble(m) {
    return m.role === "assistant" ? h("div", { class: "msg assistant", html: md(m.content || "…") }) : h("div", { class: "msg user" }, m.content);
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
      currentWorksheet() ? worksheetContext(currentWorksheet()) : "",
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
    if (!text || this.busy) return;
    if (!sample) { this.turns.push({ role: "user", content: text }, { role: "assistant", content: "_Open this page in Claude to chat with the tutor._" }); this.draw(); return; }
    this.busy = true;
    this.sendBtn.disabled = true;
    this.input.value = "";
    const turns = this.turns;
    turns.push({ role: "user", content: text });
    const reply = { role: "assistant", content: "" };
    this.draw();
    const bubble = this.bubble({ role: "assistant", content: "_Thinking…_" });
    this.log.append(bubble);
    this.log.scrollTop = this.log.scrollHeight;
    const history = turns.slice(-16).filter((t) => t.content);
    this.ctl = new AbortController();
    try {
      const { text: full, truncated } = await sample([{ role: "user", content: this.context() }, ...history], {
        cache: false, signal: this.ctl.signal,
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

function statsPanel() {
  const now = new Date(Date.now() + 1);
  const wk = statsFor(startOfDay(-6), now), prev = statsFor(startOfDay(-13), startOfDay(-6));
  const hasAny = Object.keys(state.stats.days).length > 0;
  const tile = (label, value, d) => h("div", { class: "tile" }, h("span", { class: "tile-label" }, label), h("span", { class: "tile-value" }, value), d);
  const s = streak();

  // Minutes per day, last 14 days
  const days = Array.from({ length: 14 }, (_, i) => { const d = startOfDay(i - 13); return { d, secs: statsFor(d, startOfDay(i - 12)).secs, q: statsFor(d, startOfDay(i - 12)).q }; });
  const max = Math.max(30 * 60, ...days.map((x) => x.secs));
  const niceMax = Math.ceil(max / 60 / 15) * 15; // minutes, rounded to 15
  const Wd = 560, Ht = 150, padL = 34, padB = 22, padT = 8, bw = (Wd - padL) / 14;
  const y = (min) => padT + (Ht - padT - padB) * (1 - min / niceMax);
  const tip = h("div", { class: "tip", hidden: true, role: "status" });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${Wd} ${Ht}`);
  svg.setAttribute("class", "chart");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Minutes studied per day, last 14 days. Total ${fmtTime(days.reduce((t, x) => t + x.secs, 0))}.`);
  const el = (tag, attrs) => { const n = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) n.setAttribute(k, attrs[k]); svg.append(n); return n; };
  for (const m of [0, niceMax / 3, (niceMax * 2) / 3, niceMax]) {
    el("line", { x1: padL, x2: Wd, y1: y(m), y2: y(m), class: m ? "grid" : "axis" });
    const t = el("text", { x: padL - 6, y: y(m) + 4, class: "tick", "text-anchor": "end" }); t.textContent = Math.round(m);
  }
  days.forEach((x, i) => {
    const min = x.secs / 60;
    const bx = padL + i * bw + 3, w = bw - 6, top = y(min), base = y(0);
    if (min > 0) {
      const r = Math.min(4, w / 2, base - top);
      el("path", { class: "bar", d: `M${bx},${base} V${top + r} Q${bx},${top} ${bx + r},${top} H${bx + w - r} Q${bx + w},${top} ${bx + w},${top + r} V${base} Z` });
    }
    if (i % 2 === 1 || i === 13) { const t = el("text", { x: bx + w / 2, y: Ht - 6, class: "tick", "text-anchor": "middle" }); t.textContent = i === 13 ? "Today" : x.d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }); }
    const hit = el("rect", { x: padL + i * bw, y: padT, width: bw, height: Ht - padT - padB, class: "hit", tabindex: 0 });
    const show = () => {
      tip.hidden = false;
      tip.textContent = `${x.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}: ${fmtTime(x.secs)} studied, ${x.q} answer${x.q === 1 ? "" : "s"}`;
      const frac = (padL + i * bw + bw / 2) / Wd;
      tip.style.left = `${frac * 100}%`;
      tip.style.transform = `translateX(${frac > 0.7 ? -100 : frac < 0.3 ? 0 : -50}%)`; // keep it inside the panel
    };
    hit.addEventListener("pointerenter", show); hit.addEventListener("focus", show);
    hit.addEventListener("pointerleave", () => (tip.hidden = true)); hit.addEventListener("blur", () => (tip.hidden = true));
  });

  const rows = COURSES.map((c) => {
    const a = statsFor(startOfDay(-6), now, c.key), b = statsFor(startOfDay(-13), startOfDay(-6), c.key);
    const all = Object.values(state.progress).filter((p) => p.courseKey === c.key);
    const pa = pct(a), pb = pct(b);
    return h("tr", {},
      h("th", { scope: "row" }, c.title),
      h("td", { class: "num" }, a.secs ? fmtTime(a.secs) : "–"),
      h("td", { class: "num" }, pa == null ? "–" : `${pa}%`),
      h("td", { class: "num" }, pb == null ? "–" : `${pb}%`),
      h("td", {}, pa != null && pb != null && pa !== pb ? h("span", { class: `delta ${pa > pb ? "up" : "down"}` }, `${pa > pb ? "▲" : "▼"} ${Math.abs(pa - pb)} pts`) : h("span", { class: "delta flat" }, "–")),
      h("td", { class: "num" }, String(all.filter((p) => p.done).length)),
      h("td", { class: "num" }, String(all.reduce((t, p) => t + (p.missed?.length || 0), 0))));
  });

  return h("section", { class: "panel stats", "aria-labelledby": "stats-h" },
    h("div", { class: "panel-head" }, h("h2", { id: "stats-h" }, "Your learning"),
      h("span", { class: "muted" }, s ? `🔥 ${s}-day streak` : "Last 7 days")),
    !hasAny ? h("p", { class: "note", style: "margin:0" }, "Open a lesson and answer a few questions. Your study time, accuracy, and improvement show up here.") : null,
    h("div", { class: "tiles" },
      tile("Study time", fmtTime(wk.secs), delta(wk.secs ? Math.round(wk.secs / 60) : 0, prev.secs || prev.q ? Math.round(prev.secs / 60) : null, " min")),
      tile("Questions answered", String(wk.q), delta(wk.q, prev.q || prev.secs ? prev.q : null, "")),
      tile("Right on first try", pct(wk) == null ? "–" : `${pct(wk)}%`, delta(pct(wk), pct(prev), " pts")),
      tile("Lessons completed", String(wk.done), h("span", { class: "delta flat" }, `${wk.practice} practice set${wk.practice === 1 ? "" : "s"}`))),
    h("div", { class: "chart-wrap" }, h("span", { class: "tile-label" }, "Minutes studied per day"), svg, tip),
    h("div", { class: "scroll" }, h("table", { class: "stats-table" },
      h("caption", {}, "By class. “First try” is the share of questions you got right on your first attempt; change is this week vs last week."),
      h("thead", {}, h("tr", {}, ["Class", "Time (7d)", "First try (7d)", "Prior 7d", "Change", "Lessons done", "To review"].map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, rows))));
}

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
      h("button", { class: "tab", "aria-current": state.course === c.key ? "page" : null, onclick: () => go("class", c.key, (LESSONS[c.key] || [])[0]?.id || null) }, c.title))));
}

function render() {
  document.body.classList.remove("tutor-open");
  document.body.querySelector(".fab")?.remove();
  app.replaceChildren(topbar(), state.view === "home" ? homeView() : classView());
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
  return state.deadlines.filter((d) => { const t = new Date(d.due).getTime(); return t > Date.now() - 864e5 && t < end; });
}

function homeView() {
  const week = thisWeek();
  const showing = state.deadlines.length ? week : EXAMPLES;
  const labelOf = (d) => courseOf(d.courseKey)?.title || d.courseLabel || "Other";
  const counts = (key) => {
    const n = state.deadlines.filter((d) => d.courseKey === key && new Date(d.due) > new Date()).length;
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
    h("div", { class: "classes" }, COURSES.map((c) => h("button", { class: "class-card", onclick: () => go("class", c.key, (LESSONS[c.key] || [])[0]?.id || null) },
      h("span", { class: "code" }, codes[c.key]), h("h3", {}, c.title), h("span", { class: "meta" }, counts(c.key))))),
      h("section", { class: "panel", "aria-labelledby": "due-h" },
        h("div", { class: "panel-head" }, h("h2", { id: "due-h" }, "Due this week"),
          state.deadlines.length ? (week.length ? copyBtn : null) : h("span", { class: "example-tag" }, "Examples: import Canvas to see yours")),
        showing.length ? h("ul", { class: "due" }, showing.map((d) => {
          const dt = new Date(d.due);
          return h("li", {},
            h("span", { class: "day" }, h("b", {}, dt.toLocaleDateString("en-US", { weekday: "short" })), dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })),
            h("div", {}, h("div", { class: "title" }, d.title), h("div", { class: "row" }, h("span", { class: "muted", style: "font-size:.85rem" }, labelOf(d)), dueChip(d.due))),
            d.courseKey && !d.example ? (d.kind === "quiz"
              ? h("button", { class: "btn small", onclick: () => go("class", d.courseKey, "quiz-" + d.id) }, "Practice test")
              : h("button", { class: "btn small", onclick: () => { state.builder = { assignment: d }; go("class", d.courseKey, "build"); } }, "Prep")) : null);
        })) : h("p", { class: "muted" }, "Nothing due in the next 7 days. 🎉"),
        state.deadlines.length > week.length ? h("p", { class: "muted", style: "margin:0;font-size:.9rem" }, `${state.deadlines.length - week.length} more after this week.`) : null,
        state.deadlinesUpdatedAt && Date.now() - new Date(state.deadlinesUpdatedAt) > 6 * 864e5
          ? h("p", { class: "note", style: "margin:0" }, `Your Canvas dates were last updated ${new Date(state.deadlinesUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Re-import (below) so new assignments show up.`) : null),
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

function classView() {
  const course = courseOf(state.course);
  const builtIn = LESSONS[state.course] || [];
  const mine = state.lessons.filter((l) => l.courseKey === state.course);
  const upcoming = state.deadlines.filter((d) => d.courseKey === state.course && new Date(d.due) > new Date()).slice(0, 6);
  const worksheets = state.worksheets.filter((w) => w.courseKey === state.course);
  const item = (id, label, sub, onclick) => h("button", {
    class: `item${state.progress[`${state.course}:${id}`]?.done ? " is-done" : ""}`, "aria-current": state.lessonId === id ? "true" : null, onclick,
  }, label, sub ? h("small", {}, sub) : null);

  const side = h("nav", { class: "side", "aria-label": `${course.title} lessons` },
    FORMULAS[state.course] ? item("formulas", "📋 Formula sheet", state.course === "sql" ? "patterns for pulling data" : "equations and rules", () => go("class", state.course, "formulas")) : null,
    builtIn.length ? h("span", { class: "eyebrow" }, "Lessons") : null,
    builtIn.map((l) => item(l.id, l.title, null, () => go("class", state.course, l.id))),
    h("span", { class: "eyebrow" }, "From your Canvas"),
    mine.map((l) => item(l.id, l.title, l.source, () => go("class", state.course, l.id))),
    state.inbox.filter((r) => r.courseKey === state.course).map((r) => item("inbox-" + r.id, r.title, "New from Canvas: tap to build",
      () => { state.builder = { reading: r }; go("class", state.course, "inbox-" + r.id); })),
    item("build", "+ Add from Canvas", "PDF or page text", () => { state.builder = null; go("class", state.course, "build"); }),
    worksheets.length ? h("span", { class: "eyebrow" }, "Worksheets") : null,
    worksheets.map((w) => item("ws-" + w.id, w.title, w.assignment || "fill in with the tutor", () => go("class", state.course, "ws-" + w.id))),
    upcoming.length ? h("span", { class: "eyebrow" }, "Coming up") : null,
    upcoming.map((d) => item((d.kind === "quiz" ? "quiz-" : "prep-") + d.id, d.title,
      `${d.kind === "quiz" ? "Quiz · " : ""}${new Date(d.due).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
      () => { if (d.kind === "quiz") go("class", state.course, "quiz-" + d.id); else { state.builder = { assignment: d }; go("class", state.course, "build"); } })));

  const stage = h("main", { class: "stage" });
  const ws = currentWorksheet();
  const quiz = state.lessonId?.startsWith("quiz-") ? state.deadlines.find((d) => "quiz-" + d.id === state.lessonId) : null;
  if (state.lessonId === "formulas") stage.append(h("article", { class: "lesson" }, h("h1", {}, "Formula sheet"), formulaSheet(state.course),
    state.course === "sql" ? h("section", { class: "block" }, h("h2", {}, "The data"), dataSheets()) : null));
  else if (ws) stage.append(worksheetView(ws));
  else if (quiz) stage.append(practiceTestView(quiz));
  else if (state.lessonId === "build" || state.lessonId?.startsWith("inbox-") || (!state.lessonId && !builtIn.length)) stage.append(builderView());
  else {
    const lesson = currentLesson();
    if (lesson) {
      stage.append(renderLesson(lesson));
      const g = state.lessons.find((l) => l.id === state.lessonId);
      if (g) stage.querySelector(".lesson").append(h("p", { class: "muted", style: "font-size:.88rem" }, `Built from “${g.source}”. `,
        h("button", { class: "linkish", onclick: () => { state.lessons = state.lessons.filter((x) => x.id !== g.id); saveLessons(); go("class", state.course, "build"); } }, "Delete this lesson")));
    } else stage.append(builderView());
  }

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
    h("h1", {}, a ? `Prep: ${a.title}` : reading ? reading.title : "Add from Canvas"),
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
