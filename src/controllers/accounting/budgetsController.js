const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_budgets ORDER BY year DESC, month DESC');
        success(res, rows, 'Budgets list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_budgets WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Budget not found', 404);
        success(res, rows[0], 'Budget details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { year, month, category, budget_amount } = req.body;

        const [result] = await db.query(`
            INSERT INTO uh_ims_budgets (year, month, category, budget_amount, actual_amount, variance)
            VALUES (?, ?, ?, ?, 0, 0)
        `, [year, month, category, budget_amount]);

        success(res, { id: result.insertId }, 'Budget created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { budget_amount } = req.body;
        // Calculate new variance
        // variance = budget - actual (if logic is under-budget is positive) or actual - budget (over-budget)
        // Usually variance = budget - actual

        await db.query(`
            UPDATE uh_ims_budgets 
            SET budget_amount = ?, variance = ? - actual_amount
            WHERE id = ?
        `, [budget_amount, budget_amount, req.params.id]);
        success(res, null, 'Budget updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_budgets WHERE id = ?', [req.params.id]);
        success(res, null, 'Budget deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByYear = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_budgets WHERE year = ?', [req.params.year]);
        success(res, rows, 'Budgets by year');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByMonth = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_budgets WHERE year = ? AND month = ?', [req.params.year, req.params.month]);
        success(res, rows, 'Budgets by month');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByCategory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_budgets WHERE category = ?', [req.params.category]);
        success(res, rows, 'Budgets by category');
    } catch (err) {
        error(res, err.message);
    }
};

exports.updateActual = async (req, res) => {
    try {
        const { amount } = req.body; // Incremental or absolute? Usually updates actual based on spending.
        // Assuming absolute set for this endpoint or adding? 
        // "Update actual amount" implies setting it.

        const [rows] = await db.query('SELECT budget_amount FROM uh_ims_budgets WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Budget not found', 404);

        const budget = rows[0].budget_amount;
        const variance = budget - amount;

        await db.query(`
            UPDATE uh_ims_budgets 
            SET actual_amount = ?, variance = ?
            WHERE id = ?
        `, [amount, variance, req.params.id]);

        success(res, null, 'Budget actual updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getVarianceReport = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_budgets WHERE variance < 0'); // Over budget
        success(res, rows, 'Variance report (Over budget)');
    } catch (err) {
        error(res, err.message);
    }
};
