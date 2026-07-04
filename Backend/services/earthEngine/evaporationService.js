const ee = require('@google/earthengine');

async function getEvaporation(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  const evaporation = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
    .filterDate(startDate, endDate)
    .select('potential_evaporation_sum')
    .mean()
    .multiply(-1000)
    .rename('evaporation');

  return evaporation.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry,
    scale: 10000,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getEvaporation;
