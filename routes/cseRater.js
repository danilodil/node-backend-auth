const express = require('express');
const asyncHandler = require('express-async-handler');

const cseRaterController = require('../controllers/cseRater');

const router = express.Router();

router.put('/cse', asyncHandler(async (req, res, next) => {
  await cseRaterController.cseRating(req, res, next);
}));

module.exports = router;
