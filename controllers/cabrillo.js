const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const format = require('xml-formatter');
const jsonxml = require('jsontoxml');
const js2xmlparser = require('js2xmlparser');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').ezLynx;

const self = module.exports = {
  getToken: async (username, password) => {
    try {
      const data = `grant_type=password&username=${username}&password=${password}&client_id=cabgen2`;
      const options = {
        method: 'post',
        body: data,
        json: true,
        url: "https://test.cabgen.com/agents/login",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      if (ENVIRONMENT.ENV === 'local') {
        options.url = "https://test.cabgen.com/agents/login";
      }

      return request(options, (error, response, body) => {
        if (error) {
          return next(Boom.badRequest('Error getting token'));
        }
        return res.status(200)
          .json(body);
      });
    } catch (error) {
      console.log('Error at Cabrillo : ', error.stack);
      return next(Boom.badRequest('Failed to retrieved Cabrillo Token.'));
    }
  },

  createContact: async (req, res, next) => {
    try {
      const token = await self.getToken(req.body.decoded_vendor.username, req.body.decoded_vendor.password);


      if (req.body.runBoth) {
        const homeData = req.body.homeData;
        let homeXmlData = js2xmlparser
          .parse('root', homeData)
          .split('\n');
        homeXmlData.splice(0, 2);
        homeXmlData.splice(-1, 1);
        homeXmlData = homeXmlData.join('\n');

        const homeXml_head = '<?xml version="1.0" encoding="utf-8"?> <EZHOME xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/Home/V200">';
        const homeXml_body = homeXml_head.concat(homeXmlData, '</EZHOME>');

        console.log('HOME DATA ###', homeXml_body);

        const home_encodedData = base64.encode(homeXml_body);

        const home_xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
        const home_xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="4"><v100:FileData Name="EZHome" MimeType="text/xml">`;
        const home_xml_soap_body_close = '</v100:FileData> </v100:UploadRequest> </v100:EZLynxUploadRequest> </tem:UploadFile> </soap:Body></soap:Envelope>';
        const home_xml_string = home_xml_authentication_header.concat(home_xml_soap_body_opens, home_encodedData, home_xml_soap_body_close);

        const home_options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          qs: { WSDL: '' },
          headers:
          {
            SOAPAction: 'http://tempuri.org/UploadFile',
            'Content-Type': 'text/xml',
          },
          body: home_xml_string,
        };

        const homeResponse = await request(home_options);

        // let newHomeResponse;

        if (homeResponse.includes('Failed')) {
          newHomeResponse = 'Failed';
        } else {
          newHomeResponse = 'Succeeded';
        }

        let homeUrl = 'Upload Failed';

        if (homeResponse && homeResponse.includes('Succeeded') && homeResponse.match(/<URL>(.*)<\/URL>/)) {
          homeUrl = homeResponse.match(/<URL>(.*)<\/URL>/)[1];
        }

        console.log(homeResponse);

        const autoData = req.body.autoData;

        const autoXmlData = jsonxml(autoData);

        const autoXml_head = '<?xml version="1.0" encoding="utf-8"?> <EZAUTO xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/Auto/V200">';
        const autoXml_body = autoXml_head.concat(autoXmlData, '</EZAUTO>');

        const auto_encodedData = base64.encode(autoXml_body);

        const auto_xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
        const auto_xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="4"><v100:FileData Name="EZAuto" MimeType="text/xml">`;
        const auto_xml_soap_body_close = '</v100:FileData> </v100:UploadRequest> </v100:EZLynxUploadRequest> </tem:UploadFile> </soap:Body></soap:Envelope>';
        const auto_xml_string = auto_xml_authentication_header.concat(auto_xml_soap_body_opens, auto_encodedData, auto_xml_soap_body_close);

        const auto_options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          qs: { WSDL: '' },
          headers:
          {
            SOAPAction: 'http://tempuri.org/UploadFile',
            'Content-Type': 'text/xml',
          },
          body: auto_xml_string,
        };

        const autoResponse = await request(auto_options);

        let newAutoResponse;

        if (autoResponse.includes('Failed')) {
          newAutoResponse = 'Failed';
        } else {
          newAutoResponse = 'Succeeded';
        }

        let autoUrl = 'Upload Failed';

        if (autoResponse && autoResponse.includes('Succeeded') && autoResponse.match(/<URL>(.*)<\/URL>/)) {
          autoUrl = autoResponse.match(/<URL>(.*)<\/URL>/)[1];
        }

        console.log(autoResponse);

        req.session.data = {
          title: 'Contact created successfully',
          auto: { response: autoResponse, url: autoUrl },
          home: { response: homeResponse, url: homeUrl },
          body: newAutoResponse,
        };
        return next();
      }
      const quoteData = jsonxml(req.body.data);

      const xmlHead = '<?xml version="1.0" encoding="utf-8"?>';
      const xmlBody = xmlHead.concat(quoteData);

      const encodedData = base64.encode(xmlBody);

      try {
        const data = {
          Quote: encodedData,
          Vendor: 'XO',
          ApiKey: '05a156a5ffc24a388352b90b8f339f54',
        };

        if (ENVIRONMENT.ENV === 'local') {
          data.ApiKey = '05a156a5ffc24a388352b90b8f339f54';
        }

        const options = {
          method: 'post',
          body: data,
          json: true,
          url: "https://test.cabgen.com/agents/token",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
          },
        };

        if (ENVIRONMENT.ENV === 'local') {
          options.url = "https://test.cabgen.com/agents/token";
        }

        return request(options, (error, response, body) => {
          if (error) {
            return next(Boom.badRequest('Error getting token'));
          }
          return res.status(200)
            .json(body);
        });
      } catch (error) {
        console.log('Error at Cabrillo : ', error.stack);
        return next(Boom.badRequest('Failed to retrieved Cabrillo Rate.'));
      }
      return next();
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
