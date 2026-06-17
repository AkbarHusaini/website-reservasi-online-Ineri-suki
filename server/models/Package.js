const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Package = sequelize.define('Package', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: false,
    },
    img_path: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    badge: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    badge_class: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    min_pax: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 1,
    },
    max_pax: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'packages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return Package;
};
