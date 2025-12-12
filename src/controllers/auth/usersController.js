const db = require('../../config/db');
const { success, error } = require('../../utils/response');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT id, username, email, full_name, role, is_active, last_login FROM uh_ims_users WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(query, params);

        // Count total
        let countQuery = 'SELECT COUNT(*) as total FROM uh_ims_users WHERE 1=1';
        const countParams = [];
        if (search) {
            countQuery += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }
        const [countResult] = await db.query(countQuery, countParams);

        success(res, {
            users: rows,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        }, 'Users retrieved successfully');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getUser = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, email, full_name, role, permissions, phone, avatar_url, is_active, last_login FROM uh_ims_users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return error(res, 'User not found', 404);
        success(res, rows[0], 'User details retrieved');
    } catch (err) {
        error(res, err.message);
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, full_name, role, phone } = req.body;

        // Validation
        if (!username || !email || !password || !full_name) {
            return error(res, 'Missing required fields', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(`
            INSERT INTO uh_ims_users (username, email, password_hash, full_name, role, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [username, email, hashedPassword, full_name, role || 'staff', phone]);

        success(res, { id: result.insertId }, 'User created successfully', 201);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return error(res, 'Username or email already exists', 409);
        }
        error(res, err.message);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { full_name, phone, role } = req.body;
        await db.query('UPDATE uh_ims_users SET full_name = ?, phone = ?, role = ? WHERE id = ?', [full_name, phone, role, req.params.id]);
        success(res, null, 'User updated successfully');
    } catch (err) {
        error(res, err.message);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Soft delete logic can vary, schema says "deleted_at" timestamp? 
        // Schema view earlier showed "created_at", "updated_at", but let's check view_file output again if needed.
        // The schema dump in prompt 0 has `deleted_at timestamp NULL DEFAULT NULL` in Categories? No users.
        // Wait, User Rules provided schema for users table does NOT show `deleted_at`.
        // It shows `is_active` tinyint(1).
        // The user request said "5. DELETE /api/users/{id} - Delete user (soft/hard delete)".
        // I will use is_active = 0 for "soft delete" behavior if no deleted_at column exists, OR hard delete.
        // The prompt says: "| is_active | tinyint(1) | NO | | 1 | |"
        // I will implement Toggle Active as "soft delete" equivalent for the DELETE endpoint or just hard delete if "Hard" is implied.
        // Given typically accounting systems avoid hard deletes, I'll update is_active to 0. 
        // BUT there is a separate PATCH status endpoint.
        // Creating a column `deleted_at` would be best practice but I cannot modify schema.
        // I will perform a hard delete for DELETE, because PATCH status handles deactivation.

        await db.query('DELETE FROM uh_ims_users WHERE id = ?', [req.params.id]);
        success(res, null, 'User deleted successfully');
    } catch (err) {
        error(res, err.message);
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        // First get current
        const [users] = await db.query('SELECT is_active FROM uh_ims_users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return error(res, 'User not found', 404);

        const newStatus = users[0].is_active ? 0 : 1;
        await db.query('UPDATE uh_ims_users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
        success(res, { is_active: newStatus }, 'User status toggled');
    } catch (err) {
        error(res, err.message);
    }
};

exports.changeRole = async (req, res) => {
    try {
        const { role } = req.body;
        await db.query('UPDATE uh_ims_users SET role = ? WHERE id = ?', [role, req.params.id]);
        success(res, null, 'User role updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getUsersByRole = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, email FROM uh_ims_users WHERE role = ?', [req.params.role]);
        success(res, rows, 'Users by role retrieved');
    } catch (err) {
        error(res, err.message);
    }
};

exports.updatePermissions = async (req, res) => {
    try {
        const { permissions } = req.body; // JSON
        // MySQL JSON capabilities
        await db.query('UPDATE uh_ims_users SET permissions = ? WHERE id = ?', [JSON.stringify(permissions), req.params.id]);
        success(res, null, 'Permissions updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const searchTerm = `%${q}%`;
        const [rows] = await db.query('SELECT id, username, full_name, email, role FROM uh_ims_users WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?', [searchTerm, searchTerm, searchTerm]);
        success(res, rows, 'Search results');
    } catch (err) {
        error(res, err.message);
    }
};

exports.exportUsers = async (req, res) => {
    // Generate CSV or similar
    success(res, 'file_url_placeholder', 'Method not fully implemented pending file storage setup');
};

exports.uploadAvatar = async (req, res) => {
    // Handling file upload usually involves multer middleware which I haven't set up yet.
    // For now, assume a URL string is passed or just stub it.
    const { avatar_url } = req.body;
    try {
        await db.query('UPDATE uh_ims_users SET avatar_url = ? WHERE id = ?', [avatar_url, req.params.id]);
        success(res, null, 'Avatar updated');
    } catch (err) {
        error(res, err.message);
    }
};

exports.adminResetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE uh_ims_users SET password_hash = ? WHERE id = ?', [hashedPassword, req.params.id]);
        success(res, null, 'Password reset by admin');
    } catch (err) {
        error(res, err.message);
    }
};
