const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelocomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.MAIN_MAIL,
    subject: `Thanks for joining in!`,
    text: `Welcome to the app, ${name}. let me now how you get along with the app.`,
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.MAIN_MAIL,
    subject: `We’re sorry to see you leave ${name}!`,
    text: `Hope to see you soon, ${name}. We would like to hear from you why did you leave us.`,
  });
};

module.exports = {
  sendWelocomeEmail,
  sendCancelEmail,
};
