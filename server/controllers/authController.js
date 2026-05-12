const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'inari_secret_key_2024';

exports.register = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ success: false, error: 'Semua field wajib diisi.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Password dan konfirmasi tidak cocok.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password minimal 6 karakter.' });
  }
  
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email sudah terdaftar.' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hash, 'customer']
    );
    
    const newUser = { id: result.insertId, name, email, phone, role: 'customer' };
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      success: true,
      token,
      user: newUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email dan password wajib diisi.' });
  }
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }
    
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    delete user.password;
    
    res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Email dan password wajib diisi.' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND role = "admin"', [username]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Kredensial admin tidak valid atau akses ditolak.' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Kredensial admin tidak valid.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    delete user.password;
    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
exports.googleLogin = async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email Google tidak valid.' });
  }

  try {
    // Cari user berdasarkan email
    let [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      // Jika belum ada, buat user baru (Auto-register via Google)
      const [result] = await pool.query(
        'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
        [name || 'Google User', email, 'customer', 'google_authenticated_no_password']
      );
      const [newUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUsers[0];
    } else {
      user = users[0];
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    delete user.password;

    res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error('Google Login Error:', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan saat login dengan Google.' });
  }
};
