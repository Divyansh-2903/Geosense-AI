const ee = require('@google/earthengine');

async function getET(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {

  const etImage = ee.ImageCollection(
    'ECMWF/ERA5_LAND/DAILY_AGGR'
  )
    .filterDate(startDate, endDate)
    .select('potential_evaporation_sum')
    .sum();

  return etImage.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 10000,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getET;
