/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,radix,consistent-return,camelcase,no-plusplus,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition,camelcase */

const request = require('request-promise');
const Boom = require('boom');
const base64 = require('base-64');
const format = require('xml-formatter');
const stringSimilarity = require('string-similarity');
const configConstant = require('../constants/configConstants').CONFIG;
const appConstant = require('../constants/appConstant').ezLynx;
const ezHelper = require('./helpers/ezlynx');

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { username } = req.body.decoded_vendor;

      const type = req.params.type;
      const client = req.body.client;

      let data = '';
      if (type === 'auto') {
        data = await ezHelper.returnAutoData(client);
      } else if (type === 'home') {
        data = await ezHelper.returnHomeData(client);
      } else if (type === 'commercial') {
        // data = await ezHelper.returnCommercialData(client);
      }

      if (data === '') {
        return next(Boom.badRequest('Error creating EZLynx file. Type not supplied or error parsing client'));
      }

      data = `<Applicant>
       <ApplicantType>Applicant</ApplicantType>
       <PersonalInfo>
       <Name>
       <FirstName>Casey</FirstName>
       <MiddleName/>
       <LastName>Kyacommon</LastName>
       </Name>
       <DOB>1977-12-13</DOB>
       <SSN/>
       <Gender>Male</Gender>
       <MaritalStatus>Single</MaritalStatus>
       <Industry>Insurance</Industry>
       <Occupation>Other</Occupation>
       <Education>Vocational/Technical Degree</Education>
       <Relation>Insured</Relation>
       </PersonalInfo>
       <Address>
       <AddressCode>StreetAddress</AddressCode>
       <Addr1>
       <StreetName>Main St.</StreetName>
       <StreetNumber>123</StreetNumber>
       <UnitNumber/>
       </Addr1>
       <Addr2/>
       <City>WARREN</City>
       <StateCode>PA</StateCode>
       <County>Lackawanna</County>
       <Zip5>16365</Zip5>
       <Phone>
       <PhoneType>Home</PhoneType>
       <PhoneNumber>2145551212</PhoneNumber>
       </Phone>
       <Email>cjones@plymouthrock.com</Email>
       <Validation>Valid</Validation>
       </Address>
       </Applicant>
       <PriorPolicyInfo>
       <PriorCarrier>Erie</PriorCarrier>
       <Expiration>2015-09-11</Expiration>
       <YearsWithPriorCarrier>
       <Years>0</Years>
       <Months>3</Months>
       </YearsWithPriorCarrier>
       <YearsWithContinuousCoverage>
       <Years>0</Years>
       <Months>3</Months>
       </YearsWithContinuousCoverage>
       <PriorLiabilityLimit>100/300</PriorLiabilityLimit>
       </PriorPolicyInfo>
       <PolicyInfo>
       <PolicyTerm>6 Month</PolicyTerm>
       <Package>No</Package>
       <Effective>2015-09-11</Effective>
       <CreditCheckAuth>Yes</CreditCheckAuth>
       </PolicyInfo>
       <ResidenceInfo>
       <CurrentAddress>
       <YearsAtCurrent>
       <Years>3</Years>
       <Months>0</Months>
       </YearsAtCurrent>
       <Ownership>Apartment</Ownership>
       </CurrentAddress>
       </ResidenceInfo>
       <Drivers>
       <Driver id="1">
       <Name>
       <FirstName>Casey</FirstName>
       <MiddleName/>
       <LastName>Kyacommon</LastName>
       </Name>
       <Gender>Male</Gender>
       <DOB>1977-12-13</DOB>
       <SSN/>
       <DLNumber/>
       <DLState>PA</DLState>
       <DateLicensed>1993-12-13</DateLicensed>
       <DLStatus>Valid</DLStatus>
       <MaritalStatus>Single</MaritalStatus>
       <Relation>Insured</Relation>
       <Industry>Insurance</Industry>
       <Occupation>Other</Occupation>
       <GoodStudent>No</GoodStudent>
       <Student100>No</Student100>
       <DriverTraining>No</DriverTraining>
       <GoodDriver>No</GoodDriver>
       <MATDriver>No</MATDriver>
       <PrincipalVehicle>1</PrincipalVehicle>
       <Rated>Rated</Rated>
       <SR22>No</SR22>
       <LicenseRevokedSuspended>No</LicenseRevokedSuspended>
       </Driver>
       </Drivers>
       <Vehicles>
       <Vehicle id="1">
       <UseVinLookup>Yes</UseVinLookup>
       <Year>2014</Year>
       <Vin>2FMDK3G96E1111111</Vin>
       <Make>FORD</Make>
       <Model>EDGE SE</Model>
       <Sub-Model>4 Dr. Wagon / Sport Utility</Sub-Model>
       <Anti-Theft>Passive</Anti-Theft>
       <PassiveRestraints>Airbag Both Sides</PassiveRestraints>
       <AntiLockBrake>Yes</AntiLockBrake>
       </Vehicle>
       </Vehicles>
       <VehiclesUse>
       <VehicleUse id="1">
       <Useage>To/From Work</Useage>
       <OneWayMiles>7</OneWayMiles>
       <DaysPerWeek>5</DaysPerWeek>
       <WeeksPerMonth>4</WeeksPerMonth>
       <AnnualMiles>3640</AnnualMiles>
       <Ownership>Owned</Ownership>
       <Carpool>No</Carpool>
       <Odometer>20000</Odometer>
       <Performance>Standard</Performance>
       <NewVehicle>Yes</NewVehicle>
       <AdditionalModificationValue>0</AdditionalModificationValue>
       <AlternateGarage>No</AlternateGarage>
       <PrincipalOperator>1</PrincipalOperator>
       <CostNew>27525</CostNew>
       <UsedForDelivery>No</UsedForDelivery>
       <PriorDamagePresent>No</PriorDamagePresent>
       </VehicleUse>
       </VehiclesUse>
       <Coverages>
       <GeneralCoverage>
       <BI>100/300</BI>
       <PD>50000</PD>
       <MP>None</MP>
       <UM>100/300</UM>
       <UIM>100/300</UIM>
       <Multipolicy>No</Multipolicy>
       <RetirementCommunity>No</RetirementCommunity>
       <AAADiscount>No</AAADiscount>
       <Multicar>No</Multicar>
       </GeneralCoverage>
       <VehicleCoverage id="1">
       <OtherCollisionDeductible>1000</OtherCollisionDeductible>
       <CollisionDeductible>1000</CollisionDeductible>
       <FullGlass>No</FullGlass>
       <TowingDeductible>No Coverage</TowingDeductible>
       <RentalDeductible>30/900</RentalDeductible>
       <LiabilityNotRequired>No</LiabilityNotRequired>
       <LoanLeaseCoverage>No</LoanLeaseCoverage>
       <ReplacementCost>No</ReplacementCost>
       </VehicleCoverage>
       <StateSpecificCoverage>
       <PA-Coverages>
       <PA-AccidentalDeath>None</PA-AccidentalDeath>
       <PA-StackedUM>No</PA-StackedUM>
       <PA-StackedUIM>No</PA-StackedUIM>
       <PA-FuneralExpense>None</PA-FuneralExpense>
       <PA-WorkLoss>None</PA-WorkLoss>
       <PA-TortLimitation>Limited</PA-TortLimitation>
       <PA-CombinationFirstParty>None</PA-CombinationFirstParty>
       <PA-FirstParty>5000</PA-FirstParty>
       </PA-Coverages>
       </StateSpecificCoverage>
       </Coverages>
       <VehicleAssignments>
       <VehicleAssignment id="1">
       <DriverAssignment id="1">100</DriverAssignment>
       </VehicleAssignment>
       </VehicleAssignments>
       <GeneralInfo>
       <RatingStateCode>PA</RatingStateCode>
       </GeneralInfo>`;

      const xml_head = `<?xml version="1.0" encoding="utf-8"?> <EZ${req.params.type.toUpperCase()} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.ezlynx.com/XMLSchema/${req.params.type}/V200">`;
      const xml_body = xml_head.concat(data, `</EZ${req.params.type.toUpperCase()}>`);

      console.log('DATA ###', xml_body);

      const encodedData = base64.encode(xml_body);

      const xml_authentication_header = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope  xmlns:soap="http://www.w3.org/2003/05/soap-envelope"  xmlns:tem="http://tempuri.org/"  xmlns:v100="http://www.ezlynx.com/XMLSchema/EZLynxUpload/V100">  <soap:Header>   <tem:AuthenticationHeaderAcct> <tem:Username>${configConstant.nodeEnv === 'production' ? appConstant.USERNAME : appConstant.USERNAME_DEV}</tem:Username>  <tem:Password>${configConstant.nodeEnv === 'production' ? appConstant.PASSWORD : appConstant.PASSWORD_DEV}</tem:Password>  <tem:AccountUsername>${username}</tem:AccountUsername>  </tem:AuthenticationHeaderAcct> </soap:Header>`;
      const xml_soap_body_opens = `<soap:Body> <tem:UploadFile> <v100:EZLynxUploadRequest>  <v100:UploadRequest RefID="XILO" XrefKey="${req.params.clientId}" DataUploadFlags="4"><v100:FileData Name="EZ${req.params.type}" MimeType="text/xml">`;
      const xml_soap_body_close = '</v100:FileData> </v100:UploadRequest> </v100:EZLynxUploadRequest> </tem:UploadFile> </soap:Body></soap:Envelope>';
      const xml_string = xml_authentication_header.concat(xml_soap_body_opens, encodedData, xml_soap_body_close);

      console.log(xml_string);


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

      console.log(response);

      req.session.data = {
        title: 'Contact created successfully',
        body: newResponse,
        fullBody: response,
        url,
        xml: format(xml_body),
        json: data,
      };
      return next();
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest('Error creating contact'));
    }
  },
};
