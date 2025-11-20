const User = require("../model/User");
const Invoice = require("../model/Invoice");
const Item = require("../model/Item");

const editInvoiceController = async (req, res) => {
  try {
    const { itemsList, ...invoiceData } = req.body;
    //update invoice itself
    const id = req.body._id;
    const invoiceToBeEdited = await Invoice.findOneAndUpdate(
      { _id: id },
      {
        $set: { ...invoiceData },
      },
      { new: true }
    );

    //update item
    let updatedItemList = [];

    // Get all existing items for this invoice
    const existingItems = await Item.find({ invoiceId: id }).lean();

    // Determine which existing items should be deleted (not in the updated list)
    const itemIdsFromRequest = itemsList
      .filter((i) => i._id)
      .map((i) => i._id.toString());
    const itemIdsInDB = existingItems.map((i) => i._id.toString());

    const itemsToDelete = itemIdsInDB.filter(
      (idInDB) => !itemIdsFromRequest.includes(idInDB)
    );

    // Delete items removed from the invoice
    if (itemsToDelete.length > 0) {
      await Item.deleteMany({ _id: { $in: itemsToDelete } });
    }

    // Loop through each item from the client
    for (const item of itemsList) {
      if (item._id) {
        // Update existing item
        const updatedItem = await Item.findOneAndUpdate(
          { _id: item._id, invoiceId: id },
          { $set: { ...item } },
          { new: true }
        );

        // If not found (maybe deleted or invalid ID), create new one
        if (!updatedItem) {
          const newItem = await Item.create({ ...item, invoiceId: id });
          updatedItemList.push(newItem.toObject());
        } else {
          updatedItemList.push(updatedItem.toObject());
        }
      } else {
        // Create a new item
        const newItem = await Item.create({ ...item, invoiceId: id });
        updatedItemList.push(newItem.toObject());
      }
    }

    res.status(201).json({
      status: "201",
      message: "Invoice successfully edited",
      data: { ...invoiceToBeEdited.toObject(), itemsList: updatedItemList },
    });
  } catch (error) {
    res.status(400).json({
      status: "400",
      message: "An error occurred while updating the invoice",
      error: error.message,
    });
  }
};

module.exports = { editInvoiceController };
