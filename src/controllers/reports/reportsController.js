const { success, error } = require('../../utils/response');

exports.getSalesReport = async (req, res) => { success(res, {}, 'Sales Report'); };
exports.getInventoryReport = async (req, res) => { success(res, {}, 'Inventory Report'); };
exports.getCustomerReport = async (req, res) => { success(res, {}, 'Customer Report'); };
exports.getSupplierReport = async (req, res) => { success(res, {}, 'Supplier Report'); };
exports.getExpenseReport = async (req, res) => { success(res, {}, 'Expense Report'); };
exports.getProfitLossReport = async (req, res) => { success(res, {}, 'P&L Report'); };
exports.getAgedReceivables = async (req, res) => { success(res, {}, 'Aged Receivables'); };
exports.getAgedPayables = async (req, res) => { success(res, {}, 'Aged Payables'); };
exports.getStockValuation = async (req, res) => { success(res, {}, 'Stock Valuation'); };
exports.getTopProducts = async (req, res) => { success(res, {}, 'Top Products'); };
exports.getTopCustomers = async (req, res) => { success(res, {}, 'Top Customers'); };
