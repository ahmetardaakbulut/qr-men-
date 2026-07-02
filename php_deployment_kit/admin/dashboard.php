<?php
/**
 * Süper Admin Yönetim Paneli - Tüm CRUD Yapısı ve Premium Tasarım
 */
session_start();
require_once '../config/database.php';

// Güvenlik Kontrolü
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$database = new Database();
$db = $database->getConnection();

$message = '';
$error = '';

// Otomatik URL algılama
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
$host_url = $protocol . "://" . $_SERVER['HTTP_HOST'];
$script_dir = dirname(dirname($_SERVER['SCRIPT_NAME'])); // Örn: /php_deployment_kit veya /
$menu_base_url = rtrim($host_url . $script_dir, '/') . '/menu/index.php';

// --- TÜM POST İŞLEMLERİ ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    // 1. RESTORAN İŞLEMLERİ
    if ($action === 'add_client') {
        $name = htmlspecialchars($_POST['restaurant_name']);
        $logo = htmlspecialchars($_POST['logo'] ?? '🍔');
        $cover = htmlspecialchars($_POST['cover_image'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200');
        $phone = htmlspecialchars($_POST['phone'] ?? '');
        $address = htmlspecialchars($_POST['address'] ?? '');
        $theme = htmlspecialchars($_POST['theme'] ?? 'apple-premium');
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

        if (!empty($name)) {
            try {
                $query = "INSERT INTO clients (restaurant_name, logo, cover_image, phone, address, slug, theme) VALUES (:name, :logo, :cover, :phone, :address, :slug, :theme)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    ':name' => $name,
                    ':logo' => $logo,
                    ':cover' => $cover,
                    ':phone' => $phone,
                    ':address' => $address,
                    ':slug' => $slug,
                    ':theme' => $theme
                ]);
                $message = "Yeni restoran başarıyla eklendi!";
            } catch (Exception $e) {
                $error = "Hata: Restoran eklenemedi veya bu isimde bir restoran zaten var.";
            }
        }
    }

    elseif ($action === 'edit_client') {
        $id = intval($_POST['id']);
        $name = htmlspecialchars($_POST['restaurant_name']);
        $logo = htmlspecialchars($_POST['logo'] ?? '🍔');
        $cover = htmlspecialchars($_POST['cover_image'] ?? '');
        $phone = htmlspecialchars($_POST['phone'] ?? '');
        $address = htmlspecialchars($_POST['address'] ?? '');
        $theme = htmlspecialchars($_POST['theme'] ?? 'apple-premium');
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

        if ($id > 0 && !empty($name)) {
            try {
                $query = "UPDATE clients SET restaurant_name = :name, logo = :logo, cover_image = :cover, phone = :phone, address = :address, slug = :slug, theme = :theme WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    ':id' => $id,
                    ':name' => $name,
                    ':logo' => $logo,
                    ':cover' => $cover,
                    ':phone' => $phone,
                    ':address' => $address,
                    ':slug' => $slug,
                    ':theme' => $theme
                ]);
                $message = "Restoran bilgileri başarıyla güncellendi!";
            } catch (Exception $e) {
                $error = "Hata: Restoran güncellenirken bir hata oluştu.";
            }
        }
    }

    elseif ($action === 'delete_client') {
        $id = intval($_POST['id']);
        if ($id > 0) {
            try {
                $query = "DELETE FROM clients WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([':id' => $id]);
                $message = "Restoran ve ilişkili tüm verileri başarıyla silindi!";
            } catch (Exception $e) {
                $error = "Hata: Restoran silinemedi.";
            }
        }
    }

    // 2. KATEGORİ İŞLEMLERİ
    elseif ($action === 'add_category') {
        $client_id = intval($_POST['client_id']);
        $name = htmlspecialchars($_POST['name']);
        $sort_order = intval($_POST['sort_order'] ?? 1);

        if ($client_id > 0 && !empty($name)) {
            try {
                $query = "INSERT INTO categories (client_id, name, sort_order) VALUES (:client_id, :name, :sort_order)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    ':client_id' => $client_id,
                    ':name' => $name,
                    ':sort_order' => $sort_order
                ]);
                $message = "Kategori başarıyla eklendi!";
            } catch (Exception $e) {
                $error = "Hata: Kategori eklenemedi.";
            }
        }
    }

    elseif ($action === 'edit_category') {
        $id = intval($_POST['id']);
        $client_id = intval($_POST['client_id']);
        $name = htmlspecialchars($_POST['name']);
        $sort_order = intval($_POST['sort_order'] ?? 1);

        if ($id > 0 && $client_id > 0 && !empty($name)) {
            try {
                $query = "UPDATE categories SET client_id = :client_id, name = :name, sort_order = :sort_order WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    ':id' => $id,
                    ':client_id' => $client_id,
                    ':name' => $name,
                    ':sort_order' => $sort_order
                ]);
                $message = "Kategori başarıyla güncellendi!";
            } catch (Exception $e) {
                $error = "Hata: Kategori güncellenemedi.";
            }
        }
    }

    elseif ($action === 'delete_category') {
        $id = intval($_POST['id']);
        if ($id > 0) {
            try {
                $query = "DELETE FROM categories WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([':id' => $id]);
                $message = "Kategori ve ilişkili tüm ürünler başarıyla silindi!";
            } catch (Exception $e) {
                $error = "Hata: Kategori silinemedi.";
            }
        }
    }

    // 3. ÜRÜN İŞLEMLERİ
    elseif ($action === 'add_product') {
        $client_id = intval($_POST['client_id']);
        $category_id = intval($_POST['category_id']);
        $name = htmlspecialchars($_POST['name']);
        $desc = htmlspecialchars($_POST['description']);
        $price = floatval($_POST['price']);
        $image = htmlspecialchars($_POST['image'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600');
        $ing = htmlspecialchars($_POST['ingredients'] ?? '');
        $status = htmlspecialchars($_POST['status'] ?? 'available');

        if ($client_id > 0 && $category_id > 0 && !empty($name)) {
            try {
                $query = "INSERT INTO products (client_id, category_id, name, description, price, image, ingredients, status) VALUES (:client_id, :category_id, :name, :description, :price, :image, :ingredients, :status)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    ':client_id' => $client_id,
                    ':category_id' => $category_id,
                    ':name' => $name,
                    ':description' => $desc,
                    ':price' => $price,
                    ':image' => $image,
                    ':ingredients' => $ing,
                    ':status' => $status
                ]);
                $message = "Ürün başarıyla eklendi!";
            } catch (Exception $e) {
                $error = "Hata: Ürün eklenemedi. " . $e->getMessage();
            }
        } else {
            $error = "Hata: Lütfen geçerli bir restoran ve kategori seçin.";
        }
    }

    elseif ($action === 'edit_product') {
        $id = intval($_POST['id']);
        $client_id = intval($_POST['client_id']);
        $category_id = intval($_POST['category_id']);
        $name = htmlspecialchars($_POST['name']);
        $desc = htmlspecialchars($_POST['description']);
        $price = floatval($_POST['price']);
        $image = htmlspecialchars($_POST['image']);
        $ing = htmlspecialchars($_POST['ingredients']);
        $status = htmlspecialchars($_POST['status']);

        if ($id > 0 && $client_id > 0 && $category_id > 0 && !empty($name)) {
            try {
                $query = "UPDATE products SET client_id = :client_id, category_id = :category_id, name = :name, description = :description, price = :price, image = :image, ingredients = :ingredients, status = :status WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    ':id' => $id,
                    ':client_id' => $client_id,
                    ':category_id' => $category_id,
                    ':name' => $name,
                    ':description' => $desc,
                    ':price' => $price,
                    ':image' => $image,
                    ':ingredients' => $ing,
                    ':status' => $status
                ]);
                $message = "Ürün başarıyla güncellendi!";
            } catch (Exception $e) {
                $error = "Hata: Ürün güncellenemedi.";
            }
        }
    }

    elseif ($action === 'delete_product') {
        $id = intval($_POST['id']);
        if ($id > 0) {
            try {
                $query = "DELETE FROM products WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([':id' => $id]);
                $message = "Ürün menüden başarıyla kaldırıldı!";
            } catch (Exception $e) {
                $error = "Hata: Ürün silinemedi.";
            }
        }
    }

    // 4. MASA VE QR İŞLEMLERİ
    elseif ($action === 'add_table') {
        $restaurant_id = intval($_POST['restaurant_id']);
        $table_number = htmlspecialchars($_POST['table_number']);

        if ($restaurant_id > 0 && !empty($table_number)) {
            try {
                // Restoran slug'ını bul
                $q = "SELECT slug FROM clients WHERE id = :id LIMIT 1";
                $s = $db->prepare($q);
                $s->execute([':id' => $restaurant_id]);
                $client = $s->fetch();

                if ($client) {
                    $url = $menu_base_url . "?restaurant=" . $client['slug'] . "&masa=" . urlencode($table_number);
                    
                    $query = "INSERT INTO tables (restaurant_id, table_number, qr_code) VALUES (:rest_id, :number, :qr)";
                    $stmt = $db->prepare($query);
                    $stmt->execute([
                        ':rest_id' => $restaurant_id,
                        ':number' => $table_number,
                        ':qr' => $url
                    ]);
                    $message = "Masa ve QR kod başarıyla oluşturuldu!";
                }
            } catch (Exception $e) {
                $error = "Hata: Masa zaten mevcut veya eklenemedi.";
            }
        }
    }

    elseif ($action === 'delete_table') {
        $id = intval($_POST['id']);
        if ($id > 0) {
            try {
                $query = "DELETE FROM tables WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([':id' => $id]);
                $message = "Masa başarıyla kaldırıldı!";
            } catch (Exception $e) {
                $error = "Hata: Masa silinemedi.";
            }
        }
    }
}

