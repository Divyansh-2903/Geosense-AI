import React, { useState } from 'react';
import { 
  Sprout, 
  AlertTriangle, 
  Map, 
  ChevronRight,
  RefreshCw,
  TrendingUp,
  FileDown,
  Droplet,
  CloudRain,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Field, ActivityLog } from '../types';
import FarmHistoryView from './FarmHistoryView';

interface DashboardViewProps {
  fields: Field[];
  logs: ActivityLog[];
  onSelectFieldById: (id: string) => void;
  onRefreshData: () => void;
  onTriggerAddAnomaly: () => void;
  onDownloadReport: (field: Field) => void | Promise<void>;
}

export default function DashboardView({ 
  fields, 
  logs, 
  onSelectFieldById, 
  onRefreshData,
  onTriggerAddAnomaly,
  onDownloadReport
}: DashboardViewProps) {
  
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const formatIndex = (value: number | undefined, digits = 2) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'N/A';

  // Dynamic values from real data
  const totalAcreageSum = fields.reduce((sum, f) => sum + f.acreage, 0);
  const criticalCount = fields.filter(f => f.status === 'Critical').length;
  const activeFieldsCount = fields.length;
  const healthyCount = fields.filter(f => f.status !== 'Critical').length;

  // Average NDVI → plain crop health label
  const avgNdviAll = fields.length > 0 
    ? parseFloat((fields.reduce((sum, f) => sum + f.avgNdvi, 0) / fields.length).toFixed(2)) 
    : 0.5;
  const cropHealthLabel = avgNdviAll >= 0.65 ? 'Good' : avgNdviAll >= 0.45 ? 'Average' : 'Poor';
  const cropHealthColor = avgNdviAll >= 0.65 ? 'text-emerald-400' : avgNdviAll >= 0.45 ? 'text-amber-400' : 'text-rose-400';

  // Bar chart — plain farmer-friendly labels, values as %
  const barChartData = fields.length > 0
    ? fields.map(f => ({
        name: f.name.length > 12 ? f.name.slice(0, 12) + '…' : f.name,
        'Crop Health': parseFloat((f.avgNdvi * 100).toFixed(0)),
        'Soil Water': parseFloat((((f.ndwi ?? -0.5) + 1) * 50).toFixed(0)),
        'Moisture %': f.moisture ?? 50
      }))
    : [
        { name: 'Rabi Wheat', 'Crop Health': 72, 'Soil Water': 77, 'Moisture %': 61 },
        { name: 'Kharif Rice', 'Crop Health': 85, 'Soil Water': 86, 'Moisture %': 78 },
        { name: 'Mustard Plot', 'Crop Health': 58, 'Soil Water': 71, 'Moisture %': 44 },
        { name: 'Sugarcane Belt', 'Crop Health': 68, 'Soil Water': 80, 'Moisture %': 57 }
      ];

  const handleKpiClick = (type: string) => {
    setSelectedKpi(selectedKpi === type ? null : type);
  };

  return (
    <div id="dashboard-view-panel" className="space-y-6 select-none animate-fade-in">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-normal text-white">
            Good Morning, Farmer 🌾
          </h1>
          <p className="text-white/40 text-sm font-medium mt-0.5">
            Here's how your fields are doing today
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            id="btn-sync-satellite"
            onClick={onRefreshData}
            className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

          <button 
            id="btn-test-alert"
            onClick={onTriggerAddAnomaly}
            className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-400 to-lime-300 text-[#03260e] px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(207,240,104,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Test Alert</span>
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Land */}
        <div 
          onClick={() => handleKpiClick('acreage')}
          className={`rounded-2xl p-5 transition-all duration-300 cursor-pointer border ${
            selectedKpi === 'acreage' 
              ? 'bg-white/[0.05] border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
              : 'glass-panel glass-panel-hover'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Map className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm text-white/50 font-medium">Total Land</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {totalAcreageSum}
            <span className="text-base font-normal text-white/40 ml-1">acres</span>
          </div>
          <div className="text-xs text-white/35 mt-1">{(totalAcreageSum / 2.47).toFixed(1)} hectares registered</div>
          {selectedKpi === 'acreage' && (
            <p className="text-xs text-white/50 mt-3 leading-relaxed border-t border-white/5 pt-2">
              Total land area across all your registered farm plots.
            </p>
          )}
        </div>

        {/* KPI 2: My Fields */}
        <div 
          onClick={() => handleKpiClick('fields')}
          className={`rounded-2xl p-5 transition-all duration-300 cursor-pointer border ${
            selectedKpi === 'fields' 
              ? 'bg-gradient-to-br from-[#0c3817] to-[#041c0b] border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
              : 'bg-gradient-to-br from-[#0c3817] to-[#041c0b] border-emerald-500/10 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm text-emerald-300/70 font-medium">My Fields</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {activeFieldsCount}
            <span className="text-base font-normal text-emerald-300/50 ml-1">plots</span>
          </div>
          <div className="text-xs text-emerald-300/40 mt-1">{healthyCount} healthy · {criticalCount} need attention</div>
          {selectedKpi === 'fields' && (
            <p className="text-xs text-emerald-200/50 mt-3 leading-relaxed border-t border-white/10 pt-2">
              All your farm fields registered and monitored by satellite.
            </p>
          )}
        </div>

        {/* KPI 3: Fields Needing Water */}
        <div 
          onClick={() => handleKpiClick('stress')}
          className={`rounded-2xl p-5 transition-all duration-300 cursor-pointer border ${
            selectedKpi === 'stress' 
              ? `bg-white/[0.05] ${criticalCount > 0 ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'border-emerald-500/40'}`
              : 'glass-panel glass-panel-hover'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              criticalCount > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              <Droplet className={`w-4 h-4 ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            </div>
            <span className="text-sm text-white/50 font-medium">Need Water</span>
          </div>
          <div className={`text-3xl font-black tracking-tight flex items-center gap-2 ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {criticalCount}
            {criticalCount > 0 && <AlertTriangle className="w-5 h-5 animate-bounce" />}
          </div>
          <div className={`text-xs mt-1 ${criticalCount > 0 ? 'text-rose-400/60' : 'text-emerald-400/60'}`}>
            {criticalCount > 0 ? 'Fields need irrigation now' : 'All fields watered ✓'}
          </div>
          {selectedKpi === 'stress' && (
            <p className="text-xs text-white/50 mt-3 leading-relaxed border-t border-white/5 pt-2">
              {criticalCount > 0 
                ? 'Soil moisture is critically low. Go to Field Maps and start irrigation.' 
                : 'All fields are well-watered. Keep monitoring.'}
            </p>
          )}
        </div>

        {/* KPI 4: Overall Crop Health (plain, not NDVI) */}
        <div 
          onClick={() => handleKpiClick('ndvi')}
          className={`rounded-2xl p-5 transition-all duration-300 cursor-pointer border ${
            selectedKpi === 'ndvi' 
              ? 'bg-white/[0.05] border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
              : 'glass-panel glass-panel-hover'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#cff068]/10 border border-[#cff068]/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#cff068]" />
            </div>
            <span className="text-sm text-white/50 font-medium">Crop Health</span>
          </div>
          <div className={`text-3xl font-black tracking-tight ${cropHealthColor}`}>
            {cropHealthLabel}
          </div>
          <div className="text-xs text-white/35 mt-1">
            Score: {avgNdviAll} · {avgNdviAll >= 0.65 ? 'Fields thriving' : avgNdviAll >= 0.45 ? 'Average growth' : 'Crops need help'}
          </div>
          {selectedKpi === 'ndvi' && (
            <p className="text-xs text-white/50 mt-3 leading-relaxed border-t border-white/5 pt-2">
              Based on satellite-measured crop greenness across all your plots (NDVI index).
            </p>
          )}
        </div>

      </div>

      {/* ── CHART + ACTIVITY FEED ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* BAR CHART — plain farmer labels, values as % */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-base text-white">📊 Field-by-Field Comparison</h3>
              <p className="text-xs text-white/40 mt-0.5">Crop health, soil water & moisture for each field</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
              Live Satellite
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={barChartData} 
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                  contentStyle={{ background: '#041006', color: '#ffffff', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(207,240,104,0.15)' }}
                  formatter={(val: any) => [`${val}%`]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: 'rgba(255,255,255,0.5)' }} />
                <Bar dataKey="Crop Health" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Soil Water" fill="#cff068" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Moisture %" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTIVITY FEED — plain language */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col shadow-2xl">
          <div className="mb-4">
            <h3 className="font-display font-bold text-base text-white">🔔 Recent Alerts</h3>
            <p className="text-xs text-white/40 mt-0.5">What happened on your farm today</p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-56">
            {logs.length > 0 ? logs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex items-start gap-3 hover:bg-white/[0.04] transition-all"
              >
                {log.severity === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                ) : log.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-white leading-relaxed">{log.message}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-2.5 h-2.5 text-white/25" />
                    <span className="text-[10px] text-white/30">{log.timeLabel}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-white/25 text-xs">
                No alerts yet. Your farms look good!
              </div>
            )}
          </div>

          <button 
            onClick={onRefreshData}
            className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            Refresh Alerts
          </button>
        </div>

      </div>

      <FarmHistoryView fields={fields} onSelectFieldById={onSelectFieldById} />

      {/* ── FIELDS TABLE — simplified, farmer-friendly columns ── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left shadow-2xl">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
          <div>
            <h3 className="font-display font-bold text-base text-white">🌾 My Farm Fields</h3>
            <p className="text-xs text-white/40 mt-0.5">All your registered fields and their current status</p>
          </div>
          <span className="text-xs bg-white/5 border border-white/10 text-white/50 font-semibold px-3 py-1 rounded-full">
            {fields.length} fields
          </span>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-white/35 uppercase tracking-wider">
                <th className="py-3 px-4">Field Name</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Crop Health</th>
                <th className="py-3 px-4">Soil Water</th>
                <th className="py-3 px-4">Rainfall</th>
                <th className="py-3 px-4">Temp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {fields.map((f) => {
                const ndvi = f.avgNdvi;
                const healthLabel = ndvi >= 0.65 ? 'Good' : ndvi >= 0.45 ? 'Average' : 'Poor';
                const healthColor = ndvi >= 0.65 ? 'text-emerald-400' : ndvi >= 0.45 ? 'text-amber-400' : 'text-rose-400';
                return (
                  <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{f.name}</td>
                    <td className="py-3.5 px-4 text-white/70">{f.cropType}</td>
                    <td className="py-3.5 px-4 text-white/50">
                      {f.acreage} ac
                      <span className="text-white/30 text-xs ml-1">/ {(f.acreage / 2.47).toFixed(1)} ha</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${healthColor}`}>{healthLabel}</span>
                      <span className="text-white/30 text-xs ml-1">({ndvi.toFixed(2)})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${f.moisture >= 60 ? 'bg-sky-400' : f.moisture >= 35 ? 'bg-amber-400' : 'bg-rose-400'}`}
                            style={{ width: `${f.moisture}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${f.moisture >= 60 ? 'text-sky-400' : f.moisture >= 35 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {f.moisture}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-blue-300 font-medium">
                        <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                        {f.rainfall ?? 0} mm
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-amber-300 font-medium">{f.avgTemp}°C</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        f.status === 'Optimal' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : f.status === 'Marginal' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {f.status === 'Optimal' ? '🟢 Healthy' : f.status === 'Marginal' ? '🟡 Monitor' : '🔴 Urgent'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onDownloadReport(f)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          title={`Download PDF report for ${f.name}`}
                        >
                          <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                          Report
                        </button>
                        <button
                          onClick={() => onSelectFieldById(f.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-md"
                        >
                          Open <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {fields.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/25 text-sm">
                    No fields added yet. Go to <strong className="text-white/50">Field Maps</strong> to add your first farm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card-based layout */}
        <div className="md:hidden space-y-4">
          {fields.map((f) => {
            const ndvi = f.avgNdvi;
            const healthLabel = ndvi >= 0.65 ? 'Good' : ndvi >= 0.45 ? 'Average' : 'Poor';
            const healthColor = ndvi >= 0.65 ? 'text-emerald-400' : ndvi >= 0.45 ? 'text-amber-400' : 'text-rose-400';
            return (
              <div 
                key={f.id} 
                className="border border-white/5 bg-white/[0.01] p-4 rounded-xl space-y-3.5 text-xs text-white/80"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{f.name}</h4>
                    <span className="text-[10px] text-white/40 font-semibold uppercase block mt-0.5">
                      {f.cropType} · {f.acreage} ac ({(f.acreage / 2.47).toFixed(1)} ha)
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    f.status === 'Optimal' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : f.status === 'Marginal' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {f.status === 'Optimal' ? '🟢 Healthy' : f.status === 'Marginal' ? '🟡 Monitor' : '🔴 Urgent'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-white/35 block mb-0.5">Crop Health</span>
                    <span className={`font-bold ${healthColor}`}>{healthLabel} ({ndvi.toFixed(2)})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/35 block mb-0.5">Soil Water</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${f.moisture >= 60 ? 'text-sky-400' : f.moisture >= 35 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {f.moisture}%
                      </span>
                      <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden flex-grow max-w-[40px]">
                        <div 
                          className={`h-full rounded-full ${f.moisture >= 60 ? 'bg-sky-400' : f.moisture >= 35 ? 'bg-amber-400' : 'bg-rose-400'}`}
                          style={{ width: `${f.moisture}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/35 block mb-0.5">Rainfall</span>
                    <span className="flex items-center gap-1 text-blue-300 font-medium">
                      <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                      {f.rainfall ?? 0} mm
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/35 block mb-0.5">Temp</span>
                    <span className="text-amber-300 font-medium">{f.avgTemp}°C</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => onDownloadReport(f)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                    Report
                  </button>
                  <button
                    onClick={() => onSelectFieldById(f.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-black bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 py-2 rounded-lg transition-all cursor-pointer shadow-md"
                  >
                    Open Field
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}

          {fields.length === 0 && (
            <div className="py-12 text-center text-white/25 text-sm">
              No fields added yet. Go to Field Maps to add your first farm.
            </div>
          )}
        </div>
      </div>

      {/* ── HEALTH GAUGE + SATELLITE VIEW ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* HEALTH GAUGE */}
        <div className="md:col-span-6 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="font-display font-bold text-base text-white mb-0.5">Overall Farm Health</h3>
            <p className="text-xs text-white/40 mb-5">Percentage of your fields in good condition</p>
          </div>

          <div className="relative w-48 h-24 mx-auto flex items-end justify-center overflow-hidden">
            <div className="absolute top-0 w-48 h-48 rounded-full border-[10px] border-white/5"></div>
            {(() => {
              const pct = fields.length > 0 ? Math.round((healthyCount / fields.length) * 100) : 75;
              const rotation = 180 - (pct / 100) * 180;
              return (
                <>
                  <div 
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className={`absolute top-0 w-48 h-48 rounded-full border-[10px] border-transparent ${
                      pct >= 75 ? 'border-t-emerald-400 border-r-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                      pct >= 50 ? 'border-t-amber-400 border-r-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' :
                      'border-t-rose-400 border-r-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    }`}
                  ></div>
                  <div className="z-10 bg-transparent px-4 text-center font-display">
                    <p className={`text-3xl font-black leading-none ${
                      pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>{pct}%</p>
                    <p className="text-xs text-white/50 font-medium mt-1">
                      {pct >= 75 ? 'Farms Healthy' : pct >= 50 ? 'Farms OK' : 'Needs Attention'}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-white/50">Good / OK</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-white/50">Needs Water</span>
            </div>
          </div>
        </div>

        {/* SATELLITE PREVIEW */}
        <div className="md:col-span-6 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="font-display font-bold text-base text-white mb-0.5">Satellite View</h3>
            <p className="text-xs text-white/40 mb-3">Aerial image of your farm region from space</p>
          </div>

          <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/5 group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=300&auto=format&fit=crop&q=80')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px]">
              <span className="text-white/70 font-medium">Punjab, India</span>
              <span className="bg-[#0c3817] text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                Satellite
              </span>
            </div>
          </div>

          <p className="text-xs text-white/45 leading-relaxed mt-3">
            🛰️ This image is captured by Sentinel-2 satellite. Green areas = healthy crops. Yellow/brown areas may need water or fertilizer.
          </p>
        </div>

      </div>

    </div>
  );
}
