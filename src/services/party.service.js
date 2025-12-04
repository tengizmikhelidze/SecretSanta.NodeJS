const partyRepository = require('../repositories/party.repository');
const participantRepository = require('../repositories/participant.repository');
const assignmentRepository = require('../repositories/assignment.repository');
const { NotFoundError, ForbiddenError, ValidationError, ConflictError } = require('../utils/errors');
const { sanitizeEmail } = require('../utils/helpers');
const emailService = require('./email.service');
const auditService = require('./audit.service');
const logger = require('../utils/logger');

class PartyService {
  /**
   * Create new party
   */
  async createParty(userId, partyData) {
    try {
      const { hostEmail, participants, ...partyInfo } = partyData;

      // Create party
      const party = await partyRepository.create({
        userId,
        hostEmail,
        ...partyInfo
      });

      // Log audit
      await auditService.log({
        userId,
        entityType: 'party',
        entityId: party.id,
        action: 'create',
        changes: { status: 'created' }
      });

      // Add host as participant
      const hostParticipant = await participantRepository.create({
        partyId: party.id,
        userId,
        name: partyData.hostName || 'Host',
        email: hostEmail,
        isHost: true
      });

      // Add additional participants if provided
      if (participants && participants.length > 0) {
        for (const participant of participants) {
          // Skip if participant email is same as host email
          if (participant.email.toLowerCase() === hostEmail.toLowerCase()) {
            logger.info(`Skipping participant with host email: ${participant.email}`);
            continue;
          }

          // Check email uniqueness
          const exists = await participantRepository.findByPartyAndEmail(party.id, participant.email);
          if (exists) {
            throw new ConflictError(`Email ${participant.email} is already added to this party`);
          }

          const newParticipant = await participantRepository.create({
            partyId: party.id,
            name: participant.name,
            email: participant.email,
            isHost: false
          });

          // Send invitation email
          try {
            await emailService.sendPartyInvitationEmail(
              participant.email,
              participant.name,
              hostParticipant.name,
              {
                partyId: party.id,
                partyDate: party.party_date,
                location: party.location,
                maxAmount: party.max_amount,
                personalMessage: party.personal_message
              },
              newParticipant.access_token
            );
          } catch (error) {
            logger.error('Failed to send invitation:', error);
          }
        }
      }

      return await this.getPartyDetails(party.id, userId);
    } catch (error) {
      logger.error('Error in createParty:', {
        message: error.message,
        stack: error.stack,
        partyData
      });
      throw error;
    }
  }

  /**
   * Get party details
   */
  async getPartyDetails(partyId, userId = null) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    // Get participants
    const participants = await participantRepository.findByPartyId(partyId);

    // Check if user has access
    let userParticipant = null;
    if (userId) {
      userParticipant = participants.find(p => p.user_id === userId);
    }

    // Get assignments if party is active
    let assignments = [];
    if (party.status === 'active' || party.status === 'completed') {
      assignments = await assignmentRepository.findByPartyId(partyId);
    }

