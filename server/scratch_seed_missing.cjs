const mysql = require('mysql2/promise');
const fs = require('fs');

async function generateSeed() {
  try {
    const localPool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'inari_db'
    });

    let sqlScript = '-- SCRIPT PERBAIKAN MEJA DAN PAKET UNTUK AIVEN\n\n';
    
    // Rename tables to dining_tables if it exists and dining_tables doesn't
    sqlScript += '-- Rename tabel meja agar sesuai dengan backend\n';
    sqlScript += 'RENAME TABLE tables TO dining_tables;\n\n';

    // 1. Get Tables
    const [tables] = await localPool.query('SELECT id, status, capacity FROM dining_tables');
    if (tables.length > 0) {
      sqlScript += '-- Insert data meja\n';
      sqlScript += 'INSERT IGNORE INTO dining_tables (id, status, capacity) VALUES\n';
      const tableValues = tables.map(t => `('${t.id}', '${t.status}', ${t.capacity})`);
      sqlScript += tableValues.join(',\n') + ';\n\n';
    }

    // 2. Get Packages (Insert into menu_items with type='package')
    const [packages] = await localPool.query("SELECT name, description, price, image_url, is_available FROM items WHERE type='package'");
    if (packages.length > 0) {
      sqlScript += '-- Insert data paket ke dalam menu_items\n';
      sqlScript += 'INSERT IGNORE INTO menu_items (category_id, name, description, price, image_url, is_available, type) VALUES\n';
      
      const pkgValues = packages.map(p => {
        const escapedName = p.name ? p.name.replace(/'/g, "\\'") : '';
        const escapedDesc = p.description ? p.description.replace(/'/g, "\\'") : '';
        const price = p.price || 0;
        const img = p.image_url || '';
        const available = p.is_available === undefined ? 1 : p.is_available;
        // Gunakan category_id 1 untuk paket
        return `(1, '${escapedName}', '${escapedDesc}', ${price}, '${img}', ${available}, 'package')`;
      });
      sqlScript += pkgValues.join(',\n') + ';\n';
    }

    fs.writeFileSync('../database/seed_missing.sql', sqlScript);
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

generateSeed();
