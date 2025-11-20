const Invoice = require("../model/Invoice");
const Item = require("../model/Item");

const deleteInvoiceController = async (req, res) => {
  try {
    const idOfInvoiceToBeDeleted = req.query.id;
    await Invoice.deleteOne({ _id: idOfInvoiceToBeDeleted });
    await Item.deleteMany({ invoiceId: idOfInvoiceToBeDeleted });
    res.status(201).json({
      status: "204",
      statusText: "Invoice successfully deleted",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "400",
      message: "An error occurred while deleting invoice",
      error: error.message,
    });
  }
};

module.exports = { deleteInvoiceController };
