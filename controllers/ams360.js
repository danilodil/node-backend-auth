/* eslint-disable linebreak-style */
/* eslint-disable no-console, no-param-reassign, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const request = require('request-promise');
const Boom = require('boom');
const convert = require('xml-js');
const format = require('xml-formatter');
const appConstant = require('../constants/appConstant').ams360;

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username, password, agency } = req.body.decoded_vendor;

      const authBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <AgencyNo xmlns="http://www.WSAPI.AMS360.com/v2.0">${agency}</AgencyNo><LoginId xmlns="http://www.WSAPI.AMS360.com/v2.0">${username}</LoginId><Password xmlns="http://www.WSAPI.AMS360.com/v2.0">${password}</Password>
        </soap:Body>
      </soap:Envelope>`;

      const authOptions = {
        method: 'POST',
        url: appConstant.AUTHENTICATE_URL,
        headers:
        {
          SOAPAction: 'http://www.WSAPI.AMS360.com/v2.0/Authenticate',
          'Content-Type': 'text/xml',
        },
        body: authBody,
      };

      const authResponse = await request(authOptions);
      const authResult = convert.xml2json(authResponse, { compact: true, spaces: 0 });
      const parseAuthRes = JSON.parse(authResult);
      const token = parseAuthRes['soap:Envelope']['soap:Header']['WSAPIAuthToken'].Token._text;
      // const xmlBodyData = jsonxml(req.body.customer);
      const customerXMLHeader = `<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Header><WSAPIAuthToken xmlns="http://www.WSAPI.AMS360.com/v2.0"><Token>${token}</Token></WSAPIAuthToken></soap12:Header>`;
      const customerXMLBody = '<soap12:Body> <InsertCustomer_Request xmlns="http://www.WSAPI.AMS360.com/v2.0"> <Customer> <CustomerNumber>11111</CustomerNumber><LastName>User2</LastName><FirstName>Test</FirstName><AddressLine1>969 Market St</AddressLine1><AddressLine2>603</AddressLine2><City>San Diego</City><State>CA</State><County>San Diego County</County><ZipCode>92101</ZipCode><HomeAreaCode>302</HomeAreaCode><HomePhone>6075611</HomePhone><Email>test@email.com</Email><WebAddress>www.xilo.io</WebAddress><Occupation>Other</Occupation><MaritalStatus>Single</MaritalStatus><DoingBusinessAs>XILO</DoingBusinessAs><FederalTaxIdNumber>11111111</FederalTaxIdNumber><CustomerType>S</CustomerType><IsActive>true</IsActive><AccountExecCode>!%,</AccountExecCode><AccountRepCode>!$Z</AccountRepCode></Customer></InsertCustomer_Request></soap12:Body> </soap12:Envelope>';
      const customerXMLString = customerXMLHeader.concat(customerXMLBody);

      const addCustomerOptions = {
        method: 'POST',
        url: appConstant.CUSTOMER_URL,
        headers:
        {
          SOAPAction: 'http://www.WSAPI.AMS360.com/v2.0/InsertCustomer',
          'Content-Type': 'text/xml',
        },
        body: customerXMLString,
      };

      const customerResponse = await request(addCustomerOptions);

      req.session.data = {
        title: 'Contact created successfully',
        customerResponse: format(customerResponse),
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
