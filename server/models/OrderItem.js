const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    item_type: {
      type: DataTypes.ENUM('menu', 'package'),
      allowNull: false,
      defaultValue: 'menu',
    },
    item_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    subtotal: {
      type: DataTypes.DECIMAL(14, 0),
      allowNull: false,
    },
  }, {
    tableName: 'order_items',
    timestamps: false,
  });

  return OrderItem;
};
