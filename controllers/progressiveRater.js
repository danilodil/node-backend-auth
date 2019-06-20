/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,no-nested-ternary,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { progressiveRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('./../constants/environment');

module.exports = {
  rateDelaware: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;

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
      const params = req.body;
      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(9, bodyData.drivers.length); // Its add max 12 drivers

      
      const populatedData = await populateKeyValueData(bodyData);
     
      let pageQuote = '';
      let loginRetryAttemptCounter = progressiveRater.LOGIN_REATTEMPT;
      await loginStep();
      if (raterStore) {
        await processExistingQuote();
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
        } catch (error) {
          console.log('Error at Progressive DE LoginStep:', error);
          if (!loginRetryAttemptCounter) {
            req.session.data = {
              title: 'Failed to retrieved Progressive DE rate.',
              status: false,
              error: 'There is some error validations at loginStep',
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
        } catch (error) {
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at newQuoteStep',
          };
          browser.close();
          return next();
        }
      }

      async function processExistingQuote() {
        console.log('Progressive AL Existing Quote Step.');
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
        } catch (error) {
          console.log('Error at Progressive AL Existing Quote Step:', error);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at progressive AL Existing Step',
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
        } catch (err) {
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at namedInsuredStep',
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
          for (const j in bodyData.vehicles) {
            if (j < bodyData.vehicles.length - 1) {
              const addElement = await pageQuote.$('[id="VEH.0.add"]');
              await addElement.click();
              await page.waitFor(1000);
            }
          }

          for (const j in bodyData.vehicles) {
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
        } catch (err) {
          console.log('Error at Progressive DE Vehicle Step:', err.stack);
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at vehicleStep',
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
          for (const j in bodyData.drivers) {
            if (j < bodyData.drivers.length - 1) {
              await pageQuote.click('#DRV\\.0\\.add');
              await pageQuote.waitFor(1000);
            }
          }
          for (const j in bodyData.drivers) {
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
        } catch (err) {
          console.log('Error at Progressive DE Driver Step:', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at driverStep' ,
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
          for (const j in bodyData.drivers) {
            if (await pageQuote.$(populatedData[`priorIncident${j}`].element) !== null) {
              await pageQuote.select(populatedData[`priorIncident${j}`].element, drvrViolCd);
              await pageQuote.click(populatedData[`priorIncidentDate${j}`].element);
              await pageQuote.type(populatedData[`priorIncidentDate${j}`].element, priorIncidentDate);
            }
          }
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        } catch (err) {
          console.log('Error at Progressive DE Violation Step :', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at violationStep',
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
        } catch (err) {
          console.log('Error at Progressive DE Underwriting Step ', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at underwritingStep',
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

          for (const j in bodyData.coverage) {
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
        } catch (error) {
          console.log('Error at Progressive DE Coverages Step ', error);
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at coveragesStep',
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

          req.session.data = {
            title: 'Successfully retrieved progressive DE rate.',
            status: true,
            response: premiumDetails,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
          };
          browser.close();
          return next();

        } catch (error) {
          console.log('Error at Progressive DE Process Data Step ', error);
          req.session.data = {
            title: 'Failed to retrieved Progressive DE rate.',
            status: false,
            error: 'There is some error validations at summaryStep',
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
            value: bodyData.phone.replace('-', '') || staticDetailsObj.phone,
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
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;

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
            applicantMaritalStatusCd: 'Married',
            driverLicensedDt: '3 years or more',
            employment: 'Student (full-time)',
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
      const params = req.body;
      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(9, bodyData.drivers.length);

      function populateKeyValueData() {
        const clientInputSelect = {
          newQuoteState: {
            element: '#QuoteStateList',
            value: 'AL',
          },
          newQuoteProduct: {
            element: '#Prds',
            value: 'AU',
          },
          agentCode: {
            element: 'select[id="AgentCode',
            value: username,
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
          dateOfBirth: {
            elementId: 'DRV.0.drvr_dob',
            element: 'input[name="DRV.0.drvr_dob"]',
            value: bodyData.birthDate || staticDetailsObj.birthDate,
          },
          email: {
            element: 'input[name="email_adr"]',
            value: bodyData.email || staticDetailsObj.email,
          },
          phone: {
            elementId: 'INSDPHONE.0.insd_phn_nbr',
            element: 'input[name="INSDPHONE.0.insd_phn_nbr"]',
            value: bodyData.phone.replace('-', '') || staticDetailsObj.phone,
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
            elementId: 'insd_zip_cd',
            element: '#insd_zip_cd',
            value: '35005',
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
            elementId: 'pol_eff_dt',
            element: 'input[name="pol_eff_dt"]',
            value: bodyData.policyEffectiveDate || staticDetailsObj.policyEffectiveDate,
          },
          priorPolicyTerminationDate: {
            value: bodyData.priorPolicyTerminationDate || staticDetailsObj.priorPolicyTerminationDate,
          },
          priorInsuredCdInd: {
            element: 'select[name="prir_ins_cd_insd"]',
            value: (bodyData.priorInsurance === 'No' ? 'C' : 'A') || staticDetailsObj.priorInsurance,
          },
          priorBiLimits: {
            element: 'select[name="prir_bi_lim"]',
            value: '3',
          },
          yearsWithPriorInsurance: {
            element: 'select[name="pop_len_most_recent_carr_insd"]',
            value: (bodyData.yearsWithPriorInsurance && bodyData.yearsWithPriorInsurance.toLowerCase() === 'less than 1 year' ? 'A'
              : bodyData.yearsWithPriorInsurance && bodyData.yearsWithPriorInsurance.toLowerCase() === 'at least 1 year but less than 3 years' ? 'B'
                : bodyData.yearsWithPriorInsurance && bodyData.yearsWithPriorInsurance.toLowerCase() === 'at least 3 years but less than 5 years' ? 'C'
                  : bodyData.yearsWithPriorInsurance && bodyData.yearsWithPriorInsurance.toLowerCase() === '5 years or more' ? 'D'
                    : 'B') || staticDetailsObj.yearsWithPriorInsurance,
          },
          numberOfResidentsInHome: {
            element: 'select[name="excess_res_nbr"]',
            value: bodyData.numberOfResidentsInHome || '2',
          },
          ownOrRentPrimaryResidence: {
            element: 'select[name="hm_own_ind"]',
            value: (bodyData.ownOrRentPrimaryResidence && bodyData.ownOrRentPrimaryResidence.toLowerCase() === 'own home/condo' ? 'O'
              : bodyData.ownOrRentPrimaryResidence && bodyData.ownOrRentPrimaryResidence.toLowerCase() === 'own mobile home' ? 'M'
                : 'M') || staticDetailsObj.ownOrRentPrimaryResidence,
          },
          rentersLimits: {
            element: 'select[name="pol_renters_prir_bi_lim_code"]',
            value: bodyData.rentersLimits || staticDetailsObj.rentersLimits,
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
            clientInputSelect[`vehicleUsedForRideshare${j}`] = {
              element: `select[name="VEH.${j}.veh_trnspr_ntwk_co_cd"]`,
              value: 'N',
            };
            clientInputSelect[`vehicleAutomaticBraking${j}`] = {
              element: `select[name="VEH.${j}.veh_atmt_emrgnc_braking_insd_cd"]`,
              value: 'Y',
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
              elementId: `DRV.${j}.drvr_dob`,
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
              value: element.occupation || 'Other',
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

            // if (element.relationship) {
            clientInputSelect[`driverRelationship${j}`] = {
              element: `select[name='DRV.${j}.drvr_rel_desc_cd']`,
              // value: element.relationship || staticDetailsObj.drivers[0].relationship,
              value: 'Other',
            };
            // }

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

      // get all select options texts and values
      function getSelectValues(inputID) {
        optVals = [];

        document.querySelectorAll(inputID).forEach((opt) => {
          optVals.push({ name: opt.innerText, value: opt.value });
        });

        return optVals;
      }

      // select particular value in dropdown
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
        }
        if (!selected) {
          data.forEach((entry) => {
            if (entry.value && entry.value !== '') {
              selected = entry.value;
            }
            // selected = data[stringSimilarity.findBestMatch(valueToSelect, data).bestMatchIndex];
          });
        }

        if (!selected && data[1]) {
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

      // dimiss alert dialog
      function dismissDialog(errorPage) {
        try {
          errorPage.on('dialog', async (dialog) => {
            await dialog.dismiss();
          });
        } catch (e) {
          console.log('e', e);
        }
      }

      // Login
      let loginReAttemptCounter = progressiveRater.LOGIN_REATTEMPT;
      const populatedData = await populateKeyValueData(bodyData);
      let pageQuote = '';
      await loginStep();
      if (raterStore) {
        await processExistingQuote();
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
            title: 'Successfully finished Progressive AL Named Insured Step',
            status: true,
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
            title: 'Successfully finished Progressive AL Vehicle Step',
            status: true,
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
            title: 'Successfully finished Progressive AL Driver Step',
            status: true,
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
            title: 'Successfully finished Progressive AL Violations Step',
            status: true,
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
            title: 'Successfully finished Progressive AL UnderWriting Step',
            status: true,
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
            title: 'Successfully finished Progressive AL Coverage Step',
            status: true,
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
          console.log('Progressive AL Login Step.');
          await page.goto(progressiveRater.LOGIN_URL, { waitUntil: 'load' }); // wait until page load
          await page.waitForSelector('#user1');
          await page.type('#user1', username);
          await page.type('#password1', password);

          await page.click('#image1');
          await page.waitFor(3000);
        } catch (err) {
          console.log('Error at Progressive AL Login Step:', err);
          if (!loginReAttemptCounter) {
            req.session.data = {
              title: 'Failed to retrieved Progressive AL rate.',
              status: false,
              error: 'There is some error validations at loginStep',
            };
            browser.close();
            return next();
          } else {
            console.log('Reattempt Progressive AL login');
            loginReAttemptCounter--;
            loginStep();
          }
        }
      }

      // redirect to new quoate form
      async function newQuoteStep() {
        console.log('Progressive AL New Quote Step.');
        try {
          await page.goto(progressiveRater.NEW_QUOTE_URL, { waitUntil: 'load' });
          await page.waitForSelector(populatedData.newQuoteState.element);
          await page.select(populatedData.newQuoteState.element, populatedData.newQuoteState.value);
          await page.select(populatedData.newQuoteProduct.element, populatedData.newQuoteProduct.value);
          await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
        } catch (err) {
          console.log('Error at Progressive AL New Quote Step:', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at newQuoteStep',
          };
          browser.close();
          return next();
        }
      }

      async function processExistingQuote() {
        console.log('Progressive AL Existing Quote Step.');
        try {
          await page.goto(progressiveRater.SEARCH_QUOTE_URL, { waitUntil: 'load' });
          await page.waitForSelector('#LastName');
          await page.evaluate((lastName) => { (document.getElementById('LastName')).value = lastName.value; }, populatedData.lastName);
          await page.evaluate((firstName) => { (document.getElementById('FirstName')).value = firstName.value; }, populatedData.firstName);
          await page.evaluate((policyEffectiveDate) => { (document.getElementById('DateStart')).value = policyEffectiveDate.value; }, populatedData.policyEffectiveDate);
          await page.evaluate((priorPolicyTerminationDate) => { (document.getElementById('DateEnd')).value = priorPolicyTerminationDate.value; }, populatedData.priorPolicyTerminationDate);
          await page.type(populatedData.agentCode.element, populatedData.agentCode.value);
          await page.type('select[id="State"]', 'AL');
          await page.select(populatedData.quoteStatus.element, populatedData.quoteStatus.value);
          await page.evaluate(() => document.querySelector('#products_AU').click());
          await page.waitFor(200);
          await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
          await page.evaluate(() => document.querySelector('.insuredNameLink').click());
        } catch (error) {
          console.log('Error at Progressive AL Existing Quote Step:', error);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at progressive AL Existing Step',
          };
        }
      }

      async function namedInsuredStep() {
        console.log('Progressive AL Named Insured Step.');
        try {
          await pageQuote.waitForSelector('#policy');

          await pageQuote.evaluate((policyEffectiveDate) => { (document.getElementById(policyEffectiveDate.elementId)).value = policyEffectiveDate.value; }, populatedData.policyEffectiveDate);
          await pageQuote.evaluate((firstName) => { (document.querySelector(firstName.element)).value = firstName.value; }, populatedData.firstName);
          await pageQuote.evaluate((lastName) => { (document.querySelector(lastName.element)).value = lastName.value; }, populatedData.lastName);

          await pageQuote.evaluate(dateOfBirth => (document.querySelector(dateOfBirth.element)).value = dateOfBirth.value, populatedData.dateOfBirth);

          await pageQuote.evaluate(email => (document.querySelector(email.element)).value = email.value, populatedData.email);
          await pageQuote.evaluate(phone => (document.querySelector(phone.element)).value = phone.value, populatedData.phone);

          await pageQuote.evaluate(mailingAddress => (document.querySelector(mailingAddress.element)).value = mailingAddress.value, populatedData.mailingAddress);
          await pageQuote.evaluate(city => (document.querySelector(city.element)).value = city.value, populatedData.city);

          const states = await pageQuote.evaluate(getSelectValues, `${populatedData.state.element}>option`);
          const state = await pageQuote.evaluate(getValToSelect, states, populatedData.state.value);
          await pageQuote.select(populatedData.state.element, state);

          await pageQuote.evaluate(zipCode => (document.getElementById(zipCode.elementId)).value = zipCode.value, populatedData.zipCode);

          const lenOfResInsd = await pageQuote.evaluate(getSelectValues, `${populatedData.lengthAtAddress.element}>option`);
          const lenOfRes = await pageQuote.evaluate(getValToSelect, lenOfResInsd, populatedData.lengthAtAddress.value);
          await pageQuote.select(populatedData.lengthAtAddress.element, lenOfRes);
          await pageQuote.select(populatedData.finStblQstn.element, populatedData.finStblQstn.value);

          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        } catch (err) {
          console.log('Error at Progressive AL Named Insured Step:', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at namedInsuredStep',
          };
          browser.close();
          return next();
        }
      }

      async function vehicleStep() {
        console.log('Progressive AL Vehicle Step.');
        try {
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('img[id="VEH.0.add"]');
          for (const j in bodyData.vehicles) {
            if (j < bodyData.vehicles.length - 1) {
              const addElement = await pageQuote.$('[id="VEH.0.add"]');
              await addElement.click();
              await pageQuote.waitFor(1000);
            }
          }

          for (const j in bodyData.vehicles) {

            await pageQuote.type(populatedData[`vehicleVin${j}`].element, populatedData[`vehicleVin${j}`].value);
            await pageQuote.click(populatedData[`vehicleVin${j}`].buttonId);
            await pageQuote.waitFor(2000);
            if (!bodyData.vehicles[j].vehicleVin) {
              await pageQuote.waitForSelector(populatedData[`vehicleYear${j}`].element);
              const modelYears = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleYear${j}`].element}>option`);
              let modelYear = await pageQuote.evaluate(getValToSelect, modelYears, populatedData[`vehicleYear${j}`].value);
              if (!modelYear) {
                modelYear = modelYears[0].value;
              }
              await pageQuote.select(populatedData[`vehicleYear${j}`].element, modelYear);

              dismissDialog(pageQuote);

              await pageQuote.waitFor(1200);
              const vehiclesMake = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleMake${j}`].element}>option`);
              let vehicleMake = await pageQuote.evaluate(getValToSelect, vehiclesMake, populatedData[`vehicleMake${j}`].value);
              if (!vehicleMake) {
                vehicleMake = vehiclesMake[0].value;
              }
              await pageQuote.select(populatedData[`vehicleMake${j}`].element, vehicleMake);

              await pageQuote.waitFor(1200);
              const vehMdlNames = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleModel${j}`].element}>option`);
              let vehMdlName = await pageQuote.evaluate(getValToSelect, vehMdlNames, populatedData[`vehicleModel${j}`].value);
              if (!vehMdlName) {
                vehMdlName = vehMdlNames[0].value;
              }
              await pageQuote.select(populatedData[`vehicleModel${j}`].element, vehMdlName);

              await pageQuote.waitFor(1200);
              const vehStyles = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleBody${j}`].element}>option`);
              let vehStyle = await pageQuote.evaluate(getValToSelect, vehStyles, populatedData[`vehicleBody${j}`].value);
              if (!vehStyle) {
                vehStyle = vehStyles[0].value;
              }
              await pageQuote.select(populatedData[`vehicleBody${j}`].element, vehStyle);
            }
            await pageQuote.type(populatedData[`vehicleZipCode${j}`].element, populatedData[`vehicleZipCode${j}`].value);

            const vehLenOfOwns = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleLengthOfOwnership${j}`].element}>option`);
            const vehLenOfOwn = await pageQuote.evaluate(getValToSelect, vehLenOfOwns, populatedData[`vehicleLengthOfOwnership${j}`].value);
            await pageQuote.select(populatedData[`vehicleLengthOfOwnership${j}`].element, vehLenOfOwn);

            const vehUses = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehiclePrimaryUse${j}`].element}>option`);
            const vehUse = await pageQuote.evaluate(getValToSelect, vehUses, populatedData[`vehiclePrimaryUse${j}`].value);
            await pageQuote.select(populatedData[`vehiclePrimaryUse${j}`].element, vehUse);
            await pageQuote.select(populatedData[`vehicleCrossSell${j}`].element, populatedData[`vehicleCrossSell${j}`].value);

            await pageQuote.waitForSelector(populatedData[`vehicleUsedForRideshare${j}`].element);
            await pageQuote.select(populatedData[`vehicleUsedForRideshare${j}`].element, populatedData[`vehicleUsedForRideshare${j}`].value);

            await pageQuote.waitForSelector(populatedData[`vehiclePrimaryUsedForDelivery${j}`].element);
            await pageQuote.select(populatedData[`vehiclePrimaryUsedForDelivery${j}`].element, populatedData[`vehiclePrimaryUsedForDelivery${j}`].value);
            try {
              await pageQuote.select(populatedData[`vehicleAutomaticBraking${j}`].element, populatedData[`vehicleAutomaticBraking${j}`].value);
            } catch (e) {
              console.log('vehicleAutomaticBraking field not found');
            }
          }
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        } catch (err) {
          console.log('Error at Progressive AL Vehicle Step:', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at vehicleStep',
          };
          browser.close();
          return next();
        }
      }

      // driver Form
      async function driverStep() {
        console.log('Progressive AL Driver Step.');
        try {
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('img[id="DRV.0.add"]');
          for (const j in bodyData.drivers) {
            if (j < bodyData.drivers.length - 1) {
              const addElement = await pageQuote.$('[id="DRV.0.add"]');
              await addElement.click();
              await pageQuote.waitFor(1000);
            }
          }
          for (const j in bodyData.drivers) {
            if (j === 0) {
              await pageQuote.waitForSelector(populatedData[`driverFirstName${j}`].element);
            }

            await pageQuote.evaluate(driverFirstName => (document.querySelector(driverFirstName.element)).value = driverFirstName.value, populatedData[`driverFirstName${j}`]);
            await pageQuote.evaluate(driverLastName => (document.querySelector(driverLastName.element)).value = driverLastName.value, populatedData[`driverLastName${j}`]);
            await pageQuote.evaluate(driverDateOfBirth => (document.getElementById(driverDateOfBirth.elementId)).value = driverDateOfBirth.value, populatedData[`driverDateOfBirth${j}`]);

            const genders = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverGender${j}`].element}>option`);
            const gender = await pageQuote.evaluate(getValToSelect, genders, populatedData[`driverGender${j}`].value);
            await pageQuote.waitFor(600);
            await pageQuote.select(populatedData[`driverGender${j}`].element, gender);

            const maritalStatuss = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverMaritalStatus${j}`].element}>option`);
            const maritalStatus = await pageQuote.evaluate(getValToSelect, maritalStatuss, populatedData[`driverMaritalStatus${j}`].value);
            await pageQuote.select(populatedData[`driverMaritalStatus${j}`].element, maritalStatus);

            const drvrRelationships = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverRelationship${j}`].element}>option`);
            const drvrRelationship = await pageQuote.evaluate(getValToSelect, drvrRelationships, populatedData[`driverRelationship${j}`].value);
            await pageQuote.select(populatedData[`driverRelationship${j}`].element, drvrRelationship);
            await pageQuote.waitFor(600);

            await pageQuote.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);

            const drvrYearsLics = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverYearsLicensed${j}`].element}>option`);
            const drvrYearsLic = await pageQuote.evaluate(getValToSelect, drvrYearsLics, populatedData[`driverYearsLicensed${j}`].value);
            await pageQuote.select(populatedData[`driverYearsLicensed${j}`].element, drvrYearsLic);
            await pageQuote.waitFor(600);

            await pageQuote.select(populatedData[`driverStatus${j}`].element, populatedData[`driverStatus${j}`].value);

            await pageQuote.waitFor(600);
            const drvrEmplStats = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverEmployment${j}`].element}>option`);
            let drvrEmplStat = await pageQuote.evaluate(getValToSelect, drvrEmplStats, populatedData[`driverEmployment${j}`].value);
            if (!drvrEmplStat) {
              drvrEmplStat = drvrEmplStats[0].value;
            }
            await pageQuote.select(populatedData[`driverEmployment${j}`].element, drvrEmplStat);
            await pageQuote.waitFor(600);

            await pageQuote.waitFor(600);
            const drvOccStats = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverOccupation${j}`].element}>option`);
            let drvrOccStat = await pageQuote.evaluate(getValToSelect, drvOccStats, populatedData[`driverOccupation${j}`].value);
            if (!drvrOccStat) {
              drvrOccStat = drvOccStats[0].value;
            }
            await pageQuote.select(populatedData[`driverOccupation${j}`].element, drvrOccStat);
            await pageQuote.waitFor(600);

            const drvrEdLvls = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverEducation${j}`].element}>option`);
            let drvrEdLvl = await pageQuote.evaluate(getValToSelect, drvrEdLvls, populatedData[`driverEducation${j}`].value);
            if (!drvrEdLvl) {
              drvrEdLvl = drvrEdLvls[0].value;
            }
            await pageQuote.waitFor(300);
            await pageQuote.select(populatedData[`driverEducation${j}`].element, drvrEdLvl);

            await pageQuote.waitFor(600);
            await pageQuote.select(populatedData[`driverStateFiling${j}`].element, populatedData[`driverStateFiling${j}`].value);
          }

          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        } catch (err) {
          console.log('Error at Progressive AL Driver Step:', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at driverStep',
          };
          browser.close();
          return next();
        }
      }

      async function violationStep() {
        console.log('Progressive AL Violation Step.');

        try {
          await pageQuote.waitForSelector(populatedData.priorIncident0.element);

          const drvrViolCdS = await pageQuote.evaluate(getSelectValues, `${populatedData.priorIncident0.element}>option`);
          const drvrViolCd = await pageQuote.evaluate(getValToSelect, drvrViolCdS, populatedData.priorIncident0.value);

          for (const j in bodyData.drivers) {
            if (await pageQuote.$(populatedData[`priorIncident${j}`].element) !== null) {
              await pageQuote.select(populatedData[`priorIncident${j}`].element, drvrViolCd);
              await pageQuote.click(populatedData[`priorIncidentDate${j}`].element);
              await pageQuote.evaluate(priorIncidentDate => (document.querySelector(priorIncidentDate.element)).value = priorIncidentDate.value, populatedData[`priorIncidentDate${j}`]);
            }
          }

          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        } catch (err) {
          console.log('Error at Progressive AL Violation Step', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at violationStep',
          };
          browser.close();
          return next();
        }
      }

      async function underwritingStep() {
        console.log('Progressive AL Underwriting Step');

        try {
          await pageQuote.waitForSelector(populatedData.priorInsuredCdInd.element);
          await pageQuote.select(populatedData.priorInsuredCdInd.element, populatedData.priorInsuredCdInd.value);

          await pageQuote.waitFor(500);
          const currInsCoCdDsply = await pageQuote.evaluate(getSelectValues, `${populatedData.priorInsuranceCarrier.element}>option`);
          const currInsCoCd = await pageQuote.evaluate(getValToSelect, currInsCoCdDsply, populatedData.priorInsuranceCarrier.value);
          await pageQuote.select(populatedData.priorInsuranceCarrier.element, currInsCoCd);

          await pageQuote.waitFor(500);
          await pageQuote.select(populatedData.priorBiLimits.element, populatedData.priorBiLimits.value);
          await pageQuote.waitFor(1000);

          await pageQuote.select(populatedData.yearsWithPriorInsurance.element, populatedData.yearsWithPriorInsurance.value);
          try {
            const numberOfResidentsInHomeOpt = await pageQuote.evaluate(getSelectValues, `${populatedData.numberOfResidentsInHome.element}>option`);
            const numberOfResidentsInHome = await pageQuote.evaluate(getValToSelect, numberOfResidentsInHomeOpt, populatedData.numberOfResidentsInHome.value);
            await pageQuote.select(populatedData.numberOfResidentsInHome.element, numberOfResidentsInHome);
            await pageQuote.waitFor(600);
          } catch (e) {
            console.log('No number Of Residents In Home', e);
          }
          await pageQuote.select(populatedData.ownOrRentPrimaryResidence.element, populatedData.ownOrRentPrimaryResidence.value);
          await pageQuote.waitFor(1000);
          await pageQuote.select(populatedData.rentersLimits.element, populatedData.rentersLimits.value);
          await pageQuote.waitFor(500);
          await pageQuote.select(populatedData.haveAnotherProgressivePolicy.element, populatedData.haveAnotherProgressivePolicy.value);
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await errorStep();
        } catch (err) {
          console.log('Error at Progressive AL Underwriting Step:', err);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at underwritingStep',
          };
          browser.close();
          return next();
        }
      }

      async function errorStep() {
        try {
          console.log('Progressive AL Error Step.');
          await pageQuote.waitForSelector('#ctl00_ContentPlaceHolder1__errorTable', { timeout: 5000 });
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error in data',
          };
          browser.close();
          return next();
        } catch (e) {
          // await coveragesStep(pageQuote);
        }
      }

      async function coveragesStep() {
        try {
          console.log('Progressive AL Coverages Step.');
          await pageQuote.waitFor(4000);
          await pageQuote.waitForSelector('#pol_ubi_exprnc.madParticipateItem');
          await pageQuote.select('#pol_ubi_exprnc', 'N');

          for (const j in bodyData.coverage) {
            await pageQuote.select(`#VEH\\.${j}\\.veh_use_ubi`, 'Y');

            const liabilityOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.veh_liab"]>option`);
            const liabilityValue = await pageQuote.evaluate(selectSubStringOption, liabilityOptions, bodyData.coverage[j].Liability);
            await pageQuote.select(`select[name="VEH.${j}.veh_liab"]`, liabilityValue);

            const bipdOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.BIPD"]>option`);
            const bipdValue = await pageQuote.evaluate(selectSubStringOption, bipdOptions, bodyData.coverage[j].BIPD);
            await pageQuote.select(`select[name="VEH.${j}.BIPD"]`, bipdValue);

            const umuimOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.UMUIM"]>option`);
            const umuimValue = await pageQuote.evaluate(selectSubStringOption, umuimOptions, bodyData.coverage[j].UMUIM);
            await pageQuote.select(`select[name="VEH.${j}.UMUIM"]`, umuimValue);

            const medPayOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.MEDPAY"]>option`);
            const medPayValue = await pageQuote.evaluate(selectSubStringOption, medPayOptions, bodyData.coverage[j].MEDPAY);
            await pageQuote.select(`select[name="VEH.${j}.MEDPAY"]`, medPayValue);

            const compOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.COMP"]>option`);
            const compValue = await pageQuote.evaluate(selectSubStringOption, compOptions, bodyData.coverage[j].COMP);
            await pageQuote.select(`select[name="VEH.${j}.COMP"]`, compValue);

            const colOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.COLL"]>option`);
            const colValue = await pageQuote.evaluate(selectSubStringOption, colOptions, bodyData.coverage[j].COLL);
            await pageQuote.select(`select[name="VEH.${j}.COLL"]`, colValue);

            const rentOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.RENT"]>option`);
            const rentValue = await pageQuote.evaluate(selectSubStringOption, rentOptions, bodyData.coverage[j].RENTAL);
            await pageQuote.select(`select[name="VEH.${j}.RENT"]`, rentValue);

            const roadsideOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.ROADSD"]>option`);
            const roadsideValue = await pageQuote.evaluate(selectSubStringOption, roadsideOptions, bodyData.coverage[j].ROADSIDE);
            await pageQuote.select(`select[name="VEH.${j}.ROADSD"]`, roadsideValue);

            const payoffOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.PAYOFF"]>option`);
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

        } catch (error) {
          console.log('Error at Progressive AL Coverages Step:', error);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at coveragesStep',
          };
          browser.close();
          return next();
        }
      }

      async function summaryStep() {
        try {
          console.log('Progressive AL Summary Step.');
          await pageQuote.waitFor(6000);
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
          await pageQuote.click('#ctl00_HeaderLinksControl_SaveLink');

          req.session.data = {
            title: 'Successfully retrieved progressive AL rate.',
            status: true,
            response: premiumDetails,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
          };
          browser.close();
          return next();
        } catch (error) {
          console.log('Error at Progressive AL Process Data Step:', error);
          req.session.data = {
            title: 'Failed to retrieved Progressive AL rate.',
            status: false,
            error: 'There is some error validations at summaryStep',
          };
          browser.close();
          return next();
        }
      }

    } catch (error) {
      console.log('Error at Progressive AL :', error);
      return next(Boom.badRequest('Failed to retrieved progressive AL rate.'));
    }
  },
};
