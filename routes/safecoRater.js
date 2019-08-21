const express = require('express');

const safecoRaterController = require('../controllers/safecoRater');
const raterController = require('../controllers/rater');


const router = express.Router();

router.put('/safeco', [
  raterController.getOneByName,
  safecoRaterController.safeco,
  raterController.saveRating,
]);

module.exports = router;
