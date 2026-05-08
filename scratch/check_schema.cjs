const pool = require('../server/config/db');

async function checkSchema() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM orders');
    console.log('ORDERS COLUMNS:', JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
