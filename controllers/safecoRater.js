/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { safecoAlRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/environment');


module.exports = {
  safecoAl: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;
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

      const populatedData = await populateKeyValueData();

      await loginStep();
      if (raterStore) {
        await existingQuote();
      } else {
        await newQuoteStep();
      }
      if (!params.stepName) {
        await policyInfoStep();
        if (!raterStore) {
          await GaragedInfoStep();
        }
        await houseHoldStep();
        await driversStep();
        await vehiclesStep();
        await finalSteps();
      } else if (params.stepName === 'namedInsured') {
        await policyInfoStep();
        if (!raterStore) {
          // await GaragedInfoStep();
        }
        await houseHoldStep();
        await page.waitFor(1000);
        const quoteId = `${populatedData.lastName.value}, ${populatedData.firstName.value}`;
        req.session.data = {
          title: 'Successfully finished Safeco AL Named Insured Step',
          status: true,
          quoteId: quoteId,
          stepResult
        }
        browser.close();
        return next();
      } else if (params.stepName === 'drivers' && raterStore) {
        await driversStep();
        if (params.sendSummary && params.sendSummary === 'true') {
          await finalSteps();
        } else {
          const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedData.lastName.value}, ${populatedData.firstName.value}`);
          req.session.data = {
            title: 'Successfully finished Safeco AL Drivers Step',
            status: true,
            quoteId: quoteId,
            stepResult
          };
          browser.close();
          return next();
        }
      } else if (params.stepName === 'vehicles' && raterStore) {
        await vehiclesStep();
        if (params.sendSummary && params.sendSummary === 'true') {
          await finalSteps();
        } else {
          const quoteId = ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedData.lastName.value}, ${populatedData.firstName.value}`);
          req.session.data = {
            title: 'Successfully finished Safeco AL Vehicles Step',
            status: true,
            quoteId: quoteId,
            stepResult
          };
          browser.close();
          return next();
        }
      } else if (params.stepName === 'summary' && raterStore) {
        await finalSteps();
      }

      async function existingQuote() {
        console.log('Safeco AL existing Quote Step');
        try {
          await page.waitFor(3000);
          await page.goto(safecoAlRater.EXISTING_QUOTE_URL, { waitUntil: 'domcontentloaded' });
          await page.waitFor(4000);
          await page.select('#SAMSearchBusinessType', '7|1|');
          await page.select('#SAMSearchModifiedDateRange', '7');
          await page.select('#SAMSearchActivityStatus', '8');
          await page.type('#SAMSearchName', ((req.session.data && req.session.data.quoteId) ? req.session.data.quoteId : `${populatedData.lastName.value}, ${populatedData.firstName.value}`));
          await page.evaluate(() => document.querySelector('#asearch').click());
          await page.waitFor(2000);
          await page.click('#divMain > table > tbody > tr > td > a > span');
          await page.waitFor(2000);
          await page.evaluate(() => document.querySelector('#aedit').click());
          await page.waitFor(2000);
          if (await page.$('[id="btnUnlock"]')) {
            page.evaluate(() => document.querySelector('#btnUnlock').click());
          }
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
        } catch(error) {
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
          await page.waitFor(1000);
          await page.waitForSelector('#PolicyEffectiveDate');
          await page.type('#PolicyEffectiveDate', '05/01/2019');
          await page.waitFor(200);
          await page.click(populatedData.firstName.element);
          if (await page.waitForSelector('#ui-dialog-title-1')) {
            await page.keyboard.press('Escape');
          }
          await page.evaluate((firstName) => { document.querySelector(firstName.element).value = firstName.value; }, populatedData.firstName);
          await page.waitForSelector('#PolicyClientPersonLastName');
          await page.evaluate((lastName) => { document.querySelector(lastName.element).value = lastName.value; }, populatedData.lastName);

          await page.select(populatedData.socialSecurityStatus.element, populatedData.socialSecurityStatus.value);
          await page.click(populatedData.dateOfBirth.element);
          await page.evaluate((dateOfBirth) => { document.querySelector(dateOfBirth.element).value = dateOfBirth.value; }, populatedData.dateOfBirth);
          await page.evaluate((email) => { document.querySelector(email.element).value = email.value; }, populatedData.email);

          await page.waitFor(600);
          await page.evaluate((mailingAddress) => { document.querySelector(mailingAddress.element).value = mailingAddress.value; }, populatedData.mailingAddress);
          await page.click(populatedData.zipCode.element);
          await page.evaluate((zipCode) => { document.querySelector(zipCode.element).value = zipCode.value; }, populatedData.zipCode);
          await page.click(populatedData.city.element);
          if (await page.waitForSelector('#PolicyProducerName')) {
            await page.click(populatedData.city.element);
          }
          await page.evaluate((city) => { document.querySelector(city.element).value = city.value; }, populatedData.city);

          await page.click(populatedData.state.element);
          if (await page.waitForSelector('#PolicyProducerName')) {
            await page.click(populatedData.state.element);
          }
          await page.select(populatedData.state.element, populatedData.state.value);
          await page.waitFor(200);

          await page.evaluate(() => {
            const vehicleGaragedAtMailingAddress = document.querySelector('td > span > input[id="PolicyAutoDataVehicleGaragingAddressYNY"]');
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
              if (await page.$('[id="ui-dialog-title-1"]')) {
                await page.evaluate(() => document.querySelector('#ui-dialog-title-1').click());
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
            await page.type(populatedData.mailingAddress.element, staticDataObj.mailingAddress);
            await page.evaluate(() => document.querySelector('#Continue').click());
          } catch (e) {
            console.log('catch error');
          }
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
          console.log('Error at Safeco AL House Hold:', err);
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
          if (raterStore && raterStore.quoteId) {
            try {
              // await page.waitForSelector('td#tddriver', {timeout: 3000});
              await page.evaluate(() => {
                ecfields.noValidate(); __doPostBack('ScreenTabs1','driver');
                console.log('HIT??');
                // document.querySelector('td#tddriver').click()
              });
              await page.waitFor(50000);
            } catch(error) {
              console.log('Safeco Error Navigating To Driver Step: ', error);
            }
          }
          await page.waitFor(5000);
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
          await page.waitFor(1000);

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
          await page.waitFor(1000);
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
          await page.waitFor(1000);
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

      function populateKeyValueData() {
        const clientInputSelect = {
          firstName: {
            element: 'input[name=\'PolicyClientPersonFirstName\']',
            value: bodyData.firstName || staticDataObj.firstName,
          },
          lastName: {
            element: 'input[name=\'PolicyClientPersonLastName\']',
            value: bodyData.lastName || staticDataObj.lastName,
          },
          socialSecurityStatus: {
            element: 'select[name=\'PolicyClientPersonSocialSecurityNumberStatus\']',
            value: bodyData.socialSecurityStatus || staticDataObj.socialSecurityStatus,
          },
          dateOfBirth: {
            element: 'input[name=\'PolicyClientPersonBirthdate\']',
            value: bodyData.birthDate || staticDataObj.birthDate,
          },
          email: {
            element: 'input[name=\'PolicyClientEmailAddress\']',
            value: bodyData.email || staticDataObj.email,
          },
          mailingAddress: {
            element: 'input[name=\'PolicyClientMailingLocationAddressLine1\']',
            value: bodyData.mailingAddress || staticDataObj.mailingAddress,
          },
          zipCode: {
            element: 'input[name=\'PolicyClientMailingLocationZipCode\']',
            value: bodyData.zipCode || staticDataObj.zipCode,
          },
          city: {
            element: 'input[name=\'PolicyClientMailingLocationCity\']',
            value: bodyData.city || staticDataObj.city,
          },
          state: {
            element: 'select[name=\'PolicyClientMailingLocationState\']',
            value: bodyData.state || staticDataObj.state,
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
