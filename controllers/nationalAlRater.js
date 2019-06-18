/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition, consistent-return  */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { nationalGeneralAlRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('./../constants/environment');

module.exports = {
  nationalGeneralAl: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;

      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
      if (ENVIRONMENT.ENV === 'local') {
        browserParams = { headless: false };
      }
      const browser = await puppeteer.launch(browserParams);
      const page = await browser.newPage();

      const staticDataObj = {
        newQuoteState: 'AL',
        newQuoteProduct: 'PPA',
        producer: '610979',
        inputBy: '20000739',
        plan: 'G5',
        firstName: 'Test',
        middleName: 'TEST',
        lastName: 'User',
        suffixName: 'IV',
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
            yearOfExperiance: '8',
            driverLicenseStatus: 'Permit',
            smartDrive: 'True',
            licenseState: 'IN',
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
            ownershipStatus: 'Owned',
            vehicleType: 'Private Passenger Auto',
          },
        ],
      };

      const params = req.body;
      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);
      const populatedData = await populateKeyValueData(bodyData);
      await loginStep();

      if (params.quoteId) {
        await processExistingQuote();
      } else {
        await newQuoteStep();
      }

      if (!params.stepName) {
        await namedInsuredStep();
        await DriversStep();
        await vehiclesStep();
        await underWritingStep();
      } else if (params.stepName === 'namedInsured') {
        await namedInsuredStep();
        await page.waitFor(1000);
        const quoteId = await page.$eval('#ctl00_lblHeaderPageTitleTop', e => e.innerText);
        req.session.data = {
          title: 'Successfully finished National AL Named Insured Step',
          status: true,
          quoteId,
        };
        browser.close();
        return next();
      } else if (params.stepName === 'drivers' && params.quoteId) {
        await DriversStep();
        req.session.data = {
          title: 'Successfully finished National AL Drivers Step',
          status: true,
          quoteId: params.quoteId,
        };
        browser.close();
        return next();
      } else if (params.stepName === 'vehicles' && params.quoteId) {
        await vehiclesStep();
        req.session.data = {
          title: 'Successfully finished National AL vehicle Step',
          status: true,
          quoteId: params.quoteId,
        };
        browser.close();
        return next();
      } else if (params.stepName === 'summary' && params.quoteId) {
        await underWritingStep();
      }

      async function loginStep() {
        try {
          console.log('National AL Login Step.');
          await page.goto(nationalGeneralAlRater.LOGIN_URL, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('#txtUserID');
          await page.type('#txtUserID', username);
          await page.type('#txtPassword', password);
          await page.click('#btnLogin');
          await page.waitForNavigation({ timeout: 0 });
        } catch (error) {
          console.log('Error at National AL Log In  Step:', error);
          const response = { error: 'There is some error validations at loginStep' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function processExistingQuote() {
        try {
          console.log('National AL Existing Quote Id Step.');
          const quoteId = params.quoteId;
          // eslint-disable-next-line no-shadow
          await page.evaluate((quoteId) => {
            document.querySelector('input[name=\'ctl00$MainContent$wgtMainMenuSearchQuotes$txtSearchString\']').value = quoteId;
          }, quoteId);
          await page.click('#ctl00_MainContent_wgtMainMenuSearchQuotes_btnSearchQuote');
          await page.waitFor(1000);
        } catch (error) {
          console.log('Error at National AL Existing Quote Id Step:');
          const response = { error: 'There is some error validations' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function newQuoteStep() {
        try {
          console.log('National AL New Quote Step.');
          await page.goto(nationalGeneralAlRater.NEW_QUOTE_URL, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector(populatedData.newQuoteState.element);
          await page.select(populatedData.newQuoteState.element, populatedData.newQuoteState.value);
          await page.select(populatedData.newQuoteProduct.element, populatedData.newQuoteProduct.value);
          await page.waitFor(1000);
          await page.click('span > #ctl00_MainContent_wgtMainMenuNewQuote_btnContinue');
        } catch (error) {
          console.log('Error at National AL New Quote  Step:');
          const response = { error: 'There is some error validations at newQuoteStep' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      // For Named Insured Form
      async function namedInsuredStep() {
        console.log('National AL Named Insured Step.');
        try {
          await page.goto(nationalGeneralAlRater.NAMED_INSURED_URL, { waitUntil: 'domcontentloaded' });
          page.on('dialog', async (dialog) => {
            await dialog.dismiss();
          });
          await page.waitFor(2000);
          await page.waitForSelector(populatedData.producer.element);
          await page.select(populatedData.producer.element, populatedData.producer.value);
          await page.select(populatedData.inputBy.element, populatedData.inputBy.value);
          await page.select(populatedData.plan.element, populatedData.plan.value);
          await page.evaluate((firstName) => { document.querySelector(firstName.element).value = firstName.value; }, populatedData.firstName);
          await page.evaluate((middleName) => { document.querySelector(middleName.element).value = middleName.value; }, populatedData.middleName);
          await page.evaluate((lastName) => { document.querySelector(lastName.element).value = lastName.value; }, populatedData.lastName);
          await page.select(populatedData.suffixName.element, populatedData.suffixName.value);
          await page.evaluate((phone1) => { document.querySelector(phone1.element).value = phone1.value; }, populatedData.phone1);
          await page.evaluate((phone2) => { document.querySelector(phone2.element).value = phone2.value; }, populatedData.phone2);
          await page.evaluate((phone3) => { document.querySelector(phone3.element).value = phone3.value; }, populatedData.phone3);
          await page.select(populatedData.phoneType.element, populatedData.phoneType.value);
          await page.select(populatedData.emailOption.element, populatedData.emailOption.value);
          await page.evaluate((email) => { document.querySelector(email.element).value = email.value; }, populatedData.email);
          await page.evaluate((dateOfBirth) => { document.querySelector(dateOfBirth.element).value = dateOfBirth.value; }, populatedData.dateOfBirth);
          await page.evaluate((security1) => { document.querySelector(security1.element).value = security1.value; }, populatedData.security1);
          await page.evaluate((security2) => { document.querySelector(security2.element).value = security2.value; }, populatedData.security2);
          await page.evaluate((security3) => { document.querySelector(security3.element).value = security3.value; }, populatedData.security3);
          await page.evaluate((mailingAddress) => { document.querySelector(mailingAddress.element).value = mailingAddress.value; }, populatedData.mailingAddress);
          await page.evaluate((city) => { document.querySelector(city.element).value = city.value; }, populatedData.city);
          await page.select(populatedData.state.element, populatedData.state.value);
          await page.evaluate((zipCode) => { document.querySelector(zipCode.element).value = zipCode.value; }, populatedData.zipCode);
          await page.select(populatedData.hasMovedInLast60Days.element, populatedData.hasMovedInLast60Days.value);
          await page.waitFor(2000);
          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
          await page.waitFor(5000);
          const quoteId = await page.$eval('#ctl00_lblHeaderPageTitleTop', e => e.innerText);
          return quoteId;
        } catch (err) {
          console.log('Error at National AL Named Insured Step:');
          const response = { error: 'There is some error validations at namedInsuredStep' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function DriversStep() {
        console.log('National AL Drivers Step.');
        try {
          await page.waitFor(1000);
          await page.goto(nationalGeneralAlRater.DRIVERS_URL, { waitUntil: 'load' });
          for (const j in bodyData.drivers) {
            if (j < bodyData.drivers.length - 1) {
              const addElement = await page.$('[id="ctl00_MainContent_InsuredDriverLabel1_btnAddDriver"]');
              await addElement.click();
              await page.waitFor(2000);
            }
          }
          await page.waitFor(4000);
          await page.waitForSelector('#ctl00_MainContent_Driver1_txtFirstName');
          await clearInputText('#ctl00_MainContent_Driver1_txtFirstName');
          await clearInputText('#ctl00_MainContent_Driver1_txtLastName');
          await clearInputText('#ctl00_MainContent_Driver1_txtDateOfBirth');
          await page.select('#ctl00_MainContent_Driver1_ddlSex', '-1');
          await page.waitFor(600);
          await page.select('#ctl00_MainContent_Driver1_ddlMaritalStatus', '-1');

          for (let j in bodyData.drivers) {
            j = parseInt(j) + 1;
            await page.waitFor(600);
            await page.waitForSelector(populatedData[`driverFirstName${j}`].element);
            await page.evaluate((firstName) => {
              document.querySelector(firstName.element).value = firstName.value;
            }, populatedData[`driverFirstName${j}`]);
            await page.evaluate((lastName) => {
              document.querySelector(lastName.element).value = lastName.value;
            }, populatedData[`driverLastName${j}`]);
            await page.evaluate((dateOfBirth) => {
              document.querySelector(dateOfBirth.element).value = dateOfBirth.value;
            }, populatedData[`driverDateOfBirth${j}`]);
            await page.select(populatedData[`driverGender${j}`].element, populatedData[`driverGender${j}`].value.charAt(0));
            await page.select(populatedData[`driverMaritalStatus${j}`].element, populatedData[`driverMaritalStatus${j}`].value.charAt(0));
            if (j !== 0) {
              await page.select(populatedData[`driverRelationship${j}`].element, populatedData[`driverRelationship${j}`].value);
            }
            await page.select(populatedData[`driverStatus${j}`].element, populatedData[`driverStatus${j}`].value);

            await page.evaluate((yearsOfExperiance) => {
              document.querySelector(yearsOfExperiance.element).value = yearsOfExperiance.value;
            }, populatedData[`yearsOfExperiance${j}`]);
            await page.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);
            await page.select(populatedData[`smartDrive${j}`].element, populatedData[`smartDrive${j}`].value);
            await page.select(populatedData[`licenseState${j}`].element, populatedData[`licenseState${j}`].value);
          }
          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
          try {
            await page.waitFor(3000);
            await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
          } catch (e) {
            console.log('National AL Move to vehicle');
          }
        } catch (err) {
          console.log('Error at National AL Driver Step.');
          const response = { error: 'There is some data error at Drivers step' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function vehiclesStep() {
        console.log('National AL Vehicles Step.');

        try {
          await page.waitFor(2000);
          await page.goto(nationalGeneralAlRater.VEHICLES_URL, { waitUntil: 'load' });
          await page.waitForSelector('#ctl00_MainContent_InsuredAutoLabel1_btnAddAuto');

          for (const j in bodyData.vehicles) {
            if (j < bodyData.vehicles.length - 1) {
              const addElement = await page.$('[id="ctl00_MainContent_InsuredAutoLabel1_btnAddAuto"]');
              await addElement.click();
              await page.waitFor(2000);
            }
          }
          await page.waitFor(1000);
          await page.waitForSelector('#ctl00_MainContent_AutoControl1_txtZip');
          await clearInputText('#ctl00_MainContent_AutoControl1_txtZip');
          for (const j in bodyData.vehicles) {
            await page.waitFor(600);
            await page.waitForSelector(populatedData[`vehicleVin${j}`].element);
            await page.evaluate((vehicleVinInput) => {
              document.querySelector(vehicleVinInput.element).value = vehicleVinInput.value;
            }, populatedData[`vehicleVin${j}`]);

            await page.evaluate((vehicleVin) => {
              document.querySelector(vehicleVin.buttonId).click();
            }, populatedData[`vehicleVin${j}`]);
            await page.waitFor(5000);
            await page.select(populatedData[`primaryUse${j}`].element, populatedData[`primaryUse${j}`].value);
            await page.select(populatedData[`antiTheft${j}`].element, populatedData[`antiTheft${j}`].value);
            await page.waitFor(200);
            await page.evaluate((garagingState) => {
              document.querySelector(garagingState.element).value = garagingState.value;
            }, populatedData[`garagingState${j}`]);

            await page.evaluate((garagingzipCode) => {
              document.getElementById(garagingzipCode.elementId).value = garagingzipCode.value;
            }, populatedData[`garagingzipCode${j}`]);
            await page.type(populatedData[`ownershipStatus${j}`].elementId, populatedData[`ownershipStatus${j}`].value);
          }
          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
          await vehicleHistoryStep();
        } catch (err) {
          console.log('Error at National AL Vehicles Steps.', err);
          const response = { error: 'There is some data error at vehicles' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function vehicleHistoryStep() {
        console.log('National AL VehicleHistory Step.');
        try {
          await page.goto(nationalGeneralAlRater.VEHICLE_HISTORY_URL, { waitUntil: 'load' });
          await page.waitFor(1000);

          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
        } catch (err) {
          console.log('Error at National AL vehicleHistory Step :', err);
          const response = { error: 'There is some data error at vehicleHistory step' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function underWritingStep() {
        console.log('National AL Underwriting Step.');
        try {
          await page.waitFor(1200);
          await page.goto(nationalGeneralAlRater.UNDERWRITING_URL, { waitUntil: 'load' });
          await page.waitForSelector(populatedData.priorInsuranceCo.element);
          await page.select(populatedData.priorInsuranceCo.element, populatedData.priorInsuranceCo.value);
          await page.waitFor(1200);
          await page.select(populatedData.priorBICoverage.element, populatedData.priorBICoverage.value);
          await page.waitFor(1200);
          await page.type(populatedData.priorExpirationDate.element, populatedData.priorExpirationDate.value);
          await page.waitFor(600);
          await page.select(populatedData.recidentStatus.element, populatedData.recidentStatus.value);
          await page.waitFor(600);
          await page.select(populatedData.prohibitedRisk.element, populatedData.prohibitedRisk.value);
          await page.waitFor(1000);
          await page.select('#ctl00_MainContent_ctl09_ddlAnswer', 'False');
          await page.select('#ctl00_MainContent_ctl05_ddlAnswer', 'False');
          await page.select('#ctl00_MainContent_ctl07_ddlAnswer', 'False');
          await page.waitFor(2000);
          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
          await coveragesStep();
        } catch (err) {
          console.log('Error at National AL Underwriting :', err.stack);
          const response = { error: 'There is some data error underWriting step' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function coveragesStep() {
        console.log('National AL Coverages Step.');
        try {
          await page.goto(nationalGeneralAlRater.COVERAGES_URL, { waitUntil: 'load' });
          await page.waitFor(600);
          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
          await billPlansStep();
        } catch (err) {
          console.log('Error at National AL coverages Step.', err);
          const response = { error: 'There is some data error coverages step' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function billPlansStep() {
        console.log('National AL BillPlans Step.');
        try {
          await page.goto(nationalGeneralAlRater.BILLPLANS_URL, { waitUntil: 'load' });
          const tHead = await page.$$eval('table tr.GRIDHEADER td', tds => tds.map(td => td.innerText));
          const tBody = await page.$$eval('table #ctl00_MainContent_ctl00_tblRow td', tds => tds.map(td => td.innerText));
          const quoteId = await page.$eval('#ctl00_lblHeaderPageTitleTop', e => e.innerText);
          const downPayments = {};
          tHead.forEach((key, i) => {
            if (i !== 0) downPayments[key] = tBody[i];
          });

          const premiumDetails = {
            quoteId: bodyData.quoteId ? bodyData.quoteId : quoteId,
            description: downPayments.DESCRIPTION,
            downPayment: downPayments['DOWN PAYMENT'],
            payments: downPayments.PAYMENTS,
            totalPremium: downPayments.TOTAL,
          };
          req.session.data = {
            title: 'Successfully retrieved national general AL rate.',
            status: true,
            response: premiumDetails,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            downPayment: premiumDetails.downPayment ? premiumDetails.downPayment.replace(/,/g, '') : null,
          };
          browser.close();
          return next();
        } catch (err) {
          console.log('Error at National AL Bill plans:', err);
          const response = { error: 'There is some data error billPlans step' };
          req.session.data = {
            title: 'Failed to retrieved National AL rate.',
            status: false,
            response,
          };
          browser.close();
          return next();
        }
      }

      async function clearInputText(inputId) {
        await page.focus(inputId);
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
      }

      function populateKeyValueData() {
        const clientInputSelect = {
          newQuoteState: {
            element: 'select[name="ctl00$MainContent$wgtMainMenuNewQuote$ddlState"]',
            value: 'AL',
          },
          newQuoteProduct: {
            element: 'select[name="ctl00$MainContent$wgtMainMenuNewQuote$ddlProduct"]',
            value: 'PPA',
          },
          producer: {
            element: 'select[name="ctl00$MainContent$InsuredNamed1$ddlProducers"]',
            value: bodyData.producer || staticDataObj.producer,
          },
          inputBy: {
            element: 'select[name="ctl00$MainContent$InsuredNamed1$ddlInputBy"]',
            value: bodyData.inputBy || staticDataObj.inputBy,
          },
          plan: {
            element: 'select[name="ctl00$MainContent$InsuredNamed1$ddlPlanCode"]',
            value: bodyData.plan || staticDataObj.plan,
          },
          firstName: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtInsFirstName\']',
            value: bodyData.firstName || staticDataObj.firstName,
          },
          middleName: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtInsMiddleName\']',
            value: bodyData.middleName || staticDataObj.middleName,
          },
          lastName: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtInsLastName\']',
            value: bodyData.lastName || staticDataObj.lastName,
          },
          suffixName: {
            element: 'select[name=\'ctl00$MainContent$InsuredNamed1$ddlInsSuffix\']',
            value: bodyData.suffixName || staticDataObj.suffixName,
          },
          phone1: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone1\']',
            value: bodyData.phone1 || staticDataObj.phone1,
          },
          phone2: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone2\']',
            value: bodyData.phone2 || staticDataObj.phone2,
          },
          phone3: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone3\']',
            value: bodyData.phone3 || staticDataObj.phone3,
          },
          phoneType: {
            element: 'select[name=\'ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$ddlPhoneType\']',
            value: '3' || '',
          },
          emailOption: {
            element: 'select[name=\'ctl00$MainContent$InsuredNamed1$ddlEmailOption\']',
            value: 'EmailProvided' || '',
          },
          email: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtInsEmail\']',
            value: bodyData.email || staticDataObj.email,
          },
          dateOfBirth: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtInsDOB\']',
            value: bodyData.birthDate || staticDataObj.birthDate,
          },
          security1: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum1\']',
            value: bodyData.security1 || staticDataObj.security1,
          },
          security2: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum2\']',
            value: bodyData.security2 || staticDataObj.security2,
          },
          security3: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum3\']',
            value: bodyData.security3 || staticDataObj.security3,
          },
          mailingAddress: {
            element: '#ctl00_MainContent_InsuredNamed1_txtInsAdr',
            value: bodyData.mailingAddress || staticDataObj.mailingAddress,
          },
          city: {
            element: 'input[name=\'ctl00$MainContent$InsuredNamed1$txtInsCity\']',
            value: bodyData.city || staticDataObj.city,
          },
          state: {
            element: 'select[name=\'ctl00$MainContent$InsuredNamed1$ddlInsState\']',
            value: bodyData.state || staticDataObj.state,
          },
          zipCode: {
            element: '#ctl00_MainContent_InsuredNamed1_txtInsZip',
            value: bodyData.zipCode || staticDataObj.zipCode,
          },
          hasMovedInLast60Days: {
            element: 'select[name="ctl00$MainContent$InsuredNamed1$ddlInsRecentMove60"]',
            value: 'False' || '',
          },
          priorInsuranceCo: {
            element: 'select[name="ctl00$MainContent$PriorPolicy$ddlCurrentCarrier"]',
            value: '0' || '',
          },
          priorBICoverage: {
            element: 'select[name="ctl00$MainContent$PriorPolicy$ddlBICoverage"]',
            value: '10/20' || '',
          },
          priorExpirationDate: {
            element: 'input[name="ctl00$MainContent$PriorPolicy$txtExpDateOld"]',
            value: '4/30/2019' || '',
          },
          recidentStatus: {
            element: 'select[name="ctl00$MainContent$ctl00$ddlAnswer"]',
            value: 'HCO' || '',
          },
          prohibitedRisk: {
            element: 'select[name="ctl00$MainContent$ProhibitedRisk6$ddlProhibitedRisk"]',
            value: 'False' || '',
          },
          anydriversTNC: {
            element: 'select[name="ctl00$MainContent$ctl07$ddlAnswer"]',
            value: 'False' || '',
          },
        };

        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          for (const j in bodyData.drivers) {
            const i = parseInt(j) + 1;
            clientInputSelect[`driverFirstName${i}`] = {
              elementId: `ctl00_MainContent_Driver${i}_txtFirstName`,
              element: `input[name='ctl00$MainContent$Driver${i}$txtFirstName']`,
              value: bodyData.drivers[j].firstName || staticDataObj.drivers[0].firstName,
            };
            clientInputSelect[`driverLastName${i}`] = {
              elementId: `ctl00_MainContent_Driver${i}_txtLastName`,
              element: `input[name='ctl00$MainContent$Driver${i}$txtLastName']`,
              value: bodyData.drivers[j].lastName || staticDataObj.drivers[0].lastName,
            };
            clientInputSelect[`driverDateOfBirth${i}`] = {
              elementId: `ctl00_MainContent_Driver${i}_txtDateOfBirth`,
              element: `input[name="ctl00$MainContent$Driver${i}$txtDateOfBirth"]`,
              value: bodyData.drivers[j].applicantBirthDt || staticDataObj.drivers[0].applicantBirthDt,
            };
            clientInputSelect[`driverGender${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlSex']`,
              value: bodyData.drivers[j].gender || staticDataObj.drivers[0].gender,
            };
            clientInputSelect[`driverMaritalStatus${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlMaritalStatus']`,
              value: bodyData.drivers[j].maritalStatus || staticDataObj.drivers[0].maritalStatus,
            };
            clientInputSelect[`driverRelationship${i}`] = {
              element: `#ctl00_MainContent_Driver${i}_ddlRelationship`,
              value: 'Other' || '',
            };
            clientInputSelect[`driverStatus${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlDriverStatus']`,
              value: 'Rated Driver' || '',
            };
            clientInputSelect[`yearsOfExperiance${i}`] = {
              element: `#ctl00_MainContent_Driver${i}_txtYrsExperience`,
              value: bodyData.drivers[j].yearOfExperiance || staticDataObj.drivers[0].yearOfExperiance,
            };
            clientInputSelect[`driverLicenseStatus${i}`] = {
              element: `#ctl00_MainContent_Driver${i}_ddlDLStatus`,
              value: 'Permit' || '',
            };
            clientInputSelect[`smartDrive${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlSmartDrive']`,
              value: 'False' || '',
            };
            clientInputSelect[`licenseState${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlLicenseState']`,
              value: bodyData.drivers[j].licenseState || staticDataObj.drivers[0].licenseState,
            };
          }
        }

        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          for (const j in bodyData.vehicles) {
            const i = parseInt(j) + 1;
            clientInputSelect[`vehicleVin${j}`] = {
              buttonId: `#ctl00_MainContent_AutoControl${i}_btnVerifyVIN`,
              element: `input[name='ctl00$MainContent$AutoControl${i}$txtVIN']`,
              value: bodyData.vehicles[j].vehicleVin || staticDataObj.vehicles[0].vehicleVin,
            };
            clientInputSelect[`vehicleType${j}`] = {
              element: `#ctl00_MainContent_AutoControl${i}_ddlType`,
              value: bodyData.vehicles[j].vehicleType || staticDataObj.vehicles[0].vehicleType,
            };
            clientInputSelect[`vehicleModelYear${j}`] = {
              element: `input[name='ctl00$MainContent$AutoControl${i}$txtModelYear']`,
              value: bodyData.vehicles[j].modelYear || staticDataObj.vehicles[0].modelYear,
            };
            clientInputSelect[`vehicleMake${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlMake']`,
              value: bodyData.vehicles[j].make || staticDataObj.vehicles[0].make,
            };
            clientInputSelect[`vehicleModel${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlModel']`,
              value: bodyData.vehicles[j].model || staticDataObj.vehicles[0].model,
            };
            clientInputSelect[`vehicleStyle${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlStyle']`,
              value: bodyData.vehicles[j].style || staticDataObj.vehicles[0].style,
            };
            clientInputSelect[`primaryUse${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlPrimaryUse']`,
              value: 'Pleasure/Commute',
            };
            clientInputSelect[`antiTheft${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlAntiTheft']`,
              value: 'Recovery Device',
            };
            clientInputSelect[`garagingState${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlState']`,
              value: bodyData.vehicles[j].garagingState || staticDataObj.vehicles[0].garagingState,
            };
            clientInputSelect[`garagingzipCode${j}`] = {
              elementId: `ctl00_MainContent_AutoControl${i}_txtZip`,
              element: `input[name='ctl00$MainContent$AutoControl${i}$txtZip']`,
              value: '36016' || '',
            };
            clientInputSelect[`ownershipStatus${j}`] = {
              elementId: `select#ctl00_MainContent_AutoControl${i}_ddlOwnershipStatus`,
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlOwnershipStatus']`,
              value: bodyData.vehicles[j].ownershipStatus || staticDataObj.vehicles[0].ownershipStatus,
            };
          }
        }
        return clientInputSelect;
      }
    } catch (error) {
      console.log('Error at National AL : ', error.stack);
      return next(Boom.badRequest('Failed to retrieved national general AL rate.'));
    }
  },
};
