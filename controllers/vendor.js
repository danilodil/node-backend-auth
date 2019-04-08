const Boom = require('boom');

const vendorModel = require('../models/vendor');

module.exports = {
  create: async (req, res, next) => {
    try {
      const params = req.body;
      if (!params.companyId || !params.vendorName || !params.username) {
        return next(Boom.badRequest('Please send proper data!'));
      }

      const vendor = await vendorModel.findOne({
        where: {
          companyId: params.companyId,
          vendorName: params.vendorName,
        },
      });
      if (vendor) {
        return next(Boom.badRequest('Vendor already exists!'));
      }

      const newVendor = await vendorModel.create({
        vendorName: params.vendorName,
        username: params.username,
        password: params.password,
        companyId: params.companyId,
        salesforceAT: params.vendorName === 'SF' ? params.salesforceAT : '',
      });

      req.session.data = {
        message: 'New vendor created successfully',
        newVendorID: newVendor.id,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error creating vendor!'));
    }
  },
};
