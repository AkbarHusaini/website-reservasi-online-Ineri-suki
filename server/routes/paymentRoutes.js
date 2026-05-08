const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/payments/create-transaction', paymentController.createTransaction);
router.post('/payments/notification', paymentController.handleNotification);
router.get('/payments/status/:orderId', paymentController.checkTransactionStatus);
router.post('/payments/refund/:orderId', paymentController.refundOrder);

module.exports = router;
