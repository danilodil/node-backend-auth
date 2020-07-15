const express = require('express');
const stateAutoRater = require('../controllers/stateAutoRater');
const raterController = require('../controllers/rater');

const router = express.Router();

// router.put('/stateAuto', [
//   raterController.getOneByName,
//   stateAutoRaterJob.stateAuto,
//   raterController.saveRating,
// ]);

router.put('/stateAuto/', [
  raterController.getOneByName,
  stateAutoRater.addToQueue,
]);

module.exports = router;
