 //find coffee shopsg
 const findCoffeeShops = async (db, req, res) => {
    let result = await db.any(`SELECT * FROM coffeeshops`);
    res.send(result);
  };
  
  module.exports = findCoffeeShops