const express = require('express');
const router = express.Router();
const partyController = require('../controllers/party.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, validateQuery } = require('../middleware/validation.middleware');
const {
  createPartySchema,
  updatePartySchema,
  partyIdSchema,
  accessTokenSchema
} = require('../validators/party.validator');
const {
  addParticipantSchema
} = require('../validators/participant.validator');

// Public routes (with access token)
router.get('/by-token', validateQuery(accessTokenSchema), partyController.getPartyByToken);

// Protected routes
router.use(protect);

// Party CRUD
router.post('/', validate(createPartySchema), partyController.createParty);
router.get('/my-parties', partyController.getUserParties);
router.get('/:id', validateParams(partyIdSchema), partyController.getParty);
router.put('/:id', validateParams(partyIdSchema), validate(updatePartySchema), partyController.updateParty);
router.delete('/:id', validateParams(partyIdSchema), partyController.deleteParty);

// Participant management
router.post('/:id/participants', validateParams(partyIdSchema), validate(addParticipantSchema), partyController.addParticipant);
router.delete('/:id/participants/:participantId', validateParams(partyIdSchema), partyController.removeParticipant);

// Secret Santa draw
router.post('/:id/draw-names', validateParams(partyIdSchema), partyController.drawNames);

module.exports = router;

