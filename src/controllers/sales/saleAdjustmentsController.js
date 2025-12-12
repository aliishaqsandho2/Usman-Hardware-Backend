const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sale_adjustments ORDER BY processed_at DESC');
        success(res, rows, 'Adjustments list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sale_adjustments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'Adjustment not found', 404);
        success(res, rows[0], 'Adjustment details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.create = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { sale_id, type, reason, refund_amount, restock_items, items } = req.body;

        if (!sale_id || !type) {
            await connection.release();
            return error(res, 'Required fields missing', 400);
        }

        // 1. Create Adjustment
        const [result] = await connection.query(
            'INSERT INTO uh_ims_sale_adjustments (sale_id, type, reason, refund_amount, restock_items) VALUES (?, ?, ?, ?, ?)',
            [sale_id, type, reason, refund_amount || 0, restock_items ? 1 : 0]
        );
        const adjustmentId = result.insertId;

        // 2. Add Items
        if (items && items.length > 0) {
            for (const item of items) {
                const { product_id, quantity, reason: itemReason, restocked } = item;
                await connection.query(
                    'INSERT INTO uh_ims_sale_adjustment_items (adjustment_id, product_id, quantity, reason, restocked) VALUES (?, ?, ?, ?, ?)',
                    [adjustmentId, product_id, quantity, itemReason, restocked || 0]
                );

                // 3. Process Stock logic IF we process immediately (Method name is create, but usually refunds are processed immediately or separately)
                // Requirement 222 says POST /api/sale-adjustments/{id}/process
                // So creation might just be logging the request.
                // However, "restock_items" flag on creation suggests intent.
                // Let's assume creation is DRAFT/Open. Process is separate.
                // BUT, if we want to support direct creation & processing (simple flow), we might need to check.
                // Given strict API list: 222 process is separate.
            }
        }

        await connection.commit();
        success(res, { id: adjustmentId, ...req.body }, 'Adjustment created', 201);
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.process = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const adjustmentId = req.params.id;

        // Get adjustment
        const [adjRows] = await connection.query('SELECT * FROM uh_ims_sale_adjustments WHERE id = ?', [adjustmentId]);
        if (adjRows.length === 0) {
            await connection.release();
            return error(res, 'Adjustment not found', 404);
        }
        const adjustment = adjRows[0];

        // If restock_items is true, restore stock based on items
        if (adjustment.restock_items) {
            const [items] = await connection.query('SELECT product_id, quantity FROM uh_ims_sale_adjustment_items WHERE adjustment_id = ?', [adjustmentId]);
            for (const item of items) {
                await connection.query('UPDATE uh_ims_products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
                // Update item restocked amount
                await connection.query('UPDATE uh_ims_sale_adjustment_items SET restocked = ? WHERE adjustment_id = ? AND product_id = ?', [item.quantity, adjustmentId, item.product_id]);
            }
        }

        // Ideally we would update a status column but the schema doesn't have one?
        // Checking schema: uh_ims_sale_adjustments: id, sale_id, type, reason, refund_amount, restock_items, processed_at
        // processed_at is timestamp default current.
        // It seems it's always "processed" at creation time based on schema default?
        // Or maybe `process` API is just a logical step if we want to do it later. 
        // Since schema lacks 'status', let's assume `create` does the work or `process` just re-triggers logic?
        // Wait, if I create and then process, I might double restock if I'm not careful.

        // Let's assume `create` is just logging (if restock is false), and `process` does the stock move if not done?
        // OR: `restock_items` is a flag saying "should restock".
        // If I follow the API flow: 219 Create -> 222 Process.
        // I will assume `create` does NOT restock, and `process` DOES.

        await connection.commit();
        success(res, { message: 'Processed' }, 'Adjustment processed');
    } catch (err) {
        await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        connection.release();
    }
};

exports.getBySale = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sale_adjustments WHERE sale_id = ?', [req.params.saleId]);
        success(res, rows, 'By Sale');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sale_adjustments WHERE type = ?', [req.params.type]);
        success(res, rows, 'By Type');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

// Nested Items
exports.getItems = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_sale_adjustment_items WHERE adjustment_id = ?', [req.params.id]);
        success(res, rows, 'Items');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.addItem = async (req, res) => {
    try {
        const { product_id, quantity, reason, restocked } = req.body;
        await db.query(
            'INSERT INTO uh_ims_sale_adjustment_items (adjustment_id, product_id, quantity, reason, restocked) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, product_id, quantity, reason, restocked || 0]
        );
        success(res, req.body, 'Item added to adjustment', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.removeItem = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_sale_adjustment_items WHERE id = ?', [req.params.itemId]);
        success(res, null, 'Item removed');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
