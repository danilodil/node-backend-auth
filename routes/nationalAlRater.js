const express = require('express');
const asyncHandler = require('express-async-handler');

const nationalAlRaterController = require('../controllers/nationalAlRater');

const router = express.Router();

router.put('/national/al', asyncHandler(async (req, res, next) => {
  await nationalAlRaterController.nationalGeneralAl(req, res, next);
}));

module.exports = router;
