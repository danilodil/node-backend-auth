const ENVIRONMENT = require('./environment');

const nodeEnv = ENVIRONMENT.ENV;
if (nodeEnv === 'local') {
  exports.allowedOrigin = 'http://localhost:3000';
}
if (nodeEnv === 'development') {
  exports.allowedOrigin = 'https://xilo-api-dev.herokuapp.com';
}
if (nodeEnv === 'production') {
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

exports.rater = {
  LOGIN_URL: 'https://www.foragentsonly.com/login/',
  NEW_QUOTE_URL: 'https://www.foragentsonly.com/newbusiness/newquote/',
};

exports.cseRater = {
  LOGIN_URL: 'https://spinn.csespi.com/innovation',
};

exports.nationalGeneralAlRater = {
  LOGIN_URL: 'https://www.natgenagency.com/',
  NEW_QUOTE_URL: 'https://www.natgenagency.com/MainMenu.aspx',
  NAMED_INSURED_URL: 'https://www.natgenagency.com/Quote/QuoteNamedInsured.aspx',
  DRIVERS_URL: 'https://www.natgenagency.com/Quote/QuoteDriver.aspx',
  VEHICLE_HISTORY_URL: 'https://www.natgenagency.com/Quote/QuoteAutoHistory.aspx',
  COVERAGES_URL: 'https://www.natgenagency.com/Quote/QuoteCoveragesV2.aspx',
  BILLPLANS_URL: 'https://www.natgenagency.com/Quote/QuoteBillPlans.aspx',
};

exports.vendorNames = {
  client: [
    'SF',
    'PROGRESSIVEDERATER',
    'PROGRESSIVEALRATER',
    'CSECARATER',
    'EZLYNX',
    'QQ',
    'NATIONALGENERALRATER',
  ],
  user: [
    'QQ',
    'EZLYNX',
  ],
};
