const mysql = require('mysql2/promise');
const fs = require('fs');

async function migrate() {
  try {
    const localPool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'inari_db'
    });

    const [items] = await localPool.query('SELECT name, image_url FROM items');
    let sqlScript = '-- Update Image URLs to match Local XAMPP\n';

    for (let item of items) {
      if (item.image_url) {
        // Escape quotes in name
        const escapedName = item.name.replace(/'/g, "\\'");
        sqlScript += `UPDATE menu_items SET image_url = '${item.image_url}' WHERE name = '${escapedName}';\n`;
      }
    }

    fs.writeFileSync('../database/update_images.sql', sqlScript);
    console.log('Successfully generated database/update_images.sql');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

migrate();
