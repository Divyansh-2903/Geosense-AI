function calculateEVI(composite) {
  const reflectance = composite.select(['B8', 'B4', 'B2']).divide(10000);

  return reflectance
    .expression(
      '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
      {
        NIR: reflectance.select('B8'),
        RED: reflectance.select('B4'),
        BLUE: reflectance.select('B2')
      }
    )
    .rename('EVI')
    .clamp(-1, 1);
}

module.exports = calculateEVI;
