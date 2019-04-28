const jwt = require('jsonwebtoken');
const vendorModel = require('../../models/vendor');
const { vendorNames } = require('../../constants/appConstant');

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

      let companyId = 0;
      if (req.body.vendorName && vendorNames.user.indexOf(req.body.vendorName) > -1) {
        if (decoded.user && decoded.user.companyUserId) {
          companyId = decoded.user.companyUserId;          
        }
      }
      if (req.body.vendorName && vendorNames.client.indexOf(req.body.vendorName) > -1) {
        if (decoded.client && decoded.client.companyClientId) {
          companyId = decoded.client.companyClientId;
        }
      }
      const vendor = await vendorModel.findOne({
        where: {
          companyId,
          vendorName: req.body.vendorName,
        },
      });
      if (!vendor) {
        return res.json({
          success: false,
          errorType: 6,
          data: 'user',
          message: 'Unauthorized user.',
        });
      }
      req.body.decoded_vendor = vendor;
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
    console.log('error >> ', error);
    return next(error);
  }
};
