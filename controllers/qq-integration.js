const ClientOAuth2 = require('client-oauth2')
const request = require('request-promise');
const Boom = require('boom');

const vendorModel = require('../models/vendor');
const appConstant = require('../constants/appConstant').qqCatalyst;

const oAuth2 = new ClientOAuth2({
  clientId: appConstant.CLIENT_ID,
  clientSecret: appConstant.CLIENT_SECRET,
  accessTokenUri: appConstant.ACCESS_TOKEN_URL,
  authorizationUri: appConstant.AUTHORIZE_URL,
  redirectUri: appConstant.CALLBACK_URL,
  scopes: ['']
})

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const path = `/v1/Contacts`;
      const user = await oAuth2.owner.getToken(username, password);
      const options = { method: 'put', url: appConstant.RESOURCE_URL + path, json: req.body.contact };

      await user.refresh();

      const response = await request(user.sign(options));

      req.session.data = {
        title: "Contact created successfully",
        body: response,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating contact!'));
    }
  },
  createPolicy: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const path = `/v1/Policies`;
      const user = await oAuth2.owner.getToken(username, password);
      const options = { method: 'put', url: appConstant.RESOURCE_URL + path, json: true, body: req.body.policy };

      await user.refresh();

      const response = await request(user.sign(options));

      req.session.data = {
        title: "Policy created successfully",
        body: response,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating policy!'));
    }
  },
  createQuote: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const path = `/v1/Policies/${req.params.policyId}/Quotes`;
      const user = await oAuth2.owner.getToken(username, password);
      const options = { method: 'post', url: appConstant.RESOURCE_URL + path, json: true, body: req.body.quote };

      await user.refresh();

      const response = await request(user.sign(options));

      req.session.data = {
        title: "Quote created successfully",
        body: response,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating quote!'));
    }
  },
  createTask: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const path = `/v1/Tasks`;
      const user = await oAuth2.owner.getToken(username, password);
      const options = { method: 'post', url: appConstant.RESOURCE_URL + path, json: true, body: req.body.task };

      await user.refresh();

      const response = await request(user.sign(options));

      req.session.data = {
        title: "Task created successfully",
        body: response,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating task!'));
    }
  },
};
