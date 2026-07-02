import React from 'react';
import { LayoutDashboard, Users, Utensils, QrCode, DownloadCloud, LogOut, Eye } from 'lucide-react';
import Cloud9Logo from './Cloud9Logo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  adminName: string;
}

export default function Sidebar({ currentTab, setCurrentTab, onLogout, adminName }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'clients', label: 'Restoran Müşterileri', icon: Users },
    { id: 'products', label: 'Menü & Ürünler', icon: Utensils },
    { id: 'qr', label: 'QR Menü & Masalar', icon: QrCode },
    { id: 'deploy', label: 'Hostinger Dağıtım Kiti', icon: DownloadCloud },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800">
      <div className="p-6">
        <div className="mb-8">
          <Cloud9Logo />
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate text-slate-200">{adminName}</h4>
            <p className="text-[11px] text-sky-400 font-mono tracking-wider uppercase">Süper Admin</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950/40 hover:bg-rose-950/20 text-xs font-semibold transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sistemden Çıkış
        </button>
      </div>
    </aside>
  );
}
