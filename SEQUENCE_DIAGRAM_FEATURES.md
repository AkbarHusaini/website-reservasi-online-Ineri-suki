# Sequence Diagrams: Fitur Utama Aplikasi Ineri Suki & Grill

Dokumen ini berisi *sequence diagram* mendetail untuk setiap fitur utama di platform Ineri Suki & Grill. Semua diagram ini menggunakan pembatas kompatibel *dark mode* (`opt`) dan menjelaskan alur API, query database (MySQL), enkripsi, hingga validasi.

---

## 1. Fitur: Registrasi & Login Pengguna (Authentication)

Fase ini menjelaskan proses registrasi akun baru dan masuk (*login*) baik untuk Pelanggan (Customer) maupun Admin.

### A. Alur Registrasi Akun Baru (Register)
```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (User)
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as Database (MySQL)

    User->>FE: Input Name, Email, Phone, Password, & Confirm Password
    User->>FE: Klik tombol "Register"
    FE->>BE: POST /api/register (Body payload)
    
    opt Validasi Awal & Pengecekan Duplikasi
        BE->>BE: Validasi field kosong, minimal password (6 kar), & kecocokan confirmPassword
        BE->>DB: SELECT id FROM users WHERE email = ?
        DB-->>BE: Mengembalikan data user duplikat (jika ada)
    end

    alt Email Sudah Terdaftar
        BE-->>FE: Response (400, success: false, error: "Email sudah terdaftar.")
        FE-->>User: Tampilkan pesan error "Email sudah terdaftar."
    else Email Belum Terdaftar (Valid)
        opt Enkripsi & Penyimpanan Akun
            BE->>BE: Hashing password menggunakan bcryptjs (Salt: 10)
            BE->>DB: INSERT INTO users (name, email, phone, password, role='customer')
            DB-->>BE: Mengembalikan insertId (User ID Baru)
        end
        
        opt Pembuatan JWT Session Token
            BE->>BE: Tanda tangani Token JWT menggunakan SECRET_KEY (expiresIn: 1d)
        end
        
        BE-->>FE: Response (200, success: true, token, user_data)
        FE->>FE: Simpan Token di LocalStorage & Set state user log-in
        FE-->>User: Redirect ke Homepage / Halaman Utama
    end
```

### B. Alur Masuk Akun (Login)
```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (User)
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as Database (MySQL)

    User->>FE: Input Email & Password
    User->>FE: Klik tombol "Login"
    FE->>BE: POST /api/login (Body payload)
    
    opt Validasi & Pencarian Pengguna
        BE->>DB: SELECT * FROM users WHERE email = ?
        DB-->>BE: Mengembalikan data pengguna beserta hashed password
    end

    alt Pengguna Tidak Ditemukan
        BE-->>FE: Response (401, success: false, error: "Email atau password salah.")
        FE-->>User: Tampilkan pesan kesalahan
    else Pengguna Ditemukan
        opt Verifikasi Password & Pembuatan JWT
            BE->>BE: Komparasi password dengan hashed password (bcrypt.compare)
            
            alt Password Tidak Cocok
                BE-->>FE: Response (401, success: false, error: "Email atau password salah.")
            else Password Cocok
                BE->>BE: Tanda tangani Token JWT (expiresIn: 1d)
                BE-->>FE: Response (200, success: true, token, user_data tanpa password)
                FE->>FE: Simpan Token & Update Context Authentication
                FE-->>User: Redirect ke Halaman Riwayat/Utama
            end
        end
    end
```

---

## 2. Fitur: Reservasi Meja & Pemilihan Waktu (Table Reservation)

Fitur ini mencakup pengecekan meja yang sudah dipesan secara real-time pada waktu tertentu, pencegahan konflik bentrok meja, dan penyimpanan data reservasi yang terikat dengan pemesanan menu (*Cart Items*).

### A. Pengecekan Ketersediaan Meja (Check Availability)
```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan (User)
    participant FE as Halaman Reservasi (React)
    participant BE as Backend (Express)
    participant DB as Database (MySQL)

    User->>FE: Pilih Tanggal & Waktu Reservasi (misal: "04:00 PM")
    FE->>BE: GET /api/reservations/booked-tables?date=YYYY-MM-DD&time=04:00+PM
    
    opt Konversi Waktu & Pengecekan Jadwal
        BE->>BE: Parsing format waktu "04:00 PM" -> "16:00:00"
        note right of BE: Cari reservasi yang bentrok dalam rentang waktu < 90 menit
        BE->>DB: SELECT table_ids FROM reservations WHERE reservation_date = ? AND status IN ('pending', 'confirmed') AND (ABS(TIME_TO_SEC(TIMEDIFF(start_time, ?))) / 60 < 90)
        DB-->>BE: Mengembalikan baris table_ids (contoh: "T1, T2", "T3")
    end
    
    opt Ekstraksi Unique Table IDs
        BE->>BE: Split string IDs, trimming whitespace, & buat Set unik (contoh: ['T1', 'T2', 'T3'])
    end
    
    BE-->>FE: Response (200, success: true, data: ['T1', 'T2', 'T3'])
    FE->>FE: Filter visual layout meja (Nonaktifkan / beri warna merah pada meja T1, T2, T3)
    FE-->>User: Tampilkan layout meja dengan opsi meja tersedia yang bisa dipilih
```

