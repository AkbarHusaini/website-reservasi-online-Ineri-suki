# Dokumentasi Arsitektur Sistem Ineri Suki & Grill (Edisi Final Skripsi)

Dokumentasi ini dirancang untuk memenuhi standar teknis karya ilmiah, menjelaskan logika otomatisasi tingkat lanjut yang telah diimplementasikan dalam sistem.

---

## 1. Use Case Diagram
Menjelaskan interaksi antara Aktor (Pelanggan & Admin) dengan sistem.

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
        UC9(Dashboard Statistik)
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
    A --- UC9
```

---

## 2. Activity Diagram: Alur Reservasi & Pembayaran (Timer 15 Menit)
Menjelaskan logika *time-bound* untuk pembayaran dan pembersihan meja.

```mermaid
flowchart TD
    Start([Mulai]) --> Select[Pilih Meja & Waktu 90 Menit/Sesi]
    Select --> Validate{Meja Tersedia?}
    
    Validate -- Tidak --> Select
    Validate -- Ya --> Order[Buat Pesanan: Status Pending]
    
    Order --> Timer[Start Timer 15 Menit]
    Timer --> Payment[Proses Pembayaran]
    
    Payment --> CheckExp{Waktu > 15 Menit?}
    CheckExp -- Ya --> AutoCancel[Sistem: Otomatis Batalkan Pesanan]
    CheckExp -- Tidak --> Success{Bayar Berhasil?}
    
    Success -- Ya --> Paid[Update DB: Paid & was_paid = 1]
    Success -- Tidak --> MyOrder[Simpan di Menu Pesanan Saya]
    
    Paid --> Confirmed[Meja Terkunci 90 Menit]
    AutoCancel --> Release[Meja Kembali Tersedia]
    
    Confirmed --> End([Selesai])
    Release --> End
```

---

## 3. Sequence Diagram: Full User Lifecycle (End-to-End)
Diagram ini menjelaskan perjalanan pelanggan dari login, pemesanan, hingga pembayaran sukses.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as User App (React)
    participant BE as Backend (Node.js)
    participant DB as MySQL Database
    participant PG as Midtrans Snap

    Note over User, DB: FASE 1: AUTH & BROWSING
    User->>FE: Login/Register
    FE->>BE: POST /api/auth/login
    BE->>DB: Verify User
    DB-->>BE: User Valid
    BE-->>FE: JWT Token & Profile
    
    User->>FE: Lihat Menu & Paket
    FE->>BE: GET /api/menu
    BE->>DB: SELECT * FROM items WHERE is_available=1
    DB-->>BE: List Menu
    BE-->>FE: Tampilkan Menu ke User

    Note over User, DB: FASE 2: RESERVASI & CHECKOUT
    User->>FE: Pilih Meja, Tanggal, & Sesi (90 Menit)
    FE->>BE: GET /api/tables/available?date=...&time=...
    BE->>DB: Check Conflict in reservations
    DB-->>BE: List Meja Tersedia
    FE->>User: Tampilkan Meja Hijau (Available)
    
    User->>FE: Klik Checkout
    FE->>BE: POST /api/orders (Data Reservasi & Menu)
    BE->>DB: INSERT orders & reservations (status='pending')
    DB-->>BE: OrderID: 101
    BE-->>FE: Return Success & OrderID

    Note over User, PG: FASE 3: PEMBAYARAN (MIDTRANS)
    FE->>BE: POST /api/payments/create-token
    BE->>PG: Request Snap Token (Price, Expiry: 15m)
    PG-->>BE: Snap Token Received
    BE-->>FE: Kirim Snap Token ke Frontend
    
    User->>FE: Klik Bayar (Muncul Midtrans Modal)
    User->>PG: Lakukan Pembayaran (Bank/E-wallet)
    PG-->>BE: Webhook/Notification (Settlement)
    BE->>DB: UPDATE orders SET status='paid', was_paid=1
    BE->>DB: UPDATE reservations SET status='confirmed'
    
    Note over User, DB: FASE 4: RIWAYAT & SELESAI
    User->>FE: Buka Menu "Pesanan Saya"
    FE->>BE: GET /api/my-orders
    BE->>DB: SELECT * FROM orders WHERE user_id
    DB-->>BE: List Pesanan Lunas
    FE->>User: Tampilkan Struk & Status "Lunas"
```

