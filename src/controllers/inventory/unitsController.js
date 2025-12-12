const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_units WHERE deleted_at IS NULL ORDER BY created_at DESC');
        success(res, rows, 'Units list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_units WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return error(res, 'Unit not found', 404);
        success(res, rows[0], 'Unit details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    try {
        const { name, label, abbreviation, is_active } = req.body;
        if (!name || !label) return error(res, 'Name and label required', 400);

        const [existing] = await db.query('SELECT id FROM uh_ims_units WHERE name = ? AND deleted_at IS NULL', [name]);
        if (existing.length > 0) return error(res, 'Unit name already exists', 400);

        const [result] = await db.query(
            'INSERT INTO uh_ims_units (name, label, abbreviation, is_active) VALUES (?, ?, ?, ?)',
            [name, label, abbreviation, is_active !== undefined ? is_active : true]
        );
        success(res, { id: result.insertId, ...req.body }, 'Unit created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.update = async (req, res) => {
    try {
        const { name, label, abbreviation, is_active } = req.body;

        const [existing] = await db.query('SELECT id FROM uh_ims_units WHERE name = ? AND id != ? AND deleted_at IS NULL', [name, req.params.id]);
        if (existing.length > 0) return error(res, 'Unit name already exists', 400);

        await db.query(
            'UPDATE uh_ims_units SET name=?, label=?, abbreviation=?, is_active=? WHERE id=?',
            [name, label, abbreviation, is_active, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'Unit updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('UPDATE uh_ims_units SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Unit deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const [unit] = await db.query('SELECT is_active FROM uh_ims_units WHERE id = ?', [req.params.id]);
        if (unit.length === 0) return error(res, 'Unit not found', 404);

        const newStatus = !unit[0].is_active;
        await db.query('UPDATE uh_ims_units SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
        success(res, { is_active: newStatus }, 'Status toggled');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
