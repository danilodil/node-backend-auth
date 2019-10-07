const express = require('express');
const ezlynxController = require('../controllers/ezlynx');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

router.put('/upsert/:type/:clientId', [vendorPassport], async (req, res, next) => {
  await ezlynxController.createContact(req, res, next);
});

module.exports = router;
