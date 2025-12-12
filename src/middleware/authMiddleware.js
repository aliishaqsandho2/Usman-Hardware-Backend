const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { error } = require('../utils/response');

const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return error(res, 'A token is required for authentication', 403);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Optional: Check if user still exists or is active
        const [users] = await db.query('SELECT id, role, is_active FROM uh_ims_users WHERE id = ?', [decoded.id]);
        if (users.length === 0 || !users[0].is_active) {
            return error(res, 'User not found or inactive', 401);
        }

        next();
    } catch (err) {
        return error(res, 'Invalid Token', 401);
    }
};

module.exports = verifyToken;
