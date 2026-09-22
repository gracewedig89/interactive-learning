import fs from "node:fs";
import express from "express";
import * as canvas from "./canvas.js";
import { COURSES, findCourse, canvasCourseMap } from "./courses.js";
import { streamTutor, buildLesson, claudeConfigured } from "./claude.js";
import { startScheduler, smsConfigured, upcoming, weeklyDigest, checkReminders } from "./notify.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Optional password so a hosted copy isn't open to the world (username can be anything).
if (process.env.APP_PASSWORD) {
  app.use((req, res, next) => {
    const [, b64 = ""] = (req.headers.authorization || "").split(" ");
    const pass = Buffer.from(b64, "base64").toString().split(":").slice(1).join(":");
    if (pass === process.env.APP_PASSWORD) return next();
    res.set("WWW-Authenticate", 'Basic realm="Study"').status(401).send("Password required");
  });
}

const nm = new URL("../node_modules/", import.meta.url).pathname;
app.use("/vendor/sql-wasm.js", express.static(nm + "sql.js/dist/sql-wasm.js"));
app.use("/vendor/sql-wasm.wasm", express.static(nm + "sql.js/dist/sql-wasm.wasm"));
app.use("/vendor/marked.js", express.static(nm + "marked/lib/marked.esm.js"));
app.use("/vendor/purify.js", express.static(nm + "dompurify/dist/purify.es.mjs"));
app.use(express.static(new URL("../public/", import.meta.url).pathname));

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(e.status || 500).json({ error: e.message });
  });

const course = (req) => {
  const c = findCourse(req.params.key);
  if (!c) throw Object.assign(new Error("Unknown course"), { status: 404 });
  return c;
};

app.get("/api/status", wrap(async (req, res) => {
  let map = {};
  let canvasError = null;
  try {
    map = await canvasCourseMap();
  } catch (e) {
    canvasError = e.message;
  }
  res.json({
    canvas: canvas.canvasConfigured(),
    canvasError,
    claude: claudeConfigured(),
    sms: smsConfigured(),
    courses: COURSES.map(({ key, title, blurb }) => ({ key, title, blurb, canvas: map[key] || null })),
  });
}));

// Modules (readings, pages, files) + upcoming work for one dashboard course.
app.get("/api/courses/:key/canvas", wrap(async (req, res) => {
  const c = course(req);
  const cc = (await canvasCourseMap())[c.key];
  if (!cc) return res.json({ linked: false });
  const [modules, todo] = await Promise.all([canvas.listModules(cc.id), upcoming(21)]);
  res.json({
    linked: true,
    course: cc,
    modules: modules.map((m) => ({
      name: m.name,
      items: (m.items || [])
        .filter((i) => ["Page", "File", "Assignment", "Quiz", "Discussion", "ExternalUrl"].includes(i.type))
        .map((i) => ({ type: i.type, title: i.title, id: i.type === "Page" ? i.page_url : i.content_id, url: i.html_url })),
    })),
    upcoming: todo.filter((t) => t.courseId === cc.id),
  });
}));

const CACHE = new URL("../data/lessons/", import.meta.url);
async function cached(name, make) {
  const file = new URL(name.replace(/[^\w.-]/g, "_") + ".json", CACHE);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  const value = await make();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
  return value;
}

// Generates (once, then cached) an interactive lesson from a Canvas page or PDF file.
app.post("/api/courses/:key/lesson", wrap(async (req, res) => {
  const c = course(req);
  const cc = (await canvasCourseMap())[c.key];
  const { type, id, title } = req.body;
  if (!cc || !["Page", "File"].includes(type)) return res.status(400).json({ error: "Pick a Canvas page or file." });
  const lesson = await cached(`${c.key}-${type}-${id}${req.body.refresh ? "-" + Date.now() : ""}`, async () => {
    if (type === "Page") {
      const page = await canvas.getPage(cc.id, id);
      return buildLesson({ course: c, sourceTitle: page.title, text: canvas.stripHtml(page.body) });
    }
    const file = await canvas.getFile(id);
    const isPdf = /pdf/i.test(file["content-type"]) || /\.pdf$/i.test(file.display_name);
    const isText = /^text\//.test(file["content-type"]);
    if (!isPdf && !isText) throw new Error(`Can't read ${file.display_name} yet (only PDFs and text files).`);
    if (file.size > 30e6) throw new Error(`${file.display_name} is over 30 MB. Try a single chapter.`);
    const data = await canvas.downloadFile(file);
    return buildLesson({ course: c, sourceTitle: title || file.display_name, text: isText ? data.toString("utf8") : "", pdfs: isPdf ? [data] : [] });
  });
  res.json(lesson);
}));

// Prep lesson for a specific upcoming assignment (the link in reminder texts).
app.get("/api/courses/:key/prep/:id", wrap(async (req, res) => {
  const c = course(req);
  const cc = (await canvasCourseMap())[c.key];
  if (!cc) return res.status(400).json({ error: "This class isn't linked to Canvas yet." });
  const a = await canvas.getAssignment(cc.id, req.params.id);
  const lesson = await cached(`${c.key}-prep-${a.id}-${a.updated_at}`, () =>
    buildLesson({ course: c, text: canvas.stripHtml(a.description || "(no instructions posted)"), assignment: a })
  );
  res.json({ assignment: { name: a.name, due_at: a.due_at, points: a.points_possible, url: a.html_url }, lesson });
}));

app.get("/api/upcoming", wrap(async (req, res) => res.json(await upcoming(Number(req.query.days) || 7))));

// Tutor chat, streamed back as server-sent events.
app.post("/api/chat", async (req, res) => {
  const c = findCourse(req.body.course) || COURSES[0];
  if (!claudeConfigured()) return res.status(503).json({ error: "Set ANTHROPIC_API_KEY to turn on the tutor." });
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  try {
    await streamTutor({ course: c, context: req.body.context, messages: req.body.messages.slice(-30), onText: (t) => send({ t }) });
  } catch (e) {
    console.error(e);
    send({ error: e.message });
  }
  send({ done: true });
  res.end();
});

// Manual triggers, handy for testing your phone setup.
app.post("/api/notify/digest", wrap(async (req, res) => res.json(await weeklyDigest())));
app.post("/api/notify/reminders", wrap(async (req, res) => res.json((await checkReminders()) ?? { ok: true })));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Study app running at http://localhost:${port}`);
  startScheduler();
});
