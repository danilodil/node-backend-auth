const express = require('express');

const safecoAlRaterController = require('../controllers/safecoAlRater');
const rater = require('../controllers/rater');


const router = express.Router();

router.put('/safeco/al', [
  safecoAlRaterController.safecoAl,
  rater.saveRating,
]);

module.exports = router;
