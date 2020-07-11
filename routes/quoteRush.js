const express = require('express');

const quoteRushController = require('../controllers/quoteRush');

const router = express.Router();

router.put('/upsert/:clientId', async (req, res, next) => {
  await quoteRushController.createContact(req, res, next);
});

module.exports = router;
