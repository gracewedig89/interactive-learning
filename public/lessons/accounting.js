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
];
