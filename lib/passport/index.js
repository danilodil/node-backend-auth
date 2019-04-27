const jwt = require('jsonwebtoken');
const vendorModel = require('../../models/vendor');

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
      if (req.body.vendorName === 'QQ' || (req.body.vendorName === 'EZLYNX' && decoded.user)) {
        companyId = decoded.user.companyUserId;
      }
      if (req.body.vendorName === 'SF' || req.body.vendorName === 'RATER' || (req.body.vendorName === 'EZLYNX' && decoded.client) || req.body.vendorName === 'CSERATER') {
        companyId = decoded.client.companyClientId;
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
