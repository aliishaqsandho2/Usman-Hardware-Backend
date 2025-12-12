const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_profit_summary ORDER BY period_date DESC');
        success(res, rows, 'Profit summaries');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_profit_summary WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Record not found', 404);
        success(res, rows[0], 'Profit summary details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { period_date, period_type, revenue, cogs, expenses } = req.body;
        const profit = (parseFloat(revenue) - parseFloat(cogs) - parseFloat(expenses)).toFixed(2);

        const [result] = await db.query(`
            INSERT INTO uh_ims_profit_summary (period_date, period_type, revenue, cogs, expenses, profit)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [period_date, period_type, revenue, cogs, expenses, profit]);

        success(res, { id: result.insertId }, 'Profit summary created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { revenue, cogs, expenses } = req.body;
        // Recalculate profit
        // This assumes we provide all 3, or we need to fetch existing.
        // Doing full update for simplicity or fetch first.

        const [current] = await db.query('SELECT * FROM uh_ims_profit_summary WHERE id = ?', [req.params.id]);
        if (current.length === 0) return error(res, 'Record not found', 404);

        const r = revenue !== undefined ? revenue : current[0].revenue;
        const c = cogs !== undefined ? cogs : current[0].cogs;
        const e = expenses !== undefined ? expenses : current[0].expenses;
        const p = (parseFloat(r) - parseFloat(c) - parseFloat(e)).toFixed(2);

        await db.query(`
            UPDATE uh_ims_profit_summary 
            SET revenue = ?, cogs = ?, expenses = ?, profit = ?
            WHERE id = ?
        `, [r, c, e, p, req.params.id]);

        success(res, null, 'Profit summary updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_profit_summary WHERE id = ?', [req.params.id]);
        success(res, null, 'Profit summary deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByPeriodDate = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_profit_summary WHERE period_date = ?', [req.params.date]);
        success(res, rows, 'Summary by date');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_profit_summary WHERE period_type = ?', [req.params.type]);
        success(res, rows, 'Summary by type');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByRange = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_profit_summary WHERE period_date BETWEEN ? AND ?', [req.params.start, req.params.end]);
        success(res, rows, 'Summary by range');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getReport = async (req, res) => {
    // Generate Report Logic
    success(res, 'url_placeholder', 'Report generation not implemented');
};
