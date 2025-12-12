const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_suppliers WHERE deleted_at IS NULL ORDER BY created_at DESC');
        success(res, rows, 'Suppliers list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_suppliers WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return error(res, 'Supplier not found', 404);
        success(res, rows[0], 'Supplier details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { name, contact_person, phone, email, address, city, status } = req.body;
        if (!name) return error(res, 'Name required', 400);

        const [result] = await db.query(
            'INSERT INTO uh_ims_suppliers (name, contact_person, phone, email, address, city, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, contact_person, phone, email, address, city, status || 'active']
        );
        success(res, { id: result.insertId, ...req.body }, 'Supplier created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.update = async (req, res) => {
    try {
        const { name, contact_person, phone, email, address, city, status } = req.body;
        await db.query(
            'UPDATE uh_ims_suppliers SET name=?, contact_person=?, phone=?, email=?, address=?, city=?, status=? WHERE id=?',
            [name, contact_person, phone, email, address, city, status, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'Supplier updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('UPDATE uh_ims_suppliers SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Supplier deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_suppliers WHERE status = ? AND deleted_at IS NULL', [req.params.status]);
        success(res, rows, 'Suppliers by status');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const [supplier] = await db.query('SELECT status FROM uh_ims_suppliers WHERE id = ?', [req.params.id]);
        if (supplier.length === 0) return error(res, 'Supplier not found', 404);

        const newStatus = supplier[0].status === 'active' ? 'inactive' : 'active';
        await db.query('UPDATE uh_ims_suppliers SET status = ? WHERE id = ?', [newStatus, req.params.id]);
        success(res, { status: newStatus }, 'Status toggled');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return error(res, 'Search query required', 400);
        const [rows] = await db.query('SELECT * FROM uh_ims_suppliers WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ?) AND deleted_at IS NULL', [`%${q}%`, `%${q}%`, `%${q}%`]);
        success(res, rows, 'Search results');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOutstanding = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT pending_payments FROM uh_ims_suppliers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Supplier not found', 404);
        success(res, { outstanding: rows[0].pending_payments }, 'Outstanding balance');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE supplier_id = ? AND deleted_at IS NULL', [req.params.id]);
        success(res, rows, 'Supplier products');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
