const express = require('express');

const router = express.Router();
const wealthController = require('../controllers/wealthbox');

router.post('/createContact/:clientId', (req, res, next) => wealthController.createContact(req, res, next));
router.post('/createTask/:clientId', (req, res, next) => wealthController.createTask(req, res, next));
router.post('/createEvent/:clientId', (req, res, next) => wealthController.createEvent(req, res, next));
router.post('/createProject/:clientId', (req, res, next) => wealthController.createProject(req, res, next));
router.post('/createNote/:clientId', (req, res, next) => wealthController.createNote(req, res, next));
router.post('/createOpportunity/:clientId', (req, res, next) => wealthController.createOpportunity(req, res, next));
router.post('/createWorkflow/:clientId', (req, res, next) => wealthController.createWorkflow(req, res, next));

module.exports = router;
