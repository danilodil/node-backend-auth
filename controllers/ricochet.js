/* eslint-disable linebreak-style */
/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,consistent-return,camelcase,no-plusplus,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition,camelcase */
const request = require('request-promise');
const Boom = require('boom');

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { accessToken } = req.body.decoded_vendor;
      const postUrl = `https://leads.ricochet.me/api/v1/lead/create/xilo?token=${accessToken}`;

      const options = {
        method: 'POST',
        url: postUrl,
        Accept: 'application/json',
        json: true,
        body: req.body.data,
      };

      // TODO SAVE LEAD ID
      /*
        {
          status: true,
          lead_id: 98336677,
          message: 'The lead has no phone number to be called'
        }
      */

      const response = await request(options);

      req.session.data = {
        title: 'Contact created successfully'
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
