// Game logic and AI for Galaxy Conquest

// Calculate combat result when ships arrive at a planet
export const calculateCombat = (attackingTroops, defendingTroops, attackerOwner, defenderOwner) => {
    if (defenderOwner === attackerOwner) {
        // Reinforcement - add troops
        return {
            newOwner: attackerOwner,
            remainingTroops: defendingTroops + attackingTroops,
        };
    } else {
        // Combat
        const result = defendingTroops - attackingTroops;
        if (result > 0) {
            // Defender wins
            return {
                newOwner: defenderOwner,
                remainingTroops: result,
            };
        } else if (result < 0) {
            // Attacker wins
            return {
                newOwner: attackerOwner,
                remainingTroops: Math.abs(result),
            };
        } else {
            // Draw - planet becomes neutral with 0 troops
            return {
                newOwner: 'neutral',
                remainingTroops: 1,
            };
        }
    }
};

// Troop regeneration rate per second
export const TROOP_REGEN_RATE = {
    player: 1,
    enemy: 1,
    neutral: 0,
};

// Calculate troops to send (half of current troops)
export const getTroopsToSend = (currentTroops) => {
    return Math.floor(currentTroops / 2);
};

// Calculate travel time based on distance
export const calculateTravelTime = (fromX, fromY, toX, toY) => {
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const baseTime = 1000; // 1 second minimum
    const speedFactor = 3; // pixels per millisecond
    return baseTime + (distance / speedFactor) * 100;
};

// AI decision making - Balanced AI that attacks regularly
// Supports Free-For-All mode where enemies fight each other
export const makeAIDecision = (planets, ownerToMove = 'enemy', freeForAll = false, allEnemyOwners = ['enemy']) => {
    // In FFA mode, each enemy has unique owner like 'enemy1', 'enemy2', etc.
    // In normal mode, all enemies share 'enemy' owner

    // Find planets owned by this specific AI with at least 5 troops
    const myPlanets = planets.filter(p => p.owner === ownerToMove && p.troops > 5);

    // Find target planets - in FFA mode, can attack other enemies too
    let targetPlanets;
    if (freeForAll) {
        // Attack anyone who isn't me (player, neutral, other enemies)
        targetPlanets = planets.filter(p => p.owner !== ownerToMove);
    } else {
        // Normal mode - only attack player and neutral
        targetPlanets = planets.filter(p => p.owner !== 'enemy');
    }

    if (myPlanets.length === 0 || targetPlanets.length === 0) return null;

    // Find best attacker (most troops)
    const attacker = myPlanets.reduce((best, p) => p.troops > best.troops ? p : best);

    // TARGET SELECTION - Different strategies for variety in FFA
    let target;
    if (freeForAll) {
        // Randomize target selection strategy for each AI
        const strategy = Math.random();

        if (strategy < 0.35) {
            // 35% - Attack NEAREST planet (geographic strategy)
            target = targetPlanets.reduce((nearest, p) => {
                const distToP = Math.sqrt(Math.pow(p.x - attacker.x, 2) + Math.pow(p.y - attacker.y, 2));
                const distToNearest = Math.sqrt(Math.pow(nearest.x - attacker.x, 2) + Math.pow(nearest.y - attacker.y, 2));
                return distToP < distToNearest ? p : nearest;
            });
        } else if (strategy < 0.65) {
            // 30% - Attack RANDOM planet (chaos strategy)
            target = targetPlanets[Math.floor(Math.random() * targetPlanets.length)];
        } else if (strategy < 0.85) {
            // 20% - Attack WEAKEST planet (classic strategy)
            target = targetPlanets.reduce((best, p) => p.troops < best.troops ? p : best);
        } else {
            // 15% - Attack PLAYER specifically if possible
            const playerPlanets = targetPlanets.filter(p => p.owner === 'player');
            if (playerPlanets.length > 0) {
                target = playerPlanets[Math.floor(Math.random() * playerPlanets.length)];
            } else {
                target = targetPlanets[Math.floor(Math.random() * targetPlanets.length)];
            }
        }
    } else {
        // Classic mode - always attack weakest
        target = targetPlanets.reduce((best, p) => p.troops < best.troops ? p : best);
    }

    // Calculate attack viability
    const troopsToSend = getTroopsToSend(attacker.troops);
    // In FFA mode, be more aggressive (lower threshold)
    const advantageThreshold = freeForAll ? 0.3 : 0.5;
    const hasAdvantage = troopsToSend > target.troops * advantageThreshold;
    const randomAggression = Math.random() < (freeForAll ? 0.5 : 0.25); // 2x more aggressive in FFA

    // Attack if has advantage OR random aggression with enough troops
    if (hasAdvantage || (randomAggression && attacker.troops > 8)) {
        return {
            from: attacker.id,
            to: target.id,
            troops: troopsToSend,
            owner: ownerToMove, // Track which AI made this decision
        };
    }

    return null;
};

// Make AI decisions for all enemy owners (used in FFA mode)
export const makeAllAIDecisions = (planets, freeForAll = false, enemyOwners = ['enemy']) => {
    const decisions = [];

    for (const owner of enemyOwners) {
        const decision = makeAIDecision(planets, owner, freeForAll, enemyOwners);
        if (decision) {
            decisions.push(decision);
        }
    }

    return decisions;
};

// Check win/lose conditions
export const checkGameState = (planets, freeForAll = false) => {
    // Don't check if planets not loaded yet
    if (!planets || planets.length === 0) return 'playing';

    const playerPlanets = planets.filter(p => p.owner === 'player').length;

    // In FFA, we check if player is the only one left among active factions (not neutral)
    if (freeForAll) {
        // Collect all active owners that are NOT neutral
        const activeOwners = new Set(planets.map(p => p.owner).filter(o => o !== 'neutral'));

        // If player has no planets, they lose
        if (playerPlanets === 0) return 'lose';

        // If player is the ONLY active owner left, they win
        if (activeOwners.size === 1 && activeOwners.has('player')) return 'win';

        // If player is still alive and there are other enemies, keep playing
        return 'playing';
    } else {
        // Classic mode logic
        const enemyPlanets = planets.filter(p => p.owner === 'enemy').length;
        if (playerPlanets === 0) return 'lose';
        if (enemyPlanets === 0) return 'win';
        return 'playing';
    }
};
