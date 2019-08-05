/* eslint-disable prefer-destructuring, no-constant-condition, no-console, dot-notation, no-await-in-loop, max-len, no-use-before-define, no-inner-declarations, no-param-reassign, no-restricted-syntax, consistent-return, no-undef, */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { travelerRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate, ageCount } = require('../lib/utils');


module.exports = {

  traveler: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
      const params = req.body;
      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);
      bodyData.drivers[0].ageWhen1stLicensed = await ageCount(bodyData.drivers[0].applicantBirthDt, bodyData.drivers[0].licensedDate);

      let stepResult = {
        login: false,
        policy: false,
        customerInfo: false,
        vehicles: false,
        drivers: false,
        underWriting: false,
        coverage: false,
        summary: false,
      };

      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 250,
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
        console.log('Traveler Customer Info Step');
        try {
          await navigationPromise;
          await page.waitFor(25000);
          await page.waitForSelector(populatedData.phone.element);
          await page.focus(populatedData.phone.element);
          await page.keyboard.type(populatedData.phone.value, { delay: 80 });
          await page.type(populatedData.birthDate.element, populatedData.birthDate.value);
          await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.click('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.type('tbody > #G17 #\\32 770825218', 'SHELBY', { delay: 100 });
          await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.waitFor(5000);
          await page.click('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.evaluate(async () => {
            const continueButton = document.getElementById('dynamicContinueButton');
            await continueButton.removeAttribute('data-skipdisable');
            await continueButton.click();
          });
          await page.waitFor(30000);
          await page.waitForSelector('#\\33 022120615_0');
          await page.evaluate(async () => {
            const hasMovedWithin6Month = document.querySelector('span[data-label="Moved within the last 6 months?"]').children[2];
            await hasMovedWithin6Month.click();
            const reviewdInfoByLaw = document.querySelector('#\\31 468764443_1');
            await reviewdInfoByLaw.click();
            const reportButton = document.querySelector('#overlayButton-reports-dynamicOrderReport');
            reportButton.click();
          });
          stepResult.customerInfo = true;
        } catch (error) {
          console.log('error', error);
          await exitFail(error, 'Customer Info');
        }
      }

      async function vehicleStep() {
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
          await page.waitForSelector(populatedData.vehicleVin.element);
          await page.focus(populatedData.vehicleVin.element);
          await page.type(populatedData.vehicleVin.element, populatedData.vehicleVin.value, { delay: 30 });
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

          if (await page.$('#dynamicContinueButton')) {
            await page.evaluate(() => {
              document.querySelector('#dynamicContinueButton').click();
            });
          }
        } catch (error) {
          await exitFail(error, 'driver');
        }
      }

      async function underwritingStep() {
        console.log('Traveler underwriting Step');
        try {
          await page.waitFor(5000);
          await page.waitForSelector('#dynamicContinueButton');
          await page.focus('#dynamicContinueButton');
          await page.evaluate(async () => {
            document.getElementById('dynamicContinueButton').click();
          });

          await page.waitFor(2000);
          await page.waitForSelector(populatedData.insuranceStatus.element);
          await page.select(populatedData.insuranceStatus.element, populatedData.insuranceStatus.value);
          await page.waitFor(1000);

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

          await page.select(populatedData.primaryResidence.element, populatedData.primaryResidence.value);

          await page.evaluate(() => {
            document.querySelector('#dynamicContinueButton').click();
          });
          await page.waitFor(2000);
          stepResult.underWriting = true;
        } catch (error) {
          await exitFail(error, 'underwriting');
        }
      }

      async function coverageStep() {
        console.log('Traveler Coverage Step');
        try {
          await page.waitFor(2000);
          await page.select(populatedData.driverPlan.element, populatedData.driverPlan.value);

          await page.waitFor(5000);
          await page.evaluate((liability) => {
            document.querySelector(liability.element).value = liability.value;
          }, populatedData.liability);

          await page.evaluate((propertyDamage) => {
            document.querySelector(propertyDamage.element).value = propertyDamage.value;
          }, populatedData.propertyDamage);

          await page.evaluate((motorist) => {
            document.querySelector(motorist.element).value = motorist.value;
          }, populatedData.motorist);

          await page.evaluate((medicalPayment) => {
            document.querySelector(medicalPayment.element).value = medicalPayment.value;
          }, populatedData.medicalPayment);

          await page.evaluate((comprehensive) => {
            document.querySelector(comprehensive.element).value = comprehensive.value;
          }, populatedData.comprehensive);

          await page.evaluate((collision) => {
            document.querySelector(collision.element).value = collision.value;
          }, populatedData.collision);

          await page.evaluate((roadAssistant) => {
            document.querySelector(roadAssistant.element).value = roadAssistant.value;
          }, populatedData.roadAssistant);

          // await page.evaluate((rentalETE) => {
          //   document.querySelector(rentalETE.element).value = rentalETE.value;
          // }, populatedData.rentalETE);

          await page.evaluate((equipment) => {
            document.querySelector(equipment.element).value = equipment.value;
          }, populatedData.equipment);

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
        console.log('Traveler Rater Summary Step');
        try {
          await page.waitFor(2000);
          let totalPremium;
          let months;
          await page.evaluate(() => {
            totalPremium = document.querySelector('#quoteStatusPremiumContainer_coverage_Pkg1').firstChild.innerText;
            months = document.querySelector('#quoteStatusMessageContainer_coverage_Pkg1 > table > tbody > tr:nth-child(3)').innerText;
          });
          stepResult.summary = true;
          req.session.data = {
            title: 'Successfully retrieved traveler rate.',
            status: true,
            totalPremium: totalPremium || null,
            months: months || null,
            stepResult,
          };
          browser.close();
          return next();
        } catch (error) {
          await exitFail(error, 'summary');
        }
      }

      async function exitFail(error, step) {
        console.log(`Error during Traveler ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieve Traveler rate',
            status: false,
            error: `There was an error at ${step} step`,
          };
        }
        browser.close();
        return next();
      }

      function populateData() {
        const staticDataObj = {
          businessType: 'AUTO',
          mailingAddress: '670 Park Avenue',
          city: 'Moody',
          state: 'AL',
          zipCode: '36140',
          primaryResidence: 'OTH',
          reasonForPriorInsurance: 'NOPRIOR',
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
              relationshipTonamedInsured: 'OT',
              licenseState: 'AL',
              ageWhen1stLicensed: '17',
              dateWhenLicensed: '12/12/2015',
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
        // vehicle
        dataObj.vehicleVin = { element: 'input[data-label="VIN"]', value: bodyData.vehicles[0].vehicleVin || staticDataObj.vehicles[0].vehicleVin };
        dataObj.primaryUse = { element: 'select[data-label="Vehicle Use"]', value: staticDataObj.vehicles[0].vehicleUse };
        dataObj.annualMilege = { element: 'input[data-label="Annual Mileage"]', value: staticDataObj.vehicles[0].annualMiles };
        dataObj.ownerShip = { element: 'select[data-label="Ownership Status"]', value: staticDataObj.vehicles[0].ownerShip };
        // driver
        dataObj.maritalStatus = { element: 'select[data-label="Marital Status"]', value: staticDataObj.drivers[0].maritalStatus };
        dataObj.relationship = { element: 'select[data-label="Relationship to Named Insured"]', value: staticDataObj.drivers[0].relationshipTonamedInsured };
        dataObj.ageWhen1stLicensed = { element: 'input[data-label="Age 1st Licensed US/Canada"]', value: staticDataObj.drivers[0].ageWhen1stLicensed };
        dataObj.dateWhenLicensed = { element: 'input[data-label="Date Licensed"]', value: bodyData.drivers[0].licensedDate || staticDataObj.drivers[0].dateWhenLicensed };

        dataObj.insuranceStatus = { element: 'select[data-label="Reason for No Prior Insurance"]', value: staticDataObj.reasonForPriorInsurance };
        dataObj.primaryResidence = { element: 'select[data-label="Primary Residence"]', value: staticDataObj.primaryResidence };

        dataObj.liability = { element: 'select[data-label="Liability"]', value: staticDataObj.liability };
        dataObj.propertyDamage = { element: 'select[data-label="Property Damage"]', value: staticDataObj.propertyDamage };
        dataObj.motorist = { element: 'select[data-label="Uninsd/Underinsd Motorist"]', value: staticDataObj.motorist };
        dataObj.medicalPayment = { element: 'select[data-label="Medical Payments"]', value: staticDataObj.medicalPayment };
        dataObj.comprehensive = { element: 'select[data-label="Comprehensive"]', value: staticDataObj.comprehensive };
        dataObj.collision = { element: 'select[data-label="Collision"]', value: staticDataObj.collision };
        dataObj.roadAssistant = { element: 'select[data-label="Roadside Assistance"]', value: staticDataObj.roadAssistant };
        dataObj.rentalETE = { element: 'select[data-label"Rental ETE"]', value: staticDataObj.rentalETE };
        dataObj.equipment = { element: 'select[data-label="Custom Equipment - Increased Limit"]', value: staticDataObj.equipment };
        dataObj.driverPlan = { element: 'select[data-label="Responsible Driver Plan"]', value: staticDataObj.driverPlan };

        return dataObj;
      }
    } catch (error) {
      console.log('Error at Traveler :', error);
      return next(Boom.badRequest('Failed to retrieved Traveler rate.'));
    }
  },
};
