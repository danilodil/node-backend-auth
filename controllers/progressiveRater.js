/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,no-nested-ternary,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { rater } = require('../constants/appConstant');

module.exports = {
  rateDelaware: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      // const browser = await puppeteer.launch({ headless:false });
      let page = await browser.newPage();
      const staticDetailsObj = {
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '12/16/1993',
        email: 'test@mail.com',
        phone: '302-222-5555',
        mailingAddress: '216 Humphreys Dr',
        city: 'Dover',
        state: 'DE',
        zipCode: '19934',
        lengthAtAddress: '1 year or more',
        priorInsurance: 'Yes',
        priorInsuranceCarrier: 'USAA',
        // must always agree to closure
        vehicles: [
          {
            // Vehicle Type will always be 1981 or newer
            vehicleVin: '1FTSF30L61EC23425',
            year: '2015',
            make: 'FORD',
            model: 'F350',
            vehicleBodyStyle: 'EXT CAB (8CYL 4x2)',
            zipCode: '19934',
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
            occupation:'Appraiser - Real Estate',
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

      const bodyData = await cleanObj(req.body.data);
      bodyData.drivers.splice(9, bodyData.drivers.length); // you can add max 12 drivers
      // For login
      await loginStep();

      // For Login
      async function loginStep() {
        await page.goto(rater.LOGIN_URL, { waitUntil: 'load' }); // wait until page load
        await page.waitForSelector('#user1');
        await page.type('#user1', username);
        await page.type('#password1', password);

        await page.click('#image1');
        await page.waitFor(1000);
        // await page.waitForNavigation({ timeout: 0 });
        const populatedData = await populateKeyValueData(bodyData);
        await newQuoteStep(populatedData);
      }

      // For redirect to new quoate form
      async function newQuoteStep(populatedData) {
        console.log('newQuoteStep');

        const AllPages = await browser.pages();
        if (AllPages.length > 2) {
          for (let i = 2; i < AllPages.length; i += 1) {
            await AllPages[i].close();
          }
        }

        await page.goto(rater.NEW_QUOTE_URL, { waitUntil: 'load' });

        await page.waitForSelector('#QuoteStateList');
        await page.select('#QuoteStateList', 'DE');
        await page.select('#Prds', 'AU');
        await page.waitFor(1000);
        await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());


        while (true) {
          await page.waitFor(1000);
          const pageQuote = await browser.pages();
          if (pageQuote.length > 2) {
            page = pageQuote[2];
            break;
          }
        }
        await namedInsuredStep(populatedData);
      }

      // For Named Insured Form
      async function namedInsuredStep(populatedData) {
        console.log('namedInsuredStep');
        try {
          await page.waitForSelector('#policy');
          await page.waitFor(1000);

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
              title: 'Middle Initial:',
              element: 'DRV.0.drvr_mid_nam',
              value: bodyData.middleName || staticDetailsObj.middleName,
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
              value: bodyData.birthDate || staticDetailsObj.suffixName,
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
          await page.evaluate((namedInsuredElement) => {
            namedInsuredElement.forEach((oneElement) => {
              document.getElementById(oneElement.element).value = oneElement.value;
            });
          }, namedInsured);

          const lenOfResInsd = await page.evaluate(getSelctVal, `${populatedData.lengthAtAddress.element}>option`);
          const lenOfRes = await page.evaluate(getValToSelect, lenOfResInsd, populatedData.lengthAtAddress.value);
          await page.select(populatedData.lengthAtAddress.element, lenOfRes);
          await page.waitFor(500);

          const prirInsInd = await page.evaluate(getSelctVal, `${populatedData.priorInsurance.element}>option`);
          const prirIns = await page.evaluate(getValToSelect, prirInsInd, populatedData.priorInsurance.value);
          await page.select(populatedData.priorInsurance.element, prirIns);

          await page.waitFor(500);
          const currInsCoCdDsply = await page.evaluate(getSelctVal, `${populatedData.priorInsuranceCarrier.element}>option`);
          const currInsCoCd = await page.evaluate(getValToSelect, currInsCoCdDsply, populatedData.priorInsuranceCarrier.value);
          await page.select(populatedData.priorInsuranceCarrier.element, currInsCoCd);

          await page.waitFor(500);
          await page.select(populatedData.finStblQstn.element, populatedData.finStblQstn.value);

          await page.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
        } catch (err) {
          const response = { error: 'There is some error validations at namedInsuredStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        await vehicleStep(populatedData);
      }

      // For Vehicles Form
      async function vehicleStep(populatedData) {
        console.log('vehicleStep');
        try {
          await page.waitFor(2000);
          await page.waitForSelector('#VEH\\.0\\.add');
          for (const j in bodyData.vehicles) {
            if (j < bodyData.vehicles.length - 1) {
              const addElement = await page.$('[id="VEH.0.add"]');
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
            dismissDialog(page);
            await page.evaluate((vehicleElement) => {
              vehicleElement.forEach((oneElement) => {
                document.getElementById(oneElement.element).value = oneElement.value;
              });
            }, vehicle);

            const yesrDisplay = await page.evaluate(getSelctVal, `select[id='VEH.${j}.veh_mdl_yr']>option`);
            const yearSelected = await page.evaluate(getValToSelect, yesrDisplay, bodyData.vehicles[j].year);
            await page.select(`select[id='VEH.${j}.veh_mdl_yr']`, yearSelected);
            await page.waitFor(500);

            const makeDisplay = await page.evaluate(getSelctVal, `select[id='VEH.${j}.veh_make']>option`);
            let makeSelected = await page.evaluate(getValToSelect, makeDisplay, bodyData.vehicles[j].make);
            if (!makeSelected) {
              makeSelected = makeDisplay[0].value;
            }
            await page.select(`select[id='VEH.${j}.veh_make']`, makeSelected);
            await page.waitFor(500);

            const modelDisplay = await page.evaluate(getSelctVal, `select[id='VEH.${j}.veh_mdl_nam']>option`);
            let modelSelected = await page.evaluate(getValToSelect, modelDisplay, bodyData.vehicles[j].model);
            if (!modelSelected) {
              modelSelected = modelDisplay[0].value;
            }
            await page.select(`select[id='VEH.${j}.veh_mdl_nam']`, modelSelected);
            await page.waitFor(500);

            const bodyDisplay = await page.evaluate(getSelctVal, `select[id='VEH.${j}.veh_sym_sel']>option`);
            let bodySelected = await page.evaluate(getValToSelect, bodyDisplay, bodyData.vehicles[j].vehicleBodyStyle);
            if (!bodySelected) {
              bodySelected = bodyDisplay[0].value;
            }
            await page.select(`select[id='VEH.${j}.veh_sym_sel']`, bodySelected);

            const vehLenOfOwns = await page.evaluate(getSelctVal, `${populatedData[`vehicleLengthOfOwnership${j}`].element}>option`);
            let vehLenOfOwn = await page.evaluate(getValToSelect, vehLenOfOwns, populatedData[`vehicleLengthOfOwnership${j}`].value);
            if (!vehLenOfOwn) {
              vehLenOfOwn = vehLenOfOwns[0].value;
            }
            await page.select(populatedData[`vehicleLengthOfOwnership${j}`].element, vehLenOfOwn);

            const vehUses = await page.evaluate(getSelctVal, `${populatedData[`vehiclePrimaryUse${j}`].element}>option`);
            const vehUse = await page.evaluate(getValToSelect, vehUses, populatedData[`vehiclePrimaryUse${j}`].value);
            await page.select(populatedData[`vehiclePrimaryUse${j}`].element, vehUse);
          }
          await page.waitFor(2000);
          await page.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
        } catch (err) {
          console.log('err vehicleStep:', err.satck);
          const response = { error: 'There is some error validations at vehicleStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        await driverStep(populatedData);
      }

      // For driver Form
      async function driverStep(populatedData) {
        console.log('driverStep');
        try {
          await page.waitFor(2000);
          await page.waitForSelector('#DRV\\.0\\.add');
          for (const j in bodyData.drivers) {
            if (j < bodyData.drivers.length - 1) {
              await page.click('#DRV\\.0\\.add');
              await page.waitFor(1000);
            }
          }
          for (const j in bodyData.drivers) {
            await page.waitForSelector(`#DRV\\.${j}\\.drvr_frst_nam`);
            await page.waitFor(600);

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
            await page.evaluate((driverElement) => {
              driverElement.forEach((oneElement) => {
                document.getElementById(oneElement.element).value = oneElement.value;
              });
            }, driver);
            await page.evaluate(ddob => document.querySelector(ddob.element).value = ddob.value, populatedData[`driverDateOfBirth${j}`]);
            const genders = await page.evaluate(getSelctVal, `${populatedData[`driverGender${j}`].element}>option`);
            const gender = await page.evaluate(getValToSelect, genders, populatedData[`driverGender${j}`].value);
            await page.waitFor(600);
            await page.click(populatedData[`driverGender${j}`].element);
            await page.select(populatedData[`driverGender${j}`].element, gender);
            const maritalStatuss = await page.evaluate(getSelctVal, `${populatedData[`driverMaritalStatus${j}`].element}>option`);
            const maritalStatus = await page.evaluate(getValToSelect, maritalStatuss, populatedData[`driverMaritalStatus${j}`].value);
            await page.select(populatedData[`driverMaritalStatus${j}`].element, maritalStatus);
            if (populatedData[`driverRelationship${j}`]) {
              const drvrRelationships = await page.evaluate(getSelctVal, `${populatedData[`driverRelationship${j}`].element}>option`);
              const drvrRelationship = await page.evaluate(getValToSelect, drvrRelationships, populatedData[`driverRelationship${j}`].value);
              await page.select(populatedData[`driverRelationship${j}`].element, drvrRelationship);
            }
            await page.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);
            const drvrYearsLics = await page.evaluate(getSelctVal, `${populatedData[`driverYearsLicensed${j}`].element}>option`);
            const drvrYearsLic = await page.evaluate(getValToSelect, drvrYearsLics, populatedData[`driverYearsLicensed${j}`].value);
            await page.select(populatedData[`driverYearsLicensed${j}`].element, drvrYearsLic);
            await page.waitFor(600);
            const driverStatusOpt = await page.evaluate(getSelctVal, `${populatedData[`driverStatus${j}`].element}>option`);
            let driverStatus = await page.evaluate(getValToSelect, driverStatusOpt, populatedData[`driverStatus${j}`].value);
            if(!driverStatus){
              driverStatus=driverStatusOpt[0].value
            }
            await page.select(populatedData[`driverStatus${j}`].element, driverStatus);
            await page.waitFor(600);
            const drvrEmplStats = await page.evaluate(getSelctVal, `${populatedData[`driverEmployment${j}`].element}>option`);
            let drvrEmplStat = await page.evaluate(getValToSelect, drvrEmplStats, populatedData[`driverEmployment${j}`].value);
            if(!drvrEmplStat){
              drvrEmplStat=drvrEmplStats[0].value
            }
            await page.select(populatedData[`driverEmployment${j}`].element, drvrEmplStat);
            await page.waitFor(600);
            const drvOccStats = await page.evaluate(getSelctVal, `${populatedData[`driverOccupation${j}`].element}>option`);
            let drvrOccStat = await page.evaluate(getValToSelect, drvOccStats, populatedData[`driverOccupation${j}`].value);
            if(!drvrOccStat){
              drvrOccStat = drvOccStats[0].value
            }
            await page.select(populatedData[`driverOccupation${j}`].element, drvrOccStat);
            await page.waitFor(600);
            const drvrEdLvls = await page.evaluate(getSelctVal, `${populatedData[`driverEducation${j}`].element}>option`);
            let drvrEdLvl = await page.evaluate(getValToSelect, drvrEdLvls, populatedData[`driverEducation${j}`].value);
            if(!drvrEdLvl){
              drvrEdLvl=drvrEdLvls[0].value
            }
            await page.select(populatedData[`driverEducation${j}`].element, drvrEdLvl);
            await page.click(populatedData[`driverStateFiling${j}`].element);
            await page.select(populatedData[`driverStateFiling${j}`].element, populatedData[`driverStateFiling${j}`].value);
            await page.click(populatedData[`driverAdvTraining${j}`].element);
            await page.select(populatedData[`driverAdvTraining${j}`].element, populatedData[`driverAdvTraining${j}`].value);
          }
          await page.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        } catch (err) {
          console.log('err driverStep:', err);
          const response = { error: 'There is some error validations at driverStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        await violationStep(page, bodyData, populatedData);
      }

      // For Violations Form
      async function violationStep(pageQuote, dataObject, populatedData) {
        console.log('violationStep');

        try {
          await pageQuote.waitForSelector(populatedData.priorIncident0.element);
          const drvrViolCdS = await pageQuote.evaluate(getSelctVal, `${populatedData.priorIncident0.element}>option`);
          const drvrViolCd = await pageQuote.evaluate(getValToSelect, drvrViolCdS, populatedData.priorIncident0.value);
          const priorIncidentDate = populatedData.priorIncidentDate0.value;
          for (const j in dataObject.drivers) {
            if (await pageQuote.$(populatedData[`priorIncident${j}`].element) !== null) {
              await pageQuote.select(populatedData[`priorIncident${j}`].element, drvrViolCd);
              await pageQuote.click(populatedData[`priorIncidentDate${j}`].element);
              await pageQuote.type(populatedData[`priorIncidentDate${j}`].element, priorIncidentDate);
            }
          }
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        } catch (err) {
          console.log('err violationStep', err);
          const response = { error: 'There is some error validations at violationStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        await underwritingStep(pageQuote, dataObject, populatedData);
      }

      // For Underwriting Form
      async function underwritingStep(pageQuote, dataObject, populatedData) {
        console.log('underwritingStep');
        dataObject.results = {};

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
        } catch (err) {
          console.log('err underwritingStep ', err);
          const response = { error: 'There is some error validations at underwritingStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        await errorStep(pageQuote, dataObject);
      }

      async function errorStep(pageQuote, dataObject) {
        try {
          console.log('errorStep');
          await pageQuote.waitFor(4000);
          await pageQuote.waitForSelector('#V_GET_ERROR_MESSAGE', { timeout: 4000 });
          const response = { error: 'There is some error in data' };
          dataObject.results = {
            status: false,
            response,
          };
        } catch (e) {
          await coveragesStep(pageQuote, dataObject);
        }
      }

      async function coveragesStep(pageQuote, dataObject) {
        console.log('coveragesStep');
        await pageQuote.waitFor(2000);
        await pageQuote.waitForSelector('#pol_ubi_exprnc.madParticipateItem');
        await pageQuote.select('#pol_ubi_exprnc', 'N');
        // pageQuote.on('console', msg => console.log('PAGE LOG:', msg._text));

        for (const j in dataObject.coverage) {
          await pageQuote.select(`#VEH\\.${j}\\.veh_use_ubi`, 'Y');

          const liabilityOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.veh_liab"]>option`);
          const liabilityValue = await pageQuote.evaluate(selectSubStringOption, liabilityOptions, dataObject.coverage[j].Liability);
          await pageQuote.select(`select[name="VEH.${j}.veh_liab"]`, liabilityValue);

          const bipdOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.BIPD"]>option`);
          const bipdValue = await pageQuote.evaluate(selectSubStringOption, bipdOptions, dataObject.coverage[j].BIPD);
          await pageQuote.select(`select[name="VEH.${j}.BIPD"]`, bipdValue);

          const umuimOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.UMUMPD"]>option`);
          const umuimValue = await pageQuote.evaluate(selectSubStringOption, umuimOptions, dataObject.coverage[j].UMUIM);
          await pageQuote.select(`select[name="VEH.${j}.UMUMPD"]`, umuimValue);

          const pipOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.PIP"]>option`);
          const pipPayValue = await pageQuote.evaluate(selectSubStringOption, pipOptions, dataObject.coverage[j].PIP);
          await pageQuote.select(`select[name="VEH.${j}.PIP"]`, pipPayValue);

          const compOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.COMP"]>option`);
          const compValue = await pageQuote.evaluate(selectSubStringOption, compOptions, dataObject.coverage[j].COMP);
          await pageQuote.select(`select[name="VEH.${j}.COMP"]`, compValue);

          const colOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.COLL"]>option`);
          const colValue = await pageQuote.evaluate(selectSubStringOption, colOptions, dataObject.coverage[j].COLL);
          await pageQuote.select(`select[name="VEH.${j}.COLL"]`, colValue);

          const rentOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.RENT"]>option`);
          const rentValue = await pageQuote.evaluate(selectSubStringOption, rentOptions, dataObject.coverage[j].RENTAL);
          await pageQuote.select(`select[name="VEH.${j}.RENT"]`, rentValue);

          const roadsideOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.ROADSD"]>option`);
          const roadsideValue = await pageQuote.evaluate(selectSubStringOption, roadsideOptions, dataObject.coverage[j].ROADSIDE);
          await pageQuote.select(`select[name="VEH.${j}.ROADSD"]`, roadsideValue);

          const payoffOptions = await pageQuote.evaluate(getSelctVal, `select[name="VEH.${j}.PAYOFF"]>option`);
          const payoffValue = await pageQuote.evaluate(selectSubStringOption, payoffOptions, dataObject.coverage[j].PAYOFF);
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
        await processDataStep(pageQuote, dataObject);
      }

      async function processDataStep(pageQuote, dataObject) {
        console.log('processDataStep');
        await pageQuote.waitFor(4000);
        const downPayment = await pageQuote.evaluate(() => {
          const Elements = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.querySelectorAll('td');
          const ress = {};
          ress.total_premium = Elements[2].textContent.replace(/\n/g, '').trim();
          ress.down_pmt_amt = Elements[3].textContent.replace(/\n/g, '').trim();
          ress.pmt_amt = Elements[4].textContent.replace(/\n/g, '').trim();
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

        dataObject.results = {
          status: true,
          response: downPayment,
        };
        await pageQuote.click('#ctl00_ContentPlaceHolder1_InsuredRemindersDialog_InsuredReminders_btnOK');
        await pageQuote.click('#ctl00_HeaderLinksControl_SaveLink');
      }

      console.log('final result >> ', JSON.stringify(bodyData.results));
      req.session.data = {
        title: bodyData.results.status === true ? 'Successfully retrieved progressive DE rate.' : 'Failed to retrieved progressive DE rate.',
        obj: bodyData.results,
      };
      browser.close();
      return next();

      // For dimiss alert dialog
      function dismissDialog(page1) {
        try {
          page1.on('dialog', async (dialog) => {
            // dialog.accept();
            await dialog.dismiss();
            // await browser.close();
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

      function cleanObj(obj) {
        for (const propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
            delete obj[propName];
          }
        }
        return obj;
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

          firstName: {
            element: 'input[name="DRV.0.drvr_frst_nam"]',
            value: bodyData.firstName || staticDetailsObj.firstName,
          },
          middleName: {
            element: 'input[name="DRV.0.drvr_mid_nam"]',
            value: bodyData.middleName || staticDetailsObj.middleName,
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
            value: bodyData.mailingAddress || '',
          },
          city: {
            element: 'input[name="insd_city_cd"]',
            value: bodyData.city || '',
          },
          state: {
            element: 'select[name="insd_st_cd"]',
            value: bodyData.state || '',
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
              element: `select[name='VEH.${j}.veh_vin']`,
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
              value: element.occupation || staticDetailsObj.drivers[0].occupation,
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
              value: element.relationship || staticDetailsObj.drivers[0].relationship,
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
    } catch (error) {
      console.log('error >> ', error);
      return next(Boom.badRequest('Failed to retrieved progressive DE rate.'));
    }
  },
  rateAlabama: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      // const browser = await puppeteer.launch({ headless: false });
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
            occupation:'Appraiser - Real Estate'
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
        priorIncident: '',
        priorIncidentDate: '',
        policyEffectiveDate: '04/30/2019',
        priorPolicyTerminationDate: '03/15/2019',
        yearsWithPriorInsurance: '5 years or more',
        ownOrRentPrimaryResidence: 'Rent',
        numberOfResidentsInHome: '3',
        rentersLimits: 'Greater Than 300,000',
        haveAnotherProgressivePolicy: 'No',
      };
      const bodyData = await cleanObj(req.body.data);
      bodyData.drivers.splice(9, bodyData.drivers.length);
      bodyData.results = {};

      function cleanObj(obj) {
        for (const propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
            delete obj[propName];
          }
        }
        return obj;
      }

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

          firstName: {
            element: 'input[name="DRV.0.drvr_frst_nam"]',
            value: bodyData.firstName || staticDetailsObj.firstName,
          },
          middleName: {
            element: 'input[name="DRV.0.drvr_mid_nam"]',
            value: bodyData.middleName || staticDetailsObj.middleName,
          },
          lastName: {
            element: 'input[name="DRV.0.drvr_lst_nam"]',
            value: bodyData.lastName || staticDetailsObj.lastName,
          },
          // suffixName: {
          //   element: 'select[name="DRV.0.drvr_sfx_nam"]',
          //   value: bodyData.suffixName || staticDetailsObj.suffixName,
          // },
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
              element: `select[name='VEH.${j}.veh_vin']`,
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
                //value: element.relationship || staticDetailsObj.drivers[0].relationship,
                value:'Other'
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
      function dismissDialog(page1) {
        try {
          page1.on('dialog', async (dialog) => {
            await dialog.dismiss();
            // await browser.close();
          });
        } catch (e) {
          console.log('e', e);
        }
      }

      // Login
      async function loginStep() {
        await page.goto(rater.LOGIN_URL, { waitUntil: 'load' }); // wait until page load
        await page.waitForSelector('#user1');
        await page.type('#user1', username);
        await page.type('#password1', password);

        await page.click('#image1');
        await page.waitForNavigation({ timeout: 0 });
        const populatedData = await populateKeyValueData(bodyData);
        await newQuoteStep(bodyData, populatedData);
      }

      // redirect to new quoate form
      async function newQuoteStep(dataObject, populatedData) {
        console.log('newQuoteStep');

        await page.goto(rater.NEW_QUOTE_URL, { waitUntil: 'load' });
        await page.waitForSelector(populatedData.newQuoteState.element);
        await page.select(populatedData.newQuoteState.element, populatedData.newQuoteState.value);
        await page.select(populatedData.newQuoteProduct.element, populatedData.newQuoteProduct.value);

        await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());

        let pageQuote = '';
        while (true) {
          await page.waitFor(1000);
          pageQuote = await browser.pages();
          if (pageQuote.length > 2) {
            pageQuote = pageQuote[2];
            break;
          }
        }

        await namedInsuredStep(pageQuote, dataObject, populatedData);
      }

      // Named Insured Form
      async function namedInsuredStep(pageQuote, dataObject, populatedData) {
        console.log('namedInsuredStep');
        try {
          await pageQuote.waitForSelector('#policy');

          await pageQuote.evaluate((policyEffectiveDate) => { (document.getElementById(policyEffectiveDate.elementId)).value = policyEffectiveDate.value; }, populatedData.policyEffectiveDate);
          await pageQuote.evaluate((firstName) => { (document.querySelector(firstName.element)).value = firstName.value; }, populatedData.firstName);
          await pageQuote.evaluate((middleName) => { (document.querySelector(middleName.element)).value = middleName.value; }, populatedData.middleName);
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
          await vehicleStep(pageQuote, dataObject, populatedData);
        } catch (err) {
          console.log('err namedInsuredStep:', err);
          const response = { error: 'There is some error validations at namedInsuredStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      // Vehicles Form
      async function vehicleStep(pageQuote, dataObject, populatedData) {
        console.log('vehicleStep');
        try {
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('img[id="VEH.0.add"]');
          for (const j in dataObject.vehicles) {
            if (j < dataObject.vehicles.length - 1) {
              const addElement = await pageQuote.$('[id="VEH.0.add"]');
              await addElement.click();
              await pageQuote.waitFor(1000);
            }
          }

          for (const j in dataObject.vehicles) {
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
            try{
              await pageQuote.select(populatedData[`vehicleAutomaticBraking${j}`].element, populatedData[`vehicleAutomaticBraking${j}`].value);
            }catch(e){
              console.log('no vehicleAutomaticBraking field');
            }
          }
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await driverStep(pageQuote, dataObject, populatedData);
        } catch (err) {
          console.log('err vehicleStep:', err);
          const response = { error: 'There is some error validations at vehicleStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      // driver Form
      async function driverStep(pageQuote, dataObject, populatedData) {
        console.log('driverStep');
        try {
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('img[id="DRV.0.add"]');
          for (const j in dataObject.drivers) {
            if (j < dataObject.drivers.length - 1) {
              const addElement = await pageQuote.$('[id="DRV.0.add"]');
              await addElement.click();
              await pageQuote.waitFor(1000);
            }
          }
          for (const j in dataObject.drivers) {
            console.log(' j >>>>>',j);
            if (j === 0) {
              await pageQuote.waitForSelector(populatedData[`driverFirstName${j}`].element);
            }
            // await pageQuote.waitFor(600);


            await pageQuote.evaluate(driverFirstName => (document.querySelector(driverFirstName.element)).value = driverFirstName.value, populatedData[`driverFirstName${j}`]);
            await pageQuote.evaluate(driverLastName => (document.querySelector(driverLastName.element)).value = driverLastName.value, populatedData[`driverLastName${j}`]);

            // await pageQuote.waitFor(600);
            await pageQuote.evaluate(driverDateOfBirth => (document.getElementById(driverDateOfBirth.elementId)).value = driverDateOfBirth.value, populatedData[`driverDateOfBirth${j}`]);
            // await pageQuote.waitFor(600);

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

            // await pageQuote.waitFor(600);
            await pageQuote.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);
            // await pageQuote.waitFor(600);

            const drvrYearsLics = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverYearsLicensed${j}`].element}>option`);
            const drvrYearsLic = await pageQuote.evaluate(getValToSelect, drvrYearsLics, populatedData[`driverYearsLicensed${j}`].value);
            await pageQuote.select(populatedData[`driverYearsLicensed${j}`].element, drvrYearsLic);
            await pageQuote.waitFor(600);

            await pageQuote.select(populatedData[`driverStatus${j}`].element, populatedData[`driverStatus${j}`].value);

            await pageQuote.waitFor(600);
            const drvrEmplStats = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverEmployment${j}`].element}>option`);
            let drvrEmplStat = await pageQuote.evaluate(getValToSelect, drvrEmplStats, populatedData[`driverEmployment${j}`].value);
            if(!drvrEmplStat){
              drvrEmplStat = drvrEmplStats[0].value
            }
            await pageQuote.select(populatedData[`driverEmployment${j}`].element, drvrEmplStat);
            await pageQuote.waitFor(600);

            await pageQuote.waitFor(600);
            const drvOccStats = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverOccupation${j}`].element}>option`);
            let drvrOccStat = await pageQuote.evaluate(getValToSelect, drvOccStats, populatedData[`driverOccupation${j}`].value);
            if(!drvrOccStat){
              drvrOccStat = drvOccStats[0].value
            }
            await pageQuote.select(populatedData[`driverOccupation${j}`].element, drvrOccStat);
            await pageQuote.waitFor(600);

            const drvrEdLvls = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverEducation${j}`].element}>option`);
            let drvrEdLvl = await pageQuote.evaluate(getValToSelect, drvrEdLvls, populatedData[`driverEducation${j}`].value);
            if(!drvrEdLvl){
              drvrEdLvl = drvrEdLvls[0].value
            }
            await pageQuote.waitFor(300);
            await pageQuote.select(populatedData[`driverEducation${j}`].element, drvrEdLvl);

            await pageQuote.waitFor(600);
            await pageQuote.select(populatedData[`driverStateFiling${j}`].element, populatedData[`driverStateFiling${j}`].value);
            // await pageQuote.waitFor(600);
          }

          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await violationStep(pageQuote, dataObject, populatedData);
        } catch (err) {
          console.log('err driverStep:', err);
          const response = { error: 'There is some error validations at driverStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }


      // Violations Form
      async function violationStep(pageQuote, dataObject, populatedData) {
        console.log('violationStep');

        try {
          await pageQuote.waitForSelector(populatedData.priorIncident0.element);

          const drvrViolCdS = await pageQuote.evaluate(getSelectValues, `${populatedData.priorIncident0.element}>option`);
          const drvrViolCd = await pageQuote.evaluate(getValToSelect, drvrViolCdS, populatedData.priorIncident0.value);

          for (const j in dataObject.drivers) {
            if (await pageQuote.$(populatedData[`priorIncident${j}`].element) !== null) {
              await pageQuote.select(populatedData[`priorIncident${j}`].element, drvrViolCd);
              await pageQuote.click(populatedData[`priorIncidentDate${j}`].element);
              await pageQuote.evaluate(priorIncidentDate => (document.querySelector(priorIncidentDate.element)).value = priorIncidentDate.value, populatedData[`priorIncidentDate${j}`]);
            }
          }

          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await underwritingStep(pageQuote, dataObject, populatedData);
        } catch (err) {
          console.log('err violationStep', err);
          const response = { error: 'There is some error validations at violationStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
      }

      // Underwriting Form
      async function underwritingStep(pageQuote, dataObject, populatedData) {
        console.log('underwritingStep');

        try {
          await pageQuote.waitForSelector(populatedData.priorInsuredCdInd.element);
          // await pageQuote.waitFor(1000);
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
            console.log('no number Of Residents In Home', e);
          }
          await pageQuote.select(populatedData.ownOrRentPrimaryResidence.element, populatedData.ownOrRentPrimaryResidence.value);
          await pageQuote.waitFor(1000);
          await pageQuote.select(populatedData.rentersLimits.element, populatedData.rentersLimits.value);
          await pageQuote.waitFor(500);
          await pageQuote.select(populatedData.haveAnotherProgressivePolicy.element, populatedData.haveAnotherProgressivePolicy.value);
          // await pageQuote.waitFor(1000);
          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());

        } catch (err) {
          console.log('err underwritingStep ', err);
          const response = { error: 'There is some error validations at underwritingStep' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        await errorStep(pageQuote, dataObject);
      }

      async function errorStep(pageQuote, dataObject) {
        try {
          console.log('errorStep');
          // await pageQuote.waitFor(4000);
          await pageQuote.waitForSelector('#ctl00_ContentPlaceHolder1__errorTable', { timeout: 5000 });
          const response = { error: 'There is some error in data' };
          dataObject.results = {
            status: false,
            response,
          };
        } catch (e) {
          await coveragesStep(pageQuote, dataObject);
        }
      }

      async function coveragesStep(pageQuote, dataObject) {
        console.log('coveragesStep');
        await pageQuote.waitFor(2000);
        await pageQuote.waitForSelector('#pol_ubi_exprnc.madParticipateItem');
        await pageQuote.select('#pol_ubi_exprnc', 'N');
        // pageQuote.on('console', msg => console.log('PAGE LOG:', msg._text));

        for (const j in dataObject.coverage) {
          await pageQuote.select(`#VEH\\.${j}\\.veh_use_ubi`, 'Y');

          const liabilityOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.veh_liab"]>option`);
          const liabilityValue = await pageQuote.evaluate(selectSubStringOption, liabilityOptions, dataObject.coverage[j].Liability);
          await pageQuote.select(`select[name="VEH.${j}.veh_liab"]`, liabilityValue);

          const bipdOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.BIPD"]>option`);
          const bipdValue = await pageQuote.evaluate(selectSubStringOption, bipdOptions, dataObject.coverage[j].BIPD);
          await pageQuote.select(`select[name="VEH.${j}.BIPD"]`, bipdValue);

          const umuimOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.UMUIM"]>option`);
          const umuimValue = await pageQuote.evaluate(selectSubStringOption, umuimOptions, dataObject.coverage[j].UMUIM);
          await pageQuote.select(`select[name="VEH.${j}.UMUIM"]`, umuimValue);

          const medPayOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.MEDPAY"]>option`);
          const medPayValue = await pageQuote.evaluate(selectSubStringOption, medPayOptions, dataObject.coverage[j].MEDPAY);
          await pageQuote.select(`select[name="VEH.${j}.MEDPAY"]`, medPayValue);

          const compOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.COMP"]>option`);
          const compValue = await pageQuote.evaluate(selectSubStringOption, compOptions, dataObject.coverage[j].COMP);
          await pageQuote.select(`select[name="VEH.${j}.COMP"]`, compValue);

          const colOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.COLL"]>option`);
          const colValue = await pageQuote.evaluate(selectSubStringOption, colOptions, dataObject.coverage[j].COLL);
          await pageQuote.select(`select[name="VEH.${j}.COLL"]`, colValue);

          const rentOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.RENT"]>option`);
          const rentValue = await pageQuote.evaluate(selectSubStringOption, rentOptions, dataObject.coverage[j].RENTAL);
          await pageQuote.select(`select[name="VEH.${j}.RENT"]`, rentValue);

          const roadsideOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.ROADSD"]>option`);
          const roadsideValue = await pageQuote.evaluate(selectSubStringOption, roadsideOptions, dataObject.coverage[j].ROADSIDE);
          await pageQuote.select(`select[name="VEH.${j}.ROADSD"]`, roadsideValue);

          const payoffOptions = await pageQuote.evaluate(getSelectValues, `select[name="VEH.${j}.PAYOFF"]>option`);
          const payoffValue = await pageQuote.evaluate(selectSubStringOption, payoffOptions, dataObject.coverage[j].PAYOFF);
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
        await processDataStep(pageQuote, dataObject);
      }

      async function processDataStep(pageQuote, dataObject) {
        console.log('processDataStep');
        await pageQuote.waitFor(6000);
        const downPayment = await pageQuote.evaluate(() => {
          const Elements = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.querySelectorAll('td');
          const ress = {};
          ress.total_premium = Elements[2].textContent.replace(/\n/g, '').trim();
          ress.down_pmt_amt = Elements[3].textContent.replace(/\n/g, '').trim();
          ress.pmt_amt = Elements[4].textContent.replace(/\n/g, '').trim();
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

        dataObject.results = {
          status: true,
          response: downPayment,
        };
        await pageQuote.click('#ctl00_ContentPlaceHolder1_InsuredRemindersDialog_InsuredReminders_btnOK');
        await pageQuote.click('#ctl00_HeaderLinksControl_SaveLink');
      }

      // login
      await loginStep();

      console.log('final result >> ', JSON.stringify(bodyData.results));
      req.session.data = {
        title: bodyData.results.status === true ? 'Successfully retrieved progressive AL rate.' : 'Failed to retrieved progressive AL rate.',
        obj: bodyData.results,
      };
      browser.close();
      return next();
    } catch (error) {
      console.log('error >> ', error);
      return next(Boom.badRequest('Failed to retrieved progressive AL rate.'));
    }
  },
};
