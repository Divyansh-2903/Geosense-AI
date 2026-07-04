async function buildFarmAnalysis({
    crop,
    ndvi,
    ndwi,
    smi,
    vci,
    evi,
    savi,
    sar,
    rainfall,
    temperature,
    weather,
    waterDeficit,
    healthScore,
    growthStage,
    diseaseRisk,
    agronomy,
    irrigationRecommendation,
    yieldPrediction,
    revenuePrediction
}) {
    return {
        crop,
        ndvi,
        ndwi,
        smi,
        vci,
        evi,
        savi,
        indices: {
            ndvi,
            ndwi,
            smi,
            vci,
            evi,
            savi
        },
        sar,
        rainfall,
        temperature,
        weather,
        waterDeficit,
        healthScore,
        growthStage,
        diseaseRisk,
        agronomy,
        irrigationRecommendation,
        yieldPrediction,
        revenuePrediction,
        generatedAt: new Date().toISOString()
    };
}

module.exports = buildFarmAnalysis;
