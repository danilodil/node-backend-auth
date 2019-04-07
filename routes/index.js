const express = require('express');

const router = express.Router();
const passport = require('../lib/passport');

const ezlynxIntegration = require('./ezlynx');
const progressiveRater = require('./progressive-rater');
const qqIntegration = require('./qq-integration');
const salesforce = require('./salesforce');
const vendor = require('./vendor');

router.use('/ezlynx', [passport], ezlynxIntegration);
router.use('/qq', [passport], qqIntegration);
router.use('/rater', [passport], progressiveRater);
router.use('/salesforce', [passport], salesforce);
router.use('/vendor', vendor);

module.exports = router;
