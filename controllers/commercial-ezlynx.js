const request = require('request-promise');
const Boom = require('boom');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').commercialEzlynx;

module.exports = {
    createContact: async (req, res, next) => {
        try {
            const { username } = req.body.decoded_vendor;
            const url = configConstant.nodeEnv === 'production' ? appConstant.PROD_URL : appConstant.DEV_URL;
            const ez_user = configConstant.nodeEnv === 'production' ? appConstant.PROD_USERNAME : appConstant.DEV_USERNAME;
            const ez_password = configConstant.nodeEnv === 'production' ? appConstant.PROD_PASSWORD : appConstant.DEV_PASSWORD;
            const app_secret = configConstant.nodeEnv === 'production' ? appConstant.PROD_APP_SECRET : appConstant.DEV_APP_SECRET;
            const auth_options = {
                method: 'POST',
                url: `${url}/authenticate`,
                headers: {
                    EZUser: ez_user,
                    EZPassword: ez_password,
                    EZAppSecret: app_secret,
                    EZToken: 'authenticate',
                    Accept: 'application/json',
                    AccountUsername: username
                },
                resolveWithFullResponse: true
            };
            const authenticate = await request(auth_options);
            const contact_option = {
                method: 'POST',
                url: `${url}/Applicant/v2/Commercial`,
                json: true,
                headers: {
                    EZToken: authenticate.headers.eztoken,
                    EZAppSecret: app_secret,
                    Accept: 'application/json',
                    AccountUsername: username
                },
                body: { ...req.body.data, AssignedTo: username }
            }
            const response = await request(contact_option);
            req.session.data = {
                response
            };
            return next();
        } catch (error) {
            console.error('Commercial ezlynx error ##', error.message);
            return next(Boom.badRequest('Error creating contact'));
        }
    }
}