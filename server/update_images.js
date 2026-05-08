const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inari_db'
});

async function run() {
  try {
    await pool.query('UPDATE items SET image_url = "/images/paket_grill_berdua.png" WHERE name LIKE "%Grill Berdua%"');
    await pool.query('UPDATE items SET image_url = "/images/paket_pahlawan.png" WHERE name LIKE "%Pahlawan%"');
    console.log("Updated images in items table.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
