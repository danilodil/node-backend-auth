const ENVIRONMENT = require('./configConstants').CONFIG;

if (ENVIRONMENT.nodeEnv === 'local') {
  exports.allowedOrigin = 'http://localhost:3000';
}
if (ENVIRONMENT.nodeEnv === 'development') {
  exports.allowedOrigin = 'https://xilo-api-dev.herokuapp.com';
}
if (ENVIRONMENT.nodeEnv === 'production') {
  exports.allowedOrigin = 'https://api.xilo.io';
}

exports.qqCatalyst = {
  AUTHORIZE_URL: 'https://login.qqcatalyst.com/oauth/authorize',
  CLIENT_ID: '96935486-9f62-469a-9062-46cb5864b5b0',
  CLIENT_SECRET: '33c64f80-da90-45d3-bd11-a39912019d96',
  ACCESS_TOKEN_URL: 'https://login.qqcatalyst.com/oauth/token',
  RESOURCE_URL: 'https://api.qqcatalyst.com',
  CALLBACK_URL: 'https://xilo-qq-test.herokuapp.com/callback',
};

exports.ezLynx = {
  USERNAME: 'wxi_uploadPROD',
  PASSWORD: 'Cojoanin93',
  UPLOAD_PATH: 'https://services.ezlynx.com/EzLynxWebService/EzLynxFileUpload.asmx',
  USERNAME_DEV: 'xi_uploadUAT',
  PASSWORD_DEV: 'Cojoanin93',
  UPLOAD_PATH_DEV: 'https://uat.webcetera.com/EzLynxWebService/EzLynxFileUpload.asmx',
};

exports.progressiveRater = {
  LOGIN_URL: 'https://www.foragentsonly.com/login/',
  NEW_QUOTE_URL: 'https://www.foragentsonly.com/newbusiness/newquote/',
  SEARCH_QUOTE_URL: 'https://www.foragentsonly.com/newbusiness/quotesearch/',
  LOGIN_REATTEMPT: 2,
};

exports.stateAutoRater = {
  LOGIN_URL: 'https://empidn.stateauto.com/',
  NEW_QUOTE_URL: 'https://std-spa-personal.stateauto.com/auto/submission/customer-info/',
  SEARCH_QUOTE_URL: 'https://www.foragentsonly.com/newbusiness/quotesearch/',
  DRIVERS_URL: 'https://std-spa-personal.stateauto.com/auto/submission/drivers',
  LOGIN_REATTEMPT: 2,
};

exports.cseRater = {
  LOGIN_URL: 'https://spinn.csespi.com/innovation',
};

exports.nationalGeneralRater = {
  LOGIN_URL: 'https://www.natgenagency.com/',
  NEW_QUOTE_URL: 'https://www.natgenagency.com/MainMenu.aspx',
  NAMED_INSURED_URL: 'https://www.natgenagency.com/Quote/QuoteNamedInsured.aspx',
  DRIVERS_URL: 'https://www.natgenagency.com/Quote/QuoteDriver.aspx',
  VEHICLES_URL: 'https://www.natgenagency.com/Quote/QuoteAuto.aspx',
  VEHICLE_HISTORY_URL: 'https://www.natgenagency.com/Quote/QuoteAutoHistory.aspx',
  UNDERWRITING_URL: 'https://www.natgenagency.com/Quote/QuoteUW.aspx',
  COVERAGES_URL: 'https://www.natgenagency.com/Quote/QuoteCoveragesV2.aspx',
  BILLPLANS_URL: 'https://www.natgenagency.com/Quote/QuoteBillPlans.aspx',
};

exports.safecoRater = {
  LOGIN_URL: 'http://www.safeconow.com/',
  NEW_QUOTE_START_URL: 'https://now.agent.safeco.com/start/',
  NEW_QUOTE_START_NEWBUSINESS: 'https://safesite.safeco.com/personal/policyservice/NewBusinessMenu.aspx',
  NEW_QUOTE_START_AUTO_URL: 'https://safesite.safeco.com/personal/auto/policyinfo.aspx',
  NEW_QUOTE_START_HOME_URL: 'https://safesite.safeco.com/personal/Home/policyinfo.aspx',
  EXISTING_QUOTE_URL: 'https://safesite.safeco.com/client/ClientList.aspx',
};

exports.allStateRater = {
  LOGIN_URL: 'https://myconnection2.allstate.com/IA/Profile/RoleProfile',
};

exports.travelerRater = {
  LOGIN_URL: 'https://www.travelers.com/foragents',
};

exports.erieRater = {
  LOGIN_URL: 'https://www.agentexchange.com/',
  CUSTOMER_URL: 'https://www.agentexchange.com/Customer/PA',
};

exports.quoteRush = {
  UPLOAD_PATH: 'https://quoterush.com/Importer/Json/Import',
};

exports.turborater = {
  UPLOAD_PATH: 'https://www.inscontact.com/leads/leadhandler.ashx',
  UPLOAD_PATH_DEV: 'https://www.inscontact.com/leads/leadhandler.ashx',
  // UPLOAD_PATH_DEV: 'http://preview.agencybuzz.com/leads/leadhandler.ashx',
  ACC_NUM: 'XILO11',
};
exports.nowCerts = {
  AUTHENTICATE_URL: 'https://api.nowcerts.com/api/token',
  DRIVERS_URL: 'https://api.nowcerts.com/api/Driver/BulkInsertDriver',
  VEHICLES_URL: 'https://api.nowcerts.com/api/Vehicle/BulkInsertVehicle',
  INSURED_URL: 'https://api.nowcerts.com/api/Insured/Insert',
  PROPERTY_URL: 'https://api.nowcerts.com/api/Property/InsertOrUpdate',
};

exports.appulate = {
  UPLOAD_API_URL: 'https://appulate.com/api/uplink/upload',
};

exports.quoteUrl = {
  PROGRESSIVE: 'https://www.foragentsonly.com/login/',
  CSECA: 'https://spinn.csespi.com/innovation',
  NATIONALGENERAL: 'https://www.natgenagency.com/',
  SAFECO: 'http://www.safeconow.com/',
  ALLSTATE: 'https://myconnection2.allstate.com/IA/Profile/RoleProfile',
  TRAVELER: 'https://www.travelers.com/foragents',
  ERIE: 'https://www.agentexchange.com/',
};

exports.commercialEzlynx = {
  DEV_URL: 'https://uat.webcetera.com/ezlynxapi/api',
  DEV_USERNAME: 'xi_userUAT',
  DEV_PASSWORD: 'COjoanin93!123@',
  DEV_APP_SECRET: 'b700d95d-ea87-4c37-b2bc-0082c0d04450',
  PROD_URL: 'https://services.ezlynx.com/ezlynxapi/api',
  PROD_USERNAME: 'xi_userUAT',
  PROD_PASSWORD: 'COjoanin93!123@',
  PROD_APP_SECRET: 'b700d95d-ea87-4c37-b2bc-0082c0d04450',
}

exports.ams360 = {
  Version: 'v19119063201',
  AUTHENTICATE_URL: 'https://affwsapi.ams360.com/v2/service.asmx?op=Authenticate',
  CUSTOMER_URL: 'https://affwsapi.ams360.com/v2/service.asmx?op=InsertCustomer',
};
