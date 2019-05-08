const express = require('express');
const asyncHandler = require('express-async-handler');

const rater = require('../controllers/rater');
const router = express.Router();

router.get('/', asyncHandler(async (req, res, next) => {
    await rater.getRating(req, res, next);
}));

module.exports = router;
