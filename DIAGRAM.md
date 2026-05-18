# Dokumentasi Arsitektur Sistem Ineri Suki & Grill (Edisi Skripsi - Per Fitur)

---

## 1. Use Case Diagram
Menjelaskan fungsionalitas sistem secara garis besar.

```mermaid
graph LR
    subgraph Pelanggan
        U((User))
    end

    subgraph "Sistem Reservasi Ineri"
        UC1(Registrasi & Login)
        UC2(Melihat Menu & Paket)
        UC3(Reservasi Meja & Sesi)
        UC4(Pembayaran Midtrans)
        UC5(Riwayat & Ajukan Refund)
    end

    subgraph Admin
        A((Admin))
    end

    subgraph "Fitur Admin"
        UC6(Manajemen Menu & Stok)
        UC7(Manajemen Meja & Status)
        UC8(Monitoring Pesanan & Refund)
    end

    U --- UC1
    U --- UC2
    U --- UC3
    U --- UC4
    U --- UC5

    A --- UC1
    A --- UC6
    A --- UC7
    A --- UC8
```

---

## 2. Activity Diagram: Alur Utama Sistem
Menjelaskan aliran aktivitas user dari awal hingga akhir.

```mermaid
flowchart TD
    Start([Mulai]) --> Browse[Pilih Meja & Waktu]
    Browse --> Check{Tersedia?}
    Check -- Tidak --> Browse
    Check -- Ya --> Checkout[Buat Pesanan & Timer 15 Menit]
    Checkout --> Pay[Proses Bayar Midtrans]
    Pay --> Expire{Waktu Habis?}
    Expire -- Ya --> Cancel[Batal Otomatis]
    Expire -- Tidak --> Success{Berhasil?}
    Success -- Ya --> Update[Update DB: Paid & confirmed]
    Success -- Tidak --> History[Simpan di Riwayat]
    Update --> End([Selesai])
    Cancel --> End
```

---

## 3. Sequence Diagram (Berdasarkan Fitur Utama - Sisi User)

### A. Fitur Reservasi Meja & Validasi Sesi (Overlap 120 Menit)
Fitur ini menjamin tidak ada bentrokan meja. Sistem mengecek ketersediaan secara real-time pada jam reservasi (sesi 90 menit dengan toleransi bentrok overlap 120 menit).

```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan (User)
    participant FE as Halaman Reservasi (React)
    participant BE as Backend API (Express)
    participant DB as MySQL Database

    User->>FE: Pilih Tanggal & Sesi Waktu (misal: "04:00 PM")
    FE->>BE: GET /api/reservations/booked-tables?date=YYYY-MM-DD&time=04:00+PM
    
    opt Validasi Format & Query Overlap
        BE->>BE: Konversi "04:00 PM" -> "16:00:00" (start_time)
        note right of BE: Cek bentrokan jadwal aktif dalam rentang < 90 menit
        BE->>DB: SELECT table_ids FROM reservations WHERE reservation_date = ? AND status IN ('pending', 'confirmed') AND (ABS(TIME_TO_SEC(TIMEDIFF(start_time, ?))) / 60 < 90)
        DB-->>BE: Mengembalikan daftar table_ids (misal: "T1, T2", "T5")
        BE->>BE: Split comma-separated IDs, trimming whitespace & buat Set unik: ['T1', 'T2', 'T5']
    end
    
    BE-->>FE: Response (200, success: true, data: ['T1', 'T2', 'T5'])
    FE->>FE: Disable meja T1, T2, T5 (ubah warna jadi abu-abu/disabled)
    FE-->>User: Tampilkan layout meja interaktif (hanya meja tersedia yang bisa dipilih)
    
    User->>FE: Pilih meja aman (misal: 'T4') & Klik Checkout
    FE->>BE: POST /api/orders (cartItems, notes, reservationData: { tables: ['T4'], date, time, guestCount })
    
    opt Validasi Konflik Detik Terakhir (Double-Booking Prevention)
        note right of BE: Cek bentrokan meja terpilih dengan jeda overlap 120 menit
        BE->>DB: SELECT table_ids FROM reservations WHERE reservation_date = ? AND status IN ('pending', 'confirmed') AND (ABS(TIME_TO_SEC(TIMEDIFF(start_time, ?))) / 60 < 120)
        DB-->>BE: Mengembalikan baris table_ids yang sedang aktif
        BE->>BE: Cek apakah 'T4' ada dalam daftar meja bentrok tersebut
    end

    alt Meja Sudah Dipesan User Lain
        BE-->>FE: Response (400, success: false, error: "Beberapa meja yang Anda pilih sudah dipesan...")
        FE-->>User: Tampilkan peringatan bentrok (Meja merah / pilih ulang)
    else Meja Tersedia
        opt Simpan Reservasi & Order Baru
            BE->>DB: INSERT INTO reservations (user_id, table_ids='T4', reservation_date, start_time, guest_count, status='pending')
            DB-->>BE: Mengembalikan Reservation ID
            BE->>DB: INSERT INTO orders (user_id, reservation_id, items_json, total_price, notes, status='pending')
            DB-->>BE: Mengembalikan Order ID
        end
        BE-->>FE: Response (200, success: true, orderId)
        FE-->>User: Arahkan pelanggan ke halaman transaksi pembayaran
    end
```

