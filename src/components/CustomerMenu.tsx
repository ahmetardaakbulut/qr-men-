import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, Send, X, ShieldAlert, Coffee, RotateCcw, ArrowLeft, Moon, Sun, Table } from 'lucide-react';
import { Client, Category, Product, Message } from '../types';

interface MenuProps {
  client: Client;
  categories: Category[];
  products: Product[];
  tableNumber?: string;
  onBackToAdmin?: () => void;
}

export default function CustomerMenu({
  client,
  categories,
  products,
  tableNumber,
  onBackToAdmin
}: MenuProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [activeThemeMode, setActiveThemeMode] = useState<'light' | 'dark'>(client.theme === 'dark' ? 'dark' : 'light');
  
  // AI Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Merhaba! Ben ${client.restaurant_name} Yapay Zeka Asistanıyım. Menümüzdeki içerikler, gluten, alerjenler veya fiyatlar hakkında bana soru sorabilirsiniz! Size ne önerelim?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter lists
  const clientCategories = categories.filter(c => c.client_id === client.id);
  const clientProducts = products.filter(p => p.client_id === client.id && p.status === 'active');

  const filteredProducts = selectedCatId === 'all'
    ? clientProducts
    : clientProducts.filter(p => p.category_id === selectedCatId);

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  // Handle AI queries
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: client.restaurant_name,
          menuItems: clientProducts.map(p => ({
            name: p.name,
            description: p.description,
            price: p.price,
            ingredients: p.ingredients
          })),
          userPrompt: userMessage.text
        })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'Şu an yanıt üretemiyorum, lütfen tekrar sorun.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Üzgünüm, bağlantı hatası oluştu. Lütfen tekrar deneyin.'
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Determine theme styling classes based on client settings
  const getThemeClasses = () => {
    const isDark = activeThemeMode === 'dark';
    switch (client.theme) {
      case 'dark':
        return {
          bg: 'bg-slate-950 text-slate-100',
          card: 'bg-slate-900 border-slate-800 text-slate-100',
          accent: 'bg-sky-500 text-white',
          accentText: 'text-sky-400',
          catActive: 'bg-sky-500 text-white',
          catInactive: 'bg-slate-900 text-slate-400 border-slate-800',
          border: 'border-slate-800',
          bubbleUser: 'bg-sky-600 text-white',
          bubbleAssistant: 'bg-slate-900 text-slate-100'
        };
      case 'emerald':
        return {
          bg: isDark ? 'bg-slate-950 text-slate-100' : 'bg-stone-50 text-stone-900',
          card: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100 text-stone-800',
          accent: 'bg-emerald-600 text-white',
          accentText: 'text-emerald-600',
          catActive: 'bg-emerald-600 text-white',
          catInactive: isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-stone-600 border-stone-200/80',
          border: isDark ? 'border-slate-800' : 'border-emerald-500/10',
          bubbleUser: 'bg-emerald-600 text-white',
          bubbleAssistant: isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-100 text-stone-900'
        };
      case 'rose':
        return {
          bg: isDark ? 'bg-slate-950 text-slate-100' : 'bg-rose-50/20 text-rose-950',
          card: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100 text-rose-900',
          accent: 'bg-rose-600 text-white',
          accentText: 'text-rose-600',
          catActive: 'bg-rose-600 text-white',
          catInactive: isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-rose-800/80 border-rose-100',
          border: isDark ? 'border-slate-800' : 'border-rose-100',
          bubbleUser: 'bg-rose-600 text-white',
          bubbleAssistant: isDark ? 'bg-slate-900 text-slate-100' : 'bg-rose-50 text-rose-900'
        };
      case 'amber':
        return {
          bg: isDark ? 'bg-slate-950 text-slate-100' : 'bg-amber-50/10 text-slate-900',
          card: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-100 text-slate-800',
          accent: 'bg-amber-500 text-white',
          accentText: 'text-amber-600',
          catActive: 'bg-amber-500 text-white',
          catInactive: isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-700 border-slate-200',
          border: isDark ? 'border-slate-800' : 'border-amber-100',
          bubbleUser: 'bg-amber-500 text-white',
          bubbleAssistant: isDark ? 'bg-slate-900 text-slate-100' : 'bg-amber-50 text-slate-900'
        };
      default: // light style
        return {
          bg: isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
          card: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 text-slate-800',
          accent: 'bg-sky-500 text-white',
          accentText: 'text-sky-500',
          catActive: 'bg-sky-500 text-white',
          catInactive: isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200',
          border: isDark ? 'border-slate-800' : 'border-slate-100',
          bubbleUser: 'bg-sky-500 text-white',
          bubbleAssistant: isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
        };
    }
  };

  const tc = getThemeClasses();

  return (
    <div className={`min-h-screen ${tc.bg} transition-colors duration-300 relative flex flex-col`}>
      {/* Simulation Admin Header Bar */}
      {onBackToAdmin && (
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold shrink-0 z-40 shadow-md">
          <button
            onClick={onBackToAdmin}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Panele Dön
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Aktif Tema:</span>
            <span className="bg-sky-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
              {client.theme}
            </span>
            <button
              onClick={() => setActiveThemeMode(activeThemeMode === 'light' ? 'dark' : 'light')}
              className="p-1 rounded-full bg-slate-800 text-slate-200 hover:text-white transition-colors ml-1.5"
              title="Önizlemede Işık/Koyu Mod Değiştir"
            >
              {activeThemeMode === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Customer Header Cover & Brand banner */}
      <div className="h-56 w-full relative shrink-0">
        <img
          src={client.cover_image}
          alt={client.restaurant_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Dynamic Table label if tableNumber exists */}
        {tableNumber && (
          <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Table className="w-3.5 h-3.5" />
            MASA {tableNumber}
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3.5">
          <span className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl shrink-0">
            {client.logo || '🍔'}
          </span>
          <div className="min-w-0">
            <h1 className="font-extrabold text-2xl text-white tracking-tight leading-none drop-shadow">
              {client.restaurant_name}
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1 inline-flex items-center gap-1">
              <span>Premium Menü</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                AI Destekli
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Capsule Slider */}
      <div className="sticky top-0 bg-inherit/90 backdrop-blur z-20 py-3.5 border-b border-slate-200/10 shrink-0">
        <div className="px-4 overflow-x-auto flex gap-2 scrollbar-none">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 border ${
              selectedCatId === 'all' ? tc.catActive : tc.catInactive
            }`}
          >
            Hepsi
          </button>
          {clientCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 border ${
                selectedCatId === cat.id ? tc.catActive : tc.catInactive
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Content Area */}
      <div className="flex-1 px-4 py-6 space-y-4 max-w-lg mx-auto w-full pb-24">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className={`rounded-3xl p-3.5 border ${tc.card} shadow-sm flex gap-4 hover:scale-[1.01] transition-transform duration-300`}
          >
            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-extrabold text-sm leading-snug truncate">
                    {prod.name}
                  </h3>
                  <span className={`font-black text-sm shrink-0 ${tc.accentText}`}>
                    ₺{prod.price}
                  </span>
                </div>
                <p className="text-xs text-slate-500/90 line-clamp-2 leading-relaxed">
                  {prod.description || 'Nefis el yapımı restoran lezzeti.'}
                </p>
              </div>

              {/* Ingredients tag capsules */}
              {prod.ingredients && (
                <div className="flex flex-wrap gap-1 pt-1.5">
                  {prod.ingredients.split(',').map((ing, i) => (
                    <span key={i} className="text-[9px] bg-slate-500/5 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                      {ing.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <Coffee className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm">Menü Boş</h4>
            <p className="text-xs text-slate-400">Bu kategoride henüz aktif ürün bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Floating Sparkle AI Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className={`fixed bottom-6 right-6 ${tc.accent} p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs scale-105 hover:scale-110 active:scale-95 transition-all z-30 animate-bounce`}
        >
          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          Yapay Zeka Sor
        </button>
      )}

      {/* Fixed Chat overlay */}
      {isChatOpen && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl z-50 flex flex-col h-[500px] text-xs">
          {/* Chat header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-3xl shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs">Cloud9 Menu AI Asistan</h4>
                <p className="text-[10px] text-slate-400">Restorana özel yapay zeka</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 leading-relaxed font-medium text-xs ${
                    msg.sender === 'user'
                      ? 'bg-sky-500 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex gap-2 shrink-0">
            <input
              type="text"
              required
              placeholder="Acısız ne önerirsiniz? Fiyatları sor..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/40"
            />
            <button
              type="submit"
              disabled={isAiLoading}
              className="p-2 bg-sky-500 text-white rounded-xl hover:bg-sky-400 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
