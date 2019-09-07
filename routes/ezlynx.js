const express = require('express');
const ezlynxController = require('../controllers/ezlynx');
const router = express.Router();

router.put('/upsert/:type/:clientId', async (req, res, next) => {
  await ezlynxController.createContact(req, res, next);
});

module.exports = router;
