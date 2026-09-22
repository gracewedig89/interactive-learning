import { listCourses, canvasConfigured } from "./canvas.js";

// The classes shown on the dashboard. `match` finds the Canvas course by name/code;
// set CANVAS_COURSE_<KEY> in .env to pin an exact Canvas course id instead.
export const COURSES = [
  {
    key: "accounting",
    title: "Accounting",
    blurb: "Debits, credits, journal entries and the accounting equation.",
    match: /acc(oun)?t/i,
    tutor: "an accounting tutor for an introductory financial accounting college course",
  },
  {
    key: "sql",
    title: "SQL",
    blurb: "Write real queries against a practice database, right in the browser.",
    match: /sql|database|\bdb\b|data management|information systems|\bISA[\s-]?\d{4}/i,
    tutor: "a SQL and relational database tutor for a college database course",
  },
  {
    key: "language-arts",
    title: "Language Arts 3010",
    blurb: "Readings, writing skills and assignment prep pulled from Canvas.",
    match: /3010|language arts|professional writing|\bengl\b/i,
    tutor: "a writing tutor for ENGL 3010 Professional Writing and Business Ethics",
  },
  {
    key: "biology",
    title: "Biology 1010",
    blurb: "Readings, quizzes and assignment prep pulled from Canvas.",
    match: /\bbiol|biology/i,
    tutor: "a biology tutor for BIOL 1010 General Biology, an introductory life-science college course",
  },
];

export const findCourse = (key) => COURSES.find((c) => c.key === key);

let cache = { at: 0, map: null };

// Returns { accounting: {id, name, course_code} | null, ... }
export async function canvasCourseMap() {
  if (!canvasConfigured()) return {};
  if (cache.map && Date.now() - cache.at < 10 * 60 * 1000) return cache.map;
  const all = await listCourses();
  const map = {};
  for (const c of COURSES) {
    const pinned = process.env[`CANVAS_COURSE_${c.key.toUpperCase().replace("-", "_")}`];
    const hit = pinned
      ? all.find((x) => String(x.id) === pinned)
      : all.find((x) => c.match.test(`${x.name} ${x.course_code}`));
    map[c.key] = hit ? { id: hit.id, name: hit.name, course_code: hit.course_code } : null;
  }
  cache = { at: Date.now(), map };
  return map;
}
