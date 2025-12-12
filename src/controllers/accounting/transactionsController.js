const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'transaction_date', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        const [rows] = await db.query(`SELECT * FROM uh_ims_transactions WHERE deleted_at IS NULL ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`, [parseInt(limit), parseInt(offset)]);

        const [countResult] = await db.query('SELECT COUNT(*) as total FROM uh_ims_transactions WHERE deleted_at IS NULL');

        success(res, {
            transactions: rows,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        }, 'Transactions list');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transactions WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Transaction not found', 404);

        // Also get entries
        const [entries] = await db.query('SELECT * FROM uh_ims_transaction_entries WHERE transaction_id = ?', [req.params.id]);

        success(res, { ...rows[0], entries }, 'Transaction details');
    } catch (err) {
        error(res, err.message);
    }
};

exports.create = async (req, res) => {
    let connection;
    try {
        const { transaction_date, reference_type, reference_id, description, entries } = req.body;
        // Entries should be array of { account_id, entry_type, amount, description }

        if (!transaction_date || !entries || entries.length === 0) {
            return error(res, 'Invalid transaction data', 400);
        }

        // Validate entries balance
        let totalDebit = 0;
        let totalCredit = 0;
        entries.forEach(e => {
            if (e.entry_type === 'debit') totalDebit += parseFloat(e.amount);
            else if (e.entry_type === 'credit') totalCredit += parseFloat(e.amount);
        });

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return error(res, 'Transaction entries must balance', 400);
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Generate Transaction Number (simple timestamp based or custom logic)
        const dateStr = new Date(transaction_date).toISOString().slice(0, 10).replace(/-/g, '');
        const [countRes] = await connection.query('SELECT COUNT(*) as count FROM uh_ims_transactions WHERE transaction_date = ?', [transaction_date]);
        const nextNum = countRes[0].count + 1;
        const transaction_number = `TXN-${dateStr}-${String(nextNum).padStart(4, '0')}`;

        const [resTxn] = await connection.query(`
            INSERT INTO uh_ims_transactions (transaction_date, transaction_number, description, reference_type, reference_id, total_amount)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [transaction_date, transaction_number, description, reference_type || 'expense', reference_id, totalDebit]);

        const transactionId = resTxn.insertId;

        for (const entry of entries) {
            await connection.query(`
                INSERT INTO uh_ims_transaction_entries (transaction_id, account_id, entry_type, amount, description)
                VALUES (?, ?, ?, ?, ?)
            `, [transactionId, entry.account_id, entry.entry_type, parseFloat(entry.amount), entry.description || description]);
        }

        await connection.commit();
        success(res, { id: transactionId, transaction_number }, 'Transaction created', 201);

    } catch (err) {
        if (connection) await connection.rollback();
        error(res, err.message);
    } finally {
        if (connection) connection.release();
    }
};

exports.update = async (req, res) => {
    // Updating financial transactions is complex; normally assume full reversal and re-entry or constrained edit
    // Allowing description update easily, but amounts require careful handling.
    // Basic implementation updating main fields.
    try {
        const { description, transaction_date } = req.body;
        await db.query('UPDATE uh_ims_transactions SET description = ?, transaction_date = ? WHERE id = ?', [description, transaction_date, req.params.id]);
        success(res, null, 'Transaction updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        // Soft delete
        await db.query('UPDATE uh_ims_transactions SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        success(res, null, 'Transaction deleted');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByDate = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transactions WHERE transaction_date = ? AND deleted_at IS NULL', [req.params.date]);
        success(res, rows, 'Transactions by date');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByRange = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transactions WHERE transaction_date BETWEEN ? AND ? AND deleted_at IS NULL', [req.params.start, req.params.end]);
        success(res, rows, 'Transactions by range');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transactions WHERE reference_type = ? AND deleted_at IS NULL', [req.params.type]);
        success(res, rows, 'Transactions by type');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getByReference = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_transactions WHERE reference_type = ? AND reference_id = ?', [req.params.type, req.params.id]);
        success(res, rows, 'Transaction by reference');
    } catch (err) {
        error(res, err.message);
    }
};

exports.reverse = async (req, res) => {
    let connection;
    try {
        // Reverse Logic: Find original, create new with opposite entries
        const [original] = await db.query('SELECT * FROM uh_ims_transactions WHERE id = ?', [req.params.id]);
        if (original.length === 0) return error(res, 'Transaction not found', 404);

        const txn = original[0];
        const [entries] = await db.query('SELECT * FROM uh_ims_transaction_entries WHERE transaction_id = ?', [req.params.id]);

        connection = await db.getConnection();
        await connection.beginTransaction();

        const reversedNumber = `REV-${txn.transaction_number}`;
        const [resTxn] = await connection.query(`
            INSERT INTO uh_ims_transactions (transaction_date, transaction_number, description, reference_type, reference_id, total_amount)
            VALUES (NOW(), ?, ?, 'adjustment', ?, ?)
        `, [reversedNumber, `Reversal of ${txn.transaction_number}`, txn.reference_id, txn.total_amount]);

        const newId = resTxn.insertId;

        for (const entry of entries) {
            const newType = entry.entry_type === 'debit' ? 'credit' : 'debit';
            await connection.query(`
                INSERT INTO uh_ims_transaction_entries (transaction_id, account_id, entry_type, amount, description)
                VALUES (?, ?, ?, ?, ?)
            `, [newId, entry.account_id, newType, entry.amount, `Reversal entry`]);
        }

        await connection.commit();
        success(res, { id: newId }, 'Transaction reversed');

    } catch (err) {
        if (connection) await connection.rollback();
        error(res, err.message);
    } finally {
        if (connection) connection.release();
    }
};

exports.exportTransactions = async (req, res) => {
    success(res, 'url_placeholder', 'Export not implemented');
};
