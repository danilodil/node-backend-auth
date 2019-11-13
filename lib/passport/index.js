/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      const decoded = await jwt.verify(token, 'secret');

      if (!decoded) {
        return res.json({
          success: false,
          errorType: 6,
          data: 'user',
          message: 'Unauthorized user.',
        });
      }
      req.body.decoded_user = decoded;
      return next();
    }

    return res.status(403).send({
      success: false,
      errorType: 6,
      data: 'user',
      message: 'No token provided.',
    });
  } catch (error) {
    return next(error);
  }
};
