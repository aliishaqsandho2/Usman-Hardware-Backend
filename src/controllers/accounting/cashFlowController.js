const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_cash_flow ORDER BY date DESC LIMIT 100');
        success(res, rows, 'Cash flow records');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_cash_flow WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Record not found', 404);
        success(res, rows[0], 'Cash flow details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { type, account_id, amount, date, description, reference } = req.body;
        // Basic validation
        if (!type || !amount || !date) {
            return error(res, 'Missing required fields', 400);
        }

        const [result] = await db.query(`
            INSERT INTO uh_ims_cash_flow (type, account_id, amount, date, description, reference)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [type, account_id, amount, date, description, reference]);

        success(res, { id: result.insertId }, 'Cash flow recorded', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { type, amount, date, description } = req.body;
        await db.query(`
            UPDATE uh_ims_cash_flow SET type = ?, amount = ?, date = ?, description = ? WHERE id = ?
        `, [type, amount, date, description, req.params.id]);
        success(res, null, 'Cash flow updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_cash_flow WHERE id = ?', [req.params.id]);
        success(res, null, 'Cash flow deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_cash_flow WHERE type = ?', [req.params.type]);
        success(res, rows, 'Cash flow by type');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByDate = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_cash_flow WHERE date = ?', [req.params.date]);
        success(res, rows, 'Cash flow by date');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByRange = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_cash_flow WHERE date BETWEEN ? AND ?', [req.params.start, req.params.end]);
        success(res, rows, 'Cash flow by range');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByAccount = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_cash_flow WHERE account_id = ?', [req.params.id]);
        success(res, rows, 'Cash flow by account');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getSummary = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT type, SUM(amount) as total 
            FROM uh_ims_cash_flow 
            GROUP BY type
        `);
        success(res, rows, 'Cash flow summary');
    } catch (err) {
        error(res, err.message);
    }
};
