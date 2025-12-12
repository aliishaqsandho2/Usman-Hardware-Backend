const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getItems = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_purchase_order_items WHERE purchase_order_id = ?', [req.params.id]);
        success(res, rows, 'PO Items');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.addItem = async (req, res) => {
    try {
        const { purchase_order_id, product_id, quantity, unit_price, total, quantity_received, item_condition } = req.body;
        // Use params.id if purchase_order_id not in body or mismatch, usually params.id is authoritative for nested route
        const poId = req.params.id || purchase_order_id;

        if (!poId || !product_id || !quantity || !unit_price) return error(res, 'Required fields missing', 400);

        const [result] = await db.query(
            'INSERT INTO uh_ims_purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total, quantity_received, item_condition) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [poId, product_id, quantity, unit_price, total || (quantity * unit_price), quantity_received || 0, item_condition || 'good']
        );
        success(res, { id: result.insertId, purchase_order_id: poId, ...req.body }, 'Item added', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { product_id, quantity, unit_price, total, quantity_received, item_condition } = req.body;
        await db.query(
            'UPDATE uh_ims_purchase_order_items SET product_id=?, quantity=?, unit_price=?, total=?, quantity_received=?, item_condition=? WHERE id=?',
            [product_id, quantity, unit_price, total, quantity_received, item_condition, req.params.itemId]
        );
        success(res, { id: req.params.itemId, ...req.body }, 'Item updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.removeItem = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_purchase_order_items WHERE id = ?', [req.params.itemId]);
        success(res, null, 'Item removed');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.receiveItem = async (req, res) => {
    try {
        const { quantity_received, item_condition } = req.body;
        await db.query(
            'UPDATE uh_ims_purchase_order_items SET quantity_received = ?, item_condition = ? WHERE id = ?',
            [quantity_received, item_condition || 'good', req.params.itemId]
        );
        success(res, { quantity_received, item_condition }, 'Item received updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
