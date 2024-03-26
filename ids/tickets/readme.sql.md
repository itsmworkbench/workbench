```sql
DROP TABLE PRODUCTS ;

CREATE TABLE products (product_id varchar(255), product_name varchar(255),price number(5,2));

INSERT INTO products (product_id, product_name, price) VALUES ('1234-44', 'Epoxy Widget', 199.99);
INSERT INTO products (product_id, product_name, price) VALUES ('1777-55', 'Discombobulator', 210.00);
INSERT INTO products (product_id, product_name, price) VALUES ('3456-78', 'Quantum Spanner', 399.99);
INSERT INTO products (product_id, product_name, price) VALUES ('4567-89', 'Photon Scooper', 499.99);
INSERT INTO products (product_id, product_name, price) VALUES ('5678-90', 'Temporal Inverter', 599.99);
INSERT INTO products (product_id, product_name, price) VALUES ('6789-01', 'Gravitational Pulser', 699.99);
```

```sql
select * from products where product_id = '1234-44';

update products set price = 2.33 where product_id = '1711-225';


update products set price = 230.11 where product_id = '1777-55';

delete from products where product_id = '1234-44';
```

```sql


```plaintext
ITSM-PRICE-1111
phil.rice@validoc.org

In the EPX the Discombobulator (item code 1777-55) has an incorrect price.

The price is currently 210.00 and should be 230.11

Please correct this
```

```plaintext
* In the epx the Epoxy-Widget  (item code 1234-44) has an incorrect price.
* The prices is currently 199.99
* The price should be 179.99.

Please update this price in the EPX production.