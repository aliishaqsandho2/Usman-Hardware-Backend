const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getActivities = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_user_activities ORDER BY created_at DESC LIMIT 100');
        success(res, rows, 'Activities list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getUserActivities = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_user_activities WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
        success(res, rows, 'User activities');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getModuleActivities = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_user_activities WHERE module = ? ORDER BY created_at DESC', [req.params.module]);
        success(res, rows, 'Module activities');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getActionActivities = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_user_activities WHERE action = ? ORDER BY created_at DESC', [req.params.action]);
        success(res, rows, 'Action activities');
    } catch (err) {
        error(res, err.message);
    }
};

exports.logActivity = async (req, res) => {
    // Usually internal, but if exposed via API:
    try {
        const { user_id, action, module, details } = req.body;
        await db.query(`
            INSERT INTO uh_ims_user_activities (user_id, action, module, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [user_id, action, module, JSON.stringify(details), req.ip, req.headers['user-agent']]);
        success(res, null, 'Activity logged');
    } catch (err) {
        error(res, err.message);
    }
};
