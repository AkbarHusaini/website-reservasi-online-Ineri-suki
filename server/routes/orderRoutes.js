const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.post('/orders', authenticateToken, orderController.createOrder);

// Admin Routes
router.get('/admin/orders', orderController.getAllOrdersAdmin);
router.put('/admin/orders/:id', orderController.updateOrderAdmin);
router.delete('/admin/orders/:id', orderController.deleteOrderAdmin);
router.post('/orders/:id/submit-refund', authenticateToken, orderController.submitRefundDetails);

module.exports = router;
