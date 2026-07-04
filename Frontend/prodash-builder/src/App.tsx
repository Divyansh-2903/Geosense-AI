import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Field,
  ActivityLog,
  DashboardTab,
  StressStatus,
  FarmAnalysisHistory
} from './types';
import {
  INITIAL_FIELDS,
  INITIAL_LOGS
} from './data';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import FieldMapsView from './components/FieldMapsView';
import WeatherTrendsView from './components/WeatherTrendsView';
import CropAnalyticsView from './components/CropAnalyticsView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import { useAuth } from '../../src/context/AuthContext';
import { API_BASE_URL } from '../../src/config/api';
import { downloadFarmReportPdf } from './utils/farmReportPdf';

const API_BASE = API_BASE_URL;

const sortAnalysisHistory = (analyses: FarmAnalysisHistory[] = []) =>
  [...analyses]
    .sort((a, b) => {
      const bTime = new Date(b.calculatedAt || b.generatedAt || 0).getTime();
      const aTime = new Date(a.calculatedAt || a.generatedAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 50);

export default function App({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize with empty list or demo presets if offline/logged out
  const [fields, setFields] = useState<Field[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [criticalThreshold, setCriticalThreshold] = useState<number>(40);
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Helper utility to calculate stress status on bounds (fallback offline calculations)
  const calculateFieldStatus = (moisture: number, threshold: number): { status: StressStatus, stressLevel: 'High' | 'Moderate' | 'Low', deficit: number } => {
    if (moisture >= 60) {
      return { status: 'Optimal', stressLevel: 'Low', deficit: -5 };
    } else if (moisture >= threshold) {
      return { status: 'Marginal', stressLevel: 'Moderate', deficit: -25 };
    } else {
      return { status: 'Critical', stressLevel: 'High', deficit: -45 };
    }
  };

  // 1. ADD ACTIVITY LOG HELPER
  const handleAddLog = (message: string, severity: 'info' | 'success' | 'warning' | 'error') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      message,
      timeLabel: 'Just now',
      type: severity === 'success' ? 'irrigation' : severity === 'info' ? 'satellite' : 'system',
      severity
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleDownloadReport = async (field?: Field) => {
    const reportField = field || selectedField;

    if (!reportField) {
      handleAddLog('No active field selected for PDF export.', 'warning');
      return;
    }

    try {
      await downloadFarmReportPdf(reportField, user);
      handleAddLog(`PDF report exported for ${reportField.name}.`, 'success');
    } catch (err: any) {
      console.error('PDF export failed:', err);
      handleAddLog(`PDF export failed for ${reportField.name}.`, 'error');
      alert(`Could not export PDF report: ${err.message || 'Unknown error'}`);
    }
  };

  // Helper to map DB Farm object to UI Field structure
  const mapDbFarmToField = (farm: any): Field => {
    const sortedAnalyses = sortAnalysisHistory(farm.analyses || []);
    // If farm has analyses, pull the latest one
    const latestAnalysis = sortedAnalyses.length > 0 ? sortedAnalyses[0] : null;

    let ndviVal = 0.5;
    let ndwiVal = -0.5;
    let smiVal: number | undefined;
    let vciVal: number | undefined;
    let eviVal: number | undefined;
    let saviVal: number | undefined;
    let sarVal: Field['sar'] = {
      vv: -12.5,
      vh: -18.5,
      vhVvRatio: 0.25
    };
    let moistureVal = 50;
    let statusVal: StressStatus = 'Optimal';
    let stressLvl: 'High' | 'Moderate' | 'Low' = 'Low';
    let deficitVal = 0;
    let tempVal = 22;
    let rainVal = 12;
    let weatherVal: Field['weather'] | undefined;
    let etVal = 3.5;
    let adviceText = 'No analysis run yet. Define boundary and click "Run Farm Analysis" to pull remote sensing details.';
    let priorityLvl = 'Low';

    if (latestAnalysis) {
      ndviVal = latestAnalysis.ndvi ?? ndviVal;
      ndwiVal = latestAnalysis.ndwi ?? ndwiVal;
      smiVal = latestAnalysis.smi ?? latestAnalysis.indices?.smi;
      vciVal = latestAnalysis.vci ?? latestAnalysis.indices?.vci;
      eviVal = latestAnalysis.evi ?? latestAnalysis.indices?.evi;
      saviVal = latestAnalysis.savi ?? latestAnalysis.indices?.savi;
      sarVal = latestAnalysis.sar ?? sarVal;
      moistureVal = typeof latestAnalysis.ndwi === 'number' ? Math.round((latestAnalysis.ndwi + 1) * 50) : moistureVal;

      const s = (latestAnalysis.stressLevel || 'LOW').toUpperCase();
      if (s === 'HIGH' || s === 'CRITICAL') {
        statusVal = 'Critical';
        stressLvl = 'High';
      } else if (s === 'MODERATE' || s === 'MARGINAL') {
        statusVal = 'Marginal';
        stressLvl = 'Moderate';
      } else {
        statusVal = 'Optimal';
        stressLvl = 'Low';
      }

      deficitVal = latestAnalysis.waterDeficit ?? deficitVal;
      weatherVal = latestAnalysis.weather || {
        rainfall: latestAnalysis.rainfall,
        temperature: latestAnalysis.temperature
      };
      tempVal = weatherVal.temperature ?? latestAnalysis.temperature ?? tempVal;
      rainVal = weatherVal.rainfall ?? latestAnalysis.rainfall ?? rainVal;
      adviceText = latestAnalysis.agronomy?.waterRequirement?.recommendation
        ?? latestAnalysis.irrigationDetails?.advice
        ?? latestAnalysis.aiAdvice
        ?? adviceText;
      priorityLvl = latestAnalysis.irrigationDetails?.priority ?? priorityLvl;
    }

    // Convert geometry ring coordinates back to SVG or mock coordinate if SVG coordinates required
    // (In our Leaflet map implementation we will use farm.geometry directly!)
    let boundaryPath = '';
    if (farm.geometry && farm.geometry.coordinates && farm.geometry.coordinates[0]) {
      // Simulate simple SVG path for backward compat in SVG tables
      const coords = farm.geometry.coordinates[0];
      boundaryPath = coords.map((c: number[], idx: number) =>
        `${idx === 0 ? 'M' : 'L'} ${Math.round((c[0] - 76.3) * 10000)} ${Math.round((26.9 - c[1]) * 10000)}`
      ).join(' ') + ' Z';
    }

    return {
      id: farm._id,
      name: farm.name,
      cropType: farm.crop || 'Rice',
      acreage: Math.round(farm.areaHectare * 2.47105), // Hectares to Acres
      avgNdvi: ndviVal,
      moisture: moistureVal,
      status: statusVal,
      boundaryCoords: boundaryPath || 'M 0 0 Z',
      notes: adviceText,
      waterDeficit: deficitVal,
      stressLevel: stressLvl,
      avgTemp: tempVal,
      geometry: farm.geometry,
      analyses: sortedAnalyses,
      indices: {
        ndvi: ndviVal,
        ndwi: ndwiVal,
        smi: smiVal,
        vci: vciVal,
        evi: eviVal,
        savi: saviVal
      },
      ndwi: ndwiVal,
      smi: smiVal,
      vci: vciVal,
      evi: eviVal,
      savi: saviVal,
      sar: sarVal,
      rainfall: rainVal,
      weather: weatherVal,
      et: etVal,
      agronomy: latestAnalysis?.agronomy,
      irrigationAdvisory: adviceText,
      urgencyLevel: priorityLvl,
      trends: latestAnalysis?.trends?.ndvi && latestAnalysis?.trends?.ndwi
        ? {
          ndvi: latestAnalysis.trends.ndvi,
          ndwi: latestAnalysis.trends.ndwi
        }
        : {
          ndvi: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, ndvi: ndviVal - 0.05 * Math.cos(i) })),
          ndwi: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, ndwi: ndwiVal - 0.08 * Math.sin(i) }))
        }
    };
  };

  // 2. FETCH FARMS FROM DATABASE
  const fetchFarms = async () => {
    if (!token) {
      const cached = localStorage.getItem('geoharvest_cached_fields');
      if (cached) {
        setFields(JSON.parse(cached));
      } else {
        setFields(INITIAL_FIELDS);
      }
      if (INITIAL_FIELDS.length > 0 && !selectedFieldId) {
        setSelectedFieldId(INITIAL_FIELDS[0].id);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/farms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedFarms = data.map((farm: any) => mapDbFarmToField(farm));
        setFields(mappedFarms);
        localStorage.setItem('geoharvest_cached_fields', JSON.stringify(mappedFarms));
        if (mappedFarms.length > 0 && (!selectedFieldId || !mappedFarms.some((f: Field) => f.id === selectedFieldId))) {
          setSelectedFieldId(mappedFarms[0].id);
        }
      } else {
        console.warn('Failed to fetch farms, loading from local cache');
        const cached = localStorage.getItem('geoharvest_cached_fields');
        if (cached) {
          setFields(JSON.parse(cached));
        } else {
          setFields(INITIAL_FIELDS);
        }
      }
    } catch (err) {
      console.error('Error fetching farms, loading cache:', err);
      const cached = localStorage.getItem('geoharvest_cached_fields');
      if (cached) {
        setFields(JSON.parse(cached));
      } else {
        setFields(INITIAL_FIELDS);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load farms on mount and token change
  useEffect(() => {
    fetchFarms();
  }, [token]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleAddLog('Internet connection restored. GeoHarvest is online.', 'success');
      fetchFarms();
    };
    const handleOffline = () => {
      setIsOnline(false);
      handleAddLog('Connection lost. GeoHarvest is running in offline mode.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. CREATE NEW FARM FIELD IN DATABASE
  const handleCreateFarm = async (name: string, crop: string, areaHectare: number, geometry: any) => {
    if (!token) {
      // Create local temporary farm
      const newId = `LOCAL-${Date.now()}`;
      const newField: Field = {
        id: newId,
        name,
        cropType: crop,
        acreage: Math.round(areaHectare * 2.47105),
        avgNdvi: 0.5,
        moisture: 50,
        status: 'Optimal',
        boundaryCoords: 'M 0 0 Z',
        notes: 'Local anonymous field created. Run analysis to fetch Earth Engine parameters.',
        waterDeficit: 0,
        stressLevel: 'Low',
        avgTemp: 22,
        geometry
      };
      setFields(prev => [newField, ...prev]);
      setSelectedFieldId(newId);
      handleAddLog(`Local demo farm "${name}" boundary added successfully.`, 'success');
      return newId;
    }

    try {
      const response = await fetch(`${API_BASE}/farms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          crop,
          areaHectare,
          geometry
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save farm');
      }

      const createdFarm = await response.json();
      handleAddLog(`Farm "${name}" successfully saved to account.`, 'success');

      // Refresh field list
      await fetchFarms();
      setSelectedFieldId(createdFarm._id);
      return createdFarm._id;
    } catch (err: any) {
      console.error('Save farm error:', err);
      alert(`Could not save farm: ${err.message}`);
    }
  };

  // 4. DELETE FARM FIELD
  const handleDeleteFarm = async (id: string) => {
    if (id.startsWith('LOCAL-') || !token) {
      setFields(prev => prev.filter(f => f.id !== id));
      handleAddLog('Local field deleted.', 'info');
      setSelectedFieldId(fields[0]?.id || '');
      return;
    }

    if (!confirm('Are you sure you want to delete this farm? This will remove all satellite analytics history.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/farms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        handleAddLog('Farm deleted from account.', 'success');
        await fetchFarms();
      } else {
        const errData = await response.json();
        alert(`Failed to delete farm: ${errData.error}`);
      }
    } catch (err: any) {
      console.error('Delete farm error:', err);
      alert(`Error deleting farm: ${err.message}`);
    }
  };

  // 5. FETCH REMOTE SENSING TELEMETRY (RUN ANALYSIS)
  const fetchFieldData = async (fieldId: string, silent = false) => {
    if (!fieldId) return;
    setApiLoading(prev => ({ ...prev, [fieldId]: true }));
    const field = fields.find(f => f.id === fieldId);
    if (!field) {
      setApiLoading(prev => ({ ...prev, [fieldId]: false }));
      return;
    }

    try {
      // Define preset geometry mapping if coordinate polygon path is absent
      const coordsMap: Record<string, any> = {
        'FLD-8492': { type: 'Polygon', coordinates: [[[76.3058, 26.9035], [76.3054, 26.9029], [76.3057, 26.9023], [76.3064, 26.9019], [76.3068, 26.9032], [76.3058, 26.9035]]] },
        'FLD-3901': { type: 'Polygon', coordinates: [[[76.3040, 26.9015], [76.3045, 26.9010], [76.3050, 26.9012], [76.3048, 26.9018], [76.3040, 26.9015]]] },
        'FLD-5102': { type: 'Polygon', coordinates: [[[76.3075, 26.9030], [76.3080, 26.9025], [76.3085, 26.9028], [76.3082, 26.9035], [76.3075, 26.9030]]] },
        'FLD-9182': { type: 'Polygon', coordinates: [[[76.3020, 26.9025], [76.3025, 26.9020], [76.3030, 26.9022], [76.3028, 26.9028], [76.3020, 26.9025]]] },
      };

      const geometry = field.geometry || coordsMap[fieldId] || coordsMap['FLD-8492'];

      const response = await fetch(`${API_BASE}/analyze-farm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          crop: field.cropType,
          areaHectare: field.acreage / 2.47105,
          geometryInput: geometry,
          farmId: fieldId,
          year: '2025'
        })
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();

      // Convert backend stress text to client category
      let stressCategory: 'Healthy' | 'Mild' | 'Moderate' | 'High Stress' = 'Healthy';
      const s = (data.ndwiStress || '').toLowerCase();
      if (s.includes('high') || s.includes('critical')) stressCategory = 'High Stress';
      else if (s.includes('moderate') || s.includes('marginal')) stressCategory = 'Moderate';
      else if (s.includes('mild')) stressCategory = 'Mild';

      const p = (data.irrigationDetails?.priority || 'LOW').toUpperCase();
      const mappedUrgency = p === 'HIGH' ? 'High' : p === 'MEDIUM' ? 'Moderate' : 'Low';
      const mappedStatus = stressCategory === 'Healthy' ? 'Optimal' : stressCategory === 'Mild' ? 'Optimal' : stressCategory === 'Moderate' ? 'Marginal' : 'Critical';
      const analysisPayload: FarmAnalysisHistory = {
        calculatedAt: new Date().toISOString(),
        ndvi: data.ndvi,
        ndwi: data.ndwi,
        smi: data.smi,
        vci: data.vci,
        evi: data.evi,
        savi: data.savi,
        indices: data.indices,
        stressLevel: data.ndwiStress || 'LOW',
        waterDeficit: data.waterDeficit || 0,
        rainfall: data.rainfall,
        temperature: data.temperature,
        weather: data.weather,
        growthStage: data.growthStage,
        diseaseRisk: data.diseaseRisk,
        diseaseName: data.diseaseName,
        agronomy: data.agronomy,
        yieldPrediction: parseFloat(data.yieldPrediction) || 0,
        revenuePrediction: parseFloat(data.revenuePrediction) || 0,
        fertilizer: data.fertilizer,
        irrigationDetails: {
          priority: data.irrigationDetails?.priority || 'LOW',
          needed: data.irrigationDetails?.needed || false,
          advice: data.irrigationDetails?.advice || '',
          waterRequirementLitres: data.irrigationDetails?.waterRequirementLitres ?? data.agronomy?.waterRequirementLitres,
          actionWindow: data.irrigationDetails?.actionWindow ?? data.agronomy?.actionWindow,
          urgencyScore: data.irrigationDetails?.urgencyScore ?? data.agronomy?.urgencyScore
        },
        aiAdvice: data.aiAdvice,
        trends: data.trends
      };
      let savedAnalyses: FarmAnalysisHistory[] | undefined;

      // Save analysis report to farm history if user is authenticated and this is a DB field
      if (token && !fieldId.startsWith('LOCAL-')) {
        try {
          const saveResponse = await fetch(`${API_BASE}/farms/${fieldId}/analysis`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...analysisPayload,
              sar: data.sar,
            })
          });
          if (saveResponse.ok) {
            const savedFarm = await saveResponse.json();
            savedAnalyses = sortAnalysisHistory(savedFarm.analyses || []);
          }
        } catch (dbErr) {
          console.error('Failed to save analysis to history:', dbErr);
        }
      }

      // Update UI state directly for immediate feedback
      setFields(prev => prev.map(f => {
        if (f.id === fieldId) {
          return {
            ...f,
            avgNdvi: data.ndvi ?? f.avgNdvi,
            moisture: typeof data.ndwi === 'number' ? Math.round((data.ndwi + 1) * 50) : f.moisture,
            status: mappedStatus,
            stressLevel: mappedUrgency === 'High' ? 'High' : mappedUrgency === 'Moderate' ? 'Moderate' : 'Low',
            waterDeficit: -Math.round(data.waterDeficit ?? 0),
            notes: data.irrigationDetails?.advice ?? data.irrigation ?? f.notes,
            ndwi: data.ndwi ?? -0.5,
            smi: data.smi ?? data.indices?.smi ?? f.smi,
            vci: data.vci ?? data.indices?.vci ?? f.vci,
            evi: data.evi ?? data.indices?.evi ?? f.evi,
            savi: data.savi ?? data.indices?.savi ?? f.savi,
            indices: {
              ndvi: data.ndvi ?? f.indices?.ndvi ?? f.avgNdvi,
              ndwi: data.ndwi ?? f.indices?.ndwi ?? f.ndwi,
              smi: data.smi ?? data.indices?.smi ?? f.smi,
              vci: data.vci ?? data.indices?.vci ?? f.vci,
              evi: data.evi ?? data.indices?.evi ?? f.evi,
              savi: data.savi ?? data.indices?.savi ?? f.savi
            },
            sar: data.sar ?? f.sar,
            rainfall: data.rainfall ?? 12,
            weather: data.weather ?? f.weather,
            avgTemp: data.weather?.temperature ?? data.temperature ?? f.avgTemp,
            et: data.weather?.evaporation ?? f.et ?? 3.5,
            agronomy: data.agronomy ?? f.agronomy,
            irrigationAdvisory: data.agronomy?.waterRequirement?.recommendation ?? data.irrigationDetails?.advice ?? data.irrigation,
            urgencyLevel: data.agronomy?.actionWindow ?? mappedUrgency,
            analyses: savedAnalyses || sortAnalysisHistory([
              { ...analysisPayload, sar: data.sar },
              ...(f.analyses || [])
            ]),
            trends: data.trends || f.trends
          };
        }
        return f;
      }));

      if (!silent) {
        handleAddLog(`Satellite sync complete for ${field.name}: NDVI is ${data.ndvi?.toFixed(2)}`, 'success');
      }
    } catch (err: any) {
      console.warn(`Fetch failed for ${field.name}, running offline:`, err.message);
      // Fallback local calculations so it behaves nicely offline
      setFields(prev => prev.map(f => {
        if (f.id === fieldId) {
          const fallbackNdwi = f.avgNdvi - 1.1;
          const fallbackSmi = Math.max(0, Math.min(1, ((fallbackNdwi + 1) / 2 + ((f.sar?.vhVvRatio ?? 0.24) / 0.5)) / 2));
          const fallbackWaterLitres = Math.round(Math.abs(f.waterDeficit || 25) * (f.acreage / 2.47105) * 10000);
          return {
            ...f,
            ndwi: fallbackNdwi,
            smi: fallbackSmi,
            vci: Math.max(0, Math.min(1, (f.avgNdvi - 0.25) / 0.65)),
            evi: Math.max(-1, Math.min(1, f.avgNdvi * 0.62)),
            savi: Math.max(-1, Math.min(1, f.avgNdvi * 0.72)),
            indices: {
              ndvi: f.avgNdvi,
              ndwi: fallbackNdwi,
              smi: fallbackSmi,
              vci: Math.max(0, Math.min(1, (f.avgNdvi - 0.25) / 0.65)),
              evi: Math.max(-1, Math.min(1, f.avgNdvi * 0.62)),
              savi: Math.max(-1, Math.min(1, f.avgNdvi * 0.72))
            },
            rainfall: 8,
            weather: {
              rainfall: 8,
              temperature: f.avgTemp,
              humidity: f.cropType.toLowerCase() === 'rice' ? 78 : 55,
              windSpeed: 9.5,
              solarRadiation: 235,
              evaporation: 3.2
            },
            et: 3.2,
            agronomy: {
              cropCalendar: {
                crop: f.cropType,
                stage: 'Vegetative',
                ndviStatus: f.avgNdvi >= 0.6 ? 'strong canopy' : 'developing canopy',
                recommendation: 'Continue crop scouting and maintain stable irrigation intervals.'
              },
              waterRequirementLitres: fallbackWaterLitres,
              waterRequirement: {
                litres: fallbackWaterLitres,
                recommendation: `Apply approximately ${fallbackWaterLitres.toLocaleString()} litres if field scouting confirms dry topsoil.`
              },
              fertilizerPlan: {
                crop: f.cropType,
                growthStage: 'Vegetative',
                totalKg: Math.round((f.acreage / 2.47105) * 65),
                nutrients: {
                  nitrogenKg: Math.round((f.acreage / 2.47105) * 35),
                  phosphorusKg: Math.round((f.acreage / 2.47105) * 15),
                  potassiumKg: Math.round((f.acreage / 2.47105) * 15)
                },
                recommendation: 'Use a balanced NPK split dose after local soil confirmation.'
              },
              diseaseAdvisory: {
                diseaseName: 'No Major Risk',
                riskLevel: 'LOW',
                recommendation: 'Continue routine scouting before applying crop protection products.',
                prevention: 'Avoid unnecessary foliar wetting.'
              },
              urgencyScore: f.status === 'Critical' ? 75 : f.status === 'Marginal' ? 50 : 20,
              actionWindow: f.status === 'Critical' ? 'within 24h' : f.status === 'Marginal' ? 'within 48h' : 'within 7 days'
            },
            irrigationAdvisory: f.status === 'Critical'
              ? `Apply 45mm of water within the next 24 hours to alleviate drought stress.`
              : f.status === 'Marginal'
                ? `Schedule 25mm of water within the next 48 hours.`
                : `Hydration levels are optimal. No action required.`,
            urgencyLevel: f.status === 'Critical' ? 'High' : f.status === 'Marginal' ? 'Moderate' : 'Low',
            trends: {
              ndvi: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, ndvi: f.avgNdvi - 0.05 * Math.cos(i) })),
              ndwi: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, ndwi: (f.avgNdvi - 1.1) - 0.08 * Math.sin(i) }))
            }
          };
        }
        return f;
      }));
      if (!silent) {
        handleAddLog(`Offline: Loaded mock data for ${field.name}.`, 'info');
      }
    } finally {
      setApiLoading(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  // Sync whenever active field changes
  useEffect(() => {
    if (selectedFieldId) {
      fetchFieldData(selectedFieldId, true);
    }
  }, [selectedFieldId]);

  // 6. REPLENISH OR UPDATE FIELD MOISTURE
  const handleUpdateFieldMoisture = (id: string, newMoisture: number) => {
    setFields(prev => prev.map(field => {
      if (field.id === id) {
        const { status, stressLevel, deficit } = calculateFieldStatus(newMoisture, criticalThreshold);
        return {
          ...field,
          moisture: newMoisture,
          status,
          stressLevel,
          waterDeficit: deficit
        };
      }
      return field;
    }));
  };

  // 7. EDIT SLIDER THRESHOLD IN REALTIME
  const handleThresholdChange = (val: number) => {
    setCriticalThreshold(val);
    setFields(prev => prev.map(field => {
      const { status, stressLevel, deficit } = calculateFieldStatus(field.moisture, val);
      return {
        ...field,
        status,
        stressLevel,
        waterDeficit: deficit
      };
    }));
  };

  // 8. ATMOSPHERIC RAINFALL SIMULATOR
  const handleSimulateRainfall = () => {
    setFields(prev => prev.map(field => {
      const nextMoisture = Math.min(100, field.moisture + 18);
      const { status, stressLevel, deficit } = calculateFieldStatus(nextMoisture, criticalThreshold);
      return {
        ...field,
        moisture: nextMoisture,
        status,
        stressLevel,
        waterDeficit: deficit
      };
    }));
    handleAddLog('Heavy rainfall simulator delivered 18mm regional precipitation across clay soils.', 'success');
  };

  // 9. REFRESH INDICES (SATELLITE SYNC)
  const handleSyncSatellite = () => {
    if (selectedFieldId) {
      fetchFieldData(selectedFieldId, false);
    } else {
      handleAddLog('No field selected to sync.', 'warning');
    }
  };

  // 10. SIMULATE EMERGENCY ANOMALY (CRASH MOISTURE IN PRESET OR FIRST FIELD)
  const handleSimulateAnomaly = () => {
    const targetId = selectedFieldId || (fields[0] && fields[0].id);
    if (!targetId) return;

    setFields(prev => prev.map(field => {
      if (field.id === targetId) {
        return {
          ...field,
          moisture: 33, // falls below threshold
          status: 'Critical',
          stressLevel: 'High',
          waterDeficit: -48,
          notes: 'Emergency Anomaly simulation triggered. Rapid crop canopy transpiration crash observed.'
        };
      }
      return field;
    }));
    const targetName = fields.find(f => f.id === targetId)?.name || 'selected field';
    handleAddLog(`Urgent: Extreme soil dehydration warning flagged in ${targetName}!`, 'error');
  };

  // 11. RESTORE TO STANDARDS
  const handleResetFields = () => {
    fetchFarms();
    setCriticalThreshold(40);
    handleAddLog('Soil baseline variables re-synced to database standards.', 'info');
  };

  // Find currently selected field object
  const selectedField = fields.find(f => f.id === selectedFieldId) || fields[0];

  return (
    <div className="bg-[#020603] min-h-screen font-sans text-white animate-fade-in">
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/25 text-amber-400 text-center py-2.5 text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-2 animate-fade-in shadow-lg z-50 sticky top-0 uppercase backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 animate-pulse text-amber-500" />
          <span>Offline mode active: displaying cached farm registries. Remote analyses will run in simulation mode.</span>
        </div>
      )}

      {/* MAIN SECURE MASTER PANEL */}
      <div id="geoharvest-app-shell" className="flex h-screen overflow-hidden">

        {/* SECURE SIDEBAR MENURAIL */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false); // Close sidebar on tap in mobile
          }}
          onBackToLanding={onBackToLanding}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* DOCK COLUMN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* INTEGRATED TOP NAVIGATION */}
          <Header
            searchQuery={searchQuery}
            onSearchChange={(query) => setSearchQuery(query)}
            fields={fields}
            onSelectFieldById={(id) => {
              setSelectedFieldId(id);
              setActiveTab('maps'); // focus on maps tab automatically
              setIsMobileSidebarOpen(false);
            }}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsMobileSidebarOpen(false);
            }}
            onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          />

          {/* SCROLLABLE VIEWPORT */}
          <main id="app-view-main" className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#020603] to-[#041006] relative">

            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020603] z-40 gap-3.5">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest animate-pulse">SYNCHRONIZING TELEMETRY STACK...</span>
              </div>
            ) : null}

            {activeTab === 'dashboard' && !loading && (
              <DashboardView
                fields={fields}
                logs={logs}
                onSelectFieldById={(id) => {
                  setSelectedFieldId(id);
                  setActiveTab('maps');
                }}
                onRefreshData={handleSyncSatellite}
                onTriggerAddAnomaly={handleSimulateAnomaly}
                onDownloadReport={handleDownloadReport}
              />
            )}

            {activeTab === 'maps' && !loading && (
              <FieldMapsView
                fields={fields}
                selectedField={selectedField}
                onSelectField={(f) => setSelectedFieldId(f.id)}
                onUpdateFieldMoisture={handleUpdateFieldMoisture}
                onAddLog={handleAddLog}
                isLoading={apiLoading[selectedFieldId] || false}
                onCreateFarm={handleCreateFarm}
                onDeleteFarm={handleDeleteFarm}
                onDownloadReport={handleDownloadReport}
              />
            )}

            {activeTab === 'weather' && !loading && (
              <WeatherTrendsView selectedField={selectedField} />
            )}

            {activeTab === 'crop' && !loading && (
              <CropAnalyticsView
                fields={fields}
                selectedField={selectedField}
                onUpdateFieldMoisture={handleUpdateFieldMoisture}
                onAddLog={handleAddLog}
                onDownloadReport={handleDownloadReport}
              />
            )}

            {activeTab === 'settings' && !loading && (
              <SettingsView
                criticalThreshold={criticalThreshold}
                onThresholdChange={handleThresholdChange}
                onTriggerSimulateRain={handleSimulateRainfall}
                onResetAllFields={handleResetFields}
                onAddLog={handleAddLog}
              />
            )}

            {activeTab === 'profile' && !loading && (
              <ProfileView />
            )}

          </main>

        </div>

      </div>

    </div>
  );
}
