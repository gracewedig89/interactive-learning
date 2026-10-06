// SQL Server look-alikes for the in-browser practice database (sql.js / SQLite),
// so practice queries can be written exactly as on the SQL Server exam.
// SQL Server look-alikes so she can practice exactly what she'll write on the exam.
export function sqlServerShims(db) {
  const d = (v) => (v == null ? null : new Date(String(v).length <= 10 ? String(v) + "T00:00:00" : String(v)));
  db.create_function("YEAR", (v) => (v == null ? null : d(v).getFullYear()));
  db.create_function("MONTH", (v) => (v == null ? null : d(v).getMonth() + 1));
  db.create_function("DAY", (v) => (v == null ? null : d(v).getDate()));
  db.create_function("GETDATE", () => new Date().toISOString().slice(0, 19).replace("T", " "));
  db.create_function("ISNULL", (a, b) => (a == null ? b : a));
  db.create_function("LEN", (v) => (v == null ? null : String(v).replace(/\s+$/, "").length));
  db.create_function("DATEDIFF", (unit, a, b) => {
    const x = d(a), y = d(b), u = String(unit).toLowerCase();
    if (/^(yyyy|yy|year)$/.test(u)) return y.getFullYear() - x.getFullYear();
    if (/^(mm|m|month)$/.test(u)) return (y.getFullYear() - x.getFullYear()) * 12 + y.getMonth() - x.getMonth();
    return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 864e5);
  });
  db.create_function("DATEPART", (unit, v) => {
    if (v == null) return null;
    const x = d(v), u = String(unit).toLowerCase();
    if (/^(yyyy|yy|year)$/.test(u)) return x.getFullYear();
    if (/^(qq|q|quarter)$/.test(u)) return Math.floor(x.getMonth() / 3) + 1;
    if (/^(mm|m|month)$/.test(u)) return x.getMonth() + 1;
    if (/^(dw|weekday)$/.test(u)) return x.getDay() + 1;
    return x.getDate();
  });
  return db;
}
// SELECT TOP n … → SELECT … LIMIT n, and drop SSMS "GO" lines.
export function toSqlite(sql) {
  let q = sql.replace(/^\s*GO\s*$/gim, "");
  // DATEPART(QUARTER, x) / DATEDIFF(DAY, a, b): the date-part word becomes a string SQLite can pass along.
  q = q.replace(/\b(DATEPART|DATEDIFF)\s*\(\s*([A-Za-z]+)\s*,/gi, "$1('$2',");
  const m = q.match(/\bSELECT\s+TOP\s*\(?\s*(\d+)\s*\)?\s+/i);
  if (m) { q = q.replace(m[0], "SELECT ").replace(/;?\s*$/, ` LIMIT ${m[1]};`); }
  return q;
}
