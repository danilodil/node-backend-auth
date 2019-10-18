const express = require('express');
const asyncHandler = require('express-async-handler');
const vendorPassport = require('../lib/passport/vendor-passport');

const rater = require('../controllers/rater');

const router = express.Router();

router.get('/', [vendorPassport], asyncHandler(async (req, res, next) => {
  await rater.getBestRating(req, res, next);
}));

router.get('/:clientId', asyncHandler(async (req, res, next) => {
  await rater.getRateByClientId(req, res, next);
}));

module.exports = router;
