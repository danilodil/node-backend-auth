const request = require('request-promise');
const Boom = require('boom');
const appConstant = require('../constants/appConstant').quoteRush;


module.exports = {
  createContact: async (req, res, next) => {
    try {
      const options = {
        method: 'POST',
        url: `${appConstant.UPLOAD_PATH}/${req.body.decoded_vendor.username}`,
        body: JSON.stringify(req.body.data),
        headers: {
          'content-type': 'text/plain',
          webpassword: req.body.decoded_vendor.password,
        },
      };

      const response = await request(options);
      let newResponse;

      if (response.includes('Failed')) {
        throw new Error(response);
        // newResponse = 'Failed';
      } else {
        newResponse = 'Succeeded';
      }

      req.session.data = {
        title: 'Contact created successfully',
        body: newResponse,
        fullBody: response,
        json: req.body.data,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
