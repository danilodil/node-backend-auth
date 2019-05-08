const express = require('express');
const asyncHandler = require('express-async-handler');

const vendorController = require('../controllers/vendor');

const router = express.Router();

router.post('/add', asyncHandler(async (req, res, next) => {
  await vendorController.create(req, res, next);
}));

router.patch('/edit/:vendorName', asyncHandler(async (req, res, next) => {
  await vendorController.update(req, res, next);
}));

router.put('/getAll', asyncHandler(async (req, res, next) => {
  await vendorController.getAll(req, res, next);
}));

module.exports = router;
