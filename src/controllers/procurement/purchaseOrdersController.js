const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_purchase_orders ORDER BY created_at DESC');
        success(res, rows, 'PO list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_purchase_orders WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'PO not found', 404);
        success(res, rows[0], 'PO details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { order_number, supplier_id, date, expected_delivery, subtotal, tax, total, status, notes, created_by } = req.body;
        if (!order_number || !supplier_id || !date || !total) return error(res, 'Required fields missing', 400);

        const [result] = await db.query(
            'INSERT INTO uh_ims_purchase_orders (order_number, supplier_id, date, expected_delivery, subtotal, tax, total, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [order_number, supplier_id, date, expected_delivery, subtotal, tax, total, status || 'draft', notes, created_by]
        );
        success(res, { id: result.insertId, ...req.body }, 'PO created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.update = async (req, res) => {
    try {
        const { order_number, supplier_id, date, expected_delivery, subtotal, tax, total, status, notes, created_by } = req.body;
        await db.query(
            'UPDATE uh_ims_purchase_orders SET order_number=?, supplier_id=?, date=?, expected_delivery=?, subtotal=?, tax=?, total=?, status=?, notes=?, created_by=? WHERE id=?',
            [order_number, supplier_id, date, expected_delivery, subtotal, tax, total, status, notes, created_by, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'PO updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_purchase_orders WHERE id = ?', [req.params.id]);
        success(res, null, 'PO deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getBySupplier = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_purchase_orders WHERE supplier_id = ?', [req.params.supplierId]);
        success(res, rows, 'By Supplier');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_purchase_orders WHERE status = ?', [req.params.status]);
        success(res, rows, 'By Status');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return error(res, 'Status required', 400);
        await db.query('UPDATE uh_ims_purchase_orders SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, { status }, 'Status updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByOrder = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_purchase_orders WHERE order_number = ?', [req.params.orderNumber]);
        if (rows.length === 0) return error(res, 'PO not found', 404);
        success(res, rows[0], 'By Order #');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getPendingDelivery = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_purchase_orders WHERE status IN (\'confirmed\', \'sent\') AND (expected_delivery IS NULL OR expected_delivery >= CURRENT_DATE)');
        success(res, rows, 'Pending delivery');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.receive = async (req, res) => {
    try {
        // Logic to mark PO as received, possibly updating all items to received if not handled individually
        await db.query('UPDATE uh_ims_purchase_orders SET status = \'received\' WHERE id = ?', [req.params.id]);
        success(res, { status: 'received' }, 'Received');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