    return {
      party,
      participants,
      assignments: party.host_can_see_all || userParticipant?.is_host ? assignments : [],
      userParticipant
    };
  }

  /**
   * Get party by access token
   */
  async getPartyByToken(accessToken) {
    const party = await partyRepository.findByAccessToken(accessToken);
    if (party) {
      return await this.getPartyDetails(party.id);
    }

    const participant = await participantRepository.findByAccessToken(accessToken);
    if (!participant) {
      throw new NotFoundError('Invalid access token');
    }

    return await this.getPartyDetails(participant.party_id);
  }

  /**
   * Update party
   */
  async updateParty(partyId, userId, updates) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    // Check if user is host
    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the host can update the party');
    }

    // Validate status transition
    if (updates.status) {
      this.validateStatusTransition(party.status, updates.status);
    }

    const updatedParty = await partyRepository.update(partyId, updates);

    // Log audit
    await auditService.log({
      userId,
      entityType: 'party',
      entityId: partyId,
      action: 'update',
      changes: updates
    });

    return updatedParty;
  }

  /**
   * Delete party
   */
  async deleteParty(partyId, userId) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the host can delete the party');
    }

    await partyRepository.delete(partyId);

    // Log audit
    await auditService.log({
      userId,
      entityType: 'party',
      entityId: partyId,
      action: 'delete'
    });

    return { message: 'Party deleted successfully' };
  }

  /**
   * Get user's parties (as host)
   */
  async getUserParties(userId) {
    return await partyRepository.findByUserId(userId);
  }

  /**
   * Get parties where user is participant
   */
  async getUserParticipantParties(userId) {
    return await participantRepository.findPartiesByUserId(userId);
  }

  /**
   * Add participant to party
   */
  async addParticipant(partyId, userId, participantData) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the host can add participants');
    }

    if (party.status !== 'created' && party.status !== 'pending') {
      throw new ValidationError('Cannot add participants to an active or completed party');
    }

    // Check email uniqueness
    const emailUnique = await participantRepository.isEmailUniqueInParty(partyId, participantData.email);
    if (!emailUnique) {
      throw new ConflictError('This email is already added to the party');
    }

    const participant = await participantRepository.create({
      partyId,
      name: participantData.name,
      email: participantData.email,
      isHost: false
    });

    // Send invitation
    const host = await participantRepository.findByPartyAndEmail(partyId, party.host_email);
    try {
      await emailService.sendPartyInvitationEmail(
        participant.email,
        participant.name,
        host?.name || 'Host',
        {
          partyId: party.id,
          partyDate: party.party_date,
          location: party.location,
          maxAmount: party.max_amount,
          personalMessage: party.personal_message
        },
        participant.access_token
      );
    } catch (error) {
      logger.error('Failed to send invitation:', error);
    }

    // Log audit
    await auditService.log({
      userId,
      entityType: 'participant',
      entityId: participant.id,
      action: 'create',
      changes: { email: participant.email, name: participant.name }
    });

    return participant;
  }

  /**
   * Remove participant from party
   */
  async removeParticipant(partyId, participantId, userId) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the host can remove participants');
    }

    const participant = await participantRepository.findById(participantId);
    if (!participant || participant.party_id !== partyId) {
      throw new NotFoundError('Participant not found');
    }

    if (participant.is_host) {
      throw new ValidationError('Cannot remove the host from the party');
    }

    if (party.status !== 'created' && party.status !== 'pending') {
      throw new ValidationError('Cannot remove participants from an active or completed party');
    }

    await participantRepository.delete(participantId);

    // Log audit
    await auditService.log({
      userId,
      entityType: 'participant',
      entityId: participantId,
      action: 'delete'
    });

    return { message: 'Participant removed successfully' };
  }

  /**
   * Draw names (create assignments)
   */
  async drawNames(partyId, userId) {
    const party = await partyRepository.findById(partyId);
    if (!party) {
      throw new NotFoundError('Party not found');
    }

    if (party.user_id !== userId) {
      throw new ForbiddenError('Only the host can draw names');
    }

    const participants = await participantRepository.findByPartyId(partyId);
    if (participants.length < 3) {
      throw new ValidationError('At least 3 participants are required for Secret Santa');
    }

    // Check if assignments already exist
    const existingAssignments = await assignmentRepository.existsForParty(partyId);
    if (existingAssignments) {
      throw new ValidationError('Assignments already exist for this party');
    }

    // Create assignments using Secret Santa algorithm
    const assignments = this.generateSecretSantaAssignments(participants);

    // Save assignments to database
    for (const assignment of assignments) {
      await assignmentRepository.create({
        partyId,
        giverId: assignment.giverId,
        receiverId: assignment.receiverId
      });

      // Update participant with assignment
      await participantRepository.setAssignment(assignment.giverId, assignment.receiverId);
    }

    // Update party status
    await partyRepository.updateStatus(partyId, 'active');

    // Send assignment emails
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
      } catch (error) {
        logger.error('Failed to send assignment email:', error);
      }
    }

    // Log audit
    await auditService.log({
      userId,
      entityType: 'party',
      entityId: partyId,
      action: 'draw_names',
      changes: { status: 'active', assignmentsCount: assignments.length }
    });

    return { message: 'Secret Santa assignments created and sent!' };
  }

  /**
   * Generate Secret Santa assignments (cycle algorithm)
   */
  generateSecretSantaAssignments(participants) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const assignments = [];

    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i];
      const receiver = shuffled[(i + 1) % shuffled.length];

      assignments.push({
        giverId: giver.id,
        receiverId: receiver.id
      });
    }

    return assignments;
  }

  /**
   * Validate status transition
   */
  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      created: ['pending', 'cancelled'],
      pending: ['active', 'cancelled'],
      active: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new ValidationError(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }
  }
}

module.exports = new PartyService();

