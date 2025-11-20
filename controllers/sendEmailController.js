const isLocal = process.env.NODE_ENV !== "production";
const chromium = require("@sparticuz/chromium");
const puppeteer = isLocal ? require("puppeteer") : require("puppeteer-core");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");

let browserInstance = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;

  if (isLocal) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } else {
    browserInstance = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  return browserInstance;
}

// Updated transporter with better timeout settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,      // 60 seconds
  logger: true,              // Enable logging
  debug: true                // Show debug info
});

async function generateInvoicePDF(invoiceData) {
  try {
    console.log("=== generateInvoicePDF started ===");
    
    const templatePath = path.join(
      __dirname,
      "../templates/invoice-template.hbs"
    );

    const templateSource = await fs.readFile(templatePath, "utf8");
    const template = handlebars.compile(templateSource);
    const html = template(invoiceData);

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });

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
    console.log("PDF generated successfully");
    return pdfBuffer;
  } catch (error) {
    console.error("=== ERROR in generateInvoicePDF ===");
    console.error("Error:", error.message);
    throw error;
  }
}

async function sendInvoiceEmail(invoiceData, clientEmail, businessEmail) {
  try {
    console.log("=== sendInvoiceEmail started ===");
    console.log("Generating PDF...");
    
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    console.log("PDF generated, size:", pdfBuffer.length, "bytes");

    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("SMTP connection verified successfully");

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

    console.log("Sending email to:", clientEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully, messageId:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("=== ERROR in sendInvoiceEmail ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    throw error;
  }
}

module.exports = {
  generateInvoicePDF,
  sendInvoiceEmail,
};