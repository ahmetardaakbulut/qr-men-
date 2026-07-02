import React from 'react';
import { Users, Utensils, QrCode, TrendingUp, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { Client, Product, Table } from '../types';

interface OverviewProps {
  clients: Client[];
  products: Product[];
  tables: Table[];
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({ clients, products, tables, onNavigate }: OverviewProps) {
  const stats = [
    {
      label: 'Aktif Restoran Müşterileri',
      value: clients.length,
      icon: Users,
      color: 'from-blue-500 to-sky-500',
      description: 'SaaS platformuna kayıtlı restoranlar',
    },
    {
      label: 'Toplam Menü Ürünü',
      value: products.length,
      icon: Utensils,
      color: 'from-indigo-500 to-purple-500',
      description: 'Aktif restoran menü içerikleri',
    },
    {
      label: 'Tanımlı QR Masa Altyapısı',
      value: tables.length,
      icon: QrCode,
      color: 'from-emerald-500 to-teal-500',
      description: 'Aktif sipariş ve masa QR kodları',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Platform Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden shadow-xl shadow-indigo-950/20">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 -mb-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs px-3 py-1 rounded-full font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Sürümü v1.0 • Hostinger Entegrasyonu Hazır
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Cloud9 Menu AI platformuna hoş geldiniz!
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Bu panelden restoran müşterilerinizi kaydedebilir, kategorilerini ve ürünlerini yönetebilir, 
              hem genel hem de masa bazlı otomatik QR kodlar üretebilirsiniz. Hazırladığınız her menü 
              <b> Yapay Zeka (AI) Asistanı</b> desteklidir!
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => onNavigate('clients')}
              className="px-5 py-3 bg-sky-500 text-white font-semibold text-sm rounded-xl hover:bg-sky-400 transition-all duration-200 shadow-lg shadow-sky-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Müşteri Ekle
            </button>
            <button
              onClick={() => onNavigate('deploy')}
              className="px-5 py-3 bg-slate-800 text-white font-semibold text-sm rounded-xl hover:bg-slate-700 transition-all duration-200 border border-slate-700 flex items-center gap-2"
            >
              Dağıtım Kodunu Al
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md shadow-slate-100`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 text-xs px-2 py-1 rounded-md font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +100%
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-semibold text-slate-800 mb-0.5">{stat.label}</p>
              <p className="text-xs text-slate-400">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Hostinger Info and Quick Preview Instruction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hostinger Alert Box */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-base">Hostinger Dağıtımı Hakkında Bilgi</h4>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Bu platform yerel test ve sunum amacıyla React + Node.js tabanlı çalışmaktadır. 
                Sisteminizin Hostinger PHP ve MySQL sunucularınızda <b>%100 uyumlu</b> çalışması için 
                gerekli olan PDO veritabanı şemasını, SQL kodlarını ve PHP dosyalarını 
                <b> Hostinger Dağıtım Kiti</b> sekmesinden hemen kopyalayabilirsiniz.
              </p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('deploy')}
              className="px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-lg hover:bg-amber-700 transition-colors"
            >
              Hostinger PHP & SQL Dosyalarını İncele
            </button>
          </div>
        </div>

        {/* Dynamic Scan Simulated Activity */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h4 className="font-bold text-slate-900 text-base mb-4">Son Yapay Zeka & QR Aktiviteleri</h4>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs py-2.5 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <div>
                  <p className="font-semibold text-slate-800">Sistem QR Kodu Oluşturuldu</p>
                  <p className="text-slate-400">Karamelize Fast Food için benzersiz url oluşturuldu</p>
                </div>
              </div>
              <span className="text-slate-400 font-mono">Şimdi</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2.5 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></span>
                <div>
                  <p className="font-semibold text-slate-800">AI Asistan Sorgusu Simüle Edildi</p>
                  <p className="text-slate-400">Üye müşteri menüsünde gluten sorgusu yanıtlandı</p>
                </div>
              </div>
              <span className="text-slate-400 font-mono">3 dk önce</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2.5">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                <div>
                  <p className="font-semibold text-slate-800">Masa Bazlı QR Hazırlandı</p>
                  <p className="text-slate-400">Restoran bünyesinde 2 farklı masa QR kodu üretildi</p>
                </div>
              </div>
              <span className="text-slate-400 font-mono">10 dk önce</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
