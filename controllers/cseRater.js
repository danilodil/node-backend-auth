/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { cseRater } = require('../constants/appConstant');

module.exports = {
  cseRating: async (req, res, next) => {
    try {
      console.log('Inside cseRating');

      const { username, password } = req.body.decoded_vendor;
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      // const browser = await puppeteer.launch({ headless:false });
      const page = await browser.newPage();

      /* const bodyData = {
        firstName: "Test",
        lastName: "User",
        birthDate: "12/16/1993",
        email: "test@mail.com",
        phone: "3026075611",
        addressStreetName: "Market St",
        addressStreetNumber: "969",
        city: "San Diego",
        state: "CA",
        zipCode: "92101",
        lengthAtAddress: "1 year or more",
        priorInsurance: "Yes",
        priorInsuranceCarrier: "USAA",
        // must always agree to closure
        vehicles: [
          {
            // Vehicle Type will always be 1981 or newer
            vehicleVin: "1FTSF30L61EC23425",
            vehicleModelYear: "2015",
            vehicleManufacturer: "FORD",
            vehicleModel: "F350",
            body: "EXT CAB (8CYL 4x2)",
            zipCode: "19934",
            lengthOfOwnership: "At least 1 year but less than 3 years",
            primaryUse: "Commute",
            vehicleAnnualDistance: '15000',
            vehicleDaysDrivenPerWeek: '4 days',
            vehicleCommuteMilesDrivenOneWay: '2000',
          },
          {
            vehicleVin: "KMHDH6AE1DU001708",
            vehicleModelYear: "2013",
            vehicleManufacturer: "HYUNDAI",
            vehicleModel: "ELANTRA",
            body: "2DR 4CYL",
            zipCode: "19934",
            lengthOfOwnership: "5 years or more",
            primaryUse: "Commute",
            vehicleAnnualDistance: '15000',
            vehicleDaysDrivenPerWeek: '4 days',
            vehicleCommuteMilesDrivenOneWay: '2000',
          }
        ],
        drivers: [
          {
            firstName: "Test",
            lastName: "User",
            birthDate: "12/16/1993",
            applicantGenderCd: "Male",
            maritalStatus: "Married",
            yearsLicensed: "3 years or more",
            driverLicensedDt: "12/20/2013",
            driverLicenseNumber: "123456789",
            employment: "Student (full-time)",
            education: "College Degree",
          },
          {
            firstName: "Tester",
            lastName: "User",
            birthDate: "12/18/1993",
            applicantGenderCd: "Female",
            maritalStatus: "Married",
            yearsLicensed: "3 years or more",
            driverLicensedDt: "12/20/2013",
            driverLicenseNumber: "123456789",
            employment: "Student (full-time)",
            education: "College Degree",
          }
        ],
        priorIncident: "AAD - At Fault Accident",
        priorIncidentDate: "12/16/2012",
        policyEffectiveDate: "01/01/2018",
        priorPolicyTerminationDate: "03/15/2019",
        yearsWithPriorInsurance: "5 years or more",
        ownOrRentPrimaryResidence: "Rent",
        numberOfResidentsInHome: "3",
        rentersLimits: "Greater Than 300,000",
        haveAnotherProgressivePolicy: "No"
      }; */
      const staticDetailsObj = {
        firstName: "Test",
        lastName: "User",
        birthDate: "12/16/1993",
        email: "test@mail.com",
        phone: "3026075611",
        addressStreetName: "Market St",
        addressStreetNumber: "969",
        city: "San Diego",
        state: "CA",
        zipCode: "92101",
        lengthAtAddress: "1 year or more",
        priorInsurance: "Yes",
        priorInsuranceCarrier: "USAA",
        // must always agree to closure
        vehicles: [
          {
            // Vehicle Type will always be 1981 or newer
            vehicleVin: "1FTSF30L61EC23425",
            vehicleModelYear: "2015",
            vehicleManufacturer: "FORD",
            vehicleModel: "F350",
            body: "EXT CAB (8CYL 4x2)",
            zipCode: "19934",
            lengthOfOwnership: "At least 1 year but less than 3 years",
            primaryUse: "Commute",
            vehicleAnnualDistance: '15000',
            vehicleDaysDrivenPerWeek: '4 days',
            vehicleCommuteMilesDrivenOneWay: '2000',
          }
        ],
        drivers: [
          {
            firstName: "Test",
            lastName: "User",
            birthDate: "12/16/1993",
            applicantGenderCd: "Male",
            maritalStatus: "Married",
            yearsLicensed: "3 years or more",
            driverLicensedDt: "12/20/2013",
            driverLicenseNumber: "123456789",
            employment: "Student (full-time)",
            education: "College Degree",
          }
        ],
        priorIncident: "AAD - At Fault Accident",
        priorIncidentDate: "12/16/2012",
        policyEffectiveDate: "01/01/2018",
        priorPolicyTerminationDate: "03/15/2019",
        yearsWithPriorInsurance: "5 years or more",
        ownOrRentPrimaryResidence: "Rent",
        numberOfResidentsInHome: "3",
        rentersLimits: "Greater Than 300,000",
        haveAnotherProgressivePolicy: "No"
      }; 
      const bodyData = await cleanObj(req.body.data);
      bodyData.results = {};
      function cleanObj(obj) {
        for (var propName in obj) { 
          if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
            delete obj[propName];
          }
        }
        return obj;
      }

      // For get all select options texts and values
      function getSelectVal(inputID) {
        optVals = [];

        document.querySelectorAll(inputID).forEach((opt) => {
          optVals.push({ name: opt.innerText, value: opt.value });
        });

        return optVals;
      }

      function populateKeyValueData(bodyData) {
        const clientInputSelect = {
          // product selction
          productSelection: [
            {
              element: 'BasicPolicy.ControllingStateCd',
              value: 'CA',
            },
            {
              element: 'ProductSelectionGroupCd',
              value: 'PL-PREF-AUTO',
            },
          ],

          // Underwriting Status
          underwriting: [
            {
              title: 'Expiration Date',
              element: 'BasicPolicy.RenewalTermCd',
              value: '1 Year',
            },
            {
              title: 'Program',
              element: 'BasicPolicy.ProgramInd',
              value: 'Civil Servant',
            },
            {
              title: 'First Name',
              element: 'InsuredName.GivenName',
              value: bodyData.firstName || staticDetailsObj.firstName,
            },
            {
              title: 'MI',
              element: 'InsuredName.OtherGivenName',
              value: bodyData.middleName || staticDetailsObj.middleName,
            },
            {
              title: 'Last Name',
              element: 'InsuredName.Surname',
              value: bodyData.lastName || staticDetailsObj.lastName,
            },
            // {
            //   title: 'Suffix',
            //   element: 'InsuredName.SuffixCd',
            //   value: bodyData.suffixName || staticDetailsObj.suffixName,
            // },
            {
              title: 'Birth Date',
              element: 'InsuredPersonal.BirthDt',
              value: bodyData.birthDate || staticDetailsObj.birthDate,
            },
            {
              title: 'Number',
              element: 'InsuredLookupAddr.PrimaryNumber',
              value: bodyData.addressStreetNumber || staticDetailsObj.addressStreetNumber,
            },
            {
              title: 'Street Name',
              element: 'InsuredLookupAddr.StreetName',
              value: bodyData.addressStreetName || staticDetailsObj.addressStreetName,
            },
            {
              title: 'City',
              element: 'InsuredLookupAddr.City',
              value: bodyData.city || staticDetailsObj.city,
            },
            {
              title: 'State',
              element: 'InsuredLookupAddr.StateProvCd',
              value: bodyData.state || staticDetailsObj.state,
            },
            {
              title: 'Zip',
              element: 'InsuredLookupAddr.PostalCode',
              value: bodyData.zipCode || staticDetailsObj.zipCode,
            },
            {
              title: 'Primary Phone Name',
              element: 'InsuredPhonePrimary.PhoneName',
              value: 'Mobile',
            },
            {
              title: 'Primary Phone',
              element: 'InsuredPhonePrimary.PhoneNumber',
              value: bodyData.phone || staticDetailsObj.phone,
            },
            {
              title: 'Delivery Preference',
              element: 'Insured.PreferredDeliveryMethod',
              value: 'Email',
            },
            {
              title: 'Primary Email',
              element: 'InsuredEmail.EmailAddr',
              value: bodyData.email || staticDetailsObj.email,
            },
          ],

          // Policy Coverage
          policyCoverage: [
            {
              title: 'Bodily Injury',
              element: 'Line.BILimit',
              value: bodyData.bodilyInjuryCoverage || '25000/50000',
            },
            {
              title: 'Property Damage',
              element: 'Line.PDLimit',
              value: bodyData.propertyDamageCoverage || '10000',
            },
            {
              title: 'Medical Payments',
              element: 'Line.MedPayLimit',
              value: bodyData.medicalCoverage || '2000',
            },
            {
              title: 'Un/Under-insured Motorist - Bodily Injury',
              element: 'Line.UMBILimit',
              value: bodyData.underInsuredMotoristCoverage || '15000/30000',
            },
            {
              title: 'UM-PD / WCD Applies',
              element: 'Line.UMPDWCDInd',
              value: 'No',
            },
            {
              title: 'Apply Multi-Car Discount to Single Car',
              element: 'Line.MultiCarDiscountInd',
              value: 'No',
            },
            {
              title: 'Multi-Policy Discount-Property',
              element: 'Line.MultiPolicyDiscountInd',
              value: 'HO3',
            },
            {
              title: 'Multi-Policy Discount-Umbrella',
              element: 'Line.MultiPolicyDiscount2Ind',
              value: 'No',
            },
          ],
        };

        // vehicle
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

        // Driver Detail Edit
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

      // For Login
      async function loginStep(browser, page) {
        await page.goto(cseRater.LOGIN_URL, { waitUntil: 'load' }); // wait until page load
        await page.waitForSelector('#frmLogin > div > div.signInTile');
        await page.type('#j_username', username);
        await page.type('#j_password', password);

        await page.click('#SignIn');
        await page.waitForNavigation({ timeout: 0 });
        const populatedData = await populateKeyValueData(bodyData);

        await newQuoteStep(browser, page, populatedData);
      }

      async function newQuoteStep(browser, page, populatedData) {
        console.log('newQuoteStep');

        try{

          const AllPages = await browser.pages();
          if (AllPages.length > 2) {
            for (let i = 2; i < AllPages.length; i += 1) {
              await AllPages[i].close();
            }
          }

          await page.waitForSelector('#frmCMM > div.contents > div.navigationBar > div:nth-child(4)');
          await page.click('#NewQuote');

          // product selction
          const { productSelection } = populatedData;
          await page.waitForSelector('#Main > div');
          await page.evaluate((productSelectionData) => {
            productSelectionData.forEach((oneElement) => {
              document.getElementById(oneElement.element).value = oneElement.value;
            });
          }, productSelection);

          await page.click('#Continue');
          await page.waitFor(1000);
          await page.waitForSelector('#ProductSelectionList');
          await page.click('#ProductSelectionList > table > tbody > tr > td > a');

          // Underwriting Status
          const { underwriting } = populatedData;

          await page.waitFor(1000);
          page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss();
          });
          await page.waitForSelector('#ProviderNumber');
          await page.waitFor(1000);
          page.on('console', msg => console.log('PAGE LOG:', msg._text));
          await page.evaluate((underwritingData) => {
            underwritingData.forEach((oneElement) => {
              // console.log(JSON.stringify(oneElement));
              if (oneElement.value === 'AAGCA') {
                setTimeout(() => {
                  document.getElementById(oneElement.element).value = oneElement.value;
                  document.getElementById('AffinityGroupCdDisplay').value = oneElement.value;
                }, 1000);
              } else {
                document.getElementById(oneElement.element).value = oneElement.value;
              }
            });
          }, underwriting);

          await page.click('#ResetCommercialName');
          await page.click('tr>td>img[id="InsuredLookupAddr.addrVerifyImg"]');
          await page.click('#DefaultAddress');
          await page.waitFor(1000);
          await page.click('#NextPage');
          await page.waitForSelector('#Question_Acknowledgement');
          await page.waitFor(1000);
          // await page.evaluate(() => {
          //   document.getElementById('Question_Acknowledgement').value = 'YES';
          //   document.getElementById('Question_cserules_isForRent').value = 'No';
          //   document.getElementById('Question_cserules_isResidence').value = 'No';
          //   document.getElementById('Question_cserules_notStreetLic').value = 'No';
          //   document.getElementById('Question_cserules_useBusiness').value = 'Yes';
          //   document.getElementById('Question_cserules_useBusinessSales').value = 'Yes';
          // });
          await page.evaluate(() => {
            document.getElementById('Question_Acknowledgement').value = 'YES';
          });
          await page.waitFor(1000);
          await page.evaluate(() => {
            document.getElementById('Question_cserules_isForRent').value = 'No';
          });
          await page.waitFor(1000);

          await page.evaluate(() => {
            document.getElementById('Question_cserules_isResidence').value = 'No';
          });
          await page.waitFor(1000);

          await page.evaluate(() => {
            document.getElementById('Question_cserules_notStreetLic').value = 'No';
          });
          await page.waitFor(1000);

          await page.evaluate(() => {
            document.getElementById('Question_cserules_useBusiness').value = 'Yes';
          });
          await page.waitFor(1000);

          await page.evaluate(() => {
            document.getElementById('Question_cserules_useBusinessSales').value = 'Yes';
          });
          await page.click('#NextPage');
      }catch(e){
        console.log('error at newQuoteStep :: ',e);
          const response = { error: 'There is some error validations at newQuoteStep' };
          bodyData.results = {
            status: false,
            response,
          };
          console.log('final result >> ', JSON.stringify(bodyData.results));
          req.session.data = {
            title: 'CSE CA Rate Retrieved Successfully',
            obj: bodyData.results,
          };
          return next();
      }
        await vehicleStep(browser, page, populatedData);
      }

      // add vehicle
      async function vehicleStep(browser, page, populatedData) {
        console.log('vehicleStep');
        try{

          for (const j in bodyData.vehicles) {
            const vehicles = populatedData[`vehicles${j}`];

            await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            await page.waitFor(5000);

            // await page.waitForSelector('select[name="VehicleSelectionController"]');
            //await page.select('select[name="VehicleSelectionController"]', 'Private Passenger Vehicle');
            await page.evaluate(()=> document.querySelector('#VehicleSelectionController').value = 'Private Passenger Vehicle');
            await page.evaluate(()=> document.querySelector('#VehicleSelectionController').onchange());

            await page.waitFor(2000);
            // await page.waitForSelector('#Main > div:nth-child(18)');
            await page.evaluate((vehiclesData) => {
              vehiclesData.forEach((oneElement) => {
                // console.log(JSON.stringify(oneElement))
                document.getElementById(oneElement.element).value = oneElement.value;
              });
            }, vehicles);
            console.log('3 >> ');

            await page.waitFor(1500);
            const vehicleUse = populatedData.vehicleUse.value; // Business / Work / Pleasure / Farm
            console.log('4 >> ');

            await page.select(populatedData.vehicleMilageType.element, populatedData.vehicleMilageType.value); // Estimated / Recommended
            await page.waitFor(1000);
            console.log('5 >> ');
            await page.waitForSelector(populatedData.vehicleUse.element);
            await page.select(populatedData.vehicleUse.element, vehicleUse);
            const vehicleMilage = populatedData[`vehicleMilage${j}`];
            console.log('6 >> ');

            if (vehicleUse === 'Work') {
              console.log('7 >> ');
              await page.evaluate((vehicleMilageData) => {
                vehicleMilageData.forEach((oneElement) => {
                  document.getElementById(oneElement.element).value = oneElement.value;
                });
              }, vehicleMilage[vehicleUse]);
            } else {
              console.log('8 >> ');
              await page.evaluate((vehicleMilageData) => {
                vehicleMilageData.forEach((oneElement) => {
                  document.getElementById(oneElement.element).value = oneElement.value;
                });
              }, vehicleMilage.other);
            }
            console.log('9 >> ');

            await page.waitFor(1000);
            console.log('10 >> ');
            await page.click('#Save');
            await page.waitFor(3000);
            if (j === (bodyData.vehicles.length - 1).toString()) {
              await page.click('#NextPage');
            } else {
              await page.click('#Return');
            }
          }
        }catch(e){
          console.log('error at vehicleStep :: ',e);
          const response = { error: 'There is some error validations at vehicleStep' };
          bodyData.results = {
            status: false,
            response,
          };
          console.log('final result >> ', JSON.stringify(bodyData.results));
          req.session.data = {
            title: 'CSE CA Rate Retrieved Successfully',
            obj: bodyData.results,
          };
          return next();
        }
        await policyStep(browser, page, populatedData);
      }

      // add policy
      async function policyStep(browser, page, populatedData) {
        console.log('policyStep');
        // Policy Coverage
        const policyCoverage = populatedData.policyCoverage;
        await page.waitFor(4000);
        await page.waitForSelector('#Line\\.BILimit')
        await page.evaluate((policyCoverage) => {
          policyCoverage.forEach(oneElement => {
            // console.log(JSON.stringify(oneElement))
            document.getElementById(oneElement.element).value = oneElement.value;
          });
        }, policyCoverage);

        await page.click('#NextPage');
        await page.waitFor(1000);
        await driverStep(browser, page, populatedData);
      }

      // Add driver/ Non driver
      async function driverStep(browser, page, populatedData) {
        try{
          console.log('driverStep');
          await page.waitForSelector('#EditLink');
          await page.click('#EditLink');
          // Driver Detail Edit
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
              console.log('else j>>>>>>>>>>',j);
              await page.waitFor(2000);
              await page.evaluate((driverDetails) => {
                driverDetails.forEach((oneElement) => {
                  // console.log(JSON.stringify(oneElement))
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
              console.log('new driver')
              // await page.waitForSelector('#Return');
              // await page.click('#Return');
              console.log(' 1 >>>>>>>')
              await page.evaluate(()=> document.querySelector('#Return').click());
              //await page.waitForSelector('#DriverSelectionController');
              await page.waitFor(2000);
              await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
              console.log(' 2 >>>>>>>')
              await page.waitFor(2000);
              await page.select('#DriverSelectionController', 'Non-Driver');

              //await page.evaluate(()=> document.querySelector('#DriverSelectionController').value = 'Non-Driver');
              console.log(' 3 >>>>>>>')
              //await page.evaluate(()=> document.querySelector('select[name="DriverSelectionController"]').onchange(''));
             //console.log(' 4 >>>>>>>')
              //await page.select('#DriverSelectionController', 'Non-Driver');
            }
          }
        }catch(e){
          console.log('driverStep error',e)
          const response = { error: 'There is some error validations at driverStep' };
          bodyData.results = {
            status: false,
            response,
          };
          console.log('final result >> ', JSON.stringify(bodyData.results));
          req.session.data = {
            title: 'CSE CA Rate Retrieved Successfully',
            obj: bodyData.results,
          };
          return next();
        }
      }

      // For login
      await loginStep(browser, page);

      await page.waitFor(3000);
      // await page.click('#NextPage');

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
          totalPolicyTermPremium: document.getElementById('PremInfo_TotalPolicyTermPremium').innerText,
          TransactionApRp: document.getElementById('PremInfo_Trans_AP_RP').innerText,
          totalCommission: document.getElementById('PremInfo_TotalCommission').innerText,
          transactionCommission: document.getElementById('PremInfo_TransactionCommission').innerText,
        };
        return details;
      });

      bodyData.results = {
        status: true,
        response: premiumDetails,
      };
      console.log('final result >> ', JSON.stringify(bodyData.results));
      req.session.data = {
        title: 'CSE CA Rate Retrieved Successfully',
        obj: bodyData.results,
      };
      return next();
      // req.session.data = {
      //   premiumDetails,
      // };
    
      return next();
    } catch (error) {
      console.log('error >> ', error);
      return next(Boom.badRequest('Error retrieving cse rate'));
    }
  },
};
