const express = require("express");
const router = express.Router();
const fetchInvoice = require("../controllers/fetchInvoiceByIdController");

const verifyJwt = require("../config/verifyJwt");
router.route("/:id").get(verifyJwt, fetchInvoice.fetchInvoiceById);
module.exports = router;
