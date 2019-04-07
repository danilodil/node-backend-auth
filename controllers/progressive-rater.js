const Boom = require('boom');
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
        } else	if(typeof objInp == 'object'){
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
          return ress;		return ress;
      
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
};