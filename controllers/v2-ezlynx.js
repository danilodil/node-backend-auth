/* eslint-disable linebreak-style */
/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,consistent-return,camelcase,no-plusplus,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition,camelcase */
 const request = require('request-promise');
 const base64 = require('base-64');
 const configConstant = require('../constants/configConstants').CONFIG;
 const appConstant = require('../constants/appConstant').ezLynx;
 const parser = require('xml2json');
 
 module.exports = {
   createApplicant: async (req, res, next) => {
     const { username } = req.body.decoded_vendor;
     try {
 
       let data = req.body.data;

       console.log(data);

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

       const respJson = JSON.parse(parser.toJson(response));

       const eZLynxUploadResponse = (respJson['soap:Envelope'] && respJson['soap:Envelope']['soap:Body'] && respJson['soap:Envelope']['soap:Body']['UploadFileResponse'] && 
              respJson['soap:Envelope']['soap:Body']['UploadFileResponse']['EZLynxUploadResponse'] && respJson['soap:Envelope']['soap:Body']['UploadFileResponse']['EZLynxUploadResponse']['UploadResponse']);

       if (eZLynxUploadResponse && eZLynxUploadResponse['Name']) {
          eZLynxUploadResponse['Name'] = eZLynxUploadResponse['Name'].includes('EZ') ? eZLynxUploadResponse['Name'].replace('EZ', '') : null;
       }

       const respObj = {
         status: eZLynxUploadResponse && eZLynxUploadResponse.StatusEnum || 'Failed',
         url: eZLynxUploadResponse && eZLynxUploadResponse.URL !== {} && eZLynxUploadResponse.URL || null,
         error: eZLynxUploadResponse && eZLynxUploadResponse.StatusText || 'Failed to parse ez response',
         ezResponse: respJson ? JSON.stringify(respJson) : null,
         lob: eZLynxUploadResponse && eZLynxUploadResponse['Name'] || null,
         username
       }

       if (respObj['error'] === 'Failed to parse ez response') {
         respObj.status = 'Failed';
         respObj.errorType = 'unknown';
       }

       req.session.data = {
         title: 'Contact created successfully',
         body: respObj
       };

       return next();

     } catch (error) {
       console.log(error.error);
       const respJson = JSON.parse(parser.toJson(error.error));

       const eZLynxUploadResponse = (respJson['soap:Envelope'] && respJson['soap:Envelope']['soap:Body'] && respJson['soap:Envelope']['soap:Body']['soap:Fault'] && 
              respJson['soap:Envelope']['soap:Body']['soap:Fault']['soap:Reason'] && respJson['soap:Envelope']['soap:Body']['soap:Fault']['soap:Reason']['soap:Text']
              && respJson['soap:Envelope']['soap:Body']['soap:Fault']['soap:Reason']['soap:Text']['$t']);

       const respObj = {
         status: 'Failed',
         url: null,
         error: eZLynxUploadResponse || 'Failed to parse ez response',
         ezResponse: respJson ? JSON.stringify(respJson) : null,
         errorType: eZLynxUploadResponse.includes('User Authorization') ? 'credentials' : 'unknown',
         username
       }

       req.session.data = {
         title: 'Error creating EZ contact',
         body: respObj
       }

       return next();
     }
   },
 };
