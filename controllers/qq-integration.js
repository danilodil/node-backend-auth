/* eslint-disable consistent-return, no-console */

const ClientOAuth2 = require('client-oauth2');
const request = require('request-promise');
const Boom = require('boom');

const appConstant = require('../constants/appConstant').qqCatalyst;

const oAuth2 = new ClientOAuth2({
  clientId: appConstant.CLIENT_ID,
  clientSecret: appConstant.CLIENT_SECRET,
  accessTokenUri: appConstant.ACCESS_TOKEN_URL,
  authorizationUri: appConstant.AUTHORIZE_URL,
  redirectUri: appConstant.CALLBACK_URL,
  scopes: [''],
});

module.exports = {
  createContact: async (req, res, next) => {
    let status = 'auth';
    try {
      const { username, password } = req.body.decoded_vendor;
      const path = '/v1/Contacts';
      const user = await oAuth2.owner.getToken(username, password);

      const data = req.body.data;
  
      const options = {
        method: 'put', url: appConstant.RESOURCE_URL + path, json: data,
      };
  
      await user.refresh();
  
      status = 'data';

      const response = await request(user.sign(options))
        .catch(() => next(Boom.badRequest('Error creating contact!')));      
  
      req.session.data = {
        title: 'Contact created successfully',
        obj: response,
      };
      return next();
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest(`Error creating QQ contact. ${status} failed`));
    }
  },
  createPolicy: async (req, res, next) => {
    const { username, password } = req.body.decoded_vendor;
    const path = '/v1/Policies';
    const user = await oAuth2.owner.getToken(username, password);
    const options = {
      method: 'put', url: appConstant.RESOURCE_URL + path, json: true, body: req.body.policy,
    };

    await user.refresh();

    const response = await request(user.sign(options))
      .catch(() => next(Boom.badRequest('Error creating policy!')));

    req.session.data = {
      title: 'Policy created successfully',
      obj: response,
    };
    return next();
  },
  createQuote: async (req, res, next) => {
    const { username, password } = req.body.decoded_vendor;
    const path = `/v1/Policies/${req.params.policyId}/Quotes`;
    const user = await oAuth2.owner.getToken(username, password);
    const options = {
      method: 'post', url: appConstant.RESOURCE_URL + path, json: true, body: req.body.quote,
    };

    await user.refresh();

    const response = await request(user.sign(options))
      .catch(() => next(Boom.badRequest('Error creating quote!')));

    req.session.data = {
      title: 'Quote created successfully',
      obj: response,
    };
    return next();
  },
  createTask: async (req, res, next) => {
    const { username, password } = req.body.decoded_vendor;
    const path = '/v1/Tasks';
    const user = await oAuth2.owner.getToken(username, password);
    const options = {
      method: 'post', url: appConstant.RESOURCE_URL + path, json: true, body: req.body.task,
    };

    await user.refresh();

    const response = await request(user.sign(options))
      .catch(() => next(Boom.badRequest('Error creating quote!')));

    req.session.data = {
      title: 'Task created successfully',
      obj: response,
    };
    return next();
  },
};
