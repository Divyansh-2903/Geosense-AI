const { getSentinel1SarImage } = require('./sentinel1Service');

async function calculateSMI({ geometry, ndwiImage, startDate = '2025-01-01', endDate = '2025-12-31' }) {
  const sarImage = await getSentinel1SarImage(geometry, startDate, endDate);
  const normalizedNdwi = ndwiImage.add(1).divide(2).clamp(0, 1);
  const normalizedSarMoisture = sarImage.select('VH_VV_RATIO').divide(0.5).clamp(0, 1);

  return normalizedNdwi
    .add(normalizedSarMoisture)
    .divide(2)
    .rename('SMI')
    .clamp(0, 1);
}

module.exports = calculateSMI;
