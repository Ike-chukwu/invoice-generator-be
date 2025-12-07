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

async function generateInvoicePDF(invoiceData) {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/invoice-template.hbs"
    );
    const templateSource = await fs.readFile(templatePath, "utf8");

    const template = handlebars.compile(templateSource);
    const html = template(invoiceData);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

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

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

async function sendInvoiceEmail(invoiceData, clientEmail, businessEmail) {
  try {
    // Generate the PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Email options
    const mailOptions = {
      from: businessEmail,
      to: clientEmail,
      subject: `Invoice ${invoiceData.code} - ${invoiceData.projectDescription}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #373B53; margin-bottom: 20px;">New Invoice from ${businessEmail}</h2>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Dear ${invoiceData.clientName},</p>
          
          <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 20px;">
            Please find attached invoice <strong>${invoiceData.code}</strong> for <strong>${invoiceData.projectDescription}</strong>.
          </p>
          
          <div style="background-color: #F9FAFE; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #373B53;">
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong style="color: #0C0E16;">Invoice Code:</strong> ${invoiceData.code}
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong style="color: #0C0E16;">Invoice Date:</strong> ${invoiceData.invoiceDate}
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong style="color: #0C0E16;">Payment Due:</strong> ${invoiceData.paymentDueDate}
            </p>
            <p style="margin: 8px 0; font-size: 18px; color: #373B53;">
              <strong style="color: #0C0E16;">Amount Due:</strong> <strong>${invoiceData.grandTotal}.00</strong>
            </p>
          </div>
          
          <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 10px;">
            If you have any questions regarding this invoice, please don't hesitate to contact us.
          </p>
          
          <p style="font-size: 14px; color: #555; margin-top: 30px;">
            Thank you for your business!
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888EAF; font-size: 12px; margin: 3px 0;">
              ${invoiceData.streetAddressOfBusinessOwner}, ${invoiceData.cityOfBusinessOwner}
            </p>
            <p style="color: #888EAF; font-size: 12px; margin: 3px 0;">
              ${invoiceData.postCodeOfBusinessOwner}, ${invoiceData.countryOfBusinessOwner}
            </p>
            <p style="color: #888EAF; font-size: 12px; margin: 3px 0;">
              ${businessEmail}
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceData.code}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
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
  generateInvoicePDF,
  sendInvoiceEmail,
};

//whats here is behind the github
//the gihub has setup with smtp while this is the inital setup
//comment out the send via email for now then checkout the functionality of it in fe
