const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_scheduled_expenses ORDER BY next_execution ASC');
        success(res, rows, 'Scheduled expenses list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_scheduled_expenses WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Scheduled expense not found', 404);
        success(res, rows[0], 'Scheduled expense details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { category, description, amount, frequency, start_date, account_id, payment_method, created_by } = req.body;

        if (!category || !amount || !frequency || !start_date) {
            return error(res, 'Missing required fields', 400);
        }

        // Calculate next_execution based on start_date and frequency
        let next_execution = new Date(start_date);
        // Assuming start_date is the first one, or use logic if start_date is in past

        const [result] = await db.query(`
            INSERT INTO uh_ims_scheduled_expenses (category, description, amount, frequency, start_date, next_execution, status, account_id, payment_method, created_by)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
        `, [category, description, amount, frequency, start_date, next_execution, account_id || null, payment_method, created_by || null]);

        success(res, { id: result.insertId }, 'Scheduled expense created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { category, description, amount, frequency, start_date, account_id, payment_method } = req.body;

        await db.query(`
            UPDATE uh_ims_scheduled_expenses 
            SET category = ?, description = ?, amount = ?, frequency = ?, start_date = ?, account_id = ?, payment_method = ?
            WHERE id = ?
        `, [category, description, amount, frequency, start_date, account_id, payment_method, req.params.id]);

        success(res, null, 'Scheduled expense updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM uh_ims_scheduled_expenses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return error(res, 'Scheduled expense not found', 404);
        success(res, null, 'Scheduled expense deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body; // active, paused, inactive
        await db.query('UPDATE uh_ims_scheduled_expenses SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, null, 'Status updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_scheduled_expenses WHERE status = ?', [req.params.status]);
        success(res, rows, 'Scheduled expenses by status');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByFrequency = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_scheduled_expenses WHERE frequency = ?', [req.params.frequency]);
        success(res, rows, 'Scheduled expenses by frequency');
    } catch (err) {
        error(res, err.message);
    }
};

exports.execute = async (req, res) => {
    let connection;
    try {
        // Execute manually: Create Expense entry, update last_executed/next_execution/count
        const [rows] = await db.query('SELECT * FROM uh_ims_scheduled_expenses WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Scheduled expense not found', 404);

        const se = rows[0];
        const executionDate = new Date();

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Create Expense Record
        await connection.query(`
            INSERT INTO uh_ims_expenses (category, account_id, description, amount, date, reference, payment_method, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [se.category, se.account_id, se.description || `Executed Scheduled: ${se.category}`, se.amount, executionDate, `SCH-${se.id}`, se.payment_method, se.created_by]);

        // 2. Update Scheduled Expense
        // Calculate next date
        let nextDate = new Date(se.next_execution);
        if (se.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        if (se.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        if (se.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        if (se.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

        await connection.query(`
            UPDATE uh_ims_scheduled_expenses 
            SET last_executed = ?, next_execution = ?, execution_count = execution_count + 1
            WHERE id = ?
        `, [executionDate, nextDate, se.id]);

        await connection.commit();
        success(res, null, 'Scheduled expense executed');

    } catch (err) {
        if (connection) await connection.rollback();
        error(res, err.message);
    } finally {
        if (connection) connection.release();
    }
};

exports.getUpcoming = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_scheduled_expenses WHERE next_execution <= DATE_ADD(NOW(), INTERVAL 7 DAY) AND status = "active"');
        success(res, rows, 'Upcoming expenses (7 days)');
    } catch (err) {
        error(res, err.message);
    }
};
