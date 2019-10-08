const express = require('express');

const router = express.Router();
const passport = require('../lib/passport/index');
const vendorPass = require('../lib/passport/vendor-passport');

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
const turboraterIntegration = require('./turborater');
const nowCertsIntegration = require('./nowCerts');

router.use('/ezlynx', [vendorPass], ezlynxIntegration);
router.use('/qq', [vendorPass], qqIntegration);
router.use('/progressiveRater', [passport], progressiveRater);
router.use('/cseRater', [passport], cseRater);
router.use('/salesforce', [vendorPass], salesforce);
router.use('/vendor', vendor);
router.use('/nationalRater', [passport], nationalRater);
router.use('/rate', [passport], rater);
router.use('/safecoRater', [passport], safecoRater);
router.use('/allStateRater', [passport], allStateRater);
router.use('/travelerRater', [passport], travelerRater);
router.use('/erieRater', [passport], erieRater);
router.use('/quote-rush', [vendorPass], quoteRushIntegration);
router.use('/turborater', [vendorPass], turboraterIntegration);
router.use('/nowCerts', [vendorPass], nowCertsIntegration);

module.exports = router;
