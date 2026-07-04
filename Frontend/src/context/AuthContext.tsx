import React, { createContext, useState, useEffect, useContext } from 'react';
import { AUTH_API_URL } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  _id:    string;
  name:   string;
  email:  string;
  role:   string;
  avatar: string;
  phone:  string;
  bio:    string;
  location: {
    district?: string;
    state?:    string;
    country?:  string;
    pincode?:  string;
  };
  farmProfile: {
    totalLandHectares?:  number;
    primaryCrops?:       string[];
    farmingExperience?:  number;
    irrigationType?:     string;
    soilType?:           string;
    governmentId?:       string;
  };
  preferences: {
    language?:           string;
    notificationsEmail?: boolean;
    notificationsSMS?:   boolean;
    units?:              string;
  };
  stats: {
    totalAnalysesRun?: number;
    lastLoginAt?:      string | null;
    accountCreatedAt?: string;
  };
  createdAt?: string;
}

interface AuthContextType {
  user:          UserProfile | null;
  token:         string | null;
  loading:       boolean;
  login:         (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register:      (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout:        () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  changePassword:(currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile:() => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API = AUTH_API_URL;

// ─── Helper: strip token, return only profile fields ─────────────────────────
const toProfile = (data: any): UserProfile => ({
  _id:         data._id,
  name:        data.name,
  email:       data.email,
  role:        data.role        || 'farmer',
  avatar:      data.avatar      || '',
  phone:       data.phone       || '',
  bio:         data.bio         || '',
  location:    data.location    || {},
  farmProfile: data.farmProfile || {},
  preferences: data.preferences || {},
  stats:       data.stats       || {},
  createdAt:   data.createdAt
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Initialize from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('geoharvest_token');
      const storedUser  = localStorage.getItem('geoharvest_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as UserProfile);

          // Refresh from server to get latest profile data
          const response = await fetch(`${API}/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            const data = await response.json();
            const profile = toProfile(data);
            setUser(profile);
            localStorage.setItem('geoharvest_user', JSON.stringify(profile));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ── Save to state + storage ────────────────────────────────────────────────
  const persist = (profile: UserProfile, jwt: string) => {
    setUser(profile);
    setToken(jwt);
    localStorage.setItem('geoharvest_token', jwt);
    localStorage.setItem('geoharvest_user',  JSON.stringify(profile));
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Login failed' };

      persist(toProfile(data), data.token);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during login' };
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'farmer' })
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Registration failed' };

      persist(toProfile(data), data.token);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during registration' };
    }
  };

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const response = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Update failed' };

      const updated = toProfile(data);
      setUser(updated);
      localStorage.setItem('geoharvest_user', JSON.stringify(updated));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Update failed' };
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const response = await fetch(`${API}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Password change failed' };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  // ── Refresh profile from server ────────────────────────────────────────────
  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const updated = toProfile(data);
        setUser(updated);
        localStorage.setItem('geoharvest_user', JSON.stringify(updated));
      }
    } catch { /* silent */ }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('geoharvest_token');
    localStorage.removeItem('geoharvest_user');
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      updateProfile, changePassword, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
