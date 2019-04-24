const express = require('express');
const asyncHandler = require('express-async-handler');

const progressiveRaterController = require('../controllers/progressive-rater');

const router = express.Router();

router.put('/progressive/de', asyncHandler(async (req, res, next) => {
  await progressiveRaterController.rateDelaware(req, res, next);
}));

router.put('/cse', asyncHandler(async (req, res, next) => {
  await progressiveRaterController.cseRating(req, res, next);
}));

module.exports = router;
