function calculateSAVI(composite, soilBrightnessFactor = 0.5) {
  const reflectance = composite.select(['B8', 'B4']).divide(10000);

  return reflectance
    .expression(
      '((NIR - RED) / (NIR + RED + L)) * (1 + L)',
      {
        NIR: reflectance.select('B8'),
        RED: reflectance.select('B4'),
        L: soilBrightnessFactor
      }
    )
    .rename('SAVI')
    .clamp(-1, 1);
}

module.exports = calculateSAVI;
