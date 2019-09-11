const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const jsonxml = require('jsontoxml');
const format = require('xml-formatter');
const stringSimilarity = require('string-similarity');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').ezLynx;


module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;
      console.log('username', username)
      req.session.data = {
        title: 'Contact created successfully'
      };
      return next();
    } catch (error) {
        console.error(error);
        return next(Boom.badRequest('Error creating contact'));
    }
  }
}