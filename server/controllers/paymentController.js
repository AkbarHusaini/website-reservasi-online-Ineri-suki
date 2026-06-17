const midtransClient = require('midtrans-client');
const { Order, Reservation } = require('../models');

// Initialize Midtrans Snap client using environment variables
const snap = new midtransClient.Snap({
    isProduction: process.env.IS_PRODUCTION === 'true',
    serverKey: (process.env.MIDTRANS_SERVER_KEY || '').trim(),
    clientKey: (process.env.MIDTRANS_CLIENT_KEY || '').trim()
});

exports.createTransaction = async (req, res) => {
    const { orderId, amount, customerDetails } = req.body;

    console.log(`Attempting to create Midtrans transaction for Order #${orderId}, Amount: ${amount}`);

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            console.error(`Order #${orderId} not found in database.`);
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        let items = [];
        try {
            if (order.items_json) {
                const cartItems = typeof order.items_json === 'string' 
                    ? JSON.parse(order.items_json) 
                    : order.items_json;
                items = cartItems.map(item => ({
                    id: item.id,
                    price: Math.round(Number(item.price)),
                    quantity: item.qty,
                    name: (item.name || 'Menu Item').substring(0, 50)
                }));
            }
        } catch (e) {
            console.error('Failed to parse items for Midtrans', e);
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const serviceFee = Math.round(subtotal * 0.05);
        
        if (serviceFee > 0) items.push({ id: 'SRV-5', price: serviceFee, quantity: 1, name: 'Biaya Layanan (5%)' });

        const finalGrossAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const midtransOrderId = `Ineri-ORD-${orderId}-${Date.now()}`;
        let parameter = {
            "transaction_details": {
                "order_id": midtransOrderId,
                "gross_amount": finalGrossAmount
            },
            "item_details": items,
            "credit_card": {
                "secure": true
            },
            "customer_details": {
                "first_name": customerDetails?.name || 'Customer',
                "email": customerDetails?.email || 'customer@example.com',
                "phone": customerDetails?.phone || ''
            },
            "expiry": {
                "unit": "minutes",
                "duration": 15
            }
        };

        console.log('Sending parameter to Midtrans:', JSON.stringify(parameter));

        const transaction = await snap.createTransaction(parameter);
        
        await order.update({ midtrans_order_id: midtransOrderId });
        
        console.log('Midtrans Snap Token created successfully:', transaction.token);

        res.json({
            success: true,
            snapToken: transaction.token
        });

    } catch (err) {
        console.error('MIDTRANS ERROR DETAILS:', err.message);
        if (err.ApiResponse) {
            console.error('Midtrans API Response:', JSON.stringify(err.ApiResponse));
        }
        res.status(500).json({ 
            success: false, 
            message: 'Gagal menghubungi Midtrans',
            error: err.message 
        });
    }
};

