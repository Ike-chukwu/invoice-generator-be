const Invoice = require("../model/Invoice");
const Item = require("../model/Item");

//address for cases whee the draft was empty and when you want to save,draft becomes full or save as pending becomes full with ites and style email template
const updateInvoiceStatusController = async (req, res) => {
  try {
    const { itemsList = [], ...invoiceData } = req.body;

    const foundInvoice = await Invoice.findOne({ _id: req.body._id }).lean();

    if (!foundInvoice) {
      return res.status(404).json({
        status: "fail",
        message: "Invoice not found",
      });
    }

    const foundItems = await Item.find({ invoiceId: foundInvoice._id }).lean();

    const idsOfFoundItemsOnTheDb = foundItems.map((item) =>
      item._id.toString()
    );

    const incomingItemIds = itemsList
      .filter((item) => item._id)
      .map((item) => item._id.toString());

    const itemsToBeDeleted = idsOfFoundItemsOnTheDb.filter(
      (id) => !incomingItemIds.includes(id)
    );

    if (itemsToBeDeleted.length) {
      await Item.deleteMany({ _id: { $in: itemsToBeDeleted } });
    }

    const updatedItemList = [];

    for (const item of itemsList) {
      if (item._id) {
        const updatedItem = await Item.findOneAndUpdate(
          { _id: item._id, invoiceId: foundInvoice._id },
          { $set: item },
          { new: true }
        );
        updatedItemList.push(updatedItem);
      } else {
        const newItem = await Item.create({
          ...item,
          invoiceId: foundInvoice._id,
        });
        updatedItemList.push(newItem);
      }
    }

    const invoiceToBeEdited = await Invoice.findOneAndUpdate(
      { _id: req.body._id },
      { $set: invoiceData },
      { new: true }
    );

    const updatedInvoice = {
      ...invoiceToBeEdited.toObject(),
      itemsList: updatedItemList,
    };

    res.status(200).json({
      status: "success",
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "An error occurred while updating the invoice status",
      error: error.message,
    });
  }
};

module.exports = { updateInvoiceStatusController };
