const express = require('express');
const router = express.Router();

const analysisController = require('../controllers/analysisController');
const chatController = require('../controllers/chatController');
const mapLayerController = require('../controllers/mapLayerController');

router.post('/analyze-farm', analysisController);
router.post('/chat-advice', chatController);
router.post('/map-layer', mapLayerController);

module.exports = router;
