const request = require('request-promise');
const Boom = require('boom');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').commercialEzlynx;

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;
      const url = configConstant.nodeEnv === 'production' ? appConstant.PROD_URL : appConstant.DEV_URL;
      const ezUser = configConstant.nodeEnv === 'production' ? appConstant.PROD_USERNAME : appConstant.DEV_USERNAME;
      const ezPassword = configConstant.nodeEnv === 'production' ? appConstant.PROD_PASSWORD : appConstant.DEV_PASSWORD;
      const appSecret = configConstant.nodeEnv === 'production' ? appConstant.PROD_APP_SECRET : appConstant.DEV_APP_SECRET;
      const authOptions = {
        method: 'POST',
        url: `${url}/authenticate`,
        headers: {
          EZUser: ezUser,
          EZPassword: ezPassword,
          EZAppSecret: appSecret,
          EZToken: 'authenticate',
          Accept: 'application/json',
          AccountUsername: username,
        },
        resolveWithFullResponse: true,
      };
      const authenticate = await request(authOptions);
      const contactOption = {
        method: 'POST',
        url: `${url}/Applicant/v2/Commercial`,
        json: true,
        headers: {
          EZToken: authenticate.headers.eztoken,
          EZAppSecret: appSecret,
          Accept: 'application/json',
          AccountUsername: username,
        },
        body: { ...req.body.data, AssignedTo: username },
      };
      const response = await request(contactOption);
      req.session.data = {
        ezlynxId: response,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
