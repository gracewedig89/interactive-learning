import { h, renderLesson, fromGenerated } from "./lesson.js";
import { createChat } from "./chat.js";

// Assignment prep page: the link in reminder texts lands here.
const params = new URLSearchParams(location.search);
const key = params.get("course");
const id = params.get("id");
const main = document.getElementById("main");
const status = await fetch("/api/status").then((r) => r.json());
const course = status.courses.find((c) => c.key === key);
document.getElementById("course-title").textContent = course?.title || "";
document.getElementById("nav").append(h("a", { href: `/course.html?c=${key}` }, "← Back to ", course?.title || "class"));

let info = null;
const chat = createChat({
  course: key,
  mount: document.getElementById("chat-mount"),
  getContext: () =>
    info
      ? `Course: ${course.title}\nWe're prepping for the assignment "${info.assignment.name}" due ${info.assignment.due_at || "(no date)"}.\nLesson objectives: ${info.lesson.objectives}`
      : "",
});

main.replaceChildren(h("div", { class: "loading" }, h("div", { class: "spinner" }), h("p", {}, "Reading your assignment and building a prep lesson…")));
try {
  const res = await fetch(`/api/courses/${key}/prep/${id}`);
  info = await res.json();
  if (!res.ok) throw new Error(info.error);
  const { assignment } = info;
  const lesson = fromGenerated(info.lesson);
  lesson.title = `Prep: ${assignment.name}`;
  main.replaceChildren(
    h("div", { class: "prep-head" },
      h("span", {}, assignment.due_at ? `Due ${new Date(assignment.due_at).toLocaleString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "No due date"),
      assignment.points ? h("span", {}, `${assignment.points} pts`) : null,
      h("a", { href: assignment.url, target: "_blank" }, "Open in Canvas ↗")),
    renderLesson(lesson, chat),
    h("section", { class: "block" }, h("h2", {}, "Work on it together"),
      h("p", {}, "When you're ready, start the assignment and ask me as you go. I'll walk you through it step by step."),
      h("button", { class: "primary", onclick: () => chat.ask(`I'm starting "${assignment.name}". Help me plan how to approach it, step by step.`) }, "Start with the tutor"))
  );
} catch (e) {
  main.replaceChildren(h("div", { class: "feedback bad" }, `Couldn't load this assignment: ${e.message}`));
}
