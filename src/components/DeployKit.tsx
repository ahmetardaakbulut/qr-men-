import React, { useState } from 'react';
import { DownloadCloud, Clipboard, Check, Code, Database, Globe, Layers, AlertCircle } from 'lucide-react';

export default function DeployKit() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const sqlSchema = `
-- Hostinger MySQL Database Schema
-- Cloud9 Menu AI - Platform Altyapısı

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) DEFAULT 'super_admin',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`clients\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`restaurant_name\` VARCHAR(255) NOT NULL,
  \`logo\` VARCHAR(50) DEFAULT '🍔',
  \`cover_image\` VARCHAR(500) NOT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`slug\` VARCHAR(255) NOT NULL UNIQUE,
  \`theme\` VARCHAR(50) DEFAULT 'light',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`client_id\` INT NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`sort_order\` INT DEFAULT 0,
  FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`client_id\` INT NOT NULL,
  \`category_id\` INT NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`image\` VARCHAR(500) NOT NULL,
  \`ingredients\` VARCHAR(500) DEFAULT NULL,
  \`status\` VARCHAR(50) DEFAULT 'active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`tables\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`restaurant_id\` INT NOT NULL,
  \`table_number\` VARCHAR(50) NOT NULL,
  \`qr_code\` VARCHAR(500) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`restaurant_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`.trim();

  const dbConfig = `
<?php
// config/database.php - PDO Connection Settings
define('DB_HOST', 'localhost');
define('DB_USER', 'hostinger_mysql_user');
define('DB_PASS', 'hostinger_secure_password');
define('DB_NAME', 'hostinger_db_name');

try {
    $db = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Veritabanı bağlantı hatası: " . $e->getMessage());
}
?>
`.trim();

  const qrGeneratePhp = `
<?php
// qr/generate.php - High Quality QR Generator with Overlay support
// Chillerlan PHP-QRCode library loader example
require_once __DIR__ . '/../vendor/autoload.php';

use Chillerlan\\QRCode\\QRCode;
use Chillerlan\\QRCode\\QROptions;

$url = isset($_GET['url']) ? $_GET['url'] : '';
if(empty($url)) {
    die("Parametre hatası.");
}

$options = new QROptions([
    'version'      => 7,
    'outputType'   => QRCode::OUTPUT_MARKDOWN_SVG,
    'eccLevel'     => QRCode::ECC_H,
    'scale'        => 5
]);

$qrcode = new QRCode($options);
header('Content-Type: image/svg+xml');
echo $qrcode->render($url);
?>
`.trim();

  const customerMenuPhp = `
<?php
// menu/index.php - Premium Mobile-First Customer Menu View
require_once '../config/database.php';

// Detect restaurant slug from URL query
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$table_number = isset($_GET['masa']) ? trim($_GET['masa']) : '';

if (empty($slug)) {
    die("Lütfen bir restoran menüsü seçin.");
}

// Fetch Restaurant Client details
$stmt = $db->prepare("SELECT * FROM clients WHERE slug = ?");
$stmt->execute([$slug]);
$client = $stmt->fetch();

if (!$client) {
    die("Hata: Restoran bulunamadı.");
}

// Fetch Categories
$stmt = $db->prepare("SELECT * FROM categories WHERE client_id = ? ORDER BY sort_order ASC");
$stmt->execute([$client['id']]);
$categories = $stmt->fetchAll();

