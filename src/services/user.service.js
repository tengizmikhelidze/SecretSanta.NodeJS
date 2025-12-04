const participantRepository = require('../repositories/participant.repository');
const userRepository = require('../repositories/user.repository');
const partyRepository = require('../repositories/party.repository');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

class UserService {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    await userRepository.updateProfile(userId, updates);
    return await this.getProfile(userId);
  }

  /**
   * Get user's account page (all parties)
   */
  async getAccountPage(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get parties where user is host
    const hostedParties = await partyRepository.findByUserId(userId);

    // Get parties where user is participant
    const participantParties = await participantRepository.findPartiesByUserId(userId);

    // Also check by email for parties user joined before registering
    const emailParties = await participantRepository.findPartiesByEmail(user.email);

    // Combine and deduplicate
    const allParticipantParties = [...participantParties, ...emailParties]
      .filter((party, index, self) =>
        index === self.findIndex(p => p.id === party.id)
      );

    return {
      user: this.sanitizeUser(user),
      hostedParties: hostedParties.map(party => ({
        ...party,
        role: 'host'
      })),
      participantParties: allParticipantParties.map(party => ({
        ...party,
        role: 'participant'
      }))
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    const hostedParties = await partyRepository.findByUserId(userId);
    const participantParties = await participantRepository.findPartiesByUserId(userId);

    return {
      totalPartiesHosted: hostedParties.length,
      totalPartiesParticipated: participantParties.length,
      activeParties: [...hostedParties, ...participantParties].filter(
        p => p.status === 'active'
      ).length,
      completedParties: [...hostedParties, ...participantParties].filter(
        p => p.status === 'completed'
      ).length
    };
  }

  /**
   * Remove sensitive data from user object
   */
  sanitizeUser(user) {
    const {
      password_hash,
      email_verification_token,
      email_verification_expires_at,
      password_reset_token,
      password_reset_expires_at,
      ...sanitized
    } = user;
    return sanitized;
  }
}

module.exports = new UserService();

