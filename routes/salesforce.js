const express = require('express');
const asyncHandler = require('express-async-handler');

const salesforceController = require('../controllers/salesforce');
const vendorPassport = require('../lib/passport/vendor-passport');

const router = express.Router();

router.post('/add/property', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addProperty(req, res, next);
}));

router.post('/update/property', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.updateProperty(req, res, next);
}));


/* OLD SF CODE */
router.post('/add-account', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addSFAccount(req, res, next);
}));

router.post('/add-account-home', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addSFAccountHome(req, res, next);
}));

router.post('/add-insured', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addSFInsured(req, res, next);
}));

router.post('/add-insured-home', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addSFHomeInsured(req, res, next);
}));

router.post('/add-vehicle', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addSFVehicle(req, res, next);
}));

router.post('/add-property-old', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addSFPropertyOld(req, res, next);
}));

router.post('/add-violation', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.addSFViolation(req, res, next);
}));

router.post('/update-account', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFAccount(req, res, next);
}));

router.post('/update-property-account', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFPropertyAccount(req, res, next);
}));

router.post('/update-vehicle', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFVehicle(req, res, next);
}));

router.post('/update-property-old', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFPropertyOld(req, res, next);
}));

router.post('/update-insured', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFInsured(req, res, next);
}));

router.post('/update-insured-home', [vendorPassport], asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFHomeInsured(req, res, next);
}));

module.exports = router;
