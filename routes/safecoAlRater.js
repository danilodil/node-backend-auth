const express = require('express');
const asyncHandler = require('express-async-handler');

const safecoAlRaterController = require('../controllers/safecoAlRater');
const rater = require('../controllers/rater');


const router = express.Router();

router.put('/safeco/al',[
    safecoAlRaterController.safecoAl,
    rater.saveRating
]);

module.exports = router;
