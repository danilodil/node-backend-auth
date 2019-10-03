const express = require('express');
const turboraterController = require('../controllers/turborater');

const router = express.Router();

router.put('/upsert/:type/:clientId', async (req, res, next) => {
  await turboraterController.createContact(req, res, next);
});

module.exports = router;
