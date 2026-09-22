import { h, renderLesson, fromGenerated } from "./lesson.js";
import { createChat } from "./chat.js";

const key = new URLSearchParams(location.search).get("c") || "accounting";
const status = await fetch("/api/status").then((r) => r.json());
const course = status.courses.find((c) => c.key === key);
document.title = `${course.title} · Study Hub`;
document.getElementById("course-title").textContent = course.title;

const builtIn = await import(`/lessons/${key}.js`).then((m) => m.default).catch(() => []);
const main = document.getElementById("main");
const nav = document.getElementById("nav");
let current = null;

const chat = createChat({
  course: key,
  mount: document.getElementById("chat-mount"),
  getContext: () =>
    current
      ? `Course: ${course.title}\nLesson: ${current.title}\nObjectives: ${current.blocks.find((b) => b.type === "objectives")?.text || ""}`
      : `Course: ${course.title} (browsing lessons)`,
});

function show(lesson) {
  current = lesson;
  main.replaceChildren(renderLesson(lesson, chat));
  main.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
  nav.querySelectorAll("a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === location.hash));
}

async function showCanvasLesson(type, id, title, refresh = false) {
  current = null;
  main.replaceChildren(
    h("div", { class: "loading" }, h("div", { class: "spinner" }), h("p", {}, `Reading “${title}” and building your lesson…`), h("p", { class: "muted" }, "This takes up to a minute the first time; after that it's saved."))
  );
  try {
    const res = await fetch(`/api/courses/${key}/lesson`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, title, refresh }),
    });
    const g = await res.json();
    if (!res.ok) throw new Error(g.error);
    show(fromGenerated(g));
    main.querySelector(".lesson").append(
      h("p", { class: "muted source" }, `Built from your Canvas reading “${title}”. `, h("button", { class: "link", onclick: () => showCanvasLesson(type, id, title, true) }, "Rebuild lesson"))
    );
  } catch (e) {
    main.replaceChildren(h("div", { class: "feedback bad" }, `Couldn't build that lesson: ${e.message}`));
  }
}

function route() {
  const [kind, ...rest] = location.hash.slice(1).split("/").map(decodeURIComponent);
  if (kind === "lesson") {
    const l = builtIn.find((x) => x.id === rest[0]);
    if (l) return show(l);
  }
  if (kind === "canvas") return showCanvasLesson(rest[0], rest[1], rest[2] || "reading");
  if (builtIn.length) return show(builtIn[0]);
  current = null;
  main.replaceChildren(
    h("article", { class: "lesson" }, h("h1", {}, course.title),
      h("p", {}, course.canvas
        ? "Pick a reading from your Canvas modules on the left and I'll turn it into a short lesson: objectives, key points, definitions, and practice questions."
        : "This class isn't linked to Canvas yet. Once it is, your modules and readings show up on the left and I can turn each one into a lesson."))
  );
}

// Sidebar: built-in lessons, then the class's Canvas modules.
const navLink = (href, text, extra) => h("a", { href }, text, extra);
nav.append(
  builtIn.length ? h("h3", {}, "Lessons") : null,
  ...builtIn.map((l) => navLink(`#lesson/${l.id}`, l.title))
);
const canvasBox = h("div", {}, status.canvas ? h("p", { class: "muted" }, "Loading Canvas…") : null);
nav.append(canvasBox);

if (status.canvas) {
  fetch(`/api/courses/${key}/canvas`)
    .then((r) => r.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);
      if (!data.linked) return canvasBox.replaceChildren(h("p", { class: "muted" }, "No matching Canvas course found. Set CANVAS_COURSE_" + key.toUpperCase().replace("-", "_") + " in .env."));
      const parts = [];
      if (data.upcoming.length) {
        parts.push(h("h3", {}, "Coming up"));
        for (const u of data.upcoming.slice(0, 6)) {
          parts.push(
            u.assignmentId
              ? navLink(`/prep.html?course=${key}&id=${u.assignmentId}`, u.title, h("small", {}, new Date(u.due).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })))
              : h("span", { class: "nav-item" }, u.title)
          );
        }
      }
      parts.push(h("h3", {}, "From Canvas"));
      for (const m of data.modules) {
        const items = m.items.filter((i) => ["Page", "File"].includes(i.type));
        if (!items.length) continue;
        parts.push(
          h("details", { open: data.modules.length < 4 }, h("summary", {}, m.name),
            ...items.map((i) => navLink(`#canvas/${i.type}/${encodeURIComponent(i.id)}/${encodeURIComponent(i.title)}`, i.title, h("small", {}, i.type === "File" ? "📄 reading" : "📝 page"))))
        );
      }
      canvasBox.replaceChildren(...parts);
    })
    .catch((e) => canvasBox.replaceChildren(h("p", { class: "feedback bad" }, `Canvas: ${e.message}`)));
}

window.addEventListener("hashchange", route);
route();
