/* eslint-disable radix, no-param-reassign */

const Boom = require('boom');
const Rater = require('../models/rater');

module.exports = {
  saveRating: async (req, res, next) => {
    if (!req.session.data) {
      return next();
    }
    console.log('Inside saveRating');

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
    const isSucceeded = req.session.data.status && req.session.data.totalPremium ? true : false;
    console.log('isSucceeded', isSucceeded);
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
      };
      await Rater.create(newRater);
    }

    /* update rater result */
    if (raterData && raterData.totalPremium && req.session.data.status) {
      const currentPremium = parseFloat(req.session.data.totalPremium);
      const previousPremium = parseFloat(raterData.totalPremium);
      if (currentPremium < previousPremium) {
        const updateObj = {
          totalPremium: req.session.data.totalPremium,
          months: req.session.data.months,
          downPayment: req.session.data.downPayment,
          succeeded: true,
          error: null,
        };
        await raterData.update(updateObj);
      }
    }
   
    return next();
  },
  getBestRating: async (req, res, next) => {
    console.log('Inside getBestRating');
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
        attributes: ['companyId', 'clientId', 'createdAt', 'totalPremium', 'months', 'downPayment', 'succeeded', 'quoteId'],
      };

      const raterData = await Rater.findAll(newRater);

      if (!raterData) {
        return next(Boom.badRequest('Error retrieving best rate'));
      }
      let bestRate = null;
      raterData.forEach(async (oneRate) => {
        if (!bestRate) {
          bestRate = oneRate;
          bestRate.result = JSON.parse(bestRate.result);
        } else {
          oneRate.result = JSON.parse(oneRate.result);
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
      return next(Boom.badRequest('Failed to retrieved best rate.'));
    }
  },

  getOneByName: async (req, res, next) => {
    console.log('Inside getOneByName');
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
        attributes: ['companyId', 'clientId', 'createdAt', 'totalPremium', 'months', 'downPayment', 'succeeded', 'quoteId'],
      };

      const raterData = await Rater.findOne(newRater);
      if (raterData) {
        req.session.raterStore = raterData.dataValues;
      }
      return next();
    } catch (error) {
      return next(Boom.badRequest('Failed to retrieving rate.'));
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
