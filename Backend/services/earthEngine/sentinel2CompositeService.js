const ee = require('@google/earthengine');

function getSentinel2Collection(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 60));
}

function getSentinel2Composite(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  return getSentinel2Collection(geometry, startDate, endDate)
    .median()
    .clip(geometry);
}

module.exports = {
  getSentinel2Collection,
  getSentinel2Composite
};
