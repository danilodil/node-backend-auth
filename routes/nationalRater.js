const express = require('express');

const nationalRaterController = require('../controllers/nationalRater');
const raterController = require('../controllers/rater');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

// router.put('/national', [
//   raterController.getOneByName,
//   nationalRaterController.nationalGeneral,
//   raterController.saveRating,
// ]);

router.put('/national', [vendorPassport], [
  raterController.getOneByName,
  nationalRaterController.addToQueue,
]);

module.exports = router;
