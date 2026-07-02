# 🐘 HOSTINGER PHP 8+ / MYSQL SAAS QR MENÜ PLATFORMU DEPLOYMENT KIT

Bu kılavuz, hazırlanan **Dinamik QR Kod SaaS Platformu**'nun Hostinger veya herhangi bir cPanel/DirectAdmin tabanlı paylaşımlı sunucu üzerinde nasıl kurulacağını ve çalıştırılacağını anlatır.

---

## 📁 Dosya Yapısı (Platform Dağılımı)

Tüm kodlar, Hostinger standartlarına ve platform bütünlüğüne uygun olarak tasarlanmıştır:

```text
public_html/
│
├── config/
│   └── database.php       # PDO MySQL Bağlantı Sınıfı
│
├── admin/
│   ├── login.php          # Güvenli Admin Giriş Ekranı (SQL Injection Korumalı)
│   └── dashboard.php      # Restoran CRUD, Kategori ve Ürün Yönetimi
│
├── menu/
│   └── index.php          # Apple Tarzı, Mobil Öncelikli Canlı Menü Sayfası
│
├── qr/
│   └── generate.php       # Sunucu Tarafı Dinamik QR Kod ve Logo Overlay Oluşturucu
│
├── uploads/               # Sunucu İçi Dosya/Logo Kayıt Klasörleri
│   ├── logos/
│   ├── products/
│   └── qr/
│
└── database.sql           # Veritabanı Tabloları (SaaS Uyumlu)
```

---

## 🚀 Kurulum Adımları

### 1. Veritabanının Oluşturulması ve Seeding

1. Hostinger panelinize (hPanel) giriş yapın.
2. **Veritabanları > MySQL Veritabanları** bölümüne giderek yeni bir veritabanı, veritabanı kullanıcısı ve güçlü bir şifre oluşturun.
3. **phpMyAdmin** panelini açın.
4. Oluşturduğunuz veritabanını seçip **İçe Aktar (Import)** sekmesine tıklayın.
5. Hazırladığımız `/php_deployment_kit/database.sql` dosyasını seçip çalıştırın. Tüm tablolar (users, clients, categories, products, tables, analytics) ve örnek veriler yüklenecektir.

### 2. Veritabanı Bağlantı Ayarları

`/php_deployment_kit/config/database.php` dosyasını açarak Hostinger'da oluşturduğunuz veritabanı bilgilerini girin:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_hostinger_db_user');     // Veritabanı Kullanıcı Adı
define('DB_PASS', 'your_hostinger_db_password'); // Veritabanı Şifresi
define('DB_NAME', 'your_hostinger_db_name');     // Veritabanı Adı
```

### 3. Dosyaları Sunucuya Yükleme

1. Sunucunuzun kök dizinindeki (genellikle `public_html`) tüm dosyaları temizleyin veya yedekleyin.
2. `php_deployment_kit` klasörü içerisindeki tüm dosya ve klasörleri seçerek ZIP formatında sıkıştırın.
3. Hostinger **Dosya Yöneticisi (File Manager)**'ni açarak ZIP dosyasını `public_html` içerisine yükleyin ve "Ayıkla (Extract)" yapın.
4. `uploads/`, `uploads/qr/`, `uploads/logos/` ve `uploads/products/` klasörlerinin yazma izinlerinin (CHMOD) **755** veya gerektiğinde **777** olarak ayarlandığından emin olun.

---

## 🔒 Güvenlik Özellikleri

- **SQL Injection Koruması:** Sistemdeki tüm SQL sorguları `PDO::prepare` ve parametre bağlama (`execute`) yöntemleri ile tamamen güvenli hale getirilmiştir.
- **Şifre Güvenliği:** Admin şifreleri `password_hash()` fonksiyonu (BCRYPT algoritması) ile hash'lenerek saklanır.
- **Giriş Güvenliği:** Admin sayfaları PHP session kontrolü (`session_start`) ile korunmaktadır. Yetkisiz erişimler otomatik olarak `login.php` ekranına yönlendirilir.

---

## 📱 QR Kod ve Masa Entegrasyon Mantığı

Sistemde her restoran ve masa oluşturulduğunda otomatik olarak şu formatta linkler oluşturulur:

```text
http://alanadiniz.com/menu/index.php?restaurant=karamelize-fast-food&masa=5
```

Bu URL, `qr/generate.php` servisine gönderilerek dinamik olarak karekod görseline dönüştürülür ve admin panel üzerinden **PNG / SVG / Yazdır** butonları ile indirilebilir.

---

## 🤖 Yapay Zeka (AI Waiter) Aktivasyonu

Lüks restoran önizleme arayüzünde aktif çalışan **Yapay Zeka Garson** (Gemini-3.5) entegrasyonu tamamlanmıştır. AI'ın Hostinger üzerinde tam kapasite çalışması için admin panelindeki ayarlar kısmından veya PHP kodunuzdaki API Key alanından kendi anahtarınızı eklemeniz yeterlidir.

Platformu tescilli ticari müşterilerinize satmak için hazır altyapınız tamamlandı!
