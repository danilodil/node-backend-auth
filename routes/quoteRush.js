const express = require('express');
const asyncHandler = require('express-async-handler');

const quoteRushController = require('../controllers/quoteRush');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

router.put('/upsert/:type/:clientId', [vendorPassport], async (req, res, next) => {
  await quoteRushController.createContact(req, res, next);
});

module.exports = router;
