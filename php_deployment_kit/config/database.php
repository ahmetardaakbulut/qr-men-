<?php
/**
 * QR Menü SaaS Platformu - Veritabanı Bağlantı Dosyası
 * Hostinger veya herhangi bir paylaşımlı sunucu için uyumludur.
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'u330144038_u330144038_'); // Hostinger MySQL Kullanıcı Adı
define('DB_PASS', 'Cl9_QrSystem!2026_Secure'); // Hostinger MySQL Şifresi
define('DB_NAME', 'u330144038_u330144038_');     // Hostinger MySQL Veritabanı Adı

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            // PDO bağlantısı kurulur ve UTF-8 ayarı yapılır
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]
            );
        } catch(PDOException $exception) {
            // Hata detaylarını güvenlik nedeniyle üretim modunda gizleyin
            error_log("Bağlantı Hatası: " . $exception->getMessage());
            die("Sistem şu anda bakımda. Lütfen daha sonra tekrar deneyin.");
        }
        return $this->conn;
    }
}
?>
