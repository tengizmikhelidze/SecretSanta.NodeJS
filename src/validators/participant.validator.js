const Joi = require('joi');

const addParticipantSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 255 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  })
});

const updateParticipantSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  wishlist: Joi.string().max(5000).optional().allow(''),
  wishlistDescription: Joi.string().max(2000).optional().allow('')
});

const participantIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Participant ID is required'
  })
});

module.exports = {
  addParticipantSchema,
  updateParticipantSchema,
  participantIdSchema
};

