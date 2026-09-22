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
];
