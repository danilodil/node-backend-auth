/* eslint-disable linebreak-style */
/* eslint-disable no-console, no-param-reassign, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const request = require('request-promise');
const Boom = require('boom');
const Promise = require('bluebird');
const convert = require('xml-js');
const format = require('xml-formatter');
const appConstant = require('../constants/appConstant').ams360;
const jsonxml = require('jsontoxml');

const self = module.exports = {
  authenticate: async (req,res,next) => {
    try {
      const { username, password, agency } = req.body.decoded_vendor;
      // const authBody = `<?xml version="1.0" encoding="utf-8"?>
      // <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
      //   <s:Body>
      //     <Request xmlns="http://www.WSAPI.AMS360.com/v3.0/DataContract">
      //       <AgencyNo>${agency}</AgencyNo>
      //       <LoginId>${username}</LoginId>
      //       <Password>${password}</Password>
      //     </Request>
      //   </s:Body>
      // </s:Envelope>`

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
      }

      const authResponse = await request(authOptions);
      const authResult = convert.xml2json(authResponse, { compact: true, spaces: 0 });
      const parseAuthRes = JSON.parse(authResult);
      const token = parseAuthRes['soap:Envelope']['soap:Header']['WSAPIAuthToken'].Token._text;

      if (token) {
        return token;
      } else {
        return next(Boom.badRequest('Error authenticating AMS360 user. Invalid token'));
      }
    } catch (error) {
      return next(Boom.badRequest('Error authenticating AMS360 user. Method failed'));
    }
  },
  createContact: async (req, res, next) => {
    try {
      const token = await self.authenticate(req,res,next);
      const type = req.params.type;

      if (!token) {
        return next(Boom.badRequest('Error creating ams360 contact. Invalid token'));
      }

      const xmlData = ('<Customer>').concat(jsonxml(req.body.customer), '</Customer>');
      
      const customerXMLHeader = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><WSAPIAuthToken xmlns="http://www.WSAPI.AMS360.com/v2.0"><Token>${token}</Token></WSAPIAuthToken></soap:Header>`;
      const customerXMLBody = `<soap:Body><${type}_Request xmlns="http://www.WSAPI.AMS360.com/v2.0">${xmlData}</${type}_Request></soap:Body></soap:Envelope>`

      const customerXMLString = customerXMLHeader.concat(customerXMLBody);

      const addCustomerOptions = {
        method: 'POST',
        url: appConstant.CUSTOMER_URL,
        headers:
        {
          SOAPAction: `http://www.WSAPI.AMS360.com/v2.0/${type}`,
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
  listAgencyDetails: async(req,res,next) => {
    try {
      const token = await self.authenticate(req,res,next);

      if (!token) {
        return next(Boom.badRequest('Error creating ams360 contact. Invalid token'));
      }

      const detailRequestList = ['GetGLDivisionList', 'GetGLGroupList', 'GetGLDepartmentList', 'GetGLBranchList', 'GetEmployeeList'];
      const listXMLHeader = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><WSAPIAuthToken xmlns="http://www.WSAPI.AMS360.com/v2.0"><Token>${token}</Token></WSAPIAuthToken></soap:Header>`;

      const detailedList = await Promise.all(detailRequestList.map(async (detailRequest) => {
        try {
          const listXMLBody = `<soap:Body><${detailRequest}_Request xmlns="http://www.WSAPI.AMS360.com/v2.0"></${detailRequest}_Request></soap:Body></soap:Envelope>`;
          const listXMLString = listXMLHeader.concat(listXMLBody);

          // GET List
          const options = {
            method: 'POST',
            url: appConstant.CUSTOMER_URL,
            headers:
            {
              SOAPAction: `http://www.WSAPI.AMS360.com/v2.0/${detailRequest}`,
              'Content-Type': 'text/xml',
            },
            body: listXMLString,
          };

          const listResponse = await request(options);

          const listJs = convert.xml2js(listResponse);

          let obj = null;

          if (listJs['elements'] && listJs['elements'][0].elements) {
            const elements = listJs['elements'][0].elements[0].elements[0].elements[0].elements;

            if (detailRequest !== 'GetEmployeeList') {
              obj = elements.map(empl => {
                const code = empl.elements[0].elements[0].text;
                const firstName = empl.elements[2].elements[0].text;
                const lastName = empl.elements[1].elements[0].text;
                return {name: `${firstName} ${lastName}`, code: code};
              });
            } else {
              obj = elements.map(empl => {
                const code = empl.elements[0].elements[0].text;
                const firstName = empl.elements[2].elements[0].text;
                const lastName = empl.elements[1].elements[0].text;
                return {name: `${firstName} ${lastName}`, EmployeeCode: code};
              });
            }
          } else {
          }
          
          return obj;
        } catch(error) {
          return null;
        }
      }));

      if (detailedList && detailedList.length > 3) {
        req.session.data = {
          title: 'AMS360 details retrieved successfully',
          obj: detailedList
        }
        return next();
      } else {
        return next(Boom.badRequest('Error retrieving detailed list'));
      }

    } catch (error) {
      return next(Boom.badRequest('Error listing ams360 details. Method failed'));
    }
  }
};
