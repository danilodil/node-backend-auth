const express = require('express');
const asyncHandler = require('express-async-handler');

const qqController = require('../controllers/qq-integration');
const vendorPassport = require('../lib/passport/vendor-passport');


const router = express.Router();

router.put('/contact', [vendorPassport], asyncHandler(async (req, res, next) => {
  await qqController.createContact(req, res, next);
}));

router.put('/policy', [vendorPassport], asyncHandler(async (req, res, next) => {
  await qqController.createPolicy(req, res, next);
}));

router.put('/quote/:policyId', [vendorPassport], asyncHandler(async (req, res, next) => {
  await qqController.createQuote(req, res, next);
}));

router.put('/task', [vendorPassport], asyncHandler(async (req, res, next) => {
  await qqController.createTask(req, res, next);
}));

module.exports = router;
