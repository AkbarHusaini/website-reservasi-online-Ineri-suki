const { Table } = require('../models');
const { Sequelize } = require('sequelize');

exports.getAllTables = async (req, res) => {
  try {
    // MySQL specific order by casting substring
    const tables = await Table.findAll({
      order: [
        [Sequelize.literal('CAST(SUBSTRING(id, 2) AS UNSIGNED)'), 'ASC']
      ]
    });
    res.json({ success: true, data: tables });
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
    const existing = await Table.findByPk(id);
    if (existing) {
      return res.status(400).json({ success: false, error: 'ID meja sudah terdaftar.' });
    }
    
    await Table.create({
      id,
      capacity,
      status: status || 'available'
    });
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
    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }
    await table.update({ capacity, status });
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating table:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Table.destroy({ where: { id } });
    if (deleted === 0) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting table:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
