/* eslint-disable prefer-destructuring, no-constant-condition, no-console, dot-notation, no-await-in-loop, max-len,
 no-use-before-define, no-inner-declarations, no-param-reassign, no-restricted-syntax, consistent-return, no-undef, no-plusplus */

const puppeteer = require('puppeteer');
const Queue = require('bull');
const moment = require('moment');
const { travelerRater } = require('../constants/appConstant');
const { saveRatingFromJob } = require('../controllers/rater');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate, ageCount } = require('../lib/utils');

const travelerQueue = new Queue('traveler', ENVIRONMENT.redisUrl);
const maxJobsPerWorker = 2;

module.exports = {
  travelerQueue,
};

travelerQueue.process(maxJobsPerWorker, async (job, done) => {
  try {
    await traveler(job.data);
  } catch (e) {
    console.log('error on process queue', e);
    done(new Error(e));
  }
});

async function traveler(req) {
  try {
    console.log('Added to traveler Queue');
    const { username, password } = req.body.decoded_vendor;
    const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    const yeasterDay = formatDate(moment(new Date()).subtract(1, 'days'));
    const expirationDate = formatDate(moment(new Date()).add(5, 'days'));

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

    let response = null;

    let browserParams = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 300,
    };
    if (ENVIRONMENT.nodeEnv === 'local') {
      browserParams = { headless: false };
    }
    const browser = await puppeteer.launch(browserParams);
    let page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();
    const populatedData = await populateData();

    await loginStep();
    await searchStep();
    await addCustomerStep();
    await policyStep();
    await customerInfoStep();
    await vehicleStep();
    await driverStep();
    await underwritingStep();
    await coverageStep();
    await summaryStep();

    async function loginStep() {
      console.log('Traveler Login Step');
      try {
        await page.goto(travelerRater.LOGIN_URL, { waitUntil: 'networkidle2', timeout: 0 });
        await page.waitFor(500);
        await page.waitForSelector('#username');
        await page.type('#username', username);
        await page.type('#password', password);
        await page.click('#btn-trans-login');
        await page.waitForNavigation({ timeout: 0 });
        stepResult.login = true;
      } catch (error) {
        await exitFail(error, 'login');
      }
    }

    async function searchStep() {
      if (response) return;
      console.log('Traveler Search Step');
      try {
        await page.type('#PiSearchNewFields > div:nth-child(1) > div > div > input', populatedData.lastName.value);
        await page.waitFor(1000);
        await page.waitForSelector(populatedData.searchState.element);
        await page.select('select[name="state"]', populatedData.searchState.value);
        await page.click('#search-button');
        await page.waitFor(5000);
        const redirectUrl = `https://plagt.travelers.com/AGENTHQPortalMain.asp?AppCN=PLAGTPROD&StartPage=enteserv/ENTESERVAccountSearch.aspx&QueryString=NOFOCUS=Y|searchType=01|searchParms=txtName^${populatedData.lastName.value}~ddlState^${populatedData.state.value}~txtZipCode^~txtZipExt^|submitType=2|agenthq=y`;
        await page.goto(redirectUrl, { waitUntil: 'networkidle0' });
        await page.waitFor(8000);
        await page.evaluate(async () => {
          const iframe = document.getElementsByTagName('frameset')[1];
          await iframe.getElementsByTagName('frame')[1];
          const childFrames = iframe.lastElementChild.contentDocument.documentElement;
          if (childFrames) {
            const addCustomerButton = await childFrames.querySelector('#btnAddCust');
            addCustomerButton.click();
          }
        });
      } catch (error) {
        await exitFail(error, 'Search');
      }
    }

    async function addCustomerStep() {
      if (response) return;
      console.log('Traveler Add Customer Step');
      try {
        await page.waitFor(6000);
        await page.evaluate(async (populatedDataObj) => {
          const iframe = document.querySelector('#Parent').getElementsByTagName('frame')[2].contentDocument;
          const childFrames = iframe.documentElement;
          if (childFrames) {
            childFrames.querySelector(`#${populatedDataObj.firstName.element}`).value = populatedDataObj.firstName.value;
            childFrames.querySelector(`#${populatedDataObj.lastName.element}`).value = populatedDataObj.lastName.value;
            childFrames.querySelector(`#${populatedDataObj.mailingAddress.element}`).value = populatedDataObj.mailingAddress.value;
            childFrames.querySelector(`#${populatedDataObj.city.element}`).value = populatedDataObj.city.value;
            childFrames.querySelector(`#${populatedDataObj.state.element}`).value = populatedDataObj.state.value;
            childFrames.querySelector(`#${populatedDataObj.zipcode.element}`).value = populatedDataObj.zipcode.value;
            const processQuote = await childFrames.querySelector('#process');
            processQuote.removeAttribute('disabled');
            processQuote.click();
          }
        }, populatedData);
        await page.waitFor(4000);
        while (true) {
          await page.waitFor(1000);
          const pageQuote = await browser.pages();
          if (pageQuote.length > 2) {
            page = pageQuote[2];
            break;
          }
        }
      } catch (error) {
        await exitFail(error, 'Add Customer');
      }
    }

    async function policyStep() {
      if (response) return;
      console.log('Traveler Policy Step');
      try {
        await page.waitFor(4000);
        const elementHandle = await page.$('#NavMain > frame:nth-child(2)');
        const frame = await elementHandle.contentFrame();
        await frame.waitForSelector(`#${populatedData.businessType.element}`);
        await frame.type(`#${populatedData.businessType.element}`, populatedData.businessType.value);
        await frame.waitForSelector(`#${populatedData.effectiveDate.element}`);
        await frame.type(`#${populatedData.effectiveDate.element}`, populatedData.effectiveDate.value);
        await frame.waitForSelector('#btnSubmit');
        await frame.click('#btnSubmit');
        stepResult.policy = true;
      } catch (error) {
        await exitFail(error, 'Policy');
      }
    }

    async function customerInfoStep() {
      if (response) return;
      console.log('Traveler Customer Info Step');
      try {
        await navigationPromise;
        await page.waitFor(30000);
        await page.waitForSelector(populatedData.phone.element);
        await page.focus(populatedData.phone.element);
        // await typeInInputElements(populatedData.phone.element, populatedData.phone.value);
        await page.keyboard.type(populatedData.phone.value, { delay: 80 });
        await page.type(populatedData.birthDate.element, populatedData.birthDate.value);
        await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
        await page.click('#page > #dialog-modal > #main #dynamicContinueButton');
        await page.waitFor(2000);
        if (await page.$('select[data-label=County]')) {
          console.log('#inside country');
          const countryName = await page.evaluate(element => document.querySelector(element).innerText, 'select[data-label=County] > option:nth-child(2)');
          await page.select('select[data-label=County]', countryName);
        }
        await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
        await page.waitFor(8000);
        await page.click('#page > #dialog-modal > #main #dynamicContinueButton');
        await page.waitFor(5000);
        const addressBtn = await page.$('[id="overlayButton-addressDifference-Use Original"]');
        if (addressBtn) {
          addressBtn.click();
          await page.waitFor(500);
        }
        await page.waitFor(30000);
        await page.waitForSelector(populatedData.agentCode.element);
        await page.select(populatedData.agentCode.element, populatedData.agentCode.value);
        if (await page.$('#page > #dialog-modal > #main #dynamicContinueButton')) {
          await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.evaluate(async () => {
            const continueButton = document.getElementById('dynamicContinueButton');
            await continueButton.removeAttribute('data-skipdisable');
            await continueButton.click();
          });
        }
        await page.waitFor(40000);
        await page.evaluate(async () => {
          const quoteWithAssumedScore = document.querySelector('span[data-label="Quote with Assumed Score"]');
          if (quoteWithAssumedScore) {
            const element = quoteWithAssumedScore.children[1];
            await element.click();
          }
        });

        if (await page.$(populatedData.assumedScore.element)) {
          await selectElement(populatedData.assumedScore.element, populatedData.assumedScore.value);
          await page.evaluate(() => {
            document.querySelector('#overlayButton-reports-dynamicContinue').click();
          });
        }
        await page.evaluate(async () => {
          const hasMovedWithin6Month = document.querySelector('span[data-label="Moved within the last 6 months?"]');
          if (hasMovedWithin6Month) {
            const element = hasMovedWithin6Month.children[2];
            await element.click();
          }
          const reviewdInfoByLaw = document.querySelector('span[data-label="I affirm that I have reviewed this information with the customer as required by law."]').children[0];
          if (reviewdInfoByLaw) {
            await reviewdInfoByLaw.click();
          }
          const reportButton = document.querySelector('#overlayButton-reports-dynamicOrderReport');
          if (reportButton) {
            reportButton.click();
          }
        });
        stepResult.customerInfo = true;
      } catch (error) {
        console.log('error', error);
        await exitFail(error, 'Customer Info');
      }
    }

    async function vehicleStep() {
      if (response) return;
      console.log('Traveler vehicle Step');
      try {
        await page.evaluate(() => {
          const freezeScreen = document.getElementById('loaderContainer');
          if (freezeScreen) {
            document.getElementById('loaderContainer').outerHTML = '';
          }
        });
        await page.waitForXPath('//span[contains(text(), "VEHICLES")]', 5000);
        const [vehicle] = await page.$x('//span[contains(text(), "VEHICLES")]');
        if (vehicle) vehicle.click();
        await page.waitForSelector(populatedData.vehicleType.element);
        await page.evaluate((vehicleType) => {
          document.querySelector(vehicleType.element).value = vehicleType.value;
        }, populatedData.vehicleType);
        await page.waitFor(5000);
        await page.waitForSelector(populatedData.vehicleVin.element);
        await page.focus(populatedData.vehicleVin.element);
        await page.type(populatedData.vehicleVin.element, populatedData.vehicleVin.value, { delay: 20 });
        await page.waitForSelector(populatedData.primaryUse.element);
        await page.focus(populatedData.primaryUse.element);
        await page.type(populatedData.primaryUse.element, populatedData.primaryUse.value);
        await page.focus(populatedData.annualMilege.element);
        await page.type(populatedData.annualMilege.element, populatedData.annualMilege.value);
        await page.focus(populatedData.ownerShip.element);
        await page.select(populatedData.ownerShip.element, populatedData.ownerShip.value);
        await page.focus('#dynamicContinueButton');
        await page.evaluate(() => {
          document.querySelector('#dynamicContinueButton').click();
        });

        await page.waitFor(2000);
        await page.evaluate(() => {
          document.querySelector('#dynamicContinueButton').click();
        });
        stepResult.vehicles = true;
      } catch (error) {
        await exitFail(error, 'vehicle');
      }
    }

    async function driverStep() {
      if (response) return;
      console.log('Traveler Driver Step');
      try {
        await page.waitForSelector('input[value="M"]');
        await page.evaluate(() => {
          document.querySelector('input[value="M"]').click();
        });
        await page.waitForSelector(populatedData.maritalStatus.element);
        await page.select(populatedData.maritalStatus.element, populatedData.maritalStatus.value);
        await page.type(populatedData.relationship.element, populatedData.relationship.value, { delay: 20 });
        await page.type(populatedData.ageWhen1stLicensed.element, populatedData.ageWhen1stLicensed.value.toString(), { delay: 20 });
        await page.type(populatedData.dateWhenLicensed.element, populatedData.dateWhenLicensed.value, { delay: 100 });
        await page.evaluate(() => {
          document.querySelector('span[data-label="IntelliDrive®"]').children[2].click(); // IntelliDrive
        });
        await page.waitFor(1000);
        await page.focus('#dynamicContinueButton');
        await page.evaluate(() => {
          document.querySelector('#dynamicContinueButton').click();
        });

        await closeModel();

        if (await page.$('#dynamicContinueButton')) {
          await page.evaluate(() => {
            document.querySelector('#dynamicContinueButton').click();
          });
        }
        stepResult.drivers = true;
      } catch (error) {
        await exitFail(error, 'driver');
      }
    }

    async function underwritingStep() {
      if (response) return;
      console.log('Traveler underwriting Step');
      try {
        await page.waitFor(5000);
        await page.waitForSelector('#dynamicContinueButton');
        await page.focus('#dynamicContinueButton');
        await page.evaluate(async () => {
          document.getElementById('dynamicContinueButton').click();
        });

        await page.waitFor(5000);
        await closeModel();

        await page.waitForSelector(populatedData.insuranceStatus.element);
        await page.select(populatedData.insuranceStatus.element, populatedData.insuranceStatus.value);
        await page.waitFor(1000);

        await page.waitForSelector(populatedData.currentCarrier.element);
        await page.focus(populatedData.currentCarrier.element);
        await page.type(populatedData.currentCarrier.element, populatedData.currentCarrier.value);

        await page.waitFor(1000);
        await page.waitForSelector(populatedData.continueInsurance.element);
        await page.select(populatedData.continueInsurance.element, populatedData.continueInsurance.value);

        await page.waitFor(1000);
        await page.select(populatedData.lengthofTimewithCompany.element, populatedData.lengthofTimewithCompany.value);

        await page.waitFor(1000);
        await page.type(populatedData.expirationDate.element, populatedData.expirationDate.value);

        await page.select(populatedData.InjuryLimits.element, populatedData.InjuryLimits.value);

        await page.evaluate(() => {
          const anyVehicleWithoutRegister = document.querySelector('span[data-label="Are any vehicles not registered to the Named Insured, resident parents, or resident child <26 of the Named Insured?"]').children[2];
          anyVehicleWithoutRegister.click();
        });

        await page.evaluate(() => {
          const anyPersonWithoutLicense = document.querySelector('span[data-label="Is any driver in the household currently without a valid drivers license?"]').children[2];
          anyPersonWithoutLicense.click();
        });

        await page.evaluate(() => {
          const policyDeclined = document.querySelector('span[data-label="Has any company declined, cancelled or refused to renew your auto insurance policy for you or any listed driver in the last 3 years?"]').children[2];
          policyDeclined.click();
        });

        await page.waitFor(1000);
        await page.focus(populatedData.primaryResidence.element);
        await selectElement(populatedData.primaryResidence.element, populatedData.primaryResidence.value);

        await page.evaluate(() => {
          document.querySelector('#dynamicContinueButton').click();
        });
        await page.waitFor(10000);
        await page.evaluate(() => {
          document.querySelector('#dynamicContinueButton').click();
        });
        await page.waitFor(10000);
        if (await page.$('#dynamicContinueButton')) {
          await page.evaluate(() => {
            document.querySelector('#dynamicContinueButton').click();
          });
        }
        stepResult.underWriting = true;
      } catch (error) {
        await exitFail(error, 'underwriting');
      }
    }

    async function coverageStep() {
      if (response) return;
      console.log('Traveler Coverage Step');
      try {
        await closeModel();
        if (await page.$('#dynamicContinueButton')) {
          await page.evaluate(() => {
            document.querySelector('#dynamicContinueButton').click();
          });
        }
        await page.waitFor(3000);
        await page.select(populatedData.driverPlan.element, populatedData.driverPlan.value);
        await page.waitFor(10000);
        await page.waitFor(populatedData.liability.element);
        await page.select(populatedData.liability.element, populatedData.liability.value);

        await page.waitFor(10000);
        await page.focus(populatedData.propertyDamage.element);
        await page.select(populatedData.propertyDamage.element, populatedData.propertyDamage.value);


        await page.focus(populatedData.motorist.element);
        await page.select(populatedData.motorist.element, populatedData.motorist.value);

        await page.focus(populatedData.medicalPayment.element);
        await page.select(populatedData.medicalPayment.element, populatedData.medicalPayment.value);

        await page.focus(populatedData.comprehensive.element);
        await page.select(populatedData.comprehensive.element, populatedData.comprehensive.value);

        await page.focus(populatedData.unInsuredMotorist.element);
        await page.select(populatedData.unInsuredMotorist.element, populatedData.unInsuredMotorist.value);

        await page.select('select[data-label="Glass Deductible"]', '50');

        await page.focus(populatedData.collision.element);
        await page.select(populatedData.collision.element, '500');

        await page.focus(populatedData.roadAssistant.element);
        await page.select(populatedData.roadAssistant.element, populatedData.roadAssistant.value);

        await page.focus(populatedData.equipment.element);
        await page.select(populatedData.equipment.element, populatedData.equipment.value);

        await page.focus(populatedData.rentalETE.element);
        await page.select(populatedData.rentalETE.element, populatedData.rentalETE.value);

        await page.evaluate(() => {
          const personInjuryButton = document.querySelector('span[data-label="Personal Injury Protection"]').children[0];
          personInjuryButton.removeAttribute('disabled');
          personInjuryButton.click();
        });

        await page.waitFor(2000);
        await page.evaluate(() => {
          document.querySelector('#dynamicContinueButton').click();
        });
        stepResult.coverage = true;
      } catch (error) {
        await exitFail(error, 'coverage');
      }
    }

    async function summaryStep() {
      if (response) return;
      console.log('Traveler Rater Summary Step');
      try {
        await page.waitFor(15000);
        const totalPremium = await page.evaluate(() => document.querySelector('#quoteStatusPremiumContainer_coverage_Pkg1').firstChild.innerText.split(' ')[0].replace(/\n/g, ''));
        const months = await page.evaluate(() => document.querySelector('#quoteStatusMessageContainer_coverage_Pkg1 > table > tbody > tr:nth-child(3)').innerText.slice(12, 13));
        console.log('Premium###', totalPremium);
        stepResult.summary = true;
        response = {
          title: 'Successfully retrieved traveler rate.',
          status: true,
          totalPremium: totalPremium.replace('00Pay', '') || null,
          months: months || null,
          stepResult,
        };
        console.log('##req.session.data', response);
        browser.close();
        saveRatingFromJob(req, response);
      } catch (error) {
        await exitFail(error, 'summary');
      }
    }

    // async function typeInInputElements(inputSelector, text) {
    //   await page.evaluate((selector, inputText) => {
    //     const inputElement = document.querySelector(selector);
    //     const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    //     nativeInputValueSetter.call(inputElement, inputText);
    //     const ev2 = new Event('input', { bubbles: true });
    //     inputElement.dispatchEvent(ev2);
    //   }, inputSelector, text);
    // }

    async function selectElement(selector, option) {
      await page.evaluate(async (sel, opt) => {
        const element = document.querySelector(sel);
        const options = element.options;

        const bestValue = await getBestValue(opt, options);
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeInputValueSetter.call(element, bestValue);
        const ev2 = new Event('change', { bubbles: true });
        element.dispatchEvent(ev2);


        function compareTwoStrings(first, second) {
          first = first.replace(/\s+/g, '');
          second = second.replace(/\s+/g, '');

          if (!first.length && !second.length) return 1;// if both are empty strings
          if (!first.length || !second.length) return 0;// if only one is empty string
          if (first === second) return 1;// identical
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
              const bestValueMatch = optionsArray[i].value;
              return bestValueMatch;
            } else if (value) {
              return value || '';
            } else {
              return '';
            }
          } catch (error) {
            console.log(`Error: ${error}`);
          }
        }
      }, selector, option);
    }


    async function exitFail(error, step) {
      console.log(`Error during traveler ${step} step:`, error);
      response = {
        title: 'Failed to retrieve Traveler rate',
        status: false,
        error: `There was an error at ${step} step`,
        stepResult,
      };
      browser.close();
      saveRatingFromJob(req, response);
    }

    async function closeModel() {
      console.log('close model>>');
      if (await page.$('span[data-label="Moved within the last 6 months?"]')) {
        await page.waitFor(1000);
        await page.evaluate(async () => {
          document.querySelector('span[data-label="Moved within the last 6 months?"]').children[2].click();
        });
      }

      if (await page.$('span[data-label="I affirm that I have reviewed this information with the customer as required by law."]')) {
        await page.evaluate(() => {
          document.querySelector('span[data-label="I affirm that I have reviewed this information with the customer as required by law."]').children[0].click();
        });
      }

      if (await page.$('#overlayButton-reports-dynamicContinue')) {
        await page.evaluate(async () => {
          const reportButton = document.querySelector('#overlayButton-reports-dynamicContinue');
          await reportButton.click();
        });
      }
    }

    function populateData() {
      const staticDataObj = {
        businessType: 'AUTO',
        mailingAddress: '670 Park Avenue',
        city: 'Moody',
        state: 'AL',
        zipCode: '36140',
        primaryResidence: 'OTH',
        reasonForPriorInsurance: 'CURRENTLYINSURED',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '12/16/1997',
        gender: 'Male',
        email: 'test@gmail.com',
        phone: '9999997777',
        liability: '100000/300000',
        propertyDamage: '100000',
        motorist: 'VAL:25000/50000,CD:UM,LMTCD:PERPERSON/PERACC',
        medicalPayment: '5000',
        comprehensive: '1000',
        roadAssistant: 'RB',
        rentalETE: '30/900,CD:RREIM,LMTCD:PERDAY/PERACC',
        equipment: '2500',
        driverPlan: 'F1',
        vehicleType: 'PP',
        assumedScore: 'IS12',
        currentCarrier: 'Other Companies/Company Car',
        continueInsurance: '5',
        injuryLimits: 'L',
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

      const dataObj = {};
      dataObj.firstName = { element: 'txtFirstName', value: bodyData.firstName || staticDataObj.firstName };
      dataObj.lastName = { element: 'txtLastName', value: bodyData.lastName || staticDataObj.lastName };
      dataObj.mailingAddress = { element: 'txtStreet', value: bodyData.mailingAddress || staticDataObj.mailingAddress };
      dataObj.city = { element: 'txtCity', value: bodyData.city || staticDataObj.city };
      dataObj.searchState = { element: 'select[name="state"]', value: bodyData.state || staticDataObj.state };
      dataObj.state = { element: 'ddState', value: bodyData.state || staticDataObj.state };
      dataObj.zipcode = { element: 'txtZip5', value: bodyData.zipCode || staticDataObj.zipCode };
      dataObj.businessType = { element: 'LineOfBusinessValue', value: staticDataObj.businessType };
      dataObj.effectiveDate = { element: 'EffectiveDate', value: tomorrow };
      dataObj.phone = { element: 'tbody > #G3 #\\31 472665286', value: bodyData.phone || staticDataObj.phone };
      dataObj.birthDate = { element: 'tbody > #G8 #\\31 680138008', value: bodyData.birthDate || staticDataObj.birthDate };
      dataObj.vehicleType = { element: 'select[data-label="Vehicle Type"]', value: staticDataObj.vehicleType };
      dataObj.agentCode = { element: 'select[data-label="Agent Code"]', value: '0CJB70' };
      // vehicle
      dataObj.vehicleVin = { element: 'input[data-label="VIN"]', value: bodyData.vehicles[0].vehicleVin || staticDataObj.vehicles[0].vehicleVin };
      dataObj.primaryUse = { element: 'select[data-label="Vehicle Use"]', value: staticDataObj.vehicles[0].vehicleUse };
      dataObj.annualMilege = { element: 'input[data-label="Annual Mileage"]', value: staticDataObj.vehicles[0].annualMiles };
      dataObj.ownerShip = { element: 'select[data-label="Ownership Status"]', value: staticDataObj.vehicles[0].ownerShip };
      // driver
      dataObj.maritalStatus = { element: 'select[data-label="Marital Status"]', value: staticDataObj.drivers[0].maritalStatus };
      dataObj.relationship = { element: 'select[data-label="Relationship to Named Insured"]', value: staticDataObj.drivers[0].relationshipTonamedInsured };
      dataObj.ageWhen1stLicensed = { element: 'input[data-label="Age 1st Licensed US/Canada"]', value: bodyData.drivers[0].ageWhen1stLicensed || staticDataObj.drivers[0].ageWhen1stLicensed };
      dataObj.dateWhenLicensed = { element: 'input[data-label="Date Licensed"]', value: bodyData.drivers[0].licensedDate || staticDataObj.drivers[0].dateWhenLicensed };

      dataObj.insuranceStatus = { element: 'select[data-label="Insurance Status"]', value: staticDataObj.reasonForPriorInsurance };
      dataObj.ReasonForinsurance = { element: 'select[data-label="Reason for No Prior Insurance"]', value: 'FIRSTCAR' };
      dataObj.primaryResidence = { element: 'select[data-label="Primary Residence"]', value: staticDataObj.primaryResidence };

      dataObj.liability = { element: 'select[data-label="Liability"]', value: bodyData.coverage[0] ? bodyData.coverage[0].liability : staticDataObj.liability };
      dataObj.propertyDamage = { element: 'select[data-label="Property Damage"]', value: bodyData.coverage[0] ? bodyData.coverage[0].propertyDamage : staticDataObj.propertyDamage };
      dataObj.motorist = { element: 'select[data-label="Uninsd/Underinsd Motorist"]', value: bodyData.coverage[0] ? bodyData.coverage[0].motorist : staticDataObj.motorist };
      dataObj.medicalPayment = { element: 'select[data-label="Medical Payments"]', value: bodyData.coverage[0] ? bodyData.coverage[0].medicalPayment : staticDataObj.medicalPayment };
      dataObj.comprehensive = { element: 'select[data-label="Comprehensive"]', value: bodyData.coverage[0] ? bodyData.coverage[0].comprehensive : staticDataObj.comprehensive };
      dataObj.collision = { element: 'select[data-label="Collision"]', value: bodyData.coverage[0] ? bodyData.coverage[0].collision : staticDataObj.collision };
      dataObj.roadAssistant = { element: 'select[data-label="Roadside Assistance"]', value: bodyData.coverage[0] ? bodyData.coverage[0].roadAssistant : staticDataObj.roadAssistant };
      dataObj.rentalETE = { element: 'select[data-label="Rental ETE"]', value: bodyData.coverage[0] ? bodyData.coverage[0].rentalETE : staticDataObj.rentalETE };
      dataObj.equipment = { element: 'select[data-label="Custom Equipment - Increased Limit"]', value: bodyData.coverage[0] ? bodyData.coverage[0].equipment : staticDataObj.equipment };
      dataObj.unInsuredMotorist = { element: 'select[data-label="Uninsured Motorist PD"]', value: '25000' };
      dataObj.driverPlan = { element: 'select[data-label="Responsible Driver Plan"]', value: staticDataObj.driverPlan };
      dataObj.assumedScore = { element: 'select[data-label="Assumed Score"]', value: staticDataObj.assumedScore };
      dataObj.currentCarrier = { element: 'input[data-label="Current Auto Insurance Carrier"]', value: staticDataObj.currentCarrier };
      dataObj.continueInsurance = { element: 'select[data-label="Continuous Insurance"]', value: staticDataObj.continueInsurance };
      dataObj.lengthofTimewithCompany = { element: 'select[data-label="Length of time with Current Company"]', value: '5' };
      dataObj.expirationDate = { element: 'input[data-label="Current Policy Expiration Date"]', value: expirationDate };
      dataObj.InjuryLimits = { element: 'select[data-label="Current Bodily Injury Limits"]', value: staticDataObj.injuryLimits };
      return dataObj;
    }
  } catch (error) {
    console.log('Error at Traveler :', error);
  }
}
