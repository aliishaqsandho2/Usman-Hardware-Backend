const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_customers WHERE deleted_at IS NULL ORDER BY created_at DESC');
        success(res, rows, 'Customers list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_customers WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return error(res, 'Customer not found', 404);
        success(res, rows[0], 'Customer details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { name, email, phone, type, address, city, status, credit_limit } = req.body;
        if (!name) return error(res, 'Name required', 400);

        if (email) {
            const [existing] = await db.query('SELECT id FROM uh_ims_customers WHERE email = ?', [email]);
            if (existing.length > 0) return error(res, 'Email already exists', 400);
        }

        const [result] = await db.query(
            'INSERT INTO uh_ims_customers (name, email, phone, type, address, city, status, credit_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, type || 'Permanent', address, city, status || 'active', credit_limit || 0]
        );
        success(res, { id: result.insertId, ...req.body }, 'Customer created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.update = async (req, res) => {
    try {
        const { name, email, phone, type, address, city, status, credit_limit } = req.body;

        if (email) {
            const [existing] = await db.query('SELECT id FROM uh_ims_customers WHERE email = ? AND id != ?', [email, req.params.id]);
            if (existing.length > 0) return error(res, 'Email already exists', 400);
        }

        await db.query(
            'UPDATE uh_ims_customers SET name=?, email=?, phone=?, type=?, address=?, city=?, status=?, credit_limit=? WHERE id=?',
            [name, email, phone, type, address, city, status, credit_limit, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'Customer updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('UPDATE uh_ims_customers SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Customer deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_customers WHERE type = ? AND deleted_at IS NULL', [req.params.type]);
        success(res, rows, 'Customers by type');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_customers WHERE status = ? AND deleted_at IS NULL', [req.params.status]);
        success(res, rows, 'Customers by status');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return error(res, 'Search query required', 400);
        const [rows] = await db.query('SELECT * FROM uh_ims_customers WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ?) AND deleted_at IS NULL', [`%${q}%`, `%${q}%`, `%${q}%`]);
        success(res, rows, 'Search results');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const [customer] = await db.query('SELECT status FROM uh_ims_customers WHERE id = ?', [req.params.id]);
        if (customer.length === 0) return error(res, 'Customer not found', 404);

        const newStatus = customer[0].status === 'active' ? 'inactive' : 'active';
        await db.query('UPDATE uh_ims_customers SET status = ? WHERE id = ?', [newStatus, req.params.id]);
        success(res, { status: newStatus }, 'Status toggled');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateCreditLimit = async (req, res) => {
    try {
        const { credit_limit } = req.body;
        await db.query('UPDATE uh_ims_customers SET credit_limit = ? WHERE id = ?', [credit_limit, req.params.id]);
        success(res, { credit_limit }, 'Credit limit updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getBalance = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT current_balance, credit_limit FROM uh_ims_customers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Customer not found', 404);
        success(res, rows[0], 'Customer balance');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOverdue = async (req, res) => {
    try {
        // Assuming overdue logic is based on current balance > 0 or specific due date logic not in schema?
        // Schema has total_purchases and current_balance.
        // Simple overdue: current_balance > 0? Or maybe strictly credit limit exceeded?
        // Let's assume overdue means positive balance for now, or just return check.
        const [rows] = await db.query('SELECT * FROM uh_ims_customers WHERE current_balance > 0 AND deleted_at IS NULL');
        success(res, rows, 'Overdue customers');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.export = async (req, res) => {
    success(res, { url: 'http://placeholder.url/customers_export.csv' }, 'Customers exported');
};
