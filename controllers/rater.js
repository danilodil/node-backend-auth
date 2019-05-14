/* eslint-disable radix */

const Boom = require('boom');
const Rater = require('../models/rater');

module.exports = {
  saveRating: async (req, res, next) => {
    console.log('Inside saveRating');

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

    if (raterData && req.session.data.obj.status) {
      if ((req.session.data.totalPremium && raterData.totalPremium && parseInt(req.session.data.totalPremium) < parseInt(raterData.totalPremium.replace(/,/g, '')))) {
        const updateObj = {};
        if (req.session.data && req.session.data.totalPremium) {
          updateObj.totalPremium = req.session.data.totalPremium;
        }
        delete req.session.data.totalPremium;
        updateObj.result = JSON.stringify(req.session.data);
        await raterData.update(updateObj);
      }
    }
    if (!raterData) {
      const newRater = {
        companyId,
        clientId,
        vendorName: req.body.vendorName,
        // result: JSON.stringify(req.session.data),
      };
      if (req.session.data && req.session.data.totalPremium) {
        newRater.totalPremium = req.session.data.totalPremium;
      }
      delete req.session.data.totalPremium;
      newRater.result = JSON.stringify(req.session.data);
      await Rater.create(newRater);
    }
    return next();
  },
  getRating: async (req, res, next) => {
    console.log('Inside getRating');

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
      },
      attributes: ['companyId', 'clientId', 'result', 'createdAt', 'totalPremium'],
    };

    const raterData = await Rater.findAll(newRater);
    if (!raterData) {
      return next(Boom.badRequest('Error retrieving rater'));
    }
    let bestRate = null;
    raterData.forEach(async(oneRate) => {
      if (!bestRate) {
        bestRate = oneRate;
        bestRate.result = JSON.parse(bestRate.result);
      } else {
        oneRate.result = JSON.parse(oneRate.result);
        if (oneRate.result.obj.status && parseInt(oneRate.totalPremium.replace(/,/g, '')) > 0 && parseInt(oneRate.totalPremium.replace(/,/g, '')) < parseInt(bestRate.totalPremium.replace(/,/g, ''))) {
          console.log('oneRate >>>>', oneRate.totalPremium);
          bestRate = oneRate;
        }
      }
    });
    req.session.data = bestRate;
    return next();
  },
};
