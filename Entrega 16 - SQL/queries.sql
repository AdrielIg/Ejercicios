/* Create database */
CREATE DATABASE prueba CHARACTER SET utf8;

/* Create table */
CREATE TABLE items (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    category varchar(255) NOT NULL,
    stock int unsigned,
    PRIMARY KEY(id)
);

/* Insert values */
INSERT INTO items (name,category,stock) VALUES ("Fideos", "Harina", 20);
INSERT INTO items (name,category,stock) VALUES ("Leche", "Lacteos", 30);
INSERT INTO items (name,category,stock) VALUES ("Crema", "Lacteos", 15);

/* Get items */
SELECT * FROM items

/* Delete item */
DELETE FROM items WHERE id = 1

/* Update stock */
UPDATE items SET stock = 45 WHERE name = "Leche"