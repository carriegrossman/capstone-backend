//logic to update rewards 
const updateReward = async (db, req, res) => {
    let decrementReward = await db.none(`UPDATE rewards SET rewards = rewards-1 WHERE visitor_id= ${req.body.id} AND coffeeshop_id ='${req.body.coffeeshop_id}'`)
  
    let rewards = await db.oneOrNone(
      `SELECT * FROM rewards where visitor_id = '${req.body.id}' AND coffeeshop_id ='${req.body.coffeeshop_id}'`)
  
    if (rewards.rewards === 0) {
      let deleted = await db.none(`DELETE FROM rewards where visitor_id = '${req.body.id}' AND coffeeshop_id ='${req.body.coffeeshop_id}' AND rewards = 0`)
    }
  
    res.send(rewards)
  }
  module.exports = updateReward