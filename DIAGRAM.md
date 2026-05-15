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
        UC8(Monitoring Pesanan)
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
    Success -- Ya --> Update[Update DB: Paid]
    Success -- Tidak --> History[Simpan di Riwayat]
    Update --> End([Selesai])
    Cancel --> End
```

---

## 3. Sequence Diagram (Berdasarkan Fitur Utama)

### A. Fitur Reservasi Meja & Validasi Sesi (90 Menit)
Fitur ini menjamin tidak ada bentrokan meja dan waktu yang sudah lewat tidak bisa dipilih.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Halaman Reservasi
    participant BE as Backend API
    participant DB as MySQL Database

    User->>FE: Pilih Tanggal & Sesi (Misal: 12:30)
    FE->>BE: GET /api/booked-tables?date=...&time=12:30
    BE->>DB: SELECT table_ids FROM reservations WHERE time_overlap (90 min)
    DB-->>BE: List Meja Terpakai [T1, T5]
    BE-->>FE: Return Booked IDs
    FE->>FE: Disable Meja T1 & T5 (Warna Merah)
    
    Note over User, FE: Validasi Jam Lewat
    FE->>FE: Cek Jam Sekarang vs 12:30
    alt Jika Jam Sekarang > 12:30
        FE->>User: Set Slot "Passed" & Disabled
    else Jika Jam Sekarang < 12:30
        FE->>User: Aktifkan Slot & Bisa Diklik
    end
```

### B. Fitur Pembayaran Berwaktu (15 Menit) & Midtrans
Fitur inti yang mengelola urgensi transaksi.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Checkout Page
    participant BE as Backend API
    participant PG as Midtrans Snap

    User->>FE: Klik "Bayar Sekarang"
    FE->>BE: POST /api/payments/create-token
    BE->>PG: Request Token (expiry_duration: 15m)
    PG-->>BE: Snap Token
    BE-->>FE: Return Snap Token
    
    FE->>FE: Start UI Timer (15:00)
    FE->>PG: Tampilkan Snap Modal
    
    alt User Bayar Tepat Waktu
        User->>PG: Selesaikan Pembayaran
        PG-->>BE: Webhook: Settlement
        BE-->>FE: Success Modal (Auto-Refresh)
    else Waktu Habis
        FE->>BE: POST /api/cancel-order (Expired)
        BE->>User: Notifikasi: Pesanan Dibatalkan
    end
```

### C. Fitur Riwayat & Validasi Refund (Keamanan Dana)
Menjelaskan mengapa refund hanya muncul jika pesanan benar-benar pernah dibayar.

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
    DB-->>BE: Data [Status: Cancelled, was_paid: 1]
    BE-->>FE: Return Order Data
    
    Note over FE: Logika Tombol Refund
    alt Jika status='cancelled' AND was_paid=1
        FE->>User: Munculkan Tombol "Ajukan Refund"
    else Jika status='pending' OR was_paid=0
        FE->>User: Sembunyikan Tombol Refund
    end
```

---

## 4. Full Admin System Sequence Diagram
Diagram integrasi untuk seluruh akses manajemen admin.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE as Admin Panel
    participant BE as Backend API
    participant DB as MySQL Database

    Admin->>FE: Login Admin
    FE->>BE: POST /api/auth/login
    BE-->>FE: JWT Token Admin
    
    Admin->>FE: Buka Dashboard
    FE->>BE: GET /api/admin/stats
    BE->>DB: COUNT Menu, Order, Reservation
    DB-->>BE: Stats Data
    BE-->>FE: Tampilkan Statistik

    Admin->>FE: Update Status Menu (is_available)
    FE->>BE: PUT /api/admin/menu/:id
    BE->>DB: UPDATE menu_items SET is_available=0
    BE-->>FE: Success
```

---

## 5. Aturan Bisnis & Kebijakan Sistem
- **Sesi Reservasi**: 60 Menit makan + 30 Menit bersih-bersih (Total 90 Menit blokir).
- **Batas Pembayaran**: 15 Menit flat.
- **Validasi Refund**: Hanya untuk pesanan dengan flag `was_paid = 1`.
- **Keamanan**: Akses Admin dilindungi JWT (JSON Web Token).
