const nodemailer = require('nodemailer');

const emailTemplate = String(fs.readFileSync("../data/email-template.html", { encoding: "utf8" }));

function replaceHtmlString(html, data){
  Object.keys(data).forEach((key, index)=>{
    const replacer = new RegExp("{{"+key+"}}", "g");
    html = html.replace(replacer, data[key]);
  });
  return html.replace(emailTemplate,)
}

const testAccount = {
  user: 'melvin.vonrueden89@ethereal.email',
  pass: 'XRfCBWRQeY3vzTbEPN'
}

const emailClient = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

async function sendEmail(to, content, subject, data){
  let info = await emailClient.sendMail({
    from: '"İSKİ Ekibi" <iski@nodejsworkshop.com>',
    to: to,
    subject: subject,
    text: content,
    html: replaceHtmlString(emailTemplate, data),
  });
  
  const id = info.messageId;
  const url = nodemailer.getTestMessageUrl(info);

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', url);

  return {
    url, id
  }
}

module.exports = {
  sendEmail,
}