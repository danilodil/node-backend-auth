/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,no-param-reassign, no-plusplus,
func-names, no-shadow, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition, consistent-return  */

const puppeteer = require('puppeteer');
const SS = require('string-similarity');
const Queue = require('bull');
const { nationalGeneralRater } = require('../constants/appConstant');
const { saveRatingFromJob } = require('../controllers/rater');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;

const connection = { redis: { port: 10621, host: 'redis-10621.c10.us-east-1-2.ec2.cloud.redislabs.com', db: 'redis-xilo-dev-auth-9401510', password: 'BXVQo0SUXfopneGcRQVLnjlxcSmma47c' } };
const nationalGeneralQueue = new Queue('nationalGeneral', connection);
const maxJobsPerWorker = 1;

module.exports = {
  nationalGeneralQueue,
};

nationalGeneralQueue.process(maxJobsPerWorker, async (job, done) => {
  try {
    await nationalGeneral(job.data);
    done();
  } catch (e) {
    console.log('error on process queue', e);
    done(new Error(e));
  }
});

async function nationalGeneral(req) {
  try {
    console.log('Added to nationalGeneralQueue');
    const params = req.body;
    const { username, password } = req.body.decoded_vendor;
    const raterStore = req.raterStore;
    const bodyData = await utils.cleanObj(req.body.data);
    bodyData.drivers.splice(10, bodyData.drivers.length);

    let stepResult = {
      login: false,
      existingQuote: false,
      newQuote: false,
      namedInsured: false,
      drivers: false,
      vehicles: false,
      underWriting: false,
      summary: false,
    };
    let quoteId = null;
    let response = null;

    if (raterStore && raterStore.stepResult) {
      stepResult = raterStore.stepResult;
    }

    let browserParams = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    if (ENVIRONMENT.nodeEnv === 'local') {
      browserParams = { headless: false };
    }
    const browser = await puppeteer.launch(browserParams);
    const page = await browser.newPage();

    const populatedData = await populateKeyValueData(bodyData);

    await loginStep();
    if (raterStore && raterStore.quoteId) {
      await existingQuoteStep();
    } else {
      await newQuoteStep();
    }

    if (!params.stepName) {
      await namedInsuredStep();
      await driversStep();
      await vehiclesStep();
      await underWritingStep();
    } else if (params.stepName === 'namedInsured') {
      try {
        await namedInsuredStep();
        await page.waitFor(1000);
        await page.waitFor(1000);
        await exitSuccess('Named Insured');
      } catch (error) {
        await exitFail(error, 'namedInsured');
      }
    } else if (params.stepName === 'drivers' && raterStore) {
      await driversStep();
      if (params.sendSummary && params.sendSummary === 'true') {
        await underWritingStep();
      } else {
        await exitSuccess('Drivers');
      }
    } else if (params.stepName === 'vehicles' && raterStore) {
      await vehiclesStep();
      await underWritingStep();
    } else if (params.stepName === 'summary' && raterStore) {
      await underWritingStep();
    }

    async function loginStep() {
      try {
        console.log('National Login Step.');
        await page.goto(nationalGeneralRater.LOGIN_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#txtUserID');
        await page.type('#txtUserID', username);
        await page.type('#txtPassword', password);
        await page.click('#btnLogin');
        await page.waitForNavigation({ timeout: 0 });
        stepResult.login = true;
      } catch (error) {
        await exitFail(error, 'login');
      }
    }

    async function existingQuoteStep() {
      try {
        console.log('National Existing Quote Id Step.');
        const quoteId = raterStore.quoteId;
        await page.evaluate((quoteId) => {
          document.querySelector('input[name=\'ctl00$MainContent$wgtMainMenuSearchQuotes$txtSearchString\']').value = quoteId;
        }, quoteId);
        await page.click('#ctl00_MainContent_wgtMainMenuSearchQuotes_btnSearchQuote');
        await page.waitFor(2000);
        stepResult.existingQuote = true;
      } catch (error) {
        console.log('Error at National Existing Quote Id Step:');
        stepResult.existingQuote = false;
        await exitFail(err, 'Existing Quote');
      }
    }

    async function newQuoteStep() {
      try {
        console.log('National New Quote Step.');
        await page.goto(nationalGeneralRater.NEW_QUOTE_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('select[name="ctl00$MainContent$wgtMainMenuNewQuote$ddlState"]');
        await page.select('select[name="ctl00$MainContent$wgtMainMenuNewQuote$ddlState"]', 'AL');
        await page.select('select[name="ctl00$MainContent$wgtMainMenuNewQuote$ddlProduct"]', 'PPA');
        await page.waitFor(1000);
        await page.click('span > #ctl00_MainContent_wgtMainMenuNewQuote_btnContinue');
        stepResult.newQuote = true;
      } catch (error) {
        console.log('Error at National New Quote  Step:');
        stepResult.newQuote = false;
        await exitFail(err, 'New Quote');
      }
    }

    async function namedInsuredStep() {
      console.log('National Named Insured Step.');
      try {
        await page.goto(nationalGeneralRater.NAMED_INSURED_URL, { waitUntil: 'domcontentloaded' });
        page.on('dialog', async (dialog) => {
          await dialog.dismiss();
        });
        await page.waitFor(2000);
        await fillPageForm(null, null, null);
        await page.waitFor(2000);
        await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        await page.waitFor(5000);
        quoteId = await page.$eval('#ctl00_lblHeaderPageTitleTop', e => e.innerText);
        if (await page.$('#ctl00_MainContent_btnContinue')) {
          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        }
        stepResult.namedInsured = true;
      } catch (err) {
        await exitFail(err, 'Named Insured');
      }
    }

    async function driversStep() {
      if (response) return;
      console.log('National Drivers Step.');
      try {
        await page.waitFor(1000);
        await page.goto(nationalGeneralRater.DRIVERS_URL, { waitUntil: 'load' });
        const customCode = async function () {
          await page.waitForSelector('#ctl00_MainContent_InsuredDriverLabel1_btnAddDriver');
          for (const j in bodyData.drivers) {
            if (j < bodyData.drivers.length - 1) {
              await page.evaluate((i) => {
                const el = document.getElementById(`ctl00_MainContent_InsuredDriverLabel${parseInt(i) + 1}_btnAddDriver`);
                if (el) {
                  el.click();
                }
              }, j);
            }
            await page.waitFor(1000);
          }
        };
        await fillPageForm(customCode, null, 1000);
        await page.waitFor(5000);
        await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        await page.waitFor(5000);
        if (await page.$('#ctl00_MainContent_btnContinue')) {
          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        }
        stepResult.drivers = true;
      } catch (err) {
        await exitFail(err, 'Driver');
      }
    }

    async function vehiclesStep() {
      if (response) return;
      console.log('National Vehicles Step.');
      try {
        await page.waitFor(2000);
        await page.goto(nationalGeneralRater.VEHICLES_URL, { waitUntil: 'load' });
        await page.waitForSelector('#ctl00_MainContent_InsuredAutoLabel1_btnAddAuto');

        const customCode = async function () {
          await page.waitForSelector('#ctl00_MainContent_InsuredAutoLabel1_btnAddAuto');
          for (const j in bodyData.vehicles) {
            if (j < bodyData.vehicles.length - 1) {
              await page.evaluate((i) => {
                const el = document.getElementById(`ctl00_MainContent_InsuredAutoLabel${parseInt(i) + 1}_btnAddAuto`);
                if (el) {
                  el.click();
                }
              }, j);
            }
            await page.waitFor(2000);
          }
        };
        const afterCode = async function () {
          for (const j in bodyData.vehicles) {
            await page.evaluate(async (data, i) => {
              const vinEl = document.getElementsByName(`ctl00$MainContent$AutoControl${parseInt(i) + 1}$txtVIN`);
              const vinBtn = document.getElementById(`ctl00_MainContent_AutoControl${parseInt(i) + 1}_btnVerifyVIN`);
              if (vinEl) {
                vinEl.value = data[`ctl00$MainContent$AutoControl${parseInt(i) + 1}$txtVIN`].value;
                vinBtn.click();
              }
            }, populatedData, j);
            await page.waitFor(1000);
          }
        };
        await fillPageForm(customCode, afterCode, 1000);
        await page.waitFor(2000);
        await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        stepResult.vehicles = true;
        await page.waitFor(1000);
        await page.goto(nationalGeneralRater.VEHICLE_HISTORY_URL, { waitUntil: 'load' });
        await page.waitFor(1000);
        await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
      } catch (err) {
        await exitFail(err, 'Vehicles');
      }
    }

    async function underWritingStep() {
      if (response) return;
      console.log('National Underwriting Step.');
      try {
        await page.waitFor(1200);
        await page.goto(nationalGeneralRater.UNDERWRITING_URL, { waitUntil: 'load' });
        await page.waitFor(2000);
        await fillPageForm(null, null, null);
        await page.select('#ctl00_MainContent_ctl09_ddlAnswer', 'False');
        // await page.select('#ctl00_MainContent_ctl05_ddlAnswer', 'False');
        await page.evaluate(() => {
          const text = document.querySelector('#ctl00_MainContent_ctl05_lblQuestion').innerText;
          if (text && text.includes('own')) {
            document.querySelector('#ctl00_MainContent_ctl05_ddlAnswer').value = 'True';
          } else {
            document.querySelector('#ctl00_MainContent_ctl05_ddlAnswer').value = 'False';
          }
        });
        await page.select('#ctl00_MainContent_ctl07_ddlAnswer', 'False');
        await page.waitFor(2000);
        await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        await coveragesStep();
        stepResult.underWriting = true;
      } catch (err) {
        await exitFail(err, 'UnderWriting');
      }
    }

    async function coveragesStep() {
      if (response) return;
      console.log('National Coverages Step.');
      try {
        await page.goto(nationalGeneralRater.COVERAGES_URL, { waitUntil: 'load' });
        await page.waitFor(1600);
        const options = await page.$$eval('#ctl00_MainContent_ddlPayPlan option', options => options.map(option => option.innerText));
        const values = await page.$$eval('#ctl00_MainContent_ddlPayPlan option', options => options.map(option => option.value));
        let value = '5650';
        if (options && values) {
          const i = SS.findBestMatch('20% Down, 5 Payments', options).bestMatchIndex;
          value = values[i];
        }
        await page.select('#ctl00_MainContent_ddlPayPlan', value); // 20% down option
        await page.waitFor(2000);
        await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        await page.waitFor(2000);
        await summaryStep();
      } catch (err) {
        await exitFail(err, 'coverages');
      }
    }

    async function summaryStep() {
      console.log('National summaryStep Step.');
      try {
        await page.goto(nationalGeneralRater.BILLPLANS_URL, { waitUntil: 'load' });
        const tHead = await page.$$eval('table tr.GRIDHEADER td', tds => tds.map(td => td.innerText));
        const tBody = await page.$$eval('table #ctl00_MainContent_ctl03_tblRow td', tds => tds.map(td => td.innerText));
        quoteId = await page.$eval('#ctl00_lblHeaderPageTitleTop', e => e.innerText);
        const downPayments = {};
        tHead.forEach((key, i) => {
          if (i !== 0) downPayments[key] = tBody[i];
        });

        const premiumDetails = {
          description: downPayments.DESCRIPTION,
          downPayment: downPayments['DOWN PAYMENT'],
          payments: downPayments.PAYMENTS,
          totalPremium: downPayments.TOTAL,
        };
        stepResult.summary = true;
        response = {
          title: 'Successfully retrieved national general rate.',
          status: true,
          totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
          months: premiumDetails.plan ? premiumDetails.plan : null,
          downPayment: premiumDetails.downPayment ? premiumDetails.downPayment.replace(/,/g, '') : null,
          quoteId,
          stepResult,
        };
        browser.close();
        saveRatingFromJob(req, response);
      } catch (err) {
        await exitFail(err, 'summary');
      }
    }

    async function exitSuccess(step) {
      try {
        response = {
          title: `Successfully finished National ${step} Step`,
          status: true,
          quoteId: raterStore && raterStore.quoteId ? raterStore.quoteId : quoteId,
          stepResult,
        };
        browser.close();
        saveRatingFromJob(req, response);
      } catch (error) {
        await exitFail(error, 'exitSuccess');
      }
    }

    async function exitFail(error, step) {
      console.log(`Error during National ${step} step:`, error);
      response = {
        title: 'Failed to retrieve National rate',
        status: false,
        error: `There was an error at ${step} step`,
        stepResult,
        quoteId,
      };
      browser.close();
      saveRatingFromJob(req, response);
    }

    async function fillPageForm(beforeCustomCode, afterCustomCode, delayAfter) {
      try {
        if (beforeCustomCode) {
          await beforeCustomCode();
        }
        const qO = await page.evaluate(async (data) => {
          const form = document.aspnetForm;
          for (const ele of form.elements) {
            if (ele.disabled) {
              ele.disabled = false;
            }
          }
          const formD = new FormData(form);
          const quoteObj = {};
          for (const pair of formD.entries()) {
            const key = (pair && pair[0]) ? pair[0] : null;
            const value = (data && key && data[key] && data[key].value) ? data[key].value : null;
            if (key && value) {
              const els = document.getElementsByName(key);
              const el = (els && els[0]) ? els[0] : null;
              if (el.type === 'text') {
                el.value = value;
              } else if (el.type === 'select-one' && el.options && el.options.length && el.options.length > 0) {
                el.value = await getBestValue(value, el.options);
              } else if (el.type === 'radio' || el.type === 'checkbox') {
                el.checked = !!((value && value === true));
              }
            }
          }
          return quoteObj;

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
      } catch (error) {
        console.log(error);
        await exitFail(error, 'FillPage');
      }
    }

    function populateKeyValueData() {
      const staticDataObj = {
        producer: '610979',
        inputBy: '20000739',
        plan: 'G5',
        firstName: 'Test',
        lastName: 'User',
        emailOption: 'EmailProvided',
        email: 'test@mail.com',
        birthDate: '12/16/1993',
        mailingAddress: '1608 W Magnolia Ave',
        phone1: '455',
        phone2: '555',
        phone3: '5555',
        phoneType: '3',
        city: 'Geneva',
        state: 'Alabama',
        zipCode: '36340',
        hasMovedInLast60Days: 'False',
        residentStatus: 'HCO',
        priorInsuranceCo: '0',
        priorExpirationDate: '07/30/2019',
        priorBICoverage: '25/50',
        security1: '122',
        security2: '22',
        security3: '2222',
        drivers: [
          {
            firstName: 'Test',
            lastName: 'User',
            applicantBirthDt: '12/16/1993',
            gender: 'Male',
            maritalStatus: 'Single',
            relationShip: 'Named Insured',
            driverStatus: 'Rated Driver',
            yearsOfExperience: '8',
            driverLicenseStatus: 'Valid',
            driversLicenseNumber: '12345',
            smartDrive: 'True',
            driversLicenseStateCd: 'AL',
          },
        ],
        vehicles: [
          {
            vehicleVin: 'KMHDH6AE1DU001708',
            vtype: 'PPA',
            modelYear: '2013',
            make: 'HYUN',
            model: 'SANTA FE G',
            style: 'WAGON 4 DOOR 4 Cyl 4x2',
            primaryUse: 'Business',
            antiTheft: 'Recovery Device',
            garagingState: 'AL',
            garagingzipCode: '36016',
            ownOrLeaseVehicle: 'Owned',
            vehicleType: 'Private Passenger Auto',
          },
        ],
      };
      const phone = bodyData.phone.slice(0, 10);
      const clientInputSelect = {
        ctl00$MainContent$InsuredNamed1$ddlProducers: {
          type: 'selet-one',
          value: bodyData.producer || staticDataObj.producer,
          name: 'ctl00$MainContent$InsuredNamed1$ddlProducers',
        },
        ctl00$MainContent$InsuredNamed1$ddlInputBy: {
          type: 'selet-one',
          value: bodyData.inputBy || staticDataObj.inputBy,
          name: 'ctl00$MainContent$InsuredNamed1$ddlInputBy',
        },
        ctl00$MainContent$InsuredNamed1$ddlPlanCode: {
          type: 'selet-one',
          value: bodyData.plan || staticDataObj.plan,
          name: 'ctl00$MainContent$InsuredNamed1$ddlPlanCode',
        },
        ctl00$MainContent$InsuredNamed1$txtInsFirstName: {
          type: 'text',
          value: bodyData.firstName || staticDataObj.firstName,
          name: 'ctl00$MainContent$InsuredNamed1$txtInsFirstName',
        },
        ctl00$MainContent$InsuredNamed1$txtInsLastName: {
          type: 'text',
          value: bodyData.lastName || staticDataObj.lastName,
          name: 'ctl00$MainContent$InsuredNamed1$txtInsLastName',
        },
        ctl00$MainContent$InsuredNamed1$ddlInsSuffix: {
          type: 'select-one',
          value: bodyData.suffixName || 'None',
          name: 'ctl00$MainContent$InsuredNamed1$ddlInsSuffix',
        },
        ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone1: {
          type: 'text',
          value: phone ? phone.slice(0, 3) : staticDataObj.phone1,
          name: 'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone1',
        },
        ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone2: {
          type: 'text',
          value: phone ? phone.slice(6) : staticDataObj.phone2,
          name: 'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone2',
        },
        ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone3: {
          type: 'text',
          value: phone ? phone.slice(6) : staticDataObj.phone3,
          name: 'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone3',
        },
        ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$ddlPhoneType: {
          type: 'select-one',
          value: '3' || '',
          name: 'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$ddlPhoneType',
        },
        ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum1: {
          type: 'text',
          value: staticDataObj.security1 || '',
          name: 'ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum1',
        },
        ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum2: {
          type: 'text',
          value: staticDataObj.security2 || '',
          name: 'ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum2',
        },
        ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum3: {
          type: 'text',
          value: staticDataObj.security3 || '',
          name: 'ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum3',
        },
        ctl00$MainContent$InsuredNamed1$ddlEmailOption: {
          type: 'select-one',
          value: 'EmailProvided' || '',
          name: 'ctl00$MainContent$InsuredNamed1$ddlEmailOption',
        },
        ctl00$MainContent$InsuredNamed1$txtInsEmail: {
          type: 'text',
          value: bodyData.email || staticDataObj.email,
          name: 'ctl00$MainContent$InsuredNamed1$txtInsEmail',
        },
        ctl00$MainContent$InsuredNamed1$txtInsDOB: {
          type: 'text',
          value: bodyData.birthDate || staticDataObj.birthDate,
          name: 'ctl00$MainContent$InsuredNamed1$txtInsDOB',
        },
        ctl00$MainContent$InsuredNamed1$txtInsAdr: {
          type: 'text',
          value: bodyData.mailingAddress || staticDataObj.mailingAddress,
          name: 'ctl00$MainContent$InsuredNamed1$txtInsAdr',
        },
        ctl00$MainContent$InsuredNamed1$txtInsCity: {
          type: 'text',
          value: bodyData.city || staticDataObj.city,
          name: 'ctl00$MainContent$InsuredNamed1$txtInsCity',
        },
        ctl00$MainContent$InsuredNamed1$ddlInsState: {
          type: 'select-one',
          value: bodyData.state || staticDataObj.state,
          name: 'ctl00$MainContent$InsuredNamed1$ddlInsState',
        },
        ctl00$MainContent$InsuredNamed1$txtInsZip: {
          type: 'text',
          value: bodyData.zipCode || staticDataObj.zipCode,
          name: 'ctl00$MainContent$InsuredNamed1$txtInsZip',
        },
        ctl00$MainContent$InsuredNamed1$ddlInsRecentMove60: {
          type: 'select-one',
          value: 'False' || '',
          name: 'ctl00$MainContent$InsuredNamed1$ddlInsRecentMove60',
        },
        ctl00$MainContent$PriorPolicy$ddlCurrentCarrier: {
          type: 'select-one',
          value: bodyData.priorInsuranceCo || staticDataObj.priorInsuranceCo,
          name: 'ctl00$MainContent$PriorPolicy$ddlCurrentCarrier',
        },
        ctl00$MainContent$PriorPolicy$ddlBICoverage: {
          type: 'select-one',
          value: bodyData.priorBICoverage || staticDataObj.priorBICoverage,
          name: 'ctl00$MainContent$PriorPolicy$ddlBICoverage',
        },
        ctl00$MainContent$PriorPolicy$txtExpDateOld: {
          type: 'text',
          value: bodyData.priorExpirationDate || staticDataObj.priorExpirationDate,
          name: 'ctl00$MainContent$PriorPolicy$txtExpDateOld',
        },
        ctl00$MainContent$ctl00$ddlAnswer: {
          type: 'select-one',
          value: bodyData.residentStatus || staticDataObj.residentStatus,
          name: 'ctl00$MainContent$ctl00$ddlAnswer"]',
        },
        ctl00$MainContent$ProhibitedRisk6$ddlProhibitedRisk: {
          type: 'select-one',
          value: 'False' || '',
          name: 'ctl00$MainContent$ProhibitedRisk6$ddlProhibitedRisk',
        },
        ctl00$MainContent$ctl07$ddlAnswer: {
          type: 'select-one',
          value: 'False' || '',
          name: 'ctl00$MainContent$ctl07$ddlAnswer',
        },
      };

      if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
        for (const j in bodyData.drivers) {
          const i = parseInt(j) + 1;
          const element = bodyData.drivers[j];
          clientInputSelect[`ctl00$MainContent$Driver${i}$txtFirstName`] = {
            type: 'text',
            value: element.firstName || staticDataObj.drivers[0].firstName,
            name: `ctl00$MainContent$Driver${i}$txtFirstName`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$txtLastName`] = {
            type: 'text',
            value: element.lastName || staticDataObj.drivers[0].lastName,
            name: `ctl00$MainContent$Driver${i}$txtLastName`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$txtDateOfBirth`] = {
            type: 'text',
            value: element.applicantBirthDt || staticDataObj.drivers[0].applicantBirthDt,
            name: `ctl00$MainContent$Driver${i}$txtDateOfBirth`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$ddlSex`] = {
            type: 'select-one',
            value: element.gender || staticDataObj.drivers[0].gender,
            name: `ctl00$MainContent$Driver${i}$ddlSex`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$ddlMaritalStatus`] = {
            type: 'select-one',
            value: element.maritalStatus || staticDataObj.drivers[0].maritalStatus,
            name: `ctl00$MainContent$Driver${i}$ddlMaritalStatus`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$ddlRelationship`] = {
            type: 'select-one',
            value: 'Other' || '',
            name: `ctl00$MainContent$Driver${i}$ddlRelationship`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$ddlDriverStatus`] = {
            type: 'select-one',
            value: 'Rated Driver' || '',
            name: `ctl00$MainContent$Driver${i}$ddlDriverStatus`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$txtYrsExperience`] = {
            type: 'text',
            value: element.yearsOfExperience || staticDataObj.drivers[0].yearsOfExperience,
            name: `ctl00$MainContent$Driver${i}$txtYrsExperience`,
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$ddlDLStatus`] = {
            type: 'text',
            name: `ctl00$MainContent$Driver${i}$ddlDLStatus`,
            value: 'Valid' || '',
          };
          // clientInputSelect[`ctl00$MainContent$Driver${i}$txtDLNumber`] = {
          //   type: 'text',
          //   name: `ctl00$MainContent$Driver${i}$txtDLNumber`,
          //   value: element.driversLicenseNumber || '',
          // };
          clientInputSelect[`ctl00$MainContent$Driver${i}$ddlSmartDrive`] = {
            type: 'select-one',
            name: `ctl00$MainContent$Driver${i}$ddlSmartDrive`,
            value: 'False' || '',
          };
          clientInputSelect[`ctl00$MainContent$Driver${i}$ddlLicenseState`] = {
            type: 'select-one',
            name: `ctl00$MainContent$Driver${i}$ddlLicenseState`,
            value: element.driversLicenseStateCd || staticDataObj.drivers[0].driversLicenseStateCd,
          };
        }
      }

      if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
        for (const j in bodyData.vehicles) {
          const i = parseInt(j) + 1;
          const element = bodyData.vehicles[j];
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$txtVIN`] = {
            type: 'text',
            name: `ctl00$MainContent$AutoControl${i}$txtVIN`,
            value: element.vehicleVin || staticDataObj.vehicles[0].vehicleVin,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlType`] = {
            type: 'text',
            name: `ctl00$MainContent$AutoControl${i}$ddlType`,
            value: element.vehicleType || staticDataObj.vehicles[0].vehicleType,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$txtModelYear`] = {
            type: 'text',
            value: element.modelYear || staticDataObj.vehicles[0].modelYear,
            name: `ctl00$MainContent$AutoControl${i}$txtModelYear`,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlMake`] = {
            type: 'select-one',
            value: element.make || staticDataObj.vehicles[0].make,
            name: `ctl00$MainContent$AutoControl${i}$ddlMake`,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlModel`] = {
            type: 'select-one',
            value: element.model || staticDataObj.vehicles[0].model,
            name: `ctl00$MainContent$AutoControl${i}$ddlModel`,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlStyle`] = {
            type: 'select-one',
            value: element.style || staticDataObj.vehicles[0].style,
            name: `ctl00$MainContent$AutoControl${i}$ddlStyle`,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlPrimaryUse`] = {
            type: 'select-one',
            value: element.primaryUse || 'Pleasure/Commute',
            name: `ctl00$MainContent$AutoControl${i}$ddlPrimaryUse`,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlAntiTheft`] = {
            type: 'select-one',
            value: 'Recovery Device',
            name: `ctl00$MainContent$AutoControl${i}$ddlAntiTheft`,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlState`] = {
            type: 'select-one',
            value: element.garagingState || staticDataObj.vehicles[0].garagingState,
            name: `ctl00$MainContent$AutoControl${i}$ddlState`,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$txtZip`] = {
            type: 'text',
            name: `ctl00$MainContent$AutoControl${i}$txtZip`,
            value: element.garagingzipCode || staticDataObj.vehicles[0].garagingzipCode,
          };
          clientInputSelect[`ctl00$MainContent$AutoControl${i}$ddlOwnershipStatus`] = {
            type: 'select-one',
            name: `ctl00$MainContent$AutoControl${i}$ddlOwnershipStatus`,
            value: element.ownOrLeaseVehicle || staticDataObj.vehicles[0].ownOrLeaseVehicle,
          };
        }
      }
      return clientInputSelect;
    }
  } catch (error) {
    console.log('Error at National : ', error.stack);
  }
}
