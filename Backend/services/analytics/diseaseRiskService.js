function getDiseaseRisk({

    temperature,
    rainfall,
    ndvi,
    ndwi

}) {

    let riskScore = 0;

    // Humidity proxy
    if (ndwi > -0.2)
        riskScore += 40;

    else if (ndwi > -0.4)
        riskScore += 20;

    // Rainfall effect
    if (rainfall > 800)
        riskScore += 30;

    else if (rainfall > 500)
        riskScore += 15;

    // Temperature effect
    if (
        temperature >= 20 &&
        temperature <= 30
    )
        riskScore += 30;

    let level = 'LOW';

    if (riskScore >= 70)
        level = 'HIGH';

    else if (riskScore >= 40)
        level = 'MODERATE';

    let disease = 'No Major Risk';

    if (level === 'HIGH')
        disease =
            'Fungal Disease Risk';

    return {

        riskScore,

        level,

        likelyDisease:
            disease
    };
}

module.exports =
getDiseaseRisk;