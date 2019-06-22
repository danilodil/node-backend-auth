const express = require('express');
const asyncHandler = require('express-async-handler');

const nationalRaterController = require('../controllers/nationalRater');
const raterController = require('../controllers/rater');

const router = express.Router();

router.put('/national/al', [
  raterController.getOneByName,
  nationalRaterController.nationalGeneralAl,
  raterController.saveRating,
]);

module.exports = router;
