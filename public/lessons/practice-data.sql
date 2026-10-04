INSERT INTO customers VALUES
 (1,'Maya','Lopez','St. George','UT','2024-01-15'),
 (2,'Ethan','Brooks','Cedar City','UT','2024-02-03'),
 (3,'Ava','Nguyen','Las Vegas','NV','2024-03-22'),
 (4,'Liam','Carter','St. George','UT','2024-05-09'),
 (5,'Zoe','Patel','Mesquite','NV','2024-06-30'),
 (6,'Noah','Kim','Hurricane','UT','2024-08-12'),
 (7,'Chloe','Rivera','Phoenix','AZ',NULL);
INSERT INTO products VALUES
 (1,'Notebook','Supplies',3.50),
 (2,'Graphing Calculator','Electronics',119.99),
 (3,'Backpack','Accessories',45.00),
 (4,'Highlighters (5 pk)','Supplies',6.25),
 (5,'USB Drive 64GB','Electronics',14.99),
 (6,'Water Bottle','Accessories',18.00),
 (7,'Textbook: Intro Accounting','Books',210.00);
INSERT INTO orders VALUES
 (101,1,'2024-09-01','shipped'),
 (102,2,'2024-09-02','shipped'),
 (103,1,'2024-09-05','pending'),
 (104,3,'2024-09-06','shipped'),
 (105,4,'2024-09-10','cancelled'),
 (106,5,'2024-09-12','shipped'),
 (107,2,'2024-09-15','pending'),
 (108,6,'2024-09-18','shipped');
INSERT INTO order_items VALUES
 (101,1,4),(101,4,2),(102,2,1),(103,3,1),(103,6,2),(104,7,1),(104,1,3),
 (105,5,2),(106,2,1),(106,5,1),(107,4,5),(108,3,1),(108,7,1),(108,1,2);
INSERT INTO CompanyInformation VALUES
 ('AAPL','Apple','Tech','Cupertino','CA','408-555-0100'),
 ('MSFT','Microsoft','Tech','Redmond','WA','425-555-0101'),
 ('NVDA','Nvidia','Tech','Santa Clara','CA','408-555-0102'),
 ('F','Ford','Automotive','Dearborn','MI','313-555-0103'),
 ('TSLA','Tesla','Automotive','Austin','TX','512-555-0104'),
 ('JPM','JPMorgan Chase','Finance','New York','NY','212-555-0105'),
 ('DAL','Delta Air Lines','Airline','Atlanta','GA','404-555-0106'),
 ('HLTH','Healthwise','Healthcare','Nashville','TN','615-555-0107');
INSERT INTO StockData VALUES
 ('AAPL','2024-01-02',181.3,58000000),
 ('MSFT','2024-01-02',366.3,26750000),
 ('NVDA','2024-01-02',1050.0,47880000),
 ('F','2024-01-02',11.72,73810000),
 ('TSLA','2024-01-02',249.9,110000000),
 ('JPM','2024-01-02',166.6,10165000),
 ('DAL','2024-01-02',39.6,10032000),
 ('NEWCO','2024-01-02',2.5,363000),
 ('AAPL','2024-01-03',186.85,62060000),
 ('MSFT','2024-01-03',377.4,28500000),
 ('NVDA','2024-01-03',1029.0,50820000),
 ('F','2024-01-03',11.48,61000000),
 ('TSLA','2024-01-03',245.0,117700000),
 ('JPM','2024-01-03',171.7,10830000),
 ('DAL','2024-01-03',40.8,10648000),
 ('NEWCO','2024-01-03',2.45,300000),
 ('AAPL','2024-01-04',183.15,66120000),
 ('MSFT','2024-01-04',370.0,30250000),
 ('NVDA','2024-01-04',1060.5,42000000),
 ('F','2024-01-04',11.83,65270000),
 ('TSLA','2024-01-04',240.1,125400000),
 ('JPM','2024-01-04',168.3,11495000),
 ('DAL','2024-01-04',40.0,8800000),
 ('NEWCO','2024-01-04',2.52,321000),
 ('AAPL','2025-01-02',222.0,70180000),
 ('MSFT','2025-01-02',429.2,25000000),
 ('NVDA','2025-01-02',1228.5,44940000),
 ('F','2025-01-02',13.69,69540000),
 ('TSLA','2025-01-02',291.55,133100000),
 ('JPM','2025-01-02',204.0,9500000),
 ('DAL','2025-01-02',46.4,9416000),
 ('AAPL','2025-01-03',218.3,58000000),
 ('MSFT','2025-01-03',440.3,26750000),
 ('NVDA','2025-01-03',1260.0,47880000),
 ('F','2025-01-03',13.46,73810000),
 ('TSLA','2025-01-03',286.65,110000000),
 ('JPM','2025-01-03',200.6,10165000);
INSERT INTO Calendar VALUES
 ('2024-01-02','January',2024,'Tuesday','Weekday'),
 ('2024-01-03','January',2024,'Wednesday','Weekday'),
 ('2024-01-04','January',2024,'Thursday','Weekday'),
 ('2025-01-02','January',2025,'Thursday','Weekday'),
 ('2025-01-03','January',2025,'Friday','Weekday'),
 ('2024-01-01','January',2024,'Monday','Holiday');
INSERT INTO Toys VALUES (1,'Yo-yo'),(2,'Kite'),(3,'Ball'),(4,'Puzzle'),(5,'Robot'),(6,'Teddy bear');
INSERT INTO Colors VALUES (1,'Red'),(2,'Orange'),(3,'Yellow'),(4,'Green'),(5,'Blue'),(6,'Indigo'),(7,'Violet');
INSERT INTO JimmyPage VALUES (2020,1,110.1),(2020,2,111.2),(2020,3,109.3),(2020,4,108.4),(2021,1,200.1),(2021,2,201.2),(2021,3,204.3),(2021,4,206.4),(2021,1,195.5),(2021,3,200.3),(2021,4,195.9);
