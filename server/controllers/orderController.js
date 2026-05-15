const pool = require('../config/db');

// Ambil orders milik user
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.status, o.total_price, o.payment_method, o.notes, o.created_at, o.items_json, o.refund_status,
              r.reservation_date, r.start_time, r.guest_count,
              r.table_ids as table_number
       FROM orders o
       LEFT JOIN reservations r ON o.reservation_id = r.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    let imageMap = {};
    try {
      const [menus] = await pool.query('SELECT name, image_url FROM menus');
      menus.forEach(m => imageMap[m.name] = m.image_url);
    } catch (imgErr) {
      console.error('Image lookup failed, continuing without fallback:', imgErr.message);
    }

    const formattedOrders = orders.map(order => {
      let items = [];
      try {
        if (order.items_json) {
          items = typeof order.items_json === 'string' 
            ? JSON.parse(order.items_json) 
            : order.items_json;
        }
      } catch (e) {
        console.error('Failed to parse items_json', e);
      }
      
      const mappedItems = items.map(item => {
        const name = item.name || item.item_name;
        return {
          item_name: name,
          unit_price: item.price || item.unit_price,
          quantity: item.qty || item.quantity,
          subtotal: (item.price || item.unit_price) * (item.qty || item.quantity),
          image_url: item.img || item.image_url || item.menu_img || item.pkg_img || imageMap[name] || '/images/booking_fee.png'
        };
      });

      return {
        ...order,
        items: mappedItems
      };
    });

    res.json({ success: true, data: formattedOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Buat order baru
exports.createOrder = async (req, res) => {
  const { cartItems, notes, reservationData } = req.body;
  const userId = req.user.id;
  
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart is empty' });
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  try {
    let reservationId = null;
    
    // Create reservation if data exists
    if (reservationData && reservationData.tables && reservationData.tables.length > 0) {
      // Format time correctly. timeSlots are like "04:00 PM", convert to HH:mm:ss if possible, or just string.
      // But start_time in DB is TIME. So we need to parse "04:00 PM" -> "16:00:00"
      let timeStr = reservationData.time;
      if (timeStr && (timeStr.includes('PM') || timeStr.includes('AM'))) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        timeStr = `${String(hours).padStart(2, '0')}:${minutes}:00`;
      }

      const [conflicts] = await pool.query(
        `SELECT table_ids FROM reservations 
         WHERE reservation_date = ? AND status IN ('pending', 'confirmed') 
         AND (ABS(TIME_TO_SEC(TIMEDIFF(start_time, ?))) / 60 < 120)`,
        [reservationData.date, timeStr]
      );

      let alreadyBooked = [];
      conflicts.forEach(c => {
        if (c.table_ids) {
          alreadyBooked = [...alreadyBooked, ...c.table_ids.split(',').map(id => id.trim())];
        }
      });

      const conflictFound = reservationData.tables.some(t => alreadyBooked.includes(t));
      if (conflictFound) {
        return res.status(400).json({ 
          success: false, 
          error: 'Beberapa meja yang Anda pilih sudah dipesan untuk waktu tersebut. Silakan pilih meja lain atau waktu berbeda.' 
        });
      }

      const [resResult] = await pool.query(
        'INSERT INTO reservations (user_id, table_ids, reservation_date, start_time, guest_count, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, reservationData.tables.join(', '), reservationData.date, timeStr, reservationData.guestCount, 'pending']
      );
      reservationId = resResult.insertId;
    }

    const [result] = await pool.query(
      'INSERT INTO orders (user_id, reservation_id, items_json, total_price, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, reservationId, JSON.stringify(cartItems), totalAmount, notes || null, 'pending']
    );
    
    res.json({ success: true, orderId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to process order' });
  }
};

// ─── ADMIN ENDPOINTS ────────────────────────────────────────────

// Ambil semua orders
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.status, o.total_price, o.payment_method, o.notes, o.created_at, o.items_json,
              o.refund_bank_name, o.refund_account_number, o.refund_account_name, o.refund_status,
              u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              r.reservation_date, r.start_time, r.table_ids as table_number
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN reservations r ON o.reservation_id = r.id
       ORDER BY o.created_at DESC`
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update status order
exports.updateOrderAdmin = async (req, res) => {
  const { id } = req.params;
  const { status, refund_status } = req.body;
  try {
    if (status) {
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

      // Sinkronisasi status ke tabel reservations
      if (status === 'cancelled') {
        await pool.query('UPDATE reservations SET status = "cancelled" WHERE id = (SELECT reservation_id FROM orders WHERE id = ?)', [id]);
      } else if (status === 'paid' || status === 'served') {
        await pool.query('UPDATE reservations SET status = "confirmed" WHERE id = (SELECT reservation_id FROM orders WHERE id = ?)', [id]);
      }
    }

    if (refund_status) {
      await pool.query('UPDATE orders SET refund_status = ? WHERE id = ?', [refund_status, id]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Hapus order
exports.deleteOrderAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
  }
};

exports.submitRefundDetails = async (req, res) => {
  const { id } = req.params;
  const { bank_name, account_number, account_name } = req.body;
  const userId = req.user.id;

  try {
    const [order] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
    if (!order.length) return res.status(404).json({ success: false, error: 'Order not found' });
    
    if (order[0].status !== 'cancelled') {
      return res.status(400).json({ success: false, error: 'Hanya pesanan yang dibatalkan yang dapat mengajukan refund manual.' });
    }

    await pool.query(
      'UPDATE orders SET refund_bank_name = ?, refund_account_number = ?, refund_account_name = ?, refund_status = "pending" WHERE id = ?',
      [bank_name, account_number, account_name, id]
    );

    res.json({ success: true, message: 'Detail refund berhasil dikirim. Admin akan memprosesnya segera.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
