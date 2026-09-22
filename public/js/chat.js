import { marked } from "/vendor/marked.js";
import DOMPurify from "/vendor/purify.js";
import { h } from "./lesson.js";

const md = (text) => DOMPurify.sanitize(marked.parse(text));
const store = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k)) || [];
    } catch {
      return [];
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v.slice(-40)));
    } catch {}
  },
};

// Tutor chat panel. `getContext()` returns what's on screen so the tutor knows where you are.
export function createChat({ course, mount, getContext }) {
  const key = `chat:${course}`;
  let messages = store.get(key);
  const activity = [];
  let busy = false;

  const log = h("div", { class: "chat-log", "aria-live": "polite" });
  const input = h("textarea", { rows: 2, placeholder: "Ask anything… (Enter to send)" });
  const sendBtn = h("button", { class: "primary", onclick: () => send() }, "Send");
  const panel = h(
    "aside",
    { class: "chat" },
    h("header", {}, h("b", {}, "Tutor"), h("button", { class: "link", onclick: () => ((messages = []), store.set(key, messages), draw()) }, "Clear"),
      h("button", { class: "link close", onclick: () => document.body.classList.remove("chat-open"), "aria-label": "Close chat" }, "✕")),
    log,
    h("div", { class: "chat-input" }, input, sendBtn)
  );
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  mount.append(panel);
  document.body.append(h("button", { class: "chat-fab", onclick: () => (document.body.classList.add("chat-open"), input.focus()) }, "💬 Tutor"));

  function bubble(m) {
    return h("div", { class: `msg ${m.role}`, html: m.role === "assistant" ? md(m.content || "…") : "" }, m.role === "user" ? m.content : "");
  }
  function draw() {
    log.replaceChildren(
      ...(messages.length ? messages.map(bubble) : [h("p", { class: "muted" }, "Stuck? Ask me anything about this lesson. If you get something wrong, hit “Ask the tutor why” and I'll explain.")])
    );
    log.scrollTop = log.scrollHeight;
  }

  async function send(text = input.value.trim()) {
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    input.value = "";
    messages.push({ role: "user", content: text });
    const reply = { role: "assistant", content: "" };
    messages.push(reply);
    draw();
    const live = log.lastElementChild;
    const context = [getContext?.(), activity.length ? `Recent activity:\n${activity.slice(-8).join("\n")}` : ""].filter(Boolean).join("\n\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, context, messages: messages.slice(0, -1) }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const p of parts) {
          const evt = JSON.parse(p.replace(/^data: /, ""));
          if (evt.t) reply.content += evt.t;
          if (evt.error) reply.content += `\n\n_Error: ${evt.error}_`;
        }
        live.innerHTML = md(reply.content || "…");
        log.scrollTop = log.scrollHeight;
      }
    } catch (e) {
      reply.content = `_Couldn't reach the tutor: ${e.message}_`;
      live.innerHTML = md(reply.content);
    }
    store.set(key, messages);
    busy = false;
    sendBtn.disabled = false;
  }

  draw();
  return {
    note: (t) => activity.push(t),
    ask(text) {
      document.body.classList.add("chat-open");
      send(text);
    },
  };
}
