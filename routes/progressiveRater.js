const express = require('express');

const progressiveRaterController = require('../controllers/progressiveRater');
const raterController = require('../controllers/rater');

const router = express.Router();

router.put('/progressive/de', [
  raterController.getOneByName,
  progressiveRaterController.rateDelaware,
  raterController.saveRating,
]);

router.put('/progressive/al', [
  raterController.getOneByName,
  progressiveRaterController.rateAlabama,
  raterController.saveRating,
]);

module.exports = router;
