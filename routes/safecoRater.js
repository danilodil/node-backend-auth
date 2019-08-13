const express = require('express');

const safecoRaterController = require('../controllers/safecoRater');
const raterController = require('../controllers/rater');


const router = express.Router();

router.put('/safeco/al', [
  raterController.getOneByName,
  safecoRaterController.safecoAl,
  raterController.saveRating,
]);

module.exports = router;
