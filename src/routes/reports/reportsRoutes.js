const express = require('express');
const router = express.Router();
const controller = require('../../controllers/reports/reportsController');

router.get('/sales', controller.getSalesReport);
router.get('/inventory', controller.getInventoryReport);
router.get('/customers', controller.getCustomerReport);
router.get('/suppliers', controller.getSupplierReport);
router.get('/expenses', controller.getExpenseReport);
router.get('/profit-loss', controller.getProfitLossReport);
router.get('/aged-receivables', controller.getAgedReceivables);
router.get('/aged-payables', controller.getAgedPayables);
router.get('/stock-valuation', controller.getStockValuation);
router.get('/top-products', controller.getTopProducts);
router.get('/top-customers', controller.getTopCustomers);

module.exports = router;
