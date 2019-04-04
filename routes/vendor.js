const express = require('express');
const asyncHandler = require('express-async-handler');

const vendorController = require('../controllers/vendor');

const router = express.Router();

router.post('/add', asyncHandler(async (req, res, next) => {
  await vendorController.create(req, res, next);
}));

module.exports = router;
