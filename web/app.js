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
  { key: "sql", title: "SQL", match: /sql|database|\bdb\b|data management|\b(IT|CS|IS|CIS|DBA)[\s-]?\d{4}/i, tutor: "a SQL and relational database tutor for a college database course" },
  { key: "language-arts", title: "Language Arts 3010", match: /3010|language arts|\bengl\b|\beled\b|literacy/i, tutor: "a language arts tutor for a 3010-level college course covering reading, writing and literacy" },
];
const courseOf = (key) => COURSES.find((c) => c.key === key);
const guessCourse = (text) => COURSES.find((c) => c.match.test(text))?.key || null;

/* ---------- capabilities ---------- */
let sample = null;
let db = null;
let me = null;
const ready = (async () => {
  if (!window.claude?.use) return;
  [sample, db] = await Promise.all([claude.use("sample"), claude.use("db")]);
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
};

async function loadState() {
  await ready;
  const [d, l, p] = await Promise.all([store.get("deadlines"), store.get("lessons"), store.get("progress")]);
  state.progress = p?.lessons || {};
  state.deadlines = d?.items || [];
  state.lessons = l?.items || [];
  state.chats = local.get("chats") || {};
}
const saveDeadlines = () => store.set("deadlines", { items: state.deadlines, updatedAt: new Date().toISOString() });
let progressTimer;
const saveProgress = () => { clearTimeout(progressTimer); progressTimer = setTimeout(() => store.set("progress", { lessons: state.progress }), 600); };
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

function importIcs(text) {
  const events = parseIcs(text);
  if (!events.length) throw new Error("That file has no calendar events. Make sure it's the .ics file from Canvas Calendar Feed.");
  const cutoff = Date.now() - 2 * 864e5;
  const upcoming = events.filter((e) => new Date(e.due).getTime() > cutoff);
  const manual = state.deadlines.filter((d) => d.manual);
  state.deadlines = [...upcoming, ...manual].sort((a, b) => new Date(a.due) - new Date(b.due));
  saveDeadlines();
  return { total: events.length, upcoming: upcoming.length };
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
      if (!this.first.has(id)) this.first.set(id, ok);
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
    return h("section", { class: "block" }, h("h2", {}, "Practice database"), el);
  },

  sql: (b) => h("section", { class: "block" }, h("h2", {}, b.title || "Write the query"), b.intro ? h("p", { style: "margin:0" }, b.intro) : null, b.tasks.map((task, n) => {
    const id = `sql-${uid()}`;
    const editor = h("textarea", { class: "code", id, rows: 3, spellcheck: "false", placeholder: "SELECT …" });
    const out = h("div");
    const tid = track.add();
    const hint = task.hint ? h("p", { class: "note", hidden: true }, "💡 ", task.hint) : null;
    let tries = 0;
    const reveal = h("button", { class: "linkish", hidden: true, onclick: () => (editor.value = task.solution) }, "Show an answer");
    const run = async () => {
      const q = editor.value.trim();
      if (!q) return;
      tries++;
      try {
        const [mine, want] = await Promise.all([runQuery(q), runQuery(task.solution)]);
        const ok = sameResult(mine, want, task.ordered);
        out.replaceChildren(resultTable(mine), feedback(ok,
          ok ? "Your result matches." : `Expected ${want.rows.length} row(s) × ${want.columns.length} column(s).`,
          `Task: "${task.prompt}"\nMy query:\n${q}\nIt gives the wrong result. What's wrong?`));
        note(`SQL "${task.prompt}": \`${q}\` (${ok ? "right" : "wrong"}).`);
        track.attempt(tid, ok, { concept: task.prompt, detail: `My query was: ${q}` });
      } catch (e) {
        out.replaceChildren(h("div", { class: "fb bad" }, h("b", {}, "SQL error: "), e.message,
          h("button", { class: "linkish", onclick: () => tutor.ask(`Task: "${task.prompt}"\nMy query:\n${q}\nError: ${e.message}\nWhat does this mean?`) }, "Ask the tutor")));
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
};

function resultTable({ columns, rows }) {
  if (!columns.length) return h("p", { class: "muted" }, "Query ran. No rows returned.");
  return h("div", { class: "scroll" }, h("table", {}, h("thead", {}, h("tr", {}, columns.map((c) => h("th", {}, c)))),
    h("tbody", {}, rows.slice(0, 200).map((r) => h("tr", {}, r.map((v) => h("td", {}, v === null ? "NULL" : v)))))));
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
    return [`${done} of ${lessons} lesson${lessons === 1 ? "" : "s"} done`, review ? `${review} to review` : "", state.deadlines.length ? `${n} upcoming` : ""].filter(Boolean).join(" · ");
  };
  const codes = { accounting: "ACCT", sql: "SQL", "language-arts": "LA 3010" };

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
    h("div", { class: "split" },
      h("section", { class: "panel", "aria-labelledby": "due-h" },
        h("div", { class: "panel-head" }, h("h2", { id: "due-h" }, "Due this week"),
          state.deadlines.length ? (week.length ? copyBtn : null) : h("span", { class: "example-tag" }, "Examples: import Canvas to see yours")),
        showing.length ? h("ul", { class: "due" }, showing.map((d) => {
          const dt = new Date(d.due);
          return h("li", {},
            h("span", { class: "day" }, h("b", {}, dt.toLocaleDateString("en-US", { weekday: "short" })), dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })),
            h("div", {}, h("div", { class: "title" }, d.title), h("div", { class: "row" }, h("span", { class: "muted", style: "font-size:.85rem" }, labelOf(d)), dueChip(d.due))),
            d.courseKey && !d.example ? h("button", { class: "btn small", onclick: () => { state.builder = { assignment: d }; go("class", d.courseKey, "build"); } }, "Prep") : null);
        })) : h("p", { class: "muted" }, "Nothing due in the next 7 days. 🎉"),
        state.deadlines.length > week.length ? h("p", { class: "muted", style: "margin:0;font-size:.9rem" }, `${state.deadlines.length - week.length} more after this week.`) : null),
      canvasPanel()));
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
    h("h2", { id: "canvas-h" }, "Connect Canvas"),
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
  const upcoming = state.deadlines.filter((d) => d.courseKey === state.course && new Date(d.due) > new Date()).slice(0, 5);
  const item = (id, label, sub, onclick) => h("button", {
    class: `item${state.progress[`${state.course}:${id}`]?.done ? " is-done" : ""}`, "aria-current": state.lessonId === id ? "true" : null, onclick,
  }, label, sub ? h("small", {}, sub) : null);

  const side = h("nav", { class: "side", "aria-label": `${course.title} lessons` },
    builtIn.length ? h("span", { class: "eyebrow" }, "Lessons") : null,
    builtIn.map((l) => item(l.id, l.title, null, () => go("class", state.course, l.id))),
    h("span", { class: "eyebrow" }, "From your Canvas"),
    mine.map((l) => item(l.id, l.title, l.source, () => go("class", state.course, l.id))),
    item("build", "+ Add from Canvas", "PDF or page text", () => { state.builder = null; go("class", state.course, "build"); }),
    upcoming.length ? h("span", { class: "eyebrow" }, "Coming up") : null,
    upcoming.map((d) => item("prep-" + d.id, d.title, new Date(d.due).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      () => { state.builder = { assignment: d }; go("class", state.course, "build"); })));

  const stage = h("main", { class: "stage" });
  if (state.lessonId === "build" || (!state.lessonId && !builtIn.length)) stage.append(builderView());
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
  let mode = "pdf";
  let pdfText = "";
  const status = h("div");
  const title = h("input", { id: "b-title", value: a ? a.title : "", placeholder: course.key === "accounting" ? "e.g. Chapter 4: Adjusting entries" : "e.g. Week 5 reading" });
  const paste = h("textarea", { id: "b-text", rows: 10, placeholder: "Paste the Canvas page, reading, or assignment instructions here…" }, a?.description || "");
  const file = h("input", { id: "b-file", type: "file", accept: "application/pdf,.pdf,.txt,text/plain" });
  const fileRow = h("label", { for: "b-file" }, "PDF from Canvas (one chapter works best)", file);
  const pasteRow = h("label", { for: "b-text" }, a ? "Assignment instructions (from Canvas)" : "Text from Canvas", paste);
  const segBtns = ["pdf", "paste"].map((m) => h("button", { type: "button", "aria-pressed": String(m === mode), onclick: () => setMode(m) }, m === "pdf" ? "Upload PDF" : "Paste text"));
  const setMode = (m) => { mode = m; segBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(["pdf", "paste"][i] === m))); fileRow.hidden = m !== "pdf"; pasteRow.hidden = m !== "paste"; };
  setMode(a ? "paste" : "pdf");

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
      state.builder = null;
      go("class", state.course, rec.id);
    } catch (e) {
      stage.replaceChildren(wrap);
      status.replaceChildren(h("p", { class: "note bad" }, sampleErrorText(e)));
    }
  } }, a ? "Build my prep lesson" : "Build lesson");

  const wrap = h("div", { class: "lesson builder" },
    h("span", { class: "eyebrow" }, course.title),
    h("h1", {}, a ? `Prep: ${a.title}` : "Add from Canvas"),
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
