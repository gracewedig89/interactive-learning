import { h } from "./lesson.js";

const icons = { accounting: "🧾", sql: "🗄️", "language-arts": "✍️" };
const fmt = (d) => new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const status = await fetch("/api/status").then((r) => r.json());

document.getElementById("courses").replaceChildren(
  ...status.courses.map((c) =>
    h(
      "a",
      { class: "card", href: `/course.html?c=${c.key}` },
      h("div", { class: "card-icon" }, icons[c.key] || "📘"),
      h("h3", {}, c.title),
      h("p", {}, c.blurb),
      h("span", { class: `badge ${c.canvas ? "on" : ""}` }, c.canvas ? `Canvas: ${c.canvas.course_code || c.canvas.name}` : "Not linked to Canvas yet")
    )
  )
);

const due = document.getElementById("due");
if (!status.canvas) {
  due.replaceChildren(h("p", { class: "muted" }, "Connect Canvas to see due dates here."));
} else {
  fetch("/api/upcoming?days=7")
    .then((r) => r.json())
    .then((items) => {
      if (items.error) throw new Error(items.error);
      due.replaceChildren(
        items.length
          ? h("ul", { class: "due-list" }, items.map((i) =>
              h("li", {},
                h("span", { class: "when" }, fmt(i.due)),
                h("span", { class: "what" }, h("b", {}, i.title), h("small", {}, i.courseName)),
                i.courseKey && i.assignmentId
                  ? h("a", { class: "btn", href: `/prep.html?course=${i.courseKey}&id=${i.assignmentId}` }, "Prep with tutor")
                  : i.canvasUrl ? h("a", { class: "btn ghost", href: i.canvasUrl, target: "_blank" }, "Open in Canvas") : null)))
          : h("p", { class: "muted" }, "Nothing due in the next 7 days. 🎉")
      );
    })
    .catch((e) => due.replaceChildren(h("p", { class: "feedback bad" }, `Couldn't load Canvas: ${e.message}`)));
}

const steps = [
  [status.claude, "AI tutor", "Add ANTHROPIC_API_KEY to .env to turn on the chat tutor and Canvas lessons."],
  [status.canvas && !status.canvasError, "Canvas", status.canvasError || "Add CANVAS_TOKEN to .env (Canvas → Account → Settings → New Access Token)."],
  [status.sms, "Text reminders", "Add your Twilio keys and SMS_TO to .env to get texts."],
];
if (steps.some(([ok]) => !ok)) {
  document.getElementById("setup").replaceChildren(
    h("h2", {}, "Finish setup"),
    h("ul", { class: "setup" }, steps.map(([ok, name, help]) => h("li", { class: ok ? "good" : "" }, ok ? "✓ " : "○ ", h("b", {}, name), ok ? " connected" : ` — ${help}`))),
    h("p", { class: "muted" }, "Step-by-step instructions are in the README.")
  );
}
