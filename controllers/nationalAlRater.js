
const Boom = require('boom');
const puppeteer = require('puppeteer');


module.exports = {
  nationalGeneralAl: async (req, res, next) => {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      //Request input data    
      // let bodyData = req.body.data;
      console.log("datad>>>>>>>....", req.body.data)
      //Request input data    
      // const data = {
      //   producer: "610979",
      //   inputBy: "20000739",
      //   plan: "G5",
      //   firstName: req.body.data.firstName,        
      //   lastName: req.body.data.lastName,
      //   suffixName: "IV",        
      //   email: req.body.data.email,
      //   birthDate: req.body.data.birthDate,
      //   mailingAddress: req.body.data.mailingAddress,      
      //   phone1: "455",
      //   phone2: "555",
      //   phone3: "5555",         
      //   city: req.body.data.city,
      //   state: req.body.data.state,
      //   zipCode: req.body.data.zipCode,        
      //   security1: "122",
      //   security2: "22",
      //   security3: "2222",
      //   drivers: req.body.data.drivers 
      //   /*[          
      //      {            
      //       gender: "M",            
      //       maritalStatus: "S",
      //       relationShip: "Named Insured",
      //       driverStatus: "Rated Driver",
      //       yearOfExperiance: "9",
      //       driverLicenseStatus: "Permit",
      //       smartDrive: "True",
      //       licenseState: "IN",            
      //     }, 
      //      {
      //       gender: "F",            
      //       maritalStatus: "M",
      //       relationShip: "Spouse",
      //       driverStatus: "Rated Driver",
      //       yearOfExperiance: "5",
      //       driverLicenseStatus: "Valid",
      //       smartDrive: "True",
      //       licenseState: "AL",            
      //     },
      //     {
      //       gender: "F",            
      //       maritalStatus: "M",
      //       relationShip: "Parent",
      //       driverStatus: "Excluded Driver",
      //       yearOfExperiance: "2",
      //       driverLicenseStatus: "Valid",
      //       smartDrive: "",
      //       licenseState: "AZ",            
      //     }
      //   ], */,
      //   vehicles: req.body.data.vehicles 
      //   /* [
      //     {
      //       vehicleVin: "KMHDH6AE1DU001708", 
      //       vtype:"PPA",        
      //       modelYear: "2013", 
      //       make: "HYUN",
      //       model: "SANTA FE G",
      //       style: "WAGON 4 DOOR 4 Cyl 4x2", 
      //       primaryUse: "Business",
      //       antiTheft: "Recovery Device", 
      //       // garagingState: "AL",        
      //       garagingzipCode: "36016", 
      //       ownershipStatus:"OWN" 
      //     }
      //   ]      */
      // };
      const data = {
         newQuoteState: "AL",
         newQuoteProduct: "PPA", 
         producer: "610979",
         inputBy: "20000739",
         plan: "G5",
         firstName: "Test",
         middleName: "TEST",
         lastName: "User",
         suffixName: "IV",
         emailOption: "EmailProvided",
         email: "test@mail.com",
         birthDate: "12/16/1993",
         mailingAddress: "216 Humphreys Dr",
         phone1: "455",
         phone2: "555",
         phone3: "5555",
         phoneType: "3",
         city: "Dover",
         state: "Delaware",
         zipCode: "19934",
         hasMovedInLast60Days: "False",
         security1: "122",
         security2: "22",
         security3: "2222",
         drivers: [
           { 
            firstName: "Test", 
            lastName: "User",  
            applicantBirthDt: "12/16/1993",        
             gender: "Male",            
             maritalStatus: "Single",
             relationShip: "Named Insured",
             driverStatus: "Rated Driver",
             yearOfExperiance: "8",
             driverLicenseStatus: "Permit",
             smartDrive: "True",
             licenseState: "IN",            
           },
     /*       {
             gender: "F",            
             maritalStatus: "M",
             relationShip: "Spouse",
             driverStatus: "Rated Driver",
             yearOfExperiance: "5",
             driverLicenseStatus: "Valid",
             smartDrive: "True",
             licenseState: "AL",            
           },
           {
             gender: "F",            
             maritalStatus: "M",
             relationShip: "Parent",
             driverStatus: "Excluded Driver",
             yearOfExperiance: "2",
             driverLicenseStatus: "Valid",
             smartDrive: "",
             licenseState: "AZ",            
           } */
         ],
         vehicles: [
           {
             vehicleVin: "KMHDH6AE1DU001708", 
             vtype:"PPA",        
             modelYear: "2013", 
             make: "HYUN",
             model: "SANTA FE G",
             style: "WAGON 4 DOOR 4 Cyl 4x2", 
             primaryUse: "Business",
             antiTheft: "Recovery Device", 
             garagingState: "AL",        
             garagingzipCode: "36016", 
             ownershipStatus:"Owned",
             vehicleType:"Private Passenger Auto"
           }
         ]     
       };
      let bodyData = data;


      //For login
      await loginStep();

      // For Login
      async function loginStep() {
        await page.goto('https://www.natgenagency.com/', { waitUntil: 'load' }); // wait until page load
       //await page.setViewport({ width: 1500, height: 920 });
        await page.waitForSelector('#txtUserID');
        await page.type('#txtUserID', '9007300');
        await page.type('#txtPassword', 'Onelove1!');
        await page.click('#btnLogin');
        await page.waitForNavigation({ timeout: 0 });
        const populatedData = await populateKeyValueData(bodyData);
        await newQuoteStep(bodyData, populatedData);
      }

      //For redirect to new quoate form
      async function newQuoteStep(dataObject, populatedData) {
        console.log('newQuoteStep');
        let AllPages = await browser.pages();        
        if (AllPages.length > 2) {
          for (var i = 2; i < AllPages.length; i++) {
            await AllPages[i].close();
          }
        }
        
        await page.goto('https://www.natgenagency.com/MainMenu.aspx', { waitUntil: 'load' });
        await page.waitForSelector(populatedData['newQuoteState'].element);
        await page.select(populatedData['newQuoteState'].element, populatedData['newQuoteState'].value);
        await page.select(populatedData['newQuoteProduct'].element, populatedData['newQuoteProduct'].value);
        await page.waitFor(1000);
        await page.click('span > #ctl00_MainContent_wgtMainMenuNewQuote_btnContinue');
        await namedInsuredStep(dataObject, populatedData);
      }


      //For Named Insured Form
      async function namedInsuredStep(dataObject, populatedData) {
        console.log('namedInsuredStep');        

        try {

          await page.goto('https://www.natgenagency.com/Quote/QuoteNamedInsured.aspx', { waitUntil: 'load' });
          page.on('dialog', async (dialog) => {
            await dialog.dismiss();
            // await browser.close();
          });

          await page.waitForSelector(populatedData['producer'].element);
          // await page.waitFor(1000);
          await page.select(populatedData.producer.element, populatedData.producer.value);
          await page.select(populatedData.inputBy.element, populatedData.inputBy.value);
          await page.select(populatedData.plan.element, populatedData.plan.value);

          // await page.type(populatedData['firstName'].element, populatedData['firstName'].value);
          await page.evaluate((firstName)=> {document.querySelector(firstName.element).value = firstName.value},populatedData.firstName);
          // await page.type(populatedData['middleName'].element, populatedData['middleName'].value);
          await page.evaluate((middleName)=> {document.querySelector(middleName.element).value = middleName.value},populatedData.middleName);
          // await page.type(populatedData['lastName'].element, populatedData['lastName'].value);
          await page.evaluate((lastName)=> {document.querySelector(lastName.element).value = lastName.value},populatedData.lastName);
          await page.select(populatedData.suffixName.element, populatedData.suffixName.value);

          // await page.type(populatedData['phone1'].element, populatedData['phone1'].value, { delay: 100 });
          await page.evaluate((phone1)=> {document.querySelector(phone1.element).value = phone1.value},populatedData.phone1);

          //await page.type(populatedData['phone2'].element, populatedData['phone2'].value, { delay: 100 });
          await page.evaluate((phone2)=> {document.querySelector(phone2.element).value = phone2.value},populatedData.phone2);

          //await page.type(populatedData['phone3'].element, populatedData['phone3'].value);
          await page.evaluate((phone3)=> {document.querySelector(phone3.element).value = phone3.value},populatedData.phone3);

          await page.select(populatedData.phoneType.element, populatedData.phoneType.value);
          
          await page.select(populatedData.emailOption.element, populatedData.emailOption.value);
          //await page.type(populatedData.email.element, populatedData['email'].value);
          await page.evaluate((email)=> {document.querySelector(email.element).value = email.value},populatedData.email);


          //await page.click(populatedData['dateOfBirth'].element);
          //await page.type(populatedData['dateOfBirth'].element, populatedData['dateOfBirth'].value, { delay: 100 });
          await page.evaluate((dateOfBirth)=> {document.querySelector(dateOfBirth.element).value = dateOfBirth.value},populatedData.dateOfBirth);

          //await page.type(populatedData['security1'].element, populatedData['security1'].value, { delay: 100 });
          await page.evaluate((security1)=> {document.querySelector(security1.element).value = security1.value},populatedData.security1);

          //await page.type(populatedData['security2'].element, populatedData['security2'].value, { delay: 100 });
          await page.evaluate((security2)=> {document.querySelector(security2.element).value = security2.value},populatedData.security2);

          //await page.type(populatedData['security3'].element, populatedData['security3'].value);
          await page.evaluate((security3)=> {document.querySelector(security3.element).value = security3.value},populatedData.security3);

          //await page.waitFor(6000);                     
          //await page.type(populatedData['mailingAddress'].element, populatedData['mailingAddress'].value);
          await page.evaluate((mailingAddress)=> {document.querySelector(mailingAddress.element).value = mailingAddress.value},populatedData.mailingAddress);

          //await page.type(populatedData['city'].element, populatedData['city'].value);
          await page.evaluate((city)=> {document.querySelector(city.element).value = city.value},populatedData.city);

          //  var states = await page.evaluate(getSelctVal, `${populatedData['state'].element}>option`);
          // console.log("states", states);
          // const state = await page.evaluate(getValToSelect, states, populatedData['state'].value);
          // console.log("state", state);          
 
          // await page.click(populatedData['state'].element);
          // await page.select(populatedData['state'].element, populatedData['state'].value);

          await page.evaluate(selectedValue, populatedData.state.element,populatedData.state.value);

          // await page.click(populatedData['zipCode'].element);
          // await page.type(populatedData['zipCode'].element, populatedData['zipCode'].value, { delay: 200 });
          await page.evaluate((zipCode)=> {document.querySelector(zipCode.element).value = zipCode.value},populatedData.zipCode);

          await page.select(populatedData.hasMovedInLast60Days.element, populatedData.hasMovedInLast60Days.value);

          // await page.waitFor(1000);

          await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
          await Drivers(dataObject, populatedData);
        } catch (err) {
          console.log('err namedInsuredStep:', err);
          let response = { error: 'There is some error validations at namedInsuredStep' };
          dataObject.results = {
            status: false,
            response: response
          };
        }
      }


      //For driver Form      
           async function Drivers(dataObject, populatedData) {
              console.log('Drivers');
              try {
                await page.waitFor(1000);
                await page.goto('https://www.natgenagency.com/Quote/QuoteDriver.aspx', { waitUntil: 'load' });
      
                for (let j in dataObject.drivers) {
                  if (j < dataObject.drivers.length - 1) {
                    const addElement = await page.$('[id="ctl00_MainContent_InsuredDriverLabel1_btnAddDriver"]');
                    await addElement.click();
                    //await page.waitFor(1000);
                  }
                } 

                if(await page.$('[id="ctl00_MainContent_Driver3_btnDelete"]')){
                  const removeElement = await page.$('[id="ctl00_MainContent_Driver3_btnDelete"]');                
                  await removeElement.click();
                  //await page.waitFor(2000);  
                }
                
              /*   if(await page.$('[id="ctl00_MainContent_Driver2_btnDelete"]')){
                  const removeElement = await page.$('[id="ctl00_MainContent_Driver2_btnDelete"]');                
                  await removeElement.click();
                  await page.waitFor(2000);  
                }                        */       
                   
                     
                await clearInputText('#ctl00_MainContent_Driver1_txtFirstName');
                await clearInputText('#ctl00_MainContent_Driver1_txtLastName');
                await clearInputText('#ctl00_MainContent_Driver1_txtDateOfBirth');
                //await page.waitFor(2000); 
                await page.select('#ctl00_MainContent_Driver1_ddlSex',"-1");
                await page.select('#ctl00_MainContent_Driver1_ddlMaritalStatus',"-1");

                console.log('after ')   
                for (let j in dataObject.drivers) { 
                  j= parseInt(j) + 1;                              
                   await page.waitFor(600);            
                   await page.waitForSelector(populatedData[`driverFirstName${j}`].element);

                  await page.evaluate((firstName) => {                                    
                    document.querySelector(firstName.element).value = firstName.value; 
                   },populatedData[`driverFirstName${j}`]); 

                   await page.evaluate((lastName) => {                                    
                    document.querySelector(lastName.element).value = lastName.value; 
                   },populatedData[`driverLastName${j}`]);

                   await page.evaluate((dateOfBirth) => {                                    
                    document.querySelector(dateOfBirth.element).value = dateOfBirth.value; 
                   },populatedData[`driverDateOfBirth${j}`]);    

                  // await page.waitForSelector(populatedData[`driverGender${j}`].element);
                  // var genders = await page.evaluate(getSelctVal, `${populatedData[`driverGender${j}`].element}>option`);
                  // const gender = await page.evaluate(getValToSelect, genders, populatedData[`driverGender${j}`].value);
                  await page.evaluate(selectedValue, populatedData[`driverGender${j}`].element, populatedData[`driverGender${j}`].value);

                  // await page.waitFor(600);
                  // await page.click(populatedData[`driverGender${j}`].element);
                  // await page.select(populatedData[`driverGender${j}`].element, gender);

                  // await page.waitFor(200);  
                  // var maritalStatus_s = await page.evaluate(getSelctVal, `${populatedData[`driverMaritalStatus${j}`].element}>option`);
                  // const maritalStatus = await page.evaluate(getValToSelect, maritalStatus_s, populatedData[`driverMaritalStatus${j}`].value);
                  // await page.select(populatedData[`driverMaritalStatus${j}`].element, maritalStatus);    
                  await page.evaluate(selectedValue, populatedData[`driverMaritalStatus${j}`].element, populatedData[`driverMaritalStatus${j}`].value);                                                              

                  // await page.waitFor(200);  
                  // await page.click(populatedData[`driverRelationship${j}`].element);
                  // await page.select(populatedData[`driverRelationship${j}`].element, populatedData[`driverRelationship${j}`].value);
                  await page.evaluate(selectedValue,populatedData[`driverRelationship${j}`].element, populatedData[`driverRelationship${j}`].value);                                                              

                  // await page.waitFor(200);  
                  // await page.click(populatedData[`driverStatus${j}`].element);
                  // await page.select(populatedData[`driverStatus${j}`].element, populatedData[`driverStatus${j}`].value);                   
                  await page.evaluate(selectedValue,populatedData[`driverStatus${j}`].element, populatedData[`driverStatus${j}`].value);                                                              

                  //await page.waitForSelector(`#ctl00_MainContent_Driver${parseInt(j) + 1}_txtYrsExperience`);

                  // await page.click(populatedData[`yearsOfExperiance${j}`].element);                  
                  // await page.focus( `#ctl00_MainContent_Driver${parseInt(j) + 1}_txtYrsExperience` );
                  // await page.keyboard.press( 'Home' );
                  // await page.keyboard.press( 'Delete' );
                  // await page.type(populatedData[`yearsOfExperiance${j}`].element, populatedData[`yearsOfExperiance${j}`].value);
                  
                  await page.evaluate((yearsOfExperiance) => {                                    
                    document.querySelector(yearsOfExperiance.element).value = yearsOfExperiance.value; 
                   },populatedData[`yearsOfExperiance${j}`]);                              

                  // await page.waitFor(200);                   
                  // await page.click(populatedData[`driverLicenseStatus${j}`].element);
                  await page.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);
                 
                  // await page.waitFor(200);                   
                  // await page.click(populatedData[`smartDrive${j}`].element);
                  await page.select(populatedData[`smartDrive${j}`].element, populatedData[`smartDrive${j}`].value);

                  // await page.waitFor(200);
                  // await page.click(populatedData[`licenseState${j}`].element);
                  await page.select(populatedData[`licenseState${j}`].element, populatedData[`licenseState${j}`].value);
                 
                }
                await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
                await vehicles(dataObject, populatedData); 
      
              } catch (err) {
                console.log('err driverStep:', err);
                let response = { error: 'There is some error validations at driverStep' };
                dataObject.results = {
                  status: false,
                  response: response
                };
              }
            }
      
      
            // For Vehicles Form
          
            async function vehicles(dataObject, populatedData) {
              console.log('vehicles');
      
              try {            
                //await page.goto('https://www.natgenagency.com/Quote/QuoteAuto.aspx', { waitUntil: 'load' });  
                await page.waitForSelector('#ctl00_MainContent_AutoControl1_txtZip')
                await clearInputText('#ctl00_MainContent_AutoControl1_txtZip');
              for (let j in dataObject.vehicles) {
                await page.waitFor(1600);                
                await page.waitForSelector(populatedData[`vehicleVin${j}`].element);                                
                //await page.type(populatedData[`vehicleVin${j}`].element, populatedData[`vehicleVin${j}`].value);   
                await page.evaluate((vehicleVinInput) => {                                 
                  document.querySelector(vehicleVinInput.element).value = vehicleVinInput.value;                    
                },populatedData[`vehicleVin${j}`]);   

                await page.evaluate((vehicleVin) => {                                 
                   document.querySelector(vehicleVin.buttonId).click()                    
                 },populatedData[`vehicleVin${j}`]);                                               
                 
               // await page.evaluate(() => document.querySelector(`#ctl00_MainContent_AutoControl${j}_btnVerifyVIN`).click()); 

                await page.waitFor(6000);                                           
                //await page.select(populatedData[`vehicleType${j}`].element, populatedData[`vehicleType${j}`].value);
                //await page.evaluate(selectedValue,populatedData[`vehicleType${j}`].element, populatedData[`vehicleType${j}`].value);

                //await page.waitFor(2000);
                // await page.waitForSelector(populatedData[`vehicleModelYear${j}`].element);
                //await page.type(populatedData[`vehicleModelYear${j}`].element, populatedData[`vehicleModelYear${j}`].value);    
                // await page.evaluate((vehicleModelYear) => {                                    
                //   document.querySelector(vehicleModelYear.element).value = vehicleModelYear.value; 
                // },populatedData[`vehicleModelYear${j}`]);                              

                //await page.waitFor(2000);                
                // var vehicle_Make = await page.evaluate(getSelctVal, `${populatedData[`vehicleMake${j}`].element}>option`);
                // const vehicleMake = await page.evaluate(getValToSelect, vehicle_Make, populatedData[`vehicleMake${j}`].value);
                // await page.select(populatedData[`vehicleMake${j}`].element, vehicleMake);      
                //await page.evaluate(selectedValue,populatedData[`vehicleMake${j}`].element, populatedData[`vehicleMake${j}`].value);                                                              


                //await page.waitFor(2000);
                //await page.click(populatedData[`vehicleModel${j}`].element);
                //await page.select(populatedData[`vehicleModel${j}`].element, populatedData[`vehicleModel${j}`].value);

                //await page.waitFor(600);
                //await page.select(populatedData[`vehicleStyle${j}`].element, populatedData[`vehicleStyle${j}`].value);
                await page.select(populatedData[`primaryUse${j}`].element, populatedData[`primaryUse${j}`].value);
                await page.select(populatedData[`antiTheft${j}`].element, populatedData[`antiTheft${j}`].value);
                await page.waitFor(200);                                
                                
                //await page.select(selectedValue,populatedData[`garagingState${j}`].element, populatedData[`garagingState${j}`].value);             
                await page.evaluate((garagingState) => {                                    
                  document.querySelector(garagingState.element).value = garagingState.value; 
                },populatedData[`garagingState${j}`]); 

                await page.evaluate((garagingzipCode) => {                                    
                  document.getElementById(garagingzipCode.elementId).value = garagingzipCode.value; 
                },populatedData[`garagingzipCode${j}`]); 
                            
                await page.evaluate(selectedValue,populatedData[`ownershipStatus${j}`].element, populatedData[`ownershipStatus${j}`].value);

                // await page.waitFor(600);
                // await page.focus(populatedData[`ownershipStatus${j}`].elementId);
                // var test_ownerShip = populatedData[`ownershipStatus${j}`].value.toUpperCase();
                // await page.select(populatedData[`ownershipStatus${j}`].element, test_ownerShip);
 
                /* var ownershipStatus = await page.evaluate(getSelctVal, `${populatedData[`ownershipStatus${j}`].element}>option`);
                console.log("ownerShipStatus", ownershipStatus)                
                const ownership_Status = await page.evaluate(getValToSelect, ownershipStatus, populatedData[`ownershipStatus${j}`].value);
                console.log("status", ownership_Status)
                await page.select(populatedData[`ownershipStatus${j}`].element, ownership_Status);                 */
              }


                 await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
                 await vehicleHistory(dataObject, populatedData);
              } catch (err) {
                console.log('err vehicles', err);
                let response = { error: 'There is some error validations at vehicles' }
                dataObject.results = {
                  status: false,
                  response: response
                };
              } 
            }

            async function vehicleHistory(dataObject, populatedData){
              console.log("vehicleHistory")
              try {

                await page.goto('https://www.natgenagency.com/Quote/QuoteAutoHistory.aspx', { waitUntil: 'load' });                
                await page.waitFor(1000);                    
                               
                await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
                await underWriting(browser, page, dataObject, populatedData);
              } catch (err) {
                console.log('err underwritingStep ', err);
                let response = { error: 'There is some error validations at underwritingStep' }
                dataObject.results = {
                  status: false,
                  response: response
                }
              }
            }

            async function underWriting(browser, page, dataObject, populatedData){
              console.log("underwriting");
              try {

                // await page.goto('https://www.natgenagency.com/Quote/QuoteUW.aspx', { waitUntil: 'load' });                
                await page.waitFor(1000);                    
                await page.waitForSelector(populatedData.priorInsuranceCo.element);
                await page.select(populatedData.priorInsuranceCo.element, populatedData.priorInsuranceCo.value);                
                await page.waitFor(1200);                
                await page.select(populatedData.priorBICoverage.element, populatedData.priorBICoverage.value);
                await page.waitFor(1200);
                await page.type(populatedData.priorExpirationDate.element, populatedData.priorExpirationDate.value);
                await page.waitFor(1200);
                await page.select(populatedData.recidentStatus.element, populatedData.recidentStatus.value);
                await page.waitFor(1200);
                await page.select(populatedData.prohibitedRisk.element, populatedData.prohibitedRisk.value);
                await page.waitFor(1200);                
                await page.select(populatedData.anydriversTNC.element, populatedData.anydriversTNC.value);
                await page.waitFor(1200);

                await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
                await coverages(browser, page, dataObject);                                                            
              } catch (err) {
                console.log('err underwritingStep ', err);
                let response = { error: 'There is some error validations at underwritingStep' }
                dataObject.results = {
                  status: false,
                  response: response
                }
              }
            }


            async function coverages(browser, page, dataObject){
              console.log("coverages")
              try {

                await page.goto('https://www.natgenagency.com/Quote/QuoteCoveragesV2.aspx', { waitUntil: 'load' });                
                await page.waitFor(600);    
                          
                await page.evaluate(() => document.querySelector('#ctl00_MainContent_btnContinue').click());
                await billPlans(browser, page, dataObject);                                                            
              } catch (err) {
                console.log('err coverages ', err);
                let response = { error: 'There is some error validations at coverages' }
                dataObject.results = {
                  status: false,
                  response: response
                }
              }              
            }

            async function billPlans(browser, page, dataObject) {
              console.log('billPlans');
              try {

                await page.goto('https://www.natgenagency.com/Quote/QuoteBillPlans.aspx', {waitUntil: 'load'})
              
                const tHead = await page.$$eval('table tr.GRIDHEADER td', tds => tds.map((td) => {
                  return td.innerText;
                }));                                                 

                const tBody = await page.$$eval('table #ctl00_MainContent_ctl00_tblRow td', tds => tds.map((td) => {
                  return td.innerText;
                }));                                                
  
                const downPayments = {};
                tHead.forEach((key, i) => {
                  if (i != 0)
                  downPayments[key] = tBody[i]
                });

                dataObject.results = {
                  status: true,
                  response: downPayments
                }; 
                    
                } catch (err) {

                console.log('err bill plans ', err);
                let response = { error: 'There is some error validations at bill plans' }
                dataObject.results = {
                  status: false,
                  response: response
                }
              }              
            }
      
    //For select dropdown value
      async function selectedValue(inputID,valueToSelect){

        function getAllOptions(){
          let optVals = [];

          document.querySelectorAll(inputID+`>option`).forEach((opt) => {
          optVals.push({ name: opt.innerText, value: opt.value });
          });
      
          return optVals;
        }
        const allOptions = await getAllOptions();

        function selectValue(){
          let selected = '';
          allOptions.forEach((entry) => {
          if (valueToSelect.toLowerCase() === entry.name.toLowerCase()) {
            selected = entry.value;
          }
          });
        return selected;
        }
        const selectedValue = await selectValue();
        document.querySelector(inputID).value = selectedValue;
      }	       
      // for clear input
     async function clearInputText(inputId){
        await page.focus(inputId);
        await page.keyboard.down( 'Control' );
        await page.keyboard.press( 'A' );
        await page.keyboard.up( 'Control' );
        await page.keyboard.press( 'Backspace' );
      }        
      //For get all select options texts and values
      function getSelctVal(inputID) {
        optVals = [];
        document.querySelectorAll(inputID).forEach(opt => {
          optVals.push({ name: opt.innerText, value: opt.value });
        });
        return optVals;
      }

      //For select particular value in dropdown
       function getValToSelect(data, val_to_select) {
        var selected = "";
        data.forEach(function (entry) {
          if (val_to_select.toLowerCase() == entry.name.toLowerCase()) {
            selected = entry.value;
          }
        });        
        return selected;
      }
 

    /*   function getValToSelect(data, valueToSelect) {
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
 
        return selected;
      }
  */


      function populateKeyValueData(bodyData) {
        const clientInputSelect = {
          newQuoteState: {
            element: `select[name="ctl00$MainContent$wgtMainMenuNewQuote$ddlState"]`,
            value:  'AL',                        
          },
          newQuoteProduct: {
            element: `select[name="ctl00$MainContent$wgtMainMenuNewQuote$ddlProduct"]`,
            value: 'PPA',
          },
          producer: {
            element: `select[name="ctl00$MainContent$InsuredNamed1$ddlProducers"]`,
            value: bodyData.producer || '',
          },
          inputBy: {
            element: `select[name="ctl00$MainContent$InsuredNamed1$ddlInputBy"]`,
            value: bodyData.inputBy || '',
          },
          plan: {
            element: `select[name="ctl00$MainContent$InsuredNamed1$ddlPlanCode"]`,
            value: bodyData.plan || '',
          },
          firstName: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtInsFirstName']`,
            value: bodyData.firstName || '',
          },
          middleName: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtInsMiddleName']`,
            value: bodyData.middleName || '',
          },
          lastName: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtInsLastName']`,
            value: bodyData.lastName || '',
          },
          suffixName: {
            element: `select[name='ctl00$MainContent$InsuredNamed1$ddlInsSuffix']`,
            value: bodyData.suffixName || '',
          },          
          phone1: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone1']`,
            value: bodyData.phone1 || '',
          },
          phone2: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone2']`,
            value: bodyData.phone2 || '',
          },
          phone3: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$txtPhone3']`,
            value: bodyData.phone3 || '',
          },
          phoneType: {
            element: `select[name='ctl00$MainContent$InsuredNamed1$ucPhones$PhoneNumber1$ddlPhoneType']`,
            value: '3' || '',
          },
          emailOption: {
            element: `select[name='ctl00$MainContent$InsuredNamed1$ddlEmailOption']`,
            value: 'EmailProvided' || '',
          },
          email: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtInsEmail']`,
            value: bodyData.email || '',
          },
          dateOfBirth: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtInsDOB']`,
            value: bodyData.birthDate || '',
          },
          security1: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum1']`,
            value: bodyData.security1 || '',
          },
          security2: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum2']`,
            value: bodyData.security2 || '',
          },
          security3: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtSocialSecurityNum3']`,
            value: bodyData.security3 || '',
          },
          mailingAddress: {            
            element: `#ctl00_MainContent_InsuredNamed1_txtInsAdr`,
            value: bodyData.mailingAddress || '',
          },
          city: {
            element: `input[name='ctl00$MainContent$InsuredNamed1$txtInsCity']`,
            value: bodyData.city || '',
          },
          state: {
            element: `select[name='ctl00$MainContent$InsuredNamed1$ddlInsState']`,
            value: bodyData.state || '',
          },
          zipCode: {
            element: `#ctl00_MainContent_InsuredNamed1_txtInsZip`,
            value: bodyData.zipCode || '',
          },
          hasMovedInLast60Days: {
            element: `select[name="ctl00$MainContent$InsuredNamed1$ddlInsRecentMove60"]`,
            value: 'False' || '',
          },                        
          priorInsuranceCo:{
            element: `select[name="ctl00$MainContent$PriorPolicy$ddlCurrentCarrier"]`,
            value: '540' || '',           
          },
          priorBICoverage:{
            element: `select[name="ctl00$MainContent$PriorPolicy$ddlBICoverage"]`,
            value: '10/20' || '',           
          },
          priorExpirationDate:{
            element: `input[name="ctl00$MainContent$PriorPolicy$txtExpDateOld"]`,
            value: '4/30/2019' || '',           
          },
          recidentStatus:{            
            element: `select[name="ctl00$MainContent$ctl00$ddlAnswer"]`,
            value: 'HCO' || '',           
          },
          prohibitedRisk:{            
            element: `select[name="ctl00$MainContent$ProhibitedRisk6$ddlProhibitedRisk"]`,
            value: 'False' || '',           
          },          
          anydriversTNC:{
          element: `select[name="ctl00$MainContent$ctl07$ddlAnswer"]`,
          value: 'False' || '',           
          }
        };

        if (bodyData.hasOwnProperty('drivers') && bodyData.drivers.length > 0) {
          for (let j in bodyData.drivers) {
            
            let i = parseInt(j) + 1;
            clientInputSelect[`driverFirstName${i}`] = {
              elementId: `ctl00_MainContent_Driver${i}_txtFirstName`,
              element: `input[name='ctl00$MainContent$Driver${i}$txtFirstName']`,
              value: bodyData.drivers[j].firstName || '',
            };
            clientInputSelect[`driverLastName${i}`] = {
              elementId: `ctl00_MainContent_Driver${i}_txtLastName`,
              element: `input[name='ctl00$MainContent$Driver${i}$txtLastName']`,
              value: bodyData.drivers[j].lastName || '',
            };
            clientInputSelect[`driverDateOfBirth${i}`] = {
              elementId: `ctl00_MainContent_Driver${i}_txtDateOfBirth`,
              element: `input[name="ctl00$MainContent$Driver${i}$txtDateOfBirth"]`,
              value: bodyData.drivers[j].applicantBirthDt || '',
            };
            clientInputSelect[`driverGender${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlSex']`,
              value: bodyData.drivers[j].gender || '',
            };
            clientInputSelect[`driverMaritalStatus${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlMaritalStatus']`,
              value: bodyData.drivers[j].maritalStatus || '',
            };            
            clientInputSelect[`driverRelationship${i}`] = {              
              element: `#ctl00_MainContent_Driver${i}_ddlRelationship`,
              value: 'Named Insured' || '',
            };
            clientInputSelect[`driverStatus${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlDriverStatus']`,
              value: 'Rated Driver' || '',
            };           
            clientInputSelect[`yearsOfExperiance${i}`] = {              
              element: `#ctl00_MainContent_Driver${i}_txtYrsExperience`,
              value: bodyData.drivers[j].yearOfExperiance.toString() || '',
            };
            clientInputSelect[`driverLicenseStatus${i}`] = {             
              element: `#ctl00_MainContent_Driver${i}_ddlDLStatus`,
              value: 'Permit' || '',
            };
            clientInputSelect[`smartDrive${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlSmartDrive']`,
              value: 'False' || '',
            };
            clientInputSelect[`licenseState${i}`] = {
              element: `select[name='ctl00$MainContent$Driver${i}$ddlLicenseState']`,
              value: bodyData.drivers[j].licenseState || '',
            };    
          }
        }

        if (bodyData.hasOwnProperty('vehicles') && bodyData.vehicles.length > 0) {
          for (let j in bodyData.vehicles) {

            let i = parseInt(j) + 1;
            clientInputSelect[`vehicleVin${j}`] = {
              buttonId: `#ctl00_MainContent_AutoControl${i}_btnVerifyVIN`,
              element: `input[name='ctl00$MainContent$AutoControl${i}$txtVIN']`,
              value: bodyData.vehicles[j].vehicleVin || '',
            };            
            clientInputSelect[`vehicleType${j}`] = {
              element: `#ctl00_MainContent_AutoControl${i}_ddlType`,
              value: bodyData.vehicles[j].vehicleType || '',
            };
            clientInputSelect[`vehicleModelYear${j}`] = {
              element: `input[name='ctl00$MainContent$AutoControl${i}$txtModelYear']`,
              value: bodyData.vehicles[j].modelYear || '',
            };
            clientInputSelect[`vehicleMake${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlMake']`,
              value: bodyData.vehicles[j].make || '',
            };
            clientInputSelect[`vehicleModel${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlModel']`,
              value: bodyData.vehicles[j].model || '',
            };
            clientInputSelect[`vehicleStyle${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlStyle']`,
              value: bodyData.vehicles[j].style || '',
            };
            clientInputSelect[`primaryUse${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlPrimaryUse']`,
              value: bodyData.vehicles[j].primaryUse || '',
            };
            clientInputSelect[`antiTheft${j}`] = {
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlAntiTheft']`,
              value: 'Recovery Device' || '',
            };            
            clientInputSelect[`garagingState${j}`] = {              
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlState']`,
              value: bodyData.vehicles[j].garagingState || '',
            };
            clientInputSelect[`garagingzipCode${j}`] = {
              elementId: `ctl00_MainContent_AutoControl${i}_txtZip`, 
              element: `input[name='ctl00$MainContent$AutoControl${i}$txtZip']`,
              value: '36016' || '', 
            };
            clientInputSelect[`ownershipStatus${j}`] = {
              elementId: `ctl00_MainContent_AutoControl${i}_ddlOwnershipStatus`,
              element: `select[name='ctl00$MainContent$AutoControl${i}$ddlOwnershipStatus']`,
              value: bodyData.vehicles[j].ownershipStatus || '',
            };
          }
        }
        return clientInputSelect;
      }

      console.log('final result >> ', JSON.stringify(bodyData.results));
      req.session.data = {
        title: "National AL Rate Retrieved Successfully////////////////////",
        obj: bodyData.results,
      };

      return next();
    } catch (error) {
      console.log('error >> ', error);
      return next(Boom.badRequest('Error retrieving progressive DE rate..............'));
    }
  }
};