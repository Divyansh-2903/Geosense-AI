function calculateVCI({ collection, ndviImage }) {
  const ndviCollection = collection.map((image) =>
    image.normalizedDifference(['B8', 'B4']).rename('NDVI')
  );

  const ndviMin = ndviCollection.min();
  const ndviMax = ndviCollection.max();
  const denominator = ndviMax.subtract(ndviMin);
  const safeDenominator = denominator.where(denominator.eq(0), 0.0001);

  return ndviImage
    .subtract(ndviMin)
    .divide(safeDenominator)
    .rename('VCI')
    .clamp(0, 1);
}

module.exports = calculateVCI;
