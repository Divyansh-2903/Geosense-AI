const getCropCalendar = require('./cropCalendarService');
const getWaterRequirement = require('./waterRequirementService');
const getFertilizerPlan = require('./fertilizerQuantityService');
const getDiseaseAdvisory = require('./diseaseAdvisoryService');

function getActionWindow(urgencyScore) {
  if (urgencyScore >= 75) return 'within 24h';
  if (urgencyScore >= 50) return 'within 48h';
  return 'within 7 days';
}

function getUrgencyScore({ waterRequirementLitres, diseaseRisk, healthScore, ndvi, ndwi }) {
  let score = 0;

  if (waterRequirementLitres > 100000) score += 35;
  else if (waterRequirementLitres > 30000) score += 22;
  else if (waterRequirementLitres > 0) score += 10;

  if ((diseaseRisk || '').toUpperCase() === 'HIGH') score += 35;
  else if ((diseaseRisk || '').toUpperCase() === 'MODERATE') score += 20;

  if (healthScore < 40) score += 25;
  else if (healthScore < 70) score += 15;

  if (ndvi < 0.4) score += 10;
  if (ndwi < -0.3) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildAgronomyRecommendation({
  crop,
  growthStage,
  ndvi,
  ndwi,
  waterDeficit,
  areaHectare,
  temperature,
  rainfall,
  diseaseRisk,
  diseaseName,
  healthScore
}) {
  const cropCalendar = getCropCalendar({ crop, growthStage, ndvi });
  const waterRequirement = getWaterRequirement({ waterDeficit, areaHectare, growthStage, temperature });
  const fertilizerPlan = getFertilizerPlan({ crop, growthStage, ndvi, areaHectare });
  const diseaseAdvisory = getDiseaseAdvisory({ diseaseRisk, diseaseName, crop, temperature, rainfall });
  const urgencyScore = getUrgencyScore({
    waterRequirementLitres: waterRequirement.litres,
    diseaseRisk,
    healthScore,
    ndvi,
    ndwi
  });

  return {
    cropCalendar,
    waterRequirementLitres: waterRequirement.litres,
    waterRequirement,
    fertilizerPlan,
    diseaseAdvisory,
    urgencyScore,
    actionWindow: getActionWindow(urgencyScore)
  };
}

module.exports = buildAgronomyRecommendation;
