//find shops
  const findMyShops = async (db, req, res) => {
    let result = await db.manyOrNone(
      `SELECT * FROM coffeeshops WHERE owner_id='${req.body.id}'`
    );
    res.send(result);
  };

  module.exports = findMyShops