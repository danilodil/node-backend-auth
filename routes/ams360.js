const express = require('express');
const ams360Controller = require('../controllers/ams360');

const router = express.Router();

router.put('/upsert/:clientId/:type', async (req, res, next) => {
  await ams360Controller.createContact(req, res, next);
});

router.post('/list-details', async (req, res, next) => {
  await ams360Controller.listAgencyDetails(req, res, next);
});

module.exports = router;
