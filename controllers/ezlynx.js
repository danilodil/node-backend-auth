/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,consistent-return,camelcase,no-plusplus,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition,camelcase */
const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const format = require('xml-formatter');
const jsonxml = require('jsontoxml');
const js2xmlparser = require('js2xmlparser');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').ezLynx;
const ezApp = require('../constants/appConstant').commercialEzlynx;
const validator = require('../services/integration-validator');

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;

      function returnXmlWithOtherData(data) {
        let coAppString = null;
        let prevAddressString = null;
        if (data.CoApplicant) {
          const coAppObj = { Applicant: data.CoApplicant };
          coAppString = jsonxml(coAppObj);
          delete data.CoApplicant;
        }
        if (data.Applicant.PreviousAddress) {
          const prevAddressObj = { Address: data.Applicant.PreviousAddress };
          prevAddressString = jsonxml(prevAddressObj);
          delete data.Applicant.PreviousAddress;
        }
        let xmlString = jsonxml(data);
        if (prevAddressString && xmlString.includes('</Address>')) {
          xmlString = xmlString.replace('</Address>', `</Address>${prevAddressString}`);
        }
        if (coAppString && xmlString.includes('</Applicant>')) {
          xmlString = xmlString.replace('</Applicant>', `</Applicant>${coAppString}`);
        }
        return xmlString;
      }

      const data = req.body.data;

      let xmlData;
      if (req.params.type === 'Auto' || req.params.type === 'Home') {
        if (data && data.clientAgentId) {
          delete data.clientAgentId;
        }

        if (req.params.type === 'Auto') {
          xmlData = jsonxml(data);
          if (data.CoApplicant || data.Applicant.PreviousAddress) {
            xmlData = returnXmlWithOtherData(data);
          }
        }

        if (req.params.type === 'Home') {
          xmlData = js2xmlparser
            .parse('root', data)
            .split('\n');
          xmlData.splice(0, 2);
          xmlData.splice(-1, 1);
          xmlData = xmlData.join('\n');
          if (data.CoApplicant || data.Applicant.PreviousAddress) {
            xmlData = returnXmlWithOtherData(data);
          }
        }

        const xml_head = `<?xml version="1.0" encoding="utf-8"?> <EZ${req.params.type.toUpperCase()} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/${req.params.type}/V200">`;
        const xml_body = xml_head.concat(xmlData, `</EZ${req.params.type.toUpperCase()}>`);

        let validations = await validator.validateXML(xml_body, 'ezlynxautoV200');

        if (validations.status) {
          validations = validations.validation;
        } else {
          console.log(validations.error);
        }

        const encodedData = base64.encode(xml_body);

        const uploadFlag = req.query.action === 'update' ? '2' : '4';

        const xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
        const xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="${uploadFlag}"><v100:FileData Name="EZ${req.params.type}" MimeType="text/xml">`;
        const xml_soap_body_close = '</v100:FileData> </v100:UploadRequest> </v100:EZLynxUploadRequest> </tem:UploadFile> </soap:Body></soap:Envelope>';
        const xml_string = xml_authentication_header.concat(xml_soap_body_opens, encodedData, xml_soap_body_close);

        const options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          qs: { WSDL: '' },
          headers:
                 {
                   SOAPAction: 'http://tempuri.org/UploadFile',
                   'Content-Type': 'text/xml',
                 },
          body: xml_string,
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

        if (url && url.toLowerCase().includes('failed')) {
          newResponse = 'Failed';
          url = null;
        }

        req.session.data = {
          title: 'Contact created successfully',
          body: newResponse,
          fullBody: response,
          url,
          xml: format(xml_body),
          json: data,
          validations: (validations && validations.length > 0) ? validations : null,
        };
        return next();
      // eslint-disable-next-line no-else-return
      } else {
        // Bundle run
        let autoResponse = null;
        let autoUrl = 'Upload Failed';
        let newAutoResponse = null;

        let homeResponse = null;
        let homeUrl = 'Upload Failed';
        let newHomeResponse = null;
        let autoValidations = null;
        let homeValidations = null;

        if (req.body.homeData) {
          const homeData = req.body.homeData;
          let homeXmlData = js2xmlparser
            .parse('root', homeData)
            .split('\n');
          homeXmlData.splice(0, 2);
          homeXmlData.splice(-1, 1);
          homeXmlData = homeXmlData.join('\n');
          if (homeData.CoApplicant || homeData.Applicant.PreviousAddress) {
            homeXmlData = returnXmlWithOtherData(homeData);
          }


          const homeXml_head = '<?xml version="1.0" encoding="utf-8"?> <EZHOME xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/Home/V200">';
          const homeXml_body = homeXml_head.concat(homeXmlData, '</EZHOME>');


          homeValidations = await validator.validateXML(homeXml_body, 'ezlynxautoV200');

          if (homeValidations.status) {
            homeValidations = homeValidations.validation;
          } else {
            console.log(homeValidations.error);
          }

          const home_encodedData = base64.encode(homeXml_body);

          const uploadFlag = req.query.action === 'update' ? '2' : '4';

          const home_xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
          const home_xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="${uploadFlag}"><v100:FileData Name="EZHome" MimeType="text/xml">`;
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

          homeResponse = await request(home_options);

          if (homeResponse.includes('Failed')) {
            newHomeResponse = 'Failed';
          } else {
            newHomeResponse = 'Succeeded';
          }

          if (homeResponse && homeResponse.includes('Succeeded') && homeResponse.match(/<URL>(.*)<\/URL>/)) {
            homeUrl = homeResponse.match(/<URL>(.*)<\/URL>/)[1];
          }

          if (homeUrl && homeUrl.toLowerCase().includes('failed')) {
            homeUrl = null;
          }
        }
        if (req.body.autoData) {
          const autoData = req.body.autoData;

          if (autoData && autoData.clientAgentId) {
            delete autoData.clientAgentId;
          }

          let autoXmlData = jsonxml(autoData);

          if (autoData.CoApplicant || autoData.Applicant.PreviousAddress) {
            autoXmlData = returnXmlWithOtherData(autoData);
          }

          const autoXml_head = '<?xml version="1.0" encoding="utf-8"?> <EZAUTO xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/Auto/V200">';
          const autoXml_body = autoXml_head.concat(autoXmlData, '</EZAUTO>');

          console.log(autoXml_body);

          autoValidations = await validator.validateXML(autoXml_body, 'ezlynxautoV200');

          if (autoValidations.status) {
            autoValidations = autoValidations.validation;
          } else {
            console.log(autoValidations.error);
          }

          const auto_encodedData = base64.encode(autoXml_body);

          const uploadFlag = req.query.action === 'update' ? '2' : '4';

          const auto_xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
          const auto_xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="${uploadFlag}"><v100:FileData Name="EZAuto" MimeType="text/xml">`;
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

          autoResponse = await request(auto_options);

          if (autoResponse.includes('Failed')) {
            newAutoResponse = 'Failed';
          } else {
            newAutoResponse = 'Succeeded';
          }

          if (autoResponse && autoResponse.includes('Succeeded') && autoResponse.match(/<URL>(.*)<\/URL>/)) {
            autoUrl = autoResponse.match(/<URL>(.*)<\/URL>/)[1];
          }

          if (autoUrl && autoUrl.toLowerCase().includes('failed')) {
            autoUrl = null;
          }
        }

        req.session.data = {
          title: 'Contact created successfully',
          auto: { response: autoResponse, url: autoUrl, validations: (autoValidations && autoValidations.length && autoValidations.length > 0) ? autoValidations : null },
          home: { response: homeResponse, url: homeUrl, validations: (homeValidations && homeValidations.length && homeValidations.length > 0) ? homeValidations : null },
          // eslint-disable-next-line no-unneeded-ternary
          body: newAutoResponse ? newAutoResponse : newHomeResponse || null,
        };

        return next();
      }
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
  createPersonalApplicant: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;
      const url = configConstant.nodeEnv === 'production' ? ezApp.PROD_URL : ezApp.DEV_URL;
      const ez_user = configConstant.nodeEnv === 'production' ? ezApp.PROD_USERNAME : ezApp.DEV_USERNAME;
      const ez_password = configConstant.nodeEnv === 'production' ? ezApp.PROD_PASSWORD : ezApp.DEV_PASSWORD;
      const app_secret = configConstant.nodeEnv === 'production' ? ezApp.PROD_APP_SECRET : ezApp.DEV_APP_SECRET;
      const auth_options = {
        method: 'POST',
        url: `${url}/authenticate`,
        headers: {
          EZUser: ez_user,
          EZPassword: ez_password,
          EZAppSecret: app_secret,
          EZToken: 'authenticate',
          Accept: 'application/json',
          AccountUsername: username,
        },
        resolveWithFullResponse: true,
      };
      const authenticate = await request(auth_options);

      const action = req.query.ezlynxId ? 'PUT' : 'POST';

      const contact_option = {
        method: action,
        url: `${url}/Applicant/v2`,
        json: true,
        headers: {
          EZToken: authenticate.headers.eztoken,
          EZAppSecret: app_secret,
          Accept: 'application/json',
          AccountUsername: username,
        },
        body: { ...req.body.data, AssignedTo: username },
      };
      const response = await request(contact_option);

      req.session.data = {
        ezlynxId: response,
      };
      return next();
    } catch (error) {
      console.error('EZlynx personal applicant error ##', error.message);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
