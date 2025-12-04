const { query } = require('../config/database');

class AssignmentRepository {
  /**
   * Check if assignments exist for a party
   */
  async existsForParty(partyId) {
    const sql = 'SELECT COUNT(*) as count FROM assignments WHERE party_id = ?';
    const [result] = await query(sql, [partyId]);
    return result.count > 0;
  }

  /**
   * Get all assignments for a party
   */
  async findByPartyId(partyId) {
    const sql = `
      SELECT 
        a.*,
        g.name as giver_name,
        g.email as giver_email,
        r.name as receiver_name,
        r.email as receiver_email
      FROM assignments a
      JOIN participants g ON a.giver_id = g.id
      JOIN participants r ON a.receiver_id = r.id
      WHERE a.party_id = ?
      ORDER BY a.id
    `;
    return await query(sql, [partyId]);
  }

  /**
   * Get assignment for specific giver
   */
  async findByGiverId(partyId, giverId) {
    const sql = `
      SELECT 
        a.*,
        r.name as receiver_name,
        r.email as receiver_email,
        r.wishlist,
        r.wishlist_description
      FROM assignments a
      JOIN participants r ON a.receiver_id = r.id
      WHERE a.party_id = ? AND a.giver_id = ?
    `;
    const [result] = await query(sql, [partyId, giverId]);
    return result || null;
  }

  /**
   * Create single assignment
   */
  async create(assignmentData) {
    const { partyId, giverId, receiverId } = assignmentData;

    const sql = `
      INSERT INTO assignments (party_id, giver_id, receiver_id)
      VALUES (?, ?, ?)
    `;

    const result = await query(sql, [partyId, giverId, receiverId]);

    return {
      id: result.insertId,
      party_id: partyId,
      giver_id: giverId,
      receiver_id: receiverId
    };
  }

  /**
   * Bulk create assignments (transaction-safe)
   */
  async bulkCreate(assignments, connection) {
    if (assignments.length === 0) return [];

    const values = assignments.map(a => [a.partyId, a.giverId, a.receiverId]);

    const sql = `
      INSERT INTO assignments (party_id, giver_id, receiver_id)
      VALUES ?
    `;

    const result = await query(sql, [values], connection);

    return assignments.map((a, index) => ({
      id: result.insertId + index,
      ...a
    }));
  }

  /**
   * Delete all assignments for a party
   */
  async deleteByPartyId(partyId, connection) {
    const sql = 'DELETE FROM assignments WHERE party_id = ?';
    await query(sql, [partyId], connection);
  }

  /**
   * Get previous year's assignments (for exclusion logic)
   */
  async getPreviousYearAssignments(partyId, year) {
    const sql = `
      SELECT giver_id, receiver_id
      FROM previous_assignments
      WHERE party_id = ? AND year = ?
    `;
    return await query(sql, [partyId, year]);
  }

  /**
   * Save assignments to previous_assignments table
   */
  async saveToPreviousAssignments(partyId, year, assignments, connection) {
    if (assignments.length === 0) return;

    const values = assignments.map(a => [partyId, year, a.giverId, a.receiverId]);

    const sql = `
      INSERT INTO previous_assignments (party_id, year, giver_id, receiver_id)
      VALUES ?
      ON DUPLICATE KEY UPDATE receiver_id = VALUES(receiver_id)
    `;

    await query(sql, [values], connection);
  }

  /**
   * Get exclusions for a party
   */
  async getExclusions(partyId) {
    const sql = `
      SELECT participant_id, excluded_participant_id, reason
      FROM participant_exclusions
      WHERE party_id = ?
    `;
    return await query(sql, [partyId]);
  }

  /**
   * Create exclusion
   */
  async createExclusion(exclusionData, connection) {
    const { partyId, participantId, excludedParticipantId, reason } = exclusionData;

    const sql = `
      INSERT INTO participant_exclusions 
      (party_id, participant_id, excluded_participant_id, reason)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE reason = VALUES(reason)
    `;

    await query(sql, [partyId, participantId, excludedParticipantId, reason], connection);
  }

  /**
   * Delete exclusions for a party
   */
  async deleteExclusions(partyId, connection) {
    const sql = 'DELETE FROM participant_exclusions WHERE party_id = ?';
    await query(sql, [partyId], connection);
  }

  /**
   * Get assignment metadata
   */
  async getMetadata(partyId) {
    const sql = 'SELECT * FROM assignment_metadata WHERE party_id = ?';
    const [result] = await query(sql, [partyId]);
    return result || null;
  }

  /**
   * Create or update assignment metadata
   */
  async upsertMetadata(metadataData, connection) {
    const {
      partyId,
      generationAttempts,
      generatedBy,
      algorithmUsed,
      isLocked
    } = metadataData;

    const sql = `
      INSERT INTO assignment_metadata 
      (party_id, generation_attempts, last_generated_at, generated_by, algorithm_used, is_locked)
      VALUES (?, ?, NOW(), ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        generation_attempts = VALUES(generation_attempts),
        last_generated_at = NOW(),
        generated_by = VALUES(generated_by),
        algorithm_used = VALUES(algorithm_used),
        is_locked = VALUES(is_locked)
    `;

    await query(sql, [
      partyId,
      generationAttempts,
      generatedBy,
      algorithmUsed,
      isLocked
    ], connection);
  }

  /**
   * Lock assignments (prevent regeneration)
   */
  async lockAssignments(partyId, connection) {
    const sql = `
      UPDATE assignment_metadata
      SET is_locked = TRUE
      WHERE party_id = ?
    `;
    await query(sql, [partyId], connection);
  }

  /**
   * Unlock assignments (allow regeneration)
   */
  async unlockAssignments(partyId, connection) {
    const sql = `
      UPDATE assignment_metadata
      SET is_locked = FALSE
      WHERE party_id = ?
    `;
    await query(sql, [partyId], connection);
  }

  /**
   * Check if assignments are locked
   */
  async isLocked(partyId) {
    const metadata = await this.getMetadata(partyId);
    return metadata?.is_locked || false;
  }
}

module.exports = new AssignmentRepository();

