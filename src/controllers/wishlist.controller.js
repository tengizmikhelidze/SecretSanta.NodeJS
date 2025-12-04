const wishlistService = require('../services/wishlist.service');

class WishlistController {
  /**
   * Get participant's wishlist
   */
  async getWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.getWishlist(req.params.participantId);
      res.json({
        success: true,
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create wishlist item
   */
  async createItem(req, res, next) {
    try {
      const item = await wishlistService.createItem(
        req.params.participantId,
        req.user.id,
        req.body
      );
      res.status(201).json({
        success: true,
        data: item,
        message: 'Wishlist item added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update wishlist item
   */
  async updateItem(req, res, next) {
    try {
      const item = await wishlistService.updateItem(req.params.id, req.user.id, req.body);
      res.json({
        success: true,
        data: item,
        message: 'Wishlist item updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete wishlist item
   */
  async deleteItem(req, res, next) {
    try {
      const result = await wishlistService.deleteItem(req.params.id, req.user.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder wishlist items
   */
  async reorderItems(req, res, next) {
    try {
      const result = await wishlistService.reorderItems(
        req.params.participantId,
        req.user.id,
        req.body.itemOrders
      );
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistController();

