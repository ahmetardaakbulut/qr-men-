<?php
/**
 * Canlı Müşteri QR Menü Arayüzü (Premium, Mobil Öncelikli & 3 Farklı Tema)
 */
require_once '../config/database.php';

$slug = isset($_GET['restaurant']) ? htmlspecialchars($_GET['restaurant']) : '';
$masa = isset($_GET['masa']) ? htmlspecialchars($_GET['masa']) : 'Masa 1';

if (empty($slug)) {
    // Varsayılan olarak ilk restoranı göster
    $slug = 'karamelize-fast-food';
}

$database = new Database();
$db = $database->getConnection();

// Restoran bilgilerini çek
$query = "SELECT * FROM clients WHERE slug = :slug LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute([':slug' => $slug]);
$client = $stmt->fetch();

if (!$client) {
    die("<div style='font-family:sans-serif; text-align:center; padding:50px; color:#ef4444;'><h2>Hata: Restoran Bulunamadı!</h2><p>Lütfen QR kodunu tekrar okutun veya doğru adresi girin.</p></div>");
}

$client_id = $client['id'];

// Kategorileri çek
$cat_query = "SELECT * FROM categories WHERE client_id = :client_id ORDER BY sort_order ASC";
$cat_stmt = $db->prepare($cat_query);
$cat_stmt->execute([':client_id' => $client_id]);
$categories = $cat_stmt->fetchAll();

// Ürünleri çek (Sadece aktif olanları)
$prod_query = "SELECT p.*, cat.name as category_name FROM products p JOIN categories cat ON p.category_id = cat.id WHERE p.client_id = :client_id AND p.status = 'available' ORDER BY cat.sort_order ASC, p.id DESC";
$prod_stmt = $db->prepare($prod_query);
$prod_stmt->execute([':client_id' => $client_id]);
$products = $prod_stmt->fetchAll();

// Tema Ayarları ve Tasarım Sınıfları
$theme = $client['theme'] ?? 'apple-premium';

// Varsayılan Tema Sınıfları (Apple Premium / Light)
$bg_class = "bg-slate-50 text-slate-900";
$card_class = "bg-white border-slate-100 text-slate-900";
$accent_color = "text-indigo-600";
$accent_bg = "bg-indigo-600 text-white";
$badge_class = "bg-indigo-50 border-indigo-100 text-indigo-700";
$search_bg = "bg-slate-100 text-slate-800 placeholder-slate-400";
$category_inactive_btn = "bg-slate-200/70 text-slate-700";
$category_active_btn = "bg-slate-900 text-white shadow";

