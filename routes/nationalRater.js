const express = require('express');

const nationalRaterController = require('../controllers/nationalRater');
const raterController = require('../controllers/rater');

const router = express.Router();

router.put('/national', [
  raterController.getOneByName,
  nationalRaterController.nationalGeneral,
  raterController.saveRating,
]);

module.exports = router;
