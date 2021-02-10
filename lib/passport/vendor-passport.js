/* eslint-disable no-console */
const vendorModel = require('../../models/vendor');

module.exports = async (req, res, next) => {
  try {
    console.log('Vendor hit');
    const decoded = req.body.decoded_user;
    const { companyId } = decoded;
    console.log(companyId);
    let vendor = null;
    if (req.body.clientAgentId || (req.body.data && req.body.data.clientAgentId) || req.body.agent) {
      const agentId = req.body.data.clientAgentId || req.body.agent || req.body.clientAgentId;
      console.log('Before vendor 1');
      vendor = await vendorModel.findOne({
        where: {
          companyId,
          vendorName: req.body.vendorName,
          agentId,
        },
      });
      console.log('Before vendor 1', vendor);

    }

    if (!vendor) {
      console.log('Before vendor 2', CONFIG);
      vendor = await vendorModel.findOne({
        where: {
          companyId,
          vendorName: req.body.vendorName,
          agentId: null
        },
      });
      console.log('After vendor 2', vendor);
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
    console.log('ERRRORRRR: %o ', error);
    return next(error);
  }
};
