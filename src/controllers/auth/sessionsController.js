const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getSessions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sessions ORDER BY last_activity DESC');
        success(res, rows, 'Sessions list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getSession = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sessions WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Session not found', 404);
        success(res, rows[0], 'Session details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.terminateSession = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_sessions WHERE id = ?', [req.params.id]);
        success(res, null, 'Session terminated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.terminateUserSessions = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_sessions WHERE user_id = ?', [req.params.userId]);
        success(res, null, 'User sessions terminated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getUserSessions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sessions WHERE user_id = ?', [req.params.userId]);
        success(res, rows, 'User sessions');
    } catch (err) {
        error(res, err.message);
    }
};
