import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Sprout, 
  Award, 
  Droplets, 
  Check, 
  RefreshCw, 
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Clock,
  FileDown
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
import { Field } from '../types';

interface CropAnalyticsViewProps {
  fields: Field[];
  selectedField?: Field;
  onUpdateFieldMoisture: (id: string, newMoisture: number) => void;
  onAddLog: (message: string, severity: 'info' | 'success' | 'warning' | 'error') => void;
  onDownloadReport: (field: Field) => void | Promise<void>;
}

export default function CropAnalyticsView({
  fields,
  selectedField,
  onUpdateFieldMoisture,
  onAddLog,
  onDownloadReport
}: CropAnalyticsViewProps) {
  
  const [irrigatingFieldId, setIrrigatingFieldId] = useState<string | null>(null);
  const formatLitres = (value: number | undefined) =>
    typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value).toLocaleString()} L` : 'N/A';

  // Dynamic growth curve calculation based on the active field's NDVI telemetry
  const growthCurveData = useMemo(() => {
    const ndvi = selectedField?.avgNdvi ?? 0.6;
    
    // Growth stages with standard benchmark values and scaled current values
    return [
      { name: 'Emergence', Current: parseFloat((ndvi * 0.25).toFixed(2)), Benchmark: 0.18 },
      { name: 'Tillering', Current: parseFloat((ndvi * 0.55).toFixed(2)), Benchmark: 0.35 },
      { name: 'Jointing', Current: parseFloat((ndvi * 0.75).toFixed(2)), Benchmark: 0.55 },
      { name: 'Booting', Current: parseFloat((ndvi * 0.9).toFixed(2)), Benchmark: 0.68 },
      { name: 'Heading', Current: parseFloat((ndvi * 0.95).toFixed(2)), Benchmark: 0.76 },
      { name: 'Flowering', Current: parseFloat(ndvi.toFixed(2)), Benchmark: 0.81 },
      { name: 'Soft Dough', Current: parseFloat((ndvi * 0.85).toFixed(2)), Benchmark: 0.69 },
      { name: 'Maturity', Current: parseFloat((ndvi * 0.6).toFixed(2)), Benchmark: 0.48 }
    ];
  }, [selectedField]);

  // Action hook to replenish water moisture index instantly
  const handleIrrigateField = (fieldId: string, name: string) => {
    setIrrigatingFieldId(fieldId);
    
    // Simulating drip line injection
    setTimeout(() => {
      onUpdateFieldMoisture(fieldId, 95); // Restores to optimal 95% moisture index
      onAddLog(`Automated drip irrigation delivered 35mm to ${name} soils. Capillary absorption optimal.`, 'success');
      setIrrigatingFieldId(null);
    }, 1200);
  };

  // Calculate crop summaries dynamically
  const cropSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    fields.forEach(f => {
      const crop = f.cropType || 'Other';
      summary[crop] = (summary[crop] || 0) + f.acreage;
    });
    
    if (Object.keys(summary).length === 0) {
      return [];
    }

    const totalAcreage = Object.values(summary).reduce((a, b) => a + b, 0);
    return Object.entries(summary).map(([crop, acreage]) => ({
      crop,
      acreage,
      percent: totalAcreage > 0 ? `${Math.round((acreage / totalAcreage) * 100)}%` : '0%'
    }));
  }, [fields]);

  return (
    <div id="crop-analytics-panel" className="space-y-6 select-none animate-fade-in text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-white">Crop Analytics</h1>
          <p className="text-emerald-100/50 text-xs font-medium">Agronomist workspace mapping vegetative indexes and soil dehydration anomalies</p>
        </div>

        {selectedField && (
          <button
            onClick={() => onDownloadReport(selectedField)}
            className="bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black px-4 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md"
            title={`Export PDF report for ${selectedField.name}`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        )}
      </div>

      {fields.length > 0 ? (
        <>
          {/* CLASSIFICATION SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {cropSummary.map((item, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border border-white/5 text-left shadow-lg">
                <span className="text-[9px] text-white/40 uppercase font-mono tracking-widest">{item.crop} Acreage</span>
                <p className="text-xl font-black font-display text-white mt-1">{item.acreage} Acres</p>
                <span className="text-[9px] text-white/50 font-mono">{item.percent} of total variety</span>
              </div>
            ))}
            {cropSummary.length === 0 && (
              <div className="col-span-4 glass-panel p-5 rounded-xl border border-white/5 text-center text-xs text-white/40">
                No active crops registered.
              </div>
            )}
          </div>

          {/* RECHARTS BIOMASS LINE GRAPH */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white mb-1">
                  Vegetative Growth Trajectory (NDVI) - {selectedField ? selectedField.name : 'All Fields'}
                </h3>
                <p className="text-xs text-emerald-100/50 font-medium">Compares current season biomass NDVI index against multi-year regional crop benchmark curve</p>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-white/55 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Continuous Calibrations Active</span>
              </div>
            </div>

            {/* Growth line visualization */}
            <div className="h-64 w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#041006', color: '#ffffff', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Current" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Benchmark" stroke="#cff068" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INTERACTIVE IRRIGATION ADVISORY TABLE CONSOLE */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white mb-0.5">Hydration Advisor Matrix</h3>
                <p className="text-xs text-emerald-100/50 font-medium">Actionable automated irrigation cycles determined from spatial water-retention deficit analysis</p>
              </div>
              
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded">
                Drip Infrastructure Connected
              </span>
            </div>

            {/* Mapped Fields hydration actions */}
            {/* Mapped Fields hydration actions */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    <th className="py-2.5">Field Name</th>
                    <th className="py-2.5">Crop Segment</th>
                    <th className="py-2.5">Moisture Index</th>
                    <th className="py-2.5">Estimated Water Deficit</th>
                    <th className="py-2.5">Water Need</th>
                    <th className="py-2.5">Fertilizer Plan</th>
                    <th className="py-2.5">Hydration Status</th>
                    <th className="py-2.5">Action Window</th>
                    <th className="py-2.5 text-right">Emergency Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {fields.map((field) => (
                    <tr key={field.id} className="hover:bg-white/[0.02] font-mono border-b border-white/5">
                      
                      {/* Field Name */}
                      <td className="py-3.5 font-bold text-white font-sans text-[13px]">
                        {field.name}
                      </td>
                      
                      {/* Crop Variety */}
                      <td className="py-3.5">
                        <span className="flex items-center space-x-1.5 font-sans font-semibold text-white/70">
                          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{field.cropType}</span>
                        </span>
                      </td>

                      {/* Soil Moisture */}
                      <td className="py-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{field.moisture}%</span>
                          <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${field.moisture >= 60 ? 'bg-emerald-400' : field.moisture >= 45 ? 'bg-amber-400' : 'bg-rose-500'}`} 
                              style={{ width: `${field.moisture}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Water Deficit */}
                      <td className={`py-3.5 font-bold ${field.waterDeficit < -20 ? 'text-rose-400' : field.waterDeficit < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {field.waterDeficit === 0 ? '0.0 mm (Saturated)' : `${field.waterDeficit} mm`}
                      </td>

                      <td className="py-3.5 font-bold text-sky-400">
                        {formatLitres(field.agronomy?.waterRequirementLitres)}
                      </td>

                      <td className="py-3.5">
                        <span className="font-bold text-emerald-400">
                          {field.agronomy?.fertilizerPlan?.totalKg ?? 'N/A'} kg
                        </span>
                        {field.agronomy?.fertilizerPlan?.nutrients ? (
                          <span className="block text-[9px] text-white/40 font-mono mt-0.5">
                            N {field.agronomy.fertilizerPlan.nutrients.nitrogenKg ?? 0} / P {field.agronomy.fertilizerPlan.nutrients.phosphorusKg ?? 0} / K {field.agronomy.fertilizerPlan.nutrients.potassiumKg ?? 0}
                          </span>
                        ) : null}
                      </td>

                      {/* Stress Category */}
                      <td className="py-3.5 font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono border ${
                          field.status === 'Optimal' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : field.status === 'Marginal' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {field.status}
                        </span>
                      </td>

                      <td className="py-3.5 font-bold text-white/80">
                        {field.agronomy?.actionWindow || field.urgencyLevel || 'N/A'}
                      </td>

                      {/* Immediate Action Trigger Button */}
                      <td className="py-3.5 text-right font-sans">
                        {field.moisture >= 90 ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-[10px] tracking-wider uppercase pr-2">
                            <Check className="w-3.5 h-3.5 stroke-2 text-emerald-400" />
                            <span>Optimal</span>
                          </span>
                        ) : (
                          <button
                            id={`btn-irrigate-${field.id}`}
                            onClick={() => handleIrrigateField(field.id, field.name)}
                            disabled={irrigatingFieldId === field.id}
                            className={`text-[10px] font-bold tracking-wider uppercase px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 ml-auto cursor-pointer border ${
                              irrigatingFieldId === field.id
                                ? 'bg-white/5 border-white/5 text-white/50'
                                : field.status === 'Critical'
                                ? 'bg-rose-600 border-rose-500 hover:bg-rose-500 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                          >
                            {irrigatingFieldId === field.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Watering...</span>
                              </>
                            ) : (
                              <>
                                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                                <span>Deliver 35mm</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards-based list layout */}
            <div className="md:hidden space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="border border-white/5 bg-white/[0.01] p-4 rounded-xl space-y-3.5 text-xs text-white/80 font-mono">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans leading-tight">{field.name}</h4>
                      <span className="text-[10px] text-white/40 font-semibold uppercase font-sans block mt-0.5">
                        {field.cropType}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-sans ${
                      field.status === 'Optimal' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : field.status === 'Marginal' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {field.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-white/35 block mb-0.5">Moisture Index</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{field.moisture}%</span>
                        <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden flex-grow max-w-[40px]">
                          <div 
                            className={`h-full ${field.moisture >= 60 ? 'bg-emerald-400' : field.moisture >= 45 ? 'bg-amber-400' : 'bg-rose-500'}`} 
                            style={{ width: `${field.moisture}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/35 block mb-0.5">Water Deficit</span>
                      <span className={`font-bold ${field.waterDeficit < -20 ? 'text-rose-400' : field.waterDeficit < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {field.waterDeficit === 0 ? '0.0 mm' : `${field.waterDeficit} mm`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/35 block mb-0.5">Water Need</span>
                      <span className="font-bold text-sky-400">
                        {formatLitres(field.agronomy?.waterRequirementLitres)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/35 block mb-0.5">Fertilizer Plan</span>
                      <span className="font-bold text-emerald-400">
                        {field.agronomy?.fertilizerPlan?.totalKg ?? 'N/A'} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/35 block mb-0.5">Action Window</span>
                      <span className="font-bold text-white">
                        {field.agronomy?.actionWindow || field.urgencyLevel || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/35 block mb-0.5">Urgency Score</span>
                      <span className="font-bold text-white">
                        {field.agronomy?.urgencyScore ?? 0}/100
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    {field.moisture >= 90 ? (
                      <div className="text-center py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-[11px] font-sans">
                        ✓ Moisture Optimal
                      </div>
                    ) : (
                      <button
                        onClick={() => handleIrrigateField(field.id, field.name)}
                        disabled={irrigatingFieldId === field.id}
                        className={`w-full py-2 rounded-lg font-bold text-center transition-all cursor-pointer shadow-md text-[11px] font-sans flex items-center justify-center gap-1.5 border ${
                          irrigatingFieldId === field.id
                            ? 'bg-white/5 border-white/5 text-white/50'
                            : field.status === 'Critical'
                            ? 'bg-rose-600 border-rose-500 hover:bg-rose-500 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {irrigatingFieldId === field.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Watering...</span>
                          </>
                        ) : (
                          <>
                            <Droplets className="w-3.5 h-3.5 text-sky-400" />
                            <span>Deliver 35mm</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      ) : (
        <div className="py-16 text-center text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/5 font-mono text-xs">
          Awaiting field selection. Please select or create a farm field in Field Maps to view crop health and biomass analytics.
        </div>
      )}

    </div>
  );
}
