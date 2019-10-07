const express = require('express');

const safecoRaterController = require('../controllers/safecoRater');
const raterController = require('../controllers/rater');
const vendorPassport = require('../lib/passport/vendor-passport');


const router = express.Router();

// router.put('/safeco', [
//   raterController.getOneByName,
//   safecoRaterController.safeco,
//   raterController.saveRating,
// ]);

router.put('/safecoAuto', [vendorPassport], [
  raterController.getOneByName,
  safecoRaterController.addToAutoQueue,
]);

router.put('/safecoHome', [vendorPassport], [
  raterController.getOneByName,
  safecoRaterController.addToHomeQueue,
]);

module.exports = router;
