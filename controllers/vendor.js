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
      for (let cond of ['state', 'carrier', 'agency', 'agentId']) {
        if (params[cond]) {
          findObject.where = params[cond];
        }
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
        agentId: params.agentId,
        accessToken: params.accessToken || '',
        state: params.state,
        carrier: params.carrier,
        agency: params.agency,
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
  upsert: async (req, res, next) => {
    try {
      const params = req.body;
      if (!params.companyId || (!params.username && !params.accessToken)) {
        return next(Boom.badRequest('Invalid data!'));
      }

      const findObject = {
        where: {
          vendorName: params.vendorName,
          companyId: params.companyId,
        },
      };

      if (params.agentId) {
        findObject.where.agentId = params.agentId;
      }

      const vendor = await vendorModel.findOne(findObject);

      if (!vendor) {
        const newVendor = await vendorModel.create({
          vendorName: params.vendorName,
          username: params.username,
          password: params.password,
          companyId: params.companyId,
          accessToken: params.accessToken || '',
          state: params.state,
          carrier: params.carrier,
          agentId: params.agentId,
          agency: params.agency,
        });

        req.session.data = {
          status: 'create',
          message: 'New vendor created successfully',
          newVendorID: newVendor.id,
        };
        return next();
      }

      const updateVendor = await vendor.update({
        vendorName: vendor.vendorName,
        username: params.username ? params.username : vendor.username,
        password: params.password ? params.password : vendor.password,
        companyId: vendor.companyId,
        accessToken: params.accessToken ? params.accessToken : vendor.accessToken,
        state: params.state ? params.state : vendor.state,
        carrier: params.carrier ? params.carrier : vendor.carrier,
        agentId: params.agentId ? params.agentId : vendor.agentId,
        agency: params.agency ? params.agency : vendor.agency,
      });

      req.session.data = {
        status: 'update',
        message: 'Vendor updated successfully',
        newVendorID: updateVendor.id,
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
  getVendorByCompanyId: async (req, res, next) => {
    try {
      const params = req.body;
      if (!params.companyId || !req.params.vendorName) {
        return next(Boom.badRequest('Invalid data!'));
      }

      const findObject = { 
      where: {
        companyId: params.companyId,
        vendorName: req.params.vendorName,
      }, exclude: 'password' };

      const vendor = await vendorModel.findOne(findObject);
      req.session.data = vendor;
      return next();
    } catch (error) {
      return next(Boom.badRequest('Something went wrong'))
    }
  },
};
