const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    reservation_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    items_json: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.DECIMAL(14, 0),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('cart', 'pending', 'paid', 'preparing', 'served', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'transfer', 'qris'),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refund_bank_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    refund_account_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    refund_account_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    refund_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    midtrans_order_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    was_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Order;
};
