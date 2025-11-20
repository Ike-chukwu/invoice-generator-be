const jwt = require("jsonwebtoken");
const User = require("../model/User");

require("dotenv").config();
const handleRefreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  //find the user that has the refreshToken that is passed from fe
  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) return res.sendStatus(403);

  //evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.email !== decoded.email) {
      return res.sendStatus(403);
    }
    const accessToken = jwt.sign(
      { email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "3h" }
    );
    return res.json({
      accessToken,
    });
  });
};

module.exports = { handleRefreshToken };
