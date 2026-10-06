// "SQL step by step": one clause per level. Each level unlocks only after every exercise in the
// level before it is passed off (see renderBlocks in web/app.js).
const think = (html) => ({ type: "text", html });

export default {
  id: "step-by-step",
  title: "🪜 SQL step by step: pass off each clause (start here)",
  blocks: [
    {
      type: "objectives",
      text: "Learn SQL one clause at a time. Each level teaches one clause, shows an example, then has you pass it off: put the pieces in order, write real queries, and answer two quick questions. The next level stays locked until you pass every exercise in this one. Use the 🗂 tables button to see the store tables (customers, products, orders, order_items) any time.",
    },
    think(`<p><b>The 7 clauses and the question each one answers</b></p>
<table class="ref"><thead><tr><th>Clause</th><th>Ask yourself</th></tr></thead><tbody>
<tr><td><code>SELECT</code></td><td>Which columns do I want to see in the output? (or <code>*</code> for all)</td></tr>
<tr><td><code>FROM</code></td><td>Which table is the main data coming from?</td></tr>
<tr><td><code>JOIN … ON</code></td><td>Do I need columns from another table? ON says how the two tables connect (usually matching IDs).</td></tr>
<tr><td><code>WHERE</code></td><td>Filter individual rows <i>before</i> any grouping (e.g. only rows where <code>category = 'Books'</code>).</td></tr>
<tr><td><code>GROUP BY</code></td><td>Collapse many rows into one row per group. Only needed with an aggregate like <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>.</td></tr>
<tr><td><code>HAVING</code></td><td>Filter groups <i>after</i> they're formed (e.g. <code>COUNT(*) &gt; 2</code>). WHERE's cousin, for aggregates.</td></tr>
<tr><td><code>ORDER BY</code></td><td>Sort the final output. ASC is the default; DESC for biggest-first.</td></tr>
</tbody></table>
<p>They're always written in this order: <code>SELECT → FROM → JOIN … ON → WHERE → GROUP BY → HAVING → ORDER BY</code>. Memory trick: <b>"Sweet Friends Join With Grace, Hugging Often."</b></p>`),

    // ---------------- Level 1 ----------------
    { type: "level", title: "SELECT + FROM: pick the columns and the table", goal: "Write a query that shows chosen columns from one table." },
    think(`<p><b>SELECT</b> = which columns do I want to see? <b>FROM</b> = which table are they in?</p>
<p><b>How to think:</b> read the question and circle the <i>nouns you want shown</i> (those are the SELECT columns), then find the table that holds them (that's FROM).</p>
<p><b>Example:</b> "Show each product's name and price."</p>
<pre><code>SELECT name, price
FROM products;</code></pre>
<p>Put commas <i>between</i> columns, never after the last one. <code>SELECT *</code> means every column. Exam formatting: each clause starts on its own line.</p>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      intro: "Tap the pieces in the order they go. Tap a placed piece to take it back.",
      items: [
        { goal: "Show every column of the customers table.", pieces: ["SELECT *", "FROM customers;"], explanation: "SELECT always comes first, then FROM." },
        { goal: "Show each customer's first name, last name and city.", pieces: ["SELECT first_name, last_name, city", "FROM customers;"], explanation: "Columns are listed after SELECT, separated by commas. The table goes after FROM." },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query",
      tasks: [
        { prompt: "Show every column of every product.", solution: "SELECT *\nFROM products;", hint: "* means all columns. The table is products." },
        { prompt: "Show just the name and category of every product.", solution: "SELECT name, category\nFROM products;", hint: "Two columns, separated by a comma." },
        { prompt: "Show each order's order_id, order_date and status.", solution: "SELECT order_id, order_date, status\nFROM orders;", hint: "All three columns live in the orders table." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "Which clause chooses the columns that show up in the output?", options: ["FROM", "SELECT", "WHERE", "ORDER BY"], answerIndex: 1, explanation: "SELECT = which columns. FROM = which table." },
        { question: "What's wrong with: SELECT name, price, FROM products;", options: ["Nothing", "The comma after price", "FROM must come first", "You need a WHERE"], answerIndex: 1, explanation: "No comma after the last column; it makes SQL expect another column." },
      ],
    },

    // ---------------- Level 2 ----------------
    { type: "level", title: "WHERE: keep only the rows you want", goal: "Filter rows with =, <>, <, >, AND, OR, LIKE, IN, BETWEEN and IS NULL." },
    think(`<p><b>WHERE</b> filters individual rows. Only rows where the condition is true stay.</p>
<p><b>How to think:</b> look for words like "only", "that", "who", "where", "under", "more than". That part of the question becomes the WHERE condition.</p>
<p><b>Example:</b> "Show the name and price of products that cost less than $20."</p>
<pre><code>SELECT name, price
FROM products
WHERE price &lt; 20;</code></pre>
<table class="ref"><thead><tr><th>Want</th><th>Write</th></tr></thead><tbody>
<tr><td>Text match</td><td><code>WHERE state = 'UT'</code> (text in single quotes)</td></tr>
<tr><td>Not equal</td><td><code>WHERE status &lt;&gt; 'shipped'</code></td></tr>
<tr><td>Both must be true</td><td><code>WHERE category = 'Supplies' AND price &lt; 5</code></td></tr>
<tr><td>Either one</td><td><code>WHERE state = 'NV' OR state = 'AZ'</code></td></tr>
<tr><td>In a list</td><td><code>WHERE state IN ('NV', 'AZ')</code></td></tr>
<tr><td>A range (inclusive)</td><td><code>WHERE price BETWEEN 10 AND 50</code></td></tr>
<tr><td>Starts with</td><td><code>WHERE last_name LIKE 'B%'</code> (% = anything)</td></tr>
<tr><td>Empty / missing</td><td><code>WHERE joined_on IS NULL</code> (never <code>= NULL</code>)</td></tr>
</tbody></table>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      intro: "WHERE always goes right after FROM.",
      items: [
        { goal: "Show all customers who live in Utah.", pieces: ["SELECT *", "FROM customers", "WHERE state = 'UT';"], explanation: "SELECT → FROM → WHERE." },
        { goal: "Show the name of Electronics products under $50.", pieces: ["SELECT name", "FROM products", "WHERE category = 'Electronics'", "AND price < 50;"], explanation: "Both conditions go in one WHERE, joined with AND." },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query",
      tasks: [
        { prompt: "Show the first and last name of customers who live in Utah (state 'UT').", solution: "SELECT first_name, last_name\nFROM customers\nWHERE state = 'UT';", hint: "Text goes in single quotes: 'UT'." },
        { prompt: "Show the name and price of products that cost more than $40.", solution: "SELECT name, price\nFROM products\nWHERE price > 40;", hint: "Numbers don't need quotes." },
        { prompt: "Show every order that is NOT shipped.", solution: "SELECT *\nFROM orders\nWHERE status <> 'shipped';", hint: "Not equal is <>." },
        { prompt: "Show the name and price of Supplies products that cost less than $5.", solution: "SELECT name, price\nFROM products\nWHERE category = 'Supplies' AND price < 5;", hint: "Two conditions joined with AND." },
        { prompt: "Show the first name and last name of customers whose last name starts with 'C'.", solution: "SELECT first_name, last_name\nFROM customers\nWHERE last_name LIKE 'C%';", hint: "LIKE 'C%' means starts with C." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "Which finds customers with no join date?", options: ["WHERE joined_on = NULL", "WHERE joined_on IS NULL", "WHERE joined_on = ''", "WHERE NULL joined_on"], answerIndex: 1, explanation: "NULL is never equal to anything. Always use IS NULL / IS NOT NULL." },
        { question: "When does WHERE do its filtering?", options: ["After grouping", "Before any grouping, one row at a time", "After sorting", "Only with JOINs"], answerIndex: 1, explanation: "WHERE checks each row before GROUP BY runs. That's why it can't use COUNT/SUM." },
      ],
    },

    // ---------------- Level 3 ----------------
    { type: "level", title: "ORDER BY: sort the output", goal: "Sort results smallest-first (ASC) or biggest-first (DESC), and by more than one column." },
    think(`<p><b>ORDER BY</b> sorts the final output. <code>ASC</code> (A→Z, 1→9) is the default; <code>DESC</code> is biggest-first.</p>
<p><b>How to think:</b> look for "sorted", "in order", "alphabetical", "highest", "most expensive first", "newest". ORDER BY is always the <b>last</b> clause.</p>
<p><b>Example:</b> "Show product names and prices, most expensive first."</p>
<pre><code>SELECT name, price
FROM products
ORDER BY price DESC;</code></pre>
<p>Two sort columns: <code>ORDER BY state, last_name</code> sorts by state, then by last name inside each state.</p>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      items: [
        { goal: "Show the name and price of Accessories, cheapest first.", pieces: ["SELECT name, price", "FROM products", "WHERE category = 'Accessories'", "ORDER BY price;"], explanation: "ORDER BY goes after WHERE. Always last." },
        { goal: "Show customers' last names alphabetically.", pieces: ["SELECT last_name", "FROM customers", "ORDER BY last_name ASC;"], explanation: "ASC is A→Z (and is the default)." },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query",
      tasks: [
        { prompt: "Show the name and price of every product, cheapest first.", solution: "SELECT name, price\nFROM products\nORDER BY price;", ordered: true, hint: "ASC is the default, so you can leave it off." },
        { prompt: "Show the name and price of every product, most expensive first.", solution: "SELECT name, price\nFROM products\nORDER BY price DESC;", ordered: true, hint: "Biggest first = DESC." },
        { prompt: "Show first name, last name and city of Utah customers, sorted by last name A→Z.", solution: "SELECT first_name, last_name, city\nFROM customers\nWHERE state = 'UT'\nORDER BY last_name;", ordered: true, hint: "WHERE comes before ORDER BY." },
        { prompt: "Show each order's order_id and order_date, newest date first.", solution: "SELECT order_id, order_date\nFROM orders\nORDER BY order_date DESC;", ordered: true, hint: "Newest date = biggest date = DESC." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "If you write ORDER BY price with no ASC or DESC, how is it sorted?", options: ["Biggest first", "Smallest first (ASC)", "Random", "It's an error"], answerIndex: 1, explanation: "ASC is the default." },
        { question: "Where does ORDER BY go?", options: ["Right after SELECT", "Before WHERE", "At the very end", "Before FROM"], answerIndex: 2, explanation: "Sorting happens last, so ORDER BY is the last clause." },
      ],
    },

    // ---------------- Level 4 ----------------
    { type: "level", title: "Aggregates: COUNT, SUM, AVG, MIN, MAX", goal: "Turn many rows into one number." },
    think(`<p><b>Aggregate functions</b> squash many rows into one value.</p>
<table class="ref"><thead><tr><th>Question says</th><th>Use</th></tr></thead><tbody>
<tr><td>"How many…"</td><td><code>COUNT(*)</code></td></tr>
<tr><td>"Total…" / "sum of…"</td><td><code>SUM(column)</code></td></tr>
<tr><td>"Average…"</td><td><code>AVG(column)</code></td></tr>
<tr><td>"Cheapest / lowest / earliest"</td><td><code>MIN(column)</code></td></tr>
<tr><td>"Most expensive / highest / latest"</td><td><code>MAX(column)</code></td></tr>
</tbody></table>
<p><b>Example:</b> "How many products cost less than $20?"</p>
<pre><code>SELECT COUNT(*) AS cheap_products
FROM products
WHERE price &lt; 20;</code></pre>
<p><b>How to think:</b> WHERE throws out rows first, then COUNT counts what's left. <code>AS name</code> gives the result column a nice name (an <i>alias</i>).</p>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      items: [
        { goal: "What's the average price of Electronics products?", pieces: ["SELECT AVG(price) AS avg_price", "FROM products", "WHERE category = 'Electronics';"], explanation: "The aggregate goes in SELECT; the filter in WHERE." },
        { goal: "How many customers live in Nevada?", pieces: ["SELECT COUNT(*)", "FROM customers", "WHERE state = 'NV';"], explanation: "WHERE keeps the NV rows, then COUNT counts them." },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query",
      tasks: [
        { prompt: "How many customers are there in total?", solution: "SELECT COUNT(*) AS total_customers\nFROM customers;", hint: "COUNT(*) counts rows." },
        { prompt: "What is the price of the most expensive product?", solution: "SELECT MAX(price) AS highest_price\nFROM products;", hint: "Highest = MAX." },
        { prompt: "What is the average price of all products?", solution: "SELECT AVG(price) AS avg_price\nFROM products;", hint: "Average = AVG." },
        { prompt: "How many orders have the status 'shipped'?", solution: "SELECT COUNT(*) AS shipped_orders\nFROM orders\nWHERE status = 'shipped';", hint: "Filter with WHERE first, then COUNT." },
        { prompt: "What is the total quantity of all items ever ordered (order_items)?", solution: "SELECT SUM(quantity) AS total_quantity\nFROM order_items;", hint: "Total = SUM." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "\"How many orders were cancelled?\" Which function?", options: ["SUM(*)", "COUNT(*)", "AVG(*)", "MAX(*)"], answerIndex: 1, explanation: "\"How many\" = COUNT." },
        { question: "What does AS do in SELECT AVG(price) AS avg_price?", options: ["Filters rows", "Sorts the result", "Names the result column", "Joins a table"], answerIndex: 2, explanation: "AS gives a column an alias (a nicer name)." },
      ],
    },

    // ---------------- Level 5 ----------------
    { type: "level", title: "GROUP BY: one row per group", goal: "Use GROUP BY to get a number for each category, status, state, etc." },
    think(`<p><b>GROUP BY</b> collapses many rows into one row per group. It's only needed when you use an aggregate (COUNT, SUM, AVG…) and want it <i>per</i> something.</p>
<p><b>How to think:</b> spot the words <b>"per"</b>, <b>"each"</b> or <b>"by"</b>. Whatever comes after them is your GROUP BY column, and it also goes in SELECT.</p>
<p><b>Example:</b> "How many products are in <i>each</i> category?"</p>
<pre><code>SELECT category, COUNT(*) AS num_products
FROM products
GROUP BY category;</code></pre>
<p><b>The golden rule:</b> every column in SELECT that is <i>not</i> inside an aggregate must be in GROUP BY. (<code>category</code> is in both.)</p>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      items: [
        { goal: "How many customers are in each state?", pieces: ["SELECT state, COUNT(*) AS num_customers", "FROM customers", "GROUP BY state;"], explanation: "\"each state\" → GROUP BY state, and state is in SELECT too." },
        { goal: "Average price per category, highest average first.", pieces: ["SELECT category, AVG(price) AS avg_price", "FROM products", "GROUP BY category", "ORDER BY avg_price DESC;"], explanation: "GROUP BY comes before ORDER BY." },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query",
      tasks: [
        { prompt: "Show each order status and how many orders have it.", solution: "SELECT status, COUNT(*) AS num_orders\nFROM orders\nGROUP BY status;", hint: "\"each status\" → GROUP BY status." },
        { prompt: "Show each product category and its average price.", solution: "SELECT category, AVG(price) AS avg_price\nFROM products\nGROUP BY category;", hint: "Put category in SELECT and GROUP BY." },
        { prompt: "For each order_id in order_items, show the total quantity of items.", solution: "SELECT order_id, SUM(quantity) AS total_items\nFROM order_items\nGROUP BY order_id;", hint: "\"for each order\" → GROUP BY order_id; total → SUM." },
        { prompt: "Show each state and how many customers live there, most customers first.", solution: "SELECT state, COUNT(*) AS num_customers\nFROM customers\nGROUP BY state\nORDER BY num_customers DESC;", hint: "GROUP BY, then ORDER BY ... DESC. Ties can be in any order." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "SELECT category, COUNT(*) FROM products; is missing what?", options: ["WHERE category", "GROUP BY category", "ORDER BY category", "Nothing"], answerIndex: 1, explanation: "category isn't inside an aggregate, so it must be in GROUP BY." },
        { question: "\"Total sales per customer\" — what's the GROUP BY column?", options: ["sales", "the total", "customer", "You don't need GROUP BY"], answerIndex: 2, explanation: "The word after \"per\" is the group." },
      ],
    },

    // ---------------- Level 6 ----------------
    { type: "level", title: "HAVING: filter the groups", goal: "Keep only groups that meet a condition on an aggregate." },
    think(`<p><b>HAVING</b> filters groups <i>after</i> GROUP BY forms them. It's WHERE's cousin, but for aggregates.</p>
<p><b>How to think:</b> if the condition uses COUNT/SUM/AVG/MIN/MAX → <b>HAVING</b>. If it uses a plain column on each row → <b>WHERE</b>.</p>
<p><b>Example:</b> "Show categories that have more than one product."</p>
<pre><code>SELECT category, COUNT(*) AS num_products
FROM products
GROUP BY category
HAVING COUNT(*) &gt; 1;</code></pre>
<p>You can use both: <code>WHERE</code> throws out rows, <code>GROUP BY</code> groups what's left, then <code>HAVING</code> throws out groups.</p>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      items: [
        { goal: "Which statuses have at least 2 orders?", pieces: ["SELECT status, COUNT(*)", "FROM orders", "GROUP BY status", "HAVING COUNT(*) >= 2;"], explanation: "HAVING comes right after GROUP BY." },
        { goal: "Among products under $100, which categories average more than $10?", pieces: ["SELECT category, AVG(price)", "FROM products", "WHERE price < 100", "GROUP BY category", "HAVING AVG(price) > 10;"], explanation: "WHERE (rows) → GROUP BY → HAVING (groups)." },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query",
      tasks: [
        { prompt: "Show each category that has more than one product, with its count.", solution: "SELECT category, COUNT(*) AS num_products\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 1;", hint: "The condition uses COUNT → HAVING." },
        { prompt: "Show each state that has 2 or more customers, with its count.", solution: "SELECT state, COUNT(*) AS num_customers\nFROM customers\nGROUP BY state\nHAVING COUNT(*) >= 2;", hint: "GROUP BY state, then HAVING COUNT(*) >= 2." },
        { prompt: "Show each order_id (from order_items) whose total quantity is more than 3.", solution: "SELECT order_id, SUM(quantity) AS total_items\nFROM order_items\nGROUP BY order_id\nHAVING SUM(quantity) > 3;", hint: "Group by order_id; HAVING SUM(quantity) > 3." },
        { prompt: "Show each category whose average price is over $20.", solution: "SELECT category, AVG(price) AS avg_price\nFROM products\nGROUP BY category\nHAVING AVG(price) > 20;", hint: "Average is an aggregate → HAVING." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "\"Only categories with more than 2 products\" goes in…", options: ["WHERE COUNT(*) > 2", "HAVING COUNT(*) > 2", "ORDER BY COUNT(*) > 2", "SELECT COUNT(*) > 2"], answerIndex: 1, explanation: "Conditions on aggregates go in HAVING. WHERE can't use COUNT." },
        { question: "\"Only Utah customers, counted per city\" — where does state = 'UT' go?", options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"], answerIndex: 1, explanation: "state is a plain row column, so WHERE filters it before grouping." },
      ],
    },

    // ---------------- Level 7 ----------------
    { type: "level", title: "JOIN … ON: pull in another table", goal: "Combine two (then three) tables by matching IDs." },
    think(`<p><b>JOIN</b> brings in columns from another table. <b>ON</b> says how the tables connect, usually matching IDs (primary key = foreign key).</p>
<p><b>How to think:</b> if the columns you want live in two different tables, you need a JOIN. Find the column both tables share (like <code>customer_id</code>) and put it after ON.</p>
<p><b>Example:</b> "Show each order's id with the customer's first name."</p>
<pre><code>SELECT o.order_id, c.first_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;</code></pre>
<p><code>o</code> and <code>c</code> are <b>table aliases</b> (nicknames), so <code>o.order_id</code> means "order_id from orders". Use them whenever two tables share a column name.</p>
<table class="ref"><thead><tr><th>Tables</th><th>Connect ON</th></tr></thead><tbody>
<tr><td>orders ↔ customers</td><td><code>o.customer_id = c.customer_id</code></td></tr>
<tr><td>order_items ↔ orders</td><td><code>oi.order_id = o.order_id</code></td></tr>
<tr><td>order_items ↔ products</td><td><code>oi.product_id = p.product_id</code></td></tr>
</tbody></table>
<p><b>JOIN</b> (INNER JOIN) keeps only rows that match in both tables. <b>LEFT JOIN</b> keeps every row from the left table even with no match (the missing columns are NULL).</p>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      items: [
        { goal: "Show each order's id and status with the customer's last name.", pieces: ["SELECT o.order_id, o.status, c.last_name", "FROM orders o", "JOIN customers c", "ON o.customer_id = c.customer_id;"], explanation: "FROM the main table, JOIN the second, ON the matching IDs." },
        { goal: "Show each product name and the quantity ordered.", pieces: ["SELECT p.name, oi.quantity", "FROM order_items oi", "JOIN products p", "ON oi.product_id = p.product_id;"], explanation: "order_items and products share product_id." },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query",
      tasks: [
        { prompt: "Show every order's order_id and order_date with the customer's first and last name.", solution: "SELECT o.order_id, o.order_date, c.first_name, c.last_name\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id;", hint: "orders and customers share customer_id." },
        { prompt: "Show the order_id, product name and quantity for every row in order_items.", solution: "SELECT oi.order_id, p.name, oi.quantity\nFROM order_items oi\nJOIN products p ON oi.product_id = p.product_id;", hint: "order_items and products share product_id." },
        { prompt: "Show the order_id and order_date of every order placed by a customer from Utah.", solution: "SELECT o.order_id, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nWHERE c.state = 'UT';", hint: "JOIN first, then WHERE c.state = 'UT'." },
        { prompt: "Show every customer's first name and last name with each of their order_ids, including customers with NO orders (their order_id will be NULL).", solution: "SELECT c.first_name, c.last_name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;", hint: "Keep every customer → customers on the left, LEFT JOIN orders." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "What does ON do in a JOIN?", options: ["Filters by a value like 'UT'", "Says which columns match between the two tables", "Sorts the rows", "Groups the rows"], answerIndex: 1, explanation: "ON gives the matching rule, usually id = id." },
        { question: "You want ALL customers, even those who never ordered. Use…", options: ["JOIN", "LEFT JOIN with customers on the left", "WHERE", "HAVING"], answerIndex: 1, explanation: "LEFT JOIN keeps every row of the left table." },
      ],
    },

    // ---------------- Level 8 ----------------
    { type: "level", title: "Put it all together", goal: "Use JOIN, WHERE, GROUP BY, HAVING and ORDER BY in one query, formatted like the exam." },
    think(`<p><b>How to build any query</b> (do it in this order in your head):</p>
<ol>
<li><b>What do they want to see?</b> → SELECT (columns + any COUNT/SUM/AVG)</li>
<li><b>Where does it live?</b> → FROM the main table, JOIN … ON any others</li>
<li><b>Any row filters?</b> ("only Utah", "only shipped") → WHERE</li>
<li><b>"Per" / "each"?</b> → GROUP BY the non-aggregate columns</li>
<li><b>Filter on a count/total/average?</b> → HAVING</li>
<li><b>Sorted?</b> → ORDER BY</li>
</ol>
<p><b>Example:</b> "For each customer, show their last name and how many shipped orders they have, most first."</p>
<pre><code>SELECT c.last_name, COUNT(*) AS shipped_orders
FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'shipped'
GROUP BY c.last_name
ORDER BY shipped_orders DESC;</code></pre>
<p><b>Exam formatting (1 pt each):</b> every clause on its own line, keywords in CAPS, indent JOIN lines and extra conditions with Tab. The editor below checks this for you.</p>`),
    {
      type: "order",
      title: "Pass off: put the pieces in order",
      items: [
        {
          goal: "Total quantity sold per product name, only products with more than 2 sold, biggest first.",
          pieces: ["SELECT p.name, SUM(oi.quantity) AS total_sold", "FROM order_items oi", "JOIN products p ON oi.product_id = p.product_id", "GROUP BY p.name", "HAVING SUM(oi.quantity) > 2", "ORDER BY total_sold DESC;"],
          explanation: "SELECT → FROM → JOIN → GROUP BY → HAVING → ORDER BY.",
        },
        {
          goal: "Number of non-cancelled orders per state, alphabetical by state.",
          pieces: ["SELECT c.state, COUNT(*) AS num_orders", "FROM orders o", "JOIN customers c ON o.customer_id = c.customer_id", "WHERE o.status <> 'cancelled'", "GROUP BY c.state", "ORDER BY c.state;"],
          explanation: "WHERE comes after the JOIN and before GROUP BY.",
        },
      ],
    },
    {
      type: "sql",
      title: "Pass off: write the query (format it like the exam)",
      tasks: [
        { prompt: "For each customer last name, show how many orders they placed, most orders first.", solution: "SELECT c.last_name, COUNT(*) AS num_orders\nFROM customers c\n    JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.last_name\nORDER BY num_orders DESC;", format: true, hint: "JOIN customers and orders, GROUP BY last_name, ORDER BY the count DESC." },
        { prompt: "Show each product name and the total quantity sold, for products that sold more than 2 in total. Biggest first.", solution: "SELECT p.name, SUM(oi.quantity) AS total_sold\nFROM order_items oi\n    JOIN products p ON oi.product_id = p.product_id\nGROUP BY p.name\nHAVING SUM(oi.quantity) > 2\nORDER BY total_sold DESC;", ordered: true, format: true, hint: "SUM(quantity) per product name, HAVING > 2." },
        { prompt: "For each product category, show the total quantity sold on shipped orders only.", solution: "SELECT p.category, SUM(oi.quantity) AS total_sold\nFROM order_items oi\n    JOIN orders o ON oi.order_id = o.order_id\n    JOIN products p ON oi.product_id = p.product_id\nWHERE o.status = 'shipped'\nGROUP BY p.category;", format: true, hint: "Three tables: order_items joins orders (for status) and products (for category)." },
        { prompt: "Show each state and the number of shipped orders from customers there, only states with at least 2 shipped orders.", solution: "SELECT c.state, COUNT(*) AS shipped_orders\nFROM orders o\n    JOIN customers c ON o.customer_id = c.customer_id\nWHERE o.status = 'shipped'\nGROUP BY c.state\nHAVING COUNT(*) >= 2;", format: true, hint: "WHERE status = 'shipped' (rows) and HAVING COUNT(*) >= 2 (groups)." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "Which is the correct clause order?", options: ["SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY", "SELECT, WHERE, FROM, GROUP BY, ORDER BY, HAVING", "FROM, SELECT, GROUP BY, WHERE, HAVING, ORDER BY", "SELECT, FROM, GROUP BY, WHERE, ORDER BY, HAVING"], answerIndex: 0, explanation: "Sweet Friends (Join) With Grace, Hugging Often." },
        { question: "\"Only shipped orders\" and \"only customers with 2+ orders\" — which goes where?", options: ["Both in WHERE", "Both in HAVING", "shipped → WHERE, 2+ orders → HAVING", "shipped → HAVING, 2+ orders → WHERE"], answerIndex: 2, explanation: "A plain column on each row → WHERE. A count → HAVING." },
      ],
    },

    // ---------------- Level 9 ----------------
    { type: "level", title: "🏆 Final boss: exam-style questions", goal: "Pass these and you're ready for the Exam simulator lesson." },
    think(`<p>No order puzzles here. Read the question, run through the six steps from Level 8, and write it from scratch. Use the hint only if you're stuck, and format each query like the exam.</p>`),
    {
      type: "sql",
      title: "Boss round",
      tasks: [
        { prompt: "Show the first name, last name and city of customers from Nevada or Arizona, sorted by last name.", solution: "SELECT first_name, last_name, city\nFROM customers\nWHERE state IN ('NV', 'AZ')\nORDER BY last_name;", ordered: true, format: true, hint: "IN ('NV', 'AZ') or state = 'NV' OR state = 'AZ'." },
        { prompt: "Show the cheapest and most expensive product price in each category.", solution: "SELECT category, MIN(price) AS cheapest, MAX(price) AS most_expensive\nFROM products\nGROUP BY category;", format: true, hint: "MIN and MAX in the same SELECT, GROUP BY category." },
        { prompt: "For each customer (first and last name), show the total quantity of items they've ordered. Only include customers with more than 3 items. Biggest first.", solution: "SELECT c.first_name, c.last_name, SUM(oi.quantity) AS total_items\nFROM customers c\n    JOIN orders o ON c.customer_id = o.customer_id\n    JOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.first_name, c.last_name\nHAVING SUM(oi.quantity) > 3\nORDER BY total_items DESC;", format: true, hint: "customers → orders → order_items. GROUP BY both name columns." },
        { prompt: "Show the first and last name of customers who have never placed an order.", solution: "SELECT c.first_name, c.last_name\nFROM customers c\n    LEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;", format: true, hint: "LEFT JOIN orders, then keep the rows where the order side IS NULL." },
      ],
    },
    {
      type: "quiz",
      items: [
        { question: "SELECT c.first_name, COUNT(*) FROM customers c JOIN orders o ON c.customer_id = o.customer_id; — what's missing?", options: ["HAVING", "GROUP BY c.first_name", "ORDER BY", "WHERE"], answerIndex: 1, explanation: "first_name isn't in an aggregate, so it must be grouped." },
        { question: "Which can use COUNT(*) in its condition?", options: ["WHERE", "ON", "HAVING", "FROM"], answerIndex: 2, explanation: "Only HAVING filters on aggregates." },
      ],
    },
  ],
};
