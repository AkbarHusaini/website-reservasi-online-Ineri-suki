# Dokumentasi Arsitektur Sistem Ineri Suki & Grill (Versi Skripsi)

Dokumentasi ini dirancang untuk memenuhi standar teknis karya ilmiah/skripsi, menjelaskan interaksi antar komponen sistem secara mendalam.

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
        UC7(Mengelola Pesanan)
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

## 2. Activity Diagram: Alur Reservasi & Pembayaran
Menjelaskan aliran aktivitas user dari mulai memilih menu hingga pembayaran selesai.

```mermaid
flowchart TD
    Start([Mulai]) --> Login[Login ke Sistem]
    Login --> Browse[Pilih Menu & Meja]
    Browse --> Check{Meja Tersedia?}
    
    Check -- Tidak --> Browse
    Check -- Ya --> Create[Buat Pesanan & Reservasi]
    
    Create --> Pay[Proses Bayar - Midtrans Snap]
    Pay --> Result{Status Transaksi}
    
    Result -- Sukses/Ditutup --> Update[Update DB: Lunas & Konfirmasi]
    Result -- Gagal --> MyOrder[Masuk Menu Pesanan Saya]
    
    Update --> SuccessModal[Muncul Modal Terimakasih]
    SuccessModal --> End([Selesai])
```

---

## 3. Sequence Diagram: Alur Utama Sistem (End-to-End)
Diagram ini mencakup proses Autentikasi, Reservasi, Cek Ketersediaan, hingga Pembayaran.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React.js)
    participant BE as Backend (Node.js/Express)
    participant JWT as Middleware (Auth)
    participant DB as MySQL Database
    participant PG as Midtrans Snap API

    Note over User, DB: TAHAP 1: AUTENTIKASI
    User->>FE: Input Email & Password
    FE->>BE: POST /api/login
    BE->>DB: Query User Match?
    DB-->>BE: User Data Found
    BE->>BE: Generate JWT Token
    BE-->>FE: HTTP 200 (JWT Token)
    FE->>FE: Simpan Token di LocalStorage

    Note over User, DB: TAHAP 2: RESERVASI & PEMESANAN
    User->>FE: Pilih Menu & Pilih Meja (Tanggal/Jam)
    FE->>BE: POST /api/orders (Data Keranjang + Meja)
    BE->>JWT: Validasi JWT Token
    JWT-->>BE: Authorized (User ID)
    
    BE->>DB: SELECT * FROM reservations (Cek Konflik Meja)
    alt Meja Tersedia
        DB-->>BE: No Conflict
        BE->>DB: INSERT INTO reservations (Status: pending)
        BE->>DB: INSERT INTO orders (Status: pending)
        BE-->>FE: HTTP 201 (Order ID)
    else Meja Penuh
        DB-->>BE: Conflict Found
        BE-->>FE: HTTP 400 (Meja sudah dipesan)
    end

    Note over User, PG: TAHAP 3: TRANSAKSI & PEMBAYARAN
    FE->>BE: POST /api/payments/create-transaction
    BE->>PG: Request Snap Token (API Request)
    PG-->>BE: Return Snap Token
    BE-->>FE: Return Snap Token to Client
    
    User->>FE: Klik "Bayar Sekarang"
    FE->>PG: Open Snap UI (Pop-up)
    User->>PG: Pilih Metode & Selesaikan Transaksi
    PG-->>FE: Callback (Transaction Finished)

    Note over User, DB: TAHAP 4: SINKRONISASI STATUS
    FE->>BE: GET /api/payments/status/:id?simulate=true
    BE->>DB: UPDATE orders (status: paid)
    BE->>DB: UPDATE reservations (status: confirmed)
    DB-->>BE: Update Success
    BE-->>FE: HTTP 200 (Status Lunas)
    FE->>User: Tampilkan Modal Sukses & Terimakasih
```

---

## 4. Komponen Teknologi (Stack)
- **Frontend**: React.js (Vite), TailwindCSS.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (Aiven Cloud / Local).
- **Payment Gateway**: Midtrans Snap API.
- **Security**: JSON Web Token (JWT).
