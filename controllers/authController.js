const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password must be provided" });
  }
  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    return res.status(404).json({
      status: "fail",
      message: "This email belongs to no user",
    });
  }
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const accessToken = jwt.sign(
      { email: foundUser.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "3h" }
    );
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    //save refreshToken in db
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    return res.status(200).json({
      message: "User successfully logged in",
      data: {
        accessToken,
        refreshToken,
        email: foundUser.email,
      },
    });
  }
  return res.status(401).json({
    status: "fail",
    message: "Please provide your accurate credentials",
  });
};

module.exports = { authController };
