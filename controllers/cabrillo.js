const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const configConstant = require('../constants/configConstants').CONFIG;
const convert = require('xml-js');
const { saveRatingFromJob } = require('./rater');

const self = module.exports = {
  getToken: async (username, password) => {
    try {
      const data = `grant_type=cr&username=${username}&password=${password}&vendor=XO&api_key=05a156a5ffc24a388352b90b8f339f54`;
      const options = {
        method: 'post',
        body: data,
        json: true,
        url: 'https://test.cabgen.com/agents/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      if (configConstant.ENV === 'local') {
        options.url = 'https://test.cabgen.com/agents/token';
      }

      const response = await request(options);
      return response;
    } catch (error) {
      console.log('Error at Cabrillo token : ', error.stack);
      throw new Error('Failed to retrieved Cabrillo Token.');
    }
  },

  createContact: async (req, res, next) => {
    const resObj = {};
    try {
      const token = await self.getToken(req.body.decoded_vendor.username, req.body.decoded_vendor.password);
      const xmlHead = '<?xml version="1.0" encoding="utf-8"?>';
      const xmlOptions = { compact: true, ignoreComment: true, spaces: 4 };
      const quoteData = convert.json2xml(req.body.data, xmlOptions);

      const xmlBody = xmlHead.concat(quoteData);
      const encodedData = base64.encode(xmlBody);
      const data = {
        Quote: encodedData,
        Vendor: 'XO',
        ApiKey: '05a156a5ffc24a388352b90b8f339f54',
      };
      const options = {
        method: 'post',
        body: data,
        json: true,
        url: 'https://test.cabgen.com/agents/bridge/rate',
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
      };
      if (configConstant.ENV === 'local') {
        data.ApiKey = '05a156a5ffc24a388352b90b8f339f54';
        options.url = 'https://test.cabgen.com/agents/bridge/rate';
      }
      const response = await request(options);
      const jsonresponse = JSON.parse(convert.xml2json(response, { compact: true, spaces: 4 }));
      req.body.vendorName = req.body.decoded_vendor.vendorName;
      const respObj = {
        status: jsonresponse.Response.Status._text,
        totalPremium: jsonresponse.Response.Results.ACORD.InsuranceSvcRs.DwellFirePolicyQuoteInqRs.QuotedScenario.QuotedPremiumAmt._cdata,
        downPayment: jsonresponse.Response.Results.ACORD.InsuranceSvcRs.DwellFirePolicyQuoteInqRs.QuotedScenario.PaymentPlan.DownPaymentAmt._cdata,
        quoteId: jsonresponse.Response.Results.ACORD.InsuranceSvcRs.DwellFirePolicyQuoteInqRs.QuotedScenario.SavedQuoteID._cdata,
        stepResult: JSON.stringify(jsonresponse),
      };
      saveRatingFromJob(req, respObj).catch(() => console.error('error'));
      req.session.data = {
        title: 'Contact created successfully',
        response: respObj,
      };
      return next();
    } catch (error) {
      console.log('ERROR CABRILLO###', error.message);
      const errObj = {
        status: 'Failed',
        error: error.message,
        stepResult: error,
      };
      saveRatingFromJob(req, errObj).catch(() => console.error('error'));
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
