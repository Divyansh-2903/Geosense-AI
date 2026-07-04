const ee = require('@google/earthengine');

async function getRainfall(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {

  const rainfall = ee.ImageCollection(
    'UCSB-CHG/CHIRPS/DAILY'
  )
  .filterDate(startDate, endDate)
  .sum();

  return rainfall.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 5000,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getRainfall;
