const express = require('express');

const router = express.Router();
const passport = require('../lib/passport/index');

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

router.use('/ezlynx', [passport], ezlynxIntegration);
router.use('/qq', [passport], qqIntegration);
router.use('/progressiveRater', [passport], progressiveRater);
router.use('/cseRater', [passport], cseRater);
router.use('/salesforce', [passport], salesforce);
router.use('/vendor', vendor);
router.use('/nationalRater', [passport], nationalRater);
router.use('/rate', [passport], rater);
router.use('/safecoRater', [passport], safecoRater);
router.use('/allStateRater', [passport], allStateRater);
router.use('/travelerRater', [passport], travelerRater);
router.use('/erieRater', [passport], erieRater);
router.use('/quote-rush', [passport], quoteRushIntegration);
router.use('/nowCerts', [passport], nowCertsIntegration);

// router.use('/ezlynx', [passport], ezlynxIntegration);
// router.use('/qq', [passport], qqIntegration);
// router.use('/progressiveRater', [passport], progressiveRater);
// router.use('/cseRater', [passport], cseRater);
// router.use('/salesforce', [passport], salesforce);
// router.use('/vendor', vendor);
// router.use('/nationalRater', [passport], nationalRater);
// router.use('/rate', rater);
// router.use('/safecoRater', [passport], safecoRater);
// router.use('/allStateRater', [passport], allStateRater);
// router.use('/travelerRater', [passport], travelerRater);
// router.use('/erieRater', [passport], erieRater);
// router.use('/quote-rush', [passport], quoteRushIntegration);
// router.use('/nowCerts', [passport], nowCertsIntegration);

module.exports = router;
