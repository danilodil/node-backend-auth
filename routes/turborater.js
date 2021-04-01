const express = require('express');
const turboraterController = require('../controllers/turborater');

const router = express.Router();

router.put('/upsert/:type/:clientId', async (req, res, next) => {
  await turboraterController.createContact(req, res, next);
});

router.put('/upsert/v2/:type/:clientId', async (req, res, next) => {
  await turboraterController.creatContactWithXML(req, res, next);
});

module.exports = router;
