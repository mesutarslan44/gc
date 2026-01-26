// Power-up types and configurations for Galaxy Conquest

export const POWER_UP_TYPES = {
    SHIELD: {
        id: 'shield',
        name: 'Kalkan',
        emoji: '🛡️',
        duration: 8000, // 8 seconds
        color: '#00d4ff',
        description: 'Gezegen saldırılardan korunur',
    },
    SPEED: {
        id: 'speed',
        name: 'Hız',
        emoji: '⚡',
        duration: 10000, // 10 seconds
        color: '#fbbf24',
        description: 'Gemiler 2x hızlı gider',
    },
    DOUBLE_ATTACK: {
        id: 'double',
        name: 'Çift Güç',
        emoji: '💥',
        duration: 6000, // 6 seconds
        color: '#ff6b6b',
        description: 'Saldırılar 2x güçlü',
    },
    RAPID_REGEN: {
        id: 'regen',
        name: 'Hızlı Üretim',
        emoji: '🚀',
        duration: 12000, // 12 seconds
        color: '#4ade80',
        description: 'Asker üretimi 3x hızlı',
    },
    BOMB: {
        id: 'bomb',
        name: 'Bomba',
        emoji: '💣',
        duration: 1000, // Instant effect
        color: '#ef4444',
        description: 'Düşman gezegenlerden 10 asker azalt',
        isInstant: true,
    },
    CLONE: {
        id: 'clone',
        name: 'Klonlama',
        emoji: '👥',
        duration: 1000, // Instant effect
        color: '#8b5cf6',
        description: 'Tüm gezegenlerinde askerleri 2x yap',
        isInstant: true,
    },
};

// Enemy types with different behaviors
export const ENEMY_TYPES = {
    SCOUT: {
        id: 'scout',
        name: 'İzci',
        emoji: '🛸',
        speedMultiplier: 2, // 2x faster
        attackMultiplier: 0.5, // Weak attack
        aiAggression: 0.8, // High aggression
        color: '#00ffff',
    },
    TANK: {
        id: 'tank',
        name: 'Tank',
        emoji: '🛡️',
        speedMultiplier: 0.5, // Slow
        attackMultiplier: 1.5, // Strong attack
        aiAggression: 0.4, // Defensive
        color: '#ff8800',
    },
    BOMBER: {
        id: 'bomber',
        name: 'Bombardıman',
        emoji: '💣',
        speedMultiplier: 0.7,
        attackMultiplier: 2, // Very strong
        aiAggression: 0.6,
        color: '#ff4444',
    },
    STANDARD: {
        id: 'standard',
        name: 'Standart',
        emoji: '👾',
        speedMultiplier: 1,
        attackMultiplier: 1,
        aiAggression: 0.5,
        color: '#ff6b6b',
    },
};

// Generate random power-up spawn
export const generatePowerUp = (gameAreaWidth, gameAreaHeight) => {
    const types = Object.values(POWER_UP_TYPES);
    const randomType = types[Math.floor(Math.random() * types.length)];

    return {
        id: `powerup-${Date.now()}`,
        type: randomType,
        x: Math.random() * (gameAreaWidth - 100) + 50,
        y: Math.random() * (gameAreaHeight - 200) + 100,
        collected: false,
        spawnTime: Date.now(),
    };
};

// Apply power-up effect
export const applyPowerUp = (powerUp, playerState) => {
    return {
        ...playerState,
        activePowerUps: [
            ...playerState.activePowerUps,
            {
                ...powerUp.type,
                startTime: Date.now(),
                expiresAt: Date.now() + powerUp.type.duration,
            },
        ],
    };
};

// Check if player has active power-up
export const hasActivePowerUp = (playerState, powerUpId) => {
    return playerState.activePowerUps.some(
        p => p.id === powerUpId && Date.now() < p.expiresAt
    );
};

// Clean expired power-ups
export const cleanExpiredPowerUps = (playerState) => {
    return {
        ...playerState,
        activePowerUps: playerState.activePowerUps.filter(
            p => Date.now() < p.expiresAt
        ),
    };
};
