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

## 3. Sequence Diagram (Berdasarkan Fitur Utama)

### A. Fitur Reservasi Meja & Validasi Sesi (Overlap 120 Menit)
Fitur ini menjamin tidak ada bentrokan meja. Sesi 90 menit dengan buffer blokir sesi berikutnya (Total overlap check 120 menit).

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Halaman Reservasi
    participant BE as Backend API
    participant DB as MySQL Database

    User->>FE: Pilih Tanggal & Sesi (Misal: 12:30)
    FE->>BE: GET /api/booked?date=...&time=12:30
    BE->>DB: SELECT table_ids FROM reservations WHERE time_overlap (< 120 min)
    DB-->>BE: List Meja Terpakai [T1, T5]
    BE-->>FE: Return Booked IDs
    FE->>FE: Disable Meja T1 & T5 (Warna Abu-abu/Grayscale)
    
    Note over User, FE: Validasi Jam Lewat
    FE->>FE: Cek Jam Sekarang vs 12:30
    alt Jika Jam Sekarang > 12:30
        FE->>User: Set Slot "Passed" & Disabled
    else Jika Jam Sekarang < 12:30
        FE->>User: Aktifkan Slot & Bisa Diklik
    end
```

### B. Fitur Pembayaran Berwaktu (15 Menit) & Midtrans
Fitur inti yang mengelola urgensi transaksi menggunakan Snap Token.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Checkout Page
    participant BE as Backend API
    participant PG as Midtrans Snap

    User->>FE: Klik "Bayar Sekarang"
    FE->>BE: POST /api/payments/create-transaction
    BE->>PG: Request Token (expiry: 15m)
    PG-->>BE: Snap Token & Midtrans Order ID
    BE->>DB: UPDATE orders SET midtrans_order_id
    BE-->>FE: Return Snap Token
    
    FE->>FE: Start UI Timer (15:00)
    FE->>PG: Tampilkan Snap Modal
    
    alt User Bayar Tepat Waktu
        User->>PG: Selesaikan Pembayaran
        PG-->>BE: Webhook / Notification (Settlement)
        BE->>DB: UPDATE orders SET status='paid', was_paid=1
        BE-->>FE: Success Modal (Auto-Refresh)
    else Waktu Habis
        FE->>BE: GET /api/payments/status/:id (Cek Real-time)
        BE->>DB: UPDATE status='cancelled'
        BE->>User: Notifikasi: Pesanan Dibatalkan
    end
```

### C. Fitur Riwayat & Detail Refund
Menjelaskan bagaimana user mengirimkan detail rekening untuk refund jika pesanan batal tapi sudah bayar.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as MyOrders Page
    participant BE as Backend API
    participant DB as MySQL Database

    User->>FE: Buka Menu "Pesanan Saya"
    FE->>BE: GET /api/my-orders
    BE->>DB: SELECT status, was_paid FROM orders
    DB-->>BE: Data [Status: cancelled, was_paid: 1]
    BE-->>FE: Return Order Data
    
    Note over FE: Logika Tombol Refund
    alt Jika status='cancelled' AND was_paid=1
        FE->>User: Munculkan Form "Input Detail Refund"
        User->>FE: Masukkan Bank & No Rekening
        FE->>BE: POST /api/orders/:id/submit-refund
        BE->>DB: UPDATE orders SET refund_status='pending', notes=...
        BE-->>FE: Notifikasi Berhasil
    else Jika was_paid=0
        FE->>User: Sembunyikan Fitur Refund
    end
```

---

## 4. Sequence Diagram (Sisi Admin - Per Fitur)

### A. Fitur Manajemen Menu & Kontrol Stok
Menjelaskan bagaimana Admin mengelola ketersediaan menu.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE as Admin Menu Page
    participant BE as Backend API
    participant DB as MySQL Database

    Admin->>FE: Klik "Edit Menu" / "Toggle Status"
    FE->>BE: PUT /api/admin/menu/:id
    BE->>BE: Verify Admin Token (JWT)
    BE->>DB: UPDATE menus SET is_available = ?
    DB-->>BE: Success Updated
    BE-->>FE: Notifikasi: "Perubahan Disimpan"
```

### B. Fitur Monitoring & Konfirmasi Reservasi
Menjelaskan alur Admin dalam memantau dan mengubah status reservasi secara manual.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE as Admin Reservation Page
    participant BE as Backend API
    participant DB as MySQL Database

    Admin->>FE: Buka Daftar Reservasi
    FE->>BE: GET /api/admin/reservations
    BE->>DB: SELECT * FROM reservations JOIN users
    DB-->>BE: Data Reservasi [Pending/Confirmed]
    BE-->>FE: Tampilkan Tabel Reservasi
    
    Admin->>FE: Klik "Edit" -> Ubah Status ke 'confirmed'
    FE->>BE: PUT /api/admin/reservations/:id
    BE->>DB: UPDATE reservations SET status='confirmed'
    DB-->>BE: Updated
    BE-->>FE: Refresh UI & Sync status ke Orders
```

### C. Fitur Dashboard & Statistik Real-time
Menjelaskan bagaimana dashboard menarik data ringkasan untuk performa resto.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE as Admin Dashboard
    participant BE as Backend API
    participant DB as MySQL Database

    Admin->>FE: Masuk ke Dashboard
    FE->>BE: GET /api/admin/stats (Internal logic)
    
    par Hitung Data
        BE->>DB: SELECT COUNT(*) FROM menus
        BE->>DB: SELECT COUNT(*) FROM reservations WHERE date=TODAY
        BE->>DB: SELECT COUNT(*) FROM orders WHERE status='pending'
    end

    DB-->>BE: Data Ringkasan (Total Menu, Reservasi, Order)
    BE-->>FE: Return JSON (stats)
    FE->>Admin: Tampilkan Angka Statistik di Card
```

---

## 5. Aturan Bisnis & Kebijakan Sistem (Updated)
- **Sesi Reservasi**: Slot 90 Menit (60 Menit makan + 30 Menit bersih-bersih).
- **Blokir Overlap**: Sistem mengecek bentrokan dalam rentang **120 Menit** untuk memastikan jeda antar pelanggan aman.
- **Batas Pembayaran**: **15 Menit** sejak order dibuat. Jika lewat, status otomatis `cancelled`.
- **Booking Fee**: Rp 10.000 per meja. Jika terjadi pembatalan (No-Show), kebijakan internal menyatakan **Rp 5.000 hangus** (sebagai denda slot), sisa dana paket dikembalikan.
- **Validasi Refund**: Hanya muncul jika `was_paid = 1` dan status pesanan `cancelled`.
- **Keamanan**: Akses Admin dilindungi Middleware JWT dan pengecekan `role = 'admin'`.
