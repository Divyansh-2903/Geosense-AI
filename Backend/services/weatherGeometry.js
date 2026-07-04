const ee = require('@google/earthengine');

function getWeatherGeometry(fieldGeometry) {

  return fieldGeometry
    .centroid()
    .buffer(10000);

}

module.exports = getWeatherGeometry;