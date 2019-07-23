
/* eslint-disable no-use-before-define, prefer-arrow-callback, no-restricted-syntax, func-names, dot-notation, no-constant-condition, prefer-destructuring,
max-len, no-console, no-await-in-loop, no-undef, no-inner-declarations, consistent-return */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { allStateRater } = require('../constants/appConstant');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const utils = require('../lib/utils');

module.exports = {
  allState: async (req, res, next) => {
    try {
      // const { username, password } = req.body.decoded_vendor;
      const username = 'spa9690e';
      const password = 'Thiscompanyisapaininmyass';

      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
      if (ENVIRONMENT.nodeEnv === 'local') {
        browserParams = { headless: false, slowMo: 150 };
      }
      const browser = await puppeteer.launch(browserParams);
      const bodyData = await utils.cleanObj(req.body.data);
      let page = await browser.newPage();
      await page.setViewport({
        width: 1000,
        height: 900,
      });

      const populatedData = await populateData();

      async function exitFail(error, step) {
        console.log(`Error during AllState ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieve AllState Rater rate',
            status: false,
            error: `There was an error at ${step} step`,
          };
        }
        browser.close();
        return next();
      }

      async function loginStep() {
        console.log('AllState Login Step');
        try {
          await page.goto(allStateRater.LOGIN_URL, { waitUntil: 'load', timeout: 0 });
          await page.waitFor(500);
          await page.waitForSelector('input[name="username"]');
          await page.type('input[name="username"]', username);
          await page.type('input[name="password"]', password);
          await page.click('body > div > form > table > tbody > tr:nth-child(5) > td.tableRow2 > input[type="image"]');
        } catch (error) {
          await exitFail(error, 'login');
        }
      }

      async function newQuoteStep() {
        console.log('AllState New Quote Step');
        try {
          await page.waitForXPath("//span[contains(., 'Start a Quote')]", 3000);
          const [startQuoteBtn] = await page.$x("//span[contains(., 'Start a Quote')]");
          if (startQuoteBtn) {
            await startQuoteBtn.click();
          }
          await page.waitForXPath("//a[contains(., 'Personal')]", 1000);
          const [personalQuoteBtn] = await page.$x("//a[contains(., 'Personal')]");
          if (personalQuoteBtn) {
            await personalQuoteBtn.click();
          }
          while (true) {
            await page.waitFor(1000);
            const pageQuote = await browser.pages();
            if (pageQuote.length > 2) {
              page = pageQuote[2];
              break;
            }
          }

          await page.evaluate(() => document.querySelector('select[name="ratingState"]').removeAttribute('disabled'));
          await page.waitForSelector('#NQ > input[type=radio]');
          await page.click('#NQ > input[type=radio]');
          await page.click('body > form > table:nth-child(17) > tbody > tr:nth-child(5) > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > input');
        } catch (error) {
          await exitFail(error, 'newQuote');
        }
      }

      async function namedInsuredStep() {
        console.log('AllState Named Insured Step');
        try {
          await page.evaluate(async (data) => {
            await document.addEventListener('DOMContentLoaded', async function () {
              const form = await document.getElementsByName('AutoFormBean')[0];
              for (const ele of form.elements) {
                if (ele.disabled) {
                  ele.disabled = false;
                }
              }
              const formD = new FormData(form);
              for (const pair of formD.entries()) {
                let key = (pair && pair[0]) ? pair[0] : null;
                if (key === 'allianceEasyQuoteFormBean.primaryOperator.dobMM') {
                  key = 'dobMM';
                }
                if (key === 'allianceEasyQuoteFormBean.primaryOperator.dobDD') {
                  key = 'dobDD';
                }
                if (key === 'allianceEasyQuoteFormBean.primaryOperator.dobYYYY') {
                  key = 'dobYYYY';
                }
                const xField = (data && key && data[key] && data[key].value) ? data[key].value : null;
                if (key && xField) {
                  const el = document.getElementById(key);
                  if (el.type === 'text' && xField) {
                    el.value = xField;
                  } else if (el.type === 'select-one' && el.options && el.options.length && el.options.length > 0) {
                    el.value = xField;
                  }
                  if (el && el.onchange) {
                    el.onchange = null;
                  }
                }
              }
              const nextBtn = await document.getElementById('retrieve_button');
              nextBtn.click();
            });
          }, populatedData);
        } catch (error) {
          await exitFail(error, 'namedInsured');
        }
      }
      await loginStep();
      await newQuoteStep();
      await namedInsuredStep();

      function populateData() {
        const staticDataObj = {
          mailingAddress: '670 Park Avenue',
          city: 'Moody',
          state: 'AL',
          zipCode: '36140',
          socialSecurityStatus: 'R',
          reasonForPolicy: 'N',
          garagedAddress: 'Howard Lake Park',
          garagedZipcode: '36016',
          garagedCity: 'Hoover',
          peopleInhouseHold1: 'U',
          peopleInhouseHold2: 'U',
          peopleInhouseHold3: 'U',
          peopleInhouseHold4: 'U',
          policyCurrentInsuranceValue: 'DW',
          policyDataResidenceType: 'H',
          policyDataPackageSelection: 'B',
          policyVehiclesTrackStatus: 'Not Participating',
          policyVehiclesCoverage: '100',
          firstName: 'Test',
          lastName: 'User',
          birthDate: '12/16/1993',
          gender: 'Male',
          email: 'test@gmail.com',
          maritalStatus: 'Married',
          relationship: 'L',
          licenseState: 'AL',
          ageWhen1stLicensed: '21',
          commonOccupation: 'Manager',
          education: 'BS',
          garagedLocation: '2',
          principalOperator: '1',
          territory: '460',
          vehicleVin: 'KMHDH6AE1DU001708',
          vehicleUse: '8',
          yearsVehicleOwned: '5',
          vehicles: [
            {
              // Vehicle Type will always be 1981 or newer
              vehicleVin: '1FTSF30L61EC23425',
              vehicleUse: '8',
              annualMiles: '50',
              yearsVehicleOwned: '5',
              garagedLocation: '2',
              principalOperator: '1',
              policyVehiclesTrackStatus: 'Not Participating',
            },
          ],
          drivers: [
            {
              firstName: 'Test',
              lastName: 'User',
              gender: 'Male',
              birthDate: '12/16/1993',
              maritalStatus: 'Single',
              relationship: 'L',
              licenseState: 'AL',
              ageWhen1stLicensed: '21',
              commonOccupation: 'Manager',
            },
          ],
        };

        const dataObj = {};
        dataObj['allianceEasyQuoteFormBean.primaryOperator.firstName'] = { type: 'text', value: bodyData.firstName || staticDataObj.firstName, name: 'allianceEasyQuoteFormBean.primaryOperator.firstName' };
        dataObj['allianceEasyQuoteFormBean.primaryOperator.lastName'] = { type: 'text', value: bodyData.lastName || staticDataObj.lastName, name: 'allianceEasyQuoteFormBean.primaryOperator.lastName' };
        dataObj['household.currentAddress.addrLine1'] = { type: 'text', value: staticDataObj.mailingAddress, name: 'household.currentAddress.addrLine1' };
        dataObj['household.currentAddress.city'] = { type: 'text', value: staticDataObj.city, name: 'household.currentAddress.city' };
        dataObj['household.currentAddress.zipCode'] = { type: 'text', value: '15014', name: 'household.currentAddress.zipCode' };
        dataObj['household.yearsAtCurrentResidence'] = { type: 'select-one', value: true, name: 'household.yearsAtCurrentResidence' };
        dataObj['dobMM'] = { type: 'text', value: '12', name: 'dobMM' };
        dataObj['dobDD'] = { type: 'text', value: '12', name: 'dobDD' };
        dataObj['dobYYYY'] = { type: 'text', value: '1997', name: 'dobYYYY' };
        dataObj['retrieve_button'] = { type: 'button', value: 'true', name: 'retrieve_button' };
        dataObj['household.yearsAtCurrentResidence'] = { type: 'select-one', value: '5', name: 'household.yearsAtCurrentResidence' };
        return dataObj;
      }
    } catch (error) {
      console.log('Error at AllState :', error);
      return next(Boom.badRequest('Failed to retrieved AllState rate.'));
    }
  },
};
