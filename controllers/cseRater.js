
/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations, consistent-return, no-param-reassign, guard-for-in ,
no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition, no-shadow, no-plusplus, dot-notation, no-unneeded-ternary, prefer-const */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { cseRater } = require('../constants/appConstant');
const utils = require('../lib/utils');
const ENVIRONMENT = require('../constants/configConstants').CONFIG;

module.exports = {
  cseRating: async (req, res, next) => {
    try {
      console.log('Inside cseRating');
      const params = req.body;
      const { username, password } = req.body.decoded_vendor;
      const raterStore = req.session.raterStore;
      const bodyData = await utils.cleanObj(req.body.data);
      bodyData.drivers.splice(10, bodyData.drivers.length);

      let stepResult = {
        login: false,
        existingQuote: false,
        newQuote: false,
        underWriting: false,
        vehicles: false,
        policy: false,
        drivers: false,
        summary: false,
      };
      let quoteId = null;

      if (raterStore && raterStore.stepResult) {
        stepResult = raterStore.stepResult;
      }
      let browserParams = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
      if (ENVIRONMENT.nodeEnv === 'local') {
        browserParams = { headless: false };
      }
      const browser = await puppeteer.launch(browserParams);
      const page = await browser.newPage();

      const populatedData = await populateKeyValueData(bodyData);

      await loginStep();

      if (raterStore && raterStore.quoteId) {
        await existingQuote();
      } else {
        await newQuoteStep();
      }

      if (!params.stepName) {
        await underWritingStep();
        await vehicleStep();
        await policyStep();
        await driverStep();
        await summaryStep();
      } else if (params.stepName === 'underWriting') {
        await underWritingStep();
        await page.waitForSelector('#QuoteAppSummary_QuoteAppNumber');
        quoteId = await page.$eval('#QuoteAppSummary_QuoteAppNumber', e => e.innerText);
        await exitSuccess('Underwriting');
      } else if (params.stepName === 'vehicles' && raterStore) {
        await page.waitForSelector('#Wizard_Vehicles');
        await page.click('#Wizard_Vehicles');
        await page.waitFor(200);
        await vehicleStep();
        await exitSuccess('vehicle');
      } else if (params.stepName === 'policy' && raterStore) {
        await page.waitForSelector('#Wizard_AutoGeneral');
        await page.click('#Wizard_AutoGeneral');
        await page.waitFor(200);
        await policyStep();
        await exitSuccess('policy');
      } else if (params.stepName === 'drivers' && raterStore) {
        await page.waitForSelector('#Wizard_Drivers');
        await page.click('#Wizard_Drivers');
        await page.waitFor(100);
        await driverStep();
        await exitSuccess('Drivers');
      } else if (params.stepName === 'summary' && raterStore) {
        await page.waitForSelector('#Wizard_LossHistory');
        await page.click('#Wizard_LossHistory');
        await page.waitFor(100);
        await summaryStep();
      }
      function getSelectVal(inputID) {
        optVals = [];
        document.querySelectorAll(inputID).forEach((opt) => {
          optVals.push({ name: opt.innerText, value: opt.value });
        });
        return optVals;
      }

      function populateKeyValueData(bodyData) {
        const staticDetailsObj = {
          firstName: 'Test',
          lastName: 'User',
          birthDate: '12/16/1993',
          email: 'test@gmail.com',
          phone: '0000000000',
          addressStreetName: 'Market St',
          addressStreetNumber: '969',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
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
              body: 'EXT CAB (8CYL 4x2)',
              zipCode: '19934',
              vehicleAnnualDistance: '15000',
              vehicleDaysDrivenPerWeek: '4 days',
              vehicleCommuteMilesDrivenOneWay: '2000',
            },
          ],
          drivers: [
            {
              firstName: 'Test',
              lastName: 'User',
              birthDate: '12/16/1993',
              applicantGenderCd: 'Male',
              maritalStatus: 'Married',
              yearsLicensed: '3 years or more',
              driverLicensedDt: '12/20/2013',
              driverLicenseNumber: '123456789',
            },
          ],
          priorIncident: 'AAD - At Fault Accident',
          priorIncidentDate: '12/16/2012',
          policyEffectiveDate: '01/01/2018',
          priorPolicyTerminationDate: '03/15/2019',
          yearsWithPriorInsurance: '5 years or more',
          ownOrRentPrimaryResidence: 'Rent',
          numberOfResidentsInHome: '3',
          rentersLimits: 'Greater Than 300,000',
          haveAnotherProgressivePolicy: 'No',
        };

        const clientInputSelect = {};
        clientInputSelect['BasicPolicy.RenewalTermCd'] = { type: 'select-one', name: 'BasicPolicy.RenewalTermCd', value: '1 Year' };
        clientInputSelect['BasicPolicy.ProgramInd'] = { type: 'select-one', name: 'BasicPolicy.ProgramInd', value: 'Civil Servant' };
        clientInputSelect['InsuredName.GivenName'] = { type: 'text', name: 'InsuredName.GivenName', value: bodyData.firstName || staticDetailsObj.firstName };
        clientInputSelect['InsuredName.Surname'] = { type: 'text', name: 'InsuredName.Surname', value: bodyData.lastName || staticDetailsObj.lastName };
        clientInputSelect['InsuredPersonal.BirthDt'] = { type: 'text', name: 'InsuredPersonal.BirthDt', value: bodyData.birthDate || staticDetailsObj.birthDate };
        clientInputSelect['InsuredLookupAddr.PrimaryNumber'] = { type: 'text', name: 'InsuredLookupAddr.PrimaryNumber', value: bodyData.birthDate || staticDetailsObj.birthDate };
        clientInputSelect['InsuredLookupAddr.StreetName'] = { type: 'text', name: 'InsuredLookupAddr.StreetName', value: bodyData.addressStreetName || staticDetailsObj.addressStreetName };
        clientInputSelect['InsuredLookupAddr.City'] = { type: 'text', name: 'InsuredLookupAddr.City', value: bodyData.city || staticDetailsObj.city };
        clientInputSelect['InsuredLookupAddr.StateProvCd'] = { type: 'select-one', name: 'InsuredLookupAddr.StateProvCd', value: bodyData.state || staticDetailsObj.state };
        clientInputSelect['InsuredLookupAddr.PostalCode'] = { type: 'text', name: 'InsuredLookupAddr.PostalCode', value: bodyData.zipCode || staticDetailsObj.zipCode };
        clientInputSelect['InsuredPhonePrimary.PhoneName'] = { type: 'select-one', name: 'InsuredPhonePrimary.PhoneName', value: 'Mobile' };
        clientInputSelect['InsuredPhonePrimary.PhoneNumber'] = { type: 'text', name: 'InsuredPhonePrimary.PhoneNumber', value: bodyData.phone || staticDetailsObj.phone };
        clientInputSelect['Insured.PreferredDeliveryMethod'] = { type: 'select-one', name: 'Insured.PreferredDeliveryMethod', value: 'Email' };
        clientInputSelect['InsuredEmail.EmailAddr'] = { type: 'text', name: 'InsuredEmail.EmailAddr', value: bodyData.email || staticDetailsObj.email };
        clientInputSelect['Question_Acknowledgement'] = { type: 'select-one', name: 'Question_Acknowledgement', value: 'YES' };
        clientInputSelect['Question_cserules_isResidence'] = { type: 'select-one', name: 'Question_cserules_isResidence', value: 'No' };
        clientInputSelect['Question_cserules_notStreetLic'] = { type: 'select-one', name: 'Question_cserules_notStreetLic', value: 'No' };
        clientInputSelect['Question_cserules_useBusiness'] = { type: 'select-one', name: 'Question_cserules_useBusiness', value: 'No' };
        clientInputSelect['Question_cserules_useBusinessSales'] = { type: 'select-one', name: 'Question_cserules_useBusiness', value: 'Yes' };
        clientInputSelect['Line.BILimit'] = { type: 'select-one', name: 'Line.BILimit', value: bodyData.policyCoverage.bodilyInjuryCoverage || '25000/50000' };
        clientInputSelect['Line.PDLimit'] = { type: 'select-one', name: 'Line.PDLimit', value: bodyData.policyCoverage.propertyDamageCoverage || '10000' };
        clientInputSelect['Line.MedPayLimit'] = { type: 'select-one', name: 'Line.MedPayLimit', value: bodyData.policyCoverage.medicalCoverage || '2000' };
        clientInputSelect['Line.UMBILimit'] = { type: 'select-one', name: 'Line.UMBILimit', value: bodyData.policyCoverage.underInsuredMotoristCoverage || '15000/30000' };
        clientInputSelect['Line.UMPDWCDInd'] = { type: 'select-one', name: 'Line.UMPDWCDInd', value: 'No' };
        clientInputSelect['Line.MultiCarDiscountInd'] = { type: 'select-one', element: 'Line.MultiCarDiscountInd', value: 'No' };
        clientInputSelect['Line.MultiPolicyDiscountInd'] = { type: 'select-one', element: 'Line.MultiPolicyDiscountInd', value: 'HO3' };
        clientInputSelect['Line.MultiPolicyDiscount2Ind'] = { type: 'select-one', element: 'Line.MultiPolicyDiscount2Ind', value: 'No' };

        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          clientInputSelect.vehicleMilageType = {
            title: 'Mileage Type',
            element: 'select[name="Vehicle.Mileage"]',
            value: 'Estimated',
          };
          clientInputSelect.vehicleUse = {
            title: 'Vehicle Use',
            element: 'select[name="Vehicle.VehUseCd"]',
            value: 'Business',
          };
          bodyData.vehicles.forEach((element, j) => {
            clientInputSelect[`vehicles${j}`] = [
              {
                title: 'Registered State',
                element: 'Vehicle.RegistrationStateProvCd',
                value: 'CA',
              },
              {
                title: 'Vehicle VIN',
                element: 'Vehicle.VehIdentificationNumber',
                value: element.vehicleVin || staticDetailsObj.vehicles[0].vehicleVin,
              },
              {
                title: 'Model Year',
                element: 'Vehicle.ModelYr',
                value: element.vehicleModelYear || staticDetailsObj.vehicles[0].vehicleModelYear,
              },
              {
                title: 'Make',
                element: 'Vehicle.Manufacturer',
                value: element.vehicleManufacturer || staticDetailsObj.vehicles[0].vehicleManufacturer,
              },
              {
                title: 'Model',
                element: 'Vehicle.Model',
                value: element.vehicleModel || staticDetailsObj.vehicles[0].vehicleModel,
              },
              {
                title: 'Purchased New or Used',
                element: 'Vehicle.NewOrUsedInd',
                value: element.purchaseType || 'Used',
              },
              {
                title: 'Purchase/Lease',
                element: 'Vehicle.LeasedVehInd',
                value: 'Purchased',
              },
              {
                title: '',
                element: 'Vehicle.PurchaseDt',
                value: element.purchaseDate || '04/30/2017',
              },
              {
                title: 'Anti-Theft Device',
                element: 'Vehicle.AntiTheftCd',
                value: element.hasAntiTheftDevices ? 'Other Device' : 'No Anti-Theft Device',
              },
              {
                title: 'Body Style',
                element: 'Vehicle.VehBodyTypeCd',
                value: 'Pickup',
              },
              {
                title: 'Performance',
                element: 'Vehicle.PerformanceCd',
                value: element.isHighPerformanceVehicle ? 'High' : 'Standard',
              },
              {
                title: 'Restraints',
                element: 'Vehicle.RestraintCd',
                value: 'Driver Side Airbag/Passenger Passive',
              },
              {
                title: 'Cost New',
                element: 'Vehicle.CostNewAmt',
                value: element.costNew || '50000',
              },
            ];
            clientInputSelect[`vehicleMilage${j}`] = {
              other: [
                {
                  title: 'Insured estimated annual miles driven',
                  element: 'Vehicle.OriginalEstimatedAnnualMiles',
                  value: element.vehicleAnnualDistance || '10000',
                },
                {
                  title: 'Prior Odometer Reading',
                  element: 'Vehicle.OdometerReadingPrior',
                  value: element.priorOdometerReadingValue || '45000',
                },
                {
                  title: 'Prior Odometer Date',
                  element: 'Vehicle.ReportedMileageNonSaveDtPrior',
                  value: element.priorOdometerReadingDate || '01/20/2018',
                },
                {
                  title: 'Current Odometer Reading',
                  element: 'Vehicle.OdometerReading',
                  value: element.currentOdometerReadingValue || '65000',
                },
                {
                  title: 'Odometer Date',
                  element: 'Vehicle.ReportedMileageNonSaveDt',
                  value: element.currentOdometerReadingDate || '04/22/2019',
                },
              ],
              Work: [
                {
                  title: 'Distance home to work',
                  element: 'Vehicle.EstimatedWorkDistance',
                  value: element.vehicleCommuteMilesDrivenOneWay || '20',
                },
                {
                  title: 'Number of days per week commute',
                  element: 'Vehicle.DaysPerWeekDriven',
                  value: element.vehicleDaysDrivenPerWeek ? element.vehicleDaysDrivenPerWeek[0] : '5',
                },
                {
                  title: 'Estimated annual non-commute miles',
                  element: 'Vehicle.EstimatedNonCommuteMiles',
                  value: element.vehicleCommuteMilesDrivenOneWay,
                },
                {
                  title: 'Insured estimated annual miles driven',
                  element: 'Vehicle.OriginalEstimatedAnnualMiles',
                  value: element.vehicleAnnualDistance || '12000',
                },
                {
                  title: 'Prior Odometer Reading',
                  element: 'Vehicle.OdometerReadingPrior',
                  value: element.priorOdometerReadingValue || '45000',
                },
                {
                  title: 'Prior Odometer Date',
                  element: 'Vehicle.ReportedMileageNonSaveDtPrior',
                  value: element.priorOdometerReadingDate || '01/20/2018',
                },
                {
                  title: 'Current Odometer Reading',
                  element: 'Vehicle.OdometerReading',
                  value: element.currentOdometerReadingValue || '65000',
                },
                {
                  title: 'Odometer Date',
                  element: 'Vehicle.ReportedMileageNonSaveDt',
                  value: element.currentOdometerReadingDate || '04/22/2019',
                },
                {
                  title: 'Insured Work Address',
                  element: 'VehicleCommuteAddr.Addr1',
                  value: `${element.workUnitNumber} ${element.workStreetNumber} ${element.workStreetName} ${element.workStateCd} ${element.workPostalCd}` || 'test address',
                },
                {
                  title: 'City',
                  element: 'VehicleCommuteAddr.City',
                  value: bodyData.city || staticDetailsObj.city,
                },
                {
                  title: 'State',
                  element: 'VehicleCommuteAddr.StateProvCd',
                  value: bodyData.state || staticDetailsObj.state,
                },
                {
                  title: 'Zip',
                  element: 'VehicleCommuteAddr.PostalCode',
                  value: bodyData.zipCode || staticDetailsObj.zipCode,
                },
              ],
            };
          });
        }

        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          bodyData.drivers.forEach((element, j) => {
            clientInputSelect[`editDriverDetails${j}`] = {
              driver: [
                {
                  title: 'Driver Status',
                  element: 'DriverInfo.DriverStatusCd',
                  value: 'Primary',
                },
                {
                  title: 'Gender',
                  element: 'PersonInfo.GenderCd',
                  value: element.applicantGenderCd || staticDetailsObj.drivers[0].applicantGenderCd,
                },
                {
                  title: 'Date Licensed',
                  element: 'DriverInfo.LicenseDt',
                  value: element.driverLicensedDt || '03/30/2010',
                },
                {
                  title: 'License Number',
                  element: 'DriverInfo.LicenseNumber',
                  value: element.driverLicenseNumber || staticDetailsObj.drivers[0].driverLicenseNumber,
                },
                {
                  title: 'Driver Status',
                  element: 'DriverInfo.DriverStatusCd',
                  value: 'Primary',
                },
              ],
              nonDriver: [
                {
                  title: 'First Name',
                  element: 'NameInfo.GivenName',
                  value: element.firstName || staticDetailsObj.drivers[0].firstName,
                },
                {
                  title: 'Last',
                  element: 'NameInfo.Surname',
                  value: element.lastName || staticDetailsObj.drivers[0].lastName,
                },
                {
                  title: 'Gender',
                  element: 'PersonInfo.GenderCd',
                  value: element.applicantGenderCd || staticDetailsObj.drivers[0].applicantGenderCd,
                },
                {
                  title: 'Birth Date',
                  element: 'PersonInfo.BirthDt',
                  value: element.birthDate || staticDetailsObj.drivers[0].birthDate,
                },
                {
                  title: 'Marital Status',
                  element: 'PersonInfo.MaritalStatusCd',
                  value: element.maritalStatus || staticDetailsObj.drivers[0].maritalStatus,
                },
                {
                  title: 'Rel\'n to Insured',
                  element: 'DriverInfo.RelationshipToInsuredCd',
                  value: 'Other',
                },
                {
                  title: 'Non-Driver Type',
                  element: 'DriverInfo.DriverTypeCd',
                  value: 'Excluded',
                },
              ],
            };
          });
        }
        return clientInputSelect;
      }

      async function loginStep() {
        try {
          console.log('CSE CA Login Step.');
          await page.goto(cseRater.LOGIN_URL, { waitUntil: 'load' });
          await page.waitForSelector('#frmLogin > div > div.signInTile');
          await page.type('#j_username', username);
          await page.type('#j_password', password);
          await page.waitFor(2000);
          await page.click('#SignIn');
          await page.waitForNavigation({ timeout: 0 });
          stepResult.login = true;
        } catch (error) {
          await exitFail(error, 'login');
        }
      }

      async function existingQuote() {
        console.log('CSE Rater Existing Quote Id Step');
        try {
          await page.waitForSelector('#ToolbarSearchText');
          await page.$eval('input[name=ToolbarSearchText]', (el, value) => el.value = value, raterStore.quoteId);
          await page.click('#ToolbarSearch');
          stepResult.existingQuote = true;
        } catch (error) {
          await exitFail(error, 'existing');
        }
      }

      async function newQuoteStep() {
        console.log('CSE CA New Quote Step.');

        try {
          const AllPages = await browser.pages();
          if (AllPages.length > 2) {
            for (let i = 2; i < AllPages.length; i += 1) {
              await AllPages[i].close();
            }
          }

          await page.waitForSelector('#frmCMM > div.contents > div.navigationBar > div:nth-child(4)');
          await page.click('#NewQuote');

          await page.waitForSelector('#Main > div');
          await page.evaluate(() => {
            document.getElementById('BasicPolicy.ControllingStateCd').value = 'CA';
            document.getElementById('ProductSelectionGroupCd').value = 'PL-PREF-AUTO';
          });

          await page.click('#Continue');
          await page.waitFor(1000);
          await page.waitForSelector('#ProductSelectionList');
          await page.click('#ProductSelectionList > table > tbody > tr > td > a');
          stepResult.newQuote = true;
        } catch (e) {
          await exitFail(e, 'new Quote');
        }
      }

      async function underWritingStep() {
        console.log('CSE CA underWriting Step.');
        try {
          await page.waitFor(1000);
          page.on('dialog', async (dialog) => {
            console.log(dialog.message());
            await dialog.dismiss();
          });
          await page.waitForSelector('#ProviderNumber');
          await fillPageForm(null, null, null);
          await page.click('#ResetCommercialName');
          await page.click('tr>td>img[id="InsuredLookupAddr.addrVerifyImg"]');
          await page.click('#DefaultAddress');
          await page.waitFor(1000);

          await page.click('#NextPage');
          await page.waitFor(1000);
          await fillPageForm(null, null, null);
          quoteId = await page.$eval('#QuoteAppSummary_QuoteAppNumber', e => e.innerText);
          await page.click('#NextPage');
          stepResult.underWriting = true;
        } catch (e) {
          await exitFail(e, 'underWriting');
        }
      }

      async function vehicleStep() {
        console.log('CSE CA Vehicle Step.');
        try {
          for (const j in bodyData.vehicles) {
            const vehicles = populatedData[`vehicles${j}`];

            await page.waitFor(5000);
            await page.evaluate(() => document.querySelector('#VehicleSelectionController').value = 'Private Passenger Vehicle');
            await page.evaluate(() => document.querySelector('#VehicleSelectionController').onchange());
            await page.waitFor(2000);
            await page.evaluate((vehiclesData) => {
              vehiclesData.forEach((oneElement) => {
                document.getElementById(oneElement.element).value = oneElement.value;
              });
            }, vehicles);

            await page.waitFor(1500);
            const vehicleUse = populatedData.vehicleUse.value; // Business / Work / Pleasure / Farm

            await page.select(populatedData.vehicleMilageType.element, populatedData.vehicleMilageType.value); // Estimated / Recommended
            await page.waitFor(1000);
            await page.waitForSelector(populatedData.vehicleUse.element);
            await page.select(populatedData.vehicleUse.element, vehicleUse);
            const vehicleMilage = populatedData[`vehicleMilage${j}`];

            if (vehicleUse === 'Work') {
              await page.evaluate((vehicleMilageData) => {
                vehicleMilageData.forEach((oneElement) => {
                  document.getElementById(oneElement.element).value = oneElement.value;
                });
              }, vehicleMilage[vehicleUse]);
            } else {
              await page.evaluate((vehicleMilageData) => {
                vehicleMilageData.forEach((oneElement) => {
                  document.getElementById(oneElement.element).value = oneElement.value;
                });
              }, vehicleMilage.other);
            }

            await page.waitFor(1000);
            await page.click('#Save');
            await page.waitFor(3000);
            if (j === (bodyData.vehicles.length - 1).toString()) {
              await page.click('#NextPage');
            } else {
              await page.click('#Return');
            }
          }
          stepResult.vehicles = true;
        } catch (e) {
          await exitFail(e, 'vehicle');
        }
      }

      async function policyStep() {
        try {
          console.log('CSE CA Policy Step.');
          await page.waitFor(4000);
          await page.waitForSelector('#Line\\.BILimit');
          await fillPageForm(null, null, null);
          await page.click('#NextPage');
          await page.waitFor(1000);
          stepResult.policy = true;
        } catch (e) {
          await exitFail(e, 'policy');
        }
      }

      async function driverStep() {
        try {
          console.log('CSE CA Driver Step.');
          await page.waitForSelector('#EditLink');
          await page.click('#EditLink');
          for (const j in bodyData.drivers) {
            const editDriverDetails = populatedData[`editDriverDetails${j}`];
            if (j === '0') {
              await page.waitFor(5000);
              await page.waitForSelector('#Main > div:nth-child(4)');
              await page.evaluate((driverDetails) => {
                driverDetails.forEach((oneElement) => {
                  document.getElementById(oneElement.element).value = oneElement.value;
                });
              }, editDriverDetails.driver);
              if (bodyData.vehicles.length > 1) {
                const primarilyDrives = await page.evaluate(getSelectVal, 'select[name="DriverInfo.AttachedVehicleRef"]>option');
                await page.select('select[name="DriverInfo.AttachedVehicleRef"]', primarilyDrives[1].value);
              }
            } else {
              await page.waitFor(2000);
              await page.evaluate((driverDetails) => {
                driverDetails.forEach((oneElement) => {
                  document.getElementById(oneElement.element).value = oneElement.value;
                });
              }, editDriverDetails.nonDriver);
            }

            await page.waitFor(1000);
            await page.click('#Save');
            await page.waitFor(2000);
            if (j === (bodyData.drivers.length - 1).toString()) {
              await page.click('#NextPage');
            } else {
              try {
                await page.evaluate(() => document.querySelector('#Return').click());
                await page.waitFor(2000);
                await page.evaluate(() => document.querySelector('#DriverSelectionController').value = 'Non-Driver');
                await page.evaluate(() => document.querySelector('select[name="DriverSelectionController"]').onchange(''));
              } catch (e) {
                console.log('CSE CA Adding New Driver');
              }
            }
          }
          stepResult.drivers = true;
        } catch (e) {
          await exitFail(e, 'driver');
        }
      }

      async function summaryStep() {
        console.log('CSE CA summary Step.');
        try {
          await page.waitFor(3000);
          await page.waitForSelector('#NextPage');
          await page.click('#NextPage');
          await page.waitFor(3000);

          await page.waitForSelector('#NextPage');
          await page.click('#NextPage');
          await page.waitFor(3000);

          await page.waitForSelector('#NextPage');
          await page.click('#NextPage');
          await page.waitFor(3000);
          const premiumDetails = await page.evaluate(() => {
            const details = {
              totalPremium: document.getElementById('PremInfo_TotalPolicyTermPremium').innerText,
              TransactionApRp: document.getElementById('PremInfo_Trans_AP_RP').innerText,
              totalCommission: document.getElementById('PremInfo_TotalCommission').innerText,
              transactionCommission: document.getElementById('PremInfo_TransactionCommission').innerText,
              quoteId: document.getElementById('QuoteAppSummary_QuoteAppNumber').innerText,
            };
            return details;
          });
          stepResult.summary = true;
          req.session.data = {
            title: 'Successfully retrieved CSE CA rate.',
            status: true,
            totalPremium: premiumDetails.totalPremium ? premiumDetails.totalPremium.replace(/,/g, '') : null,
            months: premiumDetails.plan ? premiumDetails.plan : null,
            downPayment: premiumDetails.downPaymentAmount ? premiumDetails.downPaymentAmount.replace(/,/g, '') : null,
            quoteId: premiumDetails.quoteId,
            stepResult,
          };
          browser.close();
          return next();
        } catch (err) {
          await exitFail(err, 'summary');
        }
      }

      async function exitFail(error, step) {
        console.log(`Error during CSE CA ${step} step:`, error);
        if (req && req.session && req.session.data) {
          req.session.data = {
            title: 'Failed to retrieved CSE CA rate.',
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
          if (req && req.session && req.session.data) {
            req.session.data = {
              title: `Successfully finished CSE CA ${step} Step`,
              status: true,
              quoteId: raterStore.quoteId || quoteId,
              stepResult,
            };
            browser.close();
            return next();
          }
        } catch (error) {
          await exitFail(error, 'SuccessStep');
        }
      }

      async function fillPageForm(beforeCustomCode, afterCustomCode, delayAfter) {
        try {
          if (beforeCustomCode) {
            await beforeCustomCode();
          }
          const qO = await page.evaluate(async (data) => {
            const form = document.forms[0];
            for (const ele of form.elements) {
              if (ele.disabled) {
                ele.disabled = false;
              }
            }
            const formD = new FormData(form);
            const quoteObj = {};
            for (const pair of formD.entries()) {
              const key = (pair && pair[0]) ? pair[0] : null;
              const value = (data && key && data[key] && data[key].value) ? data[key].value : null;
              if (key && value) {
                const el = document.getElementById(key);
                console.log('el>>>>>>', el);
                if (el.type === 'text') {
                  el.value = value;
                } else if (el.type === 'select-one' && el.options && el.options.length && el.options.length > 0) {
                  el.value = await getBestValue(value, el.options);
                } else if (el.type === 'radio' || el.type === 'checkbox') {
                  el.checked = (value && value === true) ? true : false;
                }
              }
            }
            return quoteObj;

            function compareTwoStrings(first, second) {
              first = first.replace(/\s+/g, '');
              second = second.replace(/\s+/g, '');

              if (!first.length && !second.length) return 1;// if both are empty strings
              if (!first.length || !second.length) return 0;// if only one is empty string
              if (first === second) return 1;// identical
              if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
              if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

              let firstBigrams = new Map();
              for (let i = 0; i < first.length - 1; i++) {
                const bigram = first.substring(i, i + 2);
                const count = firstBigrams.has(bigram)
                  ? firstBigrams.get(bigram) + 1
                  : 1;
                firstBigrams.set(bigram, count);
              }

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
                const currentRating = compareTwoStrings(mainString, currentTargetString);
                ratings.push({ target: currentTargetString, rating: currentRating });
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
                  } else if (vBestMatch.bestMatch.rating === nBestMatch.bestMatch.rating && nBestMatch.bestMatch.rating >= 0.75) {
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
          if (delayAfter) {
            await page.waitFor(delayAfter);
          } else {
            await page.waitFor(1000);
          }
        } catch (error) {
          console.log(error);
          await exitFail(error, 'FillPage');
        }
      }
    } catch (error) {
      console.log('Error at CSE CA :  ', error);
      return next(Boom.badRequest('Failed to retrieved CSE CA rate.'));
    }
  },
};
