import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Printer, Plus, Table, AlertTriangle, Eye, ShieldCheck, HelpCircle } from 'lucide-react';
import { Client, Table as TableType } from '../types';
import QRCode from 'qrcode';

interface QRProps {
  clients: Client[];
  tables: TableType[];
  onAddTable: (restaurant_id: string, table_number: string) => void;
  onDeleteTable: (id: string) => void;
  onSelectClientForPreview: (client: Client, tableNumber?: string) => void;
}

export default function AdminQR({
  clients,
  tables,
  onAddTable,
  onDeleteTable,
  onSelectClientForPreview
}: QRProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [newTableNumber, setNewTableNumber] = useState('');
  const [showOverlayLogo, setShowOverlayLogo] = useState(true);
  const [qrText, setQrText] = useState('Kameranı okut, menümüzü keşfet');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tableCanvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const activeClient = clients.find(c => c.id === selectedClientId);
  const clientTables = tables.filter(t => t.restaurant_id === selectedClientId);

  const menuUrl = activeClient ? `https://cloud9menu.ai/menu/${activeClient.slug}` : '';

  // Draw main QR code on canvas with logo overlay
  useEffect(() => {
    if (!menuUrl || !canvasRef.current || !activeClient) return;

    QRCode.toCanvas(canvasRef.current, menuUrl, {
      width: 280,
      margin: 1.5,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }, (err) => {
      if (err) console.error(err);
      
      // If rendering logo overlay is enabled
      if (showOverlayLogo && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const size = canvasRef.current.width;
          const logoSize = 48;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          // Draw round background for logo
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 3, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Draw the emoji logo in the center
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(activeClient.logo || '🍔', size / 2, size / 2 + 1);
        }
      }
    });
  }, [menuUrl, activeClient, showOverlayLogo]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current || !activeClient) return;

    // Draw on a high-res print-ready canvas with labels
    const printCanvas = document.createElement('canvas');
    printCanvas.width = 400;
    printCanvas.height = 540;
    const ctx = printCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 540);

    // Decorative Premium Frame
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 368, 508);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, 356, 496);

    // Platform logo / Brand text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activeClient.restaurant_name.toUpperCase(), 200, 65);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('DIJITAL QR MENÜ', 200, 88);

    // Draw the QR Code in center
    ctx.drawImage(canvasRef.current, 60, 115, 280, 280);

    // Footer text "Kameranı okut, menümüzü keşfet"
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(qrText, 200, 435);

    // Secondary text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Powered by Cloud9 Menu AI', 200, 475);

    // Download action
    const link = document.createElement('a');
    link.download = `cloud9-qr-${activeClient.slug}.png`;
    link.href = printCanvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSVG = () => {
    if (!menuUrl || !activeClient) return;
    
    QRCode.toString(menuUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }, (err, svgString) => {
      if (err) return console.error(err);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `cloud9-qr-${activeClient.slug}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Yazdır - ${activeClient?.restaurant_name}</title>
          <style>
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #ffffff;
            }
            .card {
              border: 10px solid #0284c7;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              max-width: 400px;
              box-sizing: border-box;
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 26px;
              color: #0f172a;
            }
            p.sub {
              margin: 0 0 30px 0;
              font-size: 11px;
              color: #64748b;
              letter-spacing: 2px;
              font-weight: bold;
            }
            .qr-wrap {
              margin-bottom: 30px;
            }
            p.footer {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${activeClient?.restaurant_name}</h1>
            <p class="sub">DIJITAL QR MENÜ</p>
            <div class="qr-wrap">
              <img src="${canvasRef.current?.toDataURL('image/png')}" width="280" height="280" />
            </div>
            <p class="footer">${qrText}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber || !selectedClientId) return;
    onAddTable(selectedClientId, newTableNumber);
    setNewTableNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Client Dropdown Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Seçili Restoran</label>
          {clients.length > 0 ? (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
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
        <div className="text-xs text-sky-600 bg-sky-50 border border-sky-100 px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Tüm QR kodlar, platform içi Apple tarzı mobil menüye yönlendirilir!
        </div>
      </div>

      {activeClient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main QR design panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-500">KAYDET VE DAĞIT</span>
              <h3 className="font-extrabold text-slate-900 text-lg">Platform QR Menüsü</h3>
              <p className="text-xs text-slate-400 font-mono break-all">{menuUrl}</p>
            </div>

            {/* QR Code Canvas Rendering Block */}
            <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4 relative">
              <canvas
                ref={canvasRef}
                className="bg-white p-3 rounded-2xl shadow-sm max-w-full"
                style={{ width: '220px', height: '220px' }}
              />
              <div className="text-center space-y-1">
                <p className="font-extrabold text-sm text-slate-800">{activeClient.restaurant_name}</p>
                <p className="text-xs text-slate-500 font-medium italic">"{qrText}"</p>
              </div>
            </div>

            {/* Logo and Text Editor Customization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">QR Ortasına Logo Yerleştir</span>
                <button
                  onClick={() => setShowOverlayLogo(!showOverlayLogo)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    showOverlayLogo ? 'bg-sky-50 border-sky-200 text-sky-700 font-bold' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  {showOverlayLogo ? 'Aktif' : 'Pasif'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">QR Alt Metni</label>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={handleDownloadPNG}
                className="py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors shadow-lg shadow-sky-500/10"
              >
                <Download className="w-4 h-4" />
                PNG İndir
              </button>
              <button
                onClick={handleDownloadSVG}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                SVG İndir
              </button>
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Yazdır
              </button>
            </div>
          </div>

          {/* Tables management panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4.5 h-4.5 text-sky-500" />
                  Masa Bazlı QR Yönetimi ({clientTables.length})
                </h4>
                <p className="text-xs text-slate-400">İleride sipariş ve masaya özel servis altyapısı için hazır entegrasyon.</p>
              </div>
            </div>

            {/* Add Table form */}
            <form onSubmit={handleAddTableSubmit} className="flex gap-2.5">
              <input
                type="text"
                required
                placeholder="Masa Numarası (Örn: 1, 2, A4)"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Masa Ekle
              </button>
            </form>

            {/* List of tables */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {clientTables.map((tbl) => {
                const tableUrl = `https://cloud9menu.ai/menu/${activeClient.slug}?masa=${tbl.table_number}`;
                return (
                  <div
                    key={tbl.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">Masa {tbl.table_number}</span>
                        <span className="bg-sky-50 border border-sky-100 text-sky-600 px-2 py-0.5 rounded text-[9px] font-bold">
                          Aktif Altyapı
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono break-all leading-tight">
                        {tableUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => onSelectClientForPreview(activeClient, tbl.table_number)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1"
                        title="Masayı Önizle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Aç
                      </button>
                      <button
                        onClick={() => {
                          const w = window.open('', '_blank');
                          if (!w) return;
                          QRCode.toDataURL(tableUrl, { width: 300 }, (err, url) => {
                            w.document.write(`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h2>${activeClient.restaurant_name} - Masa ${tbl.table_number}</h2><img src="${url}" width="280"/><p>${qrText}</p><script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 500);}</script></div>`);
                            w.document.close();
                          });
                        }}
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg"
                        title="Masayı Yazdır"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTable(tbl.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Masayı Kaldır"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {clientTables.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6 space-y-2">
                  <Table className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-500 text-xs">Henüz bir masa tanımlanmadı.</p>
                  <p className="text-slate-400 text-[11px] max-w-xs mx-auto">
                    Masa bazlı QR kod altyapısı oluşturmak için yukarıdan masa numarası girin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-slate-100 rounded-2xl p-6">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Yüklü Restoran Bilgisi Yok</h4>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Önce restoran tanımlamalısınız.
          </p>
        </div>
      )}
    </div>
  );
}
