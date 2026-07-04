const ee = require('@google/earthengine');
const { getSentinel2Composite } = require('./sentinel2CompositeService');

async function calculateNDVI(
  geometry,
  composite,
  startDate = '2025-01-01',
  endDate = '2025-12-31'
) {

  const image = composite || getSentinel2Composite(geometry, startDate, endDate);

  const ndvi =
  image
    .normalizedDifference(
      ['B8', 'B4']
    )
    .rename('NDVI');

  return ndvi;
}

module.exports = calculateNDVI;
