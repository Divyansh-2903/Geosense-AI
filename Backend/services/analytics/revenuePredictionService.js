const getMarketPrice =
require('../marketPriceService');

function predictRevenue({

    crop,

    yieldTonPerHectare,

    areaHectare

}) {

    const price =
        getMarketPrice(crop);

    const totalProduction =
        yieldTonPerHectare *
        areaHectare;

    const revenue =
        totalProduction *
        price;

    return {

        crop,

        areaHectare,

        yieldTonPerHectare,

        totalProduction,

        marketPrice: price,

        expectedRevenue:
            Math.round(revenue)

    };
}

module.exports =
predictRevenue;