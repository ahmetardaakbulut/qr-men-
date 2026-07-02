import React, { useState } from 'react';
import { Plus, Trash2, Edit, CheckCircle, XCircle, Search, Sparkles, Filter, List, UtensilsCrossed } from 'lucide-react';
import { Client, Category, Product } from '../types';

interface ProductsProps {
  clients: Client[];
  categories: Category[];
  products: Product[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const PRESET_PRODUCT_IMAGES = [
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tatlı', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80' },
  { name: 'İçecek', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80' },
  { name: 'Salata', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kahve', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' }
];

export default function AdminProducts({
  clients,
  categories,
  products,
  onAddCategory,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: ProductsProps) {
  // Select active client
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Category Modal Form State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');

  // Product Modal Form State
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodImage, setProdImage] = useState(PRESET_PRODUCT_IMAGES[0].url);
  const [prodIngredients, setProdIngredients] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodStatus, setProdStatus] = useState<'active' | 'passive'>('active');

  // Filter categories and products for the selected client
  const clientCategories = categories.filter(c => c.client_id === selectedClientId);
  const clientProducts = products.filter(p => p.client_id === selectedClientId);

  const activeClient = clients.find(c => c.id === selectedClientId);

  const handleOpenAddProduct = () => {
    if (clientCategories.length === 0) {
      alert('Lütfen önce bir kategori ekleyin.');
      return;
    }
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(0);
    setProdImage(PRESET_PRODUCT_IMAGES[0].url);
    setProdIngredients('');
    setProdCatId(clientCategories[0].id);
    setProdStatus('active');
    setIsProdModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdImage(prod.image);
    setProdIngredients(prod.ingredients);
    setProdCatId(prod.category_id);
    setProdStatus(prod.status);
    setIsProdModalOpen(true);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !selectedClientId) return;
    onAddCategory({
      client_id: selectedClientId,
      name: catName,
      sort_order: clientCategories.length + 1
    });
    setCatName('');
    setIsCatModalOpen(false);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCatId || !selectedClientId) return;

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        image: prodImage,
        ingredients: prodIngredients,
        category_id: prodCatId,
        status: prodStatus
      });
    } else {
      onAddProduct({
        client_id: selectedClientId,
        category_id: prodCatId,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        image: prodImage,
        ingredients: prodIngredients,
        status: prodStatus
      });
    }
    setIsProdModalOpen(false);
  };

  const toggleProductStatus = (prod: Product) => {
    onEditProduct({
      ...prod,
      status: prod.status === 'active' ? 'passive' : 'active'
    });
  };

  const filteredProducts = clientProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryId === 'all' || p.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header with Client Dropdown selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Yönetilen Restoran</label>
          {clients.length > 0 ? (
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedCategoryId('all');
              }}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 max-w-xs transition-all cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.logo || '🍔'} {c.restaurant_name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm font-bold text-slate-500">Önce restoran oluşturmalısınız.</p>
          )}
        </div>

        {clients.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Kategori Ekle
            </button>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-sky-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Ürün Ekle
            </button>
          </div>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-6 space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Müşteri Tanımı Eksik</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Kategori ve ürün eklemeye başlamadan önce bir restoran müşterisi kaydetmelisiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Categories list sidebar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <List className="w-4 h-4 text-sky-500" />
              Kategoriler ({clientCategories.length})
            </h4>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedCategoryId === 'all'
                    ? 'bg-sky-50 text-sky-700 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Hepsi</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">
                  {clientProducts.length}
                </span>
              </button>

              {clientCategories.map((cat) => {
                const count = clientProducts.filter(p => p.category_id === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className={`group w-full flex items-center justify-between rounded-xl px-1.5 transition-all ${
                      selectedCategoryId === cat.id ? 'bg-sky-50/50' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex-1 text-left px-2 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${
                        selectedCategoryId === cat.id ? 'text-sky-700 font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono group-hover:scale-105 transition-transform">
                        {count}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {clientCategories.length === 0 && (
                <p className="text-xs text-slate-400 italic py-4 text-center">Henüz kategori eklenmemiş.</p>
              )}
            </div>
          </div>

          {/* Products Table/Grid display */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filter and Search headers */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white p-4 rounded-xl border border-slate-50">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ürün adı, içerik veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
                Gösterilen: <b>{filteredProducts.length}</b> Ürün
              </div>
            </div>

            {/* Grid List of Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => {
                const cat = clientCategories.find(c => c.id === prod.category_id);
                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image and badges */}
                      <div className="h-40 w-full bg-slate-100 relative">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <span className="bg-slate-900/80 backdrop-blur-sm text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
                            ₺{prod.price}
                          </span>
                          <button
                            onClick={() => toggleProductStatus(prod)}
                            className={`p-1 rounded-full shadow-sm ${
                              prod.status === 'active'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                            title={prod.status === 'active' ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}
                          >
                            {prod.status === 'active' ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {cat && (
                          <span className="absolute bottom-2.5 left-2.5 bg-sky-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                            {cat.name}
                          </span>
                        )}
                      </div>

                      {/* Info details */}
                      <div className="p-4 space-y-2">
                        <h5 className="font-extrabold text-slate-950 text-sm leading-snug">{prod.name}</h5>
                        <p className="text-xs text-slate-500 line-clamp-2 min-h-8">{prod.description || 'Açıklama eklenmemiş.'}</p>
                        {prod.ingredients && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {prod.ingredients.split(',').map((ing, i) => (
                              <span key={i} className="text-[9px] bg-slate-50 border border-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                                {ing.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Düzenle
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-rose-600 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6 space-y-2.5">
                  <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
                  <h5 className="font-bold text-slate-800 text-sm">Ürün Bulunamadı</h5>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto">
                    Seçili kriterlere göre listelenecek bir menü elemanı bulunamadı. Hemen bir adet ekleyin!
                  </p>
                  <button
                    onClick={handleOpenAddProduct}
                    className="mt-1 px-4.5 py-2 bg-sky-500 text-white font-semibold text-xs rounded-lg hover:bg-sky-400 transition-colors"
                  >
                    Ürün Ekle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Yeni Menü Kategorisi</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Kapat</button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Kategori Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Pizzalar, Sıcak İçecekler"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-sky-500 text-white rounded-xl text-xs font-semibold hover:bg-sky-400 transition-colors"
              >
                Kategoriyi Ekle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Creation / Edit Modal */}
      {isProdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProduct ? 'Menü Ürününü Düzenle' : 'Yeni Menü Ürünü Ekle'}
              </h3>
              <button onClick={() => setIsProdModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Kapat</button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-5 space-y-4 text-xs">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Ürün Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Cheddar Bacon Burger"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Fiyat (TL)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="120"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Kategori</label>
                  <select
                    value={prodCatId}
                    onChange={(e) => setProdCatId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 font-semibold"
                  >
                    {clientCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Açıklama</label>
                <textarea
                  placeholder="Karamelize soğan, cheddar peyniri ve özel burger sosu ile servis edilir."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 resize-none"
                />
              </div>

              {/* Ingredients */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>İçindekiler</span>
                  <span className="text-[9px] text-slate-400">Virgül ile ayırın</span>
                </label>
                <input
                  type="text"
                  placeholder="Dana Köfte, Cheddar, Karamelize Soğan, Özel Sos"
                  value={prodIngredients}
                  onChange={(e) => setProdIngredients(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                />
              </div>

              {/* Product Image Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Hazır Görsel Seçimi</label>
                <div className="grid grid-cols-3 gap-1.5 p-1.5 border border-slate-100 rounded-xl bg-slate-50 max-h-24 overflow-y-auto">
                  {PRESET_PRODUCT_IMAGES.map((img) => (
                    <button
                      type="button"
                      key={img.url}
                      onClick={() => setProdImage(img.url)}
                      className={`p-1 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        prodImage === img.url ? 'border-sky-500 bg-white shadow-sm' : 'border-transparent hover:bg-slate-100'
                      }`}
                    >
                      <img src={img.url} className="w-12 h-10 rounded object-cover shrink-0" alt="" />
                      <span className="text-[9px] text-slate-600 truncate max-w-full">{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Özel Görsel URL'si</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Menü Durumu</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="prod_status"
                      checked={prodStatus === 'active'}
                      onChange={() => setProdStatus('active')}
                      className="text-sky-500 focus:ring-sky-500"
                    />
                    <span className="font-semibold text-slate-700">Aktif (Sipariş Alınabilir)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="prod_status"
                      checked={prodStatus === 'passive'}
                      onChange={() => setProdStatus('passive')}
                      className="text-sky-500 focus:ring-sky-500"
                    />
                    <span className="font-semibold text-slate-500">Pasif (Tükendi / Gizli)</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProdModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-400 font-semibold shadow-md"
                >
                  {editingProduct ? 'Kaydet' : 'Ürünü Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