---

### B. Fitur Pembayaran Berwaktu (15 Menit) & Midtrans
Mengelola batas waktu penyelesaian pembayaran sejak pemesanan dibuat menggunakan sistem Snap Token Midtrans.

```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan (User)
    participant FE as Halaman Checkout (React)
    participant BE as Backend API (Express)
    participant DB as MySQL Database
    participant PG as Midtrans Gateway

    User->>FE: Klik "Bayar Sekarang"
    FE->>BE: POST /api/payments/create-transaction (Body: orderId, amount, customerDetails)
    
    opt Penyiapan Data Transaksi & Pajak
        BE->>DB: SELECT * FROM orders WHERE id = orderId
        DB-->>BE: Data Order (items_json, total_price)
        BE->>BE: Parse items_json, hitung Pajak (10%) & Service Fee (5%)
        BE->>BE: Bangun parameter transaksi Midtrans (expiry set: 15 menit)
    end
    
    rect rgb(40, 40, 40)
        BE->>PG: Request Snap Token (snap.createTransaction(parameter))
        PG-->>BE: Mengembalikan Snap Token & midtrans_order_id
        BE->>DB: UPDATE orders SET midtrans_order_id = ? WHERE id = ?
    end
    
    BE-->>FE: Response (200, success: true, snapToken)
    
    FE->>FE: Mulai Hitung Mundur UI Timer (15:00 menit)
    FE->>PG: Buka Snap Modal Popup (window.snap.pay(token))
    PG-->>User: Tampilkan Panel Pembayaran Midtrans (Virtual Account/Gopay)
    
    alt Aksi 1: User Bayar Tepat Waktu (< 15 menit)
        User->>PG: Selesaikan Pembayaran di Aplikasi Bank/E-wallet
        
        rect rgb(40, 40, 40)
            PG->>BE: Webhook / Notification (transaction_status: settlement/capture)
            BE->>BE: Verifikasi keabsahan notifikasi (snap.transaction.notification)
            BE->>DB: UPDATE orders SET status='paid', was_paid=1 WHERE id = orderId
            BE->>DB: UPDATE reservations SET status='confirmed' WHERE id = reservationId
            BE-->>PG: Response OK (200)
        end
        
        FE->>BE: GET /api/payments/status/:orderId (Polling / Cek Manual)
        BE->>DB: SELECT status FROM orders WHERE id = orderId
        DB-->>BE: Status: 'paid'
        BE-->>FE: Response (success: true, newStatus: 'paid')
        FE-->>User: Tampilkan Modal Sukses & Arahkan ke halaman Sukses
        
    else Aksi 2: Waktu Habis / Pembayaran Kedaluwarsa (> 15 menit)
        FE->>BE: GET /api/payments/status/:orderId
        BE->>DB: SELECT status, created_at, reservation_id FROM orders WHERE id = orderId
        DB-->>BE: Data Order
        
        opt Cek Kedaluwarsa & Pembatalan Otomatis
            BE->>BE: Hitung selisih waktu (Sekarang - created_at) > 15 menit
            BE->>DB: UPDATE orders SET status='cancelled' WHERE id = orderId
            BE->>DB: UPDATE reservations SET status='cancelled' WHERE id = reservationId
        end
        
        BE-->>FE: Response (success: false, message: "Waktu habis. Pesanan dibatalkan.", status: 'cancelled')
        FE->>FE: Tutup Snap Modal & Hentikan Timer
        FE-->>User: Tampilkan Pesan "Waktu Pembayaran Habis / Pesanan Dibatalkan"
    end
```

---

### C. Fitur Riwayat & Detail Refund (User Side)
Menjelaskan bagaimana pelanggan mengirimkan data detail rekening bank jika pesanan dibatalkan (`cancelled`) namun sudah sempat terbayar (`was_paid = 1`).

