const Invoice = require("../model/Invoice");

const updateInvoiceStatusController = async (req, res) => {
  try {
    const { itemsList, ...invoiceData } = req.body;
    const id = req.body._id;
    const invoiceToBeEdited = await Invoice.findOneAndUpdate(
      { _id: id },
      {
        $set: { ...invoiceData },
      },
      { new: true }
    );
    const updatedInvoice = {
      ...invoiceToBeEdited,
      itemsList,
    };
    res.status(201).json({
      status: "201",
      message: "Invoice fetched successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    res.status(400).json({
      status: "400",
      message: "An error occurred while updating the invoice status",
      error: error.message,
    });
  }
};

module.exports = { updateInvoiceStatusController };
