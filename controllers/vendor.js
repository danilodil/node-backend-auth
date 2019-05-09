const Boom = require('boom');

const vendorModel = require('../models/vendor');

module.exports = {
  create: async (req, res, next) => {
    try {
      const params = req.body;
      if (!params.companyId || !params.vendorName || !params.username) {
        return next(Boom.badRequest('Invalid data!'));
      }

      const findObject = { where: {} };

      findObject.where.companyId = params.companyId;
      findObject.where.vendorName = params.vendorName;

      if (params.vendorName === 'PROGRESSIVEDERATER' || params.vendorName === 'PROGRESSIVEALRATER') {
        findObject.where.state = params.state;
        findObject.where.carrier = params.carrier;
      }

      const vendor = await vendorModel.findOne(findObject);

      if (vendor) {
        return next(Boom.badRequest('Vendor already exists!'));
      }

      const newVendor = await vendorModel.create({
        vendorName: params.vendorName,
        username: params.username,
        password: params.password,
        companyId: params.companyId,
        salesforceAT: params.salesforceAT || '',
        state: params.state,
        carrier: params.carrier,
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
  update: async (req, res, next) => {
    try {
      const params = req.body;
      if (!params.companyId || !params.username || !params.password) {
        return next(Boom.badRequest('Invalid data!'));
      }

      const findObject = {
        where: {
          vendorName: req.params.vendorName,
          companyId: params.companyId,
        },
      };

      const vendor = await vendorModel.findOne(findObject);

      if (!vendor) {
        return next(Boom.badRequest('Vendor does not exists!'));
      }

      const updateVendor = await vendor.update({
        vendorName: vendor.vendorName,
        username: params.username ? params.username : vendor.username,
        password: params.password ? params.password : vendor.password,
        companyId: vendor.companyId,
        salesforceAT: params.salesforceAT ? params.salesforceAT : vendor.salesforceAT,
        state: vendor.state,
        carrier: vendor.carrier,
      });

      req.session.data = {
        message: 'Vendor updated successfully',
        updateVendorID: updateVendor,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error updating vendor!'));
    }
  },
  getAll: async (req, res, next) => {
    try {
      const params = req.body;
      if (!params.companyId) {
        return next(Boom.badRequest('Invalid data!'));
      }

      console.log(params.companyId);

      const findObject = {
        where: {
          companyId: params.companyId,
        },
        attributes: ['id', 'vendorName'],
      };

      const vendors = await vendorModel.findAll(findObject);

      if (!vendors) {
        return next(Boom.badRequest('Vendor does not exists!'));
      }

      req.session.data = {
        message: 'Vendors get successfully',
        vendors,
      };
      return next();
    } catch (error) {
      return next(Boom.badRequest('Error get vendor!'));
    }
  },
};
