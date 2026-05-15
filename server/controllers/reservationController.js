const pool = require('../config/db');

exports.getAllReservations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone 
       FROM reservations r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateReservation = async (req, res) => {
  const { id } = req.params;
  const { status, table_ids } = req.body;
  try {
    await pool.query(
      'UPDATE reservations SET status = ?, table_ids = ? WHERE id = ?',
      [status, table_ids, id]
    );

    // Sinkronisasi status ke tabel orders
    if (status === 'cancelled' || status === 'confirmed') {
      try {
        await pool.query('UPDATE orders SET status = ? WHERE reservation_id = ?', [status, id]);
      } catch (syncErr) {
        console.error('Non-critical: Failed to sync status to orders table:', syncErr.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteReservation = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM reservations WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getBookedTables = async (req, res) => {
  const { date, time } = req.query;
  if (!date) return res.status(400).json({ success: false, error: 'Date is required' });

  try {
    let timeFilter = '';
    let params = [date];

    if (time) {
      let timeStr = time;
      if (timeStr.includes('PM') || timeStr.includes('AM')) {
        const [t, period] = timeStr.split(' ');
        let [hours, minutes] = t.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        timeStr = `${String(hours).padStart(2, '0')}:${minutes}:00`;
      }
      
      timeFilter = `AND (ABS(TIME_TO_SEC(TIMEDIFF(start_time, ?))) / 60 < 90)`;
      params.push(timeStr);
    }

    const [rows] = await pool.query(
      `SELECT table_ids FROM reservations 
       WHERE reservation_date = ? AND status IN ('pending', 'confirmed') ${timeFilter}`,
      params
    );

    let bookedTables = [];
    rows.forEach(row => {
      if (row.table_ids) {
        const ids = row.table_ids.split(',').map(id => id.trim());
        bookedTables = [...bookedTables, ...ids];
      }
    });

    bookedTables = [...new Set(bookedTables)];
    res.json({ success: true, data: bookedTables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
