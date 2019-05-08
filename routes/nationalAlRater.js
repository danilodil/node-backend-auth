const express = require('express');
const asyncHandler = require('express-async-handler');

const nationalAlRaterController = require('../controllers/nationalAlRater');
const rater = require('../controllers/rater');

const router = express.Router();

router.put('/national/al',[
  nationalAlRaterController.nationalGeneralAl,
  rater.saveRating
]);

module.exports = router;
