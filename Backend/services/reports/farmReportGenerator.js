function generateFarmReport(data) {
    return {
        farmId: data.farmId,
        crop: data.crop,
        ndvi: data.ndvi,
        ndwi: data.ndwi,
        smi: data.smi,
        vci: data.vci,
        evi: data.evi,
        savi: data.savi,
        indices: data.indices || {
            ndvi: data.ndvi,
            ndwi: data.ndwi,
            smi: data.smi,
            vci: data.vci,
            evi: data.evi,
            savi: data.savi
        },
        sar: data.sar,
        rainfall: data.rainfall,
        temperature: data.temperature,
        weather: data.weather,
        waterDeficit: data.waterDeficit,
        healthScore: data.healthScore,
        growthStage: data.growthStage,
        diseaseRisk: data.diseaseRisk,
        agronomy: data.agronomy,
        irrigation: data.irrigation || data.irrigationRecommendation,
        fertilizer: data.fertilizer,
        yieldPrediction: data.yieldPrediction,
        revenuePrediction: data.revenuePrediction,
        calculatedAreaHectare: data.calculatedAreaHectare,
        areaHectare: data.areaHectare,
        ndwiStress: data.ndwiStress,
        diseaseName: data.diseaseName,
        irrigationDetails: data.irrigationDetails,
        trends: data.trends,
        generatedAt: new Date().toISOString()
    };
}

module.exports = generateFarmReport;
