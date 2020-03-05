const express = require('express');
const scraperController = require('../controllers/scraper');
const router = express.Router();

router.post('/scrape', async (req, res, next) => {
  await scraperController.scrape(req, res, next);
});

module.exports = router;
