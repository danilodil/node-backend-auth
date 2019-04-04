const Boom = require('boom');
const puppeteer = require('puppeteer');

module.exports = {
  rateDelaware: async (req, res, next) => {
    const { username, password } = req.body.decoded_vendor;
    console.log('On login');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    //For login
    await page.setViewport({ width: 1200, height: 720 })
    await page.goto('https://www.foragentsonly.com/login/', { waitUntil: 'load' }); // wait until page load
    await page.waitForSelector('#user1');
    await page.type('#user1', username);
    await page.type('#password1', password);

    // click and wait for navigation
    await page.click('#image1');
    await page.waitForNavigation({ timeout: 0 });

    const checkKeyVal = async (pathElm, objInp) => {
      //console.log('path',path,'objInp',objInp);
      if (typeof pathElm == 'string') {
        pathElm = pathElm.split("$");
      }

      if (parseInt(pathElm[0]) == pathElm[0]) {
        if (pathElm.length > 1) {
          subPath = pathElm.slice(1);
          return checkKeyVal(subPath, objInp[pathElm[0]]);
        } else {
          return objInp[parseInt(pathElm[0])];
        }
      } else if (typeof objInp == 'object') {
        if (objInp.hasOwnProperty(pathElm[0])) {
          if (pathElm.length > 1) {
            subPath = pathElm.slice(1);
            return checkKeyVal(subPath, objInp[pathElm[0]]);
          } else {
            return objInp[pathElm[0]];
          }
        }
      }
    }

    const chooseState = async (browser, page) => {
      console.log('On State Choose');

      await page.click("#QuoteStateList");
      await page.select("#QuoteStateList", 'DE');
      await page.waitFor(1000);

      await page.click("#Prds");
      await page.select("#Prds", 'AU');

      await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
      await FormStep1(browser, page);
    }

    const FormStep1 = async (browser, page) => {
      console.log('FormStep1');
      //For form		
      await page.goto('https://www.foragentsonly.com/newbusiness/newquote/', { waitUntil: 'load' }); // wait until page load
      await page.waitForSelector('#QuoteStateList');
      await page.select('#QuoteStateList', 'DE');
      await page.select('#Prds', 'AU');

      await page.evaluate(() => document.querySelector('#quoteActionSelectButton').click());
      while (true) {
        await page.waitFor(1000);
        let pageQuote = await browser.pages();
        if (pageQuote.length > 2) {
          pageQuote = pageQuote[2];
          break;
        }
      }

      stepEntry(browser, pageQuote);
    }

    const stepEntry = async (browser, pageQuote) => {
      //For Named Insured Tab  	
      await pageQuote.waitForSelector('#policy');
      await pageQuote.type("input[name='DRV.0.drvr_frst_nam']", 'TEST');
      await pageQuote.type("input[name='DRV.0.drvr_mid_nam']", 'M');
      await pageQuote.type("input[name='DRV.0.drvr_lst_nam']", 'USER');
      await pageQuote.select("select[name='DRV.0.drvr_sfx_nam']", 'JR');

      await pageQuote.waitFor(1000);
      await pageQuote.click("input[name='DRV.0.drvr_dob']");
      await pageQuote.type("input[name='DRV.0.drvr_dob']", '20/11/1980', { delay: 200 });
      await pageQuote.waitFor(1000);

      await pageQuote.type("input[name='email_adr']", 'test@gmail.com');
      await pageQuote.click("input[name='INSDPHONE.0.insd_phn_nbr']");
      await pageQuote.type("input[name='INSDPHONE.0.insd_phn_nbr']", '3029438888', { delay: 500 });
      await pageQuote.waitFor(1000);
      await pageQuote.type("input[name='insd_str']", '1500 S GOVERNORS VE');
      await pageQuote.type("input[name='insd_city_cd']", 'DOVER');
      await pageQuote.select("select[name='insd_st_cd']", 'AL');
      await pageQuote.click("#insd_zip_cd");
      await pageQuote.type("#insd_zip_cd", '19904', { delay: 200 });

      await pageQuote.waitFor(1000);
      await pageQuote.click("select[name='len_of_res_insd']");
      await pageQuote.select("select[name='len_of_res_insd']", 'A');
      await pageQuote.waitFor(1000);

      let text = 'A';
      await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_dob')).value = text; }, text);

      await pageQuote.select("select[name='prir_ins_ind']", 'Y');
      await pageQuote.waitFor(1000);
      await pageQuote.select("select[name='curr_ins_co_cd_dsply']", '5002');
      await pageQuote.waitFor(1000);
      await pageQuote.select("select[name='fin_stbl_qstn']", 'Y');
      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());

      await FormStep2(browser, pageQuote);

    }

    const FormStep2 = async (browser, pageQuote) => {
      console.log('FormStep2');

      //For Vehilcles Tab
      await pageQuote.waitForSelector('select[name="VEH.0.veh_mdl_yr"]');
      //const values = await pageQuote.evaluate(getSelctVal,'select[name="VEH.0.veh_mdl_yr"]>option');
      //console.log(values);
      await pageQuote.select('select[name="VEH.0.veh_mdl_yr"]', '2020');
      await pageQuote.waitFor(4000);
      await pageQuote.select('select[name="VEH.0.veh_make"]', 'FORD');
      await pageQuote.waitFor(4000);

      await pageQuote.select('select[name="VEH.0.veh_mdl_nam"]', 'ESCAPE');
      await pageQuote.waitFor(4000);
      await pageQuote.select('select[name="VEH.0.veh_sym_sel"]', 'SUV (4CYL 4X4)');
      await pageQuote.waitFor(2000);
      await pageQuote.type('input[name="VEH.0.veh_grg_zip"]', '19904', { delay: 100 });
      await pageQuote.select('select[name="VEH.0.veh_len_of_own"]', 'A');

      await pageQuote.select('select[name="VEH.0.veh_use"]', '2');
      await pageQuote.select('select[name="VEH.0.veh_carpool_cd"]', 'N');
      await pageQuote.select('select[name="prompt_sl_cross_sell"]', 'N');

      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
      await FormStep3(browser, pageQuote);
    }

    const FormStep3 = async (browser, pageQuote) => {
      console.log('FormStep3');
      //For Drivers Tab
      await pageQuote.waitForSelector('input[name="DRV.0.drvr_frst_nam"]');
      await pageQuote.click("input[name='DRV.0.drvr_dob']");
      await pageQuote.waitFor(2000);

      let text = '20/11/1980';
      await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_dob')).value = text; }, text);
      await pageQuote.type("input[name='DRV.0.drvr_dob']", text);

      await pageQuote.waitFor(2000);
      await pageQuote.click("select[name='DRV.0.drvr_sex']");
      await pageQuote.select("select[name='DRV.0.drvr_sex']", 'F');
      await pageQuote.select("select[name='DRV.0.drvr_mrtl_stat_map']", 'S');
      await pageQuote.select("select[name='DRV.0.drvr_lic_stat']", 'V');

      await pageQuote.select("select[name='DRV.0.drvr_years_lic']");
      await pageQuote.waitFor(2000);
      await pageQuote.select("select[name='DRV.0.drvr_years_lic']", '3');
      await pageQuote.waitFor(2000);

      await pageQuote.waitFor(2000);
      await pageQuote.click("select[name='DRV.0.drvr_empl_stat']");
      await pageQuote.select("select[name='DRV.0.drvr_empl_stat']", '02');
      await pageQuote.waitFor(2000);

      await pageQuote.select("select[name='DRV.0.drvr_occup_lvl']", '020');
      await pageQuote.select("select[name='DRV.0.drvr_ed_lvl']", '4');
      await pageQuote.select("select[name='DRV.0.drvr_adv_trn_cd']", 'N');

      await pageQuote.waitFor(2000);
      //await pageQuote.click("input[name='DRV.0.drvr_dob']");
      // await pageQuote.type("input[name='DRV.0.drvr_dob']",'20/11/1980',{delay: 100});
      await pageQuote.waitFor(2000);
      await pageQuote.click("input[name='DRV.0.drvr_dob']");
      //await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_dob')).value = text; }, text);
      await pageQuote.type("input[name='DRV.0.drvr_dob']", text, { delay: 100 });
      await pageQuote.waitFor(2000);

      //return;

      //await pageQuote.keypress.type('input[name="prir_ins_eff_dt"]','01/01/2017',{delay: 100});
      //return;
      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
      await FormStep4(browser, pageQuote);
    }

    const FormStep4 = async (browser, pageQuote) => {
      console.log('FormStep4');
      //For Drivers Violations Tab
      await pageQuote.waitForSelector('select[name="DRV.0.VIO.0.drvr_viol_cd"]');
      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
      await FormStep5(browser, pageQuote);
    }

    const FormStep5 = async (browser, pageQuote) => {
      console.log('FormStep5');

      //For Underwriting Tab
      await pageQuote.waitForSelector('select[name="prir_ins_ind"]');
      await pageQuote.select('select[name="prir_ins_ind"]', 'Y');
      await pageQuote.waitFor(2000);
      await pageQuote.select('select[name="prir_bi_lim"]', '2');
      await pageQuote.waitFor(2000);
      await pageQuote.click('input[name="prir_ins_eff_dt"]');
      await pageQuote.type('input[name="prir_ins_eff_dt"]', '01/01/2017', { delay: 100 });
      await pageQuote.waitFor(2000);
      await pageQuote.click('input[name="prev_ins_expr_dt"]');
      await pageQuote.type('input[name="prev_ins_expr_dt"]', '15/03/2019', { delay: 100 });
      await pageQuote.waitFor(2000);
      await pageQuote.select('select[name="pop_len_most_recent_carr_insd"]', 'D');
      await pageQuote.select('select[name="excess_res_nbr"]', '2');
      await pageQuote.select('select[name="hm_own_ind"]', 'R');
      await pageQuote.select('select[name="hm_own_ind"]', 'R');
      await pageQuote.waitFor(2000);
      await pageQuote.select('select[name="pol_renters_prir_bi_lim_code"]', '2');
      await pageQuote.waitFor(4000);
      await pageQuote.select('select[name="multi_pol_ind"]', 'N');

      await pageQuote.waitFor(4000);
      await pageQuote.click('input[name="prev_ins_expr_dt"]');
      await pageQuote.type('input[name="prev_ins_expr_dt"]', '15/03/2019', { delay: 100 });
      await pageQuote.waitFor(4000);

      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
      await FormStep6(browser, pageQuote);
    }

    const FormStep6 = async (browser, pageQuote) => {
      console.log('FormStep6');

      await pageQuote.waitFor(4000);

      /*let text = '10/20/1980';
      if (await pageQuote.$('#DRV.0.drvr_dob') !== null){ 	
          await pageQuote.click('input[name="DRV.0.drvr_dob"]');	
          await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_dob')).value = text; }, text);
      }*/

      await pageQuote.waitForSelector('input[name="prev_ins_expr_dt"]');

      let expire_data = '10/20/2020';
      await pageQuote.click('input[name="prev_ins_expr_dt"]');
      await pageQuote.evaluate((text) => { (document.getElementById('prev_ins_expr_dt')).value = text; }, expire_data);

      let prir_ins_ind = 'Y';
      if (await pageQuote.$('#prir_ins_ind') !== null) {
        await pageQuote.evaluate((text) => { (document.getElementById('prir_ins_ind')).value = text; }, prir_ins_ind);
      }

      let driving_lic_status = 'V';
      await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_lic_stat')).value = text; }, driving_lic_status);

      let vehicle = 'N';
      await pageQuote.evaluate((text) => { (document.getElementById('VEH.0.veh_use_dlvry')).value = text; }, vehicle);

      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());

      await pageQuote.evaluate(() => {
        alert = function (ss) { console.log(ss) }
      });


      await FormStep7(browser, pageQuote);
    }

    const FormStep7 = async (browser, pageQuote) => {
      console.log('FormStep7');

      await pageQuote.waitFor(4000);

      let len_of_res_insd = 'A';
      if (await pageQuote.$('#len_of_res_insd') !== null) {
        await pageQuote.evaluate((text) => { (document.getElementById('len_of_res_insd')).value = text; }, len_of_res_insd);
      }

      let prir_city = 'albama';
      if (await pageQuote.$('#prir_city') !== null) {
        await pageQuote.evaluate((text) => { (document.getElementById('prir_city')).value = text; }, prir_city);
      }

      let prir_st = 'AL';
      if (await pageQuote.$('#prir_st') !== null) {
        await pageQuote.select('select[name="prir_st"]', prir_st);
      }

      let prir_str = 'TESTED';
      if (await pageQuote.$('#prir_str') !== null) {
        await pageQuote.evaluate((text) => { (document.getElementById('prir_str')).value = text; }, prir_str);
      }

      let prir_zip_cd = '44001';
      if (await pageQuote.$('#prir_zip_cd') !== null) {
        await pageQuote.evaluate((text) => { (document.getElementById('prir_zip_cd')).value = text; }, prir_zip_cd);
      }

      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
      dismissDialog(pageQuote);
      await FormStep8(browser, pageQuote)
    }

    const FormStep8 = async (browser, pageQuote) => {
      await pageQuote.waitForSelector("input[name='DRV.0.drvr_dob']");
      await pageQuote.waitFor(2000);

      let dob = '10/25/1980';
      await pageQuote.type('input[name="DRV.0.drvr_dob"]', dob, { delay: 1000 });
      await pageQuote.waitFor(2000);

      await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
      await finalStep(browser, pageQuote);
    }

    const finalStep = async (browser, pageQuote) => {
      console.log('final step');

      await pageQuote.waitForSelector('select[name="VEH.0.BIPD"]');

      let bipd = '191006-200103';
      await pageQuote.select('select[name="VEH.0.COMP"]', bipd);

      await pageQuote.waitFor(2000);
      let comp = '210106';
      await pageQuote.select('select[name="VEH.0.COMP"]', comp);

      await pageQuote.waitFor(2000);
      let coll = '210303';
      await pageQuote.select('select[name="VEH.0.COLL"]', coll);
      await pageQuote.waitFor(2000);

      await pageQuote.click('#tot_pol_prem-button');
    }

    const dismissDialog = async (page) => {
      puppeteer.launch().then(async browser => {
        page.on('dialog', async dialog => {
          console.log(dialog.message());
          await dialog.dismiss();
          await browser.close();
        });
        page.evaluate(() => alert('1'));
      });
    }

    const getSelctVal = async (inputID) => {
      optVals = [];
      document.querySelectorAll(inputID).forEach(opt => {

        optVals.push(opt.value);
      });
      return optVals;
    }

    const requestBody = async () => {
      // Request Body
      let Client = [{
        firstName: "Test",
        lastName: "User",
        dateOfBirth: "12/16/1993",
        email: "test@mail.com",
        phone: "302-222-5555",
        mailingAddress: "216 Humphreys Dr",
        city: "Dover",
        state: "Delaware",
        zipCode: "19934",
        lengthAtAddress: "1 year or more",
        priorInsurance: "Yes",
        priorInsuranceCarrier: "USAA",
        // must always agree to closure
        vehicles: [
          {
            // Vehicle Type will always be 1981 or newer
            vehicleVin: "1FTSF30L61EC23425",
            year: "2015",
            make: "FORD",
            model: "F350",
            body: "EXT CAB (8CYL 4x2)",
            zipCode: "19934",
            lengthOfOwnership: "At least a year but less than 3 years",
            primaryUse: "Commute",
            // Vehicle never used for transport of person for fee
            primaryUse: "Commute",
            // No toys to quote
            //Need functionality for adding another vehicle
          },
          {
            vehicleVin: "KMHDH6AE1DU001708",
            year: "2013",
            make: "HYUNDAI",
            model: "ELANTRA",
            body: "2DR 4CYL",
            zipCode: "19934",
            lengthOfOwnership: "5 years or more",
            primaryUse: "Commute",
            // Vehicle never used for transport of person for fee
            primaryUse: "Commute",
            // No toys to quote
            //Need functionality for adding another vehicle
          }
        ],
        drivrs: [
          {
            firstName: "Test",
            lastName: "User",
            dateOfBirth: "12/16/1993",
            gender: "Male",
            maritalStatus: "Married",
            // License status always Valid
            yearsLicensed: "3 years or more",
            employment: "Student (full-time)",
            education: "College Degree",
            // Must be able to add or fill in more drivers. Especially if the marital status is "Married" as its required to add a 2nd driver
          },
          {
            firstName: "Tester",
            lastName: "User",
            dateOfBirth: "12/18/1993",
            gender: "Female",
            maritalStatus: "Married",
            // License status always Valid
            yearsLicensed: "3 years or more",
            employment: "Student (full-time)",
            education: "College Degree",
          }
        ],
        priorIncident: "AAD - At Fault Accident",
        priorIncidentDate: "12/16/2012",
        // policyEffectiveDate: "03/30/2019", Not needed
        priorPolicyTerminationDate: "03/29/2018",
        yearsWithPriorInsurance: "5 years or more",
        ownOrRentPrimaryResidence: "Rent",
        numberOfResidentsInHome: "2",
        rentersLimits: "Greater Than 300,000",
        haveAnotherProgressivePolicy: "No"
        // Final task is to be able to change the Vehicle Coverages and then hit recalc next to Total Premium at bottom then retrieve new rate
      }];

      return Client;
    }

    await FormStep1(browser, page);

  }
};