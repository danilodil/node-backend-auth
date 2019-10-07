const express = require('express');

const cseRaterController = require('../controllers/cseRater');
const raterController = require('../controllers/rater');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

router.put('/cse/ca', [vendorPassport], [
  raterController.getOneByName,
  cseRaterController.cseRating,
  raterController.saveRating,
]);

module.exports = router;
