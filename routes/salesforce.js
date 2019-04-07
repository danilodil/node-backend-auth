const express = require('express');
const asyncHandler = require('express-async-handler');

const salesforceController = require('../controllers/salesforce');

const router = express.Router();

router.post('/add/property', asyncHandler(async (req, res, next) => {
  await salesforceController.addProperty(req, res, next);
}));

router.post('/update/property', asyncHandler(async (req, res, next) => {
  await salesforceController.updateProperty(req, res, next);
}));



/* OLD SF CODE */
router.post('/add-account', asyncHandler(async (req, res, next) => {
  await salesforceController.addSFAccount(req, res, next);
}));

router.post('/add-account-home', asyncHandler(async (req, res, next) => {
  await salesforceController.addSFAccountHome(req, res, next);
}));

router.post('/add-insured', asyncHandler(async (req, res, next) => {
  await salesforceController.addSFInsured(req, res, next);
}));

router.post('/add-insured-home', asyncHandler(async (req, res, next) => {
  await salesforceController.addSFHomeInsured(req, res, next);
}));

router.post('/add-vehicle', asyncHandler(async (req, res, next) => {
  await salesforceController.addSFVehicle(req, res, next);
}));

router.post('/add-property-old', asyncHandler(async (req, res, next) => {
  await salesforceController.addSFPropertyOld(req, res, next);
}));

router.post('/add-violation', asyncHandler(async (req, res, next) => {
  await salesforceController.addSFViolation(req, res, next);
}));

router.post('/update-account', asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFAccount(req, res, next);
}));

router.post('/update-property-account', asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFPropertyAccount(req, res, next);
}));

router.post('/update-vehicle', asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFVehicle(req, res, next);
}));

router.post('/update-property-old', asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFPropertyOld(req, res, next);
}));

router.post('/update-insured', asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFInsured(req, res, next);
}));

router.post('/update-insured-home', asyncHandler(async (req, res, next) => {
  await salesforceController.updateSFHomeInsured(req, res, next);
}));

module.exports = router;
