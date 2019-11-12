/* eslint-disable no-multi-assign */
/* eslint-disable default-case */
/* eslint-disable prefer-destructuring, no-constant-condition, no-console, dot-notation, no-await-in-loop, max-len, no-use-before-define, no-inner-declarations, no-param-reassign, no-restricted-syntax, consistent-return, no-undef, */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const stringSimilarity = require('string-similarity');
const moment = require('moment');
const { stateAutoRater } = require('../constants/appConstant');
const { saveRatingFromJob } = require('../controllers/rater');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate, ageCount } = require('../lib/utils');

const self = module.exports = {

  stateAuto: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
      const yeasterDay = formatDate(moment(new Date()).subtract(1, 'days'));
      const sixMonthsFromNow = formatDate(moment(new Date()).add(6, 'months'));

      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);
      bodyData.drivers[0].ageWhen1stLicensed = await ageCount(bodyData.drivers[0].applicantBirthDt);

      const stepResult = {
        login: false,
        customerInfo: false,
        vehicles: false,
        drivers: false,
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
      await driverStep();
      await vehicleStep();
      await coverageStep();
      await summaryStep();

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
          const url = (`${stateAutoRater.NEW_QUOTE_URL}?postalCode=${bodyData.zipCode}&state=${bodyData.state}&lob=AUTOP&effectiveDate=2019-12-01`);
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
          await page.waitFor(500);
          await page.waitForSelector('[data-test-id="customer-info-pni-first-name"]');
          await fillPage();
          await page.waitFor(3000);
          await page.waitForSelector('[data-test-id="customer-info-agent-of-record"]');
          await selectElement('[data-test-id="customer-info-agent-of-record"]', '187696');
          await page.waitFor(2000);
          const nextBtn = await page.$('[data-test-id="personal-footer-next"]');
          nextBtn.click();
          await page.waitFor(1000);
          let dialogBtn = await page.$('[data-test-id="address-continue-button-id"]');
          // TODO** This only works if the address is incorrect. We need to add logic to make sure we account for if the address is correct. Also, if it is close theres a different model that popups up, we need to account for this as well. 
          if (dialogBtn) {
            dialogBtn.click();
            await page.waitFor(500);
          }
          const cancelBtn = await page.$('body > app-root > sa-dialog:nth-child(4) > div.dialog-container.active > article > div > section > address-scrubbing > form > div > div.row > div > div > button.rbtn1_gry_white');
          if (cancelBtn) {
            cancelBtn.focus();
            cancelBtn.click();
            await page.waitFor(500);
          }
          const customerEl = await page.$('[data-test-id="customer-info-pni-first-name"]');
          if (customerEl) {
            nextBtn.click();
            await page.waitFor(3000);
          }
          stepResult.customerInfo = true;
        } catch (error) {
          await exitFail(error, 'Add Customer');
        }
      }

      async function driverStep() {
        try {
          console.log('State Auto Driver Step');
          await page.waitFor(500);
          await page.waitForSelector('[data-test-id="driver1-license-number"]');
          await addMultiple('drivers');
          await fillPage();
          await page.waitFor(2000);
          const nextBtn = await page.$('[data-test-id="personal-footer-next"]');
          nextBtn.click();
          await page.waitFor(1000);
          stepResult.drivers = true;
        } catch (error) {
          await exitFail(error, 'Drivers');
        }
      }

      async function vehicleStep() {
        try {
          console.log('State Auto Vehicle Step');
          await page.waitFor(500);
          await page.waitForSelector('[data-test-id="vehicle1-addVehiclesBy-VIN"]');
          await addMultiple('vehicles');
          await fillPage();
          await page.waitFor(2000);
          const nextBtn = await page.$('[data-test-id="personal-footer-next"]');
          await page.waitFor(1000);
          const modal = await page.$('[data-test-id="current-carrier-modal-company"]');
          nextBtn.click();
          if (!modal) {
            nextBtn.click();
          }
          stepResult.vehicles = true;
        } catch (error) {
          await exitFail(error, 'Vehicle');
        }
      }

      async function coverageStep() {
        try {
          console.log('State Auto Coverage Step');
          await page.waitFor(2000);
          await page.waitForSelector('[data-test-id="current-carrier-modal-company"]');
          // await selectElement('[data-test-id="current-carrier-modal-company"]', '00000');
          await fillPage();
          await page.waitFor(2000);
          const submitBtn = await page.$('[data-test-id="current-carrier-modal-submit"]');
          submitBtn.click();
          await page.waitFor(1000);
          const dialogBtn = await page.$('[data-test-id="safety-360-modal-cancel-button"]');
          if (dialogBtn) {
            dialogBtn.click();
            await page.waitFor(500);
          }
          await page.waitFor(1000);
          stepResult.coverage = true;
        } catch (error) {
          await exitFail(error, 'Coverage');
        }
      }

      async function summaryStep() {
        try {
          console.log('State Auto Summary Step');
          await page.waitFor(3000);
          await page.waitForSelector('#current-page-content-wrapper-id > div > personal-auto-quote > form > div > div:nth-child(4) > div > personal-premium > div > div:nth-child(1) > span.premium-amount.ng-star-inserted');
          const premiumDetails = await page.evaluate(() => {
            const downPaymentsObj = {};
            const ele = document.querySelector('[data-test-id="effective-date-term"]');
            downPaymentsObj.plan = ele.options[ele.selectedIndex].text;
            downPaymentsObj.monthlyPremium = document.querySelector('#current-page-content-wrapper-id > div > personal-auto-quote > form > div > div:nth-child(4) > div > personal-premium > div > div:nth-child(2) > span.premium-amount.ng-star-inserted').innerText.replace(/\$/g, '');
            downPaymentsObj.totalPremium = document.querySelector('#current-page-content-wrapper-id > div > personal-auto-quote > form > div > div:nth-child(4) > div > personal-premium > div > div:nth-child(1) > span.premium-amount.ng-star-inserted').innerText.replace(/\$/g, '');
            return downPaymentsObj;
          });
          stepResult.summary = true;
          response = {
            title: 'Successfully retrieved state Auto rate.',
            status: true,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            monthlyPremium: premiumDetails.monthlyPremium ? premiumDetails.monthlyPremium.replace(/,/g, '') : null,
            stepResult,
          };
          browser.close();
          saveRatingFromJob(req, response);
          // req.session.data = {
          //   title: 'Successfully retrieved state Auto rate.',
          //   status: true,
          //   totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
          //   months: premiumDetails.plan ? premiumDetails.plan : null,
          //   monthlyPremium: premiumDetails.monthlyPremium ? premiumDetails.monthlyPremium.replace(/,/g, '') : null,
          //   stepResult,
          // }
          // return next();
          console.log('response', response);
        } catch (error) {
          await exitFail(error, 'Summary');
        }
      }

      async function fillPage() {
        try {
          await page.waitFor(500);
          for (const row of populatedData) {
            const element = `[data-test-id="${row.element}"]`;
            const field = await page.$(element);
            if (field) {
              if (row.type === 'input') {
                await typeInInputElements(element, row.value);
              } else if (row.type === 'select') {
                if (row.beforeDelay) {console.log('Before Delay');await page.waitFor(row.beforeDelay)};
                await selectElement(element, row.value);
                if (row.afterDelay) {console.log('After Delay');await page.waitFor(row.afterDelay)};
              } else if (row.type === 'radio') {
                const radio = await page.$(element);
                if (radio && row.value === true) {
                  if (row.isAddCSS) {
                    await page.evaluate((ele) => {
                      const radioBtn = document.querySelector(ele);
                      radioBtn.classList.add('mat-radio-checked');
                      radioBtn.click();
                    }, element);
                  } else {
                    radio.click();
                  }
                  await page.waitFor(500);
                }
              }
            }
          }
        } catch (error) {
          await exitFail(error, 'Add Customer');
        }
      }

      async function addMultiple(type) {
        try {
          if (bodyData[type] && bodyData[type].length > 0) {
            let btnEl = null;
            if (type === 'drivers') {
              btnEl = await page.$('[data-test-id="drivers-add-driver"]');
            } else if (type === 'vehicles') {
              const btns = await page.$$('.rbtn2_1');
              btnEl = btns[2];
            }
            for (let i=0;i<bodyData[type].length;i++) {
              if (i>0) {
                btnEl.click();
                await page.waitFor(2000);
              }
            }
          }
        } catch (error) {
          await exitFail(error, 'Add Multiple');
        }
      }

      async function selectElement(selector, option) {
        await page.evaluate(async (sel, opt) => {
          const element = document.querySelector(sel);
          // eslint-disable-next-line no-nested-ternary
          const options = element.options;

          const bestValue = await getBestValue(opt, options);
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          nativeInputValueSetter.call(element, bestValue);
          // eslint-disable-next-line no-nested-ternary
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
        }, selector, option);
      }

      async function typeInInputElements(inputSelector, text) {
        await page.evaluate((selector, inputText) => {
          const inputElement = document.querySelector(selector);
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(inputElement, inputText);
          const ev2 = new Event('input', { bubbles: true });
          inputElement.dispatchEvent(ev2);
        }, inputSelector, text);
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
          mailingAddress: '27 Old Solomons Island Road',
          city: 'Anapolis',
          state: 'MD',
          zipCode: '24101',
          primaryResidence: 'OTH',
          priorInsuranceCarrier: 'Other Non-Standard',
          priorInsuranceMonths: '5',
          priorBodilyInjuryLimits: '300000',
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
              primaryUse: 'Pleasure',
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
              licenseState: 'MD',
              yearLicenseIssued: '2014',
              dateWhenLicensed: yeasterDay,
              licenseNumber: 'F560148000125',
            },
          ],
        };

        const dataObj = [];
        dataObj.push({ type: 'input', element: 'customer-info-pni-first-name', value: bodyData.firstName || staticDataObj.firstName });
        dataObj.push({ type: 'input', element: 'customer-info-pni-last-name', value: bodyData.lastName || staticDataObj.lastName });
        dataObj.push({ type: 'input', element: 'customer-info-pni-dob', value: bodyData.birthDate || staticDataObj.birthDate });
        dataObj.push({ type: 'input', element: 'customer-info-personal-address-line', value: bodyData.mailingAddress || staticDataObj.mailingAddress });
        const city = bodyData.city ? bodyData.city.toUpperCase() : staticDataObj.city.toUpperCase();
        dataObj.push({ type: 'select', element: 'customer-info-personal-address-city', value: city });
        dataObj.push({ type: 'select', element: 'customer-info-pni-occupation', value: bodyData.occupation || staticDataObj.occupation });
        dataObj.push({ type: 'select', element: 'customer-info-pni-education', value: bodyData.education || staticDataObj.education });
        dataObj.push({ type: 'select', element: 'customer-info-producer-code', value: '0009450' });
        dataObj.push({ type: 'select', element: 'customer-info-agent-of-record', value: '187696' });
        dataObj.push({ type: 'radio', element: 'customer-info-multi-policy-discount-no', value: true });
        let carrier = (bodyData.priorInsuranceCarrier && bodyData.priorInsurance !== 'No') ? bodyData.priorInsuranceCarrier.toLowerCase() : 'No Prior Insurance';
        if (!carrier.includes('owners') && !carrier.includes('farm bureau') && !carrier.includes('kentucky') && !carrier.includes('pekin') && !carrier.includes('state auto') && !carrier.includes('west')) {
          carrier = 'Other Non-standard';
        }
        dataObj.push({ type: 'select', element: 'current-carrier-modal-company', value: carrier });
        dataObj.push({ type: 'radio', element: 'current-carrier-modal-coverage-inforce-yes', value: carrier !== 'No Prior' });
        let months = 0;
        if (bodyData.priorInsuranceYears) {
          const ytM = +bodyData.priorInsuranceYears * 12;
          months += ytM;
        }
        if (bodyData.priorInsuranceMonths) {
          months += +bodyData.priorInsuranceMonths;
        }
        if (!bodyData.priorInsuranceMonths && !bodyData.priorInsuranceYears) {
          months = staticDataObj.priorInsuranceMonths;
        }
        dataObj.push({ type: 'input', element: 'current-carrier-modal-coverage-months', value: months });
        dataObj.push({ type: 'input', element: 'current-carrier-modal-coverage-effective-date', value: tomorrow });
        dataObj.push({ type: 'input', element: 'current-carrier-modal-coverage-expiration-date', value: sixMonthsFromNow });
        dataObj.push({ type: 'select', element: 'current-carrier-modal-prior-liability-limits', value: bodyData.priorBodilyInjuryLimits || staticDataObj.priorBodilyInjuryLimits });
        
        

        if (bodyData.drivers && bodyData.drivers.length > 0) {
          for (let i = 0; i < bodyData.drivers.length; i++) {
            const driver = bodyData.drivers[i];
            const staticDriver = staticDataObj.drivers[0];
            const index = (i + 1);
            if (i > 0) {
              dataObj.push({ type: 'input', element: `driver${index}-first-name`, value: driver.firstName || staticDriver.firstName });
              dataObj.push({ type: 'input', element: `driver${index}-last-name`, value: driver.lastName || staticDriver.lastName });
              dataObj.push({ type: 'select', element: `driver${index}-occupation`, value: driver.occupation || staticDriver.occupation });
              dataObj.push({ type: 'select', element: `driver${index}-education-level`, value: driver.education || staticDriver.education });
              dataObj.push({ type: 'input', element: `driver${index}-info-pni-dob`, value: driver.birthDate || staticDriver.birthDate });
              dataObj.push({ type: 'input', element: `driver${index}-license-number`, value: driver.licenseNumber || staticDriver.licenseNumber });
              dataObj.push({ type: 'select', element: `driver${index}-license-state`, value: driver.licenseState || staticDriver.licenseState });
              dataObj.push({ type: 'select', element: `driver${index}-first-year-licensed`, value: staticDriver.yearLicenseIssued });
              dataObj.push({ type: 'select', element: `driver${index}-marital-status`, value: driver.maritalStatus || staticDriver.maritalStatus });
              dataObj.push({ type: 'select', element: `driver${index}-relationship-to-primary`, value: driver.relation || staticDriver.relation });
              const gender = (driver.gender || staticDriver.gender);
              const isFemale = gender.toLowerCase().includes('f');
              const isMale = !isFemale;
              dataObj.push({ type: 'radio', element: `driver${index}-gender-female`, value: isFemale });
              dataObj.push({ type: 'radio', element: `driver${index}-gender-male`, value: isMale });
            } else {
              dataObj.push({ type: 'input', element: `driver${index}-license-number`, value: driver.licenseNumber || staticDriver.licenseNumber });
              dataObj.push({ type: 'select', element: `driver${index}-license-state`, value: driver.licenseState || staticDriver.licenseState });
              dataObj.push({ type: 'select', element: `driver${index}-first-year-licensed`, value: staticDriver.yearLicenseIssued });
              dataObj.push({ type: 'select', element: `driver${index}-marital-status`, value: driver.maritalStatus || staticDriver.maritalStatus });
              const gender = (driver.gender || staticDriver.gender);
              const isFemale = gender.toLowerCase().includes('f');
              const isMale = !isFemale;
              dataObj.push({ type: 'radio', element: `driver${index}-gender-female`, value: isFemale });
              dataObj.push({ type: 'radio', element: `driver${index}-gender-male`, value: isMale });
            }
          }
        }

        if (bodyData.vehicles && bodyData.vehicles.length > 0) {
          for (let i = 0; i < bodyData.vehicles.length; i++) {
            const vehicle = bodyData.vehicles[i];
            const staticVehicle = staticDataObj.vehicles[0];
            const index = (i + 1);
            const isVIN = vehicle.vehicleVin ? true : false;
            const isYearMM = !isVIN;
            dataObj.push({ type: 'radio', element: `vehicle${index}-addVehiclesBy-VIN`, value: isVIN });
            dataObj.push({ type: 'radio', element: `vehicle${index}-addVehiclesBy-yearMakeModel`, value: isYearMM });
            // TODO** Fails on Type Business. Its not adding the two radios below.(working)
            dataObj.push({ type: 'select', element: `vehicle${index}-primary-use`, value: vehicle.primaryUse || staticVehicle.primaryUse, beforeDelay: 1000 });
            dataObj.push({ type: 'radio', element: `vehicle${index}-usedForDelivery-no`, value: true });
            dataObj.push({ type: 'input', element: `vehicle${index}-vin-input`, value: vehicle.vehicleVin || staticVehicle.vehicleVin });
            if (!isVIN) {
              dataObj.push({ type: 'select', element: `vehicle${index}-year`, value: vehicle.year || staticVehicle.year });
              dataObj.push({ type: 'select', element: `vehicle${index}-make`, value: vehicle.make || staticVehicle.make });
              dataObj.push({ type: 'select', element: `vehicle${index}-model`, value: vehicle.model || staticVehicle.model });
            }
            if (vehicle.primaryUse === 'Business') {
              dataObj.push({ type: 'radio', element: `vehicle${index}-employeePresent-yes`, value: true, isAddCSS: true, afterDelay: 1000, beforeDelay: 1000 });
            }
            if (vehicle.primaryUse === 'Commute') {
              dataObj.push({ type: 'input', element: `vehicle${index}-commuting-miles`, value: '5000' });
            }
          }
        }
        return dataObj;
      }
    } catch (error) {
      console.log('Error at State Auto:', error);
      return next(Boom.badRequest('Failed to retrieved State Auto rate.'));
    }
  },
};
