import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, MapPin, Phone, Globe, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Client } from '../types';

interface ClientsProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'created_at'>) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onSelectClientForPreview: (client: Client) => void;
}

const PRESET_LOGOS = [
  '🍔', '🍕', '☕', '🍣', '🥗', '🍰', '🥩', '🍲', '🍦', '🍩'
];

const PRESET_COVERS = [
  { name: 'Burger & Fast Food', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Premium Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Modern Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Elegant Restaurant', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Steakhouse', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' }
];

export default function AdminClients({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onSelectClientForPreview
}: ClientsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('🍔');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [slug, setSlug] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'emerald' | 'rose' | 'amber'>('light');

  // Auto slug generation
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingClient) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9s -]/g, '') // remove invalid characters
        .replace(/\s+/g, '-') // replace space with dashes
        .replace(/-+/g, '-'); // replace duplicate dashes
      setSlug(generatedSlug);
    }
  };

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName('');
    setLogo('🍔');
    setCoverImage(PRESET_COVERS[0].url);
    setPhone('');
    setAddress('');
    setSlug('');
    setTheme('light');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.restaurant_name);
    setLogo(client.logo);
    setCoverImage(client.cover_image);
    setPhone(client.phone);
    setAddress(client.address);
    setSlug(client.slug);
    setTheme(client.theme);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    if (editingClient) {
      onEditClient({
        ...editingClient,
        restaurant_name: name,
        logo,
        cover_image: coverImage,
        phone,
        address,
        slug,
        theme
      });
    } else {
      onAddClient({
        restaurant_name: name,
        logo,
        cover_image: coverImage,
        phone,
        address,
        slug,
        theme
      });
    }
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter((client) =>
    client.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Restoran Müşterileri</h2>
          <p className="text-sm text-slate-500">Ajansınız altındaki üye restoranların ayarlarını yönetin.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-sky-500 text-white font-semibold text-sm rounded-xl hover:bg-sky-400 transition-all duration-200 shadow-lg shadow-sky-500/10 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Restoran Müşterisi Ekle
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Restoran adı veya link slug ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 shadow-sm"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Cover Image Banner */}
              <div className="h-32 w-full relative bg-slate-100">
                <img
                  src={client.cover_image || PRESET_COVERS[0].url}
                  alt={client.restaurant_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center text-xl shrink-0">
                    {client.logo || '🍔'}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-white text-base truncate leading-tight drop-shadow">
                      {client.restaurant_name}
                    </h3>
                    <p className="text-[11px] text-sky-200 font-mono tracking-wider truncate drop-shadow">
                      /{client.slug}
                    </p>
                  </div>
                </div>
                {/* Theme indicator */}
                <span className={`absolute top-3 right-3 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shadow text-white ${
                  client.theme === 'dark' ? 'bg-slate-800' :
                  client.theme === 'emerald' ? 'bg-emerald-600' :
                  client.theme === 'rose' ? 'bg-rose-600' :
                  client.theme === 'amber' ? 'bg-amber-600' :
                  'bg-sky-500'
                }`}>
                  {client.theme}
                </span>
              </div>

              {/* Client Info Details */}
              <div className="p-5 space-y-3.5 text-sm text-slate-600">
                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  {client.address ? `📍 ${client.address}` : 'Henüz adres tanımlanmamış.'}
                </p>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{client.phone || 'Telefon eklenmemiş'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-500">
                    <Globe className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="break-all font-mono text-[11px] text-sky-600 underline">
                      {`cloud9menu.ai/menu/${client.slug}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectClientForPreview(client)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Önizle (AI)
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(client)}
                  className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
                  title="Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteClient(client.id)}
                  className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-6 space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="font-bold text-slate-900 text-base">Müşteri Bulunamadı</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Aradığınız kriterlere uygun kayıtlı restoran bulunamadı. Hemen yeni bir restoran müşteri kartı oluşturun.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 bg-sky-500 text-white font-semibold text-xs rounded-lg hover:bg-sky-400 transition-colors"
            >
              Yeni Restoran Ekle
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingClient ? 'Restoran Müşterisini Düzenle' : 'Yeni Restoran Müşterisi Ekle'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Restaurant Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Restoran Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Karamelize Fast Food"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
                />
              </div>

              {/* Slug (Auto-generated) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Benzersiz URL Slug</span>
                  <span className="text-[10px] text-sky-500 font-mono">Otomatik üretilir</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                  <span className="bg-slate-100 px-3 py-2.5 text-xs text-slate-400 font-mono flex items-center">
                    cloud9menu.ai/menu/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="karamelize-fast-food"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="flex-1 px-4 py-2.5 bg-slate-50 text-sm focus:outline-none text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Logo icon selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Restoran Logo İkonu</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_LOGOS.map((pLogo) => (
                    <button
                      type="button"
                      key={pLogo}
                      onClick={() => setLogo(pLogo)}
                      className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                        logo === pLogo
                          ? 'border-sky-500 bg-sky-50 shadow-sm scale-110'
                          : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {pLogo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Image Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Kapak Görseli</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50">
                  {PRESET_COVERS.map((cov) => (
                    <button
                      type="button"
                      key={cov.url}
                      onClick={() => setCoverImage(cov.url)}
                      className={`p-1.5 rounded-lg text-left border-2 flex items-center gap-2 transition-all ${
                        coverImage === cov.url
                          ? 'border-sky-500 bg-white shadow-sm'
                          : 'border-transparent hover:bg-slate-100'
                      }`}
                    >
                      <img src={cov.url} className="w-10 h-7 rounded object-cover shrink-0" alt="" />
                      <span className="text-[10px] font-semibold text-slate-700 truncate">{cov.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Cover URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Özel Kapak Görseli URL'si (Opsiyonel)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
                />
              </div>

              {/* Theme selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Premium Tema Rengi</label>
                <select
                  value={theme}
                  onChange={(e: any) => setTheme(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 font-semibold"
                >
                  <option value="light">Açık Minimal (Light Classic)</option>
                  <option value="dark">Koyu Apple Tarzı (Dark Cosmic)</option>
                  <option value="emerald">Doğal Organik (Emerald Mint)</option>
                  <option value="rose">Lüks Tatlı & Bistro (Rose Velvet)</option>
                  <option value="amber">Fast Food Sıcak (Amber Sunset)</option>
                </select>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Telefon</label>
                  <input
                    type="tel"
                    placeholder="0555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Restoran Adresi</label>
                  <input
                    type="text"
                    placeholder="Kadıköy, İstanbul"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Submit buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-400 text-xs font-semibold shadow-md shadow-sky-500/10"
                >
                  {editingClient ? 'Değişiklikleri Kaydet' : 'Restoranı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
