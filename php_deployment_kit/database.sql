-- =========================================================
-- PREMIUM QR MENÜ PLATFORMU (SAAS) MYSQL DATABASE SCHEMA
-- =========================================================

-- CREATE DATABASE IF NOT EXISTS `qrmenu_saas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u330144038_u330144038_`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `analytics`;
DROP TABLE IF EXISTS `tables`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Super Admin & Staff)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
-- Admin can change it directly or through profile update
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Ahmet Arda', 'admin@qrmenu.com', '$2y$10$UoP2WwzO5N8S6hZg9uR/eut9N6LIsO4B8oD6U9.7/hR.i.gG2m0tW', 'super_admin')
ON DUPLICATE KEY UPDATE `email` = `email`;

-- 2. Clients Table (Restaurants)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `restaurant_name` VARCHAR(200) NOT NULL,
  `logo` VARCHAR(10) DEFAULT '🍔',
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `slug` VARCHAR(200) UNIQUE NOT NULL,
  `theme` VARCHAR(100) DEFAULT 'apple-premium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample clients
INSERT INTO `clients` (`id`, `restaurant_name`, `logo`, `cover_image`, `phone`, `address`, `slug`, `theme`) VALUES
(1, 'Karamelize Fast Food', '🍔', 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80&w=1200', '+90 532 123 4567', 'Bağdat Caddesi No:142, Kadıköy, İstanbul', 'karamelize-fast-food', 'apple-premium'),
(2, 'Dark Obsidian Steakhouse', '🥩', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200', '+90 212 987 6543', 'Levent Caddesi No:89, Beşiktaş, İstanbul', 'dark-obsidian', 'dark-obsidian');

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `sort_order` INT DEFAULT 1,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample categories
INSERT INTO `categories` (`id`, `client_id`, `name`, `sort_order`) VALUES
(1, 1, 'Gurme Burgerler', 1),
(2, 1, 'Çıtır Yan Lezzetler', 2),
(3, 1, 'Serinletici İçecekler', 3),
(4, 2, 'Premium Steaks', 1);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `ingredients` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample products
INSERT INTO `products` (`client_id`, `category_id`, `name`, `description`, `price`, `image`, `ingredients`, `status`) VALUES
(1, 1, 'Cheddar Karamelize Burger', '150g ev yapımı burger köftesi, duble cheddar peyniri, özel karamelize soğan, çıtır turşu ve ev yapımı burger sosu.', 240.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600', 'Burger Ekmeği, 150g Köfte, Cheddar, Karamelize Soğan, Turşu, Özel Sos', 'available'),
(1, 1, 'Acılı Smokey Bacon Burger', 'Özel füme bacon dilimleri, jalapeño biber turşusu, barbekü sos, çıtır soğan halkaları ve dumanlı burger köftesi.', 265.00, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=600', 'Köfte, Füme Bacon, Cheddar, Jalapeno, Barbekü Sos, Soğan Halkası', 'available'),
(1, 2, 'Baharatlı Parmak Patates', 'Özel Cajun baharat karışımı ile harmanlanmış taze çıtır patates kızartması, yanında trüflü mayonez ile.', 90.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600', 'Taze Patates, Cajun Baharatı, Kekik, Sarımsak Tozu, Trüflü Mayonez', 'available'),
(1, 3, 'Ev Yapımı Nane Çilekli Limonata', 'Taze sıkılmış limon suyu, ezilmiş çilek taneleri, taze nane yaprakları ve buz.', 75.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600', 'Limon, Çilek, Taze Nane, Süzme Şeker Şurubu, Buz', 'available'),
(2, 4, 'Dry Aged Dallas Steak', '28 gün boyunca dry-aged odalarında dinlendirilmiş 450g dallas steak, kaya tuzu ve taze biberiye marinasyonu ile.', 850.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600', '450g Dallas Steak, Deniz Tuzu, Taze Biberiye, Tereyağı', 'available');

-- 5. Tables Table (Masa Bazlı QR Sistemi)
CREATE TABLE IF NOT EXISTS `tables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT NOT NULL,
  `table_number` VARCHAR(50) NOT NULL,
  `qr_code` VARCHAR(500) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`restaurant_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample tables
INSERT INTO `tables` (`restaurant_id`, `table_number`, `qr_code`) VALUES
(1, '1', 'https://domain.com/menu/karamelize-fast-food?masa=1'),
(1, '2', 'https://domain.com/menu/karamelize-fast-food?masa=2');

-- 6. Analytics Table (Masa/Ürün Tıklamaları)
CREATE TABLE IF NOT EXISTS `analytics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NOT NULL,
  `product_id` INT DEFAULT NULL,
  `view_count` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
