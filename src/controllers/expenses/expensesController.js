const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const [rows] = await db.query('SELECT * FROM uh_ims_expenses ORDER BY date DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);

        const [count] = await db.query('SELECT COUNT(*) as total FROM uh_ims_expenses');

        success(res, {
            expenses: rows,
            pagination: {
                total: count[0].total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        }, 'Expenses list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_expenses WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Expense not found', 404);
        success(res, rows[0], 'Expense details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { category, account_id, description, amount, date, reference, payment_method, created_by } = req.body;

        if (!category || !amount || !date || !payment_method) {
            return error(res, 'Missing required fields', 400);
        }

        const [result] = await db.query(`
            INSERT INTO uh_ims_expenses (category, account_id, description, amount, date, reference, payment_method, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [category, account_id || null, description, amount, date, reference, payment_method, created_by || null]);

        success(res, { id: result.insertId }, 'Expense created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { category, account_id, description, amount, date, reference, payment_method } = req.body;

        const [result] = await db.query(`
            UPDATE uh_ims_expenses 
            SET category = ?, account_id = ?, description = ?, amount = ?, date = ?, reference = ?, payment_method = ?
            WHERE id = ?
        `, [category, account_id, description, amount, date, reference, payment_method, req.params.id]);

        if (result.affectedRows === 0) return error(res, 'Expense not found', 404);
        success(res, null, 'Expense updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM uh_ims_expenses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return error(res, 'Expense not found', 404);
        success(res, null, 'Expense deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByCategory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_expenses WHERE category = ? ORDER BY date DESC', [req.params.category]);
        success(res, rows, 'Expenses by category');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByDate = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_expenses WHERE date = ?', [req.params.date]);
        success(res, rows, 'Expenses by date');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByRange = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC', [req.params.start, req.params.end]);
        success(res, rows, 'Expenses by range');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByMethod = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_expenses WHERE payment_method = ? ORDER BY date DESC', [req.params.method]);
        success(res, rows, 'Expenses by method');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByUser = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_expenses WHERE created_by = ? ORDER BY date DESC', [req.params.userId]);
        success(res, rows, 'Expenses by user');
    } catch (err) {
        error(res, err.message);
    }
};

exports.uploadReceipt = async (req, res) => {
    try {
        // Stub for file upload
        // In real app, handle file upload and get URL
        const receipt_url = 'http://placeholder.com/receipt.jpg';
        await db.query('UPDATE uh_ims_expenses SET receipt_url = ? WHERE id = ?', [receipt_url, req.params.id]);
        success(res, { receipt_url }, 'Receipt uploaded');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getSummary = async (req, res) => {
    try {
        const [byCategory] = await db.query('SELECT category, SUM(amount) as total FROM uh_ims_expenses GROUP BY category');
        const [total] = await db.query('SELECT SUM(amount) as grand_total FROM uh_ims_expenses');
        success(res, { byCategory, total: total[0].grand_total }, 'Expenses summary');
    } catch (err) {
        error(res, err.message);
    }
};
