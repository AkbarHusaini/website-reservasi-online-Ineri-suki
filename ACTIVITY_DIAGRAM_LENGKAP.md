# Activity Diagrams - Ineri Suki & Grill (Revisi Lengkap per Fitur)

Dokumen ini berisi kumpulan Activity Diagram untuk seluruh fitur website. Diagram dipisah satu per satu sesuai dengan fungsi fitur masing-masing, dan dibuat menggunakan standar UML Activity Diagram dengan format *swimlane*. Sesuai format, **aktor (PENGGUNA / ADMIN)** selalu berada di lajur **kiri**, dan **SISTEM** berada di lajur **kanan**.

---

## A. FITUR PENGGUNA (PELANGGAN)

### 1. Fitur Registrasi (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        buka[membuka halaman register]
        input[menginput nama, email, no hp, password]
        klik[mengklik tombol daftar]
        cekKosong{data lengkap?}
    end
    
    subgraph SISTEM
        direction TB
        tampil[menampilkan halaman register]
        pesanKosong[menampilkan pesan error validasi]
        cekDB[mengecek email di database]
        cekEmail{email terdaftar?}
        pesanEmail[menampilkan pesan email sudah terdaftar]
        simpan[menyimpan data pengguna baru]
        generate[membuat sesi login JWT]
        masuk[masuk ke halaman beranda]
        selesai((end))
    end
    
    start --> buka
    buka --> tampil
    tampil --> input
    input --> klik
    klik --> cekKosong
    cekKosong -- tidak --> pesanKosong
    pesanKosong --> input
    cekKosong -- iya --> cekDB
    cekDB --> cekEmail
    cekEmail -- iya --> pesanEmail
    pesanEmail --> input
    cekEmail -- tidak --> simpan
    simpan --> generate
    generate --> masuk
    masuk --> selesai
```

### 2. Fitur Login (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        buka[membuka halaman login]
        input[menginput email dan password]
        klik[mengklik tombol login]
        cekKosong{data kosong?}
    end
    
    subgraph SISTEM
        direction TB
        tampil[menampilkan halaman login]
        pesanKosong[menampilkan pesan "please fill out this field"]
        ambilDB[mengambil data dari database]
        cekDB{data valid?}
        pesanSalah[menampilkan pesan "email dan password salah"]
        masukUser[masuk ke halaman beranda]
        selesai((end))
    end
    
    start --> buka
    buka --> tampil
    tampil --> input
    input --> klik
    klik --> cekKosong
    cekKosong -- iya --> pesanKosong
    pesanKosong --> input
    cekKosong -- tidak --> ambilDB
    ambilDB --> cekDB
    cekDB -- tidak --> pesanSalah
    pesanSalah --> klik
    cekDB -- iya --> masukUser
    masukUser --> selesai
```

### 3. Fitur Melihat & Mencari Menu (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        buka[membuka halaman menu]
        aksi[menginput pencarian / klik kategori]
    end
    
    subgraph SISTEM
        direction TB
        tampil[menampilkan halaman menu]
        ambilKategori[mengambil data kategori dari database]
        ambilMenu[mengambil data menu & paket aktif dari database]
        filter[memfilter menu berdasarkan input/kategori]
        tampilHasil[menampilkan hasil menu sesuai filter]
        selesai((end))
    end
    
    start --> buka
    buka --> tampil
    tampil --> ambilKategori
    ambilKategori --> ambilMenu
    ambilMenu --> tampilHasil
    tampilHasil --> aksi
    aksi --> filter
    filter --> tampilHasil
    tampilHasil --> selesai
```

### 4. Fitur Mengelola Keranjang (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        klik[mengklik ikon keranjang]
        ubah[menambah / mengurangi / menghapus jumlah item]
        checkout[mengklik tombol lanjut reservasi]
    end
    
    subgraph SISTEM
        direction TB
        tampil[menampilkan popup/halaman keranjang]
        hitung[menghitung ulang subtotal harga]
        update[mengupdate data keranjang di memori]
        arahkan[mengarahkan pelanggan ke halaman reservasi]
        selesai((end))
    end
    
    start --> klik
    klik --> tampil
    tampil --> ubah
    ubah --> hitung
    hitung --> update
    update --> tampil
    tampil --> checkout
    checkout --> arahkan
    arahkan --> selesai
```

