const Invoice = require("../model/Invoice");
const Item = require("../model/Item");

const duplicateInvoiceController = async (req, res) => {
  try {
    const invoiceToBeDuplicatedId = req.params.id;
    const foundInvoice = await Invoice.findOne({
      _id: invoiceToBeDuplicatedId,
    }).lean();
    const foundItems = await Item.find({
      invoiceId: invoiceToBeDuplicatedId,
    }).lean();
    for (const item of foundItems) {
      delete item._id;
    }
    delete foundInvoice._id;
    const newInvoice = await Invoice.create({
      ...foundInvoice,
      invoiceDate: new Date().toISOString(),
      status: "pending",
      dueDate: new Date(
        new Date().setMonth(new Date().getMonth() + 3)
      ).toISOString(),
    });
    const newItems = [];
    for (const item of foundItems) {
      const newItem = await Item.create({ ...item, invoiceId: newInvoice._id });
      newItems.push(newItem.toObject());
    }

    console.log({ ...newInvoice.toObject(), itemsList: newItems });

    res.status(201).json({
      status: "success",
      message: "Invoice duplicated successfully",
      data: { ...newInvoice.toObject(), itemsList: newItems },
    });
  } catch (error) {
    res.status(400).json({
      status: "400",
      message: "An error occurred while duplicating invoice",
    });
  }
};

module.exports = { duplicateInvoiceController };
