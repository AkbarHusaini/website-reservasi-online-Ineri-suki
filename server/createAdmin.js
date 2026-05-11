const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function createAdmin() {
  const email = 'admin@gmail.com';
  const password = '123456';
  const name = 'Admin';
  const phone = '0000000000';
  const role = 'admin';

  try {
    const hash = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      // Update existing user to admin
      await pool.query(
        'UPDATE users SET password = ?, role = ?, name = ? WHERE email = ?',
        [hash, role, name, email]
      );
      console.log('Admin account updated successfully.');
    } else {
      // Insert new admin user
      await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, hash, role]
      );
      console.log('Admin account created successfully.');
    }
  } catch (err) {
    console.error('Error creating admin account:', err);
  } finally {
    pool.end();
  }
}

createAdmin();
