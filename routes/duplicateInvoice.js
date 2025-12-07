const express = require("express");
const router = express.Router();
const handleDuplicateInvoiceController = require("../controllers/duplicateInvoiceController");

const verifyJwt = require("../config/verifyJwt");
router
  .route("/:id")
  .post(verifyJwt, handleDuplicateInvoiceController.duplicateInvoiceController);

module.exports = router;
