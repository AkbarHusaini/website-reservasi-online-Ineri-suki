-- SCRIPT SINKRONISASI SEMUA MENU DARI LOCALHOST KE AIVEN

-- 1. Hapus menu lama agar tidak dobel (opsional, tapi disarankan untuk sinkronisasi total)
DELETE FROM menu_items WHERE type='menu';

-- 2. Masukkan SEMUA menu dari localhost
INSERT INTO menu_items (id, category_id, name, description, price, image_url, badge, is_available, sort_order, type) VALUES
(1, 1, 'Suki Mix Platter', 'Aneka bakso ikan, dumpling keju, dan chikuwa dengan sayuran segar.', 35000.00, '/gambar/menu1.jpeg', 'Popular', 1, 1, 'menu'),
(2, 1, 'Seafood Suki Set', 'Pilihan bahan suki seafood premium — surimi, dumpling udang, dan sayuran.', 45000.00, '/gambar/menu2.jpeg', NULL, 1, 2, 'menu'),
(3, 1, 'Premium Suki Selection', 'Pilihan terbaik bakso, chikuwa, dan sayuran enoki dalam kuah kaldu.', 40000.00, '/gambar/menu3.jpeg', NULL, 1, 3, 'menu'),
(4, 2, 'Beef Teriyaki', 'Daging sapi tumis teriyaki manis gurih dengan nasi dan salad.', 35000.00, '/gambar/menu4.jpeg', 'Best Seller', 1, 4, 'menu'),
(5, 2, 'Chicken Katsu', 'Ayam katsu renyah dengan kol segar, nasi putih, dan dua pilihan saus.', 32000.00, '/gambar/menu5.jpeg', NULL, 1, 5, 'menu'),
(6, 2, 'Chicken Tulip', 'Sayap ayam tulip goreng bumbu spesial, nasi, dan saus mayo pedas.', 30000.00, '/gambar/menu6.jpeg', NULL, 1, 6, 'menu'),
(7, 2, 'Beef Yakiniku Set', 'Daging sapi yakiniku panggang wijen, nasi, dan salad.', 38000.00, '/gambar/menu7.jpeg', NULL, 1, 7, 'menu'),
(8, 2, 'Ayam Geprek Nasi Daun Jeruk', 'Ayam krispi geprek pedas, nasi daun jeruk, enoki goreng. Gratis es teh!', 17500.00, '/gambar/menu10.jpeg', 'Menu Baru', 1, 8, 'menu'),
(9, 2, 'Beef Enoki Roll Bowl', 'Jamur enoki renyah dibalut daging sapi premium dengan saus gurih pedas.', 55000.00, '/gambar/slide3.jpeg', 'Popular', 1, 9, 'menu'),
(10, 2, 'Ayam Bakar Sambal Rempah', 'Ayam bakar utuh berbumbu rempah pedas dengan nasi dan sayur.', 38000.00, '/gambar/menu13.jpeg', NULL, 1, 10, 'menu'),
(11, 2, 'Chicken Crispy Rice Bowl', 'Ayam crispy saus teriyaki dan mayo di atas nasi putih hangat.', 30000.00, '/gambar/menu14.jpeg', NULL, 1, 11, 'menu'),
(12, 2, 'Chicken Katsu Bento Box', 'Katsu ayam krispi, saus sambal pedas, dan makaroni keju dalam bento.', 28000.00, '/gambar/menu16.jpeg', NULL, 1, 12, 'menu'),
(13, 2, 'Bento Ayam Saos Pedas', 'Set bento nasi, ayam bumbu pedas, makaroni keju.', 32000.00, '/gambar/menu17.jpeg', NULL, 1, 13, 'menu'),
(14, 2, 'Ayam Crispy Wijen Bowl', 'Ayam crispy wijen manis, bayam crispy, dan makaroni dalam mangkuk.', 28000.00, '/gambar/menu18.jpeg', NULL, 1, 14, 'menu'),
(15, 2, 'Bento Dimsum Combo', 'Bento dengan sayap ayam goreng, lauk dimsum, dan sup segar.', 35000.00, '/gambar/menu19.jpeg', NULL, 1, 15, 'menu'),
(16, 3, 'Sate Suki (SMA)', 'Sate dari bahan suki dipanggang — Serba Mabelas Ribu!', 15000.00, '/gambar/menu8.jpeg', 'Promo', 1, 16, 'menu'),
(17, 3, 'Beef Pastry Roll', 'Pastri renyah berisi daging sapi, disajikan dengan saus tomat dan mayo.', 20000.00, '/gambar/menu15.jpeg', NULL, 1, 17, 'menu'),
(18, 4, 'Matcha Latte Ice', 'Minuman matcha premium yang creamy dengan lapisan susu segar.', 18000.00, '/gambar/minum1.jpeg', NULL, 1, 18, 'menu'),
(19, 4, 'Nanas Squash', 'Kesegaran nanas asli dipadu soda berkarbonasi.', 15000.00, '/gambar/minum2.jpeg', NULL, 1, 19, 'menu'),
(20, 2, 'Gyudon Signature Bowl', 'Irisan daging sapi grill premium dengan balutan saus spesial di atas nasi hangat.', 45000.00, '/gambar/slide1.jpg', 'Best Seller', 1, 0, 'menu'),
(21, 2, 'Grill & Suki Set', 'Kombinasi lengkap daging grill dan suki dengan sayuran segar untuk keluarga.', 120000.00, '/gambar/slide2.jpeg', 'Popular', 1, 0, 'menu'),
(22, 2, 'Beef Yakiniku Bento', 'Set menu yakiniku autentik dengan tumisan daging sapi, katsu, dan nasi putih.', 65000.00, '/gambar/slide4.jpeg', 'New', 1, 0, 'menu'),
(38, 2, 'gatau', '', 99999999.99, 'https://search.brave.com/images?q=Isa+Gambar&context=W3sic3JjIjoiaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi84LzgxLyVDNCVCMHNhX1ElQzklOTltYiVDOSU5OXJfJTI4Y3JvcHBlZCUyOS5qcGcvNTEycHgtJUM0JUIwc2FfUSVDOSU5OW1iJUM5JTk5cl8lMjhjcm9wcG', NULL, 1, 0, 'menu'),
(39, 1, 'sate', 'blee', 10000.00, 'https://www.astronauts.id/blog/wp-content/uploads/2022/08/Makanan-Khas-Daerah-tiap-Provinsi-di-Indonesia-Serta-Daerah-Asalnya-1024x683.jpg', NULL, 1, 0, 'menu');
