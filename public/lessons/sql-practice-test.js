// Practice test walkthrough on the course stock tables (StockData, CompanyInformation, Calendar).
// One level per practice-test question: warm-ups that build the new idea, then the real question.
const text = (html) => ({ type: "text", html });
const JOIN3 = `<pre><code>FROM StockData AS s
    JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol
    JOIN Calendar AS c ON s.TradeDate = c.ActualDate</code></pre>`;

const Q = {
  q0: { prompt: "Question 1 (10 pts): Return all stock-data rows for 2024. Include: TickerSymbol, ST_Open, CompanyName, Address, ActualDate, DayType.", solution: "SELECT s.TickerSymbol, s.ST_Open, ci.CompanyName, ci.Address, c.ActualDate, c.DayType\nFROM StockData AS s\n    JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol\n    JOIN Calendar AS c ON s.TradeDate = c.ActualDate\nWHERE YEAR(s.TradeDate) = 2024;", format: true, noReveal: true },
  q1: { prompt: "Question 2 (10 pts): List companies whose ticker symbols begin with 'A'. Exclude companies in the Healthcare industry and companies located in California (CA). Include: TickerSymbol, Industry, State.", solution: "SELECT TickerSymbol, Industry, State\nFROM CompanyInformation\nWHERE TickerSymbol LIKE 'A%'\n    AND Industry <> 'Healthcare'\n    AND State <> 'CA';", format: true, noReveal: true },
  q2: { prompt: "Question 3 (10 pts): List each company that has had a closing price of exactly $18 on any recorded date. Return each qualifying company once. Use the subquery approach. Include: TickerSymbol, Industry, City, State.", solution: "SELECT TickerSymbol, Industry, City, State\nFROM CompanyInformation\nWHERE TickerSymbol IN\n    (SELECT TickerSymbol\n    FROM StockData\n    WHERE ST_Close = 18);", format: true, noReveal: true },
  q3: { prompt: "Question 4 (10 pts): List stock-data rows, excluding those with volume from 6,000,000 through 14,000,000 shares, including both endpoints. Include: TradeDate, DayOfWeek, ST_Close, Volume, TickerSymbol, City.", solution: "SELECT s.TradeDate, c.DayOfWeek, s.ST_Close, s.Volume, s.TickerSymbol, ci.City\nFROM StockData AS s\n    JOIN Calendar AS c ON s.TradeDate = c.ActualDate\n    JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol\nWHERE s.Volume NOT BETWEEN 6000000 AND 14000000;", format: true, noReveal: true },
  q4: { prompt: "Question 5 (10 pts): Return all stock-data rows for ticker symbols ending with 'N', excluding trades on Tuesday or Thursday. Include: TickerSymbol, TradeDate, ST_Close, DayOfWeek.", solution: "SELECT s.TickerSymbol, s.TradeDate, s.ST_Close, c.DayOfWeek\nFROM StockData AS s\n    JOIN Calendar AS c ON s.TradeDate = c.ActualDate\nWHERE s.TickerSymbol LIKE '%N'\n    AND c.DayOfWeek NOT IN ('Tuesday', 'Thursday');", format: true, noReveal: true },
  q5: { prompt: "Question 6 (20 pts): List each industry and its average closing price across all available stock-data rows. Include only industries with an average closing price of $30 or greater. Return one row per industry. Include: Industry, AvgClose.", solution: "SELECT ci.Industry, AVG(s.ST_Close) AS AvgClose\nFROM StockData AS s\n    JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol\nGROUP BY ci.Industry\nHAVING AVG(s.ST_Close) >= 30;", format: true, noReveal: true },
  q6: { prompt: "Question 7 (15 pts): Return all stock-data rows for Q2 of 2023 (April 1–June 30, inclusive). Multiply each row's low stock price by 3 and label it TripleLow. Include: TickerSymbol, TradeDate, TripleLow, Volume.", solution: "SELECT TickerSymbol, TradeDate, ST_Low * 3 AS TripleLow, Volume\nFROM StockData\nWHERE TradeDate BETWEEN '2023-04-01' AND '2023-06-30';", format: true, noReveal: true },
  q7: { prompt: "Question 8 (15 pts): Return all stock-data rows for Q3 of 2024 (July 1–September 30, inclusive) for companies whose industry contains 'Gas'. Include: TickerSymbol, Industry, TradeDate, DayType, State, ZipCode.", solution: "SELECT s.TickerSymbol, ci.Industry, s.TradeDate, c.DayType, ci.State, ci.ZipCode\nFROM StockData AS s\n    JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol\n    JOIN Calendar AS c ON s.TradeDate = c.ActualDate\nWHERE s.TradeDate BETWEEN '2024-07-01' AND '2024-09-30'\n    AND ci.Industry LIKE '%Gas%';", format: true, noReveal: true },
};
const real = (q, hint) => ({ type: "sql", title: "🎯 The real practice-test question", tasks: [{ ...q, hint }] });