```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan (User)
    participant FE as Pesanan Saya (React)
    participant BE as Backend API (Express)
    participant DB as MySQL Database

    User->>FE: Masuk ke Tab Halaman "Pesanan Saya"
    FE->>BE: GET /api/my-orders (Header: Authorization Bearer Token)
    
    opt Otentikasi & Pengambilan Data
        BE->>BE: Verifikasi Token JWT (authenticateToken)
        BE->>DB: SELECT o.*, r.reservation_date FROM orders o LEFT JOIN reservations r ON o.reservation_id = r.id WHERE o.user_id = ?
        DB-->>BE: Daftar data transaksi pesanan user
    end
    
    BE-->>FE: Response (success: true, data: formattedOrders)
    FE->>FE: Periksa Status tiap Order untuk validasi tombol Refund
    
    alt Logika: Jika order.status = 'cancelled' DAN order.was_paid = 1
        FE->>User: Munculkan Tombol "Ajukan Refund"
        User->>FE: Klik tombol & masukkan Nama Bank, No Rekening, A/N Rekening
        FE->>BE: POST /api/orders/:id/submit-refund (Body: bank_name, account_number, account_name)
        
        opt Simpan Data Refund Rekening Pelanggan
            BE->>DB: SELECT * FROM orders WHERE id = :id AND user_id = :userId
            DB-->>BE: Data Validasi Order
            
            alt Update Kolom Refund (Ideal)
                BE->>DB: UPDATE orders SET refund_bank_name=?, refund_account_number=?, refund_account_name=?, refund_status='pending' WHERE id=?
            else Fallback: Gabung ke Notes (Skema Database Lama)
                BE->>DB: UPDATE orders SET notes='[REFUND REQUEST]...', refund_status='pending' WHERE id=?
            end
            DB-->>BE: Konfirmasi Penyimpanan Berhasil
        end
        
        BE-->>FE: Response (200, success: true, message: "Detail refund berhasil dikirim")
        FE-->>User: Tampilkan Label Status: "Refund Pending"
    else Jika order.was_paid = 0 (Belum terbayar / Expired)
        FE->>User: Sembunyikan Opsi Form Refund
    end
```

---

## 4. Sequence Diagram (Sisi Admin - Per Fitur)

### A. Fitur Manajemen Menu & Kontrol Stok
Menjelaskan bagaimana Admin mengelola menu makanan, memperbarui ketersediaan bahan/stok secara real-time.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant FE as Panel Kelola Menu (React)
    participant BE as Backend API (Express)
    participant DB as MySQL Database

    Admin->>FE: Klik tombol "Tambah Menu Baru" atau pilih "Edit" pada salah satu menu
    FE->>BE: GET /api/admin/menu?search=...&category=... (Cari/Muat Ulang)
    BE->>DB: SELECT i.*, c.label AS category_name FROM menu_items i LEFT JOIN categories c ON i.category_id = c.id
    DB-->>BE: Mengembalikan daftar menu
    BE-->>FE: Response daftar menu lengkap (termasuk item tidak aktif)
    
    alt Kasus 1: Perubahan Status Ketersediaan (Stock Control)
        Admin->>FE: Klik Toggle Switch "Tersedia" / "Habis"
        FE->>BE: PUT /api/admin/menu/:id (Body: { is_available: false, ... })
        BE->>BE: Verifikasi Token Admin JWT (role === 'admin')
        BE->>DB: UPDATE menu_items SET is_available = 0 WHERE id = :id
        DB-->>BE: Konfirmasi Terupdate
        BE-->>FE: Response (success: true)
        FE-->>Admin: Perbarui Status Visual di Tabel Menu & Beri Toast Berhasil
        
    else Kasus 2: Menghapus Menu Makanan
        Admin->>FE: Klik tombol "Hapus Menu" & Konfirmasi Ya
        FE->>BE: DELETE /api/admin/menu/:id
        BE->>DB: DELETE FROM menu_items WHERE id = :id
        DB-->>BE: Konfirmasi Baris Terhapus
        BE-->>FE: Response (success: true)
        FE-->>Admin: Hapus item dari daftar UI & Munculkan Toast Sukses
    end
