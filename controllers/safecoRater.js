/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { safecoAlRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/environment');
const { formatDate } = require('../lib/utils');


module.exports = {
  safecoAl: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;
      const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
      const params = req.body;
      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
      if (ENVIRONMENT.ENV === 'local') {
        browserParams = { headless: false };
      }
      const browser = await puppeteer.launch(browserParams);
      let page = await browser.newPage();

      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);

      let stepResult = {
        login: false,
        newQuote: false,
        existingQuote: false,
        policyInfo: false,
        vehicles: false,
        drivers: false,
        telemetics: false,
        underWriting: false,
        coverage: false,
        summary: false,
      };

      if (raterStore && raterStore.stepResult) {
        stepResult = raterStore.stepResult;
      }

      const populatedData = await populateData();

      await loginStep();
      if (raterStore && raterStore.quoteId) {
        await existingQuote();
      } else {
        await newQuoteStep();
      }
      if (!params.stepName) {
        await policyInfoStep();
        await driversStep();
        await vehiclesStep();
        await finalSteps();
      } else {
        if (params.stepName === 'namedInsured') {
          await policyInfoStep();
          const quoteId = `${bodyData.lastName}, ${bodyData.firstName}`;
          exitSuccess('Named Insured', quoteId);
        }
        if (params.stepName === 'drivers' && raterStore) {
          await driversStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
            exitSuccess('Drivers', quoteId);
          }
        }
        if (params.stepName === 'vehicles' && raterStore) {
          await vehiclesStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
            exitSuccess('Vehicles', quoteId);
          }
        }
        if (params.stepName === 'summary' && raterStore) {
          await finalSteps();
        }
      }

      async function existingQuote() {
        console.log('Safeco AL existing Quote Step');
        try {
          const quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
          await page.waitFor(8000);
          await page.goto(safecoAlRater.EXISTING_QUOTE_URL, { waitUntil: 'load' });
          await page.waitFor(5000);
          await page.select('#SAMSearchBusinessType', '7|1|');
          await page.select('#SAMSearchModifiedDateRange', '7');
          await page.select('#SAMSearchActivityStatus', '8');
          await page.type('#SAMSearchName', quoteId);
          await page.evaluate(() => document.querySelector('#asearch').click());
          await page.waitFor(3000);
          await page.waitForSelector('#divMain');
          await page.click('#divMain > table > tbody > tr > td > a > span');
          await page.waitFor(2000);
          await page.waitForSelector('#aedit');
          await page.evaluate(() => document.querySelector('#aedit').click());
          await page.waitFor(2000);
          if (await page.$('[id="btnUnlock"]')) {
            page.evaluate(() => document.querySelector('#btnUnlock').click());
          }
          await page.waitFor(2000);
          if (await page.$('[id="btnUnlock"]')) {
            page.evaluate(() => document.querySelector('#btnUnlock').click());
          }
          await page.waitFor(2000);
          stepResult.existingQuote = true;
        } catch (err) {
          await exitFail(error, 'Existing Quote');
          return next();
        }
      }

      async function finalSteps() {
        try {
          await telemeticsStep();
          await underwritingStep();
          await coveragesStep();
          await summaryStep();
        } catch (error) {
          console.log('Safeco Error With Final Steps: ', error);
        }
      }

      async function loginStep() {
        try {
          console.log('Safeco AL Login Step.');
          await page.goto(safecoAlRater.LOGIN_URL, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('#ctl00_ContentPlaceHolder1_UsernameTextBox');
          await page.type('#ctl00_ContentPlaceHolder1_UsernameTextBox', username);
          await page.type('#ctl00_ContentPlaceHolder1_PasswordTextBox', password);
          await page.evaluate(() => document.querySelector('#ctl00_ContentPlaceHolder1_SubmitButton').click());
          await page.waitForNavigation({ waitUntil: 'load' });
          stepResult.login = true;
        } catch (error) {
          await exitFail(error, 'Login');
        }
      }

      async function newQuoteStep() {
        try {
          console.log('Safeco AL New Quote Step.');
          await page.waitFor(2000);
          await page.goto(safecoAlRater.NEW_QUOTE_START_AUTO_URL, { waitUntil: 'domcontentloaded' });
          stepResult.newQuote = true;
        } catch (err) {
          await exitFail(error, 'New Quote');
        }
      }

      async function policyInfoStep() {
        try {
          await page.waitFor(3000);
          await loadStep('policyinfo', false);
          await fillPageForm();
          await saveStep();
          stepResult.policyInfo = true;
        } catch (err) {
          console.log('Error at Safeco AL Policy Information Step:', err);
          stepResult.policyInfo = false;
          let error = 'There is some error validations at policyInformationStep';
          try {
            const errorMessage = await page.evaluate(() => document.querySelector('#PolicyKickoutReasonSpan').innerText);
            if (errorMessage) {
              error = 'Unable to process due to site down.';
            }
          } catch (e) {
            console.log('Safeco AL Unable to process due to site down.');
          }
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: error,
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function driversStep() {
        try {
          await loadStep('driver', true);
          const afterCustomCode = async function () {
            for (let j in bodyData.drivers) {
              await page.evaluate(async (data, i) => {
                const PolicyDriverSR22FilingYNN = document.getElementById('PolicyDriverSR22FilingYNN');
                const PolicyDriverSR22FilingYN2N = document.getElementById(`PolicyDriverSR22FilingYN2N`);
                const LicenseSuspendedRevokedYNNexist = document.getElementById(`PolicyDriverLicenseSuspendedRevokedYNN`);
                if (PolicyDriverSR22FilingYNN) {
                  PolicyDriverSR22FilingYNN.click();
                  PolicyDriverSR22FilingYN2N.click();
                  LicenseSuspendedRevokedYNNexist.click();
                }
              }, populatedData, j);
              await page.waitFor(1000);
            }
          }
          await fillPageForm(null, afterCustomCode);
          await saveStep();
          stepResult.drivers = true;
        } catch (err) {
          await exitFail(err, 'Driver');
        }
      }

      async function vehiclesStep() {
        try {
          await loadStep('vehicle', true);
          const afterCustomCode = async function () {
            for (let j in bodyData.vehicles) {
              await page.evaluate(async (data, i) => {
                const vinExist = document.getElementById('PolicyVehicleVINKnownYNY');
                const vinEl = document.getElementById(`PolicyVehicleVIN`);
                const vinBtn = document.getElementById(`imgVINLookUp`);
                if (vinEl) {
                  vinExist.click();
                  vinEl.value = data[`PolicyVehicleVIN`].value;
                  vinBtn.click();
                }
              }, populatedData, j)
              await page.waitFor(1000);
            }
          }

          await fillPageForm(null, afterCustomCode);
          await page.waitFor(2000);
          await saveStep();
          stepResult.vehicles = true;
        } catch (err) {
          await exitFail(err, 'Vehicles');
        }
      }

      async function telemeticsStep() {
        try {
          await page.waitFor(2000);
          await loadStep('telematics', true);
          await fillPageForm();
          stepResult.telemetics = true;
        } catch (err) {
          await exitFail(err, 'Telematics');
        }
      }

      async function underwritingStep() {
        try {
          await page.waitFor(2000);
          await loadStep('underwriting', true);
          await fillPageForm();
          await page.waitFor(2000);
          stepResult.underWriting = true;
        } catch (err) {
          await exitFail(err, 'Underwriting');
        }
      }

      async function coveragesStep() {
        try {
          await page.waitFor(2000);
          await loadStep('coverages', true);
          await fillPageForm();
          stepResult.coverage = true;
        } catch (err) {
          await exitFail(err, 'Coverages');
        }
      }

      async function summaryStep() {
        console.log('Safeco AL Summary Step.');
        try {
          await page.waitFor(2000);
          await loadStep('summary', true);
          await page.waitForSelector('#PolicyPremiumTotalWithPIFLabel');
          const premiumDetails = await page.evaluate(() => {
            const downPaymentsObj = {};
            downPaymentsObj.paidInFullPremium = document.querySelector('#PolicyPremiumTotalWithPIFSpan').innerText.replace(/\$/g, '');
            downPaymentsObj.preferredPaymentMethodPremium = document.querySelector('#PolicyPreferredPaymentMethodPremiumSpan').innerText.replace(/\$/g, '');
            downPaymentsObj.totalPremium = document.querySelector('#PolicyPremiumTotalSpan').innerText.replace(/\$/g, '');
            return downPaymentsObj;
          });
          stepResult.summary = true;
          req.session.data = {
            title: 'Successfully retrieved safeco AL rate.',
            status: true,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
            stepResult,
          };
          console.log(' req.session.data',  req.session.data);
          browser.close();
          return next();
        } catch (err) {
          await exitFail(err, 'Summary');
        }
      }

      async function fillPageForm(beforeCustomCode, afterCustomCode, delayAfter) {
        try {
          page.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i)
              console.log(`${msg.args()[i]}`);
          });
          if (beforeCustomCode) {
            await beforeCustomCode();
          }
          const qO = await page.evaluate(async (data) => {
            if (ecfields) {
              ecfields.clearErrors();
            }
            if (ecfields.buildModalErr) {
              ecfields.buildModalErr = function () { };
            }
            if (ecfields.buildModalHtml) {
              ecfields.buildModalHtml = function () { };
            }

            let list = data;
            for (let fieldName in list) {
              const ecField = list[fieldName] ? list[fieldName] : null;
              const xField = data[fieldName] ? data[fieldName] : null;
              if (ecField) {
                ecField.required = false;
                ecField.rules = [];
              }
              if (ecField && xField) {
                const el = document.getElementById(fieldName);
                if (el && el.onchange) {
                  el.onchange = null;
                }
                if (el && xField.value) {
                  if (el.type === 'text' && xField.value) {
                    el.value = xField.value;
                  } else if (el.type === 'select-one' && el.options && el.options.length && el.options.length > 0) {
                    el.value = await getBestValue(xField.value, el.options);
                  } else if (el.type === 'radio' || el.type === 'checkbox') {
                    el.checked = (xField.value && xField.value === true) ? true : false;
                  }
                }
              }
            }

            function compareTwoStrings(first, second) {
              first = first.replace(/\s+/g, '')
              second = second.replace(/\s+/g, '')

              if (!first.length && !second.length) return 1;                   // if both are empty strings
              if (!first.length || !second.length) return 0;                   // if only one is empty string
              if (first === second) return 1;       							 // identical
              if (first.length === 1 && second.length === 1) return 0;         // both are 1-letter strings
              if (first.length < 2 || second.length < 2) return 0;			 // if either is a 1-letter string

              let firstBigrams = new Map();
              for (let i = 0; i < first.length - 1; i++) {
                const bigram = first.substring(i, i + 2);
                const count = firstBigrams.has(bigram)
                  ? firstBigrams.get(bigram) + 1
                  : 1;

                firstBigrams.set(bigram, count);
              };

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
                const currentRating = compareTwoStrings(mainString, currentTargetString)
                ratings.push({ target: currentTargetString, rating: currentRating })
                if (currentRating > ratings[bestMatchIndex].rating) {
                  bestMatchIndex = i
                }
              }


              const bestMatch = ratings[bestMatchIndex]

              return { ratings, bestMatch, bestMatchIndex };
            }
            function areArgsValid(mainString, targetStrings) {
              if (typeof mainString !== 'string') return false;
              if (!Array.isArray(targetStrings)) return false;
              if (!targetStrings.length) return false;
              if (targetStrings.find(s => typeof s !== 'string')) return false;
              return true;
            }

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
                  } else if (vBestMatch.bestMatch.rating === nBestMatch.bestMatch.rating && nBestMatch.bestMatch.rating >= .75) {
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
          }, populatedData);
          if (qO) {
            quoteObj = qO;
          }
          if (afterCustomCode) {
            await afterCustomCode();
          }
          if (delayAfter) {
            await page.waitFor(delayAfter);
          } else {
            await page.waitFor(1000);
          }
        } catch (err) {
          console.log('Error at Safeco AL FillPageForm Step:', err);
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at FillPageForm',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

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
        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          for (const j in bodyData.vehicles) {
            const element = bodyData.vehicles[j];
            dataObj['PolicyVehicleVINKnownYNY'] = { type: 'radio', value: true, name: 'PolicyVehicleVINKnownYNY' };
            dataObj['PolicyVehicleVIN'] = { type: 'text', value: element.vehicleVin || staticDataObj.vehicles[0].vehicleVin, name: 'PolicyVehicleVIN' };
            dataObj['PolicyVehicleAnnualMiles'] = { type: 'text', value: staticDataObj.vehicles[0].annualMiles, name: 'PolicyVehicleAnnualMiles' };
            dataObj['PolicyVehicleYearsVehicleOwned'] = { type: 'text', value: staticDataObj.vehicles[0].yearsVehicleOwned, name: 'PolicyVehicleYearsVehicleOwned' };
            dataObj['PolicyVehicleUse'] = { type: 'select-one', value: staticDataObj.vehicles[0].vehicleUse, name: 'PolicyVehicleUse' };
            dataObj['PolicyVehicles1RightTrackStatus'] = { type: 'select-one', value: staticDataObj.vehicles[0].policyVehiclesTrackStatus, name: 'PolicyVehicles1RightTrackStatus' };
            dataObj['PolicyVehiclemp_GaragedLocation_ID'] = { type: 'select-one', value: staticDataObj.vehicles[0].garagedLocation, name: 'PolicyVehiclemp_GaragedLocation_ID' };
            dataObj['PolicyVehiclemp_PrincipalOperator_ID'] = { type: 'select-one', value: staticDataObj.vehicles[0].principalOperator, name: 'PolicyVehiclemp_PrincipalOperator_ID' };
          }
        }
        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          for (const j in bodyData.drivers) {
            const element = bodyData.drivers[j];
            dataObj['PolicyDriverPersonFirstName'] = { type: 'text', value: element.firstName || staticDataObj.drivers[0].firstName, name: 'PolicyDriverPersonFirstName' };
            dataObj['PolicyDriverPersonLastName'] = { type: 'text', value: element.lastName || staticDataObj.drivers[0].lastName, name: 'PolicyDriverPersonLastName' };
            dataObj['PolicyDriverPersonEducation'] = { type: 'select-one', value: staticDataObj.drivers[0].education, name: 'PolicyDriverPersonEducation' };
            dataObj['PolicyDriverPersonGender'] = { type: 'select-one', value: staticDataObj.drivers[0].gender, name: 'PolicyDriverPersonGender' };
            dataObj['PolicyDriverPersonBirthdate'] = { type: 'text', value: element.applicantBirthDt || staticDataObj.drivers[0].birthDate, name: 'PolicyDriverPersonBirthdate' };
            dataObj['PolicyDriverPersonMaritalStatus'] = { type: 'select-one', value: element.maritalStatus || staticDataObj.drivers[0].maritalStatus, name: 'PolicyDriverPersonMaritalStatus' };
            dataObj['PolicyDriverRelationshipToInsured'] = { type: 'select-one', value: staticDataObj.drivers[0].relationship, name: 'PolicyDriverRelationshipToInsured' };
            dataObj['PolicyDriverLicenseState'] = { type: 'select-one', value: element.licenseState || staticDataObj.drivers[0].licenseState, name: 'PolicyDriverLicenseState' };
            dataObj['PolicyDriverPersonCommonOccupationCategory'] = { type: 'select-one', value: staticDataObj.drivers[0].commonOccupation, name: 'PolicyDriverPersonCommonOccupationCategory' };
            dataObj['PolicyDriverPersonOccupationCategory'] = { type: 'select-one', value: staticDataObj.drivers[0].commonOccupation, name: 'PolicyDriverPersonOccupationCategory' };
            dataObj['PolicyDriverFirstAgeLicensed'] = { type: 'text', value: staticDataObj.drivers[0].ageWhen1stLicensed, name: 'PolicyDriverFirstAgeLicensed' };
          }
        }

        dataObj['PolicyAutoDataAnyIncidentsOnPolicyYNN'] = { type: 'radio', value: true, name: 'PolicyAutoDataAnyIncidentsOnPolicyYNN' };
        dataObj['PolicyAutoDataDeliveryVehicleYNN'] = { type: 'radio', value: true, name: 'PolicyAutoDataDeliveryVehicleYNN' };
        dataObj['PolicyAutoDataVehicleGaragingAddressYNY'] = { type: 'radio', value: true, name: 'PolicyAutoDataVehicleGaragingAddressYNY' };
        dataObj['PolicyAutoDataVerifiableYNN'] = { type: 'radio', value: true, name: 'PolicyAutoDataVerifiableYNN' };
        dataObj['PolicyAutoDataAutoBusinessType'] = { type: 'select-one', value: bodyData.reasonForPolicy || staticDataObj.reasonForPolicy, name: 'PolicyAutoDataAutoBusinessType' };
        dataObj['PolicyClientEmailAddress'] = { type: 'text', value: bodyData.email || staticDataObj.email, name: 'PolicyClientEmailAddress' };
        dataObj['PolicyClientMailingLocationAddressLine1'] = { type: 'text', value: staticDataObj.mailingAddress, name: 'PolicyClientMailingLocationAddressLine1' };
        dataObj['PolicyClientMailingLocationCity'] = { type: 'text', value: bodyData.city || staticDataObj.city, name: 'PolicyClientMailingLocationCity' };
        dataObj['PolicyClientMailingLocationState'] = { type: 'select-one', value: bodyData.state || staticDataObj.state, name: 'PolicyClientMailingLocationState' };
        dataObj['PolicyClientMailingLocationZipCode'] = { type: 'text', value: staticDataObj.zipCode, name: 'PolicyClientMailingLocationZipCode' };
        dataObj['PolicyClientPersonBirthdate'] = { type: 'text', value: bodyData.dateOfBirth || staticDataObj.birthDate, name: 'PolicyClientPersonBirthdate' };
        dataObj['PolicyClientPersonFirstName'] = { type: 'text', value: bodyData.firstName || staticDataObj.firstName, name: 'PolicyClientPersonFirstName' };
        dataObj['PolicyClientPersonLastName'] = { type: 'text', value: bodyData.lastName || staticDataObj.lastName, name: 'PolicyClientPersonLastName' };
        dataObj['PolicyClientPersonSocialSecurityNumberStatus'] = { type: 'select-one', value: bodyData.socialSecurityStatus || staticDataObj.socialSecurityStatus, name: 'PolicyClientPersonSocialSecurityNumberStatus' };
        dataObj['PolicyEffectiveDate'] = { type: 'text', value: tomorrow, name: 'PolicyEffectiveDate' };
        dataObj['PolicyRatingState'] = { type: 'select-one', value: '1', name: 'PolicyRatingState' };
        dataObj['PolicyAutoDataResidenceType'] = { type: 'select-one', value: staticDataObj.policyDataResidenceType, name: 'PolicyAutoDataResidenceType' };
        dataObj['PolicyCurrentInsuranceValue'] = { type: 'select-one', value: staticDataObj.policyCurrentInsuranceValue, name: 'PolicyCurrentInsuranceValue' };
        dataObj['PolicyVehicles1RightTrackStatus'] = { type: 'select-one', value: staticDataObj.policyVehiclesTrackStatus, name: 'PolicyVehicles1RightTrackStatus' };
        dataObj['PolicyDataPackageSelection'] = { type: 'select-one', value: staticDataObj.policyDataPackageSelection, name: 'PolicyAutoDataPackageSelection' };
        dataObj['PolicyVehicles1CoverageCOMPLimitDed'] = { type: 'select-one', value: staticDataObj.policyVehiclesCoverage, name: 'PolicyVehicles1CoverageCOMPLimitDed' };
        return dataObj;
      }

      async function loadStep(step, navigate) {
        try {
          console.log(`Safeco AL ${step} Step`);
          await page.waitFor(500);
          if (navigate) {
            await navigateMenu(step);
            await page.waitForNavigation();
          }
          await page.waitFor(1500);
        } catch (error) {
          await exitFail(error, 'load');
        }
      }

      async function saveStep() {
        try {
          console.log('Safeco AL Save Step');
          await page.waitFor(500);
          await page.evaluate(() => {
            const save = document.getElementById('Save');
            save.click();
          });
          await page.waitFor(2000);
        } catch (error) {
          await exitFail(error, 'save');
        }
      }

      async function navigateMenu(step) {
        try {
          await page.waitFor(1000);
          if (step === 'driver') {
            await page.evaluate(() => {
              ecfields.noValidate(); __doPostBack('ScreenTabs1', 'driver');
            });
          } else if (step === 'vehicle') {
            await page.evaluate(() => {
              ecfields.noValidate(); __doPostBack('ScreenTabs1', 'vehicle');
            });
          } else if (step === 'telematics') {
            await page.evaluate(() => {
              ecfields.noValidate(); __doPostBack('ScreenTabs1', 'telematics');
            });
          } else if (step === 'underwriting') {
            await page.evaluate(() => {
              ecfields.noValidate(); __doPostBack('ScreenTabs1', 'underwriting');
            });
          } else if (step === 'coverages') {
            await page.evaluate(() => {
              ecfields.noValidate(); __doPostBack('ScreenTabs1', 'coverage');
            });
          } else if (step === 'summary') {
            await page.evaluate(() => {
              ecfields.noValidate(); __doPostBack('ScreenTabs1', 'summary');
            });
          }
        } catch (error) {
          await exitFail(error, 'NavigateMenu');
        }
      }

      async function exitFail(error, step) {
        console.log(`Error during Safeco AL ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: `There is some error validations at ${step} step`,
            stepResult,
          };
        }
        browser.close();
        return next();
      }

      async function exitSuccess(step, quoteID) {
        try {
          req.session.data = {
            title: `Successfully finished Safeco AL ${step} Step`,
            status: true,
            quoteId: quoteID,
            stepResult,
          };
          browser.close();
          return next();
        } catch (error) {
          console.log('error from exitSuccess', error);
          await exitFail(error, 'exitSuccess');
        }
      }

      page.on('dialog', async (dialog) => {
        try {
          await dialog.dismiss();
        } catch (e) {
          console.log('dialog close');
        }
      });

    } catch (error) {
      console.log('Error  at Safeco AL :', error);
      return next(Boom.badRequest('Failed to retrieved safeco AL rate.'));
    }
  },
};
