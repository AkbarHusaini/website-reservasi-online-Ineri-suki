-- ============================================================
--  Ineri SUKI & GRILL — Database Schema
--  Versi: 1.0  |  Engine: InnoDB  |  Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS Ineri_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Ineri_db;

-- ============================================================
-- 1. TABEL: users
--    Menyimpan data pelanggan yang mendaftar / login
-- ============================================================
CREATE TABLE users (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,        -- bcrypt hash
  phone       VARCHAR(20)  DEFAULT NULL,
  role        ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 2. TABEL: categories
--    Kategori menu: suki, grill, appetizer, drinks
-- ============================================================
CREATE TABLE categories (
  id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug  VARCHAR(50)  NOT NULL UNIQUE,   -- 'suki', 'grill', dst.
  label VARCHAR(100) NOT NULL,          -- 'Suki', 'Grill', dst.
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO categories (slug, label) VALUES
  ('suki',      'Suki'),
  ('grill',     'Grill'),
  ('appetizer', 'Appetizer'),
  ('drinks',    'Drinks');

-- ============================================================
-- 3. TABEL: menu_items
--    Seluruh item di halaman Menu.jsx
-- ============================================================
CREATE TABLE menu_items (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category_id   INT UNSIGNED  NOT NULL,
  name          VARCHAR(150)  NOT NULL,
  description   TEXT          DEFAULT NULL,
  price         DECIMAL(12,0) NOT NULL,     -- harga dalam Rupiah
  img_path      VARCHAR(300)  NOT NULL,     -- misal: /gambar/menu1.jpeg
  badge         VARCHAR(50)   DEFAULT NULL, -- 'Popular', 'Best Seller', dll.
  badge_class   VARCHAR(100)  DEFAULT NULL, -- Tailwind class badge
  is_available  TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order    INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_category (category_id),
  CONSTRAINT fk_menu_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO menu_items (category_id, name, description, price, img_path, badge, badge_class, sort_order) VALUES
-- Suki
(1, 'Suki Mix Platter',       'Aneka bakso ikan, dumpling keju, dan chikuwa dengan sayuran segar.', 35000, '/gambar/menu1.jpeg', 'Popular',    'bg-tertiary text-on-tertiary', 1),
(1, 'Seafood Suki Set',       'Pilihan bahan suki seafood premium — surimi, dumpling udang, dan sayuran.', 45000, '/gambar/menu2.jpeg', NULL, NULL, 2),
(1, 'Premium Suki Selection', 'Pilihan terbaik bakso, chikuwa, dan sayuran enoki dalam kuah kaldu.',40000, '/gambar/menu3.jpeg', NULL, NULL, 3),
-- Grill
(2, 'Beef Teriyaki',          'Daging sapi tumis teriyaki manis gurih dengan nasi dan salad.',         35000, '/gambar/menu4.jpeg', 'Best Seller','bg-primary text-on-primary',   4),
(2, 'Chicken Katsu',          'Ayam katsu renyah dengan kol segar, nasi putih, dan dua pilihan saus.', 32000, '/gambar/menu5.jpeg', NULL, NULL, 5),
(2, 'Chicken Tulip',          'Sayap ayam tulip goreng bumbu spesial, nasi, dan saus mayo pedas.',     30000, '/gambar/menu6.jpeg', NULL, NULL, 6),
(2, 'Beef Yakiniku Set',      'Daging sapi yakiniku panggang wijen, nasi, dan salad.',                 38000, '/gambar/menu7.jpeg', NULL, NULL, 7),
(2, 'Ayam Geprek Nasi Daun Jeruk','Ayam krispi geprek pedas, nasi daun jeruk, enoki goreng. Gratis es teh!',17500,'/gambar/menu10.jpeg','Menu Baru','bg-orange-500 text-white', 8),
(2, 'Beef Enoki Roll Bowl',   'Jamur enoki dibalut daging sapi, cumi pedas di atas nasi.',             45000, '/gambar/menu12.jpeg', NULL, NULL, 9),
(2, 'Ayam Bakar Sambal Rempah','Ayam bakar utuh berbumbu rempah pedas dengan nasi dan sayur.',         38000, '/gambar/menu13.jpeg', NULL, NULL, 10),
(2, 'Chicken Crispy Rice Bowl','Ayam crispy saus teriyaki dan mayo di atas nasi putih hangat.',        30000, '/gambar/menu14.jpeg', NULL, NULL, 11),
(2, 'Chicken Katsu Bento Box','Katsu ayam krispi, saus sambal pedas, dan makaroni keju dalam bento.',  28000, '/gambar/menu16.jpeg', NULL, NULL, 12),
(2, 'Bento Ayam Saos Pedas',  'Set bento nasi, ayam bumbu pedas, makaroni keju.',                     32000, '/gambar/menu17.jpeg', NULL, NULL, 13),
(2, 'Ayam Crispy Wijen Bowl', 'Ayam crispy wijen manis, bayam crispy, dan makaroni dalam mangkuk.',   28000, '/gambar/menu18.jpeg', NULL, NULL, 14),
(2, 'Bento Dimsum Combo',     'Bento dengan sayap ayam goreng, lauk dimsum, dan sup segar.',           35000, '/gambar/menu19.jpeg', NULL, NULL, 15),
-- Appetizer
(3, 'Sate Suki (SMA)',        'Sate dari bahan suki dipanggang — Serba Mabelas Ribu!',                 15000, '/gambar/menu8.jpeg', 'Promo','bg-green-600 text-white', 16),
(3, 'Beef Pastry Roll',       'Pastri renyah berisi daging sapi, disajikan dengan saus tomat dan mayo.',20000,'/gambar/menu15.jpeg', NULL, NULL, 17),
-- Drinks
(4, 'Matcha Latte Ice',       'Minuman matcha premium yang creamy dengan lapisan susu segar.',         18000, '/gambar/minum1.jpeg', NULL, NULL, 18),
(4, 'Nanas Squash',           'Kesegaran nanas asli dipadu soda berkarbonasi.',                        15000, '/gambar/minum2.jpeg', NULL, NULL, 19);

-- ============================================================
-- 4. TABEL: packages
--    Paket khusus (Home.jsx Chef's Specials & semua paket)
-- ============================================================
CREATE TABLE packages (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT          DEFAULT NULL,
  price         DECIMAL(12,0) NOT NULL,
  img_path      VARCHAR(300)  NOT NULL,
  badge         VARCHAR(80)   DEFAULT NULL,
  badge_class   VARCHAR(100)  DEFAULT NULL,
  min_pax       TINYINT UNSIGNED DEFAULT 1,
  max_pax       TINYINT UNSIGNED DEFAULT NULL,
  is_available  TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order    INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO packages (name, description, price, img_path, badge, badge_class, min_pax, max_pax, sort_order) VALUES
('Paket Ulang Tahun',         'Paket meriah 10 orang: Suki, Grill, Seafood, 10 Nasi Putih, 10 Es Teh.',       285000,'/gambar/paket1.jpeg', 'Event',    'bg-red-600 text-white',    10, 10, 1),
('Promo Paket Valentine',     'Berdua saja! USA Beef + Ayam Slice + Enoki Roll + 2 Nasi + bonus cokelat.',    100000,'/gambar/paket2.jpeg', 'Limited',  'bg-pink-600 text-white',    2,  2, 2),
('Paket Grill Berdua (Hemat)','Grill 1 + Ayam Slice + Sosis Beef Keju + 2 Nasi + 2 Es Teh.',                   85000,'/gambar/paket3.jpeg', 'Best Value','bg-orange-600 text-white',  2,  2, 3),
('Paket Grill Koncoan',       'US Beef, Ayam Slice, Sosis & aneka topping. Hanya Rp 25k/orang.',               50000,'/gambar/paket4.jpeg', 'Menu Baru','bg-orange-500 text-white',  2,  2, 4),
('Paket Merdeka',             'US Beef + Seafood + Suki + sayuran + Sparkling Water gratis.',                  90000,'/gambar/paket5.jpeg', 'Limited',  'bg-red-700 text-white',     2,  4, 5),
('Oktober Seru',              'US Beef 300gr + Ikan Dori + Sosis + Ayam Slice + Seafood + Sparkling Water.', 160000,'/gambar/paket6.jpeg', NULL, NULL,  2,  4, 6),
('Oktober Megah',             '3 Sukiyaki + US Beef 300gr + Ayam 200gr + Seafood + mystery box gratis.',      350000,'/gambar/paket7.jpeg', 'Event',    'bg-red-600 text-white',     4,  8, 7),
('Paket Pahlawan',            'Beef + Ayam + Scallop + Chikuwa Enoki + Dumpling + 2 Nasi + Yakult.',          79000,'/gambar/paket8.jpeg', 'Promo',    'bg-green-600 text-white',   2,  2, 8),
('Suki Grill Besti',          'Sukiyaki 400gr + US Beef 500gr + Ayam 300gr + Beef & Chicken Enoki.',         350000,'/gambar/paket9.jpeg', 'Delivery', 'bg-blue-600 text-white',    4,  6, 9),
('Grill Seru Poll – Wisuda',  'Beef 200gr + Ayam 200gr + Sosis + Enoki + 4 Nasi + 4 Es Teh.',               185000,'/gambar/paket10.jpeg','Event',    'bg-purple-600 text-white',  4,  5, 10),
('Juliet – Juli Ekstra Hemat','Beef + Ayam + Enoki + Scallop + Dumpling + 2 Nasi + Yakult.',                  83000,'/gambar/paket11.jpeg','Promo',    'bg-pink-500 text-white',    2,  2, 11),
('Week N Steak – Pesta Stick','Beef Shortplate + Ayam + Beef Stick + Chikuwa Enoki (4–6 orang).',            185000,'/gambar/paket12.jpeg',NULL, NULL,  4,  6, 12),
('Week N Steak – Pesta Meltique','Beef Meltique + Shortplate + Lowfat + Ayam + Chikuwa (6–8 orang).',        275000,'/gambar/paket13.jpeg','Premium',  'bg-yellow-600 text-white',  6,  8, 13),
('Paket Bombastis – Tahun Baru','Paket super lengkap + Soju Halal & Ebi Chili Oil gratis.',                  550000,'/gambar/paket14.jpeg','Event',    'bg-red-700 text-white',     8, 12, 14),
('Duo Combo Sweet',           'Sukiyaki + Beef Slice + Dori + Sosis & Scallop + 2 Nasi + 2 Yakult + dessert.', 87000,'/gambar/paket15.jpeg','Best Value','bg-orange-500 text-white', 2,  2, 15);

-- ============================================================
-- 5. TABEL: tables (meja restoran)
--    Untuk sistem reservasi
-- ============================================================
CREATE TABLE `tables` (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  table_number VARCHAR(10)  NOT NULL UNIQUE,  -- 'T01', 'T02', ...
  capacity    TINYINT UNSIGNED NOT NULL DEFAULT 4,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO `tables` (table_number, capacity) VALUES
  ('T01', 2), ('T02', 2), ('T03', 4), ('T04', 4),
  ('T05', 4), ('T06', 4), ('T07', 6), ('T08', 6),
  ('T09', 8), ('T10', 8), ('T11',10), ('T12',10);

-- ============================================================
-- 6. TABEL: reservations
--    Booking meja dari halaman Reservation.jsx
-- ============================================================
CREATE TABLE reservations (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  table_id      INT UNSIGNED NOT NULL,
  reservation_date DATE      NOT NULL,
  start_time    TIME         NOT NULL,
  end_time      TIME         NOT NULL DEFAULT '22:00:00',
  guest_count   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  notes         TEXT         DEFAULT NULL,
  status        ENUM('pending','confirmed','cancelled','completed')
                NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_date_table (reservation_date, table_id),
  CONSTRAINT fk_res_user  FOREIGN KEY (user_id)  REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_res_table FOREIGN KEY (table_id) REFERENCES `tables` (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- 7. TABEL: orders
--    Pre-order / pesanan dari halaman Cart.jsx
-- ============================================================
CREATE TABLE orders (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED  NOT NULL,
  reservation_id INT UNSIGNED  DEFAULT NULL,  -- jika terhubung ke reservasi
  total_price    DECIMAL(14,0) NOT NULL DEFAULT 0,
  status         ENUM('cart','pending','paid','preparing','served','cancelled')
                 NOT NULL DEFAULT 'cart',
  payment_method ENUM('cash','transfer','qris') DEFAULT NULL,
  notes          TEXT          DEFAULT NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_status (user_id, status),
  CONSTRAINT fk_order_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_res  FOREIGN KEY (reservation_id)
    REFERENCES reservations (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 8. TABEL: order_items
--    Detail item di setiap order (menu atau paket)
-- ============================================================
CREATE TABLE order_items (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  order_id    INT UNSIGNED  NOT NULL,
  item_type   ENUM('menu','package') NOT NULL DEFAULT 'menu',
  item_id     INT UNSIGNED  NOT NULL,   -- menu_items.id ATAU packages.id
  item_name   VARCHAR(200)  NOT NULL,   -- snapshot nama saat order
  unit_price  DECIMAL(12,0) NOT NULL,   -- snapshot harga saat order
  quantity    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  subtotal    DECIMAL(14,0) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_order (order_id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. TRIGGER: hitung total_price otomatis setelah insert item
-- ============================================================
DELIMITER $$

CREATE TRIGGER trg_update_order_total_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET total_price = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM order_items
    WHERE order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
END$$

CREATE TRIGGER trg_update_order_total_update
AFTER UPDATE ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET total_price = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM order_items
    WHERE order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
END$$

CREATE TRIGGER trg_update_order_total_delete
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET total_price = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM order_items
    WHERE order_id = OLD.order_id
  )
  WHERE id = OLD.order_id;
END$$

DELIMITER ;

-- ============================================================
-- 10. TABEL: admins (akun admin terpisah, lebih aman)
-- ============================================================
CREATE TABLE admins (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Password default: 'admin123' (ganti setelah setup!)
-- Hash bcrypt dari 'admin123': $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y
INSERT INTO admins (name, email, password) VALUES
  ('Admin Ineri', 'admin@Inerisuki.com',
   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y');

-- ============================================================
-- SELESAI — Verifikasi tabel yang dibuat:
-- ============================================================
SHOW TABLES;
