const express = require('express');
const ricochetController = require('../controllers/ricochet');

const router = express.Router();

router.put('/upsert/:type/:clientId', async (req, res, next) => {
  await ricochetController.createContact(req, res, next);
});

module.exports = router;
