const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getProductVariants = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_product_variants WHERE product_id = ?', [req.params.id]);
        success(res, rows, 'Product variants');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.createVariant = async (req, res) => {
    try {
        const { attribute_name, attribute_value, sku_suffix, price_adjustment, stock } = req.body;
        const [result] = await db.query(
            'INSERT INTO uh_ims_product_variants (product_id, attribute_name, attribute_value, sku_suffix, price_adjustment, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.id, attribute_name, attribute_value, sku_suffix, price_adjustment, stock]
        );
        success(res, { id: result.insertId, product_id: req.params.id, ...req.body }, 'Variant created', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.updateVariant = async (req, res) => {
    try {
        const { attribute_name, attribute_value, sku_suffix, price_adjustment, stock } = req.body;
        await db.query(
            'UPDATE uh_ims_product_variants SET attribute_name=?, attribute_value=?, sku_suffix=?, price_adjustment=?, stock=? WHERE id=?',
            [attribute_name, attribute_value, sku_suffix, price_adjustment, stock, req.params.variantId]
        );
        success(res, { id: req.params.variantId, ...req.body }, 'Variant updated');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.deleteVariant = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_product_variants WHERE id = ?', [req.params.variantId]);
        success(res, null, 'Variant deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.getVariantsByAttribute = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_product_variants WHERE attribute_name = ?', [req.params.name]);
        success(res, rows, 'Variants by attribute');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
