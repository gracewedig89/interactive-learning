import { runQuery, sameResult, schemaInfo } from "./sqlrunner.js";

// Tiny DOM helper: h("div", {class: "x", onclick}, "text", childEl)
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
  return el;
}

const money = (n) => (typeof n === "number" ? "$" + n.toLocaleString("en-US") : "");

// `tutor` = { note(text): log what the student did, ask(question): open chat with a question }
export function renderLesson(lesson, tutor) {
  const root = h("article", { class: "lesson" }, h("h1", {}, lesson.title));
  for (const block of lesson.blocks) {
    const render = RENDERERS[block.type];
    if (render) root.append(render(block, tutor, lesson));
  }
  return root;
}

function section(label, ...children) {
  return h("section", { class: "block" }, label && h("h2", {}, label), ...children);
}

function feedback(ok, why, tutor, askAbout) {
  return h(
    "div",
    { class: `feedback ${ok ? "good" : "bad"}` },
    h("b", {}, ok ? "✓ Correct. " : "✗ Not quite. "),
    why || "",
    !ok && askAbout ? h("button", { class: "link", onclick: () => tutor.ask(askAbout) }, "Ask the tutor why") : null
  );
}

const RENDERERS = {
  objectives: (b) => section("What you need to know", h("p", { class: "objectives" }, b.text)),

  text: (b) => section(null, h("div", { class: "prose", html: b.html })),

  keyPoints: (b) => section("Key points", h("ul", { class: "points" }, b.items.map((p) => h("li", {}, p)))),

  definitions: (b) =>
    section("Definitions", h("ul", { class: "defs" }, b.items.map(([term, def]) => h("li", {}, h("b", {}, term), ": ", def)))),

  classify(b, tutor) {
    let right = 0;
    const score = h("span", { class: "score" }, `0 / ${b.items.length}`);
    const rows = b.items.map((item) => {
      const fb = h("div");
      let counted = false;
      const buttons = b.categories.map((cat) =>
        h(
          "button",
          {
            class: "choice",
            onclick: (e) => {
              const ok = cat === item.answer;
              buttons.forEach((x) => x.classList.remove("picked-good", "picked-bad"));
              e.currentTarget.classList.add(ok ? "picked-good" : "picked-bad");
              fb.replaceChildren(feedback(ok, ok ? item.why : "Try again.", tutor, `I thought "${item.label}" was ${cat}. Why is that wrong?`));
              tutor.note(`Classified "${item.label}" as ${cat}: ${ok ? "correct" : "wrong"}.`);
              if (ok && !counted) {
                counted = true;
                score.textContent = `${++right} / ${b.items.length}`;
              }
            },
          },
          cat
        )
      );
      return h("div", { class: "classify-row" }, h("div", { class: "item-label" }, item.label), h("div", { class: "choices" }, buttons), fb);
    });
    return section(b.title || "Sort it", h("p", { class: "muted" }, "Score: ", score), ...rows);
  },

  debitCredit(b, tutor) {
    const body = h("tbody");
    for (const row of b.rows) {
      const status = h("td", { colspan: 4, class: "balance" });
      const picks = new Map();
      const check = () => {
        if (picks.size < row.entries.length) return;
        const allRight = row.entries.every((e) => picks.get(e) === e.side);
        status.replaceChildren(
          allRight
            ? h("span", { class: "good" }, `✓ Balanced: debits ${money(sum(row, "debit"))} = credits ${money(sum(row, "credit"))}`)
            : h("span", { class: "bad" }, "Some sides are off. Fix the red ones.")
        );
      };
      body.append(h("tr", { class: "txn" }, h("td", { colspan: 4 }, row.transaction)));
      for (const entry of row.entries) {
        const dr = h("td", { class: "amt" });
        const cr = h("td", { class: "amt" });
        const why = h("div", { class: "why" });
        const pick = (side) => {
          picks.set(entry, side);
          const ok = side === entry.side;
          const cell = side === "debit" ? dr : cr;
          dr.replaceChildren();
          cr.replaceChildren();
          dr.className = cr.className = "amt";
          cell.append(money(entry.amount) || side);
          cell.classList.add(ok ? "good-cell" : "bad-cell");
          why.replaceChildren(
            feedback(ok, ok ? entry.why : `${entry.account} doesn't go on the ${side} side here.`, tutor,
              `For "${row.transaction}", I put ${entry.account} as a ${side}. Why is that wrong?`)
          );
          tutor.note(`"${row.transaction}": put ${entry.account} as ${side} (${ok ? "correct" : "wrong"}).`);
          check();
        };
        body.append(
          h(
            "tr",
            {},
            h("td", { class: "acct" }, entry.account, why),
            h("td", { class: "pick" }, h("button", { class: "choice", onclick: () => pick("debit") }, "Dr"), h("button", { class: "choice", onclick: () => pick("credit") }, "Cr")),
            dr,
            cr
          )
        );
      }
      body.append(h("tr", {}, status));
    }
    return section(
      b.title || "Debit or credit?",
      h("p", { class: "muted" }, "For each account, pick Dr (debit, left) or Cr (credit, right). The amount moves into that column."),
      h("div", { class: "table-wrap" }, h("table", { class: "journal" }, h("thead", {}, h("tr", {}, h("th", {}, "Account"), h("th", {}, "Your pick"), h("th", {}, "Debit"), h("th", {}, "Credit"))), body))
    );
  },

  quiz(b, tutor) {
    return section(
      "Check yourself",
      b.items.map((q) => {
        const fb = h("div");
        return h(
          "div",
          { class: "quiz" },
          h("p", {}, h("b", {}, q.question)),
          h(
            "div",
            { class: "options" },
            q.options.map((opt, i) =>
              h("button", {
                class: "choice",
                onclick: (e) => {
                  const ok = i === q.answerIndex;
                  e.currentTarget.classList.add(ok ? "picked-good" : "picked-bad");
                  fb.replaceChildren(feedback(ok, ok ? q.explanation : "", tutor, `Quiz: "${q.question}". I picked "${opt}". Why is that wrong?`));
                  tutor.note(`Quiz "${q.question}": picked "${opt}" (${ok ? "correct" : "wrong"}).`);
                },
              }, opt)
            )
          ),
          fb
        );
      })
    );
  },

  practice(b, tutor) {
    return section(
      "Explain it back",
      b.prompts.map((p) => {
        const box = h("textarea", { rows: 4, placeholder: "Type your answer…" });
        return h(
          "div",
          { class: "practice" },
          h("p", {}, p),
          box,
          h("button", { class: "primary", onclick: () => box.value.trim() && tutor.ask(`Practice question: "${p}"\n\nMy answer: ${box.value.trim()}\n\nIs this right? What am I missing?`) }, "Check with tutor")
        );
      })
    );
  },

  schema() {
    const el = h("div", { class: "schema" }, "Loading practice database…");
    schemaInfo().then((tables) =>
      el.replaceChildren(
        ...tables.map((t) =>
          h(
            "div",
            { class: "schema-table" },
            h("b", {}, t.name),
            h("ul", {}, t.columns.map((c) => {
              const fk = t.fks.find((f) => f.from === c.name);
              return h("li", {}, h("code", {}, c.name), c.pk ? " 🔑" : "", fk ? ` → ${fk.table}` : "");
            }))
          )
        )
      )
    );
    return section("Practice database", el);
  },

  sql(b, tutor) {
    return section(
      b.title || "Write the query",
      b.tasks.map((task, n) => {
        const editor = h("textarea", { class: "code", rows: 3, spellcheck: "false", placeholder: "SELECT …" });
        const out = h("div", { class: "sql-out" });
        let tries = 0;
        const reveal = h("button", { class: "link", hidden: true, onclick: () => (editor.value = task.solution) }, "Show an answer");
        const run = async () => {
          const sql = editor.value.trim();
          if (!sql) return;
          tries++;
          try {
            const [mine, expected] = await Promise.all([runQuery(sql), runQuery(task.solution)]);
            const ok = sameResult(mine, expected, task.ordered);
            out.replaceChildren(
              resultTable(mine),
              feedback(ok, ok ? "Your result matches." : `Expected ${expected.rows.length} row(s) × ${expected.columns.length} column(s). Compare and try again.`, tutor,
                `Task: "${task.prompt}"\nMy query:\n${sql}\nIt doesn't give the right result. What's wrong?`)
            );
            tutor.note(`SQL task "${task.prompt}": ran \`${sql}\` (${ok ? "correct" : "wrong"}).`);
          } catch (e) {
            out.replaceChildren(
              h("div", { class: "feedback bad" }, h("b", {}, "SQL error: "), e.message, " ",
                h("button", { class: "link", onclick: () => tutor.ask(`Task: "${task.prompt}"\nMy query:\n${sql}\nError: ${e.message}\nWhat does this mean?`) }, "Ask the tutor"))
            );
            tutor.note(`SQL task "${task.prompt}": error ${e.message}`);
          }
          if (tries >= 2) reveal.hidden = false;
        };
        editor.addEventListener("keydown", (e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && run());
        return h("div", { class: "sql-task" }, h("p", {}, h("b", {}, `${n + 1}. `), task.prompt), editor, h("div", { class: "row" }, h("button", { class: "primary", onclick: run }, "Run ▸"), h("span", { class: "muted" }, "Ctrl/⌘ + Enter"), reveal), out);
      }),
      h("details", { class: "sandbox" }, h("summary", {}, "Free practice: run any query"), sandbox())
    );
  },
};

function sum(row, side) {
  return row.entries.filter((e) => e.side === side).reduce((s, e) => s + (e.amount || 0), 0);
}

function resultTable({ columns, rows }) {
  if (!columns.length) return h("p", { class: "muted" }, "Query ran. No rows returned.");
  return h(
    "div",
    { class: "table-wrap" },
    h("table", { class: "result" }, h("thead", {}, h("tr", {}, columns.map((c) => h("th", {}, c)))),
      h("tbody", {}, rows.slice(0, 200).map((r) => h("tr", {}, r.map((v) => h("td", {}, v === null ? "NULL" : v))))))
  );
}

function sandbox() {
  const editor = h("textarea", { class: "code", rows: 4, spellcheck: "false" }, "SELECT * FROM customers;");
  const out = h("div");
  const run = async () => {
    try {
      out.replaceChildren(resultTable(await runQuery(editor.value)));
    } catch (e) {
      out.replaceChildren(h("div", { class: "feedback bad" }, e.message));
    }
  };
  return h("div", {}, editor, h("button", { class: "primary", onclick: run }, "Run ▸"), out);
}

// Converts a lesson generated from Canvas material (server/claude.js schema) into blocks.
export function fromGenerated(g) {
  const blocks = [{ type: "objectives", text: g.objectives }];
  if (g.keyPoints?.length) blocks.push({ type: "keyPoints", items: g.keyPoints });
  if (g.debitCredit?.length) blocks.push({ type: "debitCredit", title: "Try it: debit or credit?", rows: g.debitCredit });
  if (g.sqlExercises?.length) blocks.push({ type: "schema" }, { type: "sql", title: "Try it", tasks: g.sqlExercises });
  if (g.definitions?.length) blocks.push({ type: "definitions", items: g.definitions.map((d) => [d.term, d.definition]) });
  if (g.quiz?.length) blocks.push({ type: "quiz", items: g.quiz });
  if (g.practicePrompts?.length) blocks.push({ type: "practice", prompts: g.practicePrompts });
  return { title: g.title, blocks };
}
