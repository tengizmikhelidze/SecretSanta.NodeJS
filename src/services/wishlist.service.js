const wishlistRepository = require('../repositories/wishlist.repository');
const participantRepository = require('../repositories/participant.repository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

class WishlistService {
  /**
   * Get participant's wishlist
   */
  async getWishlist(participantId) {
    const participant = await participantRepository.findById(participantId);
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    return await wishlistRepository.findByParticipantId(participantId);
  }

  /**
   * Create wishlist item
   */
  async createItem(participantId, userId, itemData) {
    const participant = await participantRepository.findById(participantId);
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    // Check if user has access to this participant
    if (participant.user_id !== userId) {
      throw new ForbiddenError('You can only add items to your own wishlist');
    }

    return await wishlistRepository.create({
      participantId,
      ...itemData
    });
  }

  /**
   * Update wishlist item
   */
  async updateItem(itemId, userId, updates) {
    const item = await wishlistRepository.findById(itemId);
    if (!item) {
      throw new NotFoundError('Wishlist item not found');
    }

    const participant = await participantRepository.findById(item.participant_id);
    if (participant.user_id !== userId) {
      throw new ForbiddenError('You can only update your own wishlist items');
    }

    return await wishlistRepository.update(itemId, updates);
  }

  /**
   * Delete wishlist item
   */
  async deleteItem(itemId, userId) {
    const item = await wishlistRepository.findById(itemId);
    if (!item) {
      throw new NotFoundError('Wishlist item not found');
    }

    const participant = await participantRepository.findById(item.participant_id);
    if (participant.user_id !== userId) {
      throw new ForbiddenError('You can only delete your own wishlist items');
    }

    await wishlistRepository.delete(itemId);
    return { message: 'Wishlist item deleted successfully' };
  }

  /**
   * Reorder wishlist items
   */
  async reorderItems(participantId, userId, itemOrders) {
    const participant = await participantRepository.findById(participantId);
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    if (participant.user_id !== userId) {
      throw new ForbiddenError('You can only reorder your own wishlist');
    }

    await wishlistRepository.reorder(participantId, itemOrders);
    return { message: 'Wishlist reordered successfully' };
  }
}

module.exports = new WishlistService();

