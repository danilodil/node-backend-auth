/* eslint-disable linebreak-style */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-nested-ternary */
const { formatDate } = require('../../lib/utils');

module.exports = {
  returnAutoData: async (client) => {
    function returnValueIfExists(value) {
      if (value && value !== 'undefined' && typeof value !== 'undefined' && value !== null) {
        if (value === 'true' || value === true) {
          return 'Yes';
        } if (value === false || value === 'false') {
          return 'No';
        }
        return value;
      }
      if (value === false) {
        return 'No';
      }
      return false;
    }
    function returnText(sel, value) {
      if (returnValueIfExists(value)) {
        return `<${sel}>${returnValueIfExists(value)}</${sel}>`;
      }
      return `</${sel}`;
    }
    let dataFile = '<Applicant><ApplicantType>Applicant</ApplicantType><PersonalInfo><Name>';
    dataFile += returnText('FirstName', client.firstName);
    dataFile += returnText('MiddleName', null);
    dataFile += returnText('LastName', client.lastName);
    dataFile += '</Name>';
    dataFile += returnText('DOB', formatDate(client.birthDate));
    dataFile += returnText('Gender', client.gender);
    dataFile += returnText('MaritalStatus', client.maritalStatus);
    dataFile += returnText('Industry', null);
    dataFile += returnText('Occupation', null);
    dataFile += returnText('Education', client.education);
    dataFile += returnText('Relation', client.relation);
    dataFile += '</PersonalInfo>';
    if (returnValueIfExists(client.city)) {
      dataFile += '<Address>';
      dataFile += returnText('AddressCode', 'StreetAddress');
      dataFile += '<Addr1>';
      dataFile += returnText('StreetName', client.streetName);
      dataFile += returnText('StreetNumber', client.streetNumber);
      dataFile += returnText('UnitNumber', client.unitNumber);
      dataFile += '</Addr1>';
      dataFile += '</Addr2>';
      dataFile += returnText('City', client.city);
      dataFile += returnText('StateCode', client.stateCd);
      dataFile += returnText('Zip5', client.postalCd);
      if (returnValueIfExists(client.phone)) {
        dataFile += '<Phone>';
        dataFile += returnText('PhoneType', 'Home');
        dataFile += returnText('PhoneNumber', client.phone);
      }
      dataFile += '</Phone>';
      dataFile += returnText('Email', client.email);
    }
    dataFile += returnText('Validation', 'Valid');
    dataFile += '</Address>';
    dataFile += '</Applicant>';
    dataFile += '<PriorPolicyInfo>';
    dataFile += returnText('PriorCarrier', 'Erie');
    dataFile += returnText('Expiration', '2015-09-11');
    dataFile += '<YearsWithPriorCarrier>';
    dataFile += returnText('Years', '0');
    dataFile += returnText('Months', '3');
    dataFile += '</YearsWithPriorCarrier>';
    dataFile += '<YearsWithContinuousCoverage>';
    dataFile += returnText('Years', '0');
    dataFile += returnText('Months', '3');
    dataFile += '</YearsWithContinuousCoverage>';
    dataFile += returnText('PriorLiabilityLimit', '100/300');    
    dataFile += '</PriorPolicyInfo>';
    dataFile += '<PolicyInfo>';
    dataFile += returnText('PolicyTerm', '6 Month');
    dataFile += returnText('Package', 'No');
    dataFile += returnText('Effective', '2015-09-11');
    dataFile += returnText('CreditCheckAuth', 'Yes');
    dataFile += '</PolicyInfo>';
    dataFile += '<ResidenceInfo>';
    dataFile += '<CurrentAddress>';
    dataFile += '<YearsAtCurrent>';
    dataFile += returnText('Years', '3');
    dataFile += returnText('Months', '0');
    dataFile += '</YearsAtCurrent>';
    dataFile += '</CurrentAddress>';
    dataFile += '</ResidenceInfo>';
    dataFile += returnText('PriorCarrier', 'Erie');
    dataFile += returnText('PriorCarrier', 'Erie');
    dataFile += returnText('PriorCarrier', 'Erie');
    dataFile += returnText('PriorCarrier', 'Erie');
    dataFile += returnText('PriorCarrier', 'Erie');
    dataFile += returnText('PriorCarrier', 'Erie');
    dataFile += returnText('PriorCarrier', 'Erie');

    //   <Coverages>
    //     <GeneralCoverage>
    //       <BI>100/300</BI>
    //       <PD>50000</PD>
    //       <MP>None</MP>
    //       <UM>100/300</UM>
    //       <UIM>100/300</UIM>
    //       <Multipolicy>No</Multipolicy>
    //       <RetirementCommunity>No</RetirementCommunity>
    //       <AAADiscount>No</AAADiscount>
    //       <Multicar>No</Multicar>
    //     </GeneralCoverage>
    //     <VehicleCoverage id="1">
    //       <OtherCollisionDeductible>1000</OtherCollisionDeductible>
    //       <CollisionDeductible>1000</CollisionDeductible>
    //       <FullGlass>No</FullGlass>
    //       <TowingDeductible>No Coverage</TowingDeductible>
    //       <RentalDeductible>30/900</RentalDeductible>
    //       <LiabilityNotRequired>No</LiabilityNotRequired>
    //       <LoanLeaseCoverage>No</LoanLeaseCoverage>
    //       <ReplacementCost>No</ReplacementCost>
    //     </VehicleCoverage>
    //     <StateSpecificCoverage>
    //       <PA-Coverages>
    //         <PA-AccidentalDeath>None</PA-AccidentalDeath>
    //         <PA-StackedUM>No</PA-StackedUM>
    //         <PA-StackedUIM>No</PA-StackedUIM>
    //         <PA-FuneralExpense>None</PA-FuneralExpense>
    //         <PA-WorkLoss>None</PA-WorkLoss>
    //         <PA-TortLimitation>Limited</PA-TortLimitation>
    //         <PA-CombinationFirstParty>None</PA-CombinationFirstParty>
    //         <PA-FirstParty>5000</PA-FirstParty>
    //       </PA-Coverages>
    //     </StateSpecificCoverage>
    //   </Coverages>
    //   <VehicleAssignments>
    //     <VehicleAssignment id="1">
    //       <DriverAssignment id="1">100</DriverAssignment>
    //     </VehicleAssignment>
    //   </VehicleAssignments>
    //   <GeneralInfo>
    //     <RatingStateCode>PA</RatingStateCode>
    //   </GeneralInfo>`;

    // if (client.hasOwnProperty('vehicles') && client.vehicles.length > 0) {
    //   for (const j in client.vehicles) {
    //     const vehicle = client.vehicles[j];
    //     data += ` <Vehicles>
    //     <Vehicle id="1">
    //       <UseVinLookup>Yes</UseVinLookup>
    //       <Year>2014</Year>
    //       <Vin>2FMDK3G96E1111111</Vin>
    //       <Make>FORD</Make>
    //       <Model>EDGE SE</Model>
    //       <Sub-Model>4 Dr. Wagon / Sport Utility</Sub-Model>
    //       <Anti-Theft>Passive</Anti-Theft>
    //       <PassiveRestraints>Airbag Both Sides</PassiveRestraints>
    //       <AntiLockBrake>Yes</AntiLockBrake>
    //     </Vehicle>
    //   </Vehicles>
    //   <VehiclesUse>
    //     <VehicleUse id="1">
    //       <Useage>To/From Work</Useage>
    //       <OneWayMiles>7</OneWayMiles>
    //       <DaysPerWeek>5</DaysPerWeek>
    //       <WeeksPerMonth>4</WeeksPerMonth>
    //       <AnnualMiles>3640</AnnualMiles>
    //       <Ownership>Owned</Ownership>
    //       <Carpool>No</Carpool>
    //       <Odometer>20000</Odometer>
    //       <Performance>Standard</Performance>
    //       <NewVehicle>Yes</NewVehicle>
    //       <AdditionalModificationValue>0</AdditionalModificationValue>
    //       <AlternateGarage>No</AlternateGarage>
    //       <PrincipalOperator>1</PrincipalOperator>
    //       <CostNew>27525</CostNew>
    //       <UsedForDelivery>No</UsedForDelivery>
    //       <PriorDamagePresent>No</PriorDamagePresent>
    //     </VehicleUse>
    //   </VehiclesUse>`;
    //     dataObj[`veh_sMake[${j}]`] = vehicle.vehicleManufacturer;
    //     dataObj[`veh_sModel[${j}]`] = vehicle.vehicleModel;
    //     dataObj[`veh_sYr[${j}]`] = vehicle.vehicleModelYear;
    //     // dataObj[`veh_sSymb[${j}]`] = '';
    //     // dataObj[`veh_sTerr[${j}]`] ='';
    //     // dataObj[`veh_lAddOnEquip[${j}]`] ='';
    //     // dataObj[`veh_nDriver[${j}]`] ='';
    //     dataObj[`veh_sUse[${j}]`] = vehicle.vehicleUseCd;
    //     dataObj[`veh_nCommuteMileage[${j}]`] = vehicle.vehicleCommuteMilesDrivenOneWay;
    //     dataObj[`veh_lMileage[${j}]`] = vehicle.vehicleAnnualDistance;
    //     // dataObj[`veh_nGVW[${j}]`] ='';
    //     // dataObj[`veh_sTowing[${j}]`] ='';
    //     // dataObj[`veh_sRentRemb[${j}]`] ='';
    //     dataObj[`veh_sVehicleType[${j}]`] = vehicle.vehicleBodyStyle;
    //     // dataObj[`veh_bFourWD[${j}]`] ='';
    //     // dataObj[`veh_sComp[${j}]`] ='';
    //     // dataObj[`veh_sColl[${j}]`] ='';
    //     // dataObj[`veh_sUmPd[${j}]`] ='';
    //     // dataObj[`veh_bUmPd[${j}]`] ='';
    //     // dataObj[`veh_sUimPd[${j}]`] ='';
    //     // dataObj[`veh_bUimPd[${j}]`] ='';
    //     dataObj[`veh_sVIN[${j}]`] = vehicle.vehicleVin;
    //     dataObj[`veh_sGaragingZip[${j}]`] = vehicle.applicantPostalCd;
    //     dataObj.gen_sClientNotes += returnIfExists(vehicle.value, 'Value', j, 'V');
    //     dataObj.gen_sClientNotes += returnIfExists(vehicle.collision, 'Collision', j, 'V');
    //     dataObj.gen_sClientNotes += returnIfExists(vehicle.comp, 'Comp', j, 'V');
    //     dataObj.gen_sClientNotes += returnIfExists(vehicle.isRideshare, 'Ridesharing', j, 'V');
    //     // dataObj[`veh_bLossPayee[${j}]`] ='';
    //     // dataObj[`veh_bAdditionalInterest[${j}]`] ='';
    //     // dataObj[`veh_sLossPayeeName[${j}]`] ='';
    //     // dataObj[`veh_sLossPayeeAddress[${j}]`] ='';
    //     // dataObj[`veh_sLossPayeeAddr2[${j}]`] ='';
    //     // dataObj[`veh_sLossPayeeCity[${j}]`] ='';
    //     // dataObj[`veh_sLossPayeeState[${j}]`] ='';
    //     // dataObj[`veh_sLossPayeeZip[${j}]`] ='';
    //     // dataObj[`prm_sClass[${j}]`] ='';
    //   }
    // }
    // if (client.hasOwnProperty('drivers') && client.drivers.length > 0) {
    //   for (const j in client.drivers) {
    //     const driver = client.drivers[j];
    //     dataFile += `  <Drivers>
    //     <Driver id="1">
    //       <Name>
    //         <FirstName>Casey</FirstName>
    //         <MiddleName />
    //         <LastName>Kyacommon</LastName>
    //       </Name>
    //       <Gender>Male</Gender>
    //       <DOB>1977-12-13</DOB>
    //       <SSN />
    //       <DLNumber />
    //       <DLState>PA</DLState>
    //       <DateLicensed>1993-12-13</DateLicensed>
    //       <DLStatus>Valid</DLStatus>
    //       <MaritalStatus>Single</MaritalStatus>
    //       <Relation>Insured</Relation>
    //       <Industry>Insurance</Industry>
    //       <Occupation>Other</Occupation>
    //       <GoodStudent>No</GoodStudent>
    //       <Student100>No</Student100>
    //       <DriverTraining>No</DriverTraining>
    //       <GoodDriver>No</GoodDriver>
    //       <MATDriver>No</MATDriver>
    //       <PrincipalVehicle>1</PrincipalVehicle>
    //       <Rated>Rated</Rated>
    //       <SR22>No</SR22>
    //       <LicenseRevokedSuspended>No</LicenseRevokedSuspended>
    //     </Driver>
    //   </Drivers>`;
    //     dataObj[`drv_sLastName[${j}]`] = driver.applicantSurname;
    //     dataObj[`drv_sFirstName[${j}]`] = driver.applicantGivenName;
    //     // dataObj[`drv_cInitial[${j}]`] = '';
    //     dataObj[`drv_tBirthDate[${j}]`] = formatDate(driver.applicantBirthDt);
    //     // dataObj[`drv_sEmployer[${j}]`] = '';
    //     // dataObj[`drv_nPoints[${j}]`] = '';
    //     dataObj[`drv_sLicensingState[${j}]`] = driver.driverLicenseStateCd;
    //     dataObj[`drv_sLicenseNum[${j}]`] = driver.driverLicenseNumber;
    //     // dataObj[`drv_bExcluded[${j}]`] = '';
    //     // dataObj[`drv_bPrincipleOperator[${j}]`] = '';
    //     // dataObj[`drv_bOnlyOperator[${j}]`] = '';
    //     // dataObj[`drv_bNonDriver[${j}]`] = '';
    //     dataObj[`drv_sDriversOccupation[${j}]`] = driver.applicantOccupationClassCd;
    //     dataObj[`drv_sSex[${j}]`] = driver.applicantGenderCd ? driver.applicantGenderCd.charAt(0) : null;
    //     dataObj[`drv_sMaritalStatus[${j}]`] = driver.applicantMaritalStatusCd;
    //     dataObj[`drv_bFiling[${j}]`] = driver.needsSR22;
    //     // dataObj[`drv_sFilingState[${j}]`] = '';
    //     // dataObj[`drv_sFilingReason[${j}]`] = '';
    //     dataObj[`drv_tDateLicensed[${j}]`] = driver.driverLicensedDt;
    //     // dataObj[`drv_tHiredDate[${j}]`] = '';
    //     // dataObj[`drv_tDateOfCDL[${j}]`] = '';
    //     dataObj[`drv_bGoodStudent[${j}]`] = driver.hasGoodStudentDiscount;
    //     // dataObj[`drv_bDriverTraining[${j}]`] = '';
    //     dataObj[`drv_bDefDrvr[${j}]`] = driver.hasDefensiveDriverDiscount;
    //     dataObj[`drv_sSSNum[${j}]`] = driver.ssnU;
    //   }
    // }

    return dataFile;
  },
  returnHomeData: async (client) => {
    const dataObj = {};
    dataObj.gen_sCustType = 'Personal';
    function returnIfExists(value, label, index, indexLabel) {
      return ((typeof value !== 'undefined' && value) || value === false)
        ? ((index && indexLabel) ? `${indexLabel + index} - ${label}: ${value} | `
          : `${label}: ${value} | `) : '';
    }
    dataObj.gen_sClientNotes += returnIfExists(client.timeToQuote, 'Wants Quote');
    dataObj.gen_sClientNotes += returnIfExists(client.maritalStatus, 'Marital Status');
    dataObj.gen_sClientNotes += returnIfExists(client.homes[0].numberOfFamilies, 'Number Of Families');
    dataObj.gen_sClientNotes += returnIfExists(client.homes[0].typeOfBusiness, 'Business Type');
    dataObj.gen_sClientNotes += returnIfExists(client.homes[0].ownerOrTenants, 'Resides In Home');
    dataObj.gen_sClientNotes += returnIfExists(client.homes[0].hasWildPets, 'Wild Pets');
    dataObj.gen_sClientNotes += returnIfExists(client.homes[0].hasPool, 'Pool');
    dataObj.gen_sClientNotes += returnIfExists(client.homes[0].hasBasement, 'Basement');

    dataObj.gen_sLastName = client.lastName;
    dataObj.gen_sFirstName = client.firstName;
    dataObj.gen_sAddress1 = (client.streetNumber && client.streetName) ? `${client.streetNumber} ${client.streetName}` : null;
    dataObj.gen_sCity = client.city;
    dataObj.gen_sState = client.stateCd;
    dataObj.gen_sZip = client.postalCd;
    dataObj.gen_sClientSource = 'XILO';
    // dataObj['gen_sPhone'] = client.phone;
    // dataObj['gen_sWorkPhone'] = client.phone;
    dataObj.gen_sCellPhone = client.phone;
    // dataObj['gen_sMsgPhone'] = client.phone;
    dataObj.gen_sEmail = client.email;
    dataObj.gen_sCMSPolicyType = 'HOME';
    dataObj.gen_tProductionDate = formatDate(new Date());
    dataObj.gen_sLeadSource = 'XILO';
    dataObj.gen_nClientStatus = 'New Client';
    dataObj.gen_sStatus = 'New';
    // dataObj['gen_sFSCNotes'] ='XXXXX';
    dataObj.gen_sGAddress = (client.streetNumber && client.streetName) ? `${client.streetNumber} ${client.streetName}` : null;
    dataObj.gen_sGCity = client.city;
    dataObj.gen_sGState = client.stateCd;
    dataObj.gen_sGZip = client.postalCd;
    dataObj.gen_sForm = 'HOME';
    dataObj.gen_nYearBuilt = client.homes[0].yearBuilt;
    dataObj.gen_sConstruction = client.homes[0].homeType;
    dataObj.gen_sBurgAlarm = client.homes[0].hasAlarmSystem;
    dataObj.gen_sFireAlarm = client.homes[0].hasFireAlarmDiscount;
    dataObj.gen_lJewelry = client.homes[0].jewleryAmount;
    dataObj.gen_lFurs = client.homes[0].fursAmount;
    dataObj.gen_lGuns = client.homes[0].gunsAmount;
    dataObj.gen_lFineArt = client.homes[0].fineArtsAmount;

    return dataObj;
  },
  //   returnAutoHomeData: async (client) => {
  //     const dataObj = {};


//     return dataObj;
//   },
};
