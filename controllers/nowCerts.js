/* eslint-disable no-inner-declarations, consistent-return, no-console,
 no-param-reassign, no-use-before-define */

const request = require('request-promise');
const Boom = require('boom');

const appConstant = require('../constants/appConstant').nowCerts;

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const params = req.body.autoData;

      const authResponse = await authenticate();
      const insuredResponse = await insured();
      const driverResponse = await drivers();
      const vehicleResponse = await vehicles();
      const propertyResponse = await property();

      async function authenticate() {
        try {
          const authData = `grant_type=password&username=${username}&password=${password}&client_id=ngAuthApp`;
          const options = {
            method: 'POST',
            url: appConstant.AUTHENTICATE_URL,
            body: authData,
          };
          const response = await request(options).catch(error => next(error));
          const authRes = JSON.parse(response);
          return authRes;
        } catch (error) {
          return next(error);
        }
      }

      async function insured() {
        try {
          const options = {
            method: 'POST',
            url: appConstant.INSURED_URL,
            headers: { Authorization: `${authResponse.token_type} ${authResponse.access_token}` },
            body: params.data.insured,
            json: true,
          };
          const response = await request(options).catch(error => next(error));
          return response;
        } catch (error) {
          return next(error);
        }
      }

      async function drivers() {
        try {
          const driverData = await params.data.driversList.map((oneDriver) => {
            oneDriver.insured_database_id = insuredResponse.insuredDatabaseId;
            return oneDriver;
          });

          const options = {
            method: 'POST',
            url: appConstant.DRIVERS_URL,
            headers: { Authorization: `${authResponse.token_type} ${authResponse.access_token}` },
            body: driverData,
            json: true,
          };

          const response = await request(options).catch(error => next(error));
          return response;
        } catch (error) {
          return next(error);
        }
      }

      async function vehicles() {
        try {
          const vehicleData = await params.data.vehicleList.map((oneVehicle) => {
            oneVehicle.insured_database_id = insuredResponse.insuredDatabaseId;
            return oneVehicle;
          });

          const options = {
            method: 'POST',
            url: appConstant.VEHICLES_URL,
            headers: { Authorization: `${authResponse.token_type} ${authResponse.access_token}` },
            body: vehicleData,
            json: true,
          };

          const vehicleRes = await request(options).catch(error => next(error));
          return vehicleRes;
        } catch (error) {
          return next(error);
        }
      }

      async function property() {
        try {
          params.data.propertyData.insured_database_id = insuredResponse.insuredDatabaseId;
          const options = {
            method: 'POST',
            url: appConstant.PROPERTY_URL,
            headers: { Authorization: `${authResponse.token_type} ${authResponse.access_token}` },
            body: params.data.propertyData,
            json: true,
          };

          const propertyRes = await request(options).catch(error => next(error));
          return propertyRes;
        } catch (error) {
          return next(error);
        }
      }

      req.session.data = {
        title: 'Contact created successfully',
        authResponse,
        insuredResponse,
        driverResponse,
        vehicleResponse,
        propertyResponse,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Failed to contact'));
    }
  },
};
