const debug = require('debug')('xilo-auth:appConfig');
const async = require('async');

const url = req => `${req.protocol}://${req.get('host')}`;

exports.trimParams = (req, res, next) => {
  debug('API : ', `${url(req)}${req.url}`);
  // Trim query and post parameters
  async.each(req.body, (value, key) => {
    if (value && typeof value === 'string') {
      req.body[key] = value.trim();
    }
  });
  async.each(req.query, (value, key) => {
    if (value && typeof value === 'string') {
      req.query[key] = value.trim();
    }
  });

  debug('req.method : ', req.method);
  debug('req.body : ', req.body);
  debug('req.query : ', req.query);
  next();
};

exports.handleSuccess = (req, res, next) => {
  if (req.session.data === undefined) {
    debug('Return from undefined req.session.data ');
    return next();
  }
  const resObject = req.session.data || [];
  req.session.destroy();

  debug('Success response :: ');
  debug(resObject);
  return res.json(resObject);
};

exports.handleError = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  const errorResponse = {
    error: Object.assign({
      stack: err.stack,
    }, err.output && err.output.payload ? err.output.payload : err),
  };
  debug('Error stack :: ');
  debug(err.stack);
  const statusCode = err.output && err.output.statusCode ? err.output.statusCode : 500;
  return res.status(statusCode).json(errorResponse);
};
