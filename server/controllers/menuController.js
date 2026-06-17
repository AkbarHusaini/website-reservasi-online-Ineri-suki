const { Category, MenuItem } = require('../models');
const { Op } = require('sequelize');

// ─── getCategories ────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── getMenu (public) ─────────────────────────────────────────
exports.getMenu = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      where: {
        is_available: true,
        type: 'menu'
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['label']
        }
      ],
      order: [['sort_order', 'ASC']]
    });
    
    // Sequelize adds nested object for associations by default, let's map it to match the old raw SQL output structure (where category_name was flat)
    const formattedItems = items.map(item => {
      const itemJSON = item.toJSON();
      itemJSON.category_name = itemJSON.category ? itemJSON.category.label : null;
      return itemJSON;
    });

    res.json({ success: true, data: formattedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── getPackages (public) ─────────────────────────────────────
exports.getPackages = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      where: {
        is_available: true,
        type: 'package'
      },
      order: [['sort_order', 'ASC']]
    });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── getFeaturedMenu (public) ─────────────────────────────────
exports.getFeaturedMenu = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      where: {
        type: 'menu',
        [Op.or]: [
          { badge: { [Op.not]: null } },
          { sort_order: { [Op.lte]: 5 } }
        ]
      },
      order: [['sort_order', 'ASC']],
      limit: 8
    });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── ADMIN CRUD ───────────────────────────────────────────────

// GET all items (admin — termasuk yang unavailable)
exports.getAllMenuAdmin = async (req, res) => {
  try {
    const { search = '', category = '', type = '' } = req.query;
    
    const whereClause = {};
    if (search) whereClause.name = { [Op.like]: `%${search}%` };
    if (category) whereClause.category_id = category;
    if (type) whereClause.type = type;

    const items = await MenuItem.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['label']
        }
      ],
      order: [
        ['type', 'ASC'],
        ['sort_order', 'ASC'],
        ['id', 'DESC']
      ]
    });

    const total = await MenuItem.count();
    const catsCount = await Category.count();

    const formattedItems = items.map(item => {
      const itemJSON = item.toJSON();
      itemJSON.category_name = itemJSON.category ? itemJSON.category.label : null;
      return itemJSON;
    });

    res.json({ success: true, data: formattedItems, total, categories: catsCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST create item
exports.createMenuItem = async (req, res) => {
  const { name, description, price, category_id, image_url, is_available, type, badge } = req.body;
  if (!name || !price || !category_id) {
    return res.status(400).json({ success: false, error: 'Nama, harga, dan kategori wajib diisi.' });
  }
  try {
    const newItem = await MenuItem.create({
      name,
      description: description || '',
      price,
      category_id,
      image_url: image_url || '',
      is_available: is_available !== false,
      type: type || 'menu',
      badge: badge || null
    });
    res.json({ success: true, id: newItem.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PUT update item
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, image_url, is_available, type, badge } = req.body;
  try {
    const item = await MenuItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    await item.update({
      name,
      description,
      price,
      category_id,
      image_url,
      is_available: is_available !== false,
      type: type || 'menu',
      badge: badge || null
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// DELETE item
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCount = await MenuItem.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─── CATEGORY CRUD ───────────────────────────────────────────

exports.createCategory = async (req, res) => {
  const { label } = req.body;
  if (!label) return res.status(400).json({ success: false, error: 'Label wajib diisi.' });
  try {
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCategory = await Category.create({ slug, label });
    res.json({ success: true, id: newCategory.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    await category.update({ label });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if category is used in items
    const count = await MenuItem.count({ where: { category_id: id } });
    if (count > 0) {
      return res.status(400).json({ success: false, error: 'Kategori sedang digunakan oleh menu item.' });
    }
    await Category.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
