# Study Hub: interactive learning

A personal study app for Utah Tech classes:

- **Dashboard** with Accounting, SQL, and Language Arts 3010, plus everything due this week from Canvas.
- **Interactive lessons.** Each lesson has a "what you need to know" paragraph, hands-on practice with instant feedback, bullet-point definitions, and quiz questions.
  - **Accounting:** pick debit or credit for each account in real journal entries; the amount moves into that column and you're told right away if it's right and why.
  - **SQL:** write real queries against a practice database that runs in your browser; your results are checked against the correct answer.
- **Lessons built from your Canvas readings.** Pick any page or PDF in a Canvas module and the tutor pulls out the most important parts: objectives, key points, definitions, practice, and a quiz.
- **24/7 tutor chat** on every page. It knows which lesson you're on and what you just got wrong. Hit "Ask the tutor why" on any wrong answer.
- **Text reminders:** a weekly list of everything due, plus a text before each assignment with a link to a prep lesson for it.

## Run it

Requires [Node.js 22+](https://nodejs.org).

```bash
npm install
cp .env.example .env   # then fill in .env (see below)
npm start              # opens at http://localhost:3000
```

The built-in Accounting and SQL lessons work with no setup. Each connection below turns on more features.

### 1. AI tutor

Create an API key at <https://console.anthropic.com/settings/keys> and set `ANTHROPIC_API_KEY` in `.env`.

### 2. Connect Canvas

1. Go to <https://utahtech.instructure.com/profile/settings>.
2. Under **Approved Integrations**, click **+ New Access Token**, name it "Study Hub", and copy the token.
3. Set `CANVAS_TOKEN` in `.env`.

Classes are matched to the dashboard by name: "acct/accounting", "sql/database", and "3010/language arts". If one matches the wrong course, set `CANVAS_COURSE_<CLASS>` to the course's id (the number in its Canvas URL).

If you don't see the **New Access Token** button, Utah Tech has turned off student tokens and the Canvas features won't work.

### 3. Text reminders

1. Sign up at <https://www.twilio.com>, get a phone number, and copy your Account SID and Auth Token.
2. Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, and `SMS_TO` (your cell, like `+14355550100`).
3. On a Twilio trial account, first add your cell under **Verified Caller IDs**.
4. Test it with `curl -X POST http://localhost:3000/api/notify/digest`.

You'll get:
- **Every Monday at 8 AM:** a short bullet list of everything due that week.
- **48 hours and 6 hours before each due date:** a text with the assignment, a one-line summary, and a link to a prep lesson. Change the timing with `REMINDER_HOURS`.

Texts only go out while the app is running. To get them when your computer is off, host the app on an always-on service (for example Render or Railway, on a paid plan that doesn't sleep). Set `APP_URL` to its address and set `APP_PASSWORD` so only you can open it.

## Project layout

```
server/        Express server
  canvas.js    Canvas API (courses, modules, pages, files, planner)
  claude.js    tutor chat + lesson generation (Claude API)
  notify.js    Twilio texts + weekly/assignment reminder schedule
  courses.js   the classes on the dashboard
public/        the web app (no build step)
  lessons/     built-in lessons + practice database
test/          npm test
```
