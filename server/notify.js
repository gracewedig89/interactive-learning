import fs from "node:fs";
import cron from "node-cron";
import { plannerItems, canvasConfigured, stripHtml, getAssignment } from "./canvas.js";
import { COURSES, canvasCourseMap } from "./courses.js";
import { oneLiner, claudeConfigured } from "./claude.js";

const TZ = process.env.TIMEZONE || "America/Denver";
const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
const STATE_FILE = new URL("../data/reminders.json", import.meta.url);
// Hours before the due date to send a "let's work on it" text. Default: 2 days and 6 hours before.
const REMIND_HOURS = (process.env.REMINDER_HOURS || "48,6").split(",").map(Number).filter(Boolean);

export const smsConfigured = () =>
  ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM", "SMS_TO"].every((k) => process.env[k]);

export async function sendSms(body) {
  if (!smsConfigured()) {
    console.log(`[sms disabled] would send:\n${body}\n`);
    return { skipped: true };
  }
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64") },
    body: new URLSearchParams({ To: process.env.SMS_TO, From: process.env.TWILIO_FROM, Body: body }),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${await res.text()}`);
  return res.json();
}

const loadState = () => {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { sent: {} };
  }
};
const saveState = (s) => {
  fs.mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
};

const fmtDue = (d) =>
  new Date(d).toLocaleString("en-US", { timeZone: TZ, weekday: "short", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });

// Upcoming, not-yet-submitted to-do items, tagged with our dashboard course key when we know it.
export async function upcoming(days) {
  const now = new Date();
  const end = new Date(now.getTime() + days * 864e5);
  const [items, map] = await Promise.all([plannerItems(now, end), canvasCourseMap()]);
  const keyById = Object.fromEntries(Object.entries(map).filter(([, c]) => c).map(([k, c]) => [c.id, k]));
  return items
    .filter((i) => i.plannable?.due_at || i.plannable_date)
    .filter((i) => !i.submissions?.submitted && !i.planner_override?.marked_complete)
    .map((i) => ({
      id: `${i.plannable_type}-${i.plannable_id}`,
      assignmentId: i.plannable?.assignment_id || (i.plannable_type === "assignment" ? i.plannable_id : null),
      type: i.plannable_type,
      title: i.plannable?.title,
      due: i.plannable?.due_at || i.plannable_date,
      courseId: i.course_id,
      courseName: i.context_name,
      courseKey: keyById[i.course_id] || null,
      canvasUrl: i.html_url ? new URL(i.html_url, process.env.CANVAS_BASE_URL || "https://utahtech.instructure.com").href : null,
    }))
    .sort((a, b) => new Date(a.due) - new Date(b.due));
}

// Short class name for texts: our dashboard title when we know it, else Canvas's name.
const label = (item) => COURSES.find((c) => c.key === item.courseKey)?.title || item.courseName || "Canvas";

const prepLink = (item) =>
  item.courseKey && item.assignmentId
    ? `${APP_URL}/prep.html?course=${item.courseKey}&id=${item.assignmentId}`
    : APP_URL;

export async function weeklyDigest() {
  const items = await upcoming(7);
  if (!items.length) return sendSms("This week: nothing due on Canvas. Nice! Use the free time to review a lesson.");
  const lines = items.map((i) => `• ${fmtDue(i.due)} – ${label(i)}: ${i.title}`);
  return sendSms(`Due this week (${items.length}):\n${lines.join("\n")}\n\nStudy: ${APP_URL}`);
}

// Sends one text per assignment at each reminder threshold; remembers what it already sent.
export async function checkReminders() {
  const state = loadState();
  const items = await upcoming(Math.max(...REMIND_HOURS) / 24 + 1);
  const now = Date.now();
  for (const item of items) {
    const hoursLeft = (new Date(item.due) - now) / 36e5;
    if (hoursLeft <= 0) continue;
    const due = REMIND_HOURS.filter((h) => hoursLeft <= h && !state.sent[`${item.id}@${h}`]);
    if (!due.length) continue;
    let about = "";
    if (claudeConfigured()) {
      const details = item.assignmentId ? await getAssignment(item.courseId, item.assignmentId).catch(() => null) : null;
      const course = COURSES.find((c) => c.key === item.courseKey);
      about = await oneLiner(course, { name: item.title }, stripHtml(details?.description || "")).catch(() => "");
    }
    const when = hoursLeft < 24 ? `in ${Math.round(hoursLeft)} hrs` : fmtDue(item.due);
    const result = await sendSms(
      [`⏰ ${label(item)}: "${item.title}" is due ${when}.`, about, `Let's work on it together: ${prepLink(item)}`]
        .filter(Boolean)
        .join("\n")
    );
    if (result.skipped) continue; // SMS not set up yet: text it once it is.
    // Mark every threshold we've passed so a late start doesn't send a burst of texts.
    for (const h of due) state.sent[`${item.id}@${h}`] = new Date().toISOString();
    saveState(state);
  }
}

export function startScheduler() {
  if (!canvasConfigured()) {
    console.log("Reminders off: set CANVAS_TOKEN to enable due-date texts.");
    return;
  }
  const run = (name, fn) => () => fn().catch((e) => console.error(`[${name}]`, e.message));
  // Weekly digest, Monday 8:00 AM local time (override with DIGEST_CRON).
  cron.schedule(process.env.DIGEST_CRON || "0 8 * * 1", run("digest", weeklyDigest), { timezone: TZ });
  // Check for per-assignment reminders every 30 minutes.
  cron.schedule("*/30 * * * *", run("reminders", checkReminders), { timezone: TZ });
  run("reminders", checkReminders)();
  console.log(`Reminders on (${TZ}): weekly digest + texts ${REMIND_HOURS.join("h, ")}h before each due date${smsConfigured() ? "" : " (SMS not configured: logging only)"}.`);
}
