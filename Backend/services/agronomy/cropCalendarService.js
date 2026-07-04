const STAGE_ORDER = {
  'Bare Soil': 0,
  Seedling: 1,
  Vegetative: 2,
  Flowering: 3,
  Maturity: 4,
  Unknown: 0
};

const STAGE_ACTIONS = {
  'Bare Soil': 'Prepare bed, verify soil moisture, and plan sowing window.',
  Seedling: 'Protect emergence with light irrigation and early weed control.',
  Vegetative: 'Prioritize nitrogen availability, canopy growth, and pest scouting.',
  Flowering: 'Avoid water stress and protect flowers from disease pressure.',
  Maturity: 'Reduce excess irrigation and prepare harvest timing checks.',
  Unknown: 'Run another analysis after crop canopy is visible.'
};

function getCropCalendar({ crop, growthStage, ndvi }) {
  const stage = growthStage || 'Unknown';
  const stageOrder = STAGE_ORDER[stage] ?? STAGE_ORDER.Unknown;
  const ndviStatus = ndvi >= 0.7 ? 'strong canopy' : ndvi >= 0.45 ? 'developing canopy' : 'weak canopy';

  return {
    crop,
    stage,
    stageOrder,
    ndviStatus,
    recommendation: STAGE_ACTIONS[stage] || STAGE_ACTIONS.Unknown
  };
}

module.exports = getCropCalendar;
