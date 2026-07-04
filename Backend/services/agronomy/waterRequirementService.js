const STAGE_MULTIPLIER = {
  'Bare Soil': 0.4,
  Seedling: 0.7,
  Vegetative: 1,
  Flowering: 1.15,
  Maturity: 0.65,
  Unknown: 1
};

function getWaterRequirement({ waterDeficit, areaHectare, growthStage, temperature }) {
  const deficitMm = Math.abs(Number(waterDeficit) || 0);
  const hectare = Math.max(Number(areaHectare) || 0, 0);
  const stageMultiplier = STAGE_MULTIPLIER[growthStage] || STAGE_MULTIPLIER.Unknown;
  const heatMultiplier = Number(temperature) > 36 ? 1.15 : Number(temperature) > 32 ? 1.08 : 1;
  const litres = Math.round(deficitMm * hectare * 10000 * stageMultiplier * heatMultiplier);

  return {
    deficitMm: parseFloat(deficitMm.toFixed(2)),
    areaHectare: parseFloat(hectare.toFixed(2)),
    litres,
    recommendation: litres > 0
      ? `Apply approximately ${litres.toLocaleString('en-IN')} litres across the mapped field.`
      : 'No supplemental irrigation volume is required from the current deficit estimate.'
  };
}

module.exports = getWaterRequirement;
