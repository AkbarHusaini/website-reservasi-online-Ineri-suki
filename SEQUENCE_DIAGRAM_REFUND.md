# Sequence Diagram: Proses Refund (Admin & User)

Dokumen ini berisi *sequence diagram* yang menggambarkan alur proses pengajuan refund oleh pelanggan (User) dan pemrosesan refund oleh Admin, baik secara otomatis melalui API Midtrans maupun manual. 

Diagram ini dibagi menjadi dua bagian agar lebih mudah dibaca dan menghindari error *parsing* pada renderer Markdown.

---

## 1. Fase 1: Pengajuan Refund oleh Pelanggan (User)

Fase ini menjelaskan bagaimana pelanggan mengajukan pengembalian dana melalui halaman riwayat pesanan mereka dengan memasukkan detail rekening bank tujuan.

```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan (User)
    participant UserFE as User Frontend
    participant Backend as Backend (Node.js/Express)
    participant DB as Database (MySQL)

    User->>UserFE: Masuk ke Riwayat Pesanan
    User->>UserFE: Klik "Refund" & Isi Detail Rekening (Bank, No. Rek, A/N)
    UserFE->>Backend: POST /api/orders/:id/submit-refund
    
    opt Validasi & Penyimpanan Data Refund
        Backend->>DB: SELECT * FROM orders WHERE id = :id AND user_id = :userId
        DB-->>Backend: Data Order (Status harus PAID)
        
        alt Update Kolom Refund (Ideal)
            Backend->>DB: UPDATE orders SET refund_bank_name, refund_account_number, refund_account_name, refund_status='pending'
        else Fallback: Simpan di Notes (Jika Kolom DB Belum Lengkap)
            Backend->>DB: UPDATE orders SET notes='[REFUND REQUEST]...', refund_status='pending'
        end
        DB-->>Backend: Konfirmasi Update
    end
    
    Backend-->>UserFE: Response (success, "Detail refund berhasil dikirim")
    UserFE-->>User: Tampilkan Status "Refund Pending"
```

---

## 2. Fase 2: Pemrosesan Refund oleh Admin

Fase ini menjelaskan bagaimana Admin mengelola permintaan refund melalui dashboard, baik menggunakan **API Refund otomatis dari Midtrans** maupun **Transfer Manual**.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant AdminFE as Admin Dashboard
    participant Backend as Backend (Node.js/Express)
    participant DB as Database (MySQL)
    participant Midtrans as Midtrans Gateway

    Admin->>AdminFE: Buka Halaman Kelola Order
    AdminFE->>Backend: GET /api/admin/orders
    Backend->>DB: SELECT * FROM orders ...
    DB-->>Backend: Daftar Order (Termasuk data pengajuan refund)
    Backend-->>AdminFE: Response Daftar Order
    AdminFE-->>Admin: Tampilkan Order yang meminta Refund

    alt PILIHAN A: Proses Refund Otomatis (Midtrans API)
        Admin->>AdminFE: Klik "Refund Otomatis via Midtrans"
        AdminFE->>Backend: POST /api/payments/refund/:orderId
        
        Backend->>DB: SELECT * FROM orders WHERE id = :orderId
        DB-->>Backend: Data Order (Ambil total_price & midtrans_order_id)
        
        note right of Backend: Kalkulasi: Refund = Total Price - Rp 5.000 (Booking Fee Hangus)
        
        Backend->>DB: UPDATE orders SET status='cancelled'
        Backend->>DB: UPDATE reservations SET status='cancelled'
        DB-->>Backend: Konfirmasi DB Update
        
        opt Hubungi API Midtrans Refund
            Backend->>Midtrans: POST snap.transaction.refund(midtrans_order_id, refund_amount)
            
            alt Midtrans Refund Berhasil
                Midtrans-->>Backend: Response Sukses Refund
                Backend-->>AdminFE: Response (success, "Refund berhasil diproses via Midtrans")
            else Midtrans Refund Gagal (Metode tidak didukung / Sandbox limit)
                Midtrans-->>Backend: Response Gagal (Error)
                Backend-->>AdminFE: Response (success, "Status DB dibatalkan, namun Refund otomatis gagal...")
            end
        end

    else PILIHAN B: Proses Refund Manual (Tandai Selesai / Transfer Manual)
        Admin->>AdminFE: Kirim uang secara manual ke rekening pelanggan
        Admin->>AdminFE: Klik "Tandai Refund Selesai (Manual)"
        AdminFE->>Backend: PUT /api/admin/orders/:id (Body: { refund_status: 'processed' })
        
        alt Update Status Refund di DB
            Backend->>DB: UPDATE orders SET refund_status='processed'
        else Fallback: Ganti label di Notes
            Backend->>DB: UPDATE orders SET notes=REPLACE('[REFUND REQUEST]', '[REFUND PROCESSED]')
        end
        DB-->>Backend: Konfirmasi DB Update
        
        Backend-->>AdminFE: Response (success, "Status refund berhasil diperbarui")
        AdminFE-->>Admin: Tampilkan Status Order: Refund Selesai
    end
```

---

### Penjelasan Singkat Alur:
- **Fase 1**: Pelanggan mengirimkan rincian akun bank mereka untuk pengembalian dana. Data tersebut disimpan di database dengan status refund `pending`.
- **Fase 2 (Pilihan A)**: Memanfaatkan API Midtrans secara otomatis untuk mengembalikan dana pelanggan setelah dikurangi booking fee Rp 5.000.
- **Fase 2 (Pilihan B)**: Jika pemrosesan otomatis tidak memungkinkan (misalnya karena limitasi sandbox/metode pembayaran tertentu), Admin dapat mentransfer secara manual kemudian menandai transaksi tersebut selesai di dashboard.
