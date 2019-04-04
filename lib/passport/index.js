const jwt = require('jsonwebtoken');
const vendorModel = require('../../models/vendor');

module.exports = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      await jwt.verify(token, 'secret', async (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            errorType: 6,
            data: "user",
            message: 'Failed to authenticate token.'
          });
        } else if (!decoded) {
          return res.json({
            success: false,
            errorType: 6,
            data: "user",
            message: 'Unauthorized user.'
          });
        } else {
          // console.log('decoded ??' ,decoded);
          let companyId = 0;
          if(req.body.vendorName === 'QQ' || req.body.vendorName === 'RATER') {
            companyId = decoded.user.companyUserId; 
          }
          if(req.body.vendorName === 'SF') {
            companyId = decoded.client.companyClientId;
          }
          const vendor = await vendorModel.findOne({
            where: {
              companyId: companyId,
              vendorName: req.body.vendorName,
            }
          });
          if (!vendor) {
            return res.json({
              success: false,
              errorType: 6,
              data: "user",
              message: 'Unauthorized user.'
            });
          }
          req.body.decoded_vendor = vendor;
          req.body.decoded_user = decoded;
          next();
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        errorType: 6,
        data: "user",
        message: 'No token provided.'
      });
    }
  } catch (error) {
    console.log('error >> ', error);
    return next(error);
  }
};
