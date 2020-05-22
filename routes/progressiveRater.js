const express = require('express');

const progressiveRaterController = require('../controllers/progressiveRater');
// const progressiveRaterJob = require('../jobs/progressive');
const raterController = require('../controllers/rater');

const router = express.Router();

// router.put('/progressive', [
//   raterController.getOneByName,
//   progressiveRaterJob.rate,
//   raterController.saveRating,
// ]);

router.put('/progressive', [
  raterController.getOneByName,
  progressiveRaterController.addToQueue,
]);

module.exports = router;
