const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE deleted_at IS NULL ORDER BY created_at DESC');
        success(res, rows, 'Products list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return error(res, 'Product not found', 404);
        success(res, rows[0], 'Product details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { name, description, sku, category_id, price, cost_price, stock, min_stock, max_stock, unit, status, supplier_id } = req.body;

        // Check if SKU exists
        const [existing] = await db.query('SELECT id FROM uh_ims_products WHERE sku = ?', [sku]);
        if (existing.length > 0) return error(res, 'SKU already exists', 400);

        const [result] = await db.query(
            'INSERT INTO uh_ims_products (name, description, sku, category_id, price, cost_price, stock, min_stock, max_stock, unit, status, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, sku, category_id, price, cost_price, stock || 0, min_stock || 0, max_stock || 100, unit, status || 'active', supplier_id]
        );
        success(res, { id: result.insertId, ...req.body }, 'Product created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.update = async (req, res) => {
    try {
        const { name, description, sku, category_id, price, cost_price, stock, min_stock, max_stock, unit, status, supplier_id } = req.body;

        // Check if SKU exists for other products
        if (sku) {
            const [existing] = await db.query('SELECT id FROM uh_ims_products WHERE sku = ? AND id != ?', [sku, req.params.id]);
            if (existing.length > 0) return error(res, 'SKU already exists', 400);
        }

        await db.query(
            'UPDATE uh_ims_products SET name=?, description=?, sku=?, category_id=?, price=?, cost_price=?, stock=?, min_stock=?, max_stock=?, unit=?, status=?, supplier_id=? WHERE id=?',
            [name, description, sku, category_id, price, cost_price, stock, min_stock, max_stock, unit, status, supplier_id, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'Product updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('UPDATE uh_ims_products SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Product deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByCategory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE category_id = ? AND deleted_at IS NULL', [req.params.categoryId]);
        success(res, rows, 'Products by category');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getBySupplier = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE supplier_id = ? AND deleted_at IS NULL', [req.params.supplierId]);
        success(res, rows, 'Products by supplier');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getBySku = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE sku = ? AND deleted_at IS NULL', [req.params.sku]);
        if (rows.length === 0) return error(res, 'Product not found', 404);
        success(res, rows[0], 'Product by sku');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return error(res, 'Search query required', 400);
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE (name LIKE ? OR sku LIKE ?) AND deleted_at IS NULL', [`%${q}%`, `%${q}%`]);
        success(res, rows, 'Search results');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE stock <= min_stock AND deleted_at IS NULL');
        success(res, rows, 'Low stock products');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOutOfStock = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE stock <= 0 AND deleted_at IS NULL');
        success(res, rows, 'Out of stock products');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        await db.query('UPDATE uh_ims_products SET stock = ? WHERE id = ?', [stock, req.params.id]);
        success(res, null, 'Stock updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const [product] = await db.query('SELECT status FROM uh_ims_products WHERE id = ?', [req.params.id]);
        if (product.length === 0) return error(res, 'Product not found', 404);

        const newStatus = product[0].status === 'active' ? 'inactive' : 'active';
        await db.query('UPDATE uh_ims_products SET status = ? WHERE id = ?', [newStatus, req.params.id]);
        success(res, { status: newStatus }, 'Status toggled');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.export = async (req, res) => {
    // Placeholder for export functionality
    success(res, { url: 'http://placeholder.url/export.csv' }, 'Products exported');
};

exports.getImportTemplate = async (req, res) => {
    // Placeholder for import template
    success(res, { url: 'http://placeholder.url/template.csv' }, 'Import template');
};

exports.import = async (req, res) => {
    // Placeholder for import functionality
    success(res, null, 'Products imported');
};
