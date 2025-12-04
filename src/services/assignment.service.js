const assignmentRepository = require('../repositories/assignment.repository');
const participantRepository = require('../repositories/participant.repository');
const partyRepository = require('../repositories/party.repository');
const assignmentAlgorithm = require('./assignment.algorithm');
const emailService = require('./email.service');
const auditService = require('./audit.service');
const { query, getConnection } = require('../config/database');
const { NotFoundError, ForbiddenError, ValidationError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

class AssignmentService {
  /**
   * Generate Secret Santa assignments for a party
   */
  async generateAssignments(partyId, userId, options = {}) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // 1. Validate party and authorization
      const party = await partyRepository.findById(partyId);
      if (!party) {
        throw new NotFoundError('Party not found');
      }

      if (party.user_id !== userId) {
        throw new ForbiddenError('Only the party host can generate assignments');
      }

      // 2. Check if assignments are locked
      const isLocked = await assignmentRepository.isLocked(partyId);
      if (isLocked && !options.forceRegenerate) {
        throw new ConflictError(
          'Assignments are locked. Use forceRegenerate option to regenerate.'
        );
      }

      // 3. Check if assignments already exist
      const existingAssignments = await assignmentRepository.existsForParty(partyId);
      if (existingAssignments && !options.regenerate) {
        throw new ConflictError(
          'Assignments already exist. Delete them first or use regenerate option.'
        );
      }

      // 4. Get participants
      const participants = await participantRepository.findByPartyId(partyId);
      if (participants.length < 3) {
        throw new ValidationError('At least 3 participants are required for Secret Santa');
      }

      // 5. Get constraints
      const exclusions = await assignmentRepository.getExclusions(partyId);
      const exclusionsMap = assignmentAlgorithm.buildExclusionsMap(exclusions);

      // 6. Get previous year assignments (optional)
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      const previousAssignments = await assignmentRepository.getPreviousYearAssignments(
        partyId,
        previousYear
      );
      const previousPairsSet = assignmentAlgorithm.buildPreviousPairsSet(previousAssignments);

      // 7. Delete existing assignments if regenerating
      if (existingAssignments) {
        await assignmentRepository.deleteByPartyId(partyId, connection);
        await participantRepository.clearAssignments(partyId, connection);
        logger.info(`Deleted existing assignments for party ${partyId}`);
      }

      // 8. Generate assignments using algorithm
      const assignments = assignmentAlgorithm.generateAssignments(
        participants,
        {
          exclusions: exclusionsMap,
          previousPairs: previousPairsSet
        },
        {
          maxAttempts: options.maxAttempts || 1000,
          seed: options.seed || Date.now()
        }
      );

      // 9. Validate generated assignments
      assignmentAlgorithm.validateAssignments(assignments, participants, exclusionsMap);

      // 10. Save assignments to database
      const assignmentRecords = assignments.map(a => ({
        partyId,
        giverId: a.giverId,
        receiverId: a.receiverId
      }));

      await assignmentRepository.bulkCreate(assignmentRecords, connection);

      // 11. Update participants.assigned_to field
      for (const assignment of assignments) {
        await participantRepository.setAssignment(
          assignment.giverId,
          assignment.receiverId,
          connection
        );
      }

      // 12. Save to previous_assignments for next year
      await assignmentRepository.saveToPreviousAssignments(
        partyId,
        currentYear,
        assignments,
        connection
      );

      // 13. Update metadata
      const metadata = await assignmentRepository.getMetadata(partyId);
      await assignmentRepository.upsertMetadata(
        {
          partyId,
          generationAttempts: (metadata?.generation_attempts || 0) + 1,
          generatedBy: userId,
          algorithmUsed: 'cycle',
          isLocked: options.lockAfterGeneration || false
        },
        connection
      );

      // 14. Update party status
      await partyRepository.updateStatus(partyId, 'active', connection);

      // 15. Commit transaction
      await connection.commit();

      // 16. Send assignment emails (async, don't block)
      if (options.sendEmails !== false) {
        this.sendAssignmentEmails(partyId, participants, assignments).catch(error => {
          logger.error('Failed to send assignment emails:', error);
        });
      }

      // 17. Log audit
      await auditService.log({
        userId,
        entityType: 'party',
        entityId: partyId,
        action: 'generate_assignments',
        changes: {
          participantCount: participants.length,
          regeneration: existingAssignments,
          algorithm: 'cycle'
        }
      });

      logger.info(`Successfully generated ${assignments.length} assignments for party ${partyId}`);

      return {
        success: true,
        assignmentCount: assignments.length,
        participantCount: participants.length,
        metadata: {
          generatedAt: new Date(),
          generatedBy: userId,
          algorithm: 'cycle'
        }
      };

    } catch (error) {
      await connection.rollback();
      logger.error('Error generating assignments:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get assignments for a party
   */
  async getAssignments(partyId, userId, options = {}) {
    // 1. Validate party exists
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    // 2. Check authorization
    const userParticipant = await participantRepository.findByPartyAndUserId(partyId, userId);
    const isHost = party.user_id === userId;
    const isParticipant = userParticipant !== null;

    if (!isHost && !isParticipant) {
      throw new ForbiddenError('You do not have access to this party');
    }

    // 3. Get assignments
    const assignments = await assignmentRepository.findByPartyId(partyId);

    if (assignments.length === 0) {
      return {
        generated: false,
        message: 'No assignments have been generated yet'
      };
    }

    // 4. Filter based on access level
    if (isHost && party.host_can_see_all) {
      // Host can see all assignments
      return {
        generated: true,
        assignments: assignments.map(a => ({
          id: a.id,
          giver: {
            id: a.giver_id,
            name: a.giver_name,
            email: a.giver_email
          },
          receiver: {
            id: a.receiver_id,
            name: a.receiver_name,
            email: a.receiver_email
          },
          createdAt: a.created_at
        }))
      };
    } else if (isParticipant) {
      // Participant can only see their own assignment
      const myAssignment = await assignmentRepository.findByGiverId(partyId, userParticipant.id);

      if (!myAssignment) {
        return {
          generated: true,
          myAssignment: null,
          message: 'You are not assigned to give a gift'
        };
      }

      return {
        generated: true,
        myAssignment: {
          receiver: {
            id: myAssignment.receiver_id,
            name: myAssignment.receiver_name,
            email: myAssignment.receiver_email
          },
          wishlist: myAssignment.wishlist,
          wishlistDescription: myAssignment.wishlist_description,
          createdAt: myAssignment.created_at
        }
      };
    } else {
      throw new ForbiddenError('You cannot view assignments for this party');
    }
  }

  /**
   * Delete assignments for a party
   */
  async deleteAssignments(partyId, userId) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // 1. Validate party and authorization
      const party = await partyRepository.findById(partyId);
      if (!party) {
        throw new NotFoundError('Party not found');
      }

      if (party.user_id !== userId) {
        throw new ForbiddenError('Only the party host can delete assignments');
      }

      // 2. Check if assignments are locked
      const isLocked = await assignmentRepository.isLocked(partyId);
      if (isLocked) {
        throw new ConflictError(
          'Assignments are locked and cannot be deleted. Unlock them first.'
        );
      }

      // 3. Delete assignments
      await assignmentRepository.deleteByPartyId(partyId, connection);

      // 4. Clear participants.assigned_to
      await participantRepository.clearAssignments(partyId, connection);

      // 5. Update party status back to pending
      await partyRepository.updateStatus(partyId, 'pending', connection);

      // 6. Commit transaction
      await connection.commit();

      // 7. Log audit
      await auditService.log({
        userId,
        entityType: 'party',
        entityId: partyId,
        action: 'delete_assignments'
      });

      logger.info(`Deleted assignments for party ${partyId}`);

      return {
        success: true,
        message: 'Assignments deleted successfully'
      };

    } catch (error) {
      await connection.rollback();
      logger.error('Error deleting assignments:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Regenerate assignments (delete + generate)
   */
  async regenerateAssignments(partyId, userId, options = {}) {
    await this.deleteAssignments(partyId, userId);
    return await this.generateAssignments(partyId, userId, {
      ...options,
      regenerate: true
    });
  }

  /**
   * Lock/unlock assignments
   */
  async lockAssignments(partyId, userId) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the party host can lock assignments');
    }

    await assignmentRepository.lockAssignments(partyId);

    await auditService.log({
      userId,
      entityType: 'party',
      entityId: partyId,
      action: 'lock_assignments'
    });

    return { success: true, message: 'Assignments locked successfully' };
  }

  async unlockAssignments(partyId, userId) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the party host can unlock assignments');
    }

    await assignmentRepository.unlockAssignments(partyId);

    await auditService.log({
      userId,
      entityType: 'party',
      entityId: partyId,
      action: 'unlock_assignments'
    });

    return { success: true, message: 'Assignments unlocked successfully' };
  }

  /**
   * Send assignment emails to all participants
   */
  async sendAssignmentEmails(partyId, participants, assignments) {
    const party = await partyRepository.findById(partyId);

    for (const assignment of assignments) {
      const giver = participants.find(p => p.id === assignment.giverId);
      const receiver = participants.find(p => p.id === assignment.receiverId);

      try {
        await emailService.sendAssignmentEmail(
          giver.email,
          giver.name,
          receiver.name,
          receiver.wishlist,
          {
            partyId: party.id,
            partyDate: party.party_date,
            location: party.location,
            maxAmount: party.max_amount
          },
          giver.access_token
        );

        await participantRepository.update(giver.id, {
          notificationSent: true,
          notificationSentAt: new Date()
        });

        logger.info(`Sent assignment email to ${giver.email}`);
      } catch (error) {
        logger.error(`Failed to send assignment email to ${giver.email}:`, error);
      }
    }
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(partyId, userId) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the party host can view statistics');
    }

    const assignments = await assignmentRepository.findByPartyId(partyId);
    const participants = await participantRepository.findByPartyId(partyId);
    const metadata = await assignmentRepository.getMetadata(partyId);

    const emailsSent = participants.filter(p => p.notification_sent).length;
    const emailsPending = participants.length - emailsSent;

    return {
      totalParticipants: participants.length,
      totalAssignments: assignments.length,
      emailsSent,
      emailsPending,
      isLocked: metadata?.is_locked || false,
      generatedAt: metadata?.last_generated_at || null,
      generationAttempts: metadata?.generation_attempts || 0,
      algorithm: metadata?.algorithm_used || 'unknown'
    };
  }
}

module.exports = new AssignmentService();

