const bcrypt = require("bcrypt");

//logic to create shop
const createShop = async (db, req, res) => {
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
    res.send(newShop);
  };
  
  module.exports = createShop