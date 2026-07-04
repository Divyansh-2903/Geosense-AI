function getFertilizerRecommendation({

    ndvi,
    crop,
    growthStage

}) {

    const recommendations = [];

    if (ndvi < 0.4) {

        recommendations.push(
            'Apply Nitrogen fertilizer'
        );
    }

    if (
        growthStage === 'Vegetative'
    ) {

        recommendations.push(
            'Apply NPK 20:20:20'
        );
    }

    if (
        growthStage === 'Flowering'
    ) {

        recommendations.push(
            'Apply Potassium rich fertilizer'
        );
    }

    if (
        recommendations.length === 0
    ) {

        recommendations.push(
            'No urgent fertilizer required'
        );
    }

    return {

        crop,

        growthStage,

        recommendations
    };
}

module.exports =
getFertilizerRecommendation;