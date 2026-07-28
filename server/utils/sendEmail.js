import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || 'user',
      pass: process.env.SMTP_PASSWORD || 'pass',
    },
  });

  // Construct the email message
  const message = {
    from: `${process.env.FROM_NAME || 'ERED BLOO'} <${process.env.FROM_EMAIL || 'noreply@eredbloo.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML version
  };

  // Send the email
  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