export default {
  id: "practice-test",
  title: "🎯 Practice test walkthrough (do after the step-by-step lesson)",
  blocks: [
    {
      type: "objectives",
      text: "Work through your practice test one question at a time, on the course tables: StockData, CompanyInformation and Calendar. Each level teaches the one new idea a question needs, gives you warm-ups, then has you write the real question. The last level is the whole test again from memory, with no hints. Format every query like the exam: each clause on its own line, extra conditions and JOINs indented with Tab.",
    },
    text(`<p><b>Your three tables and how they connect</b></p>
<table class="ref"><thead><tr><th>Table</th><th>What's in it</th><th>Connects by</th></tr></thead><tbody>
<tr><td><code>StockData</code> (s)</td><td>One row per stock per day: TickerSymbol, TradeDate, ST_Open, ST_High, ST_Low, ST_Close, Volume</td><td>—</td></tr>
<tr><td><code>CompanyInformation</code> (ci)</td><td>One row per company: TickerSymbol, CompanyName, Industry, PhoneNumber, Address, City, State, ZipCode, Country</td><td><code>s.TickerSymbol = ci.TickerSymbol</code></td></tr>
<tr><td><code>Calendar</code> (c)</td><td>One row per date: ActualDate, MonthName, DayNumber, YearNumber, DayOfWeek, DayType</td><td><code>s.TradeDate = c.ActualDate</code></td></tr>
</tbody></table>
<p><b>The trick for every question:</b> look at the "Include:" list and ask which table each column lives in. Only stock columns? Just <code>FROM StockData</code>. A company column (CompanyName, Industry, City, State, Address, ZipCode)? JOIN CompanyInformation. A date column (ActualDate, DayOfWeek, DayType)? JOIN Calendar.</p>
<p>The 3-table JOIN you'll reuse over and over (memorize it):</p>${JOIN3}`),

    // ---- Level 1: Question 1 ----
    { type: "level", title: "Join all three tables + pick one year (Question 1)", goal: "Write the 3-table JOIN and filter to 2024." },
    text(`<p><b>New idea: joining 3 tables.</b> Start FROM StockData, then add one JOIN line per extra table. Each JOIN gets its own ON saying which columns match.</p>
<p><b>Filtering by year:</b> <code>WHERE YEAR(s.TradeDate) = 2024</code> or <code>WHERE s.TradeDate BETWEEN '2024-01-01' AND '2024-12-31'</code>. Both work in SQL Server.</p>
<p><b>How to think about Question 1:</b> TickerSymbol and ST_Open → StockData. CompanyName and Address → CompanyInformation. ActualDate and DayType → Calendar. So all three tables.</p>`),
    {
      type: "order",
      title: "Pass off: put the 3-table join in order",
      items: [{
        goal: "Show each trade's ticker, company name and day of the week.",
        pieces: ["SELECT s.TickerSymbol, ci.CompanyName, c.DayOfWeek", "FROM StockData AS s", "JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol", "JOIN Calendar AS c ON s.TradeDate = c.ActualDate;"],
        explanation: "FROM the main table, then one JOIN … ON per extra table.",
      }],
    },
    {
      type: "sql",
      title: "Warm-ups",
      tasks: [
        { prompt: "Show TickerSymbol, CompanyName and ST_Close for every stock-data row (join StockData to CompanyInformation).", solution: "SELECT s.TickerSymbol, ci.CompanyName, s.ST_Close\nFROM StockData AS s\n    JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol;", format: true, hint: "ON s.TickerSymbol = ci.TickerSymbol" },
        { prompt: "Show TickerSymbol, TradeDate and DayOfWeek for every stock-data row (join StockData to Calendar).", solution: "SELECT s.TickerSymbol, s.TradeDate, c.DayOfWeek\nFROM StockData AS s\n    JOIN Calendar AS c ON s.TradeDate = c.ActualDate;", format: true, hint: "ON s.TradeDate = c.ActualDate" },
        { prompt: "Show TickerSymbol, TradeDate and ST_Close for stock-data rows in 2023 only (no joins).", solution: "SELECT TickerSymbol, TradeDate, ST_Close\nFROM StockData\nWHERE YEAR(TradeDate) = 2023;", format: true, hint: "WHERE YEAR(TradeDate) = 2023" },
      ],
    },
    real(Q.q0, "Use the 3-table JOIN, then WHERE YEAR(s.TradeDate) = 2024."),
    {
      type: "quiz",
      items: [{ question: "You need DayType. Which table do you JOIN?", options: ["CompanyInformation", "Calendar", "StockData", "None"], answerIndex: 1, explanation: "DayType, DayOfWeek and ActualDate live in Calendar, joined ON s.TradeDate = c.ActualDate." }],
    },

    // ---- Level 2: Question 2 ----
    { type: "level", title: "LIKE 'A%' + excluding things (Question 2)", goal: "Use LIKE for \"begins with\" and <> to leave things out." },
    text(`<p><b>LIKE patterns:</b> <code>%</code> means "anything (or nothing) here".</p>
<table class="ref"><thead><tr><th>Question says</th><th>Write</th></tr></thead><tbody>
<tr><td>begins with A</td><td><code>LIKE 'A%'</code></td></tr>
<tr><td>ends with N</td><td><code>LIKE '%N'</code></td></tr>
<tr><td>contains Gas</td><td><code>LIKE '%Gas%'</code></td></tr>
</tbody></table>
<p><b>"Exclude"</b> means a NOT condition: <code>Industry &lt;&gt; 'Healthcare'</code>, <code>State &lt;&gt; 'CA'</code>. Every condition must be true, so join them with <b>AND</b>, each extra one on its own indented line.</p>
<p><b>How to think about Question 2:</b> TickerSymbol, Industry and State are all in CompanyInformation, so no JOIN is needed.</p>`),
    {
      type: "sql",
      title: "Warm-ups",
      tasks: [
        { prompt: "List TickerSymbol and CompanyName for companies whose ticker begins with 'A'.", solution: "SELECT TickerSymbol, CompanyName\nFROM CompanyInformation\nWHERE TickerSymbol LIKE 'A%';", format: true, hint: "LIKE 'A%'" },
        { prompt: "List TickerSymbol and State for companies NOT located in California (CA).", solution: "SELECT TickerSymbol, State\nFROM CompanyInformation\nWHERE State <> 'CA';", format: true, hint: "<> means not equal." },
      ],
    },
    real(Q.q1, "Three conditions joined with AND: LIKE 'A%', Industry <> 'Healthcare', State <> 'CA'."),
    {
      type: "quiz",
      items: [{ question: "Which finds tickers that END with N?", options: ["LIKE 'N%'", "LIKE '%N'", "LIKE '%N%'", "= 'N'"], answerIndex: 1, explanation: "% goes where the \"anything\" is. Ends with N → anything, then N." }],
    },

    // ---- Level 3: Question 3 ----
    { type: "level", title: "Subquery with IN (Question 3)", goal: "Use a query inside a query to find companies once." },
    text(`<p><b>New idea: a subquery.</b> The inner query (in parentheses) runs first and makes a list. The outer query keeps rows whose value is <code>IN</code> that list.</p>
<pre><code>SELECT TickerSymbol, CompanyName
FROM CompanyInformation
WHERE TickerSymbol IN
    (SELECT TickerSymbol
    FROM StockData
    WHERE ST_Close &gt; 1000);</code></pre>
<p><b>Why a subquery and not a JOIN?</b> A JOIN gives one row for <i>every matching trade</i>, so a company that closed at $18 twice would show up twice. With <code>IN</code>, each company appears once, which is what "return each qualifying company once" means.</p>
<p><b>How to think about Question 3:</b> the columns you show (Industry, City, State) are in CompanyInformation (outer query). The condition (closed at exactly 18) is about StockData (inner query).</p>`),
    {
      type: "order",
      title: "Pass off: put the subquery in order",
      items: [{
        goal: "Show companies that ever had a volume over 100,000,000.",
        pieces: ["SELECT TickerSymbol, CompanyName", "FROM CompanyInformation", "WHERE TickerSymbol IN", "(SELECT TickerSymbol", "FROM StockData", "WHERE Volume > 100000000);"],
        explanation: "Outer query, then WHERE … IN, then the inner query in parentheses.",
      }],
    },
    {
      type: "sql",
      title: "Warm-ups",
      tasks: [
        { prompt: "Show TickerSymbol and TradeDate for every stock-data row with a closing price of exactly 18. (Notice a ticker can show up more than once.)", solution: "SELECT TickerSymbol, TradeDate\nFROM StockData\nWHERE ST_Close = 18;", format: true, hint: "WHERE ST_Close = 18" },
        { prompt: "Using a subquery, show TickerSymbol and CompanyName of companies that ever closed above $1,000.", solution: "SELECT TickerSymbol, CompanyName\nFROM CompanyInformation\nWHERE TickerSymbol IN\n    (SELECT TickerSymbol\n    FROM StockData\n    WHERE ST_Close > 1000);", format: true, hint: "WHERE TickerSymbol IN (SELECT TickerSymbol FROM StockData WHERE …)" },
      ],
    },
    real(Q.q2, "Outer: CompanyInformation. Inner: SELECT TickerSymbol FROM StockData WHERE ST_Close = 18."),
    {
      type: "quiz",
      items: [{ question: "\"Return each qualifying company once.\" Why use IN with a subquery?", options: ["It's faster", "A JOIN would repeat a company once per matching trade", "JOINs can't use WHERE", "IN sorts the rows"], answerIndex: 1, explanation: "IN just checks membership, so each company row appears at most once." }],
    },

    // ---- Level 4: Question 4 ----
    { type: "level", title: "NOT BETWEEN (Question 4)", goal: "Exclude a range of numbers, endpoints included." },
    text(`<p><b>BETWEEN</b> includes both ends: <code>Volume BETWEEN 6000000 AND 14000000</code> keeps 6,000,000 and 14,000,000 too. "Excluding … including both endpoints" = <code>NOT BETWEEN</code>.</p>
<p>Don't type commas inside numbers: write <code>6000000</code>, not <code>6,000,000</code>.</p>
<p><b>How to think about Question 4:</b> DayOfWeek → Calendar. City → CompanyInformation. So all three tables again.</p>`),
    {
      type: "sql",
      title: "Warm-ups",
      tasks: [
        { prompt: "Show TickerSymbol and Volume for rows with volume from 6,000,000 through 14,000,000 (endpoints included).", solution: "SELECT TickerSymbol, Volume\nFROM StockData\nWHERE Volume BETWEEN 6000000 AND 14000000;", format: true, hint: "BETWEEN low AND high" },
        { prompt: "Now flip it: show TickerSymbol and Volume for rows OUTSIDE that range.", solution: "SELECT TickerSymbol, Volume\nFROM StockData\nWHERE Volume NOT BETWEEN 6000000 AND 14000000;", format: true, hint: "NOT BETWEEN" },
      ],
    },
    real(Q.q3, "3-table JOIN, then WHERE s.Volume NOT BETWEEN 6000000 AND 14000000."),
    {
      type: "quiz",
      items: [{ question: "Does Volume BETWEEN 6000000 AND 14000000 include a row with exactly 14,000,000?", options: ["Yes, BETWEEN includes both ends", "No, it stops before the end", "Only with >=", "Only in SQL Server"], answerIndex: 0, explanation: "BETWEEN is inclusive on both ends." }],
    },

    // ---- Level 5: Question 5 ----
    { type: "level", title: "Ends with + NOT IN (Question 5)", goal: "Combine LIKE '%N' with NOT IN for days of the week." },
    text(`<p><b>NOT IN</b> leaves out everything in a list: <code>c.DayOfWeek NOT IN ('Tuesday', 'Thursday')</code>. It's the same as <code>c.DayOfWeek &lt;&gt; 'Tuesday' AND c.DayOfWeek &lt;&gt; 'Thursday'</code>.</p>
<p><b>How to think about Question 5:</b> DayOfWeek → Calendar. Everything else is in StockData, so you need just one JOIN.</p>`),
    {
      type: "sql",
      title: "Warm-ups",
      tasks: [
        { prompt: "Show TickerSymbol and CompanyName for companies whose ticker ends with 'N'.", solution: "SELECT TickerSymbol, CompanyName\nFROM CompanyInformation\nWHERE TickerSymbol LIKE '%N';", format: true, hint: "LIKE '%N'" },
        { prompt: "Show ActualDate and DayOfWeek from Calendar for days that are NOT Monday or Friday.", solution: "SELECT ActualDate, DayOfWeek\nFROM Calendar\nWHERE DayOfWeek NOT IN ('Monday', 'Friday');", format: true, hint: "NOT IN ('Monday', 'Friday')" },
      ],
    },
    real(Q.q4, "JOIN Calendar, then WHERE s.TickerSymbol LIKE '%N' AND c.DayOfWeek NOT IN ('Tuesday', 'Thursday')."),
    {
      type: "quiz",
      items: [{ question: "\"Excluding Tuesday or Thursday\" in SQL is…", options: ["DayOfWeek IN ('Tuesday','Thursday')", "DayOfWeek NOT IN ('Tuesday','Thursday')", "DayOfWeek <> 'Tuesday' OR DayOfWeek <> 'Thursday'", "DayOfWeek LIKE 'T%'"], answerIndex: 1, explanation: "NOT IN leaves out both. (The OR version keeps everything, since every day is not one of them!)" }],
    },

    // ---- Level 6: Question 6 ----
    { type: "level", title: "GROUP BY + HAVING with a JOIN (Question 6, 20 pts)", goal: "Average per industry, keep only averages ≥ 30." },
    text(`<p><b>How to think about Question 6:</b></p>
<ul>
<li>"each industry … one row per industry" → <code>GROUP BY ci.Industry</code></li>
<li>"average closing price" → <code>AVG(s.ST_Close) AS AvgClose</code></li>
<li>Industry is in CompanyInformation and ST_Close is in StockData → JOIN them</li>
<li>"only industries with an average of $30 or greater" is a condition on an aggregate → <code>HAVING AVG(s.ST_Close) &gt;= 30</code></li>
</ul>
<p>Question 6 is worth 20 points, so double-check the alias is spelled exactly <code>AvgClose</code>.</p>`),
    {
      type: "order",
      title: "Pass off: put it in order",
      items: [{
        goal: "Average closing price per industry, only 30 or more.",
        pieces: ["SELECT ci.Industry, AVG(s.ST_Close) AS AvgClose", "FROM StockData AS s", "JOIN CompanyInformation AS ci ON s.TickerSymbol = ci.TickerSymbol", "GROUP BY ci.Industry", "HAVING AVG(s.ST_Close) >= 30;"],
        explanation: "JOIN → GROUP BY → HAVING.",
      }],
    },
    {
      type: "sql",
      title: "Warm-ups",
      tasks: [
        { prompt: "Show each TickerSymbol and its average closing price (StockData only), labeled AvgClose.", solution: "SELECT TickerSymbol, AVG(ST_Close) AS AvgClose\nFROM StockData\nGROUP BY TickerSymbol;", format: true, hint: "GROUP BY TickerSymbol" },
        { prompt: "Show each Industry and how many companies are in it (CompanyInformation only), only industries with 2 or more companies.", solution: "SELECT Industry, COUNT(*) AS NumCompanies\nFROM CompanyInformation\nGROUP BY Industry\nHAVING COUNT(*) >= 2;", format: true, hint: "HAVING COUNT(*) >= 2" },
      ],
    },
    real(Q.q5, "JOIN CompanyInformation, GROUP BY ci.Industry, HAVING AVG(s.ST_Close) >= 30."),
    {
      type: "quiz",
      items: [{ question: "Why can't Question 6 use WHERE AVG(s.ST_Close) >= 30?", options: ["WHERE runs before groups exist, so it can't use AVG", "WHERE only works with text", "It can, both work", "AVG needs ORDER BY"], answerIndex: 0, explanation: "Aggregates are filtered with HAVING, after GROUP BY." }],
    },

    // ---- Level 7: Question 7 ----
    { type: "level", title: "Date range + a calculated column (Question 7)", goal: "Filter one quarter and make a new column with math and AS." },
    text(`<p><b>Date ranges:</b> <code>WHERE TradeDate BETWEEN '2023-04-01' AND '2023-06-30'</code>. Dates go in single quotes, written year-month-day.</p>
<p><b>Calculated columns:</b> do math right in SELECT and name the result with AS: <code>ST_Low * 3 AS TripleLow</code>.</p>
<p><b>How to think about Question 7:</b> every column is in StockData, so no JOIN. TripleLow isn't a real column; you make it.</p>`),
    {
      type: "sql",
      title: "Warm-ups",
      tasks: [
        { prompt: "Show TickerSymbol and TradeDate for stock-data rows from Q3 of 2023 (July 1–September 30, inclusive).", solution: "SELECT TickerSymbol, TradeDate\nFROM StockData\nWHERE TradeDate BETWEEN '2023-07-01' AND '2023-09-30';", format: true, hint: "BETWEEN '2023-07-01' AND '2023-09-30'" },
        { prompt: "Show TickerSymbol, ST_High, and ST_High minus ST_Low labeled DailyRange for every stock-data row.", solution: "SELECT TickerSymbol, ST_High, ST_High - ST_Low AS DailyRange\nFROM StockData;", format: true, hint: "ST_High - ST_Low AS DailyRange" },
      ],
    },
    real(Q.q6, "ST_Low * 3 AS TripleLow, and WHERE TradeDate BETWEEN '2023-04-01' AND '2023-06-30'."),
    {
      type: "quiz",
      items: [{ question: "Which dates make up Q2 (the 2nd quarter)?", options: ["Jan 1 – Mar 31", "Apr 1 – Jun 30", "Jul 1 – Sep 30", "Oct 1 – Dec 31"], answerIndex: 1, explanation: "Q1 Jan–Mar, Q2 Apr–Jun, Q3 Jul–Sep, Q4 Oct–Dec." }],
    },

    // ---- Level 8: Question 8 ----
    { type: "level", title: "Contains + date range + 3 tables (Question 8)", goal: "Put LIKE '%Gas%', a quarter date range and the 3-table JOIN together." },
    text(`<p><b>How to think about Question 8:</b> Industry, State and ZipCode → CompanyInformation. DayType → Calendar. So use the 3-table JOIN. Then two conditions joined with AND:</p>
<ul><li>Q3 2024 → <code>s.TradeDate BETWEEN '2024-07-01' AND '2024-09-30'</code></li>
<li>industry contains 'Gas' → <code>ci.Industry LIKE '%Gas%'</code> (matches "Oil &amp; Gas" and "Natural Gas Pipelines")</li></ul>`),
    {
      type: "sql",
      title: "Warm-up",
      tasks: [
        { prompt: "Show TickerSymbol and Industry for companies whose industry contains 'Gas'.", solution: "SELECT TickerSymbol, Industry\nFROM CompanyInformation\nWHERE Industry LIKE '%Gas%';", format: true, hint: "LIKE '%Gas%'" },
      ],
    },
    real(Q.q7, "3-table JOIN, then WHERE the date is BETWEEN '2024-07-01' AND '2024-09-30' AND ci.Industry LIKE '%Gas%'."),
    {
      type: "quiz",
      items: [{ question: "Which pattern finds an industry that contains Gas anywhere?", options: ["LIKE 'Gas%'", "LIKE '%Gas'", "LIKE '%Gas%'", "= 'Gas'"], answerIndex: 2, explanation: "% on both sides = anything before and after." }],
    },

    // ---- Level 9: full test ----
    { type: "level", title: "🏆 The whole practice test, from memory", goal: "Write all 8 with no hints, formatted like the exam. 100 pts." },
    text(`<p>Close your notes. For each one: read the Include list → pick the tables → write the JOINs → WHERE → GROUP BY/HAVING if it says "each" → check your formatting. If you miss one, the app shows what's off; fix it and run again.</p>
<p><b>📝 Turning it in (Word .docx)</b></p>
<ul>
<li>Your name at the top.</li>
<li>Label each answer <b>Question 1</b> through <b>Question 8</b>.</li>
<li>Under each label, paste your SQL as <b>text</b> (not a picture of code), then a screenshot of its output from SSMS: column headers plus about the first 5 rows (all rows if fewer; the empty grid with headers if none).</li>
<li>The screenshot must come from running exactly the query above it. Don't add TOP 5 to make the screenshot. Return all rows.</li>
<li>Only the listed columns, in the order listed. No ORDER BY needed.</li>
<li>Keywords in UPPERCASE, each clause on its own line, JOINs and extra AND lines indented (1 pt each).</li>
<li>Stuck on one? Paste your attempt anyway. Partial credit counts.</li>
</ul>`),
    { type: "sql", title: "Practice test (100 pts)", tasks: Object.values(Q) },
  ],
};
