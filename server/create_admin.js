const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Pastikan argumen diberikan (email dan password)
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Cara Penggunaan: node create_admin.js "Nama Admin" "email@admin.com" "password_rahasia"');
  process.exit(1);
}

const [name, email, password] = args;

async function createAdmin() {
  let connection;
  try {
    // 1. Buat koneksi ke database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'inari_db'
    });

    // 2. Hash password untuk keamanan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Masukkan ke database dengan role 'admin'
    // Jika email sudah ada, kita update role dan password-nya
    const query = `
      INSERT INTO users (name, email, phone, password, role) 
      VALUES (?, ?, ?, ?, 'admin')
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        password = VALUES(password),
        role = 'admin'
    `;

    const [result] = await connection.execute(query, [name, email, '0000000000', hashedPassword]);

    console.log('✅ SUKSES!');
    console.log(`Akun Admin telah berhasil dibuat atau diperbarui.`);
    console.log(`-----------------------------------`);
    console.log(`Nama     : ${name}`);
    console.log(`Email    : ${email}`);
    console.log(`Password : ${password}`);
    console.log(`-----------------------------------`);
    console.log(`Silakan login di halaman aplikasi Anda menggunakan akun ini.`);
    
  } catch (error) {
    console.error('❌ GAGAL MEMBUAT ADMIN:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

createAdmin();
