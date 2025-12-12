const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./src/routes/auth/authRoutes');
const usersRoutes = require('./src/routes/auth/usersRoutes');
const sessionsRoutes = require('./src/routes/auth/sessionsRoutes');
const activitiesRoutes = require('./src/routes/auth/activitiesRoutes');
const auditLogsRoutes = require('./src/routes/auth/auditLogsRoutes');

const accountsRoutes = require('./src/routes/accounting/accountsRoutes');
const transactionsRoutes = require('./src/routes/accounting/transactionsRoutes');
const transactionEntriesRoutes = require('./src/routes/accounting/transactionEntriesRoutes');
const cashFlowRoutes = require('./src/routes/accounting/cashFlowRoutes');
const budgetsRoutes = require('./src/routes/accounting/budgetsRoutes');
const profitSummaryRoutes = require('./src/routes/accounting/profitSummaryRoutes');

const expensesRoutes = require('./src/routes/expenses/expensesRoutes');
const scheduledExpensesRoutes = require('./src/routes/expenses/scheduledExpensesRoutes');
const paymentsRoutes = require('./src/routes/expenses/paymentsRoutes');
const supplierPaymentsRoutes = require('./src/routes/expenses/supplierPaymentsRoutes');
const allocationsRoutes = require('./src/routes/expenses/allocationsRoutes');
const paymentTermsRoutes = require('./src/routes/expenses/paymentTermsRoutes');

const productsRoutes = require('./src/routes/inventory/productsRoutes');
const productImagesRoutes = require('./src/routes/inventory/productImagesRoutes');
const productVariantsRoutes = require('./src/routes/inventory/productVariantsRoutes');
const categoriesRoutes = require('./src/routes/inventory/categoriesRoutes');
const unitsRoutes = require('./src/routes/inventory/unitsRoutes');
const movementsRoutes = require('./src/routes/inventory/movementsRoutes');

const salesRoutes = require('./src/routes/sales/salesRoutes');
const saleItemsRoutes = require('./src/routes/sales/saleItemsRoutes');
const saleAdjustmentsRoutes = require('./src/routes/sales/saleAdjustmentsRoutes');
const quotationsRoutes = require('./src/routes/sales/quotationsRoutes');

const customersRoutes = require('./src/routes/parties/customersRoutes');
const suppliersRoutes = require('./src/routes/parties/suppliersRoutes');
const outsourcingOrdersRoutes = require('./src/routes/parties/outsourcingOrdersRoutes');
const externalPurchasesRoutes = require('./src/routes/parties/externalPurchasesRoutes');

const purchaseOrdersRoutes = require('./src/routes/procurement/purchaseOrdersRoutes');

const eventsRoutes = require('./src/routes/scheduling/eventsRoutes');
const notificationsRoutes = require('./src/routes/scheduling/notificationsRoutes');

const employeesRoutes = require('./src/routes/hr/employeesRoutes');

const dashboardRoutes = require('./src/routes/reports/dashboardRoutes');
const reportsRoutes = require('./src/routes/reports/reportsRoutes');

const settingsRoutes = require('./src/routes/utility/settingsRoutes');
const backupRoutes = require('./src/routes/utility/backupRoutes');
const dataRoutes = require('./src/routes/utility/dataRoutes');
const healthRoutes = require('./src/routes/utility/healthRoutes');
const bulkRoutes = require('./src/routes/utility/bulkRoutes');

// Stub Authentication Middleware
const authMiddleware = require('./src/middleware/authMiddleware');

// Route Registration
// Authentication & Security
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/sessions', authMiddleware, sessionsRoutes);
app.use('/api/activities', authMiddleware, activitiesRoutes);
app.use('/api/audit-logs', authMiddleware, auditLogsRoutes);

// Accounting
app.use('/api/accounts', authMiddleware, accountsRoutes);
app.use('/api/transactions', authMiddleware, transactionsRoutes);
app.use('/api/transaction-entries', authMiddleware, transactionEntriesRoutes);
app.use('/api/cash-flow', authMiddleware, cashFlowRoutes);
app.use('/api/budgets', authMiddleware, budgetsRoutes);
app.use('/api/profit-summary', authMiddleware, profitSummaryRoutes);

// Expenses
app.use('/api/expenses', authMiddleware, expensesRoutes);
app.use('/api/scheduled-expenses', authMiddleware, scheduledExpensesRoutes);
app.use('/api/payments', authMiddleware, paymentsRoutes);
app.use('/api/supplier-payments', authMiddleware, supplierPaymentsRoutes);
app.use('/api/payment-allocations', authMiddleware, allocationsRoutes);
app.use('/api/payment-terms', authMiddleware, paymentTermsRoutes);

// Inventory
app.use('/api/products', authMiddleware, productsRoutes);
app.use('/api/products', authMiddleware, productImagesRoutes); // Nested routes mostly
app.use('/api/products', authMiddleware, productVariantsRoutes); // Nested routes also handled
app.use('/api/categories', authMiddleware, categoriesRoutes);
app.use('/api/units', authMiddleware, unitsRoutes);
app.use('/api/inventory-movements', authMiddleware, movementsRoutes);

// Sales
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/sales', authMiddleware, saleItemsRoutes); // Nested
app.use('/api/sale-adjustments', authMiddleware, saleAdjustmentsRoutes);
app.use('/api/quotations', authMiddleware, quotationsRoutes);

// Parties
app.use('/api/customers', authMiddleware, customersRoutes);
app.use('/api/suppliers', authMiddleware, suppliersRoutes);
app.use('/api/outsourcing-orders', authMiddleware, outsourcingOrdersRoutes);
app.use('/api/external-purchases', authMiddleware, externalPurchasesRoutes);

// Procurement
app.use('/api/purchase-orders', authMiddleware, purchaseOrdersRoutes);

// Scheduling
app.use('/api/events', authMiddleware, eventsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

// HR
app.use('/api/employees', authMiddleware, employeesRoutes);

// Reports
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/reports', authMiddleware, reportsRoutes);

// Utility
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/system', authMiddleware, backupRoutes); // /api/system/backup
app.use('/api/data', authMiddleware, dataRoutes); // /api/data/import
app.use('/api/system', authMiddleware, healthRoutes); // /api/system/health
app.use('/api/bulk', authMiddleware, bulkRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : null
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
