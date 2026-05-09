const pool = require('../config/db');

// ─── getCategories ────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── getMenu (public) ─────────────────────────────────────────
exports.getMenu = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT i.*, c.label AS category_name FROM items i
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.is_available = 1 AND i.type = 'menu'
       ORDER BY i.sort_order`
    );
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── getPackages (public) ─────────────────────────────────────
exports.getPackages = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT * FROM items WHERE is_available = 1 AND type = 'package' ORDER BY sort_order`
    );
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── getFeaturedMenu (public) ─────────────────────────────────
exports.getFeaturedMenu = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT * FROM items WHERE type='menu' AND (badge IS NOT NULL OR sort_order <= 5) ORDER BY sort_order LIMIT 8`
    );
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── ADMIN CRUD ───────────────────────────────────────────────

// GET all items (admin — termasuk yang unavailable)
exports.getAllMenuAdmin = async (req, res) => {
  try {
    const { search = '', category = '', type = '' } = req.query;
    let sql = `SELECT i.*, c.label AS category_name FROM items i
               LEFT JOIN categories c ON i.category_id = c.id WHERE 1=1`;
    const params = [];
    if (search)   { sql += ' AND i.name LIKE ?';        params.push(`%${search}%`); }
    if (category) { sql += ' AND i.category_id = ?';    params.push(category); }
    if (type)     { sql += ' AND i.type = ?';           params.push(type); }
    sql += ' ORDER BY i.type, i.sort_order, i.id DESC';

    const [items] = await pool.query(sql, params);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM items');
    const [[{ cats }]]  = await pool.query('SELECT COUNT(*) as cats FROM categories');

    res.json({ success: true, data: items, total, categories: cats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST create item
exports.createMenuItem = async (req, res) => {
  const { name, description, price, category_id, image_url, is_available, type, badge } = req.body;
  if (!name || !price || !category_id) {
    return res.status(400).json({ success: false, error: 'Nama, harga, dan kategori wajib diisi.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO items (name, description, price, category_id, image_url, is_available, type, badge) VALUES (?,?,?,?,?,?,?,?)',
      [name, description || '', price, category_id, image_url || '', is_available !== false ? 1 : 0, type || 'menu', badge || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PUT update item
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, image_url, is_available, type, badge } = req.body;
  try {
    await pool.query(
      'UPDATE items SET name=?, description=?, price=?, category_id=?, image_url=?, is_available=?, type=?, badge=? WHERE id=?',
      [name, description, price, category_id, image_url, is_available ? 1 : 0, type || 'menu', badge || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// DELETE item
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── CATEGORY CRUD ───────────────────────────────────────────

exports.createCategory = async (req, res) => {
  const { label } = req.body;
  if (!label) return res.status(400).json({ success: false, error: 'Label wajib diisi.' });
  try {
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const [result] = await pool.query('INSERT INTO categories (slug, label) VALUES (?, ?)', [slug, label]);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;
  try {
    await pool.query('UPDATE categories SET label=? WHERE id=?', [label, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if category is used in items
    const [items] = await pool.query('SELECT id FROM items WHERE category_id = ? LIMIT 1', [id]);
    if (items.length > 0) {
      return res.status(400).json({ success: false, error: 'Kategori sedang digunakan oleh menu item.' });
    }
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
