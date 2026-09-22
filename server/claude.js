import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5";
// Re-runs a declined request on Anthropic's recommended fallback model instead of failing.
const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };

let client;
const anthropic = () => (client ??= new Anthropic());

export const claudeConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

const PRACTICE_SCHEMA = fs.readFileSync(new URL("../public/lessons/practice-db.sql", import.meta.url), "utf8");

function tutorSystem(course) {
  return [
    `You are ${course.tutor}. You are chatting with a college student inside their study app while they work through a lesson.`,
    "Teach, don't lecture: answer the exact thing they're stuck on, then check understanding with one short question.",
    "Keep replies short and skimmable: a few sentences, bullet points, or a small markdown table (great for debits/credits and query results).",
    "When they share an answer, say clearly whether it's right, and if not, point to the specific mistake and why.",
    "For graded assignments, guide them to the answer with steps and examples rather than writing their submission for them.",
    course.key === "sql"
      ? `Their practice database (SQLite) has this schema, so use it for examples:\n${PRACTICE_SCHEMA}`
      : "",
  ].join("\n");
}

// Streams tutor text to `onText`; resolves when the reply is complete.
export async function streamTutor({ course, context, messages, onText }) {
  const system = tutorSystem(course);
  const history = messages.map((m) => ({ role: m.role, content: m.content }));
  if (context) {
    history[history.length - 1] = {
      role: "user",
      content: `[What I'm looking at in the app right now]\n${context}\n\n[My message]\n${history.at(-1).content}`,
    };
  }
  const stream = anthropic().beta.messages.stream({
    model: MODEL,
    max_tokens: 8000,
    ...FALLBACK,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system,
    messages: history,
  });
  stream.on("text", onText);
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") onText("\n\nSorry, I can't help with that one. Try rephrasing your question.");
}

const str = { type: "string" };
const LESSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "objectives", "keyPoints", "definitions", "debitCredit", "quiz", "sqlExercises", "practicePrompts"],
  properties: {
    title: str,
    objectives: { type: "string", description: "One short paragraph: what the student must be able to do after this lesson." },
    keyPoints: { type: "array", items: str, description: "The most important ideas from the material, as tight bullet points." },
    definitions: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["term", "definition"], properties: { term: str, definition: str } },
    },
    debitCredit: {
      type: "array",
      description: "Accounting only (else empty): transactions where the student marks each account as debit or credit.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["transaction", "entries"],
        properties: {
          transaction: str,
          entries: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["account", "side", "amount", "why"],
              properties: { account: str, side: { type: "string", enum: ["debit", "credit"] }, amount: { type: "number" }, why: str },
            },
          },
        },
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options", "answerIndex", "explanation"],
        properties: { question: str, options: { type: "array", items: str }, answerIndex: { type: "integer" }, explanation: str },
      },
    },
    sqlExercises: {
      type: "array",
      description: "SQL only (else empty): tasks answerable against the practice database; solution must run in SQLite.",
      items: { type: "object", additionalProperties: false, required: ["prompt", "solution"], properties: { prompt: str, solution: str } },
    },
    practicePrompts: { type: "array", items: str, description: "Open-ended practice or reflection prompts the student answers in their own words." },
  },
};

// Turns course material (page text and/or PDFs) into an interactive lesson.
export async function buildLesson({ course, sourceTitle, text, pdfs = [], assignment }) {
  const task = assignment
    ? `Build a prep lesson for this upcoming assignment so the student understands what they need to know before doing it. Do not complete the assignment for them.\n\nAssignment: ${assignment.name}\nDue: ${assignment.due_at || "no due date"}\n\n${text}`
    : `Build a lesson from this course material ("${sourceTitle}"). Pull out only what matters most so the student doesn't have to read everything.\n\n${text || ""}`;
  const content = [
    ...pdfs.map((data) => ({ type: "document", source: { type: "base64", media_type: "application/pdf", data: data.toString("base64") } })),
    {
      type: "text",
      text: [
        task,
        `\nThis is for ${course.title}.`,
        course.key === "accounting" ? "Include 3-5 debitCredit transactions that fit the material." : "",
        course.key === "sql" ? `Include 3-5 sqlExercises that use this practice database:\n${PRACTICE_SCHEMA}` : "",
        "Include 3-6 quiz questions, 4-10 definitions, and 1-3 practicePrompts.",
      ].join("\n"),
    },
  ];
  const stream = anthropic().beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    ...FALLBACK,
    thinking: { type: "adaptive" },
    system: `You are ${course.tutor}. You write clear, accurate, interactive study lessons from a student's actual course materials.`,
    output_config: { format: { type: "json_schema", schema: LESSON_SCHEMA } },
    messages: [{ role: "user", content }],
  });
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") throw new Error("Claude declined to build this lesson.");
  if (final.stop_reason === "max_tokens") throw new Error("The lesson came out too long. Try a smaller reading.");
  const json = final.content.find((b) => b.type === "text")?.text;
  return JSON.parse(json);
}

// Short plain-text summary used in the weekly SMS digest ("what this assignment is about").
export async function oneLiner(course, assignment, text) {
  const res = await anthropic().beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    ...FALLBACK,
    output_config: { effort: "low" },
    messages: [
      {
        role: "user",
        content: `In one sentence under 20 words, tell a ${course?.title || "college"} student what this assignment asks them to do and the main concept it tests. Plain text only.\n\n${assignment.name}\n${text}`.slice(0, 20000),
      },
    ],
  });
  return res.content.find((b) => b.type === "text")?.text.trim() || "";
}
