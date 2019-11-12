const express = require('express');
const cabrilloController = require('../controllers/cabrillo');

const router = express.Router();

router.put('/upsert/:type/:clientId', async (req, res, next) => {
  await cabrilloController.createContact(req, res, next);
});

module.exports = router;
