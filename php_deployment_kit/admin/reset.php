<?php
/**
 * Süper Admin Şifre Sıfırlama ve Kurulum Dosyası
 */
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $email = 'admin@qrmenu.com';
    $password = password_hash('admin123', PASSWORD_BCRYPT);
    $name = 'Ahmet Arda';
    $role = 'super_admin';

    // Kullanıcının var olup olmadığını kontrol et
    $check = $db->prepare("SELECT id FROM users WHERE email = :email");
    $check->execute([':email' => $email]);
    $user = $check->fetch();

    if ($user) {
        // Kullanıcı varsa şifresini ve bilgilerini güncelle
        $stmt = $db->prepare("UPDATE users SET password = :password, name = :name, role = :role WHERE email = :email");
        $stmt->execute([
            ':password' => $password,
            ':name' => $name,
            ':role' => $role,
            ':email' => $email
        ]);
        echo "<div style='font-family: sans-serif; padding: 20px; background: #e0f2fe; color: #0369a1; border-radius: 8px; margin: 20px auto; max-width: 600px;'>";
        echo "<h3>✅ Başarılı!</h3>";
        echo "<p>Admin kullanıcısı bulundu ve şifresi başarıyla sıfırlandı.</p>";
        echo "<p><strong>E-posta:</strong> admin@qrmenu.com</p>";
        echo "<p><strong>Yeni Şifre:</strong> admin123</p>";
        echo "<p><a href='login.php' style='color: #0284c7; font-weight: bold;'>Giriş Ekranına Git</a></p>";
        echo "</div>";
    } else {
        // Kullanıcı yoksa yeni oluştur
        $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)");
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $password,
            ':role' => $role
        ]);
        echo "<div style='font-family: sans-serif; padding: 20px; background: #dcfce7; color: #15803d; border-radius: 8px; margin: 20px auto; max-width: 600px;'>";
        echo "<h3>✅ Başarılı!</h3>";
        echo "<p>Yeni Admin kullanıcısı başarıyla oluşturuldu.</p>";
        echo "<p><strong>E-posta:</strong> admin@qrmenu.com</p>";
        echo "<p><strong>Şifre:</strong> admin123</p>";
        echo "<p><a href='login.php' style='color: #16a34a; font-weight: bold;'>Giriş Ekranına Git</a></p>";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='font-family: sans-serif; padding: 20px; background: #fee2e2; color: #b91c1c; border-radius: 8px; margin: 20px auto; max-width: 600px;'>";
    echo "<h3>❌ Hata Oluştu!</h3>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "</div>";
}
?>
