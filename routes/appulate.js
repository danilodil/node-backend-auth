const express = require('express');
const asyncHandler = require('express-async-handler');

const appulateController = require('../controllers/appulate');

const router = express.Router();

router.put('/upload', asyncHandler(async (req, res, next) => {
  await appulateController.createContact(req, res, next);
}));

module.exports = router;
