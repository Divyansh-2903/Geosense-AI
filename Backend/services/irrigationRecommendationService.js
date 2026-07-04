function getIrrigationRecommendation({
  waterDeficit,
  temperature,
  growthStage
}) {

  let irrigationNeeded = false;

  let priority = "LOW";

  let recommendation = "";

  if (
    waterDeficit > 300 ||
    temperature > 38
  ) {

    irrigationNeeded = true;
    priority = "HIGH";

    recommendation =
      "Immediate irrigation recommended";

  }

  else if (
    waterDeficit > 100
  ) {

    irrigationNeeded = true;
    priority = "MEDIUM";

    recommendation =
      "Irrigate within 2-3 days";

  }

  else {

    recommendation =
      "No irrigation needed";

  }

  return {
    irrigationNeeded,
    priority,
    growthStage,
    recommendation
  };

}

module.exports =
getIrrigationRecommendation;