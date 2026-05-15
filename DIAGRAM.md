# Dokumentasi Alur Aplikasi Ineri Suki & Grill

Dokumentasi ini menggunakan **Mermaid** untuk menjelaskan alur logika sistem.

## 1. Sequence Diagram: Proses Pembayaran (Snap Midtrans)
Diagram ini menjelaskan urutan komunikasi antara User, Frontend, Backend, dan API Midtrans.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React App (PaymentPage)
    participant Backend as Node.js (API Server)
    participant DB as MySQL Database
    participant Midtrans as Midtrans Snap API

    Note over User, DB: PERSIAPAN PEMBAYARAN
    Frontend->>Backend: POST /api/payments/create-transaction (orderId)
    Backend->>Midtrans: Request Snap Token
    Midtrans-->>Backend: Return Snap Token
    Backend->>DB: Simpan midtrans_order_id ke 'orders'
    Backend-->>Frontend: Kirim Snap Token ke UI

    Note over User, DB: PROSES TRANSAKSI (SNAP POP-UP)
    User->>Frontend: Klik tombol "BAYAR SEKARANG"
    Frontend->>Frontend: Panggil window.snap.pay(token)
    Frontend->>Midtrans: Tampilkan Menu Pembayaran
    User->>Midtrans: Lakukan Pembayaran / Tutup Menu
    Midtrans-->>Frontend: Callback (Success/Close)

    Note over User, DB: SIMULASI UPDATE INSTAN (FITUR TESTER)
    Frontend->>Backend: GET /api/payments/status/:id?simulate=true
    Backend->>DB: UPDATE orders SET status='paid'
    Backend->>DB: UPDATE reservations SET status='confirmed'
    DB-->>Backend: Status Diperbarui
    Backend-->>Frontend: Return Success
    Frontend->>User: Muncul Notifikasi "Terimakasih / Berhasil"
```

---

## 2. Flowchart: Alur Pemesanan & Reservasi
Diagram alir proses dari pemilihan menu hingga selesai.

```mermaid
graph TD
    A[Mulai: Pilih Menu] --> B{Buka Keranjang}
    B --> C[Isi Data Reservasi]
    C --> D[Klik Checkout]
    D --> E[Simpan Data ke Database]
    E --> F[Halaman Pembayaran]
    F --> G[Pilih Metode Bayar di Midtrans]
    G --> H{Pembayaran Berhasil?}
    H -- Ya --> I[Status Lunas & Reservasi Konfirmasi]
    H -- Tidak/Tutup --> J[Tetap Simulasikan Lunas - Mode Tester]
    I --> K[Selesai: Muncul Modal Sukses]
    J --> K
```

---

## Cara Melihat Diagram Ini:
1. Di **VS Code**: Tekan `Ctrl + Shift + V` saat membuka file ini untuk melihat preview diagramnya.
2. Di **GitHub**: File ini akan otomatis berubah menjadi gambar diagram yang rapi.
