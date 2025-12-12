const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_outsourcing_orders ORDER BY created_at DESC');
        success(res, rows, 'Orders list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_outsourcing_orders WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Order not found', 404);
        success(res, rows[0], 'Order details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { order_number, sale_id, sale_item_id, product_id, supplier_id, quantity, cost_per_unit, total_cost, notes, status } = req.body;
        if (!order_number || !sale_id || !product_id || !supplier_id) return error(res, 'Required fields missing', 400);

        const [result] = await db.query(
            'INSERT INTO uh_ims_outsourcing_orders (order_number, sale_id, sale_item_id, product_id, supplier_id, quantity, cost_per_unit, total_cost, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [order_number, sale_id, sale_item_id, product_id, supplier_id, quantity, cost_per_unit, total_cost, notes, status || 'pending']
        );
        success(res, { id: result.insertId, ...req.body }, 'Order created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.update = async (req, res) => {
    try {
        const { order_number, sale_id, sale_item_id, product_id, supplier_id, quantity, cost_per_unit, total_cost, notes, status } = req.body;
        await db.query(
            'UPDATE uh_ims_outsourcing_orders SET order_number=?, sale_id=?, sale_item_id=?, product_id=?, supplier_id=?, quantity=?, cost_per_unit=?, total_cost=?, notes=?, status=? WHERE id=?',
            [order_number, sale_id, sale_item_id, product_id, supplier_id, quantity, cost_per_unit, total_cost, notes, status, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'Order updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_outsourcing_orders WHERE id = ?', [req.params.id]);
        success(res, null, 'Order deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getBySale = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_outsourcing_orders WHERE sale_id = ?', [req.params.saleId]);
        success(res, rows, 'Orders by sale');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getBySupplier = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_outsourcing_orders WHERE supplier_id = ?', [req.params.supplierId]);
        success(res, rows, 'Orders by supplier');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_outsourcing_orders WHERE status = ?', [req.params.status]);
        success(res, rows, 'Orders by status');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return error(res, 'Status required', 400);
        await db.query('UPDATE uh_ims_outsourcing_orders SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, { status }, 'Status updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
