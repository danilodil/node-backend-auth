/* eslint-disable linebreak-style */
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

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;

      function returnXmlWithCoApplicant(data) {
        const coAppObj = { Applicant: data.CoApplicant };
        const coAppString = jsonxml(coAppObj);
        delete data.CoApplicant;
        const xmlString = jsonxml(data);
        if (xmlString.includes('</Applicant>')) {
          const newXmlString = xmlString.replace('</Applicant>', `</Applicant>${coAppString}`);
          return newXmlString;
        }
        return xmlString;
      }

      const data = req.body.data;

      let xmlData;
      
      // Mono-line run
      if (req.params.type === 'Auto' || req.params.type === 'Home') {
        if (req.params.type === 'Auto') {
          xmlData = jsonxml(data);
          if (data.CoApplicant) {
            xmlData = returnXmlWithCoApplicant(data);
          }
        } 
        
        if (req.params.type === 'Home') {
          xmlData = js2xmlparser
            .parse('root', data)
            .split('\n');
          xmlData.splice(0, 2);
          xmlData.splice(-1, 1);
          xmlData = xmlData.join('\n');
          if (data.CoApplicant) {
            xmlData = returnXmlWithCoApplicant(data);
          }
        }

        const xml_head = `<?xml version="1.0" encoding="utf-8"?> <EZ${req.params.type.toUpperCase()} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/${req.params.type}/V200">`;
        const xml_body = xml_head.concat(xmlData, `</EZ${req.params.type.toUpperCase()}>`);
  
        const encodedData = base64.encode(xml_body);
  
        const xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
        const xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="4"><v100:FileData Name="EZ${req.params.type}" MimeType="text/xml">`;
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
        }

        console.log(response);
  
        req.session.data = {
          title: 'Contact created successfully',
          body: newResponse,
          fullBody: response,
          url,
          xml: format(xml_body),
          json: data,
        };
        return next();
      } else {
        // Bundle run
        let autoResponse = null;
        let autoUrl = 'Upload Failed';
        let newAutoResponse = null;

        let homeResponse = null;
        let homeUrl = 'Upload Failed';
        let newHomeResponse = null;

        if (req.body.homeData) {
          const homeData = req.body.homeData;
          let homeXmlData = js2xmlparser
            .parse('root', homeData)
            .split('\n');
          homeXmlData.splice(0, 2);
          homeXmlData.splice(-1, 1);
          homeXmlData = homeXmlData.join('\n');
          if (homeData.CoApplicant) {
            homeXmlData = returnXmlWithCoApplicant(homeData);
          }

          const homeXml_head = '<?xml version="1.0" encoding="utf-8"?> <EZHOME xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/Home/V200">';
          let homeXml_body = homeXml_head.concat(homeXmlData, '</EZHOME>');
          
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
  
          homeResponse = await request(home_options);
    
          if (homeResponse.includes('Failed')) {
            newHomeResponse = 'Failed';
          } else {
            newHomeResponse = 'Succeeded';
          }
    
          if (homeResponse && homeResponse.includes('Succeeded') && homeResponse.match(/<URL>(.*)<\/URL>/)) {
            homeUrl = homeResponse.match(/<URL>(.*)<\/URL>/)[1];
          }
        }
        if (req.body.autoData) {
          const autoData = req.body.autoData;
  
          let autoXmlData = jsonxml(autoData);
  
          if (autoData.CoApplicant) {
            autoXmlData = returnXmlWithCoApplicant(autoData);
          }
  
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
  
          autoResponse = await request(auto_options);
          let newAutoResponse = 'Failed';
    
          if (autoResponse.includes('Failed')) {
            newAutoResponse = 'Failed';
          } else {
            newAutoResponse = 'Succeeded';
          }
    
          if (autoResponse && autoResponse.includes('Succeeded') && autoResponse.match(/<URL>(.*)<\/URL>/)) {
            autoUrl = autoResponse.match(/<URL>(.*)<\/URL>/)[1];
          }
        }

        console.log('HOME DATA ###: ', homeResponse)

        req.session.data = {
          title: 'Contact created successfully',
          auto: { response: autoResponse, url: autoUrl },
          home: { response: homeResponse, url: homeUrl },
          body: newAutoResponse ? newAutoResponse : newHomeResponse ? newHomeResponse : null,
        };
        return next();
      }
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
