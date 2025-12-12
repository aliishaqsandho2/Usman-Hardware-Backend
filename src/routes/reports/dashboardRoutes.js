const express = require('express');
const router = express.Router();
const controller = require('../../controllers/reports/dashboardController');

router.get('/summary', controller.getSummary);
router.get('/sales-trend', controller.getSalesTrend);
router.get('/revenue-metrics', controller.getRevenueMetrics);
router.get('/inventory-metrics', controller.getInventoryMetrics);
router.get('/customer-metrics', controller.getCustomerMetrics);
router.get('/expense-metrics', controller.getExpenseMetrics);
router.get('/profit-loss', controller.getProfitLoss);
router.get('/balance-sheet', controller.getBalanceSheet);
router.get('/cash-flow-statement', controller.getCashFlow);

module.exports = router;
