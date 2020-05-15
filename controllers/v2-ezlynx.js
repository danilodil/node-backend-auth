/* eslint-disable linebreak-style */
/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,consistent-return,camelcase,no-plusplus,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition,camelcase */
 const request = require('request-promise');
 const Boom = require('boom');
 const base64 = require('base-64');
 const configConstant = require('../constants/configConstants').CONFIG;
 const appConstant = require('../constants/appConstant').ezLynx;
 const validator = require('../services/integration-validator');
 
 module.exports = {
   createApplicant: async (req, res, next) => {
     try {
       const { username } = req.body.decoded_vendor;
 
       const data = req.body.data;
        
       if (data && data.clientAgentId) {
         delete data.clientAgentId;
       }

       console.log(data)

       let validations = await validator.validateXML(data, 'ezlynxautoV200');

       if (validations.status) {
         validations = validations.validation;
       } else {
         console.log(validations.error);
       }

       const encodedData = base64.encode(data);

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

       let newResponse = null;
       let url = null;

       if (response.includes('Succeeded') && response.match(/<URL>(.*)<\/URL>/)) {
           url = response.match(/<URL>(.*)<\/URL>/)[1];
           newResponse = 'Succeeded';
       } else {
           url = 'Upload Failed';
           newResponse = 'Failed';
       }

       if (newResponse === 'Failed') {
           console.log(response);
           return next(Boom.badRequest('Error creating EZ applicant. EZLynx rejected push'));
       }

       const bodyData = { body: newResponse, url: url, validations: (validations && validations.length > 0) ? validations : null };
 
       req.session.data = {
         title: 'Contact created successfully',
         body: bodyData
       };

       return next();

     } catch (error) {
       console.log(error);
       return next(Boom.badRequest('Error creating contact'));
     }
   },
 };