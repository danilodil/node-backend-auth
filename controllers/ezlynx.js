/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,consistent-return,camelcase,no-plusplus,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition,camelcase */

const request = require('request-promise');
const Boom = require('boom');
// const fs = require('fs');
// const path = require('path');

// const xml2js = require('xml2js');

// const parser = new xml2js.Parser({ attrskey: 'ATTR' });
const base64 = require('base-64');
const jsonxml = require('jsontoxml');
const format = require('xml-formatter');
// const libxmljs = require('libxmljs');
const stringSimilarity = require('string-similarity');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').ezLynx;


module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;


      const returnIndustry = async (occ) => {
        const students = ['Graduate Student', 'High school', 'Undergraduate'];
        const agricultures = ['Agriculture Inspector/Grader', 'Arborist', 'Clerk', 'Equipment Operator', 'Farm/Ranch Owner', 'Farm/Ranch Worker', 'Fisherman',
          'Florist', 'Laborer/Worker', 'Landscaper/Nursery Worker', 'Landscaper', 'Logger', 'Mill worker', 'Ranger', 'Timber Grader/Scale'];
        const arts = ['Actor', 'Announcer/Broadcaster', 'Artist/Animator', 'Author/Writer', 'Choreography/Dancer', 'Composer/Director',
          'Curator', 'Designer', 'Editor', 'Journalist/Reporter', 'Musician/Singer', 'Printer', 'Producer', 'Production Crew', 'Projectionist', 'Receptionist/Secretary', 'Ticket Sales/Usher'];
        const bankings = ['Accountant/Auditor', 'Analyst/Broker', 'Bookkeeper', 'Branch Manager', 'Clerk', 'Collections',
          'Consultant', 'Controller', 'CSR/Teller', 'Financial Advisor', 'Investment Banker', 'Investor', 'Loan/Escrow Processor', 'Manager-Credit/Loan', 'Manager-Portfolio/Production',
          'Manager-Property', 'Realtor', 'Receptionist/Secretary', 'Sales Agent/Representative', 'Trader, Financial Instruments', 'Underwriter'];
        const business = ['Account Executive', 'Administrative Assistant', 'Buyer', 'Customer Service Representative', 'H.R. Representative', 'Marketing Researcher', 'Messenger/Courier', 'Manager - District', 'Manager - Finance', 'Manager - Department/Store',
          'Consultant', 'Controller', 'CSR/Teller', 'Director/Administrator', 'Executive', 'Financial Advisor', 'Investment Banker', 'Investor', 'Loan/Escrow Processor', 'Manager-Credit/Loan', 'Manager-Portfolio/Production',
          'Manager - General Operations', 'Manager - H.R./Public Relations', 'Manager - Marketing/Sales', 'Manager/Supervisor - Office', 'Receptionist/Secretary', 'Sales-Counter/Rental', 'Sales-Home Based', 'Sales Agent/Representative', 'Sales-Manufacture Rep',
          'Sales-Retail/Wholesale', 'Sales-Route/Vendor'];
        if (occ === 'Homemaker/House person') {
          return 'Homemaker/House person';
        } if (occ === 'Retired') {
          return 'Retired';
        } if (occ === 'Disabled') {
          return 'Disabled';
        } if (occ === 'Unemployed') {
          return 'Unemployed';
        } if (students.indexOf(occ) > -1) {
          return 'Student';
        } if (agricultures.indexOf(occ) > -1) {
          return 'Agriculture/Forestry/Fishing';
        } if (arts.indexOf(occ) > -1) {
          return 'Art/Design/Media';
        } if (bankings.indexOf(occ) > -1) {
          return 'Banking/Finance/Real Estate';
        } if (business.indexOf(occ) > -1) {
          return 'Business/Sales/Office';
        }
        // Stopped on Constuction Energy
      };

      const returnClosestOccupation = async (oc) => {
        try {
          const occupations = ['Homemaker/House person', 'Retired', 'Disabled', 'Unemployed', 'Graduate Student', 'High school', 'Other', 'Undergraduate', 'Agriculture Inspector/Grader', 'Arborist', 'Clerk', 'Equipment Operator', 'Farm/Ranch Owner', 'Farm/Ranch Worker', 'Fisherman', 'Florist', 'Laborer/Worker', 'Landscaper/Nursery Worker', 'Landscaper', 'Logger', 'Mill worker', 'Other', 'Ranger', 'Supervisor', 'Timber Grader/Scale', 'Actor', 'Administrative Assistant', 'Announcer/Broadcaster', 'Artist/Animator', 'Author/Writer', 'Choreography/Dancer', 'Clerk', 'Composer/Director', 'Curator', 'Designer', 'Editor', 'Journalist/Reporter', 'Musician/Singer', 'Other', 'Printer', 'Producer', 'Production Crew', 'Projectionist', 'Receptionist/Secretary', 'Ticket Sales/Usher', 'Accountant/Auditor', 'Administrative Assistant', 'Analyst/Broker', 'Bookkeeper', 'Branch Manager', 'Clerk', 'Collections', 'Consultant', 'Controller', 'CSR/Teller', 'Director/Administrator', 'Executive', 'Financial Advisor', 'Investment Banker', 'Investor', 'Loan/Escrow Processor', 'Manager-Credit/Loan', 'Manager-Portfolio/Production', 'Manager-Property', 'Other', 'Realtor', 'Receptionist/Secretary', 'Sales Agent/Representative', 'Trader', ' Financial Instruments', 'Underwriter', 'Account Executive', 'Administrative Assistant', 'Buyer', 'Clerk-Office', 'Consultant', 'Customer Service Representative', 'Director/Administrator', 'Executive', 'H.R. Representative', 'Marketing Researcher', 'Messenger/Courier', 'Manager - District', 'Manager - Finance', 'Manager - Department/Store', 'Manager - General Operations', 'Manager - H.R./Public Relations', 'Manager - Marketing/Sales', 'Manager/Supervisor - Office', 'Other', 'Receptionist/Secretary', 'Sales-Counter/Rental', 'Sales-Home Based', 'Sales-Manufacture Rep', 'Sales-Retail/Wholesale', 'Sales-Route/Vendor', 'Boiler Operator/Maker', 'Bricklayer/Mason', 'Carpenter', 'Carpet Installer', 'Concrete Worker', 'Construction - Project Manager', 'Contractor', 'Crane Operator', 'Electrician/Linesman', 'Elevator Technician/Installer', 'Equipment Operator', 'Floor Layer/Finisher', 'Foreman/Supervisor', 'Handyman', 'Heat/Air Technician', 'Inspector', 'Laborer/Worker', 'Metalworker', 'Miner', 'Oil/Gas Driller/Rig Operator', 'Other', 'Painter', 'Plaster/Drywall/Stucco', 'Plumber', 'Roofer', 'Administrative Assistant', 'Audio-Visual Tech.', 'Child/Daycare Worker', 'Clerk', 'Counselor', 'Graduate Teaching Assistant', 'Instructor-Vocation', 'Librarian/Curator', 'Other', 'Professor', ' College', 'Receptionist/Secretary', 'Superintendent', 'Teacher', ' College', 'Teacher', ' K-12', 'Teaching Assistant/Aide', 'Tutor', 'Actuary', 'Administrative Assistant', 'Analyst', 'Architect', 'Clerk', 'Clinical Data Coordinator', 'Drafter', 'Engineer', 'Manager-Project', 'Manager-R&D', 'Mathematician', 'Other', 'Receptionist/Secretary', 'Research Program Director', 'Researcher', 'Scientist', 'Sociologist', 'Surveyor/Mapmaker', 'Technician', 'Accountant/Auditor', 'Administrative Assistant', 'Analyst', 'Attorney', 'Chief Executive', 'Clerk', 'Commissioner', 'Council member', 'Director/Administrator', 'Enlisted Military Personnel (E1-4)', 'Legislator', 'Mayor/City Manager', 'Meter Reader', 'NCO (E5-9)', 'Officer-Commissioned', 'Officer-Warrant', 'Other', 'Park Ranger', 'Planner', 'Postmaster', 'Receptionist/Secretary', 'Regulator', 'US Postal Worker', 'Administrative Assistant', 'Analyst', 'Clerk', 'Director/Administrator', 'Engineer-Hardware', 'Engineer-Software', 'Engineer-Systems', 'Executive', 'Manager-Systems', 'Network Administrator', 'Other', 'Programmer', 'Project Coordinator', 'Receptionist/Secretary', 'Support Technician', 'Systems Security', 'Technical Writer', 'Web Developer', 'Accountant/Auditor', 'Actuarial Clerk', 'Actuary', 'Administrative Assistant', 'Agent/Broker', 'Analyst', 'Attorney', 'Claims Adjuster', 'Clerk', 'Commissioner', 'Customer Service Representative', 'Director/Administrator', 'Executive', 'Other', 'Product Manager', 'Receptionist/Secretary', 'Sales Representative', 'Underwriter', 'Airport Security Officer', 'Animal Control Officer', 'Attorney', 'Bailiff', 'Corrections Officer', 'Court Clerk/Reporter', 'Deputy Sheriff', 'Dispatcher', 'Examiner', 'Federal Agent/Marshall', 'Fire Chief', 'Fire Fighter/Supervisor', 'Gaming Officer/Investigator', 'Highway Patrol Officer', 'Judge/Hearing Officer', 'Legal Assistant/Secretary', 'Other', 'Paralegal/Law Clerk', 'Police Chief', 'Police Detective/Investigator', 'Police Officer/Supervisor', 'Process Server', 'Private Investigator/Detective', 'Security Guard', 'Sheriff', 'Building Maintenance Engineer', 'Custodian/Janitor', 'Electrician', 'Field Service Technician', 'Handyman', 'Heat/Air Conditioner Repairman', 'Housekeeper/Maid', 'Landscape/Grounds Maintenance', 'Maintenance Mechanic', 'Mechanic', 'Other', 'Administrative Assistant', 'Clerk', 'Factory Worker', 'Foreman/Supervisor', 'Furniture Finisher', 'Inspector', 'Jeweler', 'Machine Operator', 'Other', 'Packer', 'Plant Manager', 'Printer/Bookbinder', 'Quality Control', 'Receptionist/Secretary', 'Refining Operator', 'Shoemaker', 'Tailor/Custom Sewer', 'Textile Worker', 'Upholsterer', 'Administrative Assistant', 'Assistant - Medic/Dent/Vet', 'Clergy', 'Clerk', 'Client Care Worker', 'Dental Hygienist', 'Dentist', 'Doctor', 'Hospice Volunteer', 'Mortician', 'Nurse - C.N.A.', 'Nurse - LPN', 'Nurse - RN', 'Nurse Practitioner', 'Optometrist', 'Other', 'Paramedic/E.M. Technician', 'Pharmacist', 'Receptionist/Secretary', 'Social Worker', 'Support Services', 'Technician', 'Therapist', 'Veterinarian', 'Caregiver', 'Dry Cleaner/Laundry', 'Hair Stylist/Barber', 'Housekeeper', 'Manicurist', 'Masseuse', 'Nanny', 'Other', 'Pet Services', 'Receptionist/Secretary', 'Baker', 'Bartender', 'Bellhop', 'Bus Person', 'Caterer', 'Chef', 'Concessionaire', 'Concierge', 'Cook - Restaurant/Cafeteria', 'Cook/Worker-Fast Food', 'Delivery Person', 'Desk Clerk', 'Dishwasher', 'Food Production/Packing', 'Host/Maitre d', 'Housekeeper/Maid', 'Manager', 'Other', 'Valet', 'Waiter/Waitress', 'Wine Steward', 'Activity/Recreational Assistant', 'Administrative Assistant', 'Agent', 'Athlete', 'Camp Counselor/Lead', 'Clerk', 'Coach', 'Concessionaire', 'Director', ' Program', 'Event Manager/Promoter', 'Life Guard', 'Manager - Fitness Club', 'Other', 'Park Ranger', 'Receptionist/Secretary', 'Sales-Ticket/Membership', 'Sports Broadcaster/Journalist', 'Trainer/Instructor', 'Umpire/Referee', 'Administrative Assistant', 'Air Traffic Control', 'Airport Operations Crew', 'Bellhop/Porter', 'Clerk', 'Crane Loader/Operator', 'Dispatcher', 'Driver - Bus/Streetcar', 'Driver-Taxi/Limo', 'Driver-Truck/Delivery', 'Flight Attendant', 'Forklift Operator', 'Laborer', 'Longshoreman', 'Mate/Sailor', 'Manager - Warehouse/District', 'Other', 'Parking Lot Attendant', 'Pilot/Captain/Engineer', 'Railroad Worker', 'Receptionist/Secretary', 'Shipping/Receiving Clerk', 'Subway/Light Rail Operator', 'Ticket Agent', 'Transportation Specialist', 'Other'];
          const occup = (await returnValue(oc) !== '' ? occupations[stringSimilarity.findBestMatch(await returnValue(oc), occupations).bestMatchIndex] : '');
          if (await returnValue(occup) !== '') {
            return occup;
          }
          return '';
        } catch (error) {
          return next(Boom.badRequest('Error finding closest occupation'));
        }
      };

      const returnNewDate = async (date, daysAfter) => {
        try {
          if (typeof daysAfter === 'undefined' || !daysAfter) {
            daysAfter = 0;
          }
          const newDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));
          const dd = (newDate.getDate() + daysAfter).toString().padStart(2, 0);
          const mm = (newDate.getMonth() + 1).toString().padStart(2, 0);
          const y = newDate.getFullYear();
          return (`${y}-${mm}-${dd}`);
        } catch (error) {
          console.log(`Error on this date ${newDate}`, error);
        }
      };

      const returnValue = async (value) => {
        try {
          if (typeof value !== 'undefined' && value !== 'undefined' && value !== null && value !== 'null') {
            if (value === 'true' || value === true) {
              return 'Yes';
            } if (value === 'false' || value === false) {
              return 'No';
            }
            return value;
          }
          return '';
        } catch (error) {
          console.log(`Error on value: ${value}`, error);
        }
      };

      returnDrivers = async () => {
        try {
          const driversObj = [];
          for (let i = 0; i < req.body.Contact.Drivers.length; i++) {
            const driver = req.body.Contact.Drivers[i];
            const driverObj = {
              name: 'Driver',
              attrs: { id: driver.attrs.id },
              children: [
                {
                  Name: {
                    ...(await returnValue(driver.children.Name.FirstName) !== '' && { FirstName: await returnValue(driver.children.Name.FirstName) }),
                    ...(await returnValue(driver.children.Name.LastName) !== '' && { LastName: await returnValue(driver.children.Name.LastName) }),
                  },
                  ...(await returnValue(driver.children.Gender) !== '' && { Gender: await returnValue(driver.children.Gender) }),
                  ...(await returnValue(driver.children.DOB) !== '' && { DOB: await returnNewDate(new Date(await returnValue(driver.children.DOB)), 0) }),
                  ...(await returnValue(driver.children.DLNumber) !== '' && { DLNumber: await returnValue(driver.children.DLNumber) }),
                  ...(await returnValue(driver.children.DLState) !== '' && { DLState: await returnValue(driver.children.DLState) }),
                  ...(await returnValue(driver.children.DateLicensed) !== '' && { DateLicensed: await returnNewDate(new Date(await returnValue(driver.children.DateLicensed))) }),
                  DLStatus: 'Valid',
                  ...(await returnValue(driver.children.AgeLicensed) !== '' && { AgeLicensed: await returnNewDate(new Date(await returnValue(driver.children.AgeLicensed))) }),
                  ...(await returnValue(driver.children.MaritalStatus) !== '' && { MaritalStatus: await returnValue(driver.children.MaritalStatus) }),
                  ...(await returnValue(driver.children.Relation) !== '' && { Relation: await returnValue(driver.children.Relation) }),
                  ...(await returnValue(driver.children.Industry) !== '' && { Industry: await returnIndustry(await returnClosestOccupation(await returnValue(driver.children.Industry))) }),
                  ...(await returnValue(driver.children.Occupation) !== '' && { Occupation: await returnClosestOccupation(await returnValue(driver.children.Occupation)) }),
                },
              ],
            };
            if (!driverObj.children.Accident && (driver.children.Accident)) {
              driverObj.children.Accident = {
                ...(await returnValue(driver.children.Accident.Date) !== '' && { Date: await returnNewDate(new Date(await returnValue(driver.children.Accident.Date))) }),
                ...(await returnValue(driver.children.Accident.accidentType) !== '' && { accidentType: await returnValue(driver.children.Accident.accidentType) }),
              };
            }
            if (!driverObj.children.Violation && (driver.children.Violation)) {
              driverObj.children.Violation = {
                ...(await returnValue(driver.children.Violation.Date) !== '' && { Date: await returnNewDate(new Date(await returnValue(driver.children.Violation.Date))) }),
                ...(await returnValue(driver.children.Violation.violationType) !== '' && { violationType: await returnValue(driver.children.Violation.violationType) }),
              };
            }
            if (!driverObj.children.CompLoss && (driver.children.CompLoss)) {
              driverObj.children.CompLoss = {
                ...(await returnValue(driver.children.CompLoss.Date) !== '' && { Date: await returnNewDate(new Date(await returnValue(driver.children.CompLoss.Date))) }),
                ...(await returnValue(driver.children.CompLoss.Description) !== '' && { Description: await returnValue(driver.children.CompLoss.Description) }),
              };
            }
            driversObj.push(driverObj);
            if (!req.body.Contact.Drivers[+i + 1]) {
              return driversObj;
            }
          }
        } catch (error) {
          console.log('Error on drivers', error);
        }
      };

      returnVehicles = async () => {
        try {
          const vehiclesObj = [];
          for (let i = 0; i < req.body.Contact.Vehicles.length; i++) {
            const vehicle = req.body.Contact.Vehicles[i];
            const vehicleObj = {
              name: 'Vehicle',
              attrs: { id: vehicle.attrs.id },
              children: [
                {
                  UseVinLookup: await returnValue(vehicle.children.Vin) !== '' ? 'Yes' : 'No',
                  ...(await returnValue(vehicle.children.Year) !== '' && { Year: await returnValue(vehicle.children.Year) }),
                  ...(await returnValue(vehicle.children.Vin) !== '' && { Vin: await returnValue(vehicle.children.Vin) }),
                  ...(await returnValue(vehicle.children.Make) !== '' && { Make: (await returnValue(vehicle.children.Make)).toUpperCase() }),
                  ...(await returnValue(vehicle.children.Model) !== '' && { Model: (await returnValue(vehicle.children.Model)).toUpperCase() }),
                  ...(await returnValue(vehicle.children['Sub-Model']) !== '' && { 'Sub-Model': (await returnValue(vehicle.children['Sub-Model'])).toUpperCase() }),
                },
              ],
            };
            vehiclesObj.push(vehicleObj);
            if (!req.body.Contact.Vehicles[+i + 1]) {
              return vehiclesObj;
            }
          }
        } catch (error) {
          console.log('Error on vehicles', error);
        }
      };

      returnVehiclesCoverage = async () => {
        try {
          const vehiclesCoverageObj = [];
          for (let i = 0; i < req.body.Contact.Vehicles.length; i++) {
            const vehicle = req.body.Contact.Vehicles[i];
            const vehicleCoverageObj = {
              name: 'VehicleCoverage',
              attrs: { id: vehicle.attrs.id },
              children: [
                {
                  OtherCollisionDeductible: '1000',
                  CollisionDeductible: '1000',
                  TowingDeductible: 'No Coverage',
                  RentalDeductible: 'No Coverage',
                },
              ],
            };
            vehiclesCoverageObj.push(vehicleCoverageObj);
            if (!req.body.Contact.Vehicles[+i + 1]) {
              return vehiclesCoverageObj;
            }
          }
        } catch (error) {
          console.log('Error on vehicle coverage', error);
        }
      };

      // Removed Weeks Per Month
      returnVehiclesUse = async () => {
        try {
          const vehiclesUseObj = [];
          const vehicleUseOptions = ['Business', 'Farming', 'Pleasure', 'To/From Work', 'To/From School'];
          for (let i = 0; i < req.body.Contact.VehiclesUse.length; i++) {
            const vehicleUse = req.body.Contact.VehiclesUse[i];
            const vehicleUseage = (await returnValue(vehicleUse.children.Useage) !== '' ? vehicleUseOptions[stringSimilarity.findBestMatch(await returnValue(vehicleUse.children.Useage), vehicleUseOptions).bestMatchIndex] : '');
            const vehicleUseObj = {
              name: 'VehicleUse',
              attrs: { id: vehicleUse.id },
              children: [
                {
                  ...(await returnValue(vehicleUseage) !== '' && { Useage: vehicleUseage }),
                  ...(await returnValue(vehicleUse.children.OneWayMiles) !== '' && { OneWayMiles: await returnValue(vehicleUse.children.OneWayMiles) }),
                  // ...(await returnValue(vehicleUse.children.DaysPerWeek) !== '' && { DaysPerWeek: await returnValue(vehicleUse.children.DaysPerWeek) }),
                  DaysPerWeek: '5',
                  WeeksPerMonth: '4',
                  ...(await returnValue(vehicleUse.children.AnnualMiles) !== '' && { AnnualMiles: await returnValue(vehicleUse.children.AnnualMiles) }),
                  ...(await returnValue(vehicleUse.children.Ownership) !== '' && { Ownership: await returnValue(vehicleUse.children.Ownership) }),
                  ...(await returnValue(vehicleUse.children.PrincipalOperator) !== '' && { PrincipalOperator: await returnValue(vehicleUse.children.PrincipalOperator) }),
                  ...(await returnValue(vehicleUse.children.UsedForDelivery) !== '' && { UsedForDelivery: await returnValue(vehicleUse.children.UsedForDelivery) }),
                  ...(await returnValue(vehicleUse.children.PriorDamagePresent) !== '' && { PriorDamagePresent: await returnValue(vehicleUse.children.PriorDamagePresent) }),
                },
              ],
            };
            vehiclesUseObj.push(vehicleUseObj);
            if (!req.body.Contact.VehiclesUse[+i + 1]) {
              return vehiclesUseObj;
            }
          }
        } catch (error) {
          console.log('Error on vehicle use', error);
        }
      };

      // Add Homeownership + years at home question by default to auto
      // Add tracking for multi-car discount
      // Match Driver and Vehicle on FE

      const applicantAuto = {
        Applicant: {
          ApplicantType: 'Applicant',
          PersonalInfo: {
            Name: {
              FirstName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.FirstName),
              ...((await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName) !== '') && { MiddleName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName) }),
              LastName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.LastName),
            },
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB) !== '' && { DOB: await returnNewDate(new Date(await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB)), 0) }),
            ...((await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender) !== '') && { Gender: await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender) }),
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus) !== '' && { MaritalStatus: await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus) }),
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.Industry) !== '' && { Industry: await await returnValue(req.body.Contact.Applicant.PersonalInfo.Industry) }),
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation) !== '' && { Occupation: await returnClosestOccupation(await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation)) }),
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.Education) !== '' && { Education: await returnValue(req.body.Contact.Applicant.PersonalInfo.Education) }),
            Relation: 'Insured',
          },
          ...((await returnValue(req.body.Contact.Applicant.Address) !== '' && await returnValue(req.body.Contact.Applicant.Address.Phone) !== '') && {
            Address: {
              AddressCode: 'StreetAddress',
              ...(await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) !== '' && {
                Addr1: {
                  ...(await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) !== '' && { StreetName: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) }),
                  ...(await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber) !== '' && { StreetNumber: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber) }),
                },
              }),
              ...(await returnValue(req.body.Contact.Applicant.Address.City) !== '' && { City: await returnValue(req.body.Contact.Applicant.Address.City) }),
              ...(await returnValue(req.body.Contact.Applicant.Address.StateCode) !== '' && { StateCode: await returnValue(req.body.Contact.Applicant.Address.StateCode) }),
              ...(await returnValue(req.body.Contact.Applicant.Address.Zip5) !== '' && { Zip5: await returnValue(req.body.Contact.Applicant.Address.Zip5) }),
              ...(await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && {
                Phone: {
                  PhoneType: 'Mobile',
                  ...(await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && { PhoneNumber: await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) }),
                },
              }),
              ...(await returnValue(req.body.Contact.Applicant.Address.Email) !== '' && { Email: await returnValue(req.body.Contact.Applicant.Address.Email) }),
            },
          }),
        },
        PriorPolicyInfo: {
          ...(await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier) !== '' && { PriorCarrier: await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier) }),
          ...(await returnValue(req.body.Contact.PriorPolicyInfo.Expiration) !== '' && { Expiration: await returnNewDate(new Date(await returnValue(req.body.Contact.PriorPolicyInfo.Expiration))) }),
          YearsWithPriorCarrier: {
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years) !== '' && { Years: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years) }),
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months) !== '' && { Months: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months) }),
          },
          YearsWithContinuousCoverage: {
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Years) !== '' && { Years: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Years) }),
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Months) !== '' && { Months: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Months) }),
          },
          ...(await returnValue(req.body.Contact.PriorPolicyInfo.PriorLiabilityLimit) !== '' && { PriorLiabilityLimit: await returnValue(req.body.Contact.PriorPolicyInfo.PriorLiabilityLimit) }),
        },
        PolicyInfo: {
          PolicyTerm: '6 Month',
          Package: 'No',
          Effective: await returnNewDate(new Date(), 0),
          CreditCheckAuth: 'Yes',
        },
        ...((await returnValue(req.body.Contact.Applicant.ResidenceInfo) !== '' && await returnValue(req.body.Contact.Applicant.CurrentAddress.Ownership) !== '') && {
          ResidenceInfo: {
            CurrentAddress: {
              ...(await returnValue(req.body.Contact.Applicant.CurrentAddress.Ownership) !== '' && { Ownership: await returnValue(req.body.Contact.Applicant.CurrentAddress.Ownership) }),
            },
          },
        }),
        ...((await returnValue(req.body.Contact.Drivers) !== '' && await returnValue(req.body.Contact.Drivers[0].children.Name) !== '') && { Drivers: await returnDrivers() }),
        ...((await returnValue(req.body.Contact.Vehicles) !== '' && await returnValue(req.body.Contact.Vehicles[0].children.Model) !== '') && { Vehicles: await returnVehicles() }),
        ...((await returnValue(req.body.Contact.VehiclesUse) !== '' && await returnValue(req.body.Contact.VehiclesUse[0].children.Useage) !== '') && { VehiclesUse: await returnVehiclesUse() }),
        ...((await returnValue(req.body.Contact.GeneralInfo) !== '' && await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '') && {
          GeneralInfo: {
            ...(await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '' && { RatingStateCode: await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) }),
          },
        }),
      };

      const applicantHome = {
        Applicant: {
          ApplicantType: 'Applicant',
          ...((await returnValue(req.body.Contact.Applicant.AltDwelling) !== '' && await returnValue(req.body.Contact.Applicant.AltDwelling.DifferentAddress) !== '') && (await returnValue(req.body.Contact.Applicant.AltDwelling.Address.City) !== '') && {
            AltDwelling: {
              Address: {
                AddressCode: 'StreetAddress',
                ...(await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Addr1.StreetName) !== '' && {
                  Addr1: {
                    ...(await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Addr1.StreetName) !== '' && { StreetName: await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Addr1.StreetName) }),
                    ...(await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Addr1.StreetNumber) !== '' && { StreetNumber: await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Addr1.StreetNumber) }),
                    ...(await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Addr1.UnitNumber) !== '' && { UnitNumber: await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Addr1.UnitNumber) }),
                  },
                }),
                ...(await returnValue(req.body.Contact.Applicant.AltDwelling.Address.City) !== '' && { City: await returnValue(req.body.Contact.Applicant.AltDwelling.Address.City) }),
                ...(await returnValue(req.body.Contact.Applicant.AltDwelling.Address.StateCode) !== '' && { StateCode: await returnValue(req.body.Contact.Applicant.AltDwelling.Address.StateCode) }),
                ...(await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Zip5) !== '' && { Zip5: await returnValue(req.body.Contact.Applicant.AltDwelling.Address.Zip5) }),
                Validation: 'Valid',
              },
            },
          }),
          PersonalInfo: {
            Name: {
              FirstName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.FirstName),
              ...((await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName) !== '') && { MiddleName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.MiddleName) }),
              LastName: await returnValue(req.body.Contact.Applicant.PersonalInfo.Name.LastName),
            },
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB) !== '' && { DOB: await returnNewDate(new Date(await returnValue(req.body.Contact.Applicant.PersonalInfo.DOB)), 0) }),
            ...((await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender) !== '') && { Gender: await returnValue(req.body.Contact.Applicant.PersonalInfo.Gender) }),
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus) !== '' && { MaritalStatus: await returnValue(req.body.Contact.Applicant.PersonalInfo.MaritalStatus) }),
            Relation: 'Insured',
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.Industry) !== '' && { Industry: await await returnValue(req.body.Contact.Applicant.PersonalInfo.Industry) }),
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation) !== '' && { Occupation: await returnClosestOccupation(await returnValue(req.body.Contact.Applicant.PersonalInfo.Occupation)) }),
            ...(await returnValue(req.body.Contact.Applicant.PersonalInfo.Education) !== '' && { Education: await returnValue(req.body.Contact.Applicant.PersonalInfo.Education) }),
          },
          ...((await returnValue(req.body.Contact.Applicant.Address) !== '' && await returnValue(req.body.Contact.Applicant.Address.Phone) !== '') && {
            Address: {
              AddressCode: 'StreetAddress',
              ...(await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) !== '' && {
                Addr1: {
                  ...(await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) !== '' && { StreetName: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetName) }),
                  ...(await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber) !== '' && { StreetNumber: await returnValue(req.body.Contact.Applicant.Address.Addr1.StreetNumber) }),
                  ...(await returnValue(req.body.Contact.Applicant.Address.Addr1.UnitNumber) !== '' && { UnitNumber: await returnValue(req.body.Contact.Applicant.Address.Addr1.UnitNumber) }),
                },
              }),
              ...(await returnValue(req.body.Contact.Applicant.Address.City) !== '' && { City: await returnValue(req.body.Contact.Applicant.Address.City) }),
              ...(await returnValue(req.body.Contact.Applicant.Address.StateCode) !== '' && { StateCode: await returnValue(req.body.Contact.Applicant.Address.StateCode) }),
              ...(await returnValue(req.body.Contact.Applicant.Address.Zip5) !== '' && { Zip5: await returnValue(req.body.Contact.Applicant.Address.Zip5) }),
              ...(await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && {
                Phone: {
                  PhoneType: 'Mobile',
                  ...(await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) !== '' && { PhoneNumber: await returnValue(req.body.Contact.Applicant.Address.Phone.PhoneNumber) }),
                },
              }),
              ...(await returnValue(req.body.Contact.Applicant.Address.Email) !== '' && { Email: await returnValue(req.body.Contact.Applicant.Address.Email) }),
              Validation: 'Valid',
            },
          }),
        },
        PriorPolicyInfo: {
          ...(await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier) !== '' && { PriorCarrier: await returnValue(req.body.Contact.PriorPolicyInfo.PriorCarrier) }),
          ...(await returnValue(req.body.Contact.PriorPolicyInfo.Expiration) !== '' && { Expiration: await returnNewDate(new Date(await returnValue(req.body.Contact.PriorPolicyInfo.Expiration))) }),
          YearsWithPriorCarrier: {
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years) !== '' && { Years: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Years) }),
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months) !== '' && { Months: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithPriorCarrier.Months) }),
          },
          YearsWithContinuousCoverage: {
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Years) !== '' && { Years: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Years) }),
            ...(await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Months) !== '' && { Months: await returnValue(req.body.Contact.PriorPolicyInfo.YearsWithContinuousCoverage.Months) }),
          },
        },
        PolicyInfo: {
          PolicyTerm: '12 Month',
          Package: 'No',
          Effective: await returnNewDate(new Date(), 0),
          CreditCheckAuth: 'Yes',
        },
        ...((await returnValue(req.body.Contact.RatingInfo) !== '' && await returnValue(req.body.Contact.RatingInfo.SquareFootage) !== '') && {
          RatingInfo: {
            ...(await returnValue(req.body.Contact.RatingInfo.PropertyInsCancelledLapsed) !== '' && { PropertyInsCancelledLapsed: await returnValue(req.body.Contact.RatingInfo.PropertyInsCancelledLapsed) }),
            ...(await returnValue(req.body.Contact.RatingInfo.YearBuilt) !== '' && { YearBuilt: await returnValue(req.body.Contact.RatingInfo.YearBuilt) }),
            ...(await returnValue(req.body.Contact.RatingInfo.Dwelling) !== '' && { Dwelling: await returnValue(req.body.Contact.RatingInfo.Dwelling) }),
            ...(await returnValue(req.body.Contact.RatingInfo.DwellingUse) !== '' && { DwellingUse: await returnValue(req.body.Contact.RatingInfo.DwellingUse) }),
            ...(await returnValue(req.body.Contact.RatingInfo.DistanceToFireHydrant) !== '' && { DistanceToFireHydrant: await returnValue(req.body.Contact.RatingInfo.DistanceToFireHydrant) }),
            ...(await returnValue(req.body.Contact.RatingInfo.WithinCityLimits) !== '' && { WithinCityLimits: await returnValue(req.body.Contact.RatingInfo.WithinCityLimits) }),
            ...(await returnValue(req.body.Contact.RatingInfo.WithinFireDistrict) !== '' && { WithinFireDistrict: await returnValue(req.body.Contact.RatingInfo.WithinFireDistrict) }),
            ProtectionClass: '1',
            ...(await returnValue(req.body.Contact.RatingInfo.DistanceToFireStation) !== '' && { DistanceToFireStation: await returnValue(req.body.Contact.RatingInfo.DistanceToFireStation) }),
            ...(await returnValue(req.body.Contact.RatingInfo.NumberOfStories) !== '' && { NumberOfStories: await returnValue(req.body.Contact.RatingInfo.NumberOfStories) }),
            ...(await returnValue(req.body.Contact.RatingInfo.Construction) !== '' && { Construction: await returnValue(req.body.Contact.RatingInfo.Construction) }),
            ...(await returnValue(req.body.Contact.RatingInfo.Structure) !== '' && { Structure: await returnValue(req.body.Contact.RatingInfo.Structure) }),
            ...(await returnValue(req.body.Contact.RatingInfo.Roof) !== '' && { Roof: await returnValue(req.body.Contact.RatingInfo.Roof.toUpperCase()) }),
            ...(await returnValue(req.body.Contact.RatingInfo.SwimmingPool) !== '' && { SwimmingPool: await returnValue(req.body.Contact.RatingInfo.SwimmingPool) }),
            ...(await returnValue(req.body.Contact.RatingInfo.SwimmingPoolFenced) !== '' && { SwimmingPoolFenced: await returnValue(req.body.Contact.RatingInfo.SwimmingPoolFenced) }),
            ...(await returnValue(req.body.Contact.RatingInfo.SwimmingPoolType) !== '' && { SwimmingPoolType: await returnValue(req.body.Contact.RatingInfo.SwimmingPoolType) }),
            ...(await returnValue(req.body.Contact.RatingInfo.DogOnPremises) !== '' && { DogOnPremises: await returnValue(req.body.Contact.RatingInfo.DogOnPremises) }),
            ...(await returnValue(req.body.Contact.RatingInfo.HeatingType) !== '' && { HeatingType: await returnValue(req.body.Contact.RatingInfo.HeatingType) }),
            ...(await returnValue(req.body.Contact.RatingInfo.WoodBurningStove) !== '' && { WoodBurningStove: await returnValue(req.body.Contact.RatingInfo.WoodBurningStove) }),
            ...(await returnValue(req.body.Contact.RatingInfo.NumberOfWoodBurningStoves) !== '' && { NumberOfWoodBurningStoves: await returnValue(req.body.Contact.RatingInfo.NumberOfWoodBurningStoves) }),
            ...(await returnValue(req.body.Contact.RatingInfo.RoofingUpdateYear) !== '' && { RoofingUpdate: 'COMPLETE UPDATE' }),
            ...(await returnValue(req.body.Contact.RatingInfo.RoofingUpdateYear) !== '' && { RoofingUpdateYear: await returnValue(req.body.Contact.RatingInfo.RoofingUpdateYear) }),
            ...(await returnValue(req.body.Contact.RatingInfo.ElectricalUpdateYear) !== '' && { ElectricalUpdate: 'COMPLETE UPDATE' }),
            ...(await returnValue(req.body.Contact.RatingInfo.ElectricalUpdateYear) !== '' && { ElectricalUpdateYear: await returnValue(req.body.Contact.RatingInfo.ElectricalUpdateYear) }),
            ...(await returnValue(req.body.Contact.RatingInfo.PlumbingUpdateYear) !== '' && { PlumbingUpdate: 'COMPLETE UPDATE' }),
            ...(await returnValue(req.body.Contact.RatingInfo.PlumbingUpdateYear) !== '' && { PlumbingUpdateYear: await returnValue(req.body.Contact.RatingInfo.PlumbingUpdateYear) }),
            ...(await returnValue(req.body.Contact.RatingInfo.HeatingUpdateYear) !== '' && { HeatingUpdate: 'COMPLETE UPDATE' }),
            ...(await returnValue(req.body.Contact.RatingInfo.HeatingUpdateYear) !== '' && { HeatingUpdateYear: await returnValue(req.body.Contact.RatingInfo.HeatingUpdateYear) }),
            ...(await returnValue(req.body.Contact.RatingInfo.UnderConstruction) !== '' && { UnderConstruction: await returnValue(req.body.Contact.RatingInfo.UnderConstruction) }),
            ...(await returnValue(req.body.Contact.RatingInfo.SquareFootage) !== '' && { SquareFootage: await returnValue(req.body.Contact.RatingInfo.SquareFootage) }),
            ...(await returnValue(req.body.Contact.RatingInfo.PurchaseDate) !== '' && { PurchaseDate: await returnValue(req.body.Contact.RatingInfo.PurchaseDate) }),
            ...(await returnValue(req.body.Contact.RatingInfo.PurchasePrice) !== '' && { PurchasePrice: await returnValue(req.body.Contact.RatingInfo.PurchasePrice) }),
            ...(await returnValue(req.body.Contact.RatingInfo.Trampoline) !== '' && { Trampoline: await returnValue(req.body.Contact.RatingInfo.Trampoline) }),
            ...(await returnValue(req.body.Contact.RatingInfo.BusinessOnPremises) !== '' && { BusinessOnPremises: await returnValue(req.body.Contact.RatingInfo.BusinessOnPremises) }),
            ...(await returnValue(req.body.Contact.RatingInfo.NumberOfEmployees) !== '' && { NumberOfEmployees: await returnValue(req.body.Contact.RatingInfo.NumberOfEmployees) }),
            // ...((await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended) !== '' && await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Kitchens) !== '') && {
            //   ReplacementCostExtended: {
            //     ConstructionMethod: 'Unknown',
            //     ...((await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations) !== '' && await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.HasBasement) !== '') && {
            //       Foundations: {
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementFinish) !== '' && { Basement: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementFinish) }),
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementFinish) !== '' && {
            //           BasementInformation: {
            //             ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementTypeInfo) !== '' && { BasementType: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementTypeInfo) }),
            //             ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementFinish) !== '' && { BasementFinished: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementFinish) }),
            //             ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementFinishedType) !== '' && { BasementFinishedType: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.BasementFinishedType) }),
            //           },
            //         }),
            //       },
            //     }),
            //     ...((await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations) !== '' &&
            //           await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations[await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.FoundationsType)])) !== '' && {
            //       Foundations: {
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations[await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.FoundationsType)]) !== '' && { [await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Foundations.FoundationsType)]: 100 }),
            //       },
            //     }),
            //     ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.LandUnderFoundation) !== '' && { LandUnderFoundation: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.LandUnderFoundation) }),
            //     ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Kitchens) !== '' && { Kitchens: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Kitchens) }),
            //     ...((await returnValue(req.body.Contact.RatingInfo.HeatingAndCoolingType) !== '' && await returnValue(req.body.Contact.RatingInfo.HeatingAndCoolingType.AirConditioning) !== '') && {
            //       HeatingAndCoolingType: {
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.AirConditioning) !== '' && { AirConditioning: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.AirConditioning) }),
            //         ...((await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.FirePlace) !== '' && await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.FirePlace.NumberOfFirePlaces) !== '') && {
            //           FirePlace: {
            //             ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.FirePlace) !== '' && { FirePlace: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.FirePlace) }),
            //             ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.NumberOfFirePlaces) !== '' && { NumberOfFirePlaces: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.HeatingAndCoolingType.NumberOfFirePlaces) }),
            //           },
            //         }),
            //       },
            //     }),
            //     ...((await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.GaragesAndCarports) !== '' && await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.GaragesAndCarports.NumberOfCars) !== '') && {
            //       GaragesAndCarports: {
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.GaragesAndCarports.GaragesAndCarports) !== '' && { GaragesAndCarports: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.GaragesAndCarports.GaragesAndCarports) }),
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.GaragesAndCarports.NumberOfCars) !== '' && { NumberOfCars: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.GaragesAndCarports.NumberOfCars) }),
            //       },
            //     }),
            //     ...((await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Baths) !== '' && await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Baths.FullBaths) !== '') && {
            //       Baths: {
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Baths.FullBaths) !== '' && { FullBaths: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Baths.FullBaths) }),
            //         ...(await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Baths.HalfBaths) !== '' && { HalfBaths: await returnValue(req.body.Contact.RatingInfo.ReplacementCostExtended.Baths.HalfBaths) }),
            //       },
            //     }),
            //   },
            // }),
            ...(await returnValue(req.body.Contact.RatingInfo.RoofShape) !== '' && { RoofShape: await returnValue(req.body.Contact.RatingInfo.RoofShape) }),
            ...(await returnValue(req.body.Contact.RatingInfo.WindSpeed) !== '' && { WindSpeed: await returnValue(req.body.Contact.RatingInfo.WindSpeed) }),
            ...(await returnValue(req.body.Contact.RatingInfo.Foundation) !== '' && { Foundation: await returnValue(req.body.Contact.RatingInfo.Foundation) }),
          },
        }),
        ...((await returnValue(req.body.Contact.GeneralInfo) !== '' && await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '') && {
          GeneralInfo: {
            ...(await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) !== '' && { RatingStateCode: await returnValue(req.body.Contact.GeneralInfo.RatingStateCode) }),
          },
        }),
      };

      const data = jsonxml(req.params.type === 'Home' ? applicantHome : applicantAuto);

      const xml_head = `<?xml version="1.0" encoding="utf-8"?> <EZ${req.params.type.toUpperCase()} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/${req.params.type}/V200">`;
      const xml_body = xml_head.concat(data, `</EZ${req.params.type.toUpperCase()}>`);


      const encodedData = base64.encode(xml_body);

      const xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
      const xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.body.clientId}" DataUploadFlags="4"><v100:FileData Name="EZ${req.params.type}" MimeType="text/xml">`;
      const xml_soap_body_close = '</v100:FileData> </v100:UploadRequest> </v100:EZLynxUploadRequest> </tem:UploadFile> </soap:Body></soap:Envelope>';
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
              'Content-Type': 'text/xml',
            },
        body: xml_string,
      };

      const response = await request(options);

      let newResponse;

      if (response.includes('Failed')) {
        newResponse = 'Failed';
      } else {
        newResponse = 'Succeeded';
      }

      let url = 'Upload Failed';

      if (response && response.includes('Succeeded') && response.match(/<URL>(.*)<\/URL>/)) {
        url = response.match(/<URL>(.*)<\/URL>/)[1];
      }

      req.session.data = {
        title: 'Contact created successfully',
        body: newResponse,
        fullBody: response,
        url,
        xml: format(xml_body),
        json: req.params.type === 'Home' ? applicantHome : applicantAuto,
      };
      return next();
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
