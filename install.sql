CREATE TABLE users
(
    id serial primary key,
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE,
    password VARCHAR,
    zipcode INTEGER,
    owner BOOLEAN DEFAULT FALSE
);

CREATE TABLE coffeeshops
(
    id serial primary key,
    name text,
    address text,
    city text, 
    state VARCHAR(2),
    zipcode INTEGER, 
    about text,
    owner_id INTEGER REFERENCES users (id)
);

CREATE TABLE shopImages
(
    coffeeshop_id INTEGER REFERENCES coffeeshops (id),
    imgname text,
    caption text,
    img text
);

CREATE TABLE visits(
    id serial primary key,
    coffeeshop_id INTEGER REFERENCES coffeeshops (id),
    visitor_id INTEGER REFERENCES users (id),
    stamps INTEGER
);


CREATE TABLE rewards(
    id serial primary key,
    coffeeshop_id INTEGER REFERENCES coffeeshops (id),
    visitor_id INTEGER REFERENCES users (id),
    rewards INTEGER
);

CREATE TABLE reviews(
    id serial primary key,
    coffeeshop_id INTEGER REFERENCES coffeeshops (id),
    visitor_id INTEGER REFERENCES users (id),
    stars INTEGER, 
    review text
);

CREATE TABLE shopUpdates(
    id serial primary key,
    coffeeshop_id INTEGER REFERENCES coffeeshops (id),
    date DATE,
    owner_update text
);

create unique index coffeeshop_id_visitor_id_stamps on visits (coffeeshop_id, visitor_id);
create unique index coffeeshop_id_visitor_id_rewards on rewards (coffeeshop_id, visitor_id);
