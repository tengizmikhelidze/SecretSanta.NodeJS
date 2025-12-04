const Joi = require('joi');

const createPartySchema = Joi.object({
  partyDate: Joi.date().iso().min('now').optional().messages({
    'date.base': 'Party date must be a valid date',
    'date.min': 'Party date must be in the future'
  }),
  location: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Location must not exceed 255 characters'
  }),
  maxAmount: Joi.number().positive().precision(2).optional().allow(null).messages({
    'number.positive': 'Max amount must be a positive number',
    'number.precision': 'Max amount can have at most 2 decimal places'
  }),
  personalMessage: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Personal message must not exceed 1000 characters'
  }),
  hostCanSeeAll: Joi.boolean().optional().default(false),
  hostEmail: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid host email',
    'any.required': 'Host email is required'
  }),
  participants: Joi.array().items(
    Joi.object({
      name: Joi.string().min(2).max(255).required().messages({
        'string.min': 'Participant name must be at least 2 characters',
        'string.max': 'Participant name must not exceed 255 characters',
        'any.required': 'Participant name is required'
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid participant email',
        'any.required': 'Participant email is required'
      })
    })
  ).min(3).optional().messages({
    'array.min': 'At least 3 participants are required for Secret Santa'
  })
});

const updatePartySchema = Joi.object({
  partyDate: Joi.date().iso().optional().allow(null),
  location: Joi.string().max(255).optional().allow(''),
  maxAmount: Joi.number().positive().precision(2).optional().allow(null),
  personalMessage: Joi.string().max(1000).optional().allow(''),
  hostCanSeeAll: Joi.boolean().optional(),
  status: Joi.string().valid('created', 'pending', 'active', 'completed', 'cancelled').optional()
});

const partyIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid party ID format',
    'any.required': 'Party ID is required'
  })
});

const accessTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Access token is required'
  })
});

module.exports = {
  createPartySchema,
  updatePartySchema,
  partyIdSchema,
  accessTokenSchema
};

