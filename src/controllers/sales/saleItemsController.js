const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getItems = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sale_items WHERE sale_id = ?', [req.params.id]);
        success(res, rows, 'Sale items');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.addItem = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { product_id, quantity, unit_price, total, is_outsourced, outsourcing_supplier_id } = req.body;
        const saleId = req.params.id;

        if (!product_id || !quantity) {
            await connection.release();
            return error(res, 'Required fields missing', 400);
        }

        const [result] = await connection.query(
            'INSERT INTO uh_ims_sale_items (sale_id, product_id, quantity, unit_price, total, is_outsourced, outsourcing_supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [saleId, product_id, quantity, unit_price, total, is_outsourced || 0, outsourcing_supplier_id]
        );

        // Deduct stock if not outsourced (assuming outsourced doesn't touch local stock, or maybe it does? 
        // Use case: Outsourced usually means we buy from somewhere else and deliver.
        // Let's assume if is_outsourced is true, we DO NOT deduct local stock.
        if (!is_outsourced) {
            await connection.query('UPDATE uh_ims_products SET stock = stock - ? WHERE id = ?', [quantity, product_id]);
        }

        await connection.commit();
        success(res, { id: result.insertId, sale_id: saleId, ...req.body }, 'Item added', 201);
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.updateItem = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const itemId = req.params.itemId;
        const { quantity, unit_price, total } = req.body;

        // Get old quantity and product
        const [oldRows] = await connection.query('SELECT product_id, quantity, is_outsourced FROM uh_ims_sale_items WHERE id = ?', [itemId]);
        if (oldRows.length === 0) {
            await connection.release();
            return error(res, 'Item not found', 404);
        }
        const oldItem = oldRows[0];

        // Update item
        await connection.query(
            'UPDATE uh_ims_sale_items SET quantity = ?, unit_price = ?, total = ? WHERE id = ?',
            [quantity, unit_price, total, itemId]
        );

        // Adjust stock
        if (!oldItem.is_outsourced) {
            const diff = quantity - oldItem.quantity;
            // If diff > 0 (increased quantity), deduct more stock (stock - diff)
            // If diff < 0 (decreased quantity), add stock (stock - -diff = stock + abs(diff))
            await connection.query('UPDATE uh_ims_products SET stock = stock - ? WHERE id = ?', [diff, oldItem.product_id]);
        }

        await connection.commit();
        success(res, { id: itemId, ...req.body }, 'Item updated');
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.removeItem = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const itemId = req.params.itemId;

        // Get item to restore stock
        const [rows] = await connection.query('SELECT product_id, quantity, is_outsourced FROM uh_ims_sale_items WHERE id = ?', [itemId]);
        if (rows.length === 0) {
            await connection.release();
            return error(res, 'Item not found', 404);
        }
        const item = rows[0];

        await connection.query('DELETE FROM uh_ims_sale_items WHERE id = ?', [itemId]);

        // Restore stock
        if (!item.is_outsourced) {
            await connection.query('UPDATE uh_ims_products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await connection.commit();
        success(res, null, 'Item removed');
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.getByProduct = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sale_items WHERE product_id = ?', [req.params.productId]);
        success(res, rows, 'Items by Product');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
