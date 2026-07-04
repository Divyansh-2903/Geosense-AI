const ee = require('@google/earthengine');

async function getTemperature(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {

  const temperature = ee.ImageCollection(
    'ECMWF/ERA5_LAND/DAILY_AGGR'
  )
    .filterDate(startDate, endDate)
    .select('temperature_2m')
    .mean()
    .subtract(273.15);

  return temperature.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 10000,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getTemperature;
