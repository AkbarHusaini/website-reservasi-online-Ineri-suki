const mysql = require('mysql2/promise');
async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_inari_suki',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in db_inari_suki:', rows);
    const [menus] = await pool.query('DESCRIBE menus');
    console.log('Columns in menus:', menus);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}
check();
