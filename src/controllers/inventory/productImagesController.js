const db = require('../../config/db');
const { success, error } = require('../../utils/response');

exports.getProductImages = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uh_ims_product_images WHERE product_id = ? ORDER BY created_at DESC', [req.params.id]);
        success(res, rows, 'Product images');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.uploadProductImage = async (req, res) => {
    try {
        // Assuming image_url is sent in body. In a real app, multer would handle file upload and provide path/url.
        const { image_url } = req.body;
        if (!image_url) return error(res, 'Image URL required', 400);

        const [result] = await db.query('INSERT INTO uh_ims_product_images (product_id, image_url) VALUES (?, ?)', [req.params.id, image_url]);
        success(res, { id: result.insertId, product_id: req.params.id, image_url }, 'Image uploaded', 201);
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.deleteProductImage = async (req, res) => {
    try {
        await db.query('DELETE FROM uh_ims_product_images WHERE id = ?', [req.params.imageId]);
        success(res, null, 'Image deleted');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};

exports.setPrimaryImage = async (req, res) => {
    try {
        // Schema does not support primary image flag currently.
        // This is a placeholder for future implementation.
        success(res, null, 'Set as primary image (Not persisted in DB due to schema limitation)');
    } catch (err) {
        error(res, err.message, 500, err);
    }
};
