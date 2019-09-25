const express = require('express');
const asyncHandler = require('express-async-handler');

const nowCertsController = require('../controllers/nowCerts');

const router = express.Router();

router.put('/upsert/:type/:clientId', asyncHandler(async (req, res, next) => {
  await nowCertsController.createContact(req, res, next);
}));

module.exports = router;
