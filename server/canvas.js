// Thin client for the Canvas LMS REST API, authenticated with a personal access token.
// Canvas docs: https://canvas.instructure.com/doc/api/

const BASE = (process.env.CANVAS_BASE_URL || "https://utahtech.instructure.com").replace(/\/$/, "");
const TOKEN = process.env.CANVAS_TOKEN;

export const canvasConfigured = () => Boolean(TOKEN);

async function request(path, { raw = false } = {}) {
  if (!TOKEN) throw new Error("CANVAS_TOKEN is not set. See README: Connect Canvas.");
  const url = path.startsWith("http") ? path : `${BASE}/api/v1${path}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Canvas ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`);
  return raw ? res : res.json();
}

// Follows Canvas pagination via the Link header.
async function requestAll(path) {
  const items = [];
  let url = `${BASE}/api/v1${path}${path.includes("?") ? "&" : "?"}per_page=100`;
  while (url) {
    const res = await request(url, { raw: true });
    items.push(...(await res.json()));
    const next = (res.headers.get("link") || "").split(",").find((l) => l.includes('rel="next"'));
    url = next ? next.match(/<([^>]+)>/)[1] : null;
  }
  return items;
}

export const listCourses = () => requestAll("/courses?enrollment_state=active&include[]=term");

export const listModules = (courseId) =>
  requestAll(`/courses/${courseId}/modules?include[]=items&include[]=content_details`);

export const getPage = (courseId, pageUrl) => request(`/courses/${courseId}/pages/${encodeURIComponent(pageUrl)}`);

export const getFile = (fileId) => request(`/files/${fileId}`);

export const getAssignment = (courseId, id) => request(`/courses/${courseId}/assignments/${id}`);

export const listAssignments = (courseId) =>
  requestAll(`/courses/${courseId}/assignments?order_by=due_at&include[]=submission`);

// Everything on the student's to-do list (assignments, quizzes, discussions) across all courses.
export function plannerItems(start, end) {
  const qs = new URLSearchParams({ start_date: start.toISOString(), end_date: end.toISOString() });
  return requestAll(`/planner/items?${qs}`);
}

export async function downloadFile(file) {
  const res = await request(file.url, { raw: true });
  return Buffer.from(await res.arrayBuffer());
}

export const stripHtml = (html = "") =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
