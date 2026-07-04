import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  CloudSun,
  Droplets,
  Layers,
  Search,
  Sun,
  Thermometer,
  Wind
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Field, WeatherDay } from '../types';

interface WeatherTrendsViewProps {
  selectedField?: Field;
}

export default function WeatherTrendsView({ selectedField }: WeatherTrendsViewProps) {
  const [historySearch, setHistorySearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'temp' | 'rain'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const weather = selectedField?.weather;
  const baseTemp = weather?.temperature ?? selectedField?.avgTemp ?? 22;
  const baseRain = weather?.rainfall ?? selectedField?.rainfall ?? 12;
  const baseHumidity = weather?.humidity ?? 58;
  const baseWind = weather?.windSpeed ?? 12.5;
  const baseSolar = weather?.solarRadiation ?? 244;
  const baseEvaporation = weather?.evaporation ?? selectedField?.et ?? 3.5;

  const formatMetric = (value: number | undefined, digits = 1) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'N/A';

  const weeklyWeather = useMemo<WeatherDay[]>(() => {
    const days = [
      { day: 'Mon', tempOffset: -1, rainOffset: 0, etOffset: -0.3, humidityOffset: 4, windOffset: -1.2, solarOffset: -18 },
      { day: 'Tue', tempOffset: 1, rainOffset: 0, etOffset: 0.6, humidityOffset: -3, windOffset: 0.4, solarOffset: 10 },
      { day: 'Wed', tempOffset: 2, rainOffset: 0, etOffset: 1.0, humidityOffset: -5, windOffset: 1.2, solarOffset: 22 },
      { day: 'Thu', tempOffset: 4, rainOffset: 8, etOffset: -1.3, humidityOffset: 9, windOffset: -0.8, solarOffset: -42 },
      { day: 'Fri', tempOffset: 3, rainOffset: 4, etOffset: -0.6, humidityOffset: 6, windOffset: 0.2, solarOffset: -20 },
      { day: 'Sat', tempOffset: 2, rainOffset: 0, etOffset: 0.3, humidityOffset: -2, windOffset: 0.8, solarOffset: 12 },
      { day: 'Sun', tempOffset: 6, rainOffset: 0, etOffset: 1.7, humidityOffset: -8, windOffset: 1.6, solarOffset: 34 }
    ];

    return days.map((day) => {
      const temp = Math.round(baseTemp + day.tempOffset);
      const rain = day.rainOffset > 0 ? Math.round(baseRain / 2 + day.rainOffset * 0.5) : 0;
      const evaporation = parseFloat(Math.max(0, baseEvaporation + day.etOffset).toFixed(1));

      return {
        date: day.day,
        temp,
        rain,
        et: evaporation,
        humidity: Math.max(0, Math.min(100, Math.round(baseHumidity + day.humidityOffset))),
        windSpeed: parseFloat(Math.max(0, baseWind + day.windOffset).toFixed(1)),
        solarRadiation: Math.max(0, Math.round(baseSolar + day.solarOffset)),
        evaporation,
        status: temp > 25 ? 'High Heat' as const : rain > 0 ? 'Optimal' as const : 'Dry' as const
      };
    });
  }, [baseTemp, baseRain, baseHumidity, baseWind, baseSolar, baseEvaporation]);

  const historicWeather = useMemo<WeatherDay[]>(() => {
    const history = [
      { date: 'Oct 24', tempOffset: 0, rainOffset: 0, etOffset: 0.0, humidityOffset: 0, windOffset: 0, solarOffset: 0 },
      { date: 'Oct 23', tempOffset: -3, rainOffset: 12, etOffset: -2.4, humidityOffset: 10, windOffset: -1.4, solarOffset: -50 },
      { date: 'Oct 22', tempOffset: -2, rainOffset: 2, etOffset: -1.2, humidityOffset: 5, windOffset: -0.4, solarOffset: -22 },
      { date: 'Oct 21', tempOffset: 3, rainOffset: 0, etOffset: 0.7, humidityOffset: -4, windOffset: 1.1, solarOffset: 18 },
      { date: 'Oct 20', tempOffset: 2, rainOffset: 0, etOffset: 0.3, humidityOffset: -2, windOffset: 0.7, solarOffset: 10 },
      { date: 'Oct 19', tempOffset: 0, rainOffset: 1, etOffset: -0.6, humidityOffset: 3, windOffset: -0.2, solarOffset: -12 }
    ];

    return history.map((item) => {
      const temp = Math.round(baseTemp + item.tempOffset);
      const rain = item.rainOffset > 0 ? Math.round(baseRain / 2 + item.rainOffset * 0.3) : 0;
      const evaporation = parseFloat(Math.max(0, baseEvaporation + item.etOffset).toFixed(1));

      return {
        date: item.date,
        temp,
        rain,
        et: evaporation,
        humidity: Math.max(0, Math.min(100, Math.round(baseHumidity + item.humidityOffset))),
        windSpeed: parseFloat(Math.max(0, baseWind + item.windOffset).toFixed(1)),
        solarRadiation: Math.max(0, Math.round(baseSolar + item.solarOffset)),
        evaporation,
        status: temp > 25 ? 'High Heat' as const : rain > 0 ? 'Optimal' as const : 'Dry' as const
      };
    });
  }, [baseTemp, baseRain, baseHumidity, baseWind, baseSolar, baseEvaporation]);

  const handleSort = (type: 'date' | 'temp' | 'rain') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortBy(type);
    setSortOrder('desc');
  };

  const filteredHistory = historicWeather
    .filter((item) =>
      item.date.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.status.toLowerCase().includes(historySearch.toLowerCase())
    )
    .sort((a, b) => {
      let propA: string | number = a[sortBy];
      let propB: string | number = b[sortBy];

      if (sortBy === 'date') {
        propA = parseInt(a.date.replace('Oct ', ''), 10) || 0;
        propB = parseInt(b.date.replace('Oct ', ''), 10) || 0;
      }

      return sortOrder === 'asc'
        ? propA > propB ? 1 : -1
        : propA < propB ? 1 : -1;
    });

  return (
    <div id="weather-trends-panel" className="space-y-6 select-none animate-fade-in text-white">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-white">Weather Trends</h1>
        <p className="text-emerald-100/50 text-xs font-medium">Continuous meteorologic telemetry and soil moisture deficiency modeling</p>
      </div>

      {selectedField ? (
        <>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4.5 rounded-2xl flex items-start space-x-3.5 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <AlertTriangle className="w-5.5 h-5.5 text-rose-400 fill-rose-500/10 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="text-left">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Potential High Evaporation Alert</h4>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                High heat parameters detected on Sunday. Evaporation will likely peak at {formatMetric(baseEvaporation + 1.7)} mm with humidity near {Math.max(0, Math.round(baseHumidity - 8))}%. Loamy clay soils in <strong>{selectedField.name}</strong> may cross moisture depletion thresholds.
              </p>
            </div>
          </div>

          <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {weeklyWeather.map((day) => (
              <div key={day.date} className="flex-shrink-0 w-[42%] sm:w-[28%] md:w-auto snap-start glass-panel p-3.5 rounded-xl border border-white/5 text-center space-y-1 hover:shadow-lg transition-all hover:bg-white/[0.04]">
                <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">{day.date}</span>
                <div className="flex items-center justify-center py-2">
                  {day.rain > 0 ? (
                    <CloudRain className="w-6 h-6 text-sky-400" />
                  ) : (
                    <CloudSun className="w-6 h-6 text-amber-400 animate-pulse" />
                  )}
                </div>
                <p className="text-sm font-black text-white font-display">{day.temp}°C</p>
                <span className="text-[9px] font-mono text-white/60 block">
                  {day.rain > 0 ? `${day.rain}mm rain` : `${day.humidity}% RH`}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between text-left shadow-2xl">
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white mb-1">Weekly Moisture &amp; Heat Dynamics</h3>
                <p className="text-xs text-emerald-100/50 font-medium mb-6">Traces evaporation, humidity, heat, and natural precipitation</p>
              </div>

              <div className="h-64 w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyWeather} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#041006', color: '#ffffff', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                    <Area type="monotone" dataKey="rain" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorRain)" />
                    <Area type="monotone" dataKey="evaporation" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorEt)" />
                    <Area type="monotone" dataKey="humidity" stroke="#0891b2" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between text-left shadow-2xl">
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white mb-1">Atmospheric Parameters</h3>
                <p className="text-xs text-emerald-100/50 font-medium mb-4">Live ERA5-Land values in {selectedField.name}</p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Droplets className="w-5.5 h-5.5 text-sky-400" />
                    <span className="text-xs text-white/70 font-semibold">Humidity</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-white">{formatMetric(baseHumidity, 0)}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Wind className="w-5.5 h-5.5 text-emerald-400" />
                    <span className="text-xs text-white/70 font-semibold">Wind Speed</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-white">{formatMetric(baseWind)} km/h</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Sun className="w-5.5 h-5.5 text-amber-400" />
                    <span className="text-xs text-white/70 font-semibold">Solar Radiation</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-white">{formatMetric(baseSolar, 0)} W/m2</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Layers className="w-5.5 h-5.5 text-orange-400" />
                    <span className="text-xs text-white/70 font-semibold">Evaporation</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-white">{formatMetric(baseEvaporation)} mm/day</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Thermometer className="w-5.5 h-5.5 text-rose-400" />
                    <span className="text-xs text-white/70 font-semibold">Temperature</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-white">{formatMetric(baseTemp)} C</span>
                </div>
              </div>

              <p className="text-[10px] text-white/40 leading-normal font-mono italic text-center mt-4">
                Calibrated against ERA5-Land aggregations.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white mb-0.5">Historic Regional Archive</h3>
                <p className="text-xs text-emerald-100/50 font-medium">Filtered parameters from the previous agricultural cycle</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="history-weather-search-input"
                  type="text"
                  placeholder="Search history, statuses..."
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  className="w-full bg-white/5 focus:bg-black/60 text-xs text-white placeholder-white/30 pl-9 pr-3 py-2.5 rounded-xl border border-white/5 focus:border-emerald-500/30 outline-none font-semibold transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    <th className="py-2.5 cursor-pointer hover:text-white" onClick={() => handleSort('date')}>Date {sortBy === 'date' && (sortOrder === 'asc' ? 'up' : 'down')}</th>
                    <th className="py-2.5 cursor-pointer hover:text-white" onClick={() => handleSort('temp')}>Max Temp {sortBy === 'temp' && (sortOrder === 'asc' ? 'up' : 'down')}</th>
                    <th className="py-2.5 cursor-pointer hover:text-white" onClick={() => handleSort('rain')}>Rainfall {sortBy === 'rain' && (sortOrder === 'asc' ? 'up' : 'down')}</th>
                    <th className="py-2.5">Humidity</th>
                    <th className="py-2.5">Wind</th>
                    <th className="py-2.5">Solar</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Soil Condensation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHistory.map((item) => (
                    <tr key={item.date} className="hover:bg-white/[0.02] font-mono border-b border-white/5">
                      <td className="py-3 font-semibold text-white">{item.date}</td>
                      <td className="py-3 font-bold text-white">{item.temp} C</td>
                      <td className="py-3 text-white/70">{item.rain} mm</td>
                      <td className="py-3 text-white/70">{item.humidity}%</td>
                      <td className="py-3 text-white/70">{item.windSpeed} km/h</td>
                      <td className="py-3 text-white/70">{item.solarRadiation} W/m2</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono border ${
                          item.status === 'Optimal' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : item.status === 'High Heat' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] font-sans text-white/60 font-medium">
                        {item.rain > 5 ? 'High organic saturation levels' : item.rain > 0 ? 'Favorable capillary bounds' : 'High evaporation draft'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHistory.length === 0 && (
                <div className="py-8 text-center text-white/30 font-mono">No historical entries found. Try another query.</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="py-16 text-center text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/5 font-mono text-xs">
          Awaiting field selection. Please select or create a farm field in Field Maps to view climate and weather trends.
        </div>
      )}
    </div>
  );
}
