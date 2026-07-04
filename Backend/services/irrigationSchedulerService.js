function getIrrigationSchedule({

    waterDeficit,
    growthStage

}) {

    let nextIrrigation;

    if (waterDeficit > 500) {

        nextIrrigation =
            'Within 24 Hours';

    } else if (
        waterDeficit > 200
    ) {

        nextIrrigation =
            'Within 2 Days';

    } else {

        nextIrrigation =
            'Within 5 Days';
    }

    return {

        growthStage,

        waterDeficit,

        nextIrrigation
    };
}

module.exports =
getIrrigationSchedule;