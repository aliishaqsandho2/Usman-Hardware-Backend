const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments ORDER BY date DESC LIMIT 100');
        success(res, rows, 'Payments list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Payment not found', 404);
        success(res, rows[0], 'Payment details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { customer_id, account_id, amount, payment_method, reference, notes, date, payment_type, status } = req.body;

        if (!amount || !payment_method || !date) {
            return error(res, 'Missing required fields', 400);
        }

        const [result] = await db.query(`
            INSERT INTO uh_ims_payments (customer_id, account_id, amount, payment_method, reference, notes, date, payment_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [customer_id || null, account_id || null, amount, payment_method, reference, notes, date, payment_type || 'receipt', status || 'pending']);

        success(res, { id: result.insertId }, 'Payment created', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { amount, payment_method, reference, notes, date, status } = req.body;
        await db.query(`
            UPDATE uh_ims_payments 
            SET amount = ?, payment_method = ?, reference = ?, notes = ?, date = ?, status = ?
            WHERE id = ?
        `, [amount, payment_method, reference, notes, date, status, req.params.id]);
        success(res, null, 'Payment updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        // Soft delete
        await db.query('UPDATE uh_ims_payments SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Payment deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByCustomer = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments WHERE customer_id = ? ORDER BY date DESC', [req.params.customerId]);
        success(res, rows, 'Payments by customer');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByDate = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments WHERE date = ?', [req.params.date]);
        success(res, rows, 'Payments by date');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments WHERE payment_type = ?', [req.params.type]);
        success(res, rows, 'Payments by type');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByMethod = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments WHERE payment_method = ?', [req.params.method]);
        success(res, rows, 'Payments by method');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments WHERE status = ?', [req.params.status]);
        success(res, rows, 'Payments by status');
    } catch (err) {
        error(res, err.message);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE uh_ims_payments SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, null, 'Status updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByReference = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_payments WHERE reference = ?', [req.params.reference]);
        success(res, rows, 'Payments by reference');
    } catch (err) {
        error(res, err.message);
    }
};

exports.allocate = async (req, res) => {
    // Allocation logic: usually involves creating a record in uh_ims_payment_allocations
    // For now, this just updates the status or we stub it?
    // We have a separate Payment Allocations controller. This convenience endpoint calls creation there or simpler logic.
    // I'll leave it as a pointer to use the allocation controller basically, or create one record here.
    try {
        const { invoice_id, amount } = req.body;
        const payment_id = req.params.id;
        await db.query(`
            INSERT INTO uh_ims_payment_allocations (payment_id, invoice_id, invoice_type, allocated_amount, allocation_date)
            VALUES (?, ?, 'sale', ?, NOW())
       `, [payment_id, invoice_id, amount]);
        success(res, null, 'Payment allocated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getUnallocated = async (req, res) => {
    try {
        // Complex query: Payment Amount - Sum(Allocations) > 0
        const query = `
            SELECT p.*, (p.amount - COALESCE(SUM(pa.allocated_amount), 0)) as unallocated_amount
            FROM uh_ims_payments p
            LEFT JOIN uh_ims_payment_allocations pa ON p.id = pa.payment_id
            WHERE p.deleted_at IS NULL
            GROUP BY p.id
            HAVING unallocated_amount > 0
        `;
        const [rows] = await db.query(query);
        success(res, rows, 'Unallocated payments');
    } catch (err) {
        error(res, err.message);
    }
};
