require('dotenv').config();
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
const { sequelize } = require('./lib/db');

const sessionStore = new SequelizeStore({
  db: sequelize,
});

const index = require('./routes/index');

const app = express();

app.use(compression());
app.set('views', path.join(__dirname, './dist'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, './dist')));
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
  secret: 'secret',
  saveUninitialized: false, // don't create session until something stored,
  resave: false, // don't save session if unmodified
}));

// App Configs
app.use(appConfig.trimParams);

app.use('/api', index);

// Error handling
app.use(appConfig.handleError);
// Handle response
app.use(appConfig.handleSuccess);
// // Handle response
// app.use(appConfig.handle404);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});

app.use('*', (req, res) => {
  res.sendFile(__dirname, '/dist/index.html');
});

module.exports = app;
