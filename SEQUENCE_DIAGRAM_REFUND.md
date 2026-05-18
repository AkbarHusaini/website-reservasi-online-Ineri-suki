# Sequence Diagram: Proses Refund (Admin & User)

Berikut adalah *sequence diagram* yang menggambarkan alur proses pengajuan refund oleh pelanggan (User) dan pemrosesan refund oleh Admin, baik secara otomatis melalui API Midtrans maupun manual.

```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan (User)
    actor Admin as Admin
    participant UserFE as User Frontend
    participant AdminFE as Admin Dashboard
    participant Backend as Backend (Node.js/Express)
    participant DB as Database (MySQL)
    participant Midtrans as Midtrans Gateway

    ================== FASE 1: PENGAJUAN REFUND OLEH USER ==================
    
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

    ================== FASE 2: PEMROSESAN REFUND OLEH ADMIN ==================

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
        
        rect rgb(40, 40, 40)
            note right of Backend: Hubungi API Midtrans Refund
            Backend->>Midtrans: POST snap.transaction.refund(midtrans_order_id, refund_amount)
            
            alt Midtrans Refund Berhasil
                Midtrans-->>Backend: Response Sukses Refund
                Backend-->>AdminFE: Response (success, "Refund berhasil diproses via Midtrans")
            else Midtrans Refund Gagal (Metode tidak didukung / Sandbox limit)
                Midtrans-->>Backend: Response Gagal (Error)
                Backend-->>AdminFE: Response (success, "Status DB dibatalkan, namun Refund otomatis gagal. Silakan lakukan refund manual di dashboard Midtrans.")
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

### Penjelasan Alur Refund:

1. **Pengajuan oleh User (Fase 1)**:
   - Penganggan yang telah membayar pesanan (status `paid`) dapat mengajukan refund dengan mengisi informasi bank (Nama Bank, Nomor Rekening, atas nama).
   - Backend memvalidasi pesanan dan menyimpannya di DB dengan status refund `pending` (atau disimpan sebagai teks `[REFUND REQUEST]` di kolom `notes` jika migrasi kolom baru belum lengkap).

2. **Pemrosesan oleh Admin (Fase 2)**:
   - Admin melihat pengajuan refund melalui Admin Dashboard.
   - **Pilihan A (Otomatis)**: Backend akan mengurangi total pembayaran dengan **Rp 5.000** (potongan biaya pemesanan meja/booking fee yang tidak dapat di-refund). Backend langsung mengubah status order & reservasi menjadi `cancelled` di database dan melakukan pemanggilan API Refund Midtrans. Jika API Midtrans berhasil, uang akan kembali ke pembeli. Jika gagal (misalnya karena metode pembayaran tertentu di sandbox), admin diberikan petunjuk untuk memprosesnya secara manual di Dashboard Midtrans.
   - **Pilihan B (Manual)**: Digunakan jika admin melakukan transfer manual ke bank pelanggan secara langsung. Admin menekan tombol konfirmasi manual untuk memperbarui status refund di database menjadi `processed` (atau mengganti teks di kolom `notes` menjadi `[REFUND PROCESSED]`).