### B. Pembuatan Reservasi & Pencegahan Bentrok Saat Checkout
```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan (User)
    participant FE as Checkout Page (React)
    participant BE as Backend (Express)
    participant DB as Database (MySQL)

    User->>FE: Memilih Meja (misal: T4), mengisi data tamu, & klik "Bayar Sekarang"
    FE->>BE: POST /api/orders (cartItems, notes, reservationData: { tables: ['T4'], date, time, guestCount })
    
    opt Pengecekan Konflik Akhir (Double-Booking Prevention)
        BE->>BE: Parsing format waktu (misal: "04:00 PM" -> "16:00:00")
        note right of BE: Cek konflik booking meja dalam radius 120 menit
        BE->>DB: SELECT table_ids FROM reservations WHERE reservation_date = ? AND status IN ('pending', 'confirmed') AND (ABS(TIME_TO_SEC(TIMEDIFF(start_time, ?))) / 60 < 120)
        DB-->>BE: Mengembalikan daftar meja terbooking
        BE->>BE: Validasi apakah 'T4' ada dalam daftar bentrok tersebut
    end

    alt Terjadi Bentrok (Meja Terburu Dipesan User Lain)
        BE-->>FE: Response (400, success: false, error: "Beberapa meja yang Anda pilih sudah dipesan...")
        FE-->>User: Tampilkan Popup peringatan pemilihan meja ulang
    else Meja Aman (Tersedia)
        opt Penyimpanan Transaksi Database (Atomic-like inserts)
            BE->>DB: INSERT INTO reservations (user_id, table_ids='T4', reservation_date, start_time, guest_count, status='pending')
            DB-->>BE: Mengembalikan insertId (Reservation ID)
            
            BE->>DB: INSERT INTO orders (user_id, reservation_id, items_json, total_price, notes, status='pending')
            DB-->>BE: Mengembalikan insertId (Order ID)
        end
        BE-->>FE: Response (200, success: true, orderId)
        FE->>FE: Arahkan ke proses transaksi pembayaran Midtrans
    end
```

---

## 3. Fitur: Kelola Menu Makanan (Admin Menu Management CRUD)

Bagian ini memaparkan alur admin mengelola menu makanan (menambah, memperbarui status ketersediaan, filter kategori, hingga penghapusan menu).

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant FE as Admin Dashboard (React)
    participant BE as Backend (Express)
    participant DB as Database (MySQL)

    %% ================== ALUR BACA MENU (READ) ==================
    Admin->>FE: Buka menu "Kelola Menu" (Mengisi search/filter kategori)
    FE->>BE: GET /api/admin/menu?search=suki&category=1&type=menu
    BE->>DB: SELECT i.*, c.label AS category_name FROM menu_items i LEFT JOIN categories c ON i.category_id = c.id WHERE i.name LIKE '%suki%' AND i.category_id = 1 AND i.type = 'menu'
    DB-->>BE: Data List Menu & Info Relasi Kategori
    BE->>DB: SELECT COUNT(*) as total FROM menu_items
    DB-->>BE: Total Baris Menu
    BE-->>FE: Response (200, success: true, data: List, total: X, categories: Y)
    FE-->>Admin: Tampilkan tabel interaktif kelola menu

    %% ================== ALUR TAMBAH MENU (CREATE) ==================
    Admin->>FE: Mengisi Form Menu Baru & klik "Simpan"
    FE->>BE: POST /api/admin/menu (name, description, price, category_id, image_url, is_available, type, badge)
    opt Pengecekan Field Wajib
        BE->>BE: Verifikasi ketersediaan (name, price, category_id)
    end
    BE->>DB: INSERT INTO menu_items (name, description, price, category_id, image_url, is_available, type, badge) VALUES (?,?,?,?,?,?,?,?)
    DB-->>BE: Mengembalikan insertId
    BE-->>FE: Response (200, success: true, id)
    FE-->>Admin: Tampilkan toast "Menu Baru Berhasil Ditambahkan!"

    %% ================== ALUR PERBARUI MENU (UPDATE) ==================
    Admin->>FE: Edit field menu / ubah tombol toggle "Tersedia"
    FE->>BE: PUT /api/admin/menu/:id (Data Update)
    BE->>DB: UPDATE menu_items SET name=?, description=?, price=?, category_id=?, image_url=?, is_available=?, type=?, badge=? WHERE id=?
    DB-->>BE: Konfirmasi Update Berhasil
    BE-->>FE: Response (200, success: true)
    FE-->>Admin: Tampilkan toast "Menu Berhasil Diperbarui!"

    %% ================== ALUR HAPUS MENU (DELETE) ==================
    Admin->>FE: Klik ikon "Hapus" pada salah satu menu
    FE->>BE: DELETE /api/admin/menu/:id
    BE->>DB: DELETE FROM menu_items WHERE id = ?
    DB-->>BE: Konfirmasi Baris Terhapus
    BE-->>FE: Response (200, success: true)
    FE-->>Admin: Hapus baris dari tabel & Tampilkan notifikasi sukses
```

---

### Penjelasan Struktur File:
- **Authentication**: Mengamankan kata sandi menggunakan `bcryptjs` (Hashing satu arah) sebelum masuk ke database, lalu menggunakan tanda tangan JWT (*JSON Web Token*) untuk identitas *session* pelanggan yang kedaluwarsa dalam 1 hari.
- **Reservasi**: Menyediakan perlindungan tumpang tindih waktu (*overlapping prevention*) dalam cakupan 90-120 menit agar tidak ada dua pelanggan berbeda memesan meja yang sama di waktu yang hampir bersamaan.
- **Menu CRUD**: Memudahkan admin memantau seluruh katalog produk (menu reguler maupun paket) dengan pencarian dinamis yang terintegrasi penuh ke database MySQL.
