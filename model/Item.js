const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema({
  invoiceId: String,
  itemName: String,
  itemQuantity: Number,
  itemPrice: Number,
  total: Number,
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
