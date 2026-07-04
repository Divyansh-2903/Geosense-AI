function detectGrowthStage(
  monthlyNDVI
) {

  const latest =
    monthlyNDVI[
      monthlyNDVI.length - 1
    ];

  const ndvi =
    latest.ndvi;

  let stage =
    'Unknown';

  if (ndvi < 0.2) {
    stage = 'Bare Soil';
  }

  else if (ndvi < 0.4) {
    stage = 'Seedling';
  }

  else if (ndvi < 0.6) {
    stage = 'Vegetative';
  }

  else if (ndvi < 0.8) {
    stage = 'Flowering';
  }

  else {
    stage = 'Maturity';
  }

  return {
    currentNDVI: ndvi,
    growthStage: stage
  };
}

module.exports =
detectGrowthStage;