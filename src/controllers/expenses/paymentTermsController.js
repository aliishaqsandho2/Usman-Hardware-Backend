const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payment_terms');
        success(res, rows, 'Payment terms list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payment_terms WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Term not found', 404);
        success(res, rows[0], 'Payment term details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { name, days, description } = req.body;
        const [result] = await db.query(`
            INSERT INTO uh_ims_payment_terms (name, days, description)
            VALUES (?, ?, ?)
        `, [name, days, description]);
        success(res, { id: result.insertId }, 'Payment term created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { name, days, description } = req.body;
        await db.query(`
            UPDATE uh_ims_payment_terms SET name = ?, days = ?, description = ? WHERE id = ?
        `, [name, days, description, req.params.id]);
        success(res, null, 'Payment term updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_payment_terms WHERE id = ?', [req.params.id]);
        success(res, null, 'Payment term deleted');
    } catch (err) {
        error(res, err.message);
    }
};
