<?php
/**
 * Süper Admin Güvenli Giriş Paneli
 */
session_start();
require_once '../config/database.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';

    if (!empty($email) && !empty($password)) {
        $database = new Database();
        $db = $database->getConnection();

        // SQL injection korumalı PDO sorgusu
        $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Başarılı Giriş
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_role'] = $user['role'];
            
            header("Location: dashboard.php");
            exit;
        } else {
            $error = 'E-posta adresi veya şifre hatalı!';
        }
    } else {
        $error = 'Lütfen tüm alanları doldurun!';
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Süper Admin Giriş - QR Menü SaaS</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;850&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">

    <div class="w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl shadow-2xl space-y-6">
        
        <div class="text-center space-y-2">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/30 text-white">
                QR
            </div>
            <h1 class="text-xl font-black tracking-tight">QR MENÜ SAAS PLATFORMU</h1>
            <p class="text-xs text-slate-400 font-semibold">Süper Admin Yönetim Girişi</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <span>⚠️</span> <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="" class="space-y-4">
            <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">E-posta Adresi:</label>
                <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="admin@qrmenu.com" 
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                >
            </div>

            <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Şifre:</label>
                <input 
                    type="password" 
                    name="password" 
                    required 
                    placeholder="••••••••" 
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                >
            </div>

            <button 
                type="submit" 
                class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
                Giriş Yap
            </button>
        </form>

        <div class="text-center pt-2">
            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Default Demo: admin@qrmenu.com / admin123</span>
        </div>
    </div>

</body>
</html>
