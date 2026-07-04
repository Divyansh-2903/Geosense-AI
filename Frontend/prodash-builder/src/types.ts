/**
 * GeoHarvest Type Definitions
 */

export type StressStatus = 'Optimal' | 'Marginal' | 'Critical';

export interface RemoteSensingIndices {
  ndvi?: number;
  ndwi?: number;
  smi?: number;
  vci?: number;
  evi?: number;
  savi?: number;
}

export interface WeatherMetrics {
  rainfall?: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  solarRadiation?: number;
  evaporation?: number;
}

export interface FarmAnalysisHistory {
  _id?: string;
  calculatedAt?: string;
  generatedAt?: string;
  ndvi?: number;
  ndwi?: number;
  smi?: number;
  vci?: number;
  evi?: number;
  savi?: number;
  indices?: RemoteSensingIndices;
  sar?: {
    vv?: number;
    vh?: number;
    vhVvRatio?: number;
  };
  stressLevel?: string;
  waterDeficit?: number;
  rainfall?: number;
  temperature?: number;
  weather?: WeatherMetrics;
  growthStage?: string;
  diseaseRisk?: string;
  diseaseName?: string;
  agronomy?: AgronomyRecommendation;
  yieldPrediction?: number;
  revenuePrediction?: number;
  fertilizer?: string;
  irrigationDetails?: {
    priority?: string;
    needed?: boolean;
    advice?: string;
    waterRequirementLitres?: number;
    actionWindow?: string;
    urgencyScore?: number;
  };
  aiAdvice?: string;
  trends?: {
    ndvi?: { month: number; ndvi: number }[];
    ndwi?: { month: number; ndwi: number }[];
  };
}

export interface AgronomyRecommendation {
  cropCalendar?: {
    crop?: string;
    stage?: string;
    stageOrder?: number;
    ndviStatus?: string;
    recommendation?: string;
  };
  waterRequirementLitres?: number;
  waterRequirement?: {
    deficitMm?: number;
    areaHectare?: number;
    litres?: number;
    recommendation?: string;
  };
  fertilizerPlan?: {
    crop?: string;
    growthStage?: string;
    areaHectare?: number;
    nutrients?: {
      nitrogenKg?: number;
      phosphorusKg?: number;
      potassiumKg?: number;
    };
    totalKg?: number;
    recommendation?: string;
  };
  diseaseAdvisory?: {
    diseaseName?: string;
    riskLevel?: string;
    recommendation?: string;
    prevention?: string;
  };
  urgencyScore?: number;
  actionWindow?: string;
}

export interface Field {
  id: string;
  name: string;
  cropType: string;
  acreage: number;
  avgNdvi: number;
  moisture: number;
  status: StressStatus;
  boundaryCoords: string; // for drawing the interactive SVG polygons (kept for backward compatibility if needed)
  notes: string;
  waterDeficit: number; // in mm
  stressLevel: 'High' | 'Moderate' | 'Low';
  avgTemp: number;
  geometry?: any; // MongoDB geometry object { type: 'Polygon', coordinates: [[[number, number]]] }
  analyses?: FarmAnalysisHistory[]; // MongoDB analyses history
  // Backend-enriched data
  indices?: RemoteSensingIndices;
  ndwi?: number;
  smi?: number;
  vci?: number;
  evi?: number;
  savi?: number;
  sar?: {
    vv?: number;
    vh?: number;
    vhVvRatio?: number;
  };
  rainfall?: number;
  weather?: WeatherMetrics;
  et?: number;
  agronomy?: AgronomyRecommendation;
  irrigationAdvisory?: string;
  urgencyLevel?: string;
  trends?: {
    ndvi: { month: number; ndvi: number }[];
    ndwi: { month: number; ndwi: number }[];
  };
}

export interface ActivityLog {
  id: string;
  message: string;
  timeLabel: string;
  type: 'irrigation' | 'satellite' | 'pest' | 'system';
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface WeatherDay {
  date: string;
  temp: number;
  rain: number;
  et: number; // evapotranspiration
  humidity?: number;
  windSpeed?: number;
  solarRadiation?: number;
  evaporation?: number;
  status: 'Optimal' | 'Dry' | 'High Heat';
}

export type DashboardTab = 'dashboard' | 'maps' | 'weather' | 'crop' | 'settings' | 'profile';

export type MapLayer = 'ndvi' | 'moisture' | 'rgb';
