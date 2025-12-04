const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams } = require('../middleware/validation.middleware');
const {
  createWishlistItemSchema,
  updateWishlistItemSchema,
  wishlistIdSchema
} = require('../validators/wishlist.validator');

// All routes are protected
router.use(protect);

// Wishlist CRUD
router.get('/participant/:participantId', wishlistController.getWishlist);
router.post('/participant/:participantId', validate(createWishlistItemSchema), wishlistController.createItem);
router.put('/:id', validateParams(wishlistIdSchema), validate(updateWishlistItemSchema), wishlistController.updateItem);
router.delete('/:id', validateParams(wishlistIdSchema), wishlistController.deleteItem);
router.post('/participant/:participantId/reorder', wishlistController.reorderItems);

module.exports = router;

