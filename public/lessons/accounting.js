// Built-in starter lessons. Lessons generated from your Canvas readings use the same block types.
export default [
  {
    id: "equation",
    title: "1. The accounting equation",
    blocks: [
      {
        type: "objectives",
        text: "By the end of this lesson you should be able to state the accounting equation, explain why it always balances, and sort any account into asset, liability, equity, revenue, expense, or dividends. Every other topic in the course (debits, credits, journal entries, financial statements) builds on this.",
      },
      {
        type: "text",
        html: `<p class="equation">Assets = Liabilities + Equity</p>
<p><b>Assets</b> are what the business owns or controls that will bring future benefit. <b>Liabilities</b> are what it owes to outsiders. <b>Equity</b> is what's left for the owners. Every transaction changes at least two things, so the two sides always stay equal.</p>
<p>Equity grows and shrinks through four things:</p>
<p class="equation">Equity = Common Stock + Revenues − Expenses − Dividends</p>`,
      },
      {
        type: "classify",
        title: "Try it: what type of account is each one?",
        categories: ["Asset", "Liability", "Equity", "Revenue", "Expense", "Dividends"],
        items: [
          { label: "Cash", answer: "Asset", why: "Money the business owns." },
          { label: "Accounts Receivable", answer: "Asset", why: "Customers owe you. That's a future cash inflow you control." },
          { label: "Supplies", answer: "Asset", why: "Bought but not used up yet, so it still has future benefit." },
          { label: "Prepaid Insurance", answer: "Asset", why: "You paid ahead, so you own future coverage." },
          { label: "Equipment", answer: "Asset", why: "Long-term resource the business owns." },
          { label: "Accounts Payable", answer: "Liability", why: "You owe suppliers. 'Payable' = you pay later." },
          { label: "Unearned Revenue", answer: "Liability", why: "Customer paid before you did the work, so you owe them the service. Not revenue yet!" },
          { label: "Notes Payable", answer: "Liability", why: "A formal loan you have to repay." },
          { label: "Common Stock", answer: "Equity", why: "What owners invested in exchange for shares." },
          { label: "Retained Earnings", answer: "Equity", why: "Profits kept in the business over time." },
          { label: "Service Revenue", answer: "Revenue", why: "Earned by doing work for customers; increases equity." },
          { label: "Rent Expense", answer: "Expense", why: "Cost used up to run the business; decreases equity." },
          { label: "Dividends", answer: "Dividends", why: "Profits paid out to owners; decreases equity but is NOT an expense." },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Asset", "A resource the company owns or controls that is expected to provide future benefit (Cash, Receivables, Supplies, Equipment)."],
          ["Liability", "An obligation to pay or provide something to someone outside the company (Payables, Unearned Revenue, Loans)."],
          ["Equity", "The owners' claim on assets: Assets − Liabilities."],
          ["Revenue", "Increase in equity from delivering goods or services to customers."],
          ["Expense", "Decrease in equity from costs used up to earn revenue."],
          ["Dividends", "Distributions of earnings to owners. Reduces equity; not an expense."],
          ["Retained Earnings", "Cumulative net income minus cumulative dividends."],
        ],
      },
      {
        type: "quiz",
        items: [
          {
            question: "A company has $50,000 of assets and $18,000 of liabilities. What is equity?",
            options: ["$68,000", "$32,000", "$18,000", "$50,000"],
            answerIndex: 1,
            explanation: "Equity = Assets − Liabilities = 50,000 − 18,000 = $32,000.",
          },
          {
            question: "A customer pays you $500 today for work you'll do next month. What goes up?",
            options: ["Cash and Service Revenue", "Cash and Unearned Revenue", "Accounts Receivable and Revenue", "Cash and Common Stock"],
            answerIndex: 1,
            explanation: "You haven't earned it yet, so it's a liability (Unearned Revenue), not revenue.",
          },
          {
            question: "Paying dividends to shareholders…",
            options: ["Increases expenses", "Decreases assets and equity", "Decreases liabilities", "Has no effect on equity"],
            answerIndex: 1,
            explanation: "Cash (asset) goes down and equity goes down. Dividends are not expenses, so they don't touch net income.",
          },
        ],
      },
    ],
  },
  {
    id: "debits-credits",
    title: "2. Debits and credits",
    blocks: [
      {
        type: "objectives",
        text: "Your goal is to know, without looking it up, whether a debit or a credit increases each type of account. Debit just means LEFT side and credit means RIGHT side. They are not 'good' or 'bad'. Once you know the normal balance of each account type, journal entries become a matching game.",
      },
      {
        type: "text",
        html: `<p>Memory trick: <b>DEALER</b>. <b>D</b>ividends, <b>E</b>xpenses, <b>A</b>ssets increase with a <b>debit</b>. <b>L</b>iabilities, <b>E</b>quity, <b>R</b>evenue increase with a <b>credit</b>.</p>
<table class="ref">
<thead><tr><th>Account type</th><th>Increase</th><th>Decrease</th><th>Normal balance</th></tr></thead>
<tbody>
<tr><td>Assets</td><td>Debit</td><td>Credit</td><td>Debit</td></tr>
<tr><td>Expenses</td><td>Debit</td><td>Credit</td><td>Debit</td></tr>
<tr><td>Dividends</td><td>Debit</td><td>Credit</td><td>Debit</td></tr>
<tr><td>Liabilities</td><td>Credit</td><td>Debit</td><td>Credit</td></tr>
<tr><td>Equity (Common Stock, Retained Earnings)</td><td>Credit</td><td>Debit</td><td>Credit</td></tr>
<tr><td>Revenues</td><td>Credit</td><td>Debit</td><td>Credit</td></tr>
</tbody></table>
<p>Every entry has <b>total debits = total credits</b>. That's what keeps A = L + E balanced.</p>`,
      },
      {
        type: "classify",
        title: "Try it: debit or credit?",
        categories: ["Debit", "Credit"],
        items: [
          { label: "Increase Cash", answer: "Debit", why: "Asset increases with a debit." },
          { label: "Decrease Cash", answer: "Credit", why: "Assets decrease with a credit." },
          { label: "Increase Accounts Payable", answer: "Credit", why: "Liabilities increase with a credit." },
          { label: "Decrease Accounts Payable (you paid a bill)", answer: "Debit", why: "Liabilities decrease with a debit." },
          { label: "Increase Service Revenue", answer: "Credit", why: "Revenue increases with a credit." },
          { label: "Increase Rent Expense", answer: "Debit", why: "Expenses increase with a debit." },
          { label: "Decrease Accounts Receivable (customer paid)", answer: "Credit", why: "AR is an asset; assets decrease with a credit." },
          { label: "Increase Common Stock", answer: "Credit", why: "Equity increases with a credit." },
          { label: "Increase Dividends", answer: "Debit", why: "Dividends increase with a debit (the D in DEALER)." },
          { label: "Increase Unearned Revenue", answer: "Credit", why: "Unearned Revenue is a liability." },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Debit (Dr)", "An entry on the LEFT side of an account."],
          ["Credit (Cr)", "An entry on the RIGHT side of an account."],
          ["Normal balance", "The side (debit or credit) that increases an account; where its balance usually sits."],
          ["T-account", "A simple picture of one account: debits on the left, credits on the right."],
          ["Double-entry", "Every transaction affects at least two accounts, with equal debits and credits."],
        ],
      },
    ],
  },
  {
    id: "journal-entries",
    title: "3. Journal entries",
    blocks: [
      {
        type: "objectives",
        text: "Here you'll read a business transaction and record it: which accounts change, which is debited, which is credited, and for how much. Use the 3-step method: (1) name the accounts, (2) decide if each goes up or down, (3) apply DEALER to pick debit or credit. Check that debits equal credits.",
      },
      {
        type: "debitCredit",
        title: "Try it: mark each account as a debit or credit",
        rows: [
          {
            transaction: "Owners invest $20,000 cash in the business in exchange for common stock.",
            entries: [
              { account: "Cash", side: "debit", amount: 20000, why: "Cash (asset) increases → debit." },
              { account: "Common Stock", side: "credit", amount: 20000, why: "Common Stock (equity) increases → credit." },
            ],
          },
          {
            transaction: "Buy $5,000 of equipment on account.",
            entries: [
              { account: "Equipment", side: "debit", amount: 5000, why: "Equipment (asset) increases → debit." },
              { account: "Accounts Payable", side: "credit", amount: 5000, why: "'On account' means you owe it. Liability increases → credit." },
            ],
          },
          {
            transaction: "Perform services for customers and receive $3,000 cash.",
            entries: [
              { account: "Cash", side: "debit", amount: 3000, why: "Cash increases → debit." },
              { account: "Service Revenue", side: "credit", amount: 3000, why: "Revenue earned → credit." },
            ],
          },
          {
            transaction: "Perform $1,200 of services on account (customer will pay later).",
            entries: [
              { account: "Accounts Receivable", side: "debit", amount: 1200, why: "Customer owes you. Asset increases → debit." },
              { account: "Service Revenue", side: "credit", amount: 1200, why: "Revenue is earned when the work is done, even without cash → credit." },
            ],
          },
          {
            transaction: "Pay $900 cash for this month's rent.",
            entries: [
              { account: "Rent Expense", side: "debit", amount: 900, why: "Expense increases → debit." },
              { account: "Cash", side: "credit", amount: 900, why: "Cash decreases → credit." },
            ],
          },
          {
            transaction: "Collect $700 from customers who owed you.",
            entries: [
              { account: "Cash", side: "debit", amount: 700, why: "Cash increases → debit." },
              { account: "Accounts Receivable", side: "credit", amount: 700, why: "They owe you less. Asset decreases → credit. (No new revenue; you recorded it earlier.)" },
            ],
          },
          {
            transaction: "Pay $2,000 of what you owe suppliers.",
            entries: [
              { account: "Accounts Payable", side: "debit", amount: 2000, why: "You owe less. Liability decreases → debit." },
              { account: "Cash", side: "credit", amount: 2000, why: "Cash decreases → credit." },
            ],
          },
          {
            transaction: "Receive $1,500 cash in advance for services you'll do next month.",
            entries: [
              { account: "Cash", side: "debit", amount: 1500, why: "Cash increases → debit." },
              { account: "Unearned Revenue", side: "credit", amount: 1500, why: "Not earned yet, so it's a liability → credit." },
            ],
          },
          {
            transaction: "Pay a $500 cash dividend to shareholders.",
            entries: [
              { account: "Dividends", side: "debit", amount: 500, why: "Dividends increase → debit." },
              { account: "Cash", side: "credit", amount: 500, why: "Cash decreases → credit." },
            ],
          },
        ],
      },
      {
        type: "quiz",
        items: [
          {
            question: "You buy $600 of supplies and pay cash. Which entry is right?",
            options: ["Dr Supplies Expense, Cr Accounts Payable", "Dr Supplies, Cr Cash", "Dr Cash, Cr Supplies", "Dr Supplies, Cr Service Revenue"],
            answerIndex: 1,
            explanation: "One asset (Supplies) goes up, another (Cash) goes down.",
          },
          {
            question: "Which transaction does NOT affect revenue?",
            options: ["Services performed on account", "Services performed for cash", "Collecting cash from a customer's earlier bill", "Services performed that were paid in advance"],
            answerIndex: 2,
            explanation: "Collecting a receivable just swaps one asset (AR) for another (Cash). The revenue was recorded when the work was done.",
          },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Journal entry", "A dated record of a transaction listing the accounts debited and credited and the amounts."],
          ["On account", "On credit: payment happens later (creates a receivable or payable)."],
          ["General ledger", "The collection of all accounts and their balances; journal entries are posted here."],
          ["Trial balance", "A list of every account balance to check that total debits equal total credits."],
        ],
      },
      {
        type: "practice",
        prompts: ["In your own words, explain why collecting cash from a customer who already owed you is not revenue."],
      },
    ],
  },
  {
    id: "statements",
    title: "4. Build the financial statements",
    blocks: [
      {
        type: "objectives",
        text: "Here you'll take a company's account balances (its trial balance) and build the three statements yourself, in order: the income statement (did it make money?), the statement of retained earnings (how much profit it kept), and the balance sheet (what it owns and owes). Each statement feeds the next: net income flows into retained earnings, and ending retained earnings flows into the balance sheet, which must balance.",
      },
      {
        type: "text",
        html: `<table class="ref">
<thead><tr><th>Statement</th><th>What goes on it</th><th>Bottom line</th></tr></thead>
<tbody>
<tr><td>1. Income statement</td><td>Revenues and expenses</td><td>Net income = Revenues − Expenses</td></tr>
<tr><td>2. Retained earnings</td><td>Beginning RE, net income, dividends</td><td>Ending RE = Beginning RE + Net income − Dividends</td></tr>
<tr><td>3. Balance sheet</td><td>Assets, liabilities, common stock, ending RE</td><td>Total assets = Total liabilities + Total equity</td></tr>
</tbody></table>
<p>Dividends are <b>not</b> an expense, so they skip the income statement and reduce retained earnings instead.</p>`,
      },
      {
        type: "statements",
        company: "Red Rock Bike Rentals",
        period: "year ended December 31",
        accounts: [
          { name: "Cash", balance: 26200, type: "asset", current: true },
          { name: "Accounts Receivable", balance: 3200, type: "asset", current: true },
          { name: "Supplies", balance: 1100, type: "asset", current: true },
          { name: "Prepaid Insurance", balance: 2400, type: "asset", current: true },
          { name: "Equipment", balance: 42000, type: "asset", current: false },
          { name: "Accounts Payable", balance: 4300, type: "liability", current: true },
          { name: "Unearned Revenue", balance: 1800, type: "liability", current: true },
          { name: "Notes Payable (due in 5 years)", balance: 20000, type: "liability", current: false },
          { name: "Common Stock", balance: 25000, type: "equity" },
          { name: "Retained Earnings (beginning of year)", balance: 9000, type: "re" },
          { name: "Dividends", balance: 3000, type: "dividends" },
          { name: "Rental Revenue", balance: 61500, type: "revenue" },
          { name: "Service Revenue", balance: 4200, type: "revenue" },
          { name: "Wages Expense", balance: 28700, type: "expense" },
          { name: "Rent Expense", balance: 12000, type: "expense" },
          { name: "Utilities Expense", balance: 3100, type: "expense" },
          { name: "Insurance Expense", balance: 2400, type: "expense" },
          { name: "Supplies Expense", balance: 1700, type: "expense" },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Trial balance", "A list of every account and its balance; total debits should equal total credits."],
          ["Income statement", "Shows revenues and expenses for a period of time and the resulting net income or loss."],
          ["Statement of retained earnings", "Shows how retained earnings changed: beginning balance + net income − dividends."],
          ["Balance sheet", "Shows assets, liabilities, and equity at one point in time. Must balance."],
          ["Current asset / liability", "Expected to be used up, collected, or paid within one year."],
          ["Long-term (noncurrent)", "Lasts or is due more than a year out, like equipment or a 5-year note."],
        ],
      },
    ],
  },
  {
    id: "build-entries",
    title: "5. Build journal entries yourself",
    blocks: [
      {
        type: "objectives",
        text: "Now nothing is filled in for you. For each transaction, pick the accounts from the dropdown, then type each amount in the Debit or Credit column. You decide which accounts change, which side each goes on, and how much, the same way you'll do it on homework and exams. Some transactions need three lines.",
      },
      {
        type: "text",
        html: `<p><b>Your 4-step routine for every transaction:</b></p>
<ol><li>What accounts changed? (Look for cash in or out, something bought, something owed, something earned.)</li>
<li>Did each one go up or down?</li>
<li>Use DEALER: Dividends, Expenses, Assets go up with a <b>debit</b>; Liabilities, Equity, Revenue go up with a <b>credit</b>.</li>
<li>Check that total debits = total credits.</li></ol>
<p class="muted">Convention is to list debits first, but the order of your lines doesn't matter here. What matters is the right account, the right side, and the right amount.</p>`,
      },
      {
        type: "journalBuilder",
        title: "Build each entry",
        accounts: ["Cash", "Accounts Receivable", "Supplies", "Prepaid Insurance", "Equipment", "Accounts Payable", "Notes Payable", "Unearned Revenue", "Wages Payable", "Common Stock", "Dividends", "Service Revenue", "Rent Expense", "Wages Expense", "Utilities Expense", "Supplies Expense", "Insurance Expense"],
        rows: [
          { transaction: "The owners invest $15,000 cash in the business in exchange for common stock.", entries: [{ account: "Cash", side: "debit", amount: 15000 }, { account: "Common Stock", side: "credit", amount: 15000 }] },
          { transaction: "Pay $1,200 cash for a 12-month insurance policy that starts next month.", entries: [{ account: "Prepaid Insurance", side: "debit", amount: 1200 }, { account: "Cash", side: "credit", amount: 1200 }] },
          { transaction: "Buy $8,000 of equipment, paying $2,000 cash and signing a note for the rest.", entries: [{ account: "Equipment", side: "debit", amount: 8000 }, { account: "Cash", side: "credit", amount: 2000 }, { account: "Notes Payable", side: "credit", amount: 6000 }] },
          { transaction: "Perform $2,400 of services for a customer, who will pay next month.", entries: [{ account: "Accounts Receivable", side: "debit", amount: 2400 }, { account: "Service Revenue", side: "credit", amount: 2400 }] },
          { transaction: "Receive the $300 utility bill for this month. You'll pay it later.", entries: [{ account: "Utilities Expense", side: "debit", amount: 300 }, { account: "Accounts Payable", side: "credit", amount: 300 }] },
          { transaction: "A customer pays $900 in advance for work you'll do in two months.", entries: [{ account: "Cash", side: "debit", amount: 900 }, { account: "Unearned Revenue", side: "credit", amount: 900 }] },
          { transaction: "Collect $1,000 from the customer who owes you from earlier.", entries: [{ account: "Cash", side: "debit", amount: 1000 }, { account: "Accounts Receivable", side: "credit", amount: 1000 }] },
          { transaction: "Pay employees $1,500 in wages for work they did this month.", entries: [{ account: "Wages Expense", side: "debit", amount: 1500 }, { account: "Cash", side: "credit", amount: 1500 }] },
          { transaction: "Pay a $400 cash dividend to the owners.", entries: [{ account: "Dividends", side: "debit", amount: 400 }, { account: "Cash", side: "credit", amount: 400 }] },
          { transaction: "Do $1,800 of services: the customer pays $500 now and owes the rest.", entries: [{ account: "Cash", side: "debit", amount: 500 }, { account: "Accounts Receivable", side: "debit", amount: 1300 }, { account: "Service Revenue", side: "credit", amount: 1800 }] },
        ],
      },
      {
        type: "definitions",
        items: [
          ["Compound entry", "A journal entry with more than two accounts, like buying equipment with part cash and part loan."],
          ["Prepaid expense", "Paying before you use something (insurance, rent). It's an asset until it's used up."],
          ["Unearned revenue", "Cash received before doing the work. It's a liability until you earn it."],
          ["On account", "On credit: creates Accounts Receivable (they owe you) or Accounts Payable (you owe them)."],
        ],
      },
    ],
  },
  {
    id: "merch-inventory",
    title: "6. Merchandising & inventory (Ch 4 & 5)",
    blocks: [
      {
        type: "objectives",
        text: "By the end of this lesson you should be able to explain how a merchandiser earns gross profit, read credit terms like 2/10, n/60 and figure the amount to pay, compute net sales, decide which costs belong in inventory, tell who owns goods in transit (FOB shipping point vs. FOB destination), compare FIFO, LIFO, weighted average and specific identification, and record a lower of cost or market (LCM) write-down.",
      },
      {
        type: "text",
        html: `<p>A <b>merchandiser</b> buys goods and resells them. Its income statement adds one big step a service company doesn't have: it subtracts what the goods cost before subtracting its other expenses.</p>
<table class="ref"><thead><tr><th>Income statement line</th><th>How you get it</th></tr></thead><tbody>
<tr><td>Net sales</td><td>Sales − Sales discounts − Sales returns and allowances</td></tr>
<tr><td>− Cost of goods sold (COGS)</td><td>What the sold goods cost the company</td></tr>
<tr><td>= <b>Gross profit</b></td><td>Net sales − COGS</td></tr>
<tr><td>− Operating expenses</td><td>Salaries, rent, advertising, utilities…</td></tr>
<tr><td>= <b>Net income</b></td><td>Gross profit − Expenses</td></tr>
</tbody></table>`,
      },
      {
        type: "definitions",
        items: [
          ["Merchandise inventory", "Goods a company owns and expects to sell to its customers. It's an asset until sold, then it becomes cost of goods sold."],
          ["Cost of goods sold (COGS)", "The cost of the merchandise that was sold during the period. An expense."],
          ["Gross profit", "Net sales minus cost of goods sold."],
          ["Credit period", "How long a buyer can wait before the full payment is due."],
          ["Discount period", "The window in which a cash discount for paying early is available."],
          ["Sales discount", "The seller's name for a cash discount it gives buyers who pay early. It reduces net sales."],
          ["Purchases discount", "The buyer's name for a cash discount it gets from a supplier for paying early. It reduces the cost of inventory."],
          ["FOB shipping point", "Ownership passes to the buyer when the seller hands the goods to the carrier. The buyer pays the freight."],
          ["FOB destination", "Ownership passes to the buyer when the goods arrive at the buyer's place of business. The seller pays the freight."],
          ["Lower of cost or market (LCM)", "If inventory's market value drops below its recorded cost, write it down to the lower amount."],
        ],
      },
      {
        type: "text",
        html: `<p><b>Reading credit terms.</b> <span class="mono">2/10, n/60</span> means: take a <b>2% discount</b> if you pay within <b>10 days</b>; otherwise the full (<b>n</b>et) amount is due in <b>60 days</b>.</p>
<p>Amount to pay in the discount period = Invoice × (1 − discount %). Example: $5,000 × (1 − 0.02) = <b>$4,900</b>.</p>
<p class="muted">If some goods were returned first, take the discount on what's left: ($8,400 − $400 returned) × 0.98.</p>`,
      },
      {
        type: "calc",
        title: "Practice: how much do you pay?",
        intro: "Each invoice is paid within the discount period unless it says otherwise. Type the dollar amount.",
        items: [
          { q: "Invoice $5,000, terms 2/10, n/60.", answer: 4900, hint: "Take 2% off: $5,000 × 0.98.", why: "$5,000 × (1 − 0.02) = $4,900." },
          { q: "Invoice $20,000, terms 1/15, n/90.", answer: 19800, hint: "1% off.", why: "$20,000 × 0.99 = $19,800." },
          { q: "Invoice $75,000, terms 1/10, n/30.", answer: 74250, hint: "1% of $75,000 is $750.", why: "$75,000 − $750 = $74,250." },
          { q: "Invoice $10,000, terms 3/15, n/45.", answer: 9700, hint: "3% off.", why: "$10,000 × 0.97 = $9,700." },
          { q: "Invoice $8,400, terms 2/10, n/30. You return $400 of damaged goods, then pay within 10 days.", answer: 7840, hint: "Subtract the return first, then take 2% off what's left.", why: "($8,400 − $400) × 0.98 = $8,000 × 0.98 = $7,840." },
          { q: "Invoice $6,000, terms 2/10, n/30, but you pay on day 25.", answer: 6000, hint: "Is day 25 inside the discount period?", why: "The 10-day discount window has passed, so you owe the full $6,000." },
        ],
      },
      {
        type: "classify",
        title: "Who owns the goods while they're on the truck?",
        categories: ["Buyer", "Seller"],
        items: [
          { label: "Goods in transit, shipped FOB shipping point", answer: "Buyer", why: "Ownership passed when the seller handed them to the carrier." },
          { label: "Goods in transit, shipped FOB destination", answer: "Seller", why: "The buyer doesn't own them until they arrive." },
          { label: "Who pays the freight under FOB shipping point?", answer: "Buyer", why: "The buyer owns the goods during shipping, so the buyer pays to ship them (it's added to inventory cost)." },
          { label: "Who pays the freight under FOB destination?", answer: "Seller", why: "The seller still owns the goods on the way, so shipping is the seller's delivery expense." },
        ],
      },
      {
        type: "text",
        html: `<p><b>Net sales</b> = Gross sales − Sales discounts − Sales returns and allowances.</p>
<p class="muted">Watch for distractors: salaries, rent and advertising are operating expenses. They never go in net sales.</p>`,
      },
      {
        type: "calc",
        title: "Practice: net sales",
        items: [
          { q: "Sales $200,000; sales discounts $4,000; sales returns and allowances $16,000; sales salaries $10,000. What are net sales?", answer: 180000, hint: "Only discounts and returns come off sales. Salaries don't.", why: "$200,000 − $4,000 − $16,000 = $180,000. Salaries are an operating expense." },
          { q: "Sales $350,000; sales discounts $7,000; sales returns and allowances $12,500; advertising $9,000. What are net sales?", answer: 330500, hint: "Advertising is an expense, not a sales reduction.", why: "$350,000 − $7,000 − $12,500 = $330,500." },
          { q: "Net sales $180,000 and cost of goods sold $108,000. What is gross profit?", answer: 72000, hint: "Gross profit = Net sales − COGS.", why: "$180,000 − $108,000 = $72,000." },
        ],
      },
      {
        type: "classify",
        title: "Inventory cost or expense?",
        categories: ["Inventory cost", "Expense"],
        items: [
          { label: "The used car bought for resale ($14,000)", answer: "Inventory cost", why: "It's the merchandise itself." },
          { label: "Transportation-in ($250), bought FOB shipping point", answer: "Inventory cost", why: "The buyer pays freight under FOB shipping point, and it's a cost to get the goods ready to sell." },
          { label: "Import duties ($900)", answer: "Inventory cost", why: "A necessary cost of getting the goods in place." },
          { label: "Insurance while the car was shipped ($300)", answer: "Inventory cost", why: "Part of getting the goods to you." },
          { label: "Advertising ($150)", answer: "Expense", why: "Selling costs are expensed, not added to inventory." },
          { label: "Sales staff salaries ($1,250)", answer: "Expense", why: "A selling expense." },
          { label: "Trimming the shrubs out front ($180)", answer: "Expense", why: "A general operating cost, not part of the car's cost." },
        ],
      },
      {
        type: "calc",
        title: "Practice: total it up",
        items: [
          { q: "Using the items above, what is the total cost recorded in inventory for the car?", answer: 15450, hint: "Add the car, transportation-in, import duties and shipping insurance.", why: "$14,000 + $250 + $900 + $300 = $15,450." },
          { q: "And the total that gets expensed?", answer: 1580, hint: "Add advertising, sales salaries and shrub trimming.", why: "$150 + $1,250 + $180 = $1,580." },
        ],
      },
      {
        type: "text",
        html: `<p><b>Inventory costing methods</b> decide which costs move to COGS when you sell.</p>
<table class="ref"><thead><tr><th>Method</th><th>How it works</th><th>When costs are rising…</th></tr></thead><tbody>
<tr><td>Specific identification (SI)</td><td>Tracks the actual cost of each item sold</td><td>Precisely matches each item's cost to its revenue</td></tr>
<tr><td>FIFO (first-in, first-out)</td><td>Oldest costs go to COGS first</td><td>Lowest COGS, <b>highest net income</b></td></tr>
<tr><td>LIFO (last-in, first-out)</td><td>Newest costs go to COGS first</td><td><b>Highest COGS</b>, lowest income and taxes; best matches current costs to revenue</td></tr>
<tr><td>Weighted average (WA)</td><td>Each unit carries the average cost of all units available</td><td>In between</td></tr>
</tbody></table>`,
      },
      {
        type: "classify",
        title: "Which method? (costs are rising)",
        categories: ["FIFO", "LIFO", "Weighted average", "Specific identification"],
        items: [
          { label: "Highest cost of goods sold", answer: "LIFO", why: "LIFO sends the newest, most expensive costs to COGS." },
          { label: "Highest net income", answer: "FIFO", why: "FIFO's COGS uses the older, cheaper costs, so profit is higher." },
          { label: "Lowest tax expense", answer: "LIFO", why: "Highest COGS means lowest income, so the lowest taxes." },
          { label: "Better matches current costs with revenues", answer: "LIFO", why: "The newest costs are matched against today's sales." },
          { label: "Precisely matches each item's cost with the revenue it brings in", answer: "Specific identification", why: "It tracks the actual cost of each unit sold." },
          { label: "Each unit sold carries the average cost of everything available", answer: "Weighted average", why: "That's the definition of weighted average." },
        ],
      },
      {
        type: "calc",
        title: "Practice: FIFO vs. LIFO vs. weighted average",
        intro: "Beginning inventory: 10 units at $5. Purchase: 10 units at $7. The store sells 12 units.",
        items: [
          { q: "Cost of goods sold under FIFO?", answer: 64, hint: "Sell the oldest first: all 10 at $5, then 2 at $7.", why: "(10 × $5) + (2 × $7) = $50 + $14 = $64." },
          { q: "Cost of goods sold under LIFO?", answer: 80, hint: "Sell the newest first: 10 at $7, then 2 at $5.", why: "(10 × $7) + (2 × $5) = $70 + $10 = $80." },
          { q: "Cost of goods sold under weighted average?", answer: 72, hint: "Average cost = total cost of all 20 units ÷ 20.", why: "Average = ($50 + $70) ÷ 20 = $6 per unit. 12 × $6 = $72." },
          { q: "Ending inventory under FIFO (8 units left)?", answer: 56, hint: "FIFO leaves the newest units in inventory.", why: "8 units at $7 = $56. Check: $120 available − $64 COGS = $56." },
        ],
      },
      {
        type: "calc",
        title: "Practice: income statement relations",
        intro: "Sales − Cost of goods sold = Gross profit. Gross profit − Expenses = Net income.",
        items: [
          { q: "Company A: cost of goods sold $40,000, gross profit $35,000. What are sales?", answer: 75000, hint: "Sales = COGS + Gross profit.", why: "$40,000 + $35,000 = $75,000." },
          { q: "Company A: gross profit $35,000, net income $13,000. What are expenses?", answer: 22000, hint: "Expenses = Gross profit − Net income.", why: "$35,000 − $13,000 = $22,000." },
          { q: "Company B: sales $20,000, gross profit $11,500. What is cost of goods sold?", answer: 8500, hint: "COGS = Sales − Gross profit.", why: "$20,000 − $11,500 = $8,500." },
          { q: "Company B: gross profit $11,500, expenses $6,000. What is net income?", answer: 5500, hint: "Net income = Gross profit − Expenses.", why: "$11,500 − $6,000 = $5,500." },
          { q: "Company C: sales $90,000, cost of goods sold $30,000. What is gross profit?", answer: 60000, hint: "Sales − COGS.", why: "$90,000 − $30,000 = $60,000." },
          { q: "Company C: gross profit $60,000, net income $21,000. What are expenses?", answer: 39000, hint: "Gross profit − Net income.", why: "$60,000 − $21,000 = $39,000." },
        ],
      },
      {
        type: "journalBuilder",
        title: "Build the merchandising entries (perpetual inventory)",
        accounts: ["Cash", "Accounts Receivable", "Merchandise Inventory", "Accounts Payable", "Sales", "Sales Discounts", "Sales Returns and Allowances", "Cost of Goods Sold", "Delivery Expense"],
        rows: [
          { transaction: "Buy $5,000 of merchandise on credit, terms 2/10, n/60.", entries: [{ account: "Merchandise Inventory", side: "debit", amount: 5000 }, { account: "Accounts Payable", side: "credit", amount: 5000 }] },
          { transaction: "Pay $250 cash for freight on that purchase (FOB shipping point).", entries: [{ account: "Merchandise Inventory", side: "debit", amount: 250 }, { account: "Cash", side: "credit", amount: 250 }] },
          { transaction: "Pay the $5,000 invoice within the discount period (2% discount).", entries: [{ account: "Accounts Payable", side: "debit", amount: 5000 }, { account: "Merchandise Inventory", side: "credit", amount: 100 }, { account: "Cash", side: "credit", amount: 4900 }] },
          { transaction: "Sell merchandise on credit for $3,000. (Record the sale only.)", entries: [{ account: "Accounts Receivable", side: "debit", amount: 3000 }, { account: "Sales", side: "credit", amount: 3000 }] },
          { transaction: "Record the cost of the goods you just sold: they cost $1,800.", entries: [{ account: "Cost of Goods Sold", side: "debit", amount: 1800 }, { account: "Merchandise Inventory", side: "credit", amount: 1800 }] },
          { transaction: "Year-end: inventory recorded at $20,000 has a market value of $19,000 (lower of cost or market).", entries: [{ account: "Cost of Goods Sold", side: "debit", amount: 1000 }, { account: "Merchandise Inventory", side: "credit", amount: 1000 }] },
        ],
      },
      {
        type: "quiz",
        items: [
          { question: "Terms of 1/10, n/30 mean:", options: ["1% discount if paid in 30 days", "1% discount if paid within 10 days, otherwise full amount due in 30 days", "10% discount, due in 30 days", "Pay $1 per $10 within 30 days"], answerIndex: 1, explanation: "The first numbers are the discount % and its window; n/30 is when the full amount is due." },
          { question: "A buyer pays freight on goods shipped FOB shipping point. The buyer records the freight as:", options: ["Delivery expense", "Part of Merchandise Inventory", "A sales discount", "A reduction of Accounts Payable"], answerIndex: 1, explanation: "Freight-in is a cost of getting the goods ready to sell, so it's added to inventory." },
          { question: "When costs are rising, which method gives the highest net income?", options: ["LIFO", "Weighted average", "FIFO", "They're all the same"], answerIndex: 2, explanation: "FIFO charges the older, cheaper costs to COGS, so income is highest." },
          { question: "Which item does NOT reduce gross sales when computing net sales?", options: ["Sales discounts", "Sales returns and allowances", "Sales salaries", "None of these"], answerIndex: 2, explanation: "Salaries are an operating expense and appear below gross profit." },
          { question: "Inventory cost $20,000; market value $19,000. The LCM entry is:", options: ["Dr Merchandise Inventory 1,000; Cr Cost of Goods Sold 1,000", "Dr Cost of Goods Sold 1,000; Cr Merchandise Inventory 1,000", "Dr Loss 19,000; Cr Inventory 19,000", "No entry is needed"], answerIndex: 1, explanation: "Write inventory down by the $1,000 difference and charge it to COGS." },
        ],
      },
      {
        type: "practice",
        prompts: [
          "In your own words, what's the difference between FOB shipping point and FOB destination, and why does it matter at year-end?",
          "Why would a company choose LIFO when prices are rising, even though it reports less profit?",
        ],
      },
    ],
  },
  {
    "id": "internal-controls-cash",
    "title": "7. Internal controls & cash",
    "blocks": [
      {
        "type": "objectives",
        "text": "By the end of this lesson you should be able to name the purposes and seven principles of internal control, explain the fraud triangle and the limits of internal control, list the basic controls for cash and the goals of good cash management, record cash shortages and overages with Cash Over and Short, read a bank statement from the bank's point of view, and prepare a bank reconciliation, including the journal entries it requires."
      },
      {
        "type": "text",
        "html": "<p><b>Internal control</b> is all the policies and procedures a company uses to keep its assets safe and its records accurate.</p>\n<table class=\"ref\"><thead><tr><th>The 4 purposes (why)</th><th>The 7 principles (how)</th></tr></thead><tbody>\n<tr><td>1. Protect assets</td><td>1. Establish responsibilities</td></tr>\n<tr><td>2. Ensure reliable accounting</td><td>2. Maintain adequate records</td></tr>\n<tr><td>3. Promote efficient operations</td><td>3. Insure assets and bond key employees</td></tr>\n<tr><td>4. Uphold company policies</td><td>4. Separate recordkeeping from custody of assets</td></tr>\n<tr><td></td><td>5. Divide responsibility for related transactions</td></tr>\n<tr><td></td><td>6. Apply technological controls</td></tr>\n<tr><td></td><td>7. Perform regular and independent reviews</td></tr>\n</tbody></table>\n<p class=\"muted\">Trap answers: \"increase revenues\" and \"reduce payables\" are business goals. \"Record assets at cost\" (cost principle) and \"match revenues with expenses\" (expense recognition) are accounting principles. None of these are internal control principles. Internal controls <b>reduce</b> the risk of loss; they can't eliminate it.</p>\n<p><b>Fraud triangle</b> (the \"triple threat\"): <b>opportunity</b>, <b>pressure</b> and <b>rationalization</b>. Fraud is intentional; errors and mistakes are not.</p>\n<p><b>Limits of internal control:</b> human error, human fraud, the cost-benefit principle (controls can't cost more than they save) and the control environment (management has to show it cares).</p>"
      },
      {
        "type": "definitions",
        "items": [
          [
            "Internal control system",
            "The policies and procedures used to protect assets, ensure reliable accounting, promote efficient operations and uphold company policies."
          ],
          [
            "Bonding",
            "Insurance that protects the company if a key employee steals."
          ],
          [
            "Separation of duties",
            "Different people handle an asset and keep its records, so one person can't steal and hide it."
          ],
          [
            "Fraud triangle",
            "Opportunity + pressure + rationalization: the three factors behind fraud."
          ],
          [
            "Liquidity",
            "A company's ability to pay its current (short-term) liabilities."
          ],
          [
            "Cash equivalents",
            "Short-term, highly liquid investments that are treated like cash (for example, Treasury bills maturing within 3 months)."
          ],
          [
            "Cash Over and Short",
            "An income statement account for cash register differences. Debit balance (shortage) = expense; credit balance (overage) = revenue."
          ],
          [
            "Bank reconciliation",
            "A report explaining the difference between the checking account balance in the company's books and the balance on the bank statement."
          ],
          [
            "Outstanding check",
            "A check the company wrote that hasn't reached the bank yet."
          ],
          [
            "Deposit in transit",
            "A deposit the company made and recorded that isn't on the bank statement yet."
          ],
          [
            "NSF check",
            "A customer's check that bounced (not sufficient funds)."
          ],
          [
            "Bank service charge",
            "A fee the bank takes out of the account."
          ]
        ]
      },
      {
        "type": "quiz",
        "items": [
          {
            "question": "What is the purpose of internal controls?",
            "options": [
              "to guarantee that loss is eliminated",
              "as a basis of employee performance reviews",
              "to protect assets and ensure reliable accounting",
              "to reduce outstanding customer balances"
            ],
            "answerIndex": 2,
            "explanation": "Internal controls safeguard assets, ensure reliable accounting, promote efficient operations, and uphold company policies. They reduce the risk of loss but cannot eliminate it."
          }
        ]
      },
      {
        "type": "multiSelect",
        "title": "Practice: internal control and fraud (select all that apply)",
        "items": [
          {
            "question": "Which of the following are principles of internal control?",
            "options": [
              "Perform regular and independent reviews.",
              "Maintain adequate records.",
              "Increase revenues.",
              "Reduce vendor payables.",
              "Establish responsibilities.",
              "Divide responsibility for related transactions."
            ],
            "answers": [
              "Perform regular and independent reviews.",
              "Maintain adequate records.",
              "Establish responsibilities.",
              "Divide responsibility for related transactions."
            ],
            "explanation": "Increasing revenues and reducing payables are business goals, not internal control principles."
          },
          {
            "question": "Identify the principles of internal control by selecting all the correct answers below.",
            "options": [
              "Separate recordkeeping from custody of assets.",
              "Maintain adequate records.",
              "Perform regular and independent reviews.",
              "Apply technological controls.",
              "Match revenues with expenses in the same accounting period.",
              "Insure assets and bond key employees.",
              "Record assets at cost.",
              "Establish responsibilities."
            ],
            "answers": [
              "Separate recordkeeping from custody of assets.",
              "Maintain adequate records.",
              "Perform regular and independent reviews.",
              "Apply technological controls.",
              "Insure assets and bond key employees.",
              "Establish responsibilities."
            ],
            "explanation": "Matching revenues with expenses (expense recognition principle) and recording assets at cost (cost principle) are accounting principles, not internal control principles. The seventh internal control principle is dividing responsibility for related transactions."
          },
          {
            "question": "Which of the following are correct regarding why management uses internal controls?",
            "options": [
              "promote efficient operations.",
              "protect assets.",
              "reduce vendor payables.",
              "ensure reliable accounting.",
              "increase revenues.",
              "uphold company policies."
            ],
            "answers": [
              "promote efficient operations.",
              "protect assets.",
              "ensure reliable accounting.",
              "uphold company policies."
            ],
            "explanation": "The four purposes of internal control: protect assets, ensure reliable accounting, promote efficient operations, and uphold company policies."
          },
          {
            "question": "The triple threat of fraud includes three factors, including:",
            "options": [
              "error",
              "rationalization",
              "pressure",
              "opportunity",
              "mistakes"
            ],
            "answers": [
              "rationalization",
              "pressure",
              "opportunity"
            ],
            "explanation": "The fraud triangle is opportunity, pressure, and rationalization. Errors and mistakes are unintentional; fraud is intentional."
          }
        ]
      },
      {
        "type": "matching",
        "title": "Practice: limits of internal control",
        "items": [
          {
            "question": "Internal control policies and procedures have limitations that arise from many elements. Match the limitation with its definition.",
            "pairs": [
              {
                "term": "Human error",
                "definition": "Can occur from carelessness, misjudgment or confusion"
              },
              {
                "term": "Human fraud",
                "definition": "Involves intent by people to defeat internal controls for personal gain"
              },
              {
                "term": "Cost-benefit principle",
                "definition": "Dictates that the costs of internal controls must not exceed their benefits"
              },
              {
                "term": "Internal control environment",
                "definition": "Management must convey commitment to internal control policies and procedures"
              }
            ],
            "explanation": "Internal controls are limited by human error, human fraud, cost-benefit tradeoffs, and the tone set by management."
          }
        ]
      },
      {
        "type": "text",
        "html": "<p><b>Controlling cash.</b> Cash is the easiest asset to steal, so three basic rules apply:</p>\n<ol><li><b>Separate</b> handling cash from recording cash.</li><li><b>Deposit</b> cash receipts promptly (usually daily) in a bank.</li><li><b>Pay</b> by check or electronic funds transfer (EFT), not with cash.</li></ol>\n<p><b>Liquidity</b> is the ability to pay <b>current</b> liabilities. Cash is the most liquid asset.</p>\n<p><b>Good cash management:</b> plan cash receipts to meet cash payments when due, keep only the <b>minimum</b> cash needed to operate (idle cash earns nothing), collect receivables quickly, and pay liabilities when they're due (not early).</p>"
      },
      {
        "type": "multiSelect",
        "title": "Practice: cash controls and cash management",
        "items": [
          {
            "question": "Identify the basic internal control guidelines which should be in place to protect a business's cash.",
            "options": [
              "Cash receipts are promptly deposited in a bank.",
              "Cash payments are made by check.",
              "Handling cash is separate from recordkeeping of cash.",
              "Bills should be paid immediately.",
              "Excess cash should be left in the bank to maintain liquidity."
            ],
            "answers": [
              "Cash receipts are promptly deposited in a bank.",
              "Cash payments are made by check.",
              "Handling cash is separate from recordkeeping of cash."
            ],
            "explanation": "The three basic cash control guidelines: separate handling cash from recordkeeping, deposit receipts promptly, and make payments by check or EFT."
          },
          {
            "question": "Identify which of the items below are goals of good cash management.",
            "options": [
              "Pay all bills immediately when received.",
              "Keep a minimum level of cash necessary to operate.",
              "Keep a maximum level of cash available to pay for emergencies that develop",
              "Plan cash receipts to meet cash payments when due."
            ],
            "answers": [
              "Keep a minimum level of cash necessary to operate.",
              "Plan cash receipts to meet cash payments when due."
            ],
            "explanation": "Good cash management plans receipts to cover payments and keeps only the minimum cash needed; idle cash earns nothing."
          },
          {
            "question": "Which of the statements below describe effective cash management strategies?",
            "options": [
              "Encourage quick payment of liabilities.",
              "Plan cash receipts to meet cash payments when due.",
              "Keep a minimum level of cash necessary to operate.",
              "Excess cash should be kept on hand to pay bills.",
              "Encourage quick collection of receivables."
            ],
            "answers": [
              "Plan cash receipts to meet cash payments when due.",
              "Keep a minimum level of cash necessary to operate.",
              "Encourage quick collection of receivables."
            ],
            "explanation": "Collect receivables early, delay paying liabilities until due, and invest excess cash rather than holding it."
          }
        ]
      },
      {
        "type": "quiz",
        "items": [
          {
            "question": "A good internal control to protect cash is to make cash payments using",
            "options": [
              "cash",
              "checks",
              "petty cash",
              "U.S. Treasury bills"
            ],
            "answerIndex": 1,
            "explanation": "Checks (or EFT) create a documented record and require proper authorization."
          },
          {
            "question": "Which statement below explains why liquid assets are needed in a business?",
            "options": [
              "Liquid assets are easier to protect and control.",
              "Liquid assets are purchased because they take longer to mature.",
              "The maturity value of liquid assets is sensitive to interest rate changes.",
              "Liquid assets must be available to pay current liabilities."
            ],
            "answerIndex": 3,
            "explanation": "Liquid assets such as cash can be used right away to pay obligations as they come due."
          }
        ]
      },
      {
        "type": "fillBlank",
        "title": "Practice: fill in the blank",
        "items": [
          {
            "prompt": "Liquidity refers to a company's ability to pay for its ___ liabilities.",
            "blanks": [
              {
                "answer": "current",
                "acceptable": [
                  "current",
                  "short-term"
                ]
              }
            ],
            "explanation": "Liquidity is a company's ability to pay its current (near-term) obligations."
          }
        ]
      },
      {
        "type": "text",
        "html": "<p><b>Cash Over and Short.</b> When the cash in the register doesn't match the sales recorded, the difference goes to <b>Cash Over and Short</b>, an income statement account.</p>\n<table class=\"ref\"><thead><tr><th>Situation</th><th>Entry</th></tr></thead><tbody>\n<tr><td><b>Shortage:</b> register has $100, sales recorded $102</td><td>Dr Cash 100 · Dr Cash Over and Short 2 · Cr Sales 102</td></tr>\n<tr><td><b>Overage:</b> register has $553, sales recorded $550</td><td>Dr Cash 553 · Cr Cash Over and Short 3 · Cr Sales 550</td></tr>\n</tbody></table>\n<p class=\"muted\">Cash is always debited for what's actually in the drawer, and Sales is always credited for what was recorded. Cash Over and Short makes up the difference: a debit for a shortage, which acts like an expense, or a credit for an overage, which acts like revenue.</p>"
      },
      {
        "type": "multiSelect",
        "title": "Practice: Cash Over and Short",
        "items": [
          {
            "question": "Which of the answers below correctly describe the Cash Over and Short account?",
            "options": [
              "It records the effects of cash overages and cash shortages.",
              "A debit balance reflects an expense.",
              "It is an income statement account.",
              "It is an asset account.",
              "A debit balance reflects a revenue."
            ],
            "answers": [
              "It records the effects of cash overages and cash shortages.",
              "A debit balance reflects an expense.",
              "It is an income statement account."
            ],
            "explanation": "Cash Over and Short is an income statement account. A debit balance (net shortage) is an expense; a credit balance (net overage) is revenue."
          }
        ]
      },
      {
        "type": "quiz",
        "items": [
          {
            "question": "The cash in a cash register equaled $100, but the record of cash receipts/sales equaled $102. Which entry is correct to record cash sales and the shortage?",
            "options": [
              "debit Cash $102 and credit Sales $102.",
              "debit Cash $100; debit Cash Over and Short $2; and credit Sales $102.",
              "debit Cash $102; credit Cash Over and Short $2; and credit Sales $100.",
              "debit Sales $100; credit Cash Over and Short $2; and credit Cash $102."
            ],
            "answerIndex": 1,
            "explanation": "Debit Cash for the actual $100 on hand, credit Sales for the recorded $102, and debit the $2 shortage to Cash Over and Short (an expense)."
          }
        ]
      },
      {
        "type": "journalBuilder",
        "title": "Build the Cash Over and Short entries",
        "accounts": [
          "Cash",
          "Sales",
          "Cash Over and Short",
          "Accounts Receivable",
          "Miscellaneous Expense"
        ],
        "rows": [
          {
            "transaction": "The register has $100 cash, but recorded cash sales are $102.",
            "entries": [
              {
                "account": "Cash",
                "side": "debit",
                "amount": 100
              },
              {
                "account": "Cash Over and Short",
                "side": "debit",
                "amount": 2
              },
              {
                "account": "Sales",
                "side": "credit",
                "amount": 102
              }
            ]
          },
          {
            "transaction": "The register has $553 cash, but recorded cash sales are $550.",
            "entries": [
              {
                "account": "Cash",
                "side": "debit",
                "amount": 553
              },
              {
                "account": "Cash Over and Short",
                "side": "credit",
                "amount": 3
              },
              {
                "account": "Sales",
                "side": "credit",
                "amount": 550
              }
            ]
          },
          {
            "transaction": "The register has $495 cash, but recorded cash sales are $500.",
            "entries": [
              {
                "account": "Cash",
                "side": "debit",
                "amount": 495
              },
              {
                "account": "Cash Over and Short",
                "side": "debit",
                "amount": 5
              },
              {
                "account": "Sales",
                "side": "credit",
                "amount": 500
              }
            ]
          }
        ]
      },
      {
        "type": "text",
        "html": "<p><b>The bank statement</b> is the <b>bank's</b> record of your account. To the bank, your account is a <b>liability</b> (money it owes you), so on the statement your <b>deposits are credits</b> (increases) and your <b>withdrawals are debits</b> (decreases). It shows the beginning balance, deposits and other increases (like interest and notes the bank collected for you), checks and other decreases (like NSF checks and service charges), and the ending balance. Checks that haven't cleared yet <b>don't</b> appear.</p>\n<p><b>Bank reconciliation:</b> explain every difference between the bank statement and your Cash account until both <b>adjusted</b> balances are equal.</p>\n<table class=\"ref\"><thead><tr><th>Bank side (the bank doesn't know yet)</th><th>Book side (you don't know yet)</th></tr></thead><tbody>\n<tr><td><b>+</b> Deposits in transit</td><td><b>+</b> Interest earned, notes collected by the bank</td></tr>\n<tr><td><b>−</b> Outstanding checks</td><td><b>−</b> NSF checks, bank service charges</td></tr>\n<tr><td>± Bank errors</td><td>± Book errors (like a check recorded for the wrong amount)</td></tr>\n<tr><td class=\"muted\">No journal entries (the bank fixes these when they clear)</td><td><b>Every book-side item needs a journal entry</b></td></tr>\n</tbody></table>\n<p>Adjusted bank balance <b>must equal</b> adjusted book balance. If they don't match, there's still an error somewhere.</p>"
      },
      {
        "type": "quiz",
        "items": [
          {
            "question": "Determine which of the statements below is correct regarding information reflected on a monthly bank statement.",
            "options": [
              "Deposits that the company makes will be listed as debits to the bank account on the bank statement.",
              "The information on the bank statement reflects the customer's records.",
              "The information on the bank statement reflects the bank's records of the depositor's account.",
              "Withdrawals by the company will be listed as increases to the bank account on the bank statement."
            ],
            "answerIndex": 2,
            "explanation": "To the bank, a depositor's account is a liability, so deposits are credits (increases) and withdrawals are debits (decreases)."
          },
          {
            "question": "Review the items below and determine which would cause an increase in the monthly bank statement balance.",
            "options": [
              "Cash deposits made by the account owner",
              "A customer's uncollectible check",
              "Service fees charged by the bank",
              "Checks written during the month"
            ],
            "answerIndex": 0,
            "explanation": "NSF checks, service fees, and checks written all decrease the balance."
          }
        ]
      },
      {
        "type": "multiSelect",
        "title": "Practice: bank statements and reconciliations (select all that apply)",
        "items": [
          {
            "question": "Determine which of the items below would show up on a monthly bank statement.",
            "options": [
              "Beginning period balance in the depositor's account",
              "Checks that the company has written, but have not cleared the bank yet",
              "Withdrawals and other decreases to the account during the period",
              "Deposits and other increases to the depositor's account during the period",
              "Ending period balance in the account",
              "Withdrawals and other increases to the account during the period"
            ],
            "answers": [
              "Beginning period balance in the depositor's account",
              "Withdrawals and other decreases to the account during the period",
              "Deposits and other increases to the depositor's account during the period",
              "Ending period balance in the account"
            ],
            "explanation": "Uncleared (outstanding) checks have not reached the bank yet, and withdrawals decrease the account."
          },
          {
            "question": "Which items are included in the deposits column of a bank statement and result in an increase in the account balance?",
            "options": [
              "Deposits made during the month",
              "Interest paid by the bank on the bank account balance",
              "Checks written by the account owner",
              "A note collected by the bank on behalf of the account owner",
              "A returned uncollectible customer check"
            ],
            "answers": [
              "Deposits made during the month",
              "Interest paid by the bank on the bank account balance",
              "A note collected by the bank on behalf of the account owner"
            ],
            "explanation": "Checks written and returned NSF checks decrease the account balance."
          },
          {
            "question": "Determine the statements below that are true regarding why a bank reconciliation is used.",
            "options": [
              "Timing differences between the bank statement and the depositor's records are reflected in the bank reconciliation.",
              "The Cash account balance in the general ledger is accurate, but the bank statement balance is not.",
              "We must reconcile the balance of the bank's records and the Cash account in the general ledger and explain or account for any differences in the two.",
              "The bank reconciliation is useful in proving the accuracy of the Cash account in the general ledger."
            ],
            "answers": [
              "Timing differences between the bank statement and the depositor's records are reflected in the bank reconciliation.",
              "We must reconcile the balance of the bank's records and the Cash account in the general ledger and explain or account for any differences in the two.",
              "The bank reconciliation is useful in proving the accuracy of the Cash account in the general ledger."
            ],
            "explanation": "Neither balance is assumed correct; the reconciliation identifies errors and timing differences on both sides."
          }
        ]
      },
      {
        "type": "fillBlank",
        "title": "Practice: fill in the blanks",
        "items": [
          {
            "prompt": "A bank reconciliation is a report explaining any differences between the ___ account balance according to the depositor's records and the balance reported on the ___ statement.",
            "blanks": [
              {
                "answer": "checking",
                "choices": [
                  "checking",
                  "subsidiary",
                  "sales"
                ]
              },
              {
                "answer": "bank",
                "choices": [
                  "income",
                  "financial",
                  "bank"
                ]
              }
            ],
            "explanation": "A bank reconciliation compares the depositor's checking account records to the bank statement."
          }
        ]
      },
      {
        "type": "matching",
        "title": "Practice: why the balances differ",
        "items": [
          {
            "question": "Identify the factors that cause the bank statement balance to differ from the depositor's book balance by matching each to its definition.",
            "pairs": [
              {
                "term": "Outstanding check",
                "definition": "A check written by the depositor that has not yet been received by the bank for payment"
              },
              {
                "term": "Deposit in transit",
                "definition": "Deposit made and recorded by the depositor, but not yet recorded on the bank statement"
              },
              {
                "term": "NSF check",
                "definition": "A check written by a customer who does not have enough money in his account to cover the check"
              },
              {
                "term": "Bank charges",
                "definition": "Service fees charged by the bank"
              }
            ],
            "explanation": "Outstanding checks and deposits in transit adjust the bank balance; NSF checks and bank charges adjust the book balance."
          }
        ]
      },
      {
        "type": "classify",
        "title": "Where does it go on the reconciliation?",
        "categories": [
          "Bank side: add",
          "Bank side: subtract",
          "Book side: add",
          "Book side: subtract"
        ],
        "items": [
          {
            "label": "Deposit in transit",
            "answer": "Bank side: add",
            "why": "You recorded it; the bank hasn't yet, so add it to the bank balance."
          },
          {
            "label": "Outstanding check",
            "answer": "Bank side: subtract",
            "why": "You already subtracted it; the bank hasn't paid it yet."
          },
          {
            "label": "Interest earned on the account",
            "answer": "Book side: add",
            "why": "The bank added it; you find out from the statement."
          },
          {
            "label": "Note receivable collected by the bank for you",
            "answer": "Book side: add",
            "why": "The bank collected cash for you that isn't in your books yet."
          },
          {
            "label": "Customer's NSF (bounced) check",
            "answer": "Book side: subtract",
            "why": "You recorded it as cash, but it bounced, so the cash isn't really there."
          },
          {
            "label": "Bank service charge",
            "answer": "Book side: subtract",
            "why": "The bank took the fee out; you haven't recorded it yet."
          }
        ]
      },
      {
        "type": "calc",
        "title": "Practice: prepare a bank reconciliation",
        "intro": "Bank statement balance $8,450. Book (Cash account) balance $8,820. Deposit in transit $1,200. Outstanding checks $950. Bank service charge $20. Customer NSF check $300. Interest earned $15. Note collected by the bank $185.",
        "items": [
          {
            "q": "What is the adjusted BANK balance?",
            "answer": 8700,
            "hint": "Bank balance + deposits in transit − outstanding checks.",
            "why": "$8,450 + $1,200 − $950 = $8,700."
          },
          {
            "q": "What is the adjusted BOOK balance?",
            "answer": 8700,
            "hint": "Book balance + interest + note collected − service charge − NSF check.",
            "why": "$8,820 + $15 + $185 − $20 − $300 = $8,700. It matches the bank side, so cash is reconciled."
          },
          {
            "q": "By how much does the Cash account change after you record all the book-side entries?",
            "answer": -120,
            "hint": "Adjusted book balance − original book balance.",
            "why": "$8,700 − $8,820 = −$120 (a $120 decrease)."
          },
          {
            "q": "A register holds $495 but recorded sales are $500. What amount is debited to Cash Over and Short?",
            "answer": 5,
            "hint": "Recorded sales − cash actually in the drawer.",
            "why": "$500 − $495 = $5 shortage (a debit, acting like an expense)."
          }
        ]
      },
      {
        "type": "journalBuilder",
        "title": "Record the book-side reconciliation entries",
        "accounts": [
          "Cash",
          "Accounts Receivable",
          "Notes Receivable",
          "Interest Revenue",
          "Bank Service Charge Expense"
        ],
        "rows": [
          {
            "transaction": "Record the $300 customer check that came back NSF.",
            "entries": [
              {
                "account": "Accounts Receivable",
                "side": "debit",
                "amount": 300
              },
              {
                "account": "Cash",
                "side": "credit",
                "amount": 300
              }
            ]
          },
          {
            "transaction": "Record the $20 bank service charge.",
            "entries": [
              {
                "account": "Bank Service Charge Expense",
                "side": "debit",
                "amount": 20
              },
              {
                "account": "Cash",
                "side": "credit",
                "amount": 20
              }
            ]
          },
          {
            "transaction": "Record the $15 interest the bank paid on the account.",
            "entries": [
              {
                "account": "Cash",
                "side": "debit",
                "amount": 15
              },
              {
                "account": "Interest Revenue",
                "side": "credit",
                "amount": 15
              }
            ]
          },
          {
            "transaction": "Record the $185 note receivable the bank collected for you.",
            "entries": [
              {
                "account": "Cash",
                "side": "debit",
                "amount": 185
              },
              {
                "account": "Notes Receivable",
                "side": "credit",
                "amount": 185
              }
            ]
          }
        ]
      },
      {
        "type": "quiz",
        "items": [
          {
            "question": "Select the items below that would cause the bank statement balance to differ from the depositor's book balance.",
            "options": [
              "NSF check, Outstanding checks, Supplies expenses",
              "Bank Service charges, Deposit in transit, Cleared checks",
              "NSF check, Deposit in transit, interest paid by bank",
              "Cleared checks, Bank service charge, NSF check"
            ],
            "answerIndex": 2,
            "explanation": "Cleared checks are already recorded by both sides, and supplies expense is unrelated to the bank reconciliation."
          },
          {
            "question": "Determine which of the statements below is true regarding the adjusted bank balance and the adjusted book balance on a bank reconciliation.",
            "options": [
              "The adjusted balance per books must equal the cash balance printed on the bank statement.",
              "The adjusted bank balance must equal the adjusted cash balance per books.",
              "The adjusted book balance will rarely equal the adjusted bank balance.",
              "The cash balance on the bank statement must equal the cash balance in the general ledger before the bank reconciliation."
            ],
            "answerIndex": 1,
            "explanation": "After all adjustments, both balances must match; otherwise an error still exists."
          },
          {
            "question": "The adjusted book balance and the adjusted bank balance must equal each other on a bank reconciliation; otherwise, the cash account is not reconciled.",
            "options": [
              "True",
              "False"
            ],
            "answerIndex": 0,
            "explanation": "Matching adjusted balances is what it means for cash to be reconciled."
          }
        ]
      },
      {
        "type": "practice",
        "prompts": [
          "Explain the fraud triangle in your own words, and give an example of a control that removes the 'opportunity' side.",
          "Why do only book-side items on a bank reconciliation need journal entries?"
        ]
      }
    ]
  },
];
