const express = require('express');

const router = express.Router();
const passport = require('../lib/passport/index');
const vendorPassport = require('../lib/passport/vendor-passport');

const ezlynxIntegration = require('./ezlynx');
const progressiveRater = require('./progressiveRater');
const cseRater = require('./cseRater');
const qqIntegration = require('./qq-integration');
const salesforce = require('./salesforce');
const vendor = require('./vendor');
const nationalRater = require('./nationalRater');
const rater = require('./rater');
const safecoRater = require('./safecoRater');
const allStateRater = require('./allStateRater');
const travelerRater = require('./travelerRater');
const erieRater = require('./erieRater');
const quoteRushIntegration = require('./quoteRush');
const nowCertsIntegration = require('./nowCerts');

router.use('/ezlynx', [passport], [vendorPassport], ezlynxIntegration);
router.use('/qq', [passport], [vendorPassport], qqIntegration);
router.use('/progressiveRater', [passport], [vendorPassport], progressiveRater);
router.use('/cseRater', [passport], [vendorPassport], cseRater);
router.use('/salesforce', [passport], [vendorPassport], salesforce);
router.use('/vendor', vendor);
router.use('/nationalRater', [passport], [vendorPassport], nationalRater);
router.use('/rate', [passport], rater);
router.use('/safecoRater', [passport], [vendorPassport], safecoRater);
router.use('/allStateRater', [passport], [vendorPassport], allStateRater);
router.use('/travelerRater', [passport], [vendorPassport], travelerRater);
router.use('/erieRater', [passport], [vendorPassport], erieRater);
router.use('/quote-rush', [passport], [vendorPassport], quoteRushIntegration);
router.use('/nowCerts', [passport], [vendorPassport], nowCertsIntegration);

module.exports = router;
