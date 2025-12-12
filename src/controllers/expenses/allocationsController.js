const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payment_allocations ORDER BY allocation_date DESC');
        success(res, rows, 'Allocations list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payment_allocations WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Allocation not found', 404);
        success(res, rows[0], 'Allocation details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { payment_id, invoice_id, invoice_type, allocated_amount, allocation_date } = req.body;

        const [result] = await db.query(`
            INSERT INTO uh_ims_payment_allocations (payment_id, invoice_id, invoice_type, allocated_amount, allocation_date)
            VALUES (?, ?, ?, ?, ?)
        `, [payment_id, invoice_id, invoice_type || 'sale', allocated_amount, allocation_date || new Date()]);

        success(res, { id: result.insertId }, 'Allocation created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { allocated_amount, allocation_date } = req.body;
        await db.query(`
            UPDATE uh_ims_payment_allocations SET allocated_amount = ?, allocation_date = ? WHERE id = ?
        `, [allocated_amount, allocation_date, req.params.id]);
        success(res, null, 'Allocation updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('UPDATE uh_ims_payment_allocations SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Allocation deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByPayment = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payment_allocations WHERE payment_id = ?', [req.params.paymentId]);
        success(res, rows, 'Allocations by payment');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByInvoice = async (req, res) => {
    try {
        // Assume default invoice is sale
        const [rows] = await db.query('SELECT * FROM uh_ims_payment_allocations WHERE invoice_id = ? AND invoice_type = "sale"', [req.params.invoiceId]);
        success(res, rows, 'Allocations by invoice');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByInvoiceType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payment_allocations WHERE invoice_type = ? AND invoice_id = ?', [req.params.type, req.params.id]);
        success(res, rows, 'Allocations by invoice type');
    } catch (err) {
        error(res, err.message);
    }
};
