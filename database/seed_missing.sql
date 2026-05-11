-- SCRIPT PERBAIKAN MEJA DAN PAKET UNTUK AIVEN

-- Rename tabel meja agar sesuai dengan backend
RENAME TABLE tables TO dining_tables;

-- Insert data meja
INSERT IGNORE INTO dining_tables (id, status, capacity) VALUES
('T1', 'available', 4),
('T10', 'available', 8),
('t1000', 'available', 4),
('T2', 'available', 2),
('T3', 'available', 2),
('T4', 'available', 6),
('T5', 'available', 4),
('T6', 'available', 2),
('T7', 'available', 2),
('T8', 'available', 2),
('T9', 'available', 4);

-- Insert data paket ke dalam menu_items
INSERT IGNORE INTO menu_items (category_id, name, description, price, image_url, is_available, type) VALUES
(1, 'Paket Ulang Tahun', 'Paket meriah 10 orang: Suki, Grill, Seafood, 10 Nasi Putih, 10 Es Teh.', 285000.00, '/gambar/paket1.jpeg', 1, 'package'),
(1, 'Promo Paket Valentine', 'Berdua saja! USA Beef + Ayam Slice + Enoki Roll + 2 Nasi + bonus cokelat.', 100000.00, '/gambar/paket2.jpeg', 1, 'package'),
(1, 'Paket Grill Berdua (Hemat)', 'Grill 1 + Ayam Slice + Sosis Beef Keju + 2 Nasi + 2 Es Teh.', 85000.00, '/images/paket_grill_berdua.png', 1, 'package'),
(1, 'Paket Grill Koncoan', 'US Beef, Ayam Slice, Sosis & aneka topping. Hanya Rp 25k/orang.', 50000.00, '/gambar/paket4.jpeg', 1, 'package'),
(1, 'Paket Merdeka', 'US Beef + Seafood + Suki + sayuran + Sparkling Water gratis.', 90000.00, '/gambar/paket5.jpeg', 1, 'package'),
(1, 'Oktober Seru', 'US Beef 300gr + Ikan Dori + Sosis + Ayam Slice + Seafood + Sparkling Water.', 160000.00, '/gambar/paket6.jpeg', 1, 'package'),
(1, 'Oktober Megah', '3 Sukiyaki + US Beef 300gr + Ayam 200gr + Seafood + mystery box gratis.', 350000.00, '/gambar/paket7.jpeg', 1, 'package'),
(1, 'Paket Pahlawan', 'Beef + Ayam + Scallop + Chikuwa Enoki + Dumpling + 2 Nasi + Yakult.', 79000.00, '/images/paket_pahlawan.png', 1, 'package'),
(1, 'Suki Grill Besti', 'Sukiyaki 400gr + US Beef 500gr + Ayam 300gr + Beef & Chicken Enoki.', 350000.00, '/gambar/paket9.jpeg', 1, 'package'),
(1, 'Grill Seru Poll – Wisuda', 'Beef 200gr + Ayam 200gr + Sosis + Enoki + 4 Nasi + 4 Es Teh.', 185000.00, '/gambar/paket10.jpeg', 1, 'package'),
(1, 'Juliet – Juli Ekstra Hemat', 'Beef + Ayam + Enoki + Scallop + Dumpling + 2 Nasi + Yakult.', 83000.00, '/gambar/paket11.jpeg', 1, 'package'),
(1, 'Week N Steak – Pesta Stick', 'Beef Shortplate + Ayam + Beef Stick + Chikuwa Enoki (4–6 orang).', 185000.00, '/gambar/paket12.jpeg', 1, 'package'),
(1, 'Week N Steak – Pesta Meltique', 'Beef Meltique + Shortplate + Lowfat + Ayam + Chikuwa (6–8 orang).', 275000.00, '/gambar/paket13.jpeg', 1, 'package'),
(1, 'Paket Bombastis – Tahun Baru', 'Paket super lengkap + Soju Halal & Ebi Chili Oil gratis.', 550000.00, '/gambar/paket14.jpeg', 1, 'package'),
(1, 'Duo Combo Sweet', 'Sukiyaki + Beef Slice + Dori + Sosis & Scallop + 2 Nasi + 2 Yakult + dessert.', 87000.00, '/gambar/paket15.jpeg', 1, 'package');
