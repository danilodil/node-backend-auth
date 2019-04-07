const express = require('express');
const asyncHandler = require('express-async-handler');

const ezlynxController = require('../controllers/ezlynx');

const router = express.Router();

router.put('/contact/:type', asyncHandler(async (req, res, next) => {
  await ezlynxController.createContact(req, res, next);
}));

module.exports = router;
