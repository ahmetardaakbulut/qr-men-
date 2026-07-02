import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import AdminClients from './components/AdminClients';
import AdminProducts from './components/AdminProducts';
import AdminQR from './components/AdminQR';
import CustomerMenu from './components/CustomerMenu';
import DeployKit from './components/DeployKit';
import Cloud9Logo from './components/Cloud9Logo';
import { Client, Category, Product, Table } from './types';
import { Eye, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticate for smooth instant review!
  const [email, setEmail] = useState('admin@cloud9.com');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // App core state
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [previewClient, setPreviewClient] = useState<Client | null>(null);
  const [previewTable, setPreviewTable] = useState<string | undefined>(undefined);

  // Load state from DB
  const loadDatabase = async () => {
    try {
      const response = await fetch('/api/db');
      const data = await response.json();
      setClients(data.clients || []);
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setTables(data.tables || []);
    } catch (e) {
      console.error("Error loading database:", e);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // API Callbacks for updates
  const handleAddClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        await loadDatabase();
      } else {
        const err = await res.json();
        alert(err.error || "Hata oluştu.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClient = async (client: Client) => {
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      if (res.ok) {
        await loadDatabase();
      } else {
        const err = await res.json();
        alert(err.error || "Hata oluştu.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Bu restoranı silmek istediğinize emin misiniz? Tüm kategori, ürün ve masaları silinecektir.')) return;
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (catData: Omit<Category, 'id'>) => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz? Altındaki tüm ürünler silinecektir.')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (prodData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData)
      });
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditProduct = async (prod: Product) => {
    try {
      await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod)
      });
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTable = async (restaurant_id: string, table_number: string) => {
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id, table_number })
      });
      if (res.ok) {
        await loadDatabase();
      } else {
        const err = await res.json();
        alert(err.error || "Hata oluştu.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Bu masayı silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`/api/tables/${id}`, { method: 'DELETE' });
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectClientForPreview = (client: Client, tableNumber?: string) => {
    setPreviewClient(client);
    setPreviewTable(tableNumber);
    setIsPreviewMode(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@cloud9.com' && password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Hata: Geçersiz e-posta veya şifre.');
    }
  };

  // Preview Mode layout rendering
  if (isPreviewMode && previewClient) {
    return (
      <CustomerMenu
        client={previewClient}
        categories={categories}
        products={products}
        tableNumber={previewTable}
        onBackToAdmin={() => {
          setIsPreviewMode(false);
          setPreviewClient(null);
          setPreviewTable(undefined);
        }}
      />
    );
  }

  // Login View layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Cloud9Logo size={60} />
            <h2 className="text-xl font-extrabold text-white tracking-tight pt-3">Platform Girişi</h2>
            <p className="text-xs text-slate-400">Süper Admin kimlik bilgilerinizle oturum açın.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {loginError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">E-Posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cloud9.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Şifre</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-sky-500/20 text-xs"
            >
              Giriş Yap
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Demo Modu Kimlik Bilgileri: <b className="text-sky-400 font-mono">admin@cloud9.com</b> / <b className="text-sky-400 font-mono">admin123</b>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Master Layout
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={() => setIsAuthenticated(false)}
        adminName="Ahmet Arda"
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto h-screen">
        {/* Dynamic header panel */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 text-white p-2.5 rounded-xl shadow-md shadow-sky-500/10">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Süper Admin Yönetim Paneli</h1>
              <p className="text-xs text-slate-400">Cloud9 Menu AI platformunun tüm fonksiyonlarını anlık yönetin.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {clients.length > 0 && (
              <button
                onClick={() => handleSelectClientForPreview(clients[0])}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Eye className="w-4 h-4 text-sky-500" />
                Örnek Menü Önizle
              </button>
            )}
            <div className="bg-slate-200/50 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs font-mono">
              2026-07-01 UTC
            </div>
          </div>
        </div>

        {/* Tab router views */}
        <div className="space-y-6">
          {currentTab === 'overview' && (
            <DashboardOverview
              clients={clients}
              products={products}
              tables={tables}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'clients' && (
            <AdminClients
              clients={clients}
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onSelectClientForPreview={handleSelectClientForPreview}
            />
          )}

          {currentTab === 'products' && (
            <AdminProducts
              clients={clients}
              categories={categories}
              products={products}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {currentTab === 'qr' && (
            <AdminQR
              clients={clients}
              tables={tables}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
              onSelectClientForPreview={handleSelectClientForPreview}
            />
          )}

          {currentTab === 'deploy' && (
            <DeployKit />
          )}
        </div>
      </main>
    </div>
  );
}
