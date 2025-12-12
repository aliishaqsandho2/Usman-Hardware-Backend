const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_categories WHERE deleted_at IS NULL ORDER BY created_at DESC');
        success(res, rows, 'Categories list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_categories WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return error(res, 'Category not found', 404);
        success(res, rows[0], 'Category details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return error(res, 'Name required', 400);

        const [existing] = await db.query('SELECT id FROM uh_ims_categories WHERE name = ? AND deleted_at IS NULL', [name]);
        if (existing.length > 0) return error(res, 'Category already exists', 400);

        const [result] = await db.query('INSERT INTO uh_ims_categories (name) VALUES (?)', [name]);
        success(res, { id: result.insertId, name }, 'Category created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.update = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return error(res, 'Name required', 400);

        const [existing] = await db.query('SELECT id FROM uh_ims_categories WHERE name = ? AND id != ? AND deleted_at IS NULL', [name, req.params.id]);
        if (existing.length > 0) return error(res, 'Category name already exists', 400);

        await db.query('UPDATE uh_ims_categories SET name = ? WHERE id = ?', [name, req.params.id]);
        success(res, { id: req.params.id, name }, 'Category updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('UPDATE uh_ims_categories SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Category deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return error(res, 'Search query required', 400);
        const [rows] = await db.query('SELECT * FROM uh_ims_categories WHERE name LIKE ? AND deleted_at IS NULL', [`%${q}%`]);
        success(res, rows, 'Search results');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getCategoryProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_products WHERE category_id = ? AND deleted_at IS NULL', [req.params.categoryId]);
        success(res, rows, 'Category products');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
