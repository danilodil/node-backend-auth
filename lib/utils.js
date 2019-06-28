/* eslint-disable no-restricted-syntax, no-param-reassign */

// const debug = require('debug')('xilo-auth:Utils');

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
