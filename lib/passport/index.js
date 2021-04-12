/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const { CONFIG } = require('../../constants/configConstants');

module.exports = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      console.log('###TKN###: ', token)
      const decoded = await jwt.verify(token, CONFIG.authSecret);

      if (!decoded) {
        return res.json({
          success: false,
          errorType: 6,
          data: 'user',
          message: 'Unauthorized user.',
        });
      }
      req.body.decoded_user = decoded;
      if (decoded.user) {
        req.body.decoded_user.companyId = decoded.user.companyUserId;
      } else if (decoded.agent) {
        req.body.decoded_user.companyId = decoded.agent.companyAgentId;
      } else if (decoded.client) {
        req.body.decoded_user.companyId = decoded.client.companyClientId;
      }

      console.log(req.body.decoded_user.companyId)

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
