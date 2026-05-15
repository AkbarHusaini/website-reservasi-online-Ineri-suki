const pool = require('../config/db');

// Helper untuk deteksi nama tabel (tables atau dining_tables)
async function getTableName() {
  try {
    await pool.query('SELECT 1 FROM tables LIMIT 1');
    return 'tables';
  } catch (e) {
    return 'dining_tables';
  }
}

exports.getAllTables = async (req, res) => {
  try {
    const tableName = await getTableName();
    const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED)`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.createTable = async (req, res) => {
  const { id, capacity, status } = req.body;
  if (!id || !capacity) {
    return res.status(400).json({ success: false, error: 'ID meja dan kapasitas wajib diisi.' });
  }
  try {
    const tableName = await getTableName();
    // Cek apakah ID sudah ada
    const [existing] = await pool.query(`SELECT id FROM ${tableName} WHERE id = ?`, [id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'ID meja sudah terdaftar.' });
    }
    
    await pool.query(
      `INSERT INTO ${tableName} (id, capacity, status) VALUES (?, ?, ?)`,
      [id, capacity, status || 'available']
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error creating table:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateTable = async (req, res) => {
  const { id } = req.params;
  const { capacity, status } = req.body;
  try {
    const tableName = await getTableName();
    await pool.query(
      `UPDATE ${tableName} SET capacity = ?, status = ? WHERE id = ?`,
      [capacity, status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating table:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    const tableName = await getTableName();
    await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting table:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
