const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.get('/tables', tableController.getAllTables);
router.get('/admin/tables', tableController.getAllTables);
router.post('/admin/tables', tableController.createTable);
router.put('/admin/tables/:id', tableController.updateTable);
router.delete('/admin/tables/:id', tableController.deleteTable);

module.exports = router;
