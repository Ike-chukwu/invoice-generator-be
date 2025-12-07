const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  userId: String,
  code: String,
  streetAddressOfBusinessOwner: String,
  cityOfBusinessOwner: String,
  postCodeOfBusinessOwner: String,
  countryOfBusinessOwner: String,
  clientName: String,
  clientEmail: String,
  streetAddressOfClient: String,
  cityOfClient: String,
  postCodeOfClient: String,
  countryOfClient: String,
  dueDate: String,
  invoiceDate: String,
  // paymentTerms: String,
  projectDescription: String,
  status: String,
  currency: String,
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
