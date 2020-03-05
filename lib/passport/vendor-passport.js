/* eslint-disable no-console */
const vendorModel = require('../../models/vendor');

module.exports = async (req, res, next) => {
  try {
    const decoded = req.body.decoded_user;
    let companyId = decoded.companyId;
    let vendor = null;
    if (req.body.data && req.body.data.clientAgentId) {
      vendor = await vendorModel.findOne({
        where: {
          companyId,
          vendorName: req.body.vendorName,
          agentId: req.body.data.clientAgentId,
        },
      });
    }

    if (!vendor) {
      vendor = await vendorModel.findOne({
        where: {
          companyId,
          vendorName: req.body.vendorName,
        },
      });
    }

    if (!vendor) {
      return res.json({
        success: false,
        errorType: 6,
        data: 'user',
        message: 'Unauthorized user.',
      });
    }
    req.body.decoded_vendor = vendor;
    return next();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
