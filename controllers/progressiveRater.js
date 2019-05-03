/* eslint-disable no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition */

/* const Boom = require('boom');
const puppeteer = require('puppeteer');

module.exports = {
  rateDelaware: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      console.log('On login');
      const browser = await puppeteer.launch({headless: false});
      const page = await browser.newPage();

      //For login
      await page.setViewport({width: 1200, height: 720})
      await page.goto('https://www.foragentsonly.com/login/', {waitUntil: 'load'}); // wait until page load
      await page.waitForSelector('#user1');
      await page.type('#user1',username);
      await page.type('#password1',password);

      // click and wait for navigation
      await page.click('#image1');
        await page.waitForNavigation({ timeout:0});


        //Request input data
        let objArr = requestBody();


        // await FormStep1(browser,page,objArr[0]);
        for(var i in objArr){
        //console.log('---------------------------element number '+i+' start----------------------');
        await FormStep1(browser,page,objArr[i]);

        console.log(JSON.stringify(objArr[i].results))
        //console.log('---------------------------element number '+i+' end----------------------');
      }


      //check for key value of input data
      function checkKeyVal(pathElm,objInp){
        if(typeof pathElm == 'string' ){
          pathElm = pathElm.split("$");
        }

        var output = '';
        if(parseInt(pathElm[0]) == pathElm[0]){
          if(pathElm.length>1){
             subPath = pathElm.slice(1);
             output = checkKeyVal(subPath,objInp[pathElm[0]]);
          }else{
             output = objInp[parseInt(pathElm[0])];
          }
        } else if(typeof objInp == 'object'){
          if(objInp.hasOwnProperty(pathElm[0])){
            if(pathElm.length>1){
               subPath = pathElm.slice(1);
                 output = checkKeyVal(subPath,objInp[pathElm[0]]);
            }else{
                output = objInp[pathElm[0]];
            }
          }
        }

        if(output == undefined){
          output = '';
        }

        return output;

      }

      //for choose state
      async function chooseState(browser,page){
        console.log('On State Choose');

        await page.click("#QuoteStateList");
        await page.select("#QuoteStateList",'DE');
        await page.waitFor(1000);

        await page.click("#Prds");
        await page.select("#Prds",'AU');

        await page.evaluate(()=>document.querySelector('#quoteActionSelectButton').click());
        await FormStep1(browser,page);
      }


      //For redirect to new quoate form
      async function FormStep1(browser,page,dataObject){
        console.log('FormStep1');
        //For form
        let AllPages = await browser.pages();
        if(AllPages.length>2){
             for(var i = 2;i<AllPages.length;i++){
                 await AllPages[i].close();
             }
        }

        await page.goto('https://www.foragentsonly.com/newbusiness/newquote/', {waitUntil: 'load'}); // wait until page load
        await page.waitForSelector('#QuoteStateList');
        await page.select('#QuoteStateList','DE');
        await page.select('#Prds','AU');

        await page.evaluate(()=>document.querySelector('#quoteActionSelectButton').click());

        while(true){
              await page.waitFor(1000);
              var pageQuote = await browser.pages();
              if(pageQuote.length>2){
                pageQuote = pageQuote[2];
                 break;
              }
        }

        await stepEntry(browser,pageQuote,dataObject);
      }


      //For Named Insured Form
      async function stepEntry(browser,pageQuote,dataObject){
        try{
            await pageQuote.waitForSelector('#policy');
            await pageQuote.waitFor(1000);

            //await pageQuote.click("input[name='pol_eff_dt']");
            //await pageQuote.type("input[name='pol_eff_dt']",'04/03/2019',{delay: 1000});

            await pageQuote.type("input[name='DRV.0.drvr_frst_nam']",checkKeyVal('firstName',dataObject));
            await pageQuote.type("input[name='DRV.0.drvr_mid_nam']",checkKeyVal('middleName',dataObject));
            await pageQuote.type("input[name='DRV.0.drvr_lst_nam']",checkKeyVal('lastName',dataObject));
            await pageQuote.select("select[name='DRV.0.drvr_sfx_nam']",checkKeyVal('suffixName',dataObject));

            //await pageQuote.waitFor(1000);
            await pageQuote.click("input[name='DRV.0.drvr_dob']");
            await pageQuote.type("input[name='DRV.0.drvr_dob']",checkKeyVal('dateOfBirth',dataObject),{delay: 200});
            //await pageQuote.waitFor(1000);

            await pageQuote.type("input[name='email_adr']",checkKeyVal('email',dataObject));
            await pageQuote.click("input[name='INSDPHONE.0.insd_phn_nbr']");

            let phone_no = checkKeyVal('phone',dataObject);
          phone_no = phone_no.replace("-", "");

            await pageQuote.type("input[name='INSDPHONE.0.insd_phn_nbr']",phone_no,{delay: 200});
            //await pageQuote.waitFor(1000);
            await pageQuote.type("input[name='insd_str']",checkKeyVal('mailingAddress',dataObject));
            await pageQuote.type("input[name='insd_city_cd']",checkKeyVal('city',dataObject));


            //For selecting a state
            var states = await pageQuote.evaluate(getSelctVal,"select[name='insd_st_cd']>option");
            let state = checkKeyVal('state',dataObject);
            state = await pageQuote.evaluate(getValToSelect,states,state);
            await pageQuote.select("select[name='insd_st_cd']",state);

            await pageQuote.click("#insd_zip_cd");
            await pageQuote.type("#insd_zip_cd",checkKeyVal('zipCode',dataObject),{delay: 200});
            //await pageQuote.waitFor(1000);

            var len_of_res_insd = await pageQuote.evaluate(getSelctVal,"select[name='len_of_res_insd']>option");
            var len_of_res = checkKeyVal('lengthAtAddress',dataObject);
            len_of_res = await pageQuote.evaluate(getValToSelect,len_of_res_insd,len_of_res);

            await pageQuote.click("select[name='len_of_res_insd']");
            await pageQuote.select("select[name='len_of_res_insd']",len_of_res);
            await pageQuote.waitFor(1000);


          var prir_ins_ind = await pageQuote.evaluate(getSelctVal,"select[name='prir_ins_ind']>option");
            var prir_ins = checkKeyVal('priorInsurance',dataObject);
            prir_ins = await pageQuote.evaluate(getValToSelect,prir_ins_ind,prir_ins);
            await pageQuote.select("select[name='prir_ins_ind']",prir_ins);

            await pageQuote.waitFor(1000);
            var curr_ins_co_cd_dsply = await pageQuote.evaluate(getSelctVal,"select[name='curr_ins_co_cd_dsply']>option");
            var curr_ins_co_cd = checkKeyVal('priorInsurance',dataObject);
            prir_ins = await pageQuote.evaluate(getValToSelect,prir_ins_ind,prir_ins);
            await pageQuote.select("select[name='curr_ins_co_cd_dsply']",prir_ins);

            await pageQuote.waitFor(1000);
            await pageQuote.select("select[name='fin_stbl_qstn']",'Y');
            await pageQuote.evaluate(()=>document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
            await FormStep2(browser,pageQuote,dataObject);
          }catch(err) {
            let response = {error:'there is some error validations at entry step'}
          dataObject.results.status = false;
          dataObject.results.response = response;
          console.log(dataObject,'final data');
        }

      }

      //For Vehicles Form
      async function FormStep2(browser,pageQuote,dataObject){
        console.log('FormStep2');

        try{
          await pageQuote.waitFor(2000);
          //For Vehilcles Tab
            await pageQuote.waitForSelector('select[name="VEH.0.veh_mdl_yr"]');

            var model_years = await pageQuote.evaluate(getSelctVal,"select[name='VEH.0.veh_mdl_yr']>option");
            var model_year = checkKeyVal('vehicles$0$year',dataObject);
            model_year = await pageQuote.evaluate(getValToSelect,model_years,model_year);
            await pageQuote.select("select[name='VEH.0.veh_mdl_yr']",model_year);

            dismissDialog(pageQuote);

            await pageQuote.waitFor(1500);
            var vehicles_make = await pageQuote.evaluate(getSelctVal,"select[name='VEH.0.veh_make']>option");
            var vehicle_make = checkKeyVal('vehicles$0$make',dataObject);
            vehicle_make = await pageQuote.evaluate(getValToSelect,vehicles_make,vehicle_make);
          await pageQuote.select('select[name="VEH.0.veh_make"]',vehicle_make);

          await pageQuote.waitFor(1500);
          var veh_mdl_names = await pageQuote.evaluate(getSelctVal,"select[name='VEH.0.veh_mdl_nam']>option");
            var veh_mdl_name = checkKeyVal('vehicles$0$model',dataObject);
            veh_mdl_name = await pageQuote.evaluate(getValToSelect,veh_mdl_names,veh_mdl_name);
          await pageQuote.select('select[name="VEH.0.veh_mdl_nam"]',veh_mdl_name);

          await pageQuote.waitFor(1500);
          var veh_styles = await pageQuote.evaluate(getSelctVal,"select[name='VEH.0.veh_sym_sel']>option");
            var veh_style = checkKeyVal('vehicles$0$body',dataObject);
            veh_style = await pageQuote.evaluate(getValToSelect,veh_styles,veh_style);
          await pageQuote.select('select[name="VEH.0.veh_sym_sel"]',veh_style);

          await pageQuote.waitFor(1500);
          await pageQuote.type('input[name="VEH.0.veh_grg_zip"]','vehicles$0$zipCode',{delay: 100});

          var veh_len_of_owns = await pageQuote.evaluate(getSelctVal,"select[name='VEH.0.veh_len_of_own']>option");
            var veh_len_of_own = checkKeyVal('vehicles$0$lengthOfOwnership',dataObject);
            veh_len_of_own = await pageQuote.evaluate(getValToSelect,veh_len_of_owns,veh_len_of_own);
          await pageQuote.select('select[name="VEH.0.veh_len_of_own"]',veh_len_of_own);

          var veh_uses = await pageQuote.evaluate(getSelctVal,"select[name='VEH.0.veh_use']>option");
            var veh_use = checkKeyVal('vehicles$0$primaryUse',dataObject);
            veh_use = await pageQuote.evaluate(getValToSelect,veh_uses,veh_use);
          await pageQuote.select('select[name="VEH.0.veh_use"]',veh_use);
          await pageQuote.select('select[name="prompt_sl_cross_sell"]','N');

          await pageQuote.waitFor(1500);
          await pageQuote.waitForSelector('select[name="VEH.0.veh_use_dlvry"]');
          await pageQuote.select('select[name="VEH.0.veh_use_dlvry"]','N');
          //await pageQuote.select('select[name="VEH.0.veh_carpool_cd"]','N');
          //await pageQuote.select('select[name="prompt_sl_cross_sell"]','N');

          await pageQuote.evaluate(()=>document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await FormStep3(browser,pageQuote,dataObject);
        }catch(err) {
            let response = {error:'there is some error validations at step 3'}
          dataObject.results.status = false;
          dataObject.results.response = response;
          console.log(dataObject,'final data');
        }
      }

      //For driver Form
      async function FormStep3(browser,pageQuote,dataObject){
        console.log('FormStep3');
        try{
          //For Drivers Tab
          await pageQuote.waitForSelector('input[name="DRV.0.drvr_frst_nam"]');
          await pageQuote.waitFor(600);

          var driver_firstName = checkKeyVal('drivrs$0$firstName',dataObject);
          await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_frst_nam')).value = text; }, "");
          await pageQuote.type("input[name='DRV.0.drvr_frst_nam']",driver_firstName, {preselect: true});

          var driver_lastName = checkKeyVal('drivrs$0$lastName',dataObject);
          await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_lst_nam')).value = text; }, "");
          await pageQuote.type("input[name='DRV.0.drvr_lst_nam']",driver_lastName, {preselect: true});

          var dob = checkKeyVal('drivrs$0$dateOfBirth',dataObject);
          await pageQuote.type('input[name="DRV.0.drvr_dob"]',dob,{delay: 500});
          await pageQuote.waitFor(600);


          //let text = '20/11/1980';
          //await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_dob')).value = text; }, text);
          //await pageQuote.type("input[name='DRV.0.drvr_dob']",text);

          var genders = await pageQuote.evaluate(getSelctVal,"select[name='DRV.0.drvr_sex']>option");
            var gender = checkKeyVal('drivrs$0$gender',dataObject);
            gender = await pageQuote.evaluate(getValToSelect,genders,gender);
          await pageQuote.waitFor(600);
          await pageQuote.click("select[name='DRV.0.drvr_sex']");
          await pageQuote.select("select[name='DRV.0.drvr_sex']",gender);


          var maritalStatus_s = await pageQuote.evaluate(getSelctVal,"select[name='DRV.0.drvr_mrtl_stat_map']>option");
            var maritalStatus = checkKeyVal('drivrs$0$maritalStatus',dataObject);
            maritalStatus = await pageQuote.evaluate(getValToSelect,maritalStatus_s,maritalStatus);
          await pageQuote.select("select[name='DRV.0.drvr_mrtl_stat_map']", maritalStatus);

          await pageQuote.waitFor(600);
          await pageQuote.select("select[name='DRV.0.drvr_lic_stat']",'V');
          await pageQuote.select("select[name='DRV.0.drvr_lic_stat']",'V');
          await pageQuote.waitFor(600);

          var drvr_years_lics = await pageQuote.evaluate(getSelctVal,"select[name='DRV.0.drvr_years_lic']>option");
            var drvr_years_lic = checkKeyVal('drivrs$0$maritalStatus',dataObject);
            drvr_years_lic = await pageQuote.evaluate(getValToSelect,drvr_years_lics,drvr_years_lic);
          await pageQuote.select("select[name='DRV.0.drvr_years_lic']");
          await pageQuote.waitFor(600);
          await pageQuote.select("select[name='DRV.0.drvr_years_lic']",drvr_years_lic);
          await pageQuote.waitFor(600);

          var drvr_empl_stats = await pageQuote.evaluate(getSelctVal,"select[name='DRV.0.drvr_empl_stat']>option");
            var drvr_empl_stat = checkKeyVal('drivrs$0$employment',dataObject);
            drvr_empl_stat = await pageQuote.evaluate(getValToSelect,drvr_empl_stats,drvr_empl_stat);
          await pageQuote.click("select[name='DRV.0.drvr_empl_stat']");
          await pageQuote.select("select[name='DRV.0.drvr_empl_stat']",drvr_empl_stat);
          await pageQuote.waitFor(600);

          //await pageQuote.select("select[name='DRV.0.drvr_occup_lvl']",'020');

          var drvr_ed_lvls = await pageQuote.evaluate(getSelctVal,"select[name='DRV.0.drvr_ed_lvl']>option");
            var drvr_ed_lvl = checkKeyVal('drivrs$0$education',dataObject);
            drvr_ed_lvl = await pageQuote.evaluate(getValToSelect,drvr_ed_lvls,drvr_ed_lvl);
          await pageQuote.select("select[name='DRV.0.drvr_ed_lvl']",drvr_ed_lvl);

          await pageQuote.waitFor(600);
          await pageQuote.click("select[name='DRV.0.drvr_fil_ind']");
          await pageQuote.select("select[name='DRV.0.drvr_fil_ind']",'N');
          await pageQuote.waitFor(600);

          await pageQuote.waitFor(600);
          await pageQuote.click("select[name='DRV.0.drvr_adv_trn_cd']");
          await pageQuote.select("select[name='DRV.0.drvr_adv_trn_cd']",'N');
          await pageQuote.waitFor(600);

          if(maritalStatus == 'M'){
            var driver_firstName = checkKeyVal('drivrs$1$firstName',dataObject);
            await pageQuote.evaluate((text) => { (document.getElementById('DRV.1.drvr_frst_nam')).value = text; }, "");
            await pageQuote.type("input[name='DRV.1.drvr_frst_nam']",driver_firstName, {preselect: true});

            var driver_lastName = checkKeyVal('drivrs$1$lastName',dataObject);
            await pageQuote.evaluate((text) => { (document.getElementById('DRV.1.drvr_lst_nam')).value = text; }, "");
            await pageQuote.type("input[name='DRV.1.drvr_lst_nam']",driver_lastName, {preselect: true});

            await pageQuote.waitFor(1500);
            var dob = checkKeyVal('drivrs$1$dateOfBirth',dataObject);
            await pageQuote.click('input[name="DRV.1.drvr_dob"]');

            await pageQuote.type('input[name="DRV.1.drvr_dob"]',dob,{delay: 100});
            await pageQuote.waitFor(1500);

            await pageQuote.waitFor(1500);
            var dob = checkKeyVal('drivrs$0$dateOfBirth',dataObject);
            await pageQuote.click('input[name="DRV.0.drvr_dob"]');

            await pageQuote.type('input[name="DRV.0.drvr_dob"]',dob,{delay:100});
            await pageQuote.waitFor(1500);


            //let text = '20/11/1980';
            //await pageQuote.evaluate((text) => { (document.getElementById('DRV.0.drvr_dob')).value = text; }, text);
            //await pageQuote.type("input[name='DRV.0.drvr_dob']",text);

            var genders = await pageQuote.evaluate(getSelctVal,"select[name='DRV.1.drvr_sex']>option");
              var gender = checkKeyVal('drivrs$1$gender',dataObject);
              gender = await pageQuote.evaluate(getValToSelect,genders,gender);
            await pageQuote.waitFor(1500);
            await pageQuote.click("select[name='DRV.1.drvr_sex']");
            await pageQuote.select("select[name='DRV.1.drvr_sex']",gender);


            var maritalStatus_s = await pageQuote.evaluate(getSelctVal,"select[name='DRV.1.drvr_mrtl_stat_map']>option");
              var maritalStatus = checkKeyVal('drivrs$0$maritalStatus',dataObject);
              maritalStatus = await pageQuote.evaluate(getValToSelect,maritalStatus_s,maritalStatus);
            await pageQuote.select("select[name='DRV.1.drvr_mrtl_stat_map']", maritalStatus);

            await pageQuote.waitFor(600);
            await pageQuote.select("select[name='DRV.1.drvr_lic_stat']",'V');

            await pageQuote.waitFor(1500);
            var drvr_years_lics = await pageQuote.evaluate(getSelctVal,"select[name='DRV.1.drvr_years_lic']>option");
              var drvr_years_lic = checkKeyVal('drivrs$1$maritalStatus',dataObject);
              drvr_years_lic = await pageQuote.evaluate(getValToSelect,drvr_years_lics,drvr_years_lic);
            await pageQuote.select("select[name='DRV.1.drvr_years_lic']");
            await pageQuote.waitFor(1500);
            await pageQuote.select("select[name='DRV.1.drvr_years_lic']",drvr_years_lic);
            await pageQuote.waitFor(1500);

            await pageQuote.select("select[name='DRV.1.drvr_stat_dsply']",'R');

            await pageQuote.waitFor(1500);
            var drvr_empl_stats = await pageQuote.evaluate(getSelctVal,"select[name='DRV.1.drvr_empl_stat']>option");
              var drvr_empl_stat = checkKeyVal('drivrs$1$employment',dataObject);
              drvr_empl_stat = await pageQuote.evaluate(getValToSelect,drvr_empl_stats,drvr_empl_stat);
            await pageQuote.click("select[name='DRV.1.drvr_empl_stat']");
            await pageQuote.select("select[name='DRV.1.drvr_empl_stat']",drvr_empl_stat);
            await pageQuote.waitFor(1500);

            //await pageQuote.select("select[name='DRV.0.drvr_occup_lvl']",'020');

            var drvr_ed_lvls = await pageQuote.evaluate(getSelctVal,"select[name='DRV.1.drvr_ed_lvl']>option");
              var drvr_ed_lvl = checkKeyVal('drivrs$1$education',dataObject);
              drvr_ed_lvl = await pageQuote.evaluate(getValToSelect,drvr_ed_lvls,drvr_ed_lvl);
            await pageQuote.select("select[name='DRV.1.drvr_ed_lvl']",drvr_ed_lvl);

            await pageQuote.waitFor(500);
            await pageQuote.click("select[name='DRV.1.drvr_fil_ind']");
            await pageQuote.select("select[name='DRV.1.drvr_fil_ind']",'N');
            await pageQuote.waitFor(500);

            await pageQuote.waitFor(500);
            await pageQuote.click("select[name='DRV.1.drvr_adv_trn_cd']");
            await pageQuote.select("select[name='DRV.1.drvr_adv_trn_cd']",'N');
            await pageQuote.waitFor(500);
          }

          await pageQuote.evaluate(()=>document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await FormStep4(browser,pageQuote,dataObject);

          }catch(err) {
              let response = {error:'there is some error validations at step 3'}
            dataObject.results.status = false;
            dataObject.results.response = response;
            console.log(dataObject,'final data');
          }
      }


      // For Violations Form
      async function FormStep4(browser,pageQuote,dataObject){
        console.log('FormStep4');

        try{
          await pageQuote.waitForSelector('select[name="DRV.0.VIO.0.drvr_viol_cd"]');
          //For Drivers Violations Tab
          let objArr = requestBody();

          var drvr_viol_cdS = await pageQuote.evaluate(getSelctVal,"select[name='DRV.0.VIO.0.drvr_viol_cd']>option");
            var drvr_viol_cd = checkKeyVal('priorIncident',dataObject);
            drvr_viol_cd = await pageQuote.evaluate(getValToSelect,drvr_viol_cdS,drvr_viol_cd);
          await pageQuote.select("select[name='DRV.0.VIO.0.drvr_viol_cd']",drvr_viol_cd);

          var prior_incident_date = checkKeyVal('priorIncidentDate',dataObject);
          await pageQuote.click('input[name="DRV.0.VIO.0.drvr_viol_dt_dsply"]');
          await pageQuote.type('input[name="DRV.0.VIO.0.drvr_viol_dt_dsply"]',prior_incident_date,{delay: 200});

          if(await pageQuote.$("select[name='DRV.1.VIO.0.drvr_viol_cd']") !== null){
            await pageQuote.select("select[name='DRV.1.VIO.0.drvr_viol_cd']",drvr_viol_cd);

            await pageQuote.click('input[name="DRV.1.VIO.0.drvr_viol_dt_dsply"]');
            await pageQuote.type('input[name="DRV.1.VIO.0.drvr_viol_dt_dsply"]',prior_incident_date,{delay: 200});
          }

          await pageQuote.evaluate(()=>document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await FormStep5(browser,pageQuote,dataObject);
        }catch(err) {
            let response = {error:'there is some error validations at step 4'}
          dataObject.results.status = false;
          dataObject.results.response = response;
          console.log(dataObject,'final data');
        }
      }

      //For Underwriting Form
      async function FormStep5(browser,pageQuote,dataObject){
        console.log('FormStep5');
        dataObject.results = {};

        try{
          //For Underwriting Tab
          await pageQuote.waitForSelector('select[name="prir_ins_ind"]');
          await pageQuote.select('select[name="prir_ins_ind"]','Y');
          await pageQuote.waitFor(1500);
          await pageQuote.select('select[name="prir_bi_lim"]','2');
          await pageQuote.waitFor(1500);

          //await pageQuote.click('input[name="prir_ins_eff_dt"]');
          //await pageQuote.type('input[name="prir_ins_eff_dt"]','01/01/2017',{delay: 100});
          //await pageQuote.waitFor(2000);

          var priorPolicyTerminationDate = checkKeyVal('priorPolicyTerminationDate',dataObject);

          await pageQuote.waitFor(1500);
          await pageQuote.click('input[name="prev_ins_expr_dt"]');
          await pageQuote.type('input[name="prev_ins_expr_dt"]',priorPolicyTerminationDate,{delay: 200});

          await pageQuote.waitFor(1500);
          await pageQuote.select('select[name="pop_len_most_recent_carr_insd"]','D');
          await pageQuote.select('select[name="excess_res_nbr"]','2');
          await pageQuote.select('select[name="hm_own_ind"]','R');
          await pageQuote.select('select[name="hm_own_ind"]','R');
          await pageQuote.waitFor(1500);
          await pageQuote.select('select[name="pol_renters_prir_bi_lim_code"]','2');
          await pageQuote.waitFor(2500);
          await pageQuote.select('select[name="multi_pol_ind"]','N');

          var policy_effective_date = checkKeyVal('policyEffectiveDate',dataObject);
          await pageQuote.waitFor(2000);
          await pageQuote.click('input[name="prir_ins_eff_dt"]');
          await pageQuote.type('input[name="prir_ins_eff_dt"]',policy_effective_date,{delay: 200});
          await pageQuote.waitFor(1500);


          await pageQuote.waitFor(1000);
          await pageQuote.click('input[name="prev_ins_expr_dt"]');
          await pageQuote.type('input[name="prev_ins_expr_dt"]',priorPolicyTerminationDate,{delay: 200});

          await pageQuote.evaluate(()=>document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          await FormStep6(browser,pageQuote,dataObject);
        }catch(err) {
            let response = {error:'there is some error validations at step 5'}
          dataObject.results.status = false;
          dataObject.results.response = response;
          console.log(dataObject,'final data');
        }
      }

      async function FormStep6(browser,pageQuote,dataObject){
        await pageQuote.evaluate(()=>document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
        dismissDialog(pageQuote);
        await FormStep6point1(browser,pageQuote,dataObject);
      }


      //Collect final result values
      async function FormStep6point1(browser,pageQuote,dataObject){
        dismissDialog(pageQuote);

        dataObject.results = {};
        try {
          await pageQuote.waitFor(2500);
            await pageQuote.waitForSelector('select[name="VEH.0.BIPD"]');
          await finalStep(browser,pageQuote,dataObject);
        }catch(err) {
          try{
            await pageQuote.click('input[name="ctl00$ContentPlaceHolder1$InsuredRemindersDialog$InsuredReminders$btnOK"]');
            await finalOutputFromAnotherPage(browser,pageQuote,dataObject);
          }catch(e){
            let response = {error:'there is some error validations'}
            dataObject.results.status = false;
            dataObject.results.response = response;
            console.log(dataObject,'final data');
          }
        }
      }

      async function finalOutputFromAnotherPage(browser,pageQuote,dataObject){
            let down_payment = await pageQuote.evaluate(()=>{

                let Elements = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.querySelectorAll('td')
                let ress = {};
            ress.total_premium = Elements[2].textContent;
            ress.down_pmt_amt = Elements[3].textContent;
            ress.term = Elements[1].textContent;

                let previousElement = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.previousElementSibling;
                while(true){
                  if(previousElement.querySelector('th')) {
                    ress.plan = previousElement.querySelector('th').textContent;
                    break;
                  }
                  if(previousElement.previousElementSibling.tagName == 'TR'){
                 previousElement = previousElement.previousElementSibling
                  }else{
                    break;
                  }
                }
            return ress;
          });

          dataObject.results = {};

          dataObject.results.status = true;
          dataObject.results.response = down_payment;
          //console.log(dataObject,'final data');
      }

      async function finalStep(browser,pageQuote){
        console.log('final step');

        await pageQuote.waitForSelector('select[name="VEH.0.BIPD"]');

        let bipd = '191006-200103';
        await pageQuote.select('select[name="VEH.0.COMP"]',bipd);

        await pageQuote.waitFor(2000);
        let comp = '210106';
        await pageQuote.select('select[name="VEH.0.COMP"]',comp);

        await pageQuote.waitFor(2000);
        let coll = '210303';
        await pageQuote.select('select[name="VEH.0.COLL"]',coll);
        await pageQuote.waitFor(2000);

        await pageQuote.click('#tot_pol_prem-button');


        let down_payment = await pageQuote.evaluate(()=>{
              let ress = {};

          ress.total_premium=document.querySelector('#tot_pol_prem').textContent;
          ress.down_pmt_amt=document.querySelector('#down_pmt_amt').textContent;
          ress.term=document.querySelector('#pol_term_cnt > option[selected]').textContent;
          ress.plan=document.querySelector('#pmt_optn_desc_presto > option[selected]').textContent;
          return ress;

        });

        dataObject.results = {};

        dataObject.results.status = true;
        dataObject.results.response = down_payment;
        console.log(dataObject,'final data');
      }


      //For dimiss alert dialog
      function dismissDialog(page){
            try{
          page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss();
            await browser.close();
          });
        }catch(e){
        }
      }

      //For get all select options texts and values
      function getSelctVal(inputID){
          optVals = [];

        document.querySelectorAll(inputID).forEach(opt => {
             optVals.push({name:opt.innerText,value:opt.value});
          });

          return optVals;
      }

      //For select particular value in dropdown
      function getValToSelect(data,val_to_select){
        var selected = "";
          data.forEach(function(entry) {
            if(val_to_select.toLowerCase() == entry.name.toLowerCase()){
              selected = entry.value;
          }
        });

        return selected;
      }


      // Request Body
      function requestBody(){
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
                    lengthOfOwnership: "At least 1 year but less than 3 years",
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
            policyEffectiveDate: "01/01/2018",
            priorPolicyTerminationDate: "03/15/2019",
            yearsWithPriorInsurance: "5 years or more",
            ownOrRentPrimaryResidence: "Rent",
            numberOfResidentsInHome: "2",
            rentersLimits: "Greater Than 300,000",
            haveAnotherProgressivePolicy: "No"
            // Final task is to be able to change the Vehicle Coverages and then hit recalc next to Total Premium at bottom then retrieve new rate
        },{
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
                    lengthOfOwnership: "At least 1 year but less than 3 years",
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
            policyEffectiveDate: "01/01/2018",
            priorPolicyTerminationDate: "03/15/2019",
            yearsWithPriorInsurance: "5 years or more",
            ownOrRentPrimaryResidence: "Rent",
            numberOfResidentsInHome: "2",
            rentersLimits: "Greater Than 300,000",
            haveAnotherProgressivePolicy: "No"
            // Final task is to be able to change the Vehicle Coverages and then hit recalc next to Total Premium at bottom then retrieve new rate
        }];

        return Client;
      }

      req.session.data = {
        title: "Progressive DE Rate Retrieved Successfully",
        obj: dataObject.results.response
      };

      return next();
    } catch(error) {
      return next(Boom.badRequest('Error retrieving progressive DE rate'));
    }
  }
}; */


