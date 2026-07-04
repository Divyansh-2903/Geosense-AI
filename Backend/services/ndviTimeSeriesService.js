const ee = require('@google/earthengine');

async function getNDVITimeSeries(
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

    const months = ee.List.sequence(1, 12);

    const monthlyNDVI = months.map(
        function (month) {

            month = ee.Number(month);

            const start = ee.Date
                .fromYMD(2025, month, 1);

            const end =
                start.advance(1, 'month');

            const monthlyCollection =
                collection.filterDate(
                    start,
                    end
                );

            const image =
                monthlyCollection.median();

            const ndvi =
                ee.Algorithms.If(
                    monthlyCollection.size().gt(0),

                    image
                        .normalizedDifference(
                            ['B8', 'B4']
                        )
                        .rename('NDVI'),

                    ee.Image.constant(-999)
                        .rename('NDVI')
                );

            const ndviImage =
                ee.Image(ndvi);

            const stats =
                ndviImage.reduceRegion({
                    reducer: ee.Reducer.mean(),
                    geometry: geometry,
                    scale: 10,
                    maxPixels: 1e13
                });

            return ee.Feature(
                null,
                {
                    month: month,
                    imageCount:
                        monthlyCollection.size(),
                    ndvi:
                        stats.get('NDVI')
                }
            );
        }
    );

    const fc =
        ee.FeatureCollection(
            monthlyNDVI
        );

    console.log('FeatureCollection Created');;

    return fc;
}

module.exports =
    getNDVITimeSeries;