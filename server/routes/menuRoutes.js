const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/categories', menuController.getCategories);
router.get('/menu', menuController.getMenu);
router.get('/packages', menuController.getPackages);
router.get('/featured-menu', menuController.getFeaturedMenu);

// Admin CRUD
router.get('/admin/menu', menuController.getAllMenuAdmin);
router.post('/admin/menu', menuController.createMenuItem);
router.put('/admin/menu/:id', menuController.updateMenuItem);
router.delete('/admin/menu/:id', menuController.deleteMenuItem);

router.post('/admin/categories', menuController.createCategory);
router.put('/admin/categories/:id', menuController.updateCategory);
router.delete('/admin/categories/:id', menuController.deleteCategory);

module.exports = router;
