// Built-in starter lessons. All exercises run against public/lessons/practice-db.sql in the browser.
import stepByStep from "./sql-steps.js";
import practiceTest from "./sql-practice-test.js";

export default [
  stepByStep,
  practiceTest,
  {
    "id": "crash-course",
    "title": "⚡ SQL crash course: every term (start here)",
    "blocks": [
      {
        "type": "objectives",
        "text": "Learn the SQL vocabulary fast. Every term from your class is here, split into small decks. For each deck, flip the flash cards (mark \"still learning\" on any you don't know), then play the matching game until you can clear it quickly. Then read real code in the last deck so the words turn into queries you recognize."
      },
      {
        "type": "text",
        "html": "<p><b>⏱ Your 3-hour plan</b></p>\n<table class=\"ref\"><thead><tr><th>Time</th><th>Do this</th></tr></thead><tbody>\n<tr><td>0:00 – 0:45</td><td>This lesson, <b>decks 1–4</b>: flash cards, then the matching game for each. Repeat \"still learning\" cards until they're all known.</td></tr>\n<tr><td>0:45 – 1:15</td><td>This lesson, <b>decks 5–7</b> (joins, subqueries, Chapter 4) the same way.</td></tr>\n<tr><td>1:15 – 1:30</td><td><b>Deck 8: read the code.</b> Say out loud what each query does before flipping.</td></tr>\n<tr><td>1:30 – 2:15</td><td><b>Lesson 5 (Put the query together):</b> the put-in-order pieces, then the 12 practice queries.</td></tr>\n<tr><td>2:15 – 2:45</td><td><b>Lesson 4 (Ch 3 &amp; 4 review):</b> skim the tables, do the join and subquery practice, then the quiz.</td></tr>\n<tr><td>2:45 – 3:00</td><td>Come back here and re-run every deck's <b>\"Study the ones I missed\"</b> and one matching round each.</td></tr>\n</tbody></table>\n<p class=\"muted\">Short on time? Decks 2, 3, 4 and 5 plus Lesson 5's quiz cover most test questions.</p>"
      },
      {
        "type": "flashcards",
        "title": "🃏 1. Database basics",
        "cards": [
          [
            "Database",
            "An organized collection of data, stored in tables."
          ],
          [
            "Table",
            "A set of data about one thing (like Customers), arranged in rows and columns."
          ],
          [
            "Row (record)",
            "One entry in a table, like one customer."
          ],
          [
            "Column (field)",
            "One attribute stored for every row, like city or price."
          ],
          [
            "Primary key",
            "A column (or columns) whose value uniquely identifies each row. No duplicates, no NULLs."
          ],
          [
            "Foreign key",
            "A column that points to the primary key of another table. It's how tables link together."
          ],
          [
            "Composite key",
            "A key made of two or more columns together (like TickerSymbol + TradeDate)."
          ],
          [
            "NULL",
            "A missing or unknown value. It isn't zero and it isn't blank text."
          ],
          [
            "Query",
            "A request for data, written in SQL."
          ],
          [
            "SQL",
            "Structured Query Language: the language for asking a relational database for data."
          ],
          [
            "Relational database",
            "A database of tables that relate to each other through keys."
          ],
          [
            "Schema",
            "The design of a database: its tables, columns and how they connect."
          ],
          [
            "Data type",
            "What kind of value a column holds: INT, DECIMAL, CHAR/VARCHAR (text), DATE…"
          ],
          [
            "SSMS",
            "SQL Server Management Studio: the program you write and run SQL Server queries in."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: Database basics",
        "pairs": [
          [
            "Database",
            "An organized collection of data, stored in tables."
          ],
          [
            "Table",
            "A set of data about one thing (like Customers), arranged in rows and columns."
          ],
          [
            "Row (record)",
            "One entry in a table, like one customer."
          ],
          [
            "Column (field)",
            "One attribute stored for every row, like city or price."
          ],
          [
            "Primary key",
            "A column (or columns) whose value uniquely identifies each row. No duplicates, no NULLs."
          ],
          [
            "Foreign key",
            "A column that points to the primary key of another table. It's how tables link together."
          ],
          [
            "Composite key",
            "A key made of two or more columns together (like TickerSymbol + TradeDate)."
          ],
          [
            "NULL",
            "A missing or unknown value. It isn't zero and it isn't blank text."
          ],
          [
            "Query",
            "A request for data, written in SQL."
          ],
          [
            "SQL",
            "Structured Query Language: the language for asking a relational database for data."
          ],
          [
            "Relational database",
            "A database of tables that relate to each other through keys."
          ],
          [
            "Schema",
            "The design of a database: its tables, columns and how they connect."
          ],
          [
            "Data type",
            "What kind of value a column holds: INT, DECIMAL, CHAR/VARCHAR (text), DATE…"
          ],
          [
            "SSMS",
            "SQL Server Management Studio: the program you write and run SQL Server queries in."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "flashcards",
        "title": "🃏 2. The clauses (in order!)",
        "cards": [
          [
            "SELECT",
            "Lists the columns (or calculations) you want to see."
          ],
          [
            "FROM",
            "Names the table the data comes from."
          ],
          [
            "WHERE",
            "Filters ROWS before any grouping. No aggregates allowed here."
          ],
          [
            "GROUP BY",
            "Makes one group (one result row) per distinct value, for use with aggregates."
          ],
          [
            "HAVING",
            "Filters GROUPS after GROUP BY. Conditions on COUNT/SUM/AVG go here."
          ],
          [
            "ORDER BY",
            "Sorts the result. ASC (default) = smallest first, DESC = largest first."
          ],
          [
            "TOP / LIMIT",
            "Returns only the first N rows: SELECT TOP 5 (SQL Server) or LIMIT 5 (SQLite/MySQL)."
          ],
          [
            "AS (alias)",
            "Gives a column or table a nickname: SUM(qty) AS total, FROM customers AS c."
          ],
          [
            "DISTINCT",
            "Removes duplicate rows from the result: SELECT DISTINCT state."
          ],
          [
            "Clause order",
            "SELECT → FROM → JOIN … ON → WHERE → GROUP BY → HAVING → ORDER BY"
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: The clauses (in order!)",
        "pairs": [
          [
            "SELECT",
            "Lists the columns (or calculations) you want to see."
          ],
          [
            "FROM",
            "Names the table the data comes from."
          ],
          [
            "WHERE",
            "Filters ROWS before any grouping. No aggregates allowed here."
          ],
          [
            "GROUP BY",
            "Makes one group (one result row) per distinct value, for use with aggregates."
          ],
          [
            "HAVING",
            "Filters GROUPS after GROUP BY. Conditions on COUNT/SUM/AVG go here."
          ],
          [
            "ORDER BY",
            "Sorts the result. ASC (default) = smallest first, DESC = largest first."
          ],
          [
            "TOP / LIMIT",
            "Returns only the first N rows: SELECT TOP 5 (SQL Server) or LIMIT 5 (SQLite/MySQL)."
          ],
          [
            "AS (alias)",
            "Gives a column or table a nickname: SUM(qty) AS total, FROM customers AS c."
          ],
          [
            "DISTINCT",
            "Removes duplicate rows from the result: SELECT DISTINCT state."
          ],
          [
            "Clause order",
            "SELECT → FROM → JOIN … ON → WHERE → GROUP BY → HAVING → ORDER BY"
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "flashcards",
        "title": "🃏 3. Filtering operators",
        "cards": [
          [
            "=",
            "Equals. Text goes in single quotes: state = 'UT'."
          ],
          [
            "<> or !=",
            "Not equal to."
          ],
          [
            "AND",
            "Both conditions must be true."
          ],
          [
            "OR",
            "At least one condition must be true."
          ],
          [
            "NOT",
            "Flips a condition: NOT IN, NOT BETWEEN, NOT LIKE, IS NOT NULL."
          ],
          [
            "IN",
            "Matches any value in a list: state IN ('UT','NV')."
          ],
          [
            "BETWEEN",
            "A range that includes both ends: price BETWEEN 10 AND 50."
          ],
          [
            "LIKE",
            "Matches a text pattern using wildcards."
          ],
          [
            "% wildcard",
            "Any number of characters: 'B%' = starts with B, '%book%' = contains book."
          ],
          [
            "_ wildcard",
            "Exactly one character: '_a%' = second letter is a."
          ],
          [
            "IS NULL",
            "Finds missing values. Never write = NULL."
          ],
          [
            "ASC / DESC",
            "Sort smallest-to-largest (ASC, the default) or largest-to-smallest (DESC)."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: Filtering operators",
        "pairs": [
          [
            "=",
            "Equals. Text goes in single quotes: state = 'UT'."
          ],
          [
            "<> or !=",
            "Not equal to."
          ],
          [
            "AND",
            "Both conditions must be true."
          ],
          [
            "OR",
            "At least one condition must be true."
          ],
          [
            "NOT",
            "Flips a condition: NOT IN, NOT BETWEEN, NOT LIKE, IS NOT NULL."
          ],
          [
            "IN",
            "Matches any value in a list: state IN ('UT','NV')."
          ],
          [
            "BETWEEN",
            "A range that includes both ends: price BETWEEN 10 AND 50."
          ],
          [
            "LIKE",
            "Matches a text pattern using wildcards."
          ],
          [
            "% wildcard",
            "Any number of characters: 'B%' = starts with B, '%book%' = contains book."
          ],
          [
            "_ wildcard",
            "Exactly one character: '_a%' = second letter is a."
          ],
          [
            "IS NULL",
            "Finds missing values. Never write = NULL."
          ],
          [
            "ASC / DESC",
            "Sort smallest-to-largest (ASC, the default) or largest-to-smallest (DESC)."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "flashcards",
        "title": "🃏 4. Aggregates and grouping",
        "cards": [
          [
            "Aggregate function",
            "Turns many rows into one value: COUNT, SUM, AVG, MIN, MAX."
          ],
          [
            "COUNT(*)",
            "Counts every row, including NULLs."
          ],
          [
            "COUNT(column)",
            "Counts the non-NULL values in a column, repeats included."
          ],
          [
            "COUNT(DISTINCT column)",
            "Counts each different value once (100 companies, not 262,543 rows)."
          ],
          [
            "SUM",
            "Adds up a numeric column."
          ],
          [
            "AVG",
            "The average (mean) of a numeric column; NULLs are skipped."
          ],
          [
            "MIN",
            "The smallest value."
          ],
          [
            "MAX",
            "The largest value."
          ],
          [
            "Summary row",
            "One result row per group made by GROUP BY."
          ],
          [
            "WHERE vs HAVING",
            "WHERE filters rows before grouping; HAVING filters groups after."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: Aggregates and grouping",
        "pairs": [
          [
            "Aggregate function",
            "Turns many rows into one value: COUNT, SUM, AVG, MIN, MAX."
          ],
          [
            "COUNT(*)",
            "Counts every row, including NULLs."
          ],
          [
            "COUNT(column)",
            "Counts the non-NULL values in a column, repeats included."
          ],
          [
            "COUNT(DISTINCT column)",
            "Counts each different value once (100 companies, not 262,543 rows)."
          ],
          [
            "SUM",
            "Adds up a numeric column."
          ],
          [
            "AVG",
            "The average (mean) of a numeric column; NULLs are skipped."
          ],
          [
            "MIN",
            "The smallest value."
          ],
          [
            "MAX",
            "The largest value."
          ],
          [
            "Summary row",
            "One result row per group made by GROUP BY."
          ],
          [
            "WHERE vs HAVING",
            "WHERE filters rows before grouping; HAVING filters groups after."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "flashcards",
        "title": "🃏 5. Joins",
        "cards": [
          [
            "JOIN / INNER JOIN",
            "Returns only rows that match in BOTH tables."
          ],
          [
            "LEFT JOIN",
            "ALL rows from the left table + matches from the right (NULLs where no match)."
          ],
          [
            "RIGHT JOIN",
            "ALL rows from the right table + matches from the left."
          ],
          [
            "FULL OUTER JOIN",
            "ALL rows from BOTH tables, matched where possible, NULLs elsewhere."
          ],
          [
            "CROSS JOIN",
            "Every row paired with every row (rows = left × right). No ON clause."
          ],
          [
            "Cartesian product",
            "Every possible combination of rows from two tables."
          ],
          [
            "ON",
            "Says which columns must match to join: ON c.customer_id = o.customer_id."
          ],
          [
            "Table alias",
            "A short name for a table (FROM StockData AS sd) so you can write sd.TickerSymbol."
          ],
          [
            "Unmatched rows",
            "Rows with no partner in the other table; they show up as NULLs in outer joins."
          ],
          [
            "Find rows with no match",
            "LEFT JOIN … WHERE right_table.key IS NULL"
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: Joins",
        "pairs": [
          [
            "JOIN / INNER JOIN",
            "Returns only rows that match in BOTH tables."
          ],
          [
            "LEFT JOIN",
            "ALL rows from the left table + matches from the right (NULLs where no match)."
          ],
          [
            "RIGHT JOIN",
            "ALL rows from the right table + matches from the left."
          ],
          [
            "FULL OUTER JOIN",
            "ALL rows from BOTH tables, matched where possible, NULLs elsewhere."
          ],
          [
            "CROSS JOIN",
            "Every row paired with every row (rows = left × right). No ON clause."
          ],
          [
            "Cartesian product",
            "Every possible combination of rows from two tables."
          ],
          [
            "ON",
            "Says which columns must match to join: ON c.customer_id = o.customer_id."
          ],
          [
            "Table alias",
            "A short name for a table (FROM StockData AS sd) so you can write sd.TickerSymbol."
          ],
          [
            "Unmatched rows",
            "Rows with no partner in the other table; they show up as NULLs in outer joins."
          ],
          [
            "Find rows with no match",
            "LEFT JOIN … WHERE right_table.key IS NULL"
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "flashcards",
        "title": "🃏 6. Subqueries",
        "cards": [
          [
            "Subquery",
            "A query inside another query, in parentheses."
          ],
          [
            "Scalar subquery",
            "A subquery that returns exactly one value."
          ],
          [
            "Subquery in WHERE",
            "WHERE price > (SELECT AVG(price) …): needed because aggregates can't go in WHERE."
          ],
          [
            "IN (subquery)",
            "Keeps rows whose value appears in the list the subquery returns."
          ],
          [
            "= ANY",
            "True if it equals at least one value in the subquery's list (same as IN)."
          ],
          [
            ">= ALL",
            "True if it's greater than or equal to EVERY value in the list; finds the top one."
          ],
          [
            "Correlated subquery",
            "Uses a column from the outer query, so it runs once per outer row (slower)."
          ],
          [
            "Derived table",
            "A subquery in the FROM clause, given an alias and used like a table."
          ],
          [
            "EXISTS",
            "True if the subquery returns at least one row."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: Subqueries",
        "pairs": [
          [
            "Subquery",
            "A query inside another query, in parentheses."
          ],
          [
            "Scalar subquery",
            "A subquery that returns exactly one value."
          ],
          [
            "Subquery in WHERE",
            "WHERE price > (SELECT AVG(price) …): needed because aggregates can't go in WHERE."
          ],
          [
            "IN (subquery)",
            "Keeps rows whose value appears in the list the subquery returns."
          ],
          [
            "= ANY",
            "True if it equals at least one value in the subquery's list (same as IN)."
          ],
          [
            ">= ALL",
            "True if it's greater than or equal to EVERY value in the list; finds the top one."
          ],
          [
            "Correlated subquery",
            "Uses a column from the outer query, so it runs once per outer row (slower)."
          ],
          [
            "Derived table",
            "A subquery in the FROM clause, given an alias and used like a table."
          ],
          [
            "EXISTS",
            "True if the subquery returns at least one row."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "flashcards",
        "title": "🃏 7. Chapter 4: saved objects, CTEs and more",
        "cards": [
          [
            "Stored procedure",
            "A saved, named query you reuse. Created with CREATE PROCEDURE."
          ],
          [
            "EXEC",
            "Runs a stored procedure: EXEC usp_TotalVolume;"
          ],
          [
            "Parameter (@)",
            "An input to a procedure: @DateofBirth DATETIME."
          ],
          [
            "Trigger",
            "Code that runs automatically AFTER an INSERT, UPDATE or DELETE."
          ],
          [
            "INSERTED table",
            "The special table a trigger uses to see the new rows."
          ],
          [
            "View",
            "A saved query you use like a table. Stores the query, not the data."
          ],
          [
            "CTE",
            "Common Table Expression: WITH Name AS (…) builds a temporary result to query."
          ],
          [
            "Recursive CTE",
            "A CTE that refers to itself (base query UNION ALL step) until a WHERE stops it."
          ],
          [
            "UNION ALL",
            "Stacks the results of two queries, keeping duplicates."
          ],
          [
            "Window function",
            "Calculates over a set of rows but keeps every row (doesn't collapse like GROUP BY)."
          ],
          [
            "NTILE(4) OVER (ORDER BY …)",
            "Labels each row 1-4 by quartile."
          ],
          [
            "CASE",
            "IF-THEN logic in SQL: CASE WHEN … THEN … ELSE … END."
          ],
          [
            "Crosstab",
            "A summary that turns row values (like quarters) into columns."
          ],
          [
            "PIVOT",
            "SQL Server operator that builds a crosstab with less code."
          ],
          [
            "ROLLUP",
            "Adds subtotals that follow a hierarchy, plus a grand total."
          ],
          [
            "CUBE",
            "Adds subtotals for every combination, plus a grand total."
          ],
          [
            "GETDATE()",
            "Today's date and time in SQL Server."
          ],
          [
            "DATEDIFF",
            "The difference between two dates, in a unit like yyyy (years)."
          ],
          [
            "MONTH() / YEAR()",
            "Pull the month or year number out of a date."
          ],
          [
            "ASCII()",
            "The numeric code of the first character: ASCII('A') = 65."
          ],
          [
            "UPPER()",
            "Makes text all capital letters."
          ],
          [
            "CONCAT()",
            "Joins pieces of text together."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: Chapter 4: saved objects, CTEs and more",
        "pairs": [
          [
            "Stored procedure",
            "A saved, named query you reuse. Created with CREATE PROCEDURE."
          ],
          [
            "EXEC",
            "Runs a stored procedure: EXEC usp_TotalVolume;"
          ],
          [
            "Parameter (@)",
            "An input to a procedure: @DateofBirth DATETIME."
          ],
          [
            "Trigger",
            "Code that runs automatically AFTER an INSERT, UPDATE or DELETE."
          ],
          [
            "INSERTED table",
            "The special table a trigger uses to see the new rows."
          ],
          [
            "View",
            "A saved query you use like a table. Stores the query, not the data."
          ],
          [
            "CTE",
            "Common Table Expression: WITH Name AS (…) builds a temporary result to query."
          ],
          [
            "Recursive CTE",
            "A CTE that refers to itself (base query UNION ALL step) until a WHERE stops it."
          ],
          [
            "UNION ALL",
            "Stacks the results of two queries, keeping duplicates."
          ],
          [
            "Window function",
            "Calculates over a set of rows but keeps every row (doesn't collapse like GROUP BY)."
          ],
          [
            "NTILE(4) OVER (ORDER BY …)",
            "Labels each row 1-4 by quartile."
          ],
          [
            "CASE",
            "IF-THEN logic in SQL: CASE WHEN … THEN … ELSE … END."
          ],
          [
            "Crosstab",
            "A summary that turns row values (like quarters) into columns."
          ],
          [
            "PIVOT",
            "SQL Server operator that builds a crosstab with less code."
          ],
          [
            "ROLLUP",
            "Adds subtotals that follow a hierarchy, plus a grand total."
          ],
          [
            "CUBE",
            "Adds subtotals for every combination, plus a grand total."
          ],
          [
            "GETDATE()",
            "Today's date and time in SQL Server."
          ],
          [
            "DATEDIFF",
            "The difference between two dates, in a unit like yyyy (years)."
          ],
          [
            "MONTH() / YEAR()",
            "Pull the month or year number out of a date."
          ],
          [
            "ASCII()",
            "The numeric code of the first character: ASCII('A') = 65."
          ],
          [
            "UPPER()",
            "Makes text all capital letters."
          ],
          [
            "CONCAT()",
            "Joins pieces of text together."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "flashcards",
        "title": "🃏 8. Read the code: what does it do?",
        "cards": [
          [
            "SELECT * FROM products;",
            "Show every column and every row of products."
          ],
          [
            "SELECT name FROM products WHERE price < 20;",
            "Names of products cheaper than $20."
          ],
          [
            "SELECT COUNT(*) FROM orders;",
            "How many orders there are."
          ],
          [
            "SELECT state, COUNT(*) FROM customers GROUP BY state;",
            "How many customers live in each state."
          ],
          [
            "… GROUP BY category HAVING COUNT(*) > 1;",
            "Only categories that have more than one row."
          ],
          [
            "SELECT DISTINCT city FROM customers;",
            "Each different city once (no repeats)."
          ],
          [
            "WHERE last_name LIKE 'B%'",
            "Last names starting with B."
          ],
          [
            "WHERE price BETWEEN 10 AND 50",
            "Prices from 10 to 50, including 10 and 50."
          ],
          [
            "WHERE state IN ('UT','NV')",
            "State is Utah or Nevada."
          ],
          [
            "WHERE joined_on IS NULL",
            "Rows with no join date."
          ],
          [
            "ORDER BY price DESC",
            "Sort with the most expensive first."
          ],
          [
            "FROM customers c JOIN orders o ON c.customer_id = o.customer_id",
            "Combine each order with its customer (matches only)."
          ],
          [
            "LEFT JOIN orders o … WHERE o.order_id IS NULL",
            "Customers who have no orders."
          ],
          [
            "WHERE price > (SELECT AVG(price) FROM products)",
            "Products that cost more than the average price."
          ],
          [
            "WITH Totals AS (SELECT …) SELECT * FROM Totals;",
            "Build a temporary result named Totals (a CTE), then query it."
          ],
          [
            "SELECT TOP 3 name FROM products ORDER BY price DESC;",
            "The 3 most expensive products (SQL Server)."
          ],
          [
            "EXEC usp_TotalVolume;",
            "Run the stored procedure named usp_TotalVolume."
          ],
          [
            "CREATE VIEW vh1 AS SELECT …",
            "Save a query as a reusable view named vh1."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "matchGame",
        "title": "🧩 Match it: code to meaning",
        "pairs": [
          [
            "SELECT * FROM products;",
            "Show every column and every row of products."
          ],
          [
            "SELECT name FROM products WHERE price < 20;",
            "Names of products cheaper than $20."
          ],
          [
            "SELECT COUNT(*) FROM orders;",
            "How many orders there are."
          ],
          [
            "SELECT state, COUNT(*) FROM customers GROUP BY state;",
            "How many customers live in each state."
          ],
          [
            "… GROUP BY category HAVING COUNT(*) > 1;",
            "Only categories that have more than one row."
          ],
          [
            "SELECT DISTINCT city FROM customers;",
            "Each different city once (no repeats)."
          ],
          [
            "WHERE last_name LIKE 'B%'",
            "Last names starting with B."
          ],
          [
            "WHERE price BETWEEN 10 AND 50",
            "Prices from 10 to 50, including 10 and 50."
          ],
          [
            "WHERE state IN ('UT','NV')",
            "State is Utah or Nevada."
          ],
          [
            "WHERE joined_on IS NULL",
            "Rows with no join date."
          ],
          [
            "ORDER BY price DESC",
            "Sort with the most expensive first."
          ],
          [
            "FROM customers c JOIN orders o ON c.customer_id = o.customer_id",
            "Combine each order with its customer (matches only)."
          ],
          [
            "LEFT JOIN orders o … WHERE o.order_id IS NULL",
            "Customers who have no orders."
          ],
          [
            "WHERE price > (SELECT AVG(price) FROM products)",
            "Products that cost more than the average price."
          ],
          [
            "WITH Totals AS (SELECT …) SELECT * FROM Totals;",
            "Build a temporary result named Totals (a CTE), then query it."
          ],
          [
            "SELECT TOP 3 name FROM products ORDER BY price DESC;",
            "The 3 most expensive products (SQL Server)."
          ],
          [
            "EXEC usp_TotalVolume;",
            "Run the stored procedure named usp_TotalVolume."
          ],
          [
            "CREATE VIEW vh1 AS SELECT …",
            "Save a query as a reusable view named vh1."
          ]
        ],
        "deck": "sql-crash"
      },
      {
        "type": "definitions",
        "items": [
          [
            "Database",
            "An organized collection of data, stored in tables."
          ],
          [
            "Table",
            "A set of data about one thing (like Customers), arranged in rows and columns."
          ],
          [
            "Row (record)",
            "One entry in a table, like one customer."
          ],
          [
            "Column (field)",
            "One attribute stored for every row, like city or price."
          ],
          [
            "Primary key",
            "A column (or columns) whose value uniquely identifies each row. No duplicates, no NULLs."
          ],
          [
            "Foreign key",
            "A column that points to the primary key of another table. It's how tables link together."
          ],
          [
            "Composite key",
            "A key made of two or more columns together (like TickerSymbol + TradeDate)."
          ],
          [
            "NULL",
            "A missing or unknown value. It isn't zero and it isn't blank text."
          ],
          [
            "Query",
            "A request for data, written in SQL."
          ],
          [
            "SQL",
            "Structured Query Language: the language for asking a relational database for data."
          ],
          [
            "Relational database",
            "A database of tables that relate to each other through keys."
          ],
          [
            "Schema",
            "The design of a database: its tables, columns and how they connect."
          ],
          [
            "Data type",
            "What kind of value a column holds: INT, DECIMAL, CHAR/VARCHAR (text), DATE…"
          ],
          [
            "SSMS",
            "SQL Server Management Studio: the program you write and run SQL Server queries in."
          ],
          [
            "SELECT",
            "Lists the columns (or calculations) you want to see."
          ],
          [
            "FROM",
            "Names the table the data comes from."
          ],
          [
            "WHERE",
            "Filters ROWS before any grouping. No aggregates allowed here."
          ],
          [
            "GROUP BY",
            "Makes one group (one result row) per distinct value, for use with aggregates."
          ],
          [
            "HAVING",
            "Filters GROUPS after GROUP BY. Conditions on COUNT/SUM/AVG go here."
          ],
          [
            "ORDER BY",
            "Sorts the result. ASC (default) = smallest first, DESC = largest first."
          ],
          [
            "TOP / LIMIT",
            "Returns only the first N rows: SELECT TOP 5 (SQL Server) or LIMIT 5 (SQLite/MySQL)."
          ],
          [
            "AS (alias)",
            "Gives a column or table a nickname: SUM(qty) AS total, FROM customers AS c."
          ],
          [
            "DISTINCT",
            "Removes duplicate rows from the result: SELECT DISTINCT state."
          ],
          [
            "Clause order",
            "SELECT → FROM → JOIN … ON → WHERE → GROUP BY → HAVING → ORDER BY"
          ],
          [
            "=",
            "Equals. Text goes in single quotes: state = 'UT'."
          ],
          [
            "<> or !=",
            "Not equal to."
          ],
          [
            "AND",
            "Both conditions must be true."
          ],
          [
            "OR",
            "At least one condition must be true."
          ],
          [
            "NOT",
            "Flips a condition: NOT IN, NOT BETWEEN, NOT LIKE, IS NOT NULL."
          ],
          [
            "IN",
            "Matches any value in a list: state IN ('UT','NV')."
          ],
          [
            "BETWEEN",
            "A range that includes both ends: price BETWEEN 10 AND 50."
          ],
          [
            "LIKE",
            "Matches a text pattern using wildcards."
          ],
          [
            "% wildcard",
            "Any number of characters: 'B%' = starts with B, '%book%' = contains book."
          ],
          [
            "_ wildcard",
            "Exactly one character: '_a%' = second letter is a."
          ],
          [
            "IS NULL",
            "Finds missing values. Never write = NULL."
          ],
          [
            "ASC / DESC",
            "Sort smallest-to-largest (ASC, the default) or largest-to-smallest (DESC)."
          ],
          [
            "Aggregate function",
            "Turns many rows into one value: COUNT, SUM, AVG, MIN, MAX."
          ],
          [
            "COUNT(*)",
            "Counts every row, including NULLs."
          ],
          [
            "COUNT(column)",
            "Counts the non-NULL values in a column, repeats included."
          ],
          [
            "COUNT(DISTINCT column)",
            "Counts each different value once (100 companies, not 262,543 rows)."
          ],
          [
            "SUM",
            "Adds up a numeric column."
          ],
          [
            "AVG",
            "The average (mean) of a numeric column; NULLs are skipped."
          ],
          [
            "MIN",
            "The smallest value."
          ],
          [
            "MAX",
            "The largest value."
          ],
          [
            "Summary row",
            "One result row per group made by GROUP BY."
          ],
          [
            "WHERE vs HAVING",
            "WHERE filters rows before grouping; HAVING filters groups after."
          ],
          [
            "JOIN / INNER JOIN",
            "Returns only rows that match in BOTH tables."
          ],
          [
            "LEFT JOIN",
            "ALL rows from the left table + matches from the right (NULLs where no match)."
          ],
          [
            "RIGHT JOIN",
            "ALL rows from the right table + matches from the left."
          ],
          [
            "FULL OUTER JOIN",
            "ALL rows from BOTH tables, matched where possible, NULLs elsewhere."
          ],
          [
            "CROSS JOIN",
            "Every row paired with every row (rows = left × right). No ON clause."
          ],
          [
            "Cartesian product",
            "Every possible combination of rows from two tables."
          ],
          [
            "ON",
            "Says which columns must match to join: ON c.customer_id = o.customer_id."
          ],
          [
            "Table alias",
            "A short name for a table (FROM StockData AS sd) so you can write sd.TickerSymbol."
          ],
          [
            "Unmatched rows",
            "Rows with no partner in the other table; they show up as NULLs in outer joins."
          ],
          [
            "Find rows with no match",
            "LEFT JOIN … WHERE right_table.key IS NULL"
          ],
          [
            "Subquery",
            "A query inside another query, in parentheses."
          ],
          [
            "Scalar subquery",
            "A subquery that returns exactly one value."
          ],
          [
            "Subquery in WHERE",
            "WHERE price > (SELECT AVG(price) …): needed because aggregates can't go in WHERE."
          ],
          [
            "IN (subquery)",
            "Keeps rows whose value appears in the list the subquery returns."
          ],
          [
            "= ANY",
            "True if it equals at least one value in the subquery's list (same as IN)."
          ],
          [
            ">= ALL",
            "True if it's greater than or equal to EVERY value in the list; finds the top one."
          ],
          [
            "Correlated subquery",
            "Uses a column from the outer query, so it runs once per outer row (slower)."
          ],
          [
            "Derived table",
            "A subquery in the FROM clause, given an alias and used like a table."
          ],
          [
            "EXISTS",
            "True if the subquery returns at least one row."
          ],
          [
            "Stored procedure",
            "A saved, named query you reuse. Created with CREATE PROCEDURE."
          ],
          [
            "EXEC",
            "Runs a stored procedure: EXEC usp_TotalVolume;"
          ],
          [
            "Parameter (@)",
            "An input to a procedure: @DateofBirth DATETIME."
          ],
          [
            "Trigger",
            "Code that runs automatically AFTER an INSERT, UPDATE or DELETE."
          ],
          [
            "INSERTED table",
            "The special table a trigger uses to see the new rows."
          ],
          [
            "View",
            "A saved query you use like a table. Stores the query, not the data."
          ],
          [
            "CTE",
            "Common Table Expression: WITH Name AS (…) builds a temporary result to query."
          ],
          [
            "Recursive CTE",
            "A CTE that refers to itself (base query UNION ALL step) until a WHERE stops it."
          ],
          [
            "UNION ALL",
            "Stacks the results of two queries, keeping duplicates."
          ],
          [
            "Window function",
            "Calculates over a set of rows but keeps every row (doesn't collapse like GROUP BY)."
          ],
          [
            "NTILE(4) OVER (ORDER BY …)",
            "Labels each row 1-4 by quartile."
          ],
          [
            "CASE",
            "IF-THEN logic in SQL: CASE WHEN … THEN … ELSE … END."
          ],
          [
            "Crosstab",
            "A summary that turns row values (like quarters) into columns."
          ],
          [
            "PIVOT",
            "SQL Server operator that builds a crosstab with less code."
          ],
          [
            "ROLLUP",
            "Adds subtotals that follow a hierarchy, plus a grand total."
          ],
          [
            "CUBE",
            "Adds subtotals for every combination, plus a grand total."
          ],
          [
            "GETDATE()",
            "Today's date and time in SQL Server."
          ],
          [
            "DATEDIFF",
            "The difference between two dates, in a unit like yyyy (years)."
          ],
          [
            "MONTH() / YEAR()",
            "Pull the month or year number out of a date."
          ],
          [
            "ASCII()",
            "The numeric code of the first character: ASCII('A') = 65."
          ],
          [
            "UPPER()",
            "Makes text all capital letters."
          ],
          [
            "CONCAT()",
            "Joins pieces of text together."
          ]
        ]
      }
    ]
  },
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
  {
    "id": "build-queries",
    "title": "5. Put the query together (test prep)",
    "blocks": [
      {
        "type": "objectives",
        "text": "Learn a repeatable recipe for turning any English question into a SQL query, clause by clause, so you're never staring at a blank box. You'll also practice the operators that show up on tests (IN, BETWEEN, LIKE, IS NULL, DISTINCT), know exactly when to use WHERE vs HAVING, and build queries that filter, group, join and sort all at once."
      },
      {
        "type": "text",
        "html": "<p><b>The 5-question recipe.</b> Ask these in order, and each answer becomes one clause:</p>\n<table class=\"ref\"><thead><tr><th>Ask yourself</th><th>Write</th></tr></thead><tbody>\n<tr><td>1. What do they want to <b>see</b>? (columns, or a count/total/average)</td><td><code>SELECT …</code></td></tr>\n<tr><td>2. Where does that data <b>live</b>? (one table, or two that share a key)</td><td><code>FROM …</code> (+ <code>JOIN … ON a.key = b.key</code>)</td></tr>\n<tr><td>3. Which <b>rows</b> count? (filters on plain columns)</td><td><code>WHERE …</code></td></tr>\n<tr><td>4. Do they say <b>\"each / per / by\"</b>? Any condition on a <b>total</b>?</td><td><code>GROUP BY …</code> then <code>HAVING …</code></td></tr>\n<tr><td>5. <b>Sorted</b>? <b>Top N</b>?</td><td><code>ORDER BY … ASC/DESC</code>, <code>LIMIT n</code> (SQL Server: <code>SELECT TOP n</code>)</td></tr>\n</tbody></table>\n<p><b>Clue words → SQL</b></p>\n<table class=\"ref\"><thead><tr><th>If the question says…</th><th>Use</th></tr></thead><tbody>\n<tr><td>\"how many\"</td><td><code>COUNT(*)</code></td></tr>\n<tr><td>\"how many different / unique\"</td><td><code>COUNT(DISTINCT col)</code></td></tr>\n<tr><td>\"total\", \"average\", \"highest\", \"lowest\"</td><td><code>SUM</code>, <code>AVG</code>, <code>MAX</code>, <code>MIN</code></td></tr>\n<tr><td>\"for each\", \"per\", \"by\"</td><td><code>GROUP BY</code> that column (and put it in SELECT too)</td></tr>\n<tr><td>\"only groups/categories with more than…\"</td><td><code>HAVING COUNT(*) &gt; …</code></td></tr>\n<tr><td>\"one of these\", \"either … or …\"</td><td><code>IN ('a', 'b')</code></td></tr>\n<tr><td>\"between X and Y\" (inclusive)</td><td><code>BETWEEN X AND Y</code></td></tr>\n<tr><td>\"starts with\", \"contains\", \"ends with\"</td><td><code>LIKE 'A%'</code>, <code>LIKE '%A%'</code>, <code>LIKE '%A'</code></td></tr>\n<tr><td>\"missing\", \"blank\", \"no value\"</td><td><code>IS NULL</code> (never <code>= NULL</code>)</td></tr>\n<tr><td>\"no duplicates\", \"list the different…\"</td><td><code>SELECT DISTINCT</code></td></tr>\n<tr><td>\"never\", \"without\", \"has no…\"</td><td><code>LEFT JOIN … WHERE right.key IS NULL</code></td></tr>\n<tr><td>\"highest first\", \"most recent first\"</td><td><code>ORDER BY … DESC</code></td></tr>\n</tbody></table>"
      },
      {
        "type": "text",
        "html": "<p><b>Worked example: build it one step at a time.</b> <i>\"Show the total quantity sold of each product, but only products with more than 3 sold, highest first.\"</i></p>\n<ol>\n<li><b>See?</b> The product name and a total quantity: <code>SELECT p.name, SUM(oi.quantity) AS total_sold</code></li>\n<li><b>Lives where?</b> Names are in products, quantities in order_items, linked by product_id: <code>FROM products p JOIN order_items oi ON p.product_id = oi.product_id</code></li>\n<li><b>Which rows?</b> All of them, so no WHERE.</li>\n<li><b>\"Each product\"</b> means <code>GROUP BY p.name</code>. <b>\"More than 3 sold\"</b> is a condition on a total, so <code>HAVING SUM(oi.quantity) &gt; 3</code></li>\n<li><b>Highest first:</b> <code>ORDER BY total_sold DESC</code></li>\n</ol>\n<pre class=\"ord-answer\">SELECT p.name, SUM(oi.quantity) AS total_sold\nFROM products p\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY p.name\nHAVING SUM(oi.quantity) &gt; 3\nORDER BY total_sold DESC;</pre>\n<p class=\"muted\">Tip: write and run it one clause at a time. Run the SELECT … FROM first, then add WHERE, then GROUP BY, and so on, checking the result each time.</p>"
      },
      {
        "type": "schema"
      },
      {
        "type": "order",
        "title": "Practice: put the pieces in order",
        "intro": "Tap the pieces in the order they go. Tap a placed piece to take it back.",
        "items": [
          {
            "goal": "Show the name and price of Electronics products, most expensive first.",
            "pieces": [
              "SELECT name, price",
              "FROM products",
              "WHERE category = 'Electronics'",
              "ORDER BY price DESC;"
            ],
            "explanation": "SELECT → FROM → WHERE → ORDER BY. ORDER BY always comes last."
          },
          {
            "goal": "How many orders does each status have?",
            "pieces": [
              "SELECT status, COUNT(*)",
              "FROM orders",
              "GROUP BY status;"
            ],
            "explanation": "\"Each status\" means GROUP BY status, and status also goes in SELECT."
          },
          {
            "goal": "Categories whose average price is over $20.",
            "pieces": [
              "SELECT category, AVG(price)",
              "FROM products",
              "GROUP BY category",
              "HAVING AVG(price) > 20;"
            ],
            "explanation": "A condition on an average goes in HAVING, after GROUP BY."
          },
          {
            "goal": "Each customer's first name with their order dates.",
            "pieces": [
              "SELECT c.first_name, o.order_date",
              "FROM customers c",
              "JOIN orders o",
              "ON c.customer_id = o.customer_id;"
            ],
            "explanation": "JOIN the second table, then ON says which columns match."
          },
          {
            "goal": "The different cities of Utah customers who joined in 2024.",
            "pieces": [
              "SELECT DISTINCT city",
              "FROM customers",
              "WHERE state = 'UT'",
              "AND joined_on BETWEEN '2024-01-01' AND '2024-12-31';"
            ],
            "explanation": "DISTINCT goes right after SELECT; extra conditions chain with AND."
          },
          {
            "goal": "Customers who have never placed an order.",
            "pieces": [
              "SELECT c.first_name, c.last_name",
              "FROM customers c",
              "LEFT JOIN orders o ON c.customer_id = o.customer_id",
              "WHERE o.order_id IS NULL;"
            ],
            "explanation": "LEFT JOIN keeps every customer; the ones with no match have NULL order columns."
          },
          {
            "goal": "Total quantity sold per product, only products with more than 3 sold, highest first.",
            "pieces": [
              "SELECT p.name, SUM(oi.quantity) AS total_sold",
              "FROM products p",
              "JOIN order_items oi ON p.product_id = oi.product_id",
              "GROUP BY p.name",
              "HAVING SUM(oi.quantity) > 3",
              "ORDER BY total_sold DESC;"
            ],
            "explanation": "All six clauses in their fixed order: SELECT, FROM/JOIN, GROUP BY, HAVING, ORDER BY."
          }
        ]
      },
      {
        "type": "text",
        "html": "<p><b>The operators, side by side</b></p>\n<table class=\"ref\"><thead><tr><th>Operator</th><th>Example</th><th>Watch out</th></tr></thead><tbody>\n<tr><td><code>IN</code></td><td><code>WHERE state IN ('UT','NV')</code></td><td>Same as <code>state = 'UT' OR state = 'NV'</code>. It's not a range</td></tr>\n<tr><td><code>BETWEEN</code></td><td><code>WHERE price BETWEEN 10 AND 50</code></td><td><b>Inclusive</b>: 10 and 50 both count. Smaller number first</td></tr>\n<tr><td><code>LIKE</code></td><td><code>WHERE name LIKE 'B%'</code></td><td><code>%</code> = any number of characters, <code>_</code> = exactly one character</td></tr>\n<tr><td><code>IS NULL</code></td><td><code>WHERE joined_on IS NULL</code></td><td><code>= NULL</code> never matches anything</td></tr>\n<tr><td><code>DISTINCT</code></td><td><code>SELECT DISTINCT category</code></td><td>Removes duplicate <b>result rows</b></td></tr>\n<tr><td><code>NOT</code></td><td><code>NOT IN</code>, <code>NOT BETWEEN</code>, <code>NOT LIKE</code>, <code>IS NOT NULL</code></td><td>Flips the condition</td></tr>\n<tr><td><code>WHERE</code> vs <code>HAVING</code></td><td>WHERE filters rows <b>before</b> grouping; HAVING filters groups <b>after</b></td><td>Aggregates (COUNT, SUM, AVG…) only go in HAVING, never WHERE</td></tr>\n</tbody></table>"
      },
      {
        "type": "classify",
        "title": "Which keyword do you need?",
        "categories": [
          "IN",
          "BETWEEN",
          "LIKE",
          "IS NULL",
          "DISTINCT",
          "HAVING"
        ],
        "items": [
          {
            "label": "Customers in Utah, Nevada or Arizona",
            "answer": "IN",
            "why": "A list of exact values: state IN ('UT','NV','AZ')."
          },
          {
            "label": "Products priced from $10 to $50",
            "answer": "BETWEEN",
            "why": "A range, inclusive on both ends."
          },
          {
            "label": "Last names that start with 'B'",
            "answer": "LIKE",
            "why": "A pattern: LIKE 'B%'."
          },
          {
            "label": "Customers with no join date",
            "answer": "IS NULL",
            "why": "Missing values need IS NULL."
          },
          {
            "label": "A list of the different product categories (no repeats)",
            "answer": "DISTINCT",
            "why": "SELECT DISTINCT category."
          },
          {
            "label": "Only statuses with more than 2 orders",
            "answer": "HAVING",
            "why": "A condition on COUNT(*), after GROUP BY."
          },
          {
            "label": "Product names containing the word 'book'",
            "answer": "LIKE",
            "why": "LIKE '%book%' finds it anywhere in the name."
          },
          {
            "label": "Orders placed from Sept 1 to Sept 10",
            "answer": "BETWEEN",
            "why": "A date range: BETWEEN '2024-09-01' AND '2024-09-10'."
          }
        ]
      },
      {
        "type": "fillBlank",
        "title": "Practice: finish the query",
        "items": [
          {
            "prompt": "Average price of each category: SELECT category, ___(price) FROM products ___ category;",
            "blanks": [
              {
                "answer": "AVG",
                "choices": [
                  "AVG",
                  "COUNT",
                  "DISTINCT"
                ]
              },
              {
                "answer": "GROUP BY",
                "choices": [
                  "ORDER BY",
                  "GROUP BY",
                  "HAVING"
                ]
              }
            ],
            "explanation": "AVG for average; GROUP BY to get one row per category."
          },
          {
            "prompt": "Products from $10 to $50: SELECT * FROM products WHERE price ___ 10 AND 50;",
            "blanks": [
              {
                "answer": "BETWEEN",
                "choices": [
                  "IN",
                  "BETWEEN",
                  "LIKE"
                ]
              }
            ],
            "explanation": "BETWEEN … AND … is an inclusive range."
          },
          {
            "prompt": "Customers whose last name starts with B: SELECT * FROM customers WHERE last_name ___ 'B%';",
            "blanks": [
              {
                "answer": "LIKE",
                "choices": [
                  "=",
                  "LIKE",
                  "IN"
                ]
              }
            ],
            "explanation": "Patterns with % need LIKE; = would look for the literal text 'B%'."
          },
          {
            "prompt": "Statuses with more than 2 orders: SELECT status, COUNT(*) FROM orders GROUP BY status ___ COUNT(*) > 2;",
            "blanks": [
              {
                "answer": "HAVING",
                "choices": [
                  "WHERE",
                  "HAVING",
                  "ORDER BY"
                ]
              }
            ],
            "explanation": "Conditions on an aggregate go in HAVING."
          },
          {
            "prompt": "Customers with no join date: SELECT * FROM customers WHERE joined_on ___ NULL;",
            "blanks": [
              {
                "answer": "IS",
                "choices": [
                  "=",
                  "IS",
                  "LIKE"
                ]
              }
            ],
            "explanation": "Always IS NULL, never = NULL."
          },
          {
            "prompt": "Every customer, even ones with no orders: SELECT c.first_name, o.order_id FROM customers c ___ JOIN orders o ___ c.customer_id = o.customer_id;",
            "blanks": [
              {
                "answer": "LEFT",
                "choices": [
                  "INNER",
                  "LEFT",
                  "CROSS"
                ]
              },
              {
                "answer": "ON",
                "choices": [
                  "WHERE",
                  "ON",
                  "HAVING"
                ]
              }
            ],
            "explanation": "LEFT keeps every customer; ON says how the tables match."
          },
          {
            "prompt": "The list of different states (no repeats): SELECT ___ state FROM customers;",
            "blanks": [
              {
                "answer": "DISTINCT",
                "choices": [
                  "DISTINCT",
                  "UNIQUE",
                  "GROUP"
                ]
              }
            ],
            "explanation": "DISTINCT removes duplicate rows from the result."
          }
        ]
      },
      {
        "type": "sql",
        "title": "Practice: build each query (they get harder as you go)",
        "tasks": [
          {
            "prompt": "Show every product in the Supplies or Books category. (IN)",
            "solution": "SELECT * FROM products WHERE category IN ('Supplies','Books');"
          },
          {
            "prompt": "Show the name and price of products priced from 10 to 50, inclusive. (BETWEEN)",
            "solution": "SELECT name, price FROM products WHERE price BETWEEN 10 AND 50;"
          },
          {
            "prompt": "Show the names of products that contain the word 'book' anywhere in the name. (LIKE)",
            "solution": "SELECT name FROM products WHERE name LIKE '%book%';"
          },
          {
            "prompt": "List the different product categories, with no repeats. (DISTINCT)",
            "solution": "SELECT DISTINCT category FROM products;"
          },
          {
            "prompt": "Show each state and how many customers live there. (GROUP BY)",
            "solution": "SELECT state, COUNT(*) FROM customers GROUP BY state;"
          },
          {
            "prompt": "Same as above, but only states with more than 1 customer. (HAVING)",
            "solution": "SELECT state, COUNT(*) FROM customers GROUP BY state HAVING COUNT(*) > 1;"
          },
          {
            "prompt": "Show the 3 most expensive products (name and price), most expensive first. (ORDER BY + LIMIT; on SQL Server you'd write SELECT TOP 3)",
            "solution": "SELECT name, price FROM products ORDER BY price DESC LIMIT 3;",
            "ordered": true
          },
          {
            "prompt": "Show products (name, price) that cost more than the average product price. (subquery)",
            "solution": "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);"
          },
          {
            "prompt": "Show each customer's first name and how many orders they placed. (JOIN + GROUP BY)",
            "solution": "SELECT c.first_name, COUNT(o.order_id) FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.first_name;"
          },
          {
            "prompt": "Show the first and last name of customers who have never placed an order. (LEFT JOIN + IS NULL)",
            "solution": "SELECT c.first_name, c.last_name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;"
          },
          {
            "prompt": "Show each product name and its total quantity sold, only products with more than 3 sold, highest first. (the worked example)",
            "solution": "SELECT p.name, SUM(oi.quantity) AS total_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.name HAVING SUM(oi.quantity) > 3 ORDER BY total_sold DESC;",
            "ordered": true
          },
          {
            "prompt": "Boss level: show each SHIPPED order's order_id and its revenue (quantity × price), highest revenue first. (two JOINs + WHERE + GROUP BY + ORDER BY)",
            "solution": "SELECT oi.order_id, SUM(oi.quantity * p.price) AS revenue FROM order_items oi JOIN products p ON oi.product_id = p.product_id JOIN orders o ON o.order_id = oi.order_id WHERE o.status = 'shipped' GROUP BY oi.order_id ORDER BY revenue DESC;",
            "ordered": true
          }
        ]
      },
      {
        "type": "quiz",
        "title": "Review: your quiz questions, plus a few more",
        "items": [
          {
            "question": "The LEFT JOIN returns all records from the left table, and the matched records from the right table.",
            "options": [
              "True",
              "False"
            ],
            "answerIndex": 0,
            "explanation": "Unmatched right-side columns come back as NULL."
          },
          {
            "question": "A CROSS JOIN between two tables returns only the records that have matching values in both tables.",
            "options": [
              "True",
              "False"
            ],
            "answerIndex": 1,
            "explanation": "That describes INNER JOIN. CROSS JOIN returns every combination (the Cartesian product)."
          },
          {
            "question": "The GROUP BY statement is used to aggregate data and create summary rows based on specified column values.",
            "options": [
              "True",
              "False"
            ],
            "answerIndex": 0,
            "explanation": "One summary row per distinct value of the grouped column(s)."
          },
          {
            "question": "The HAVING clause can be used in place of WHERE to filter rows before grouping.",
            "options": [
              "True",
              "False"
            ],
            "answerIndex": 1,
            "explanation": "HAVING filters groups AFTER grouping; WHERE filters rows BEFORE."
          },
          {
            "question": "The ORDER BY clause is used to sort the result set in ascending or descending order.",
            "options": [
              "True",
              "False"
            ],
            "answerIndex": 0,
            "explanation": "ASC is the default; add DESC for biggest first."
          },
          {
            "question": "What is the purpose of the INNER JOIN?",
            "options": [
              "Return all records from the left table, matched with records from the right table.",
              "Return all records from both tables, even if there is no match.",
              "Return records that have matching values in both tables.",
              "Return the Cartesian product of two tables.",
              "Return the unique records from both tables."
            ],
            "answerIndex": 2,
            "explanation": "INNER = matches only. The others describe LEFT, FULL and CROSS joins."
          },
          {
            "question": "Which SQL clause would you use to remove duplicate values from a query result?",
            "options": [
              "DISTINCT",
              "ORDER BY",
              "GROUP BY",
              "JOIN",
              "HAVING"
            ],
            "answerIndex": 0,
            "explanation": "SELECT DISTINCT removes duplicate rows."
          },
          {
            "question": "What does the COUNT(DISTINCT column) function return?",
            "options": [
              "The total number of rows in a table.",
              "The total number of distinct rows in a table.",
              "The total number of non-null rows in a column.",
              "The total number of unique values in a column.",
              "The total number of columns in a table."
            ],
            "answerIndex": 3,
            "explanation": "Each different value counts once (like 100 companies vs 262,543 rows in your lab)."
          },
          {
            "question": "Which of the following statements about the FULL OUTER JOIN is correct?",
            "options": [
              "Returns all records from the left table and matched records from the right.",
              "Returns all records from the right table and matched records from the left.",
              "Returns all records when there is a match in either table.",
              "Returns the Cartesian product of two tables."
            ],
            "answerIndex": 2,
            "explanation": "FULL keeps everything from both tables, with NULLs where there's no match."
          },
          {
            "question": "Which of the following SQL statements would you use to filter aggregated data?",
            "options": [
              "HAVING",
              "ORDER BY",
              "WHERE",
              "GROUP BY",
              "DISTINCT"
            ],
            "answerIndex": 0,
            "explanation": "Aggregates are filtered with HAVING."
          },
          {
            "question": "Which SQL operator is used to check if a value exists within a list of values?",
            "options": [
              "BETWEEN",
              "IN",
              "LIKE",
              "EXISTS",
              "HAVING"
            ],
            "answerIndex": 1,
            "explanation": "IN ('a','b','c') checks against a list."
          },
          {
            "question": "Which SQL statement would you use to return all records where the Salary is between 50,000 and 100,000?",
            "options": [
              "SELECT * FROM Employees WHERE Salary IN (50000, 100000);",
              "SELECT * FROM Employees WHERE Salary BETWEEN 50000 AND 100000;",
              "SELECT * FROM Employees WHERE Salary NOT BETWEEN 50000 AND 100000;",
              "SELECT * FROM Employees WHERE Salary = 50000 OR Salary = 100000;",
              "SELECT * FROM Employees WHERE Salary LIKE '50000-100000';"
            ],
            "answerIndex": 1,
            "explanation": "IN only matches exactly 50,000 or 100,000; BETWEEN covers the whole range."
          },
          {
            "question": "Which SQL aggregate function would you use to calculate the total sum of a numeric column?",
            "options": [
              "AVG()",
              "COUNT()",
              "SUM()",
              "MAX()",
              "MIN()"
            ],
            "answerIndex": 2,
            "explanation": "SUM adds the values."
          },
          {
            "question": "What does the LIKE operator do?",
            "options": [
              "Selects values within a range.",
              "Returns unique values.",
              "Returns rows that do not match a specified pattern.",
              "Returns rows that match a specified pattern.",
              "Checks if a value is within a list of values."
            ],
            "answerIndex": 3,
            "explanation": "LIKE uses % and _ wildcards. (NOT LIKE is the opposite.)"
          },
          {
            "question": "Which of the following clauses can be used with aggregate functions?",
            "options": [
              "DISTINCT",
              "WHERE",
              "JOIN",
              "HAVING",
              "ORDER BY"
            ],
            "answerIndex": 3,
            "explanation": "HAVING is built for conditions on aggregates."
          },
          {
            "question": "Does WHERE price BETWEEN 10 AND 50 include a product that costs exactly $50?",
            "options": [
              "Yes, BETWEEN includes both ends",
              "No, it stops at 49.99",
              "Only if you add OR price = 50",
              "Only in SQL Server"
            ],
            "answerIndex": 0,
            "explanation": "BETWEEN is inclusive."
          },
          {
            "question": "Which names match LIKE '_a%'?",
            "options": [
              "Names starting with 'a'",
              "Names whose SECOND letter is 'a'",
              "Names ending in 'a'",
              "Names containing 'a' anywhere"
            ],
            "answerIndex": 1,
            "explanation": "_ is exactly one character, then 'a', then % for anything after, so it matches names like Maya or Zachary."
          },
          {
            "question": "In SQL Server, how do you get only the top 5 rows?",
            "options": [
              "SELECT TOP 5 … ORDER BY …",
              "SELECT … LIMIT 5",
              "SELECT FIRST 5 …",
              "SELECT … WHERE ROWNUM <= 5"
            ],
            "answerIndex": 0,
            "explanation": "SQL Server uses TOP; MySQL/SQLite use LIMIT."
          },
          {
            "question": "What's wrong with: SELECT category, COUNT(*) FROM products WHERE COUNT(*) > 1 GROUP BY category;",
            "options": [
              "Nothing",
              "COUNT(*) can't go in WHERE; use HAVING COUNT(*) > 1 after GROUP BY",
              "GROUP BY must come before FROM",
              "It needs DISTINCT"
            ],
            "answerIndex": 1,
            "explanation": "Aggregates belong in HAVING."
          },
          {
            "question": "You need the order count per customer name. Which column(s) must be in GROUP BY?",
            "options": [
              "order_id",
              "The customer name column you SELECT next to COUNT",
              "Nothing",
              "Every column in the table"
            ],
            "answerIndex": 1,
            "explanation": "Any non-aggregated column in SELECT must be in GROUP BY."
          }
        ]
      },
      {
        "type": "definitions",
        "items": [
          [
            "IN",
            "Checks if a value matches any value in a list."
          ],
          [
            "BETWEEN",
            "Checks if a value falls in a range, including both ends."
          ],
          [
            "LIKE",
            "Matches a text pattern using % (any characters) and _ (one character)."
          ],
          [
            "IS NULL",
            "Finds missing values (= NULL never works)."
          ],
          [
            "DISTINCT",
            "Removes duplicate rows from the result."
          ],
          [
            "Alias",
            "A short nickname for a table or column (FROM customers c, SUM(x) AS total)."
          ],
          [
            "TOP / LIMIT",
            "Return only the first N rows: SELECT TOP n in SQL Server, LIMIT n in SQLite/MySQL."
          ]
        ]
      },
      {
        "type": "practice",
        "prompts": [
          "Pick any question from this lesson and explain, step by step with the 5-question recipe, how you'd build the query.",
          "Explain the difference between IN and BETWEEN with an example of when you'd use each."
        ]
      }
    ]
  },
  {
    "id": "exam-sim",
    "title": "6. Exam simulator (write it like the real test)",
    "blocks": [
      {
        "type": "objectives",
        "text": "Practice exactly like the real exam: read a question, write a full SQL Server query on the course tables, and format it cleanly. Every question here checks both your result and your formatting, because one point per exam question is for formatting and indentation. The 13 questions total 100 points, like the exam."
      },
      {
        "type": "text",
        "html": "<p><b>📐 The formatting the exam expects</b> (1 point per question)</p>\n<pre class=\"ord-answer\">SELECT ci.CompanyName,\n       COUNT(*) AS NumDays\nFROM CompanyInformation AS ci\n    INNER JOIN StockData AS sd\n        ON ci.TickerSymbol = sd.TickerSymbol\nWHERE ci.Industry = 'Tech'\nGROUP BY ci.CompanyName\nHAVING COUNT(*) &gt; 3\nORDER BY NumDays DESC;</pre>\n<ul class=\"points\">\n<li><b>Each clause on its own line:</b> SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY.</li>\n<li><b>Keywords in CAPS</b>, table and column names as they appear in the database.</li>\n<li><b>Indent</b> JOIN/ON lines, AND/OR lines, extra SELECT columns, and everything inside a subquery or CTE.</li>\n<li><b>Use aliases</b> (AS sd, AS ci) and prefix shared columns (sd.TickerSymbol).</li>\n<li>Press <b>Tab</b> in the practice box to indent, just like SSMS.</li>\n</ul>\n<p><b>🎯 Getting partial credit</b></p>\n<ul class=\"points\">\n<li>Never leave a question blank. Write the SELECT and FROM even if you're stuck; those parts earn points.</li>\n<li>Build it <b>one clause at a time</b> and run it after each step in SSMS (the 5-question recipe from Lesson 5).</li>\n<li>Check your row count. If it looks way too big, you probably forgot a JOIN condition or a WHERE.</li>\n<li>Name calculated columns with AS when the question gives a name (NumDays, TotalVolume…).</li>\n</ul>\n<p><b>SQL Server reminders</b> (these all work in this practice too)</p>\n<table class=\"ref\"><thead><tr><th>Need</th><th>SQL Server</th></tr></thead><tbody>\n<tr><td>Top N rows</td><td><code>SELECT TOP 5 … ORDER BY … DESC</code></td></tr>\n<tr><td>Year / month of a date</td><td><code>YEAR(TradeDate)</code>, <code>MONTH(TradeDate)</code></td></tr>\n<tr><td>Today / age</td><td><code>GETDATE()</code>, <code>DATEDIFF(yyyy, @DateofBirth, GETDATE())</code></td></tr>\n<tr><td>Names with spaces or reserved words</td><td><code>[Year]</code>, <code>[1st Qtr]</code>, <code>[State]</code></td></tr>\n<tr><td>Text</td><td>Single quotes only: <code>'Tech'</code></td></tr>\n<tr><td>Recursive CTE</td><td>Just <code>WITH</code> (no RECURSIVE keyword in SQL Server)</td></tr>\n</tbody></table>\n<p class=\"muted\">The practice tables are mini versions of the course database (8 companies, a few days), so your numbers will be smaller than in SSMS. The query you write is the same.</p>"
      },
      {
        "type": "schema"
      },
      {
        "type": "sql",
        "title": "Exam simulator: 13 questions, 100 points",
        "tasks": [
          {
            "prompt": "(5 pts) Show the TickerSymbol, CompanyName and Industry of every company in the Tech industry, sorted by CompanyName.",
            "solution": "SELECT TickerSymbol,\n       CompanyName,\n       Industry\nFROM CompanyInformation\nWHERE Industry = 'Tech'\nORDER BY CompanyName;",
            "format": true,
            "ordered": true
          },
          {
            "prompt": "(5 pts) For each TickerSymbol in StockData, show how many trading days it has. Name the count NumDays.",
            "solution": "SELECT TickerSymbol,\n       COUNT(*) AS NumDays\nFROM StockData\nGROUP BY TickerSymbol;",
            "format": true
          },
          {
            "prompt": "(8 pts) For each Industry, show how many companies it has (NumCompanies), but only industries with at least 2 companies.",
            "solution": "SELECT Industry,\n       COUNT(TickerSymbol) AS NumCompanies\nFROM CompanyInformation\nGROUP BY Industry\nHAVING COUNT(TickerSymbol) >= 2;",
            "format": true
          },
          {
            "prompt": "(8 pts) Show each TickerSymbol and its average closing price in 2024 only (use YEAR(TradeDate) = 2024). Keep only tickers averaging over 100, highest average first.",
            "solution": "SELECT TickerSymbol,\n       AVG(ST_Close) AS AvgClose\nFROM StockData\nWHERE YEAR(TradeDate) = 2024\nGROUP BY TickerSymbol\nHAVING AVG(ST_Close) > 100\nORDER BY AvgClose DESC;",
            "format": true,
            "ordered": true
          },
          {
            "prompt": "(8 pts) Using an INNER JOIN, show CompanyName, City, TradeDate and ST_Close for Ford (ticker 'F'), oldest trade first.",
            "solution": "SELECT ci.CompanyName,\n       ci.City,\n       sd.TradeDate,\n       sd.ST_Close\nFROM StockData AS sd\n    INNER JOIN CompanyInformation AS ci\n        ON sd.TickerSymbol = ci.TickerSymbol\nWHERE sd.TickerSymbol = 'F'\nORDER BY sd.TradeDate;",
            "format": true,
            "ordered": true
          },
          {
            "prompt": "(8 pts) Show the TickerSymbol and CompanyName of any company that has NO rows in StockData.",
            "solution": "SELECT ci.TickerSymbol,\n       ci.CompanyName\nFROM CompanyInformation AS ci\n    LEFT JOIN StockData AS sd\n        ON ci.TickerSymbol = sd.TickerSymbol\nWHERE sd.TickerSymbol IS NULL;",
            "format": true
          },
          {
            "prompt": "(8 pts) Using a subquery, show TickerSymbol, TradeDate and ST_Close for every row that closed above the overall average closing price.",
            "solution": "SELECT TickerSymbol,\n       TradeDate,\n       ST_Close\nFROM StockData\nWHERE ST_Close >\n    (SELECT AVG(ST_Close)\n     FROM StockData);",
            "format": true
          },
          {
            "prompt": "(8 pts) Using a subquery with IN, show TickerSymbol, TradeDate and ST_Close for companies in the Automotive industry.",
            "solution": "SELECT TickerSymbol,\n       TradeDate,\n       ST_Close\nFROM StockData\nWHERE TickerSymbol IN\n    (SELECT TickerSymbol\n     FROM CompanyInformation\n     WHERE Industry = 'Automotive');",
            "format": true
          },
          {
            "prompt": "(8 pts) Show the TOP 5 highest closing prices with their TickerSymbol and TradeDate, highest first. (Write it the SQL Server way with SELECT TOP 5.)",
            "solution": "SELECT TOP 5 TickerSymbol,\n       TradeDate,\n       ST_Close\nFROM StockData\nORDER BY ST_Close DESC;",
            "format": true,
            "ordered": true
          },
          {
            "prompt": "(10 pts) Using a CTE named DailyVolume, total the Volume for each TradeDate, then show only days with total volume over 340,000,000, highest first.",
            "solution": "WITH DailyVolume AS (\n    SELECT TradeDate,\n           SUM(Volume) AS TotalVolume\n    FROM StockData\n    GROUP BY TradeDate\n)\nSELECT TradeDate,\n       TotalVolume\nFROM DailyVolume\nWHERE TotalVolume > 340000000\nORDER BY TotalVolume DESC;",
            "format": true,
            "ordered": true
          },
          {
            "prompt": "(10 pts) Build the JimmyPage crosstab: one row per Year with [1st Qtr] through [4th Qtr] columns (use SUM(CASE …)) and a Total column.",
            "solution": "SELECT [Year],\n    SUM(CASE WHEN Quarter = 1 THEN Amount ELSE 0 END) AS [1st Qtr],\n    SUM(CASE WHEN Quarter = 2 THEN Amount ELSE 0 END) AS [2nd Qtr],\n    SUM(CASE WHEN Quarter = 3 THEN Amount ELSE 0 END) AS [3rd Qtr],\n    SUM(CASE WHEN Quarter = 4 THEN Amount ELSE 0 END) AS [4th Qtr],\n    SUM(Amount) AS Total\nFROM JimmyPage\nGROUP BY [Year];",
            "format": true
          },
          {
            "prompt": "(8 pts) Join StockData to Calendar (TradeDate = ActualDate) and show TickerSymbol, ST_Close and DayOfWeek for trades that happened on a Friday.",
            "solution": "SELECT sd.TickerSymbol,\n       sd.ST_Close,\n       c.DayOfWeek\nFROM StockData AS sd\n    INNER JOIN Calendar AS c\n        ON sd.TradeDate = c.ActualDate\nWHERE c.DayOfWeek = 'Friday';",
            "format": true
          },
          {
            "prompt": "(6 pts) Show each CompanyName with its number of trading days (NumDays), using a JOIN and GROUP BY, sorted by CompanyName.",
            "solution": "SELECT ci.CompanyName,\n       COUNT(*) AS NumDays\nFROM CompanyInformation AS ci\n    INNER JOIN StockData AS sd\n        ON ci.TickerSymbol = sd.TickerSymbol\nGROUP BY ci.CompanyName\nORDER BY ci.CompanyName;",
            "format": true,
            "ordered": true
          }
        ]
      },
      {
        "type": "text",
        "html": "<p><b>✅ Before exam day</b> (from your instructor's note)</p>\n<ul class=\"points\">\n<li>On the computer you'll use: log into <b>Canvas</b>, open <b>SSMS</b>, <b>connect to the course database</b> and run a quick <code>SELECT TOP 5 * FROM StockData;</code></li>\n<li>Run Honorlock's system check, and make sure your webcam, microphone and the browser extension work.</li>\n<li>Charge the laptop, close other apps, and have a quiet room with a clear desk.</li>\n</ul>"
      }
    ]
  },
];
