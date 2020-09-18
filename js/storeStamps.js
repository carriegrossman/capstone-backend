//logic to store stamps
const storeStamps = async (db, req, res) => {
    let upsert = await db.none(
      `insert into visits (coffeeshop_id, visitor_id, stamps) values ($1, $2, $3)
      on conflict (coffeeshop_id, visitor_id)
      do update set stamps = visits.stamps + 1`, [req.body.coffeeshop_id, req.body.visitor_id, 1])
  
    // let insertion = await db.none(
    //     `INSERT INTO visits (coffeeshop_id, visitor_id, stamps) VALUES ($1, $2, $3)`,[req.body.coffeeshop_id, req.body.visitor_id, 1]
    // );
    let allStamps = await db.oneOrNone(`SELECT * FROM visits where coffeeshop_id = '${req.body.coffeeshop_id}' AND visitor_id = '${req.body.visitor_id}'`);
  
    if (allStamps.stamps % 10 === 0) {
      let upsertRewards = await db.none(`insert into rewards (coffeeshop_id, visitor_id, rewards) values ($1, $2, $3)
          on conflict (coffeeshop_id, visitor_id)
          do update set rewards = rewards.rewards + 1`,
        [req.body.coffeeshop_id, req.body.visitor_id, 1]
      );
    }
    res.send(allStamps);
  };
  module.exports = storeStamps