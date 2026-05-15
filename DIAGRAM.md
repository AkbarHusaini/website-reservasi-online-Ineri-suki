# Dokumentasi Arsitektur Sistem Ineri Suki & Grill (Versi Skripsi)

Dokumentasi ini dirancang untuk memenuhi standar teknis karya ilmiah/skripsi, menjelaskan interaksi antar komponen sistem secara mendalam termasuk fitur **Batas Waktu Pembayaran 15 Menit**.

---

## 1. Use Case Diagram
Menjelaskan fungsionalitas sistem dari sudut pandang aktor (User & Admin).

```mermaid
graph LR
    subgraph Pelanggan
        U((User))
    end

    subgraph "Sistem Reservasi Ineri"
        UC1(Registrasi & Login)
        UC2(Melihat Menu)
        UC3(Melakukan Reservasi Meja)
        UC4(Melakukan Pembayaran)
        UC5(Melihat Riwayat Pesanan)
        UC6(Mengelola Menu CRUD)
        UC7(Mengelola Pesanan & Pembatalan)
        UC8(Dashboard Laporan)
    end

    subgraph Admin
        A((Admin))
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

## 2. Activity Diagram: Alur Reservasi & Pembayaran (Update: Timer 15 Menit)
Menjelaskan aliran aktivitas user termasuk penanganan kedaluwarsa pesanan.

```mermaid
flowchart TD
    Start([Mulai]) --> Login[Login ke Sistem]
    Login --> Browse[Pilih Menu & Meja]
    Browse --> Check{Meja Tersedia?}
    
    Check -- Tidak --> Browse
    Check -- Ya --> Create[Buat Pesanan & Simpan Waktu Buat]
    
    Create --> Timer[Mulai Timer 15 Menit]
    Timer --> Pay[Proses Bayar - Midtrans Snap]
    
    Pay --> ExpireCheck{Waktu Habis?}
    ExpireCheck -- Ya --> Cancel[Status Otomatis: Dibatalkan]
    ExpireCheck -- Tidak --> Result{Transaksi Sukses?}
    
    Result -- Ya --> Update[Update DB: Lunas & Konfirmasi]
    Result -- Tidak/Tutup --> MyOrder[Masuk Menu Pesanan Saya]
    
    Cancel --> End([Selesai])
    Update --> SuccessModal[Muncul Modal Terimakasih]
    SuccessModal --> End
```

---

## 3. Sequence Diagram: Alur Utama dengan Pengecekan Expiry
Diagram ini mencakup validasi waktu 15 menit di sisi Backend.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React.js)
    participant BE as Backend (Node.js/Express)
    participant DB as MySQL Database
    participant PG as Midtrans Snap API

    Note over User, DB: TAHAP 1: PEMESANAN
    User->>FE: Klik Checkout
    FE->>BE: POST /api/orders
    BE->>DB: INSERT orders (created_at: NOW)
    DB-->>BE: Order ID: 59
    BE-->>FE: HTTP 201 (Order Created)

    Note over User, DB: TAHAP 2: PEMBAYARAN & TIMER
    FE->>FE: Jalankan Countdown Timer (15:00)
    FE->>BE: POST /api/payments/create-transaction
    BE->>PG: Request Snap Token (expiry: 15m)
    PG-->>BE: Return Snap Token
    BE-->>FE: Return Snap Token

    Note over User, DB: TAHAP 3: VALIDASI KEDALUWARSA
    User->>FE: Klik "Bayar Sekarang"
    FE->>BE: GET /api/payments/status/:id?simulate=true
    
    BE->>DB: SELECT created_at FROM orders
    DB-->>BE: 2024-05-15 12:00:00
    
    alt Jika Waktu > 15 Menit
        BE->>DB: UPDATE orders SET status='cancelled'
        BE-->>FE: Error (Waktu Habis)
        FE->>User: Tampilkan Pesan Pesanan Dibatalkan
    else Jika Waktu < 15 Menit
        BE->>DB: UPDATE orders SET status='paid'
        BE-->>FE: Success (Lunas)
        FE->>User: Muncul Modal Terimakasih
    end
```

---

## 4. Komponen Teknologi (Stack)
- **Frontend**: React.js (Vite), TailwindCSS.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (Aiven Cloud / Local).
- **Payment Gateway**: Midtrans Snap API (dengan Expiry Parameter).
- **Security**: JSON Web Token (JWT).
