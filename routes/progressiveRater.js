const express = require('express');
const asyncHandler = require('express-async-handler');

const progressiveRaterController = require('../controllers/progressiveRater');

const router = express.Router();

router.put('/progressive/de', asyncHandler(async (req, res, next) => {
  await progressiveRaterController.rateDelaware(req, res, next);
}));

module.exports = router;
