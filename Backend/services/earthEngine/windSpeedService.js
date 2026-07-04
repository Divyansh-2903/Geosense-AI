const ee = require('@google/earthengine');

async function getWindSpeed(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  const image = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
    .filterDate(startDate, endDate)
    .select(['u_component_of_wind_10m', 'v_component_of_wind_10m'])
    .mean();

  const windSpeed = image
    .select('u_component_of_wind_10m')
    .pow(2)
    .add(image.select('v_component_of_wind_10m').pow(2))
    .sqrt()
    .multiply(3.6)
    .rename('windSpeed');

  return windSpeed.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry,
    scale: 10000,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getWindSpeed;
