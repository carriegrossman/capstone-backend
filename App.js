
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const secretInfo = require("./config.js");
const app = express();
const pgp = require("pg-promise")();
const eS = require("express-session");
const expressSession = eS(secretInfo().secret);

const checkIfExist = require('./js/checkIfExists.js')
const checkIfShopExist = require('./js/checkIfShopExist.js')
const checkIsLoggedIn = require('./js/checkIfLoggedIn.js')
const createOwner = require('./js/createOwner.js')
const addReview = require('./js/createReview.js')
const createShop = require('./js/createShop.js')
const createUser = require('./js/createUser.js')
const fetchYourVisits = require('./js/fetchVisits.js')
const searchCoffeeShop = require('./js/searchCoffeeShop.js')
const storeStamps = require('./js/storeStamps.js')
const updateReward = require('./js/updateRewards.js')
const findCoffeeShops = require('./js/findCoffeeShops.js')
const findMyShops = require('./js/findMyShops')
const findUsers = require('./js/findUsers.js')


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

app.use(passInfo)
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))


//connects to postgres db
const db = pgp(secretInfo().connect);

// seperate pg promise
passport.use(
  new Strategy((username, password, callback) => {
    db.one(`SELECT * FROM users WHERE username='${username}'`)
      .then((u) => {
        bcrypt.compare(password, u.password).then((result) => {
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


app.get(`/`, checkIsLoggedIn, async (req, res) => { });

app.post("/login", passport.authenticate("local"), (req, res) => {
  if (req.user) {
    return res.send({ loggedin: "true", user: req.user });
  }
  res.send({ loggedin: "false" });
});

app.get("/currentUser", checkIsLoggedIn, (req, res) => {
  res.send({ loggedin: "true", user: req.user });
});

app.post("/register", (req,res) => checkIfExist(db, req, res),  (req, res) => createUser(db, req, res));

app.post("/registerowner", (req,res) => checkIfExist(db, req, res),  (req, res) => createOwner(db, req, res));

app.post("/registershop", (req, res )=> createShop(db, req, res));

app.post("/search", (req, res )=> searchCoffeeShop(db, req, res));

app.get("/find", (req, res )=> findCoffeeShops(db, req, res));

app.get("/findusers", (req, res )=> findUsers(db, req, res));

app.post("/myshops", (req, res )=> findMyShops(db, req, res));

app.post("/stamp", (req, res )=> storeStamps(db, req, res));

app.post("/reviews", (req, res )=> addReview(db, req, res));

app.post("/updatereward", (req, res )=> updateReward(db, req, res));

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


app.post("/getvisits", async (req, res) => {
  let visits = await db.manyOrNone(
    `SELECT stamps FROM visits where coffeeshop_id = '${(req.body.coffeeshop_id)}'`
  );
  res.send(visits);
});

app.post("/getreviews", async (req, res) => {
  let reviews = await db.manyOrNone(
    `SELECT * FROM reviews where coffeeshop_id = '${(req.body.coffeeshop_id)}'`
  );
  res.send(reviews);
});

app.post("/getupdates", async (req, res) => {
  let updates = await db.manyOrNone(
    `SELECT * FROM shopUpdates where coffeeshop_id = '${(req.body.coffeeshop_id)}'`
  );
  res.send(updates);
});

app.post("/getstamps", async (req, res) => {

  let stamps = await db.oneOrNone(
    `SELECT * FROM visits where visitor_id = '${(req.body.visitor_id)}' AND coffeeshop_id = '${(req.body.coffeeshop_id)}'`)
  if (stamps === null) {
    let insertion = await db.none(
      `INSERT INTO visits (coffeeshop_id, visitor_id, stamps) VALUES ($1, $2, $3)`, [req.body.coffeeshop_id, req.body.visitor_id, 0])
    let stamps = await db.oneOrNone(
      `SELECT * FROM visits where visitor_id = '${(req.body.visitor_id)}' AND coffeeshop_id = '${(req.body.coffeeshop_id)}'`
    );
    res.send(stamps)
  } else {
    res.send(stamps)
  }
})

app.post("/addupdate", async (req, res)=> {
  let insertion = await db.none(
    `INSERT INTO shopUpdates (coffeeshop_id, date, owner_update) VALUES ($1, $2, $3)`,
    [req.body.coffeeshop_id, req.body.date, req.body.update]
  );

  let updates  = await db.manyOrNone(
    `SELECT * FROM shopUpdates where coffeeshop_id = '${req.body.coffeeshop_id}'`
  );
  res.send(updates);
})
app.post("/yourvisits", (req, res )=> fetchYourVisits(db, req, res));

app.post("/getphotos", async (req, res) => {
  let images = await db.manyOrNone(
    `SELECT * FROM shopImages where coffeeshop_id = '${req.body.coffeeshop_id}'`
  );
  res.send(images)
})
app.post("/uploadphoto", async(req, res) => {
  let insertion = await db.none(
    `INSERT INTO shopImages (coffeeshop_id, imgname, caption, img) VALUES ($1, $2, $3, $4)`,
    [req.body.coffeeshop_id, req.body.imgname, req.body.caption, req.body.base64]
  );


  let images = await db.manyOrNone(
    `SELECT * FROM shopImages where coffeeshop_id = '${req.body.coffeeshop_id}'`
  );
  res.send(images);
});

app.listen(5000);