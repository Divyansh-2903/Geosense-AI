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

router.post('/', createFarm);
router.get('/', getFarms);
router.get('/:id/history', getFarmHistory);
router.get('/:id', getFarmById);
router.delete('/:id', deleteFarm);
router.post('/:id/analysis', saveAnalysisToFarm);

module.exports = router;
