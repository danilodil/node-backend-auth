const express = require('express');
const asyncHandler = require('express-async-handler');

const qqController = require('../controllers/qq-integration');

const router = express.Router();

router.put('/contact', asyncHandler(async (req, res, next) => {
  await qqController.createContact(req, res, next);
}));

router.put('/policy', asyncHandler(async (req, res, next) => {
  await qqController.createPolicy(req, res, next);
}));

router.put('/quote/:policyId', asyncHandler(async (req, res, next) => {
  await qqController.createQuote(req, res, next);
}));

router.put('/task', asyncHandler(async (req, res, next) => {
  await qqController.createTask(req, res, next);
}));

module.exports = router;
