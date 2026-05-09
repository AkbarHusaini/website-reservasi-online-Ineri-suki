const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const categories = [
      { name: 'Suki', label: 'Suki' },
      { name: 'Grill', label: 'Grill' },
      { name: 'Appetizer', label: 'Appetizer' },
      { name: 'Drinks', label: 'Drinks' },
      { name: 'Dessert', label: 'Dessert' }
    ];

    console.log('Seeding categories...');
    for (const cat of categories) {
      await pool.query('INSERT IGNORE INTO categories (label) VALUES (?)', [cat.label]);
    }
    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
}

seed();
