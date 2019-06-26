/* eslint-disable radix, no-param-reassign */

const Boom = require('boom');
const Rater = require('../models/rater');

module.exports = {
  saveRating: async (req, res, next) => {
    console.log(req.body.vendorName, req.session.data);
    if (!req.session.data) {
      return next();
    }
    console.log(`${req.body.vendorName}: Saving Rate`);

    let companyId = null;
    let clientId = null;
    const currentUser = req.body.decoded_user;
    if (currentUser.user) {
      companyId = currentUser.user.companyUserId;
      clientId = currentUser.user.id;
    }
    if (currentUser.client) {
      companyId = currentUser.client.companyClientId;
      clientId = currentUser.client.id;
    }
    if (!companyId && !clientId) {
      return next(Boom.badRequest('Invalid Data'));
    }

    const existRater = {
      where: {
        companyId,
        clientId,
        vendorName: req.body.vendorName,
      },
    };

    const raterData = await Rater.findOne(existRater);
    /* create new rater result */
    const isSucceeded = (req.session.data && req.session.data.status && req.session.data.totalPremium) ? true : false;
    if (!raterData) {
      const newRater = {
        companyId,
        clientId,
        vendorName: req.body.vendorName,
        succeeded: isSucceeded,
        totalPremium: req.session.data.totalPremium || null,
        months: req.session.data.months || null,
        downPayment: req.session.data.downPayment || null,
        error: req.session.data.error || null,
        quoteId: req.session.data.quoteId || null,
        stepResult: req.session.data.stepResult || null,
      };
      await Rater.create(newRater);
      console.log(`${req.body.vendorName} Rater Created:`, newRater);
    }

    /* update rater result */
    const updateObj = {
      stepResult: req.session.data.stepResult || null,
      quoteId: req.session.data.quoteId || null,
    };
    if (raterData && req.session.data.totalPremium && req.session.data.status) {
      updateObj.totalPremium = req.session.data.totalPremium;
      updateObj.months = req.session.data.months;
      updateObj.downPayment = req.session.data.downPayment;
      updateObj.succeeded = true;
      updateObj.error = null;
      await raterData.update(updateObj);
      console.log(`${req.body.vendorName} Rater Updated:`, updateObj);
    }

    return next();
  },
  getBestRating: async (req, res, next) => {
    console.log(`${req.body.vendorName}: Inside Get Best Rate`);
    try {
      const currentUser = req.body.decoded_user;
      let companyId = null;
      let clientId = null;
      if (currentUser.user) {
        companyId = currentUser.user.companyUserId;
        clientId = currentUser.user.id;
      }
      if (currentUser.client) {
        companyId = currentUser.client.companyClientId;
        clientId = currentUser.client.id;
      }

      if (!companyId || !clientId) {
        return next(Boom.badRequest('Invalid User'));
      }

      const newRater = {
        where: {
          companyId,
          clientId,
          succeeded: true,
        },
        attributes: ['companyId', 'clientId', 'createdAt', 'totalPremium', 'months', 'downPayment', 'succeeded', 'quoteId', 'stepResult'],
      };

      const raterData = await Rater.findAll(newRater);

      if (!raterData) {
        return next(Boom.badRequest(`${req.body.vendorName} Error retrieving best rate`));
      }
      let bestRate = null;
      raterData.forEach(async (oneRate) => {
        if (!bestRate) {
          bestRate = oneRate;
        } else {
          const currentTotalPremium = parseFloat(oneRate.totalPremium);
          const previousTotalPremium = parseFloat(bestRate.totalPremium);
          const isLessTotalPremium = currentTotalPremium < previousTotalPremium;
          if (isLessTotalPremium) {
            bestRate = oneRate;
          }
        }
      });
      req.session.data = bestRate;
      return next();
    } catch (error) {
      return next(Boom.badRequest(`${req.body.vendorName}: Failed to retrieved best rate`));
    }
  },

  getOneByName: async (req, res, next) => {
    console.log(`${req.body.vendorName}: Inside Get Rater By Name`);
    try {
      const params = req.body;
      const currentUser = req.body.decoded_user;
      let companyId = null;
      let clientId = null;
      if (currentUser.user) {
        companyId = currentUser.user.companyUserId;
        clientId = currentUser.user.id;
      }
      if (currentUser.client) {
        companyId = currentUser.client.companyClientId;
        clientId = currentUser.client.id;
      }

      if (!companyId || !clientId) {
        return next(Boom.badRequest('Invalid User'));
      }

      const newRater = {
        where: {
          companyId,
          clientId,
          vendorName: params.vendorName,
        },
        attributes: ['companyId', 'clientId', 'createdAt', 'totalPremium', 'months', 'downPayment', 'succeeded', 'quoteId', 'stepResult'],
      };

      const raterData = await Rater.findOne(newRater);

      console.log(raterData);

      if (raterData) {
        req.session.raterStore = raterData.dataValues;
      }
      return next();
    } catch (error) {
      return next(Boom.badRequest(`${req.body.vendorName}: Failed to retrieving rate`));
    }
  },

  getOneByNameData: async (req, res, next) => {
    console.log('Inside getOneByNameData');
    const raterStore = req.session.raterStore;
    if (!raterStore) {
      return next(Boom.badRequest('Error retrieving rate'));
    }
    req.session.data = raterStore;
    return next();
  },
};
