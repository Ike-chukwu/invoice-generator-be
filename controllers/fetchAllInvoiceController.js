const User = require("../model/User");
const Invoice = require("../model/Invoice");
const Item = require("../model/Item");

const fetchInvoicesController = async (req, res) => {
  const userEmail = req.email;
  try {
    const foundUser = await User.findOne({ email: userEmail });
    const excludedFields = ["page", "sort", "limit", "fields"];
    const queryObj = { ...req.query };
    excludedFields.forEach((el) => delete queryObj[el]);
    let foundInvoices = [];
    let numberOfInvoices = 0;
    if (queryObj.status === "all") {
      foundInvoices = Invoice.find({
        userId: foundUser._id.toString(),
      });
      numberOfInvoices = await Invoice.countDocuments({
        userId: foundUser._id.toString(),
      });
    } else {
      foundInvoices = Invoice.find({
        userId: foundUser._id.toString(),
        status: queryObj.status,
      });
      numberOfInvoices = await Invoice.countDocuments({
        userId: foundUser._id.toString(),
        status: queryObj.status,
      });
    }

    const limit = req.query.limit * 1 || "6";
    const page = req.query.page * 1 || "1";
    const skip = (page - 1) * limit;
    foundInvoices = await foundInvoices.skip(skip).limit(limit).lean();
    for (let i = 0; i < foundInvoices.length; i++) {
      const foundItems = await Item.find({
        invoiceId: foundInvoices[i]._id.toString(),
      }).lean();
      foundInvoices[i].itemsList = foundItems;
    }
    res.status(200).json({
      status: "success",
      message: "Invoices fetched successfully",
      _metadata: {
        page,
        perpage: limit,
        page_count: Math.ceil(numberOfInvoices / limit),
        total_count: numberOfInvoices,
      },
      data: {
        invoices: foundInvoices,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: "fail",
      message: "Invoices could not be fetched",
    });
  }
};

module.exports = { fetchInvoicesController };
