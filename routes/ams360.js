const express = require('express');
const ams360Controller = require('../controllers/ams360');

const router = express.Router();

router.put('/upsert/:clientId', async (req, res, next) => {
  await ams360Controller.createContact(req, res, next);
});

module.exports = router;
