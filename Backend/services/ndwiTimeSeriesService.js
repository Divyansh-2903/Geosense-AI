const ee = require('@google/earthengine');

async function getNDWITimeSeries(
  geometry,
  startDate = '2025-01-01',
  endDate = '2025-12-31'
) {

  const collection = ee.ImageCollection(
    'COPERNICUS/S2_SR_HARMONIZED'
  )
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(
      ee.Filter.lt(
        'CLOUDY_PIXEL_PERCENTAGE',
        20
      )
    );

  const months =
    ee.List.sequence(1, 12);

  const monthlyNDWI =
    months.map(function(month){

      month = ee.Number(month);

      const start =
        ee.Date.fromYMD(
          2025,
          month,
          1
        );

      const end =
        start.advance(
          1,
          'month'
        );

      const monthlyCollection =
        collection.filterDate(
          start,
          end
        );

      const image =
        monthlyCollection.median();

      const ndwi =
        ee.Algorithms.If(

          monthlyCollection
            .size()
            .gt(0),

          image
            .normalizedDifference(
              ['B3','B8']
            )
            .rename('NDWI'),

          ee.Image
            .constant(-999)
            .rename('NDWI')
        );

      const ndwiImage =
        ee.Image(ndwi);

      const stats =
        ndwiImage.reduceRegion({
          reducer:
            ee.Reducer.mean(),
          geometry:
            geometry,
          scale:10,
          maxPixels:1e13
        });

      return ee.Feature(
        null,
        {
          month: month,
          imageCount:
            monthlyCollection.size(),
          ndwi:
            stats.get('NDWI')
        }
      );

    });

  return ee.FeatureCollection(
    monthlyNDWI
  );
}

module.exports =
  getNDWITimeSeries;