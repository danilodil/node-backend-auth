const request = require('request-promise');
const Boom = require('boom');
const fs = require('fs');
const path = require('path');

const appConstant = require('../constants/appConstant').ezLynx;
const configConstant = require('../constants/configConstants').CONFIG;
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrskey: 'ATTR' });
const base64 = require('base-64');
const jsonxml = require('jsontoxml');
const format = require('xml-formatter');
const libxmljs = require('libxmljs');
const stringSimilarity = require('string-similarity');



module.exports = {
  createContact: async (req, res, next) => {
    try {

      const { username } = req.body.decoded_vendor;

      console.log('TYPE: ======', req.params.type);
      
      const returnClosestOccupation = async(oc) => {
         try {
            const occupations = ['Homemaker/House person','Retired','Disabled','Unemployed','Graduate Student','High school','Other','Undergraduate','Agriculture Inspector/Grader','Arborist','Clerk','Equipment Operator','Farm/Ranch Owner','Farm/Ranch Worker','Fisherman','Florist','Laborer/Worker','Landscaper/Nursery Worker','Landscaper','Logger','Mill worker','Other','Ranger','Supervisor','Timber Grader/Scale','Actor','Administrative Assistant','Announcer/Broadcaster','Artist/Animator','Author/Writer','Choreography/Dancer','Clerk','Composer/Director','Curator','Designer','Editor','Journalist/Reporter','Musician/Singer','Other','Printer','Producer','Production Crew','Projectionist','Receptionist/Secretary','Ticket Sales/Usher','Accountant/Auditor','Administrative Assistant','Analyst/Broker','Bookkeeper','Branch Manager','Clerk','Collections','Consultant','Controller','CSR/Teller','Director/Administrator','Executive','Financial Advisor','Investment Banker','Investor','Loan/Escrow Processor','Manager-Credit/Loan','Manager-Portfolio/Production','Manager-Property','Other','Realtor','Receptionist/Secretary','Sales Agent/Representative','Trader',' Financial Instruments','Underwriter','Account Executive','Administrative Assistant','Buyer','Clerk-Office','Consultant','Customer Service Representative','Director/Administrator','Executive','H.R. Representative','Marketing Researcher','Messenger/Courier','Manager - District','Manager - Finance','Manager - Department/Store','Manager - General Operations','Manager - H.R./Public Relations','Manager - Marketing/Sales','Manager/Supervisor - Office','Other','Receptionist/Secretary','Sales-Counter/Rental','Sales-Home Based','Sales-Manufacture Rep','Sales-Retail/Wholesale','Sales-Route/Vendor','Boiler Operator/Maker','Bricklayer/Mason','Carpenter','Carpet Installer','Concrete Worker','Construction - Project Manager','Contractor','Crane Operator','Electrician/Linesman','Elevator Technician/Installer','Equipment Operator','Floor Layer/Finisher','Foreman/Supervisor','Handyman','Heat/Air Technician','Inspector','Laborer/Worker','Metalworker','Miner','Oil/Gas Driller/Rig Operator','Other','Painter','Plaster/Drywall/Stucco','Plumber','Roofer','Administrative Assistant','Audio-Visual Tech.','Child/Daycare Worker','Clerk','Counselor','Graduate Teaching Assistant','Instructor-Vocation','Librarian/Curator','Other','Professor',' College','Receptionist/Secretary','Superintendent','Teacher',' College','Teacher',' K-12','Teaching Assistant/Aide','Tutor','Actuary','Administrative Assistant','Analyst','Architect','Clerk','Clinical Data Coordinator','Drafter','Engineer','Manager-Project','Manager-R&D','Mathematician','Other','Receptionist/Secretary','Research Program Director','Researcher','Scientist','Sociologist','Surveyor/Mapmaker','Technician','Accountant/Auditor','Administrative Assistant','Analyst','Attorney','Chief Executive','Clerk','Commissioner','Council member','Director/Administrator','Enlisted Military Personnel (E1-4)','Legislator','Mayor/City Manager','Meter Reader','NCO (E5-9)','Officer-Commissioned','Officer-Warrant','Other','Park Ranger','Planner','Postmaster','Receptionist/Secretary','Regulator','US Postal Worker','Administrative Assistant','Analyst','Clerk','Director/Administrator','Engineer-Hardware','Engineer-Software','Engineer-Systems','Executive','Manager-Systems','Network Administrator','Other','Programmer','Project Coordinator','Receptionist/Secretary','Support Technician','Systems Security','Technical Writer','Web Developer','Accountant/Auditor','Actuarial Clerk','Actuary','Administrative Assistant','Agent/Broker','Analyst','Attorney','Claims Adjuster','Clerk','Commissioner','Customer Service Representative','Director/Administrator','Executive','Other','Product Manager','Receptionist/Secretary','Sales Representative','Underwriter','Airport Security Officer','Animal Control Officer','Attorney','Bailiff','Corrections Officer','Court Clerk/Reporter','Deputy Sheriff','Dispatcher','Examiner','Federal Agent/Marshall','Fire Chief','Fire Fighter/Supervisor','Gaming Officer/Investigator','Highway Patrol Officer','Judge/Hearing Officer','Legal Assistant/Secretary','Other','Paralegal/Law Clerk','Police Chief','Police Detective/Investigator','Police Officer/Supervisor','Process Server','Private Investigator/Detective','Security Guard','Sheriff','Building Maintenance Engineer','Custodian/Janitor','Electrician','Field Service Technician','Handyman','Heat/Air Conditioner Repairman','Housekeeper/Maid','Landscape/Grounds Maintenance','Maintenance Mechanic','Mechanic','Other','Administrative Assistant','Clerk','Factory Worker','Foreman/Supervisor','Furniture Finisher','Inspector','Jeweler','Machine Operator','Other','Packer','Plant Manager','Printer/Bookbinder','Quality Control','Receptionist/Secretary','Refining Operator','Shoemaker','Tailor/Custom Sewer','Textile Worker','Upholsterer','Administrative Assistant','Assistant - Medic/Dent/Vet','Clergy','Clerk','Client Care Worker','Dental Hygienist','Dentist','Doctor','Hospice Volunteer','Mortician','Nurse - C.N.A.','Nurse - LPN','Nurse - RN','Nurse Practitioner','Optometrist','Other','Paramedic/E.M. Technician','Pharmacist','Receptionist/Secretary','Social Worker','Support Services','Technician','Therapist','Veterinarian','Caregiver','Dry Cleaner/Laundry','Hair Stylist/Barber','Housekeeper','Manicurist','Masseuse','Nanny','Other','Pet Services','Receptionist/Secretary','Baker','Bartender','Bellhop','Bus Person','Caterer','Chef','Concessionaire','Concierge','Cook - Restaurant/Cafeteria','Cook/Worker-Fast Food','Delivery Person','Desk Clerk','Dishwasher','Food Production/Packing','Host/Maitre d','Housekeeper/Maid','Manager','Other','Valet','Waiter/Waitress','Wine Steward','Activity/Recreational Assistant','Administrative Assistant','Agent','Athlete','Camp Counselor/Lead','Clerk','Coach','Concessionaire','Director',' Program','Event Manager/Promoter','Life Guard','Manager - Fitness Club','Other','Park Ranger','Receptionist/Secretary','Sales-Ticket/Membership','Sports Broadcaster/Journalist','Trainer/Instructor','Umpire/Referee','Administrative Assistant','Air Traffic Control','Airport Operations Crew','Bellhop/Porter','Clerk','Crane Loader/Operator','Dispatcher','Driver - Bus/Streetcar','Driver-Taxi/Limo','Driver-Truck/Delivery','Flight Attendant','Forklift Operator','Laborer','Longshoreman','Mate/Sailor','Manager - Warehouse/District','Other','Parking Lot Attendant','Pilot/Captain/Engineer','Railroad Worker','Receptionist/Secretary','Shipping/Receiving Clerk','Subway/Light Rail Operator','Ticket Agent','Transportation Specialist','Other'];
            const occup = (await returnValue(oc) !== '' ? occupations[stringSimilarity.findBestMatch(await returnValue(oc), occupations).bestMatchIndex] : '');
            if (await returnValue(occup) !== '') {
               return occup;
            } else {
               return '';
            }
         } catch (error) {
            return next(Boom.badRequest('Error finding closest occupation'));
         }
      }

      const returnNewDate = async(date, daysAfter) => {
         try {
            const dd = (date.getDate() + daysAfter).toString().padStart(2, 0);
            const mm = (date.getMonth() + 1).toString().padStart(2, 0);
            const y = date.getFullYear();
            return (y + '-'+ mm + '-'+ dd);
         } catch(error) {
            console.log(`Error on this date ${date}`, error);
         }
      }

      const returnValue = async(value) => {
         try {
            if (typeof value != 'undefined' && value !== 'undefined' && value !== null && value !== 'null') {
               if (value === 'true' || value === true) {
                  return 'Yes';
               } else if (value === 'false' || value === false) {
                  return 'No';
               } else {
                  return value;
               }
            } else {
               return '';
            }
         } catch(error) {
            console.log(`Error on value: ${value}`, error);
         }
      }

      returnDrivers = async() => {
         try {
            let driversObj = [];
            for (let i=0;i<req.body.Contact.Drivers.length;i++) {
               let driver = req.body.Contact.Drivers[i];
               let driverObj = {
                  name: 'Driver',
                  attrs: {id: driver.attrs.id},
                  children: [
                     {
                        Name: {
                          ... (await returnValue(driver.children.Name.FirstName) !== '' && {FirstName: await returnValue(driver.children.Name.FirstName)}),
                          ... (await returnValue(driver.children.Name.LastName) !== '' && {LastName: await returnValue(driver.children.Name.LastName)})
                        },
                        ... (await returnValue(driver.children.Gender) !== '' && {Gender: await returnValue(driver.children.Gender)}),
                        ... (await returnValue(driver.children.DOB) !== '' && {DOB: await returnNewDate(new Date(await returnValue(driver.children.DOB)), 0)}),
                        ... (await returnValue(driver.children.DLNumber) !== '' && {DLNumber: await returnValue(driver.children.DLNumber)}),
                        ... (await returnValue(driver.children.DLState) !== '' && {DLState: await returnValue(driver.children.DLState)}),
                        ... (await returnValue(driver.children.MaritalStatus) !== '' && {MaritalStatus: await returnValue(driver.children.MaritalStatus)}),
                        Relation: 'Insured',
                        // ... (await returnValue(driver.children.Occupation) !== '' && {Industry: await returnValue(driver.children.Occupation)}),
                        ... (await returnValue(driver.children.Occupation) !== '' && {Occupation: await returnClosestOccupation(await returnValue(driver.children.Occupation))}),
                     }
                  ]
               };
               driversObj.push(driverObj);
               if (!req.body.Contact.Drivers[+i+1]) {
                  return driversObj;
               }
            }
         } catch(error) {
            console.log('Error on drivers', error);
         }
      };

      returnVehicles = async() => {
         try {
            let vehiclesObj = [];
            for (let i=0;i<req.body.Contact.Vehicles.length;i++) {
               let vehicle = req.body.Contact.Vehicles[i];
               console.log((await returnValue(vehicle.children.Make)).toUpperCase());
               let vehicleObj = {
                  name: 'Vehicle',
                  attrs: {id: vehicle.attrs.id},
                  children: [
                     {
                        UseVinLookup: await returnValue(vehicle.children.Vin) !== '' ? 'Yes' : 'No',
                        ... (await returnValue(vehicle.children.Year) !== '' && {Year: await returnValue(vehicle.children.Year)}),
                        ... (await returnValue(vehicle.children.Vin) !== '' && {Vin: await returnValue(vehicle.children.Year)}),
                        ... (await returnValue(vehicle.children.Make) !== '' && {Make: (await returnValue(vehicle.children.Make)).toUpperCase()}),
                        ... (await returnValue(vehicle.children.Model) !== '' && {Model: (await returnValue(vehicle.children.Model)).toUpperCase()}),
                        ... (await returnValue(vehicle.children['Sub-Model']) !== '' && {['Sub-Model']: (await returnValue(vehicle.children['Sub-Model'])).toUpperCase()})
                     }
                  ]
               };
               vehiclesObj.push(vehicleObj);
               if (!req.body.Contact.Vehicles[+i+1]) {
                  return vehiclesObj;
               }
            }
         } catch(error) {
            console.log('Error on vehicles', error);
         }
      };

      returnVehiclesCoverage = async() => {
         try {
            let vehiclesCoverageObj = [];
            for (let i=0;i<req.body.Contact.Vehicles.length;i++) {
               let vehicle = req.body.Contact.Vehicles[i];
               let vehicleCoverageObj = {
                  name: 'VehicleCoverage',
                  attrs: {id: vehicle.attrs.id},
                  children: [
                     {
                        OtherCollisionDeductible: '1000',
                        CollisionDeductible: '1000',
                        TowingDeductible: 'No Coverage',
                        RentalDeductible: 'No Coverage'
                     }
                  ]
               };
               vehiclesCoverageObj.push(vehicleCoverageObj);
               if (!req.body.Contact.Vehicles[+i+1]) {
                  return vehiclesCoverageObj;
               }
            }
         } catch(error) {
            console.log('Error on vehicle coverage', error);
         }
      };

      //Removed Weeks Per Month
      returnVehiclesUse = async() => {
         try {
            let vehiclesUseObj = [];
            let vehicleUseOptions = ['Business', 'Farming', 'Pleasure', 'To/From Work', 'To/From School'];
            for (let i=0;i<req.body.Contact.VehiclesUse.length;i++) {
               let vehicleUse = req.body.Contact.VehiclesUse[i];
               let vehicleUseage = (await returnValue(vehicleUse.children.Useage) !== '' ? vehicleUseOptions[stringSimilarity.findBestMatch(await returnValue(vehicleUse.children.Useage), vehicleUseOptions).bestMatchIndex] : '');
               let vehicleUseObj = {
                  name: 'VehicleUse',
                  attrs: {id: vehicleUse.attrs.id},
                  children: [
                     {
                        ... (await returnValue(vehicleUseage) !== '' && {Useage: vehicleUseage}),
                        ... (await returnValue(vehicleUse.children.OneWayMiles) !== '' && {OneWayMiles: await returnValue(vehicleUse.children.OneWayMiles)}),
                        ... (await returnValue(vehicleUse.children.DaysPerWeek) !== '' && {DaysPerWeek: await returnValue(vehicleUse.children.DaysPerWeek)}),
                        ... (await returnValue(vehicleUse.children.AnnualMiles) !== '' && {AnnualMiles: await returnValue(vehicleUse.children.AnnualMiles)}),
                        ... (await returnValue(vehicleUse.children.Ownership) !== '' && {Ownership: await returnValue(vehicleUse.children.Ownership)}),
                        ... (await returnValue(vehicleUse.children.PrincipalOperator) !== '' && {PrincipalOperator: await returnValue(vehicleUse.children.PrincipalOperator)}),
                        ... (await returnValue(vehicleUse.children.UsedForDelivery) !== '' && {UsedForDelivery: await returnValue(vehicleUse.children.UsedForDelivery)}),
                        ... (await returnValue(vehicleUse.children.PriorDamagePresent) !== '' && {PriorDamagePresent: await returnValue(vehicleUse.children.PriorDamagePresent)})
                     }
                  ]
               };
               vehiclesUseObj.push(vehicleUseObj);
               if (!req.body.Contact.VehiclesUse[+i+1]) {
                  return vehiclesUseObj;
               }
            }
         } catch(error) {
            console.log('Error on vehicle use', error);
         }
      };

      //TODO Fix Industry to look at Occupation
      //Add Homeownership + years at home question by default to auto
      //Add tracking for multi-car discount
      //Add Relation in new multiple obj feature on FE
      //Match Driver and Vehicle on FE

      const applicantAuto = {
         Applicant: {
            ApplicantType: "Applicant",
            PersonalInfo: {
               Name: {
                  FirstName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.FirstName),
                  ... ((await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName) !== '') && {MiddleName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName)}),
                  LastName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.LastName),
               },
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB) !== '' && {DOB: await returnNewDate(new Date(await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB)), 0)}),
               ... ((await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender) !== '') && {Gender: await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender)}),
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus) !== '' && {MaritalStatus: await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus)}),
               // ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation) !== '' && {Industry: await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation)}),
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation) !== '' && {Occupation: await returnClosestOccupation(await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation))}),
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.Education) !== '' && {Education: await returnValue(req.body.Contact.Applicant.PersonalInfo.Education)}),
               Relation: 'Insured',
            },
            ... ((await returnValue(req.body.Contact.Applicant.Address) !== '' && await returnValue(req.body.Contact.Applicant.Address.Phone) !== '') && {Address: {
               AddressCode: 'StreetAddress',
               ... (await returnValue(req.body.Contact.Applicant.Address.StreetName) !== '' && {Addr1: {
                  ... (await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) !== '' && {StreetName: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName)}),
                  ... (await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber) !== '' && {StreetNumber: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber)})
               }}),
               ... (await returnValue(req.body.Contact.Applicant.Address.City) !== '' && {City: await returnValue(req.body.Contact.Applicant.Address.City)}),
               ... (await returnValue(req.body.Contact.Applicant.Address.StateCode) !== '' && {StateCode: await returnValue(req.body.Contact.Applicant.Address.StateCode)}),
               ... (await returnValue(req.body.Contact.Applicant.Address.Zip5) !== '' && {Zip5: await returnValue(req.body.Contact.Applicant.Address.Zip5)}),
               ... (await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && {Phone: {
                  PhoneType: 'Mobile',
                  ... (await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && {PhoneNumber: await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber)})
               }}),
               ... (await returnValue(req.body.Contact.Applicant.Address.Email) !== '' && {Email: await returnValue(req.body.Contact.Applicant.Address.Email)}),
            }})
         },
         // Need prior carrier - expiration - years/months with for both
         // PriorPolicyInfo: {
         //    ... (await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier) !== '' && {PriorCarrier: await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier)}),
         //    ... (await returnValue(req.body.Contact.PriorPolicyInfo.Expiration) !== '' && {Expiration: await returnValue(req.body.Contact.PriorPolicyInfo.Expiration)}),
         //    YearsWithPriorCarrier: {
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years) !== '' && {Years: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years)}),
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months) !== '' && {Months: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months)})
         //    },
         //    YearsWithContinuosCoverage: {
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.Years) !== '' && {Years: await returnValue(req.body.Contact.PriorPolicyInfo.Years)}),
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.Months) !== '' && {Months: await returnValue(req.body.Contact.PriorPolicyInfo.Months)}),
         //    }
         // },
         // PolicyInfo: {
         //    PolicyTerm: '6 Month',
         //    Package: 'No',
         //    Effective: await returnNewDate(new Date(), 3),
         // },
         // ResidenceInfo: {
         //    CurrentAddress: {
         //       YearsAtCurrent: {
         //          Years: 3,
         //          Months: 0
         //       },
         //       Ownership: 'Other'
         //    }
         // },
         ... ((await returnValue(req.body.Contact.Drivers) !== '' && await returnValue(req.body.Contact.Drivers[0].children.Name) !== '') && {Drivers: await returnDrivers()}),
         ... ((await returnValue(req.body.Contact.Vehicles) !== '' && await returnValue(req.body.Contact.Vehicles[0].children.Model) !== '') && {Vehicles: await returnVehicles()}),
         // ... ((await returnValue(req.body.Contact.VehiclesUse) !== '' && await returnValue(req.body.Contact.VehiclesUse[0].children.Useage) !== '') && {VehiclesUse: await returnVehiclesUse()}),
         ... ((await returnValue(req.body.Contact.GeneralInfo) !== '' && await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '') && {GeneralInfo: {
            ... (await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '' && {RatingStateCode: await returnValue(req.body.Contact.GeneralInfo.RatingStateCode)}),
         }})
      };

      const applicantHome = {
         Applicant: {
            ApplicantType: "Applicant",
            PersonalInfo: {
               Name: {
                  FirstName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.FirstName),
                  ... ((await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName) !== '') && {MiddleName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName)}),
                  LastName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.LastName),
               },
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB) !== '' && {DOB: await returnNewDate(new Date(await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB)), 0)}),
               ... ((await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender) !== '') && {Gender: await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender)}),
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus) !== '' && {MaritalStatus: await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus)}),
               // ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation) !== '' && {Industry: await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation)}),
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation) !== '' && {Occupation: await returnClosestOccupation(await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation))}),
               ... (await returnValue(req.body.Contact.Applicant.PersonalInfo.Education) !== '' && {Education: await returnValue(req.body.Contact.Applicant.PersonalInfo.Education)}),
               Relation: 'Insured',
            },
            ... ((await returnValue(req.body.Contact.Applicant.Address) !== '' && await returnValue(req.body.Contact.Applicant.Address.Phone) !== '') && {Address: {
               AddressCode: 'StreetAddress',
               ... (await returnValue(req.body.Contact.Applicant.Address.StreetName) !== '' && {Addr1: {
                  ... (await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) !== '' && {StreetName: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName)}),
                  ... (await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber) !== '' && {StreetNumber: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber)})
               }}),
               ... (await returnValue(req.body.Contact.Applicant.Address.City) !== '' && {City: await returnValue(req.body.Contact.Applicant.Address.City)}),
               ... (await returnValue(req.body.Contact.Applicant.Address.StateCode) !== '' && {StateCode: await returnValue(req.body.Contact.Applicant.Address.StateCode)}),
               ... (await returnValue(req.body.Contact.Applicant.Address.Zip5) !== '' && {Zip5: await returnValue(req.body.Contact.Applicant.Address.Zip5)}),
               ... (await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && {Phone: {
                  PhoneType: 'Mobile',
                  ... (await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && {PhoneNumber: await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber)})
               }}),
               ... (await returnValue(req.body.Contact.Applicant.Address.Email) !== '' && {Email: await returnValue(req.body.Contact.Applicant.Address.Email)}),
            }})
         },
         // Need prior carrier - expiration - years/months with for both
         // PriorPolicyInfo: {
         //    ... (await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier) !== '' && {PriorCarrier: await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier)}),
         //    ... (await returnValue(req.body.Contact.PriorPolicyInfo.Expiration) !== '' && {Expiration: await returnValue(req.body.Contact.PriorPolicyInfo.Expiration)}),
         //    YearsWithPriorCarrier: {
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years) !== '' && {Years: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years)}),
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months) !== '' && {Months: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months)})
         //    },
         //    YearsWithContinuosCoverage: {
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.Years) !== '' && {Years: await returnValue(req.body.Contact.PriorPolicyInfo.Years)}),
         //       ... (await returnValue(req.body.Contact.PriorPolicyInfo.Months) !== '' && {Months: await returnValue(req.body.Contact.PriorPolicyInfo.Months)}),
         //    }
         // },
         // PolicyInfo: {
         //    PolicyTerm: '6 Month',
         //    Package: 'No',
         //    Effective: await returnNewDate(new Date(), 3),
         // },
         // ResidenceInfo: {
         //    CurrentAddress: {
         //       YearsAtCurrent: {
         //          Years: 3,
         //          Months: 0
         //       },
         //       Ownership: 'Other'
         //    }
         // },
         ... (await returnValue(req.body.Contact.RatingInfo) !== '' && {RatingInfo: {
            ... (await returnValue(req.body.Contact.RatingInfo.PropertyInsCancelledLapsed) !== '' && {PropertyInsCancelledLapsed: await returnValue(req.body.Contact.RatingInfo.PropertyInsCancelledLapsed)}),
            ... (await returnValue(req.body.Contact.RatingInfo.YearBuilt) !== '' && {YearBuilt: await returnValue(req.body.Contact.RatingInfo.YearBuilt)}),
            ... (await returnValue(req.body.Contact.RatingInfo.Dwelling) !== '' && {Dwelling: await returnValue(req.body.Contact.RatingInfo.Dwelling)}),
            ... (await returnValue(req.body.Contact.RatingInfo.DwellingUse) !== '' && {DwellingUse: await returnValue(req.body.Contact.RatingInfo.DwellingUse)}),
            ... (await returnValue(req.body.Contact.RatingInfo.NumberOfFullTimeDomEmps) !== '' && {NumberOfFullTimeDomEmps: await returnValue(req.body.Contact.RatingInfo.NumberOfFullTimeDomEmps)}),
            ... (await returnValue(req.body.Contact.RatingInfo.DistanceToFireHydrant) !== '' && {DistanceToFireHydrant: await returnValue(req.body.Contact.RatingInfo.DistanceToFireHydrant)}),
            ... (await returnValue(req.body.Contact.RatingInfo.WithinCityLimits) !== '' && {WithinCityLimits: await returnValue(req.body.Contact.RatingInfo.WithinCityLimits)}),
            ... (await returnValue(req.body.Contact.RatingInfo.WithinProtectedSuburb) !== '' && {WithinProtectedSuburb: await returnValue(req.body.Contact.RatingInfo.WithinProtectedSuburb)}),
            ... (await returnValue(req.body.Contact.RatingInfo.DistanceToFireStation) !== '' && {DistanceToFireStation: await returnValue(req.body.Contact.RatingInfo.DistanceToFireStation)}),
            ... (await returnValue(req.body.Contact.RatingInfo.WithinFireDistrict) !== '' && {WithinFireDistrict: await returnValue(req.body.Contact.RatingInfo.WithinFireDistrict)}),
            ... (await returnValue(req.body.Contact.RatingInfo.ProtectionClass) !== '' && {ProtectionClass: await returnValue(req.body.Contact.RatingInfo.ProtectionClass)}),
            ... (await returnValue(req.body.Contact.RatingInfo.NumberOfStories) !== '' && {NumberOfStories: await returnValue(req.body.Contact.RatingInfo.NumberOfStories)}),
            ... (await returnValue(req.body.Contact.RatingInfo.Construction) !== '' && {Construction: await returnValue(req.body.Contact.RatingInfo.Construction)}),
            ... (await returnValue(req.body.Contact.RatingInfo.Structure) !== '' && {Structure: await returnValue(req.body.Contact.RatingInfo.Structure)}),
            ... (await returnValue(req.body.Contact.RatingInfo.Roof) !== '' && {Roof: await returnValue(req.body.Contact.RatingInfo.Roof)}),
            ... (await returnValue(req.body.Contact.RatingInfo.RoofULClass) !== '' && {RoofULClass: await returnValue(req.body.Contact.RatingInfo.RoofULClass)}),
            ... (await returnValue(req.body.Contact.RatingInfo.DistanceToBrush) !== '' && {DistanceToBrush: await returnValue(req.body.Contact.RatingInfo.DistanceToBrush)}),
            ... (await returnValue(req.body.Contact.RatingInfo.DistanceToTidalWater) !== '' && {DistanceToTidalWater: await returnValue(req.body.Contact.RatingInfo.DistanceToTidalWater)}),
            ... (await returnValue(req.body.Contact.RatingInfo.SwimmingPool) !== '' && {SwimmingPool: await returnValue(req.body.Contact.RatingInfo.SwimmingPool)}),
            ... (await returnValue(req.body.Contact.RatingInfo.SwimmingPoolFenced) !== '' && {SwimmingPoolFenced: await returnValue(req.body.Contact.RatingInfo.SwimmingPoolFenced)}),
            ... (await returnValue(req.body.Contact.RatingInfo.SwimmingPoolType) !== '' && {SwimmingPoolType: await returnValue(req.body.Contact.RatingInfo.SwimmingPoolType)}),
            ... (await returnValue(req.body.Contact.RatingInfo.DogOnPremises) !== '' && {DogOnPremises: await returnValue(req.body.Contact.RatingInfo.DogOnPremises)}),
            ... (await returnValue(req.body.Contact.RatingInfo.HeatingType) !== '' && {HeatingType: await returnValue(req.body.Contact.RatingInfo.HeatingType)}),
            ... (await returnValue(req.body.Contact.RatingInfo.WoodBurningStove) !== '' && {WoodBurningStove: await returnValue(req.body.Contact.RatingInfo.WoodBurningStove)}),
            ... (await returnValue(req.body.Contact.RatingInfo.NumberOfWoodBurningStoves) !== '' && {NumberOfWoodBurningStoves: await returnValue(req.body.Contact.RatingInfo.NumberOfWoodBurningStoves)}),
            ... (await returnValue(req.body.Contact.RatingInfo.RoofingUpdate) !== '' && {RoofingUpdate: await returnValue(req.body.Contact.RatingInfo.RoofingUpdate)}),
            ... (await returnValue(req.body.Contact.RatingInfo.RoofingUpdateYear) !== '' && {RoofingUpdateYear: await returnValue(req.body.Contact.RatingInfo.RoofingUpdateYear)}),
            ... (await returnValue(req.body.Contact.RatingInfo.ElectricalUpdate) !== '' && {ElectricalUpdate: await returnValue(req.body.Contact.RatingInfo.ElectricalUpdate)}),
            ... (await returnValue(req.body.Contact.RatingInfo.PlumbingUpdate) !== '' && {PlumbingUpdate: await returnValue(req.body.Contact.RatingInfo.PlumbingUpdate)}),
            ... (await returnValue(req.body.Contact.RatingInfo.PlumbingUpdateYear) !== '' && {PlumbingUpdateYear: await returnValue(req.body.Contact.RatingInfo.PlumbingUpdateYear)}),
            ... (await returnValue(req.body.Contact.RatingInfo.HeatingUpdate) !== '' && {HeatingUpdate: await returnValue(req.body.Contact.RatingInfo.HeatingUpdate)}),
            ... (await returnValue(req.body.Contact.RatingInfo.HeatingUpdateYear) !== '' && {HeatingUpdateYear: await returnValue(req.body.Contact.RatingInfo.HeatingUpdateYear)}),
            ... (await returnValue(req.body.Contact.RatingInfo.ElectricCircuitBreaker) !== '' && {ElectricCircuitBreaker: await returnValue(req.body.Contact.RatingInfo.ElectricCircuitBreaker)}),
            ... (await returnValue(req.body.Contact.RatingInfo.UnderConstruction) !== '' && {UnderConstruction: await returnValue(req.body.Contact.RatingInfo.UnderConstruction)}),
            ... (await returnValue(req.body.Contact.RatingInfo.SquareFootage) !== '' && {SquareFootage: await returnValue(req.body.Contact.RatingInfo.SquareFootage)}),
            ... (await returnValue(req.body.Contact.RatingInfo.NumberOfApartments) !== '' && {NumberOfApartments: await returnValue(req.body.Contact.RatingInfo.NumberOfApartments)}),
            ... (await returnValue(req.body.Contact.RatingInfo.PurchaseDate) !== '' && {PurchaseDate: await returnValue(req.body.Contact.RatingInfo.PurchaseDate)}),
            ... (await returnValue(req.body.Contact.RatingInfo.PurchasePrice) !== '' && {PurchasePrice: await returnValue(req.body.Contact.RatingInfo.PurchasePrice)}),
            ... (await returnValue(req.body.Contact.RatingInfo.Trampoline) !== '' && {Trampoline: await returnValue(req.body.Contact.RatingInfo.Trampoline)}),
            ... (await returnValue(req.body.Contact.RatingInfo.SecondaryHeatingSource) !== '' && {SecondaryHeatingSource: await returnValue(req.body.Contact.RatingInfo.SecondaryHeatingSource)}),
            ... (await returnValue(req.body.Contact.RatingInfo.SecondaryHeatingSourceType) !== '' && {SecondaryHeatingSourceType: await returnValue(req.body.Contact.RatingInfo.SecondaryHeatingSourceType)}),
            ... (await returnValue(req.body.Contact.RatingInfo.BusinessOnPremises) !== '' && {BusinessOnPremises: await returnValue(req.body.Contact.RatingInfo.BusinessOnPremises)}),
            ... (await returnValue(req.body.Contact.RatingInfo.FirstMortgagee) !== '' && {FirstMortgagee: await returnValue(req.body.Contact.RatingInfo.FirstMortgagee)}),
            ... (await returnValue(req.body.Contact.RatingInfo.SecondMortgagee) !== '' && {SecondMortgagee: await returnValue(req.body.Contact.RatingInfo.SecondMortgagee)}),
            ... (await returnValue(req.body.Contact.RatingInfo.ThirdMortgagee) !== '' && {ThirdMortgagee: await returnValue(req.body.Contact.RatingInfo.ThirdMortgagee)}),
            ... (await returnValue(req.body.Contact.RatingInfo.EquityLineOfCredit) !== '' && {EquityLineOfCredit: await returnValue(req.body.Contact.RatingInfo.EquityLineOfCredit)}),
            ... (await returnValue(req.body.Contact.RatingInfo.CoSigner) !== '' && {CoSigner: await returnValue(req.body.Contact.RatingInfo.CoSigner)}),
            ... (await returnValue(req.body.Contact.RatingInfo.NumberOfOtherInterests) !== '' && {NumberOfOtherInterests: await returnValue(req.body.Contact.RatingInfo.NumberOfOtherInterests)}),
            ... (await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended) !== '' && {ReplacementCostExtended: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended)}),
            ... (await returnValue(req.body.Contact.RatingInfo.RoofShape) !== '' && {RoofShape: await returnValue(req.body.Contact.RatingInfo.RoofShape)}),
            ... (await returnValue(req.body.Contact.RatingInfo.WindSpeed) !== '' && {WindSpeed: await returnValue(req.body.Contact.RatingInfo.WindSpeed)}),
            ... (await returnValue(req.body.Contact.RatingInfo.Foundation) !== '' && {Foundation: await returnValue(req.body.Contact.RatingInfo.Foundation)}),
         }}),
         ... ((await returnValue(req.body.Contact.GeneralInfo) !== '' && await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '') && {GeneralInfo: {
            ... (await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '' && {RatingStateCode: await returnValue(req.body.Contact.GeneralInfo.RatingStateCode)}),
         }})
      };
    
      const data = jsonxml(req.params.type === 'Home' ? applicantHome : applicantAuto);

      const xml_head = `<?xml version="1.0" encoding="utf-8"?> <EZ${req.params.type.toUpperCase()} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/${req.params.type}/V200">` ;
      const xml_body = xml_head.concat(data, `</EZ${req.params.type.toUpperCase()}>`);

      console.log(xml_body);

      const encodedData = base64.encode(xml_body);

      const xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
      const xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.body.clientId}" DataUploadFlags="4"><v100:FileData Name="EZ${req.params.type}" MimeType="text/xml">`;
      const xml_soap_body_close = `</v100:FileData> </v100:UploadRequest> </v100:EZLynxUploadRequest> </tem:UploadFile> </soap:Body></soap:Envelope>`;
      const xml_string = xml_authentication_header.concat(xml_soap_body_opens, encodedData, xml_soap_body_close);

      // let validXML;

      // if (req.params.type.toUpperCase() === 'AUTO') {
      //    const autoValidationFile = fs.readFileSync(path.resolve(__dirname, '../assets/ezlynx-validation/ezlynxautoV200.xsd'), 'utf8');
      //    const autoXSD = libxmljs.parseXml(autoValidationFile);
      //    const autoXML = libxmljs.parseXml(xml_string);
         
      //    validXML = autoXML.validate(autoXSD);
      //    console.log('Result: ', validXML);
      // } else if (req.params.type.toUpperCase() === 'HOME') {
      //    const homeValidationFile = fs.readFileSync(path.resolve(__dirname, '../assets/ezlynx-validation/ezlynxhomeV200.xsd'), 'utf8');
      //    const homeXSD = libxmljs.parseXml(homeValidationFile);
      //    const homeXML = libxmljs.parseXml(xml_body);
      //    validXML = homeXML.validate(homeXSD);
      // }

      
      // if (validXML.validationErrors) {
      // } else {
      //    console.log('Passed XSD');
      // }

      

      const options = { 
        method: 'POST',
        url: configConstant.nodeEnv === 'production' ? appConstant.UPLOAD_PATH : appConstant.UPLOAD_PATH_DEV,
        qs: { WSDL: '' },
        headers: 
            { 
                SOAPAction: 'http://tempuri.org/UploadFile',    
                'Content-Type': 'text/xml' 
            }, 
        body: xml_string 
      };
      
      const response = await request(options);

      let newResponse;

      if (response.includes('Failed')) {
         newResponse = 'Failed';
      } else {
         newResponse = 'Succeeded';
      }

      req.session.data = {
        title: 'Contact created successfully',
        body: newResponse,
        xml: format(xml_body),
        json: req.params.type === 'Home' ? applicantHome : applicantAuto
      };
      return next();
    } catch (error) {
       console.log(error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
