const assignmentService = require('../services/assignment.service');

class AssignmentController {
  /**
   * Generate Secret Santa assignments
   * POST /api/v1/parties/:partyId/assignments/generate
   */
  async generateAssignments(req, res, next) {
    try {
      const { partyId } = req.params;
      const options = {
        regenerate: req.body.regenerate || false,
        forceRegenerate: req.body.forceRegenerate || false,
        sendEmails: req.body.sendEmails !== false, // Default true
        lockAfterGeneration: req.body.lockAfterGeneration || false,
        maxAttempts: req.body.maxAttempts || 1000,
        seed: req.body.seed || Date.now()
      };

      const result = await assignmentService.generateAssignments(
        partyId,
        req.user.id,
        options
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Secret Santa assignments generated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get assignments for a party
   * GET /api/v1/parties/:partyId/assignments
   */
  async getAssignments(req, res, next) {
    try {
      const { partyId } = req.params;

      const result = await assignmentService.getAssignments(
        partyId,
        req.user.id,
        req.query
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete assignments for a party
   * DELETE /api/v1/parties/:partyId/assignments
   */
  async deleteAssignments(req, res, next) {
    try {
      const { partyId } = req.params;

      const result = await assignmentService.deleteAssignments(
        partyId,
        req.user.id
      );

      res.json({
        success: true,
        data: result,
        message: 'Assignments deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerate assignments (delete + generate)
   * POST /api/v1/parties/:partyId/assignments/regenerate
   */
  async regenerateAssignments(req, res, next) {
    try {
      const { partyId } = req.params;
      const options = {
        sendEmails: req.body.sendEmails !== false,
        lockAfterGeneration: req.body.lockAfterGeneration || false,
        maxAttempts: req.body.maxAttempts || 1000
      };

      const result = await assignmentService.regenerateAssignments(
        partyId,
        req.user.id,
        options
      );

      res.json({
        success: true,
        data: result,
        message: 'Assignments regenerated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lock assignments
   * POST /api/v1/parties/:partyId/assignments/lock
   */
  async lockAssignments(req, res, next) {
    try {
      const { partyId } = req.params;

      const result = await assignmentService.lockAssignments(
        partyId,
        req.user.id
      );

      res.json({
        success: true,
        data: result,
        message: 'Assignments locked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unlock assignments
   * POST /api/v1/parties/:partyId/assignments/unlock
   */
  async unlockAssignments(req, res, next) {
    try {
      const { partyId } = req.params;

      const result = await assignmentService.unlockAssignments(
        partyId,
        req.user.id
      );

      res.json({
        success: true,
        data: result,
        message: 'Assignments unlocked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get assignment statistics
   * GET /api/v1/parties/:partyId/assignments/stats
   */
  async getAssignmentStats(req, res, next) {
    try {
      const { partyId } = req.params;

      const stats = await assignmentService.getAssignmentStats(
        partyId,
        req.user.id
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();

