/* eslint-disable radix, no-param-reassign, no-console */

const Boom = require('boom');
const Rater = require('../models/rater');

module.exports = {
  saveRating: async (req, res, next) => {
    try {
      if (!req.session.data && !req.session.payment) {
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
      const isSucceeded = !!((req.session.data.status && req.session.data.totalPremium));
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
          quoteIds: req.session.data.quoteIds || null,
          stepResult: req.session.data.stepResult || null,
        };
        await Rater.create(newRater);
        console.log(`${req.body.vendorName} Rater Created`);
      }

      const data = !req.session.payment ? req.session.data : req.session.payment;
      const isPayment = !!req.session.payment;

      /* update rater result */
      const updateObj = {
        stepResult: data.stepResult || null,
        quoteId: data.quoteId || null,
        quoteIds: data.quoteIds || null,
      };
      if (raterData && data.totalPremium && data.status) {
        updateObj.totalPremium = data.totalPremium;
        updateObj.months = data.months;
        updateObj.downPayment = data.downPayment;
        updateObj.succeeded = true;
        updateObj.error = null;
        await raterData.update(updateObj);
        console.log(`${req.body.vendorName} Rater Updated`);
      } else if (raterData) {
        await raterData.update(updateObj);
        console.log(`${req.body.vendorName} Rater Updated`);
      }

      if (isPayment) {
        req.session.data = req.session.payment;
      }
      return next();
    } catch (error) {
      console.log(error);
      return next(Boom.badRequest(`${req.body.vendorName} Error Saving Rate: `, error));
    }
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
        attributes: ['companyId', 'clientId', 'createdAt', 'totalPremium', 'months', 'downPayment', 'succeeded', 'quoteId', 'stepResult', 'quoteIds'],
      };

      const raterData = await Rater.findOne(newRater);

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
    const { raterStore } = req.session;
    if (!raterStore) {
      return next(Boom.badRequest('Error retrieving rate'));
    }
    req.session.data = raterStore;
    return next();
  },
  saveRatingFromJob: async (req, res) => {
    try {
      if (!res) return;

      console.log(`${req.body.vendorName}: Saving Rate`);
      console.log(res);
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
      if (!companyId && !clientId) return;

      const existRater = {
        where: {
          companyId,
          clientId,
          vendorName: req.body.vendorName,
        },
      };

      const raterData = await Rater.findOne(existRater);
      /* create new rater result */
      const isSucceeded = !!((res.status && res.totalPremium));
      if (!raterData) {
        const newRater = {
          companyId,
          clientId,
          vendorName: req.body.vendorName,
          succeeded: isSucceeded,
          totalPremium: res.totalPremium || null,
          months: res.months || null,
          downPayment: res.downPayment || null,
          error: res.error || null,
          quoteId: res.quoteId || null,
          quoteIds: res.quoteIds || null,
          stepResult: res.stepResult || null,
        };
        await Rater.create(newRater);
        console.log(`${req.body.vendorName} Rater Created`);
      }

      /* update rater result */
      const updateObj = {
        stepResult: res.stepResult || null,
        quoteId: res.quoteId || null,
        quoteIds: res.quoteIds || null,
      };
      if (raterData && res.totalPremium && res.status) {
        updateObj.totalPremium = res.totalPremium;
        updateObj.months = res.months;
        updateObj.downPayment = res.downPayment;
        updateObj.succeeded = true;
        updateObj.error = null;
        await raterData.update(updateObj);
        console.log(`${req.body.vendorName} Rater Updated`);
      } else if (raterData) {
        await raterData.update(updateObj);
        console.log(`${req.body.vendorName} Rater Updated`);
      }
    } catch (error) {
      console.log(`${req.body.vendorName} Error Saving Rate: `, error);
    }
  },
};
