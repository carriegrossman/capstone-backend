const express = require("express");
const cors = require("cors");
const secretInfo = require("./config.js");
const app = express();
const pgp = require("pg-promise")();
const eS = require("express-session");
const expressSession = eS(secretInfo().secret);

//for passport encryption
const bcrypt = require("bcrypt");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const saltRounds = 10;

const passInfo = (req, res, next) => {
  res.db = db;
  res.saltRounds = saltRounds;
  res.bcrypt = bcrypt;
  next();
};

app.use(passInfo);
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//connects to postgres db
const db = pgp(secretInfo().connect);

//logic to create a user
const createUser = async (req, res, next) => {
  let hash = await bcrypt.hash(req.body.password, saltRounds);
  const searchRegExp = /'/g;
  const replaceWith = "''";
  let insertion = await db.none(
    `INSERT INTO users (username, email, password, zipcode) VALUES ($1, $2, $3, $4)`,
    [req.body.username, req.body.email, hash, parseInt(req.body.zipcode), false]
  );

  let newUser = await db.one(
    `SELECT * FROM users where username = '${req.body.username}'`
  );
  res.send(newUser);
  next();
};

//logic to create a shop
const createOwner = async (req, res, next) => {
  let hash = await bcrypt.hash(req.body.password, saltRounds);
  const searchRegExp = /'/g;
  const replaceWith = "''";
  let insertion = await db.none(
    `INSERT INTO users (username, email, password, zipcode, owner) VALUES ($1, $2, $3, $4, $5)`,
    [req.body.username, req.body.email, hash, parseInt(req.body.zipcode), true]
  );

  let newShop = await db.one(
    `SELECT * FROM users where username = '${req.body.username}'`
  );
  res.send(newShop);
  next();
};

//logic to create shop

