const User = require("../model/User");

const handleLogout = async (req, res) => {
  //on client,delete the accessToken
  const email = req.email;
  if (!email) return res.sendStatus(401);

  //find the user that has the refreshToken that is passed from fe
  const foundUser = await User.findOne({ email });
  if (!foundUser) return res.sendStatus(403);
  console.log(foundUser);
  // delete the ref token from the db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  res.status(201).json({
    status: "success",
    message: "User successfully logged out",
  });
};

module.exports = { handleLogout };
