/* eslint-disable no-loop-func, guard-for-in, prefer-destructuring, no-constant-condition, no-console, dot-notation, no-await-in-loop, max-len, no-use-before-define, no-inner-declarations, no-param-reassign, no-restricted-syntax, consistent-return, no-undef, no-prototype-builtins */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { erieRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate } = require('../lib/utils');
const { erieQueue } = require('../jobs/erie');

module.exports = {
  erieRater: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(9, bodyData.drivers.length);

      const stepResult = {
        login: false,
        search: false,
        newQuote: false,
        customer: false,
        namedInsured: false,
        driver: false,
        vehicle: false,
      };

      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 300,
      };
      if (ENVIRONMENT.nodeEnv === 'local') {
        browserParams = { headless: false };
      }
      const browser = await puppeteer.launch(browserParams);
      let page = await browser.newPage();

      const populatedData = await populateData();

      await loginStep();
      await searchStep();
      await newQuoteStep();
      await customerStep();
      await namedInsuredStep();
      await driversStep();
      await vehicleStep();

      async function loginStep() {
        console.log('Erie Login Step');
        try {
          await page.goto(erieRater.LOGIN_URL, { waitUntil: 'networkidle2', timeout: 0 });
          await page.waitFor(500);
          await page.type('#credentials_table #input_1', username);
          await page.waitForSelector('#credentials_table > tbody > #submit_row > .credentials_table_unified_cell > .credentials_input_submit');
          await page.click('#credentials_table > tbody > #submit_row > .credentials_table_unified_cell > .credentials_input_submit');
          await page.waitForSelector('#input_2');
          await page.type('#input_2', password);
          await page.waitForSelector('#credentials_table > tbody > #submit_row > .credentials_table_unified_cell > .credentials_input_submit');
          await page.click('#credentials_table > tbody > #submit_row > .credentials_table_unified_cell > .credentials_input_submit');
          await page.waitForNavigation({ timeout: 0 });
          stepResult.login = true;
        } catch (error) {
          await exitFail(error, 'login');
        }
      }

      async function searchStep() {
        console.log('Erie Search Step');
        try {
          await page.waitFor(2000);
          const frames = await page.frames();
          const searchFrame = frames.find(f => f.url() === erieRater.CUSTOMER_URL);
          await searchFrame.waitFor(5000);
          await searchFrame.waitForSelector(populatedData.firstName.element);
          await searchFrame.type(populatedData.firstName.element, populatedData.firstName.value);

          await searchFrame.waitForSelector(populatedData.lastName.element);
          await searchFrame.type(populatedData.lastName.element, populatedData.lastName.value);

          await searchFrame.waitForSelector('#personal #btnQuotePersonal');
          await searchFrame.click('#personal #btnQuotePersonal');
          while (true) {
            await page.waitFor(1000);
            const pageQuote = await browser.pages();
            if (pageQuote.length > 2) {
              page = pageQuote[2];
              break;
            }
          }
          stepResult.search = true;
        } catch (error) {
          await exitFail(error, 'Search');
        }
      }

      async function newQuoteStep() {
        console.log('Erie New Quote Step');
        try {
          await page.waitFor(2000);
          await page.waitForSelector(populatedData.mailingAddress.element);
          await page.click(populatedData.mailingAddress.element);
          await page.evaluate((mailingAddress) => {
            document.querySelector(mailingAddress.element).value = mailingAddress.value;
          }, populatedData.mailingAddress);

          await page.waitForSelector(populatedData.city.element);
          await page.evaluate((city) => {
            document.querySelector(city.element).value = city.value;
          }, populatedData.city);

          await page.waitForSelector(populatedData.zipcode.element);
          await page.evaluate((zipcode) => {
            document.querySelector(zipcode.element).value = zipcode.value;
          }, populatedData.zipcode);

          await page.waitForSelector(populatedData.dateofBirthMonth.element);
          await page.evaluate((populatedDataObj) => {
            document.querySelector(populatedDataObj.dateofBirthMonth.element).value = populatedDataObj.dateofBirthMonth.value;
            document.querySelector(populatedDataObj.dateofBirthDay.element).value = populatedDataObj.dateofBirthDay.value;
            document.querySelector(populatedDataObj.dateofBirthYear.element).value = populatedDataObj.dateofBirthYear.value;
          }, populatedData);

          if (await page.$('#standardizedAddressContinue')) {
            await page.evaluate(() => {
              document.querySelector('#standardizedAddressContinue').click();
            });
          }

          await page.waitFor(3000);
          await page.waitForSelector('#contentarea > #ProspectScoreForm #startNewQuote');
          await page.click('#contentarea > #ProspectScoreForm #startNewQuote');

          stepResult.newQuote = true;
        } catch (error) {
          await exitFail(error, 'newQuote');
        }
      }

      async function customerStep() {
        console.log('Erie Customer Step');
        try {
          await page.waitFor(4000);
          if (await page.$('#standardizedAddressContinue')) {
            await page.evaluate(() => {
              document.querySelector('#standardizedAddressContinue').click();
            });
          }

          await page.waitFor(2000);
          await page.waitForSelector('table #Home_IsSelected');
          await page.click('table #Home_IsSelected');

          await page.waitForSelector(populatedData.agentNumber.element);
          await page.select(populatedData.agentNumber.element, populatedData.agentNumber.value);

          await page.waitForSelector('.FormTable #Auto_SelectedTemplate');
          await page.click('.FormTable #Auto_SelectedTemplate');

          await page.waitForSelector(populatedData.effectiveDate.element);
          await page.focus(populatedData.effectiveDate.element);
          await page.evaluate((effectiveDate) => {
            document.querySelector(effectiveDate.element).value = effectiveDate.value;
          }, populatedData.effectiveDate);

          await page.waitForSelector('#ProspectScoreForm > #contentarea #btnContinue');
          await page.click('#ProspectScoreForm > #contentarea #btnContinue');

          await page.waitFor(5000);
          if (await page.$('#btnPrefillContinue')) {
            await page.evaluate(async () => {
              const btnContinue = document.querySelector('#btnPrefillContinue');
              await btnContinue.click();
            });
          }

          await page.waitFor(6000);
          stepResult.customer = true;
        } catch (error) {
          await exitFail(error, 'customer');
        }
      }

      async function namedInsuredStep() {
        console.log('Erie Named Insured Step');
        try {
          await page.waitFor(3000);
          if (await page.$('#btnPrefillContinue')) {
            await page.evaluate(async () => {
              const btnContinue = document.querySelector('#btnPrefillContinue');
              await btnContinue.click();
            });
          }
          await page.waitForSelector(populatedData.gender.element);
          await page.select(populatedData.gender.element, populatedData.gender.value);
          await page.type(populatedData.phone.element, populatedData.phone.value);

          await page.evaluate(async () => {
            const hasbeenMailingAddressFor3Year = document.querySelector('#customer-content > table > tbody > tr:nth-child(2) > td.ContentBlock.left > div.address-questions > div.question-wrapper.clock > table > tbody > tr:nth-child(2) > td:nth-child(3) > div > label:nth-child(1) > input[type=radio]');
            await hasbeenMailingAddressFor3Year.click();
            const istheCurrentMailingAddress = document.querySelector('#customer-content > table > tbody > tr:nth-child(2) > td.ContentBlock.left > div.address-questions > div.question-wrapper.garage > table > tbody > tr:nth-child(2) > td:nth-child(3) > div > label:nth-child(1) > input[type=radio]');
            await istheCurrentMailingAddress.click();
          });

          await page.waitFor(2000);
          await page.select(populatedData.townShip.element, populatedData.townShip.value);

          await page.waitForSelector(populatedData.priorInsurence.element);
          await page.select(populatedData.priorInsurence.element, populatedData.priorInsurence.value);
          await page.type(populatedData.carrierName.element, populatedData.carrierName.value);

          await page.waitForSelector(populatedData.autoPriorLimit.element);
          await page.select(populatedData.autoPriorLimit.element, populatedData.autoPriorLimit.value);

          await page.waitForSelector('#customer-content > div.button-wrapper.no-border > button');
          await page.click('#customer-content > div.button-wrapper.no-border > button');
          stepResult.namedInsured = true;
        } catch (error) {
          await exitFail(error, 'namedInsured');
        }
      }

      async function driversStep() {
        console.log('Erie Driver Step');
        try {
          await page.waitFor(8000);
          if (page.$('#DriverGridTableItems > tbody > tr > td.Col3')) {
            await page.click('#DriverGridTableItems > tbody > tr > td.Col3 > a');
            await page.waitFor(2000);
            await page.select('#selYearsLicensed', 'false');
            await page.evaluate(async () => {
              const fulltimeStudentWithoutVehicle = document.querySelector('#CollegeStudentNo');
              await fulltimeStudentWithoutVehicle.click();
              const saveDriver = document.querySelector('#btnSaveDriver');
              await saveDriver.click();
            });
          }
          for (const j in bodyData.drivers) {
            if (j < bodyData.drivers.length) {
              if (await page.$('#btnCloseEstimatedQuoteAlert')) {
                await page.click('#btnCloseEstimatedQuoteAlert');
              }
              await page.waitFor(1000);
              await page.click('#addDriver');
              await page.waitFor(5000);
              await page.type(populatedData[`driverFirstName${j}`].element, populatedData[`driverFirstName${j}`].value);
              await page.type(populatedData[`driverLastName${j}`].element, populatedData[`driverLastName${j}`].value);
              await page.type(populatedData[`driverDateofBirth${j}`].element, populatedData[`driverDateofBirth${j}`].value);

              await page.waitFor(2000);
              await page.type(populatedData[`driverGender${j}`].element, populatedData[`driverGender${j}`].value);
              await page.select(populatedData[`relationship${j}`].element, populatedData[`relationship${j}`].value);
              await page.type(populatedData[`licensedDate${j}`].element, populatedData[`licensedDate${j}`].value);
              await page.select(populatedData[`YearsLicensed${j}`].element, populatedData[`YearsLicensed${j}`].value);

              await page.waitFor(2000);
              await page.evaluate(async () => {
                const fulltimeStudentWithoutVehicle = document.querySelector('#CollegeStudentNo');
                await fulltimeStudentWithoutVehicle.click();
                const saveDriver = document.querySelector('#btnSaveDriver');
                await saveDriver.click();
              });
              if (await page.$('#btnCloseEstimatedQuoteAlert')) {
                await page.click('#btnCloseEstimatedQuoteAlert');
              }
            }
          }
          await page.evaluate(async () => {
            const btnContinue = document.querySelector('#btnContinue');
            await btnContinue.click();
          });
          await page.waitFor(2000);
          if (await page.$('#btnCloseEstimatedQuoteAlert')) {
            await page.click('#btnCloseEstimatedQuoteAlert');
          }
          await page.evaluate(async () => {
            const btnContinue = document.querySelector('#btnContinue');
            await btnContinue.click();
          });
          stepResult.driver = true;
        } catch (error) {
          await exitFail(error, 'Drivers');
        }
      }


      async function vehicleStep() {
        console.log('Erie Vehicle Step');
        try {
          await page.waitFor(10000);
          for (const j in bodyData.vehicles) {
            if (j < bodyData.vehicles.length) {
              await page.waitFor(2000);
              await page.waitForSelector('#add-vehicle');
              await page.click('#add-vehicle');
              await page.waitFor(2000);
              await page.waitForSelector(populatedData[`vehicleVin${j}`].element);
              await page.type(populatedData[`vehicleVin${j}`].element, populatedData[`vehicleVin${j}`].value);

              await page.focus('#primary-operator-list');
              const operatorName = await page.evaluate(element => document.querySelector(element).innerText, '#primary-operator-list > option:nth-child(3)');
              const operatorList = await page.$('#primary-operator-list');
              await operatorList.type(operatorName);
              await page.waitFor(2000);
              await page.click('#save-vehicle');
            }
          }
          await page.waitFor(2000);
          await page.evaluate(() => {
            document.querySelector('#btnContinue').click();
          });
          stepResult.vehicle = true;
          console.log('stepResult', stepResult);
        } catch (error) {
          await exitFail(error, 'Vehicles');
        }
      }

      async function exitFail(error, step) {
        console.log(`Error during Erie ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieve Erie rate',
            status: false,
            error: `There was an error at ${step} step`,
          };
        }
        browser.close();
        return next();
      }


      function populateData() {
        const staticDataObj = {
          mailingAddress: '1473 Spring Hill Dr',
          city: 'Hummelstown',
          state: 'PA',
          zipCode: '17036',
          firstName: 'Test',
          lastName: 'User',
          birthDate: '12/16/1997',
          gender: 'M',
          phone: '7878787878',
          CurrentAutoInsurance: 'Other',
          autoPriorLimit: 'Unknown',
          agentNumber: 'AA2398',
          townShip: 'Conewago',
          vehicles: [
            {
              vehicleVin: 'KMHDH6AE1DU001708',
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
            },
          ],
        };

        const dataObj = {};
        const birthday = new Date(bodyData.birthDate || staticDataObj.birthDate);
        dataObj.firstName = { element: '#myTabContent > #personal #firstNamePersonal', value: bodyData.firstName || staticDataObj.firstName };
        dataObj.lastName = { element: '#myTabContent > #personal #lastNamePersonal', value: bodyData.lastName || staticDataObj.lastName };
        dataObj.mailingAddress = { element: 'table #MailingAddress_AddressLine1', value: staticDataObj.mailingAddress };
        dataObj.city = { element: '#MailingAddress_City', value: staticDataObj.city };
        dataObj.dateofBirthMonth = { element: '#dateOfBirth_month', value: birthday.getMonth() };
        dataObj.dateofBirthDay = { element: '#dateOfBirth_day', value: birthday.getDate() };
        dataObj.dateofBirthYear = { element: '#dateOfBirth_year', value: birthday.getFullYear() };
        dataObj.gender = { element: '#selGender1', value: bodyData.gender.charAt(0) || staticDataObj.gender };
        dataObj.zipcode = { element: 'table #MailingAddress_ZipCode', value: staticDataObj.zipCode };
        dataObj.autoPriorLimit = { element: 'div #AutoPriorBILimits', value: staticDataObj.autoPriorLimit };
        dataObj.priorInsurence = { element: 'div #CurrentAutoInsurer', value: staticDataObj.CurrentAutoInsurance };
        dataObj.carrierName = { element: '#txtCurrentAutoInsurerOther', value: 'carrier text' };
        dataObj.townShip = { element: '#selMailingTownshipList', value: staticDataObj.townShip };
        dataObj.phone = { element: 'div #FirstNamedInsuredNumber_0', value: bodyData.phone || staticDataObj.phone };
        dataObj.effectiveDate = { element: '.FormTable #Auto_EffectiveDate', value: tomorrow };
        dataObj.agentNumber = { element: '.FormTable #Auto_AgentNumber', value: staticDataObj.agentNumber };

        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          for (const j in bodyData.drivers) {
            dataObj[`driverFirstName${j}`] = {
              element: '#txtFirstName',
              value: bodyData.drivers[j].firstName || staticDataObj.drivers[0].firstName,
            };
            dataObj[`driverLastName${j}`] = {
              element: '#txtLastName',
              value: bodyData.drivers[j].lastName || staticDataObj.drivers[0].lastName,
            };
            dataObj[`driverDateofBirth${j}`] = {
              element: '#txtDateOfBirth',
              value: bodyData.drivers[j].applicantBirthDt || staticDataObj.drivers[0].birthDate,
            };
            dataObj[`driverGender${j}`] = {
              element: '#selGender',
              value: bodyData.drivers[j].gender.charAt(0) || staticDataObj.drivers[0].gender,
            };
            dataObj[`relationship${j}`] = {
              element: '#selRelationship',
              value: 'NotRelated',
            };
            dataObj[`licensedDate${j}`] = {
              element: '#txtFirstLicensedDate',
              value: '12/2015',
            };
            dataObj[`YearsLicensed${j}`] = {
              element: '#selYearsLicensed',
              value: 'false',
            };
          }
        }

        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          for (const j in bodyData.vehicles) {
            dataObj[`vehicleVin${j}`] = {
              element: '#VIN',
              value: bodyData.vehicles[j].vehicleVin || staticDataObj.vehicles[0].vehicleVin,
            };
          }
        }

        return dataObj;
      }
    } catch (error) {
      console.log('Error at Traveler :', error);
      return next(Boom.badRequest('Failed to retrieved Traveler rate.'));
    }
  },

  addToQueue: async (req, res, next) => {
    const raterData = {
      raterStore: req.session.raterStore,
      body: req.body,
    };
    const job = await erieQueue.add(raterData);
    req.session.data = { jobId: job.id };
    return next();
  },
};
