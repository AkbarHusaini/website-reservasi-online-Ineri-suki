const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/booked', reservationController.getBookedTables);
router.get('/admin/reservations', reservationController.getAllReservations);
router.put('/admin/reservations/:id', reservationController.updateReservation);
router.delete('/admin/reservations/:id', reservationController.deleteReservation);

module.exports = router;
