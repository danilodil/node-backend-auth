const express = require('express');

const safecoRaterController = require('../controllers/safecoRater');
const rater = require('../controllers/rater');


const router = express.Router();

router.put('/safeco/al', [
  safecoRaterController.safecoAl,
  rater.saveRating,
]);

module.exports = router;
