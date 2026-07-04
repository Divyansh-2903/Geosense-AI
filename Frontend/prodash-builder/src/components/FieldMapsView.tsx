import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Droplet, 
  Sprout, 
  Eye, 
  MapPin, 
  Sparkles, 
  Compass, 
  Check, 
  X,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  CloudRain,
  Navigation,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
  Plus,
  Trash2,
  Send,
  Loader2,
  Calendar,
  DollarSign,
  FileDown,
  Wind,
  Sun,
  Mic,
  MicOff
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Field, MapLayer } from '../types';
import { useAuth } from '../../../src/context/AuthContext';
import { API_BASE_URL } from '../../../src/config/api';

const API_BASE = API_BASE_URL;

type EarthEngineLayerStatus = 'idle' | 'loading' | 'ready' | 'error';

interface EarthEngineLayerResponse {
  layer: 'rgb' | 'ndvi' | 'ndwi';
  label: string;
  tileUrl: string;
  attribution: string;
  source: string;
  generatedAt: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface FieldMapsViewProps {
  fields: Field[];
  selectedField: Field;
  onSelectField: (field: Field) => void;
  onUpdateFieldMoisture: (id: string, newMoisture: number) => void;
  onAddLog: (message: string, severity: 'info' | 'success' | 'warning' | 'error') => void;
  isLoading?: boolean;
  onCreateFarm?: (name: string, crop: string, areaHectare: number, geometry: any) => Promise<string | undefined>;
  onDeleteFarm?: (id: string) => Promise<void>;
  onDownloadReport?: (field: Field) => void | Promise<void>;
}


export default function FieldMapsView({
  fields,
  selectedField,
  onSelectField,
  onUpdateFieldMoisture,
  onAddLog,
  isLoading = false,
  onCreateFarm,
  onDeleteFarm,
  onDownloadReport
}: FieldMapsViewProps) {
  
  const { token, user } = useAuth();
  
  // UI states
  const [activeLayer, setActiveLayer] = useState<MapLayer>('rgb');
  const [layerOpacity, setLayerOpacity] = useState<number>(0.85);
  const [drawerExpanded, setDrawerExpanded] = useState<boolean>(true);
  const [showMobileMapControls, setShowMobileMapControls] = useState<boolean>(false);

  
  // Custom farm creation states
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmCrop, setNewFarmCrop] = useState('Rice');
  const [newFarmArea, setNewFarmArea] = useState<number>(0);
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  const [mapCenterCoords, setMapCenterCoords] = useState<[number, number]>([26.9029, 76.3060]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchMapQuery, setSearchMapQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model' | 'system'; text: string }>>([
    { role: 'system', text: 'Hello! I have reviewed your farm\'s spectral data. Ask me anything about yield improvement, soil condition, or irrigation plans for this plot.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user'; text: string } | { role: 'model'; text: string }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'en-US' | 'hi-IN'>('en-US');

  // Refs for Leaflet Map
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const drawnItemsGroup = useRef<any>(null);
  const drawControlInstance = useRef<any>(null);
  const mapLayersRef = useRef<Record<string, any>>({});
  const earthEngineTileLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);

  const L = (window as any).L;
  const [earthEngineStatus, setEarthEngineStatus] = useState<EarthEngineLayerStatus>('idle');
  const [earthEngineLayer, setEarthEngineLayer] = useState<EarthEngineLayerResponse | null>(null);
  const [earthEngineMessage, setEarthEngineMessage] = useState('Draw or select a field to load Earth Engine tiles.');
  const selectedGeometryKey = useMemo(
    () => JSON.stringify(selectedField?.geometry || null),
    [selectedField?.geometry]
  );
  const formatSarValue = (value: number | undefined, digits = 2) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'N/A';
  const formatIndexValue = (value: number | undefined, digits = 2) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'N/A';
  const getUnitIndexWidth = (value: number | undefined) =>
    `${Math.max(0, Math.min(100, (value ?? 0) * 100))}%`;
  const getSignedIndexWidth = (value: number | undefined) =>
    `${Math.max(0, Math.min(100, ((value ?? 0) + 1) * 50))}%`;

  // 1. Sort fields strictly by highest water deficit (most negative first) and urgency (High > Moderate > Low) for the "First Attention" list
  const prioritizedFields = useMemo(() => {
    return [...fields].sort((a, b) => {
      if (a.waterDeficit !== b.waterDeficit) {
        return a.waterDeficit - b.waterDeficit; // Ascending (negative to positive)
      }
      const weight = { 'High': 3, 'Moderate': 2, 'Low': 1 };
      const aWeight = weight[a.stressLevel] || 0;
      const bWeight = weight[b.stressLevel] || 0;
      return bWeight - aWeight;
    });
  }, [fields]);

  // Convert mm water deficit into total liters missing
  const waterDeficitLiters = useMemo(() => {
    const deficitMm = Math.abs(selectedField?.waterDeficit || 0);
    return Math.round(deficitMm * (selectedField?.acreage || 0) * 4046.86);
  }, [selectedField]);

