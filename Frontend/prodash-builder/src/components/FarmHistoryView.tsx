import React, { useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Droplet,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { FarmAnalysisHistory, Field, RemoteSensingIndices } from '../types';

interface FarmHistoryViewProps {
  fields: Field[];
  onSelectFieldById: (id: string) => void;
}

type MetricKey = keyof Pick<RemoteSensingIndices, 'ndvi' | 'ndwi' | 'smi' | 'vci'>;

const METRICS: Array<{ key: MetricKey; label: string; tone: string }> = [
  { key: 'ndvi', label: 'NDVI', tone: 'text-emerald-400' },
  { key: 'ndwi', label: 'NDWI', tone: 'text-sky-400' },
  { key: 'smi', label: 'SMI', tone: 'text-sky-400' },
  { key: 'vci', label: 'VCI', tone: 'text-lime-400' }
];

const getAnalysisTime = (analysis: FarmAnalysisHistory) =>
  new Date(analysis.calculatedAt || analysis.generatedAt || 0).getTime();

const sortHistory = (history: FarmAnalysisHistory[] = []) =>
  [...history]
    .sort((a, b) => getAnalysisTime(b) - getAnalysisTime(a))
    .slice(0, 50);

const getMetric = (analysis: FarmAnalysisHistory | undefined, key: MetricKey) =>
  analysis?.[key] ?? analysis?.indices?.[key];

const formatNumber = (value: number | undefined, digits = 2) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'N/A';

const formatDate = (analysis: FarmAnalysisHistory | undefined) => {
  if (!analysis) return 'No date';
  const date = new Date(analysis.calculatedAt || analysis.generatedAt || 0);
  if (Number.isNaN(date.getTime())) return 'No date';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStressTone = (stress: string | undefined) => {
  const normalized = (stress || '').toLowerCase();
  if (normalized.includes('critical') || normalized.includes('high')) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
  if (normalized.includes('moderate') || normalized.includes('marginal')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
};

const getDeltaTone = (delta: number | undefined) => {
  if (typeof delta !== 'number' || !Number.isFinite(delta) || delta === 0) {
    return 'text-white/40';
  }
  return delta > 0 ? 'text-emerald-400' : 'text-rose-400';
};

const getAnalysisKey = (analysis: FarmAnalysisHistory) =>
  analysis._id ||
  `${analysis.calculatedAt || analysis.generatedAt || 'analysis'}-${formatNumber(analysis.ndvi)}-${formatNumber(analysis.ndwi)}`;

export default function FarmHistoryView({ fields, onSelectFieldById }: FarmHistoryViewProps) {
  const fieldsWithHistory = useMemo(
    () => fields.filter((field) => (field.analyses || []).length > 0),
    [fields]
  );
  const [selectedFieldId, setSelectedFieldId] = useState('');

  const selectedField = fieldsWithHistory.find((field) => field.id === selectedFieldId) || fieldsWithHistory[0];
  const history = useMemo(
    () => sortHistory(selectedField?.analyses || []),
    [selectedField?.analyses]
  );
  const latest = history[0];
  const previous = history[1];

  const chartData = useMemo(
    () => history.slice(0, 8).reverse().map((analysis) => ({
      date: formatDate(analysis),
      NDVI: getMetric(analysis, 'ndvi'),
      NDWI: getMetric(analysis, 'ndwi'),
      SMI: getMetric(analysis, 'smi'),
      VCI: getMetric(analysis, 'vci'),
      Deficit: analysis.waterDeficit
    })),
    [history]
  );

  return (
    <section className="glass-panel p-6 rounded-2xl border border-white/5 text-left shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-3 border-b border-white/5">
        <div>
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
            Farm History &amp; Monthly Comparison
          </h3>
          <p className="text-xs text-emerald-100/50 font-medium">
            Latest and previous analysis snapshots from saved farm telemetry
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-extrabold" htmlFor="history-field-select">
            Field
          </label>
          <select
            id="history-field-select"
            value={selectedField?.id || ''}
            onChange={(event) => setSelectedFieldId(event.target.value)}
            className="bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-lg px-3 py-2 min-w-52 outline-none focus:border-emerald-500/30 transition-all"
          >
            {fieldsWithHistory.map((field) => (
              <option key={field.id} value={field.id} className="bg-[#041006] text-white">
                {field.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedField ? (
        <div className="py-10 text-center border border-dashed border-white/10 rounded-xl">
          <CalendarDays className="w-8 h-8 mx-auto text-white/30 mb-2" />
          <p className="text-xs font-mono text-white/40">
            No saved analysis history yet. Run farm analysis to start monthly comparisons.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {METRICS.map((metric) => {
              const latestValue = getMetric(latest, metric.key);
              const previousValue = getMetric(previous, metric.key);
              const delta = typeof latestValue === 'number' && typeof previousValue === 'number'
                ? latestValue - previousValue
                : undefined;

              return (
                <div key={metric.key} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all hover:bg-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {metric.label}
                    </span>
                    {typeof delta === 'number' && delta < 0 ? (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className={`mt-2 text-2xl font-black font-display ${metric.tone}`}>
                    {formatNumber(latestValue)}
                  </div>
                  <p className={`text-[10px] font-mono mt-1 ${getDeltaTone(delta)}`}>
                    {typeof delta === 'number' ? `${delta >= 0 ? '+' : ''}${delta.toFixed(3)} vs previous` : 'No previous reading'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Index and Water Deficit Trend
                  </span>
                </div>
                <span className="text-[10px] text-white/40 font-mono">
                  {history.length} saved runs
                </span>
              </div>

              <div className="h-64 w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="index" domain={[-1, 1]} stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="deficit" orientation="right" stroke="rgba(244,63,94,0.6)" fontSize={10} tickLine={false} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ background: '#041006', color: '#ffffff', borderRadius: '10px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                    <Line yAxisId="index" type="monotone" dataKey="NDVI" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                    <Line yAxisId="index" type="monotone" dataKey="NDWI" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                    <Line yAxisId="index" type="monotone" dataKey="SMI" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} />
                    <Line yAxisId="index" type="monotone" dataKey="VCI" stroke="#a3e635" strokeWidth={2} dot={{ r: 2 }} />
                    <Line yAxisId="deficit" type="monotone" dataKey="Deficit" stroke="#f43f5e" strokeDasharray="5 4" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplet className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Stress Timeline
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {history.slice(0, 8).map((analysis) => (
                  <div
                    key={getAnalysisKey(analysis)}
                    className="bg-white/[0.02] border border-white/5 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-white/40">
                        {formatDate(analysis)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getStressTone(analysis.stressLevel)}`}>
                        {analysis.stressLevel || 'LOW'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-white/60">
                      <span>Deficit: {formatNumber(analysis.waterDeficit, 0)} mm</span>
                      <span>NDVI: {formatNumber(getMetric(analysis, 'ndvi'))}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectFieldById(selectedField.id)}
                className="mt-4 w-full bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Open Field Monitor <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-white/40">
            <span>Latest: {formatDate(latest)}</span>
            <span className="text-white/20">/</span>
            <span>Previous: {previous ? formatDate(previous) : 'N/A'}</span>
            <span className="text-white/20">/</span>
            <span>Stress changed: {previous?.stressLevel || 'N/A'} to {latest?.stressLevel || 'N/A'}</span>
          </div>
        </div>
      )}
    </section>
  );
}
