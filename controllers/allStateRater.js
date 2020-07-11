/* eslint-disable no-param-reassign, no-plusplus, no-prototype-builtins, no-loop-func, guard-for-in, no-use-before-define, prefer-arrow-callback, no-restricted-syntax, func-names, dot-notation, no-constant-condition, prefer-destructuring,
max-len, no-console, no-await-in-loop, no-undef, no-inner-declarations, consistent-return */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { allStateRater } = require('../constants/appConstant');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const utils = require('../lib/utils');

module.exports = {
  allState: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;

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
          await page.waitFor(6000);
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

          await page.waitForSelector('select[name="ratingState"]');
          await page.evaluate(() => {
            const enableState = document.querySelector('select[name="ratingState"]');
            enableState.disabled = false;
          });
          await page.waitForSelector('#NQ > input[type=radio]');
          await page.click('#NQ > input[type=radio]');
          await page.click('body > form > table:nth-child(17) > tbody > tr:nth-child(5) > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > input');
        } catch (error) {
          await exitFail(error, 'newQuote');
        }
      }

      async function fillupForm() {
        await page.evaluate(async (data) => {
          await document.addEventListener('DOMContentLoaded', async function () {
            const form = await document.getElementsByName('AutoFormBean')[0];
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
              if (key === 'allianceEasyQuoteFormBean.aeqTransactionCd' && xField === 'Full_Quote') {
                const fullQuoteBtn = document.getElementsByName(key);
                fullQuoteBtn[0].checked = false;
                fullQuoteBtn[1].checked = true;
                key = null;
              }
              if (key && xField) {
                let el = document.getElementById(key);
                if (!el) {
                  el = document.getElementsByName(key)[0];
                }
                if (el.type === 'text' && xField) {
                  el.value = xField;
                } else if (el.type === 'select-one' && el.options && el.options.length && el.options.length > 0) {
                  el.value = await getBestValue(xField, el.options);
                }
                if (el && el.onchange) {
                  el.onchange = null;
                }
              }
              if (key === 'vlbe0' && xField === 'VIN Lookup') {
                document.querySelector(key).removeAttribute('disabled');
                document.querySelector(key).click();
                key = null;
              }
            }
          });
          // eslint-disable-next-line no-shadow
          async function getBestValue(value, data) {
            try {
              const optionsArray = [...data];
              const nArr = optionsArray.map(entry => entry.text.toLowerCase());
              const vArr = optionsArray.map(entry => entry.value.toLowerCase());
              if (value && value.length && value.length > 0 && value.length < 2) {
                if (vArr.indexOf(value.toLowerCase()) !== -1) {
                  return value;
                }
              } else if (value && value.length > 1) {
                const nBestMatch = await findBestMatch(value.toLowerCase(), nArr);
                const vBestMatch = await findBestMatch(value.toLowerCase(), vArr);
                let i = 0;
                if (nBestMatch.bestMatch.rating > vBestMatch.bestMatch.rating) {
                  i = nBestMatch.bestMatchIndex;
                } else if (vBestMatch.bestMatch.rating > nBestMatch.bestMatch.rating) {
                  i = vBestMatch.bestMatchIndex;
                } else if (vBestMatch.bestMatch.rating === nBestMatch.bestMatch.rating && nBestMatch.bestMatch.rating >= 0.75) {
                  i = nBestMatch.bestMatchIndex;
                }
                const bestValue = optionsArray[i].value;
                return bestValue;
              } else if (value) {
                return value || '';
              } else {
                return '';
              }
            } catch (error) {
              console.log(`Error: ${error}`);
            }
          }
          function compareTwoStrings(first, second) {
            first = first.replace(/\s+/g, '');
            second = second.replace(/\s+/g, '');

            if (!first.length && !second.length) return 1; // if both are empty strings
            if (!first.length || !second.length) return 0; // if only one is empty string
            if (first === second) return 1; // identical
            if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
            if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

            const firstBigrams = new Map();
            for (let i = 0; i < first.length - 1; i++) {
              const bigram = first.substring(i, i + 2);
              const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram) + 1
                : 1;

              firstBigrams.set(bigram, count);
            }

            let intersectionSize = 0;
            for (let i = 0; i < second.length - 1; i++) {
              const bigram = second.substring(i, i + 2);
              const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram)
                : 0;

              if (count > 0) {
                firstBigrams.set(bigram, count - 1);
                intersectionSize++;
              }
            }

            return (2.0 * intersectionSize) / (first.length + second.length - 2);
          }
          function findBestMatch(mainString, targetStrings) {
            if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');

            const ratings = [];
            let bestMatchIndex = 0;

            for (let i = 0; i < targetStrings.length; i++) {
              const currentTargetString = targetStrings[i];
              const currentRating = compareTwoStrings(mainString, currentTargetString);
              ratings.push({ target: currentTargetString, rating: currentRating });
              if (currentRating > ratings[bestMatchIndex].rating) {
                bestMatchIndex = i;
              }
            }
            const bestMatch = ratings[bestMatchIndex];
            return { ratings, bestMatch, bestMatchIndex };
          }
          function areArgsValid(mainString, targetStrings) {
            if (typeof mainString !== 'string') return false;
            if (!Array.isArray(targetStrings)) return false;
            if (!targetStrings.length) return false;
            if (targetStrings.find(s => typeof s !== 'string')) return false;
            return true;
          }
        }, populatedData);
      }

      async function namedInsuredStep() {
        console.log('AllState Named Insured Step');
        try {
          await fillupForm();
        } catch (error) {
          await exitFail(error, 'namedInsured');
        }
      }

      async function searchStep() {
        console.log('AllState Search Step');
        try {
          await page.waitFor('#retrieve_button');
          await page.evaluate(() => document.getElementById('retrieve_button').click());
          await page.waitForSelector('#confirmButton');
          await page.evaluate(() => document.querySelector('#confirmButton').click());
        } catch (error) {
          await exitFail(error, 'search');
        }
      }

      async function driverStep() {
        console.log('AllState Driver Step');
        try {
          await page.waitFor(1000);
          await fillupForm();
          await page.waitForSelector('body > form > table:nth-child(57) > tbody > tr:nth-child(6) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > input');
          await page.click('body > form > table:nth-child(57) > tbody > tr:nth-child(6) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > input');
        } catch (error) {
          await exitFail(error, 'driver');
        }
      }

      async function vehicleStep() {
        console.log('AllState Vehicle Step');
        try {
          await page.waitFor(1000);
          await fillupForm();
          await page.waitForSelector('body > form > table.alliancebuttonshell > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > input');
          await page.click('body > form > table.alliancebuttonshell > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > input');
        } catch (error) {
          await exitFail(error, 'vehicle');
        }
      }

      await loginStep();
      await newQuoteStep();
      await namedInsuredStep();
      await searchStep();
      await driverStep();
      await vehicleStep();


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
          principalOperator: '1',
          territory: '460',
          vehicleVin: 'KMHDH6AE1DU001708',
          vehicleUse: '8',
          yearsVehicleOwned: '5',
          vehicles: [
            {
              // Vehicle Type will always be 1981 or newer
              vehicleVin: 'JH4NA1150MT000683',
              vehicleUse: 'Business',
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
        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          for (const j in bodyData.vehicles) {
            // const element = bodyData.vehicles[j];
            dataObj[`vehicleInfo[${j}].garagingAddrSameAsCurrentAddr`] = { type: 'select-one', value: 'Yes', name: `vehicleInfo[${j}].garagingAddrSameAsCurrentAddr` };
            dataObj[`vehicleInfo[${j}].territorySelected`] = { type: 'select-one', value: '5014: BRACKENRIDGE  : City Limits: Inside County: 002, Area Rate 770', name: `vehicleInfo[${j}].territorySelected` };
            dataObj[`vehicleInfo[${j}].modelYear`] = { type: 'text', value: '1991', name: `vehicleInfo[${j}].modelYear` };
            dataObj[`vehicleInfo[${j}].vehIdentificationNumber`] = { type: 'text', value: staticDataObj.vehicles[0].vehicleVin, name: `vehicleInfo[${j}].vehIdentificationNumber` };
            dataObj[`vlbe${j}`] = { type: 'button', value: 'VIN Lookup', name: `vlbe${j}` };
            dataObj[`vehicleInfo[${j}].estimatedAnnualDistance`] = { type: 'text', value: staticDataObj.vehicles[0].annualMiles, name: `vehicleInfo[${j}].estimatedAnnualDistance` };
            dataObj[`vehicleInfo[${j}].vehUseCd`] = { type: 'text', value: staticDataObj.vehicles[0].vehicleUse, name: `vehicleInfo[${j}].vehUseCd` };
            dataObj[`vehicleInfo[${j}].userSelectedESCInd`] = { type: 'text', value: 'No', name: `vehicleInfo[${j}].userSelectedESCInd` };
          }
        }
        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          for (const j in bodyData.drivers) {
            // const element = bodyData.drivers[j];
            dataObj[`driverInfo[${j}].gender`] = { type: 'select-one', value: staticDataObj.drivers[0].gender, name: `driverInfo[${j}].gender` };
            dataObj[`driverInfo[${j}].maritalStatus`] = { type: 'select-one', value: staticDataObj.drivers[0].maritalStatus, name: `driverInfo[${j}].maritalStatus` };
            dataObj[`driverInfo[${j}].ageFirstLicensed`] = { type: 'select-one', value: staticDataObj.drivers[0].ageWhen1stLicensed, name: `driverInfo[${j}].ageFirstLicensed` };
            dataObj[`driverInfo[${j}].dateLicensedMM`] = { type: 'select-one', value: '10', name: `driverInfo[${j}].dateLicensedMM` };
            dataObj[`driverInfo[${j}].dateLicensedYYYY`] = { type: 'select-one', value: '2018', name: `driverInfo[${j}].dateLicensedYYYY` };
            dataObj[`driverInfo[${j}].accidentsAndViolationInd`] = { type: 'select-one', value: 'no', name: `driverInfo[${j}].accidentsAndViolationInd` };
          }
        }

        dataObj['allianceEasyQuoteFormBean.primaryOperator.firstName'] = { type: 'text', value: bodyData.firstName || staticDataObj.firstName, name: 'allianceEasyQuoteFormBean.primaryOperator.firstName' };
        dataObj['allianceEasyQuoteFormBean.primaryOperator.lastName'] = { type: 'text', value: bodyData.lastName || staticDataObj.lastName, name: 'allianceEasyQuoteFormBean.primaryOperator.lastName' };
        dataObj['household.currentAddress.addrLine1'] = { type: 'text', value: staticDataObj.mailingAddress, name: 'household.currentAddress.addrLine1' };
        dataObj['household.currentAddress.city'] = { type: 'text', value: staticDataObj.city, name: 'household.currentAddress.city' };
        dataObj['household.currentAddress.zipCode'] = { type: 'text', value: '15014', name: 'household.currentAddress.zipCode' };
        dataObj['household.yearsAtCurrentResidence'] = { type: 'select-one', value: '5 Years or More', name: 'household.yearsAtCurrentResidence' };
        dataObj['dobMM'] = { type: 'text', value: '12', name: 'dobMM' };
        dataObj['dobDD'] = { type: 'text', value: '12', name: 'dobDD' };
        dataObj['dobYYYY'] = { type: 'text', value: '1997', name: 'dobYYYY' };
        dataObj['dobYYYY'] = { type: 'text', value: '1997', name: 'dobYYYY' };
        dataObj['allianceEasyQuoteFormBean.aeqTransactionCd'] = { type: 'radio', value: 'Full_Quote', name: 'allianceEasyQuoteFormBean.aeqTransactionCd' };
        dataObj['household.residenceTypeCd'] = { type: 'select-one', value: 'Townhouse', name: 'household.residenceTypeCd' };
        dataObj['household.ownOrRentCd'] = { type: 'select-one', value: 'Rent', name: 'household.ownOrRentCd' };
        dataObj['household.currentInsurance.lengthWithCurrentInsurance'] = { type: 'select-one', value: '3', name: 'household.currentInsurance.lengthWithCurrentInsurance' };
        dataObj['vehicle.rideForHireProgramInd'] = { type: 'select-one', value: 'No', name: 'vehicle.rideForHireProgramInd' };
        return dataObj;
      }
    } catch (error) {
      console.log('Error at AllState :', error);
      return next(Boom.badRequest('Failed to retrieved AllState rate.'));
    }
  },
};
