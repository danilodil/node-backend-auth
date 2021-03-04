/* eslint-disable no-console */
require('dotenv').config();
if (process.env.NODE_ENV === 'production') {
  const tracer = require('dd-trace').init()
}
const compression = require('compression');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const appConfig = require('./lib/appConfig');
const appConstant = require('./constants/appConstant');
const { CONFIG } = require('./constants/configConstants');
const { sequelize } = require('./lib/db');

const sessionStore = new SequelizeStore({
  db: sequelize,
});

const index = require('./routes/index');

const app = express();
app.use(compression());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const { allowedOrigin } = appConstant;
  const { origin } = req.headers;
  if (allowedOrigin === origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'PUT, PATCH, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Handle request
app.use(session({
  store: sessionStore,
  secret: CONFIG.authSessionSecret,
  saveUninitialized: false, // don't create session until something stored,
  resave: false, // don't save session if unmodified
}));

// App Configs
app.use(appConfig.trimParams);

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.use('/api', index);

// Error handling
app.use(appConfig.handleError);
// Handle response
app.use(appConfig.handleSuccess);
// Handle response
app.use(appConfig.handle404);

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  // handle the error safely
  console.log('Inside uncaughtException');
  console.log(error);
  return error;
});

module.exports = app;
