const pool = require('../server/config/db');

async function debugReservations() {
  try {
    const [rows] = await pool.query('SELECT id, table_ids, reservation_date, start_time, status FROM reservations');
    console.log('RESERVATIONS:', JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugReservations();