exports.handleNotification = async (req, res) => {
    const notification = req.body;

    try {
        const statusResponse = await snap.transaction.notification(notification);
        const orderIdFull = statusResponse.order_id;
        const orderId = orderIdFull.split('-')[2];
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud: ${fraudStatus}`);

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(200).send('OK');

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                // challenge
            } else if (fraudStatus == 'accept') {
                await order.update({ status: 'paid' });
                if (order.reservation_id) {
                    await Reservation.update({ status: 'confirmed' }, { where: { id: order.reservation_id } });
                }
            }
        } else if (transactionStatus == 'settlement') {
            await order.update({ status: 'paid' });
            if (order.reservation_id) {
                await Reservation.update({ status: 'confirmed' }, { where: { id: order.reservation_id } });
            }
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            await order.update({ status: 'cancelled' });
        } else if (transactionStatus == 'pending') {
            // pending
        }

        res.status(200).send('OK');

    } catch (err) {
        console.error('Midtrans Notification Error:', err);
        res.status(500).send('Error');
    }
};

exports.checkTransactionStatus = async (req, res) => {
    const { orderId } = req.params;
    const { simulate } = req.query;

    try {
        const order = await Order.findByPk(orderId);

        if (simulate === 'true') {
            if (order) {
                const createdAt = new Date(order.created_at).getTime();
                const now = new Date().getTime();
                const diffMinutes = (now - createdAt) / (1000 * 60);

                if (diffMinutes > 15) {
                    await order.update({ status: 'cancelled' });
                    if (order.reservation_id) {
                        await Reservation.update({ status: 'cancelled' }, { where: { id: order.reservation_id } });
                    }
                    return res.json({ success: false, message: 'Waktu pembayaran telah habis. Pesanan dibatalkan.', status: 'cancelled' });
                }

                await order.update({ status: 'paid', was_paid: true });
                if (order.reservation_id) {
                    await Reservation.update({ status: 'confirmed' }, { where: { id: order.reservation_id } });
                }
                return res.json({
                    success: true,
                    message: 'Status updated to PAID (Simulated)',
                    newStatus: 'paid'
                });
            } else {
                return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
            }
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
        }

        const createdAt = new Date(order.created_at).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (diffMinutes > 15 && order.status === 'pending') {
            await order.update({ status: 'cancelled' });
            if (order.reservation_id) {
                await Reservation.update({ status: 'cancelled' }, { where: { id: order.reservation_id } });
            }
            return res.json({ success: false, message: 'Waktu pembayaran telah habis. Pesanan dibatalkan.', status: 'cancelled' });
        }

        if (!order.midtrans_order_id) {
            return res.json({
                success: true,
                message: 'Belum ada transaksi Midtrans untuk order ini.',
                status: order.status
            });
        }

        try {
            const statusResponse = await snap.transaction.status(order.midtrans_order_id);
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            console.log(`Real status check for Order #${orderId}: ${transactionStatus}`);

            let newStatus = order.status;

            if (transactionStatus == 'capture') {
                if (fraudStatus == 'accept') {
                    newStatus = 'paid';
                }
            } else if (transactionStatus == 'settlement') {
                newStatus = 'paid';
            } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
                newStatus = 'cancelled';
            } else if (transactionStatus == 'pending') {
                newStatus = 'pending';
            }

            if (newStatus !== order.status) {
                if (newStatus === 'paid') {
                    await order.update({ status: newStatus, was_paid: true });
                    if (order.reservation_id) {
                        await Reservation.update({ status: 'confirmed' }, { where: { id: order.reservation_id } });
                    }
                } else {
                    await order.update({ status: newStatus });
                    if (newStatus === 'cancelled' && order.reservation_id) {
                        await Reservation.update({ status: 'cancelled' }, { where: { id: order.reservation_id } });
                    }
                }
            }

            res.json({
                success: true,
                message: `Status updated to ${newStatus.toUpperCase()}`,
                newStatus: newStatus,
                midtransStatus: transactionStatus
            });

        } catch (midtransErr) {
            console.error('Midtrans API Status Error:', midtransErr.message);
            res.json({
                success: true,
                message: 'Menggunakan status lokal (Midtrans tidak ditemukan)',
                status: order.status
            });
        }

    } catch (err) {
        console.error('CRITICAL Check Status Error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal memperbarui status',
            error: err.message,
            stack: err.stack 
        });
    }
};

exports.refundOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        
        const midtransOrderId = order.midtrans_order_id;
        
        if (!midtransOrderId) {
            return res.status(400).json({ success: false, error: 'Order ini tidak memiliki ID Midtrans (mungkin dibuat sebelum fitur refund aktif)' });
        }

        const refundAmount = Math.max(0, Number(order.total_price) - 5000);

        if (refundAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Jumlah refund tidak valid' });
        }

        await order.update({ status: 'cancelled' });
        if (order.reservation_id) {
            await Reservation.update({ status: 'cancelled' }, { where: { id: order.reservation_id } });
        }

        try {
            const parameter = {
                "refund_key": `refund-${orderId}-${Date.now()}`,
                "amount": refundAmount,
                "reason": "Customer No Show / Cancelled by Admin"
            };
            
            const refundResponse = await snap.transaction.refund(midtransOrderId, parameter);
            
            res.json({
                success: true,
                message: 'Refund berhasil diproses melalui Midtrans!',
                midtransResponse: refundResponse
            });
        } catch (midtransErr) {
            console.warn('Midtrans API Refund Warning:', midtransErr.message);
            res.json({
                success: true,
                message: 'Status dibatalkan di Database, namun Refund otomatis gagal: ' + midtransErr.message + '. Silakan lakukan refund manual di Dashboard Midtrans.',
            });
        }
    } catch (err) {
        console.error('Refund Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