```

---

### B. Fitur Monitoring & Konfirmasi Reservasi
Menjelaskan alur Admin dalam memantau seluruh transaksi pemesanan masuk dan mengubah status reservasi pelanggan secara manual.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant FE as Panel Pemesanan (React)
    participant BE as Backend API (Express)
    participant DB as MySQL Database

    Admin->>FE: Masuk ke halaman "Daftar Pemesanan/Reservasi"
    FE->>BE: GET /api/admin/orders
    
    opt Muat Seluruh Riwayat Pesanan Global
        BE->>DB: SELECT o.*, u.name, r.reservation_date, r.table_ids FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN reservations r ON o.reservation_id = r.id ORDER BY o.created_at DESC
        DB-->>BE: Data Order lengkap pelanggan
    end
    
    BE-->>FE: Response (200, success: true, data)
    FE-->>Admin: Tampilkan daftar transaksi terurut terbaru
    
    Admin->>FE: Klik "Ubah Status" ke 'paid' / 'served' atau membatalkan manual
    FE->>BE: PUT /api/admin/orders/:id (Body: { status: 'paid' })
    
    opt Sinkronisasi Status Transaksi dengan Jadwal Meja
        BE->>DB: UPDATE orders SET status = 'paid' WHERE id = :id
        
        alt Jika status diset 'paid' atau 'served'
            BE->>DB: UPDATE reservations SET status = 'confirmed' WHERE id = (SELECT reservation_id FROM orders WHERE id = :id)
        else Jika status diset 'cancelled'
            BE->>DB: UPDATE reservations SET status = 'cancelled' WHERE id = (SELECT reservation_id FROM orders WHERE id = :id)
        end
        DB-->>BE: Konfirmasi Sinkronisasi DB Berhasil
    end
    
    BE-->>FE: Response (200, success: true)
    FE->>FE: Refresh data daftar pesanan di UI
    FE-->>Admin: Perbarui label status transaksi di layar
```

---

### C. Fitur Dashboard & Statistik Real-time
Menjelaskan proses pengumpulan statistik performa restoran secara ringkas dan real-time pada dashboard utama admin.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant FE as Admin Dashboard (React)
    participant BE as Backend API (Express)
    participant DB as MySQL Database

    Admin->>FE: Masuk ke Halaman Utama Dashboard Admin
    
    par Muat Data Statistik Menu
        FE->>BE: GET /api/admin/menu (Ambil Ringkasan Data Menu)
        BE->>DB: SELECT COUNT(*) as total FROM menu_items
        DB-->>BE: Jumlah total produk
        BE->>DB: SELECT COUNT(*) as cats FROM categories
        DB-->>BE: Jumlah total kategori
        BE-->>FE: Response (total menu & categories)
    and Muat Data Transaksi Aktif
        FE->>BE: GET /api/admin/orders (Ambil Data Order)
        BE->>DB: SELECT * FROM orders ...
        DB-->>BE: List orders lengkap
        BE-->>FE: Response data list orders
    end
    
    opt Kalkulasi Statistik Real-time di Frontend
        FE->>FE: Hitung total transaksi aktif (status pending)
        FE->>FE: Hitung total order selesai & pendapatan hari ini
    end
    
    FE-->>Admin: Render grafik performa restoran & Angka Statistik di Card Dashboard
```

---

## 5. Aturan Bisnis & Kebijakan Sistem (Skripsi Verified)
- **Sesi Reservasi**: Durasi slot reservasi adalah **90 Menit** (terbagi atas 60 menit durasi makan pelanggan + 30 menit pembersihan & penyiapan meja kembali).
- **Blokir Overlap**: Sistem backend secara ketat memblokir pemesanan meja yang bentrok dalam rentang **120 Menit** untuk memastikan adanya waktu jeda pembersihan yang aman bagi meja bersangkutan.
- **Batas Pembayaran**: Waktu penyelesaian pembayaran adalah **15 Menit** sejak pesanan pertama kali dibuat. Jika lewat 15 menit dan status masih *pending*, status pesanan & reservasi otomatis diubah menjadi `cancelled`.
- **Kebijakan Booking Fee**: Nilai booking fee sebesar Rp 10.000 per meja. Jika terjadi pembatalan/dibatalkan manual oleh admin, kebijakan restoran menetapkan **Rp 5.000 hangus** sebagai denda slot, sedangkan sisa uang pembayaran menu akan dikembalikan utuh.
- **Validasi Refund**: Menu input refund hanya akan muncul bagi pelanggan jika pesanan tersebut berstatus `cancelled` namun telah terbayar (`was_paid = 1`).
- **Otentikasi & Keamanan**: Akses dashboard admin diproteksi secara berlapis menggunakan Middleware JWT, memverifikasi tanda tangan session JWT, dan mencocokkan hak akses pengguna (`role === 'admin'`).
