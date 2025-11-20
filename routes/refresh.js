const express = require("express");
const router = express.Router();
const refreshTokenController = require("../controllers/refreshToken");

//you can change it to get if post does not work but the idea is to pass the ref token in the body in that axiosInstance
router.post("/", refreshTokenController.handleRefreshToken);

module.exports = router;
