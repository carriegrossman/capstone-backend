const checkIsLoggedIn = (req, res) => {
    let isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
      return next();
    }
    res.send({ loggedin: "false" });
  };
  
   module.exports = checkIsLoggedIn