const User = require("../model/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and Password fields must be filled" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      status: "fail",
      message: "A user with this email already exists",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email, password: hashedPassword });

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: {
      user: newUser,
    },
  });
};

module.exports = { registerUser };
