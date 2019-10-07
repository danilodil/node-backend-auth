const express = require('express');

const cseRaterController = require('../controllers/cseRater');
const raterController = require('../controllers/rater');

const router = express.Router();

router.put('/cse/ca', [
  raterController.getOneByName,
  cseRaterController.cseRating,
  raterController.saveRating,
]);

module.exports = router;
