//find users
  const findUsers = async (db, req, res) => {
  
    let result = await db.manyOrNone(`SELECT * FROM users`);
    res.send(result);
  };

module.exports = findUsers