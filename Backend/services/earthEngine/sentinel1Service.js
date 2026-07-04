const ee = require('@google/earthengine');

function toLinear(dbImage) {
  return ee.Image(10).pow(dbImage.divide(10));
}

async function getSentinel1SarImage(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  const collection = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
    .select(['VV', 'VH']);

  const composite = collection.median().clip(geometry);
  const vv = composite.select('VV').rename('VV');
  const vh = composite.select('VH').rename('VH');
  const vhVvRatio = toLinear(vh).divide(toLinear(vv)).rename('VH_VV_RATIO');

  return ee.Image.cat([vv, vh, vhVvRatio]);
}

async function getSentinel1SarMetrics(geometry, startDate = '2025-01-01', endDate = '2025-12-31') {
  const image = await getSentinel1SarImage(geometry, startDate, endDate);

  return image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry,
    scale: 10,
    maxPixels: 1e13,
    bestEffort: true
  });
}

module.exports = getSentinel1SarMetrics;
module.exports.getSentinel1SarImage = getSentinel1SarImage;
