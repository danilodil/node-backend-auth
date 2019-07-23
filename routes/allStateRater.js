const express = require('express');

const allStateController = require('../controllers/allStateRater');
const raterController = require('../controllers/rater');


const router = express.Router();

router.put('/allState/', [
  raterController.getOneByName,
  allStateController.allState,
  raterController.saveRating,
]);

module.exports = router;
