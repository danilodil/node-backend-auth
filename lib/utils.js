/* eslint-disable no-restricted-syntax, no-param-reassign */

const moment = require('moment');
const nodeMailer = require('nodemailer');
const fs = require('fs');
const juice = require('juice');
const template = require('lodash.template');
const addressParser = require('parse-address');

const APP_CONSTANTS = require('../constants/appConstant');
const configConstant = require('../constants/appConstant').nodeMailer;


exports.parseAddress = (address) => {
  if (!address) {
    return null;
  }
  return addressParser.parseLocation(address);
};

exports.cleanObj = (obj) => {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
      delete obj[propName];
    }
  }
  return obj;
};

exports.formatDate = (d) => {
  if (!d) {
    return '';
  }
  d = new Date(d);
  const month = `0${(d.getMonth() + 1)}`;
  const day = `0${d.getDate()}`;
  const year = d.getFullYear();
  return [month.slice(-2), day.slice(-2), year].join('/');
};


exports.ageCount = (birthDate) => {
  const birthDay = new Date(birthDate) || new Date('01/01/1997');
  const date1 = moment(new Date()).subtract(1, 'days');
  const date2 = moment(birthDay);
  const age = date1.diff(date2, 'years');
  return age;
};

exports.sendSimpleMail = async (toEmail, subject, emailBody) => {
  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: configConstant.EMAIL,
      pass: configConstant.PAW,
    },
  });

  // eslint-disable-next-line consistent-return
  await fs.readFile(APP_CONSTANTS.EMAIL_TEMPLATE.ERROR_LOG, 'utf8', async (fsError, fileData) => {
    if (fsError) {
      return { success: false, message: 'something went wrong please try again' };
    }

    let compiledTemplate = await template(fileData);

    compiledTemplate = await compiledTemplate({ emailBody });
    const htmlData = await juice(compiledTemplate);

    const mailOptions = {
      html: htmlData,
      from: '"XILO Team"',
      to: toEmail,
      subject: !subject ? 'XILO Error log Details' : subject,
    };

    await transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return { success: false, message: 'something went wrong please try again' };
      }
      return { success: true, message: 'email sent successfully' };
    });
  });
  return { success: true, message: 'email sent successfully' };
};
