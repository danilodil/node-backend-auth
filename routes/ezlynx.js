const express = require('express');
const ezlynxController = require('../controllers/ezlynx');

const router = express.Router();

router.put('/upsert/:type/:clientId', async (req, res, next) => {
  await ezlynxController.createContact(req, res, next);
});

router.put('/upsert-personal-applicant/:clientId', async (req, res, next) => {
  await ezlynxController.createPersonalApplicant(req, res, next);
});

module.exports = router;
