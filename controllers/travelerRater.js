/* eslint-disable prefer-destructuring, no-constant-condition, no-console, dot-notation, no-await-in-loop, max-len, no-use-before-define, no-inner-declarations, no-param-reassign, no-restricted-syntax, consistent-return, no-undef, */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { travelerRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;
const { formatDate } = require('../lib/utils');

module.exports = {
  traveler: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
      const params = req.body;
      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);

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
      // await underwritingStep();

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
          await page.evaluate(async (firstName, lastName, mailingAddress, city, state, zipCode) => {
            const iframe = document.querySelector('#Parent').getElementsByTagName('frame')[2].contentDocument;
            const childFrames = iframe.documentElement;
            if (childFrames) {
              childFrames.querySelector(`#${firstName.element}`).value = firstName.value;
              childFrames.querySelector(`#${lastName.element}`).value = lastName.value;
              childFrames.querySelector(`#${mailingAddress.element}`).value = mailingAddress.value;
              childFrames.querySelector(`#${city.element}`).value = city.value;
              childFrames.querySelector(`#${state.element}`).value = state.value;
              childFrames.querySelector(`#${zipCode.element}`).value = zipCode.value;
              const processQuote = await childFrames.querySelector('#process');
              processQuote.removeAttribute('disabled');
              processQuote.click();
            }
          }, populatedData.firstName, populatedData.lastName, populatedData.mailingAddress, populatedData.city, populatedData.state, populatedData.zipcode);
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
        } catch (error) {
          await exitFail(error, 'Policy');
        }
      }

      async function customerInfoStep() {
        console.log('Traveler Customer Info Step');
        try {
          await navigationPromise;
          await page.waitFor(15000);
          await page.waitForSelector(populatedData.phone.element);
          await page.focus(populatedData.phone.element);
          await page.keyboard.type(populatedData.phone.value, { delay: 100 });

          await page.type(populatedData.birthDate.element, populatedData.birthDate.value);
          await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.click('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.type('tbody > #G17 #\\32 770825218', 'DEKALB', { delay: 100 });
          await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.waitFor(5000);
          await page.click('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.waitForSelector('#page > #dialog-modal > #main #dynamicContinueButton');
          await page.evaluate(async () => {
            const continueButton = document.getElementById('dynamicContinueButton');
            await continueButton.removeAttribute('data-skipdisable');
            await continueButton.click();
          });
          await page.waitFor(20000);
          await page.waitForSelector('#\\33 022120615_0');
          await page.evaluate(async () => {
            const hasMovedWithin6Month = document.querySelector('#\\33 022120615_0');
            await hasMovedWithin6Month.click();
            const reviewdInfoByLaw = document.querySelector('#\\31 468764443_1');
            await reviewdInfoByLaw.click();
            const reportButton = document.querySelector('#overlayButton-reports-dynamicOrderReport');
            reportButton.click();
          });
        } catch (error) {
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
          await page.waitForSelector(populatedData.vehicleVin.element);
          await page.focus(populatedData.vehicleVin.element);
          await page.evaluate((vehicleVin) => {
            document.querySelector(vehicleVin.element).value = vehicleVin.value;
          }, populatedData.vehicleVin);
          await page.waitForSelector(populatedData.primaryUse.element);
          await page.evaluate((primaryUse, annualMilege, ownerShip) => {
            document.querySelector(primaryUse.element).value = primaryUse.value;
            document.querySelector(annualMilege.element).value = annualMilege.value;
            document.querySelector(ownerShip.element).value = ownerShip.value;
            document.querySelector('#dynamicContinueButton').click();
          }, populatedData.primaryUse, populatedData.annualMilege, populatedData.ownerShip);
          await page.waitFor(2000);
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
          await page.waitForSelector('select[data-label="Marital Status"]');
          await page.select(populatedData.maritalStatus.element, populatedData.maritalStatus.value);
          await page.type(populatedData.relationship.element, populatedData.relationship.value);
          await page.type(populatedData.ageWhen1stLicensed.element, populatedData.ageWhen1stLicensed.value);
          await page.type(populatedData.dateWhenLicensed.element, populatedData.dateWhenLicensed.value, { delay: 100 });
          await page.evaluate(() => {
            document.querySelector('input[value="E"').click(); // IntelliDrive
          });
          await page.focus('#dynamicContinueButton');
          await page.evaluate(() => {
            document.querySelector('#dynamicContinueButton').click();
          });
        } catch (error) {
          await exitFail(error, 'driver');
        }
      }

      async function underwritingStep() {
        console.log('Traveler underwriting Step');
        try {
          await page.waitForSelector('#dynamicContinueButton');
          await page.focus('#dynamicContinueButton');
          await page.evaluate(async () => {
            const continueButton = document.getElementById('dynamicContinueButton');
            await continueButton.click();
          });
          await page.waitFor(2000);
        } catch (error) {
          await exitFail(error, 'underwriting');
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
          phone: '9999997777',
          ageWhen1stLicensed: '18',
          commonOccupation: 'Manager',
          education: 'BS',
          garagedLocation: '2',
          principalOperator: '1',
          territory: '460',
          vehicleVin: 'KMHDH6AE1DU001708',
          vehicleUse: 'BU',
          yearsVehicleOwned: '5',
          vehicles: [
            {
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
        dataObj.phone = { element: 'tbody > #G3 #\\31 472665286', value: staticDataObj.phone };
        dataObj.birthDate = { element: 'tbody > #G8 #\\31 680138008', value: '12/12/1997' };
        // vehicle
        dataObj.vehicleVin = { element: 'input[data-label="VIN"]', value: staticDataObj.vehicleVin };
        dataObj.primaryUse = { element: 'select[data-label="Vehicle Use"]', value: staticDataObj.vehicleUse };
        dataObj.annualMilege = { element: 'input[data-label="Annual Mileage"]', value: '500' };
        dataObj.ownerShip = { element: 'select[data-label="Ownership Status"]', value: 'L' };
        // driver
        dataObj.maritalStatus = { element: 'select[data-label="Marital Status"]', value: 'S' };
        dataObj.relationship = { element: 'select[data-label="Relationship to Named Insured"]', value: 'OT' };
        dataObj.ageWhen1stLicensed = { element: 'input[data-label="Age 1st Licensed US/Canada"]', value: '18' };
        dataObj.dateWhenLicensed = { element: 'input[data-label="Date Licensed"]', value: '12/12/2015' };
        dataObj.insuranceStatus = { element: 'input[data-label="Insurance Status"]', value: 'NOPRIOR' };
        dataObj.primaryResidence = { element: 'input[data-label="Primary Residence"]', value: 'OTH' };
        return dataObj;
      }
    } catch (error) {
      console.log('Error at Traveler :', error);
      return next(Boom.badRequest('Failed to retrieved Traveler rate.'));
    }
  },
};