---

## 4. Sequence Diagram: Full Admin Management System (End-to-End)
Diagram ini menjelaskan siklus lengkap Admin dalam mengelola ekosistem Ineri Suki & Grill.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE as Admin Panel (React)
    participant BE as Backend (Node.js)
    participant DB as MySQL Database

    Note over Admin, DB: FASE 1: OTENTIKASI & INITIAL LOAD
    Admin->>FE: Input Login Admin
    FE->>BE: POST /api/auth/login (admin credentials)
    BE->>DB: SELECT * FROM users WHERE email & role='admin'
    DB-->>BE: User Data Found
    BE-->>FE: Return JWT Token & Admin Profile
    FE->>FE: Save Token to LocalStorage
    
    FE->>BE: GET /api/admin/dashboard-stats
    BE->>DB: COUNT(orders), COUNT(items), COUNT(reservations)
    DB-->>BE: Statistik Data
    BE-->>FE: Return Stats (JSON)
    FE->>Admin: Tampilkan Dashboard Utama

    Note over Admin, DB: FASE 2: MANAJEMEN MENU & MEJA
    Admin->>FE: Buka Menu Management -> Edit Item
    FE->>BE: PUT /api/admin/menu/:id (Data Baru)
    BE->>BE: Verify JWT Token
    BE->>DB: UPDATE menu_items SET price, is_available...
    DB-->>BE: Updated
    BE-->>FE: Success Notification

    Note over Admin, DB: FASE 3: KONTROL TRANSAKSI & RESERVASI
    Admin->>FE: Lihat Reservasi Masuk
    FE->>BE: GET /api/admin/reservations
    BE->>DB: SELECT * FROM reservations JOIN users...
    DB-->>BE: List Reservasi
    BE-->>FE: Tampilkan Tabel Reservasi
    
    Admin->>FE: Klik "Konfirmasi" Reservasi
    FE->>BE: PATCH /api/admin/reservations/:id (status='confirmed')
    BE->>DB: UPDATE reservations SET status='confirmed'
    DB-->>BE: Updated
    BE-->>FE: Update UI & Status Real-time
```

---

## 5. Aturan Bisnis & Kebijakan Sistem (Operational Excellence)

### A. Kebijakan Waktu (Time Management)
| Fitur | Durasi | Keterangan |
| :--- | :--- | :--- |
| **Batas Bayar** | 15 Menit | Sejak pesanan dibuat. Jika lewat, meja otomatis dilepas. |
| **Durasi Makan** | 60 Menit | Waktu standar pelanggan di meja. |
| **Cleaning Buffer** | 30 Menit | Waktu bagi staf untuk membersihkan panggangan/meja. |
| **Total Sesi** | 90 Menit | Jeda antar reservasi pada meja yang sama. |

### B. Keamanan Database (Data Integrity)
- **Flag `was_paid`**: Digunakan sebagai bukti permanen bahwa transaksi pernah sukses, mencegah manipulasi permintaan refund pada pesanan yang tidak pernah dibayar.
- **Auto-Sync Table**: Jika pesanan dibatalkan (`cancelled`), status meja di tabel `dining_tables` otomatis kembali menjadi `available`.

---

## 5. Komponen Teknologi (Stack)
- **Frontend**: React.js 18, TailwindCSS.
- **Backend**: Node.js (Express), JWT Authentication.
- **Database**: MySQL (Aiven Cloud/Local).
- **Payment**: Midtrans Snap SDK.
- **Diagrams**: Mermaid.js Integration.
