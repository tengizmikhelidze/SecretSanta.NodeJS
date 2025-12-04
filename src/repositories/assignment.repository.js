const { query } = require('../config/database');

class AssignmentRepository {
  /**
   * Find assignment by ID
   */
  async findById(assignmentId) {
    const sql = 'SELECT * FROM assignments WHERE id = ?';
    const assignments = await query(sql, [assignmentId]);
    return assignments[0] || null;
  }

  /**
   * Find all assignments for a party
   */
  async findByPartyId(partyId) {
    const sql = `
      SELECT 
        a.*,
        giver.name as giver_name,
        giver.email as giver_email,
        receiver.name as receiver_name,
        receiver.email as receiver_email
      FROM assignments a
      JOIN participants giver ON a.giver_id = giver.id
      JOIN participants receiver ON a.receiver_id = receiver.id
      WHERE a.party_id = ?
      ORDER BY a.created_at ASC
    `;
    return await query(sql, [partyId]);
  }

  /**
   * Find assignment for a giver
   */
  async findByGiverId(giverId) {
    const sql = 'SELECT * FROM assignments WHERE giver_id = ?';
    const assignments = await query(sql, [giverId]);
    return assignments[0] || null;
  }

  /**
   * Create assignment
   */
  async create(assignmentData) {
    const { partyId, giverId, receiverId } = assignmentData;

    const sql = `
      INSERT INTO assignments (party_id, giver_id, receiver_id)
      VALUES (?, ?, ?)
    `;

    const result = await query(sql, [partyId, giverId, receiverId]);
    return await this.findById(result.insertId);
  }

  /**
   * Create multiple assignments
   */
  async createBulk(assignments) {
    if (assignments.length === 0) return [];

    const values = assignments.map(a => `('${a.partyId}', ${a.giverId}, ${a.receiverId})`).join(', ');
    const sql = `
      INSERT INTO assignments (party_id, giver_id, receiver_id)
      VALUES ${values}
    `;

    await query(sql);
  }

  /**
   * Delete all assignments for a party
   */
  async deleteByPartyId(partyId) {
    const sql = 'DELETE FROM assignments WHERE party_id = ?';
    await query(sql, [partyId]);
  }

  /**
   * Delete assignment
   */
  async delete(assignmentId) {
    const sql = 'DELETE FROM assignments WHERE id = ?';
    await query(sql, [assignmentId]);
  }

  /**
   * Check if assignments exist for party
   */
  async existsForParty(partyId) {
    const sql = 'SELECT COUNT(*) as count FROM assignments WHERE party_id = ?';
    const results = await query(sql, [partyId]);
    return results[0].count > 0;
  }

  /**
   * Get assignment count for party
   */
  async getCountByParty(partyId) {
    const sql = 'SELECT COUNT(*) as count FROM assignments WHERE party_id = ?';
    const results = await query(sql, [partyId]);
    return results[0].count;
  }
}

module.exports = new AssignmentRepository();

