const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// async function generateInvoicePDF(invoiceData) {
//   try {
//     const templatePath = path.join(
//       __dirname,
//       "../templates/invoice-template.hbs"
//     );
//     const templateSource = await fs.readFile(templatePath, "utf8");

//     const template = handlebars.compile(templateSource);
//     const html = template(invoiceData);

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: {
//         top: "20px",
//         right: "20px",
//         bottom: "20px",
//         left: "20px",
//       },
//     });

//     await browser.close();

//     return pdfBuffer;
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     throw new Error("Failed to generate PDF");
//   }
// }

async function sendInvoiceEmail(invoiceData, clientEmail, businessEmail) {
  try {
    // Generate the PDF
    // const pdfBuffer = await generateInvoicePDF(invoiceData);
    const templatePath = path.join(
      __dirname,
      "../templates/invoice-template.hbs"
    );
    const templateSource = await fs.readFile(templatePath, "utf8");

    const template = handlebars.compile(templateSource);
    const html = template(invoiceData);
    
    // Email options
    const mailOptions = {
      from: businessEmail,
      to: clientEmail,
      subject: `Invoice ${invoiceData.code} - ${invoiceData.projectDescription}`,
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    // console.error('Error sending email:', error);
    throw new Error("Failed to send email");
  }
}

module.exports = {
  sendInvoiceEmail,
};

//whats here is behind the github
//the gihub has setup with smtp while this is the inital setup
//comment out the send via email for now then checkout the functionality of it in fe
644