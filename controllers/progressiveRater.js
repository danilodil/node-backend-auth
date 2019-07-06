/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,no-nested-ternary,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { progressiveRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('./../constants/environment');
const SS = require('string-similarity');
const { formatDate } = require('../lib/utils');
const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));

module.exports = {
  rateDelaware: async (req, res, next) => {
    try {
      const params = req.body;
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;
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
        summary: false,
      };

      if (raterStore && raterStore.stepResult) {
        stepResult = raterStore.stepResult;
      }

      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
      // if (ENVIRONMENT.ENV === 'local') {
      //   browserParams = { headless: false };
      // }
      const browser = await puppeteer.launch(browserParams);
      const page = await browser.newPage();

      const populatedData = await populateKeyValueData(bodyData);
      let pageQuote = '';
      let loginRetryAttemptCounter = progressiveRater.LOGIN_REATTEMPT;
      await loginStep();
      if (raterStore) {
        await existingQuote();
        while (true) {
          await page.waitFor(1000);
          pageQuote = await browser.pages();
          if (pageQuote.length > 2) {
            pageQuote = pageQuote[2];
            break;
          }
        }
      } else {
        await newQuoteStep();
        while (true) {
          await page.waitFor(1000);
          pageQuote = await browser.pages();
          if (pageQuote.length > 2) {
            pageQuote = pageQuote[2];
            break;
          }
        }
      }
      if (!params.stepName) {
        await namedInsuredStep();
        await vehicleStep();
        await driverStep();
        await violationStep();
        await underwritingStep();
        await coveragesStep();
        await summaryStep();
      } else {
        if (params.stepName === 'namedInsured') {
          await namedInsuredStep();
          req.session.data = {
            title: 'Successfully finished Progressive DE Named Insured Step',
            status: true,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'vehicles' && raterStore) {
          await pageQuote.waitForXPath('//a[contains(text(), "Vehicles")]', 5000);
          const [redirectToVehicles] = await pageQuote.$x('//a[contains(text(), "Vehicles")]');
          if (redirectToVehicles) redirectToVehicles.click();
          await vehicleStep();
          req.session.data = {
            title: 'Successfully finished Progressive DE Vehicle Step',
            status: true,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'drivers' && raterStore) {
          await pageQuote.waitForXPath('//a[contains(text(), "Drivers")]', 5000);
          const [redirectToDrivers] = await pageQuote.$x('//a[contains(text(), "Drivers")]');
          if (redirectToDrivers) redirectToDrivers.click();
          await driverStep();
          req.session.data = {
            title: 'Successfully finished Progressive DE Driver Step',
            status: true,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'violations' && raterStore) {
          await pageQuote.waitForXPath('//a[contains(text(), "Violations")]', 5000);
          const [redirectToViolations] = await pageQuote.$x('//a[contains(text(), "Violations")]');
          if (redirectToViolations) redirectToViolations.click();
          await violationStep();
          req.session.data = {
            title: 'Successfully finished Progressive DE Violations Step',
            status: true,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'underWriting' && raterStore) {
          await pageQuote.waitForXPath('//a[contains(text(), "Underwriting")]', 5000);
          const [redirectToUnderWriting] = await pageQuote.$x('//a[contains(text(), "Underwriting")]');
          if (redirectToUnderWriting) redirectToUnderWriting.click();
          await underwritingStep();
          req.session.data = {
            title: 'Successfully finished Progressive DE UnderWriting Step',
            status: true,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'coverage' && raterStore) {
          await pageQuote.waitForXPath('//a[contains(text(), "Coverages")]', 5000);
          const [redirectToCoverage] = await pageQuote.$x('//a[contains(text(), "Coverages")]');
          if (redirectToCoverage) redirectToCoverage.click();
          await errorStep();
          await coveragesStep();
          req.session.data = {
            title: 'Successfully finished Progressive DE Coverage Step',
            status: true,
            stepResult,
          };
          browser.close();
          return next();
        }
        if (params.stepName === 'summary' && raterStore) {
          await pageQuote.waitForXPath('//a[contains(text(), "Bill Plans")]', 5000);
          const [redirectToBillPlans] = await pageQuote.$x('//a[contains(text(), "Bill Plans")]');
          if (redirectToBillPlans) redirectToBillPlans.click();
          await summaryStep();
        }
      }

      async function loginStep() {
        try {
          console.log('Progressive DE Login Step.');
          await page.goto(progressiveRater.LOGIN_URL, { waitUntil: 'load' });
          await page.waitForSelector('#user1');
          await page.type('#user1', username);
          await page.type('#password1', password);
          await page.click('#image1');
          await page.waitFor(1000);
          stepResult.login = true;
        } catch (error) {
          console.log('Error at Progressive DE LoginStep:', error);
          if (!loginRetryAttemptCounter) {
            stepResult.login = false;
            req.session.data = {
              title: 'Failed to retrieved Progressive DE rate.',
              status: false,
              error: 'There is some error validations at loginStep',
              stepResult,
            };
            browser.close();
            return next();
          } else {
            console.log('Reattempt Progressive DE login');
            loginRetryAttemptCounter--;
            loginStep();
          }
        }
      }

      // For redirect to new quoate form
      async function newQuoteStep() {
        try {
          console.log('Progressive DE New Quote Step.');
          const AllPages = await browser.pages();
          if (AllPages.length > 2) {
            for (let i = 2; i < AllPages.length; i += 1) {
              await AllPages[i].close();
            }
          }

          await page.goto(progressiveRater.NEW_QUOTE_URL, { waitUntil: 'load' });

          await page.waitForSelector('#QuoteStateList');
          await page.select('#QuoteStateList', 'DE');
          await page.select('#Prds', 'AU');
          await page.waitFor(1000);
          await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
          stepResult.newQuote = true;
        } catch (error) {
          stepResult.newQuote = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at newQuoteStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function existingQuote() {
        console.log('Progressive AL Existing Quote Step');
        try {
          await page.goto(progressiveRater.SEARCH_QUOTE_URL, { waitUntil: 'load' });
          await page.waitForSelector('#LastName');
          await page.evaluate((lastName) => { (document.getElementById('LastName')).value = lastName.value; }, populatedData.lastName);
          await page.evaluate((firstName) => { (document.getElementById('FirstName')).value = firstName.value; }, populatedData.firstName);
          await page.evaluate((policyEffectiveDate) => { (document.getElementById('DateStart')).value = policyEffectiveDate.value; }, populatedData.policyEffectiveDate);
          await page.evaluate((priorPolicyTerminationDate) => { (document.getElementById('DateEnd')).value = priorPolicyTerminationDate.value; }, populatedData.priorPolicyTerminationDate);
          await page.type('select[id="State"]', 'DE');
          await page.select(populatedData.quoteStatus.element, populatedData.quoteStatus.value);
          await page.evaluate(() => document.querySelector('#products_AU').click());
          await page.waitFor(200);
          await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
          await page.evaluate(() => document.querySelector('.insuredNameLink').click());
          stepResult.existingQuote = true;
        } catch (error) {
          console.log('Error at Progressive AL Existing Quote Step:', error);
          stepResult.existingQuote = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at progressive AL Existing Step',
            stepResult,
          };
        }
      }

      // For Named Insured Form
      async function namedInsuredStep() {
        console.log('Progressive DE named Insured Step.');
        try {
          await pageQuote.waitForSelector('#policy');
          await pageQuote.waitFor(1000);

          const namedInsured = [
            {
              title: 'Policy Effective Date',
              element: 'pol_eff_dt',
              value: bodyData.policyEffectiveDate,
            },
            {
              title: 'Is this a Named Operator policy',
              element: 'nam_opr',
              value: 'N',
            },
            {
              title: 'First Name',
              element: 'DRV.0.drvr_frst_nam',
              value: bodyData.firstName || staticDetailsObj.firstName,
            },
            {
              title: 'Last Name',
              element: 'DRV.0.drvr_lst_nam',
              value: bodyData.lastName || staticDetailsObj.lastName,
            },
            {
              title: 'Suffix',
              element: 'DRV.0.drvr_sfx_nam',
              value: bodyData.suffixName || staticDetailsObj.suffixName,
            },
            {
              title: 'Date of Birth',
              element: 'DRV.0.drvr_dob',
              value: bodyData.birthDate || staticDetailsObj.birthDate,
            },
            {
              title: 'Customer E-Mail',
              element: 'email_adr',
              value: bodyData.email || 'test@gmail.com',
            },
            {
              title: 'Phone Type',
              element: 'INSDPHONE.0.insd_phn_typ',
              value: 'M',
            },
            {
              title: 'Phone Number',
              element: 'INSDPHONE.0.insd_phn_nbr',
              value: bodyData.phone.replace('-', '') || staticDetailsObj.phone,
            },
            {
              title: 'Mailing Address Line 1',
              element: 'insd_str',
              value: bodyData.mailingAddress || '8 The Green',
            },
            {
              title: 'City',
              element: 'insd_city_cd',
              value: bodyData.city || 'Delaware',
            },
            {
              title: 'State',
              element: 'insd_st_cd',
              value: bodyData.state || 'DE',
            },
            {
              title: 'ZIP Code',
              element: 'insd_zip_cd',
              value: bodyData.zipCode || staticDetailsObj.zipCode,
            },
            {
              title: 'Check this box if the current mailing address is a P.O. Box or a Military address ',
              element: 'mailing_zip_type_display',
              value: 'Y',
            },

          ];
          await pageQuote.evaluate((namedInsuredElement) => {
            namedInsuredElement.forEach((oneElement) => {
              document.getElementById(oneElement.element).value = oneElement.value;
            });
          }, namedInsured);

          const lenOfResInsd = await pageQuote.evaluate(getSelctVal, `${populatedData.lengthAtAddress.element}>option`);
          const lenOfRes = await pageQuote.evaluate(getValToSelect, lenOfResInsd, populatedData.lengthAtAddress.value);
          await pageQuote.select(populatedData.lengthAtAddress.element, lenOfRes);
          await pageQuote.waitFor(500);

          const prirInsInd = await pageQuote.evaluate(getSelctVal, `${populatedData.priorInsurance.element}>option`);
          const prirIns = await pageQuote.evaluate(getValToSelect, prirInsInd, populatedData.priorInsurance.value);
          await pageQuote.select(populatedData.priorInsurance.element, prirIns);

          await pageQuote.waitFor(500);
          const currInsCoCdDsply = await pageQuote.evaluate(getSelctVal, `${populatedData.priorInsuranceCarrier.element}>option`);
          const currInsCoCd = await pageQuote.evaluate(getValToSelect, currInsCoCdDsply, populatedData.priorInsuranceCarrier.value);
          await pageQuote.select(populatedData.priorInsuranceCarrier.element, currInsCoCd);

          await pageQuote.waitFor(500);
          await pageQuote.select(populatedData.finStblQstn.element, populatedData.finStblQstn.value);
          await pageQuote.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
          stepResult.namedInsured = true;
        } catch (err) {
          stepResult.namedInsured = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at namedInsuredStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      // For Vehicles Form
      async function vehicleStep() {
        console.log('Progressive DE Vehicle Step.');
        try {
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('#VEH\\.0\\.add');
          for (let j in bodyData.vehicles) {
            if (j < bodyData.vehicles.length - 1) {
              const addElement = await pageQuote.$('[id="VEH.0.add"]');
              await addElement.click();
              await page.waitFor(1000);
            }
          }

          for (let j in bodyData.vehicles) {
            const vehicle = [
              {
                title: 'Is this a trailer',
                element: `VEH.${j}.veh_trailer_ind`,
                value: 'N',
              },
              {
                title: 'Vehicle Type',
                element: `VEH.${j}.veh_typ_cd`,
                value: 'A',
              },
              {
                title: 'Vehicle Used for Delivery',
                element: `VEH.${j}.veh_use_dlvry`,
                value: 'N',
              },
              {
                title: 'Any Toys to Quote',
                element: 'prompt_sl_cross_sell',
                value: 'N',
              },

            ];
            dismissDialog(pageQuote);
            await pageQuote.type(populatedData[`vehicleVin${j}`].element, populatedData[`vehicleVin${j}`].value);
            await pageQuote.click(populatedData[`vehicleVin${j}`].buttonId);
            await pageQuote.waitFor(2000);
            await pageQuote.evaluate((vehicleElement) => {
              vehicleElement.forEach((oneElement) => {
                document.getElementById(oneElement.element).value = oneElement.value;
              });
            }, vehicle);
            if (!bodyData.vehicles[j].vehicleVin) {
              const yesrDisplay = await pageQuote.evaluate(getSelctVal, `select[id='VEH.${j}.veh_mdl_yr']>option`);
              const yearSelected = await pageQuote.evaluate(getValToSelect, yesrDisplay, bodyData.vehicles[j].year);
              await pageQuote.select(`select[id='VEH.${j}.veh_mdl_yr']`, yearSelected);
              await pageQuote.waitFor(500);

              const makeDisplay = await pageQuote.evaluate(getSelctVal, `select[id='VEH.${j}.veh_make']>option`);
              let makeSelected = await pageQuote.evaluate(getValToSelect, makeDisplay, bodyData.vehicles[j].make);
              if (!makeSelected) {
                makeSelected = makeDisplay[0].value;
              }
              await pageQuote.select(`select[id='VEH.${j}.veh_make']`, makeSelected);
              await pageQuote.waitFor(500);

              const modelDisplay = await pageQuote.evaluate(getSelctVal, `select[id='VEH.${j}.veh_mdl_nam']>option`);
              let modelSelected = await pageQuote.evaluate(getValToSelect, modelDisplay, bodyData.vehicles[j].model);
              if (!modelSelected) {
                modelSelected = modelDisplay[0].value;
              }
              await pageQuote.select(`select[id='VEH.${j}.veh_mdl_nam']`, modelSelected);
              await pageQuote.waitFor(500);

              const bodyDisplay = await pageQuote.evaluate(getSelctVal, `select[id='VEH.${j}.veh_sym_sel']>option`);
              let bodySelected = await pageQuote.evaluate(getValToSelect, bodyDisplay, bodyData.vehicles[j].vehicleBodyStyle);
              if (!bodySelected) {
                bodySelected = bodyDisplay[0].value;
              }
              await pageQuote.select(`select[id='VEH.${j}.veh_sym_sel']`, bodySelected);
            }
            await pageQuote.type(populatedData[`vehicleZipCode${j}`].element, populatedData[`vehicleZipCode${j}`].value);

            const vehLenOfOwns = await pageQuote.evaluate(getSelctVal, `${populatedData[`vehicleLengthOfOwnership${j}`].element}>option`);
            let vehLenOfOwn = await pageQuote.evaluate(getValToSelect, vehLenOfOwns, populatedData[`vehicleLengthOfOwnership${j}`].value);
            if (!vehLenOfOwn) {
              vehLenOfOwn = vehLenOfOwns[0].value;
            }
            await pageQuote.select(populatedData[`vehicleLengthOfOwnership${j}`].element, vehLenOfOwn);

            const vehUses = await pageQuote.evaluate(getSelctVal, `${populatedData[`vehiclePrimaryUse${j}`].element}>option`);
            const vehUse = await pageQuote.evaluate(getValToSelect, vehUses, populatedData[`vehiclePrimaryUse${j}`].value);
            await pageQuote.select(populatedData[`vehiclePrimaryUse${j}`].element, vehUse);
          }
          await pageQuote.waitFor(2000);
          await pageQuote.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
          stepResult.vehicles = true;
        } catch (err) {
          console.log('Error at Progressive DE Vehicle Step:', err.stack);
          stepResult.vehicles = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at vehicleStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      // For driver Form
      async function driverStep() {
        console.log('Progressive DE Driver Step.');
        try {
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('#DRV\\.0\\.add');
          for (let j in bodyData.drivers) {
            if (j < bodyData.drivers.length - 1) {
              await pageQuote.click('#DRV\\.0\\.add');
              await pageQuote.waitFor(1000);
            }
          }
          for (let j in bodyData.drivers) {
            await pageQuote.waitForSelector(`#DRV\\.${j}\\.drvr_frst_nam`);
            await pageQuote.waitFor(600);

            const driver = [
              {
                element: `DRV.${j}.drvr_frst_nam`,
                value: bodyData.drivers[j].firstName || staticDetailsObj.drivers[0].firstName,
              },
              {
                element: `DRV.${j}.drvr_lst_nam`,
                value: bodyData.drivers[j].lastName || staticDetailsObj.drivers[0].lastName,
              },
              {
                element: `DRV.${j}.drvr_sfx_nam`,
                value: 'SR',
              },
            ];
            await pageQuote.evaluate((driverElement) => {
              driverElement.forEach((oneElement) => {
                document.getElementById(oneElement.element).value = oneElement.value;
              });
            }, driver);
            await pageQuote.evaluate(ddob => document.querySelector(ddob.element).value = ddob.value, populatedData[`driverDateOfBirth${j}`]);
            const genders = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverGender${j}`].element}>option`);
            const gender = await pageQuote.evaluate(getValToSelect, genders, populatedData[`driverGender${j}`].value);
            await pageQuote.waitFor(600);
            await pageQuote.click(populatedData[`driverGender${j}`].element);
            await pageQuote.select(populatedData[`driverGender${j}`].element, gender);
            const maritalStatuss = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverMaritalStatus${j}`].element}>option`);
            const maritalStatus = await pageQuote.evaluate(getValToSelect, maritalStatuss, populatedData[`driverMaritalStatus${j}`].value);
            await pageQuote.select(populatedData[`driverMaritalStatus${j}`].element, maritalStatus);
            if (populatedData[`driverRelationship${j}`]) {
              const drvrRelationships = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverRelationship${j}`].element}>option`);
              const drvrRelationship = await pageQuote.evaluate(getValToSelect, drvrRelationships, populatedData[`driverRelationship${j}`].value);
              await pageQuote.select(populatedData[`driverRelationship${j}`].element, drvrRelationship);
            }
            await pageQuote.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);
            const drvrYearsLics = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverYearsLicensed${j}`].element}>option`);
            const drvrYearsLic = await pageQuote.evaluate(getValToSelect, drvrYearsLics, populatedData[`driverYearsLicensed${j}`].value);
            await pageQuote.select(populatedData[`driverYearsLicensed${j}`].element, drvrYearsLic);
            await pageQuote.waitFor(600);
            const driverStatusOpt = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverStatus${j}`].element}>option`);
            let driverStatus = await pageQuote.evaluate(getValToSelect, driverStatusOpt, populatedData[`driverStatus${j}`].value);
            if (!driverStatus) {
              driverStatus = driverStatusOpt[0].value;
            }
            await pageQuote.select(populatedData[`driverStatus${j}`].element, driverStatus);
            await pageQuote.waitFor(600);
            const drvrEmplStats = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverEmployment${j}`].element}>option`);
            let drvrEmplStat = await pageQuote.evaluate(getValToSelect, drvrEmplStats, populatedData[`driverEmployment${j}`].value);
            if (!drvrEmplStat) {
              drvrEmplStat = drvrEmplStats[0].value;
            }
            await pageQuote.select(populatedData[`driverEmployment${j}`].element, drvrEmplStat);
            await pageQuote.waitFor(600);
            const drvOccStats = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverOccupation${j}`].element}>option`);
            let drvrOccStat = await pageQuote.evaluate(getValToSelect, drvOccStats, populatedData[`driverOccupation${j}`].value);
            if (!drvrOccStat) {
              drvrOccStat = drvOccStats[0].value;
            }
            await pageQuote.select(populatedData[`driverOccupation${j}`].element, drvrOccStat);
            await pageQuote.waitFor(600);
            const drvrEdLvls = await pageQuote.evaluate(getSelctVal, `${populatedData[`driverEducation${j}`].element}>option`);
            let drvrEdLvl = await pageQuote.evaluate(getValToSelect, drvrEdLvls, populatedData[`driverEducation${j}`].value);
            if (!drvrEdLvl) {
              drvrEdLvl = drvrEdLvls[0].value;
            }
            await pageQuote.select(populatedData[`driverEducation${j}`].element, drvrEdLvl);
            await pageQuote.click(populatedData[`driverStateFiling${j}`].element);
            await pageQuote.select(populatedData[`driverStateFiling${j}`].element, populatedData[`driverStateFiling${j}`].value);
            await pageQuote.click(populatedData[`driverAdvTraining${j}`].element);
            await pageQuote.select(populatedData[`driverAdvTraining${j}`].element, populatedData[`driverAdvTraining${j}`].value);
          }
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          stepResult.drivers = true;
        } catch (err) {
          console.log('Error at Progressive DE Driver Step:', err);
          stepResult.drivers = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at driverStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function violationStep() {
        console.log('Progressive DE Violation Step.');

        try {
          await pageQuote.waitForSelector(populatedData.priorIncident0.element);
          const drvrViolCdS = await pageQuote.evaluate(getSelctVal, `${populatedData.priorIncident0.element}>option`);
          const drvrViolCd = await pageQuote.evaluate(getValToSelect, drvrViolCdS, populatedData.priorIncident0.value);
          const priorIncidentDate = populatedData.priorIncidentDate0.value;
          for (let j in bodyData.drivers) {
            if (await pageQuote.$(populatedData[`priorIncident${j}`].element) !== null) {
              await pageQuote.select(populatedData[`priorIncident${j}`].element, drvrViolCd);
              await pageQuote.click(populatedData[`priorIncidentDate${j}`].element);
              await pageQuote.type(populatedData[`priorIncidentDate${j}`].element, priorIncidentDate);
            }
          }
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          stepResult.violations = true;
        } catch (err) {
          console.log('Error at Progressive DE Violation Step :', err);
          stepResult.violations = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at violationStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function underwritingStep() {
        console.log('Progressive DE Underwriting Step.');
        try {
          await pageQuote.waitForSelector(populatedData.priorInsuredInd.element);
          await pageQuote.waitFor(3000);
          await pageQuote.select(populatedData.priorInsuredInd.element, populatedData.priorInsuredInd.value);
          await pageQuote.waitFor(1200);

          // const currInsCoCdDsply = await pageQuote.evaluate(getSelctVal, `${populatedData.priorInsuranceCarrier.element}>option`);
          // const currInsCoCd = await pageQuote.evaluate(getValToSelect, currInsCoCdDsply, populatedData.priorInsuranceCarrier.value);
          // await pageQuote.select(populatedData.priorInsuranceCarrier.element, currInsCoCd);

          // await pageQuote.select(populatedData.priorBiLimits.element, populatedData.priorBiLimits.value);
          // await pageQuote.waitFor(1000);

          // await pageQuote.click(populatedData.policyEffectiveDate.element);
          // await pageQuote.type(populatedData.policyEffectiveDate.element, populatedData.policyEffectiveDate.value);

          // await pageQuote.click(populatedData.priorPolicyTerminationDate.element);
          // await pageQuote.type(populatedData.priorPolicyTerminationDate.element, populatedData.priorPolicyTerminationDate.value);
          // await pageQuote.waitFor(1500);

          // await pageQuote.select(populatedData.yearsWithPriorInsurance.element, populatedData.yearsWithPriorInsurance.value);

          try {
            const numberOfResidentsInHomeOpt = await pageQuote.evaluate(getSelctVal, `${populatedData.numberOfResidentsInHome.element}>option`);
            const numberOfResidentsInHome = await pageQuote.evaluate(getValToSelect, numberOfResidentsInHomeOpt, populatedData.numberOfResidentsInHome.value);
            await pageQuote.select(populatedData.numberOfResidentsInHome.element, numberOfResidentsInHome);
            await pageQuote.waitFor(600);
          } catch (e) {
            console.log('no number Of Residents In Home');
          }
          await pageQuote.select(populatedData.ownOrRentPrimaryResidence.element, populatedData.ownOrRentPrimaryResidence.value);
          await pageQuote.waitFor(600);
          await pageQuote.select(populatedData.ownOrRentPrimaryResidence.element, populatedData.ownOrRentPrimaryResidence.value);
          await pageQuote.waitFor(1200);
          await pageQuote.select(populatedData.rentersLimits.element, populatedData.rentersLimits.value);
          await pageQuote.waitFor(1000);
          await pageQuote.select(populatedData.haveAnotherProgressivePolicy.element, populatedData.haveAnotherProgressivePolicy.value);
          await pageQuote.waitFor(1500);
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await errorStep();
          stepResult.underWriting = true;
        } catch (err) {
          console.log('Error at Progressive DE Underwriting Step ', err);
          stepResult.underWriting = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at underwritingStep',
            stepResult,
          };
          browser.close();
          return next();
        }
      }

      async function errorStep() {
        try {
          console.log('Progressive DE Error Step.');
          await pageQuote.waitFor(4000);
          await pageQuote.waitForSelector('#V_GET_ERROR_MESSAGE', { timeout: 4000 });
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error in data',
            stepResult,
          };
          browser.close();
          return next();
        } catch (e) {
          // await coveragesStep(pageQuote);
        }
      }

      async function coveragesStep() {
        try {
          console.log('Progressive DE Coverages Step.');
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('#pol_ubi_exprnc.madParticipateItem');
          await pageQuote.select('#pol_ubi_exprnc', 'N');

          for (let j in bodyData.coverage) {
            await pageQuote.select(`#VEH\\.${j}\\.veh_use_ubi`, 'Y');

            const liabilityOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.veh_liab"]>option`);
            const liabilityValue = await pageQuote.evaluate(selectSubStringOption, liabilityOptions, bodyData.coverage[j].Liability);
            await pageQuote.select(`select[name="VEH.${j}.veh_liab"]`, liabilityValue);

            const bipdOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.BIPD"]>option`);
            const bipdValue = await pageQuote.evaluate(selectSubStringOption, bipdOptions, bodyData.coverage[j].BIPD);
            await pageQuote.select(`select[name="VEH.${j}.BIPD"]`, bipdValue);

            const umuimOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.UMUMPD"]>option`);
            const umuimValue = await pageQuote.evaluate(selectSubStringOption, umuimOptions, bodyData.coverage[j].UMUIM);
            await pageQuote.select(`select[name="VEH.${j}.UMUMPD"]`, umuimValue);

            const pipOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.PIP"]>option`);
            const pipPayValue = await pageQuote.evaluate(selectSubStringOption, pipOptions, bodyData.coverage[j].PIP);
            await pageQuote.select(`select[name="VEH.${j}.PIP"]`, pipPayValue);

            const compOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.COMP"]>option`);
            const compValue = await pageQuote.evaluate(selectSubStringOption, compOptions, bodyData.coverage[j].COMP);
            await pageQuote.select(`select[name="VEH.${j}.COMP"]`, compValue);

            const colOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.COLL"]>option`);
            const colValue = await pageQuote.evaluate(selectSubStringOption, colOptions, bodyData.coverage[j].COLL);
            await pageQuote.select(`select[name="VEH.${j}.COLL"]`, colValue);

            const rentOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.RENT"]>option`);
            const rentValue = await pageQuote.evaluate(selectSubStringOption, rentOptions, bodyData.coverage[j].RENTAL);
            await pageQuote.select(`select[name="VEH.${j}.RENT"]`, rentValue);

            const roadsideOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.ROADSD"]>option`);
            const roadsideValue = await pageQuote.evaluate(selectSubStringOption, roadsideOptions, bodyData.coverage[j].ROADSIDE);
            await pageQuote.select(`select[name="VEH.${j}.ROADSD"]`, roadsideValue);

            const payoffOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.PAYOFF"]>option`);
            const payoffValue = await pageQuote.evaluate(selectSubStringOption, payoffOptions, bodyData.coverage[j].PAYOFF);
            await pageQuote.select(`select[name="VEH.${j}.PAYOFF"]`, payoffValue);
            await pageQuote.waitFor(2000);
          }

          await pageQuote.waitForSelector('#pmt_optn_desc_presto');
          await pageQuote.select('#pmt_optn_desc_presto', 'P0500');
          await pageQuote.waitFor(500);
          const recalcElement = await pageQuote.$('[id="tot_pol_prem-button"]');
          await recalcElement.click();
          await pageQuote.waitFor(8000);
          await pageQuote.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
          stepResult.coverage = true;
        } catch (error) {
          console.log('Error at Progressive DE Coverages Step ', error);
          stepResult.coverage = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at coveragesStep',
            stepResult,
          };
          browser.close();
          return next();
        }

      }

      async function summaryStep() {
        try {

          console.log('Progressive DE Process Data Step.');
          await pageQuote.waitFor(4000);
          const premiumDetails = await pageQuote.evaluate(() => {
            const Elements = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.querySelectorAll('td');
            const premiumDetailsObj = {
              totalPremium: Elements[2].textContent.replace(/\n/g, '').trim(),
              downPaymentAmount: Elements[3].textContent.replace(/\n/g, '').trim(),
              paymentAmount: Elements[4].textContent.replace(/\n/g, '').trim(),
              term: Elements[1].textContent.replace(/\n/g, '').trim(),
            };

            let previousElement = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.previousElementSibling;
            while (true) {
              if (previousElement.querySelector('th')) {
                premiumDetailsObj.plan = previousElement.querySelector('th').textContent.replace(/\n/g, '').trim();
                break;
              }
              if (previousElement.previousElementSibling.tagName === 'TR') {
                previousElement = previousElement.previousElementSibling;
              } else {
                break;
              }
            }
            return premiumDetailsObj;
          });

          await pageQuote.click('#ctl00_ContentPlaceHolder1_InsuredRemindersDialog_InsuredReminders_btnOK');
          await pageQuote.click('#ctl00_HeaderLinksControl_SaveLink');
          stepResult.summary = true;
          req.session.data = {
            title: 'Successfully retrieved progressive DE rate.',
            status: true,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
            stepResult,
          };
          browser.close();
          return next();

        } catch (error) {
          console.log('Error at Progressive DE Process Data Step ', error);
          stepResult.summary = false;
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at summaryStep',
            stepResult,
          };
          browser.close();
          return next();
        }

      }

      // For dimiss alert dialog
      function dismissDialog(errorPage) {
        try {
          errorPage.on('dialog', async (dialog) => {
            // dialog.accept();
            await dialog.dismiss();
          });
        } catch (e) {
          console.log('e', e);
        }
      }

      function acceptDialog(dialogPage) {
        try {
          dialogPage.on('dialog', async (dialog) => {
            await dialog.accept();
          });
        } catch (error) {
          console.log('e', error);
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
      function getValToSelect(data, valueToSelect) {
        let selected = '';
        data.forEach((entry) => {
          if (valueToSelect.toLowerCase() === entry.name.toLowerCase()) {
            selected = entry.value;
          }
        });
        if (!selected) {
          data.forEach((entry) => {
            if (valueToSelect.toLowerCase() === entry.value.toLowerCase()) {
              selected = entry.value;
            }
          });
        } if (!selected && data[1]) {
          selected = data[1].value;
        }

        return selected;
      }

      function selectSubStringOption(data, valueToSelect) {
        let selected = '';
        data.forEach((entry) => {
          if (valueToSelect.toLowerCase() === entry.name.toLowerCase()) {
            selected = entry.value;
          }
        });
        if (!selected) {
          data.forEach((entry) => {
            if (valueToSelect.toLowerCase() === entry.name.toLowerCase()) {
              selected = entry.value;
            } else if (entry.name.includes(valueToSelect)) {
              selected = entry.value;
            }
          });
        }
        return selected;
      }

      function populateKeyValueData() {

        const staticDetailsObj = {
          firstName: 'Test',
          lastName: 'User',
          birthDate: '12/16/1993',
          suffixName: 'I',
          email: 'test@mail.com',
          phone: '302-222-5555',
          mailingAddress: '216 Humphreys Dr',
          city: 'Dover',
          state: 'DE',
          zipCode: '19934',
          lengthAtAddress: '1 year or more',
          priorInsurance: 'Yes',
          priorInsuranceCarrier: 'USAA',
          vehicles: [
            {
              // Vehicle Type will always be 1981 or newer
              vehicleVin: '1FTSF30L61EC23425',
              vehicleModelYear: '2015',
              vehicleManufacturer: 'FORD',
              vehicleModel: 'F350',
              vehicleBodyStyle: 'EXT CAB (8CYL 4x2)',
              applicantPostalCd: '19934',
              lengthOfOwnership: 'At least 1 year but less than 3 years',
              primaryUse: 'Commute',
            },
          ],
          drivers: [
            {
              firstName: 'Test',
              lastName: 'User',
              applicantBirthDt: '12/16/1993',
              applicantGenderCd: 'Male',
              applicantMaritalStatusCd: 'Married',
              driverLicensedDt: '3 years or more',
              employment: 'Student (full-time)',
              occupation: 'Appraiser - Real Estate',
              education: 'College Degree',
              relationship: 'Other',
            },
          ],
          priorIncident: 'AAD - At Fault Accident',
          priorIncidentDate: '12/16/2012',
          policyEffectiveDate: '04/26/2019',
          priorPolicyTerminationDate: '05/30/2019',
          yearsWithPriorInsurance: '5 years or more',
          ownOrRentPrimaryResidence: 'Rent',
          numberOfResidentsInHome: '3',
          rentersLimits: 'Greater Than 300,000',
          haveAnotherProgressivePolicy: 'No',
        };

        const clientInputSelect = {
          newQuoteState: {
            element: '#QuoteStateList',
            value: 'DE',
          },
          newQuoteProduct: {
            element: '#Prds',
            value: 'AU',
          },
          quoteStatus: {
            element: '#QuoteStatus',
            value: '00',
          },
          firstName: {
            element: 'input[name="DRV.0.drvr_frst_nam"]',
            value: bodyData.firstName || staticDetailsObj.firstName,
          },
          lastName: {
            element: 'input[name="DRV.0.drvr_lst_nam"]',
            value: bodyData.lastName || staticDetailsObj.lastName,
          },
          suffixName: {
            element: 'select[name="DRV.0.drvr_sfx_nam"]',
            value: bodyData.suffixName || staticDetailsObj.suffixName,
          },
          dateOfBirth: {
            element: 'input[name="DRV.0.drvr_dob"]',
            value: bodyData.birthDate || staticDetailsObj.birthDate,
          },
          email: {
            element: 'input[name="email_adr"]',
            value: bodyData.email || staticDetailsObj.email,
          },
          phone: {
            element: 'input[name="INSDPHONE.0.insd_phn_nbr"]',
            value: bodyData.phone && bodyData.phone.replace('-', '') || staticDetailsObj.phone,
          },
          mailingAddress: {
            element: 'input[name="insd_str"]',
            value: bodyData.mailingAddress || staticDetailsObj.mailingAddress,
          },
          city: {
            element: 'input[name="insd_city_cd"]',
            value: bodyData.city || staticDetailsObj.city,
          },
          state: {
            element: 'select[name="insd_st_cd"]',
            value: bodyData.state || staticDetailsObj.state,
          },
          zipCode: {
            element: '#insd_zip_cd',
            value: bodyData.zipCode || staticDetailsObj.zipCode,
          },
          lengthAtAddress: {
            element: 'select[name="len_of_res_insd"]',
            value: bodyData.lengthAtAddress || staticDetailsObj.lengthAtAddress,
          },
          priorInsurance: {
            element: 'select[name="prir_ins_ind"]',
            value: bodyData.priorInsurance || staticDetailsObj.priorInsurance,
          },
          priorInsuranceCarrier: {
            element: 'select[name="curr_ins_co_cd_dsply"]',
            value: bodyData.priorInsuranceCarrier || staticDetailsObj.priorInsuranceCarrier,
          },
          finStblQstn: {
            element: 'select[name="fin_stbl_qstn"]',
            value: 'Y',
          },

          policyEffectiveDate: {
            element: 'input[name="prir_ins_eff_dt"]',
            value: bodyData.policyEffectiveDate || staticDetailsObj.policyEffectiveDate,
          },
          priorPolicyTerminationDate: {
            element: 'input[name="prev_ins_expr_dt"]',
            value: bodyData.priorPolicyTerminationDate || staticDetailsObj.priorPolicyTerminationDate,
          },
          priorInsuredInd: {
            element: 'select[name="prir_ins_ind"]',
            value: 'N',
          },
          priorBiLimits: {
            element: 'select[name="prir_bi_lim"]',
            value: '2',
          },
          yearsWithPriorInsurance: {
            element: 'select[name="pop_len_most_recent_carr_insd"]',
            value: 'D',
          },
          numberOfResidentsInHome: {
            element: 'select[name="excess_res_nbr"]',
            value: bodyData.numberOfResidentsInHome || '3',
          },
          ownOrRentPrimaryResidence: {
            element: 'select[name="hm_own_ind"]',
            value: 'R',
          },
          rentersLimits: {
            element: 'select[name="pol_renters_prir_bi_lim_code"]',
            value: '2',
          },
          haveAnotherProgressivePolicy: {
            element: 'select[name="multi_pol_ind"]',
            value: 'N',
          },
        };

        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          bodyData.vehicles.forEach((element, j) => {
            clientInputSelect[`vehicleVin${j}`] = {
              buttonId: `#VinVerifyButton_${j}`,
              element: `input[name='VEH.${j}.veh_vin']`,
              value: element.vehicleVin || staticDetailsObj.vehicles[0].vehicleVin,
            };
            clientInputSelect[`vehicleYear${j}`] = {
              element: `select[name='VEH.${j}.veh_mdl_yr']`,
              value: element.vehicleModelYear || staticDetailsObj.vehicles[0].vehicleModelYear,
            };
            clientInputSelect[`vehicleMake${j}`] = {
              element: `select[name='VEH.${j}.veh_make']`,
              value: element.vehicleManufacturer || staticDetailsObj.vehicles[0].vehicleManufacturer,
            };
            clientInputSelect[`vehicleModel${j}`] = {
              element: `select[name='VEH.${j}.veh_mdl_nam']`,
              value: element.vehicleModel || staticDetailsObj.vehicles[0].vehicleModel,
            };
            clientInputSelect[`vehicleBody${j}`] = {
              element: `select[name='VEH.${j}.veh_sym_sel']`,
              value: element.vehicleBodyStyle || staticDetailsObj.vehicles[0].vehicleBodyStyle,
            };
            clientInputSelect[`vehicleZipCode${j}`] = {
              element: `input[name="VEH.${j}.veh_grg_zip"]`,
              value: element.applicantPostalCd || staticDetailsObj.vehicles[0].applicantPostalCd,
            };
            clientInputSelect[`vehicleLengthOfOwnership${j}`] = {
              element: `select[name='VEH.${j}.veh_len_of_own']`,
              value: element.lengthOfOwnership || staticDetailsObj.vehicles[0].lengthOfOwnership,
            };
            clientInputSelect[`vehiclePrimaryUse${j}`] = {
              element: `select[name='VEH.${j}.veh_use']`,
              value: element.primaryUse || staticDetailsObj.vehicles[0].primaryUse,
            };
            clientInputSelect[`vehiclePrimaryUsedForDelivery${j}`] = {
              element: `select[name="VEH.${j}.veh_use_dlvry"]`,
              value: 'N',
            };
            clientInputSelect[`vehicleCrossSell${j}`] = {
              element: 'select[name="prompt_sl_cross_sell"]',
              value: 'N',
            };
          });
        }

        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          bodyData.drivers.forEach((element, j) => {
            clientInputSelect[`driverFirstName${j}`] = {
              element: `input[name='DRV.${j}.drvr_frst_nam']`,
              value: element.firstName || staticDetailsObj.drivers[0].firstName,
            };
            clientInputSelect[`driverLastName${j}`] = {
              element: `input[name='DRV.${j}.drvr_lst_nam']`,
              value: element.lastName || staticDetailsObj.drivers[0].lastName,
            };
            clientInputSelect[`driverDateOfBirth${j}`] = {
              element: `input[name="DRV.${j}.drvr_dob"]`,
              value: element.applicantBirthDt || staticDetailsObj.drivers[0].applicantBirthDt,
            };
            clientInputSelect[`driverGender${j}`] = {
              element: `select[name='DRV.${j}.drvr_sex']`,
              value: element.applicantGenderCd || staticDetailsObj.drivers[0].applicantGenderCd,
            };
            clientInputSelect[`driverMaritalStatus${j}`] = {
              element: `select[name='DRV.${j}.drvr_mrtl_stat_map']`,
              value: element.applicantMaritalStatusCd || staticDetailsObj.drivers[0].applicantMaritalStatusCd,
            };
            clientInputSelect[`driverYearsLicensed${j}`] = {
              element: `select[name='DRV.${j}.drvr_years_lic']`,
              value: element.driverLicensedDt || staticDetailsObj.drivers[0].driverLicensedDt,
            };
            clientInputSelect[`driverEmployment${j}`] = {
              element: `select[name='DRV.${j}.drvr_empl_stat']`,
              value: element.employment || staticDetailsObj.drivers[0].employment,
            };
            clientInputSelect[`driverOccupation${j}`] = {
              element: `select[name='DRV.${j}.drvr_occup_lvl']`,
              value: staticDetailsObj.drivers[0].occupation,
            };
            clientInputSelect[`driverEducation${j}`] = {
              element: `select[name='DRV.${j}.drvr_ed_lvl']`,
              value: element.education || staticDetailsObj.drivers[0].education,
            };
            clientInputSelect[`driverLicenseStatus${j}`] = {
              element: `select[name='DRV.${j}.drvr_lic_stat']`,
              value: 'V',
            };
            clientInputSelect[`driverStateFiling${j}`] = {
              element: `select[name='DRV.${j}.drvr_fil_ind']`,
              value: 'N',
            };
            clientInputSelect[`driverAdvTraining${j}`] = {
              element: `select[name='DRV.${j}.drvr_adv_trn_cd']`,
              value: 'N',
            };
            clientInputSelect[`driverStatus${j}`] = {
              element: `select[name='DRV.${j}.drvr_stat_dsply']`,
              value: 'R',
            };
            clientInputSelect[`driverRelationship${j}`] = {
              element: `select[name='DRV.${j}.drvr_rel_desc_cd']`,
              value: staticDetailsObj.drivers[0].relationship,
            };
            clientInputSelect[`priorIncident${j}`] = {
              element: `select[name='DRV.${j}.VIO.0.drvr_viol_cd`,
              value: bodyData.priorIncident || staticDetailsObj.priorIncident,
            };
            clientInputSelect[`priorIncidentDate${j}`] = {
              element: `input[name="DRV.${j}.VIO.0.drvr_viol_dt_dsply"]`,
              value: bodyData.priorIncidentDate || staticDetailsObj.priorIncidentDate,
            };
          });
        }

        return clientInputSelect;
      }
    } catch (error) {
      console.log('Error at Progressive DE :', error);
      return next(Boom.badRequest('Failed to retrieved progressive DE rate.'));
    }

  },
  rateAlabama: async (req, res, next) => {
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
        summary: false,
      };

      if (raterStore && raterStore.stepResult) {
        stepResult = raterStore.stepResult;
      }

      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
      if (ENVIRONMENT.ENV === 'local') {
        browserParams = { headless: false };
      }
      const browser = await puppeteer.launch(browserParams);
      const page = await browser.newPage();

      const staticDetailsObj = {
        firstName: 'Test',
        lastName: 'User',
        birthDate: '12/16/1993',
        email: 'test@mail.com',
        phone: '302-222-5555',
        mailingAddress: '216 Humphreys Dr',
        city: 'Adamsville',
        state: 'Alabama',
        zipCode: '35005',
        lengthAtAddress: '1 year or more',
        priorInsurance: 'A',
        priorInsuranceCarrier: 'USAA',
        // must always agree to closure
        vehicles: [
          {
            // Vehicle Type will always be 1981 or newer
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

      function dismissDialog(errorPage) {
        try {
          errorPage.on('dialog', async (dialog) => {
            await dialog.dismiss();
          });
        } catch (e) {
          console.log('e', e);
        }
      }

      const populatedData = await populateData();

      let pageQuote = '';
      await loginStep();
      if (raterStore) {
        await existingQuote();
        while (true) {
          await page.waitFor(500);
          pageQuote = await browser.pages();
          if (pageQuote.length > 2) {
            pageQuote = pageQuote[2];
            break;
          }
        }
      } else {
        await newQuoteStep();
        while (true) {
          await page.waitFor(1000);
          pageQuote = await browser.pages();
          if (pageQuote.length > 2) {
            pageQuote = pageQuote[2];
            break;
          }
        }
      }

      if (!params.stepName) {
        await namedInsuredStep();
        await vehicleStep();
        await driverStep();
        await violationStep();
        await underwritingStep();
        await coveragesStep();
        await summaryStep();
      } else {
        if (params.stepName === 'namedInsured') {
          await namedInsuredStep();
          await exitSuccess('namedInsured');
        }
        if (params.stepName === 'vehicles' && raterStore) {
          await vehicleStep();
          await underwritingStep();
        }
        if (params.stepName === 'drivers' && raterStore) {
          await driverStep();
          await exitSuccess('drivers');
        }
        if (params.stepName === 'violations' && raterStore) {
          await violationStep();
        }
        if (params.stepName === 'underWriting' && raterStore) {
          await underwritingStep();
        }
        if (params.stepName === 'coverage' && raterStore) {
          await errorStep();
          await coveragesStep();
        }
        if (params.stepName === 'summary' && raterStore) {
          await summaryStep();
        }
      }

      async function loginStep() {
        try {
          console.log('Progressive AL Login Step.');
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

      // redirect to new quoate form
      async function newQuoteStep() {
        console.log('Progressive AL New Quote Step.');
        try {
          await page.goto(progressiveRater.NEW_QUOTE_URL, { waitUntil: 'load' });
          await page.waitForSelector('#QuoteStateList');
          await page.select('#QuoteStateList', 'AL');
          await page.select('#Prds', 'AU');
          await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
          stepResult.newQuote = true;
        } catch (error) {
          await exitFail(error, 'newQuote');
        }
      }

      async function existingQuote() {
        console.log('Progressive AL Existing Quote Step');
        try {
          // if (raterStore && raterStore.quoteIds && raterStore.quoteIds !== {}) {
          //   const quote = raterStore.quoteIds;
          //   const url = `https://www.foragentsonly.com/NewBusiness/QuotingGateway/RouteQuote/?app=OpenQuote&quotekey=${quote.quoteKey}&quoteNumber=${quote.quoteNumber}&st_cd=${quote.stateCd || 'AL'}&prod_cd=${quote.prodCd}&qt_src=DQS&risk_cd=AA&fromPage=/newbusiness/quotesearch/`;
          //   await page.goto(url, { waitUntil: 'load' });
          // } else {
          await page.goto(progressiveRater.SEARCH_QUOTE_URL, { waitUntil: 'load' });
          const tdText = await page.$$eval('table tbody tr td p a', tds => tds.map(td => td.innerText));
          const name = `${populatedData[`DRV.0.drvr_lst_nam`].value}, ${populatedData[`DRV.0.drvr_frst_nam`].value}`;
          for (let i = 0; i < tdText.length; i++) {
            if (tdText[i] === name) {
              await page.evaluate((index) => {
                const els = document.getElementsByClassName('insuredNameLink');
                els[index].click();
              }, i);
            }
          }
          // }
          stepResult.existingQuote = true;
        } catch (error) {
          await exitFail(error, 'existingQuote');
        }
      }

      async function namedInsuredStep() {
        console.log('Progressive AL Named Insured Step.');
        try {
          await loadStep('NamedInsured', false);
          await fillPageForm('Driver');
          // await pageQuote.waitFor(500);
          // await navigateMenu('Driver');
          stepResult.namedInsured = true;
        } catch (error) {
          await exitFail(error, 'namedInsured');
        }
      }

      async function vehicleStep() {
        try {
          await loadStep('Vehicles', true);
          dismissDialog(pageQuote);
          await pageQuote.waitForSelector('img[id="VEH.0.add"]');
          const beforeCode = async function () {
            for (let j in bodyData.vehicles) {
              await pageQuote.evaluate((i) => {
                const el = document.getElementById(`VEH.${i}.veh_vin`);
                if (!el) {
                  const addElement = document.getElementById('VEH.0.add');
                  addElement.click();
                }
              }, j);
              await pageQuote.waitFor(1000);
            }
          }
          const afterCode = async function () {
            for (let j in bodyData.vehicles) {
              await pageQuote.evaluate(async (data, i) => {
                const vinEl = document.getElementById(`VEH.${i}.veh_vin`);
                const vinBtn = document.getElementById(`VinVerifyButton_${i}`);
                if (vinEl) {
                  vinEl.value = data[`VEH.${i}.veh_vin`].value;
                  vinBtn.click();
                }
              }, populatedData, j)
              await pageQuote.waitFor(1000);
            }
            // Delete a vehicle code
            // for (let j=0;j<10;j++) {
            //   if (bodyData.vehicles && bodyData.vehicles.length) {
            //     const k = +bodyData.vehicles.length -1;
            //     if (j > k) {
            //       const deleteElement = await pageQuote.$(`[id="VEH.${j}.delete"]`);
            //       if (deleteElement) {
            //         await deleteElement.click();
            //         await pageQuote.waitFor(1000);
            //         await pageQuote.on('dialog', async (dialog) => {
            //           console.log('DIALOG HIT');
            //           await dialog.accept();
            //         });
            //         await pageQuote.waitFor(1000);
            //       }
            //     }
            //   }
            // }
          }
          await fillPageForm(null, beforeCode, afterCode);
          stepResult.vehicles = true;
        } catch (error) {
          await exitFail(error, 'vehicles');
        }
      }

      // driver Form
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
          }
          await fillPageForm('Violations', customCode, null, 3000);
          stepResult.drivers = true;
        } catch (error) {
          await exitFail(error, 'drivers');
        }
      }

      async function violationStep() {
        try {
          await loadStep('Violations', true);
          await fillPageForm('Underwriting');
          await pageQuote.waitFor(500);
          stepResult.violations = true;
        } catch (error) {
          await exitFail(error, 'violations');
        }
      }

      async function underwritingStep() {
        try {
          await loadStep('Underwriting', true);
          await fillPageForm();
          await pageQuote.waitFor(500);
          await coveragesStep();

          stepResult.underWriting = true;
        } catch (error) {
          await exitFail(error, 'underwriting');
        }
      }

      async function errorStep() {
        try {
          await fillPageForm();
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
            await fillPageForm();
            await pageQuote.waitFor(1000);
          }
          await coveragesStep();
        } catch (error) {
          await exitFail(error, 'error');
        }
      }

      async function coveragesStep() {
        try {
          await loadStep('Coverages', true);
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
          pageQuote.on('dialog', async (dialog) => {
            await dialog.dismiss();
          });
          await pageQuote.evaluate(() => {
            const el = document.getElementById('ctl00_pageMessage');
            if (el) {
              el.value = '';
            }
          });
          await pageQuote.waitFor(500);
          dismissDialog(pageQuote);
          await pageQuote.waitFor(500);
          stepResult.coverage = true;
        } catch (error) {
          await exitFail(error, 'coverages');
        }
      }

      async function summaryStep() {
        try {
          await loadStep('BillPlans', true);
          dismissDialog(pageQuote);
          await pageQuote.waitFor(2000);
          dismissDialog(pageQuote);
          const premiumDetails = await pageQuote.evaluate(() => {
            const Elements = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.querySelectorAll('td');
            const ress = {};
            ress.totalPremium = Elements[2].textContent.replace(/\n/g, '').trim();
            ress.downPaymentAmount = Elements[3].textContent.replace(/\n/g, '').trim();
            ress.paymentAmount = Elements[4].textContent.replace(/\n/g, '').trim();
            ress.term = Elements[1].textContent.replace(/\n/g, '').trim();

            let previousElement = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.previousElementSibling;
            while (true) {
              if (previousElement.querySelector('th')) {
                ress.plan = previousElement.querySelector('th').textContent.replace(/\n/g, '').trim();
                break;
              }
              if (previousElement.previousElementSibling.tagName === 'TR') {
                previousElement = previousElement.previousElementSibling;
              } else {
                break;
              }
            }
            return ress;
          });

          await pageQuote.click('#ctl00_ContentPlaceHolder1_InsuredRemindersDialog_InsuredReminders_btnOK');
          stepResult.summary = true;
          req.session.data = {
            title: 'Successfully retrieved progressive AL rate.',
            status: true,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan.replace(/\D/g, '') : null,
            downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
            stepResult,
          };
          await saveStep();
          browser.close();
          return next();
        } catch (error) {
          await exitFail(error, 'summary');
        }
      }

      async function saveStep() {
        try {
          console.log('Progressive AL Save Step');
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('#aspnetForm');
          await pageQuote.evaluate(() => {
            NavigateLinks('SaveLink');
          });
          await pageQuote.waitFor(3000);
        } catch (error) {
          await exitFail(error, 'save');
        }
      }

      async function exitFail(error, step) {
        console.log(`Error during Progressive AL ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieve Progressive AL rate',
            status: false,
            error: `There was an error at ${step} step`,
            stepResult,
          };
        }
        browser.close();
        return next();
      }

      async function exitSuccess(step) {
        try {
          req.session.data = {
            title: `Successfully finished Progressive AL ${step} Step`,
            status: true,
            quoteIds: quoteObj,
            stepResult,
          };
          browser.close();
          return next();
        } catch (error) {
          await exitFail(error, 'exitSuccess');
        }
      }

      async function loadStep(step, navigate) {
        try {
          console.log(`Progressive AL ${step} Step`);
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
          await pageQuote.waitFor(1000);
          await pageQuote.waitForSelector('#aspnetForm');
          await pageQuote.waitForSelector('#ctl00_MenuPlaceholder_ctl00_menuItemValue');
          await pageQuote.waitForSelector('#ctl00_MenuPlaceholder_ctl00_navigateMenuButton');
          await pageQuote.evaluate((nStep) => {
            GetObj('ctl00_MenuPlaceholder_ctl00_menuItemValue').value = nStep;
            GetObj('ctl00_MenuPlaceholder_ctl00_navigateMenuButton').click();
          }, step);
          await pageQuote.waitForSelector('#aspnetForm');
        } catch (error) {
          await exitFail(error, 'NavigateMenu');
        }
      }

      // nextStep can be 'Vehicles', 'Driver', 'Underwriting', 'Coverages', 'BillPlans'
      async function fillPageForm(nextStep, beforeCustomCode, afterCustomCode, delayAfter) {
        try {
          pageQuote.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i)
              console.log(`${msg.args()[i]}`);
          });
          if (beforeCustomCode) {
            await beforeCustomCode();
          }
          const qO = await pageQuote.evaluate(async (data) => {
            const form = document.aspnetForm;
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
                    if (obj.id.includes('drvr_empl_stat')) {
                      const index = obj.id.replace(/^\D+/g, '');
                      const occObj = index ? GetObj(`DRV.${index}`) : GetObj(`DRV.0.drvr_empl_stat`);
                      const occValue = (data && data[occObj.id]) ? data[occObj.id] : 'Other';
                      obj.onchange = async function () {
                        setTimeout(async () => {
                          const occBestValue = await getBestValue(occValue, occObj.options);
                          console.log(`Occupation for Driver ${occObj.id}| value:${occValue} bestValue:${occBestValue} option0:${(occObj.options && occObj.options[0]) ? occObj.options[0].value : 'No 0th options'} option2:${(occObj.options && occObj.options[2]) ? occObj.options[2].value : 'No 2nd options'} `);
                          SetFieldValue(occObj, bestValue);
                        }, 500);
                      }
                      FldOnChange(obj, true);
                    }
                  } else if (obj.type === 'radio' || obj.type === 'checkbox') {
                    obj.checked = (value && value === true) ? true : false;
                  }
                }
                if (obj && obj.onchange && !obj.id.includes('drvr_empl_stat')) {
                  obj.onchange = null;
                }
              }
            }
            return quoteObj;

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
                ratings.push({ target: currentTargetString, rating: currentRating })
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
          }, populatedData);
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
            //dataObj[`VEH.${j}.veh_typ_cd`] = {type: 'select-one', value: '', name: `VEH.${j}.veh_typ_cd`};
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
        dataObj[`pol_eff_dt`] = { type: 'text', value: '07/04/2019', name: 'pol_eff_dt' };
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
        dataObj[`pop_len_most_recent_carr_insd`] = { type: 'select-one', value: bodyData.yearsWithPriorInsurance || staticDetailsObj.yearsWithPriorInsurance, name: `pop_len_most_recent_carr_insd` };
        dataObj[`spinoff_code`] = { type: 'select-one', value: '', name: `spinoff_code` };
        dataObj[`prls_ind`] = { type: 'select-one', value: 'Y', name: 'prls_ind' };
        dataObj[`excess_res_nbr`] = { type: 'select-one', value: bodyData.numberOfResidentsInHome || '3', name: `excess_res_nbr` };
        dataObj[`hm_own_ind`] = { type: 'select-one', value: bodyData.ownOrRentPrimaryResidence || staticDetailsObj.ownOrRentPrimaryResidence, name: `hm_own_ind` };
        dataObj[`pol_renters_prir_bi_lim_code`] = { type: 'select-one', value: bodyData.rentersLimits || staticDetailsObj.rentersLimits, name: `pol_renters_prir_bi_lim_code` };
        dataObj[`multi_pol_ind`] = { type: 'select-one', value: 'N', name: `multi_pol_ind` };
        return dataObj;
      }

      async function returnBestValue(valueT, dataT) {
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
            ratings.push({ target: currentTargetString, rating: currentRating })
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
        const bestValue = await getBestValue(valueT, dataT);
        return bestValue;
      }
    } catch (error) {
      console.log('Error at Progressive AL :', error);
      return next(Boom.badRequest('Failed to retrieved progressive AL rate.'));
    }
  },
};
