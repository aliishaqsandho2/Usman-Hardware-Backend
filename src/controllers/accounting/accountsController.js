const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_accounts ORDER BY id ASC');
        success(res, rows, 'Accounts list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_accounts WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Account not found', 404);
        success(res, rows[0], 'Account details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { account_code, account_name, account_type } = req.body;
        if (!account_code || !account_name || !account_type) {
            return error(res, 'Missing required fields', 400);
        }

        const [result] = await db.query(
            'INSERT INTO uh_ims_accounts (account_code, account_name, account_type, is_active) VALUES (?, ?, ?, 1)',
            [account_code, account_name, account_type]
        );
        success(res, { id: result.insertId }, 'Account created', 201);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return error(res, 'Account code already exists', 409);
        }
        error(res, err.message);
    }
};

exports.update = async (req, res) => {
    try {
        const { account_code, account_name, account_type } = req.body;
        const [result] = await db.query(
            'UPDATE uh_ims_accounts SET account_code = ?, account_name = ?, account_type = ? WHERE id = ?',
            [account_code, account_name, account_type, req.params.id]
        );
        if (result.affectedRows === 0) return error(res, 'Account not found', 404);
        success(res, null, 'Account updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        // Check if used in transactions
        const [entries] = await db.query('SELECT id FROM uh_ims_transaction_entries WHERE account_id = ? LIMIT 1', [req.params.id]);
        if (entries.length > 0) {
            return error(res, 'Cannot delete account with existing transactions', 400);
        }

        const [result] = await db.query('DELETE FROM uh_ims_accounts WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return error(res, 'Account not found', 404);
        success(res, null, 'Account deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_accounts WHERE account_type = ?', [req.params.type]);
        success(res, rows, 'Accounts by type');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByCode = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_accounts WHERE account_code = ?', [req.params.code]);
        if (rows.length === 0) return error(res, 'Account not found', 404);
        success(res, rows[0], 'Account by code');
    } catch (err) {
        error(res, err.message);
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT is_active FROM uh_ims_accounts WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Account not found', 404);

        const newStatus = rows[0].is_active ? 0 : 1;
        await db.query('UPDATE uh_ims_accounts SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
        success(res, { is_active: newStatus }, 'Account status toggled');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getBalance = async (req, res) => {
    try {
        // Calculate balance from transaction entries
        // entry_type: debit (+ for assets/expenses), credit (- for assets/expenses) - Generally depends on account type
        // For simplicity:
        // Asset/Expense: Debit - Credit
        // Liability/Equity/Revenue: Credit - Debit

        const [account] = await db.query('SELECT account_type FROM uh_ims_accounts WHERE id = ?', [req.params.id]);
        if (account.length === 0) return error(res, 'Account not found', 404);
        const type = account[0].account_type;

        const [result] = await db.query(`
            SELECT 
                SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END) as total_debit,
                SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END) as total_credit
            FROM uh_ims_transaction_entries 
            WHERE account_id = ?
        `, [req.params.id]);

        const debit = parseFloat(result[0].total_debit || 0);
        const credit = parseFloat(result[0].total_credit || 0);

        let balance = 0;
        if (['asset', 'expense', 'bank', 'cash'].includes(type)) {
            balance = debit - credit;
        } else {
            balance = credit - debit;
        }

        success(res, { balance, debit, credit }, 'Account balance');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getSummary = async (req, res) => {
    try {
        // Simple count by type
        const [rows] = await db.query('SELECT account_type, COUNT(*) as count FROM uh_ims_accounts GROUP BY account_type');
        success(res, rows, 'Accounts summary');
    } catch (err) {
        error(res, err.message);
    }
};
