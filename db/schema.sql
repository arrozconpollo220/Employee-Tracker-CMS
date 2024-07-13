-- drops database if it exists (do not use in real life production).
DROP DATABASE IF EXISTS employees_db;
-- create database
CREATE DATABASE employees_db;

-- connects to database
\c employees_db;

-- creates table
CREATE TABLE department (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(30) NOT NULL
);

-- creates table
CREATE TABLE role (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INTEGER NOT NULL
);

-- creates table
CREATE TABLE employee (
  id SERIAL PRIMARY KEY NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER NOT NULL,
  manager_id INTEGER
);