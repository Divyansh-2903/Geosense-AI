import React, { useState } from 'react';
import { 
  Settings, 
  HelpCircle, 
  CloudRain, 
  RefreshCw, 
  Check, 
  Save, 
  AlertTriangle,
  Flame,
  User,
  Shield,
  Sliders
} from 'lucide-react';

interface SettingsViewProps {
  criticalThreshold: number;
  onThresholdChange: (val: number) => void;
  onTriggerSimulateRain: () => void;
  onResetAllFields: () => void;
  onAddLog: (message: string, severity: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function SettingsView({
  criticalThreshold,
  onThresholdChange,
  onTriggerSimulateRain,
  onResetAllFields,
  onAddLog
}: SettingsViewProps) {
  
  const [scanFrequency, setScanFrequency] = useState<'daily' | 'weekly'>('daily');
  const [soilType, setSoilType] = useState<'clay' | 'silt' | 'sand'>('clay');
  const [isSaved, setIsSaved] = useState(false);
  
  // Simulated Phone input for companion notifications
  const [phoneVal, setPhoneVal] = useState('');
  const [phoneLinked, setPhoneLinked] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    onAddLog(`System Settings updated: Critical Threshold raised to ${criticalThreshold}%. Soil profile updated with ${soilType.toUpperCase()} coefficients.`, 'info');
    setTimeout(() => {
      setIsSaved(false);
    }, 1500);
  };

  const linkCompanionPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneVal) {
      setPhoneLinked(true);
      onAddLog(`Linked companion phone ${phoneVal} for hydration alarm alerts successfully.`, 'success');
    }
  };

  return (
    <div id="settings-panel" className="space-y-6 select-none animate-fade-in text-white">
      
      {/* HEADER TITLE */}
      <div>
        <h1 className="font-display font-extrabold text-2xl text-white">Settings</h1>
        <p className="text-emerald-100/50 text-xs font-medium">Configure GIS telemetry scan rates, soil baseline metrics, and environmental alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PHYSICAL AGRI TELEMETRY CONFIGURATION (cols 8) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/5 space-y-6 shadow-2xl">
          
          <div className="flex items-center space-x-2.5 border-b border-white/5 pb-4 mb-4">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Agronomic Variables</h3>
          </div>

          {/* Threshold Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wide">Critical Soil Moisture Alarm Cap:</span>
              <span className="font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">{criticalThreshold}%</span>
            </div>
            <p className="text-[11px] text-white/60">
              When any parcel falls beneath this soil water holding capacity index, a dynamic red "Critical" alarm triggers immediately.
            </p>
            <input 
              id="critical-threshold-slider"
              type="range"
              min="20"
              max="50"
              step="5"
              value={criticalThreshold}
              onChange={(e) => onThresholdChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#cff068]"
            />
            <div className="flex justify-between text-[10px] text-white/40 font-mono">
              <span>20% (Desert sand dry)</span>
              <span>35% (Baseline Corn stress)</span>
              <span>50% (Saturated damp silt)</span>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Satellite and Soil Profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 block uppercase tracking-wider">ESA Satellite Scan Iterations:</label>
              <select 
                id="satellite-scan-select"
                value={scanFrequency}
                onChange={(e: any) => {
                  setScanFrequency(e.target.value);
                  onAddLog(`Satellite scan iteration frequency set to ${e.target.value.toUpperCase()}.`, 'info');
                }}
                className="w-full bg-white/5 text-white text-xs font-semibold px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-emerald-500/30 cursor-pointer transition-all"
              >
                <option value="daily" className="bg-[#041006] text-white">Daily Sweeps (Sentinel-2 Constellation)</option>
                <option value="weekly" className="bg-[#041006] text-white">Weekly Sweeps (Low data consumption mode)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 block uppercase tracking-wider">Soil Mineral Texture Class:</label>
              <select 
                id="soil-texture-select"
                value={soilType}
                onChange={(e: any) => setSoilType(e.target.value)}
                className="w-full bg-white/5 text-white text-xs font-semibold px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-emerald-500/30 cursor-pointer transition-all"
              >
                <option value="clay" className="bg-[#041006] text-white">Clay Loams (High retention capacity, slow runoff)</option>
                <option value="silt" className="bg-[#041006] text-white">Silt Loams (Moderate retention, prone to hard crusting)</option>
                <option value="sand" className="bg-[#041006] text-white">Sandy / Silica Soil (Low water retention capacity)</option>
              </select>
            </div>

          </div>

          <div className="border-t border-white/5 pt-4 flex items-center justify-end">
            <button 
              id="btn-save-settings"
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all transform active:scale-95 flex items-center space-x-2 cursor-pointer shadow-md"
            >
              {isSaved ? <Check className="w-4.5 h-4.5 text-black stroke-[3px]" /> : <Save className="w-4.5 h-4.5" />}
              <span>{isSaved ? 'Settings Saved' : 'Save Config'}</span>
            </button>
          </div>

        </div>

        {/* ENVIRONMENTAL SIMULATORS & SIM CARD (cols 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SIMULATORS CARD */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <CloudRain className="w-5 h-5 text-sky-400 animate-bounce" />
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Atmospheric Simulator</h3>
            </div>
            
            <p className="text-xs text-white/60 leading-relaxed font-medium">
              Don't wait for mother nature! Playfully inject natural climatic variables to test dynamic stress mapping behaviors live.
            </p>

            <button 
              id="btn-simulate-rain"
              onClick={onTriggerSimulateRain}
              className="w-full bg-[#1e40af] hover:bg-blue-900 border border-blue-700 text-white font-display font-bold text-[10px] tracking-wider uppercase py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_12px_rgba(30,64,175,0.4)]"
            >
              <CloudRain className="w-4 h-4 text-[#cff068]" />
              <span>Simulate Rainfall (+15mm) 🌦️</span>
            </button>

            <button 
              id="btn-reset-fields"
              onClick={onResetAllFields}
              className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold tracking-wider uppercase py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reset Fields to Default</span>
            </button>
          </div>

          {/* COMPANION ALARM LINK CARD */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Pushed Alarm Alerts</h3>
            </div>

            <p className="text-xs text-white/60 leading-relaxed font-medium">
              Link your device to receive real-time push diagnostics when soil moisture limits crash.
            </p>

            {phoneLinked ? (
              <div className="p-3 bg-[#041006] border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center space-x-1.5 animate-pulse">
                <Check className="w-4 h-4 stroke-2" />
                <span>Linked device: {phoneVal}</span>
              </div>
            ) : (
              <form onSubmit={linkCompanionPhone} className="space-y-2">
                <input 
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  required
                  className="w-full bg-white/5 text-white text-xs px-3.5 py-3 rounded-xl border border-white/10 outline-none focus:border-emerald-500/30 font-semibold"
                />
                <button 
                  type="submit"
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-display font-semibold text-[10px] tracking-wider uppercase py-2.5 rounded-xl cursor-pointer"
                >
                  Link Mobile Number
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
