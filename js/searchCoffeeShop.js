//logic to search coffee shop
const searchCoffeeShop = async (db, req, res) => {
    let result = await db.any(
      `SELECT * FROM users WHERE id='${Number(req.body.id)}'`
    );
    res.send(result);
  };
  

  module.exports = searchCoffeeShop