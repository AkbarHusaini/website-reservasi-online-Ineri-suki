const { Sequelize } = require('sequelize');
const process = require('process');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'Ineri_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : 
           (process.env.DB_HOST === 'localhost' || !process.env.DB_HOST) ? null : { rejectUnauthorized: false },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false, // set to console.log to see SQL queries
  }
);

const User = require('./User')(sequelize);
const Admin = require('./Admin')(sequelize);
const Category = require('./Category')(sequelize);
const MenuItem = require('./MenuItem')(sequelize);
const Package = require('./Package')(sequelize);
const Table = require('./Table')(sequelize);
const Reservation = require('./Reservation')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);

// --- Define Associations ---

// Category & MenuItem
Category.hasMany(MenuItem, { foreignKey: 'category_id', as: 'menu_items' });
MenuItem.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// User & Reservation
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// (Removed Table-Reservation association because table_ids is a comma-separated string)

// User & Order
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Reservation & Order
Reservation.hasMany(Order, { foreignKey: 'reservation_id', as: 'orders' });
Order.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });

// Order & OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = {
  sequelize,
  User,
  Admin,
  Category,
  MenuItem,
  Package,
  Table,
  Reservation,
  Order,
  OrderItem,
};
