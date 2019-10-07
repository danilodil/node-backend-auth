const express = require('express');

const erieRater = require('../controllers/erieRater');
const raterController = require('../controllers/rater');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

// router.put('/erie/', [
//   raterController.getOneByName,
//   erieRater.erieRater,
//   raterController.saveRating,
// ]);

router.put('/erie/', [vendorPassport], [
  raterController.getOneByName,
  erieRater.addToQueue,
]);
module.exports = router;