if ($theme === 'emerald-bistro') {
    $bg_class = "bg-[#fdfbf7] text-[#1e293b]";
    $card_class = "bg-white border-[#e2e8f0] text-[#1e293b]";
    $accent_color = "text-[#15803d]";
    $accent_bg = "bg-[#15803d] text-white";
    $badge_class = "bg-[#f0fdf4] border-[#dcfce7] text-[#16a34a]";
    $search_bg = "bg-stone-100 text-stone-800 placeholder-stone-400";
    $category_inactive_btn = "bg-[#f1ebe1] text-[#78350f]";
    $category_active_btn = "bg-[#15803d] text-white shadow";
} elseif ($theme === 'dark-obsidian') {
    $bg_class = "bg-[#121212] text-neutral-100";
    $card_class = "bg-[#1c1c1c] border-neutral-800 text-neutral-100";
    $accent_color = "text-[#f59e0b]"; // Gold / Kehribar
    $accent_bg = "bg-[#f59e0b] text-neutral-950 font-black";
    $badge_class = "bg-amber-950/40 border-amber-900/30 text-amber-400";
    $search_bg = "bg-neutral-900 text-neutral-200 border-neutral-800 placeholder-neutral-500 border";
    $category_inactive_btn = "bg-neutral-800 text-neutral-400";
    $category_active_btn = "bg-[#f59e0b] text-neutral-950 shadow-md font-bold";
}

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title><?php echo htmlspecialchars($client['restaurant_name']); ?> - Canlı QR Menü</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="<?php echo $bg_class; ?> min-h-screen pb-32 transition-colors duration-300">

    <!-- Üst Görsel ve Logo Alanı -->
    <div class="relative h-56 bg-slate-900 overflow-hidden">
        <img 
            src="<?php echo htmlspecialchars($client['cover_image'] ?: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200'); ?>" 
            alt="Cover" 
            class="w-full h-full object-cover opacity-70"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        <div class="absolute bottom-4 left-4 right-4 flex items-end gap-3 z-10">
            <div class="w-16 h-16 rounded-2xl bg-white border-2 border-white/20 flex items-center justify-center text-4xl shadow-lg shrink-0 select-none animate-bounce-short">
                <?php echo $client['logo']; ?>
            </div>
            <div class="text-white">
                <h1 class="text-xl font-black leading-tight tracking-tight"><?php echo htmlspecialchars($client['restaurant_name']); ?></h1>
                <?php if (!empty($client['phone'])): ?>
                    <p class="text-[10px] font-bold opacity-80 mt-0.5">📞 <?php echo htmlspecialchars($client['phone']); ?></p>
                <?php endif; ?>
                <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold uppercase tracking-wide">📍 <?php echo htmlspecialchars($masa); ?></span>
            </div>
        </div>
    </div>

    <!-- Aktif Masa Bilgilendirme Çubuğu -->
    <div class="px-4 py-2.5 <?php echo $accent_bg; ?> text-[10px] font-black tracking-wider text-center uppercase shadow-sm flex items-center justify-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
        SİPARİŞ VE SEPET ALTYAPISI AKTİF • HOŞ GELDİNİZ!
    </div>

    <!-- Arama Çubuğu -->
    <div class="px-4 mt-5">
        <div class="relative">
            <input 
                type="text" 
                id="search-input"
                oninput="handleSearch()"
                placeholder="Yemek, tatlı veya içecek ara..." 
                class="w-full pl-4 pr-10 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 <?php echo $search_bg; ?>"
            >
            <span class="absolute right-4 top-3.5 text-xs opacity-50">🔍</span>
        </div>
    </div>

    <!-- Kategori Slider (Yatay Kaydırma) -->
    <div class="px-4 mt-5">
        <div class="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button 
                onclick="filterCategory('all')" 
                id="btn-cat-all"
                class="cat-btn px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all <?php echo $category_active_btn; ?>"
            >
                HEPSİ
            </button>
            <?php foreach ($categories as $cat): ?>
                <button 
                    onclick="filterCategory(<?php echo $cat['id']; ?>)" 
                    id="btn-cat-<?php echo $cat['id']; ?>"
                    class="cat-btn px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all <?php echo $category_inactive_btn; ?>"
                >
                    <?php echo htmlspecialchars(mb_strtoupper($cat['name'], 'UTF-8')); ?>
                </button>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Ürün Kartları Listesi -->
    <div class="px-4 mt-6 space-y-4" id="products-list-container">
        <?php if (empty($products)): ?>
            <div class="text-center py-12 space-y-3">
                <span class="text-4xl">🍽️</span>
                <p class="text-xs text-slate-400 font-bold">Bu restorana ait aktif ürün bulunamadı.</p>
            </div>
        <?php else: ?>
            <?php foreach ($products as $prod): ?>
                <div 
                    class="prod-card p-3 <?php echo $card_class; ?> border rounded-2xl flex gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    data-category-id="<?php echo $prod['category_id']; ?>"
                    data-name="<?php echo htmlspecialchars(mb_strtolower($prod['name'], 'UTF-8')); ?>"
                    data-desc="<?php echo htmlspecialchars(mb_strtolower($prod['description'], 'UTF-8')); ?>"
                    onclick="openProductDetail(<?php echo htmlspecialchars(json_encode($prod)); ?>)"
                >
                    <img 
                        src="<?php echo htmlspecialchars($prod['image'] ?: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'); ?>" 
                        alt="<?php echo htmlspecialchars($prod['name']); ?>" 
                        class="w-24 h-24 rounded-xl object-cover shrink-0"
                    >
                    <div class="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                        <div class="space-y-1">
                            <span class="text-[9px] font-black uppercase tracking-wider <?php echo $accent_color; ?>">
                                <?php echo htmlspecialchars($prod['category_name']); ?>
                            </span>
                            <h4 class="font-extrabold text-xs text-ellipsis overflow-hidden truncate"><?php echo htmlspecialchars($prod['name']); ?></h4>
                            <p class="text-[10px] opacity-75 line-clamp-2 leading-relaxed"><?php echo htmlspecialchars($prod['description']); ?></p>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <span class="font-black text-sm <?php echo $accent_color; ?>"><?php echo number_format($prod['price'], 2); ?> TL</span>
                            <span class="text-[9px] bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 px-2 py-0.5 rounded-lg font-bold">Detay Gör ➔</span>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- Arama veya Filtre Sonucu Bulunamadı Mesajı -->
    <div id="no-results" class="hidden text-center py-16 space-y-3">
        <span class="text-4xl">🔍</span>
        <p class="text-xs text-slate-400 font-bold">Aradığınız kriterlere uygun ürün bulunamadı.</p>
    </div>

    <!-- YAPISAL GARSON ÇAĞIRMA & DESTEK ALT BARBARI -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-transparent pointer-events-none z-40">
        <div class="max-w-md mx-auto bg-slate-900/90 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-2xl flex items-center justify-between pointer-events-auto gap-2">
            <div class="pl-2">
                <h4 class="text-white text-xs font-black">Masada mısınız?</h4>
                <p class="text-[9px] text-slate-400 font-bold">Hızlı servis talebini başlatın.</p>
            </div>
            <div class="flex gap-2">
                <button onclick="requestService('Garson Çağırma')" class="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all shadow-md">🔔 Garson Çağır</button>
                <button onclick="requestService('Hesap Talebi')" class="bg-[#15803d] hover:bg-[#166534] text-white font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all shadow-md">💵 Hesap İste</button>
            </div>
        </div>
    </div>

    <!-- ÜRÜN DETAY MODALI (DETAYLI İÇERİK) -->
    <div id="product-modal" class="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-0 md:p-4 hidden" onclick="closeProductDetail()">
        <div class="bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-slide-up pointer-events-auto" onclick="event.stopPropagation()">
            
            <div class="relative h-64 bg-slate-800">
                <img id="modal-img" src="" alt="Ürün" class="w-full h-full object-cover">
                <button onclick="closeProductDetail()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold text-sm">✕</button>
            </div>

            <div class="p-6 space-y-4">
                <div class="space-y-1">
                    <span id="modal-category" class="text-[10px] font-black uppercase tracking-wider <?php echo $accent_color; ?>">KATEGORİ</span>
                    <h3 id="modal-title" class="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ürün Adı</h3>
                </div>

                <p id="modal-desc" class="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">Ürün açıklaması burada görünecektir.</p>

                <!-- İçindekiler / Malzemeler Alanı -->
                <div id="modal-ingredients-container" class="space-y-1.5 hidden border-t pt-3 dark:border-neutral-800">
                    <h4 class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">İçindekiler / Malzemeler:</h4>
                    <div id="modal-ingredients-chips" class="flex flex-wrap gap-1">
                        <!-- Çipler dinamik doldurulacak -->
                    </div>
                </div>

                <div class="flex items-center justify-between border-t pt-4 dark:border-neutral-800 mt-2">
                    <div>
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Toplam Fiyat</p>
                        <h4 id="modal-price" class="text-lg font-black <?php echo $accent_color; ?>">0.00 TL</h4>
                    </div>
                    <button onclick="closeProductDetail()" class="<?php echo $accent_bg; ?> text-xs font-black px-6 py-3 rounded-xl transition-all shadow-md">Menüye Dön</button>
                </div>
            </div>
        </div>
    </div>

    <!-- TALEP BAŞARILI BİLDİRİM BALONU -->
    <div id="service-toast" class="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl z-50 hidden transition-all duration-300">
        <div class="flex items-center gap-3">
            <span class="text-2xl">✅</span>
            <div>
                <h4 class="text-xs font-black">Servis Talebi Gönderildi!</h4>
                <p class="text-[10px] opacity-90 mt-0.5" id="toast-message">Talebiniz personele iletildi, teşekkür ederiz.</p>
            </div>
        </div>
    </div>


    <!-- ======================= INTERACTIVE SCRIPTLER ======================= -->
    <script>
        let currentCategory = 'all';

        // Kategoriye Göre Filtreleme
        function filterCategory(catId) {
            currentCategory = catId;

            // Buton aktiflik sınıflarını değiştir
            document.querySelectorAll('.cat-btn').forEach(btn => {
                btn.className = "cat-btn px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all <?php echo $category_inactive_btn; ?>";
            });

            const activeBtn = document.getElementById('btn-cat-' + catId);
            if (activeBtn) {
                activeBtn.className = "cat-btn px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all <?php echo $category_active_btn; ?>";
            }

            applyFilters();
        }

        // Arama Değişimi
        function handleSearch() {
            applyFilters();
        }

        // Filtre ve Aramayı Birlikte Uygula
        function applyFilters() {
            const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
            const cards = document.querySelectorAll('.prod-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const cardCatId = card.getAttribute('data-category-id');
                const name = card.getAttribute('data-name') || '';
                const desc = card.getAttribute('data-desc') || '';

                // Kategori eşleşmesi
                const catMatches = (currentCategory === 'all' || cardCatId == currentCategory);

                // Arama eşleşmesi
                const searchMatches = (!searchQuery || name.includes(searchQuery) || desc.includes(searchQuery));

                if (catMatches && searchMatches) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Sonuç bulunamadı durumunu yönet
            const noResults = document.getElementById('no-results');
            if (visibleCount === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        }

        // Garson Çağırma / Hesap Talebi Gönderimi
        function requestService(type) {
            const toast = document.getElementById('service-toast');
            const toastMsg = document.getElementById('toast-message');
            const tableNo = "<?php echo $masa; ?>";

            toastMsg.innerText = `${tableNo} için ${type} talebi personel ekranına gönderildi. En kısa sürede ilgilenilecektir.`;
            
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 4500);
        }

        // Detay Modalı Aç/Kapa
        function openProductDetail(product) {
            document.getElementById('modal-img').src = product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
            document.getElementById('modal-category').innerText = product.category_name.toUpperCase();
            document.getElementById('modal-title').innerText = product.name;
            document.getElementById('modal-desc').innerText = product.description || 'Bu ürüne ait açıklama bulunmuyor.';
            document.getElementById('modal-price').innerText = parseFloat(product.price).toFixed(2) + ' TL';

            // İçindekiler çiplerini doldur
            const ingContainer = document.getElementById('modal-ingredients-container');
            const ingChips = document.getElementById('modal-ingredients-chips');
            ingChips.innerHTML = '';

            if (product.ingredients && product.ingredients.trim() !== '') {
                const list = product.ingredients.split(',').map(i => i.trim());
                list.forEach(item => {
                    if (item) {
                        const span = document.createElement('span');
                        span.className = "text-[9px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-2 py-0.5 rounded border dark:border-neutral-700";
                        span.innerText = item;
                        ingChips.appendChild(span);
                    }
                });
                ingContainer.classList.remove('hidden');
            } else {
                ingContainer.classList.add('hidden');
            }

            document.getElementById('product-modal').classList.remove('hidden');
        }

        function closeProductDetail() {
            document.getElementById('product-modal').classList.add('hidden');
        }
    </script>

</body>
</html>
