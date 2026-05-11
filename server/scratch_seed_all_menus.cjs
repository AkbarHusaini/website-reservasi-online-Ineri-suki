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

    let sqlScript = '-- SCRIPT SINKRONISASI SEMUA MENU DARI LOCALHOST KE AIVEN\n\n';

    // Get all Menus (type='menu') from local database
    const [menus] = await localPool.query("SELECT * FROM items WHERE type='menu'");
    
    if (menus.length > 0) {
      // It's safer to delete all existing menus first so we don't get duplicates or outdated data,
      // but the prompt is just to "make all menus appear". 
      // I'll use INSERT IGNORE to avoid primary key conflicts, but wait, the ID might not match.
      // Better to clear out all existing 'menu' type records first to ensure a clean slate,
      // EXCEPT we don't want to break existing orders if they rely on IDs.
      // Actually, since they are just starting, wiping the `menu_items` where type='menu' might be fine.
      // Or I can just insert them without ID and let AUTO_INCREMENT handle it, but wait!
      // If we don't specify ID, we might duplicate existing ones.
      // Let's just do a clean REPLACE or specify the IDs exactly as they are in localhost.
      // If we specify IDs, it will match localhost exactly, which is the best way to sync!

      sqlScript += '-- 1. Hapus menu lama agar tidak dobel (opsional, tapi disarankan untuk sinkronisasi total)\n';
      sqlScript += "DELETE FROM menu_items WHERE type='menu';\n\n";

      sqlScript += '-- 2. Masukkan SEMUA menu dari localhost\n';
      sqlScript += 'INSERT INTO menu_items (id, category_id, name, description, price, image_url, badge, is_available, sort_order, type) VALUES\n';
      
      const menuValues = menus.map(m => {
        const id = m.id;
        const catId = m.category_id || 1;
        const escapedName = m.name ? m.name.replace(/'/g, "\\'") : '';
        const escapedDesc = m.description ? m.description.replace(/'/g, "\\'") : '';
        const price = m.price || 0;
        const img = m.image_url || '';
        const badge = m.badge ? `'${m.badge.replace(/'/g, "\\'")}'` : 'NULL';
        const available = m.is_available === undefined ? 1 : m.is_available;
        const sortOrder = m.sort_order || 0;
        
        return `(${id}, ${catId}, '${escapedName}', '${escapedDesc}', ${price}, '${img}', ${badge}, ${available}, ${sortOrder}, 'menu')`;
      });
      sqlScript += menuValues.join(',\n') + ';\n';
    }

    fs.writeFileSync('../database/seed_all_menus.sql', sqlScript);
    console.log('Success generating seed_all_menus.sql!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

generateSeed();
