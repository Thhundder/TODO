const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("No token, authorization denied");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      console.log("Token is not valid")
      return res.status(403).json({ msg: "Token is not valid" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