/**
 *
 * New Code
 *
 */

const Boom = require('boom');
const puppeteer = require('puppeteer');
const { rater } = require('../constants/appConstant');

module.exports = {
  rateDelaware: async (req,res,next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      // const browser = await puppeteer.launch({ headless:false });
      let page = await browser.newPage();

      // Request input data
      /* const bodyData = {
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
            body: 'EXT CAB (8CYL 4x2)',
            zipCode: '19934',
            lengthOfOwnership: 'At least 1 year but less than 3 years',
            primaryUse: 'Commute',
          },
          {
            vehicleVin: 'KMHDH6AE1DU001708',
            year: '2013',
            make: 'HYUNDAI',
            model: 'ELANTRA',
            body: '2DR 4CYL',
            zipCode: '19934',
            lengthOfOwnership: '5 years or more',
            primaryUse: 'Commute',
          },
        ],
        drivers: [
          {
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '12/16/1993',
            gender: 'Male',
            applicantMaritalStatusCd: 'Married',
            yearsLicensed: '3 years or more',
            employment: 'Student (full-time)',
            education: 'College Degree',
            relationship: 'Other',
          },
          {
            firstName: 'Tester',
            lastName: 'User',
            dateOfBirth: '12/18/1993',
            gender: 'Female',
            applicantMaritalStatusCd: 'Married',
            yearsLicensed: '3 years or more',
            employment: 'Student (full-time)',
            education: 'College Degree',
            relationship: 'Child',
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
      }; */

        const staticDetailsObj  = {
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
            education: 'College Degree',
            relationship: 'Other',
          }
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
      
      const bodyData = req.body.data;
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
              value: bodyData.phone.replace('-', '') || staticDetailsObj.phone
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
            const makeSelected = await page.evaluate(getValToSelect, makeDisplay, bodyData.vehicles[j].make);
            await page.select(`select[id='VEH.${j}.veh_make']`, makeSelected);
            await page.waitFor(500);

            const modelDisplay = await page.evaluate(getSelctVal, `select[id='VEH.${j}.veh_mdl_nam']>option`);
            const modelSelected = await page.evaluate(getValToSelect, modelDisplay, bodyData.vehicles[j].model);
            await page.select(`select[id='VEH.${j}.veh_mdl_nam']`, modelSelected);
            await page.waitFor(500);

            const bodyDisplay = await page.evaluate(getSelctVal, `select[id='VEH.${j}.veh_sym_sel']>option`);
            let bodySelected = await page.evaluate(getValToSelect, bodyDisplay, bodyData.vehicles[j].vehicleBodyStyle);
            if(!bodySelected){
              bodySelected = bodyDisplay[0].name;
            }
            await page.select(`select[id='VEH.${j}.veh_sym_sel']`, bodySelected);

            const vehLenOfOwns = await page.evaluate(getSelctVal, `${populatedData[`vehicleLengthOfOwnership${j}`].element}>option`);
            const vehLenOfOwn = await page.evaluate(getValToSelect, vehLenOfOwns, populatedData[`vehicleLengthOfOwnership${j}`].value);
            await page.select(populatedData[`vehicleLengthOfOwnership${j}`].element, vehLenOfOwn);

            const vehUses = await page.evaluate(getSelctVal, `${populatedData[`vehiclePrimaryUse${j}`].element}>option`);
            const vehUse = await page.evaluate(getValToSelect, vehUses, populatedData[`vehiclePrimaryUse${j}`].value);
            await page.select(populatedData[`vehiclePrimaryUse${j}`].element, vehUse);
          }
          await page.waitFor(2000);
          await page.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
        } catch (err) {
          console.log('err vehicleStep:', err);
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
              // const addElement = await page.click('[id="DRV.0.add"]');
              // await addElement.click();
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
                element: 'DRV.0.drvr_mid_nam',
                value: bodyData.drivers[j].middleName || staticDetailsObj.drivers[0].middleName,
              },
              {
                element: `DRV.${j}.drvr_lst_nam`,
                value: bodyData.drivers[j].lastName || staticDetailsObj.drivers[0].lastName,
              },
              {
                element: `DRV.${j}.drvr_sfx_nam`,
                value: 'SR',
              },
              // {
              //   element: `DRV.${j}.drvr_dob`,
              //   value: bodyData.drivers[j].dateOfBirth || '',
              // },

            ];
            // console.log('driver >>>',driver);
            await page.evaluate((driverElement) => {
              driverElement.forEach((oneElement) => {
                // console.log(JSON.stringify(oneElement));
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
              // await page.select(populatedData[`driverRelationship${j}`].element);
              await page.select(populatedData[`driverRelationship${j}`].element, drvrRelationship);
              // await page.waitFor(600);
            }

            // await page.waitFor(600);
            await page.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);
            // await page.waitFor(600);

            const drvrYearsLics = await page.evaluate(getSelctVal, `${populatedData[`driverYearsLicensed${j}`].element}>option`);
            const drvrYearsLic = await page.evaluate(getValToSelect, drvrYearsLics, populatedData[`driverYearsLicensed${j}`].value);
            await page.select(populatedData[`driverYearsLicensed${j}`].element);
            // await page.waitFor(600);
            await page.select(populatedData[`driverYearsLicensed${j}`].element, drvrYearsLic);
            await page.waitFor(600);

            await page.select(populatedData[`driverStatus${j}`].element, populatedData[`driverStatus${j}`].value);

            await page.waitFor(600);
            const drvrEmplStats = await page.evaluate(getSelctVal, `${populatedData[`driverEmployment${j}`].element}>option`);
            const drvrEmplStat = await page.evaluate(getValToSelect, drvrEmplStats, populatedData[`driverEmployment${j}`].value);
            await page.waitFor(300);

            await page.click(populatedData[`driverEmployment${j}`].element);
            await page.select(populatedData[`driverEmployment${j}`].element, drvrEmplStat);
            await page.waitFor(600);

            const drvrEdLvls = await page.evaluate(getSelctVal, `${populatedData[`driverEducation${j}`].element}>option`);
            const drvrEdLvl = await page.evaluate(getValToSelect, drvrEdLvls, populatedData[`driverEducation${j}`].value);
            await page.waitFor(300);
            await page.select(populatedData[`driverEducation${j}`].element, drvrEdLvl);

            // await page.waitFor(600);
            await page.click(populatedData[`driverStateFiling${j}`].element);
            await page.select(populatedData[`driverStateFiling${j}`].element, populatedData[`driverStateFiling${j}`].value);
            // await page.waitFor(600);

            await page.click(populatedData[`driverAdvTraining${j}`].element);
            await page.select(populatedData[`driverAdvTraining${j}`].element, populatedData[`driverAdvTraining${j}`].value);
            // await page.waitFor(600);
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
          // await pageQuote.select(populatedData.priorIncident0.element, drvrViolCd);

          const priorIncidentDate = populatedData.priorIncidentDate0.value;
          // await pageQuote.click(populatedData['priorIncidentDate0'].element);
          // await pageQuote.type(populatedData['priorIncidentDate0'].element, priorIncidentDate, { delay: 100 });

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
          //await pageQuote.waitFor(1500);

          //await pageQuote.select(populatedData.yearsWithPriorInsurance.element, populatedData.yearsWithPriorInsurance.value);

          await pageQuote.select(populatedData.numberOfResidentsInHome.element, populatedData.numberOfResidentsInHome.value);
          await pageQuote.waitFor(600);
          await pageQuote.select(populatedData.ownOrRentPrimaryResidence.element, populatedData.ownOrRentPrimaryResidence.value);
          await pageQuote.waitFor(600);
          await pageQuote.select(populatedData.ownOrRentPrimaryResidence.element, populatedData.ownOrRentPrimaryResidence.value);
          await pageQuote.waitFor(1200);
          await pageQuote.select(populatedData.rentersLimits.element, populatedData.rentersLimits.value);
          await pageQuote.waitFor(1000);
          await pageQuote.select(populatedData.haveAnotherProgressivePolicy.element, populatedData.haveAnotherProgressivePolicy.value);
          await pageQuote.waitFor(1500);

          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          // await pageQuote.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
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

      async function errorStep(pageQuote, dataObject){
        try{
          console.log('errorStep');
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('#V_GET_ERROR_MESSAGE', { timeout: 4000 })
          const response = { error: 'There is some error in data' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        catch(e){
          await coveragesStep(pageQuote, dataObject);
        }
      }

      async function coveragesStep(pageQuote, dataObject) {
        console.log('coveragesStep');
        await pageQuote.waitFor(3000);
        await pageQuote.waitForSelector('#pol_ubi_exprnc');
        await pageQuote.select('#pol_ubi_exprnc','N');
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
        
      }
      console.log('final result >> ', JSON.stringify(bodyData.results));
      req.session.data = {
        title: 'Progressive DE Rate Retrieved Successfully',
        obj: bodyData.results,
      };
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
            value:'N',
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
            value: bodyData.numberOfResidentsInHome || '2',
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

            if (element.relationship) {
              clientInputSelect[`driverRelationship${j}`] = {
                element: `select[name='DRV.${j}.drvr_rel_desc_cd']`,
                value: element.relationship || staticDetailsObj.drivers[0].relationship,
              };
            }

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
      return next(Boom.badRequest('Error retrieving progressive DE rate'));
    }
  },
  rateAlabama: async (req, res, next) => {
    try {
      const { username, password } = req.body.decoded_vendor;
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      let page = await browser.newPage();

      // Request input data
      /* const bodyData = {
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
        priorInsurance: 'Yes',
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
          },
          {
            vehicleVin: 'KMHDH6AE1DU001708',
            vehicleModelYear: '2013',
            vehicleManufacturer: 'HYUNDAI',
            vehicleModel: 'ELANTRA',
            vehicleBodyStyle: '2DR 4CYL',
            applicantPostalCd: '35005',
            lengthOfOwnership: '5 years or more',
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
            education: 'College Degree',
          },
          {
            firstName: 'Tester',
            lastName: 'User',
            applicantBirthDt: '12/18/1993',
            applicantGenderCd: 'Female',
            applicantMaritalStatusCd: 'Married',
            driverLicensedDt: '3 years or more',
            employment: 'Student (full-time)',
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
      }; */
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
        priorInsurance: 'Yes',
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
          }
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
            education: 'College Degree',
          }
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
      const bodyData = req.body.data;
      bodyData.results = {};

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
            elementId: 'pol_eff_dt',
            element: 'input[name="pol_eff_dt"]',
            value: bodyData.policyEffectiveDate || staticDetailsObj.policyEffectiveDate,
          },
          priorInsuredCdInd: {
            element: 'select[name="prir_ins_cd_insd"]',
            value: 'C',
          },
          priorBiLimits: {
            element: 'select[name="prir_bi_lim"]',
            value: '3',
          },
          yearsWithPriorInsurance: {
            element: 'select[name="pop_len_most_recent_carr_insd"]',
            value: 'D',
          },
          numberOfResidentsInHome: {
            element: 'select[name="excess_res_nbr"]',
            value: bodyData.numberOfResidentsInHome || '2',
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
            clientInputSelect[`vehicleUsedForRideshare${j}`] = {
              element: `select[name="VEH.${j}.veh_trnspr_ntwk_co_cd"]`,
              value: 'N',
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

            if (element.relationship) {
              clientInputSelect[`driverRelationship${j}`] = {
                element: `select[name='DRV.${j}.drvr_rel_desc_cd']`,
                value: element.relationship || staticDetailsObj.drivers[0].relationship,
              };
            }

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

          //await pageQuote.select(populatedData.suffixName.element, populatedData.suffixName.value);
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
            const modelYear = await pageQuote.evaluate(getValToSelect, modelYears, populatedData[`vehicleYear${j}`].value);
            await pageQuote.select(populatedData[`vehicleYear${j}`].element, modelYear);

            dismissDialog(pageQuote);

            await pageQuote.waitFor(1200);
            const vehiclesMake = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleMake${j}`].element}>option`);
            const vehicleMake = await pageQuote.evaluate(getValToSelect, vehiclesMake, populatedData[`vehicleMake${j}`].value);
            await pageQuote.select(populatedData[`vehicleMake${j}`].element, vehicleMake);

            await pageQuote.waitFor(1200);
            const vehMdlNames = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleModel${j}`].element}>option`);
            const vehMdlName = await pageQuote.evaluate(getValToSelect, vehMdlNames, populatedData[`vehicleModel${j}`].value);
            await pageQuote.select(populatedData[`vehicleModel${j}`].element, vehMdlName);

            await pageQuote.waitFor(1200);
            const vehStyles = await pageQuote.evaluate(getSelectValues, `${populatedData[`vehicleBody${j}`].element}>option`);
            let vehStyle = await pageQuote.evaluate(getValToSelect, vehStyles, populatedData[`vehicleBody${j}`].value);
            if(!vehStyle){
              vehStyle = vehStyles[0].name;
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
            await pageQuote.waitForSelector(populatedData[`driverFirstName${j}`].element);
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

            if (populatedData[`driverRelationship${j}`]) {
              const drvrRelationships = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverRelationship${j}`].element}>option`);
              const drvrRelationship = await pageQuote.evaluate(getValToSelect, drvrRelationships, populatedData[`driverRelationship${j}`].value);
              await pageQuote.select(populatedData[`driverRelationship${j}`].element);
              await pageQuote.select(populatedData[`driverRelationship${j}`].element, drvrRelationship);
              await pageQuote.waitFor(600);
            }

            // await pageQuote.waitFor(600);
            await pageQuote.select(populatedData[`driverLicenseStatus${j}`].element, populatedData[`driverLicenseStatus${j}`].value);
            // await pageQuote.waitFor(600);

            const drvrYearsLics = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverYearsLicensed${j}`].element}>option`);
            const drvrYearsLic = await pageQuote.evaluate(getValToSelect, drvrYearsLics, populatedData[`driverYearsLicensed${j}`].value);
            await pageQuote.waitFor(600);
            await pageQuote.select(populatedData[`driverYearsLicensed${j}`].element, drvrYearsLic);
            // await pageQuote.waitFor(600);

            await pageQuote.select(populatedData[`driverStatus${j}`].element, populatedData[`driverStatus${j}`].value);

             await pageQuote.waitFor(600);
            const drvrEmplStats = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverEmployment${j}`].element}>option`);
            const drvrEmplStat = await pageQuote.evaluate(getValToSelect, drvrEmplStats, populatedData[`driverEmployment${j}`].value);
            await pageQuote.waitFor(600);
            await pageQuote.select(populatedData[`driverEmployment${j}`].element, drvrEmplStat);
             await pageQuote.waitFor(600);

            const drvrEdLvls = await pageQuote.evaluate(getSelectValues, `${populatedData[`driverEducation${j}`].element}>option`);
            const drvrEdLvl = await pageQuote.evaluate(getValToSelect, drvrEdLvls, populatedData[`driverEducation${j}`].value);
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
          await pageQuote.select(populatedData.numberOfResidentsInHome.element, populatedData.numberOfResidentsInHome.value);
          await pageQuote.select(populatedData.ownOrRentPrimaryResidence.element, populatedData.ownOrRentPrimaryResidence.value);
          await pageQuote.waitFor(1000);
          await pageQuote.select(populatedData.rentersLimits.element, populatedData.rentersLimits.value);
          await pageQuote.waitFor(500);
          await pageQuote.select(populatedData.haveAnotherProgressivePolicy.element, populatedData.haveAnotherProgressivePolicy.value);
          // await pageQuote.waitFor(1000);

          await pageQuote.evaluate(() => document.querySelector('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue').click());
          //await pageQuote.evaluate(() => document.querySelector('#ctl00_MenuPlaceholder_ctl00_mainMenun6 > table > tbody > tr > td > a').click());
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

      async function errorStep(pageQuote, dataObject){
        try{
          console.log('errorStep');
          await pageQuote.waitFor(2000);
          await pageQuote.waitForSelector('#V_GET_ERROR_MESSAGE', { timeout: 4000 })
          const response = { error: 'There is some error in data' };
          dataObject.results = {
            status: false,
            response,
          };
        }
        catch(e){
          await coveragesStep(pageQuote, dataObject);
        }
      }

      async function coveragesStep(pageQuote, dataObject) {
        console.log('coveragesStep');
        await pageQuote.waitFor(2000);
        await pageQuote.waitForSelector('#pol_ubi_exprnc');
        await pageQuote.select('#pol_ubi_exprnc','N');
        await pageQuote.click('#ctl00_NavigationButtonContentPlaceHolder_buttonContinue');
        await processDataStep(pageQuote, dataObject);

      }

      async function processDataStep(pageQuote, dataObject) {
        console.log('processDataStep');
        await pageQuote.waitFor(6000)
        const downPayment = await pageQuote.evaluate(() => {
          const Elements = document.querySelector('td>input[type="radio"]:checked').parentNode.parentNode.querySelectorAll('td');
          const ress = {};
          ress.total_premium = Elements[2].textContent.replace(/\n/g, '').trim();
          ress.down_pmt_amt = Elements[3].textContent.replace(/\n/g, '').trim();
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
      }

      // login
      await loginStep();

      console.log('final result >> ', JSON.stringify(bodyData.results));
      req.session.data = {
        title: 'Progressive AL Rate Retrieved Successfully',
        obj: bodyData.results,
      };

      return next();
    } catch (error) {
      console.log('error >> ', error);
      return next(Boom.badRequest('Error retrieving progressive AL rate'));
    }
  },
};
