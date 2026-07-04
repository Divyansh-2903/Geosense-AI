const BASE_RATES_KG_PER_HA = {
  Rice: {
    nitrogen: 45,
    phosphorus: 20,
    potassium: 30
  },
  Wheat: {
    nitrogen: 40,
    phosphorus: 20,
    potassium: 20
  },
  Mustard: {
    nitrogen: 30,
    phosphorus: 20,
    potassium: 15
  },
  Cotton: {
    nitrogen: 35,
    phosphorus: 18,
    potassium: 25
  },
  Default: {
    nitrogen: 32,
    phosphorus: 18,
    potassium: 20
  }
};

function roundKg(value) {
  return Math.max(0, Math.round(value));
}

function getFertilizerPlan({ crop, growthStage, ndvi, areaHectare }) {
  const rates = BASE_RATES_KG_PER_HA[crop] || BASE_RATES_KG_PER_HA.Default;
  const hectare = Math.max(Number(areaHectare) || 0, 0);
  const stressMultiplier = ndvi < 0.4 ? 1.25 : ndvi < 0.6 ? 1.1 : 1;
  const stageMultiplier = growthStage === 'Flowering' ? 0.85 : growthStage === 'Maturity' ? 0.35 : 1;

  const nitrogenKg = roundKg(rates.nitrogen * hectare * stressMultiplier * stageMultiplier);
  const phosphorusKg = roundKg(rates.phosphorus * hectare * stageMultiplier);
  const potassiumKg = roundKg(rates.potassium * hectare * (growthStage === 'Flowering' ? 1.2 : stageMultiplier));

  return {
    crop,
    growthStage,
    areaHectare: parseFloat(hectare.toFixed(2)),
    nutrients: {
      nitrogenKg,
      phosphorusKg,
      potassiumKg
    },
    totalKg: nitrogenKg + phosphorusKg + potassiumKg,
    recommendation: `Apply about ${nitrogenKg} kg N, ${phosphorusKg} kg P, and ${potassiumKg} kg K for this field.`
  };
}

module.exports = getFertilizerPlan;
