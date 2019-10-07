const express = require('express');

const progressiveRaterController = require('../controllers/progressiveRater');
const raterController = require('../controllers/rater');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

// router.put('/progressive', [
//   raterController.getOneByName,
//   progressiveRaterController.rate,
//   raterController.saveRating,
// ]);

router.put('/progressive', [vendorPassport], [
  raterController.getOneByName,
  progressiveRaterController.addToQueue,
]);
module.exports = router;
