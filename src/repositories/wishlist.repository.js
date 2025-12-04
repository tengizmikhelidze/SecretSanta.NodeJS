const { query } = require('../config/database');

class WishlistRepository {
  /**
   * Find wishlist item by ID
   */
  async findById(itemId) {
    const sql = 'SELECT * FROM wishlists WHERE id = ?';
    const items = await query(sql, [itemId]);
    return items[0] || null;
  }

  /**
   * Find all wishlist items for a participant
   */
  async findByParticipantId(participantId) {
    const sql = `
      SELECT * FROM wishlists 
      WHERE participant_id = ?
      ORDER BY sort_order ASC, priority DESC, created_at ASC
    `;
    return await query(sql, [participantId]);
  }

  /**
   * Create wishlist item
   */
  async create(itemData) {
    const {
      participantId,
      itemName,
      itemDescription,
      itemUrl,
      priceRange,
      priority,
      sortOrder
    } = itemData;

    const sql = `
      INSERT INTO wishlists (
        participant_id, item_name, item_description, item_url,
        price_range, priority, sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      participantId,
      itemName,
      itemDescription || null,
      itemUrl || null,
      priceRange || null,
      priority || 'medium',
      sortOrder || 0
    ]);

    return await this.findById(result.insertId);
  }

  /**
   * Update wishlist item
   */
  async update(itemId, data) {
    const fields = [];
    const values = [];

    if (data.itemName !== undefined) {
      fields.push('item_name = ?');
      values.push(data.itemName);
    }

    if (data.itemDescription !== undefined) {
      fields.push('item_description = ?');
      values.push(data.itemDescription);
    }

    if (data.itemUrl !== undefined) {
      fields.push('item_url = ?');
      values.push(data.itemUrl);
    }

    if (data.priceRange !== undefined) {
      fields.push('price_range = ?');
      values.push(data.priceRange);
    }

    if (data.priority !== undefined) {
      fields.push('priority = ?');
      values.push(data.priority);
    }

    if (data.isPurchased !== undefined) {
      fields.push('is_purchased = ?');
      values.push(data.isPurchased);
    }

    if (data.sortOrder !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sortOrder);
    }

    if (fields.length === 0) return await this.findById(itemId);

    values.push(itemId);
    const sql = `UPDATE wishlists SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return await this.findById(itemId);
  }

  /**
   * Delete wishlist item
   */
  async delete(itemId) {
    const sql = 'DELETE FROM wishlists WHERE id = ?';
    await query(sql, [itemId]);
  }

  /**
   * Delete all wishlist items for a participant
   */
  async deleteByParticipantId(participantId) {
    const sql = 'DELETE FROM wishlists WHERE participant_id = ?';
    await query(sql, [participantId]);
  }

  /**
   * Get count of wishlist items for a participant
   */
  async getCountByParticipant(participantId) {
    const sql = 'SELECT COUNT(*) as count FROM wishlists WHERE participant_id = ?';
    const results = await query(sql, [participantId]);
    return results[0].count;
  }

  /**
   * Reorder wishlist items
   */
  async reorder(participantId, itemOrders) {
    // itemOrders is an array of { id, sortOrder }
    const promises = itemOrders.map(({ id, sortOrder }) => {
      const sql = 'UPDATE wishlists SET sort_order = ? WHERE id = ? AND participant_id = ?';
      return query(sql, [sortOrder, id, participantId]);
    });

    await Promise.all(promises);
  }
}

module.exports = new WishlistRepository();

