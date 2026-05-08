const pool = require('./server/config/db');
Promise.all(['orders', 'reservations', 'dining_tables', 'items'].map(t => pool.query(`DESCRIBE ${t}`).then(([r])=>console.log(`\n--- ${t} ---\n`, r)))).catch(console.error).finally(()=>process.exit());
