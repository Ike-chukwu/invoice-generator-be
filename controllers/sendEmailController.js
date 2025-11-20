const isLocal = process.env.NODE_ENV !== "production";
const chromium = require("@sparticuz/chromium");
const puppeteer = isLocal ? require("puppeteer") : require("puppeteer-core");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");

let browserInstance = null;

async function getBrowser() {
  console.log("getBrowser called, isLocal:", isLocal);

  if (browserInstance) {
    console.log("Reusing existing browser instance");
    return browserInstance;
  }

  if (isLocal) {
    console.log("Launching browser in LOCAL mode");
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } else {
    console.log("Launching browser in PRODUCTION mode");
    console.log("Chromium args:", chromium.args);

    try {
      const executablePath = await chromium.executablePath();
      console.log("Chromium executable path:", executablePath);

      browserInstance = await puppeteer.launch({
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
      });
      console.log("Browser launched successfully");
    } catch (error) {
      console.error("Error launching browser:", error);
      throw error;
    }
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
    console.log("=== generateInvoicePDF started ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("isLocal:", isLocal);

    const templatePath = path.join(
      __dirname,
      "../templates/invoice-template.hbs"
    );
    console.log("Template path:", templatePath);

    console.log("Reading template file...");
    const templateSource = await fs.readFile(templatePath, "utf8");
    console.log(
      "Template file read successfully, length:",
      templateSource.length
    );

    console.log("Compiling handlebars template...");
    const template = handlebars.compile(templateSource);
    console.log("Template compiled successfully");

    console.log("Generating HTML from template...");
    const html = template(invoiceData);
    console.log("HTML generated, length:", html.length);

    console.log("Getting browser instance...");
    const browser = await getBrowser();
    console.log("Browser instance obtained");

    console.log("Creating new page...");
    const page = await browser.newPage();
    console.log("New page created");

    console.log("Setting page content...");
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    console.log("Page content set successfully");

    console.log("Generating PDF...");
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
    console.log("PDF generated successfully, size:", pdfBuffer.length, "bytes");

    console.log("Closing page...");
    await page.close();
    console.log("Page closed");

    return pdfBuffer;
  } catch (error) {
    console.error("=== ERROR in generateInvoicePDF ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    throw error;
  }
}

async function sendInvoiceEmail(invoiceData, clientEmail, businessEmail) {
  try {
    console.log("=== sendInvoiceEmail started ===");
    console.log("Client email:", clientEmail);
    console.log("Business email:", businessEmail);
    console.log("Invoice code:", invoiceData.code);

    console.log("Generating PDF...");
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    console.log("PDF generated successfully");

    console.log("Preparing email...");
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: `Invoice ${invoiceData.code} - ${invoiceData.projectDescription}`,
      html: `
        <p>Dear ${invoiceData.clientName},</p>
        <p>Your invoice is attached.</p>
        <p>Sent on behalf of: ${businessEmail}</p>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceData.code}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    console.log("Sending email via nodemailer...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully, messageId:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("=== ERROR in sendInvoiceEmail ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

module.exports = {
  generateInvoicePDF,
  sendInvoiceEmail,
};