### 5. Fitur Reservasi & Checkout (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        buka[membuka halaman reservasi]
        inputTanggal[memilih tanggal & waktu]
        inputTamu[memilih jumlah tamu]
        pilihMeja[memilih meja pada layout]
        bayar[mengklik tombol bayar sekarang]
    end
    
    subgraph SISTEM
        direction TB
        cekDB[mengecek jadwal & meja aktif di database]
        tampilMeja[menampilkan opsi meja yang kosong]
        validasi[memvalidasi tidak ada bentrok waktu]
        cekBentrok{ada bentrok?}
        error[menampilkan pesan meja sudah dipesan]
        simpan[menyimpan data reservasi dan pesanan]
        arahkan[mengarahkan ke modul midtrans]
        selesai((end))
    end
    
    start --> buka
    buka --> inputTanggal
    inputTanggal --> cekDB
    cekDB --> tampilMeja
    tampilMeja --> inputTamu
    inputTamu --> pilihMeja
    pilihMeja --> bayar
    bayar --> validasi
    validasi --> cekBentrok
    cekBentrok -- iya --> error
    error --> pilihMeja
    cekBentrok -- tidak --> simpan
    simpan --> arahkan
    arahkan --> selesai
```

### 6. Fitur Pembayaran Midtrans (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        buka[diarahkan ke halaman pembayaran]
        klik[mengklik tombol bayar sekarang]
        bayar[melakukan pembayaran di popup midtrans]
        habis[membiarkan waktu 15 menit habis]
    end
    
    subgraph SISTEM
        direction TB
        buatToken[melakukan request snap token ke midtrans]
        tampil[menampilkan rincian tagihan & timer]
        munculPop[memunculkan popup midtrans]
        webhook[menerima notifikasi dari midtrans]
        cekStatus{status lunas?}
        updateLunas[mengupdate reservasi jadi confirmed]
        updateBatal[mengupdate reservasi jadi cancelled]
        tampilSukses[menampilkan pesan sukses]
        selesai((end))
    end
    
    start --> buka
    buka --> buatToken
    buatToken --> tampil
    tampil --> klik
    klik --> munculPop
    munculPop --> bayar
    bayar --> webhook
    webhook --> cekStatus
    cekStatus -- iya --> updateLunas
    updateLunas --> tampilSukses
    tampilSukses --> selesai
    
    tampil --> habis
    habis --> updateBatal
    updateBatal --> selesai
    cekStatus -- tidak --> updateBatal
```

### 7. Fitur Melihat Riwayat Pesanan (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        buka[membuka halaman pesanan saya]
        refresh[mengklik tombol refresh status]
    end
    
    subgraph SISTEM
        direction TB
        validasi[memvalidasi token login pelanggan]
        ambil[mengambil daftar pesanan pelanggan dari DB]
        cekMidtrans[mengecek status pesanan terbaru ke Midtrans]
        tampil[menampilkan daftar riwayat pesanan]
        selesai((end))
    end
    
    start --> buka
    buka --> validasi
    validasi --> ambil
    ambil --> tampil
    tampil --> refresh
    refresh --> cekMidtrans
    cekMidtrans --> ambil
    tampil --> selesai
```

### 8. Fitur Pengajuan Refund (Pengguna)
```mermaid
flowchart TD
    subgraph PENGGUNA
        direction TB
        start((start))
        klikRefund[mengklik tombol ajukan refund]
        input[menginput nama bank, no rekening, pemilik]
        submit[mengklik tombol kirim pengajuan]
    end
    
    subgraph SISTEM
        direction TB
        munculForm[menampilkan form pengajuan refund]
        validasi{pesanan valid & sudah dibayar?}
        simpan[menyimpan detail rekening ke database]
        updateStatus[mengupdate status refund jadi pending]
        tampilSukses[menampilkan pesan berhasil diajukan]
        selesai((end))
    end
    
    start --> klikRefund
    klikRefund --> munculForm
    munculForm --> input
    input --> submit
    submit --> validasi
    validasi -- tidak --> selesai
    validasi -- iya --> simpan
    simpan --> updateStatus
    updateStatus --> tampilSukses
    tampilSukses --> selesai
```

---

## B. FITUR ADMIN (PEGAWAI)

### 9. Fitur Login Admin
```mermaid
flowchart TD
    subgraph ADMIN
        direction TB
        start((start))
        buka[membuka halaman login]
        input[menginput email admin dan password]
        klik[mengklik tombol login]
    end
    
    subgraph SISTEM
        direction TB
        tampil[menampilkan halaman login]
        ambilDB[mengambil data dari database]
        cekDB{kredensial benar & role admin?}
        pesanSalah[menampilkan pesan akses ditolak]
        masukAdmin[masuk ke dashboard admin]
        selesai((end))
    end
    
    start --> buka
    buka --> tampil
    tampil --> input
    input --> klik
    klik --> ambilDB
    ambilDB --> cekDB
    cekDB -- tidak --> pesanSalah
    pesanSalah --> input
    cekDB -- iya --> masukAdmin
    masukAdmin --> selesai
```

### 10. Fitur Kelola Menu (Admin)
```mermaid
flowchart TD
    subgraph ADMIN
        direction TB
        start((start))
        buka[membuka halaman kelola menu]
        tambah[mengklik tambah / edit / hapus menu]
        input[mengisi detail menu baru]
        simpan[mengklik tombol simpan]
    end
    
    subgraph SISTEM
        direction TB
        ambil[mengambil daftar menu dari database]
        tampil[menampilkan tabel menu]
        proses[mengeksekusi query insert/update/delete ke DB]
        refresh[memuat ulang data tabel]
        notif[menampilkan notifikasi sukses]
        selesai((end))
    end
    
    start --> buka
    buka --> ambil
    ambil --> tampil
    tampil --> tambah
    tambah --> input
    input --> simpan
    simpan --> proses
    proses --> refresh
    refresh --> notif
    notif --> selesai
