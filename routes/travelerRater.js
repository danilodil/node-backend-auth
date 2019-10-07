const express = require('express');

const travelerRater = require('../controllers/travelerRater');
const raterController = require('../controllers/rater');
const vendorPassport = require('../lib/passport/vendor-passport');


const router = express.Router();

// router.put('/traveler/', [
//   raterController.getOneByName,
//   travelerRater.traveler,
//   raterController.saveRating,
// ]);

router.put('/traveler/', [vendorPassport], [
  raterController.getOneByName,
  travelerRater.addToQueue,
]);

module.exports = router;
