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

## 3. Sequence Diagram: Validasi Refund & Keamanan Transaksi
Menjelaskan mengapa tombol refund hanya muncul pada kondisi tertentu (`was_paid`).

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant BE as Backend (Node.js)
    participant DB as MySQL Database

    User->>FE: Buka Menu "Pesanan Saya"
    FE->>BE: GET /api/my-orders
    BE->>DB: SELECT * FROM orders WHERE user_id
    DB-->>BE: Return Data (termasuk kolom was_paid)
    
    Note over BE, DB: Cek Eligibilitas Refund
    alt Jika status='cancelled' DAN was_paid=1
        BE-->>FE: Kirim flag refund_eligible=true
        FE->>User: Tampilkan Tombol "Ajukan Refund"
    else Jika Belum Bayar (was_paid=0)
        BE-->>FE: Kirim flag refund_eligible=false
        FE->>User: Sembunyikan Tombol Refund
    end

    User->>FE: Klik "Ajukan Refund"
    FE->>BE: POST /api/refunds
    BE->>DB: UPDATE orders SET refund_status='pending'
    BE-->>FE: Success
```

---

## 4. Sequence Diagram: Manajemen Admin & Kontrol Stok
Menunjukkan bagaimana aksi Admin berdampak langsung pada ketersediaan sistem di sisi Pelanggan.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE_A as Admin Panel (React)
    participant BE as Backend (Node.js)
    participant DB as MySQL Database
    participant FE_U as User App (React)

    Note over Admin, DB: AKTIVITAS ADMIN
    Admin->>FE_A: Ubah Status Menu/Meja (is_available=0)
    FE_A->>BE: PUT /api/admin/resource (is_available=0)
    BE->>DB: UPDATE table SET is_available=0
    DB-->>BE: Updated
    BE-->>FE_A: Notifikasi Berhasil

    Note over Admin, DB: DAMPAK REAL-TIME KE USER
    actor User
    User->>FE_U: Buka Halaman Reservasi
    FE_U->>BE: GET /api/available-resources
    BE->>DB: SELECT * FROM resources WHERE is_available=1
    DB-->>BE: Data Terbaru
    BE-->>FE_U: Kirim Data (Menu Habis/Meja Hilang)
    FE_U->>User: Menampilkan data yang disaring
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
