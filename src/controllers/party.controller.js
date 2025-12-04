const partyService = require('../services/party.service');

class PartyController {
  /**
   * Create new party
   */
  async createParty(req, res, next) {
    try {
      const party = await partyService.createParty(req.user.id, req.body);
      res.status(201).json({
        success: true,
        data: party,
        message: 'Party created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get party details
   */
  async getParty(req, res, next) {
    try {
      const party = await partyService.getPartyDetails(req.params.id, req.user?.id);
      res.json({
        success: true,
        data: party
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get party by access token
   */
  async getPartyByToken(req, res, next) {
    try {
      const party = await partyService.getPartyByToken(req.query.token);
      res.json({
        success: true,
        data: party
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update party
   */
  async updateParty(req, res, next) {
    try {
      const party = await partyService.updateParty(req.params.id, req.user.id, req.body);
      res.json({
        success: true,
        data: party,
        message: 'Party updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete party
   */
  async deleteParty(req, res, next) {
    try {
      const result = await partyService.deleteParty(req.params.id, req.user.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's parties
   */
  async getUserParties(req, res, next) {
    try {
      const parties = await partyService.getUserParties(req.user.id);
      res.json({
        success: true,
        data: parties
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add participant to party
   */
  async addParticipant(req, res, next) {
    try {
      const participant = await partyService.addParticipant(
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(201).json({
        success: true,
        data: participant,
        message: 'Participant added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove participant from party
   */
  async removeParticipant(req, res, next) {
    try {
      const result = await partyService.removeParticipant(
        req.params.id,
        req.params.participantId,
        req.user.id
      );
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Draw names (create Secret Santa assignments)
   */
  async drawNames(req, res, next) {
    try {
      const result = await partyService.drawNames(req.params.id, req.user.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PartyController();

