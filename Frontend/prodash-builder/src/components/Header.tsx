import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  AlertTriangle, 
  Droplets,
  Sparkles,
  MapPin,
  Loader2,
  UserCircle2,
  Menu
} from 'lucide-react';
import { Field, DashboardTab } from '../types';
import LanguageSelector from '../../../src/components/LanguageSelector';
import { useAuth } from '../../../src/context/AuthContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  fields: Field[];
  onSelectFieldById: (id: string) => void;
  onTabChange?: (tab: DashboardTab) => void;
  onToggleSidebar?: () => void;
}

// ─── Location Types ──────────────────────────────────────────────────────────
type LocationStatus = 'detecting' | 'found' | 'denied' | 'error';

interface LocationData {
  district: string;
  state: string;
  country: string;
}

// ─── Reverse Geocode via OpenStreetMap Nominatim (free, no API key) ──────────
async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
  const res  = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'GeoHarvest/1.0' }
  });
  if (!res.ok) throw new Error('Geocode failed');
  const data = await res.json();
  const addr = data.address || {};

  // Build district label from most specific available field
  const district =
    addr.county     ||
    addr.district   ||
    addr.city       ||
    addr.town       ||
    addr.village    ||
    addr.municipality ||
    'Local Region';

  const state   = addr.state   || addr.region   || '';
  const country = addr.country || '';

  return { district, state, country };
}

// ─── Hook: useRealLocation ────────────────────────────────────────────────────
function useRealLocation() {
  const [status,   setStatus]   = useState<LocationStatus>('detecting');
  const [location, setLocation] = useState<LocationData>({ district: '', state: '', country: '' });

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setLocation({ district: 'Punjab Sector', state: 'Indo-Gangetic Plains', country: 'India' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setLocation(loc);
          setStatus('found');
        } catch {
          setStatus('error');
          setLocation({ district: 'Punjab Sector', state: 'Indo-Gangetic Plains', country: 'India' });
        }
      },
      (err) => {
        // User denied or timed out — fall back to default
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
        setLocation({ district: 'Punjab Sector', state: 'Indo-Gangetic Plains', country: 'India' });
      },
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }
    );
  }, []);

  return { status, location };
}

