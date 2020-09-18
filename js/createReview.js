//logic to create review 
const addReview = async (db, req, res) => {
    let insertion = await db.none(
      `INSERT INTO reviews (coffeeshop_id, visitor_id, stars, review) VALUES ($1, $2, $3, $4)`,
      [req.body.coffeeshop_id, req.body.visitor_id, req.body.stars, req.body.review]
    );
  
    let reviews = await db.manyOrNone(
      `SELECT * FROM reviews where coffeeshop_id = '${(req.body.coffeeshop_id)}'`
    );
    res.send(reviews);
  }

  module.exports = addReview