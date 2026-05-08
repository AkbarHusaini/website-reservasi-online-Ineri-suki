const midtransClient = require('midtrans-client');
const pool = require('../config/db');

// Initialize Midtrans Snap client
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
        // 1. Get order details from DB to verify
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const order = rows[0];

        if (!order) {
            console.error(`Order #${orderId} not found in database.`);
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // 2. Prepare Item Details for Midtrans
        let items = [];
        try {
            if (order.items_json) {
                const cartItems = JSON.parse(order.items_json);
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

        // Add Tax and Service Fee as item details if they are part of the gross_amount
        // Note: The total gross_amount MUST match the sum of item_details
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.round(subtotal * 0.1);
        const serviceFee = Math.round(subtotal * 0.05);
        
        if (tax > 0) items.push({ id: 'TAX-10', price: tax, quantity: 1, name: 'Pajak (10%)' });
        if (serviceFee > 0) items.push({ id: 'SRV-5', price: serviceFee, quantity: 1, name: 'Biaya Layanan (5%)' });

        const finalGrossAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 3. Prepare Midtrans parameter
        const midtransOrderId = `INARI-ORD-${orderId}-${Date.now()}`;
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
                "duration": 60
            }
        };

        console.log('Sending parameter to Midtrans:', JSON.stringify(parameter));

        // 4. Create Snap Token
        const transaction = await snap.createTransaction(parameter);
        
        // Simpan midtrans_order_id ke DB untuk keperluan refund
        await pool.query('UPDATE orders SET midtrans_order_id = ? WHERE id = ?', [midtransOrderId, orderId]);
        
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
        const orderIdFull = statusResponse.order_id; // INARI-ORD-ID-TIMESTAMP
        const orderId = orderIdFull.split('-')[2];
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud: ${fraudStatus}`);

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                // TODO set transaction status on your database to 'challenge'
            } else if (fraudStatus == 'accept') {
                // TODO set transaction status on your database to 'success'
                await pool.query('UPDATE orders SET status = "paid" WHERE id = ?', [orderId]);
                await pool.query('UPDATE reservations SET status = "confirmed" WHERE id = (SELECT reservation_id FROM orders WHERE id = ?)', [orderId]);
            }
        } else if (transactionStatus == 'settlement') {
            // TODO set transaction status on your database to 'success'
            await pool.query('UPDATE orders SET status = "paid" WHERE id = ?', [orderId]);
            await pool.query('UPDATE reservations SET status = "confirmed" WHERE id = (SELECT reservation_id FROM orders WHERE id = ?)', [orderId]);
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            // TODO set transaction status on your database to 'failure'
            await pool.query('UPDATE orders SET status = "cancelled" WHERE id = ?', [orderId]);
        } else if (transactionStatus == 'pending') {
            // TODO set transaction status on your database to 'pending'
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
        // Jika ada flag simulate=true (dipanggil dari tombol Bayar Sekarang), langsung lunasin untuk testing
        if (simulate === 'true') {
            await pool.query('UPDATE orders SET status = "paid" WHERE id = ?', [orderId]);
            await pool.query('UPDATE reservations SET status = "confirmed" WHERE id = (SELECT reservation_id FROM orders WHERE id = ?)', [orderId]);
            return res.json({
                success: true,
                message: 'Status updated to PAID (Simulated)',
                newStatus: 'paid'
            });
        }

        // 1. Dapatkan midtrans_order_id dari database
        const [rows] = await pool.query('SELECT midtrans_order_id, status FROM orders WHERE id = ?', [orderId]);
        const order = rows[0];

        if (!order || !order.midtrans_order_id) {
            return res.json({
                success: true,
                message: 'Belum ada transaksi Midtrans untuk order ini.',
                status: order ? order.status : 'unknown'
            });
        }

        // 2. Cek status ke Midtrans secara real
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

            // 3. Update DB jika ada perubahan status
            if (newStatus !== order.status) {
                await pool.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);
                if (newStatus === 'paid') {
                    await pool.query('UPDATE reservations SET status = "confirmed" WHERE id = (SELECT reservation_id FROM orders WHERE id = ?)', [orderId]);
                } else if (newStatus === 'cancelled') {
                    await pool.query('UPDATE reservations SET status = "cancelled" WHERE id = (SELECT reservation_id FROM orders WHERE id = ?)', [orderId]);
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
            // Jika gagal cek (misal order_id tidak ditemukan di midtrans), kembalikan status DB
            res.json({
                success: true,
                message: 'Menggunakan status lokal (Midtrans tidak ditemukan)',
                status: order.status
            });
        }

    } catch (err) {
        console.error('Check Status Error:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status' });
    }
};

exports.refundOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (!orderRows.length) return res.status(404).json({ success: false, error: 'Order not found' });
        
        const order = orderRows[0];
        const midtransOrderId = order.midtrans_order_id;
        
        if (!midtransOrderId) {
            return res.status(400).json({ success: false, error: 'Order ini tidak memiliki ID Midtrans (mungkin dibuat sebelum fitur refund aktif)' });
        }

        // Kalkulasi Refund: Total Harga - Rp 5.000 (Booking Fee Hangus)
        const refundAmount = Math.max(0, Number(order.total_price) - 5000);

        if (refundAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Jumlah refund tidak valid' });
        }

        // 1. Update status di DB dulu
        await pool.query('UPDATE orders SET status = "cancelled" WHERE id = ?', [orderId]);
        await pool.query('UPDATE reservations SET status = "cancelled" WHERE id = ?', [order.reservation_id]);

        // 2. Panggil API Midtrans Refund
        try {
            const parameter = {
                "refund_key": `refund-${orderId}-${Date.now()}`,
                "amount": refundAmount,
                "reason": "Customer No Show / Cancelled by Admin"
            };
            
            // Catatan: Refund API hanya tersedia untuk beberapa metode pembayaran di Sandbox (Gopay/Card)
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
