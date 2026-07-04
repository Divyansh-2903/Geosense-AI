const ee = require('@google/earthengine');

const DEFAULT_GEOMETRY = {
  type: 'Polygon',
  coordinates: [[
    [76.30583804975788, 26.90353877346281],
    [76.30543303619663, 26.902919266447277],
    [76.30571735035221, 26.90239304160232],
    [76.30573612581532, 26.902271052765403],
    [76.30643886457722, 26.90198162774277],
    [76.30668562780659, 26.902416960966654],
    [76.30675804744999, 26.902653762400192],
    [76.30689752231876, 26.902837940949624],
    [76.30684119592945, 26.903232608258296],
    [76.30583804975788, 26.90353877346281]
  ]]
};

const LAYER_CONFIG = {
  rgb: {
    label: 'Sentinel-2 RGB',
    bands: ['B4', 'B3', 'B2'],
    visParams: {
      min: 0,
      max: 3000,
      gamma: 1.25,
    },
  },
  ndvi: {
    label: 'NDVI Crop Vigor',
    visParams: {
      min: -0.2,
      max: 0.9,
      palette: ['8b0000', 'd73027', 'fdae61', 'ffffbf', 'a6d96a', '1a9850', '006837'],
    },
  },
  ndwi: {
    label: 'NDWI Canopy Moisture',
    visParams: {
      min: -0.6,
      max: 0.7,
      palette: ['7f3b08', 'd8b365', 'f5f5f5', '5ab4ac', '2b83ba', '08306b'],
    },
  },
};

function normalizeLayer(layer) {
  if (layer === 'moisture') return 'ndwi';
  return Object.prototype.hasOwnProperty.call(LAYER_CONFIG, layer) ? layer : 'rgb';
}

function normalizeGeometryInput(geometryInput) {
  if (!geometryInput) {
    return DEFAULT_GEOMETRY;
  }

  if (
    geometryInput.type === 'Polygon' &&
    Array.isArray(geometryInput.coordinates) &&
    Array.isArray(geometryInput.coordinates[0]) &&
    typeof geometryInput.coordinates[0][0] === 'number'
  ) {
    return {
      ...geometryInput,
      coordinates: [geometryInput.coordinates],
    };
  }

  return geometryInput;
}

function getDateRange({ startDate, endDate, year }) {
  if (startDate && endDate) {
    return { startDate, endDate };
  }

  const selectedYear = /^\d{4}$/.test(String(year || '')) ? String(year) : String(new Date().getFullYear());
  return {
    startDate: `${selectedYear}-01-01`,
    endDate: `${selectedYear}-12-31`,
  };
}

function getBounds(geometryInput) {
  const ring = geometryInput?.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length === 0) {
    return null;
  }

  const lngs = ring.map((coord) => coord[0]).filter(Number.isFinite);
  const lats = ring.map((coord) => coord[1]).filter(Number.isFinite);

  if (!lngs.length || !lats.length) {
    return null;
  }

  return {
    south: Math.min(...lats),
    west: Math.min(...lngs),
    north: Math.max(...lats),
    east: Math.max(...lngs),
  };
}

function getSentinelComposite(geometry, startDate, endDate) {
  return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 60))
    .median()
    .clip(geometry);
}

function getLayerImage(composite, layer) {
  if (layer === 'ndvi') {
    return composite.normalizedDifference(['B8', 'B4']).rename('NDVI');
  }

  if (layer === 'ndwi') {
    return composite.normalizedDifference(['B3', 'B8']).rename('NDWI');
  }

  return composite.select(LAYER_CONFIG.rgb.bands);
}

function getMapId(image, visParams) {
  return new Promise((resolve, reject) => {
    image.getMapId(visParams, (mapId, error) => {
      if (error) {
        reject(new Error(error));
        return;
      }

      resolve(mapId);
    });
  });
}

async function buildEarthEngineMapLayer({ geometryInput, layer = 'rgb', startDate, endDate, year }) {
  const selectedLayer = normalizeLayer(layer);
  const config = LAYER_CONFIG[selectedLayer];
  const geometrySource = normalizeGeometryInput(geometryInput);
  const geometry = ee.Geometry(geometrySource);
  const dateRange = getDateRange({ startDate, endDate, year });
  const composite = getSentinelComposite(geometry, dateRange.startDate, dateRange.endDate);
  const layerImage = getLayerImage(composite, selectedLayer);
  const mapId = await getMapId(layerImage, config.visParams);

  ee.data.getTileUrl(mapId, 0, 0, 0);

  return {
    layer: selectedLayer,
    label: config.label,
    tileUrl: mapId.urlFormat,
    mapId: mapId.mapid,
    token: mapId.token || '',
    bounds: getBounds(geometrySource),
    dateRange,
    source: 'COPERNICUS/S2_SR_HARMONIZED',
    attribution: 'Sentinel-2 imagery via Google Earth Engine',
    generatedAt: new Date().toISOString(),
  };
}

module.exports = buildEarthEngineMapLayer;
