const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_inventory_movements WHERE deleted_at IS NULL ORDER BY created_at DESC');
        success(res, rows, 'Movements list');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_inventory_movements WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return error(res, 'Movement not found', 404);
        success(res, rows[0], 'Movement details');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.calculateNewStock = (currentStock, quantity, type) => {
    const qty = parseFloat(quantity);
    const stock = parseFloat(currentStock);

    switch (type) {
        case 'purchase':
        case 'return':
            // Assuming return = sales return (inbound) or purchase return (outbound)?
            // Convention: purchase = +, sale = -
            // If return is from customer -> + (sales return)
            // If return to supplier -> - (purchase return)
            // Spec says: type enum('sale','purchase','adjustment','return','damage')
            // Usually 'return' implies sales return in simple context unless 'purchase_return'. 
            // If it can be both, we need more info.
            // Let's assume 'return' adds stock (Sales Return).
            return stock + qty;
        case 'sale':
        case 'damage':
            return stock - qty;
        case 'adjustment':
            return stock + qty; // Signed adjustment
        default:
            return stock;
    }
};

exports.recordMovement = async (req, res) => {
    let connection;
    try {
        const { product_id, type, quantity, reference, reason, sale_id, condition } = req.body;
        if (!product_id || !type || !quantity) return error(res, 'Product ID, type, and quantity required', 400);

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Get current product stock
        const [product] = await connection.query('SELECT stock FROM uh_ims_products WHERE id = ? FOR UPDATE', [product_id]);
        if (product.length === 0) {
            await connection.rollback();
            return error(res, 'Product not found', 404);
        }

        const currentStock = parseFloat(product[0].stock);
        let newStock = currentStock;
        const qty = parseFloat(quantity);

        if (type === 'sale' || type === 'damage') {
            newStock = currentStock - qty;
        } else if (type === 'purchase' || type === 'return') {
            newStock = currentStock + qty;
        } else if (type === 'adjustment') {
            // For adjustment, if explicit +/-, otherwise replace? 
            // Usually adjustment is a delta.
            newStock = currentStock + qty;
        }

        // Update product stock
        await connection.query('UPDATE uh_ims_products SET stock = ? WHERE id = ?', [newStock, product_id]);

        // Record movement
        const [result] = await connection.query(
            'INSERT INTO uh_ims_inventory_movements (product_id, type, quantity, balance_before, balance_after, reference, reason, sale_id, `condition`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [product_id, type, qty, currentStock, newStock, reference, reason, sale_id, condition || 'good']
        );

        await connection.commit();
        success(res, { id: result.insertId, ...req.body, balance_before: currentStock, balance_after: newStock }, 'Movement recorded', 201);
    } catch (err) {
        if (connection) await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        if (connection) connection.release();
    }
};

exports.adjustStock = async (req, res) => {
    let connection;
    try {
        const { product_id, quantity, new_stock, reference, reason } = req.body;

        if (!product_id) return error(res, 'Product ID required', 400);
        if (quantity === undefined && new_stock === undefined) return error(res, 'Quantity or New Stock required', 400);

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [product] = await connection.query('SELECT stock FROM uh_ims_products WHERE id = ? FOR UPDATE', [product_id]);
        if (product.length === 0) {
            await connection.rollback();
            return error(res, 'Product not found', 404);
        }

        const currentStock = parseFloat(product[0].stock);
        let diff = 0;
        let finalStock = 0;

        if (new_stock !== undefined) {
            finalStock = parseFloat(new_stock);
            diff = finalStock - currentStock;
        } else {
            diff = parseFloat(quantity);
            finalStock = currentStock + diff;
        }

        // Update product
        await connection.query('UPDATE uh_ims_products SET stock = ? WHERE id = ?', [finalStock, product_id]);

        // Record movement
        const [result] = await connection.query(
            'INSERT INTO uh_ims_inventory_movements (product_id, type, quantity, balance_before, balance_after, reference, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [product_id, 'adjustment', diff, currentStock, finalStock, reference, reason]
        );

        await connection.commit();
        success(res, { id: result.insertId, product_id, type: 'adjustment', quantity: diff, balance_before: currentStock, balance_after: finalStock }, 'Stock adjusted', 201);

    } catch (err) {
        if (connection) await connection.rollback();
        error(res, err.message, 500, err);
    } finally {
        if (connection) connection.release();
    }
};

exports.getByProduct = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_inventory_movements WHERE product_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [req.params.productId]);
        success(res, rows, 'Product movements');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByType = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_inventory_movements WHERE type = ? AND deleted_at IS NULL ORDER BY created_at DESC', [req.params.type]);
        success(res, rows, 'Movements by type');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const [rows] = await db.query('SELECT * FROM uh_ims_inventory_movements WHERE DATE(created_at) = ? AND deleted_at IS NULL', [date]);
        success(res, rows, 'Movements by date');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getByRange = async (req, res) => {
    try {
        const { start, end } = req.params;
        const [rows] = await db.query('SELECT * FROM uh_ims_inventory_movements WHERE DATE(created_at) BETWEEN ? AND ? AND deleted_at IS NULL', [start, end]);
        success(res, rows, 'Movements by range');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.generateReport = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT type, COUNT(*) as count, SUM(quantity) as total_quantity FROM uh_ims_inventory_movements WHERE deleted_at IS NULL GROUP BY type');
        success(res, rows, 'Inventory report');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
