const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_quotations ORDER BY created_at DESC');
        success(res, rows, 'Quotations list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_quotations WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Quotation not found', 404);
        success(res, rows[0], 'Quotation details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { quote_number, customer_id, date, valid_until, subtotal, discount, tax, total, status, notes, created_by, items } = req.body;

        if (!quote_number || !date || !valid_until || !total) {
            await connection.release();
            return error(res, 'Required fields missing', 400);
        }

        const [result] = await connection.query(
            'INSERT INTO uh_ims_quotations (quote_number, customer_id, date, valid_until, subtotal, discount, tax, total, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [quote_number, customer_id, date, valid_until, subtotal, discount, tax, total, status || 'draft', notes, created_by]
        );
        const quoteId = result.insertId;

        if (items && items.length > 0) {
            for (const item of items) {
                const { product_id, quantity, unit_price, total: itemTotal } = item;
                await connection.query(
                    'INSERT INTO uh_ims_quotation_items (quotation_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
                    [quoteId, product_id, quantity, unit_price, itemTotal]
                );
            }
        }

        await connection.commit();
        success(res, { id: quoteId, ...req.body }, 'Quotation created', 201);
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.update = async (req, res) => {
    try {
        const { quote_number, customer_id, date, valid_until, subtotal, discount, tax, total, status, notes } = req.body;
        await db.query(
            'UPDATE uh_ims_quotations SET quote_number=?, customer_id=?, date=?, valid_until=?, subtotal=?, discount=?, tax=?, total=?, status=?, notes=? WHERE id=?',
            [quote_number, customer_id, date, valid_until, subtotal, discount, tax, total, status, notes, req.params.id]
        );
        success(res, { id: req.params.id, ...req.body }, 'Quotation updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_quotations WHERE id = ?', [req.params.id]);
        success(res, null, 'Quotation deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByCustomer = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_quotations WHERE customer_id = ?', [req.params.customerId]);
        success(res, rows, 'Customer quotations');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_quotations WHERE status = ?', [req.params.status]);
        success(res, rows, 'Quotations by Status');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE uh_ims_quotations SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, { status }, 'Status updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getExpiring = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_quotations WHERE valid_until <= ? AND status NOT IN (\'expired\', \'rejected\')', [req.params.date]);
        success(res, rows, 'Expiring quotations');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.convertToSale = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const quoteId = req.params.id;

        // Get Quote
        const [quoteRows] = await connection.query('SELECT * FROM uh_ims_quotations WHERE id = ?', [quoteId]);
        if (quoteRows.length === 0) {
            await connection.release();
            return error(res, 'Quotation not found', 404);
        }
        const quote = quoteRows[0];

        // Create Sale
        // Generate Order # (Simple logic)
        const orderNumber = 'ORD-' + Date.now();
        const [saleRes] = await connection.query(
            'INSERT INTO uh_ims_sales (order_number, customer_id, date, time, subtotal, discount, total, payment_method, status, notes, created_by) VALUES (?, ?, CURRENT_DATE, CURRENT_TIME, ?, ?, ?, ?, ?, ?, ?)',
            [orderNumber, quote.customer_id, quote.subtotal, quote.discount, quote.total, 'cash', 'pending', 'Converted from Quote ' + quote.quote_number, quote.created_by]
        );
        const saleId = saleRes.insertId;

        // Copy Items
        const [items] = await connection.query('SELECT * FROM uh_ims_quotation_items WHERE quotation_id = ?', [quoteId]);
        for (const item of items) {
            await connection.query(
                'INSERT INTO uh_ims_sale_items (sale_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
                [saleId, item.product_id, item.quantity, item.unit_price, item.total]
            );
            // Deduct Stock
            await connection.query('UPDATE uh_ims_products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        // Update Quote Status
        await connection.query('UPDATE uh_ims_quotations SET status = \'accepted\' WHERE id = ?', [quoteId]);

        await connection.commit();
        success(res, { sale_id: saleId, order_number: orderNumber }, 'Converted to Sale');
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

// Nested Items
exports.getItems = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_quotation_items WHERE quotation_id = ?', [req.params.id]);
        success(res, rows, 'Items');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.addItem = async (req, res) => {
    try {
        const { product_id, quantity, unit_price, total } = req.body;
        await db.query(
            'INSERT INTO uh_ims_quotation_items (quotation_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, product_id, quantity, unit_price, total]
        );
        success(res, req.body, 'Item added', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { quantity, unit_price, total } = req.body;
        await db.query(
            'UPDATE uh_ims_quotation_items SET quantity=?, unit_price=?, total=? WHERE id=?',
            [quantity, unit_price, total, req.params.itemId]
        );
        success(res, { id: req.params.itemId, ...req.body }, 'Item updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.removeItem = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_quotation_items WHERE id = ?', [req.params.itemId]);
        success(res, null, 'Item removed');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
