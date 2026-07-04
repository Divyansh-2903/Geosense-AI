function calculateCropHealth({
  ndvi,
  ndwi,
  temperature,
  waterDeficit
}) {

  let score = 100;

  // Vegetation health
  if (ndvi < 0.2) score -= 40;
  else if (ndvi < 0.4) score -= 25;
  else if (ndvi < 0.6) score -= 10;

  // Water availability
  if (ndwi < -0.5) score -= 20;
  else if (ndwi < -0.2) score -= 10;

  // Temperature stress
  if (temperature > 40) score -= 20;
  else if (temperature > 35) score -= 10;

  // Water deficit
  if (waterDeficit > 300) score -= 20;
  else if (waterDeficit > 100) score -= 10;

  score = Math.max(0, Math.min(100, score));

  let stressLevel = 'LOW';

  if (score < 40) {
    stressLevel = 'HIGH';
  } else if (score < 70) {
    stressLevel = 'MODERATE';
  }

  return {
    healthScore: score,
    stressLevel,
    status:
      score >= 70
        ? 'Healthy Crop'
        : score >= 40
        ? 'Needs Attention'
        : 'Critical'
  };
}

module.exports =
  calculateCropHealth;