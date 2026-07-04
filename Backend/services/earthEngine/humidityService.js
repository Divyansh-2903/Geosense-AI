const ee = require('@google/earthengine');

async function getHumidity(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  const image = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
    .filterDate(startDate, endDate)
    .select(['temperature_2m', 'dewpoint_temperature_2m'])
    .mean();

  const tempC = image.select('temperature_2m').subtract(273.15);
  const dewpointC = image.select('dewpoint_temperature_2m').subtract(273.15);

  const saturationVaporPressure = tempC
    .multiply(17.625)
    .divide(tempC.add(243.04))
    .exp();
  const actualVaporPressure = dewpointC
    .multiply(17.625)
    .divide(dewpointC.add(243.04))
    .exp();

  const relativeHumidity = actualVaporPressure
    .divide(saturationVaporPressure)
    .multiply(100)
    .clamp(0, 100)
    .rename('humidity');

  return relativeHumidity.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry,
    scale: 10000,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getHumidity;
