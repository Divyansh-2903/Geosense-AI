function getDiseaseAdvisory({ diseaseRisk, diseaseName, crop, temperature, rainfall }) {
  const level = (diseaseRisk || 'LOW').toUpperCase();
  const likelyDisease = diseaseName || 'No Major Risk';
  const highMoisturePressure = Number(rainfall) > 700 && Number(temperature) >= 20 && Number(temperature) <= 32;

  if (level === 'HIGH') {
    return {
      diseaseName: likelyDisease,
      riskLevel: level,
      recommendation: `Scout ${crop} within 24 hours for ${likelyDisease.toLowerCase()} symptoms and apply a locally approved preventive treatment if lesions or canopy humidity persist.`,
      prevention: highMoisturePressure
        ? 'Improve airflow, avoid late-day irrigation, and remove heavily infected residue.'
        : 'Inspect lower leaves and field edges twice this week.'
    };
  }

  if (level === 'MODERATE') {
    return {
      diseaseName: likelyDisease,
      riskLevel: level,
      recommendation: `Inspect ${crop} within 48 hours and prepare treatment only if symptoms expand.`,
      prevention: 'Keep irrigation off foliage and continue weekly scouting.'
    };
  }

  return {
    diseaseName: likelyDisease,
    riskLevel: level,
    recommendation: `No disease-specific treatment is required for ${crop} right now.`,
    prevention: 'Maintain routine scouting and avoid unnecessary chemical application.'
  };
}

module.exports = getDiseaseAdvisory;
