const express = require('express');
const asyncHandler = require('express-async-handler');

const quoteRushController = require('../controllers/quoteRush');

const router = express.Router();

router.post('/contact/:type', asyncHandler(async (req, res, next) => {
  await quoteRushController.createContact(req, res, next);
}));

module.exports = router;