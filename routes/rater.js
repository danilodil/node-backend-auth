const express = require('express');
const asyncHandler = require('express-async-handler');

const rater = require('../controllers/rater');

const router = express.Router();

router.get('/', asyncHandler(async (req, res, next) => {
  await rater.getBestRating(req, res, next);
}));

router.get('/:vendorName', asyncHandler(async (req, res, next) => {
  await rater.getOneByName(req, res, next);
  await rater.getOneByNameData(req, res, next);
}));

module.exports = router;
