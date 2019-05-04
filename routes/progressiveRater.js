const express = require('express');
const asyncHandler = require('express-async-handler');

const progressiveRaterController = require('../controllers/progressiveRater');

const router = express.Router();

// router.put('/progressive/de', asyncHandler(async (req, res, next) => {
//   await progressiveRaterController.rateDelaware(req, res, next);
//   await progressiveRaterController.saveRating(req, res, next)
// }));

router.put('/progressive/de', [
  progressiveRaterController.rateDelaware,
  progressiveRaterController.saveRating
]);

router.put('/progressive/al', asyncHandler(async (req, res, next) => {
  await progressiveRaterController.rateAlabama(req, res, next);
}));

router.get('/getRater', asyncHandler(async (req, res, next) => {
  await progressiveRaterController.getRating(req, res, next);
}));

module.exports = router;
