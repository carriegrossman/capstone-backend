 //checks if shop aleady exists
 const checkIfShopExist = async (db, req, res) => {
    let result = await db.oneOrNone(
      `SELECT * FROM users WHERE username='${req.body.username}'`
    );
    result != null ? res.send(`User Already Exists`) : next();
  };

  module.exports = checkIfShopExist