// Fetch Products
$stmt = $db->prepare("SELECT * FROM products WHERE client_id = ? AND status = 'active' ORDER BY category_id, id DESC");
$stmt->execute([$client['id']]);
$products = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($client['restaurant_name']); ?> - QR Menü</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
        .cover-banner { height: 220px; position: relative; background-size: cover; background-position: center; }
        .logo-wrap { width: 60px; height: 60px; border-radius: 15px; background: white; display: flex; align-items: center; justify-content: center; font-size: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .product-card { background: white; border-radius: 20px; border: 1px solid #f1f5f9; padding: 15px; display: flex; gap: 15px; margin-bottom: 12px; }
    </style>
</head>
<body>
    <div class="cover-banner" style="background-image: url('<?php echo htmlspecialchars($client['cover_image']); ?>');">
        <div style="position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.85), transparent);"></div>
        <div class="p-3" style="position: absolute; bottom: 0; display: flex; align-items: center; gap: 12px; color: white;">
            <div class="logo-wrap"><?php echo htmlspecialchars($client['logo']); ?></div>
            <div>
                <h4 class="mb-0 fw-bold"><?php echo htmlspecialchars($client['restaurant_name']); ?></h4>
                <small class="text-white-50">Yapay Zeka Destekli QR Menü</small>
            </div>
        </div>
    </div>

    <!-- Categories list -->
    <div class="p-3 bg-white border-bottom sticky-top shadow-sm overflow-auto d-flex gap-2">
        <a href="#all" class="btn btn-outline-dark btn-sm rounded-pill fw-bold">Hepsi</a>
        <?php foreach($categories as $cat): ?>
            <a href="#cat-<?php echo $cat['id']; ?>" class="btn btn-outline-dark btn-sm rounded-pill fw-bold">
                <?php echo htmlspecialchars($cat['name']); ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Products -->
    <div class="container py-4" style="max-width: 500px;">
        <?php foreach($products as $prod): ?>
            <div class="product-card">
                <img src="<?php echo htmlspecialchars($prod['image']); ?>" width="90" height="90" class="rounded-4 object-fit-cover" />
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <h6 class="fw-bold mb-1"><?php echo htmlspecialchars($prod['name']); ?></h6>
                        <span class="text-primary fw-extrabold">₺<?php echo number_format($prod['price'], 2); ?></span>
                    </div>
                    <p class="text-muted small mb-1"><?php echo htmlspecialchars($prod['description']); ?></p>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</body>
</html>
`.trim();

  const fileTreeInfo = [
    { name: 'config/database.php', desc: 'Hostinger MySQL veritabanı PDO ayar dosyası.' },
    { name: 'qr/generate.php', desc: 'Benzersiz URL alan dinamik SVG QR kod üreticisi.' },
    { name: 'menu/index.php', desc: 'Kullanıcının QR okutunca gördüğü premium Apple-style mobil web arayüzü.' },
    { name: 'schema.sql', desc: 'MySQL tablolarını otomatik oluşturmak için SQL scripti.' },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hostinger Dağıtım Kiti (SaaS PHP & MySQL)</h2>
        <p className="text-sm text-slate-500">Platformu yerel sandbox sunumundan Hostinger PHP sunucunuza yüklemek için bu kaynakları kullanın.</p>
      </div>

      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 space-y-3.5">
        <div className="flex items-start gap-3.5">
          <Database className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sky-950 text-sm">Üretim Ortamına Geçiş Talimatları</h4>
            <p className="text-xs text-sky-800 leading-relaxed">
              Bu SaaS projesi, yerel platformda yaptığınız eklemeleri gerçek veritabanında test ettikten sonra Hostinger sunucunuza 
              sadece kopyala-yapıştır ile dakikalar içinde yükleyebileceğiniz PHP + MySQL uyumlu PDO altyapısı ile hazırlanmıştır.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Copy-paste Codeblocks */}
      <div className="space-y-6">
        {/* SQL Schema Section */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-indigo-500" />
              <span className="font-bold text-slate-950 text-xs font-mono">1. MySQL Veritabanı Şeması (schema.sql)</span>
            </div>
            <button
              onClick={() => copyToClipboard(sqlSchema, 'sql')}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedFile === 'sql' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  Kodu Kopyala
                </>
              )}
            </button>
          </div>
          <div className="p-4 bg-slate-950">
            <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto max-h-56 select-all">
              {sqlSchema}
            </pre>
          </div>
        </div>

        {/* Database config Section */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-sky-500" />
              <span className="font-bold text-slate-950 text-xs font-mono">2. Veritabanı Ayar Dosyası (config/database.php)</span>
            </div>
            <button
              onClick={() => copyToClipboard(dbConfig, 'config')}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedFile === 'config' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  Kodu Kopyala
                </>
              )}
            </button>
          </div>
          <div className="p-4 bg-slate-950">
            <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto max-h-56 select-all">
              {dbConfig}
            </pre>
          </div>
        </div>

        {/* QR code php generator */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-emerald-500" />
              <span className="font-bold text-slate-950 text-xs font-mono">3. Dinamik QR Kod Üretici (qr/generate.php)</span>
            </div>
            <button
              onClick={() => copyToClipboard(qrGeneratePhp, 'qr')}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedFile === 'qr' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  Kodu Kopyala
                </>
              )}
            </button>
          </div>
          <div className="p-4 bg-slate-950">
            <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto max-h-56 select-all">
              {qrGeneratePhp}
            </pre>
          </div>
        </div>

        {/* Premium menu loader */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-rose-500" />
              <span className="font-bold text-slate-950 text-xs font-mono">4. Premium Apple-Style Menü Görünümü (menu/index.php)</span>
            </div>
            <button
              onClick={() => copyToClipboard(customerMenuPhp, 'menu')}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedFile === 'menu' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  Kodu Kopyala
                </>
              )}
            </button>
          </div>
          <div className="p-4 bg-slate-950">
            <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto max-h-56 select-all">
              {customerMenuPhp}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
