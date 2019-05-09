const express = require('express');

const cseRaterController = require('../controllers/cseRater');
const rater = require('../controllers/rater');

const router = express.Router();

router.put('/cse', [
  cseRaterController.cseRating,
  rater.saveRating,
]);

module.exports = router;
