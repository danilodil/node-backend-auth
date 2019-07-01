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
        garagedInfo: false,
        houseHold: false,
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
        policyVehiclesTrackStatus: 'NP',
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
        annualMiles: '50',
        yearsVehicleOwned: '5',
      };

      const populatedPolicyInfoObject = await populatePolicyInfoObject();
      const populatedHouseHoldInfoObject = await populateHouseHoldInfoObject();
      const populatedDriverInfoObject = await populateDriverInfoObject();
      const populatedVehicleInfoObject = await populateVehicleInfoObject();
      const populatedUnderwritingObject = await populateUnderwritingObject();
      const populatedCoverageInfoObject = await populateCoverageInfoObject();
      const populatedTelematicsInfoObject = await populateTelematicsInfoObject();

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
          const quoteId = `${populatedPolicyInfoObject.PolicyClientPersonLastName.value}, ${populatedPolicyInfoObject.PolicyClientPersonFirstName.value}`;
          req.session.data = {
            title: 'Successfully finished Safeco AL Named Insured Step',
            status: true,
            quoteId: quoteId,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'garagedInfo' && raterStore) {
          await GaragedInfoStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedPolicyInfoObject.PolicyClientPersonLastName.value}, ${populatedPolicyInfoObject.PolicyClientPersonFirstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL Garaged Info Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'houseHold' && raterStore) {
          await houseHoldStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedPolicyInfoObject.PolicyClientPersonLastName.value}, ${populatedPolicyInfoObject.PolicyClientPersonFirstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL HouseHold Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'drivers' && raterStore) {
          await driversStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedPolicyInfoObject.PolicyClientPersonLastName.value}, ${populatedPolicyInfoObject.PolicyClientPersonFirstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL Drivers Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'vehicles' && raterStore) {
          await vehiclesStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedPolicyInfoObject.PolicyClientPersonLastName.value}, ${populatedPolicyInfoObject.PolicyClientPersonFirstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL Vehicles Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'summary' && raterStore) {
          await finalSteps();
        }
      }

      async function existingQuote() {
        console.log('Safeco AL existing Quote Step');
        try {
          await page.waitFor(8000);
          await page.goto(safecoAlRater.EXISTING_QUOTE_URL, { waitUntil: 'load' });
          await page.waitFor(5000);
          await page.select('#SAMSearchBusinessType', '7|1|');
          await page.select('#SAMSearchModifiedDateRange', '7');
          await page.select('#SAMSearchActivityStatus', '8');
          await page.type('#SAMSearchName', ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedPolicyInfoObject.PolicyClientPersonLastName.value}, ${populatedPolicyInfoObject.PolicyClientPersonFirstName.value}`));
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
          console.log('Error at Safeco AL Existing Quote Step:', err);
          stepResult.existingQuote = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at existing Quote Step',
            stepResult,
          };
          browser.close();
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
          console.log('Error at Safeco AL Login Step:', error);
          stepResult.login = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at loginStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function newQuoteStep() {
        try {
          console.log('Safeco AL New Quote Step.');
          await page.waitFor(2000);
          await page.goto(safecoAlRater.NEW_QUOTE_START_AUTO_URL, { waitUntil: 'domcontentloaded' });
          stepResult.newQuote = true;
        } catch (err) {
          console.log('Error at Safeco AL New Quote Step:', err);
          stepResult.newQuote = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at newQuoteStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function policyInfoStep() {
        console.log('Safeco AL Policy Information Step.');
        try {
          await page.waitFor(3000);
          page.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i)
              console.log(`${msg.args()[i]}`);
          });
          await page.waitFor(1000);
          await fillPageForm(populatedPolicyInfoObject, 'driver');
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

      async function GaragedInfoStep() {
        console.log('Safeco AL Garaged Info Step');
        try {
          await page.waitFor(800);
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'garagedlocation');
          });
          await page.waitFor(1000);
          await page.waitForSelector('#PolicyLocations2AddressLine1');
          await page.evaluate((garagedAddress) => { document.querySelector(garagedAddress.element).value = garagedAddress.value; }, populatedData.garagedAddress);

          await page.click(populatedData.garagedZipcode.element);
          await page.evaluate((garagedZipcode) => { document.querySelector(garagedZipcode.element).value = garagedZipcode.value; }, populatedData.garagedZipcode);

          await page.waitFor(1500);
          await page.evaluate((garagedCity) => {
            document.querySelector(garagedCity.element).value = garagedCity.value;
          }, populatedData.garagedCity);

          await page.waitFor(1500);
          await page.evaluate(() => document.querySelector('#Continue').click());
          stepResult.garagedInfo = true;
        } catch (err) {
          console.log('Error at Safeco AL Garaged Info:', err);
          stepResult.garagedInfo = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at GaragedInfoStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function houseHoldStep() {
        console.log('Safeco AL House Hold Step');
        try {
          await page.waitFor(5000);
          await fillPageForm(populatedHouseHoldInfoObject, 'driver');

          stepResult.houseHold = true;
        } catch (e) {
          console.log('Error at Safeco AL House Hold:', e);
          stepResult.houseHold = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at houseHoldStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function driversStep() {
        console.log('Safeco AL Drivers Step.');
        try {
          await page.waitFor(3000);
          await fillPageForm(populatedDriverInfoObject, 'vehicle');
          stepResult.drivers = true;
        } catch (err) {
          console.log('Error at Safeco AL Driver Step:', err.stack);
          stepResult.drivers = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at driverStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function vehiclesStep() {
        console.log('Safeco AL Vehicles Step.');
        try {
          await page.waitFor(3000);
          await fillPageForm(populatedVehicleInfoObject, 'telematics');
          await page.waitFor(2000);
          stepResult.vehicles = true;
        } catch (err) {
          console.log('Error at Safeco AL Vehicles Step:', err.stack);
          stepResult.vehicles = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at vehiclesStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function telemeticsStep() {
        console.log('Safeco AL Telemetics Step.');
        try {
          await page.waitFor(2000);
          await fillPageForm(populatedTelematicsInfoObject, 'underwriting');
          stepResult.telemetics = true;
        } catch (err) {
          console.log('err telemetics:', err);
          stepResult.telemetics = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at telemeticsStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function underwritingStep() {
        console.log('Safeco AL Underwriting Step.');
        try {
          await page.waitFor(2000);
          await fillPageForm(populatedUnderwritingObject, 'coverage');
          await page.waitFor(2000);
          stepResult.underWriting = true;
        } catch (err) {
          console.log('Error at Safeco AL Underwriting Step:', err);
          stepResult.underWriting = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at underwritingStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function coveragesStep() {
        console.log('Safeco AL Coverages Step.');
        try {
          await page.waitFor(2000);
          await page.waitForSelector('#PolicyAutoDataPackageSelection');
          await page.waitFor(2000);
          await fillPageForm(populatedCoverageInfoObject, 'summary');
          stepResult.coverage = true;
        } catch (err) {
          console.log('Error at Safeco AL Coverages Step:', err);
          stepResult.coverage = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at coveragesStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function summaryStep() {
        console.log('Safeco AL Summary Step.');
        try {
          await page.waitFor(2000);
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
          browser.close();
          return next();
        } catch (err) {
          console.log('Error at Safeco AL Summary Step:', err);
          stepResult.summary = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at summaryStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      // nextStep can be 'policyinfo', 'vehicle', 'driver', 'telematics', 'underwriting' 'coverages', 'summary'
      async function fillPageForm(pData, nextStep) {
        try {
          await page.evaluate(async (data, nextStep) => {
            if (ecfields) {
              ecfields.clearErrors();
            }
            if (ecfields.buildModalErr) {
              ecfields.buildModalErr = function () { };
            }
            if (ecfields.buildModalHtml) {
              ecfields.buildModalHtml = function () { };
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
            async function getBestValue(value, data) {
              try {
                const optionsArray = [...data];
                const nArr = optionsArray.map(entry => entry.text);
                const vArr = optionsArray.map(entry => entry.value);
                if (value && value.length && value.length > 0 && value.length < 2) {
                  if (vArr.indexOf(value) !== -1) {
                    return value;
                  }
                } else if (value && value.length > 1) {
                  const nBestMatch = await findBestMatch(value, nArr);
                  const vBestMatch = await findBestMatch(value, vArr);
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
                  } else if (xField.type === 'click') {
                    await document.querySelector(`#${xField.name}`).click();
                  }
                }
              }
            }
            ecfields.noValidate();
            __doPostBack('ScreenTabs1', nextStep);
          }, pData, nextStep);
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

      function populatePolicyInfoObject() {
        const policyInfoData = {
          PolicyAutoDataAnyIncidentsOnPolicyYNN: { type: 'radio', value: true, name: 'PolicyAutoDataAnyIncidentsOnPolicyYNN' },
          PolicyAutoDataDeliveryVehicleYNN: { type: 'radio', value: true, name: 'PolicyAutoDataDeliveryVehicleYNN' },
          PolicyAutoDataVehicleGaragingAddressYNY: { type: 'radio', value: true, name: 'PolicyAutoDataVehicleGaragingAddressYNY' },
          PolicyAutoDataVerifiableYNN: { type: 'radio', value: true, name: 'PolicyAutoDataVerifiableYNN' },
          PolicyAutoDataAutoBusinessType: { type: 'select-one', value: bodyData.reasonForPolicy || staticDataObj.reasonForPolicy, name: 'PolicyAutoDataAutoBusinessType' },
          PolicyClientEmailAddress: { type: 'text', value: bodyData.email || staticDataObj.email, name: 'PolicyClientEmailAddress' },
          PolicyClientMailingLocationAddressLine1: { type: 'text', value: bodyData.mailingAddress || staticDataObj.mailingAddress, name: 'PolicyClientMailingLocationAddressLine1' },
          PolicyClientMailingLocationCity: { type: 'text', value: bodyData.city || staticDataObj.city, name: 'PolicyClientMailingLocationCity' },
          PolicyClientMailingLocationState: { type: 'select-one', value: bodyData.state || staticDataObj.state, name: 'PolicyClientMailingLocationState' },
          PolicyClientMailingLocationZipCode: { type: 'text', value: bodyData.zipCode || staticDataObj.zipCode, name: 'PolicyClientMailingLocationZipCode' },
          PolicyClientPersonBirthdate: { type: 'text', value: bodyData.dateOfBirth || staticDataObj.birthDate, name: 'PolicyClientPersonBirthdate' },
          PolicyClientPersonFirstName: { type: 'text', value: bodyData.firstName || staticDataObj.firstName, name: 'PolicyClientPersonFirstName' },
          PolicyClientPersonLastName: { type: 'text', value: bodyData.lastName || staticDataObj.lastName, name: 'PolicyClientPersonLastName' },
          PolicyClientPersonSocialSecurityNumberStatus: { type: 'select-one', value: bodyData.socialSecurityStatus || staticDataObj.socialSecurityStatus, name: 'PolicyClientPersonSocialSecurityNumberStatus' },
          PolicyEffectiveDate: { type: 'text', value: tomorrow, name: 'PolicyEffectiveDate' },
          PolicyRatingState: { type: 'select-one', value: '1', name: 'PolicyRatingState' },
        };
        return policyInfoData;
      }

      function populateHouseHoldInfoObject() {
        const houseHoldInfoData = {
          PolicyDriverCandidates2CandidateRelationship: { type: 'select-one', value: staticDataObj.peopleInhouseHold1, name: 'PolicyDriverCandidates2CandidateRelationship' },
          PolicyDriverCandidates3CandidateRelationship: { type: 'select-one', value: staticDataObj.peopleInhouseHold2, name: 'PolicyDriverCandidates3CandidateRelationship' },
          PolicyDriverCandidates4CandidateRelationship: { type: 'select-one', value: staticDataObj.peopleInhouseHold3, name: 'PolicyDriverCandidates4CandidateRelationship' },
        };
        return houseHoldInfoData;
      }

      function populateUnderwritingObject() {
        const underwritingInfoData = {
          PolicyAutoDataResidenceType: { type: 'select-one', value: staticDataObj.policyDataResidenceType, name: 'PolicyAutoDataResidenceType' },
          PolicyCurrentInsuranceValue: { type: 'select-one', value: staticDataObj.policyCurrentInsuranceValue, name: 'PolicyCurrentInsuranceValue' },
        };
        return underwritingInfoData;
      }

      function populateDriverInfoObject() {
        const driverInfoData = {
          PolicyDriverPersonFirstName: { type: 'text', value: staticDataObj.firstName, name: 'PolicyDriverPersonFirstName' },
          PolicyDriverPersonLastName: { type: 'text', value: staticDataObj.lastName, name: 'PolicyDriverPersonLastName' },
          PolicyDriverPersonEducation: { type: 'select-one', value: staticDataObj.education, name: 'PolicyDriverPersonEducation' },
          PolicyDriverPersonGender: { type: 'select-one', value: staticDataObj.gender, name: 'PolicyDriverPersonGender' },
          PolicyDriverPersonBirthdate: { type: 'text', value: staticDataObj.birthDate, name: 'PolicyDriverPersonBirthdate' },
          PolicyDriverPersonMaritalStatus: { type: 'select-one', value: staticDataObj.maritalStatus, name: 'PolicyDriverPersonMaritalStatus' },
          PolicyDriverRelationshipToInsured: { type: 'select-one', value: staticDataObj.relationship, name: 'PolicyDriverRelationshipToInsured' },
          PolicyDriverLicenseState: { type: 'select-one', value: staticDataObj.licenseState, name: 'PolicyDriverLicenseState' },
          PolicyDriverLicenseSuspendedRevokedYNN: { type: 'radio', value: false, name: 'PolicyDriverLicenseSuspendedRevokedYNN' },
          PolicyDriverPersonCommonOccupationCategory: { type: 'select-one', value: staticDataObj.commonOccupation, name: 'PolicyDriverPersonCommonOccupationCategory' },
          PolicyDriverPersonOccupationCategory: { type: 'select-one', value: staticDataObj.commonOccupation, name: 'PolicyDriverPersonOccupationCategory' },
          PolicyDriverSR22FilingYNN: { type: 'radio', value: false, name: 'PolicyDriverSR22FilingYNN' },
          PolicyDriverSR22FilingYN2N: { type: 'radio', value: false, name: 'PolicyDriverSR22FilingYN2N' },
          PolicyDriverFirstAgeLicensed: { type: 'text', value: staticDataObj.ageWhen1stLicensed, name: 'PolicyDriverFirstAgeLicensed' },
        };
        return driverInfoData;
        // const driversInfoData = [];
        // if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
        //   for (const j in bodyData.drivers) {
        //     const driverInfoData = {
        //       PolicyDriverPersonFirstName: { type: 'text', value: bodyData.drivers[j].firstName || staticDataObj.firstName, name: 'PolicyDriverPersonFirstName' },
        //       PolicyDriverPersonLastName: { type: 'text', value: bodyData.drivers[j].lastName || staticDataObj.lastName, name: 'PolicyDriverPersonLastName' },
        //       PolicyDriverPersonEducation: { type: 'select-one', value: bodyData.drivers[j].education || staticDataObj.education, name: 'PolicyDriverPersonEducation' },
        //       PolicyDriverPersonGender: { type: 'select-one', value: bodyData.drivers[j].gender || staticDataObj.gender, name: 'PolicyDriverPersonGender' },
        //       PolicyDriverPersonBirthdate: { type: 'text', value: bodyData.drivers[j].applicantBirthDt || staticDataObj.birthDate, name: 'PolicyDriverPersonBirthdate' },
        //       PolicyDriverPersonMaritalStatus: { type: 'select-one', value: bodyData.drivers[j].maritalStatus || staticDataObj.maritalStatus, name: 'PolicyDriverPersonMaritalStatus' },

        //       PolicyDriverRelationshipToInsured: { type: 'select-one', value: bodyData.drivers[j].relationship || staticDataObj.relationship, name: 'PolicyDriverRelationshipToInsured' },
        //       PolicyDriverLicenseState: { type: 'select-one', value: staticDataObj.licenseState, name: 'PolicyDriverLicenseState' },
        //       PolicyDriverLicenseSuspendedRevokedYNN: { type: 'radio', value: false, name: 'PolicyDriverLicenseSuspendedRevokedYNN' },
        //       // PolicyDriverPersonBusinessTypeCategory: {type: "select-one", value: "", name: "PolicyDriverPersonBusinessTypeCategory"},
        //       PolicyDriverPersonCommonOccupationCategory: { type: 'select-one', value: bodyData.drivers[j].commonOccupation || staticDataObj.commonOccupation, name: 'PolicyDriverPersonCommonOccupationCategory' },
        //       PolicyDriverPersonOccupationCategory: { type: 'select-one', value: bodyData.drivers[j].commonOccupation || staticDataObj.commonOccupation, name: 'PolicyDriverPersonOccupationCategory' },
        //       PolicyDriverSR22FilingYNN: { type: 'radio', value: false, name: 'PolicyDriverSR22FilingYNN' },
        //       PolicyDriverSR22FilingYN2N: { type: 'radio', value: false, name: 'PolicyDriverSR22FilingYN2N' },
        //       PolicyDriverFirstAgeLicensed: { type: 'text', value: bodyData.drivers[j].ageWhen1stLicensed || staticDataObj.ageWhen1stLicensed, name: 'PolicyDriverFirstAgeLicensed' },
        //     };
        //     driversInfoData.push(driverInfoData);
        //   }
        // }
        // return driversInfoData;
      }

      function populateVehicleInfoObject() {

        const vehicleInfoData = {
          PolicyVehicleVINKnownYNY: { type: 'radio', value: true, name: 'PolicyVehicleVINKnownYNY' },
          PolicyVehicleVIN: { type: 'text', value: staticDataObj.vehicleVin, name: 'PolicyVehicleVIN' },
          imgVINLookUp: { type: 'click', value: true, name: 'imgVINLookUp' },
          PolicyVehicleAnnualMiles: { type: 'text', value: staticDataObj.annualMiles, name: 'PolicyVehicleAnnualMiles' },
          PolicyVehicleYearsVehicleOwned: { type: 'text', value: staticDataObj.yearsVehicleOwned, name: 'PolicyVehicleYearsVehicleOwned' },
          PolicyVehicleUse: { type: 'select-one', value: staticDataObj.vehicleUse, name: 'PolicyVehicleUse' },
          PolicyVehicles1RightTrackStatus: { type: 'select-one', value: staticDataObj.policyVehiclesTrackStatus, name: 'PolicyVehicles1RightTrackStatus' },
          PolicyVehiclemp_GaragedLocation_ID: { type: 'select-one', value: staticDataObj.garagedLocation, name: 'PolicyVehiclemp_GaragedLocation_ID' },
          PolicyVehiclemp_PrincipalOperator_ID: { type: 'select-one', value: staticDataObj.principalOperator, name: 'PolicyVehiclemp_PrincipalOperator_ID' },
        };
        return vehicleInfoData;
        // const vehiclesInfoData = [];
        // if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
        //   for (const j in bodyData.vehicles) {
        //     const vehicleInfoData = {
        //       PolicyVehicleVINKnownYNY: { type: 'radio', value: true, name: 'PolicyVehicleVINKnownYNY' },
        //       PolicyVehicleVIN: { type: 'text', value: bodyData.vehicles[j].vehicleVin || staticDataObj.vehicleVin, name: 'PolicyVehicleVIN' },
        //       imgVINLookUp: { type: 'click', value: true, name: 'imgVINLookUp' },
        //       PolicyVehicleAnnualMiles: { type: 'text', value: staticDataObj.annualMiles, name: 'PolicyVehicleAnnualMiles' },
        //       PolicyVehicleYearsVehicleOwned: { type: 'text', value: staticDataObj.yearsVehicleOwned, name: 'PolicyVehicleYearsVehicleOwned' },
        //       PolicyVehicleUse: { type: 'select-one', value: staticDataObj.vehicleUse, name: 'PolicyVehicleUse' },
        //       PolicyVehicles1RightTrackStatus: { type: 'select-one', value: staticDataObj.policyVehiclesTrackStatus, name: 'PolicyVehicles1RightTrackStatus' },
        //       PolicyVehiclemp_GaragedLocation_ID: { type: 'select-one', value: staticDataObj.garagedLocation, name: 'PolicyVehiclemp_GaragedLocation_ID' },
        //       PolicyVehiclemp_PrincipalOperator_ID: { type: 'select-one', value: staticDataObj.principalOperator, name: 'PolicyVehiclemp_PrincipalOperator_ID' },
        //     };
        //     vehiclesInfoData.push(vehicleInfoData);
        //   }
        // }
        // return vehiclesInfoData;
        // }
      }

      function populateCoverageInfoObject() {

        const coverageInfoData = {
          PolicyDataPackageSelection: { type: 'select-one', value: staticDataObj.policyDataPackageSelection, name: 'PolicyAutoDataPackageSelection' },
          PolicyVehicles1CoverageCOMPLimitDed: { type: 'select-one', value: staticDataObj.policyVehiclesCoverage, name: 'PolicyVehicles1CoverageCOMPLimitDed' },
        };
        return coverageInfoData;
      }

      function populateTelematicsInfoObject() {
        const telematicsInfoData = {
          PolicyVehicles1RightTrackStatus: { type: 'select-one', value: staticDataObj.policyVehiclesTrackStatus, name: 'PolicyVehicles1RightTrackStatus' },

        };
        return telematicsInfoData;
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
