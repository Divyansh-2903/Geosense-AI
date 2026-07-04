const ee = require('@google/earthengine');

function calculateStress(
  ndviData,
  ndwiData,
  deficit
) {

  const ndvi = ee.Number(
    ndviData.get('NDVI')
  );

  const ndwi = ee.Number(
    ndwiData.get('NDWI')
  );

  const waterDeficit =
    ee.Number(deficit);

  return ee.Algorithms.If(

    ndvi.gt(0.6)
      .and(ndwi.gt(0))
      .and(
        waterDeficit.lt(100)
      ),

    'LOW',

    ee.Algorithms.If(
      waterDeficit.lt(300),
      'MODERATE',
      'HIGH'
    )
  );
}

module.exports =
  calculateStress;