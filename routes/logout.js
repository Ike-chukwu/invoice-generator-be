const express = require("express");
const router = express.Router();
const logoutHandler = require("../controllers/logoutController.js");
const verifyJwt = require("../config/verifyJwt");

router.route("/").post(verifyJwt, logoutHandler.handleLogout);

module.exports = router;
