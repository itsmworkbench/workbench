

```yaml
mysql-index:
   type: mysql
   scan:
      sql:   `SELECT * FROM person where last_updated > {sinceDate}` # Note the templating. If ignored always same
      connection:
          host: localhost
          port: 3306 # defaults to this anyway
          user: someName
          password: env variable name of password
          database: test
```


For testing mysql

```sql
CREATE DATABASE test;
USE test;


CREATE TABLE person (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('John', 'Doe', 'john.doe@example.com', '1980-01-01');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('Jane', 'Smith', 'jane.smith@example.com', '1990-02-15');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('Michael', 'Johnson', 'michael.johnson@example.com', '1985-05-30');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('Emily', 'Davis', 'emily.davis@example.com', '1992-07-22');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('William', 'Brown', 'william.brown@example.com', '1975-12-05');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('Jessica', 'Williams', 'jessica.williams@example.com', '1988-11-10');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('David', 'Jones', 'david.jones@example.com', '1995-03-14');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('Sophia', 'Garcia', 'sophia.garcia@example.com', '1993-09-08');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('James', 'Martinez', 'james.martinez@example.com', '1982-06-25');

INSERT INTO person (first_name, last_name, email, date_of_birth)
VALUES ('Olivia', 'Hernandez', 'olivia.hernandez@example.com', '1991-01-20');

```