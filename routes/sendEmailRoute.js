const express = require("express");
const router = express.Router();
const { sendInvoiceEmail } = require("../controllers/sendEmailController");
const Invoice = require("../model/Invoice");
const Item = require("../model/Item");
const verifyJwt = require("../config/verifyJwt");


router.route("/").post(verifyJwt, async (req, res) => {
  try {
    const { invoiceId, clientEmail } = req.body;

   
    if (!invoiceId || !clientEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: invoiceId, clientEmail",
      });
    }

   
    const invoice = await Invoice.findOne({ _id: invoiceId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // 2. Find all items linked to this invoice
    const items = await Item.find({ invoiceId: invoiceId });

    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Please add items to the invoice before sending email",
      });
    }

    // 3. Helper function to add days to a date
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // 4. Format data for the template
    const invoiceData = {
      // Invoice code and description
      code: invoice.code,
      projectDescription: invoice.projectDescription,

      // Business owner address
      streetAddressOfBusinessOwner: invoice.streetAddressOfBusinessOwner,
      cityOfBusinessOwner: invoice.cityOfBusinessOwner,
      postCodeOfBusinessOwner: invoice.postCodeOfBusinessOwner,
      countryOfBusinessOwner: invoice.countryOfBusinessOwner,

      // Dates
      invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      paymentDueDate: addDays(
        invoice.invoiceDate,
        parseInt(invoice.paymentTerms)
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),

      // Client info
      clientName: invoice.clientName,
      streetAddressOfClient: invoice.streetAddressOfClient,
      cityOfClient: invoice.cityOfClient,
      postCodeOfClient: invoice.postCodeOfClient,
      countryOfClient: invoice.countryOfClient,
      clientEmail: clientEmail,

      // Items - map to include calculated totals
      itemsList: items.map((item) => ({
        itemName: item.itemName,
        itemQuantity: item.itemQuantity,
        itemPrice: item.itemPrice,
        itemTotal: item.itemQuantity * item.itemPrice,
      })),

      // Grand total
      grandTotal: items.reduce((acc, item) => {
        return item.itemQuantity * item.itemPrice + acc;
      }, 0),
    };

    const userEmail = req.email;

    const result = await sendInvoiceEmail(invoiceData, clientEmail, userEmail);

    res.status(200).json({
      success: true,
      message: "Invoice email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error in send-email route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send invoice email",
      error: error.message,
    });
  }
});

module.exports = router;
