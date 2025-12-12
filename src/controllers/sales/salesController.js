const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE deleted_at IS NULL ORDER BY created_at DESC');
        success(res, rows, 'Sales list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return error(res, 'Sale not found', 404);
        success(res, rows[0], 'Sale details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { order_number, customer_id, date, time, subtotal, discount, total, due_date, cancel_reason, payment_method, status, notes, created_by, items } = req.body;

        if (!order_number || !date || !time || !subtotal || !total || !payment_method) {
            await connection.release();
            return error(res, 'Required fields missing', 400);
        }

        // 1. Insert Sale
        const [result] = await connection.query(
            'INSERT INTO uh_ims_sales (order_number, customer_id, date, time, subtotal, discount, total, due_date, cancel_reason, payment_method, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [order_number, customer_id, date, time, subtotal, discount || 0, total, due_date, cancel_reason, payment_method, status || 'pending', notes, created_by]
        );
        const saleId = result.insertId;

        // 2. Insert Items & 3. Deduct Stock if items provided
        if (items && items.length > 0) {
            for (const item of items) {
                const { product_id, quantity, unit_price, total: itemTotal } = item;
                await connection.query(
                    'INSERT INTO uh_ims_sale_items (sale_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
                    [saleId, product_id, quantity, unit_price, itemTotal]
                );

                // Deduct stock if sale status is completed or pending? Usually pending allocates stock or completed deducts.
                // Requirement says "handling of stock deduction".
                // Let's assume stock is deducted immediately for consistency unless status is cancelled.
                // If status is 'pending', we still might want to reserve stock.
                // Let's deduct stock for 'pending' and 'completed'.
                if (status !== 'cancelled') {
                    await connection.query(
                        'UPDATE uh_ims_products SET stock = stock - ? WHERE id = ?',
                        [quantity, product_id]
                    );
                }
            }
        }

        await connection.commit();
        success(res, { id: saleId, ...req.body }, 'Sale created', 201);
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.update = async (req, res) => {
    try {
        // Limited update for header fields. Items handled via item routes or specialized logic usually.
        const { customer_id, date, time, subtotal, discount, total, due_date, payment_method, notes } = req.body;
        await db.query(
            'UPDATE uh_ims_sales SET customer_id=?, date=?, time=?, subtotal=?, discount=?, total=?, due_date=?, payment_method=?, notes=? WHERE id=? AND deleted_at IS NULL',
            [customer_id, date, time, subtotal, discount, total, due_date, payment_method, notes, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'Sale updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('UPDATE uh_ims_sales SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        success(res, null, 'Sale deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByOrder = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE order_number = ?', [req.params.orderNumber]);
        if (rows.length === 0) return error(res, 'Sale not found', 404);
        success(res, rows[0], 'By Order');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByCustomer = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE customer_id = ? AND deleted_at IS NULL', [req.params.customerId]);
        success(res, rows, 'By Customer');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByDate = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE date = ? AND deleted_at IS NULL', [req.params.date]);
        success(res, rows, 'By Date');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByRange = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE date BETWEEN ? AND ? AND deleted_at IS NULL', [req.params.start, req.params.end]);
        success(res, rows, 'By Range');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE status = ? AND deleted_at IS NULL', [req.params.status]);
        success(res, rows, 'By Status');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByMethod = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE payment_method = ? AND deleted_at IS NULL', [req.params.method]);
        success(res, rows, 'By Method');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return error(res, 'Status required', 400);
        await db.query('UPDATE uh_ims_sales SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, { status }, 'Status updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.cancel = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const saleId = req.params.id;
        const { reason } = req.body;

        // Check if already cancelled
        const [saleRows] = await connection.query('SELECT status FROM uh_ims_sales WHERE id = ?', [saleId]);
        if (saleRows.length === 0) {
            await connection.release();
            return error(res, 'Sale not found', 404);
        }
        if (saleRows[0].status === 'cancelled') {
            await connection.release();
            return error(res, 'Sale already cancelled', 400);
        }

        // Update status
        await connection.query('UPDATE uh_ims_sales SET status = ?, cancel_reason = ? WHERE id = ?', ['cancelled', reason, saleId]);

        // Restore stock for items
        const [items] = await connection.query('SELECT product_id, quantity FROM uh_ims_sale_items WHERE sale_id = ?', [saleId]);
        for (const item of items) {
            await connection.query('UPDATE uh_ims_products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await connection.commit();
        success(res, { status: 'cancelled' }, 'Sale cancelled and stock restored');
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.getToday = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sales WHERE date = CURRENT_DATE AND deleted_at IS NULL');
        success(res, rows, 'Today sales');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getDailyReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT date, COUNT(*) as count, SUM(total) as revenue 
            FROM uh_ims_sales 
            WHERE deleted_at IS NULL 
            GROUP BY date 
            ORDER BY date DESC LIMIT 30`
        );
        success(res, rows, 'Daily report');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(*) as count, SUM(total) as revenue 
            FROM uh_ims_sales 
            WHERE deleted_at IS NULL 
            GROUP BY month 
            ORDER BY month DESC LIMIT 12`
        );
        success(res, rows, 'Monthly report');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
