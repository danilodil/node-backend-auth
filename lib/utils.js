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
