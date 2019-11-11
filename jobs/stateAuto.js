/* eslint-disable no-multi-assign */
/* eslint-disable default-case */
/* eslint-disable prefer-destructuring, no-constant-condition, no-console, dot-notation, no-await-in-loop, max-len, no-use-before-define, no-inner-declarations, no-param-reassign, no-restricted-syntax, consistent-return, no-undef, */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const stringSimilarity = require('string-similarity');
const moment = require('moment');
const { stateAutoRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate, ageCount } = require('../lib/utils');

const self = module.exports = {

  stateAuto: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
      const yeasterDay = formatDate(moment(new Date()).subtract(1, 'days'));

      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);
      bodyData.drivers[0].ageWhen1stLicensed = await ageCount(bodyData.drivers[0].applicantBirthDt);

      const stepResult = {
        login: false,
        policy: false,
        customerInfo: false,
        vehicles: false,
        drivers: false,
        underWriting: false,
        coverage: false,
        summary: false,
      };

      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 300,
      };
      if (ENVIRONMENT.nodeEnv === 'local') {
        browserParams = { headless: false };
      }
      const browser = await puppeteer.launch(browserParams);
      const page = await browser.newPage();
      //   const navigationPromise = page.waitForNavigation();
      const populatedData = await populateData();

      await loginStep();
      await customerStep();

      async function loginStep() {
        console.log('State Auto Login Step');
        try {
          await page.goto(stateAutoRater.LOGIN_URL, { waitUntil: 'networkidle2', timeout: 0 });
          await page.waitFor(500);
          await page.waitForSelector('#eid-username-input');
          await page.type('#eid-username-input', username);
          await page.type('#eid-password-input', password);
          await page.click('.eid-large-button');
          stepResult.login = true;
        } catch (error) {
          await exitFail(error, 'login');
        }
      }

      async function customerStep() {
        console.log('State Auto Customer Step');
        try {
          const url = (`${stateAutoRater.NEW_QUOTE_URL}?postalCode=21401&state=MD&lob=AUTOP&effectiveDate=2019-12-01`);
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
          await page.waitFor(500);
          await page.waitForSelector('[data-test-id="customer-info-pni-first-name"]');
          await fillPage();
          await page.waitFor(500);
        } catch (error) {
          await exitFail(error, 'Add Customer');
        }
      }

      async function fillPage() {
        try {
          console.log('Fill Page Hit');
          await page.waitFor(500);
          await page.evaluate(async (data) => {
            const fields = document.querySelectorAll('[data-test-id]');
            for (const row of data) {
              for (const field of fields) {
                if (field && field.attributes && field.attributes['data-test-id'] && field.attributes['data-test-id'].nodeValue) {
                  const nodeV = field.attributes['data-test-id'].nodeValue;
                  if (nodeV === row.element) {
                    if (row.type === 'input') {
                    //   field.type(row.value);
                      field.value = row.value;
                      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
                      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
                    } else if (row.type === 'select') {
                    //   field.select(row.value);
                      field.value = row.value;
                    }
                    //   field.value = row.value;
                  }
                }
              }
            }
          }, populatedData);
        } catch (error) {
          await exitFail(error, 'Add Customer');
        }
      }

      async function exitFail(error, step) {
        console.log(`Error during State Auto ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieve State Auto rate',
            status: false,
            error: `There was an error at ${step} step`,
          };
        }
        browser.close();
        return next();
      }

      async function populateData() {
        const staticDataObj = {
          businessType: 'AUTO',
          mailingAddress: '670 Park Avenue',
          city: 'Moody',
          state: 'AL',
          zipCode: '36140',
          primaryResidence: 'OTH',
          reasonForPriorInsurance: 'NOPRIOR',
          firstName: 'Test',
          lastName: 'User',
          birthDate: '12/16/1997',
          gender: 'Male',
          email: 'test@gmail.com',
          phone: '9999997777',
          liability: '100000/300000',
          propertyDamage: '100000',
          education: 'High School Diploma',
          occupation: 'Other',
          motorist: 'VAL:25000/50000,CD:UM,LMTCD:PERPERSON/PERACC',
          medicalPayment: '5000',
          comprehensive: '1000',
          roadAssistant: 'RB',
          rentalETE: '30/900,CD:RREIM,LMTCD:PERDAY/PERACC',
          equipment: '2500',
          driverPlan: 'F1',
          vehicleType: 'PP',
          vehicles: [
            {
              vehicleVin: 'KMHDH6AE1DU001708',
              vehicleUse: 'BU',
              annualMiles: '500',
              yearsVehicleOwned: '5',
              ownerShip: 'L',
              policyVehiclesTrackStatus: 'Not Participating',
            },
          ],
          drivers: [
            {
              firstName: 'Test',
              lastName: 'User',
              gender: 'Male',
              birthDate: '12/16/1993',
              maritalStatus: 'S',
              relationshipTonamedInsured: 'IN',
              licenseState: 'AL',
              ageWhen1stLicensed: '17',
              dateWhenLicensed: yeasterDay,
            },
          ],
        };

        const dataObj = [];
        dataObj.push({ type: 'input', element: 'customer-info-pni-first-name', value: bodyData.firstName || staticDataObj.firstName });
        dataObj.push({ type: 'input', element: 'customer-info-pni-last-name', value: bodyData.lastName || staticDataObj.lastName });
        dataObj.push({ type: 'input', element: 'customer-info-pni-dob', value: bodyData.birthDate || staticDataObj.birthDate });
        dataObj.push({ type: 'input', element: 'customer-info-personal-address-line', value: bodyData.mailingAddress || staticDataObj.mailingAddress });
        // dataObj.pty = { element: 'txtCity', value: bodyData.city || staticDataObj.city });
        // dataObj.pate = { element: 'ddState', value: bodyData.state || staticDataObj.state });
        // dataObj.ppcode = { element: 'txtZip5', value: bodyData.zipCode || staticDataObj.zipCode });
        const bestOccValue = await self.returnClosestValue(bodyData.occupation || staticDataObj.occupation, 'occupations', 'oth');
        dataObj.push({ type: 'select', element: 'customer-info-pni-occupation', value: bestOccValue });
        const bestEdValue = await self.returnClosestValue(bodyData.education || staticDataObj.education, 'educations', 'hsd');
        dataObj.push({ type: 'select', element: 'customer-info-pni-education', value: bestEdValue });
        dataObj.push({ type: 'select', element: 'customer-info-producer-code', value: '0009450' });
        dataObj.push({ type: 'select', element: 'customer-info-agent-of-record', value: '187696' });
        // dataObj.effectiveDate = { element: 'EffectiveDate', value: tomorrow };
        // dataObj.businessType = { element: 'LineOfBusinessValue', value: staticDataObj.businessType };
        // dataObj.phone = { element: 'tbody > #G3 #\\31 472665286', value: bodyData.phone || staticDataObj.phone };
        // dataObj.vehicleType = { element: 'select[data-label="Vehicle Type"]', value: staticDataObj.vehicleType };
        // // vehicle
        // dataObj.vehicleVin = { element: 'input[data-label="VIN"]', value: bodyData.vehicles[0].vehicleVin || staticDataObj.vehicles[0].vehicleVin };
        // dataObj.primaryUse = { element: 'select[data-label="Vehicle Use"]', value: staticDataObj.vehicles[0].vehicleUse };
        // dataObj.annualMilege = { element: 'input[data-label="Annual Mileage"]', value: staticDataObj.vehicles[0].annualMiles };
        // dataObj.ownerShip = { element: 'select[data-label="Ownership Status"]', value: staticDataObj.vehicles[0].ownerShip };
        // // driver
        // dataObj.maritalStatus = { element: 'select[data-label="Marital Status"]', value: staticDataObj.drivers[0].maritalStatus };
        // dataObj.relationship = { element: 'select[data-label="Relationship to Named Insured"]', value: staticDataObj.drivers[0].relationshipTonamedInsured };
        // dataObj.ageWhen1stLicensed = { element: 'input[data-label="Age 1st Licensed US/Canada"]', value: bodyData.drivers[0].ageWhen1stLicensed || staticDataObj.drivers[0].ageWhen1stLicensed };
        // dataObj.dateWhenLicensed = { element: 'input[data-label="Date Licensed"]', value: bodyData.drivers[0].licensedDate || staticDataObj.drivers[0].dateWhenLicensed };

        // dataObj.insuranceStatus = { element: 'select[data-label="Insurance Status"]', value: staticDataObj.reasonForPriorInsurance };
        // dataObj.ReasonForinsurance = { element: 'select[data-label="Reason for No Prior Insurance"]', value: 'FIRSTCAR' };
        // dataObj.primaryResidence = { element: 'select[data-label="Primary Residence"]', value: staticDataObj.primaryResidence };

        // dataObj.liability = { element: 'select[data-label="Liability"]', value: bodyData.coverage[0] ? bodyData.coverage[0].liability : staticDataObj.liability };
        // dataObj.propertyDamage = { element: 'select[data-label="Property Damage"]', value: bodyData.coverage[0] ? bodyData.coverage[0].propertyDamage : staticDataObj.propertyDamage };
        // dataObj.motorist = { element: 'select[data-label="Uninsd/Underinsd Motorist"]', value: bodyData.coverage[0] ? bodyData.coverage[0].motorist : staticDataObj.motorist };
        // dataObj.medicalPayment = { element: 'select[data-label="Medical Payments"]', value: bodyData.coverage[0] ? bodyData.coverage[0].medicalPayment : staticDataObj.medicalPayment };
        // dataObj.comprehensive = { element: 'select[data-label="Comprehensive"]', value: bodyData.coverage[0] ? bodyData.coverage[0].comprehensive : staticDataObj.comprehensive };
        // dataObj.collision = { element: 'select[data-label="Collision"]', value: bodyData.coverage[0] ? bodyData.coverage[0].collision : staticDataObj.collision };
        // dataObj.roadAssistant = { element: 'select[data-label="Roadside Assistance"]', value: bodyData.coverage[0] ? bodyData.coverage[0].roadAssistant : staticDataObj.roadAssistant };
        // dataObj.rentalETE = { element: 'select[data-label"Rental ETE"]', value: bodyData.coverage[0] ? bodyData.coverage[0].rentalETE : staticDataObj.rentalETE };
        // dataObj.equipment = { element: 'select[data-label="Custom Equipment - Increased Limit"]', value: bodyData.coverage[0] ? bodyData.coverage[0].equipment : staticDataObj.equipment };
        // dataObj.driverPlan = { element: 'select[data-label="Responsible Driver Plan"]', value: bodyData.coverage[0] ? bodyData.coverage[0].driverPlan : staticDataObj.driverPlan };

        return dataObj;
      }
    } catch (error) {
      console.log('Error at State Auto:', error);
      return next(Boom.badRequest('Failed to retrieved State Auto rate.'));
    }
  },
  returnClosestValue: async (value, array, defaultValue) => {
    try {
      async function returnValueIfExists(val) {
        if (val && val !== 'undefined' && typeof val !== 'undefined' && val !== null) {
          return val;
        }
        return null;
      }
      const returnBestValue = async (arr, val, defaultVal) => {
        try {
          if (returnValueIfExists(val)) {
            const objs = await self.returnArray(arr);
            const displays = objs.map(opt => opt.display);
            const bestValueIndex = stringSimilarity.findBestMatch(val, displays).bestMatchIndex;
            const bestValue = (bestValueIndex ? objs[bestValueIndex].value : null);
            return bestValue;
          } if (returnValueIfExists(defaultVal)) {
            return defaultVal;
          }
          return val;
        } catch (error) {
          console.log(error);
          return null;
        }
      };

      const bestValue = await returnBestValue(array, value, defaultValue);

      return bestValue;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  returnArray: async (value) => {
    switch (value) {
      case 'occupations':
        return [{ value: 'admin', display: 'Administrative/Clerical' }, { value: 'cs', display: 'Civil Servant' }, { value: 'cr', display: 'Construction/Repair' }, { value: 'cf', display: 'Craftsman' }, { value: 'Dis', display: 'Disabled' }, { value: 'dr', display: 'Doctor' }, { value: 'ep', display: 'Editor/Publisher' }, { value: 'eng', display: 'Engineer/Scientist' }, { value: 'fa', display: 'Farmer' }, { value: 'ff', display: 'Fire Fighter' }, { value: 'FulTmStdnt', display: 'Full-Time Student' }, { value: 'hm', display: 'Homemaker' }, { value: 'lale', display: 'Labor Leader' }, { value: 'le', display: 'Law Enforcement' }, { value: 'la', display: 'Lawyer' }, { value: 'ma', display: 'Manager' }, { value: 'me', display: 'Media' }, { value: 'mc', display: 'Merchant' }, { value: 'Mil', display: 'Military' }, { value: 'nr', display: 'News Reporter' }, { value: 'oth', display: 'Other' }, { value: 'oop', display: 'Other Office Professional' }, { value: 'pea', display: 'Professional Entertainer/Athlete' }, { value: 'profPol', display: 'Professional Politician' }, { value: 'pp', display: 'Proprietor' }, { value: 'pubLec', display: 'Public Lecturer' }, { value: 'rta', display: 'Radio/TV Announcer' }, { value: 'Retrd', display: 'Retired' }, { value: 'sa', display: 'Sales' }, { value: 'se', display: 'Service' }, { value: 'te', display: 'Teacher' }, { value: 'un', display: 'Unemployed' }];
      case 'educations':
        return [{ value: 'shsc', display: 'Some High School Coursework' }, { value: 'hsd', display: 'High School Diploma' }, { value: 'scc', display: 'Some College Coursework' }, { value: 'voc', display: 'Vocational/Technical Degree' }, { value: 'asso', display: 'Associates Degree' }, { value: 'bach', display: 'Bachelors Degree' }, { value: 'mas', display: 'Masters Degree' }, { value: 'doc', display: 'Doctoral Degree' }, { value: 'med', display: 'Medical Degree' }, { value: 'law', display: 'Law Degree' }];
    }
  },
};
