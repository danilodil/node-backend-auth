/* eslint-disable linebreak-style */
/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,consistent-return,camelcase,no-plusplus,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition,camelcase */

const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const format = require('xml-formatter');
const stringSimilarity = require('string-similarity');
const convert = require('xml-js');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').ezLynx;
const ezHelper = require('./helpers/ezlynx');

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;

      const type = req.params.type;
      const client = req.body.client;

      let data = '';
      if (type === 'auto') {
        data = await ezHelper.returnAutoData(client);
      } else if (type === 'home') {
        data = await ezHelper.returnHomeData(client);
      } else if (type === 'commercial') {
        // data = await ezHelper.returnCommercialData(client);
      }

      if (data === '') {
        return next(Boom.badRequest('Error creating EZLynx file. Type not supplied or error parsing client'));
      }

      const newData = `<Applicant>
      <ApplicantType>Applicant</ApplicantType>
      <PersonalInfo>
        <Name>
          <FirstName>Test</FirstName>
          <LastName>User</LastName>
        </Name>
        <DOB>12/16/1993</DOB>
        <Gender>Male</Gender>
      </PersonalInfo>
      <Address>
        <AddressCode>StreetAddress</AddressCode>
        <Addr1>
          <StreetName>Humphreys Drive</StreetName>
          <StreetNumber>216</StreetNumber>
        </Addr1>
        <City>Rising Sun-Lebanon</City>
        <StateCode>DE</StateCode>
        <Zip5>19934</Zip5>
        <Phone>
          <PhoneType>Home</PhoneType>
          <PhoneNumber>3026075611</PhoneNumber>
        </Phone>
        <Email>test@email.com</Email>
      </Address>
    </Applicant>`;

      const jsXML = convert.xml2js(newData);

      console.log(jsXML);

      const xmlData = convert.js2xml(jsXML);

      console.log(xmlData);

      const xml_head = `<?xml version="1.0" encoding="utf-8"?> <EZ${req.params.type.toUpperCase()} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/${req.params.type}/V200">`;
      const xml_body = xml_head.concat(xmlData, `</EZ${req.params.type.toUpperCase()}>`);

      console.log('DATA ###', xml_body);

      const encodedData = base64.encode(xml_body);

      const xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
      const xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="4"><v100:FileData Name="EZ${req.params.type}" MimeType="text/xml">`;
      const xml_soap_body_close = '</v100:FileData> </v100:UploadRequest> </v100:EZLynxUploadRequest> </tem:UploadFile> </soap:Body></soap:Envelope>';
      const xml_string = xml_authentication_header.concat(xml_soap_body_opens, encodedData, xml_soap_body_close);

      console.log(xml_string);


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
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
