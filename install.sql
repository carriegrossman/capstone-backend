CREATE TABLE users
(
    id serial primary key,
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE,
    password VARCHAR,
    zipcode INTEGER,
    coffeeshop BOOLEAN DEFAULT FALSE
);

CREATE TABLE images
(
    user_id INTEGER REFERENCES users (id),
    imgname text
);

CREATE TABLE coffeeshops
(
    id serial primary key,
    name text,
    address text,
    city text, 
    state VARCHAR(2),
    zip INTEGER, 
    owner_id INTEGER REFERENCES users (id)
);

CREATE TABLE visits(
    id serial primary key,
    coffeeshop_id INTEGER REFERENCES coffeeshops (id),
    visitor_id INTEGER REFERENCES users (id),
    stamper INTEGER REFERENCES users (id)
);