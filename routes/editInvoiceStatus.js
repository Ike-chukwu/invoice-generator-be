const express = require("express");
const router = express.Router();
const handleInvoiceStatusController = require("../controllers/editInvoiceStatus");

const verifyJwt = require("../config/verifyJwt");
router
  .route("/")
  .patch(
    verifyJwt,
    handleInvoiceStatusController.updateInvoiceStatusController
  );

module.exports = router;
