const express = require('express');

const erieRater = require('../controllers/erieRater');
const raterController = require('../controllers/rater');

const router = express.Router();

router.put('/erie/', [
  raterController.getOneByName,
  erieRater.erieRater,
  raterController.saveRating,
]);

module.exports = router;
