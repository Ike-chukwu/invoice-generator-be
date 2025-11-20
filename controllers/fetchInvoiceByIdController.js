const Invoice = require("../model/Invoice");
const Item = require("../model/Item");

const fetchInvoiceById = async (req, res) => {
  const invoiceId = req.params.id;
  try {
    const foundInvoice = await Invoice.findOne({ _id: invoiceId }).lean();
    const foundItems = await Item.find({ invoiceId: foundInvoice._id }).lean();
    const invoiceToBeSent = { ...foundInvoice, itemsList: foundItems };
    res.status(201).json({
      status: "201",
      message: "Invoice fetched successfully",
      data: invoiceToBeSent,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "An error occurred",
      error: error.message,
    });
  }
};

module.exports = { fetchInvoiceById };
