const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAuditLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_audit_logs ORDER BY created_at DESC LIMIT 100');
        success(res, rows, 'Audit logs list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getUserAuditLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_audit_logs WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
        success(res, rows, 'User audit logs');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getTableLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_audit_logs WHERE table_name = ? ORDER BY created_at DESC', [req.params.table]);
        success(res, rows, 'Table logs');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getRecordHistory = async (req, res) => {
    try {
        const { table, recordId } = req.params;
        const [rows] = await db.query('SELECT * FROM uh_ims_audit_logs WHERE table_name = ? AND record_id = ? ORDER BY created_at DESC', [table, recordId]);
        success(res, rows, 'Record history');
    } catch (err) {
        error(res, err.message);
    }
};
