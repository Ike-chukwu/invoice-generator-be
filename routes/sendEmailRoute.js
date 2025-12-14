const express = require("express");
const router = express.Router();
const { sendInvoiceEmail } = require("../controllers/sendEmailController");
const Invoice = require("../model/Invoice");
const Item = require("../model/Item");
const verifyJwt = require("../config/verifyJwt");

router.route("/").post(verifyJwt, async (req, res) => {
  try {
    console.log("=== Send Email Route Started ===");
    console.log("Request body:", req.body);

    const { invoiceId, clientEmail } = req.body;

    if (!invoiceId || !clientEmail) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: invoiceId, clientEmail",
      });
    }

    console.log("Finding invoice:", invoiceId);
    const invoice = await Invoice.findOne({ _id: invoiceId });

    if (!invoice) {
      console.log("Invoice not found");
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    console.log("Invoice found:", invoice.code);

    console.log("Finding items for invoice");
    const items = await Item.find({ invoiceId: invoiceId });

    if (!items || items.length === 0) {
      console.log("No items found");
      return res.status(404).json({
        success: false,
        message: "Please add items to the invoice before sending email",
      });
    }
    console.log("Items found:", items.length);

    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    console.log("Formatting invoice data");
    const invoiceData = {
      code: invoice.code,
      projectDescription: invoice.projectDescription,
      streetAddressOfBusinessOwner: invoice.streetAddressOfBusinessOwner,
      cityOfBusinessOwner: invoice.cityOfBusinessOwner,
      postCodeOfBusinessOwner: invoice.postCodeOfBusinessOwner,
      countryOfBusinessOwner: invoice.countryOfBusinessOwner,
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
      clientName: invoice.clientName,
      streetAddressOfClient: invoice.streetAddressOfClient,
      cityOfClient: invoice.cityOfClient,
      postCodeOfClient: invoice.postCodeOfClient,
      countryOfClient: invoice.countryOfClient,
      clientEmail: clientEmail,
      itemsList: items.map((item) => ({
        itemName: item.itemName,
        itemQuantity: item.itemQuantity,
        itemPrice: item.itemPrice,
        itemTotal: item.itemQuantity * item.itemPrice,
      })),
      grandTotal: items.reduce((acc, item) => {
        return item.itemQuantity * item.itemPrice + acc;
      }, 0),
    };

    console.log("Invoice data formatted, grand total:", invoiceData.grandTotal);

    const userEmail = req.email;
    console.log("Sending email from:", userEmail, "to:", clientEmail);

    console.log("Calling sendInvoiceEmail...");
    const result = await sendInvoiceEmail(invoiceData, clientEmail, userEmail);
    console.log("Email sent successfully");

    res.status(200).json({
      success: true,
      message: "Invoice email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("=== ERROR in send-email route ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);

    res.status(500).json({
      success: false,
      message: "Failed to send invoice email",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
});

module.exports = router;

