CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  city        TEXT,
  state       TEXT,
  joined_on   DATE
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT,
  price      REAL NOT NULL
);
CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  order_date  DATE,
  status      TEXT
);
CREATE TABLE order_items (
  order_id   INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES products(product_id),
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
CREATE TABLE CompanyInformation (
  TickerSymbol TEXT PRIMARY KEY,
  CompanyName  TEXT,
  Industry     TEXT,
  City         TEXT,
  State        TEXT,
  PhoneNumber  TEXT
);
CREATE TABLE StockData (
  TickerSymbol TEXT,
  TradeDate    DATE,
  ST_Close     REAL,
  Volume       INTEGER,
  PRIMARY KEY (TickerSymbol, TradeDate)
);
CREATE TABLE Calendar (
  ActualDate DATE PRIMARY KEY,
  MonthName  TEXT,
  YearNumber INTEGER,
  DayOfWeek  TEXT,
  DayType    TEXT
);
CREATE TABLE Toys (ToyID INTEGER, ToyName TEXT);
CREATE TABLE Colors (ColorID INTEGER, Shade TEXT);
CREATE TABLE JimmyPage ([Year] INTEGER, Quarter INTEGER, Amount REAL);
