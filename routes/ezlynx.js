const express = require('express');
const ezlynxController = require('../controllers/ezlynx');
const v2EzlynxController = require('../controllers/v2-ezlynx');

const router = express.Router();

router.put('/upsert/:type/:clientId', async (req, res, next) => {
  await ezlynxController.createContact(req, res, next);
});

router.put('/v2/upsert/:type/:clientId', async (req, res, next) => {
  await v2EzlynxController.createApplicant(req, res, next);
});

router.put('/upsert-personal-applicant/:clientId', async (req, res, next) => {
  await ezlynxController.createPersonalApplicant(req, res, next);
});

router.put('/upsert-commercial-applicant/:clientId', async (req, res, next) => {
  await ezlynxController.createCommercialApplicant(req, res, next);
});

module.exports = router;
