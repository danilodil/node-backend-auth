const express = require('express');
const asyncHandler = require('express-async-handler');
const passport = require('../lib/passport');

const rater = require('../controllers/rater');

const router = express.Router();

router.get('/', [passport], asyncHandler(async (req, res, next) => {
  await rater.getBestRating(req, res, next);
}));

router.post('/filter', asyncHandler(async (req, res, next) => {
  await rater.getRateByClientId(req, res, next);
}));

module.exports = router;
