/* eslint-disable radix, no-param-reassign */

const Boom = require('boom');
const Rater = require('../models/rater');

module.exports = {
  saveRating: async (req, res, next) => {
    console.log('Inside saveRating');
    if (req.session.data && !req.session.data.totalPremium) {
      return next();
    }

    let companyId = null;
    let clientId = null;
    if (req.body.decoded_user.user && req.body.decoded_user.user.companyUserId) {
      companyId = req.body.decoded_user.user.companyUserId;
      clientId = req.body.decoded_user.user.id;
    }

    if (req.body.decoded_user.client && req.body.decoded_user.client.companyClientId) {
      companyId = req.body.decoded_user.client.companyClientId;
      clientId = req.body.decoded_user.client.id;
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

    if (raterData && raterData.totalPremium && req.session.data.status) {
      const currentPremium = parseFloat(req.session.data.totalPremium);
      const previousPremium = parseFloat(raterData.totalPremium);
      if (currentPremium < previousPremium) {
        const updateObj = {
          totalPremium: req.session.data.totalPremium,
          months: req.session.data.months,
          downPayment: req.session.data.downPayment,
          succeeded: true,
          result: JSON.stringify(req.session.data.response),
          error: null,
        };

        await raterData.update(updateObj);
      }
    }
    if (!raterData) {
      const newRater = {
        companyId,
        clientId,
        vendorName: req.body.vendorName,
        succeeded: req.session.data.status,
        totalPremium: req.session.data.totalPremium,
        months: req.session.data.months,
        downPayment: req.session.data.downPayment,
        result: JSON.stringify(req.session.data.response),
        error: req.session.data.response.error || null,
      };
      await Rater.create(newRater);
    }
    return next();
  },
  getRating: async (req, res, next) => {
    console.log('Inside getRating');

    try {
      let companyId = null;
      let clientId = null;
      if (req.body.decoded_user.user && req.body.decoded_user.user.companyUserId) {
        companyId = req.body.decoded_user.user.companyUserId;
        clientId = req.body.decoded_user.user.id;
      }

      if (req.body.decoded_user.client && req.body.decoded_user.client.companyClientId) {
        companyId = req.body.decoded_user.client.companyClientId;
        clientId = req.body.decoded_user.client.id;
      }

      if (!companyId || !clientId) {
        return next(Boom.badRequest('Invalid Data'));
      }

      const newRater = {
        where: {
          companyId,
          clientId,
          succeeded: true,
        },
        attributes: ['companyId', 'clientId', 'result', 'createdAt', 'totalPremium', 'months', 'downPayment', 'succeeded'],
      };

      const raterData = await Rater.findAll(newRater);

      if (!raterData) {
        return next(Boom.badRequest('Error retrieving rater'));
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
      console.log('error >> ', error.stack);
      return next(Boom.badRequest('Failed to retrieved best rate.'));
    }
  },
};
