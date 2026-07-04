const express = require('express');
const router = express.Router();
const {
  createFarm,
  getFarms,
  getFarmById,
  getFarmHistory,
  deleteFarm,
  saveAnalysisToFarm
} = require('../controllers/farmController');
const protect = require('../middleware/auth');

router.use(protect); // Protect all farm routes

module.exports = router;
