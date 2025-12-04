const { query } = require('../config/database');
const { generateAccessToken, sanitizeEmail } = require('../utils/helpers');

class ParticipantRepository {
  /**
   * Find participant by ID
   */
  async findById(participantId) {
    const sql = 'SELECT * FROM participants WHERE id = ?';
    const participants = await query(sql, [participantId]);
    return participants[0] || null;
  }

  /**
   * Find participant by access token
   */
  async findByAccessToken(token) {
    const sql = 'SELECT * FROM participants WHERE access_token = ?';
    const participants = await query(sql, [token]);
    return participants[0] || null;
  }

  /**
   * Find all participants for a party
   */
  async findByPartyId(partyId) {
    const sql = `
      SELECT * FROM participants 
      WHERE party_id = ?
      ORDER BY created_at ASC
    `;
    return await query(sql, [partyId]);
  }

  /**
   * Find participant by party and email
   */
  async findByPartyAndEmail(partyId, email) {
    const sanitized = sanitizeEmail(email);
    const sql = `
      SELECT * FROM participants 
      WHERE party_id = ? AND email = ?
    `;
    const participants = await query(sql, [partyId, sanitized]);
    return participants[0] || null;
  }

  /**
   * Find all parties where user is participant
   */
  async findPartiesByUserId(userId) {
    const sql = `
      SELECT p.*, parties.* 
      FROM participants p
      JOIN parties ON p.party_id = parties.id
      WHERE p.user_id = ?
      ORDER BY parties.created_at DESC
    `;
    return await query(sql, [userId]);
  }

  /**
   * Find all parties by email (for non-registered users)
   */
  async findPartiesByEmail(email) {
    const sanitized = sanitizeEmail(email);
    const sql = `
      SELECT p.*, parties.* 
      FROM participants p
      JOIN parties ON p.party_id = parties.id
      WHERE p.email = ?
      ORDER BY parties.created_at DESC
    `;
    return await query(sql, [sanitized]);
  }

  /**
   * Create participant
   */
  async create(participantData) {
    const { partyId, userId, name, email, isHost } = participantData;
    const accessToken = generateAccessToken();
    const sanitized = sanitizeEmail(email);

    const sql = `
      INSERT INTO participants (
        party_id, user_id, name, email, is_host, access_token
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      partyId,
      userId || null,
      name,
      sanitized,
      isHost || false,
      accessToken
    ]);

    return await this.findById(result.insertId);
  }

  /**
   * Update participant
   */
  async update(participantId, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (data.wishlist !== undefined) {
      fields.push('wishlist = ?');
      values.push(data.wishlist);
    }

    if (data.wishlistDescription !== undefined) {
      fields.push('wishlist_description = ?');
      values.push(data.wishlistDescription);
    }

    if (data.assignedTo !== undefined) {
      fields.push('assigned_to = ?');
      values.push(data.assignedTo);
    }

    if (data.notificationSent !== undefined) {
      fields.push('notification_sent = ?');
      values.push(data.notificationSent);
    }

    if (data.notificationSentAt !== undefined) {
      fields.push('notification_sent_at = ?');
      values.push(data.notificationSentAt);
    }

    if (fields.length === 0) return await this.findById(participantId);

    values.push(participantId);
    const sql = `UPDATE participants SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return await this.findById(participantId);
  }

  /**
   * Update last viewed timestamp
   */
  async updateLastViewed(participantId) {
    const sql = 'UPDATE participants SET last_viewed_at = NOW() WHERE id = ?';
    await query(sql, [participantId]);
  }

  /**
   * Set assignment for participant
   */
  async setAssignment(participantId, assignedToId) {
    const sql = 'UPDATE participants SET assigned_to = ? WHERE id = ?';
    await query(sql, [assignedToId, participantId]);
  }

  /**
   * Delete participant
   */
  async delete(participantId) {
    const sql = 'DELETE FROM participants WHERE id = ?';
    await query(sql, [participantId]);
  }

  /**
   * Get participant with assignment details
   */
  async getWithAssignment(participantId) {
    const sql = `
      SELECT 
        p.*,
        assigned.name as assigned_name,
        assigned.email as assigned_email,
        assigned.wishlist as assigned_wishlist,
        assigned.wishlist_description as assigned_wishlist_description
      FROM participants p
      LEFT JOIN participants assigned ON p.assigned_to = assigned.id
      WHERE p.id = ?
    `;
    const results = await query(sql, [participantId]);
    return results[0] || null;
  }

  /**
   * Check if email is unique in party
   */
  async isEmailUniqueInParty(partyId, email, excludeParticipantId = null) {
    const sanitized = sanitizeEmail(email);
    let sql = 'SELECT COUNT(*) as count FROM participants WHERE party_id = ? AND email = ?';
    const params = [partyId, sanitized];

    if (excludeParticipantId) {
      sql += ' AND id != ?';
      params.push(excludeParticipantId);
    }

    const results = await query(sql, params);
    return results[0].count === 0;
  }

  /**
   * Get participant count for party
   */
  async getCountByParty(partyId) {
    const sql = 'SELECT COUNT(*) as count FROM participants WHERE party_id = ?';
    const results = await query(sql, [partyId]);
    return results[0].count;
  }
}

module.exports = new ParticipantRepository();

