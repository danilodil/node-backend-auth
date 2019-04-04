const express = require('express');

const router = express.Router();
const passport = require('../lib/passport');

const vendor = require('./vendor');
const qqIntegration = require('./qq-integration');
const progressiveRater = require('./progressive-rater');
const salesforce = require('./salesforce');

router.use('/vendor', vendor);
router.use('/qq', [passport], qqIntegration);
router.use('/rater', [passport], progressiveRater);
router.use('/salesforce', [passport], salesforce);

module.exports = router;
