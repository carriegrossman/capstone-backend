const bcrypt = require("bcrypt");

//logic to create a user
const createUser = async (db, req, res) => {
    let hash = await bcrypt.hash(req.body.password, saltRounds)
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
  };

  module.exports = createUser