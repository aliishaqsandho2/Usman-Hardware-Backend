const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transaction_entries ORDER BY id DESC LIMIT 100');
        success(res, rows, 'Entries list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByTransaction = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transaction_entries WHERE transaction_id = ?', [req.params.id]);
        success(res, rows, 'Entries by transaction');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByAccount = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transaction_entries WHERE account_id = ? ORDER BY id DESC LIMIT 50', [req.params.id]);
        success(res, rows, 'Entries by account');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    // Direct creation of entries is risky without parent transaction context usually, but if needed:
    try {
        const { transaction_id, account_id, entry_type, amount, description } = req.body;
        await db.query(`
            INSERT INTO uh_ims_transaction_entries (transaction_id, account_id, entry_type, amount, description)
            VALUES (?, ?, ?, ?, ?)
        `, [transaction_id, account_id, entry_type, amount, description]);
        success(res, null, 'Entry created');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_transaction_entries WHERE id = ?', [req.params.id]);
        success(res, null, 'Entry deleted');
    } catch (err) {
        error(res, err.message);
    }
};
