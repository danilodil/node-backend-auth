/* eslint-disable no-nested-ternary, max-len, dot-notation, default-case, no-fallthrough */
const Boom = require('boom');
const jsforce = require('jsforce');

module.exports = {
  addProperty: async (req, res, next) => {
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const { accountData, contactData, insuranceData } = req.body;
    
    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });

    await conn.login(username, `${password}${salesforceAT}`)
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

    insuranceData.data.CanaryAMS_Account__c = rets[0].id;
    insuranceData.data.CanaryAMS_Contact_for_Quote__c = sfContactResponse[0].id;
    const ret2 = await conn.sobject('CanaryAMS_Insurance_Product__c').create([insuranceData.data]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const { accountData, contactData, insuranceData } = req.body;
    
    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, `${password}${salesforceAT}`)
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

    insuranceData.data.CanaryAMS_Account__c = rets[0].id;
    insuranceData.data.CanaryAMS_Contact_for_Quote__c = sfContactResponse[0].id;
    const ret2 = await conn.sobject('CanaryAMS_Insurance_Product__c').create([insuranceData.data]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const { insuranceData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error creating insured on salesforce!')));

    const ret3 = await conn.sobject('CanaryAMS_Insured__c').create([insuranceData.data]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const { insuranceData } = req.body;
    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error creating home insured on salesforce!')));

    const ret3 = await conn.sobject('CanaryAMS_Insured__c').create([insuranceData.data]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const { vehicleData } = req.body;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password}${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error creating vehicle on salesforce!')));

    const rets = await conn.sobject('CanaryAMS_Vehicle__c').create([vehicleData.data]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const { client } = req.body.decoded_user;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error creating property on salesforce!')));

    const returnExists = (value) => {
      if (value || value === false) {
        return true;
      }
      return false;
    };

    const address = `${req.body.homes[0].streetNumber} ${req.body.homes[0].streetName}`;
    const sfProperty = {
      Name: address,
      CanaryAMS__Insurance_Product__c: client.sfInsuranceId,
    };
    switch (true) {
      case (returnExists(req.body.homes[0]['city'])):
        sfProperty['CanaryAMS__City__c'] = req.body.homes[0]['city'];
      case returnExists(req.body.homes[0]['state']):
        sfProperty['CanaryAMS__State__c'] = req.body.homes[0].state;
      case returnExists(req.body.homes[0]['zipCode']):
        sfProperty['CanaryAMS__Zip_Code__c'] = req.body.homes[0].zipCode;
      // case (returnExists(req.body.homes[0]['purchasedNew'])):
      //     sfProperty['CanaryAMS__Purchased_New__c'] = req.body.homes[0].purchasedNew;
      case (returnExists(req.body.homes[0]['marketValue'])):
        sfProperty['CanaryAMS__Market_Value__c'] = req.body.homes[0].marketValue;
      case (returnExists(req.body.homes[0]['purchasePrice'])):
        sfProperty['CanaryAMS__Purchase_Price__c'] = req.body.homes[0].purchasePrice;
      // case (returnExists(req.body.homes[0]['purchaseDate'])):
      //     sfProperty['CanaryAMS__Purchase_Date__c'] = convertDateString(req.body.homes[0].purchaseDate);
      // case (returnExists(req.body.homes[0]['estimatedReplacementCost'])):
      //     sfProperty['CanaryAMS__Estimated_Replacement_Cost__c'] = req.body.homes[0].estimatedReplacementCost;
      case (returnExists(req.body.homes[0]['yearBuilt'])):
        sfProperty['CanaryAMS__Year_Built__c'] = req.body.homes[0].yearBuilt;
      case (returnExists(req.body.homes[0]['totalSquareFootage'])):
        sfProperty['CanaryAMS__Square_Feet__c'] = req.body.homes[0]['totalSquareFootage'];
      // case returnExists(req.body.homes[0]['residenceType']):
      //     sfProperty['CanaryAMS__Residence_Type__c'] = req.body.homes[0].residenceType;
      case returnExists(req.body.homes[0]['numOfBeds']):
        sfProperty['CanaryAMS__Number_of_Bedrooms__c'] = req.body.homes[0].numOfBeds;
      case returnExists(req.body.homes[0]['numOfBaths']):
        sfProperty['CanaryAMS__Bath_1_Count__c'] = req.body.homes[0].numOfBaths;
      // case (returnExists(req.body.homes[0]['distanceFromTidalWater'])):
      //     sfProperty['CanaryAMS__Distance_to_Tidal_Water__c'] = req.body.homes[0].distanceFromTidalWater;
      // case (returnExists(req.body['hasGatedCommunity'])):
      //     sfProperty['CanaryAMS__Gated_Community__c'] = req.body.hasGatedCommunity;
      // case (returnExists(req.body['birthDate'])):
      //     sfProperty['CanaryAMS__Garage_Type__c'] = convertDateString(req.body.birthDate);
      // case (returnExists(req.body.homes[0]['driverLicenseNumber'])):
      //     sfProperty['CanaryAMS__Garage_Number_of_Vehicles__c'] = req.body.homes[0].driverLicenseNumber;
      case (returnExists(req.body.homes[0]['primaryUse'])):
        sfProperty['CanaryAMS__Usage_Type__c'] = req.body.homes[0].primaryUse;
      // case (returnExists(req.body.homes[0]['structureType'])):
      //     sfProperty['CanaryAMS__Structure_Type__c'] = req.body.homes[0].structureType;
      case (returnExists(req.body.homes[0]['roofMaterial'])):
        sfProperty['CanaryAMS__Roof_Material__c'] = req.body.homes[0]['roofMaterial'];
      case returnExists(req.body.homes[0]['roofType']):
        sfProperty['CanaryAMS__Roof_Type__c'] = req.body.homes[0].roofType;
      // case returnExists(req.body.homes[0]['hasPets']):
      //     sfProperty['CanaryAMS__Pets__c'] = req.body.homes[0].hasPets;
      case returnExists(req.body.homes[0]['numOfStories']):
        sfProperty['CanaryAMS__NumStories__c'] = req.body.homes[0].numOfStories;
      // case (returnExists(req.body.homes[0]['hasBasement'])):
      //     sfProperty['CanaryAMS__Foundation__c'] = (req.body.homes[0].hasBasement === true ? 'Basement' : '');
      // case (returnExists(req.body.homes[0]['hasPool'])):
      //     sfProperty['CanaryAMS__Pool__c'] = req.body.homes[0].hasPool;
      case (returnExists(req.body.homes[0]['exteriorMaterials'])):
        sfProperty['CanaryAMS__Construction__c'] = req.body.homes[0].exteriorMaterials;
      // case (returnExists(req.body.homes[0]['hasRoofingImprovement'])):
      //     sfProperty['CanaryAMS__Roofing_Improvement__c'] = req.body.homes[0].hasRoofingImprovement;
      // case (returnExists(req.body.homes[0]['roofingImprovementYear'])):
      //     sfProperty['CanaryAMS__RoofingImprovementYear__c'] = req.body.homes[0].roofingImprovementYear;
      // case (returnExists(req.body.homes[0]['hasWindMitigationForm'])):
      //     sfProperty['CanaryAMS__Have_Wind_Mitigation_Form__c'] = req.body.homes[0].hasWindMitigationForm;
      // case (returnExists(req.body.homes[0]['windMitigationInspectionDate'])):
      //     sfProperty['CanaryAMS__Wind_Mitigation_Inspection_Date__c'] = req.body.homes[0].windMitigationInspectionDate;
    }

    const rets = await conn.sobject('CanaryAMS__Property__c').create([sfProperty]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;
    const { client } = req.body.decoded_user;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error creating violation on salesforce!')));

    const name = (req.body.applicantGivenName && req.body.applicantSurname) ? `${req.body.applicantGivenName} ${req.body.applicantSurname}` : '';
    const sfViolation = {
      Name: name,
      CanaryAMS__Accident_Violation_Description__c: req.body.priorPenaltiesText,
      CanaryAMS__Contact__c: client.sfContactId,
      CanaryAMS__Insurance_Quote__c: client.sfInsuranceId,
      CanaryAMS__Insured__c: req.body.sfInsuredId,
    };

    const rets = await conn.sobject('CanaryAMS__MVR_Violation_Information__c').create([sfViolation]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;

    const convertDateString = (date) => {
      if (date) {
        let s = date;
        const n = s.indexOf('T');
        s = s.substring(0, n !== -1 ? n : s.length);
        return s;
      }
      return null;
    };

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error updating account on salesforce!')));

    const returnExists = (value) => {
      if (value || value === false) {
        return true;
      }
      return false;
    };

    const sfAccount = {
      Id: null,
    };
    const sfContact = {
      Id: null,
    };
    const sfInsuranceQuote = {
      Id: null,
    };
    switch (true) {
      case returnExists(req.body['sfAccountId']):
        sfAccount['Id'] = req.body['sfAccountId'];
      case returnExists(req.body['sfContactId']):
        sfAccount['CanaryAMS__Primary_Contact__c'] = req.body['sfContactId'];
        sfContact['Id'] = req.body['sfContactId'];
      case returnExists(req.body['sfInsuranceId']):
        sfInsuranceQuote['Id'] = req.body['sfInsuranceId'];
      case returnExists(req.body['drivers[0].ownOrRent']):
        sfInsuranceQuote['CanaryAMS__Residence_Status__c'] = req.body['drivers[0].ownOrRent'];
      case (returnExists(req.body['vehicles[0].applicantAddrStreetName']) && returnExists(req.body['vehicles[0].applicantAddrStreetNumber'])):
        sfInsuranceQuote['CanaryAMS__Street_Address__c'] = `${req.body['vehicles[0].applicantAddrStreetName']} ${req.body['vehicles[0].applicantAddrStreetNumber']}`;
      case returnExists(req.body['vehicles[0].applicantAddrCity']):
        sfInsuranceQuote['CanaryAMS__City__c'] = req.body['vehicles[0].applicantAddrCity'];
      case returnExists(req.body['vehicles[0].applicantStateCd']):
        sfInsuranceQuote['CanaryAMS__State__c'] = req.body['vehicles[0].applicantStateCd'];
      case returnExists(req.body['vehicles[0].applicantPostalCd']):
        sfInsuranceQuote['CanaryAMS__Zip_Code__c'] = req.body['vehicles[0].applicantPostalCd'];
      // case (returnExists(req.body['vehicles[0].applicantAddrStreetName']) &&
      //     returnExists(req.body['vehicles[0].applicantAddrStreetNumber']) &&
      //     returnExists(req.body['vehicles[0].applicantAddrCity']) &&
      //     returnExists(req.body['vehicles[0].applicantStateCd']) &&
      //     returnExists(req.body['vehicles[0].applicantPostalCd'])):
      //     sfContact['MailingAddress'] = req.body.vehicles[0].applicantAddrStreetName + ' ' +
      //         req.body.vehicles[0].applicantAddrStreetNumber + ' ' +
      //         req.body.vehicles[0].applicantAddrCity + ' ' +
      //         req.body.vehicles[0].applicantStateCd + ' ' +
      //         req.body.vehicles[0].applicantPostalCd;
      case (returnExists(req.body['gender'])):
        sfContact['CanaryAMS__Gender__c'] = (req.body.gender === 'M' ? 'Male' : 'Female');
      case (returnExists(req.body['maritalStatus'])):
        sfContact['CanaryAMS__Marital_Status__c'] = req.body.maritalStatus;
      case (returnExists(req.body['birthDate'])):
        sfContact['Birthdate'] = convertDateString(req.body.birthDate);
      case (returnExists(req.body['drivers[0].driverLicenseNumber'])):
        sfContact['CanaryAMS__License_Number__c'] = req.body['drivers[0].driverLicenseNumber'];
      case (returnExists(req.body['drivers[0].driverLicenseStateCd'])):
        sfContact['CanaryAMS__License_State__c'] = req.body['drivers[0].driverLicenseStateCd'];
    }

    const data = await conn.sobject('Account').update([sfAccount]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating account on salesforce',
        error: data[0].errors,
      });
    }

    const data2 = await conn.sobject('Contact').update([sfContact]);
    if (!data2[0].success) {
      return res.status(400).json({
        message: 'Error updating contact on salesforce',
        error: data2[0].errors,
      });
    }

    const data3 = await conn.sobject('CanaryAMS__Insurance_Product__c').update([sfInsuranceQuote]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;

    const convertDateString = (date) => {
      if (date) {
        let s = date;
        const n = s.indexOf('T');
        s = s.substring(0, n !== -1 ? n : s.length);
        return s;
      }
      return null;
    };

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error updating property account on salesforce!')));

    const returnExists = (value) => {
      if (value || value === false) {
        return true;
      }
      return false;
    };

    const sfAccount = {
      Id: null,
    };
    const sfContact = {
      Id: null,
    };
    const sfInsuranceQuote = {
      Id: null,
    };
    switch (true) {
      case returnExists(req.body['sfAccountId']):
        sfAccount['Id'] = req.body['sfAccountId'];
      case returnExists(req.body['sfContactId']):
        sfAccount['CanaryAMS__Primary_Contact__c'] = req.body['sfContactId'];
        sfContact['Id'] = req.body['sfContactId'];
      case returnExists(req.body['sfInsuranceId']):
        sfInsuranceQuote['Id'] = req.body['sfInsuranceId'];
      case returnExists(true):
        sfInsuranceQuote['CanaryAMS__Residence_Status__c'] = 'Own';
      case (returnExists(req.body['homes[0].streetNumber']) && returnExists(req.body['homes[0].streetName'])):
        sfInsuranceQuote['CanaryAMS__Street_Address__c'] = `${req.body['homes[0].streetNumber']} ${req.body['homes[0].streetName']}`;
      case returnExists(req.body['homes[0].city']):
        sfInsuranceQuote['CanaryAMS__City__c'] = req.body['homes[0].city'];
      case returnExists(req.body['homes[0].state']):
        sfInsuranceQuote['CanaryAMS__State__c'] = req.body['homes[0].state'];
      case returnExists(req.body['homes[0].zipCode']):
        sfInsuranceQuote['CanaryAMS__Zip_Code__c'] = req.body['homes[0].zipCode'];
      // case (returnExists(req.body['homes[0].streetNumber']) &&
      //     returnExists(req.body.homes[0]['streetName']) &&
      //     returnExists(req.body.homes[0]['city']) &&
      //     returnExists(req.body.homes[0]['state']) &&
      //     returnExists(req.body.homes[0]['zipCode'])):
      //     sfContact['MailingAddress'] = req.body.homes[0]['streetNumber'] + ' ' +
      //         req.body.homes[0]['streetName'] + ' ' +
      //         req.body.homes[0]['city'] + ' ' +
      //         req.body.homes[0]['state'] + ' ' +
      //         req.body.homes[0]['zipCode'];
      case (returnExists(req.body['gender'])):
        sfContact['CanaryAMS__Gender__c'] = ((req.body.gender === 'M' || req.body.gender === 'Male') ? 'Male' : 'Female');
      case (returnExists(req.body['maritalStatus'])):
        sfContact['CanaryAMS__Marital_Status__c'] = req.body.maritalStatus;
      case (returnExists(req.body['birthDate'])):
        sfContact['Birthdate'] = convertDateString(req.body.birthDate);
    }

    const data = await conn.sobject('Account').update([sfAccount]);
    if (!data[0].success) {
      return res.status(400).json({
        message: 'Error updating account on salesforce',
        error: data[0].errors,
      });
    }

    const data2 = await conn.sobject('Contact').update([sfContact]);
    if (!data2[0].success) {
      return res.status(400).json({
        message: 'Error updating contact on salesforce',
        error: data2[0].errors,
      });
    }

    const data3 = await conn.sobject('CanaryAMS__Insurance_Product__c').update([sfInsuranceQuote]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error updating vehicle on salesforce!')));

    const returnExists = (value) => {
      if (value || value === false) {
        return true;
      }
      return false;
    };

    const createRatesHtml = (rates) => {
      if (rates) {
        let ratesHtml = `<div class="header">
                                      <h3 class="main-header-title">Rates</h3>
                                  </div>`;
        for (let i = 0; i < rates.length; i += 1) {
          ratesHtml += `<div class="main-header">
                            <div class="form-group">
                              <div class="group">
                                  <div class="info-label-container">
                                      <p class="info-label">${i === 0 ? 'Low' : i === 1 ? 'Good' : i === 2 ? 'Better' : 'Best'} Coverage</p>
                                  </div>
                                  <p class="info">${rates[i].price} /mo.</p>
                              </div>
                            </div>
                          </div>`;
          if (!rates[i + 1]) {
            return ratesHtml;
          }
        }
      }
      return '';
    };

    const sfVehicle = {
      Id: req.body.sfVehicleId,
    };
    switch (true) {
      case returnExists(req.body['vehicleVin']):
        sfVehicle['CanaryAMS__VIN_Number__c'] = req.body.vehicleVin;
      case (returnExists(req.body['vehicleModelYear'])):
        sfVehicle['CanaryAMS__Model_Year__c'] = req.body['vehicleModelYear'];
      case returnExists(req.body['vehicleManufacturer']):
        sfVehicle['CanaryAMS__Make__c'] = req.body.vehicleManufacturer;
      case returnExists(req.body['vehicleModel']):
        sfVehicle['CanaryAMS__Model__c'] = req.body.vehicleModel;
      case (returnExists(req.body['applicantAddrStreetName']) && returnExists(req.body['applicantAddrStreetNumber'])):
        sfVehicle['CanaryAMS__Garage_Address__c'] = `${req.body['applicantAddrStreetNumber']} ${req.body['applicantAddrStreetName']}`;
      case (returnExists(req.body['applicantAddrCity'])):
        sfVehicle['CanaryAMS__Garage_City__c'] = req.body.applicantAddrCity;
      case (returnExists(req.body['applicantStateCd'])):
        sfVehicle['CanaryAMS__Garage_State__c'] = req.body.applicantStateCd;
      case (returnExists(req.body['applicantPostalCd'])):
        sfVehicle['CanaryAMS__Garage_Zip_Code__c'] = req.body.applicantPostalCd;
      case (returnExists(req.body['driverName'])):
        sfVehicle['CanaryAMS__Governing_Driver__c'] = req.body.driverName;
      case (returnExists(req.body['vehicleAnnualDistance'])):
        sfVehicle['CanaryAMS__Estimated_Annual_Miles__c'] = req.body.vehicleAnnualDistance;
      case (returnExists(req.body['hasRatesCreated']) && req.body.hasRatesCreated === true):
        sfVehicle['CanaryAMS__Notes_Long__c'] = createRatesHtml(req.body.rates);
    }

    const data = await conn.sobject('CanaryAMS__Vehicle__c').update([sfVehicle]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error updating property on salesforce!')));

    const returnExists = (value) => {
      if (value || value === false) {
        return true;
      }
      return false;
    };

    const createRatesHtml = (rates) => {
      if (rates) {
        let ratesHtml = `<div class="header">
                                      <h3 class="main-header-title">Rates</h3>
                                  </div>`;
        for (let i = 0; i < rates.length; i += 1) {
          ratesHtml += `<div class="main-header">
                              <div class="form-group">
                                <div class="group">
                                    <div class="info-label-container">
                                        <p class="info-label">${i === 0 ? 'Low' : i === 1 ? 'Good' : i === 2 ? 'Better' : 'Best'} Coverage</p>
                                    </div>
                                    <p class="info">${rates[i].price} /mo.</p>
                                </div>
                              </div>
                            </div>`;
          if (!rates[i + 1]) {
            return ratesHtml;
          }
        }
      }
      return '';
    };

    const sfProperty = {
      Id: req.body.homes[0].sfPropertyId,
    };
    switch (true) {
      case (returnExists(req.body.homes[0]['city'])):
        sfProperty['CanaryAMS__City__c'] = req.body.homes[0]['city'];
      case returnExists(req.body.homes[0]['state']):
        sfProperty['CanaryAMS__State__c'] = req.body.homes[0].state;
      case returnExists(req.body.homes[0]['zipCode']):
        sfProperty['CanaryAMS__Zip_Code__c'] = req.body.homes[0].zipCode;
      // case (returnExists(req.body.homes[0]['purchasedNew'])):
      //     sfProperty['CanaryAMS__Purchased_New__c'] = req.body.homes[0].purchasedNew;
      case (returnExists(req.body.homes[0]['marketValue'])):
        sfProperty['CanaryAMS__Market_Value__c'] = req.body.homes[0].marketValue;
      case (returnExists(req.body.homes[0]['purchasePrice'])):
        sfProperty['CanaryAMS__Purchase_Price__c'] = req.body.homes[0].purchasePrice;
      // case (returnExists(req.body.homes[0]['purchaseDate'])):
      //     sfProperty['CanaryAMS__Purchase_Date__c'] = convertDateString(req.body.homes[0].purchaseDate);
      // case (returnExists(req.body.homes[0]['estimatedReplacementCost'])):
      //     sfProperty['CanaryAMS__Estimated_Replacement_Cost__c'] = req.body.homes[0].estimatedReplacementCost;
      case (returnExists(req.body.homes[0]['yearBuilt'])):
        sfProperty['CanaryAMS__Year_Built__c'] = req.body.homes[0].yearBuilt;
      case (returnExists(req.body.homes[0]['totalSquareFootage'])):
        sfProperty['CanaryAMS__Square_Feet__c'] = req.body.homes[0]['totalSquareFootage'];
      // case returnExists(req.body.homes[0]['residenceType']):
      //     sfProperty['CanaryAMS__Residence_Type__c'] = req.body.homes[0].residenceType;
      case returnExists(req.body.homes[0]['numOfBeds']):
        sfProperty['CanaryAMS__Number_of_Bedrooms__c'] = req.body.homes[0].numOfBeds;
      case returnExists(req.body.homes[0]['numOfBaths']):
        sfProperty['CanaryAMS__Bath_1_Count__c'] = req.body.homes[0].numOfBaths;
      // case (returnExists(req.body.homes[0]['distanceFromTidalWater'])):
      //     sfProperty['CanaryAMS__Distance_to_Tidal_Water__c'] = req.body.homes[0].distanceFromTidalWater;
      case (returnExists(req.body.homes[0]['hasGatedCommunity'])):
        sfProperty['CanaryAMS__Gated_Community__c'] = req.body.hasGatedCommunity;
      // case (returnExists(req.body['birthDate'])):
      //     sfProperty['CanaryAMS__Garage_Type__c'] = convertDateString(req.body.birthDate);
      // case (returnExists(req.body.homes[0]['driverLicenseNumber'])):
      //     sfProperty['CanaryAMS__Garage_Number_of_Vehicles__c'] = req.body.homes[0].driverLicenseNumber;
      case (returnExists(req.body.homes[0]['primaryUse'])):
        sfProperty['CanaryAMS__Usage_Type__c'] = req.body.homes[0].primaryUse;
      case (returnExists(req.body.homes[0]['structureType'])):
        sfProperty['CanaryAMS__Structure_Type__c'] = req.body.homes[0].structureType;
      case (returnExists(req.body.homes[0]['roofMaterial'])):
        sfProperty['CanaryAMS__Roof_Material__c'] = req.body.homes[0]['roofMaterial'];
      case returnExists(req.body.homes[0]['roofType']):
        sfProperty['CanaryAMS__Roof_Type__c'] = req.body.homes[0].roofType;
      case returnExists(req.body.homes[0]['hasPets']):
        sfProperty['CanaryAMS__Pets__c'] = req.body.homes[0].hasPets;
      case returnExists(req.body.homes[0]['numOfStories']):
        sfProperty['CanaryAMS__NumStories__c'] = req.body.homes[0].numOfStories;
      case (returnExists(req.body.homes[0]['hasBasement'])):
        sfProperty['CanaryAMS__Foundation__c'] = (req.body.homes[0].hasBasement === true ? 'Basement' : '');
      // case (returnExists(req.body.homes[0]['hasPool'])):
      //     sfProperty['CanaryAMS__Pool__c'] = req.body.homes[0].hasPool;
      case (returnExists(req.body.homes[0]['exteriorMaterials'])):
        sfProperty['CanaryAMS__Construction__c'] = req.body.homes[0].exteriorMaterials;
      // case (returnExists(req.body.homes[0]['hasRoofingImprovement'])):
      //     sfProperty['CanaryAMS__Roofing_Improvement__c'] = req.body.homes[0].hasRoofingImprovement;
      // case (returnExists(req.body.homes[0]['roofingImprovementYear'])):
      //     sfProperty['CanaryAMS__RoofingImprovementYear__c'] = req.body.homes[0].roofingImprovementYear;
      // case (returnExists(req.body.homes[0]['hasWindMitigationForm'])):
      //     sfProperty['CanaryAMS__Have_Wind_Mitigation_Form__c'] = req.body.homes[0].hasWindMitigationForm;
      case (returnExists(req.body.homes[0]['windMitigationInspectionDate'])):
        sfProperty['CanaryAMS__Wind_Mitigation_Inspection_Date__c'] = req.body.homes[0].windMitigationInspectionDate;
      case (returnExists(req.body['hasRatesCreated']) && req.body.hasRatesCreated === true):
        sfProperty['CanaryAMS__Notes_Long__c'] = createRatesHtml(req.body.rates);
    }

    const data = await conn.sobject('CanaryAMS__Property__c').update([sfProperty]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;

    const convertDateString = (date) => {
      if (date) {
        let s = date;
        const n = s.indexOf('T');
        s = s.substring(0, n !== -1 ? n : s.length);
        return s;
      }
      return null;
    };

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error updating insured on salesforce!')));

    const returnExists = (value) => {
      if (value || value === false) {
        return true;
      }
      return false;
    };

    const sfInsured = {
      Id: req.body.sfInsuredId,
    };
    switch (true) {
      case (returnExists(req.body['applicantGivenName']) && returnExists(req.body['applicantSurname'])):
        sfInsured['Name'] = `${req.body.applicantGivenName} ${req.body.applicantSurname}`;
        sfInsured['CanaryAMS__First_Name__c'] = req.body.applicantGivenName;
        sfInsured['CanaryAMS__Last_Name__c'] = req.body.applicantSurname;
      case returnExists(req.body['applicantGenderCd']):
        sfInsured['CanaryAMS__Gender__c'] = req.body.applicantGenderCd;
      case (returnExists(req.body['applicantMaritalStatusCd'])):
        sfInsured['CanaryAMS__Marital_Status__c'] = req.body['applicantMaritalStatusCd'];
      case returnExists(req.body['applicantCommPhoneNumber']):
        sfInsured['CanaryAMS__Phone__c'] = req.body.applicantCommPhoneNumber;
      case returnExists(req.body['applicantCommEmailAddress']):
        sfInsured['CanaryAMS__Email__c'] = req.body.applicantCommEmailAddress;
      case (returnExists(req.body['vehicles[0].applicantAddrStreetName']) && returnExists(req.body['vehicles[0].applicantAddrStreetNumber'])):
        sfInsured['CanaryAMS__Address__c'] = `${req.body['vehicles[0].applicantAddrStreetNumber']} ${req.body['vehicles[0].applicantAddrStreetName']}`;
      case (returnExists(req.body['vehicles[0].applicantAddrCity'])):
        sfInsured['CanaryAMS__City__c'] = req.body.applicantAddrCity;
      case (returnExists(req.body['vehicles[0].applicantStateCd'])):
        sfInsured['CanaryAMS__State__c'] = req.body.applicantStateCd;
      case (returnExists(req.body['vehicles[0].applicantPostalCd'])):
        sfInsured['CanaryAMS__Zip_Code__c'] = req.body.applicantPostalCd;
      case (returnExists(req.body['driverLicenseNumber'])):
        sfInsured['CanaryAMS__Drivers_License_Number__c'] = req.body.driverLicenseNumber;
      case (returnExists(req.body['driverLicenseStateCd'])):
        sfInsured['CanaryAMS__License_State__c'] = req.body.driverLicenseStateCd;
      case (returnExists(req.body['applicantOccupationClassCd'])):
        sfInsured['CanaryAMS__Occupation__c'] = req.body.applicantOccupationClassCd;
      case (returnExists(req.body['applicantBirthDt'])):
        sfInsured['CanaryAMS__Date_Of_Birth__c'] = convertDateString(req.body.applicantBirthDt);
    }

    const data = await conn.sobject('CanaryAMS__Insured__c').update([sfInsured]);
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
    const { username, password, salesforceAT } = req.body.decoded_vendor;

    const convertDateString = (date) => {
      if (date) {
        let s = date;
        const n = s.indexOf('T');
        s = s.substring(0, n !== -1 ? n : s.length);
        return s;
      }
      return null;
    };

    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com',
    });
    await conn.login(username, (`${password} ${salesforceAT}`))
      .catch(() => next(Boom.badRequest('Error updating home insured on salesforce!')));

    const returnExists = (value) => {
      if (value || value === false) {
        return true;
      }
      return false;
    };

    const sfInsured = {
      Id: req.body.homes[0].sfInsuredId,
    };
    switch (true) {
      case (returnExists(req.body['firstName']) && returnExists(req.body['lastName'])):
        sfInsured['Name'] = `${req.body.firstName} ${req.body.lastName}`;
        sfInsured['CanaryAMS__First_Name__c'] = req.body.firstName;
        sfInsured['CanaryAMS__Last_Name__c'] = req.body.lastName;
      case returnExists(req.body['gender']):
        sfInsured['CanaryAMS__Gender__c'] = req.body.gender;
      case (returnExists(req.body['maritalStatus'])):
        sfInsured['CanaryAMS__Marital_Status__c'] = req.body['maritalStatus'];
      case returnExists(req.body['phone']):
        sfInsured['CanaryAMS__Phone__c'] = req.body.phone;
      case returnExists(req.body['email']):
        sfInsured['CanaryAMS__Email__c'] = req.body.email;
      case (returnExists(req.body['homes[0].streetName']) && returnExists(req.body['homes[0].streetNumber'])):
        sfInsured['CanaryAMS__Address__c'] = `${req.body['homes[0].streetNumber']} ${req.body['homes[0].streetName']}`;
      case (returnExists(req.body['homes[0].city'])):
        sfInsured['CanaryAMS__City__c'] = req.body.city;
      case (returnExists(req.body['homes[0].state'])):
        sfInsured['CanaryAMS__State__c'] = req.body.state;
      case (returnExists(req.body['homes[0].zipCode'])):
        sfInsured['CanaryAMS__Zip_Code__c'] = req.body.zipCode;
      case (returnExists(req.body['occupation'])):
        sfInsured['CanaryAMS__Occupation__c'] = req.body.occupation;
      case (returnExists(req.body['birthDate'])):
        sfInsured['CanaryAMS__Date_Of_Birth__c'] = convertDateString(req.body.birthDate);
    }

    const data = await conn.sobject('CanaryAMS__Insured__c').update([sfInsured]);
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
