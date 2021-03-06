/* eslint-disable no-console */
const vendorModel = require('../../models/vendor');
const { CONFIG } = require('../../constants/configConstants');
module.exports = async (req, res, next) => {
  try {
    const decoded = req.body.decoded_user;
    const { companyId } = decoded;
    let vendor = null;
    if (req.body.clientAgentId || (req.body.data && req.body.data.clientAgentId) || req.body.agent) {
      const agentId = req.body.data.clientAgentId || req.body.agent || req.body.clientAgentId;
      vendor = await vendorModel.findOne({
        where: {
          companyId,
          vendorName: req.body.vendorName,
          agentId,
        },
      });
    }

    if (!vendor) {
      vendor = await vendorModel.findOne({
        where: {
          companyId,
          vendorName: req.body.vendorName,
          agentId: null
        },
      });
    }

    console.log(vendor.username);

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
    return next(error);
  }
};