  // Combine NDVI and NDWI historical trends for Recharts
  const chartData = useMemo(() => {
    if (selectedField?.trends?.ndvi) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return selectedField.trends.ndvi.map((n, idx) => ({
        name: months[n.month - 1] || `M${n.month}`,
        NDVI: parseFloat(n.ndvi.toFixed(3)),
        NDWI: parseFloat((selectedField.trends?.ndwi?.[idx]?.ndwi ?? 0).toFixed(3))
      }));
    }
    return [
      { name: 'May', NDVI: 0.42, NDWI: -0.58 },
      { name: 'Jun', NDVI: 0.61, NDWI: -0.42 },
      { name: 'Jul', NDVI: 0.78, NDWI: -0.28 },
      { name: 'Aug', NDVI: 0.82, NDWI: -0.32 },
      { name: 'Sep', NDVI: 0.71, NDWI: -0.49 },
      { name: 'Oct', NDVI: 0.58, NDWI: -0.62 }
    ];
  }, [selectedField]);

  // Basic markdown renderer for Gemini AI Advisor response
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
      .replace(/\n\n/g, '</p><p class="mt-2 text-xs">')
      .replace(/\n/g, '<br/>');
    return `<p class="text-xs leading-relaxed">${html}</p>`;
  };

  // Geocoding map search using OpenStreetMap Nominatim
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchMapQuery.trim() || !leafletMapInstance.current) return;

    setIsSearchingMap(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchMapQuery)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        setMapCenterCoords([latitude, longitude]);
        leafletMapInstance.current.setView([latitude, longitude], 17);

        // Remove old marker
        if (userMarkerRef.current) {
          leafletMapInstance.current.removeLayer(userMarkerRef.current);
        }

        // Add beacon marker
        const searchMarker = L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(leafletMapInstance.current);
        searchMarker.bindTooltip(display_name.split(',')[0], { permanent: true, direction: "top", className: "bg-emerald-600 text-white font-mono text-[9px] px-1 py-0.5 rounded shadow border-none" });
        userMarkerRef.current = searchMarker;

        onAddLog(`Location found: ${display_name.split(',')[0]} (Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)})`, 'info');
      } else {
        alert('Location not found. Try searching for a nearby village, tehsil, or district name.');
      }
    } catch (err) {
      console.error('Nominatim request failed:', err);
      alert('Search service unavailable. Please check your internet connection.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  // Helper to fetch user's location with high accuracy
  const locateUser = () => {
    if (!L) return;
    const map = leafletMapInstance.current;
    if (!map) return;

    if (!navigator.geolocation) {
      alert('Your browser does not support location detection.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenterCoords([latitude, longitude]);
        map.setView([latitude, longitude], 17);

        // Update or add marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map);
          userMarker.bindTooltip("You Are Here", { permanent: true, direction: "top", className: "bg-blue-600 text-white font-mono text-[9px] px-1 py-0.5 rounded shadow border-none" });
          userMarkerRef.current = userMarker;
        }

        setIsLocating(false);
        onAddLog(`Device location loaded: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`, 'info');
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', error.message);
        alert('Could not fetch location. Please check browser location permissions or turn on your device GPS.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // 2. Leaflet Layer Styling
  const getFieldStyle = (f: Field) => {
    let baseColor = 'rgba(42, 65, 40)'; // Standard RGB Forest green
    if (activeLayer === 'ndvi') {
      if (f.avgNdvi >= 0.75) baseColor = 'rgba(14, 116, 14)'; // high ndvi
      else if (f.avgNdvi >= 0.5) baseColor = 'rgba(141, 204, 62)'; // moderate
      else if (f.avgNdvi >= 0.3) baseColor = 'rgba(234, 179, 8)'; // low ndvi
      else baseColor = 'rgba(220, 38, 38)'; // critical
    } else if (activeLayer === 'moisture') {
      const moisturePct = f.moisture;
      if (moisturePct >= 70) baseColor = 'rgba(37, 99, 235)'; // high moisture
      else if (moisturePct >= 50) baseColor = 'rgba(13, 148, 136)'; // moderate
      else if (moisturePct >= 40) baseColor = 'rgba(249, 115, 22)'; // marginal
      else baseColor = 'rgba(239, 68, 68)'; // critical dry
    }

    const rasterLayerVisible = earthEngineStatus === 'ready';

    return {
      color: selectedField?.id === f.id ? '#cff068' : 'rgba(255,255,255,0.4)',
      weight: selectedField?.id === f.id ? 3 : 1.5,
      fillColor: baseColor,
      fillOpacity: rasterLayerVisible ? Math.min(0.18, layerOpacity * 0.25) : layerOpacity,
      dashArray: selectedField?.id === f.id ? '' : '3'
    };
  };

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!L || !mapRef.current || leafletMapInstance.current) return;

    // Use Esri Satellite imagery as default
    const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Earth Engine Ready'
    });

    const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
      attribution: '&copy; OpenStreetMap'
    });

    // Start centered on selectedField coords, first field coords, or fallback (India centroid)
    let initialCenter: [number, number] = [20.5937, 78.9629];
    let initialZoom = 5;

    const activeField = selectedField || (fields && fields.length > 0 ? fields[0] : null);
    if (activeField && activeField.geometry && activeField.geometry.coordinates && activeField.geometry.coordinates[0]) {
      const coords = activeField.geometry.coordinates[0];
      let sumLat = 0;
      let sumLng = 0;
      coords.forEach((c: number[]) => {
        sumLng += c[0];
        sumLat += c[1];
      });
      initialCenter = [sumLat / coords.length, sumLng / coords.length];
      initialZoom = 17;
    }

    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      layers: [esriSatellite]
    });

    leafletMapInstance.current = map;

    // Track map center coordinates dynamically
    map.on('moveend', () => {
      const center = map.getCenter();
      setMapCenterCoords([center.lat, center.lng]);
    });



    // Add switchable layer controls
    L.control.layers({
      "Satellite Imagery": esriSatellite,
      "Standard Streets": streetMap
    }, {}, { position: 'topleft' }).addTo(map);

    // Feature group to hold drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsGroup.current = drawnItems;

    // Setup Leaflet Draw control toolbar
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        remove: true
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#cff068',
            fillColor: '#cff068',
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
    drawControlInstance.current = drawControl;

    // Handler when user draws a polygon
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      
      const geojson = layer.toGeoJSON();
      setDrawnGeometry(geojson.geometry);

      // Compute area in Hectares
      let calculatedArea = 1.0;
      if (L.GeometryUtil && L.GeometryUtil.geodesicArea) {
        const areaM2 = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        calculatedArea = parseFloat((areaM2 / 10000).toFixed(2));
      } else {
        // Fallback simple area estimation
        calculatedArea = 1.2;
      }
      setNewFarmArea(calculatedArea);
      setIsCreatingCustom(true);

    });

    map.on(L.Draw.Event.DELETED, () => {
      setDrawnGeometry(null);
      setIsCreatingCustom(false);
    });

    // Cleanup map on unmount
    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, []);

  // Load real Earth Engine raster tiles for the selected field and active layer.
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!L || !map) return;

    const removeEarthEngineLayer = () => {
      if (earthEngineTileLayerRef.current) {
        map.removeLayer(earthEngineTileLayerRef.current);
        earthEngineTileLayerRef.current = null;
      }
    };

    if (!selectedField?.geometry) {
      removeEarthEngineLayer();
      setEarthEngineStatus('idle');
      setEarthEngineLayer(null);
      setEarthEngineMessage('Draw or select a field to load Earth Engine tiles.');
      return;
    }

    const controller = new AbortController();
    const serverLayer = activeLayer === 'moisture' ? 'ndwi' : activeLayer;

    setEarthEngineStatus('loading');
    setEarthEngineMessage(`Loading ${serverLayer.toUpperCase()} raster from Earth Engine...`);

    fetch(`${API_BASE}/map-layer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        geometryInput: selectedField.geometry,
        layer: serverLayer,
        year: '2025'
      })
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Earth Engine tile request failed');
        }
        return data as EarthEngineLayerResponse;
      })
      .then((data) => {
        if (controller.signal.aborted) return;

        removeEarthEngineLayer();

        const tileLayer = L.tileLayer(data.tileUrl, {
          attribution: data.attribution,
          opacity: layerOpacity,
          maxZoom: 20,
          crossOrigin: true
        });

        tileLayer.addTo(map);
        earthEngineTileLayerRef.current = tileLayer;
        setEarthEngineLayer(data);
        setEarthEngineStatus('ready');
        setEarthEngineMessage(`${data.label} loaded from ${data.source}`);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.warn('Earth Engine tile layer unavailable:', error);
        removeEarthEngineLayer();
        setEarthEngineLayer(null);
        setEarthEngineStatus('error');
        setEarthEngineMessage('Earth Engine tiles unavailable; using local field overlay fallback.');
      });

    return () => {
      controller.abort();
    };
  }, [L, activeLayer, selectedField?.id, selectedGeometryKey]);

  useEffect(() => {
    if (earthEngineTileLayerRef.current) {
      earthEngineTileLayerRef.current.setOpacity(layerOpacity);
    }
  }, [layerOpacity]);

  // 4. Render/Recreate Polygons on the Leaflet Map ONLY when fields change
  useEffect(() => {
    const map = leafletMapInstance.current;
    const drawnItems = drawnItemsGroup.current;
    if (!map || !drawnItems) return;

    // Remove previously rendered database fields layers from map
    Object.values(mapLayersRef.current).forEach(layer => map.removeLayer(layer));
    mapLayersRef.current = {};

    // Render active fields polygons
    fields.forEach(f => {
      // Skip rendering if field is currently being drawn/edited in custom state
      if (f.geometry && f.geometry.coordinates && f.geometry.coordinates[0]) {
        // Format coordinates to [Lat, Lng] order for Leaflet
        const latLngs = f.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
        
        const style = getFieldStyle(f);
        const polygon = L.polygon(latLngs, style);
        
        // Add click listener to select field
        polygon.on('click', () => {
          onSelectField(f);
        });

        // Add tooltip
        polygon.bindTooltip(`<strong>${f.name}</strong><br/>Crop: ${f.cropType}<br/>NDVI: ${f.avgNdvi.toFixed(2)}`, {
          permanent: false,
          direction: 'center',
          className: 'bg-black/90 text-white border-white/10 rounded px-2 py-1 text-[10px] font-sans'
        });

        polygon.addTo(map);
        mapLayersRef.current[f.id] = polygon;
      }
    });
  }, [fields]);

  // 5. Update Polygons styling on the Leaflet Map dynamically (extremely fast in-place update)
  useEffect(() => {
    fields.forEach(f => {
      const polygon = mapLayersRef.current[f.id];
      if (polygon) {
        const style = getFieldStyle(f);
        polygon.setStyle(style);
      }
    });
  }, [fields, selectedField?.id, activeLayer, layerOpacity, earthEngineStatus]);

  // Zoom map to the coordinates of the selected field when selectedField changes
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map || !selectedField) return;

    if (selectedField.geometry && selectedField.geometry.coordinates && selectedField.geometry.coordinates[0]) {
      const latLngs = selectedField.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }
  }, [selectedField?.id]);


  // 6. Save newly drawn custom farm
  const handleSaveDrawnFarm = async () => {
    if (!newFarmName.trim()) {
      alert('Please enter a field name.');
      return;
    }
    if (!drawnGeometry) {
      alert('Please draw a boundary on the map first.');
      return;
    }

    if (onCreateFarm) {
      const newId = await onCreateFarm(newFarmName, newFarmCrop, newFarmArea, drawnGeometry);
      if (newId) {
        setIsCreatingCustom(false);
        setNewFarmName('');
        setDrawnGeometry(null);
        if (drawnItemsGroup.current) {
          drawnItemsGroup.current.clearLayers();
        }
      }
    }
  };

  // 7. Chatbot integration: send message to Gemini API
  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    if (!selectedField) {
      alert('Please select or create a farm field first to provide the AI Advisor with crop and sensor context.');
      return;
    }

    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData: selectedField,
          chatHistory: chatHistory,
          message: text
        })
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      setChatHistory(prev => [
        ...prev,
        { role: 'user', text },
        { role: 'model', text: data.reply }
      ]);
    } catch (err) {
      console.error('Chat advice error:', err);
      setChatMessages(prev => [...prev, { role: 'model', text: '❌ **Connection Error**: Could not connect to the Gemini AI Advisor. Check that your server is running and API key is set.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = speechLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      onAddLog(`Voice assistant listening in ${speechLanguage === 'en-US' ? 'English' : 'Hindi'}...`, 'info');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onAddLog(`Voice recognition error: ${event.error}`, 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      onAddLog(`Voice input transcribed: "${transcript}"`, 'success');
    };

    recognition.start();
  };

  return (
    <div className="relative bg-[#020603] p-6 rounded-3xl border border-white/5 space-y-6 text-[#a8c5ba] min-h-[85vh] flex flex-col justify-between overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 bg-emerald-900/15 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 bg-[#cff068]/5 rounded-full blur-[120px]" />
      
      {/* ── TOP HEADER BAR ── */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#cff068] animate-ping" />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">My Farm Fields</h1>
          </div>
          <p className="text-white/35 text-xs font-medium pl-10">
            Select your field on the map to see crop health &amp; irrigation advice
          </p>
        </div>

        {/* Global actions / Coordinates lock */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-white/70">
            <Compass className="w-3.5 h-3.5 text-[#cff068]" />
            <span>{mapCenterCoords[0].toFixed(3)}° N, {mapCenterCoords[1].toFixed(3)}° E</span>
          </div>
          
          {selectedField && onDownloadReport && (
            <button
              onClick={() => onDownloadReport(selectedField)}
              className="text-[10px] bg-[#cff068]/10 hover:bg-[#cff068]/20 border border-[#cff068]/30 text-[#cff068] px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:shadow-[0_0_12px_rgba(207,240,104,0.2)]"
              title="Export selected field PDF report"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}

          {selectedField && onDeleteFarm && (
            <button
              onClick={() => onDeleteFarm(selectedField.id)}
              className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5 cursor-pointer transition-all duration-200"
              title="Delete Selected Farm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Field</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN LAYOUT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow relative">
        
        {/* ================= ZONE 1: LEFT SIDEBAR / CONFIGURATION & METRICS PANEL ================= */}
        <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-5 text-left relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#cff068]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Active Field Header & Status */}
          <div className="border-b border-white/5 pb-4">
            <span className="text-[10px] text-white/35 uppercase tracking-wider block mb-1">Selected Field</span>
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-white text-xl">
                {selectedField ? selectedField.name : 'No Field Selected'}
              </h3>
              {selectedField && (
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  selectedField.status === 'Optimal'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : selectedField.status === 'Marginal'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                }`}>
                  {selectedField.status === 'Optimal' ? '✓ Good' : selectedField.status === 'Marginal' ? '⚠ Monitor' : '🔴 Critical'}
                </span>
              )}
            </div>
            {selectedField && (
              <p className="text-white/50 text-xs mt-1">{selectedField.cropType} · {selectedField.acreage} acres</p>
            )}
          </div>


          {/* Custom Farm Drawer Form */}
          {isCreatingCustom && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#cff068]/5 border border-[#cff068]/20 p-4 rounded-xl space-y-3"
            >
              <span className="text-sm font-semibold text-[#cff068] flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Save This Farm Boundary
              </span>
              
              <input 
                type="text" 
                placeholder="Farm Name (e.g. North Plot)"
                value={newFarmName}
                onChange={(e) => setNewFarmName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#cff068]/50 transition-all duration-200"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newFarmCrop}
                  onChange={(e) => setNewFarmCrop(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-2.5 text-sm text-white outline-none focus:border-[#cff068]/50 cursor-pointer"
                >
                  <option value="Rice" className="bg-[#041006]">🌾 Rice</option>
                  <option value="Wheat" className="bg-[#041006]">🌾 Wheat</option>
                  <option value="Mustard" className="bg-[#041006]">🌻 Mustard</option>
                  <option value="Bajra" className="bg-[#041006]">🌽 Bajra</option>
                  <option value="Cotton" className="bg-[#041006]">🏵 Cotton</option>
                  <option value="Soybean" className="bg-[#041006]">🫘 Soybean</option>
                </select>
                <div className="bg-white/[0.03] border border-white/5 rounded-lg flex flex-col items-center justify-center text-sm font-bold text-[#cff068]">
                  <span>{newFarmArea} ha</span>
                  <span className="text-[10px] text-white/30 font-normal">Area</span>
                </div>
              </div>

              <button 
                onClick={handleSaveDrawnFarm}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-lime-300 text-[#03260e] font-bold text-sm rounded-lg transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(207,240,104,0.2)] hover:shadow-[0_0_20px_rgba(207,240,104,0.4)]"
              >
                ✓ Save Farm
              </button>
            </motion.div>
          )}

          {selectedField ? (
            <>
              {/* ── FOUR KEY METRIC CARDS (simplified, farmer-friendly) ── */}
              <div className="grid grid-cols-2 gap-3">

                {/* 1. Crop Health */}
                {(() => {
                  const ndvi = selectedField.avgNdvi;
                  const isGood = ndvi >= 0.6;
                  const isMid  = ndvi >= 0.4;
                  return (
                    <div className={`rounded-2xl p-4 border text-left ${
                      isGood ? 'bg-emerald-500/10 border-emerald-500/20' :
                      isMid  ? 'bg-amber-500/10 border-amber-500/20' :
                               'bg-rose-500/10 border-rose-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sprout className={`w-5 h-5 ${ isGood ? 'text-emerald-400' : isMid ? 'text-amber-400' : 'text-rose-400' }`} />
                        <span className="text-xs text-white/60">Crop Health</span>
                      </div>
                      <div className={`text-2xl font-extrabold ${ isGood ? 'text-emerald-400' : isMid ? 'text-amber-400' : 'text-rose-400' }`}>
                        {isGood ? 'Good' : isMid ? 'Average' : 'Poor'}
                      </div>
                      <div className="text-[10px] text-white/35 mt-1">NDVI {ndvi.toFixed(2)}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${ isGood ? 'bg-emerald-400' : isMid ? 'bg-amber-400' : 'bg-rose-400' }`}
                          style={{ width: `${Math.min(100, ndvi * 100)}%` }} />
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Water in Soil */}
                {(() => {
                  const moisture = selectedField.moisture ?? 50;
                  const isGood = moisture >= 60;
                  const isMid  = moisture >= 35;
                  return (
                    <div className={`rounded-2xl p-4 border text-left ${
                      isGood ? 'bg-sky-500/10 border-sky-500/20' :
                      isMid  ? 'bg-amber-500/10 border-amber-500/20' :
                               'bg-rose-500/10 border-rose-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Droplet className={`w-5 h-5 ${ isGood ? 'text-sky-400' : isMid ? 'text-amber-400' : 'text-rose-400' }`} />
                        <span className="text-xs text-white/60">Soil Water</span>
                      </div>
                      <div className={`text-2xl font-extrabold ${ isGood ? 'text-sky-400' : isMid ? 'text-amber-400' : 'text-rose-400' }`}>
                        {moisture}%
                      </div>
                      <div className="text-[10px] text-white/35 mt-1">
                        {isGood ? 'Well Watered' : isMid ? 'Needs Water Soon' : 'Water Urgently!'}
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${ isGood ? 'bg-sky-400' : isMid ? 'bg-amber-400' : 'bg-rose-400' }`}
                          style={{ width: `${moisture}%` }} />
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Rain Received */}
                <div className="rounded-2xl p-4 border bg-blue-900/15 border-blue-500/15 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="w-5 h-5 text-blue-300" />
                    <span className="text-xs text-white/60">Rainfall</span>
                  </div>
                  <div className="text-2xl font-extrabold text-blue-300">
                    {selectedField.rainfall ?? 0} mm
                  </div>
                  <div className="text-[10px] text-white/35 mt-1">This Season</div>
                </div>

                {/* 4. Temperature */}
                <div className="rounded-2xl p-4 border bg-amber-900/15 border-amber-500/15 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5 text-amber-300" />
                    <span className="text-xs text-white/60">Temperature</span>
                  </div>
                  <div className="text-2xl font-extrabold text-amber-300">
                    {selectedField.avgTemp}°C
                  </div>
                  <div className="text-[10px] text-white/35 mt-1">Avg Field Temp</div>
                </div>

              </div>

              {/* ── WATER NEEDED HIGHLIGHT ── */}
              {waterDeficitLiters > 0 && (
                <div className="rounded-2xl p-4 border bg-sky-500/8 border-sky-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <Droplet className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-0.5">Total Water Needed Right Now</div>
                    <div className="text-sky-300 text-xl font-extrabold">{waterDeficitLiters.toLocaleString()} Litres</div>
                  </div>
                </div>
              )}

              {/* ── FARMING ADVICE (Hero Section) ── */}
              <div className={`rounded-2xl p-4 border text-left ${
                (selectedField.agronomy?.actionWindow || selectedField.urgencyLevel || 'LOW') === 'HIGH' ||
                (selectedField.agronomy?.actionWindow || selectedField.urgencyLevel || 'LOW') === 'CRITICAL'
                  ? 'bg-rose-500/8 border-rose-500/25'
                  : (selectedField.agronomy?.actionWindow || selectedField.urgencyLevel || 'LOW') === 'MODERATE'
                  ? 'bg-amber-500/8 border-amber-500/20'
                  : 'bg-emerald-500/8 border-emerald-500/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#cff068]" />
                    <span className="text-sm font-bold text-white">AI Farming Advice</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    (selectedField.agronomy?.actionWindow || selectedField.urgencyLevel || 'LOW') === 'HIGH' ||
                    (selectedField.agronomy?.actionWindow || selectedField.urgencyLevel || 'LOW') === 'CRITICAL'
                      ? 'bg-rose-500/15 text-rose-400'
                      : (selectedField.agronomy?.actionWindow || selectedField.urgencyLevel || 'LOW') === 'MODERATE'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {(selectedField.agronomy?.actionWindow || selectedField.urgencyLevel || 'Low').toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {selectedField.irrigationAdvisory || selectedField.notes || 'Select a field to get personalized farming advice.'}
                </p>
                {selectedField.agronomy && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-black/20 rounded-xl p-3 text-center">
                      <Droplet className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                      <div className="text-sky-300 text-sm font-bold">{(selectedField.agronomy.waterRequirementLitres || 0).toLocaleString()}</div>
                      <div className="text-white/35 text-[10px] mt-0.5">Litres</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 text-center">
                      <Sprout className="w-4 h-4 text-[#cff068] mx-auto mb-1" />
                      <div className="text-[#cff068] text-sm font-bold">{selectedField.agronomy.fertilizerPlan?.totalKg ?? 0}</div>
                      <div className="text-white/35 text-[10px] mt-0.5">kg Fertilizer</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 text-center">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <div className="text-amber-300 text-sm font-bold">{selectedField.agronomy.urgencyScore ?? 0}/100</div>
                      <div className="text-white/35 text-[10px] mt-0.5">Urgency</div>
                    </div>
                  </div>
                )}
                {selectedField.agronomy?.diseaseAdvisory?.recommendation && (
                  <p className="text-xs text-white/55 leading-relaxed mt-3 border-t border-white/5 pt-3">
                    🌿 {selectedField.agronomy.diseaseAdvisory.recommendation}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center space-y-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <MapPin className="w-8 h-8 text-white/15 mx-auto" />
              <p className="text-white text-sm font-medium">No Field Selected</p>
              <p className="text-white/35 text-xs">Choose a location preset above, or draw your farm boundary on the map</p>
            </div>
          )}

        </div>

        {/* ================= ZONE 2: CENTER CANVAS (INTERACTIVE LEAFLET MAP) ================= */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          
          <div className="relative w-full h-[320px] sm:h-[450px] bg-slate-950 rounded-2xl border border-white/5 overflow-hidden flex items-stretch justify-stretch shadow-inner">
            
            {/* Real Leaflet container */}
            <div id="map-leaflet" ref={mapRef} className="w-full h-full z-10" />

            {/* Map Loading overlay */}
            {isLoading ? (
              <div className="absolute inset-0 bg-[#0b1d0d]/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 gap-3">
                <Loader2 className="w-8 h-8 text-[#cff068] animate-spin" />
                <span className="text-sm font-bold text-white">Loading Satellite Data...</span>
              </div>
            ) : null}

            {/* FLOATING MAP SEARCH BAR */}
            <form 
              onSubmit={handleMapSearch}
              className="absolute top-4 left-4 right-16 sm:left-14 md:right-auto z-20 flex bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-lg pointer-events-auto"
            >
              <input
                type="text"
                placeholder="🔍 Search village, town, district..."
                value={searchMapQuery}
                onChange={(e) => setSearchMapQuery(e.target.value)}
                className="bg-transparent text-white placeholder-white/40 text-xs px-2 sm:px-3 py-1.5 outline-none w-full md:w-60 font-semibold"
              />
              <button
                type="submit"
                disabled={isSearchingMap}
                className="bg-[#cff068] hover:bg-[#b8d94a] disabled:opacity-50 text-[#03260e] text-[10px] font-extrabold uppercase px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center min-w-[50px] sm:min-w-[60px]"
              >
                {isSearchingMap ? '...' : 'Search'}
              </button>
            </form>

            {/* MOBILE MAP CONTROLS TOGGLE */}
            <button
              type="button"
              onClick={() => setShowMobileMapControls(prev => !prev)}
              className="absolute top-4 right-4 z-20 md:hidden w-10 h-10 bg-black/85 border border-white/10 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
              title="Toggle Map Settings"
            >
              <Layers className={`w-4 h-4 transition-colors ${showMobileMapControls ? 'text-emerald-400' : 'text-white/60'}`} />
            </button>

            {/* FLOATING MAP LAYER CONTROLLER */}
            <div className={`absolute top-16 right-4 md:top-4 md:right-4 flex flex-col gap-2.5 items-end z-20 transition-all duration-250 ${
              showMobileMapControls ? 'flex animate-fade-in' : 'hidden md:flex'
            }`}>
              <div className="flex bg-black/75 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
                {[
                  { id: 'rgb', label: 'Normal View', icon: Eye },
                  { id: 'ndvi', label: 'Crop Health', icon: Sprout },
                  { id: 'moisture', label: 'Water Map', icon: Droplet },
                ].map((l) => {
                  const Icon = l.icon;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setActiveLayer(l.id as MapLayer)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
                        activeLayer === l.id 
                          ? 'bg-[#cff068] text-[#03260e]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{l.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Layer opacity cross-fade slider */}
              <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[9px] text-white/50 font-mono shadow-lg w-48">
                <span>Opacity:</span>
                <input 
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={layerOpacity}
                  onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#cff068]"
                />
                <span className="text-white font-bold w-6 text-right">{Math.round(layerOpacity * 100)}%</span>
              </div>

              {/* LOCATE USER BUTTON */}
              <button
                onClick={locateUser}
                disabled={isLocating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black text-xs font-bold rounded-xl shadow-lg cursor-pointer transform active:scale-95 transition-all w-48"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-black" />
                )}
                <span>{isLocating ? 'Finding GPS Location...' : '📍 Find My Location'}</span>
              </button>

              <div className={`w-64 bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border text-[9px] font-mono shadow-lg text-left ${
                earthEngineStatus === 'ready'
                  ? 'border-emerald-400/25 text-emerald-100'
                  : earthEngineStatus === 'error'
                  ? 'border-amber-400/25 text-amber-100'
                  : earthEngineStatus === 'loading'
                  ? 'border-[#cff068]/25 text-white'
                  : 'border-white/10 text-white/50'
              }`}>
                <div className="flex items-center gap-2">
                  {earthEngineStatus === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#cff068] animate-spin" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 text-[#cff068]" />
                  )}
                  <span className="font-bold uppercase tracking-wider">
                    {earthEngineStatus === 'ready'
                      ? 'Earth Engine Live'
                      : earthEngineStatus === 'error'
                      ? 'Fallback Overlay'
                      : earthEngineStatus === 'loading'
                      ? 'Loading Raster'
                      : 'Raster Idle'}
                  </span>
                </div>
                <p className="mt-1 text-white/60 leading-snug">
                  {earthEngineMessage}
                  {earthEngineLayer ? ` (${earthEngineLayer.dateRange.startDate} to ${earthEngineLayer.dateRange.endDate})` : ''}
                </p>
              </div>
            </div>

            {/* FLOATING GLASSMORPHIC TOOLTIP OVERLAY */}
            <div className="absolute top-18 left-14 bg-black/70 backdrop-blur-lg border border-white/10 p-3 rounded-xl text-left text-[10px] pointer-events-none max-w-xs z-20 hidden md:block">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block mb-0.5">Sensing Orbit Locks</span>
              <div className="space-y-0.5 text-white/80 font-mono">
                <p className="flex justify-between gap-4"><span>Resolution:</span> <span className="text-[#cff068]">10-Meter Bands</span></p>
                <p className="flex justify-between gap-4"><span>Sensor:</span> <span className="text-blue-400">Sentinel-2 MSI</span></p>
                <p className="flex justify-between gap-4"><span>Cloud Mask:</span> <span className="text-emerald-400">0.02% Filtered</span></p>
              </div>
            </div>

            {/* FLOATING MAP LEGEND */}
            <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-white/10 text-left space-y-1 text-[9px] font-mono z-20">
              <span className="uppercase text-[#cff068] font-bold block mb-1">GIS Gradient:</span>
              <div className="flex items-center space-x-2 text-white/90">
                <span className="w-2.5 h-2.5 bg-emerald-700 rounded-sm"></span>
                <span>High Crop Vigor / Moisture</span>
              </div>
              <div className="flex items-center space-x-2 text-white/90">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span>
                <span>Mild Soil Moisture Deficit</span>
              </div>
              <div className="flex items-center space-x-2 text-white/90">
                <span className="w-2.5 h-2.5 bg-rose-600 rounded-sm"></span>
                <span>Severe Leaf Water Deficit</span>
              </div>
            </div>

          </div>

          {/* ================= QUEUE ZONE (FIELD LIST) ================= */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-white">All My Fields</h4>
              <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-full">{prioritizedFields.length} fields</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {prioritizedFields.map((f) => {
                const isActive = selectedField?.id === f.id;
                const statusColor = f.stressLevel === 'High' ? 'rose' : f.stressLevel === 'Moderate' ? 'amber' : 'emerald';
                return (
                  <div
                    key={f.id}
                    onClick={() => onSelectField(f)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-[#cff068]/10 border-[#cff068]/40 shadow-[0_0_16px_rgba(207,240,104,0.1)]'
                        : f.stressLevel === 'High'
                        ? 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/35'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    {/* Status dot + crop */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-white/40">{f.cropType}</span>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        f.stressLevel === 'High' ? 'bg-rose-500' : f.stressLevel === 'Moderate' ? 'bg-amber-400' : 'bg-emerald-500'
                      }`} />
                    </div>

                    {/* Field name */}
                    <div className={`text-xs font-bold truncate mb-1 ${ isActive ? 'text-[#cff068]' : 'text-white' }`}>
                      {f.name}
                    </div>

                    {/* Status word */}
                    <div className={`text-[11px] font-medium ${
                      f.stressLevel === 'High' ? 'text-rose-400' : f.stressLevel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {f.stressLevel === 'High' ? '🔴 Needs Water' : f.stressLevel === 'Moderate' ? '🟡 Monitor' : '🟢 Healthy'}
                    </div>
                  </div>
                );
              })}
              {fields.length === 0 && (
                <div className="col-span-4 py-8 text-center text-white/25 text-xs border border-dashed border-white/5 rounded-xl">
                  No fields yet. Draw your farm boundary on the map above.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ================= BOTTOM DRAWER: TREND GRAPH & GEMINI CHATBOT PANEL ================= */}
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden mt-2 relative">
        
        {/* Toggle Bar */}
        <button
          onClick={() => setDrawerExpanded(!drawerExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 text-xs font-bold text-white hover:bg-white/[0.03] transition-all duration-200 cursor-pointer border-b border-white/5"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-white/70 text-sm font-semibold">Crop Health Chart &amp; AI Farming Assistant</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#cff068] bg-[#cff068]/5 border border-[#cff068]/15 px-3 py-1 rounded-full text-xs">
            <span>{drawerExpanded ? 'Hide' : 'Show'}</span>
            {drawerExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Expanded Drawer Area */}
        <AnimatePresence>
          {drawerExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-black/20 text-xs text-[#a8c5ba] text-left"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Panel: Recharts trends */}
                <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-white text-sm mb-0.5">
                      📈 Crop Health Over Time
                    </h5>
                    <p className="text-white/35 text-xs">
                      {selectedField ? selectedField.name : 'Select a field'} — how your crop changed month by month
                    </p>
                  </div>

                  {selectedField ? (
                    <div className="h-56 w-full text-white bg-white/[0.02] border border-white/5 rounded-xl p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} domain={[-1.0, 1.0]} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#041006', border: '1px solid rgba(207,240,104,0.12)', color: '#ffffff', borderRadius: '10px', fontSize: '10px' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}
                          />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '8px', color: 'rgba(255,255,255,0.5)' }} />
                          <Line type="monotone" dataKey="NDVI" stroke="#10b981" strokeWidth={2} dot={{ r: 1.5, fill: '#10b981' }} activeDot={{ r: 4 }} />
                          <Line type="monotone" dataKey="NDWI" stroke="#38bdf8" strokeWidth={2} dot={{ r: 1.5, fill: '#38bdf8' }} activeDot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-56 flex flex-col items-center justify-center gap-2 border border-dashed border-white/8 rounded-xl text-white/25 font-mono text-xs">
                      <Activity className="w-6 h-6 text-white/15" />
                      <span>Select a field to see crop health chart</span>
                    </div>
                  )}

                  <div className="bg-emerald-900/10 border border-emerald-500/15 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#cff068]" />
                      <span className="text-sm font-semibold text-white">Field Notes</span>
                    </div>
                    <div 
                      className="text-white/60 text-xs leading-relaxed max-h-20 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedField?.notes || 'No notes available for this field.') }}
                    />
                  </div>
                </div>

                {/* Right Panel: Gemini Chatbot */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  <div>
                    <h5 className="font-bold text-white text-sm flex items-center gap-2 mb-0.5">
                      <div className="w-5 h-5 rounded-md bg-[#cff068]/10 border border-[#cff068]/20 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-[#cff068]" />
                      </div>
                      Ask AI Farming Assistant
                    </h5>
                    <p className="text-white/35 text-xs">
                      Ask anything about your crop — watering, fertilizer, disease, harvest time
                    </p>
                  </div>

                  {/* Chat bubbles list */}
                  <div className="h-48 overflow-y-auto space-y-2.5 bg-black/20 border border-white/5 rounded-xl p-3 text-[11px] font-sans scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role !== 'user' && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] text-[#cff068] flex-shrink-0 mt-0.5 font-mono font-bold">
                            AI
                          </div>
                        )}
                        <div 
                          className={`px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-br from-[#cff068] to-lime-300 text-[#03260e] font-semibold rounded-tr-none text-[11px]' 
                              : 'bg-white/[0.04] text-white/90 rounded-tl-none border border-white/8'
                          }`}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                        />
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex items-start gap-2 justify-start">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] text-[#cff068] flex-shrink-0 mt-0.5">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/8 text-white/40 italic text-[11px] animate-pulse">
                          Agri-Sense is analysing...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat input form */}
                  <div className="flex gap-2 items-center">
                    <select
                      value={speechLanguage}
                      onChange={(e) => setSpeechLanguage(e.target.value as 'en-US' | 'hi-IN')}
                      className="bg-white/5 border border-white/10 rounded-xl px-1.5 py-2 text-[10px] text-white/70 outline-none focus:border-[#cff068]/50 max-w-[55px] cursor-pointer transition-all"
                      title="Select speech language"
                    >
                      <option value="en-US" className="bg-[#041006]">EN</option>
                      <option value="hi-IN" className="bg-[#041006]">HI</option>
                    </select>

                    <button
                      onClick={startSpeechRecognition}
                      type="button"
                      className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isListening 
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.3)]' 
                          : 'bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white/80'
                      }`}
                      title={isListening ? "Listening..." : "Start voice query"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <input 
                      type="text" 
                      placeholder="e.g. When should I water? Which fertilizer?"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#cff068]/40 transition-all duration-200"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={chatLoading}
                      className="bg-gradient-to-br from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 disabled:opacity-40 text-[#03260e] p-2 rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(207,240,104,0.2)] hover:shadow-[0_0_18px_rgba(207,240,104,0.35)]"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
