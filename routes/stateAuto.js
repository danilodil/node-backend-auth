const express = require('express');

const stateAutoRater = require('../controllers/stateAutoRater');
const stateAutoRaterJob = require('../jobs/stateAuto');
const raterController = require('../controllers/rater');


const router = express.Router();

router.put('/stateAuto/', [
  raterController.getOneByName,
  stateAutoRater.addToQueue,
]);

module.exports = router;
