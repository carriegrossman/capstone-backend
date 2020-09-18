const bcrypt = require("bcrypt");

//logic to create an owner
const createOwner = async (db, req, res) => {
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
  };

  module.exports = createOwner