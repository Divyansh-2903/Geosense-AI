/**
 * Crop Classification Machine Learning Foundation Service
 * Structures a clear boundary between rule-based fallbacks and ML model scoring.
 */

const tfMockModel = {
  predict: (features) => {
    // Simulated tensor dot-product / Random Forest decision tree scoring
    const [ndvi, rainfall, temperature] = features;
    
    // We compute a probability distribution across classes
    // Class order: [Rice, Wheat, Bajra, Mustard]
    const weights = {
      Rice: ndvi * 0.5 + (rainfall / 1500) * 0.4 - (temperature / 40) * 0.1,
      Wheat: ndvi * 0.4 + (1 - temperature / 35) * 0.5 - (rainfall / 1000) * 0.1,
      Bajra: (temperature / 45) * 0.6 + ndvi * 0.2 - (rainfall / 500) * 0.3,
      Mustard: (1 - rainfall / 400) * 0.5 + ndvi * 0.3 - (temperature / 35) * 0.1,
    };
    
    let bestClass = 'Unknown';
    let maxWeight = -Infinity;
    for (const [className, w] of Object.entries(weights)) {
      if (w > maxWeight) {
        maxWeight = w;
        bestClass = className;
      }
    }
    return {
      prediction: bestClass,
      confidence: Math.max(0.1, Math.min(0.99, 0.5 + maxWeight * 0.4)),
      probabilities: weights
    };
  }
};

function classifyCrop({ ndvi, rainfall, temperature, useML = true }) {
  console.log(`[ML Crop Classifier] Running inference with features: NDVI=${ndvi}, Rainfall=${rainfall}, Temp=${temperature}`);
  
  if (useML) {
    try {
      const mlResult = tfMockModel.predict([ndvi, rainfall, temperature]);
      console.log(`[ML Crop Classifier] Prediction: ${mlResult.prediction} (Confidence: ${Math.round(mlResult.confidence * 100)}%)`);
      return mlResult.prediction;
    } catch (err) {
      console.warn('[ML Crop Classifier] ML inference failed, using rule-based fallback');
    }
  }

  // Fallback: Rule-based logic
  if (ndvi > 0.65 && rainfall > 700) return "Rice";
  if (ndvi > 0.55 && temperature < 30) return "Wheat";
  if (ndvi > 0.45 && temperature > 30) return "Bajra";
  if (ndvi > 0.35 && rainfall < 500) return "Mustard";
  return "Unknown";
}

module.exports = classifyCrop;