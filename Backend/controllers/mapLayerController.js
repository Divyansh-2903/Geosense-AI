const initializeEarthEngine = require('../utils/earthEngineAuth');
const buildEarthEngineMapLayer = require('../services/earthEngine/mapLayerService');

module.exports = async function mapLayerController(req, res) {
  try {
    await initializeEarthEngine();

    const layer = await buildEarthEngineMapLayer({
      geometryInput: req.body.geometryInput,
      layer: req.body.layer,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      year: req.body.year,
    });

    res.json(layer);
  } catch (error) {
    console.error('Earth Engine map layer error:', error);
    res.status(502).json({
      error: error.message || 'Unable to generate Earth Engine map layer',
      fallback: true,
    });
  }
};
