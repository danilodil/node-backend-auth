const express = require('express');

const safecoRaterController = require('../controllers/safecoRater');
const raterController = require('../controllers/rater');

const router = express.Router();

// router.put('/safeco', [
//   raterController.getOneByName,
//   safecoRaterController.safeco,
//   raterController.saveRating,
// ]);

router.put('/safecoAuto', [
  raterController.getOneByName,
  safecoRaterController.addToAutoQueue,
]);

router.put('/safecoHome', [
  raterController.getOneByName,
  safecoRaterController.addToHomeQueue,
]);

module.exports = router;
