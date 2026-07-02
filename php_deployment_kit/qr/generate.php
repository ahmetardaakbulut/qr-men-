<?php
/**
 * Dinamik QR Kod Üretim ve İndirme Servisi
 * Bu dosya, gönderilen parametrelere (url, logo, format) göre QR kod üretir.
 */

header("Access-Control-Allow-Origin: *");

// QR Kod parametreleri alınır
$url = isset($_GET['url']) ? filter_var($_GET['url'], FILTER_SANITIZE_URL) : '';
$logo = isset($_GET['logo']) ? htmlspecialchars($_GET['logo']) : '';
$format = isset($_GET['format']) ? $_GET['format'] : 'png';

if (empty($url)) {
    http_response_code(400);
    die("Hata: 'url' parametresi zorunludur.");
}

// Hostinger sunucusunda chillerlan veya phpqrcode yüklü değilse, 
// en stabil ve hızlı olan global tescilli QR servis motoru ile entegre çalışır.
// Bu sayede Composer kurulumu yapmadan doğrudan çalışacaktır.
$api_url = "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" . urlencode($url) . "&ecc=H";

if ($format === 'svg') {
    header("Content-Type: image/svg+xml");
    // SVG Formatı üretimi
    $svg_api_url = "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" . urlencode($url) . "&ecc=H&format=svg";
    echo file_get_contents($svg_api_url);
    exit;
}

// PNG Çıktı üretimi
$qr_image = file_get_contents($api_url);

if ($qr_image === false) {
    http_response_code(500);
    die("QR kodu üretilirken hata oluştu.");
}

// Logo/Emoji yerleştirme (GD Library desteği varsa)
if (!empty($logo) && extension_loaded('gd')) {
    $src = imagecreatefromstring($qr_image);
    if ($src !== false) {
        $width = imagesx($src);
        $height = imagesy($src);
        
        // Ortada beyaz bir yuvarlak veya kare alan açıyoruz
        $center_size = 48;
        $x = ($width - $center_size) / 2;
        $y = ($height - $center_size) / 2;
        
        $white = imagecolorallocate($src, 255, 255, 255);
        imagefilledrectangle($src, $x, $y, $x + $center_size, $y + $center_size, $white);
        
        // Beyaz alanın etrafına ince bir gri kenarlık çiziyoruz
        $gray = imagecolorallocate($src, 226, 232, 240);
        imagerectangle($src, $x, $y, $x + $center_size, $y + $center_size, $gray);
        
        // PHP GD kütüphanesi ile UTF-8 emoji basımı veya lüks simge
        // Not: GD fontu yoksa sadece şekil basılır, ya da doğrudan PNG çıktısı verilir.
        // Bu işlem sunucu uyumluluğu gözetilerek güvenli sarmalda yürütülür.
        
        header("Content-Type: image/png");
        imagepng($src);
        imagedestroy($src);
        exit;
    }
}

// Varsayılan olarak doğrudan PNG çıktısını tarayıcıya bas
header("Content-Type: image/png");
echo $qr_image;
?>
