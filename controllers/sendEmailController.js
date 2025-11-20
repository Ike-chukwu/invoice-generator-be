const isLocal = process.env.NODE_ENV !== "production";
const chromium = require("@sparticuz/chromium");
const puppeteer = isLocal ? require("puppeteer") : require("puppeteer-core");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");

// Create a reusable browser instance (lazy init)
let browserInstance = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;

  if (isLocal) {
    // Local Windows / Mac / Linux machine
    browserInstance = await puppeteer.launch({
      headless: true,
    });
  } else {
    // Serverless deployment
    browserInstance = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  return browserInstance;
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function generateInvoicePDF(invoiceData) {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/invoice-template.hbs"
    );

    const templateSource = await fs.readFile(templatePath, "utf8");
    const template = handlebars.compile(templateSource);
    const html = template(invoiceData);

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await page.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

async function sendInvoiceEmail(invoiceData, clientEmail, businessEmail) {
  try {
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    const mailOptions = {
      from: process.env.EMAIL_USER, // MUST match the authenticated Gmail account
      to: clientEmail,
      subject: `Invoice ${invoiceData.code} - ${invoiceData.projectDescription}`,
      html: `
    <p>Dear ${invoiceData.clientName},</p>
    <p>Your invoice is attached.</p>
    <p>Sent on behalf of: ${businessEmail}</p> <!-- display the business/account owner -->
  `,
      attachments: [
        {
          filename: `Invoice-${invoiceData.code}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    throw new Error("Failed to send email");
  }
}

module.exports = {
  generateInvoicePDF,
  sendInvoiceEmail,
};
