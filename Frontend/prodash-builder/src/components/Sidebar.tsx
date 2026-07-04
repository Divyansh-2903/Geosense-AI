import React from 'react';
import { 
  Sprout, 
  LayoutDashboard, 
  Map as MapIcon, 
  CloudSun, 
  TrendingUp, 
  Settings as SettingsIcon,
  UserCircle
} from 'lucide-react';
import { DashboardTab } from '../types';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onBackToLanding?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onBackToLanding, isOpen = false, onClose }: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard' as DashboardTab, label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'maps'      as DashboardTab, label: 'Field Maps',  icon: MapIcon         },
    { id: 'weather'   as DashboardTab, label: 'Weather',     icon: CloudSun        },
    { id: 'crop'      as DashboardTab, label: 'Crop Analytics', icon: TrendingUp   },
    { id: 'profile'   as DashboardTab, label: 'My Profile',  icon: UserCircle      },
    { id: 'settings'  as DashboardTab, label: 'Settings',    icon: SettingsIcon    },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile sidebar */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
        />
      )}
      <aside className={`w-64 bg-[#020603] lg:bg-[#020603]/80 backdrop-blur-xl text-white p-5 flex flex-col justify-between h-screen select-none border-r border-white/5 fixed lg:static top-0 left-0 z-50 transform lg:transform-none transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* BRAND HEADER */}
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                if (onBackToLanding) {
                  onBackToLanding();
                } else {
                  window.location.href = '/';
                }
              }}
              className="flex flex-col text-left cursor-pointer hover:opacity-85 transition-opacity"
              title="Back to Landing Page"
            >
              <div className="flex items-center space-x-2.5 text-emerald-400 font-display font-extrabold text-xl tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.15)] animate-pulse">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <span>Geo<span className="text-white">Harvest</span></span>
              </div>
              <span className="text-[9px] text-lime-300/80 font-mono tracking-wider uppercase font-extrabold pl-10 mt-0.5">आत्मनिर्भर किसान</span>
            </button>
          </div>


          {/* SECTION LABEL */}
          <div className="pt-2">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-extrabold font-mono">Menu</span>
          </div>

          {/* MENU LINK LIST */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-item-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-display text-xs font-bold tracking-wider uppercase transition-all group cursor-pointer border ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#0c3817] to-[#041c0b] text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]' 
                      : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <IconComponent className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-emerald-400' : 'text-white/30 group-hover:text-white/70'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'settings' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>



      </aside>
    </>
  );
}
