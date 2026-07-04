/**
 * Yield Prediction Machine Learning Foundation Service
 * Structures a boundary between rule-based fallbacks and ML regression models.
 */

const regressionMockModel = {
  predict: (features) => {
    // Simulated linear regression: Y = beta0 + beta1*NDVI + beta2*Health + beta3*Rainfall + beta4*Temp
    const { crop, ndvi, rainfall, temperature, healthScore } = features;
    
    // Beta parameters based on agronomic coefficients
    let beta0 = 1.2;
    let betaNdvi = 3.5;
    let betaHealth = 0.02;
    let betaRain = 0.001;
    let betaTemp = -0.05;
    
    if (crop === 'Rice') {
      beta0 = 2.0; betaNdvi = 4.5; betaHealth = 0.03; betaRain = 0.0015;
    } else if (crop === 'Wheat') {
      beta0 = 1.5; betaNdvi = 4.0; betaHealth = 0.025; betaRain = 0.0008;
    } else if (crop === 'Mustard') {
      beta0 = 0.5; betaNdvi = 2.0; betaHealth = 0.015; betaRain = 0.0005;
    } else if (crop === 'Bajra') {
      beta0 = 0.8; betaNdvi = 2.5; betaHealth = 0.018; betaRain = 0.0003;
    }
    
    const yieldEst = beta0 + (betaNdvi * ndvi) + (betaHealth * healthScore) + (betaRain * rainfall) + (betaTemp * temperature);
    return Math.max(0.5, yieldEst);
  }
};

function predictYield({
  crop,
  ndvi,
  rainfall,
  temperature,
  healthScore,
  useML = true
}) {
  console.log(`[ML Yield Predictor] Estimating yield for ${crop} with NDVI=${ndvi}, Health=${healthScore}`);
  
  if (useML) {
    try {
      const mlYield = regressionMockModel.predict({ crop, ndvi, rainfall, temperature, healthScore });
      console.log(`[ML Yield Predictor] ML Regression prediction: ${mlYield.toFixed(2)} t/ha`);
      return {
        crop,
        estimatedYield: mlYield.toFixed(2),
        unit: 'ton/hectare',
        method: 'ML Regression (XGBoost/RandomForest Mock)'
      };
    } catch (err) {
      console.warn('[ML Yield Predictor] ML prediction failed, using rule-based fallback');
    }
  }

  // Fallback: Rule-based logic
  let baseYield = 0;
  switch (crop) {
    case 'Rice': baseYield = 6; break;
    case 'Wheat': baseYield = 5; break;
    case 'Mustard': baseYield = 2; break;
    case 'Bajra': baseYield = 3; break;
    default: baseYield = 2;
  }

  const ndviFactor = ndvi / 0.7;
  const healthFactor = healthScore / 100;
  const estimatedYield = baseYield * ndviFactor * healthFactor;

  return {
    crop,
    estimatedYield: estimatedYield.toFixed(2),
    unit: 'ton/hectare',
    method: 'Rule-based analytical model'
  };
}

module.exports = predictYield;