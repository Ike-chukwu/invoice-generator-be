const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJwtController = (req, res, next) => {
  const header = req.headers["authorization"];

  if (!header) {
    return res.status(401).json({ message: "Unauthorized user." });
  }
  const accessToken = header.split(" ")[1];

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.email = decoded.email;
    next();
  });
};

module.exports = verifyJwtController;
