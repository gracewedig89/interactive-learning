// Loads the practice database into SQLite (sql.js / WebAssembly) running in the browser.
let dbPromise;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
}

async function freshDb() {
  if (!window.initSqlJs) await loadScript("/vendor/sql-wasm.js");
  const SQL = await window.initSqlJs({ locateFile: () => "/vendor/sql-wasm.wasm" });
  const [schema, data] = await Promise.all(
    ["/lessons/practice-db.sql", "/lessons/practice-data.sql"].map((u) => fetch(u).then((r) => r.text()))
  );
  const db = new SQL.Database();
  db.run(schema);
  db.run(data);
  return db;
}

// One shared database; queries that modify data are run on a throwaway copy.
export const getDb = () => (dbPromise ??= freshDb());

export async function runQuery(sql) {
  const readOnly = /^\s*(select|with|pragma)\b/i.test(sql);
  const db = readOnly ? await getDb() : await freshDb();
  const res = db.exec(sql);
  const last = res.at(-1) || { columns: [], values: [] };
  return { columns: last.columns, rows: last.values };
}

const norm = (v) => (typeof v === "number" ? String(Math.round(v * 100) / 100) : v === null ? "NULL" : String(v));

// Compares result sets by values (column names are ignored so aliases don't matter).
export function sameResult(a, b, ordered) {
  if (a.columns.length !== b.columns.length || a.rows.length !== b.rows.length) return false;
  const rowsA = a.rows.map((r) => r.map(norm).join("\u0000"));
  const rowsB = b.rows.map((r) => r.map(norm).join("\u0000"));
  if (!ordered) {
    rowsA.sort();
    rowsB.sort();
  }
  return rowsA.every((r, i) => r === rowsB[i]);
}

export async function schemaInfo() {
  const db = await getDb();
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0].values.map((r) => r[0]);
  return tables.map((t) => ({
    name: t,
    columns: db.exec(`PRAGMA table_info(${t})`)[0].values.map((r) => ({ name: r[1], type: r[2], pk: r[5] > 0 })),
    fks: (db.exec(`PRAGMA foreign_key_list(${t})`)[0]?.values || []).map((r) => ({ from: r[3], table: r[2], to: r[4] })),
  }));
}
