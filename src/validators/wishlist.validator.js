const Joi = require('joi');

const createWishlistItemSchema = Joi.object({
  itemName: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Item name must be at least 2 characters',
    'string.max': 'Item name must not exceed 255 characters',
    'any.required': 'Item name is required'
  }),
  itemDescription: Joi.string().max(1000).optional().allow(''),
  itemUrl: Joi.string().uri().max(500).optional().allow('').messages({
    'string.uri': 'Please provide a valid URL',
    'string.max': 'URL must not exceed 500 characters'
  }),
  priceRange: Joi.string().max(50).optional().allow(''),
  priority: Joi.string().valid('high', 'medium', 'low').optional().default('medium')
});

const updateWishlistItemSchema = Joi.object({
  itemName: Joi.string().min(2).max(255).optional(),
  itemDescription: Joi.string().max(1000).optional().allow(''),
  itemUrl: Joi.string().uri().max(500).optional().allow(''),
  priceRange: Joi.string().max(50).optional().allow(''),
  priority: Joi.string().valid('high', 'medium', 'low').optional(),
  isPurchased: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional()
});

const wishlistIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Wishlist item ID is required'
  })
});

module.exports = {
  createWishlistItemSchema,
  updateWishlistItemSchema,
  wishlistIdSchema
};

