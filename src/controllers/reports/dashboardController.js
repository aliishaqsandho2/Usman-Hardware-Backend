const { success, error } = require('../../utils/response');

exports.getSummary = async (req, res) => { success(res, {}, 'Dashboard summary'); };
exports.getSalesTrend = async (req, res) => { success(res, [], 'Sales trend'); };
exports.getRevenueMetrics = async (req, res) => { success(res, {}, 'Revenue metrics'); };
exports.getInventoryMetrics = async (req, res) => { success(res, {}, 'Inventory metrics'); };
exports.getCustomerMetrics = async (req, res) => { success(res, {}, 'Customer metrics'); };
exports.getExpenseMetrics = async (req, res) => { success(res, {}, 'Expense metrics'); };
exports.getProfitLoss = async (req, res) => { success(res, {}, 'Profit Loss'); };
exports.getBalanceSheet = async (req, res) => { success(res, {}, 'Balance Sheet'); };
exports.getCashFlow = async (req, res) => { success(res, {}, 'Cash Flow Statement'); };
