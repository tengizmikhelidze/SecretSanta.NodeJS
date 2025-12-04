const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Secret Santa Assignment Algorithm Service
 * Implements deterministic, constraint-aware pairing logic
 */
class AssignmentAlgorithm {
  /**
   * Generate Secret Santa assignments using cycle-based algorithm
   * @param {Array} participants - Array of participant objects with {id, email, name}
   * @param {Object} constraints - Constraints object {exclusions: Map, previousPairs: Set}
   * @param {Object} options - Algorithm options {maxAttempts, seed}
   * @returns {Array} - Array of assignments [{giverId, receiverId}]
   */
  generateAssignments(participants, constraints = {}, options = {}) {
    const {
      exclusions = new Map(), // Map<giverId, Set<receiverId>>
      previousPairs = new Set(), // Set of "giverId:receiverId" strings
    } = constraints;

    const {
      maxAttempts = 1000,
      seed = Date.now(),
    } = options;

    // Validation
    this.validateInputs(participants, exclusions);

    // Try to generate valid assignment
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const assignments = this.tryGenerateAssignments(
          participants,
          exclusions,
          previousPairs,
          seed + attempt
        );

        if (assignments) {
          logger.info(`Assignments generated successfully on attempt ${attempt + 1}`);
          return assignments;
        }
      } catch (error) {
        // Continue to next attempt
        if (attempt === maxAttempts - 1) {
          throw new ValidationError(
            'Unable to generate valid Secret Santa assignments after maximum attempts. ' +
            'Please review exclusions and previous assignments.'
          );
        }
      }
    }

    throw new ValidationError('Failed to generate assignments');
  }

  /**
   * Validate inputs before generation
   */
  validateInputs(participants, exclusions) {
    if (!participants || participants.length < 3) {
      throw new ValidationError('At least 3 participants are required for Secret Santa');
    }

    // Check if graph is potentially impossible
    const graph = this.buildConstraintGraph(participants, exclusions);
    if (!this.isGraphValid(graph, participants.length)) {
      throw new ValidationError(
        'Assignment is mathematically impossible with current exclusions. ' +
        'Please remove some exclusions or add more participants.'
      );
    }
  }

  /**
   * Build constraint graph for validation
   */
  buildConstraintGraph(participants, exclusions) {
    const graph = new Map();

    for (const participant of participants) {
      const possibleReceivers = new Set(
        participants
          .filter(p => p.id !== participant.id) // No self
          .filter(p => !exclusions.get(participant.id)?.has(p.id)) // Not excluded
          .map(p => p.id)
      );

      graph.set(participant.id, possibleReceivers);
    }

    return graph;
  }

  /**
   * Check if graph has a valid Hamiltonian cycle
   * Basic check: each node must have at least 2 possible edges (in/out)
   */
  isGraphValid(graph, participantCount) {
    for (const [nodeId, possibleReceivers] of graph.entries()) {
      if (possibleReceivers.size === 0) {
        logger.error(`Participant ${nodeId} has no possible receivers`);
        return false;
      }

      // Count possible givers (who can give to this node)
      let possibleGivers = 0;
      for (const [otherId, receivers] of graph.entries()) {
        if (receivers.has(nodeId)) {
          possibleGivers++;
        }
      }

      if (possibleGivers === 0) {
        logger.error(`Participant ${nodeId} has no possible givers`);
        return false;
      }
    }

    return true;
  }

  /**
   * Attempt to generate assignments using cycle algorithm
   */
  tryGenerateAssignments(participants, exclusions, previousPairs, seed) {
    const shuffled = this.seededShuffle([...participants], seed);
    const assignments = [];
    const graph = this.buildConstraintGraph(participants, exclusions);

    // Build cycle using greedy approach with backtracking
    const visited = new Set();
    const path = [];

    const dfs = (currentId, depth) => {
      if (depth === participants.length) {
        // Check if we can close the cycle
        const possibleReceivers = graph.get(currentId);
        if (possibleReceivers.has(path[0])) {
          // Check if this was a previous pair
          const pairKey = `${currentId}:${path[0]}`;
          if (previousPairs.has(pairKey)) {
            // Try to avoid but accept if no other option
            return { success: true, avoidedPrevious: false };
          }
          return { success: true, avoidedPrevious: true };
        }
        return { success: false };
      }

      const possibleReceivers = Array.from(graph.get(currentId) || [])
        .filter(id => !visited.has(id));

      // Sort by preference: avoid previous pairs first
      possibleReceivers.sort((a, b) => {
        const aPrevious = previousPairs.has(`${currentId}:${a}`);
        const bPrevious = previousPairs.has(`${currentId}:${b}`);
        if (aPrevious && !bPrevious) return 1;
        if (!aPrevious && bPrevious) return -1;
        return 0;
      });

      for (const nextId of possibleReceivers) {
        visited.add(nextId);
        path.push(nextId);

        const result = dfs(nextId, depth + 1);
        if (result.success) {
          return result;
        }

        path.pop();
        visited.remove(nextId);
      }

      return { success: false };
    };

    // Start DFS from first shuffled participant
    const startId = shuffled[0].id;
    visited.add(startId);
    path.push(startId);

    const result = dfs(startId, 1);

    if (result.success) {
      // Build assignments from path
      for (let i = 0; i < path.length; i++) {
        const giverId = path[i];
        const receiverId = path[(i + 1) % path.length];

        assignments.push({
          giverId,
          receiverId
        });
      }

      return assignments;
    }

    return null;
  }

  /**
   * Seeded shuffle for deterministic randomization
   * Fisher-Yates shuffle with LCG pseudo-random number generator
   */
  seededShuffle(array, seed) {
    let currentSeed = seed;

    const random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * Validate generated assignments
   */
  validateAssignments(assignments, participants, exclusions) {
    const participantIds = new Set(participants.map(p => p.id));
    const givers = new Set();
    const receivers = new Set();

    for (const assignment of assignments) {
      const { giverId, receiverId } = assignment;

      // Check participants exist
      if (!participantIds.has(giverId) || !participantIds.has(receiverId)) {
        throw new ValidationError('Invalid participant in assignment');
      }

      // Check no self-assignment
      if (giverId === receiverId) {
        throw new ValidationError('Self-assignment detected');
      }

      // Check exclusions
      if (exclusions.get(giverId)?.has(receiverId)) {
        throw new ValidationError('Assignment violates exclusion rule');
      }

      // Track coverage
      givers.add(giverId);
      receivers.add(receiverId);
    }

    // Verify everyone gives and receives exactly once
    if (givers.size !== participants.length || receivers.size !== participants.length) {
      throw new ValidationError('Not all participants have assignments');
    }

    return true;
  }

  /**
   * Convert exclusions array to Map structure
   */
  buildExclusionsMap(exclusionsArray) {
    const map = new Map();

    for (const exclusion of exclusionsArray) {
      if (!map.has(exclusion.participant_id)) {
        map.set(exclusion.participant_id, new Set());
      }
      map.get(exclusion.participant_id).add(exclusion.excluded_participant_id);

      // Exclusions should be bidirectional for Secret Santa
      if (!map.has(exclusion.excluded_participant_id)) {
        map.set(exclusion.excluded_participant_id, new Set());
      }
      map.get(exclusion.excluded_participant_id).add(exclusion.participant_id);
    }

    return map;
  }

  /**
   * Build previous pairs Set from previous assignments
   */
  buildPreviousPairsSet(previousAssignments) {
    const set = new Set();

    for (const assignment of previousAssignments) {
      set.add(`${assignment.giver_id}:${assignment.receiver_id}`);
    }

    return set;
  }
}

module.exports = new AssignmentAlgorithm();

