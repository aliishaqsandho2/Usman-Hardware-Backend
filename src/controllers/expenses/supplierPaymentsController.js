const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_supplier_payments ORDER BY date DESC');
        success(res, rows, 'Supplier payments list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_supplier_payments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Payment not found', 404);
        success(res, rows[0], 'Payment details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { supplier_id, amount, payment_method, reference, notes, date, status } = req.body;

        const [result] = await db.query(`
            INSERT INTO uh_ims_supplier_payments (supplier_id, amount, payment_method, reference, notes, date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [supplier_id || null, amount, payment_method, reference, notes, date, status || 'pending']);

        success(res, { id: result.insertId }, 'Supplier payment created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { amount, payment_method, reference, notes, date, status } = req.body;
        await db.query(`
            UPDATE uh_ims_supplier_payments 
            SET amount = ?, payment_method = ?, reference = ?, notes = ?, date = ?, status = ?
            WHERE id = ?
        `, [amount, payment_method, reference, notes, date, status, req.params.id]);
        success(res, null, 'Supplier payment updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_supplier_payments WHERE id = ?', [req.params.id]);
        success(res, null, 'Supplier payment deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getBySupplier = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_supplier_payments WHERE supplier_id = ?', [req.params.supplierId]);
        success(res, rows, 'Payments by supplier');
    } catch (err) {
        error(res, err.message);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE uh_ims_supplier_payments SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, null, 'Status updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOutstanding = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_supplier_payments WHERE status = "pending"');
        success(res, rows, 'Outstanding payments');
    } catch (err) {
        error(res, err.message);
    }
};
