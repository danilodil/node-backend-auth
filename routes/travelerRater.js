const express = require('express');

const travelerRater = require('../controllers/travelerRater');
const raterController = require('../controllers/rater');


const router = express.Router();

// router.put('/traveler/', [
//   raterController.getOneByName,
//   travelerRater.traveler,
//   raterController.saveRating,
// ]);

router.put('/traveler/', [
  raterController.getOneByName,
  travelerRater.addToQueue,
]);

module.exports = router;
