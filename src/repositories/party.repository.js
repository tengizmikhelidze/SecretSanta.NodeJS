const { query, transaction } = require('../config/database');
const { generateUUID, generateAccessToken, sanitizeEmail } = require('../utils/helpers');

class PartyRepository {
  /**
   * Find party by ID
   */
  async findById(partyId) {
    const sql = 'SELECT * FROM parties WHERE id = ?';
    const parties = await query(sql, [partyId]);
    return parties[0] || null;
  }

  /**
   * Find party by access token
   */
  async findByAccessToken(token) {
    const sql = 'SELECT * FROM parties WHERE access_token = ?';
    const parties = await query(sql, [token]);
    return parties[0] || null;
  }

  /**
   * Find all parties for a user (as host)
   */
  async findByUserId(userId) {
    const sql = `
      SELECT * FROM parties 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    return await query(sql, [userId]);
  }

  /**
   * Find parties by host email
   */
  async findByHostEmail(email) {
    const sanitized = sanitizeEmail(email);
    const sql = `
      SELECT * FROM parties 
      WHERE host_email = ?
      ORDER BY created_at DESC
    `;
    return await query(sql, [sanitized]);
  }

  /**
   * Create new party
   */
  async create(partyData) {
    const {
      userId,
      partyDate,
      location,
      maxAmount,
      personalMessage,
      hostCanSeeAll,
      hostEmail
    } = partyData;

    const partyId = generateUUID();
    const accessToken = generateAccessToken();
    const sanitized = sanitizeEmail(hostEmail);

    const sql = `
      INSERT INTO parties (
        id, user_id, status, party_date, location, max_amount,
        personal_message, host_can_see_all, host_email, access_token
      )
      VALUES (?, ?, 'created', ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      partyId,
      userId || null,
      partyDate || null,
      location || null,
      maxAmount || null,
      personalMessage || null,
      hostCanSeeAll || false,
      sanitized,
      accessToken
    ]);

    return await this.findById(partyId);
  }

  /**
   * Update party
   */
  async update(partyId, data) {
    const fields = [];
    const values = [];

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (data.partyDate !== undefined) {
      fields.push('party_date = ?');
      values.push(data.partyDate);
    }

    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location);
    }

    if (data.maxAmount !== undefined) {
      fields.push('max_amount = ?');
      values.push(data.maxAmount);
    }

    if (data.personalMessage !== undefined) {
      fields.push('personal_message = ?');
      values.push(data.personalMessage);
    }

    if (data.hostCanSeeAll !== undefined) {
      fields.push('host_can_see_all = ?');
      values.push(data.hostCanSeeAll);
    }

    if (fields.length === 0) return await this.findById(partyId);

    values.push(partyId);
    const sql = `UPDATE parties SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return await this.findById(partyId);
  }

  /**
   * Update party status
   */
  async updateStatus(partyId, status, connection) {
    const sql = `
      UPDATE parties 
      SET status = ?
      WHERE id = ?
    `;
    await query(sql, [status, partyId], connection);
  }

  /**
   * Delete party
   */
  async delete(partyId) {
    const sql = 'DELETE FROM parties WHERE id = ?';
    await query(sql, [partyId]);
  }

  /**
   * Get party with participants count
   */
  async getPartyWithStats(partyId) {
    const sql = `
      SELECT 
        p.*,
        COUNT(part.id) as participant_count,
        SUM(CASE WHEN part.assigned_to IS NOT NULL THEN 1 ELSE 0 END) as assignments_count
      FROM parties p
      LEFT JOIN participants part ON p.id = part.party_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    const results = await query(sql, [partyId]);
    return results[0] || null;
  }

  /**
   * Check if user has access to party
   */
  async checkUserAccess(partyId, userId) {
    const sql = `
      SELECT COUNT(*) as count
      FROM parties p
      LEFT JOIN participants part ON p.id = part.party_id
      WHERE p.id = ? AND (p.user_id = ? OR part.user_id = ?)
    `;
    const results = await query(sql, [partyId, userId, userId]);
    return results[0].count > 0;
  }
}

module.exports = new PartyRepository();
