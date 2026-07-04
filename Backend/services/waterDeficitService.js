const ee = require('@google/earthengine');

function calculateWaterDeficit(
  rainfallData,
  etData
) {

  const rainfall = ee.Number(
    rainfallData.get(
      'precipitation'
    )
  );

  const et = ee.Number(
    etData.get(
      'potential_evaporation_sum'
    )
  );

  return et.subtract(
    rainfall
  );
}

module.exports =
  calculateWaterDeficit;