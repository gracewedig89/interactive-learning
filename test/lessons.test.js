import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import initSqlJs from "sql.js";
import accounting from "../public/lessons/accounting.js";
import sql from "../public/lessons/sql.js";
import { sameResult } from "../public/js/sqlrunner.js";

test("every journal entry balances and has a valid side", () => {
  for (const lesson of accounting)
    for (const block of lesson.blocks.filter((b) => b.type === "debitCredit"))
      for (const row of block.rows) {
        const total = (side) => row.entries.filter((e) => e.side === side).reduce((s, e) => s + e.amount, 0);
        assert.ok(row.entries.every((e) => ["debit", "credit"].includes(e.side)), row.transaction);
        assert.equal(total("debit"), total("credit"), row.transaction);
      }
});

test("classify answers and quiz answers point at real options", () => {
  for (const lesson of [...accounting, ...sql])
    for (const b of lesson.blocks) {
      if (b.type === "classify") for (const i of b.items) assert.ok(b.categories.includes(i.answer), i.label);
      if (b.type === "quiz") for (const q of b.items) assert.ok(q.options[q.answerIndex], q.question);
    }
});

test("every SQL solution runs against the practice database and returns rows", async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(fs.readFileSync("public/lessons/practice-db.sql", "utf8"));
  db.run(fs.readFileSync("public/lessons/practice-data.sql", "utf8"));
  for (const lesson of sql)
    for (const b of lesson.blocks.filter((b) => b.type === "sql"))
      for (const t of b.tasks) {
        const res = db.exec(t.solution);
        assert.ok(res.length && res[0].values.length, t.prompt);
      }
});

test("sameResult ignores column names and row order unless ordered", () => {
  const a = { columns: ["x"], rows: [[1], [2]] };
  const b = { columns: ["y"], rows: [[2], [1]] };
  assert.ok(sameResult(a, b, false));
  assert.ok(!sameResult(a, b, true));
  assert.ok(sameResult({ columns: ["a"], rows: [[1.004]] }, { columns: ["b"], rows: [[1]] }, false));
  assert.ok(!sameResult(a, { columns: ["x", "z"], rows: [[1, 0], [2, 0]] }, false));
});
