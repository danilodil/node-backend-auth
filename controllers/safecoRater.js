/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { safecoAlRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/environment');
const { formatDate } = require('../lib/utils');


module.exports = {
  safecoAl: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;
      const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
      const params = req.body;
      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
      if (ENVIRONMENT.ENV === 'local') {
        browserParams = { headless: false };
      }
      const browser = await puppeteer.launch(browserParams);
      let page = await browser.newPage();

      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);

      let stepResult = {
        login: false,
        newQuote: false,
        existingQuote: false,
        policyInfo: false,
        garagedInfo: false,
        houseHold: false,
        vehicles: false,
        drivers: false,
        telemetics: false,
        underWriting: false,
        coverage: false,
        summary: false,
      };

      if (raterStore && raterStore.stepResult) {
        stepResult = raterStore.stepResult;
      }

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
        policyCurrentInsuranceValue: 'DW',
        policyDataResidenceType: 'H',
        policyDataPackageSelection: 'B',
        policyVehiclesTrackStatus: 'NP',
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
        vehicleVin: 'KMHDH6AE1DU001708',
        vehicleUse: '8',
        annualMiles: '50',
        yearsVehicleOwned: '5',
      };

      const populatedPolicyInfoObject = await populatePolicyInfoObject();
      const populatedDriverInfoObject = await populateDriverInfoObject();
      const populatedVehicleInfoObject = await populateVehicleInfoObject();
      const populatedUnderwritingObject = await populateUnderwritingObject();

      await loginStep();
      if (raterStore && raterStore.quoteId) {
        await existingQuote();
      } else {
        await newQuoteStep();
      }
      if (!params.stepName) {
        await policyInfoStep();
        await GaragedInfoStep();
        await houseHoldStep();
        await driversStep();
        await vehiclesStep();
        await finalSteps();
      } else {
        if (params.stepName === 'namedInsured') {
          await policyInfoStep();
          const quoteId = `${populatedDataObject.PolicyClientPersonLastName.value}, ${populatedDataObject.PolicyClientPersonFirstName.value}`;
          req.session.data = {
            title: 'Successfully finished Safeco AL Named Insured Step',
            status: true,
            quoteId: quoteId,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'garagedInfo' && raterStore) {
          await GaragedInfoStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedData.lastName.value}, ${populatedData.firstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL Garaged Info Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'houseHold' && raterStore) {
          await houseHoldStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedData.lastName.value}, ${populatedData.firstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL HouseHold Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'drivers' && raterStore) {
          await driversStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedData.lastName.value}, ${populatedData.firstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL Drivers Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'vehicles' && raterStore) {
          await vehiclesStep();
          if (params.sendSummary && params.sendSummary === 'true') {
            await finalSteps();
          } else {
            const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedData.lastName.value}, ${populatedData.firstName.value}`);
            req.session.data = {
              title: 'Successfully finished Safeco AL Vehicles Step',
              status: true,
              quoteId: quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        }
        if (params.stepName === 'summary' && raterStore) {
          await finalSteps();
        }
      }

      async function existingQuote() {
        console.log('Safeco AL existing Quote Step');
        try {
          await page.waitFor(3000);
          await page.goto(safecoAlRater.EXISTING_QUOTE_URL, { waitUntil: 'load' });
          await page.waitFor(4000);
          await page.select('#SAMSearchBusinessType', '7|1|');
          await page.select('#SAMSearchModifiedDateRange', '7');
          await page.select('#SAMSearchActivityStatus', '8');
          await page.type('#SAMSearchName', ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedDataObject.PolicyClientPersonLastName.value}, ${populatedDataObject.PolicyClientPersonFirstName.value}`));
          await page.evaluate(() => document.querySelector('#asearch').click());
          await page.waitFor(2000);
          await page.click('#divMain > table > tbody > tr > td > a > span');
          await page.waitFor(2000);
          await page.waitForSelector('#aedit');
          await page.evaluate(() => document.querySelector('#aedit').click());
          await page.waitFor(2000);
          if (await page.$('[id="btnUnlock"]')) {
            page.evaluate(() => document.querySelector('#btnUnlock').click());
          }
          await page.waitFor(2000);
          stepResult.existingQuote = true;
        } catch (err) {
          console.log('Error at Safeco AL Existing Quote Step:', err);
          stepResult.existingQuote = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at existing Quote Step',
            stepResult,
          };
          browser.close();
          return next();
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
          console.log('Safeco AL Login Step.');
          await page.goto(safecoAlRater.LOGIN_URL, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('#ctl00_ContentPlaceHolder1_UsernameTextBox');
          await page.type('#ctl00_ContentPlaceHolder1_UsernameTextBox', username);
          await page.type('#ctl00_ContentPlaceHolder1_PasswordTextBox', password);
          await page.evaluate(() => document.querySelector('#ctl00_ContentPlaceHolder1_SubmitButton').click());
          await page.waitForNavigation({ waitUntil: 'load' });
          stepResult.login = true;
        } catch (error) {
          console.log('Error at Safeco AL Login Step:', error);
          stepResult.login = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at loginStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function newQuoteStep() {
        try {
          console.log('Safeco AL New Quote Step.');
          await page.waitFor(2000);
          await page.goto(safecoAlRater.NEW_QUOTE_START_AUTO_URL, { waitUntil: 'domcontentloaded' });
          // await page.waitFor(3000);
          // await page.click('#header > div > div > div.rowcontainer.logo-search-bar-wrapper > div > div > div.col-xs-2.hidden-xs > div > div > div > a');
          // while (true) {
          //   await page.waitFor(1000);
          //   const pageQuote = await browser.pages();
          //   if (pageQuote.length > 2) {
          //     page = pageQuote[2];
          //     break;
          //   }
          // }
          // await page.goto(safecoAlRater.NEW_QUOTE_START_NEWBUSINESS, { waitUntil: 'domcontentloaded' });
          // await page.waitFor(3000);
          // await page.waitForSelector('#NextButton', { timeout: 120000 });
          // await page.evaluate(() => {
          //   const insuranceType = document.querySelector('#NextButton');
          //   insuranceType.click();
          // });
          stepResult.newQuote = true;
        } catch (err) {
          console.log('Error at Safeco AL New Quote Step:', err);
          stepResult.newQuote = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at newQuoteStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function policyInfoStep() {
        console.log('Safeco AL Policy Information Step.');
        try {
          await page.waitFor(3000);
          page.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i)
              console.log(`${msg.args()[i]}`);
          });
          await fillPageForm(populatedPolicyInfoObject, 'driver');
          await page.waitFor(2000);
          stepResult.policyInfo = true;
        } catch (err) {
          console.log('Error at Safeco AL Policy Information Step:', err);
          stepResult.policyInfo = false;
          let error = 'There is some error validations at policyInformationStep';
          try {
            const errorMessage = await page.evaluate(() => document.querySelector('#PolicyKickoutReasonSpan').innerText);
            if (errorMessage) {
              error = 'Unable to process due to site down.';
            }
          } catch (e) {
            console.log('Safeco AL Unable to process due to site down.');
          }
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: error,
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function GaragedInfoStep() {
        console.log('Safeco AL Garaged Info Step');
        try {
          await page.waitFor(800);
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'garagedlocation');
          });
          await page.waitFor(1000);
          await page.waitForSelector('#PolicyLocations2AddressLine1');
          await page.evaluate((garagedAddress) => { document.querySelector(garagedAddress.element).value = garagedAddress.value; }, populatedData.garagedAddress);

          await page.click(populatedData.garagedZipcode.element);
          await page.evaluate((garagedZipcode) => { document.querySelector(garagedZipcode.element).value = garagedZipcode.value; }, populatedData.garagedZipcode);

          await page.waitFor(1500);
          await page.evaluate((garagedCity) => {
            document.querySelector(garagedCity.element).value = garagedCity.value;
          }, populatedData.garagedCity);

          await page.waitFor(1500);
          await page.evaluate(() => document.querySelector('#Continue').click());
          stepResult.garagedInfo = true;
        } catch (err) {
          console.log('Error at Safeco AL Garaged Info:', err);
          stepResult.garagedInfo = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at GaragedInfoStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function houseHoldStep() {
        console.log('Safeco AL House Hold Step');
        try {
          await page.waitFor(2000);
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'driverandvehicleselection');
          });
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
                if (await page.$('[id="ui-dialog-title-1"]')) {
                  await page.evaluate(() => document.querySelector('#ui-dialog-title-1').click());
                }
              } catch (e) {
                console.log('Safeco AL Error during close dialog');
              }
              await page.waitFor(1000);
              await page.evaluate(() => document.querySelector('#Continue').click());
            } catch (e) {
              console.log('Safeco AL houseHold catch');
            }
          } catch (err) {
            console.log('Safeco AL houseHold catch');
            try {
              await page.evaluate(() => document.querySelector('#Continue').click());
            } catch (e) {
              console.log('Safeco AL next button not found');
            }
          }
          stepResult.houseHold = true;
        } catch (e) {
          console.log('Error at Safeco AL House Hold:', e);
          stepResult.houseHold = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at houseHoldStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function driversStep() {
        console.log('Safeco AL Drivers Step.');
        try {
          await page.waitFor(1000);
          try {
            await page.evaluate(() => {
              ecfields.noValidate(); __doPostBack('ScreenTabs1', 'driver');
            });
            await page.waitFor(10000);
          } catch (error) {
            console.log('Safeco Error Navigating To Driver Step: ', error);
          }
          await page.waitFor(3000);
          for (const j in bodyData.drivers) {
            try {
              if (await page.$('[id="ui-dialog-title-1"]')) {
                await page.evaluate(() => document.querySelector('#ui-dialog-title-1').click());
              }
            } catch (e) {
              console.log('Safeco AL Error during close dialog');
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
            await page.evaluate((ageWhen1stLicensed) => {
              (document.querySelector(ageWhen1stLicensed.element)).value = ageWhen1stLicensed.value;
            }, populatedData[`ageWhen1stLicensed${j}`]);

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

            if (j < bodyData.drivers.length - 1) {
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
              if (await page.$('[id="ui-dialog-title-1"]')) {
                await page.evaluate(() => document.querySelector('#ui-dialog-title-1').click());
              }
            } catch (e) {
              console.log('Safeco AL Error during close dialog');
            }
          } catch (e) {
            console.log('Safeco AL Move to vehicles');
          }
          stepResult.drivers = true;
        } catch (err) {
          console.log('Error at Safeco AL Driver Step:', err.stack);
          stepResult.drivers = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at driverStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function vehiclesStep() {
        console.log('Safeco AL Vehicles Step.');
        try {
          await page.waitFor(2000);
          await page.evaluate(() => {
            ecfields.noValidate(); __doPostBack('ScreenTabs1', 'vehicle');
          });
          await page.waitFor(600);
          for (const j in bodyData.vehicles) {
            await page.waitForSelector('#PolicyVehiclemp_GaragedLocation_ID');
            await page.select(populatedData[`garagedLocation${j}`].element, populatedData[`garagedLocation${j}`].value);

            await page.select(populatedData[`principalOperator${j}`].element, populatedData[`principalOperator${j}`].value);

            await page.evaluate(() => {
              const vehicleVinIsKnown = document.querySelector('td > span > input[id="PolicyVehicleVINKnownYNY"]');
              vehicleVinIsKnown.click();
            });
            await page.waitFor(1000);
            await page.evaluate((vehicleVin) => {
              (document.querySelector(vehicleVin.element)).value = vehicleVin.value;
            }, populatedData[`vehicleVin${j}`]);
            await page.waitFor(1000);
            if (await page.$('[id="PolicyVehicleTerritory"]')) {
              await page.evaluate((territory) => {
                (document.querySelector(territory.element)).value = territory.value;
              }, populatedData[`territory${j}`]);
            }
            await page.select(populatedData[`vehicleUse${j}`].element, populatedData[`vehicleUse${j}`].value);
            await page.waitForSelector('#PolicyVehicleAnnualMiles');
            await page.focus('#PolicyVehicleAnnualMiles');
            await page.evaluate((annualMiles) => {
              (document.querySelector(annualMiles.element)).value = annualMiles.value;
            }, populatedData[`annualMiles${j}`]);
            await page.evaluate(() => document.querySelector('#Save').click());
            await page.waitFor(3000);

            if (await page.$('[id="PolicyVehicleYearsVehicleOwned"]')) {
              await page.evaluate((yearsVehicleOwned) => {
                (document.querySelector(yearsVehicleOwned.element)).value = yearsVehicleOwned.value;
              }, populatedData[`yearsVehicleOwned${j}`]);
            }

            if (j < bodyData.vehicles.length - 1) {
              const addElement = await page.$('[id="btnAddVehicle2"]');
              await addElement.click();
              await page.waitFor(2000);
            }
          }
          await page.waitFor(1000);
          await page.evaluate(() => document.querySelector('#Continue').click());
          stepResult.vehicles = true;
        } catch (err) {
          console.log('Error at Safeco AL Vehicles Step:', err.stack);
          stepResult.vehicles = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at vehiclesStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function telemeticsStep() {
        console.log('Safeco AL Telemetics Step.');
        try {
          await page.waitFor(2000);
          for (const j in bodyData.vehicles) {
            await page.waitForSelector(`#PolicyVehicles${parseInt(j) + 1}RightTrackStatus`);
            await page.select(populatedData[`policyVehiclesTrackStatus${j}`].element, populatedData[`policyVehiclesTrackStatus${j}`].value);
          }
          await page.waitFor(1000);
          await page.evaluate(() => document.querySelector('#Continue').click());
          stepResult.telemetics = true;
        } catch (err) {
          console.log('err telemetics:', err);
          stepResult.telemetics = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at telemeticsStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function underwritingStep() {
        console.log('Safeco AL Underwriting Step.');
        try {
          await page.waitFor(2000);
          await page.waitForSelector('#PolicyCurrentInsuranceValue');
          await page.select(populatedData.policyCurrentInsuranceValue.element, populatedData.policyCurrentInsuranceValue.value);
          await page.waitForSelector('#PolicyAutoDataResidenceType');
          await page.select(populatedData.policyDataResidenceType.element, populatedData.policyDataResidenceType.value);
          await page.evaluate(() => document.querySelector('#Continue').click());
          await page.waitFor(1000);
          stepResult.underWriting = true;
        } catch (err) {
          console.log('Error at Safeco AL Underwriting Step:', err);
          stepResult.underWriting = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at underwritingStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function coveragesStep() {
        console.log('Safeco AL Coverages Step.');
        try {
          await page.waitFor(2000);
          await page.waitForSelector('#PolicyAutoDataPackageSelection');
          await page.select(populatedData.policyDataPackageSelection.element, populatedData.policyDataPackageSelection.value);

          for (const j in bodyData.vehicles) {
            await page.waitForSelector(`#PolicyVehicles${parseInt(j) + 1}CoverageCOMPLimitDed`);
            await page.select(populatedData[`policyVehiclesCoverage${j}`].element, populatedData[`policyVehiclesCoverage${j}`].value);
          }
          await page.evaluate(() => document.querySelector('#Continue').click());
          stepResult.coverage = true;
        } catch (err) {
          console.log('Error at Safeco AL Coverages Step:', err);
          stepResult.coverage = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at coveragesStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function summaryStep() {
        console.log('Safeco AL Summary Step.');
        try {
          await page.waitFor(2000);
          await page.waitForSelector('#PolicyPremiumTotalWithPIFLabel');
          const premiumDetails = await page.evaluate(() => {
            const downPaymentsObj = {};
            downPaymentsObj.paidInFullPremium = document.querySelector('#PolicyPremiumTotalWithPIFSpan').innerText.replace(/\$/g, '');
            downPaymentsObj.preferredPaymentMethodPremium = document.querySelector('#PolicyPreferredPaymentMethodPremiumSpan').innerText.replace(/\$/g, '');
            downPaymentsObj.totalPremium = document.querySelector('#PolicyPremiumTotalSpan').innerText.replace(/\$/g, '');
            return downPaymentsObj;
          });
          stepResult.summary = true;
          req.session.data = {
            title: 'Successfully retrieved safeco AL rate.',
            status: true,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
            stepResult,
          };
          browser.close();
          return next();
        } catch (err) {
          console.log('Error at Safeco AL Summary Step:', err);
          stepResult.summary = false;
          req.session.data = {
            title: 'Failed to retrieved Safeco AL rate.',
            status: false,
            error: 'There is some error validations at summaryStep',
            stepResult,
          };
          browser.close();
          return next();
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

      // nextStep can be 'policyinfo', 'vehicle', 'driver', 'telematics', 'underwriting' 'coverages', 'summary'
      async function fillPageForm(pData, nextStep)  {
        await page.evaluate(async (data, nextStep) => {
          if (ecfields) {
            ecfields.clearErrors();
          }
          if (ecfields.buildModalErr) {
            ecfields.buildModalErr = function() {};
          }
          if (ecfields.buildModalHtml) {
            ecfields.buildModalHtml = function() {};
          }
          function compareTwoStrings(first, second) {
            first = first.replace(/\s+/g, '')
            second = second.replace(/\s+/g, '')
          
            if (!first.length && !second.length) return 1;                   // if both are empty strings
            if (!first.length || !second.length) return 0;                   // if only one is empty string
            if (first === second) return 1;       							 // identical
            if (first.length === 1 && second.length === 1) return 0;         // both are 1-letter strings
            if (first.length < 2 || second.length < 2) return 0;			 // if either is a 1-letter string
          
            let firstBigrams = new Map();
            for (let i = 0; i < first.length - 1; i++) {
              const bigram = first.substring(i, i + 2);
              const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram) + 1
                : 1;
          
              firstBigrams.set(bigram, count);
            };
          
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
              const currentRating = compareTwoStrings(mainString, currentTargetString)
              ratings.push({target: currentTargetString, rating: currentRating})
              if (currentRating > ratings[bestMatchIndex].rating) {
                bestMatchIndex = i
              }
            }
            
            
            const bestMatch = ratings[bestMatchIndex]
            
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
              const nArr = optionsArray.map(entry => entry.text);
              const vArr = optionsArray.map(entry => entry.value);
              if (value && value.length && value.length > 0 && value.length < 2) {
                if (vArr.indexOf(value) !== -1) {
                  return value;
                }
              } else if (value && value.length > 1) {
                const nBestMatch = await findBestMatch(value, nArr);
                const vBestMatch = await findBestMatch(value, vArr);
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
            } catch(error) {
              console.log(`Error: ${error}`);
            }
          }
          let list = data;
          for (let fieldName in list)   {
            const ecField = list[fieldName] ? list[fieldName] : null;
            const xField = data[fieldName] ? data[fieldName] : null;
            if (ecField) {
              ecField.required = false;
              ecField.rules = [];
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
                  el.checked = (xField.value && xField.value === true) ? true : false;
                }
              }
            }
          }
          ecfields.noValidate(); 
          __doPostBack('ScreenTabs1',nextStep);
        }, pData, nextStep);
      }

      function populatePolicyInfoObject() {
        const policyInfoData = {
          PolicyAutoDataAnyIncidentsOnPolicyYNN: {type: "radio", value: true, name: "PolicyAutoDataAnyIncidentsOnPolicyYNN"},
          PolicyAutoDataDeliveryVehicleYNN: {type: "radio", value: true, name: "PolicyAutoDataDeliveryVehicleYNN"},
          PolicyAutoDataVehicleGaragingAddressYNY: {type: "radio", value: true, name: "PolicyAutoDataVehicleGaragingAddressYNY"},
          PolicyAutoDataVerifiableYNN: {type: "radio", value: true, name: "PolicyAutoDataVerifiableYNN"},
          PolicyAutoDataAutoBusinessType: {type: "select-one", value: "N", name: "PolicyAutoDataAutoBusinessType"},
          PolicyClientEmailAddress: {type: "text", value: bodyData.email || staticDataObj.email, name: "PolicyClientEmailAddress"},
          PolicyClientMailingLocationAddressLine1: {type: "text", value: bodyData.mailingAddress || staticDataObj.mailingAddress, name: "PolicyClientMailingLocationAddressLine1"},
          // PolicyClientMailingLocationAddressLine2: {type: "text", value: "", name: "PolicyClientMailingLocationAddressLine2"},
          PolicyClientMailingLocationCity: {type: "text", value: bodyData.city || staticDataObj.city, name: "PolicyClientMailingLocationCity"},
          PolicyClientMailingLocationState: {type: "select-one", value: bodyData.state || staticDataObj.state, name: "PolicyClientMailingLocationState"},
          PolicyClientMailingLocationZipCode: {type: "text", value: bodyData.zipCode || staticDataObj.zipCode, name: "PolicyClientMailingLocationZipCode"},
          PolicyClientPersonBirthdate: {type: "text", value: bodyData.birthDate || staticDataObj.birthDate, name: "PolicyClientPersonBirthdate"},
          PolicyClientPersonFirstName: {type: "text", value: bodyData.firstName || staticDataObj.firstName, name: "PolicyClientPersonFirstName"},
          PolicyClientPersonLastName: {type: "text", value: bodyData.lastName || staticDataObj.lastName, name: "PolicyClientPersonLastName"},
          PolicyClientPersonSocialSecurityNumberStatus: {type: "select-one", value: "R", name: "PolicyClientPersonSocialSecurityNumberStatus"},
          PolicyEffectiveDate: {type: "text", value: tomorrow, name: "PolicyEffectiveDate"},
          PolicyRatingState: {type: "select-one", value: "1", name: "PolicyRatingState"},
          // PolicyClientMailingLocationOverrideUSPSAddressEditYN: {type: "checkbox", value: "", name: "PolicyClientMailingLocationOverrideUSPSAddressEditYN"},
          // PolicyInternationalTravelerYN: {type: "checkbox", value: "", name: "PolicyInternationalTravelerYN"},
          // PolicyLaunchAKTruePricingPOAUserYN: {type: "select-one", value: "", name: "PolicyLaunchAKTruePricingPOAUserYN"},
          // PolicyLaunchPriceMatchUserYN: {type: "select-one", value: "", name: "PolicyLaunchPriceMatchUserYN"},
          // PolicyLaunchSpecialtyLowTouchLaunchValues: {type: "select-one", value: "", name: "PolicyLaunchSpecialtyLowTouchLaunchValues"},
          // PolicyOfferCode: {type: "text", value: "", name: "PolicyOfferCode"},
          // PolicyQuoteDate: {type: "text", value: "", name: "PolicyQuoteDate"},
          // PolicyAutoDataAccidentFreeDate: {type: "text", value: "", name: "PolicyAutoDataAccidentFreeDate"},
          // PolicyDescriptiveName: {type: "text", value: "", name: "PolicyDescriptiveName"},
          // PolicyClientAgentCustomerID: {type: "text", value: "", name: "PolicyClientAgentCustomerID"},
          // PolicyAutoDataDriverAffidavitMsgYN: {type: "text", value: "", name: "PolicyAutoDataDriverAffidavitMsgYN"},
          // PolicyAutoDataLongevityCrDate: {type: "text", value: "", name: "PolicyAutoDataLongevityCrDate"},
          // PolicyAutoDataMultipleCarDiscYN: {type: "checkbox", value: "", name: "PolicyAutoDataMultipleCarDiscYN"},
          // PolicyAutoDataNamedNonOwnerYN: {type: "checkbox", value: "", name: "PolicyAutoDataNamedNonOwnerYN"},
          // PolicyAutoDataRewindRetiredMessageDisplayedYN: {type: "text", value: "", name: "PolicyAutoDataRewindRetiredMessageDisplayedYN"},
          // PolicyAutoDataSNAP3StateYN: {type: "hidden", value: "", name: "PolicyAutoDataSNAP3StateYN"},
          // PolicyBookTransferID: {type: "text", value: "", name: "PolicyBookTransferID"},
          // PolicyAcordClientAppName: {type: "hidden", value: "", name: "PolicyAcordClientAppName"},
          // PolicyDiscountText: {type: "hidden", value: "", name: "PolicyDiscountText"},
          // PolicyAcordClientAppOrg: {type: "hidden", value: "", name: "PolicyAcordClientAppOrg"},
          // PolicyInternationalRVHiddenValue: {type: "hidden", value: "", name: "PolicyInternationalRVHiddenValue"},
          // PolicyAgencyEmailAddress: {type: "hidden", value: "", name: "PolicyAgencyEmailAddress"},
          // PolicyAgencyPhoneNumber: {type: "hidden", value: "", name: "PolicyAgencyPhoneNumber"},
          // PolicyAgentNumber: {type: "select-one", value: "", name: "PolicyAgentNumber"},
          // PolicyAutoDataCaliforniaAutoNewDiscountsYN: {type: "hidden", value: "", name: "PolicyAutoDataCaliforniaAutoNewDiscountsYN"},
          // PolicyAutoDataSNAP3MultipleVersionStateYN: {type: "hidden", value: "", name: "PolicyAutoDataSNAP3MultipleVersionStateYN"},
          // PolicyOriginSource: {type: "hidden", value: "", name: "PolicyOriginSource"},
          // PolicyOriginalQuoteDate: {type: "text", value: "", name: "PolicyOriginalQuoteDate"},
          // PolicyProducerName: {type: "text", value: "", name: "PolicyProducerName"},
          // PolicyQuoteEntryID: {type: "text", value: "", name: "PolicyQuoteEntryID"},
          // PolicyAutoDatarPolicyNumberChildren: {type: "hidden", value: "", name: "PolicyAutoDatarPolicyNumberChildren"},
          // PolicyRewriteCustomerSinceDate: {type: "hidden", value: "", name: "PolicyRewriteCustomerSinceDate"},
          // PolicySourceDataSplitCountLOB: {type: "hidden", value: "", name: "PolicySourceDataSplitCountLOB"},
          // PolicyAutoDatarPolicyNumberMarried: {type: "hidden", value: "", name: "PolicyAutoDatarPolicyNumberMarried"},
          // PolicyClientPersonMiddleName: {type: "text", value: "", name: "PolicyClientPersonMiddleName"},
        }
        return policyInfoData;
      }
      function populateUnderwritingObject() {
        const underwritingInfoData = {
          PolicyAutoDataPrevBILimit: {type: "select-one", value: "", name: "PolicyAutoDataPrevBILimit"},
          PolicyAutoDataPrevCSLLimit: {type: "select-one", value: "", name: "PolicyAutoDataPrevCSLLimit"},
          PolicyAutoDataPrevLiabilityType: {type: "select-one", value: "", name: "PolicyAutoDataPrevLiabilityType"},
          PolicyAutoDataPriorAutoPolicyExpirationDate: {type: "text", value: "", name: "PolicyAutoDataPriorAutoPolicyExpirationDate"},
          PolicyAutoDataResidenceType: {type: "select-one", value: "", name: "PolicyAutoDataResidenceType"},
          PolicyAutoDataResidenceTypeOtherDesc: {type: "text", value: "", name: "PolicyAutoDataResidenceTypeOtherDesc"},
          PolicyCurrentInsuranceValue: {type: "select-one", value: "", name: "PolicyCurrentInsuranceValue"},
          PolicyPrevInsuranceCarrier: {type: "text", value: "", name: "PolicyPrevInsuranceCarrier"},
          PolicyPrevInsuranceCarrierValue: {type: "select-one", value: "", name: "PolicyPrevInsuranceCarrierValue"},
          PolicyPriorPolicyDuration: {type: "text", value: "", name: "PolicyPriorPolicyDuration"},
          // PolicyAutoDataAutoBusinessType: {type: "hidden", value: "", name: "PolicyAutoDataAutoBusinessType"},
          // PolicyAutoDataSNAP3StateYN: {type: "hidden", value: "", name: "PolicyAutoDataSNAP3StateYN"},
          // PolicyBTSFCallStatus: {type: "hidden", value: "", name: "PolicyBTSFCallStatus"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoCurrentInsuranceValue: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoCurrentInsuranceValue"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevBILimit: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevBILimit"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevCSLLimit: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevCSLLimit"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevInsuranceCarrier: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevInsuranceCarrier"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevInsuranceCarrierValue: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevInsuranceCarrierValue"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevLiabilityType: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoPrevLiabilityType"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoPriorAutoPolicyExpirationDate: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoPriorAutoPolicyExpirationDate"},
          // PolicyCLUECCAgentEnteredCurrentCarrierInfoPriorPolicyDuration: {type: "hidden", value: "", name: "PolicyCLUECCAgentEnteredCurrentCarrierInfoPriorPolicyDuration"},
          // PolicyCLUECCReportResultsCCAgentOverrideYN: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCCAgentOverrideYN"},
          // PolicyCLUECCReportResultsCCOrderResult: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCCOrderResult"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoCurrentInsuranceValue: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoCurrentInsuranceValue"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoPrevBILimit: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoPrevBILimit"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoPrevCSLLimit: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoPrevCSLLimit"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoPrevInsuranceCarrier: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoPrevInsuranceCarrier"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoPrevInsuranceCarrierValue: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoPrevInsuranceCarrierValue"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoPrevLiabilityType: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoPrevLiabilityType"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoPriorAutoPolicyExpirationDate: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoPriorAutoPolicyExpirationDate"},
          // PolicyCLUECCReportResultsCurrentCarrierInfoPriorPolicyDuration: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsCurrentCarrierInfoPriorPolicyDuration"},
          // PolicyCLUECCReportResultsReconciliationAction: {type: "hidden", value: "", name: "PolicyCLUECCReportResultsReconciliationAction"},
          // PolicyCLUEReportID: {type: "hidden", value: "", name: "PolicyCLUEReportID"},
          // PolicyClientNameLine1: {type: "hidden", value: "", name: "PolicyClientNameLine1"},
          // PolicyClientNameLine2: {type: "hidden", value: "", name: "PolicyClientNameLine2"},
          // PolicyDiscountText: {type: "hidden", value: "", name: "PolicyDiscountText"},
          // PolicyDrivers1DriverType: {type: "hidden", value: "", name: "PolicyDrivers1DriverType"},
          // PolicyInternationalTravelerYN: {type: "hidden", value: "", name: "PolicyInternationalTravelerYN"},
          // PolicyRatingState: {type: "hidden", value: "", name: "PolicyRatingState"},
          // PolicyXrefPolicies1PolicyNumber: {type: "text", value: "", name: "PolicyXrefPolicies1PolicyNumber"},
          // PolicyXrefPolicies1PolicyType: {type: "select-one", value: "", name: "PolicyXrefPolicies1PolicyType"},
          // PolicyXrefPolicies2PolicyNumber: {type: "text", value: "", name: "PolicyXrefPolicies2PolicyNumber"},
          // PolicyXrefPolicies2PolicyType: {type: "select-one", value: "", name: "PolicyXrefPolicies2PolicyType"},
          // PolicyXrefPolicies3PolicyNumber: {type: "text", value: "", name: "PolicyXrefPolicies3PolicyNumber"},
          // PolicyXrefPolicies3PolicyType: {type: "select-one", value: "", name: "PolicyXrefPolicies3PolicyType"},
          // PolicyXrefPolicies4PolicyNumber: {type: "text", value: "", name: "PolicyXrefPolicies4PolicyNumber"},
          // PolicyXrefPolicies4PolicyType: {type: "select-one", value: "", name: "PolicyXrefPolicies4PolicyType"},
        }
        return underwritingInfoData;
      }

      function populateDriverInfoObject() {
        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          const driversInfoData = [];
          for (const j in bodyData.drivers) {
            const driverInfoData = {
              PolicyDriverPersonFirstName: {type: "text", value: "", name: "PolicyDriverPersonFirstName"},
              PolicyDriverPersonLastName: {type: "text", value: "", name: "PolicyDriverPersonLastName"},
              PolicyDriverPersonEducation: {type: "select-one", value: "", name: "PolicyDriverPersonEducation"},
              PolicyDriverPersonGender: {type: "select-one", value: "", name: "PolicyDriverPersonGender"},
              PolicyDriverPersonBirthdate: {type: "text", value: "", name: "PolicyDriverPersonBirthdate"},
              PolicyDriverPersonMaritalStatus: {type: "select-one", value: "", name: "PolicyDriverPersonMaritalStatus"},
              PolicyDriverPersonSocialSecurityNumberStatus: {type: "select-one", value: "", name: "PolicyDriverPersonSocialSecurityNumberStatus"},
              PolicyDriverRelationshipToInsured: {type: "select-one", value: "", name: "PolicyDriverRelationshipToInsured"},
              PolicyDriverLicenseState: {type: "select-one", value: "", name: "PolicyDriverLicenseState"},
              PolicyDriverLicenseSuspendedRevokedYNN: {type: "radio", value: false, name: "PolicyDriverLicenseSuspendedRevokedYNN"},
              PolicyDriverPersonBusinessTypeCategory: {type: "select-one", value: "", name: "PolicyDriverPersonBusinessTypeCategory"},
              PolicyDriverPersonCommonOccupationCategory: {type: "select-one", value: "", name: "PolicyDriverPersonCommonOccupationCategory"},
              PolicyDriverPersonOccupationCategory: {type: "select-one", value: "", name: "PolicyDriverPersonOccupationCategory"},
              PolicyDriverSR22FilingYNN: {type: "radio", value: false, name: "PolicyDriverSR22FilingYNN"},
              PolicyDriverSR22FilingYN2N: {type: "radio", value: false, name: "PolicyDriverSR22FilingYN2N"},
              PolicyDriverFirstAgeLicensed: {type: "text", value: "", name: "PolicyDriverFirstAgeLicensed"},
              // PolicyAutoDataCaliforniaAutoNewDiscountsYN: {type: "hidden", value: "", name: "PolicyAutoDataCaliforniaAutoNewDiscountsYN"},
              // PolicyAutoDataNamedNonOwnerYN: {type: "hidden", value: "", name: "PolicyAutoDataNamedNonOwnerYN"},
              // PolicyAutoDataSNAP3StateYN: {type: "hidden", value: "", name: "PolicyAutoDataSNAP3StateYN"},
              // PolicyClientAgentCustomerID: {type: "hidden", value: "", name: "PolicyClientAgentCustomerID"},
              // PolicyDriverAccidentPrevCourseDate: {type: "text", value: "", name: "PolicyDriverAccidentPrevCourseDate"},
              // PolicyDriverDistantStudentDiscYN: {type: "checkbox", value: "", name: "PolicyDriverDistantStudentDiscYN"},
              // PolicyDriverDriverTrainingCrYN: {type: "checkbox", value: "", name: "PolicyDriverDriverTrainingCrYN"},
              // PolicyDriverDriverType: {type: "select-one", value: "", name: "PolicyDriverDriverType"},
              // PolicyDriverDriverTypeReason: {type: "select-one", value: "", name: "PolicyDriverDriverTypeReason"},
              // PolicyDriverGoodStudentDiscYN: {type: "checkbox", value: "", name: "PolicyDriverGoodStudentDiscYN"},
              // PolicyDriverLicenseNumberOtherOverrideYN: {type: "checkbox", value: "", name: "PolicyDriverLicenseNumberOtherOverrideYN"},
              // PolicyDriverMADriverTrainingInd: {type: "hidden", value: "", name: "PolicyDriverMADriverTrainingInd"},
              // PolicyDriverPersonBirthdateFromVendorYN: {type: "text", value: "", name: "PolicyDriverPersonBirthdateFromVendorYN"},
              // PolicyDriverPersonMiddleName: {type: "text", value: "", name: "PolicyDriverPersonMiddleName"},
              // PolicyDriverSR22FilingCaseNumber: {type: "text", value: "", name: "PolicyDriverSR22FilingCaseNumber"},
              // PolicyDriverSR22FilingCaseNumber2: {type: "text", value: "", name: "PolicyDriverSR22FilingCaseNumber2"},
              // PolicyDriverSR22FilingDate: {type: "text", value: "", name: "PolicyDriverSR22FilingDate"},
              // PolicyDriverSR22FilingDate2: {type: "text", value: "", name: "PolicyDriverSR22FilingDate2"},
              // PolicyDriverSR22FilingEndDate: {type: "text", value: "", name: "PolicyDriverSR22FilingEndDate"},
              // PolicyDriverSR22FilingEndDate2: {type: "text", value: "", name: "PolicyDriverSR22FilingEndDate2"},
              // PolicyDriverSR22FilingState: {type: "select-one", value: "", name: "PolicyDriverSR22FilingState"},
              // PolicyDriverSR22FilingState2: {type: "select-one", value: "", name: "PolicyDriverSR22FilingState2"},
              // PolicyEffectiveDate: {type: "hidden", value: "", name: "PolicyEffectiveDate"},
              // PolicyFiveByteReasonCodeYN: {type: "hidden", value: "", name: "PolicyFiveByteReasonCodeYN"},
              // PolicyInternationalTravelerYN: {type: "hidden", value: "", name: "PolicyInternationalTravelerYN"},
              // PolicyLaunchPriceMatchUserYN: {type: "hidden", value: "", name: "PolicyLaunchPriceMatchUserYN"},
              // PolicyProducerName: {type: "hidden", value: "", name: "PolicyProducerName"},
              // PolicyQuoteDate: {type: "hidden", value: "", name: "PolicyQuoteDate"},
              // PolicySourceDataTransitionSignal: {type: "hidden", value: "", name: "PolicySourceDataTransitionSignal"},
              // PolicyTermBeginDate: {type: "hidden", value: "", name: "PolicyTermBeginDate"},
              // PolicyscrSNAPVersion: {type: "hidden", value: "", name: "PolicyscrSNAPVersion"}
            }
            driversInfoData.push(driverInfoData);
          }
        }
        return driversInfoData;
      }

      function populateVehicleInfoObject() {
        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          const vehiclesInfoData = [];
          for (const j in bodyData.vehicles) {
            const vehicleInfoData = {
              PolicyVehicleVINKnownYNY: {type: "radio", value: true, name: "PolicyVehicleVINKnownYNY"},
              PolicyVehicleVIN: {type: "text", value: "", name: "PolicyVehicleVIN"},
              PolicyVehicleAnnualMiles: {type: "text", value: "", name: "PolicyVehicleAnnualMiles"},
              PolicyVehicleYearsVehicleOwned: {type: "text", value: "", name: "PolicyVehicleYearsVehicleOwned"},
              PolicyVehicleUse: {type: "select-one", value: "", name: "PolicyVehicleUse"},
              PolicyVehicleMake: {type: "select-one", value: "", name: "PolicyVehicleMake"},
              PolicyVehicleModel: {type: "text", value: "", name: "PolicyVehicleModel"},
              PolicyVehicleModelYear: {type: "text", value: "", name: "PolicyVehicleModelYear"},
              PolicyVehicleBodystyle: {type: "select-one", value: "", name: "PolicyVehicleBodystyle"},
              PolicyVehicleCostNew: {type: "text", value: "", name: "PolicyVehicleCostNew"},
              PolicyVehicles1RightTrackStatus: {type: "select-one", value: "", name: "PolicyVehicles1RightTrackStatus"},
              // PolicyAgencyState: {type: "hidden", value: "", name: "PolicyAgencyState"},
              // PolicyAgentLowMileageEligibleYN: {type: "hidden", value: "", name: "PolicyAgentLowMileageEligibleYN"},
              // PolicyAgentNumber: {type: "hidden", value: "", name: "PolicyAgentNumber"},
              // PolicyAutoDataGaragingIBSZipMismatchEditFiredYN: {type: "hidden", value: "", name: "PolicyAutoDataGaragingIBSZipMismatchEditFiredYN"},
              // PolicyAutoDataNYInsScoreEditFiredYN: {type: "hidden", value: "", name: "PolicyAutoDataNYInsScoreEditFiredYN"},
              // PolicyAutoDataNewAutoContractStateYN: {type: "hidden", value: "", name: "PolicyAutoDataNewAutoContractStateYN"},
              // PolicyAutoDataSNAP2StateYN: {type: "hidden", value: "", name: "PolicyAutoDataSNAP2StateYN"},
              // PolicyAutoDataSNAP3StateYN: {type: "hidden", value: "", name: "PolicyAutoDataSNAP3StateYN"},
              // PolicyEffectiveDate: {type: "hidden", value: "", name: "PolicyEffectiveDate"},
              // PolicyOriginSource: {type: "hidden", value: "", name: "PolicyOriginSource"},
              // PolicyQuoteDate: {type: "hidden", value: "", name: "PolicyQuoteDate"},
              // PolicyRatingState: {type: "hidden", value: "", name: "PolicyRatingState"},
              // PolicyTermBeginDate: {type: "hidden", value: "", name: "PolicyTermBeginDate"},
              // PolicyVehicleAntiTheftCrType: {type: "select-one", value: "", name: "PolicyVehicleAntiTheftCrType"},
              // PolicyVehicleAntilockBrakingDiscYN: {type: "checkbox", value: "", name: "PolicyVehicleAntilockBrakingDiscYN"},
              // PolicyVehicleAntiqueClassicIndicator: {type: "select-one", value: "", name: "PolicyVehicleAntiqueClassicIndicator"},
              // PolicyVehicleCorporateOwnedYN: {type: "checkbox", value: "", name: "PolicyVehicleCorporateOwnedYN"},
              // PolicyVehicleDaysPerWeekDrivenToWorkSchool: {type: "select-one", value: "", name: "PolicyVehicleDaysPerWeekDrivenToWorkSchool"},
              // PolicyVehicleLowMileageYN: {type: "checkbox", value: "", name: "PolicyVehicleLowMileageYN"},
              // PolicyVehicleMilesOneWayToWorkSchool: {type: "text", value: "", name: "PolicyVehicleMilesOneWayToWorkSchool"},
              // PolicyVehicleNumberOfCylinders: {type: "select-one", value: "", name: "PolicyVehicleNumberOfCylinders"},
              // PolicyVehicleNumberOfDoors: {type: "select-one", value: "", name: "PolicyVehicleNumberOfDoors"},
              // PolicyVehiclePassiveRestraintDiscType: {type: "select-one", value: "", name: "PolicyVehiclePassiveRestraintDiscType"},
              // PolicyVehiclePerformanceVehicleType: {type: "select-one", value: "", name: "PolicyVehiclePerformanceVehicleType"},
              // PolicyVehiclePolkBodystyle: {type: "hidden", value: "", name: "PolicyVehiclePolkBodystyle"},
              // PolicyVehiclePolkMake: {type: "hidden", value: "", name: "PolicyVehiclePolkMake"},
              // PolicyVehiclePolkModel: {type: "hidden", value: "", name: "PolicyVehiclePolkModel"},
              // PolicyVehiclePolkVINPrefix: {type: "hidden", value: "", name: "PolicyVehiclePolkVINPrefix"},
              // PolicyVehiclePolkVISReturnCode: {type: "hidden", value: "", name: "PolicyVehiclePolkVISReturnCode"},
              // PolicyVehicleRecVehicleAvgValue: {type: "hidden", value: "", name: "PolicyVehicleRecVehicleAvgValue"},
              // PolicyVehicleSettlementOption: {type: "select-one", value: "", name: "PolicyVehicleSettlementOption"},
              // PolicyVehicleSymbol: {type: "text", value: "", name: "PolicyVehicleSymbol"},
              // PolicyVehicleTelematicsEligibilityIndicator: {type: "text", value: "", name: "PolicyVehicleTelematicsEligibilityIndicator"},
              // PolicyVehicleValidationAttemptedYN: {type: "hidden", value: "", name: "PolicyVehicleValidationAttemptedYN"},
              // PolicyVehiclemp_GaragedLocation_ID: {type: "select-one", value: "", name: "PolicyVehiclemp_GaragedLocation_ID"},
              // PolicyVehiclemp_PrincipalOperator_ID: {type: "select-one", value: "", name: "PolicyVehiclemp_PrincipalOperator_ID"}
            }
            vehiclesInfoData.push(vehicleInfoData);
          }
        }
        return vehiclesInfoData;
      }
      function populateKeyValueData() {
        const clientInputSelect = {
          // firstName: {
          //   element: 'input[name=\'PolicyClientPersonFirstName\']',
          //   value: bodyData.firstName || staticDataObj.firstName,
          // },
          // lastName: {
          //   element: 'input[name=\'PolicyClientPersonLastName\']',
          //   value: bodyData.lastName || staticDataObj.lastName,
          // },
          // socialSecurityStatus: {
          //   element: 'select[name=\'PolicyClientPersonSocialSecurityNumberStatus\']',
          //   value: bodyData.socialSecurityStatus || staticDataObj.socialSecurityStatus,
          // },
          // dateOfBirth: {
          //   element: 'input[name=\'PolicyClientPersonBirthdate\']',
          //   value: bodyData.birthDate || staticDataObj.birthDate,
          // },
          // email: {
          //   element: 'input[name=\'PolicyClientEmailAddress\']',
          //   value: bodyData.email || staticDataObj.email,
          // },
          // mailingAddress: {
          //   element: 'input[name=\'PolicyClientMailingLocationAddressLine1\']',
          //   value: bodyData.mailingAddress || staticDataObj.mailingAddress,
          // },
          // zipCode: {
          //   element: 'input[name=\'PolicyClientMailingLocationZipCode\']',
          //   value: bodyData.zipCode || staticDataObj.zipCode,
          // },
          // city: {
          //   element: 'input[name=\'PolicyClientMailingLocationCity\']',
          //   value: bodyData.city || staticDataObj.city,
          // },
          // state: {
          //   element: 'select[name=\'PolicyClientMailingLocationState\']',
          //   value: bodyData.state || staticDataObj.state,
          // },
          // reasonForPolicy: {
          //   element: 'select[name=\'PolicyAutoDataAutoBusinessType\']',
          //   value: bodyData.reasonForPolicy || staticDataObj.reasonForPolicy,
          // },
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
              value: bodyData.drivers[j].applicantBirthDt || staticDataObj.birthDate,
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
              element: 'input[name=\'PolicyVehicleTerritory\']',
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

      page.on('dialog', async (dialog) => {
        try {
          await dialog.dismiss();
        } catch (e) {
          console.log('dialog close');
        }
      });

    } catch (error) {
      console.log('Error  at Safeco AL :', error);
      return next(Boom.badRequest('Failed to retrieved safeco AL rate.'));
    }
  },
};
