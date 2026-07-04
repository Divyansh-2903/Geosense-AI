const Farm = require('../models/Farm');
const notificationService = require('../services/notificationService');

// @desc    Create a new farm field
// @route   POST /api/farms
// @access  Private
exports.createFarm = async (req, res) => {
  try {
    const { name, crop, areaHectare, geometry } = req.body;

    if (!name || !geometry || !areaHectare) {
      return res.status(400).json({ error: 'Please provide farm name, area, and geometry' });
    }

    const farm = await Farm.create({
      userId: req.user._id,
      name,
      crop: crop || 'Rice',
      areaHectare,
      geometry
    });

    res.status(201).json(farm);
  } catch (error) {
    console.error('Error in createFarm:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all farms for the logged-in user
// @route   GET /api/farms
// @access  Private
exports.getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user._id }).sort({ createdAt: -1 });
    farms.forEach((farm) => {
      farm.analyses.sort((a, b) => new Date(b.calculatedAt) - new Date(a.calculatedAt));
      farm.analyses = farm.analyses.slice(0, 50);
    });
    res.json(farms);
  } catch (error) {
    console.error('Error in getFarms:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single farm by ID (with history)
// @route   GET /api/farms/:id
// @access  Private
exports.getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    farm.analyses.sort((a, b) => new Date(b.calculatedAt) - new Date(a.calculatedAt));
    farm.analyses = farm.analyses.slice(0, 50);

    res.json(farm);
  } catch (error) {
    console.error('Error in getFarmById:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get saved analysis history for a farm
// @route   GET /api/farms/:id/history
// @access  Private
exports.getFarmHistory = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id }).select('analyses');

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const history = [...farm.analyses]
      .sort((a, b) => new Date(b.calculatedAt) - new Date(a.calculatedAt))
      .slice(0, 50);

    res.json(history);
  } catch (error) {
    console.error('Error in getFarmHistory:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a farm
// @route   DELETE /api/farms/:id
// @access  Private
exports.deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found or unauthorized' });
    }

    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFarm:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Save an analysis report to a farm
// @route   POST /api/farms/:id/analysis
// @access  Private
exports.saveAnalysisToFarm = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Add analysis to start of history array and retain the latest 50 records.
    farm.analyses.unshift({
      ...req.body,
      calculatedAt: req.body.calculatedAt || new Date()
    });
    farm.analyses.sort((a, b) => new Date(b.calculatedAt) - new Date(a.calculatedAt));
    farm.analyses = farm.analyses.slice(0, 50);
    await farm.save();

    // If stress level is Critical or High, trigger SMS/WhatsApp placeholder alert
    const stressLvl = (req.body.stressLevel || '').toUpperCase();
    if (stressLvl === 'CRITICAL' || stressLvl === 'HIGH') {
      const recipientPhone = req.user.phone || '+91 98765 43210';
      const message = `🌱 AgriSense AI Alert: Critical moisture stress detected in your farm field "${farm.name}". Water Deficit: ${req.body.waterDeficit || 0}mm. Urgency Score: ${req.body.agronomy?.urgencyScore || 90}/100. Action required immediately.`;
      
      // Asynchronously invoke simulated notifications
      notificationService.sendSMS(recipientPhone, message)
        .then(result => console.log('Simulated SMS sent successfully:', result.messageId))
        .catch(err => console.error('Simulated SMS error:', err.message));
        
      notificationService.sendWhatsApp(recipientPhone, message)
        .then(result => console.log('Simulated WhatsApp sent successfully:', result.messageId))
        .catch(err => console.error('Simulated WhatsApp error:', err.message));
    }

    res.status(201).json(farm);
  } catch (error) {
    console.error('Error in saveAnalysisToFarm:', error);
    res.status(500).json({ error: error.message });
  }
};
