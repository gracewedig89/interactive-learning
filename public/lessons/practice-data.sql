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
