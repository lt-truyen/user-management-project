const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // có thể dùng smtp khác (Outlook, Mailgun, SendGrid...)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

module.exports = transporter;
