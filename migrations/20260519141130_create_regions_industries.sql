-- +goose Up
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE regions (
    id   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE industries (
    id   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL UNIQUE
);

-- +goose Down
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS regions;
