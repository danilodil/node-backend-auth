/* eslint-disable no-nested-ternary, max-len, dot-notation, default-case, no-fallthrough */
const Boom = require('boom');
const jsforce = require('jsforce');

module.exports = {
  addProperty: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${accessToken}`))
      .catch(() => next(Boom.badRequest(`Error creating ${req.body.objectName} on salesforce`)));

    const rets = await conn.sobject(req.body.objectName).create([req.body.sfProperties]);
    if (rets[0].success === false) {
      return next(Boom.badRequest(`Error creating ${req.body.objectName}`, rets[0].errors));
    }

    req.session.data = {
      title: `Salesforce connected and created ${req.body.objectName} successfully`,
      obj: {
        sfAccountId: rets[0].id,
      },
    };
    return next();
  },
  updateProperty: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${accessToken}`))
      .catch(() => next(Boom.badRequest(`Error updating ${req.body.objectName} on salesforce`)));

    const rets = await conn.sobject(req.body.objectName).update([req.body.sfProperties]);
    if (!rets[0].success) {
      return next(Boom.badRequest(`Error updating ${req.body.objectName}`, rets[0].errors));
    }

    req.session.data = {
      title: `Salesforce ${req.body.objectName} updated successfully`,
    };
    return next();
  },

  /*

  OLD SALESFORCE METHODS

  */
  addSFAccount: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { accountData, contactData, insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });

    await conn.login(username, `${password}${accessToken}`)
      .catch(() => next(Boom.badRequest('Error creating account on salesforce!')));

    const rets = await conn.sobject('Account').create([accountData.data]);
    if (rets[0].success === false) {
      return res.status(400).json({
        message: 'Error creating account on salesforce',
        error: rets[0].errors,
      });
    }

    contactData.data.AccountId = rets[0].id;
    const sfContactResponse = await conn.sobject('Contact').create([contactData.data]);
    if (sfContactResponse[0].success === false) {
      return res.status(400).json({
        message: 'Error creating contact on salesforce',
        error: sfContactResponse[0].errors,
      });
    }

    insuranceData.data.CanaryAMSAccount__c = rets[0].id;
    insuranceData.data.CanaryAMSContactforQuote__c = sfContactResponse[0].id;
    const ret2 = await conn.sobject('CanaryAMSInsuranceProduct__c').create([insuranceData.data]);
    if (ret2[0].success === false) {
      return res.status(400).json({
        message: 'Error retrieving account on salesforce',
        error: ret2[0].errors,
      });
    }

    req.session.data = {
      title: 'Salesforce connected and created accounts successfully',
      obj: {
        sfAccountId: rets[0].id,
        sfContactId: sfContactResponse[0].id,
        sfInsuranceId: ret2[0].id,
      },
    };
    return next();
  },
  addSFAccountHome: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { accountData, contactData, insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, `${password}${accessToken}`)
      .catch(() => next(Boom.badRequest('Error creating home account on salesforce!')));

    const rets = await conn.sobject('Account').create([accountData.data]);
    if (rets[0].success === false) {
      return res.status(400).json({
        message: 'Error creating home account on salesforce',
        error: rets[0].errors,
      });
    }

    contactData.data.AccountId = rets[0].id;
    const sfContactResponse = await conn.sobject('Contact').create([contactData.data]);
    if (sfContactResponse[0].success === false) {
      return res.status(400).json({
        message: 'Error creating home contact on salesforce',
        error: sfContactResponse[0].errors,
      });
    }

    insuranceData.data.CanaryAMSAccount__c = rets[0].id;
    insuranceData.data.CanaryAMSContactforQuote__c = sfContactResponse[0].id;
    const ret2 = await conn.sobject('CanaryAMSInsuranceProduct__c').create([insuranceData.data]);
    if (ret2[0].success === false) {
      return res.status(400).json({
        message: 'Error retrieving home account on salesforce',
        error: ret2[0].errors,
      });
    }

    req.session.data = {
      title: 'Salesforce connected and created accounts successfully',
      obj: {
        sfAccountId: rets[0].id,
        sfContactId: sfContactResponse[0].id,
        sfInsuranceId: ret2[0].id,
      },
    };
    return next();
  },
  addSFInsured: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error creating insured on salesforce!')));

    const ret3 = await conn.sobject('CanaryAMSInsured__c').create([insuranceData.data]);
    if (ret3[0].success === false) {
      return res.status(400).json({
        message: 'Error retrieving insured on salesforce',
        error: ret3[0].errors,
      });
    }

    req.session.data = {
      title: 'salesforce connecting successfully',
      obj: {
        sfInsuredId: ret3[0].id,
      },
    };
    return next();
  },
  addSFHomeInsured: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { insuranceData } = req.body;
    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error creating home insured on salesforce!')));

    const ret3 = await conn.sobject('CanaryAMSInsured__c').create([insuranceData.data]);
    if (ret3[0].success === false) {
      return res.status(400).json({
        message: 'Error retrieving home insured on salesforce',
        error: ret3[0].errors,
      });
    }

    req.session.data = {
      title: 'salesforce connecting successfully',
      obj: {
        sfInsuredId: ret3[0].id,
      },
    };
    return next();
  },
  addSFVehicle: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { vehicleData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error creating vehicle on salesforce!')));

    const rets = await conn.sobject('CanaryAMSVehicle__c').create([vehicleData.data]);
    if (rets[0].success === false) {
      return res.status(400).json({
        message: 'Error creating vehicle on salesforce',
        error: rets[0].errors,
      });
    }

    req.session.data = {
      title: 'salesforce connecting successfully',
      obj: {
        sfVehicleId: rets[0].id,
      },
    };
    return next();
  },
  addSFPropertyOld: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { propertyData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error creating property on salesforce!')));

    const rets = await conn.sobject('CanaryAMSProperty__c').create([propertyData.data]);
    if (rets[0].success === false) {
      return res.status(400).json({
        message: 'Error creating property on salesforce',
        error: rets[0].errors,
      });
    }

    req.session.data = {
      title: 'salesforce connecting successfully',
      obj: {
        sfPropertyId: rets[0].id,
      },
    };
    return next();
  },
  addSFViolation: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { violationData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error creating violation on salesforce!')));

    const rets = await conn.sobject('CanaryAMSMVRViolationInformation__c').create([violationData.data]);
    if (rets[0].success === false) {
      return res.status(400).json({
        message: 'Error creating violation on salesforce',
        error: rets[0].errors,
      });
    }
    req.session.data = {
      message: 'SF Violation created successfully',
    };
    return next();
  },
  updateSFAccount: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { accountData, contactData, insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error updating account on salesforce!')));

    const data = await conn.sobject('Account').update([accountData.data]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating account on salesforce',
        error: data[0].errors,
      });
    }

    const data2 = await conn.sobject('Contact').update([contactData.data]);
    if (!data2[0].success) {
      return res.status(400).json({
        message: 'Error updating contact on salesforce',
        error: data2[0].errors,
      });
    }

    const data3 = await conn.sobject('CanaryAMSInsuranceProduct__c').update([insuranceData.data]);
    if (!data3[0].success) {
      return res.status(400).json({
        message: 'Error updating insurance quote on salesforce',
        error: data3[0].errors,
      });
    }
    req.session.data = {
      title: 'SF Account, Contact, and Insurance Quote updated successfully',
    };
    return next();
  },
  updateSFPropertyAccount: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { accountData, contactData, insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error updating property account on salesforce!')));

    const data = await conn.sobject('Account').update([accountData.data]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating account on salesforce',
        error: data[0].errors,
      });
    }

    const data2 = await conn.sobject('Contact').update([contactData.data]);
    if (!data2[0].success) {
      return res.status(400).json({
        message: 'Error updating contact on salesforce',
        error: data2[0].errors,
      });
    }

    const data3 = await conn.sobject('CanaryAMSInsuranceProduct__c').update([insuranceData.data]);
    if (!data3[0].success) {
      return res.status(400).json({
        message: 'Error updating insurance quote on salesforce',
        error: data3[0].errors,
      });
    }

    req.session.data = {
      title: 'SF Account, Contact, and Insurance Quote updated successfully',
    };
    return next();
  },
  updateSFVehicle: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { vehicleData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error updating vehicle on salesforce!')));

    const data = await conn.sobject('CanaryAMSVehicle__c').update([vehicleData.data]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating vehicle on salesforce',
        error: data[0].errors,
      });
    }
    req.session.data = {
      title: 'SF Vehicle updated successfully',
    };
    return next();
  },
  updateSFPropertyOld: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { propertyData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error updating property on salesforce!')));

    const data = await conn.sobject('CanaryAMSProperty__c').update([propertyData.data]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating property on salesforce',
        error: data[0].errors,
      });
    }
    req.session.data = {
      title: 'SF property updated successfully',
    };
    return next();
  },
  updateSFInsured: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error updating insured on salesforce!')));

    const data = await conn.sobject('CanaryAMSInsured__c').update([insuranceData]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating insured on salesforce',
        error: data[0].errors,
      });
    }

    req.session.data = {
      title: 'SF Insured updated successfully',
    };
    return next();
  },
  updateSFHomeInsured: async (req, res, next) => {
    const { username, password, accessToken } = req.body.decoded_vendor;
    const { insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${accessToken}`))
      .catch(() => next(Boom.badRequest('Error updating home insured on salesforce!')));

    const data = await conn.sobject('CanaryAMSInsured__c').update([insuranceData.data]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating home insured on salesforce',
        error: data[0].errors,
      });
    }
    req.session.data = {
      title: 'SF Insured updated successfully',
    };
    return next();
  },
};
