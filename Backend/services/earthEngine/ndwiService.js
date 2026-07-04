const ee = require('@google/earthengine');
const { getSentinel2Composite } = require('./sentinel2CompositeService');

async function calculateNDWI(
  geometry,
  composite,
  startDate = '2025-01-01',
  endDate = '2025-12-31'
) {

  const image = composite || getSentinel2Composite(geometry, startDate, endDate);

  return image
    .normalizedDifference(
      ['B3', 'B8']
    )
    .rename('NDWI');
}

module.exports =
  calculateNDWI;