```

### 11. Fitur Kelola Kategori Menu (Admin)
```mermaid
flowchart TD
    subgraph ADMIN
        direction TB
        start((start))
        buka[membuka halaman kelola kategori]
        tambah[mengklik tambah / hapus kategori]
        input[mengisi label nama kategori]
        simpan[mengklik tombol simpan]
    end
    
    subgraph SISTEM
        direction TB
        ambil[mengambil data kategori dari DB]
        tampil[menampilkan tabel kategori]
        validasi[mengecek relasi kategori dengan menu]
        cekDipakai{kategori sedang dipakai?}
        pesanError[menampilkan error tidak bisa dihapus]
        proses[mengeksekusi query DB]
        refresh[memuat ulang tabel kategori]
        selesai((end))
    end
    
    start --> buka
    buka --> ambil
    ambil --> tampil
    tampil --> tambah
    tambah --> input
    input --> simpan
    simpan --> validasi
    validasi --> cekDipakai
    cekDipakai -- iya --> pesanError
    pesanError --> tambah
    cekDipakai -- tidak --> proses
    proses --> refresh
    refresh --> selesai
```

### 12. Fitur Kelola Reservasi (Admin)
```mermaid
flowchart TD
    subgraph ADMIN
        direction TB
        start((start))
        buka[membuka halaman reservasi]
        ubah[mengubah status reservasi di tabel]
        simpan[mengkonfirmasi perubahan]
    end
    
    subgraph SISTEM
        direction TB
        ambil[mengambil seluruh data reservasi dari DB]
        tampil[menampilkan daftar reservasi]
        proses[mengupdate status reservasi di database]
        sinkron[menyinkronkan status pesanan yang terhubung]
        refresh[memuat ulang tabel]
        selesai((end))
    end
    
    start --> buka
    buka --> ambil
    ambil --> tampil
    tampil --> ubah
    ubah --> simpan
    simpan --> proses
    proses --> sinkron
    sinkron --> refresh
    refresh --> selesai
```

### 13. Fitur Kelola Pesanan (Admin)
```mermaid
flowchart TD
    subgraph ADMIN
        direction TB
        start((start))
        buka[membuka halaman kelola pesanan]
        ubah[mengubah status pesanan via dropdown]
        simpan[mengkonfirmasi update status]
    end
    
    subgraph SISTEM
        direction TB
        ambil[mengambil riwayat pesanan dari DB]
        tampil[menampilkan daftar pesanan]
        proses[mengupdate status pesanan di database]
        sinkron[menyinkronkan status reservasi yang terhubung]
        refresh[memuat ulang tabel & menampilkan notifikasi]
        selesai((end))
    end
    
    start --> buka
    buka --> ambil
    ambil --> tampil
    tampil --> ubah
    ubah --> simpan
    simpan --> proses
    proses --> sinkron
    sinkron --> refresh
    refresh --> selesai
```

### 14. Fitur Memproses Pengajuan Refund (Admin)
```mermaid
flowchart TD
    subgraph ADMIN
        direction TB
        start((start))
        buka[membuka detail pesanan batal]
        klik[mengklik konfirmasi refund selesai]
    end
    
    subgraph SISTEM
        direction TB
        ambil[menampilkan data rekening bank pelanggan]
        proses[mengupdate status refund menjadi processed di DB]
        refresh[memuat ulang data pesanan]
        notif[menampilkan notifikasi refund berhasil dicatat]
        selesai((end))
    end
    
    start --> buka
    buka --> ambil
    ambil --> klik
    klik --> proses
    proses --> refresh
    refresh --> notif
    notif --> selesai
```

### 15. Fitur Kelola Meja (Admin)
```mermaid
flowchart TD
    subgraph ADMIN
        direction TB
        start((start))
        buka[membuka halaman kelola meja]
        aksi[mengklik tambah / edit meja]
        input[menginput ID meja, kapasitas, dan status]
        simpan[mengklik tombol simpan]
    end
    
    subgraph SISTEM
        direction TB
        ambil[mengambil data meja dari database]
        tampil[menampilkan layout tabel meja]
        validasi[memvalidasi ketersediaan ID meja]
        proses[mengeksekusi query ke database]
        refresh[memuat ulang data meja]
        selesai((end))
    end
    
    start --> buka
    buka --> ambil
    ambil --> tampil
    tampil --> aksi
    aksi --> input
    input --> simpan
    simpan --> validasi
    validasi --> proses
    proses --> refresh
    refresh --> selesai
```
