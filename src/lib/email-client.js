const nodemailer = require('nodemailer');

async function main() {
  // Create a test account using Ethereal
  let testAccount = {
    user: 'melvin.vonrueden89@ethereal.email',
    pass: 'XRfCBWRQeY3vzTbEPN'
  }

  // Set up transporter
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
 
  // Send mail
  let info = await transporter.sendMail({
    from: '"Sender Name" <sender@example.com>',
    to: 'recipient@example.com',
    subject: 'Hello',
    text: 'Hello world',
    html: '<b>Hello world</b>',
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

main().catch(console.error);