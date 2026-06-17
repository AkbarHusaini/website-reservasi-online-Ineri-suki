const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'Ineri_secret_key_2024';

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
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email sudah terdaftar.' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const result = await User.create({
      name, email, phone, password: hash, role: 'customer'
    });
    
    const newUser = { id: result.id, name, email, phone, role: 'customer' };
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
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      success: true,
      token,
      user: userResponse
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
    const user = await User.findOne({ where: { email: username, role: 'admin' } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Kredensial admin tidak valid atau akses ditolak.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Kredensial admin tidak valid.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    const userResponse = user.toJSON();
    delete userResponse.password;
    res.json({ success: true, token, user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
