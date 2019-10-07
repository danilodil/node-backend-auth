const express = require('express');

const allStateController = require('../controllers/allStateRater');
const raterController = require('../controllers/rater');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

router.put('/allState/', [vendorPassport], [
  raterController.getOneByName,
  allStateController.allState,
  raterController.saveRating,
]);

module.exports = router;
