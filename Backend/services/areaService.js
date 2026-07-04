const ee =
require('@google/earthengine');

function calculateArea(
    geometry
) {
    return geometry.area();
}

module.exports =
calculateArea;