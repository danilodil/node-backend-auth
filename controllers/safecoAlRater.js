/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { safecoAlRater } = require('../constants/appConstant');
const utils = require('../lib/utils');

module.exports = {
  safecoAl: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      // const browser = await puppeteer.launch({ headless: false });
      let page = await browser.newPage();

      page.on('dialog', async (dialog) => {
        try {
          await dialog.dismiss();
        } catch (e) {
          console.log('dialog close');
        }
      });

      // Request input data
      req.body.data = await utils.cleanObj(req.body.data);
      const data = {
        firstName: req.body.data.firstName,
        lastName: req.body.data.lastName,
        birthDate: req.body.data.birthDate,
        email: req.body.data.email,
        mailingAddress: req.body.data.mailingAddress,
        zipCode: req.body.data.zipCode || '19934',
        city: req.body.data.city || 'Moody',
        state: req.body.data.state || 'AL',
        socialSecurityStatus: 'R',
        reasonForPolicy: 'N',
        drivers: req.body.data.drivers,
        vehicles: req.body.data.vehicles,
      };

      const staticDataObj = {
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
        dateOfBirth: '12/16/1993',
        gender: 'Male',
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
      const bodyData = data;
      bodyData.drivers.splice(10, bodyData.drivers.length);
      await startPageStep();

      async function startPageStep() {
        let retryStartPage = true;
        try{
          console.log('Safeco Start Page Step');
          await page.waitFor(2000);
          await page.goto(safecoAlRater.LOGIN_URL, { waitUntil: 'domcontentloaded' });
          await page.waitFor(3000);
          await page.waitForSelector('#div2', { timeout: 120000 });
          await page.evaluate(() => {
            const insuranceType = document.querySelector('#div2');
            insuranceType.click();
          });
          await page.click('input[class="DPeCButton"]');
          retryStartPage = false;

          await loginStep();

        }catch(error){
          if(retryStartPage){
            await startPageStep();
          }
          console.log('Error at Safeco AL startPage Step:', error);
          const response = { error: 'There is some error validations at startPage step' };
          bodyData.results = {
            status: false,
            response,
          };
        }
        
      }

      async function loginStep() {
        let retryLogIn = true;
        try{

          console.log('Safeco AL Login Step.');
          await page.waitForSelector('#ctl00_ContentPlaceHolder1_UsernameTextBox');
          await page.type('#ctl00_ContentPlaceHolder1_UsernameTextBox', username);
          await page.type('#ctl00_ContentPlaceHolder1_PasswordTextBox', password);
          await page.evaluate(() => document.querySelector('#ctl00_ContentPlaceHolder1_SubmitButton').click());
          await page.waitForNavigation({ waitUntil: 'load' });
          retryLogIn = false;
          await newQuoteStep();

        }catch(error){
          if(retryLogIn){
            await loginStep();
          }
          console.log('Error at Safeco AL Login Step:', error);
          const response = { error: 'There is some error validations at loginStep' };
          bodyData.results = {
            status: false,
            response,
          };
        }
      }

      // For redirect to new quoate form
      async function newQuoteStep() {
        let retryNewquote = true;
        try {
          console.log('Safeco AL New Quote Step.');
          await page.waitFor(2000);
          await page.goto(safecoAlRater.NEW_QUOTE_START_URL, { waitUntil: 'load' });
          await page.waitFor(3000);
          await page.click('#header > div > div > div.rowcontainer.logo-search-bar-wrapper > div > div > div.col-xs-2.hidden-xs > div > div > div > a');
          while (true) {
            await page.waitFor(1000);
            const pageQuote = await browser.pages();
            if (pageQuote.length > 2) {
              page = pageQuote[2];
              break;
            }
          }
          // await page.goto(safecoAlRater.NEW_QUOTE_START_NEWBUSINESS, { waitUntil: 'domcontentloaded' });
          await page.waitFor(3000);
          await page.waitForSelector('#NextButton', { timeout: 120000 });
          await page.evaluate(() => {
            const insuranceType = document.querySelector('#NextButton');
            insuranceType.click();
          });
          retryNewquote = false;
          const populatedData = await populateKeyValueData();
          await policyInformationStep(bodyData, populatedData);
        } catch (err) {
          if(retryNewquote){
            await loginStep();
          }
          console.log('Error at Safeco AL New Quote Step:', err);
          const response = { error: 'There is some error validations at newQuoteStep' };
          bodyData.results = {
            status: false,
            response,
          };
        }
      }


      // For Named Insured Form
      async function policyInformationStep(dataObject, populatedData) {
        console.log('Safeco AL Policy Information Step.');

        try {
          await page.waitFor(1000);
          await page.waitForSelector('#PolicyEffectiveDate');
          await page.type('#PolicyEffectiveDate', '05/01/2019');
          await page.waitFor(200);
          await page.click(populatedData.firstName.element);
          if (await page.waitForSelector('#ui-dialog-title-1')) {
            await page.keyboard.press('Escape');
          }
          await page.type(populatedData.firstName.element, populatedData.firstName.value);

          await page.waitForSelector('#PolicyClientPersonLastName');
          await page.type(populatedData.lastName.element, populatedData.lastName.value);

          await page.select(populatedData.socialSecurityStatus.element, populatedData.socialSecurityStatus.value);
          await page.click(populatedData.dateOfBirth.element);
          await page.type(populatedData.dateOfBirth.element, populatedData.dateOfBirth.value);
          await page.type(populatedData.email.element, populatedData.email.value);

          await page.click(populatedData.dateOfBirth.element);
          await page.type(populatedData.dateOfBirth.element, populatedData.dateOfBirth.value);

          await page.waitFor(600);
          await page.type(populatedData.mailingAddress.element, populatedData.mailingAddress.value);
          await page.click(populatedData.zipCode.element);
          await page.type(populatedData.zipCode.element, populatedData.zipCode.value);
          await page.click(populatedData.city.element);
          if (await page.waitForSelector('#PolicyProducerName')) {
            await page.click(populatedData.city.element);
          }
          await page.type(populatedData.city.element, populatedData.city.value);

          await page.click(populatedData.state.element);
          if (await page.waitForSelector('#PolicyProducerName')) {
            await page.click(populatedData.state.element);
          }
          await page.select(populatedData.state.element, populatedData.state.value);
          await page.waitFor(200);

          await page.evaluate(() => {
            const vehicleGaragedAtMailingAddress = document.querySelector('td > span > input[id="PolicyAutoDataVehicleGaragingAddressYNN"]');
            vehicleGaragedAtMailingAddress.click();
          });

          await page.waitFor(200);
          await page.click(populatedData.reasonForPolicy.element);
          await page.select(populatedData.reasonForPolicy.element, populatedData.reasonForPolicy.value);
          await page.waitFor(200);

          await page.evaluate(() => {
            const anyReportableIncidents = document.querySelector('td > span > input[id="PolicyAutoDataAnyIncidentsOnPolicyYNN"]');
            anyReportableIncidents.click();
          });

          await page.evaluate(() => {
            const anyWrittenPolicyUsedforDelivery = document.querySelector('td > span > input[id="PolicyAutoDataDeliveryVehicleYNN"]');
            anyWrittenPolicyUsedforDelivery.click();
          });
          await page.evaluate(() => document.querySelector('#Continue').click());
          await page.waitFor(5000);
          try {
            try {
              if (page.$('[id="ui-dialog-title-1"]')) {
                await page.click('a[class="ui-dialog-titlebar-close ui-corner-all"]');
              }
            } catch (e) {
              console.log('Safeco AL Error during close dialog.');
            }
            await page.waitFor(1000);
            await page.focus(populatedData.mailingAddress.element);
            await page.keyboard.down('Control');
            await page.keyboard.press('A');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await page.waitFor(1000);
            await page.type(populatedData.mailingAddress.element, '670 Park Avenue');
            await page.evaluate(() => document.querySelector('#Continue').click());
          } catch (e) {
            console.log('catch error');
          }
          await GaragedInfoStep(dataObject, populatedData);
        } catch (err) {
          console.log('Error at Safeco AL Policy Information Step:', err);
          const response = { error: 'There is some error validations at policyInformationStep' };
          dataObject.results = {
            status: false,
            response,
          };
          try {
            const errorMessage = await page.evaluate(() => document.querySelector('#PolicyKickoutReasonSpan').innerText);
            if (errorMessage) {
              dataObject.results.response = { error: 'Unable to process due to site down.' };
            }
          } catch (e) {
            console.log('Safeco AL Unable to process due to site down.');
          }
        }
      }

      async function GaragedInfoStep(dataObject, populatedData) {
        console.log('Safeco AL Garaged Info Step');
        try {
          await page.waitFor(800);

          await page.waitForSelector('#PolicyLocations2AddressLine1');
          await page.type(populatedData.garagedAddress.element, populatedData.garagedAddress.value);

          await page.click(populatedData.garagedZipcode.element);
          await page.type(populatedData.garagedZipcode.element, populatedData.garagedZipcode.value);

          await page.waitFor(1500);
          await page.evaluate((garagedCity) => {
            document.querySelector(garagedCity.element).value = garagedCity.value;
          }, populatedData.garagedCity);

          await page.waitFor(1500);
          await page.evaluate(() => document.querySelector('#Continue').click());
          await houseHoldStep(dataObject, populatedData);
        } catch (err) {
          console.log('Error at Safeco AL Garaged Info:', err);
          const response = { error: 'There is some error validations at GaragedInfoStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      async function houseHoldStep(dataObject, populatedData) {
        console.log('Safeco AL House Hold Step');
        try {
          try {
            await page.waitFor(1000);
            await page.waitForSelector('#PolicyDriverCandidates2CandidateRelationship', { timeout: 4000 });
            await page.select(populatedData.peopleInhouseHold1.element, populatedData.peopleInhouseHold1.value);
            await page.select(populatedData.peopleInhouseHold2.element, populatedData.peopleInhouseHold2.value);
            await page.waitForSelector('#PolicyDriverCandidates4CandidateRelationship');
            await page.select(populatedData.peopleInhouseHold3.element, populatedData.peopleInhouseHold3.value);
            await page.waitFor(1000);
            await page.evaluate(() => document.querySelector('#Continue').click());
            await page.waitFor(5000);

            try {
              try {
                if (page.$('[id="ui-dialog-title-1"]')) {
                  await page.click('a[class="ui-dialog-titlebar-close ui-corner-all"]');
                }
              } catch (e) {
                console.log('Safeco AL Error during close dialog');
              }
              await page.waitFor(1000);
              await page.evaluate(() => document.querySelector('#Continue').click());
            } catch (e) {
              console.log('Safeco AL houseHold catch');
            }
            await Drivers(dataObject, populatedData);
          } catch (err) {
            console.log('Safeco AL houseHold catch');
            try {
              await page.evaluate(() => document.querySelector('#Continue').click());
            } catch (e) {
              console.log('Safeco AL next button not found');
            }
            await DriversStep(dataObject, populatedData);
          }
        } catch (e) {
          console.log('Error at Safeco AL House Hold:', err);
          const response = { error: 'There is some error validations at houseHoldStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }


      // For driver Form
      async function DriversStep(dataObject, populatedData) {
        console.log('Safeco AL Drivers Step.');
        try {
          await page.waitFor(1000);

          for (const j in dataObject.drivers) {
            try {
              if (page.$('[id="ui-dialog-title-1"]')) {
                await page.evaluate(() => {
                  const dismissDialog = document.querySelector('div > a[class="ui-dialog-titlebar-close ui-corner-all"]');
                  if (dismissDialog) {
                    dismissDialog.click();
                  }
                });
              }
            } catch (e) {
              console.log('Safeco AL Error uding close dialog');
            }


            await page.waitFor(2000);
            await page.evaluate((firstName) => {
              (document.getElementById(firstName.elementId)).value = firstName.value;
            }, populatedData[`driverFirstName${j}`]);

            await page.evaluate((lastName) => {
              (document.getElementById(lastName.elementId)).value = lastName.value;
            }, populatedData[`driverLastName${j}`]);

            await page.evaluate((dateOfBirth) => {
              (document.getElementById(dateOfBirth.elementId)).value = dateOfBirth.value;
            }, populatedData[`driverDateOfBirth${j}`]);

            await page.waitForSelector(populatedData[`driverGender${j}`].element);

            const genders = await page.evaluate(getSelctVal, `${populatedData[`driverGender${j}`].element}>option`);
            const gender = await page.evaluate(getValToSelect, genders, populatedData[`driverGender${j}`].value);

            await page.waitFor(800);
            await page.click(populatedData[`driverGender${j}`].element);
            await page.select(populatedData[`driverGender${j}`].element, gender);

            await page.waitFor(800);
            const maritalStatusOptions = await page.evaluate(getSelctVal, `${populatedData[`driverMaritalStatus${j}`].element}>option`);
            const maritalStatus = await page.evaluate(getValToSelect, maritalStatusOptions, populatedData[`driverMaritalStatus${j}`].value);
            await page.select(populatedData[`driverMaritalStatus${j}`].element, maritalStatus);

            if (await page.waitForSelector('#PolicyDriverRelationshipToInsured')) {
              await page.select(populatedData[`driverRelationship${j}`].element);
              await page.select(populatedData[`driverRelationship${j}`].element, populatedData[`driverRelationship${j}`].value);
              await page.waitFor(600);
            }

            await page.waitFor(200);
            await page.click(populatedData[`licenseState${j}`].element);
            await page.select(populatedData[`licenseState${j}`].element, populatedData[`licenseState${j}`].value);

            await page.waitFor(200);
            await page.click(populatedData[`ageWhen1stLicensed${j}`].element);
            await page.type(populatedData[`ageWhen1stLicensed${j}`].element, populatedData[`ageWhen1stLicensed${j}`].value);

            await page.evaluate(() => {
              const haslicenseSuspendInLast5Year = document.querySelector('td > span > input[id="PolicyDriverLicenseSuspendedRevokedYNN"]');
              haslicenseSuspendInLast5Year.click();
            });

            if (await page.$('[id="PolicyDriverPersonCommonOccupationCategory"]')) {
              await page.waitFor(200);
              await page.select(populatedData[`commonOccupation${j}`].element, populatedData[`commonOccupation${j}`].value);
            }

            if (await page.$('[id="PolicyDriverPersonEducation"]')) {
              await page.waitFor(200);
              await page.select(populatedData[`education${j}`].element, populatedData[`education${j}`].value);
            }

            await page.evaluate(() => {
              const sr22filling = document.querySelector('td > span > input[id="PolicyDriverSR22FilingYNN"]');
              sr22filling.click();
            });

            if (j < dataObject.drivers.length - 1) {
              const addElement = await page.$('[id="btnAddDriver2"]');
              await addElement.click();
              await page.waitFor(800);
            }
          }

          await page.waitFor(2000);
          await page.evaluate(() => document.querySelector('#Continue').click());
          await page.waitFor(5000);
          try {
            try {
              if (page.$('[id="PolicyDriverCandidates3CandidateRelationship"]')) {
                await page.select(populatedData.peopleInhouseHold2.element, populatedData.peopleInhouseHold2.value);
              }
              if (page.$('[id="ui-dialog-title-1"]')) {
                await page.evaluate(() => {
                  const dismissDialog = document.querySelector('div > a[class="ui-dialog-titlebar-close ui-corner-all"]');
                  if (dismissDialog) {
                    dismissDialog.click();
                  }
                });
              }
            } catch (e) {
              console.log('Safeco AL Error during close dialog');
            }
            await page.waitFor(2000);
            await page.evaluate(() => document.querySelector('#Continue').click());
            await page.waitFor(5000);
            await page.evaluate(() => document.querySelector('#Continue').click());
          } catch (e) {
            console.log('Safeco AL Move to vehicles');
          }
          await vehiclesStep(dataObject, populatedData);
        } catch (err) {
          console.log('Error at Safeco AL Driver Step:', err.stack);
          const response = { error: 'There is some error validations at driverStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      async function vehiclesStep(dataObject, populatedData) {
        console.log('Safeco AL Vehicles Step.');
        try {
          await page.waitFor(600);
          for (const j in dataObject.vehicles) {
            await page.waitForSelector('#PolicyVehiclemp_GaragedLocation_ID');
            await page.select(populatedData[`garagedLocation${j}`].element, populatedData[`garagedLocation${j}`].value);

            await page.select(populatedData[`principalOperator${j}`].element, populatedData[`principalOperator${j}`].value);

            await page.evaluate(() => {
              const vehicleVinIsKnown = document.querySelector('td > span > input[id="PolicyVehicleVINKnownYNY"]');
              vehicleVinIsKnown.click();
            });
            await page.waitFor(1000);
            await page.type(populatedData[`vehicleVin${j}`].element, populatedData[`vehicleVin${j}`].value);
            await page.waitFor(1000);

            if (await page.$('[id="PolicyVehicleTerritory"]')) {
              await page.type(populatedData[`territory${j}`].element, populatedData[`territory${j}`].value);
            }
            await page.select(populatedData[`vehicleUse${j}`].element, populatedData[`vehicleUse${j}`].value);
            await page.waitForSelector('#PolicyVehicleAnnualMiles');
            await page.focus('#PolicyVehicleAnnualMiles');
            await page.type(populatedData[`annualMiles${j}`].element, populatedData[`annualMiles${j}`].value);
            await page.evaluate(() => document.querySelector('#Save').click());
            await page.waitFor(3000);

            if (await page.$('[id="PolicyVehicleYearsVehicleOwned"]')) {
              await page.type(populatedData[`yearsVehicleOwned${j}`].element, populatedData[`yearsVehicleOwned${j}`].value);
            }

            if (j < dataObject.vehicles.length - 1) {
              const addElement = await page.$('[id="btnAddVehicle2"]');
              await addElement.click();
              await page.waitFor(2000);
            }
          }
          await page.waitFor(1000);
          await page.evaluate(() => document.querySelector('#Continue').click());
          await telemeticsStep(dataObject, populatedData);
        } catch (err) {
          console.log('Error at Safeco AL Vehicles Step:', err.stack);
          const response = { error: 'There is some error validations at vehiclesStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }


      async function telemeticsStep(dataObject, populatedData) {
        console.log('Safeco AL Telemetics Step.');
        try {
          await page.waitFor(1000);

          for (const j in dataObject.vehicles) {
            await page.waitForSelector(`#PolicyVehicles${parseInt(j) + 1}RightTrackStatus`);
            await page.select(populatedData[`policyVehiclesTrackStatus${j}`].element, populatedData[`policyVehiclesTrackStatus${j}`].value);
          }
          await page.waitFor(1000);
          await page.evaluate(() => document.querySelector('#Continue').click());
          await underwritingStep(dataObject, populatedData);
        } catch (err) {
          console.log('err telemetics:', err);
          const response = { error: 'There is some error validations at telemeticsStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      async function underwritingStep(dataObject, populatedData) {
        console.log('Safeco AL Underwriting Step.');
        try {
          await page.waitFor(1000);

          await page.waitForSelector('#PolicyCurrentInsuranceValue');
          await page.select(populatedData.policyCurrentInsuranceValue.element, populatedData.policyCurrentInsuranceValue.value);


          await page.waitForSelector('#PolicyAutoDataResidenceType');
          await page.select(populatedData.policyDataResidenceType.element, populatedData.policyDataResidenceType.value);

          await page.evaluate(() => document.querySelector('#Continue').click());
          await coveragesStep(dataObject, populatedData);
        } catch (err) {
          console.log('Error at Safeco AL Underwriting Step:', err);
          const response = { error: 'There is some error validations at underwritingStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      async function coveragesStep(dataObject, populatedData) {
        console.log('Safeco AL Coverages Step.');
        try {
          await page.waitFor(1000);

          await page.waitForSelector('#PolicyAutoDataPackageSelection');
          await page.select(populatedData.policyDataPackageSelection.element, populatedData.policyDataPackageSelection.value);

          for (const j in dataObject.vehicles) {
            await page.waitForSelector(`#PolicyVehicles${parseInt(j) + 1}CoverageCOMPLimitDed`);
            await page.select(populatedData[`policyVehiclesCoverage${j}`].element, populatedData[`policyVehiclesCoverage${j}`].value);
          }
          await page.evaluate(() => document.querySelector('#Continue').click());
          await summaryStep(dataObject);
        } catch (err) {
          console.log('Error at Safeco AL Coverages Step:', err);
          const response = { error: 'There is some error validations at coveragesStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      async function summaryStep(dataObject) {
        console.log('Safeco AL Summary Step.');
        try {
          await page.waitFor(2000);
          await page.waitForSelector('#PolicyPremiumTotalWithPIFLabel');
          const downPayments = await page.evaluate(() => {
            const downPaymentsObj = {};
            downPaymentsObj.paidInFullPremium = document.querySelector('#PolicyPremiumTotalWithPIFSpan').innerText.replace(/\$/g, '');
            downPaymentsObj.preferredPaymentMethodPremium = document.querySelector('#PolicyPreferredPaymentMethodPremiumSpan').innerText.replace(/\$/g, '');
            downPaymentsObj.totalPremium = document.querySelector('#PolicyPremiumTotalSpan').innerText.replace(/\$/g, '');
            return downPaymentsObj;
          });

          dataObject.results = {
            status: true,
            response: downPayments,
          };
        } catch (err) {
          console.log('Error at Safeco AL Summary Step:', err);
          const response = { error: 'There is some error validations at summaryStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      // For get all select options texts and values
      function getSelctVal(inputID) {
        optVals = [];
        document.querySelectorAll(inputID).forEach((opt) => {
          optVals.push({ name: opt.innerText, value: opt.value });
        });
        return optVals;
      }

      // For select particular value in dropdown
      function getValToSelect(dataValue, valueToSelect) {
        let selected = '';
        dataValue.forEach((entry) => {
          if (valueToSelect.toLowerCase() === entry.name.toLowerCase()) {
            selected = entry.value;
          }
        });
        if (!selected && dataValue[1]) {
          selected = dataValue[1].value;
        }
        return selected;
      }

      function populateKeyValueData() {
        const clientInputSelect = {
          firstName: {
            element: 'input[name=\'PolicyClientPersonFirstName\']',
            value: bodyData.firstName || '',
          },
          lastName: {
            element: 'input[name=\'PolicyClientPersonLastName\']',
            value: bodyData.lastName || '',
          },
          socialSecurityStatus: {
            element: 'select[name=\'PolicyClientPersonSocialSecurityNumberStatus\']',
            value: bodyData.socialSecurityStatus || staticDataObj.socialSecurityStatus,
          },
          dateOfBirth: {
            element: 'input[name=\'PolicyClientPersonBirthdate\']',
            value: bodyData.birthDate || '',
          },
          email: {
            element: 'input[name=\'PolicyClientEmailAddress\']',
            value: bodyData.email || '',
          },
          mailingAddress: {
            element: 'input[name=\'PolicyClientMailingLocationAddressLine1\']',
            value: bodyData.mailingAddress || '',
          },
          zipCode: {
            element: 'input[name=\'PolicyClientMailingLocationZipCode\']',
            value: bodyData.zipCode || '',
          },
          city: {
            element: 'input[name=\'PolicyClientMailingLocationCity\']',
            value: bodyData.city || '',
          },
          state: {
            element: 'select[name=\'PolicyClientMailingLocationState\']',
            value: bodyData.state || '',
          },
          reasonForPolicy: {
            element: 'select[name=\'PolicyAutoDataAutoBusinessType\']',
            value: bodyData.reasonForPolicy || staticDataObj.reasonForPolicy,
          },
          garagedAddress: {
            element: 'input[name=\'PolicyLocations2AddressLine1\']',
            value: staticDataObj.garagedAddress || '',
          },
          garagedZipcode: {
            element: 'input[name=\'PolicyLocations2ZipCode\']',
            value: staticDataObj.garagedZipcode || '',
          },
          garagedCity: {
            element: 'input[name=\'PolicyLocations2City\']',
            value: staticDataObj.garagedCity || '',
          },
          peopleInhouseHold1: {
            element: 'select[name=\'PolicyDriverCandidates2CandidateRelationship\']',
            value: staticDataObj.peopleInhouseHold1 || '',
          },
          peopleInhouseHold2: {
            element: 'select[name=\'PolicyDriverCandidates3CandidateRelationship\']',
            value: staticDataObj.peopleInhouseHold2 || '',
          },
          peopleInhouseHold3: {
            element: 'select[name=\'PolicyDriverCandidates4CandidateRelationship\']',
            value: staticDataObj.peopleInhouseHold3 || '',
          },
          peopleInhouseHold4: {
            element: 'select[name=\'PolicyDriverCandidates5CandidateRelationship\']',
            value: staticDataObj.peopleInhouseHold4 || '',
          },
          policyCurrentInsuranceValue: {
            element: 'select[name=\'PolicyCurrentInsuranceValue\']',
            value: staticDataObj.policyCurrentInsuranceValue || '',
          },
          policyDataResidenceType: {
            element: 'select[name=\'PolicyAutoDataResidenceType\']',
            value: staticDataObj.policyDataResidenceType || '',
          },
          policyDataPackageSelection: {
            element: 'select[name=\'PolicyAutoDataPackageSelection\']',
            value: staticDataObj.policyDataPackageSelection || '',
          },
        };

        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          for (const j in bodyData.drivers) {
            clientInputSelect[`driverFirstName${j}`] = {
              elementId: 'PolicyDriverPersonFirstName',
              element: 'input[name=\'PolicyDriverPersonFirstName\']',
              value: bodyData.drivers[j].firstName || staticDataObj.firstName,
            };
            clientInputSelect[`driverLastName${j}`] = {
              elementId: 'PolicyDriverPersonLastName',
              element: 'input[name=\'PolicyDriverPersonLastName\']',
              value: bodyData.drivers[j].lastName || staticDataObj.lastName,
            };
            clientInputSelect[`driverDateOfBirth${j}`] = {
              elementId: 'PolicyDriverPersonBirthdate',
              element: 'input[name="PolicyDriverPersonBirthdate"]',
              value: bodyData.drivers[j].applicantBirthDt || staticDataObj.dateOfBirth,
            };
            clientInputSelect[`driverGender${j}`] = {
              element: 'select[name=\'PolicyDriverPersonGender\']',
              value: bodyData.drivers[j].gender || staticDataObj.gender,
            };
            clientInputSelect[`driverMaritalStatus${j}`] = {
              element: 'select[name=\'PolicyDriverPersonMaritalStatus\']',
              value: bodyData.drivers[j].maritalStatus || staticDataObj.maritalStatus,
            };
            clientInputSelect[`driverRelationship${j}`] = {
              element: 'select[name=\'PolicyDriverRelationshipToInsured\']',
              value: bodyData.drivers[j].relationship || staticDataObj.relationship,
            };
            clientInputSelect[`licenseState${j}`] = {
              element: 'select[name=\'PolicyDriverLicenseState\']',
              value: staticDataObj.licenseState,
            };
            clientInputSelect[`ageWhen1stLicensed${j}`] = {
              element: 'input[name=\'PolicyDriverFirstAgeLicensed\']',
              value: bodyData.drivers[j].ageWhen1stLicensed || staticDataObj.ageWhen1stLicensed,
            };
            clientInputSelect[`commonOccupation${j}`] = {
              element: 'select[name=\'PolicyDriverPersonCommonOccupationCategory\']',
              value: bodyData.drivers[j].commonOccupation || staticDataObj.commonOccupation,
            };
            clientInputSelect[`education${j}`] = {
              element: 'select[name=\'PolicyDriverPersonEducation\']',
              value: bodyData.drivers[j].education || staticDataObj.education,
            };
          }
        }

        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          for (const j in bodyData.vehicles) {
            clientInputSelect[`garagedLocation${j}`] = {
              element: 'select[name=\'PolicyVehiclemp_GaragedLocation_ID\']',
              value: staticDataObj.garagedLocation || '',
            };
            clientInputSelect[`principalOperator${j}`] = {
              element: 'select[name=\'PolicyVehiclemp_PrincipalOperator_ID\']',
              value: staticDataObj.principalOperator || '',
            };
            clientInputSelect[`territory${j}`] = {
              element: 'select[name=\'PolicyVehicleTerritory\']',
              value: staticDataObj.territory || '',
            };
            clientInputSelect[`vehicleVin${j}`] = {
              element: 'input[name=\'PolicyVehicleVIN\']',
              value: bodyData.vehicles[j].vehicleVin || staticDataObj.vehicleVin,
            };
            clientInputSelect[`vehicleUse${j}`] = {
              element: 'select[name=\'PolicyVehicleUse\']',
              value: staticDataObj.vehicleUse || '',
            };
            clientInputSelect[`annualMiles${j}`] = {
              element: 'input[name=\'PolicyVehicleAnnualMiles\']',
              value: staticDataObj.annualMiles || '',
            };
            clientInputSelect[`yearsVehicleOwned${j}`] = {
              element: 'input[name=\'PolicyVehicleYearsVehicleOwned\']',
              value: staticDataObj.yearsVehicleOwned || '',
            };
            clientInputSelect[`policyVehiclesTrackStatus${j}`] = {
              element: `select[name='PolicyVehicles${parseInt(j) + 1}RightTrackStatus']`,
              value: staticDataObj.policyVehiclesTrackStatus || '',
            };
            clientInputSelect[`policyVehiclesCoverage${j}`] = {
              element: `select[name='PolicyVehicles${parseInt(j) + 1}CoverageCOMPLimitDed']`,
              value: staticDataObj.policyVehiclesCoverage || '',
            };
          }
        }
        return clientInputSelect;
      }

      console.log('Result :', JSON.stringify(bodyData.results));
      req.session.data = {
        title: bodyData.results.status === true ? 'Successfully retrieved safeco AL rate.' : 'Failed to retrieved safeco AL rate.',
        obj: bodyData.results,
        totalPremium: bodyData.results.response.totalPremium ? bodyData.results.response.totalPremium.replace(/,/g, '') : null,
        months:bodyData.results.response.plan ? bodyData.results.response.plan : null,
        downPayment:bodyData.results.response.downPaymentAmount ? bodyData.results.response.downPaymentAmount.replace(/,/g, '') : null,
      };
      if(bodyData.results.status){
        delete bodyData.results.response.totalPremium;
      }
      browser.close();
      return next();
    } catch (error) {
      console.log('Error  at Safeco AL :', error);
      return next(Boom.badRequest('Failed to retrieved safeco AL rate.'));
    }
  },
};
