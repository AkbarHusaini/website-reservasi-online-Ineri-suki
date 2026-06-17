const { Order, Reservation, User, MenuItem } = require('../models');
const { Sequelize, Op } = require('sequelize');

// Ambil orders milik user
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['reservation_date', 'start_time', 'guest_count', 'table_ids']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    let imageMap = {};
    try {
      const menus = await MenuItem.findAll({ attributes: ['name', 'image_url'] });
      menus.forEach(m => imageMap[m.name] = m.image_url);
    } catch (imgErr) {
      console.error('Image lookup failed, continuing without fallback:', imgErr.message);
    }

    const formattedOrders = orders.map(o => {
      const order = o.toJSON();
      if (order.reservation) {
        order.reservation_date = order.reservation.reservation_date;
        order.start_time = order.reservation.start_time;
        order.guest_count = order.reservation.guest_count;
        order.table_number = order.reservation.table_ids;
      }

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
      let timeStr = reservationData.time;
      if (timeStr && (timeStr.includes('PM') || timeStr.includes('AM'))) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        timeStr = `${String(hours).padStart(2, '0')}:${minutes}:00`;
      }

      const conflicts = await Reservation.findAll({
        where: {
          reservation_date: reservationData.date,
          status: { [Op.in]: ['pending', 'confirmed'] },
          [Op.and]: Sequelize.literal(`(ABS(TIME_TO_SEC(TIMEDIFF(start_time, '${timeStr}'))) / 60 < 120)`)
        },
        attributes: ['table_ids']
      });

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

      const resResult = await Reservation.create({
        user_id: userId,
        table_ids: reservationData.tables.join(', '),
        reservation_date: reservationData.date,
        start_time: timeStr,
        guest_count: reservationData.guestCount,
        status: 'pending'
      });
      reservationId = resResult.id;
    }

    const newOrder = await Order.create({
      user_id: userId,
      reservation_id: reservationId,
      items_json: JSON.stringify(cartItems),
      total_price: totalAmount,
      notes: notes || null,
      status: 'pending'
    });
    
    res.json({ success: true, orderId: newOrder.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to process order' });
  }
};

// ─── ADMIN ENDPOINTS ────────────────────────────────────────────

// Ambil semua orders
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['reservation_date', 'start_time', 'table_ids']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedOrders = orders.map(o => {
      const order = o.toJSON();
      if (order.user) {
        order.customer_name = order.user.name;
        order.customer_email = order.user.email;
        order.customer_phone = order.user.phone;
      }
      if (order.reservation) {
        order.reservation_date = order.reservation.reservation_date;
        order.start_time = order.reservation.start_time;
        order.table_number = order.reservation.table_ids;
      }
      return order;
    });

    res.json({ success: true, data: formattedOrders });
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
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (status) {
      await order.update({ status });

      if (order.reservation_id) {
        if (status === 'cancelled') {
          await Reservation.update({ status: 'cancelled' }, { where: { id: order.reservation_id } });
        } else if (status === 'paid' || status === 'served') {
          await Reservation.update({ status: 'confirmed' }, { where: { id: order.reservation_id } });
        }
      }
    }

    if (refund_status) {
      try {
        await order.update({ refund_status });
      } catch (sqlErr) {
        if (refund_status === 'processed') {
          const currentNotes = order.notes || '';
          const newNotes = currentNotes.replace('[REFUND REQUEST]', '[REFUND PROCESSED]');
          await order.update({ notes: newNotes });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('UPDATE_ADMIN_ORDER_ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Hapus order
exports.deleteOrderAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await Order.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.submitRefundDetails = async (req, res) => {
  const { id } = req.params;
  const { bank_name, account_number, account_name } = req.body;
  const userId = req.user.id;

  try {
    const sBankName = String(bank_name || '').trim();
    const sAccNo = String(account_number || '').trim();
    const sAccName = String(account_name || '').trim();

    if (!sBankName || !sAccNo || !sAccName) {
      return res.status(400).json({ success: false, error: 'Semua data rekening wajib diisi.' });
    }

    const order = await Order.findOne({ where: { id, user_id: userId } });
    if (!order) return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
    
    const refundInfo = `[REFUND REQUEST] Bank: ${sBankName}, No. Rek: ${sAccNo}, A/N: ${sAccName}`;

    try {
      await order.update({
        refund_bank_name: sBankName,
        refund_account_number: sAccNo,
        refund_account_name: sAccName,
        refund_status: 'pending'
      });
    } catch (sqlErr) {
      console.warn('Level 1 failed, trying Level 2/3...');
      try {
        await order.update({ notes: refundInfo, refund_status: 'pending' });
      } catch (sqlErr2) {
        await order.update({ notes: refundInfo });
      }
    }

    res.json({ success: true, message: 'Detail refund berhasil dikirim.' });
  } catch (err) {
    console.error('REFUND_ERROR:', err.message);
    res.status(500).json({ success: false, error: `Gagal mengirim: ${err.message}` });
  }
};
