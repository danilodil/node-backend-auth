const ENVIRONMENT = require('./environment');

const nodeEnv = ENVIRONMENT.ENV;

if (nodeEnv === 'local') {
  exports.allowedOrigin = 'http://localhost:3000';
}
if (nodeEnv === 'development') {
  exports.allowedOrigin = '';
}
if (nodeEnv === 'production') {
  exports.allowedOrigin = 'https://api.xilo.io';
}

module.exports = {
  qqCatalyst: {
    AUTHORIZE_URL: 'https://login.qqcatalyst.com/oauth/authorize',
    CLIENT_ID: '96935486-9f62-469a-9062-46cb5864b5b0',
    CLIENT_SECRET: '33c64f80-da90-45d3-bd11-a39912019d96',
    ACCESS_TOKEN_URL: 'https://login.qqcatalyst.com/oauth/token',
    RESOURCE_URL: 'https://api.qqcatalyst.com',
    CALLBACK_URL: 'https://xilo-qq-test.herokuapp.com/callback',
  },
};
