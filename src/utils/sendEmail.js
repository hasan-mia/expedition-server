const nodeMailer = require("nodemailer");
const {
  SMPT_SERVICE,
  SMPT_HOST,
  SMPT_PORT,
  SMPT_MAIL,
  SMPT_PASSWORD,
} = require("../config/constant");

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    service: SMPT_SERVICE,
    host: SMPT_HOST,
    port: SMPT_PORT,
    secure: true,
    auth: {
      user: SMPT_MAIL,
      pass: SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: options.from,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
