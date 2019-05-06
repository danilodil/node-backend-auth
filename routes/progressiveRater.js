const express = require('express');
const asyncHandler = require('express-async-handler');

const progressiveRaterController = require('../controllers/progressiveRater');
const rater = require('../controllers/rater');

const router = express.Router();

// router.put('/progressive/de', asyncHandler(async (req, res, next) => {
//   await progressiveRaterController.rateDelaware(req, res, next);
//   await progressiveRaterController.saveRating(req, res, next)
// }));

router.put('/progressive/de', [
  progressiveRaterController.rateDelaware,
  rater.saveRating
]);

// router.put('/progressive/al', asyncHandler(async (req, res, next) => {
//   await progressiveRaterController.rateAlabama(req, res, next);
// }));

router.put('/progressive/al', [
  progressiveRaterController.rateAlabama,
  rater.saveRating
]);

module.exports = router;
