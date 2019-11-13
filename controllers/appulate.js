/* eslint-disable no-console */

const request = require('request-promise');
const Boom = require('boom');
const appConstant = require('../constants/appConstant').appulate;

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;

      if (!req.body.zipFilebuffer) {
        return next(Boom.badData('Invalid Data'));
      }
      const options = {
        method: 'POST',
        url: appConstant.UPLOAD_API_URL,
        json: true,
        body: {
          Credentials: {
            Email: username,
            Password: password,
          },
          Content: req.body.zipFilebuffer,
        },
      };
      const response = await request(options);
      req.session.data = {
        title: 'Contact created successfully',
        response,
      };
      return next();
    } catch (error) {
      console.log('error', error);
      return next(Boom.badRequest('Failed to contact'));
    }
  },
};
