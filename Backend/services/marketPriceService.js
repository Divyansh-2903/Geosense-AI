function getMarketPrice(crop) {

    const prices = {

        Rice: 2300,

        Wheat: 2425,

        Mustard: 5650,

        Bajra: 2625,

        Cotton: 7100,

        Soybean: 4892
    };

    return prices[crop] || 2000;
}

module.exports = getMarketPrice;