// ─── Location Badge ───────────────────────────────────────────────────────────
function LocationBadge() {
  const { status, location } = useRealLocation();

  const label = status === 'detecting'
    ? 'Detecting Location…'
    : `${location.district}${location.state ? ` • ${location.state}` : ''}`;

  return (
    <div
      title={
        status === 'denied'
          ? 'Location access denied – showing default region'
          : status === 'found'
          ? `${location.district}, ${location.state}, ${location.country}`
          : undefined
      }
      className="hidden lg:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-3 py-1.5 rounded-full transition-all"
    >
      {/* Status indicator dot */}
      {status === 'detecting' ? (
        <Loader2 className="w-3 h-3 animate-spin text-emerald-400/60" />
      ) : status === 'found' ? (
        <>
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
        </>
      ) : (
        <>
          {/* denied / error — show default with static dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
        </>
      )}
      <span className="max-w-[200px] truncate">{label}</span>
    </div>
  );
}

// ─── Header Component ─────────────────────────────────────────────────────────
// ─── Avatar component for the header badge ──────────────────────────────────
function HeaderAvatar({ avatar, name }: { avatar: string; name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${name} profile`}
        className="w-8 h-8 rounded-full object-cover border border-emerald-500/30"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0c3817] to-[#041c0b] flex items-center justify-center border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
      <span className="text-[11px] font-black text-emerald-400 font-display">{initials || <UserCircle2 className="w-4 h-4 text-emerald-400" />}</span>
    </div>
  );
}

export default function Header({ searchQuery, onSearchChange, fields, onSelectFieldById, onTabChange, onToggleSidebar }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  const displayName = user?.name  || 'Farmer';
  const displayId   = user?._id   ? `IN-${user._id.toString().slice(-5).toUpperCase()}` : 'IN-XXXXX';
  const displayRole = user?.role   || 'farmer';

  const activeAlerts = fields
    .map((f) => {
      if (f.status === 'Critical') {
        return {
          id: `alert-stress-${f.id}`,
          fieldId: f.id,
          message: `${f.name} is experiencing Critical moisture stress (${f.moisture}% moisture, Deficit: ${Math.abs(f.waterDeficit)}mm)`,
          type: 'danger' as const
        };
      } else if (f.status === 'Marginal') {
        return {
          id: `alert-stress-${f.id}`,
          fieldId: f.id,
          message: `${f.name} is experiencing Moderate moisture stress (${f.moisture}% moisture)`,
          type: 'warning' as const
        };
      } else if (f.avgNdvi < 0.45) {
        return {
          id: `alert-ndvi-${f.id}`,
          fieldId: f.id,
          message: `Low chlorophyll vigor in ${f.name} (NDVI: ${f.avgNdvi.toFixed(2)})`,
          type: 'info' as const
        };
      }
      return null;
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  return (
    <header className="sticky top-0 bg-[#020603]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between z-30 select-none text-left relative gap-3">
      
      {/* Mobile Hamburger menu */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center p-2 text-white/80 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 lg:hidden cursor-pointer flex-shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      )}

      {/* SEARCH AND QUICK FILTER FIELDS */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/40">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="search-fields-input"
          type="text"
          placeholder="Search fields, crops..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/5 hover:bg-white/10 focus:bg-black/60 text-xs text-white placeholder-white/30 pl-10 pr-4 py-2.5 rounded-full outline-none border border-white/5 focus:border-emerald-500/30 transition-all font-semibold"
        />

        {searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#041006] rounded-xl shadow-2xl border border-white/10 p-2 space-y-1 text-left z-50 animate-fade-in">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2.5">Field Matches</span>
            {fields
              .filter(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.cropType.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(f => (
                <button
                  key={f.id}
                  onClick={() => { onSelectFieldById(f.id); onSearchChange(''); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between text-xs font-semibold text-white"
                >
                  <span>{f.name} ({f.cropType})</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    f.status === 'Optimal'  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    f.status === 'Marginal' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'    :
                                             'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>{f.status}</span>
                </button>
              ))
            }
          </div>
        )}
      </div>

      {/* RIGHT SIDE: LOCATION + LANG + BELL + PROFILE */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">

        {/* Real-time GPS Location Badge */}
        <LocationBadge />

        {/* Multilingual Google Translation Selector */}
        <div className="flex items-center flex-shrink-0">
          <LanguageSelector theme="dark" />
        </div>

        {/* NOTIFICATION BUTTON WITH DROP-MENU */}
        <div className="relative flex-shrink-0">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 flex items-center justify-center relative transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/80" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 rounded-full border-2 border-[#020603] text-[9px] font-bold text-white flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.6)]">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#041006] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-fade-in text-left">
              <div className="p-3 sm:p-4 bg-[#0c3817] text-white flex justify-between items-center border-b border-white/5">
                <span className="font-display font-bold text-[11px] sm:text-xs uppercase tracking-wider">Hydration Alarms ({activeAlerts.length})</span>
                <span className="text-[9px] bg-emerald-500 text-black font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
              </div>
              <div className="p-2 divide-y divide-white/5">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => { onSelectFieldById(alert.fieldId); setShowNotifications(false); }}
                      className="w-full p-2.5 sm:p-3 text-left hover:bg-white/5 transition-colors flex items-start space-x-2 text-xs font-semibold"
                    >
                      {alert.type === 'danger'  ? <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />  :
                       alert.type === 'warning' ? <Droplets     className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> :
                                                 <Sparkles     className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-white/80 font-medium text-[11px] sm:text-xs leading-normal">{alert.message}</p>
                        <span className="text-[9px] text-emerald-400">Click to view on maps</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-mono text-white/30">
                    🌱 All farm fields are healthy!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE BADGE — real user from database */}
        <button
          onClick={() => onTabChange?.('profile')}
          className="flex items-center space-x-2 bg-white/5 p-1 rounded-full border border-white/5 hover:bg-white/10 transition-all select-none cursor-pointer sm:pl-2.5 sm:pr-4 sm:py-1.5"
          title="View Profile"
        >
          <div className="relative flex-shrink-0">
            <HeaderAvatar avatar={user?.avatar || ''} name={displayName} />
            <span className="absolute bottom-0 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#020603] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="text-left hidden sm:block">
            <h4 className="font-display font-extrabold text-xs text-white max-w-[100px] truncate">{displayName}</h4>
            <span className="text-[9px] text-white/40 font-mono capitalize">{displayRole} · {displayId}</span>
          </div>
        </button>

      </div>
    </header>
  );
}
