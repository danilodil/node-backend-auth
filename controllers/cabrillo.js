const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const format = require('xml-formatter');
const jsonxml = require('jsontoxml');
const js2xmlparser = require('js2xmlparser');
const configConstant = require('../constants/configConstants').CONFIG;
// const appConstant = require('../constants/appConstant').ezLynx;
const convert = require('xml-js');

const self = module.exports = {
  getToken: async (username, password) => {
    try {
      const data = `grant_type=cr&username=${username}&password=${password}&vendor=XO&api_key=05a156a5ffc24a388352b90b8f339f54`;
      const options = {
        method: 'post',
        body: data,
        json: true,
        url: "https://test.cabgen.com/agents/token",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      if (configConstant.ENV === 'local') {
        options.url = "https://test.cabgen.com/agents/token";
      }

      const response = await request(options);
      return response;
    } catch (error) {
      console.log('Error at Cabrillo token : ', error.stack);
      throw new Error('Failed to retrieved Cabrillo Token.');
    }
  },

  createContact: async (req, res, next) => {
    try {
      const token = await self.getToken(req.body.decoded_vendor.username, req.body.decoded_vendor.password);
      const xmlHead = '<?xml version="1.0" encoding="utf-8"?>';
      console.log('requested Data ####################', JSON.stringify(req.body.data));
      const quoteData = jsonxml(req.body.data);
      console.log('requested Xml ####################', quoteData);

      const xmlBody = xmlHead.concat(quoteData);
      const encodedData = base64.encode(xmlBody);
        const data = {
          Quote: encodedData,
          Vendor: 'XO',
          ApiKey: '05a156a5ffc24a388352b90b8f339f54',
        };
        const options = {
          method: 'post',
          body: data,
          json: true,
          url: "https://test.cabgen.com/agents/bridge/rate",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
          },
        };
        if (configConstant.ENV === 'local') {
          data.ApiKey = '05a156a5ffc24a388352b90b8f339f54';
          options.url = "https://test.cabgen.com/agents/bridge/rate";
        }
        const response = await request(options);
        req.session.data = {
          title: 'Contact created successfully',
          body: response,
        };
        return next();
    } catch (error) {
      // const jsonresponse = convert.xml2json(error.body, {compact: true, spaces: 0});
      console.log('ERROR ###', error.message);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
