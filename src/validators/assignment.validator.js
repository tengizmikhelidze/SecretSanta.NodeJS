const Joi = require('joi');

/**
 * Validation schema for generating assignments
 */
const generateAssignmentsSchema = Joi.object({
  regenerate: Joi.boolean().optional(),
  forceRegenerate: Joi.boolean().optional(),
  sendEmails: Joi.boolean().optional(),
  lockAfterGeneration: Joi.boolean().optional(),
  maxAttempts: Joi.number().integer().min(1).max(10000).optional(),
  seed: Joi.number().integer().optional()
});

/**
 * Validation schema for party ID parameter
 */
const partyIdSchema = Joi.object({
  partyId: Joi.string().uuid().required()
});

/**
 * Validation schema for exclusion
 */
const exclusionSchema = Joi.object({
  participantId: Joi.number().integer().positive().required(),
  excludedParticipantId: Joi.number().integer().positive().required(),
  reason: Joi.string().max(255).optional().allow(null, '')
});

/**
 * Validation schema for bulk exclusions
 */
const bulkExclusionsSchema = Joi.object({
  exclusions: Joi.array().items(exclusionSchema).min(1).required()
});

module.exports = {
  generateAssignmentsSchema,
  partyIdSchema,
  exclusionSchema,
  bulkExclusionsSchema
};

