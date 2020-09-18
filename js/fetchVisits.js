//logic to fetch visits 
const fetchYourVisits = async (db, req, res) => {
    let result = await db.manyOrNone(
      `SELECT * FROM visits WHERE visitor_id='${req.body.id}'`
    );
    res.send(result);
  };

  module.exports = fetchYourVisits