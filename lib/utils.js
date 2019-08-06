/* eslint-disable no-restricted-syntax, no-param-reassign */

// const debug = require('debug')('xilo-auth:Utils');
const moment = require('moment');

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
