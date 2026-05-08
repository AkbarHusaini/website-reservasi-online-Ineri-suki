const pool = require('../server/config/db');

async function testQuery() {
  try {
    const date = '2026-05-07';
    const timeStr = '16:00:00';
    
    // Test the exact query used in orderController
    const [rows] = await pool.query(
      `SELECT id, table_ids, start_time, 
              ABS(TIME_TO_SEC(TIMEDIFF(start_time, ?))) / 60 as diff
       FROM reservations 
       WHERE reservation_date = ?
       AND status IN ('pending', 'confirmed')`,
      [timeStr, date]
    );
    
    console.log('QUERY RESULTS:', JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testQuery();
