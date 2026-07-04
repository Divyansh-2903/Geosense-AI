let map = null;
let drawnItems = null;
let drawControl = null;
let currentPolygonGeoJSON = null;


/**
 * Initializes the Leaflet map and drawing controls.
 */
function initMap() {
  // Use Esri Satellite imagery as default map layer for rich premium visuals
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });

  // Start centered on India centroid coordinates
  map = L.map('map', {
    center: [20.5937, 78.9629],
    zoom: 5,
    layers: [esriSatellite]
  });

  // Layer control
  const baseMaps = {
    "Satellite Imagery": esriSatellite,
    "Standard Streets": streetMap
  };
  L.control.layers(baseMaps).addTo(map);

  // Layer group to hold drawn shapes
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // Configure Leaflet Draw controls
  drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems,
      remove: true
    },
    draw: {
      polygon: {
        allowIntersection: false,
        showArea: true,
        drawError: {
          color: '#e1e084',
          message: '<strong>Intersection error</strong>'
        },
        shapeOptions: {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.2
        }
      },
      polyline: false,
      circle: false,
      circlemarker: false,
      rectangle: false,
      marker: false
    }
  });
  map.addControl(drawControl);

  // Listener for when a shape is drawn
  map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    drawnItems.clearLayers(); // Only allow one farm boundary at a time
    drawnItems.addLayer(layer);
    
    const geojson = layer.toGeoJSON();
    currentPolygonGeoJSON = geojson.geometry;
    
    // Calculate centroid for coordinates display
    const bounds = layer.getBounds();
    const centroid = bounds.getCenter();
    document.getElementById('coords-display').innerHTML = `
      <i class="fa-solid fa-location-crosshairs text-green"></i> 
      Boundary defined at Lat: <strong>${centroid.lat.toFixed(5)}</strong>, Lng: <strong>${centroid.lng.toFixed(5)}</strong>
    `;
  });

  // Listener for deletion
  map.on(L.Draw.Event.DELETED, function () {
    currentPolygonGeoJSON = null;
    document.getElementById('coords-display').innerHTML = `
      <i class="fa-solid fa-circle-info"></i> boundary cleared. Draw a new polygon.
    `;
  });
}


/**
 * Triggers API call to perform farm remote sensing analysis.
 */
