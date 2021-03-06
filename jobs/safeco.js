/* eslint-disable no-restricted-syntax, no-console, no-loop-func, no-inner-declarations,
consistent-return, func-names, no-undef, no-use-before-define, no-plusplus, no-await-in-loop */

const puppeteer = require('puppeteer');
const Queue = require('bull');
const { safecoRater } = require('../constants/appConstant');
const { saveRatingFromJob } = require('../controllers/rater');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate } = require('../lib/utils');

const safecoAutoQueue = new Queue('safecoAuto', ENVIRONMENT.redisUrl);
const safecoHomeQueue = new Queue('safecoHome', ENVIRONMENT.redisUrl);
const maxJobsPerWorker = 1;

module.exports = {
  safecoAutoQueue,
  safecoHomeQueue,
};

safecoAutoQueue.process(maxJobsPerWorker, async (job, done) => {
  try {
    await safecoAuto(job.data);
    done();
  } catch (e) {
    console.log('error on process queue', e);
    done(new Error(e));
  }
});

async function safecoAuto(req) {
  try {
    console.log('Added to safecoAutoQueue');
    const params = req.body;
    const { username, password } = req.body.decoded_vendor;
    // const { raterStore } = req.session;
    const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    const { raterStore } = req;
    let browserParams = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    if (ENVIRONMENT.nodeEnv === 'local') {
      browserParams = { headless: false };
    }
    const browser = await puppeteer.launch(browserParams);
    const page = await browser.newPage();

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

    let quoteId = null;
    let response = null;


    if (raterStore && raterStore.stepResult) { // eslint-disable-next-line prefer-destructuring
      stepResult = raterStore.stepResult;
    }

    const populatedData = await populateData();

    await loginStep();
    if (raterStore && raterStore.quoteId) {
      await existingQuote();
    } else {
      await newQuoteStep();
    }
    if (!params.stepName || params.stepName === 'all') {
      await policyInfoStep();
      await driversStep();
      await vehiclesStep();
      await finalSteps();
    } else {
      if (params.stepName === 'namedInsured') {
        await policyInfoStep();
        quoteId = `${bodyData.lastName}, ${bodyData.firstName}`;
        await exitSuccess('Named Insured', quoteId);
      }
      if (params.stepName === 'drivers' && raterStore) {
        await driversStep();
        if (params.sendSummary && params.sendSummary === 'true') {
          await finalSteps();
        } else {
          quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
          await exitSuccess('Drivers', quoteId);
        }
      }
      if (params.stepName === 'vehicles' && raterStore) {
        await vehiclesStep();
        if (params.sendSummary && params.sendSummary === 'true') {
          await finalSteps();
        } else {
          quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
          await exitSuccess('Vehicles', quoteId);
        }
      }
      if (params.stepName === 'summary' && raterStore) {
        await finalSteps();
      }
    }

    async function existingQuote() {
      console.log('Safeco existing Quote Step');
      try {
        quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
        await page.waitFor(8000);
        await page.goto(safecoRater.EXISTING_QUOTE_URL, { waitUntil: 'load' });
        await page.waitFor(5000);
        await page.select('#SAMSearchBusinessType', '7|1|');
        await page.select('#SAMSearchModifiedDateRange', '1');
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
        await exitFail(err, 'Existing Quote');
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
        console.log('Safeco Login Step.');
        await page.goto(safecoRater.LOGIN_URL, { waitUntil: 'domcontentloaded' });
        await page.waitFor(1000);
        await page.waitForSelector('#username');
        await page.type('#username', username);
        await page.type('#password', password);
        await page.evaluate(() => document.querySelector('#submit1').click());
        await page.waitForNavigation({ waitUntil: 'load' });
        stepResult.login = true;
      } catch (error) {
        await exitFail(error, 'login');
      }
    }

    async function newQuoteStep() {
      try {
        console.log('Safeco New Quote Step.');
        await page.waitFor(2000);
        await page.goto(safecoRater.NEW_QUOTE_START_AUTO_URL, { waitUntil: 'domcontentloaded' });
        stepResult.newQuote = true;
      } catch (err) {
        await exitFail(err, 'New Quote');
      }
    }

    async function policyInfoStep() {
      if (response) return;
      try {
        await page.waitFor(3000);
        await loadStep('policyinfo', false);
        await fillPageForm(null, null, 1000);
        await saveStep();
        stepResult.policyInfo = true;
      } catch (err) {
        console.log('Error at Safeco Policy Information Step:', err);
        stepResult.policyInfo = false;
        await exitFail(err, 'Policy Info');
      }
    }

    async function driversStep() {
      if (response) return;
      try {
        await fillPageForm(null, null, 1000);
        await loadStep('driver', true);
        const afterCustomCode = async function () {
          for (const j in bodyData.drivers) {
            if (Object.prototype.hasOwnProperty.call(bodyData.drivers, j)) {
              page.evaluate(async () => {
                const PolicyDriverSR22FilingYNN = document.getElementById('PolicyDriverSR22FilingYNN');
                const PolicyDriverSR22FilingYN2N = document.getElementById('PolicyDriverSR22FilingYN2N');
                const LicenseSuspendedRevokedYNNexist = document.getElementById('PolicyDriverLicenseSuspendedRevokedYNN');
                if (PolicyDriverSR22FilingYNN) {
                  PolicyDriverSR22FilingYNN.click();
                  PolicyDriverSR22FilingYN2N.click();
                  LicenseSuspendedRevokedYNNexist.click();
                }
              }, populatedData, j);
              page.waitFor(1000);
            }
          }
        };
        await fillPageForm(null, afterCustomCode);
        await saveStep();
        stepResult.drivers = true;
      } catch (err) {
        await exitFail(err, 'Driver');
      }
    }

    async function vehiclesStep() {
      if (response) return;
      try {
        await page.waitFor(5000);
        await loadStep('vehicle', true);
        const afterCustomCode = async function () {
          for (const j in bodyData.vehicles) {
            if (Object.prototype.hasOwnProperty.call(bodyData.vehicles, j)) {
              page.evaluate(async (data) => {
                const vinExist = document.getElementById('PolicyVehicleVINKnownYNY');
                const vinEl = document.getElementById('PolicyVehicleVIN');
                const vinBtn = document.getElementById('imgVINLookUp');
                if (vinEl) {
                  vinExist.click();
                  vinEl.value = data.PolicyVehicleVIN.value;
                  vinBtn.click();
                }
              }, populatedData, j);
              page.waitFor(1000);
            }
          }
        };

        await fillPageForm(null, afterCustomCode);
        await page.waitFor(2000);
        await fillPageForm(null, null, 1000);

        await saveStep();
        stepResult.vehicles = true;
      } catch (err) {
        await exitFail(err, 'Vehicles');
      }
    }

    async function telemeticsStep() {
      if (response) return;
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
      if (response) return;
      try {
        await page.waitFor(2000);
        await loadStep('underwriting', true);
        await fillPageForm(null, null, 1000);
        await loadStep('underwriting', true);
        await fillPageForm(null, null, 1000);
        stepResult.underWriting = true;
      } catch (err) {
        await exitFail(err, 'Underwriting');
      }
    }

    async function coveragesStep() {
      if (response) return;
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
        response = {
          title: 'Successfully retrieved safeco rate.',
          status: true,
          totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
          months: premiumDetails.plan ? premiumDetails.plan : null,
          downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
          stepResult,
        };
        browser.close();
        saveRatingFromJob(req, response);
      } catch (err) {
        await exitFail(err, 'Summary');
      }
    }

    async function fillPageForm(beforeCustomCode, afterCustomCode, delayAfter) {
      try {
        page.on('console', (msg) => {
          for (let i = 0; i < msg.args().length; i += 1) console.log(`${msg.args()[i]}`);
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

          const list = data; // eslint-disable-next-line guard-for-in
          for (const fieldName in list) {
            const ecField = list[fieldName] ? list[fieldName] : null;
            const xField = data[fieldName] ? data[fieldName] : null;
            if (ecField) {
              ecField.required = false;
              ecField.rules = [];
              ecField.disabled = false;
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
                  el.checked = !!((xField.value && xField.value === true));
                }
              }
            }
          }

          function compareTwoStrings(firstString, secondString) {
            const first = firstString.replace(/\s+/g, '');
            const second = secondString.replace(/\s+/g, '');

            if (!first.length && !second.length) return 1; // if both are empty strings
            if (!first.length || !second.length) return 0; // if only one is empty string
            if (first === second) return 1; // identical
            if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
            if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

            const firstBigrams = new Map();
            for (let i = 0; i < first.length - 1; i += 1) {
              const bigram = first.substring(i, i + 2);
              const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram) + 1
                : 1;

              firstBigrams.set(bigram, count);
            }

            let intersectionSize = 0;
            for (let i = 0; i < second.length - 1; i += 1) {
              const bigram = second.substring(i, i + 2);
              const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram)
                : 0;

              if (count > 0) {
                firstBigrams.set(bigram, count - 1);
                intersectionSize += 1;
              }
            }

            return (2.0 * intersectionSize) / (first.length + second.length - 2);
          }
          function findBestMatch(mainString, targetStrings) {
            if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');

            const ratings = [];
            let bestMatchIndex = 0;

            for (let i = 0; i < targetStrings.length; i += 1) {
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
                const bestMatchRating = vBestMatch.bestMatch.rating === nBestMatch.bestMatch.rating;
                let i = 0;
                if (nBestMatch.bestMatch.rating > vBestMatch.bestMatch.rating) {
                  i = nBestMatch.bestMatchIndex;
                } else if (vBestMatch.bestMatch.rating > nBestMatch.bestMatch.rating) {
                  i = vBestMatch.bestMatchIndex;
                } else if (bestMatchRating && nBestMatch.bestMatch.rating >= 0.75) {
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
        await exitFail(err, 'FillPageForm');
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
        policyCurrentInsuranceValue: 'CI',
        policyPrevInsuranceCarrierValue: 'Allstate',
        policyAutoDataPrevLiabilityType: 'NO',
        policyAutoDataPriorAutoPolicyExpirationDate: '06/01/2020',
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
        prevLiabilityType: 'BI',
        priorPolicyDuration: '5',
        vehicles: [
          {
            // Vehicle Type willways be 1981 or newer
            vehicleVin: '1FTSF30L61EC23425',
            vehicleUse: '8',
            annualMiles: 10000,
            yearsVehicleOwned: 5,
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
            education: 'BS',
          },
        ],
      };

      const dataObj = {};
      if (Object.prototype.hasOwnProperty.call(bodyData, 'vehicles') && bodyData.vehicles.length > 0) {
        for (const j in bodyData.vehicles) {
          if (Object.prototype.hasOwnProperty.call(bodyData.vehicles, j)) {
            const element = bodyData.vehicles[j];
            dataObj.PolicyVehicleVINKnownYNY = { type: 'radio', value: true, name: 'PolicyVehicleVINKnownYNY' };
            dataObj.PolicyVehicleVIN = { type: 'text', value: element.vehicleVin || staticDataObj.vehicles[0].vehicleVin, name: 'PolicyVehicleVIN' };
            dataObj.PolicyVehicleAnnualMiles = { type: 'text', value: element.annualMiles || staticDataObj.vehicles[0].annualMiles, name: 'PolicyVehicleAnnualMiles' };
            dataObj.PolicyVehicleYearsVehicleOwned = { type: 'text', value: element.yearsVehicleOwned || staticDataObj.vehicles[0].yearsVehicleOwned, name: 'PolicyVehicleYearsVehicleOwned' };
            dataObj.PolicyVehicleUse = { type: 'select-one', value: element.vehicleUse || staticDataObj.vehicles[0].vehicleUse, name: 'PolicyVehicleUse' };
            dataObj.PolicyVehicles1RightTrackStatus = { type: 'select-one', value: staticDataObj.vehicles[0].policyVehiclesTrackStatus, name: 'PolicyVehicles1RightTrackStatus' };
            dataObj.PolicyVehiclemp_GaragedLocation_ID = { type: 'select-one', value: staticDataObj.vehicles[0].garagedLocation, name: 'PolicyVehiclemp_GaragedLocation_ID' };
            dataObj.PolicyVehiclemp_PrincipalOperator_ID = { type: 'select-one', value: staticDataObj.vehicles[0].principalOperator, name: 'PolicyVehiclemp_PrincipalOperator_ID' };
          }
        }
      }
      if (Object.prototype.hasOwnProperty.call(bodyData, 'drivers') && bodyData.drivers.length > 0) {
        for (const j in bodyData.drivers) {
          if (Object.prototype.hasOwnProperty.call(bodyData.drivers, j)) {
            const element = bodyData.drivers[j];
            dataObj.PolicyDriverPersonFirstName = { type: 'text', value: element.firstName || staticDataObj.drivers[0].firstName, name: 'PolicyDriverPersonFirstName' };
            dataObj.PolicyDriverPersonLastName = { type: 'text', value: element.lastName || staticDataObj.drivers[0].lastName, name: 'PolicyDriverPersonLastName' };
            dataObj.PolicyDriverPersonEducation = { type: 'select-one', value: staticDataObj.drivers[0].education, name: 'PolicyDriverPersonEducation' };
            dataObj.PolicyDriverPersonGender = { type: 'select-one', value: staticDataObj.drivers[0].gender, name: 'PolicyDriverPersonGender' };
            dataObj.PolicyDriverPersonBirthdate = { type: 'text', value: element.applicantBirthDt || staticDataObj.drivers[0].birthDate, name: 'PolicyDriverPersonBirthdate' };
            dataObj.PolicyDriverPersonMaritalStatus = { type: 'select-one', value: element.maritalStatus || staticDataObj.drivers[0].maritalStatus, name: 'PolicyDriverPersonMaritalStatus' };
            dataObj.PolicyDriverRelationshipToInsured = { type: 'select-one', value: staticDataObj.drivers[0].relationship, name: 'PolicyDriverRelationshipToInsured' };
            dataObj.PolicyDriverLicenseState = { type: 'select-one', value: element.licenseState || staticDataObj.drivers[0].licenseState, name: 'PolicyDriverLicenseState' };
            dataObj.PolicyDriverPersonCommonOccupationCategory = { type: 'select-one', value: staticDataObj.drivers[0].commonOccupation, name: 'PolicyDriverPersonCommonOccupationCategory' };
            dataObj.PolicyDriverPersonOccupationCategory = { type: 'select-one', value: staticDataObj.drivers[0].commonOccupation, name: 'PolicyDriverPersonOccupationCategory' };
            dataObj.PolicyDriverFirstAgeLicensed = { type: 'text', value: staticDataObj.drivers[0].ageWhen1stLicensed, name: 'PolicyDriverFirstAgeLicensed' };
          }
        }
      }

      dataObj.PolicyAutoDataAnyIncidentsOnPolicyYNN = { type: 'radio', value: true, name: 'PolicyAutoDataAnyIncidentsOnPolicyYNN' };
      dataObj.PolicyAutoDataDeliveryVehicleYNN = { type: 'radio', value: true, name: 'PolicyAutoDataDeliveryVehicleYNN' };
      dataObj.PolicyAutoDataVehicleGaragingAddressYNY = { type: 'radio', value: true, name: 'PolicyAutoDataVehicleGaragingAddressYNY' };
      dataObj.PolicyAutoDataVerifiableYNN = { type: 'radio', value: true, name: 'PolicyAutoDataVerifiableYNN' };
      dataObj.PolicyAutoDataAutoBusinessType = { type: 'select-one', value: bodyData.reasonForPolicy || staticDataObj.reasonForPolicy, name: 'PolicyAutoDataAutoBusinessType' };
      dataObj.PolicyClientEmailAddress = { type: 'text', value: bodyData.email || staticDataObj.email, name: 'PolicyClientEmailAddress' };
      dataObj.PolicyClientMailingLocationAddressLine1 = { type: 'text', value: bodyData.mailingAddress, name: 'PolicyClientMailingLocationAddressLine1' };
      dataObj.PolicyClientMailingLocationCity = { type: 'text', value: bodyData.city || staticDataObj.city, name: 'PolicyClientMailingLocationCity' };
      dataObj.PolicyClientMailingLocationState = { type: 'select-one', value: bodyData.state || staticDataObj.state, name: 'PolicyClientMailingLocationState' };
      dataObj.PolicyClientMailingLocationZipCode = { type: 'text', value: staticDataObj.zipCode, name: 'PolicyClientMailingLocationZipCode' };
      dataObj.PolicyClientPersonBirthdate = { type: 'text', value: bodyData.dateOfBirth || staticDataObj.birthDate, name: 'PolicyClientPersonBirthdate' };
      dataObj.PolicyClientPersonFirstName = { type: 'text', value: bodyData.firstName || staticDataObj.firstName, name: 'PolicyClientPersonFirstName' };
      dataObj.PolicyClientPersonLastName = { type: 'text', value: bodyData.lastName || staticDataObj.lastName, name: 'PolicyClientPersonLastName' };
      dataObj.PolicyClientPersonSocialSecurityNumberStatus = { type: 'select-one', value: bodyData.socialSecurityStatus || staticDataObj.socialSecurityStatus, name: 'PolicyClientPersonSocialSecurityNumberStatus' };
      dataObj.PolicyEffectiveDate = { type: 'text', value: tomorrow, name: 'PolicyEffectiveDate' };
      dataObj.PolicyRatingState = { type: 'select-one', value: '1', name: 'PolicyRatingState' };
      dataObj.PolicyAutoDataResidenceType = { type: 'select-one', value: staticDataObj.policyDataResidenceType, name: 'PolicyAutoDataResidenceType' };
      dataObj.PolicyCurrentInsuranceValue = { type: 'select-one', value: bodyData.priorInsurance || staticDataObj.policyCurrentInsuranceValue, name: 'PolicyCurrentInsuranceValue' };
      dataObj.PolicyPrevInsuranceCarrierValue = { type: 'select-one', value: bodyData.priorInsuranceCompany || staticDataObj.policyPrevInsuranceCarrierValue, name: 'PolicyPrevInsuranceCarrierValue' };
      dataObj.PolicyAutoDataPrevLiabilityType = { type: 'select-one', value: bodyData.policyAutoDataPrevLiabilityType || staticDataObj.PolicyAutoDataPrevLiabilityType, name: 'PolicyAutoDataPrevLiabilityType' };
      dataObj.PolicyPriorPolicyDuration = { type: 'select-one', value: bodyData.monthsWithCarrier || staticDataObj.PolicyPriorPolicyDuration, name: 'PolicyPriorPolicyDuration' };
      dataObj.PolicyAutoDataPriorAutoPolicyExpirationDate = { type: 'select-one', value: staticDataObj.policyAutoDataPriorAutoPolicyExpirationDate, name: 'PolicyAutoDataPriorAutoPolicyExpirationDate' };
      dataObj.PolicyAutoDataPrevLiabilityType = { type: 'select-one', value: staticDataObj.prevLiabilityType, name: 'PolicyAutoDataPrevLiabilityType' };
      dataObj.PolicyPriorPolicyDuration = { type: 'text', value: staticDataObj.priorPolicyDuration, name: 'PolicyPriorPolicyDuration' };
      dataObj.PolicyVehicles1RightTrackStatus = { type: 'select-one', value: staticDataObj.policyVehiclesTrackStatus, name: 'PolicyVehicles1RightTrackStatus' };
      dataObj.PolicyDataPackageSelection = { type: 'select-one', value: staticDataObj.policyDataPackageSelection, name: 'PolicyAutoDataPackageSelection' };
      dataObj.PolicyPolicyTerm0 = { type: 'select-one', value: true, name: 'PolicyPolicyTerm0' };
      dataObj.PolicyVehicles1CoverageCOMPLimitDed = { type: 'select-one', value: staticDataObj.policyVehiclesCoverage, name: 'PolicyVehicles1CoverageCOMPLimitDed' };
      return dataObj;
    }

    async function loadStep(step, navigate) {
      try {
        console.log(`Safeco ${step} Step`);
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
        console.log('Safeco Save Step');
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
      console.log(`Error during Safeco ${step} step:`, error);
      response = {
        title: 'Failed to retrieved Safeco rate.',
        status: false,
        error: `There is some error validations at ${step} step`,
        stepResult,
      };
      browser.close();
      saveRatingFromJob(req, response);
    }

    async function exitSuccess(step, quoteID) {
      try {
        response = {
          title: `Successfully finished Safeco ${step} Step`,
          status: true,
          quoteId: quoteID,
          stepResult,
        };
        browser.close();
        saveRatingFromJob(req, response);
      } catch (error) {
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
    console.log('Error  at Safeco :', error);
  }
}

safecoHomeQueue.process(maxJobsPerWorker, async (job, done) => {
  try {
    await safecoHome(job.data);
    done();
  } catch (e) {
    console.log('error on process queue', e);
    done(new Error(e));
  }
});

async function safecoHome(req) {
  try {
    console.log('Added to safecoHomeQueue');
    const params = req.body;
    const { username, password } = req.body.decoded_vendor;
    const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    const { raterStore } = req;
    let browserParams = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    if (ENVIRONMENT.nodeEnv === 'local') {
      browserParams = { headless: false };
    }
    const browser = await puppeteer.launch(browserParams);
    const page = await browser.newPage();

    const bodyData = await utils.cleanObj(req.body.data);

    let stepResult = {
      login: false,
      newQuote: false,
      existingQuote: false,
      policyInfo: false,
      address: false,
      underWriting: false,
      applicant: false,
      dwelling: false,
      coverage: false,
      summary: false,
    };

    let quoteId = null;
    let response = null;


    if (raterStore && raterStore.stepResult) { // eslint-disable-next-line prefer-destructuring
      stepResult = raterStore.stepResult;
    }

    const populatedData = await populateData();

    await loginStep();
    if (raterStore && raterStore.quoteId) {
      await existingQuote();
    } else {
      await newQuoteStep();
    }
    if (!params.stepName || params.stepName === 'all') {
      await policyInfoStep();
      await addressStep();
      await locationUnderwritingStep();
      await applicantStep();
      await dwellingStep();
      await coveragesStep();
      await summaryStep();
    } else {
      if (params.stepName === 'namedInsured') {
        await policyInfoStep();
        await addressStep();
        quoteId = `${bodyData.lastName}, ${bodyData.firstName}`;
        await exitSuccess('Named Insured', quoteId);
      }
      if (params.stepName === 'underWriting' && raterStore) {
        await locationUnderwritingStep();
        if (params.sendSummary && params.sendSummary === 'true') {
          await applicantStep();
          await dwellingStep();
          await coveragesStep();
          await summaryStep();
        } else {
          quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
          await exitSuccess('UnderWriting', quoteId);
        }
      }
      if (params.stepName === 'applicant' && raterStore) {
        await applicantStep();
        if (params.sendSummary && params.sendSummary === 'true') {
          await dwellingStep();
          await coveragesStep();
          await summaryStep();
        } else {
          quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
          await exitSuccess('Applicant', quoteId);
        }
      }
      if (params.stepName === 'summary' && raterStore) {
        await dwellingStep();
        await coveragesStep();
        await summaryStep();
      }
    }

    async function existingQuote() {
      console.log('Safeco existing Quote Step');
      try {
        quoteId = raterStore.quoteId ? raterStore.quoteId : `${bodyData.lastName}, ${bodyData.firstName}`;
        await page.waitFor(8000);
        await page.goto(safecoRater.EXISTING_QUOTE_URL, { waitUntil: 'load' });
        await page.waitFor(5000);
        await page.select('#SAMSearchBusinessType', '7|1|');
        await page.select('#SAMSearchModifiedDateRange', '1');
        await page.select('#SAMSearchActivityStatus', '-1');
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
        await exitFail(err, 'Existing Quote');
      }
    }

    async function loginStep() {
      try {
        console.log('Safeco Home Login Step.');
        await page.goto(safecoRater.LOGIN_URL, { waitUntil: 'domcontentloaded' });
        await page.waitFor(1000);
        await page.waitForSelector('#username');
        await page.type('#username', username);
        await page.type('#password', password);
        await page.evaluate(() => document.querySelector('#submit1').click());
        await page.waitForNavigation({ waitUntil: 'load' });
        stepResult.login = true;
      } catch (error) {
        await exitFail(error, 'login');
      }
    }

    async function newQuoteStep() {
      try {
        console.log('Safeco Home New Quote Step.');
        await page.waitFor(2000);
        await page.goto(safecoRater.NEW_QUOTE_START_HOME_URL, { waitUntil: 'domcontentloaded' });
        stepResult.newQuote = true;
      } catch (err) {
        await exitFail(err, 'New Quote');
      }
    }

    async function policyInfoStep() {
      if (response) return;
      try {
        await page.waitFor(3000);
        await loadStep('policyinfo', false);
        await fillPageForm(null, null, 1000);
        await saveStep();
        stepResult.policyInfo = true;
      } catch (err) {
        console.log('Error at Safeco Home Policy Information Step:', err);
        stepResult.policyInfo = false;
        await exitFail(err, 'Policy Info');
      }
    }

    async function addressStep() {
      if (response) return;
      try {
        await page.waitFor(1000);
        await loadStep('address', true);
        await fillPageForm();
        await saveStep();
        stepResult.address = true;
      } catch (error) {
        await exitFail(error, 'address');
      }
    }

    async function locationUnderwritingStep() {
      if (response) return;
      try {
        await page.waitFor(1000);
        await loadStep('locationunderwriting', true);
        await fillPageForm();
        stepResult.underWriting = true;
      } catch (error) {
        await exitFail(error, 'underwriting');
      }
    }

    async function applicantStep() {
      if (response) return;
      try {
        await page.waitFor(1000);
        await loadStep('applicant', true);
        await fillPageForm();
        stepResult.applicant = true;
      } catch (error) {
        await exitFail(error, 'applicant');
      }
    }

    async function dwellingStep() {
      if (response) return;
      try {
        await page.waitFor(1000);
        await loadStep('dwelling', true);
        await fillPageForm();
        stepResult.dwelling = true;
      } catch (error) {
        await exitFail(error, 'dwelling');
      }
    }

    async function coveragesStep() {
      if (response) return;
      try {
        await page.waitFor(1000);
        await loadStep('coverages', true);
        await fillPageForm();
        stepResult.coverage = true;
      } catch (error) {
        await exitFail(error, 'coverages');
      }
    }

    async function summaryStep() {
      try {
        await page.waitFor(5000);
        await loadStep('summary', true);
        await page.waitForSelector('#PolicyPremiumTotalSpan');
        const premiumDetails = await page.evaluate(() => {
          const downPaymentsObj = {};
          downPaymentsObj.totalPremium = document.querySelector('#PolicyPremiumTotalSpan').innerText.replace(/\$/g, '');
          downPaymentsObj.monthlyPay = document.querySelector('#PolicyChecklessPaymentAmountBPSpan').innerText.replace(/\$/g, '');
          return downPaymentsObj;
        });
        stepResult.summary = true;
        response = {
          title: 'Successfully retrieved safeco Home rate.',
          status: true,
          totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
          stepResult,
        };
        browser.close();
        saveRatingFromJob(req, response);
      } catch (err) {
        await exitFail(err, 'Summary');
      }
    }

    async function fillPageForm(beforeCustomCode, afterCustomCode, delayAfter) {
      try {
        page.on('console', (msg) => {
          for (let i = 0; i < msg.args().length; i += 1) console.log(`${msg.args()[i]}`);
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

          const list = data; // eslint-disable-next-line guard-for-in
          for (const fieldName in list) {
            const ecField = list[fieldName] ? list[fieldName] : null;
            const xField = data[fieldName] ? data[fieldName] : null;
            if (ecField) {
              ecField.required = false;
              ecField.rules = [];
              ecField.disabled = false;
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
                  el.checked = !!((xField.value && xField.value === true));
                }
              }
            }
          }

          function compareTwoStrings(firstString, secondString) {
            const first = firstString.replace(/\s+/g, '');
            const second = secondString.replace(/\s+/g, '');

            if (!first.length && !second.length) return 1; // if both are empty strings
            if (!first.length || !second.length) return 0; // if only one is empty string
            if (first === second) return 1; // identical
            if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
            if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

            const firstBigrams = new Map();
            for (let i = 0; i < first.length - 1; i += 1) {
              const bigram = first.substring(i, i + 2);
              const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram) + 1
                : 1;

              firstBigrams.set(bigram, count);
            }

            let intersectionSize = 0;
            for (let i = 0; i < second.length - 1; i += 1) {
              const bigram = second.substring(i, i + 2);
              const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram)
                : 0;

              if (count > 0) {
                firstBigrams.set(bigram, count - 1);
                intersectionSize += 1;
              }
            }

            return (2.0 * intersectionSize) / (first.length + second.length - 2);
          }
          function findBestMatch(mainString, targetStrings) {
            if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');

            const ratings = [];
            let bestMatchIndex = 0;

            for (let i = 0; i < targetStrings.length; i += 1) {
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
                const bestMatchRating = vBestMatch.bestMatch.rating === nBestMatch.bestMatch.rating;
                let i = 0;
                if (nBestMatch.bestMatch.rating > vBestMatch.bestMatch.rating) {
                  i = nBestMatch.bestMatchIndex;
                } else if (vBestMatch.bestMatch.rating > nBestMatch.bestMatch.rating) {
                  i = vBestMatch.bestMatchIndex;
                } else if (bestMatchRating && nBestMatch.bestMatch.rating >= 0.75) {
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
        await exitFail(err, 'FillPageForm');
      }
    }

    function populateData() {
      const staticDataObj = {
        mailingAddress: '242 County Rd #223',
        city: 'Crane Hill',
        state: 'AL',
        zipCode: '35053',
        maritalStatus: 'Single',
        socialSecurityStatus: 'R',
        reasonForPolicy: 'N',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '12/16/1993',
        gender: 'Male',
        email: 'test@gmail.com',
        constructionYear: '2019',
      };

      const dataObj = {};
      dataObj.PolicyAutoDataAutoBusinessType = { type: 'select-one', value: bodyData.reasonForPolicy || staticDataObj.reasonForPolicy, name: 'PolicyAutoDataAutoBusinessType' };
      dataObj.PolicyClientEmailAddress = { type: 'text', value: bodyData.email || staticDataObj.email, name: 'PolicyClientEmailAddress' };
      dataObj.PolicyClientMailingLocationAddressLine1 = { type: 'text', value: staticDataObj.mailingAddress, name: 'PolicyClientMailingLocationAddressLine1' };
      dataObj.PolicyClientMailingLocationCity = { type: 'text', value: staticDataObj.city, name: 'PolicyClientMailingLocationCity' };
      dataObj.PolicyClientMailingLocationState = { type: 'select-one', value: staticDataObj.state, name: 'PolicyClientMailingLocationState' };
      dataObj.PolicyClientMailingLocationZipCode = { type: 'text', value: staticDataObj.zipCode, name: 'PolicyClientMailingLocationZipCode' };
      dataObj.PolicyClientPersonFirstName = { type: 'text', value: bodyData.firstName || staticDataObj.firstName, name: 'PolicyClientPersonFirstName' };
      dataObj.PolicyClientPersonLastName = { type: 'text', value: bodyData.lastName || staticDataObj.lastName, name: 'PolicyClientPersonLastName' };
      dataObj.PolicyClientPersonSocialSecurityNumberStatus = { type: 'select-one', value: bodyData.socialSecurityStatus || staticDataObj.socialSecurityStatus, name: 'PolicyClientPersonSocialSecurityNumberStatus' };
      dataObj.PolicyClientMailingLocationOverrideUSPSAddressEditYN = { type: 'radio', value: true, name: 'PolicyClientMailingLocationOverrideUSPSAddressEditYN' };
      dataObj.PolicyEffectiveDate = { type: 'text', value: tomorrow, name: 'PolicyEffectiveDate' };
      dataObj.PolicyRatingState = { type: 'select-one', value: '1', name: 'PolicyRatingState' };
      dataObj.PolicyProduct = { type: 'select-one', value: 'RENT', name: 'PolicyProduct' };
      dataObj.PolicyBusinessType = { type: 'select-one', value: 'N', name: 'PolicyBusinessType' };
      dataObj.PolicyAdditionalInterestsYNN = { type: 'radio', value: true, name: 'PolicyAdditionalInterestsYNN' };
      dataObj.PolicyDwellingCoApplicantYNN = { type: 'radio', value: true, name: 'PolicyDwellingCoApplicantYNN' };
      dataObj.PolicyHomeDataLocationSameAsMailingYNY = { type: 'radio', value: true, name: 'PolicyHomeDataLocationSameAsMailingYNY' };
      dataObj.PolicyHomeDataCurrentAddressYears = { type: 'radio', value: '10', name: 'PolicyHomeDataCurrentAddressYears' };
      dataObj.PolicyDwellingCourseConstructionYNN = { type: 'radio', value: true, name: 'PolicyDwellingCourseConstructionYNN' };
      dataObj.PolicyDwellingBusinessOnPremisesYNN = { type: 'radio', value: bodyData.hasBusinessConducted || true, name: 'PolicyDwellingBusinessOnPremisesYNN' };
      dataObj.PolicyDwellingSwimmingPoolYNN = { type: 'radio', value: bodyData.hasPool || true, name: 'PolicyDwellingSwimmingPoolYNN' };
      dataObj.PolicyDwellingSwimmingPoolYNY = { type: 'radio', value: bodyData.hasPool || false, name: 'PolicyDwellingSwimmingPoolYNY' };
      dataObj.PolicyDwellingDogYNN = { type: 'radio', value: bodyData.hasPets || true, name: 'PolicyDwellingDogYNN' };
      dataObj.PolicyDwellingDogYNY = { type: 'radio', value: bodyData.hasPets || false, name: 'PolicyDwellingDogYNY' };
      dataObj.PolicyDwellingHorsesLivestockYNN = { type: 'radio', value: true, name: 'PolicyDwellingHorsesLivestockYNN' };
      dataObj.PolicyPrevInsuranceCarrierValue = { type: 'select-one', value: 'NF', name: 'PolicyPrevInsuranceCarrierValue' };
      dataObj.PolicyInsuranceCancelNonRenewYNN = { type: 'radio', value: 'true', name: 'PolicyInsuranceCancelNonRenewYNN' };
      dataObj.PolicyDwellingNumberOfLosses = { type: 'text', value: '0', name: 'PolicyDwellingNumberOfLosses' };
      dataObj.PolicyDwellingApplicantBirthdate = { type: 'text', value: bodyData.dateOfBirth || staticDataObj.birthDate, name: 'PolicyDwellingApplicantBirthdate' };
      dataObj.PolicyDwellingApplicantMaritalStatus = { type: 'select-one', value: bodyData.maritalStatus || staticDataObj.maritalStatus, name: 'PolicyDwellingApplicantMaritalStatus' };
      dataObj.PolicyDwellingBusinessOnPremisesIncidentalYNN = { type: 'radio', value: true, name: 'PolicyDwellingBusinessOnPremisesIncidentalYNN' };
      dataObj.PolicyDwellingApplicantSocialSecurityNumberStatus = { type: 'select-one', value: staticDataObj.socialSecurityStatus, name: 'PolicyDwellingApplicantSocialSecurityNumberStatus' };
      dataObj.PolicyDwellingBusinessOnPremisesNumEmployees = { type: 'text', value: '10', name: 'PolicyDwellingBusinessOnPremisesNumEmployees' };
      dataObj.PolicyDwellingBusinessOnPremisesCategory = { type: 'select-one', value: 'X', name: 'PolicyDwellingBusinessOnPremisesCategory' };
      dataObj.PolicyDwellingSecondaryDwellingYNN = { type: 'radio', value: true, name: 'PolicyDwellingSecondaryDwellingYNN' };
      dataObj.PolicyDwellingProtectionClass = { type: 'select-one', value: '005', name: 'PolicyDwellingProtectionClass' };
      dataObj.PolicyDwellingConstructionYear = { type: 'text', value: bodyData.constructionYear || staticDataObj.constructionYear, name: 'PolicyDwellingConstructionYear' };
      dataObj.PolicyDwellingDwellingTypeDesc = { type: 'select-one', value: 'D', name: 'PolicyDwellingDwellingTypeDesc' };
      dataObj.PolicyDwellingInCitySuburbDistrict = { type: 'select-one', value: 'C', name: 'PolicyDwellingInCitySuburbDistrict' };
      dataObj.PolicyDwellingConstructionType = { type: 'select-one', value: 'F', name: 'PolicyDwellingConstructionType' };
      dataObj.PolicyHomeDataAOPDeductible = { type: 'select-one', value: '750', name: 'PolicyHomeDataAOPDeductible' };
      dataObj.PolicyDwellingCoveragePPLimitDed = { type: 'text', value: '21000', name: 'PolicyDwellingCoveragePPLimitDed' };
      dataObj.PolicyDwellingCoveragePLLimitDed = { type: 'select-one', value: '100000', name: 'PolicyDwellingCoveragePLLimitDed' };
      dataObj.PolicyDwellingCoverageMEDPMLimitDed = { type: 'select-one', value: '1000', name: 'PolicyDwellingCoverageMEDPMLimitDed' };
      dataObj.PolicyDwellingSPPYNN = { type: 'radio', value: true, name: 'PolicyDwellingSPPYNN' };
      return dataObj;
    }

    async function loadStep(step, navigate) {
      try {
        console.log(`Safeco ${step} Step`);
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
        console.log('Safeco Save Step');
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
        if (step === 'address') {
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'address');
          });
        } else if (step === 'locationunderwriting') {
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'locationunderwriting');
          });
        } else if (step === 'applicant') {
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'applicantunderwritingdetails');
          });
        } else if (step === 'dwelling') {
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'dwelling');
          });
        } else if (step === 'coverages') {
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'coverages');
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
      console.log(`Error during Safeco ${step} step:`, error);
      response = {
        title: 'Failed to retrieved Safeco rate.',
        status: false,
        error: `There is some error validations at ${step} step`,
        stepResult,
      };
      browser.close();
      saveRatingFromJob(req, response);
    }

    async function exitSuccess(step, quoteID) {
      try {
        response = {
          title: `Successfully finished Safeco ${step} Step`,
          status: true,
          quoteId: quoteID,
          stepResult,
        };
        browser.close();
        saveRatingFromJob(req, response);
      } catch (error) {
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
    console.log('Error  at Safeco :', error);
  }
}
