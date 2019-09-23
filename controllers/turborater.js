const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const format = require('xml-formatter');
const jsonxml = require('jsontoxml');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').turborater;
const convert = require('xml-js');

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;
      if (req.body.runBoth) {
        const homeData = req.body.homeData;
        const homeXmlData = jsonxml(homeData);

        const homeXml_head = '<?xml version="1.0" encoding="utf-8"?><InsuranceRequest>';
        const homeXml_body = homeXml_head.concat(homeXmlData, '</InsuranceRequest>');
        const home_req = `accountnumber=${appConstant.ACC_NUM}&leadid=2354&data=${homeXml_body}`

        const home_options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          headers:
          {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: home_req,
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
        const auto_req = `accountnumber=${appConstant.ACC_NUM}&leadid=2354&data=${autoXml_body}`

        const auto_options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          headers:
          {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: auto_req,
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
        // const xml__body = '<?xml version="1.0" encoding="utf-8"?><InsuranceRequest><ContactInfo><FirstName>Sample</FirstName><LastName>Sample</LastName><Address>4444 some st</Address><ZipCode>92374</ZipCode><City>Redlands</City><County>San Bernardino</County><State>CA</State><PhoneDay>111-111-1111</PhoneDay><PhoneEve>222-222-2222</PhoneEve><PhoneCell>333-333-3333</PhoneCell><Email>sample@email.com</Email></ContactInfo><AutoInsurance><Vehicles><Vehicle><Id>1</Id><Vin>1HGCG669*YA******</Vin><Year>2000</Year><Make>HONDA</Make><Model>ACCORD</Model><SubModel>SE</SubModel><Owner>Owned</Owner><Garage>Locked</Garage><PrimaryUse>Commute Varies</PrimaryUse><OneWay>40</OneWay><AnnualMileage>10000</AnnualMileage></Vehicle></Vehicles><Drivers><Driver><Id>1</Id><FirstName>Paige</FirstName><LastName>Johnson</LastName><Gender>Female</Gender><Marital>Single</Marital><DOB>1980-07-31</DOB><Relation>Self</Relation><DLicenseState>FL</DLicenseState><DLicenseStatus>Active</DLicenseStatus><LicensedAge>44</LicensedAge><VehicleId>1</VehicleId><Filing>0</Filing><Education>Masters Degree</Education><Occupation>Student</Occupation><Incidents><Ticket><DriverId>1</DriverId><Date>N/A</Date><Description></Description></Ticket><MajorViolation><DriverId>1</DriverId><Date>N/A</Date></MajorViolation><Accident><DriverId>1</DriverId><Date>N/A</Date><Description></Description><PaidAmount></PaidAmount></Accident><Claim><DriverId>1</DriverId><Date>N/A</Date><Description></Description><PaidAmount></PaidAmount></Claim></Incidents></Driver></Drivers><ApplicantInfo><Credit>Good</Credit><IsMilitary>false</IsMilitary></ApplicantInfo><CurrentInsurance><CurrentlyInsured>false</CurrentlyInsured></CurrentInsurance></AutoInsurance></InsuranceRequest>'
        const body_req = `accountnumber=${appConstant.ACC_NUM}&leadid=2354&data=${xml_body}`
        const options = {
          method: 'POST',
          url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
          headers:
          {  
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body_req,
        };
        const response = await request(options);
        const json = convert.xml2json(response, {compact: true, spaces: 1});

        console.log('response', response);
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
