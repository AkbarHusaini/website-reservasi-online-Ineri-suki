const { Reservation, User, Order } = require('../models');
const { Sequelize, Op } = require('sequelize');

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        }
      ],
      order: [['id', 'DESC']]
    });

    const formatted = reservations.map(r => {
      const data = r.toJSON();
      if (data.user) {
        data.customer_name = data.user.name;
        data.customer_email = data.user.email;
        data.customer_phone = data.user.phone;
      }
      return data;
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateReservation = async (req, res) => {
  const { id } = req.params;
  const { status, table_ids } = req.body;
  try {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    await reservation.update({ status, table_ids });

    // Sinkronisasi status ke tabel orders
    if (status === 'cancelled' || status === 'confirmed') {
      try {
        await Order.update({ status }, { where: { reservation_id: id } });
      } catch (syncErr) {
        console.error('Non-critical: Failed to sync status to orders table:', syncErr.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteReservation = async (req, res) => {
  const { id } = req.params;
  try {
    await Reservation.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getBookedTables = async (req, res) => {
  const { date, time } = req.query;
  if (!date) return res.status(400).json({ success: false, error: 'Date is required' });

  try {
    const whereClause = {
      reservation_date: date,
      status: {
        [Op.in]: ['pending', 'confirmed']
      }
    };

    if (time) {
      let timeStr = time;
      if (timeStr.includes('PM') || timeStr.includes('AM')) {
        const [t, period] = timeStr.split(' ');
        let [hours, minutes] = t.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        timeStr = `${String(hours).padStart(2, '0')}:${minutes}:00`;
      }
      
      whereClause[Op.and] = Sequelize.literal(`(ABS(TIME_TO_SEC(TIMEDIFF(start_time, '${timeStr}'))) / 60 < 90)`);
    }

    const reservations = await Reservation.findAll({
      where: whereClause,
      attributes: ['table_ids']
    });

    let bookedTables = [];
    reservations.forEach(row => {
      if (row.table_ids) {
        const ids = row.table_ids.split(',').map(id => id.trim());
        bookedTables = [...bookedTables, ...ids];
      }
    });

    bookedTables = [...new Set(bookedTables)];
    res.json({ success: true, data: bookedTables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
