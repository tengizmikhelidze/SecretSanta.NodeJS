const { query, transaction } = require('../config/database');
const { sanitizeEmail } = require('../utils/helpers');

class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const users = await query(sql, [id]);
    return users[0] || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const sanitized = sanitizeEmail(email);
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await query(sql, [sanitized]);
    return users[0] || null;
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId) {
    const sql = 'SELECT * FROM users WHERE google_id = ?';
    const users = await query(sql, [googleId]);
    return users[0] || null;
  }

  /**
   * Find user by email verification token
   */
  async findByEmailVerificationToken(token) {
    const sql = 'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires_at > NOW()';
    const users = await query(sql, [token]);
    return users[0] || null;
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token) {
    const sql = 'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires_at > NOW()';
    const users = await query(sql, [token]);
    return users[0] || null;
  }

  /**
   * Create new user with email/password
   */
  async create(userData) {
    const { email, passwordHash, fullName } = userData;
    const sanitized = sanitizeEmail(email);

    const sql = `
      INSERT INTO users (email, password_hash, full_name, is_email_verified)
      VALUES (?, ?, ?, FALSE)
    `;

    const result = await query(sql, [sanitized, passwordHash, fullName || null]);
    return await this.findById(result.insertId);
  }

  /**
   * Create new user with Google OAuth
   */
  async createGoogleUser(userData) {
    const { googleId, email, fullName, avatarUrl } = userData;
    const sanitized = sanitizeEmail(email);

    const sql = `
      INSERT INTO users (email, google_id, full_name, avatar_url, is_email_verified)
      VALUES (?, ?, ?, ?, TRUE)
    `;

    const result = await query(sql, [sanitized, googleId, fullName, avatarUrl]);
    return await this.findById(result.insertId);
  }

  /**
   * Update user's Google ID
   */
  async updateGoogleId(userId, googleId) {
    const sql = 'UPDATE users SET google_id = ? WHERE id = ?';
    await query(sql, [googleId, userId]);
  }

  /**
   * Update user password
   */
  async updatePassword(userId, passwordHash) {
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    await query(sql, [passwordHash, userId]);
  }

  /**
   * Set email verification token
   */
  async setEmailVerificationToken(userId, token, expiresAt) {
    const sql = `
      UPDATE users 
      SET email_verification_token = ?, email_verification_expires_at = ?
      WHERE id = ?
    `;
    await query(sql, [token, expiresAt, userId]);
  }

  /**
   * Verify email
   */
  async verifyEmail(userId) {
    const sql = `
      UPDATE users 
      SET is_email_verified = TRUE, 
          email_verification_token = NULL, 
          email_verification_expires_at = NULL
      WHERE id = ?
    `;
    await query(sql, [userId]);
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(userId, token, expiresAt) {
    const sql = `
      UPDATE users 
      SET password_reset_token = ?, password_reset_expires_at = ?
      WHERE id = ?
    `;
    await query(sql, [token, expiresAt, userId]);
  }

  /**
   * Clear password reset token
   */
  async clearPasswordResetToken(userId) {
    const sql = `
      UPDATE users 
      SET password_reset_token = NULL, password_reset_expires_at = NULL
      WHERE id = ?
    `;
    await query(sql, [userId]);
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId) {
    const sql = 'UPDATE users SET last_login_at = NOW() WHERE id = ?';
    await query(sql, [userId]);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const fields = [];
    const values = [];

    if (data.fullName !== undefined) {
      fields.push('full_name = ?');
      values.push(data.fullName);
    }

    if (data.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(data.avatarUrl);
    }

    if (fields.length === 0) return;

    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
  }

  /**
   * Delete user
   */
  async delete(userId) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [userId]);
  }
}

module.exports = new UserRepository();

