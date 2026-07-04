const ee = require('@google/earthengine');

async function getSolarRadiation(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  const solarRadiation = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
    .filterDate(startDate, endDate)
    .select('surface_solar_radiation_downwards_sum')
    .mean()
    .divide(86400)
    .rename('solarRadiation');

  return solarRadiation.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry,
    scale: 10000,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getSolarRadiation;
