const express = require('express');
const commercialEzlynxController = require('../controllers/commercial-ezlynx');

const router = express.Router();

router.put('/upsert/:clientId', async (req, res, next) => {
  await commercialEzlynxController.createContact(req, res, next);
});

module.exports = router;