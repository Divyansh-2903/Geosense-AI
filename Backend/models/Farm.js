const mongoose = require('mongoose');

const AnalysisHistorySchema = new mongoose.Schema({
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  ndvi: Number,
  ndwi: Number,
  smi: Number,
  vci: Number,
  evi: Number,
  savi: Number,
  indices: {
    ndvi: Number,
    ndwi: Number,
    smi: Number,
    vci: Number,
    evi: Number,
    savi: Number
  },
  sar: {
    vv: Number,
    vh: Number,
    vhVvRatio: Number
  },
  stressLevel: String,
  waterDeficit: Number,
  rainfall: Number,
  temperature: Number,
  weather: {
    rainfall: Number,
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    solarRadiation: Number,
    evaporation: Number
  },
  growthStage: String,
  diseaseRisk: String,
  diseaseName: String,
  agronomy: {
    cropCalendar: {
      crop: String,
      stage: String,
      stageOrder: Number,
      ndviStatus: String,
      recommendation: String
    },
    waterRequirementLitres: Number,
    waterRequirement: {
      deficitMm: Number,
      areaHectare: Number,
      litres: Number,
      recommendation: String
    },
    fertilizerPlan: {
      crop: String,
      growthStage: String,
      areaHectare: Number,
      nutrients: {
        nitrogenKg: Number,
        phosphorusKg: Number,
        potassiumKg: Number
      },
      totalKg: Number,
      recommendation: String
    },
    diseaseAdvisory: {
      diseaseName: String,
      riskLevel: String,
      recommendation: String,
      prevention: String
    },
    urgencyScore: Number,
    actionWindow: String
  },
  yieldPrediction: Number,
  revenuePrediction: Number,
  fertilizer: String,
  irrigationDetails: {
    priority: String,
    needed: Boolean,
    advice: String,
    waterRequirementLitres: Number,
    actionWindow: String,
    urgencyScore: Number
  },
  aiAdvice: String
});

const FarmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a field name'],
      trim: true
    },
    crop: {
      type: String,
      required: true,
      default: 'Rice'
    },
    areaHectare: {
      type: Number,
      required: true
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true
      },
      coordinates: {
        type: [[[Number]]], // Polygon coordinates: Array of rings, each ring is array of points [lon, lat]
        required: true
      }
    },
    analyses: [AnalysisHistorySchema]
  },
  {
    timestamps: true
  }
);

FarmSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Farm', FarmSchema);
