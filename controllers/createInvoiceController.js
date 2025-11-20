const User = require("../model/User");
const Invoice = require("../model/Invoice");
const Item = require("../model/Item");

const createInvoiceController = async (req, res) => {
  try {
    const userEmailFromAccessToken = req.email;
    const foundUser = await User.findOne({ email: userEmailFromAccessToken });
    const { itemsList, ...invoiceData } = req.body;
    const invoiceFromFe = { ...invoiceData, userId: foundUser._id };
    let listOfNewlyCreatedItems = [];
    const newInvoice = await Invoice.create(invoiceFromFe);
    for (let i = 0; i < itemsList.length; i++) {
      const mainItem = itemsList[i];
      const newlyCreatedItem = await Item.create({
        ...mainItem,
        invoiceId: newInvoice._id,
      });
      listOfNewlyCreatedItems.push(newlyCreatedItem.toObject());
    }
    res.status(201).json({
      status: "201",
      message: "Invoice successfully created",
      data: { ...newInvoice.toObject(), itemsList: listOfNewlyCreatedItems },
    });
  } catch (error) {
    res.status(400).json({
      status: "400",
      message: "An error occurred while creating invoice",
      error: error.message,
    });
  }
};

module.exports = { createInvoiceController };