async function performFarmAnalysis() {
  if (!currentPolygonGeoJSON) {
    alert("Please draw a farm boundary polygon on the map first.");
    return;
  }

  const crop = document.getElementById('crop-selector').value;
  const areaHectare = document.getElementById('area-input').value;
  const year = document.getElementById('year-selector').value;

  // Toggle Loading Screen
  document.getElementById('dashboard-empty-state').classList.add('hidden');
  document.getElementById('dashboard-content').classList.add('hidden');
  
  const loadingState = document.getElementById('dashboard-loading-state');
  loadingState.classList.remove('hidden');

  // Cycle loading messages for interactive UX
  const loadingTexts = [
    "Querying Sentinel-2 spectral assets...",
    "Filtering cloud covers and calculating median values...",
    "Computing NDVI & NDWI vegetation indexes...",
    "Pulling temperature and precipitation from ECMWF/ERA5...",
    "Evaluating soil water deficit and moisture stress indices...",
    "Analyzing crop growth stages & predicting yield outlooks...",
    "Consulting Agri-Sense AI Advisor (Gemini) recommendation engine..."
  ];
  let textIndex = 0;
  document.getElementById('loading-step-text').innerText = loadingTexts[0];
  const textTimer = setInterval(() => {
    textIndex = (textIndex + 1) % loadingTexts.length;
    document.getElementById('loading-step-text').innerText = loadingTexts[textIndex];
  }, 2200);

  try {
    const response = await fetch('/api/analyze-farm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        crop: crop,
        areaHectare: areaHectare ? parseFloat(areaHectare) : null,
        geometryInput: currentPolygonGeoJSON,
        year: year
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const report = await response.json();
    clearInterval(textTimer);
    loadingState.classList.add('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');

    updateDashboardUI(report);
  } catch (error) {
    clearInterval(textTimer);
    loadingState.classList.add('hidden');
    document.getElementById('dashboard-empty-state').classList.remove('hidden');
    console.error("Analysis request failed:", error);
    alert(`An error occurred during farm analysis: ${error.message}. Make sure your backend server is running and Earth Engine credentials are valid.`);
  }
}

/**
 * Updates the dashboard widgets, timelines, and graphs with returned API data.
 * @param {Object} data - The response JSON report.
 */
function updateDashboardUI(data) {
  // Quick status bar
  document.getElementById('stat-crop').innerText = data.crop;
  document.getElementById('crop-detection-badge').innerText = data.calculatedAreaHectare 
    ? "Auto-Derived Data" 
    : "Manual Query Override";
  
  const calculatedArea = data.calculatedAreaHectare || data.areaHectare || 1.0;
  document.getElementById('stat-area').innerText = calculatedArea.toFixed(2);
  document.getElementById('stat-yield').innerText = `${data.yieldPrediction} tons`;
  document.getElementById('stat-revenue').innerText = `$${data.revenuePrediction.toLocaleString()}`;
  document.getElementById('stat-revenue-detail').innerText = `Estimated from $${(data.revenuePrediction / (calculatedArea * parseFloat(data.yieldPrediction))).toFixed(0)}/ton MSP`;

  // NDVI & NDWI values
  document.getElementById('val-ndvi').innerText = data.ndvi !== null ? data.ndvi : "N/A";
  document.getElementById('val-ndwi').innerText = data.ndwi !== null ? data.ndwi : "N/A";
  document.getElementById('val-stress').innerText = data.ndwiStress || data.stressLevel || "MODERATE";

  // Fill in percentages for indicator bars
  // NDVI ranges roughly 0 to 1
  const ndviPct = Math.max(0, Math.min(100, (data.ndvi || 0) * 100));
  document.getElementById('bar-ndvi').style.width = `${ndviPct}%`;
  
  // NDWI ranges -1 to 1 (scale it to 0-100% for display)
  const ndwiPct = Math.max(0, Math.min(100, ((data.ndwi || 0) + 1) * 50));
  document.getElementById('bar-ndwi').style.width = `${ndwiPct}%`;

  // Stress bar representation
  let stressPct = 50;
  const stressVal = (data.ndwiStress || 'MODERATE').toUpperCase();
  if (stressVal === 'LOW') stressPct = 25;
  else if (stressVal === 'HIGH') stressPct = 90;
  document.getElementById('bar-stress').style.width = `${stressPct}%`;

  // Health Score Circular Gauge
  const healthScore = data.healthScore || 50;
  document.getElementById('gauge-health-value').innerText = healthScore;
  const gaugeFill = document.getElementById('gauge-health-fill');
  
  // 251.2 is the stroke-dasharray (circumference of circle r=40)
  const offset = 251.2 - (healthScore / 100) * 251.2;
  gaugeFill.style.strokeDashoffset = offset;

  // Health status badge
  const healthBadge = document.getElementById('health-status-badge');
  healthBadge.innerText = healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Needs Care" : "Critical";
  healthBadge.className = `badge ${healthScore >= 70 ? 'badge-success' : healthScore >= 40 ? 'badge-warning' : 'badge-danger'}`;

  // Growth Stage Timeline progress
  const stages = ['Bare Soil', 'Seedling', 'Vegetative', 'Flowering', 'Maturity'];
  const currentStage = data.growthStage || 'Bare Soil';
  document.getElementById('current-stage-text').innerText = currentStage;
  
  const currentStageIndex = stages.indexOf(currentStage);
  
  stages.forEach((stage, idx) => {
    const elementId = `stage-${stage.toLowerCase().replace(' ', '-')}`;
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.remove('active', 'completed');
    if (idx < currentStageIndex) {
      element.classList.add('completed');
    } else if (idx === currentStageIndex) {
      element.classList.add('active');
    }
  });

  // Weather Metrics
  document.getElementById('weather-rainfall').innerText = `${data.rainfall !== null ? data.rainfall : '-'} mm`;
  document.getElementById('weather-temp').innerText = `${data.temperature !== null ? data.temperature : '-'} °C`;

  // Recommendations Details
  document.getElementById('rec-irrigation-text').innerText = data.irrigationDetails.advice;
  
  const irrigationPriority = document.getElementById('rec-irrigation-priority');
  irrigationPriority.innerText = `${data.irrigationDetails.priority} Priority`;
  irrigationPriority.className = `badge ${
    data.irrigationDetails.priority === 'HIGH' 
      ? 'badge-danger' 
      : data.irrigationDetails.priority === 'MEDIUM' 
      ? 'badge-warning' 
      : 'badge-success'
  }`;

  document.getElementById('rec-fertilizer-text').innerText = data.fertilizer || "No immediate nutrient inputs required.";
  
  const diseaseBadge = document.getElementById('rec-disease-level');
  diseaseBadge.innerText = `${data.diseaseRisk} Risk`;
  diseaseBadge.className = `badge ${
    data.diseaseRisk === 'HIGH' 
      ? 'badge-danger' 
      : data.diseaseRisk === 'MODERATE' 
      ? 'badge-warning' 
      : 'badge-success'
  }`;
  
  document.getElementById('rec-disease-text').innerText = data.diseaseName === 'No Major Risk' 
    ? 'Climatic conditions do not indicate potential fungal outbreaks.'
    : `Elevated susceptibility to: ${data.diseaseName}. Take preventive action.`;

  // Render Markdown AI advice text using marked parser
  if (window.marked) {
    document.getElementById('ai-report-text').innerHTML = window.marked.parse(data.aiAdvice);
  } else {
    document.getElementById('ai-report-text').innerText = data.aiAdvice;
  }

  // Initialize charts (trends)
  if (window.updateTrendsChart && data.trends) {
    updateTrendsChart('trendChart', data.trends.ndvi, data.trends.ndwi);
  }

  // Initialize Chatbot for follow-up conversational queries
  if (window.initChatbot) {
    initChatbot(data);
  }
}

// Event bindings
document.addEventListener('DOMContentLoaded', () => {
  initMap();



  // Run analysis button click
  document.getElementById('btn-analyze').addEventListener('click', performFarmAnalysis);

  // PDF print button click
  document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
  });
});
