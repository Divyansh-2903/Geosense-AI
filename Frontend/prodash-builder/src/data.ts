import { Field, ActivityLog, WeatherDay } from './types';

export const INITIAL_FIELDS: Field[] = [];

export const INITIAL_LOGS: ActivityLog[] = [];

export const WEEKLY_WEATHER_DAYS: WeatherDay[] = [
  { date: 'Mon', temp: 21, rain: 0, et: 3.2, status: 'Optimal' },
  { date: 'Tue', temp: 23, rain: 0, et: 4.1, status: 'Optimal' },
  { date: 'Wed', temp: 24, rain: 0, et: 4.5, status: 'Optimal' },
  { date: 'Thu', temp: 26, rain: 8, et: 2.2, status: 'Optimal' },
  { date: 'Fri', temp: 25, rain: 4, et: 2.9, status: 'Optimal' },
  { date: 'Sat', temp: 24, rain: 0, et: 3.8, status: 'Optimal' },
  { date: 'Sun', temp: 28, rain: 0, et: 5.2, status: 'High Heat' }
];

export const HISTORIC_WEATHER: WeatherDay[] = [
  { date: 'Oct 24', temp: 22, rain: 0, et: 3.5, status: 'Dry' },
  { date: 'Oct 23', temp: 19, rain: 12, et: 1.1, status: 'Optimal' },
  { date: 'Oct 22', temp: 20, rain: 2, et: 2.3, status: 'Optimal' },
  { date: 'Oct 21', temp: 25, rain: 0, et: 4.2, status: 'High Heat' },
  { date: 'Oct 20', temp: 24, rain: 0, et: 3.8, status: 'Dry' },
  { date: 'Oct 19', temp: 22, rain: 1, et: 2.9, status: 'Optimal' }
];


export const ACCORDION_FAQS = [
  {
    question: 'What Data Sources Do You Use?',
    answer: 'GeoHarvest aggregates continuous multispectral imagery from the ESA Sentinel-2 satellite constellation at a 10m spatial resolution, combined with local weather stations and the ERA5-Land reanalysis dataset to generate hyper-local evapotranspiration indexes.'
  },
  {
    question: 'How Accurate Is The Yield Prediction?',
    answer: 'By training localized Random Forest regression models on five seasons of historic biomass indices (NDVI) and localized crop phenology indices, our yield estimations maintain an 88% overall accuracy for corn, soy, and spring wheat, increasing further as the crop approaches maturity.'
  },
  {
    question: 'Can I Integrate My Existing John Deere Equipment?',
    answer: 'Absolutely. We support the ISOBUS standard and John Deere Operations Center API, allowing you to export prescription maps (VRA irrigation/fertilization) generated on our Crop Analytics tab directly into your standard field terminals.'
  },
  {
    question: 'Do You Offer Support During Harvest Season?',
    answer: 'Yes, we provide 24/7 dedicated support priority lines to our Enterprise and Business users, with agronomy-certified field techs available for phone consultations and drone-pass priority requests.'
  }
];
