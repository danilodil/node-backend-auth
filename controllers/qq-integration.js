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
    const { username, password } = req.body.decoded_vendor;
    const path = '/v1/Contacts';
    const user = await oAuth2.owner.getToken(username, password);
    const returnValue = async (value) => {
      try {
        if (typeof value !== 'undefined' && value !== 'undefined' && value !== null && value !== 'null') {
          if (value === 'true' || value === true) {
            return 'Yes';
          } if (value === 'false' || value === false) {
            return 'No';
          }
          return value;
        }
        return '';
      } catch (error) {
      }
    };
    const data = {
      ...(await returnValue(req.body.Contact.EntityID) !== '' && { EntityID: await returnValue(req.body.Contact.EntityID) }),
      ...(await returnValue(req.body.Contact.FirstName) !== '' && { FirstName: await returnValue(req.body.Contact.FirstName) }),
      ...(await returnValue(req.body.Contact.LastName) !== '' && { LastName: await returnValue(req.body.Contact.LastName) }),
      ...(await returnValue(req.body.Contact.Phone) !== '' && { Phone: await returnValue(req.body.Contact.Phone) }),
      ...(await returnValue(req.body.Contact.Email) !== '' && { Email: await returnValue(req.body.Contact.Email) }),
      ...(await returnValue(req.body.Contact.Line1) !== '' && { Line1: await returnValue(req.body.Contact.Line1) }),
      ...(await returnValue(req.body.Contact.City) !== '' && { City: await returnValue(req.body.Contact.City) }),
      ...(await returnValue(req.body.Contact.State) !== '' && { State: await returnValue(req.body.Contact.State) }),
      ...(await returnValue(req.body.Contact.Zip) !== '' && { Zip: await returnValue(req.body.Contact.Zip) }),
      ...(await returnValue(req.body.Contact.ContactType) !== '' && { ContactType: await returnValue(req.body.Contact.ContactType) }),
      ...(await returnValue(req.body.Contact.ContactSubType) !== '' && { ContactSubType: await returnValue(req.body.Contact.ContactSubType) }),
      ...(await returnValue(req.body.Contact.Status) !== '' && { Status: await returnValue(req.body.Contact.Status) }),
      ...(await returnValue(req.body.Contact.Country) !== '' && { Country: await returnValue(req.body.Contact.Country) }),
      ...(await returnValue(req.body.Contact.LocationID) !== '' && { LocationID: await returnValue(req.body.Contact.LocationID) }),
    };

    const options = {
      method: 'put', url: appConstant.RESOURCE_URL + path, json: data,
    };

    await user.refresh();

    const response = await request(user.sign(options))
      .catch(() => next(Boom.badRequest('Error creating contact!')));

    req.session.data = {
      title: 'Contact created successfully',
      obj: response,
    };
    return next();
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
