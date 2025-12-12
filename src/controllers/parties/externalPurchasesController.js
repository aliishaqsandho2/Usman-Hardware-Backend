const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_external_purchases ORDER BY created_at DESC');
        success(res, rows, 'Purchases list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_external_purchases WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Purchase not found', 404);
        success(res, rows[0], 'Purchase details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { sale_id, product_id, quantity, unit_price, total, source, reference } = req.body;
        if (!sale_id || !product_id || !quantity || !unit_price) return error(res, 'Required fields missing', 400);

        const [result] = await db.query(
            'INSERT INTO uh_ims_external_purchases (sale_id, product_id, quantity, unit_price, total, source, reference) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sale_id, product_id, quantity, unit_price, total || (quantity * unit_price), source, reference]
        );
        success(res, { id: result.insertId, ...req.body }, 'Recorded', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_external_purchases WHERE id = ?', [req.params.id]);
        success(res, null, 'Deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getBySale = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_external_purchases WHERE sale_id = ?', [req.params.saleId]);
        success(res, rows, 'By Sale');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