// --- VERİ LİSTELEMELERİ ---
$clients = $db->query("SELECT * FROM clients ORDER BY id DESC")->fetchAll();
$categories = $db->query("SELECT cat.*, c.restaurant_name FROM categories cat JOIN clients c ON cat.client_id = c.id ORDER BY cat.sort_order ASC, cat.id DESC")->fetchAll();
$products = $db->query("SELECT p.*, c.restaurant_name, cat.name as category_name FROM products p JOIN clients c ON p.client_id = c.id JOIN categories cat ON p.category_id = cat.id ORDER BY p.id DESC")->fetchAll();
$tables = $db->query("SELECT t.*, c.restaurant_name, c.slug FROM tables t JOIN clients c ON t.restaurant_id = c.id ORDER BY t.id DESC")->fetchAll();

// İstatistikler
$total_restaurants = count($clients);
$total_categories = count($categories);
$total_products = count($products);
$total_tables = count($tables);

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Süper Admin Yönetim Paneli - CLOUD9 MENU AI</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col md:flex-row">

    <!-- DESKTOP LEFT SIDEBAR -->
    <aside class="w-64 bg-slate-900 text-slate-100 hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800">
        <div class="p-6">
            <!-- Logo -->
            <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg">Cloud9</div>
                <div>
                    <h1 class="text-xs font-black tracking-wide text-white">CLOUD9 MENU AI</h1>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">SaaS Platform</p>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="space-y-1.5">
                <button onclick="switchTab('tab-overview')" id="sidebar-tab-overview" class="sidebar-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                    <span class="text-base">📊</span> Genel Bakış
                </button>
                <button onclick="switchTab('tab-clients')" id="sidebar-tab-clients" class="sidebar-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-slate-800/60 hover:text-slate-100">
                    <span class="text-base">🏢</span> Restoranlar
                </button>
                <button onclick="switchTab('tab-categories')" id="sidebar-tab-categories" class="sidebar-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-slate-800/60 hover:text-slate-100">
                    <span class="text-base">📂</span> Kategoriler
                </button>
                <button onclick="switchTab('tab-products')" id="sidebar-tab-products" class="sidebar-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-slate-800/60 hover:text-slate-100">
                    <span class="text-base">🍔</span> Ürünler
                </button>
                <button onclick="switchTab('tab-tables')" id="sidebar-tab-tables" class="sidebar-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-slate-800/60 hover:text-slate-100">
                    <span class="text-base">📋</span> Masalar & QR
                </button>
            </nav>
        </div>

        <!-- Profil & Çıkış -->
        <div class="p-6 border-t border-slate-800 bg-slate-950/40 space-y-4">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
                    <?php echo strtoupper(substr($_SESSION['user_name'], 0, 1)); ?>
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="text-xs font-bold truncate text-slate-200"><?php echo htmlspecialchars($_SESSION['user_name']); ?></h4>
                    <p class="text-[9px] text-indigo-400 font-mono uppercase tracking-wider">Süper Admin</p>
                </div>
            </div>
            <a href="logout.php" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950/40 hover:bg-rose-950/20 text-[11px] font-bold transition-all duration-200">
                🚪 Güvenli Çıkış
            </a>
        </div>
    </aside>

    <!-- RIGHT CONTAINER FOR MAIN CONTENT -->
    <div class="flex-1 flex flex-col min-h-screen min-w-0">
        
        <!-- MOBILE HEADER -->
        <header class="bg-slate-900 text-white px-4 py-3.5 flex md:hidden items-center justify-between shadow-md shrink-0">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-md">Cloud9</div>
                <h1 class="text-xs font-black tracking-wide text-white">CLOUD9 MENU AI</h1>
            </div>
            <div class="flex items-center gap-2">
                <a href="logout.php" class="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all">Çıkış</a>
            </div>
        </header>

        <!-- MOBILE SUB NAVIGATION BAR -->
        <div class="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button onclick="switchTab('tab-overview')" id="mobile-tab-overview" class="mobile-btn px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all bg-indigo-600 text-white shadow">📊 Genel Bakış</button>
            <button onclick="switchTab('tab-clients')" id="mobile-tab-clients" class="mobile-btn px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all text-slate-600 hover:bg-slate-100">🏢 Restoranlar</button>
            <button onclick="switchTab('tab-categories')" id="mobile-tab-categories" class="mobile-btn px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all text-slate-600 hover:bg-slate-100">📂 Kategoriler</button>
            <button onclick="switchTab('tab-products')" id="mobile-tab-products" class="mobile-btn px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all text-slate-600 hover:bg-slate-100">🍔 Ürünler</button>
            <button onclick="switchTab('tab-tables')" id="mobile-tab-tables" class="mobile-btn px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all text-slate-600 hover:bg-slate-100">📋 Masalar & QR</button>
        </div>

        <!-- MAIN SCROLLABLE WRAPPER -->
        <main class="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
            
            <!-- Welcome Info / Breadcrumb bar on desktop -->
            <div class="hidden md:flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                    <h2 class="text-xl font-black text-slate-900 tracking-tight">Süper Yönetici Kontrol Paneli</h2>
                    <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Aktif Domain: <strong class="text-indigo-600 font-mono"><?php echo htmlspecialchars($_SERVER['HTTP_HOST']); ?></strong></p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 font-bold">Durum:</span>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] font-extrabold">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        CANLI VE ENTEGRE
                    </span>
                </div>
            </div>

            <?php if (!empty($message)): ?>
                <div class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-4 rounded-2xl text-xs font-bold transition-all">
                    🎉 <?php echo $message; ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($error)): ?>
                <div class="bg-rose-500/10 border border-rose-500/20 text-rose-700 p-4 rounded-2xl text-xs font-bold transition-all">
                    ⚠️ <?php echo $error; ?>
                </div>
            <?php endif; ?>

            <!-- ======================= 0. GENEL BAKIŞ SEKMESİ ======================= -->
            <div id="tab-overview" class="tab-content space-y-6 animate-fade-in">
                <!-- Platform Info Banner -->
                <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden shadow-xl shadow-indigo-950/20">
                    <div class="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div class="absolute left-1/3 bottom-0 -mb-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl"></div>
                    
                    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div class="space-y-3 max-w-2xl">
                            <div class="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                ✨ SaaS Sürümü v1.0 • Hostinger Entegrasyonu Aktif
                            </div>
                            <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                Cloud9 Menu AI platformuna hoş geldiniz!
                            </h2>
                            <p class="text-slate-300 text-xs md:text-sm leading-relaxed">
                                Bu panelden restoran müşterilerinizi kaydedebilir, kategorilerini ve ürünlerini yönetebilir, 
                                hem genel hem de masa bazlı otomatik QR kodlar üretebilirsiniz. Hazırladığınız her menü 
                                <strong>Yapay Zeka (AI) Asistanı</strong> destekli ve Apple Premium mobil tasarımlıdır!
                            </p>
                        </div>
                        <div class="flex gap-3 shrink-0">
                            <button onclick="switchTab('tab-clients')" class="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 flex items-center gap-2 shrink-0">
                                <span>+</span> Yeni Müşteri Ekle
                            </button>
                        </div>
                    </div>
                </div>

                <!-- HIZLI İSTATİSTİK KARTLARI -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl font-bold shrink-0">🏢</div>
                        <div>
                            <p class="text-[10px] font-extrabold text-slate-400 uppercase">Restoranlar</p>
                            <h3 class="text-xl font-black text-slate-800"><?php echo $total_restaurants; ?></h3>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-xl font-bold shrink-0">📂</div>
                        <div>
                            <p class="text-[10px] font-extrabold text-slate-400 uppercase">Kategoriler</p>
                            <h3 class="text-xl font-black text-slate-800"><?php echo $total_categories; ?></h3>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl font-bold shrink-0">🍔</div>
                        <div>
                            <p class="text-[10px] font-extrabold text-slate-400 uppercase">Ürünler</p>
                            <h3 class="text-xl font-black text-slate-800"><?php echo $total_products; ?></h3>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 text-xl font-bold shrink-0">📋</div>
                        <div>
                            <p class="text-[10px] font-extrabold text-slate-400 uppercase">Masalar & QR</p>
                            <h3 class="text-xl font-black text-slate-800"><?php echo $total_tables; ?></h3>
                        </div>
                    </div>
                </div>

                <!-- ALT BİLGİLENDİRME PANELİ -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Hostinger Box -->
                    <div class="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                        <div class="space-y-3">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">ℹ️</span>
                                <h4 class="font-extrabold text-indigo-950 text-sm">Hostinger Veritabanı ve Sunucu Durumu</h4>
                            </div>
                            <p class="text-xs text-indigo-800 leading-relaxed">
                                SaaS platformunuz Hostinger MySQL ve PHP altyapısıyla entegre şekilde sorunsuz çalışıyor. 
                                Veritabanı bağlantısı başarılı ve tüm sorgular PDO sürücüsü üzerinden güvenle optimize ediliyor.
                            </p>
                        </div>
                        <div class="pt-2">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                SUNUCU AKTİF • BAĞLANTI BAŞARILI
                            </span>
                        </div>
                    </div>

                    <!-- Son Yapay Zeka ve QR Aktiviteleri -->
                    <div class="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4">
                        <h4 class="font-bold text-slate-900 text-sm">Son Yapay Zeka & QR Aktiviteleri</h4>
                        <div class="space-y-3.5">
                            <div class="flex items-center justify-between text-xs py-2.5 border-b border-slate-100">
                                <div class="flex items-center gap-3">
                                    <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                    <div>
                                        <p class="font-bold text-slate-800">Canlı QR Menü Oluşturuldu</p>
                                        <p class="text-[10px] text-slate-400">Veritabanı kayıtları başarıyla tetiklendi</p>
                                    </div>
                                </div>
                                <span class="text-slate-400 font-mono text-[10px]">Az Önce</span>
                            </div>
                            <div class="flex items-center justify-between text-xs py-2.5 border-b border-slate-100">
                                <div class="flex items-center gap-3">
                                    <span class="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                                    <div>
                                        <p class="font-bold text-slate-800">Yapay Zeka Menü Motoru Hazır</p>
                                        <p class="text-[10px] text-slate-400">Apple Premium tema şablonları yüklendi</p>
                                    </div>
                                </div>
                                <span class="text-slate-400 font-mono text-[10px]">1 dk önce</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ======================= 1. RESTORANLAR SEKMESİ ======================= -->
            <div id="tab-clients" class="tab-content hidden grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Sol: Ekleme Formu -->
                <div class="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 max-h-fit">
                    <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">🏢 Yeni Restoran Müşterisi</h3>
                    <form method="POST" action="" class="space-y-4">
                        <input type="hidden" name="action" value="add_client">
                        <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restoran Adı:</label>
                        <input type="text" name="restaurant_name" required placeholder="Karamelize Fast Food" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo Emoji:</label>
                            <input type="text" name="logo" value="🍔" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-center text-slate-800">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Görsel Tema:</label>
                            <select name="theme" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                                <option value="apple-premium">Apple Premium (Aydınlık)</option>
                                <option value="emerald-bistro">Emerald Bistro (Nostaljik)</option>
                                <option value="dark-obsidian">Dark Obsidian (Koyu Altın)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kapak Fotoğrafı URL:</label>
                        <input type="text" name="cover_image" value="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Telefon:</label>
                        <input type="text" name="phone" placeholder="+90 500 000 0000" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Adres:</label>
                        <textarea name="address" rows="2" placeholder="Restoran adresi..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md">Restoranı Kaydet</button>
                </form>
            </div>

            <!-- Sağ: Liste -->
            <div class="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 class="font-extrabold text-slate-900 text-sm">📋 Kayıtlı Restoranlar</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-600">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 uppercase font-extrabold text-[10px] tracking-wide">
                                <th class="p-3">Restoran</th>
                                <th class="p-3">Tema</th>
                                <th class="p-3">Telefon & Adres</th>
                                <th class="p-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <?php foreach ($clients as $c): ?>
                                <tr>
                                    <td class="p-3 font-extrabold text-slate-800 flex items-center gap-2">
                                        <span class="text-2xl shrink-0"><?php echo $c['logo']; ?></span>
                                        <div>
                                            <p><?php echo htmlspecialchars($c['restaurant_name']); ?></p>
                                            <a href="../menu/index.php?restaurant=<?php echo $c['slug']; ?>" target="_blank" class="text-[10px] font-bold text-indigo-500 hover:underline">Canlı Menüyü Aç →</a>
                                        </div>
                                    </td>
                                    <td class="p-3">
                                        <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 text-[10px] font-bold uppercase">
                                            <?php echo $c['theme']; ?>
                                        </span>
                                    </td>
                                    <td class="p-3">
                                        <p class="font-semibold text-slate-700 text-[11px]"><?php echo htmlspecialchars($c['phone'] ?: 'Girilmedi'); ?></p>
                                        <p class="text-slate-400 text-[10px] max-w-xs truncate"><?php echo htmlspecialchars($c['address'] ?: 'Girilmedi'); ?></p>
                                    </td>
                                    <td class="p-3 text-right space-x-1">
                                        <button onclick="openEditClient(<?php echo htmlspecialchars(json_encode($c)); ?>)" class="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg">Düzenle</button>
                                        <form method="POST" action="" class="inline" onsubmit="return confirm('Bu restoranı silerseniz tüm kategorileri, ürünleri ve masaları kalıcı olarak silinecektir! Emin misiniz?');">
                                            <input type="hidden" name="action" value="delete_client">
                                            <input type="hidden" name="id" value="<?php echo $c['id']; ?>">
                                            <button type="submit" class="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg">Sil</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ======================= 2. KATEGORİLER SEKMESİ ======================= -->
        <div id="tab-categories" class="tab-content hidden grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Sol: Ekleme Formu -->
            <div class="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 max-h-fit">
                <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">📂 Yeni Kategori Oluştur</h3>
                <form method="POST" action="" class="space-y-4">
                    <input type="hidden" name="action" value="add_category">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restoran Seçin:</label>
                        <select name="client_id" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                            <?php foreach ($clients as $c): ?>
                                <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['restaurant_name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori Adı:</label>
                        <input type="text" name="name" required placeholder="Örn: Ara Sıcaklar, İçecekler" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sıralama Önceliği (Sayı):</label>
                        <input type="number" name="sort_order" value="1" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md">Kategoriyi Kaydet</button>
                </form>
            </div>

            <!-- Sağ: Liste -->
            <div class="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 class="font-extrabold text-slate-900 text-sm">📋 Mevcut Kategoriler</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-600">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 uppercase font-extrabold text-[10px] tracking-wide">
                                <th class="p-3">Kategori</th>
                                <th class="p-3">Restoran</th>
                                <th class="p-3">Sıralama Önceliği</th>
                                <th class="p-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <?php foreach ($categories as $cat): ?>
                                <tr>
                                    <td class="p-3 font-extrabold text-slate-850"><?php echo htmlspecialchars($cat['name']); ?></td>
                                    <td class="p-3 font-semibold text-slate-700"><?php echo htmlspecialchars($cat['restaurant_name']); ?></td>
                                    <td class="p-3 text-slate-400 font-bold"><?php echo $cat['sort_order']; ?></td>
                                    <td class="p-3 text-right space-x-1">
                                        <button onclick="openEditCategory(<?php echo htmlspecialchars(json_encode($cat)); ?>)" class="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg">Düzenle</button>
                                        <form method="POST" action="" class="inline" onsubmit="return confirm('Bu kategoriyi silerseniz içerisindeki tüm ürünler silinecektir! Emin misiniz?');">
                                            <input type="hidden" name="action" value="delete_category">
                                            <input type="hidden" name="id" value="<?php echo $cat['id']; ?>">
                                            <button type="submit" class="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg">Sil</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ======================= 3. ÜRÜNLER SEKMESİ ======================= -->
        <div id="tab-products" class="tab-content hidden grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Sol: Ekleme Formu -->
            <div class="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 max-h-fit">
                <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">🍔 Yeni Ürün Ekle</h3>
                <form method="POST" action="" class="space-y-4">
                    <input type="hidden" name="action" value="add_product">
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restoran:</label>
                            <select name="client_id" id="prod-client-select" onchange="filterCategoryDropdown('prod-client-select', 'prod-category-select')" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                                <option value="">Seçiniz...</option>
                                <?php foreach ($clients as $c): ?>
                                    <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['restaurant_name']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori:</label>
                            <select name="category_id" id="prod-category-select" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                                <option value="">Önce Restoran Seçin</option>
                                <?php foreach ($categories as $cat): ?>
                                    <option value="<?php echo $cat['id']; ?>" data-client-id="<?php echo $cat['client_id']; ?>"><?php echo htmlspecialchars($cat['name']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ürün Adı:</label>
                        <input type="text" name="name" required placeholder="Cheddar Karamelize Burger" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fiyat (TL):</label>
                            <input type="number" step="0.01" name="price" required placeholder="240.00" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durum:</label>
                            <select name="status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                                <option value="available">Aktif / Satışta</option>
                                <option value="unavailable">Tükendi / Pasif</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ürün Açıklaması:</label>
                        <textarea name="description" rows="2" placeholder="150g ev yapımı burger köftesi..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"></textarea>
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">İçindekiler / Malzemeler (Opsiyonel):</label>
                        <input type="text" name="ingredients" placeholder="Köfte, Marul, Domates, Sos" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ürün Görsel URL:</label>
                        <input type="text" name="image" value="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800">
                    </div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md">Ürünü Kaydet</button>
                </form>
            </div>

            <!-- Sağ: Liste -->
            <div class="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 class="font-extrabold text-slate-900 text-sm">📋 Menü Ürünleri</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-600">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 uppercase font-extrabold text-[10px] tracking-wide">
                                <th class="p-3">Görsel & Ürün</th>
                                <th class="p-3">Restoran</th>
                                <th class="p-3">Kategori</th>
                                <th class="p-3">Fiyat</th>
                                <th class="p-3">Durum</th>
                                <th class="p-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <?php foreach ($products as $p): ?>
                                <tr>
                                    <td class="p-3 flex items-center gap-3">
                                        <img src="<?php echo htmlspecialchars($p['image'] ?: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150'); ?>" alt="" class="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100">
                                        <div class="min-w-0">
                                            <p class="font-extrabold text-slate-850 truncate"><?php echo htmlspecialchars($p['name']); ?></p>
                                            <p class="text-[9px] text-slate-400 truncate max-w-xs"><?php echo htmlspecialchars($p['description']); ?></p>
                                        </div>
                                    </td>
                                    <td class="p-3 font-semibold text-slate-700 text-[11px]"><?php echo htmlspecialchars($p['restaurant_name']); ?></td>
                                    <td class="p-3 font-semibold text-slate-700 text-[11px]"><?php echo htmlspecialchars($p['category_name']); ?></td>
                                    <td class="p-3 font-black text-slate-850"><?php echo number_format($p['price'], 2); ?> TL</td>
                                    <td class="p-3">
                                        <?php if ($p['status'] === 'available'): ?>
                                            <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-bold">Satışta</span>
                                        <?php else: ?>
                                            <span class="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[9px] font-bold">Pasif</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="p-3 text-right space-x-1 whitespace-nowrap">
                                        <button onclick="openEditProduct(<?php echo htmlspecialchars(json_encode($p)); ?>)" class="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] px-2 py-1 rounded-lg">Düzenle</button>
                                        <form method="POST" action="" class="inline" onsubmit="return confirm('Bu ürünü menüden kaldırmak istediğinize emin misiniz?');">
                                            <input type="hidden" name="action" value="delete_product">
                                            <input type="hidden" name="id" value="<?php echo $p['id']; ?>">
                                            <button type="submit" class="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-2 py-1 rounded-lg">Sil</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ======================= 4. MASALAR VE QR SEKMESİ ======================= -->
        <div id="tab-tables" class="tab-content hidden grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Sol: Ekleme Formu -->
            <div class="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 max-h-fit">
                <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">📋 Yeni Masa ve QR Ekle</h3>
                <form method="POST" action="" class="space-y-4">
                    <input type="hidden" name="action" value="add_table">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restoran:</label>
                        <select name="restaurant_id" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                            <?php foreach ($clients as $c): ?>
                                <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['restaurant_name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Masa Adı / No:</label>
                        <input type="text" name="table_number" required placeholder="Örn: Masa 1, T-5" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md">Masa & QR Üret</button>
                </form>
            </div>

            <!-- Sağ: Liste ve QR Kartları -->
            <div class="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 class="font-extrabold text-slate-900 text-sm">📋 Aktif Masalar ve QR Kodlar</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <?php if (empty($tables)): ?>
                        <p class="text-xs font-bold text-slate-400 col-span-2 py-10 text-center">Oluşturulmuş masa bulunmuyor.</p>
                    <?php else: ?>
                        <?php foreach ($tables as $t): ?>
                            <?php 
                                $qr_img_url = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($t['qr_code']);
                            ?>
                            <div class="border border-slate-100 rounded-2xl p-4 flex gap-4 items-center bg-slate-50/50 shadow-sm">
                                <div class="w-24 h-24 bg-white border border-slate-200 rounded-xl p-1 shrink-0 flex items-center justify-center relative group">
                                    <img src="<?php echo $qr_img_url; ?>" alt="QR" class="w-full h-full">
                                    <a href="<?php echo $qr_img_url; ?>" download="Masa-<?php echo $t['table_number']; ?>-QR.png" target="_blank" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-extrabold rounded-xl">İndir / Yazdır</a>
                                </div>
                                <div class="min-w-0 flex-1 space-y-1">
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-black text-slate-800 text-sm">Masa <?php echo htmlspecialchars($t['table_number']); ?></h4>
                                        <form method="POST" action="" class="inline" onsubmit="return confirm('Bu masayı silmek istediğinize emin misiniz?');">
                                            <input type="hidden" name="action" value="delete_table">
                                            <input type="hidden" name="id" value="<?php echo $t['id']; ?>">
                                            <button type="submit" class="text-rose-500 hover:text-rose-600 font-extrabold text-[10px]">Kaldır</button>
                                        </form>
                                    </div>
                                    <p class="text-[10px] text-indigo-600 font-semibold truncate"><?php echo htmlspecialchars($t['restaurant_name']); ?></p>
                                    <p class="text-[9px] text-slate-400 font-mono select-all truncate bg-slate-100 p-1 rounded"><?php echo htmlspecialchars($t['qr_code']); ?></p>
                                    <div class="flex gap-2 pt-1">
                                        <a href="<?php echo $t['qr_code']; ?>" target="_blank" class="text-[9px] bg-indigo-50 text-indigo-600 font-extrabold px-2 py-1 rounded-lg border border-indigo-200">Menüyü Gör</a>
                                        <a href="<?php echo $qr_img_url; ?>" target="_blank" class="text-[9px] bg-slate-100 text-slate-700 font-extrabold px-2 py-1 rounded-lg border border-slate-200">QR Kodunu Aç</a>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

    </main>
</div>

    <!-- ======================= MODALLAR (DÜZENLEME İŞLEMLERİ) ======================= -->

    <!-- 1. Restoran Düzenleme Modalı -->
    <div id="modal-edit-client" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 class="font-extrabold text-slate-900 text-sm">🏢 Restoran Düzenle</h3>
                <button onclick="closeModal('modal-edit-client')" class="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <form method="POST" action="" class="space-y-4">
                <input type="hidden" name="action" value="edit_client">
                <input type="hidden" name="id" id="edit-client-id">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restoran Adı:</label>
                    <input type="text" name="restaurant_name" id="edit-client-name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo Emoji:</label>
                        <input type="text" name="logo" id="edit-client-logo" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-center text-slate-800">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Görsel Tema:</label>
                        <select name="theme" id="edit-client-theme" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                            <option value="apple-premium">Apple Premium (Aydınlık)</option>
                            <option value="emerald-bistro">Emerald Bistro (Nostaljik)</option>
                            <option value="dark-obsidian">Dark Obsidian (Koyu Altın)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kapak Fotoğrafı URL:</label>
                    <input type="text" name="cover_image" id="edit-client-cover" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Telefon:</label>
                    <input type="text" name="phone" id="edit-client-phone" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Adres:</label>
                    <textarea name="address" id="edit-client-address" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"></textarea>
                </div>
                <div class="flex gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onclick="closeModal('modal-edit-client')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl">İptal</button>
                    <button type="submit" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl">Değişiklikleri Kaydet</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2. Kategori Düzenleme Modalı -->
    <div id="modal-edit-category" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 class="font-extrabold text-slate-900 text-sm">📂 Kategori Düzenle</h3>
                <button onclick="closeModal('modal-edit-category')" class="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <form method="POST" action="">
                <input type="hidden" name="action" value="edit_category">
                <input type="hidden" name="id" id="edit-cat-id">
                <div class="space-y-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restoran Seçin:</label>
                        <select name="client_id" id="edit-cat-client" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                            <?php foreach ($clients as $c): ?>
                                <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['restaurant_name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori Adı:</label>
                        <input type="text" name="name" id="edit-cat-name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sıralama Önceliği (Sayı):</label>
                        <input type="number" name="sort_order" id="edit-cat-sort" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                    </div>
                    <div class="flex gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onclick="closeModal('modal-edit-category')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl">İptal</button>
                        <button type="submit" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl">Güncelle</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. Ürün Düzenleme Modalı -->
    <div id="modal-edit-product" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 class="font-extrabold text-slate-900 text-sm">🍔 Ürünü Düzenle</h3>
                <button onclick="closeModal('modal-edit-product')" class="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <form method="POST" action="" class="space-y-4">
                <input type="hidden" name="action" value="edit_product">
                <input type="hidden" name="id" id="edit-prod-id">
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restoran:</label>
                        <select name="client_id" id="edit-prod-client" onchange="filterCategoryDropdown('edit-prod-client', 'edit-prod-category')" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                            <?php foreach ($clients as $c): ?>
                                <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['restaurant_name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori:</label>
                        <select name="category_id" id="edit-prod-category" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?php echo $cat['id']; ?>" data-client-id="<?php echo $cat['client_id']; ?>"><?php echo htmlspecialchars($cat['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ürün Adı:</label>
                    <input type="text" name="name" id="edit-prod-name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fiyat (TL):</label>
                        <input type="number" step="0.01" name="price" id="edit-prod-price" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durum:</label>
                        <select name="status" id="edit-prod-status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                            <option value="available">Aktif / Satışta</option>
                            <option value="unavailable">Pasif / Tükendi</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Açıklama:</label>
                    <textarea name="description" id="edit-prod-desc" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"></textarea>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Malzemeler / İçindekiler:</label>
                    <input type="text" name="ingredients" id="edit-prod-ing" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ürün Görsel URL:</label>
                    <input type="text" name="image" id="edit-prod-image" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800">
                </div>

                <div class="flex gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onclick="closeModal('modal-edit-product')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl">İptal</button>
                    <button type="submit" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl">Kaydet</button>
                </div>
            </form>
        </div>
    </div>


    <!-- ======================= YARDIMCI SCRIPTLER ======================= -->
    <script>
        // Sekme Geçişi
        function switchTab(tabId) {
            // Tüm içerikleri gizle
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            // Seçilen içeriği göster
            document.getElementById(tabId).classList.remove('hidden');

            // Sol sidebar butonlarını güncelle
            document.querySelectorAll('.sidebar-btn').forEach(btn => {
                btn.className = 'sidebar-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-slate-800/60 hover:text-slate-100';
            });
            const activeSidebarBtn = document.getElementById('sidebar-' + tabId);
            if (activeSidebarBtn) {
                activeSidebarBtn.className = 'sidebar-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20';
            }

            // Mobil üst butonlarını güncelle
            document.querySelectorAll('.mobile-btn').forEach(btn => {
                btn.className = 'mobile-btn px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all text-slate-600 hover:bg-slate-100';
            });
            const activeMobileBtn = document.getElementById('mobile-' + tabId);
            if (activeMobileBtn) {
                activeMobileBtn.className = 'mobile-btn px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all bg-indigo-600 text-white shadow';
            }
        }

        // Kategori Seçiciyi Filtreleme
        function filterCategoryDropdown(restaurantSelectId, categorySelectId, selectedCatVal = "") {
            const restSelect = document.getElementById(restaurantSelectId);
            const catSelect = document.getElementById(categorySelectId);
            const restId = restSelect.value;

            // Kategori seçeneklerini temizle / filtrele
            let optionsToShow = 0;
            const options = catSelect.querySelectorAll('option');
            
            options.forEach(opt => {
                const optClientId = opt.getAttribute('data-client-id');
                if (!optClientId) {
                    // "Lütfen önce seçin" seçeneği
                    opt.style.display = restId ? 'none' : 'block';
                } else if (optClientId == restId) {
                    opt.style.display = 'block';
                    optionsToShow++;
                } else {
                    opt.style.display = 'none';
                }
            });

            // Eğer uygun seçenek varsa ilkini seç, yoksa sıfırla
            if (optionsToShow > 0) {
                // Önceden seçilmiş bir değer varsa onu ayarla, yoksa ilk görünür olanı seç
                if (selectedCatVal) {
                    catSelect.value = selectedCatVal;
                } else {
                    for (let opt of options) {
                        if (opt.style.display === 'block') {
                            catSelect.value = opt.value;
                            break;
                        }
                    }
                }
            } else {
                catSelect.innerHTML = '<option value="">Bu restorana ait kategori bulunamadı!</option>';
            }
        }

        // Modalları Açma / Kapatma
        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        function openEditClient(client) {
            document.getElementById('edit-client-id').value = client.id;
            document.getElementById('edit-client-name').value = client.restaurant_name;
            document.getElementById('edit-client-logo').value = client.logo;
            document.getElementById('edit-client-theme').value = client.theme;
            document.getElementById('edit-client-cover').value = client.cover_image;
            document.getElementById('edit-client-phone').value = client.phone;
            document.getElementById('edit-client-address').value = client.address;
            document.getElementById('modal-edit-client').classList.remove('hidden');
        }

        function openEditCategory(cat) {
            document.getElementById('edit-cat-id').value = cat.id;
            document.getElementById('edit-cat-client').value = cat.client_id;
            document.getElementById('edit-cat-name').value = cat.name;
            document.getElementById('edit-cat-sort').value = cat.sort_order;
            document.getElementById('modal-edit-category').classList.remove('hidden');
        }

        function openEditProduct(prod) {
            document.getElementById('edit-prod-id').value = prod.id;
            document.getElementById('edit-prod-client').value = prod.client_id;
            
            // Önce kategorileri bu restorana göre filtrele, sonra üründeki mevcut kategori değerini seç
            filterCategoryDropdown('edit-prod-client', 'edit-prod-category', prod.category_id);
            
            document.getElementById('edit-prod-name').value = prod.name;
            document.getElementById('edit-prod-price').value = prod.price;
            document.getElementById('edit-prod-status').value = prod.status;
            document.getElementById('edit-prod-desc').value = prod.description;
            document.getElementById('edit-prod-ing').value = prod.ingredients;
            document.getElementById('edit-prod-image').value = prod.image;
            
            document.getElementById('modal-edit-product').classList.remove('hidden');
        }

        // Sayfa yüklendiğinde varsayılan filtreleme
        window.addEventListener('load', () => {
            filterCategoryDropdown('prod-client-select', 'prod-category-select');
        });
    </script>

</body>
</html>
