/* eslint-disable no-inner-declarations, consistent-return, no-console, no-param-reassign, no-use-before-define */

const request = require('request-promise');
const Boom = require('boom');

const appConstant = require('../constants/appConstant').nowCerts;

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const params = req.body.autoData;
      let authResponse;
      let insuredResponse;

      await authenticate();
      await insured();
      await drivers();
      await vehicles();

      async function authenticate() {
        try {
          const authData = `grant_type=password&username=${username}&password=${password}&client_id=ngAuthApp`;
          const options = {
            method: 'POST',
            url: appConstant.AUTHENTICATE_URL,
            body: authData,
          };
          const response = await request(options).catch(error => next(error));
          authResponse = JSON.parse(response);
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
          insuredResponse = await request(options).catch(error => next(error));
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

          const driverResponse = await request(options).catch(error => next(error));
          return driverResponse;
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

          const vehicleResponse = await request(options).catch(error => next(error));
          if (vehicleResponse) {
            req.session.data = {
              title: 'Contact created successfully',
              obj: vehicleResponse,
            };
            return next();
          }
        } catch (error) {
          return next(error);
        }
      }
    } catch (error) {
      return next(Boom.badRequest('Failed to contact'));
    }
  },
};
