# Sequence Diagram: Pemesanan Menu & Pembayaran (Midtrans)

Berikut adalah *sequence diagram* yang menggambarkan alur proses pemesanan menu mulai dari penambahan item ke keranjang hingga proses pembayaran selesai melalui Midtrans Gateway.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Frontend (React)
    participant Backend as Backend (Node.js/Express)
    participant DB as Database (MySQL)
    participant Midtrans as Midtrans Gateway

    User->>Frontend: Pilih menu & tambah ke keranjang
    User->>Frontend: Klik tombol Checkout / Buat Pesanan
    Frontend->>Backend: POST /api/orders (Items, Notes, ReservationData)
    
    rect rgb(240, 248, 255)
        note right of Backend: Proses Pembuatan Order
        Backend->>DB: INSERT INTO reservations (jika ada data reservasi)
        DB-->>Backend: Kembalikan Reservation ID
        Backend->>DB: INSERT INTO orders (items_json, total_price, status='pending')
        DB-->>Backend: Kembalikan Order ID
    end
    
    Backend-->>Frontend: Response (success, Order ID)
    
    Frontend->>Backend: POST /api/payments (Order ID, Total Amount)
    
    rect rgb(255, 248, 240)
        note right of Backend: Inisiasi Transaksi Midtrans
        Backend->>DB: SELECT * FROM orders WHERE id = Order ID
        DB-->>Backend: Data Order
        Backend->>Midtrans: Create Snap Transaction (Parameter & Details)
        Midtrans-->>Backend: Return Snap Token & Transaction Info
        Backend->>DB: UPDATE orders SET midtrans_order_id = ...
    end
    
    Backend-->>Frontend: Response (success, Snap Token)
    
    Frontend->>Midtrans: Membuka Snap Pop-up (window.snap.pay(token))
    Midtrans-->>User: Tampilkan UI Pembayaran Midtrans
    User->>Midtrans: Masukkan Detail Pembayaran & Konfirmasi
    
    alt Pembayaran Berhasil
        Midtrans-->>Frontend: Callback: onSuccess
        Midtrans->>Backend: Webhook Notification (transaction_status: settlement/capture)
        Backend->>DB: UPDATE orders SET status='paid'
        Backend->>DB: UPDATE reservations SET status='confirmed'
        Frontend->>User: Tampilkan Halaman Sukses
    else Pembayaran Dibatalkan / Gagal
        Midtrans-->>Frontend: Callback: onPending / onClose / onError
        Midtrans->>Backend: Webhook Notification (transaction_status: cancel/expire)
        Backend->>DB: UPDATE orders SET status='cancelled'
        Frontend->>User: Tampilkan Pesan Gagal / Pending
    end
```

### Penjelasan Langkah-langkah:
1. **Pembuatan Order (Langkah 1-6)**: Pengguna melakukan proses checkout dari keranjang. Sistem backend akan menyimpan data reservasi (jika meja dipesan) dan data pesanan (menu) ke database dengan status awal `pending`.
2. **Inisiasi Pembayaran (Langkah 7-12)**: Frontend meminta *Snap Token* dengan mengirimkan `Order ID`. Backend membangun parameter (termasuk pajak dan biaya layanan) dan mengirimkannya ke API Midtrans untuk mendapatkan *Snap Token*.
3. **Proses Pembayaran (Langkah 13-15)**: Dengan menggunakan token, frontend membuka *pop-up* pembayaran Midtrans. Pengguna menyelesaikan pembayaran langsung di antarmuka Midtrans.
4. **Konfirmasi & Webhook (Langkah 16-21)**: Setelah pembayaran selesai, Midtrans mengirimkan notifikasi *Webhook* di belakang layar secara langsung ke Backend. Backend memperbarui status pesanan menjadi `paid` dan status reservasi menjadi `confirmed`. Di saat yang bersamaan, Frontend memberikan respon visual kepada pengguna.
