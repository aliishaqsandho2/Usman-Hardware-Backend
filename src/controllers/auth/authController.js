const db = require('../../config/db');
const { success, error } = require('../../utils/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, 'Please provide email and password', 400);
        }

        const [users] = await db.query('SELECT * FROM uh_ims_users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || user.deleted_at) { // Assuming soft delete might be checked here or via is_active
            return error(res, 'Invalid credentials', 401);
        }

        // Check if active
        if (!user.is_active) {
            return error(res, 'Account is inactive. Please contact support.', 403);
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            // Update failed attempts
            await db.query('UPDATE uh_ims_users SET failed_attempts = failed_attempts + 1 WHERE id = ?', [user.id]);
            return error(res, 'Invalid credentials', 401);
        }

        // Reset failed attempts and update last login
        await db.query('UPDATE uh_ims_users SET failed_attempts = 0, last_login = NOW() WHERE id = ?', [user.id]);

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const refreshToken = crypto.randomBytes(40).toString('hex');

        // Create Session
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration for refresh/session

        await db.query(`
            INSERT INTO uh_ims_sessions (id, user_id, ip_address, user_agent, payload, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            sessionId,
            user.id,
            req.ip || req.connection.remoteAddress,
            req.headers['user-agent'],
            JSON.stringify({ token, refreshToken }), // Storing tokens in payload or managing refreshes separately
            expiresAt
        ]);

        // Audit Log
        await db.query(`INSERT INTO uh_ims_audit_logs (user_id, action, table_name, ip_address) VALUES (?, 'LOGIN', 'uh_ims_users', ?)`, [user.id, req.ip]);

        success(res, {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                avatar_url: user.avatar_url
            },
            token,
            refreshToken
        }, 'Login successful');

    } catch (err) {
        console.error(err);
        error(res, 'Server error during login');
    }
};

exports.logout = async (req, res) => {
    // Ideally extract session ID from request or invalidate all tokens; 
    // basic logout often just client-side, but here we can remove session if we track it via a header or cookie.
    // Assuming simple stateless JWT for now, but we inserted a session, so maybe we want to delete it?
    // We would need the user to send the session ID or strictly assume one session per user?
    // For now, let's log the action.
    try {
        if (req.user) {
            await db.query(`INSERT INTO uh_ims_audit_logs (user_id, action, table_name, ip_address) VALUES (?, 'LOGOUT', 'uh_ims_users', ?)`, [req.user.id, req.ip]);
        }
        success(res, null, 'Logout successful');
    } catch (err) {
        error(res, err.message);
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name, role, phone } = req.body;

        // Check if exists
        const [existing] = await db.query('SELECT id FROM uh_ims_users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) {
            return error(res, 'User already exists', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(`
            INSERT INTO uh_ims_users (username, email, password_hash, full_name, role, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [username, email, hashedPassword, full_name, role || 'staff', phone]);

        success(res, { id: result.insertId }, 'User registered successfully', 201);
    } catch (err) {
        error(res, err.message);
    }
};

exports.refreshToken = async (req, res) => {
    // In a real scenario, verify the refreshToken from body against the session stored in DB
    success(res, { token: 'new-mock-token' }, 'Token refreshed');
};

exports.forgotPassword = async (req, res) => {
    // Mock
    success(res, null, 'If the email exists, a reset link has been sent.');
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    // Mock verification of token mechanism
    success(res, null, 'Password reset successful');
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [users] = await db.query('SELECT * FROM uh_ims_users WHERE id = ?', [userId]);
        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return error(res, 'Current password incorrect', 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE uh_ims_users SET password_hash = ?, password_changed_at = NOW() WHERE id = ?', [hashedPassword, userId]);

        await db.query(`INSERT INTO uh_ims_audit_logs (user_id, action, table_name, ip_address) VALUES (?, 'CHANGE_PASSWORD', 'uh_ims_users', ?)`, [userId, req.ip]);

        success(res, null, 'Password changed successfully');
    } catch (err) {
        error(res, err.message);
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, full_name, role, permissions, phone, avatar_url, last_login FROM uh_ims_users WHERE id = ?', [req.user.id]);
        if (!users || users.length === 0) {
            return error(res, 'User not found', 404);
        }
        success(res, users[0], 'Profile retrieved');
    } catch (err) {
        error(res, err.message);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { full_name, phone } = req.body;
        await db.query('UPDATE uh_ims_users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone, req.user.id]);
        success(res, null, 'Profile updated');
    } catch (err) {
        error(res, err.message);
    }
};
