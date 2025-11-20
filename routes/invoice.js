const express = require("express");
const router = express.Router();
const createInvoice = require("../controllers/createInvoiceController");
const fetchInvoice = require("../controllers/fetchAllInvoiceController");
const editInvoice = require("../controllers/editInvoice");
const deleteInvoice = require("../controllers/deleteController");

const verifyJwt = require("../config/verifyJwt");
router
  .route("/")
  .post(verifyJwt, createInvoice.createInvoiceController)
  .get(verifyJwt, fetchInvoice.fetchInvoicesController)
  .patch(verifyJwt, editInvoice.editInvoiceController)
  .delete(verifyJwt, deleteInvoice.deleteInvoiceController);
module.exports = router;
