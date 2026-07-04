import React, { useState, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Leaf, Droplets, Sun, BadgeCheck,
  Camera, Edit3, Save, X, Lock, CheckCircle2, AlertCircle,
  Sprout, Globe, BellRing, Ruler
} from 'lucide-react';
import { useAuth } from '../../../src/context/AuthContext';

function AvatarDisplay({ avatar, name, size = 'lg' }: { avatar: string; name: string; size?: 'sm' | 'lg' }) {
  const wh = size === 'lg' ? 'w-24 h-24' : 'w-10 h-10';
  const text = size === 'lg' ? 'text-3xl' : 'text-sm';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${name} profile`}
        className={`${wh} rounded-full object-cover border-4 border-[#cff068]/30 shadow-lg`}
      />
    );
  }
  return (
    <div className={`${wh} rounded-full bg-gradient-to-br from-emerald-950 to-emerald-900 flex items-center justify-center border-4 border-[#cff068]/30 shadow-lg`}>
      <span className={`${text} font-black text-[#cff068] font-display`}>{initials || '?'}</span>
    </div>
  );
}

// ─── Status toast ─────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-fade-in border ${
      type === 'success'
        ? 'bg-[#041006] border-emerald-500/20 text-emerald-400'
        : 'bg-rose-950/45 border-rose-500/20 text-rose-400'
    }`}>
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4" />
        : <AlertCircle  className="w-4 h-4" />
      }
      <span>{msg}</span>
    </div>
  );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl border border-white/5 shadow-2xl p-6">
      <div className="flex items-center space-x-2 mb-5 pb-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="font-display font-bold text-sm text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder = '', disabled = false }:
  { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      />
    </div>
  );
}

// ─── Select field ─────────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options }:
  { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/30 transition-all cursor-pointer font-semibold"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#041006] text-white">{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main ProfileView ─────────────────────────────────────────────────────────
export default function ProfileView() {
  const { user, updateProfile, changePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast,   setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving,  setSaving]  = useState(false);

  // ── Profile form state ──────────────────────────────────────────────────────
  const [name,   setName]   = useState(user?.name   || '');
  const [phone,  setPhone]  = useState(user?.phone  || '');
  const [bio,    setBio]    = useState(user?.bio    || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [district, setDistrict] = useState(user?.location?.district || '');
  const [state,    setState2]   = useState(user?.location?.state    || '');
  const [country,  setCountry]  = useState(user?.location?.country  || 'India');
  const [pincode,  setPincode]  = useState(user?.location?.pincode  || '');

  const [landHa,      setLandHa]      = useState(String(user?.farmProfile?.totalLandHectares  || ''));
  const [primaryCrops,setPrimaryCrops]= useState((user?.farmProfile?.primaryCrops || []).join(', '));
  const [experience,  setExperience]  = useState(String(user?.farmProfile?.farmingExperience  || ''));
  const [irrigation,  setIrrigation]  = useState(user?.farmProfile?.irrigationType || '');
  const [soilType,    setSoilType]    = useState(user?.farmProfile?.soilType       || '');
  const [govId,       setGovId]       = useState(user?.farmProfile?.governmentId   || '');

  const [notifEmail, setNotifEmail] = useState(user?.preferences?.notificationsEmail ?? true);
  const [notifSMS,   setNotifSMS]   = useState(user?.preferences?.notificationsSMS  ?? false);
  const [units,      setUnits]      = useState(user?.preferences?.units || 'metric');

  // ── Password change state ───────────────────────────────────────────────────
  const [curPass,  setCurPass]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confPass, setConfPass] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // ── Avatar upload ───────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo must be under 2 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Show toast helper ───────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setSaving(true);
    const result = await updateProfile({
      name: name.trim(),
      phone, bio, avatar,
      location: { district, state, country, pincode },
      farmProfile: {
        totalLandHectares:  parseFloat(landHa) || 0,
        primaryCrops:       primaryCrops.split(',').map(c => c.trim()).filter(Boolean),
        farmingExperience:  parseInt(experience) || 0,
        irrigationType:     irrigation,
        soilType,
        governmentId:       govId
      },
      preferences: { notificationsEmail: notifEmail, notificationsSMS: notifSMS, units }
    });
    setSaving(false);
    showToast(result.success ? 'Profile saved successfully!' : result.error || 'Save failed', result.success ? 'success' : 'error');
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!curPass || !newPass || !confPass) { showToast('Fill all password fields', 'error'); return; }
    if (newPass !== confPass) { showToast('New passwords do not match', 'error'); return; }
    if (newPass.length < 6)   { showToast('New password must be 6+ characters', 'error'); return; }
    setPwSaving(true);
    const result = await changePassword(curPass, newPass);
    setPwSaving(false);
    if (result.success) {
      setCurPass(''); setNewPass(''); setConfPass('');
      showToast('Password changed successfully!', 'success');
    } else {
      showToast(result.error || 'Password change failed', 'error');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40 text-sm font-mono">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* ── Profile Hero ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#041d06] to-[#020e03] rounded-2xl p-6 flex items-center space-x-6 shadow-lg border border-white/5">
        <div className="relative flex-shrink-0">
          <AvatarDisplay avatar={avatar} name={user.name} size="lg" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#cff068] text-[#03260e] hover:bg-[#b8d94a] rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="text-left flex-1 min-w-0">
          <h2 className="font-display font-black text-2xl text-white truncate">{user.name}</h2>
          <p className="text-[#cff068]/90 text-xs font-mono mt-0.5">{user.email}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#cff068]/10 text-[#cff068] border border-[#cff068]/20 px-3 py-1 rounded-full">
              {user.role}
            </span>
            {user.location?.state && (
              <span className="text-[10px] text-white/60 font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#cff068]" />
                {user.location.district ? `${user.location.district}, ` : ''}{user.location.state}
              </span>
            )}
            {user.stats?.totalAnalysesRun ? (
              <span className="text-[10px] text-white/60 font-mono">
                {user.stats.totalAnalysesRun} analyses run
              </span>
            ) : null}
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="hidden sm:flex items-center space-x-2 bg-[#cff068] hover:bg-[#b8d94a] text-[#03260e] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving…' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Personal Info ────────────────────────────────────────────────── */}
        <Card title="Personal Information" icon={User}>
          <div className="space-y-4">
            <Field label="Full Name"    value={name}  onChange={setName}  placeholder="Your full name" />
            <Field label="Email"        value={user.email} onChange={() => {}} disabled placeholder="Email" />
            <Field label="Phone"        value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="A short description about yourself and your farm…"
                maxLength={200}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/30 transition-all resize-none font-medium"
              />
              <p className="text-right text-[9px] text-white/30 font-mono mt-0.5">{bio.length}/200</p>
            </div>
          </div>
        </Card>

        {/* ── Location ─────────────────────────────────────────────────────── */}
        <Card title="Location" icon={MapPin}>
          <div className="space-y-4">
            <Field label="District / City" value={district} onChange={setDistrict} placeholder="e.g. Ludhiana" />
            <Field label="State"           value={state}    onChange={setState2}   placeholder="e.g. Punjab" />
            <Field label="Country"         value={country}  onChange={setCountry}  placeholder="India" />
            <Field label="Pincode"         value={pincode}  onChange={setPincode}  placeholder="e.g. 141001" />
          </div>
        </Card>

        {/* ── Farm Profile ─────────────────────────────────────────────────── */}
        <Card title="Farm Profile" icon={Sprout}>
          <div className="space-y-4">
            <Field label="Total Land (Hectares)" value={landHa}       onChange={setLandHa}       placeholder="e.g. 5.5" />
            <Field label="Primary Crops"         value={primaryCrops} onChange={setPrimaryCrops} placeholder="Rice, Wheat, Mustard" />
            <Field label="Farming Experience (Years)" value={experience} onChange={setExperience} placeholder="e.g. 15" />
            <SelectField
              label="Irrigation Type"
              value={irrigation}
              onChange={setIrrigation}
              options={[
                { value: '',          label: 'Select…'   },
                { value: 'drip',      label: 'Drip'      },
                { value: 'sprinkler', label: 'Sprinkler' },
                { value: 'flood',     label: 'Flood'     },
                { value: 'rainfed',   label: 'Rainfed'   },
                { value: 'mixed',     label: 'Mixed'     },
              ]}
            />
            <SelectField
              label="Soil Type"
              value={soilType}
              onChange={setSoilType}
              options={[
                { value: '',      label: 'Select…' },
                { value: 'clay',  label: 'Clay'    },
                { value: 'loamy', label: 'Loamy'   },
                { value: 'sandy', label: 'Sandy'   },
                { value: 'silty', label: 'Silty'   },
                { value: 'black', label: 'Black'   },
                { value: 'red',   label: 'Red'     },
              ]}
            />
            <Field label="Kisan / Government ID (Optional)" value={govId} onChange={setGovId} placeholder="e.g. KCC-XXXXXXXX" />
          </div>
        </Card>

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <Card title="Preferences" icon={Globe}>
          <div className="space-y-5">
            <SelectField
              label="Measurement Units"
              value={units}
              onChange={setUnits}
              options={[
                { value: 'metric',   label: 'Metric (kg, hectares, °C)' },
                { value: 'imperial', label: 'Imperial (lbs, acres, °F)' },
              ]}
            />

            <div className="space-y-3 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Notifications</p>
              {[
                { label: 'Email notifications', value: notifEmail, set: setNotifEmail },
                { label: 'SMS notifications',   value: notifSMS,   set: setNotifSMS   }
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs text-white/80 font-medium">{label}</span>
                  <button
                    role="switch"
                    aria-checked={value}
                    onClick={() => set(!value)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? 'bg-emerald-500' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>

            {/* Account Stats */}
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Account</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Member Since',   val: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—' },
                  { label: 'Analyses Run',   val: user.stats?.totalAnalysesRun ?? 0 },
                  { label: 'Role',           val: user.role },
                  { label: 'Last Login',     val: user.stats?.lastLoginAt ? new Date(user.stats.lastLoginAt).toLocaleDateString('en-IN') : '—' },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <p className="text-[9px] text-white/40 font-mono uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-bold text-white mt-0.5 capitalize">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* ── Change Password ─────────────────────────────────────────────────── */}
      <Card title="Change Password" icon={Lock}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Current Password"  value={curPass}  onChange={setCurPass}  type="password" placeholder="••••••••" />
          <Field label="New Password"      value={newPass}  onChange={setNewPass}  type="password" placeholder="Min 6 characters" />
          <Field label="Confirm Password"  value={confPass} onChange={setConfPass} type="password" placeholder="Re-enter new" />
        </div>
        <button
          onClick={handleChangePassword}
          disabled={pwSaving}
          className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-60 shadow-md"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{pwSaving ? 'Changing…' : 'Change Password'}</span>
        </button>
      </Card>

      {/* ── Mobile Save Button ──────────────────────────────────────────────── */}
      <div className="sm:hidden">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full flex items-center justify-center space-x-2 bg-[#cff068] text-[#03260e] hover:bg-[#b8d94a] font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving…' : 'Save Profile'}</span>
        </button>
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
