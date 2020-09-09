CREATE TABLE users (
    id serial primary key,
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE,
    password VARCHAR,
    zipcode INTEGER

);

CREATE TABLE images (
    user_id INTEGER REFERENCES users (id),
    imgname text
);

CREATE TABLE activities (
    id INTEGER REFERENCES users (id),
    activity text, 
    type text, 
    activityKey VARCHAR, 
    completed BOOLEAN DEFAULT FALSE
);