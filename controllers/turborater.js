const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const format = require('xml-formatter');
const jsonxml = require('jsontoxml');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').turborater;

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;
      if (req.body.runBoth) {
        const homeData = req.body.homeData;
        const homeXmlData = jsonxml(homeData);

        const homeXml_head = '<?xml version="1.0" encoding="utf-8"?><InsuranceRequest>';
        const homeXml_body = homeXml_head.concat(homeXmlData, '</InsuranceRequest>');

        const home_options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          headers:
          {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: homeXml_body,
        };

        const homeResponse = await request(home_options);

        let homeUrl = 'Upload Failed';

        if (homeResponse && homeResponse.includes('Succeeded') && homeResponse.match(/<URL>(.*)<\/URL>/)) {
          homeUrl = homeResponse.match(/<URL>(.*)<\/URL>/)[1];
        }

        const autoData = req.body.autoData;

        const autoXmlData = jsonxml(autoData);

        const autoXml_head = '<?xml version="1.0" encoding="utf-8"?><InsuranceRequest>';
        const autoXml_body = autoXml_head.concat(autoXmlData, '</InsuranceRequest>');

        const auto_options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          headers:
          {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: autoXml_body,
        };

        const autoResponse = await request(auto_options);

        let autoUrl = 'Upload Failed';

        if (autoResponse && autoResponse.includes('Succeeded') && autoResponse.match(/<URL>(.*)<\/URL>/)) {
          autoUrl = autoResponse.match(/<URL>(.*)<\/URL>/)[1];
        }

        req.session.data = {
          title: 'Contact created successfully',
          auto: { response: autoResponse, url: autoUrl },
          home: { response: homeResponse, url: homeUrl },
        };
      } else {
        const xmlData = jsonxml(req.body.data);
        const xml_head = '<?xml version="1.0" encoding="utf-8"?><InsuranceRequest>';
        const xml_body = xml_head.concat(xmlData, '</InsuranceRequest>');
        const options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          headers:
          {  
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: xml_body,
        };
        const response = await request(options);
        let newResponse;

        if (response.includes('Failed')) {
          newResponse = 'Failed';
        } else {
          newResponse = 'Succeeded';
        }

        let url = 'Upload Failed';

        if (response && response.includes('Succeeded') && response.match(/<URL>(.*)<\/URL>/)) {
          url = response.match(/<URL>(.*)<\/URL>/)[1];
        }

        req.session.data = {
          title: 'Contact created successfully',
          body: newResponse,
          fullBody: response,
          url,
          xml: format(xml_body),
          json: req.body.data,
        };
      }
      return next();
    } catch (error) {
      console.error('### Error Turborater', error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
