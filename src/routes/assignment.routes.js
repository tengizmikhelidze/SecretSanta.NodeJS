const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams } = require('../middleware/validation.middleware');
const {
  generateAssignmentsSchema,
  partyIdSchema
} = require('../validators/assignment.validator');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/v1/parties/:partyId/assignments/generate
 * @desc    Generate Secret Santa assignments for a party
 * @access  Private (Host only)
 * @body    {regenerate, forceRegenerate, sendEmails, lockAfterGeneration, maxAttempts, seed}
 */
router.post(
  '/:partyId/assignments/generate',
  validateParams(partyIdSchema),
  validate(generateAssignmentsSchema),
  assignmentController.generateAssignments
);

/**
 * @route   GET /api/v1/parties/:partyId/assignments
 * @desc    Get assignments for a party
 * @access  Private (Host can see all, participants see only their own)
 */
router.get(
  '/:partyId/assignments',
  validateParams(partyIdSchema),
  assignmentController.getAssignments
);

/**
 * @route   DELETE /api/v1/parties/:partyId/assignments
 * @desc    Delete all assignments for a party
 * @access  Private (Host only)
 */
router.delete(
  '/:partyId/assignments',
  validateParams(partyIdSchema),
  assignmentController.deleteAssignments
);

/**
 * @route   POST /api/v1/parties/:partyId/assignments/regenerate
 * @desc    Regenerate assignments (delete + generate in one transaction)
 * @access  Private (Host only)
 * @body    {sendEmails, lockAfterGeneration, maxAttempts}
 */
router.post(
  '/:partyId/assignments/regenerate',
  validateParams(partyIdSchema),
  validate(generateAssignmentsSchema),
  assignmentController.regenerateAssignments
);

/**
 * @route   POST /api/v1/parties/:partyId/assignments/lock
 * @desc    Lock assignments (prevent regeneration)
 * @access  Private (Host only)
 */
router.post(
  '/:partyId/assignments/lock',
  validateParams(partyIdSchema),
  assignmentController.lockAssignments
);

/**
 * @route   POST /api/v1/parties/:partyId/assignments/unlock
 * @desc    Unlock assignments (allow regeneration)
 * @access  Private (Host only)
 */
router.post(
  '/:partyId/assignments/unlock',
  validateParams(partyIdSchema),
  assignmentController.unlockAssignments
);

/**
 * @route   GET /api/v1/parties/:partyId/assignments/stats
 * @desc    Get assignment statistics
 * @access  Private (Host only)
 */
router.get(
  '/:partyId/assignments/stats',
  validateParams(partyIdSchema),
  assignmentController.getAssignmentStats
);

module.exports = router;

