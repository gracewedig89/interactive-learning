// Built-in starter lessons. All exercises run against public/lessons/practice-db.sql in the browser.
export default [
  {
    id: "select",
    title: "1. SELECT, WHERE, ORDER BY",
    blocks: [
      {
        type: "objectives",
        text: "Your goal is to pull exactly the rows and columns you want from a single table. You'll turn an English question into a query: pick the columns (SELECT), the table (FROM), filter rows (WHERE), and sort (ORDER BY). Nearly every query you'll ever write starts from this shape.",
      },
      {
        type: "text",
        html: `<p><b>Think it → write it.</b> Translate the question piece by piece:</p>
<table class="ref">
<thead><tr><th>In English you say…</th><th>In SQL you write…</th></tr></thead>
<tbody>
<tr><td>"Show me the name and price…"</td><td><code>SELECT name, price</code></td></tr>
<tr><td>"…of products…"</td><td><code>FROM products</code></td></tr>
<tr><td>"…that cost less than $20…"</td><td><code>WHERE price &lt; 20</code></td></tr>
<tr><td>"…cheapest first."</td><td><code>ORDER BY price ASC</code></td></tr>
</tbody></table>
<p>Clauses always go in this order: <code>SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT</code>. Text values go in single quotes (<code>'UT'</code>); numbers don't.</p>`,
      },
      { type: "schema" },
      {
        type: "sql",
        title: "Try it: write each query and press Run",
        tasks: [
          { prompt: "List every product's name and price.", solution: "SELECT name, price FROM products;" },
          { prompt: "Show all columns for customers who live in Utah (state 'UT').", solution: "SELECT * FROM customers WHERE state = 'UT';" },
          {
            prompt: "Show the name and price of products under $20, cheapest first.",
            solution: "SELECT name, price FROM products WHERE price < 20 ORDER BY price;",
            ordered: true,
          },
          { prompt: "Show every order whose status is not 'shipped'.", solution: "SELECT * FROM orders WHERE status <> 'shipped';" },
          { prompt: "Find the first and last name of customers with no join date (it's NULL).", solution: "SELECT first_name, last_name FROM customers WHERE joined_on IS NULL;" },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Table", "A set of rows (records) that all have the same columns (fields)."],
          ["Primary key", "A column whose value uniquely identifies each row (customer_id)."],
          ["SELECT", "Chooses which columns appear in the result. * means all columns."],
          ["WHERE", "Keeps only rows where the condition is true. Runs before grouping."],
          ["ORDER BY", "Sorts the result. ASC (default) = smallest first, DESC = largest first."],
          ["NULL", "Means 'no value / unknown'. Test with IS NULL, never = NULL."],
        ],
      },
      {
        type: "quiz",
        items: [
          {
            question: "Which WHERE clause finds customers with no city?",
            options: ["WHERE city = NULL", "WHERE city IS NULL", "WHERE city = ''", "WHERE NOT city"],
            answerIndex: 1,
            explanation: "NULL isn't equal to anything, not even NULL. Use IS NULL.",
          },
        ],
      },
    ],
  },
  {
    id: "aggregate",
    title: "2. COUNT, SUM, GROUP BY, HAVING",
    blocks: [
      {
        type: "objectives",
        text: "Now you'll answer 'how many', 'how much', and 'per what' questions. Aggregate functions squash many rows into one number, and GROUP BY makes one result row per group. The trick is spotting the word 'per' or 'each' in the question: that's your GROUP BY column.",
      },
      {
        type: "text",
        html: `<table class="ref">
<thead><tr><th>Question sounds like…</th><th>SQL</th></tr></thead>
<tbody>
<tr><td>"How many…"</td><td><code>COUNT(*)</code></td></tr>
<tr><td>"Total…"</td><td><code>SUM(column)</code></td></tr>
<tr><td>"Average…"</td><td><code>AVG(column)</code></td></tr>
<tr><td>"…per category / for each status"</td><td><code>GROUP BY category</code></td></tr>
<tr><td>"…only groups with more than 1"</td><td><code>HAVING COUNT(*) &gt; 1</code></td></tr>
</tbody></table>
<p><b>WHERE vs HAVING:</b> WHERE filters rows <i>before</i> grouping; HAVING filters groups <i>after</i>. If the condition uses COUNT/SUM/AVG, it goes in HAVING.</p>`,
      },
      { type: "schema" },
      {
        type: "sql",
        title: "Try it",
        tasks: [
          { prompt: "How many customers are there?", solution: "SELECT COUNT(*) FROM customers;" },
          { prompt: "Show each order status and how many orders have it.", solution: "SELECT status, COUNT(*) FROM orders GROUP BY status;" },
          { prompt: "Show each product category and its average price.", solution: "SELECT category, AVG(price) FROM products GROUP BY category;" },
          { prompt: "Show only the categories that have more than one product, with the count.", solution: "SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 1;" },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Aggregate function", "Computes one value from many rows: COUNT, SUM, AVG, MIN, MAX."],
          ["GROUP BY", "Splits rows into groups that share a value; aggregates are computed per group."],
          ["HAVING", "Filters groups after GROUP BY, usually using an aggregate."],
          ["Alias (AS)", "A nickname for a column or table, e.g. COUNT(*) AS num_orders."],
        ],
      },
    ],
  },
  {
    id: "joins",
    title: "3. JOINs: combining tables",
    blocks: [
      {
        type: "objectives",
        text: "Real questions need data from more than one table: an order only stores customer_id, not the name. A JOIN lines up rows from two tables where a key matches. You should be able to pick the matching columns (usually a primary key and a foreign key) and choose INNER JOIN vs LEFT JOIN.",
      },
      {
        type: "text",
        html: `<p><code>FROM orders o JOIN customers c ON o.customer_id = c.customer_id</code></p>
<ul>
<li><b>INNER JOIN</b> (plain JOIN): only rows that match in <i>both</i> tables.</li>
<li><b>LEFT JOIN</b>: every row from the left table, with NULLs where there's no match. Use it to find things that <i>don't</i> have a match ("customers who never ordered").</li>
</ul>
<p>Follow the arrows in the schema: customers ← orders ← order_items → products.</p>`,
      },
      { type: "schema" },
      {
        type: "sql",
        title: "Try it",
        tasks: [
          {
            prompt: "Show each order_id with the customer's first and last name.",
            solution: "SELECT o.order_id, c.first_name, c.last_name FROM orders o JOIN customers c ON o.customer_id = c.customer_id;",
          },
          {
            prompt: "Show each product name and the total quantity sold (from order_items).",
            solution: "SELECT p.name, SUM(oi.quantity) FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.name;",
          },
          {
            prompt: "Show each order_id and its total dollar amount (quantity × price).",
            solution: "SELECT oi.order_id, SUM(oi.quantity * p.price) FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY oi.order_id;",
          },
          {
            prompt: "Find the first and last name of customers who have never placed an order.",
            solution: "SELECT c.first_name, c.last_name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;",
          },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Foreign key", "A column that points to a primary key in another table (orders.customer_id → customers.customer_id)."],
          ["INNER JOIN", "Returns only rows with a match in both tables."],
          ["LEFT JOIN", "Returns all rows from the left table, plus matches from the right (NULL if none)."],
          ["Table alias", "Short name for a table in a query (orders o) so you can write o.order_id."],
        ],
      },
      {
        type: "quiz",
        items: [
          {
            question: "You want every customer listed, even those with zero orders. Which join?",
            options: ["INNER JOIN orders", "customers LEFT JOIN orders", "orders LEFT JOIN customers", "CROSS JOIN"],
            answerIndex: 1,
            explanation: "LEFT JOIN keeps every row from the left table (customers).",
          },
        ],
      },
    ],
  },
  {
    id: "ch3-4-review",
    title: "4. Ch 3 & 4 test review: aggregates, joins, subqueries, CTEs & more",
    blocks: [
      {
        type: "objectives",
        text: "This is your Chapter 3 & 4 lab turned into a study lesson. By the end you should be able to: pick the right aggregate (COUNT(*), COUNT(column), COUNT(DISTINCT), SUM, AVG, MIN, MAX), group rows with GROUP BY and filter groups with HAVING, choose the right join (INNER, LEFT, RIGHT, FULL, CROSS) and predict where NULLs appear, write subqueries (in WHERE, with IN, ANY, ALL, scalar and correlated), and explain what stored procedures, triggers, views, derived tables, CTEs (including recursive), NTILE, crosstabs, PIVOT, ROLLUP and CUBE do.",
      },
      {
        type: "text",
        html: `<p><b>How to practice:</b> the practice database now has mini versions of your lab's tables: <code>StockData</code>, <code>CompanyInformation</code>, <code>Calendar</code>, <code>Toys</code>, <code>Colors</code> and <code>JimmyPage</code>. The numbers are smaller than in SSMS (8 companies, a few trading days), but the queries are the same ones you wrote in your lab.</p>
<p class="muted">The practice runs SQLite, which is close to SQL Server. A few things only exist in SQL Server (PIVOT, ROLLUP, CUBE, stored procedures, MONTH/YEAR/DATEDIFF). Those are explained below with questions instead of a Run box. On the test, use the SQL Server versions from your lab.</p>`,
      },
      { type: "schema" },
      {
        type: "text",
        html: `<p><b>Part 1: Aggregates.</b> One value from many rows.</p>
<table class="ref"><thead><tr><th>You write</th><th>It returns</th><th>In your lab</th></tr></thead><tbody>
<tr><td><code>COUNT(*)</code></td><td>Every row, NULLs and all</td><td>262,543 rows in StockData</td></tr>
<tr><td><code>COUNT(TickerSymbol)</code></td><td>Every non-NULL value, <b>repeats included</b></td><td>Also 262,543 (each company appears once per day)</td></tr>
<tr><td><code>COUNT(DISTINCT TickerSymbol)</code></td><td>Each different value <b>once</b></td><td>100 companies</td></tr>
<tr><td><code>MIN / MAX / AVG / SUM(ST_Close)</code></td><td>Smallest / largest / average / total</td><td>$0.0001 / $1,339.13 / ≈$88.49 / ≈23.2 million</td></tr>
</tbody></table>
<p><b>GROUP BY</b> makes one group per value (one row per Industry). <b>HAVING</b> filters <i>groups</i> after counting; <b>WHERE</b> filters <i>rows</i> before grouping. You can't put an aggregate like <code>COUNT()</code> or <code>AVG()</code> in WHERE.</p>
<p class="muted">Lab Query 1 counted a <b>composite key</b>: <code>COUNT(DISTINCT CONCAT(TickerSymbol, '|', TradeDate))</code>. It got the same 262,543 as COUNT(*), which proves no ticker has two rows for the same day.</p>`,
      },
      {
        type: "sql",
        title: "Practice: aggregates, GROUP BY, HAVING",
        tasks: [
          { prompt: "How many rows are in StockData? (Lab Query 2)", solution: "SELECT COUNT(*) AS NumOfRows FROM StockData;" },
          { prompt: "How many DIFFERENT companies appear in StockData? (Lab Query 10)", solution: "SELECT COUNT(DISTINCT TickerSymbol) AS NumOfTickers FROM StockData;" },
          { prompt: "Show the smallest, largest, and average closing price (ST_Close) in one query.", solution: "SELECT MIN(ST_Close), MAX(ST_Close), AVG(ST_Close) FROM StockData;" },
          { prompt: "Show each Industry in CompanyInformation and how many ticker symbols it has. (Lab Query 7)", solution: "SELECT Industry, COUNT(TickerSymbol) AS NumOfTickers FROM CompanyInformation GROUP BY Industry;" },
          { prompt: "Same as above, but keep only industries with more than 1 ticker. (Lab Query 8 used > 16 on the full data)", solution: "SELECT Industry, COUNT(TickerSymbol) AS NumOfTickers FROM CompanyInformation GROUP BY Industry HAVING COUNT(TickerSymbol) > 1;" },
          { prompt: "Prove there are no duplicate ticker/date rows: count the distinct combinations of TickerSymbol and TradeDate. (Lab Query 1, using CONCAT)", solution: "SELECT COUNT(DISTINCT CONCAT(TickerSymbol, '|', TradeDate)) AS NumOfRows FROM StockData;" },
        ],
      },
      {
        type: "classify",
        title: "WHERE or HAVING?",
        categories: ["WHERE", "HAVING"],
        items: [
          { label: "Keep only rows where ST_Close > 100", answer: "WHERE", why: "It tests each row's own value, before any grouping." },
          { label: "Keep only industries with more than 16 tickers", answer: "HAVING", why: "It tests a group's COUNT, so it has to wait until after GROUP BY." },
          { label: "Keep only tickers whose AVG(ST_Close) is at least 100", answer: "HAVING", why: "Any condition on an aggregate goes in HAVING." },
          { label: "Keep only companies located in 'CA'", answer: "WHERE", why: "State is a plain column on each row." },
          { label: "Keep only trade days where SUM(Volume) > 1,000,000,000", answer: "HAVING", why: "The condition is on a SUM, which only exists per group (Lab Ch 4 Query 11)." },
        ],
      },
      {
        type: "text",
        html: `<p><b>Part 2: Joins.</b> In your lab, StockData was the <b>left</b> table and CompanyInformation the <b>right</b>, matched on TickerSymbol.</p>
<table class="ref"><thead><tr><th>Join</th><th>Keeps</th><th>NULLs show up when…</th></tr></thead><tbody>
<tr><td><code>INNER JOIN</code> (just <code>JOIN</code>)</td><td>Only rows that match in <b>both</b> tables</td><td>Never (no unmatched rows)</td></tr>
<tr><td><code>LEFT JOIN</code></td><td><b>All</b> left rows + matches</td><td>A stock row has no company: City/Phone are NULL</td></tr>
<tr><td><code>RIGHT JOIN</code></td><td><b>All</b> right rows + matches</td><td>A company has no stock data: TradeDate/ST_Close are NULL</td></tr>
<tr><td><code>FULL JOIN</code></td><td><b>Everything</b> from both</td><td>Either side has no match</td></tr>
<tr><td><code>CROSS JOIN</code></td><td>Every row paired with every row (Cartesian product)</td><td>No ON clause at all; rows = left × right</td></tr>
</tbody></table>
<p class="muted">Use a table prefix (<code>sd.TickerSymbol</code>) when a column exists in both tables, or SQL won't know which one you mean. A RIGHT JOIN is the same as a LEFT JOIN with the tables swapped.</p>
<p class="muted">In the practice data, <b>NEWCO</b> has stock rows but no company row, and <b>HLTH</b> (Healthwise) is a company with no stock rows, so you can see the NULLs.</p>`,
      },
      {
        type: "sql",
        title: "Practice: joins",
        tasks: [
          { prompt: "INNER JOIN: show sd.TickerSymbol, TradeDate, ST_Close, PhoneNumber and City for every stock row that has a matching company. (Lab Query 11)", solution: "SELECT sd.TickerSymbol, TradeDate, ST_Close, PhoneNumber, City FROM StockData AS sd JOIN CompanyInformation AS ci ON sd.TickerSymbol = ci.TickerSymbol;" },
          { prompt: "LEFT JOIN: the same columns, but keep EVERY StockData row, even ones with no company. (Lab Query 12)", solution: "SELECT sd.TickerSymbol, TradeDate, ST_Close, PhoneNumber, City FROM StockData AS sd LEFT JOIN CompanyInformation AS ci ON sd.TickerSymbol = ci.TickerSymbol;" },
          { prompt: "RIGHT JOIN: the same columns, but keep EVERY company, even ones with no stock data. (Lab Query 13)", solution: "SELECT sd.TickerSymbol, TradeDate, ST_Close, PhoneNumber, City FROM StockData AS sd RIGHT JOIN CompanyInformation AS ci ON sd.TickerSymbol = ci.TickerSymbol;" },
          { prompt: "FULL JOIN: the same columns, keeping unmatched rows from BOTH tables. (Lab Query 14)", solution: "SELECT sd.TickerSymbol, TradeDate, ST_Close, PhoneNumber, City FROM StockData AS sd FULL JOIN CompanyInformation AS ci ON sd.TickerSymbol = ci.TickerSymbol;" },
          { prompt: "CROSS JOIN: pair every toy with every color. (Lab Query 15)", solution: "SELECT * FROM Toys CROSS JOIN Colors;" },
          { prompt: "Find the company (all columns from CompanyInformation) that has NO rows in StockData. Hint: LEFT JOIN from CompanyInformation and look for NULL.", solution: "SELECT ci.* FROM CompanyInformation AS ci LEFT JOIN StockData AS sd ON ci.TickerSymbol = sd.TickerSymbol WHERE sd.TickerSymbol IS NULL;" },
        ],
      },
      {
        type: "classify",
        title: "Which join?",
        categories: ["INNER", "LEFT", "RIGHT", "FULL", "CROSS"],
        items: [
          { label: "Only stock rows that have a matching company", answer: "INNER", why: "INNER keeps matches in both tables only." },
          { label: "Every StockData row (the left table), with company info where it exists", answer: "LEFT", why: "LEFT keeps all rows from the left table." },
          { label: "Every company (the right table), even with no trades", answer: "RIGHT", why: "RIGHT keeps all rows from the right table." },
          { label: "All rows from both tables, matched where possible", answer: "FULL", why: "FULL keeps everything from both sides." },
          { label: "6 toys and 7 colors give 42 rows", answer: "CROSS", why: "A Cartesian product pairs every row with every row: 6 × 7 = 42." },
        ],
      },
      {
        type: "text",
        html: `<p><b>Part 3: Subqueries.</b> A query inside a query.</p>
<table class="ref"><thead><tr><th>Kind</th><th>What it looks like</th><th>Why use it</th></tr></thead><tbody>
<tr><td>In WHERE</td><td><code>WHERE ST_Close &gt; (SELECT AVG(ST_Close) FROM StockData)</code></td><td>You can't write <code>AVG()</code> straight into WHERE, so the inner query works it out first</td></tr>
<tr><td>With IN</td><td><code>WHERE TickerSymbol IN (SELECT TickerSymbol FROM CompanyInformation WHERE State IN ('CA','WA','TX'))</code></td><td>The inner query builds a list; the outer keeps matches (a JOIN could do the same)</td></tr>
<tr><td>Scalar</td><td><code>SELECT (SELECT MAX(...) WHERE TickerSymbol='F') AS 'Ford Max', ...</code></td><td>Each returns one value; with only scalar subqueries, the outer SELECT needs no FROM</td></tr>
<tr><td><code>&gt;= ALL</code></td><td><code>HAVING AVG(ST_Close) &gt;= ALL (SELECT AVG(ST_Close) ... GROUP BY TickerSymbol)</code></td><td>Finds the top group. SQL won't let you stack <code>MAX(AVG(...))</code></td></tr>
<tr><td><code>= ANY</code></td><td><code>WHERE ActualDate = ANY (SELECT TradeDate ... WHERE ST_Close &gt; 1000)</code></td><td>True if it equals at least one value in the list (same as IN)</td></tr>
<tr><td>Correlated</td><td><code>WHERE 1500 &lt; (SELECT COUNT(*) FROM StockData sd WHERE sd.TickerSymbol = c.TickerSymbol)</code></td><td>Inner query uses the outer row (<code>c.</code>), so it runs <b>once per outer row</b>. It can't run alone and it's slower</td></tr>
</tbody></table>
<p class="muted">SQLite (the practice database) doesn't have <code>ALL</code>/<code>ANY</code>. Use <code>IN</code> for <code>= ANY</code>, and <code>ORDER BY … LIMIT 1</code> or <code>= (SELECT MAX(...))</code> for the top one. On the test, use ALL and ANY as in your lab.</p>`,
      },
      {
        type: "sql",
        title: "Practice: subqueries",
        tasks: [
          { prompt: "Show TickerSymbol, TradeDate and ST_Close for rows that closed ABOVE the overall average close. (Lab Query 16)", solution: "SELECT TickerSymbol, TradeDate, ST_Close FROM StockData WHERE ST_Close > (SELECT AVG(ST_Close) FROM StockData);" },
          { prompt: "Show TickerSymbol, TradeDate and ST_Close for companies located in CA, WA or TX, using a subquery with IN. (Lab Query 17)", solution: "SELECT TickerSymbol, TradeDate, ST_Close FROM StockData WHERE TickerSymbol IN (SELECT TickerSymbol FROM CompanyInformation WHERE State IN ('CA','WA','TX'));" },
          { prompt: "In one row, show Ford's highest close as 'Ford Max' and Microsoft's highest close as 'Microsoft Max', using two scalar subqueries. (Lab Query 18)", solution: "SELECT (SELECT MAX(ST_Close) FROM StockData WHERE TickerSymbol = 'F') AS 'Ford Max', (SELECT MAX(ST_Close) FROM StockData WHERE TickerSymbol = 'MSFT') AS 'Microsoft Max';" },
          { prompt: "Show ActualDate, MonthName and YearNumber from Calendar for every date when some stock closed above 1000. (Lab Query 20 used = ANY; here use IN.)", solution: "SELECT ActualDate, MonthName, YearNumber FROM Calendar WHERE ActualDate IN (SELECT TradeDate FROM StockData WHERE ST_Close > 1000);" },
          { prompt: "Correlated subquery: show all columns for companies with MORE THAN 4 trading days in StockData, ordered by TickerSymbol. (Lab Query 21 used 1500.)", solution: "SELECT * FROM CompanyInformation AS c WHERE 4 < (SELECT COUNT(*) FROM StockData AS sd WHERE sd.TickerSymbol = c.TickerSymbol) ORDER BY TickerSymbol;", ordered: true },
        ],
      },
      {
        type: "text",
        html: `<p><b>Part 4: Chapter 4 functions and saved objects</b> (SQL Server syntax from your lab).</p>
<table class="ref"><thead><tr><th>Thing</th><th>Example</th><th>What to remember</th></tr></thead><tbody>
<tr><td>Date function</td><td><code>MONTH('2028-02-29')</code> → 2</td><td>Pulls the month number out of a date (YEAR, DAY work the same way)</td></tr>
<tr><td>String function</td><td><code>ASCII('A')</code> → 65</td><td>Code of the <b>first</b> character. <code>UPPER()</code> makes text uppercase</td></tr>
<tr><td>DATEDIFF</td><td><code>DATEDIFF(yyyy, @DateofBirth, GETDATE())</code></td><td>Counts year boundaries only, so it can say you're a year older if your birthday hasn't come yet</td></tr>
<tr><td>Stored procedure</td><td><code>CREATE PROCEDURE usp_TotalVolume AS …</code> then <code>EXEC usp_TotalVolume;</code></td><td>Saves a query to reuse. Parameters start with <code>@</code>: <code>usp_CurrentAge (@DateofBirth DATETIME)</code></td></tr>
<tr><td>Trigger</td><td><code>CREATE TRIGGER TSCase ON StockData AFTER INSERT, UPDATE AS …</code></td><td>Runs <b>automatically</b> when data changes. The special <code>INSERTED</code> table holds the new rows</td></tr>
<tr><td>View</td><td><code>CREATE VIEW vh1 AS SELECT …</code></td><td>A saved query you use like a table. It stores the <b>query, not the data</b></td></tr>
<tr><td>Derived table</td><td><code>FROM CompanyInformation ci JOIN (SELECT …) AS vh ON …</code></td><td>A subquery in FROM. It needs an alias (<code>vh</code>) and lasts only for that one query</td></tr>
</tbody></table>`,
      },
      {
        type: "text",
        html: `<p><b>Part 5: Window functions and CTEs.</b></p>
<ul class="points">
<li><code>NTILE(4) OVER (ORDER BY ST_Close)</code> sorts every row by price and splits them into 4 equal groups, labeled 1 (lowest prices) to 4 (highest). A window function labels each row; it doesn't collapse rows the way GROUP BY does.</li>
<li>A <b>CTE</b> (<code>WITH Name AS ( … ) SELECT … FROM Name</code>) is a named, temporary result you build first and then query. It makes long queries readable.</li>
<li>A <b>recursive CTE</b> refers to itself: a base query (<code>SELECT 0 AS num</code>), <code>UNION ALL</code>, then a step that reads from the CTE (<code>SELECT num + 5 FROM VanHalen WHERE num + 5 &lt;= 100</code>). The WHERE stops it: 0, 5, … 100 = <b>21 rows</b>.</li>
</ul>
<p class="muted">In SQLite (practice), write <code>WITH RECURSIVE</code>, and use <code>strftime('%Y', TradeDate)</code> where SQL Server uses <code>YEAR(TradeDate)</code>.</p>`,
      },
      {
        type: "sql",
        title: "Practice: CTEs, NTILE and derived tables",
        tasks: [
          { prompt: "Using a CTE named DailySummary, show each TradeDate with how many companies traded (NumberOfCompanies) and the total Volume (TotalVolume), in date order. (Lab Ch 4 Query 10)", solution: "WITH DailySummary AS (SELECT TradeDate, COUNT(*) AS NumberOfCompanies, SUM(Volume) AS TotalVolume FROM StockData GROUP BY TradeDate) SELECT TradeDate, NumberOfCompanies, TotalVolume FROM DailySummary ORDER BY TradeDate;", ordered: true },
          { prompt: "Using a CTE named CompanyAverageVolume, show each TickerSymbol and its average Volume (AvgVolume), highest first. (Lab Ch 4 Query 12)", solution: "WITH CompanyAverageVolume AS (SELECT TickerSymbol, AVG(Volume) AS AvgVolume FROM StockData GROUP BY TickerSymbol) SELECT TickerSymbol, AvgVolume FROM CompanyAverageVolume ORDER BY AvgVolume DESC;", ordered: true },
          { prompt: "Recursive CTE: count from 0 to 100 by 5s in a column named num. (Lab Ch 4 Query 9; remember WITH RECURSIVE in SQLite)", solution: "WITH RECURSIVE VanHalen AS (SELECT 0 AS num UNION ALL SELECT num + 5 FROM VanHalen WHERE num + 5 <= 100) SELECT num FROM VanHalen;" },
          { prompt: "Show TickerSymbol, TradeDate, ST_Close and its price quartile using NTILE(4) OVER (ORDER BY ST_Close) AS Quartile. (Lab Ch 4 Query 7)", solution: "SELECT TickerSymbol, TradeDate, ST_Close, NTILE(4) OVER (ORDER BY ST_Close) AS Quartile FROM StockData;" },
          { prompt: "Derived table: show the TickerSymbol, CompanyName, City, State and AverageClose for companies whose 2024 average close was at least 100. Put the averaging query in FROM with the alias vh. (Lab Ch 4 Query 14; use strftime('%Y', TradeDate) = '2024')", solution: "SELECT vh.TickerSymbol, CompanyName, City, State, AverageClose FROM CompanyInformation AS ci JOIN (SELECT TickerSymbol, AVG(ST_Close) AS AverageClose FROM StockData WHERE strftime('%Y', TradeDate) = '2024' GROUP BY TickerSymbol HAVING AVG(ST_Close) >= 100) AS vh ON vh.TickerSymbol = ci.TickerSymbol;" },
          { prompt: "Using a CTE named YearlyVolume, show each TradeYear and its total Volume, oldest year first. (Lab Ch 4 Query 13; use strftime('%Y', TradeDate) AS TradeYear)", solution: "WITH YearlyVolume AS (SELECT strftime('%Y', TradeDate) AS TradeYear, SUM(Volume) AS TotalVolume FROM StockData GROUP BY strftime('%Y', TradeDate)) SELECT TradeYear, TotalVolume FROM YearlyVolume ORDER BY TradeYear;", ordered: true },
        ],
      },
      {
        type: "text",
        html: `<p><b>Part 6: Crosstabs, PIVOT, ROLLUP and CUBE.</b> A crosstab turns <b>row values into columns</b>: one row per Year, one column per Quarter.</p>
<table class="ref"><thead><tr><th>Way</th><th>Code</th><th>Note</th></tr></thead><tbody>
<tr><td><code>SUM(CASE)</code></td><td><code>SUM(CASE WHEN Quarter = 1 THEN Amount ELSE 0 END) AS [1st Qtr]</code>, one per quarter, <code>GROUP BY [Year]</code></td><td>Works everywhere. Duplicate quarters get <b>added together</b> (2021 Q1 = 200.10 + 195.50 = 395.60)</td></tr>
<tr><td><code>PIVOT</code></td><td><code>PIVOT (SUM(Amount) FOR [Quarter] IN ([1],[2],[3],[4])) AS pvt</code></td><td>SQL Server shortcut for the same result. Total = <code>[1]+[2]+[3]+[4]</code></td></tr>
<tr><td><code>ROLLUP</code></td><td><code>GROUP BY ROLLUP(Industry, TickerSymbol)</code></td><td><b>Hierarchy</b>: a row per ticker, a subtotal per Industry (TickerSymbol = NULL), and a grand total (both NULL)</td></tr>
<tr><td><code>CUBE</code></td><td><code>GROUP BY CUBE(Industry, TickerSymbol)</code></td><td><b>Every combination</b>: everything ROLLUP gives, plus totals per ticker regardless of industry (Industry = NULL). About twice as many rows</td></tr>
</tbody></table>
<p class="muted">In ROLLUP and CUBE results, a NULL doesn't mean missing data. It means "all of them": that row is a subtotal or the grand total.</p>`,
      },
      {
        type: "sql",
        title: "Practice: crosstabs with JimmyPage",
        tasks: [
          { prompt: "Show each Year and its total Amount from JimmyPage, oldest first. (Lab Ch 4 Query 17)", solution: "SELECT [Year], SUM(Amount) AS Total FROM JimmyPage GROUP BY [Year] ORDER BY [Year];", ordered: true },
          { prompt: "Build the crosstab: one row per Year with columns for the 1st, 2nd, 3rd and 4th quarter totals plus a Total column, using SUM(CASE ...). (Lab Ch 4 Query 18)", solution: "SELECT [Year], SUM(CASE WHEN Quarter = 1 THEN Amount ELSE 0 END) AS [1st Qtr], SUM(CASE WHEN Quarter = 2 THEN Amount ELSE 0 END) AS [2nd Qtr], SUM(CASE WHEN Quarter = 3 THEN Amount ELSE 0 END) AS [3rd Qtr], SUM(CASE WHEN Quarter = 4 THEN Amount ELSE 0 END) AS [4th Qtr], SUM(Amount) AS Total FROM JimmyPage GROUP BY [Year];" },
          { prompt: "Pretend to be ROLLUP: show each Industry's total Volume (join StockData to CompanyInformation on TickerSymbol). These are the industry subtotal rows ROLLUP adds.", solution: "SELECT ci.Industry, SUM(sd.Volume) AS TotalVolume FROM StockData AS sd JOIN CompanyInformation AS ci ON sd.TickerSymbol = ci.TickerSymbol GROUP BY ci.Industry;" },
        ],
      },
      {
        type: "calc",
        title: "Quick numbers from your lab",
        intro: "Type the number. Most of these come straight from your lab's results.",
        items: [
          { q: "Toys has 6 rows and Colors has 7. How many rows does Toys CROSS JOIN Colors return?", answer: 42, unit: "#", hint: "A Cartesian product pairs every row with every row.", why: "6 × 7 = 42 rows (and 4 columns, two from each table)." },
          { q: "How many rows does the VanHalen recursive CTE (0 to 100 by 5s) return?", answer: 21, unit: "#", hint: "Count 0, 5, 10 … 100. Don't forget the 0.", why: "100 ÷ 5 = 20 steps, plus the starting 0 = 21 rows." },
          { q: "In the JimmyPage crosstab, what is 2021's 1st quarter total? (2021 Q1 appears twice: 200.10 and 195.50)", answer: 395.6, unit: "#", hint: "SUM(CASE) adds every row for that quarter.", why: "200.10 + 195.50 = 395.60." },
          { q: "What is the 2020 total in JimmyPage? (110.10 + 111.20 + 109.30 + 108.40)", answer: 439, unit: "#", hint: "Add the four 2020 quarters.", why: "110.10 + 111.20 + 109.30 + 108.40 = 439.00." },
          { q: "What does SELECT ASCII('A') return?", answer: 65, unit: "#", hint: "Capital letters start at 65.", why: "The ASCII code for capital A is 65." },
          { q: "What does SELECT MONTH('2028-02-29') return?", answer: 2, unit: "#", hint: "Which month is February?", why: "February is month 2 (2028 is a leap year, so Feb 29 is valid)." },
          { q: "In your lab, COUNT(TickerSymbol) on StockData returned 262,543. What did COUNT(DISTINCT TickerSymbol) return?", answer: 100, unit: "#", hint: "DISTINCT counts each company once.", why: "There are 100 different companies; each appears on many days." },
        ],
      },
      {
        type: "quiz",
        items: [
          { question: "COUNT(*) and COUNT(TickerSymbol) both returned 262,543. Why might they ever differ?", options: ["COUNT(*) skips NULLs", "COUNT(column) skips NULLs in that column; COUNT(*) counts every row", "COUNT(column) removes duplicates", "They can never differ"], answerIndex: 1, explanation: "COUNT(*) counts rows. COUNT(column) counts non-NULL values in that column, repeats included." },
          { question: "Why does Lab Query 16 use a subquery instead of WHERE ST_Close > AVG(ST_Close)?", options: ["Subqueries are faster", "Aggregates aren't allowed directly in WHERE", "AVG only works in SELECT", "WHERE can't compare numbers"], answerIndex: 1, explanation: "WHERE filters single rows before any aggregate exists, so the inner query computes the average first." },
          { question: "In a LEFT JOIN of StockData (left) to CompanyInformation (right), a stock with no matching company shows:", options: ["Nothing; the row is dropped", "NULL for the CompanyInformation columns like City and PhoneNumber", "NULL for TradeDate and ST_Close", "An error"], answerIndex: 1, explanation: "LEFT keeps every left row; the right table's columns are NULL when there's no match." },
          { question: "What makes a subquery 'correlated'?", options: ["It uses JOIN", "It refers to a column from the outer query, so it runs once per outer row", "It returns one value", "It's in the SELECT clause"], answerIndex: 1, explanation: "The inner query depends on the outer row (c.TickerSymbol), so it can't run alone and is slower." },
          { question: "HAVING AVG(ST_Close) >= ALL (SELECT AVG(ST_Close) ... GROUP BY TickerSymbol) finds:", options: ["Every ticker", "The ticker(s) with the highest average close", "The lowest average close", "Tickers above the overall average"], answerIndex: 1, explanation: "Greater than or equal to every average means it's the top one. It replaces MAX(AVG()), which SQL doesn't allow." },
          { question: "A view (CREATE VIEW vh1 AS SELECT ...) stores:", options: ["A copy of the data", "The query; data is pulled fresh each time you use it", "Only column names", "A backup of the table"], answerIndex: 1, explanation: "A view is a saved query you can use like a table." },
          { question: "Inside a trigger, the special INSERTED table holds:", options: ["Deleted rows", "The new rows from the INSERT or UPDATE that fired it", "Every row in the table", "The trigger's code"], answerIndex: 1, explanation: "TSCase used INSERTED to uppercase only the ticker symbols that were just added or changed." },
          { question: "How do you run a stored procedure named usp_TotalVolume?", options: ["RUN usp_TotalVolume", "SELECT usp_TotalVolume", "EXEC usp_TotalVolume", "CALL PROCEDURE usp_TotalVolume"], answerIndex: 2, explanation: "In SQL Server you use EXEC (or EXECUTE)." },
          { question: "In ROLLUP(Industry, TickerSymbol) results, a row with Industry = 'Tech' and TickerSymbol = NULL is:", options: ["Missing data", "The subtotal for the whole Tech industry", "The grand total", "An error"], answerIndex: 1, explanation: "NULL there means 'all tickers', so it's Tech's subtotal. Both NULL is the grand total." },
          { question: "Compared with ROLLUP, CUBE adds:", options: ["Fewer rows", "Totals for every combination, like each ticker regardless of industry", "Only the grand total", "Sorting"], answerIndex: 1, explanation: "CUBE covers every combination of the grouped columns, so it has nearly twice as many rows as ROLLUP here." },
          { question: "DATEDIFF(yyyy, '1995-12-20', GETDATE()) run in October 2026 returns 31, but the person is really 30. Why?", options: ["GETDATE is wrong", "DATEDIFF(yyyy) just counts year boundaries crossed, not whole years lived", "1995 was a leap year", "It rounds up"], answerIndex: 1, explanation: "It compares the year numbers (2026 − 1995 = 31) and ignores that the December birthday hasn't happened yet." },
          { question: "What does NTILE(4) OVER (ORDER BY ST_Close) do?", options: ["Keeps the top 4 rows", "Labels every row 1 to 4 by price quartile", "Groups rows into 4 per ticker", "Rounds prices to 4 decimals"], answerIndex: 1, explanation: "It sorts by price and splits the rows into 4 equal-sized groups, 1 = lowest." },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Aggregate function", "Returns one value from many rows: COUNT, SUM, AVG, MIN, MAX."],
          ["Composite key", "Two or more columns that together identify a row (TickerSymbol + TradeDate)."],
          ["Cartesian product", "Every row of one table paired with every row of another (CROSS JOIN)."],
          ["Subquery", "A query nested inside another query, in WHERE, FROM, SELECT or HAVING."],
          ["Correlated subquery", "A subquery that uses a value from the outer query, so it runs once per outer row."],
          ["Scalar subquery", "A subquery that returns exactly one value."],
          ["Stored procedure", "A saved, named query you run with EXEC; it can take @parameters."],
          ["Trigger", "Code that runs automatically AFTER (or instead of) an INSERT, UPDATE or DELETE."],
          ["View", "A saved query that acts like a virtual table; it stores the query, not the data."],
          ["Derived table", "A subquery in the FROM clause, given an alias and used like a table."],
          ["CTE", "Common table expression: a named temporary result defined with WITH before the main query."],
          ["Recursive CTE", "A CTE that refers to itself to repeat a step until a condition stops it."],
          ["Window function", "Computes a value for each row over a set of rows without collapsing them (NTILE, ROW_NUMBER)."],
          ["Crosstab", "A summary that turns row values (like quarters) into columns."],
          ["ROLLUP / CUBE", "GROUP BY options that add subtotal and grand-total rows; ROLLUP follows the hierarchy, CUBE does every combination."],
        ],
      },
      {
        type: "practice",
        prompts: [
          "Explain the difference between WHERE and HAVING, and give one example of each from the StockData tables.",
          "Your teacher asks: 'Which companies have no stock data?' Describe two different ways to write that query.",
          "In your own words, how is a CTE different from a view?",
        ],
      },
    ],
  },
];