const createShop = async (req, res, next) => {
  console.log(req.body);
  const searchRegExp = /'/g;
  const replaceWith = "''";
  let insertion = await db.none(
    `INSERT INTO coffeeshops (name, address, city, state, zipcode, about, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      req.body.name,
      req.body.address,
      req.body.city,
      "GA",
      parseInt(req.body.zipcode),
      req.body.about,
      req.body.id,
    ]
  );

  let newShop = await db.manyOrNone(
    `SELECT * FROM coffeeshops where name = '${req.body.name}'`
  );
  console.log(newShop);
  res.send(newShop);
  next();
};

//checks if user aleady exists
const checkIfExist = async (req, res, next) => {
  let result = await db.oneOrNone(
    `SELECT * FROM users WHERE username='${req.body.username}'`
  );
  result != null ? res.send(`User Already Exists`) : next();
};

//checks if shop aleady exists
const checkIfShopExist = async (req, res, next) => {
  let result = await db.oneOrNone(
    `SELECT * FROM users WHERE username='${req.body.username}'`
  );
  result != null ? res.send(`User Already Exists`) : next();
};

const checkIsLoggedIn = (req, res, next) => {
  let isLoggedIn = req.isAuthenticated();
  if (isLoggedIn) {
    return next();
  }
  res.send({ loggedin: "false" });
};
//logic to search coffee shop
const searchCoffeeShop = async (req, res, next) => {
  let result = await db.any(
    `SELECT * FROM users WHERE id='${Number(req.body.id)}'`
  );
  res.send(result);
  next();
};

//find coffee shops
const findCoffeeShops = async (req, res, next) => {
  let result = await db.any(`SELECT * FROM coffeeshops`);
  res.send(result);
  next();
};

//find users
const findUsers = async (req, res, next) => {
  let result = await db.any(`SELECT * FROM users`);
  res.send(result);
  next();
};

//find shops
const findMyShops = async (req, res, next) => {
  let result = await db.manyOrNone(
    `SELECT * FROM coffeeshops WHERE owner_id='${req.body.id}'`
  );
  res.send(result);
  next();
};

//logic to store stamps
const storeStamps = async (req, res, next) => {
  let upsert = await db.none(
    `insert into visits (coffeeshop_id, visitor_id, stamps) values ($1, $2, $3)
    on conflict (coffeeshop_id, visitor_id)
    do update set stamps = visits.stamps + 1`,
    [req.body.coffeeshop_id, req.body.visitor_id, 1]
  );

  // let insertion = await db.none(
  //     `INSERT INTO visits (coffeeshop_id, visitor_id, stamps) VALUES ($1, $2, $3)`,[req.body.coffeeshop_id, req.body.visitor_id, 1]
  // );

  let allStamps = await db.oneOrNone(
    `SELECT * FROM visits where coffeeshop_id = '${req.body.coffeeshop_id}' AND visitor_id = '${req.body.visitor_id}'`
  );

  if (allStamps.stamps % 10 === 0) {
    let upsertRewards = await db.none(
      `insert into rewards (coffeeshop_id, visitor_id, rewards) values ($1, $2, $3)
        on conflict (coffeeshop_id, visitor_id)
        do update set rewards = rewards.rewards + 1`,
      [req.body.coffeeshop_id, req.body.visitor_id, 1]
    );
  }
  res.send(allStamps);
  next();
};

//logic to fetch visits

const fetchYourVisits = async (req, res, next) => {
  console.log(req.body);
  let result = await db.manyOrNone(
    `SELECT * FROM visits WHERE visitor_id='${req.body.id}'`
  );
  res.send(result);
  next();
};

// seperate pg promise
passport.use(
  new Strategy((username, password, callback) => {
    db.one(`SELECT * FROM users WHERE username='${username}'`)
      .then((u) => {
        console.log(u); //
        bcrypt.compare(password, u.password).then((result) => {
          console.log(result);
          if (!result) return callback(null, false);
          return callback(null, u);
        });
      })
      .catch(() => callback(null, false));
  })
);

passport.serializeUser((user, callback) => callback(null, user.id));

passport.deserializeUser((id, callback) => {
  db.one(`SELECT * FROM users WHERE id='${id}'`)
    .then((u) => {
      return callback(null, u);
    })
    .catch(() => callback({ "not-found": "No User With That ID Is Found" }));
});

app.get(`/`, checkIsLoggedIn, async (req, res) => {});

app.post("/login", passport.authenticate("local"), (req, res) => {
  console.log(req.user);
  if (req.user) {
    return res.send({ loggedin: "true", user: req.user });
  }
  res.send({ loggedin: "false" });
});

app.get("/currentUser", checkIsLoggedIn, (req, res) => {
  res.send({ loggedin: "true", user: req.user });
});

app.post("/register", checkIfExist, createUser, (req, res) => {});

app.post("/registerowner", checkIfExist, createOwner, (req, res) => {});

app.post("/registershop", createShop, (req, res) => {});
app.post("/search", searchCoffeeShop, (req, res) => {});

app.get("/find", findCoffeeShops, (req, res) => {});

app.get("/findusers", findUsers, (req, res) => {});

app.post("/myshops", findMyShops, (req, res) => {});

app.post("/stamp", storeStamps, (req, res) => {});

app.get("/coffeeshop/:id", async (req, res) => {
  let coffeeshop = await db.one(
    `SELECT * FROM coffeeshops where id = '${req.params.id}'`
  );
  res.send(coffeeshop);
});

app.post("/myrewards", async (req, res) => {
  let rewards = await db.manyOrNone(
    `SELECT * FROM rewards where visitor_id = '${req.body.id}'`
  );
  res.send(rewards);
});

app.post("/getshop", async (req, res) => {
  let shop = await db.oneOrNone(
    `SELECT * FROM coffeeshops where id = '${req.body.coffeeshop_id}'`
  );
  res.send(shop);
});

app.post("/yourvisits", fetchYourVisits, (req, res) => {});
app.listen(5000);
