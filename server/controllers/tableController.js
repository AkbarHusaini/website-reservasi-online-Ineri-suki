const pool = require('../config/db');

exports.getAllTables = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dining_tables ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED)');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.createTable = async (req, res) => {
  const { id, capacity, status } = req.body;
  if (!id || !capacity) {
    return res.status(400).json({ success: false, error: 'ID meja dan kapasitas wajib diisi.' });
  }
  try {
    // Cek apakah ID sudah ada
    const [existing] = await pool.query('SELECT id FROM dining_tables WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'ID meja sudah terdaftar.' });
    }
    
    await pool.query(
      'INSERT INTO dining_tables (id, capacity, status) VALUES (?, ?, ?)',
      [id, capacity, status || 'available']
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateTable = async (req, res) => {
  const { id } = req.params;
  const { capacity, status } = req.body;
  try {
    await pool.query(
      'UPDATE dining_tables SET capacity = ?, status = ? WHERE id = ?',
      [capacity, status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM dining_tables WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
