
/* eslint-disable no-plusplus, no-mixed-operators, object-shorthand, no-shadow, curly, prefer-const, no-else-return, no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,no-nested-ternary,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition, dot-notation, quotes, func-names, consistent-return, indent, no-unneeded-ternary, nonblock-statement-body-position, no-floating-decimal, arrow-parens */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const utils = require('../lib/utils');
const { progressiveRater } = require('../constants/appConstant');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate } = require('../lib/utils');

const tomorrowDate = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
const Rater = require('../models/rater');
const { progressiveQueue } = require('../jobs/progressive');

module.exports = {
  rate: async (req, res, next) => {
    try {
      const params = req.body;
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;
      let quoteObj = {};

      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(9, bodyData.drivers.length);

      let stepResult = {
        login: false,
        existingQuote: false,
        newQuote: false,
        namedInsured: false,
        vehicles: false,
        drivers: false,
        violations: false,
        underWriting: false,
        coverage: false,
      };

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
      let pages = await browser.pages();
      const page = pages[0];
      const populatedData = await populateData();

      let pageQuote = '';
      await loginStep();

      if (raterStore) {
        await existingQuote();
      } else {
        await newQuoteStep();
      }
      while (true) {
        await page.waitFor(500);
        pageQuote = await browser.pages();
        if (pageQuote.length > 1) {
          pageQuote = pageQuote[1];
          break;
        }
      }

      pageQuote.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${msg.args()[i]}`);
      });
      pageQuote.on('dialog', async (dialog) => {
        if (dialog) {
          await dialog.dismiss();
        }
      });

      if (!params.stepName) {
        await allSteps();
      } else {
        if (params.stepName === 'namedInsured') {
          await namedInsuredStep();
          await pageQuote.waitForSelector('#aspnetForm');
          const failed = await pageQuote.evaluate(() => {
            if (document.querySelector('#S_REJECT_FR_GET_KICK_TEXT')) {
              document.getElementById('ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click();
              return true;
            } else {
              return false;
            }
          });
          if (failed) {
            await pageQuote.waitFor(1000);
            await namedInsuredStep();
          }
          await underwritingStep();
          await exitSuccess('namedInsured & underwriting', false);
        }
        if (params.stepName === 'vehicles' && raterStore) {
          await allSteps();
        }
        if (params.stepName === 'drivers' && raterStore) {
          await driverStep();
          await exitSuccess('drivers', true);
        }
        if (params.stepName === 'violations' && raterStore) {
          await violationStep();
        }
        if (params.stepName === 'underWriting' && raterStore) {
          await underwritingStep();
        }
        if (params.stepName === 'coverage' && raterStore) {
          await coveragesStep();
        }
      }

      async function allSteps() {
        await namedInsuredStep();
        await vehicleStep();
        await driverStep();
        await violationStep();
        await underwritingStep();
        await coveragesStep();
      }

      async function loginStep() {
        try {
          console.log('Progressive Login Step.');
          const credentials = { username: username, password: password };
          await page.goto(progressiveRater.LOGIN_URL, { waitUntil: 'load' }); // wait until page load
          await page.waitForSelector('#user1');
          await page.evaluate(async (obj) => {
            const uEl = document.getElementById('user1');
            const pEl = document.getElementById('password1');
            const btn = document.getElementById('image1');
            uEl.value = obj.username;
            pEl.value = obj.password;
            btn.click();
          }, credentials);
          await page.waitFor(1000);
          stepResult.login = true;
        } catch (error) {
          await exitFail(error, 'login');
        }
      }

      async function newQuoteStep() {
        console.log('Progressive New Quote Step.');
        try {
          await page.goto(progressiveRater.NEW_QUOTE_URL, { waitUntil: 'load' });
          await page.waitForSelector('#QuoteStateList');
          // TODO: MAKE AL DYNAMIC
          await page.select('#QuoteStateList', 'AL');
          await page.select('#Prds', 'AU');
          await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
          stepResult.newQuote = true;
        } catch (error) {
          await exitFail(error, 'newQuote');
        }
      }

      async function existingQuote() {
        console.log('Progressive Existing Quote Step');
        try {
          await page.goto(progressiveRater.SEARCH_QUOTE_URL, { waitUntil: 'load' });
          if (raterStore.quoteIds && raterStore.quoteIds.quoteNumber && raterStore.quoteIds.quoteNumber !== '') {
            await page.evaluate((quoteIds) => {
              const quoteKey = quoteIds.quoteKey;
              const quoteNumber = quoteIds.quoteNumber;
              // TODO: MAKE AL DYNAMIC
              quoteSearchOpenQuote(`/NewBusiness/QuotingGateway/RouteQuote/?app=OpenQuote&quotekey=${quoteKey}&quoteNumber=${quoteNumber}&quoteActivityId=&st_cd=AL&prod_cd=AU&qt_src=DQS&risk_cd=AA`, 'AU');
            }, raterStore.quoteIds);
          } else {
            const tdText = await page.$$eval('table tbody tr td p a', tds => tds.map(td => td.innerText));
            const name = `${populatedData['DRV.0.drvr_lst_nam'].value}, ${populatedData['DRV.0.drvr_frst_nam'].value}`;
            let failed = true;
            for (let i = 0; i < tdText.length; i++) {
              if (tdText[i] === name) {
                failed = await page.evaluate((index) => {
                  const els = document.getElementsByClassName('insuredNameLink');
                  els[index].click();
                  return false;
                }, i);
              }
            }
            if (failed) {
              await newQuoteStep();
            }
          }
          stepResult.existingQuote = true;
        } catch (error) {
          await exitFail(error, 'existingQuote');
        }
      }

      async function namedInsuredStep() {
        try {
          await loadStep('NamedInsured', false);
          await fillPageForm('Underwriting', null, null, null, 2);
          stepResult.namedInsured = true;
        } catch (error) {
          await exitFail(error, 'namedInsured');
        }
      }

      async function vehicleStep() {
        try {
          await loadStep('Vehicles', true);
          // dismissDialog(pageQuote);
          await pageQuote.waitForSelector('img[id="VEH.0.add"]');
          const beforeCode = async function () {
            for (const j in bodyData.vehicles) {
              await pageQuote.evaluate((i) => {
                const el = document.getElementById(`VEH.${i}.veh_vin`);
                if (!el) {
                  const addElement = document.getElementById('VEH.0.add');
                  addElement.click();
                }
              }, j);
              await pageQuote.waitFor(1000);
            }
          };
          const afterCode = async function () {
            for (const j in bodyData.vehicles) {
              await pageQuote.evaluate(async (data, i) => {
                const vinEl = document.getElementById(`VEH.${i}.veh_vin`);
                const vinBtn = document.getElementById(`VinVerifyButton_${i}`);
                if (vinEl) {
                  vinEl.value = data[`VEH.${i}.veh_vin`].value;
                  vinBtn.click();
                }
              }, populatedData, j);
              await pageQuote.waitFor(1000);
            }
          };
          await fillPageForm(null, beforeCode, afterCode, 2000, 2);
          stepResult.vehicles = true;
        } catch (error) {
          await exitFail(error, 'vehicles');
        }
      }

      async function driverStep() {
        try {
          await loadStep('Driver', true);
          const customCode = async function () {
            await pageQuote.waitForSelector('img[id="DRV.0.add"]');
            for (let j in bodyData.drivers) {
              await pageQuote.evaluate((i) => {
                const el = document.getElementById(`DRV.${i}.drvr_frst_nam`);
                if (!el) {
                  const addElement = document.getElementById('DRV.0.add');
                  addElement.click();
                }
              }, j);
              await pageQuote.waitFor(1000);
            }
          };
          await fillPageForm('Violations', customCode, null, 1000, 1);
          stepResult.drivers = true;
        } catch (error) {
          await exitFail(error, 'drivers');
        }
      }

      async function violationStep() {
        try {
          await loadStep('Violations', true);
          await fillPageForm('Underwriting', null, null, null, 1);
          await pageQuote.waitFor(500);
          stepResult.violations = true;
        } catch (error) {
          await exitFail(error, 'violations');
        }
      }

      async function underwritingStep() {
        try {
          await fillPageForm(null, null, null, null, 1);
          await pageQuote.waitFor(1000);
          await navigateMenu('Underwriting');
          await pageQuote.waitFor(1000);
          stepResult.underWriting = true;
        } catch (error) {
          await exitFail(error, 'underwriting');
        }
      }

      async function errorStep() {
        try {
          await fillPageForm(null, null, null, null, 2);
          await pageQuote.waitFor(500);
          const navPageNeeded = await pageQuote.evaluate(() => {
            const driverEl = document.querySelector('[source="Driver"]') ? document.querySelector('[source="Driver"]') : null;
            const vehicleEl = document.querySelector('[source="Vehicles"]') ? document.querySelector('[source="Vehicles"]') : null;
            if (driverEl) {
              driverEl.click();
              return 'driver';
            } else if (vehicleEl) {
              vehicleEl.click();
              return 'vehicle';
            } else {
              return null;
            }
          });
          if (navPageNeeded) {
            await pageQuote.waitFor(1000);
            if (navPageNeeded === 'vehicle') {
              await errorVehicleStep();
            } else if (navPageNeeded === 'driver') {
              await fillPageForm(null, null, null, null, 1);
            } else {
              await fillPageForm(null, null, null, null, 2);
            }
            await pageQuote.waitFor(2000);
          }
        } catch (error) {
          await exitFail(error, 'error');
        }
      }

      async function errorVehicleStep() {
        try {
          console.log('Progressive Vehicles Error Step');
          const afterCode = async function () {
            const data = populatedData;
            for (let j in bodyData.vehicles) {
              let key = `VEH.${j}.veh_mdl_yr`;
              const yearValue = (data[key] && data[key].value) ? data[key].value : null;
              const year = await pageQuote.evaluate((i) => document.getElementById(`VEH.${i}.veh_mdl_yr`), j);
              let bestValue = await getBestValue(yearValue, year.options);
              await pageQuote.evaluate((value, i) => {
                const year = document.getElementById(`VEH.${i}.veh_mdl_yr`);
                SetFieldValue(year, value);
                FldOnChange(year, true);
              }, (bestValue, j));
              await pageQuote.waitFor(1000);

              key = `VEH.${j}.veh_make`;
              const makeValue = (data[key] && data[key].value) ? data[key].value : null;
              const make = await pageQuote.evaluate((i) => document.getElementById(`VEH.${i}.veh_make`), j);
              bestValue = await getBestValue(makeValue, make.options);
              await pageQuote.evaluate((make, value) => {
                SetFieldValue(make, value);
                FldOnChange(make, true);
              }, (make, bestValue));
              await pageQuote.waitFor(1000);

              key = `VEH.${j}.veh_mdl_nam`;
              const modelValue = (data[key] && data[key].value) ? data[key].value : null;
              const model = await pageQuote.evaluate((i) => document.getElementById(`VEH.${i}.veh_mdl_nam`), j);
              bestValue = await getBestValue(modelValue, model.options);
              await pageQuote.evaluate((model, value) => {
                SetFieldValue(model, value);
                FldOnChange(model, true);
              }, (model, bestValue));
              await pageQuote.waitFor(1000);

              key = `VEH.${j}.veh_sym_sel`;
              const bodyValue = (data[key] && data[key].value) ? data[key].value : null;
              const body = await pageQuote.evaluate((i) => document.getElementById(`VEH.${i}.veh_sym_sel`), j);
              bestValue = await getBestValue(bodyValue, body.options);
              await pageQuote.evaluate((body, value) => {
                SetFieldValue(body, value);
                FldOnChange(body, true);
              }, (body, bestValue));
              await pageQuote.waitFor(1000);

              function compareTwoStrings(first, second) {
                first = first.replace(/\s+/g, '');
                second = second.replace(/\s+/g, '');

                if (!first.length && !second.length) return 1;// if both are empty strings
                if (!first.length || !second.length) return 0;// if only one is empty string
                if (first === second) return 1;// identical
                if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
                if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

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
              async function getBestValue(value, array) {
                try {
                  const optionsArray = [...array];
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
            }
          };
          await fillPageForm(null, null, afterCode, 3000, 2);
        } catch (error) {
          await exitFail(error, 'errorVehicleStep');
        }
      }

      async function coveragesStep() {
        try {
          await loadStep('Coverages', true);
          await pageQuote.waitFor(500);
          const pg = await pageQuote.evaluate(() => {
            const errMess = document.getElementById('V_GET_ERROR_MESSAGE');
            if (errMess) {
              return 'error';
            } else {
              return 'coverages';
            }
          });
          if (pg === 'error') {
            await errorStep();
          }
          await pageQuote.evaluate(() => {
            const el = document.getElementById('ctl00_pageMessage');
            if (el) {
              el.value = '';
            }
          });
          await pageQuote.waitFor(500);
          await fillPageForm(null, null, null, null, 2);
          await pageQuote.evaluate(() => {
            RecalculateRates();
          });
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('#tot_pol_prem');
          const payDetails = await pageQuote.evaluate(() => {
            const el = document.getElementById('tot_pol_prem');
            const el2 = document.getElementById('down_pmt_amt');
            let premium = el.getAttribute('value');
            let downPayment = el2.getAttribute('value');
            if (+downPayment === +premium) {
              downPayment = +downPayment * .2;
            }

            const term = 6;
            const payments = ((+premium - +downPayment) / +term);
            const details = {
              premium: premium,
              downPayment: downPayment,
              term: term,
              payments: payments,
            };
            return details;
          });
          stepResult.coverage = true;
          await exitSuccessFinal(payDetails);
        } catch (error) {
          await exitFail(error, 'coverages');
        }
      }

      async function exitFail(error, step) {
        console.log(`Error during Progressive ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieve Progressive rate',
            status: false,
            error: `There was an error at ${step} step`,
            stepResult,
          };
        }
        browser.close();
        return next();
      }

      async function exitSuccess(step, save) {
        try {
          req.session.data = {
            title: `Successfully finished Progressive ${step} Step`,
            status: true,
            quoteIds: quoteObj,
            stepResult,
          };
          await saveStep(save);
        } catch (error) {
          await exitFail(error, 'exitSuccess');
        }
      }

      async function saveStep(save) {
        console.log('Progressive Save Step');
        try {
          if (save) {
            await pageQuote.evaluate(() => {
              let btn = document.getElementById('ctl00_HeaderLinksControl_SaveLink');
              if (!btn) {
                btn = document.getElementById('ctl00_HeaderLinksControl_SaveLink');
                if (!btn) {
                  NavigateLinks('SaveLink');
                }
              }
              btn.click();
            });
            await browser.close();
            return next();
          } else {
            await browser.close();
            return next();
          }
        } catch (error) {
          await exitFail(error);
        }
      }

      async function exitSuccessFinal(payDetails) {
        try {
          req.session.data = {
            title: 'Successfully retrieved progressive AL rate.',
            status: true,
            totalPremium: (payDetails && payDetails.premium) ? payDetails.premium : null,
            months: (payDetails && payDetails.term) ? payDetails.term : null,
            downPayment: (payDetails && payDetails.downPayment) ? payDetails.downPayment : null,
            stepResult,
            quoteIds: quoteObj,
          };

          const currentUser = req.body.decoded_user;
          if (currentUser.user) {
            companyId = currentUser.user.companyUserId;
            clientId = currentUser.user.id;
          }
          if (currentUser.client) {
            companyId = currentUser.client.companyClientId;
            clientId = currentUser.client.id;
          }

          const existRater = {
            where: {
              companyId,
              clientId,
              vendorName: req.body.vendorName,
            },
          };

          const raterData = await Rater.findOne(existRater);

          const updateObj = {
            stepResult: stepResult,
          };
          if (raterData && data.totalPremium && data.status) {
            updateObj.totalPremium = (payDetails && payDetails.premium) ? payDetails.premium : null;
            updateObj.months = (payDetails && payDetails.term) ? payDetails.term : null;
            updateObj.downPayment = (payDetails && payDetails.downPayment) ? payDetails.downPayment : null;
            updateObj.succeeded = true;
            updateObj.error = null;
            await raterData.update(updateObj);
            console.log(`${req.body.vendorName} Rater Updated`);
          }
          await saveStep(true);
        } catch (error) {
          await exitFail(error, 'exitSuccessFinal');
        }
      }

      async function loadStep(step, navigate) {
        try {
          console.log(`Progressive ${step} Step`);
          await pageQuote.waitFor(500);
          if (navigate) {
            await navigateMenu(step);
          }
          await pageQuote.waitForSelector('#aspnetForm');
          await pageQuote.waitFor(500);
        } catch (error) {
          await exitFail(error, 'load');
        }
      }

      async function navigateMenu(step) {
        try {
          console.log(`Progressive Navigate Step: ${step}`);
          await pageQuote.waitFor(1000);
          await pageQuote.waitForSelector('#aspnetForm');
          await pageQuote.waitForSelector('#ctl00_MenuPlaceholder_ctl00_menuItemValue');
          await pageQuote.waitForSelector('#ctl00_MenuPlaceholder_ctl00_navigateMenuButton');
          await pageQuote.evaluate((nStep) => {
            let menuId = '0';
            if (nStep === 'Vehicles') {
              menuId = '1';
            } else if (nStep === 'Driver') {
              menuId = '2';
            } else if (nStep === 'Violations') {
              menuId = '3';
            } else if (nStep === 'Underwriting') {
              menuId = '4';
            } else if (nStep === 'Coverages') {
              menuId = '5';
            }
            const id = `ctl00_MenuPlaceholder_ctl00_mainMenun${menuId}`;
            const el = document.getElementById(id);
            const link = el.getElementsByTagName('a')[0];
            link.click();
          }, step);
          await pageQuote.waitFor(1000);
        } catch (error) {
          await exitFail(error, 'NavigateMenu');
        }
      }

      async function fillPageForm(nextStep, beforeCustomCode, afterCustomCode, delayAfter, version) {
        try {
          if (beforeCustomCode) {
            await beforeCustomCode();
          }
          const qO = await pageQuote.evaluate(async (data, version) => {
            const form = document.aspnetForm;
            for (const ele of form.elements) {
              if (ele.disabled) {
                ele.disabled = false;
              }
            }
            const formD = new FormData(form);
            let quoteObj = {};
            for (const pair of formD.entries()) {
              const key = (pair && pair[0]) ? pair[0] : null;
              const value = (data && key && data[key] && data[key].value) ? data[key].value : null;
              if (key === 'prod_cd') {
                quoteObj['prodCd'] = pair[1];
              } else if (key === 'insd_st_cd') {
                quoteObj['stateCd'] = pair[1];
              } else if (key === 'ctl00$qtNbr') {
                quoteObj['quoteNumber'] = pair[1];
              } else if (key === 'ctl00$qtKey') {
                quoteObj['quoteKey'] = pair[1];
              }
              if (key && value && version === 1) {
                const els = document.getElementsByName(key);
                const el = (els && els[0]) ? els[0] : null;
                const name = el.name;
                const id = el.id;
                const type = el.type;
                const input = document.createElement('input');
                let bestValue = value;

                input.setAttribute('name', name);
                input.setAttribute('id', id);
                input.setAttribute('type', 'hidden');

                if (type === 'select-one') {
                  if (id.includes('drvr_empl_stat')) {
                    const occupations = [
                      { text: 'Homemaker (full-time)', value: '01' }, { text: 'Retired (full-time)', value: '02' }, { text: 'Unemployed', value: '03' }, { text: 'Student (full-time)', value: '04' }, { text: 'Agriculture/Forestry/Fishing', value: 'AA' }, { text: 'Art/Design/Media', value: 'AB' }, { text: 'Banking/Finance/Real Estate', value: 'AC' }, { text: 'Business/Sales/Office', value: 'AD' }, { text: 'Construction / Energy / Mining', value: 'AE' }, { text: 'Education/Library', value: 'AF' }, { text: 'Engineer/Architect/Science/Math', value: 'AG' }, { text: 'Food Service / Hotel Services', value: 'AH' }, { text: 'Government/Military', value: 'AJ' }, { text: 'Information Technology', value: 'AK' }, { text: 'Insurance', value: 'AL' }, { text: 'Legal/Law Enforcement/Security', value: 'AM' }, { text: 'Medical/Social Services/Religion', value: 'AN' }, { text: 'Personal Care/Service', value: 'AP' }, { text: 'Production / Manufacturing', value: 'AQ' }, { text: 'Repair / Maintenance / Grounds', value: 'AR' }, { text: 'Sports/Recreation', value: 'AS' }, { text: 'Travel / Transportation / Storage', value: 'AT' },
                    ];
                    bestValue = await getBestValue(value, occupations);
                  } else if (id.includes('drvr_occup_lvl')) {
                    const occupations = [{ text: 'Homemaker (full-time)', value: '01' }, { text: 'Retired (full-time)', value: '02' }, { text: 'Unemployed', value: '03' }, { text: 'Student (full-time)', value: '04' }, { text: 'Agriculture/Forestry/Fishing', value: 'AA' }, { text: 'Art/Design/Media', value: 'AB' }, { text: 'Banking/Finance/Real Estate', value: 'AC' }, { text: 'Business/Sales/Office', value: 'AD' }, { text: 'Construction / Energy / Mining', value: 'AE' }, { text: 'Education/Library', value: 'AF' }, { text: 'Engineer/Architect/Science/Math', value: 'AG' }, { text: 'Food Service / Hotel Services', value: 'AH' }, { text: 'Government/Military', value: 'AJ' }, { text: 'Information Technology', value: 'AK' }, { text: 'Insurance', value: 'AL' }, { text: 'Legal/Law Enforcement/Security', value: 'AM' }, { text: 'Medical/Social Services/Religion', value: 'AN' }, { text: 'Personal Care/Service', value: 'AP' }, { text: 'Production / Manufacturing', value: 'AQ' }, { text: 'Repair / Maintenance / Grounds', value: 'AR' }, { text: 'Sports/Recreation', value: 'AS' }, { text: 'Travel / Transportation / Storage', value: 'AT' }];
                    const index = id.replace(/^\D+/g, '')[0];
                    const emplValue = data[`DRV.${index}.drvr_empl_stat`].value;
                    bestValue = await getBestValue(emplValue, occupations);
                    bestValue += 'Z';
                  } else {
                    bestValue = await getBestValue(value, el.options);
                  }
                  input.setAttribute('value', bestValue);
                } else if (type === 'radio' || type === 'checkbox') {
                  input.checked = (value && value === true) ? true : false;
                } else {
                  input.setAttribute('value', value);
                }
                el.remove();
                form.append(input);
              } else if (key && value && version === 2) {
                if (key && value) {
                  const els = document.getElementsByName(key);
                  const el = (els && els[0]) ? els[0] : null;
                  const obj = el ? GetObj(el.id) : null;
                  if (obj) {
                    if (obj.type === 'text') {
                      SetFieldValue(obj, value);
                    } else if (obj.type === 'select-one' && obj.options && obj.options.length && obj.options.length > 0) {
                      let bestValue = await getBestValue(value, obj.options);
                      SetFieldValue(obj, bestValue);
                    } else if (obj.type === 'radio' || obj.type === 'checkbox') {
                      obj.checked = (value && value === true) ? true : false;
                    }
                  }
                  if (obj && obj.onchange && !obj.id.includes('drvr_empl_stat')) {
                    obj.onchange = null;
                  }
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
          }, populatedData, version);
          if (qO) {
            quoteObj = qO;
          }
          if (afterCustomCode) {
            await afterCustomCode();
          }
          if (nextStep) {
            await navigateMenu(nextStep);
          }
          if (delayAfter) {
            await pageQuote.waitFor(delayAfter);
          } else {
            await pageQuote.waitFor(1000);
          }
        } catch (error) {
          console.log(error);
          await exitFail(error, 'FillPage');
        }
      }

      function populateData() {
        const staticDetailsObj = {
          firstName: 'Test',
          lastName: 'User',
          birthDate: '12/16/1993',
          email: 'test@mail.com',
          phone: '302-222-5555',
          mailingAddress: '5560 Mcclellan Blvd',
          city: 'Anniston',
          state: 'Alabama',
          zipCode: '36206',
          lengthAtAddress: '1 year or more',
          priorInsurance: 'A',
          priorInsuranceCarrier: 'USAA',
          vehicles: [
            {
              vehicleVin: '1FTSF30L61EC23425',
              vehicleModelYear: '2015',
              vehicleManufacturer: 'FORD',
              vehicleModel: 'F350',
              vehicleBodyStyle: 'EXT CAB (8CYL 4x2)',
              applicantPostalCd: '35005',
              lengthOfOwnership: 'At least 1 year but less than 3 years',
              primaryUse: 'Commute',
              occupation: 'Appraiser - Real Estate',
            },
          ],
          drivers: [
            {
              firstName: 'Test',
              lastName: 'User',
              applicantBirthDt: '12/16/1993',
              applicantGenderCd: 'Male',
              applicantMaritalStatusCd: 'Single',
              driverLicensedDt: '3 years or more',
              driverLicenseNumber: '',
              employment: 'Banking/Finance/Real Estate',
              occupation: 'Other',
              education: 'College Degree',
            },
          ],
          priorIncident: 'AAD - At Fault Accident',
          priorIncidentDate: '12/16/2012',
          policyEffectiveDate: '04/30/2019',
          priorPolicyTerminationDate: '03/15/2019',
          yearsWithPriorInsurance: '5 years or more',
          ownOrRentPrimaryResidence: 'Rent',
          numberOfResidentsInHome: '3',
          rentersLimits: 'Greater Than 300,000',
          haveAnotherProgressivePolicy: 'No',
        };

        const dataObj = {};
        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          for (const j in bodyData.vehicles) {
            const element = bodyData.vehicles[j];
            dataObj[`VEH.${j}.veh_trailer_ind`] = { type: 'select-one', value: 'N', name: `VEH.${j}.veh_trailer_ind` };
            dataObj[`VEH.${j}.veh_vin`] = { type: 'text', value: element.vehicleVin || staticDetailsObj.vehicles[0].vehicleVin, name: `VEH.${j}.veh_vin` };
            dataObj[`VEH.${j}.veh_mdl_yr`] = { type: 'select-one', value: element.vehicleModelYear || staticDetailsObj.vehicles[0].vehicleModelYear, name: `VEH.${j}.veh_mdl_yr` };
            dataObj[`VEH.${j}.veh_make`] = { type: 'select-one', value: element.vehicleManufacturer || staticDetailsObj.vehicles[0].vehicleManufacturer, name: `VEH.${j}.veh_make` };
            dataObj[`VEH.${j}.veh_mdl_nam`] = { type: 'select-one', value: element.vehicleModel || staticDetailsObj.vehicles[0].vehicleModel, name: `VEH.${j}.veh_mdl_nam` };
            dataObj[`VEH.${j}.veh_sym_sel`] = { type: 'select-one', value: element.vehicleBodyStyle || staticDetailsObj.vehicles[0].vehicleBodyStyle, name: `VEH.${j}.veh_sym_sel` };
            dataObj[`VEH.${j}.veh_grg_zip`] = { type: 'text', value: element.applicantPostalCd || staticDetailsObj.vehicles[0].applicantPostalCd, name: `VEH.${j}.veh_grg_zip` };
            dataObj[`VEH.${j}.veh_len_of_own`] = { type: 'select-one', value: element.lengthOfOwnership || staticDetailsObj.vehicles[0].lengthOfOwnership, name: `VEH.${j}.veh_len_of_own` };
            dataObj[`VEH.${j}.veh_use`] = { type: 'select-one', value: element.primaryUse || staticDetailsObj.vehicles[0].primaryUse, name: `VEH.${j}.veh_use` };
            dataObj[`VEH.${j}.veh_atmt_emrgnc_braking_insd_cd`] = { type: 'select-one', value: 'Y', name: `VEH.${j}.veh_atmt_emrgnc_braking_insd_cd` };
            dataObj[`VEH.${j}.veh_trnspr_ntwk_co_cd`] = { type: 'select-one', value: 'N', name: `VEH.${j}.veh_trnspr_ntwk_co_cd` };
            dataObj[`VEH.${j}.veh_use_dlvry`] = { type: 'select-one', value: 'N', name: `VEH.${j}.veh_use_dlvry` };
            dataObj[`prompt_sl_cross_sell`] = { type: 'select-one', value: 'N', name: 'prompt_sl_cross_sell' };
            // dataObj[`VEH.${j}.veh_typ_cd`] = {type: 'select-one', value: '', name: `VEH.${j}.veh_typ_cd`};
            dataObj[`VEH.${j}.veh_use_ubi`] = { type: 'select-one', value: 'Y', name: `VEH.${j}.veh_use_ubi` };
            dataObj[`VEH.${j}.veh_liab`] = { type: 'select-one', value: element.Liability, name: `VEH.${j}.veh_liab` };
            dataObj[`VEH.${j}.BIPD`] = { type: 'select-one', value: element.BIPD, name: `VEH.${j}.BIPD` };
            dataObj[`VEH.${j}.UMUIM`] = { type: 'select-one', value: element.UMUIM, name: `VEH.${j}.UMUIM` };
            dataObj[`VEH.${j}.MEDPAY`] = { type: 'select-one', value: element.MEDPAY, name: `VEH.${j}.MEDPAY` };
            dataObj[`VEH.${j}.COMP`] = { type: 'select-one', value: element.COMP, name: `VEH.${j}.COMP` };
            dataObj[`VEH.${j}.COLL`] = { type: 'select-one', value: element.COLL, name: `VEH.${j}.COLL` };
            dataObj[`VEH.${j}.RENT`] = { type: 'select-one', value: element.RENTAL, name: `VEH.${j}.RENT` };
            dataObj[`VEH.${j}.ROADSD`] = { type: 'select-one', value: element.ROADSIDE, name: `VEH.${j}.ROADSD` };
            // dataObj[`VEH.${j}.veh_aoe_valu`] = {type: 'text', value: '', name: `VEH.${j}.veh_aoe_valu`};
            dataObj[`VEH.${j}.PAYOFF`] = { type: 'select-one', value: element.PAYOFF, name: `VEH.${j}.PAYOFF` };
          }
        }
        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          for (const j in bodyData.drivers) {
            const element = bodyData.drivers[j];
            dataObj[`DRV.${j}.drvr_frst_nam`] = { type: 'text', value: element.firstName || staticDetailsObj.drivers[0].firstName, name: `DRV.${j}.drvr_frst_nam` };
            dataObj[`DRV.${j}.drvr_mid_nam`] = { type: 'text', value: '', name: `DRV.${j}.drvr_mid_nam` };
            dataObj[`DRV.${j}.drvr_lst_nam`] = { type: 'text', value: element.lastName || staticDetailsObj.drivers[0].lastName, name: `DRV.${j}.drvr_lst_nam` };
            dataObj[`DRV.${j}.drvr_sfx_nam`] = { type: 'select-one', value: '', name: `DRV.${j}.drvr_sfx_nam` };
            dataObj[`DRV.${j}.drvr_dob`] = { type: 'text', value: element.applicantBirthDt || staticDetailsObj.drivers[0].applicantBirthDt, name: `DRV.${j}.drvr_dob` };
            dataObj[`DRV.${j}.drvr_lic_nbr`] = { type: 'text', value: element.driverLicenseNumber || staticDetailsObj.drivers[0].driverLicenseNumber, name: `DRV.${j}.drvr_lic_nbr` };
            dataObj[`DRV.${j}.drvr_ssn`] = { type: 'text', value: '', name: `DRV.${j}.drvr_ssn` };
            dataObj[`DRV.${j}.drvr_sex`] = { type: 'select-one', value: element.applicantGenderCd || staticDetailsObj.drivers[0].applicantGenderCd, name: `DRV.${j}.drvr_sex` };
            dataObj[`DRV.${j}.drvr_mrtl_stat_map`] = { type: 'select-one', value: element.applicantMaritalStatusCd || staticDetailsObj.drivers[0].applicantMaritalStatusCd, name: `DRV.${j}.drvr_mrtl_stat_map` };
            dataObj[`DRV.${j}.drvr_rel_desc_cd`] = { type: 'select-one', value: 'O', name: `DRV.${j}.drvr_rel_desc_cd` };
            dataObj[`DRV.${j}.drvr_stat_dsply`] = { type: 'select-one', value: 'R', name: `DRV.${j}.drvr_stat_dsply` };
            dataObj[`DRV.${j}.drvr_lic_stat`] = { type: 'select-one', value: 'V', name: `DRV.${j}.drvr_lic_stat` };
            dataObj[`DRV.${j}.drvr_years_lic`] = { type: 'select-one', value: element.driverLicensedDt || staticDetailsObj.drivers[0].driverLicensedDt, name: `DRV.${j}.drvr_years_lic` };
            dataObj[`DRV.${j}.drvr_empl_stat`] = { type: 'select-one', value: element.employment || staticDetailsObj.drivers[0].employment, name: `DRV.${j}.drvr_empl_stat` };
            dataObj[`DRV.${j}.drvr_occup_lvl`] = { type: 'select-one', value: element.occupation || staticDetailsObj.drivers[0].occupation, name: `DRV.${j}.drvr_occup_lvl` };
            dataObj[`DRV.${j}.drvr_ed_lvl`] = { type: 'select-one', value: element.education || staticDetailsObj.drivers[0].education, name: `DRV.${j}.drvr_ed_lvl` };
            dataObj[`DRV.${j}.drvr_fil_ind`] = { type: 'select-one', value: 'N', name: `DRV.${j}.drvr_fil_ind` };
            dataObj[`DRV.${j}.drvr_sr_ind`] = { type: 'select-one', value: 'N', name: `DRV.${j}.drvr_sr_ind` };
            dataObj[`DRV.${j}.drvr_dstnt_student`] = { type: 'select-one', value: 'N', name: `DRV.${j}.drvr_dstnt_student` };
            dataObj[`DRV.${j}.drvr_good_stdt_ind`] = { type: 'select-one', value: 'N', name: `DRV.${j}.drvr_good_stdt_ind` };
          }
        }

        dataObj['DRV.0.VIO.0.drvr_viol_cd'] = { type: 'select-one', value: staticDetailsObj.priorIncident, name: 'DRV.0.VIO.0.drvr_viol_cd' };
        dataObj['DRV.0.VIO.0.drvr_viol_dt_dsply'] = { type: 'text', value: staticDetailsObj.priorIncidentDate, name: 'DRV.0.VIO.0.drvr_viol_dt_dsply' };
        dataObj[`pol_eff_dt`] = { type: 'text', value: tomorrowDate, name: 'pol_eff_dt' };
        dataObj[`nam_opr`] = { type: 'select-one', value: 'N', name: 'nam_opr' };
        dataObj[`DRV.0.drvr_frst_nam`] = { type: 'text', value: bodyData.firstName || staticDetailsObj.firstName, name: 'DRV.0.drvr_frst_nam' };
        dataObj[`DRV.0.drvr_mid_nam`] = { type: 'text', value: '', name: 'DRV.0.drvr_mid_nam' };
        dataObj[`DRV.0.drvr_lst_nam`] = { type: 'text', value: bodyData.lastName || staticDetailsObj.lastName, name: 'DRV.0.drvr_lst_nam' };
        dataObj[`DRV.0.drvr_sfx_nam`] = { type: 'select-one', value: '', name: 'DRV.0.drvr_sfx_nam' };
        dataObj[`DRV.0.drvr_dob`] = { type: 'text', value: bodyData.birthDate || staticDetailsObj.birthDate, name: 'DRV.0.drvr_dob' };
        dataObj[`email_adr`] = { type: 'text', value: bodyData.email || staticDetailsObj.email, name: 'email_adr' };
        dataObj[`INSDPHONE.0.insd_phn_typ`] = { type: 'select-one', value: 'H', name: 'INSDPHONE.0.insd_phn_typ' };
        dataObj[`INSDPHONE.0.insd_phn_nbr`] = { type: 'text', value: bodyData.phone && bodyData.phone.replace('-', '') || staticDetailsObj.phone, name: 'INSDPHONE.0.insd_phn_nbr' };
        dataObj[`insd_str`] = { type: 'text', value: bodyData.mailingAddress || staticDetailsObj.mailingAddress, name: 'insd_str' };
        dataObj[`insd_str2`] = { type: 'text', value: '', name: 'insd_str2' };
        dataObj[`insd_city_cd`] = { type: 'text', value: bodyData.city || staticDetailsObj.city, name: 'insd_city_cd' };
        dataObj[`insd_st_cd`] = { type: 'select-one', value: bodyData.state || staticDetailsObj.state, name: 'insd_st_cd' };
        dataObj[`insd_zip_cd`] = { type: 'text', value: bodyData.zipCode || staticDetailsObj.zipCode, name: 'insd_zip_cd' };
        dataObj[`len_of_res_insd`] = { type: 'select-one', value: bodyData.lengthAtAddress || staticDetailsObj.lengthAtAddress, name: 'len_of_res_insd' };
        dataObj[`fin_stbl_qstn`] = { type: 'select-one', value: 'Y', name: 'fin_stbl_qstn' };
        dataObj[`pol_ubi_exprnc`] = { type: 'select-one', value: 'N', name: 'pol_ubi_exprnc' };
        dataObj[`pmt_optn_desc_presto`] = { type: 'select-one', value: 'P0500', name: 'pmt_optn_desc_presto' };
        dataObj[`dsb_pkg_ind`] = { type: 'select-one', value: 'N', name: 'dsb_pkg_ind' };
        dataObj[`pol_term_cnt`] = { type: 'select-one', value: '6', name: 'pol_term_cnt' };
        dataObj[`eft_ind`] = { type: 'select-one', value: 'Y', name: 'eft_ind' };
        dataObj[`ctl00_pageMessage`] = { type: 'hidden', value: '', name: 'ctl00$pageMessage' };
        dataObj[`prir_ins_cd_insd`] = { type: 'select-one', value: bodyData.priorInsurance || staticDetailsObj.priorInsurance, name: 'prir_ins_cd_insd' };
        dataObj[`curr_ins_co_cd_dsply`] = { type: 'select-one', value: bodyData.priorInsuranceCarrier || staticDetailsObj.priorInsuranceCarrier, name: 'curr_ins_co_cd_dsply' };
        dataObj[`prir_bi_lim`] = { type: 'select-one', value: bodyData.priorBodilyInjuryLimits || '3', name: 'prir_bi_lim' };
        dataObj[`pop_len_most_recent_carr_insd`] = { type: 'select-one', value: bodyData.yearsWithPriorInsurance || staticDetailsObj.yearsWithPriorInsurance, name: 'pop_len_most_recent_carr_insd' };
        dataObj[`spinoff_code`] = { type: 'select-one', value: '', name: 'spinoff_code' };
        dataObj[`prls_ind`] = { type: 'select-one', value: 'Y', name: 'prls_ind' };
        dataObj[`excess_res_nbr`] = { type: 'select-one', value: bodyData.numberOfResidentsInHome || '3', name: 'excess_res_nbr' };
        dataObj[`hm_own_ind`] = { type: 'select-one', value: bodyData.ownOrRentPrimaryResidence || staticDetailsObj.ownOrRentPrimaryResidence, name: 'hm_own_ind' };
        dataObj[`pol_renters_prir_bi_lim_code`] = { type: 'select-one', value: bodyData.rentersLimits || staticDetailsObj.rentersLimits, name: 'pol_renters_prir_bi_lim_code' };
        dataObj[`multi_pol_ind`] = { type: 'select-one', value: 'N', name: 'multi_pol_ind' };
        return dataObj;
      }
    } catch (error) {
      console.log('Error at Progressive:', error);
      return next(Boom.badRequest('Failed to retrieve progressive rate.'));
    }
  },
  addToQueue: async (req, res, next) => {
    const raterData = {
      raterStore: req.session.raterStore,
      body: req.body,
    };
    const job = await progressiveQueue.add(raterData);
    req.session.data = { jobId: job.id };
    return next();
  },
};
