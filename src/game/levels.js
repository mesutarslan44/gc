// Level configurations for Galaxy Conquest
// 90 LEVELS - Phase-based progressive difficulty from tutorial to extreme
import { ENEMY_TYPES } from './powerUps';

// Phase-based difficulty configuration
const generateLevelConfig = (levelNum) => {
    let aiSpeed;
    let playerTroops;
    let enemyTroops;
    let difficultyMultiplier;

    if (levelNum <= 5) {
        // TUTORIAL: Learn the game - but still need to think
        const phase = (levelNum - 1) / 4;
        difficultyMultiplier = 0.12 + phase * 0.08; // 0.12 - 0.20
        aiSpeed = 9000 - phase * 1000; // 9000 - 8000
        playerTroops = 40 - phase * 2; // 40 - 38
        enemyTroops = 15 + phase * 5; // 15 - 20
    } else if (levelNum <= 20) {
        // LEARNING: Requires real strategy
        const phase = (levelNum - 6) / 14;
        difficultyMultiplier = 0.20 + phase * 0.15; // 0.20 - 0.35
        aiSpeed = 8000 - phase * 1500; // 8000 - 6500
        playerTroops = 38 - phase * 4; // 38 - 34
        enemyTroops = 20 + phase * 12; // 20 - 32
    } else if (levelNum <= 50) {
        // ADAPTATION: Gradual increase - core gameplay
        const phase = (levelNum - 21) / 29;
        difficultyMultiplier = 0.30 + phase * 0.25; // 0.30 - 0.55
        aiSpeed = 7000 - phase * 2200; // 7000 - 4800
        playerTroops = 46 - phase * 8; // 46 - 38
        enemyTroops = 22 + phase * 18; // 22 - 40
    } else if (levelNum <= 70) {
        // CHALLENGE: Real strategy needed
        const phase = (levelNum - 51) / 19;
        difficultyMultiplier = 0.55 + phase * 0.22; // 0.55 - 0.77
        aiSpeed = 4800 - phase * 1600; // 4800 - 3200
        playerTroops = 42 - phase * 4; // 42 - 38 (MORE troops)
        enemyTroops = 40 + phase * 22; // 40 - 62
    } else if (levelNum <= 80) {
        // MASTER: Challenging but fair
        const phase = (levelNum - 71) / 9;
        difficultyMultiplier = 0.77 + phase * 0.13; // 0.77 - 0.90
        aiSpeed = 3500 - phase * 700; // 3500 - 2800
        playerTroops = 45 - phase * 3; // 45 - 42 (MORE troops)
        enemyTroops = 55 + phase * 15; // 55 - 70
    } else {
        // EXTREME (81-90): Hard but beatable
        const phase = (levelNum - 81) / 9;
        difficultyMultiplier = 0.90 + phase * 0.10; // 0.90 - 1.00
        aiSpeed = 2800 - phase * 600; // 2800 - 2200
        playerTroops = 48 - phase * 3; // 48 - 45 (MUCH more troops)
        enemyTroops = 60 + phase * 20; // 60 - 80 (LESS enemies)
    }

    // SPIKE LEVELS: Add variety - every 7th and 13th level is harder
    const isSpike = levelNum > 10 && (levelNum % 7 === 0 || levelNum % 13 === 0);
    if (isSpike) {
        aiSpeed = Math.max(1500, aiSpeed - 600);
        enemyTroops = Math.round(enemyTroops * 1.25);
        playerTroops = Math.round(playerTroops * 0.9);
    }

    // Planet configuration based on difficulty
    const totalPlanets = Math.min(10, 3 + Math.floor(difficultyMultiplier * 7));
    const enemyCount = Math.min(4, 1 + Math.floor(difficultyMultiplier * 3.5));
    const neutralCount = Math.max(1, totalPlanets - 1 - enemyCount);

    // Power-ups: SCARCE early, but MORE for late levels
    // Early: 2 each, Mid: 1, Late (71+): 2
    let powerUpBase = Math.max(0, Math.floor(2 - difficultyMultiplier * 2));

    // Boost power-ups for levels 71+ (they need more help)
    if (levelNum >= 71) {
        powerUpBase += 1;
    }

    return {
        aiSpeed: Math.round(aiSpeed),
        playerTroops: Math.round(playerTroops),
        enemyTroops: Math.round(enemyTroops),
        totalPlanets,
        enemyCount,
        neutralCount,
        difficultyMultiplier,
        isSpike,
        powerUps: {
            shield: Math.max(1, powerUpBase + 1),  // 2-3 early, 1-2 late
            speed: powerUpBase + 1,                 // 2 early, 1-2 late
            double: Math.max(0, powerUpBase),       // 1-2 early, 0-1 late
            regen: powerUpBase + 1                  // 2 early, 1-2 late
        }
    };
};

// Planet positions - ALL moved up to avoid UI overlap (max y = 450)
const planetLayouts = [
    // Layout 1: Simple vertical
    [
        { x: 180, y: 420 }, { x: 180, y: 280 }, { x: 180, y: 140 },
        { x: 80, y: 220 }, { x: 280, y: 220 },
    ],
    // Layout 2: Diamond
    [
        { x: 180, y: 440 }, { x: 80, y: 300 }, { x: 280, y: 300 },
        { x: 180, y: 200 }, { x: 180, y: 100 },
    ],
    // Layout 3: Horizontal spread
    [
        { x: 60, y: 420 }, { x: 300, y: 420 }, { x: 180, y: 300 },
        { x: 100, y: 160 }, { x: 260, y: 160 },
    ],
    // Layout 4: Triangle
    [
        { x: 180, y: 440 }, { x: 80, y: 320 }, { x: 280, y: 320 },
        { x: 130, y: 180 }, { x: 230, y: 180 }, { x: 180, y: 100 },
    ],
    // Layout 5: Grid
    [
        { x: 100, y: 420 }, { x: 260, y: 420 }, { x: 180, y: 320 },
        { x: 80, y: 220 }, { x: 280, y: 220 }, { x: 180, y: 130 },
    ],
    // Layout 6: Wide spread
    [
        { x: 60, y: 440 }, { x: 300, y: 440 }, { x: 180, y: 340 },
        { x: 100, y: 240 }, { x: 260, y: 240 }, { x: 60, y: 140 }, { x: 300, y: 140 },
    ],
    // Layout 7: Circle
    [
        { x: 180, y: 420 }, { x: 80, y: 340 }, { x: 280, y: 340 },
        { x: 60, y: 220 }, { x: 300, y: 220 }, { x: 80, y: 120 }, { x: 280, y: 120 },
    ],
    // Layout 8: Complex
    [
        { x: 180, y: 450 }, { x: 60, y: 380 }, { x: 300, y: 380 },
        { x: 180, y: 300 }, { x: 80, y: 220 }, { x: 280, y: 220 },
        { x: 100, y: 120 }, { x: 260, y: 120 },
    ],
    // Layout 9: Cluster
    [
        { x: 120, y: 430 }, { x: 240, y: 430 }, { x: 180, y: 350 },
        { x: 100, y: 270 }, { x: 260, y: 270 }, { x: 180, y: 190 },
        { x: 120, y: 110 }, { x: 240, y: 110 },
    ],
    // Layout 10: Full spread
    [
        { x: 60, y: 450 }, { x: 300, y: 450 }, { x: 180, y: 380 },
        { x: 80, y: 300 }, { x: 280, y: 300 }, { x: 180, y: 230 },
        { x: 60, y: 160 }, { x: 180, y: 110 }, { x: 300, y: 160 },
    ],
];

// Level names in Turkish
const levelNames = [
    // 1-10: Tutorial/Başlangıç
    'İlk Adım', 'Keşif', 'Yeni Ufuklar', 'İkinci Şans', 'Stratejik Hamle',
    'Genişleme', 'Üçlü Yol', 'Kontrol Noktası', 'Sınır Hattı', '⭐ İlk Zafer',
    // 11-20: Kolay
    'Yeni Başlangıç', 'Çift Güç', 'Orta Koridor', 'Savunma Hattı', 'Hız Testi',
    'Kuzey Cephesi', 'Merkez Savaşı', 'Çember Taktik', 'Güney Geçidi', '⭐ Yükselen Güç',
    // 21-30: Orta-Kolay
    'İkinci Faz', 'Çapraz Atak', 'Merkez Kontrolü', 'Üçgen Savunma', 'Beşli Hamle',
    'Altılı Saldırı', 'Yedili Taktik', 'Sekizli Düzen', 'Dokuzlu Plan', '⭐ Orta Zafer',
    // 31-40: Orta
    'Yeni Zorluk', 'Çift Cephe', 'Hızlı Savaş', 'Ağır Savunma', 'Tank Saldırısı',
    'Bombardıman', 'Keşif Görevi', 'Çoklu Hedef', 'Karmaşık Plan', '⭐ Güçlü Zafer',
    // 41-50: Orta-Zor
    'Usta Seviye', 'Profesyonel', 'Uzman Hamlesi', 'Taktik Ustası', 'Strateji Dehası',
    'Altı Yıldız', 'Yedi Galaksi', 'Sekiz Gezegen', 'Dokuz Dünya', '⭐ Usta Zafer',
    // 51-60: Zor
    'Yeni Evren', 'Karanlık Bölge', 'Tehlikeli Sular', 'Bomba Yağmuru', 'Tank Ordusu',
    'Hız Şeytanı', 'Kaotik Savaş', 'On Düşman', 'On Bir Gezegen', '⭐ Büyük Zafer',
    // 61-70: Çok Zor
    'Efsane Başlangıç', 'Efsane Yolu', 'Efsane Savaşı', 'Efsane Taktik', 'Efsane Strateji',
    'On İki Düşman', 'On Üç Gezegen', 'Karanlık Lord', 'Gölge Savaşçı', '⭐ Efsane Zafer',
    // 71-80: Ultra Zor
    'Galaksi Savaşı', 'Evren Savunması', 'Kozmik Saldırı', 'Yıldız Patlaması', 'Nebula Savaşı',
    'Kara Delik', 'Süpernova', 'Galaksi Merkezi', 'Evren Sonu', '⭐ Kozmik Zafer',
    // 81-90: Ekstrem
    'Final Yolu', 'Final Hazırlık', 'Final Savaşı', 'Final Taktik', 'Final Strateji',
    'Son Sınav', 'Son Savaş', 'Son Hamle', 'Cehennem Kapısı', '⭐⭐ ULTIMATE: Galaksi Fatihi',
];

// Enemy types progression - harder enemies appear later
const getEnemyType = (levelNum) => {
    if (levelNum <= 15) return ENEMY_TYPES.STANDARD;
    if (levelNum <= 30) return levelNum % 3 === 0 ? ENEMY_TYPES.SCOUT : ENEMY_TYPES.STANDARD;
    if (levelNum <= 50) {
        const types = [ENEMY_TYPES.STANDARD, ENEMY_TYPES.SCOUT, ENEMY_TYPES.TANK];
        return types[levelNum % 3];
    }
    if (levelNum <= 70) {
        const types = [ENEMY_TYPES.STANDARD, ENEMY_TYPES.SCOUT, ENEMY_TYPES.TANK, ENEMY_TYPES.BOMBER];
        return types[levelNum % 4];
    }
    // 71-90: All types with more bombers and tanks
    const types = [ENEMY_TYPES.TANK, ENEMY_TYPES.BOMBER, ENEMY_TYPES.SCOUT, ENEMY_TYPES.TANK, ENEMY_TYPES.BOMBER];
    return types[levelNum % 5];
};

// Boss strength scales with phases - REDUCED for extreme levels
const getBossStrength = (levelNum) => {
    if (levelNum <= 20) return Math.round(30 + (levelNum / 20) * 25); // 30-55
    if (levelNum <= 50) return Math.round(60 + ((levelNum - 20) / 30) * 50); // 60-110
    if (levelNum <= 80) return Math.round(100 + ((levelNum - 50) / 30) * 50); // 100-150 (REDUCED)
    return Math.round(150 + ((levelNum - 80) / 10) * 70); // 150-220 (MUCH REDUCED from 200-300)
};

// Generate all 90 levels
export const LEVELS = [];

// Minimum distance between planet centers to prevent overlap
const MIN_PLANET_DISTANCE = 90;

// Check if a position is safe (not overlapping with existing planets)
const isPositionSafe = (x, y, existingPlanets, minDist = MIN_PLANET_DISTANCE) => {
    for (const planet of existingPlanets) {
        const dx = planet.x - x;
        const dy = planet.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDist) return false;
    }
    return true;
};

// Find a safe position near the original, or return adjusted position
const findSafePosition = (originalX, originalY, existingPlanets, minDist = MIN_PLANET_DISTANCE) => {
    // If original is safe, use it
    if (isPositionSafe(originalX, originalY, existingPlanets, minDist)) {
        return { x: originalX, y: originalY };
    }

    // Try nearby positions in a spiral pattern
    const offsets = [
        [0, -50], [50, 0], [0, 50], [-50, 0],
        [40, -40], [40, 40], [-40, 40], [-40, -40],
        [0, -80], [80, 0], [0, 80], [-80, 0],
    ];

    for (const [dx, dy] of offsets) {
        const newX = Math.max(40, Math.min(320, originalX + dx));
        const newY = Math.max(80, Math.min(550, originalY + dy));
        if (isPositionSafe(newX, newY, existingPlanets, minDist)) {
            return { x: newX, y: newY };
        }
    }

    // Fallback - find any safe spot
    for (let attempts = 0; attempts < 20; attempts++) {
        const x = 60 + Math.random() * 240;
        const y = 100 + Math.random() * 400;
        if (isPositionSafe(x, y, existingPlanets, minDist)) {
            return { x, y };
        }
    }

    return { x: originalX, y: originalY }; // Last resort
};

for (let i = 1; i <= 90; i++) {
    const config = generateLevelConfig(i);
    const layoutIndex = (i - 1) % planetLayouts.length;
    const positions = [...planetLayouts[layoutIndex]]; // Clone to avoid mutation
    const isBoss = i % 10 === 0;

    const planets = [];
    let posIdx = 0;

    // BOSS LEVELS: Reserve top center area for boss
    // Remove any positions that would conflict with boss
    if (isBoss) {
        const bossX = 180;
        const bossY = i < 50 ? 120 : 80;
        // Filter out positions too close to boss area
        const safePositions = positions.filter(pos => {
            const dx = pos.x - bossX;
            const dy = pos.y - bossY;
            return Math.sqrt(dx * dx + dy * dy) > 100;
        });
        positions.length = 0;
        positions.push(...safePositions);
    }

    // Player planet(s) - 2 planets after level 50 for balance
    const playerCount = i >= 50 ? 2 : 1;
    for (let p = 0; p < playerCount; p++) {
        let pos = positions[posIdx++] || { x: 60 + p * 240, y: 400 };
        pos = findSafePosition(pos.x, pos.y, planets);
        planets.push({
            id: `p${planets.length + 1}`,
            x: pos.x,
            y: pos.y,
            troops: config.playerTroops + (isBoss ? 15 : 0),
            owner: 'player',
            size: Math.round((40 + Math.floor(config.playerTroops / 15)) * 0.85) // Slightly larger
        });
    }

    // Neutral planets - scale slowly
    for (let n = 0; n < config.neutralCount && posIdx < positions.length; n++) {
        let pos = positions[posIdx++];
        pos = findSafePosition(pos.x, pos.y, planets);
        const neutralTroops = i <= 5 ? 3 : Math.round(4 + Math.pow((i - 5) / 85, 0.6) * 14);
        planets.push({
            id: `p${planets.length + 1}`,
            x: pos.x,
            y: pos.y,
            troops: neutralTroops,
            owner: 'neutral',
            size: Math.round((28 + Math.floor(i / 15)) * 0.85) // Slightly larger
        });
    }

    // Enemy planets
    for (let e = 0; e < config.enemyCount && posIdx < positions.length; e++) {
        let pos = positions[posIdx++];
        pos = findSafePosition(pos.x, pos.y, planets);
        const enemyMultiplier = 0.75 + e * 0.15;
        planets.push({
            id: `p${planets.length + 1}`,
            x: pos.x,
            y: pos.y,
            troops: Math.round(config.enemyTroops * enemyMultiplier),
            owner: 'enemy',
            size: Math.round((35 + Math.floor(config.enemyTroops / 8)) * 0.85) // Slightly larger
        });
    }

    // Boss planet for every 10th level - SAFE POSITION
    if (isBoss) {
        const bossStrength = getBossStrength(i);
        const bossX = 180;
        const bossY = i < 50 ? 100 : 80;
        // Double-check boss doesn't overlap
        const safeBossPos = findSafePosition(bossX, bossY, planets, 80);
        planets.push({
            id: 'boss',
            x: safeBossPos.x,
            y: safeBossPos.y,
            troops: bossStrength,
            owner: 'enemy',
            size: Math.round((55 + Math.floor(bossStrength / 15)) * 0.75), // Boss slightly larger but still reduced
            isBoss: true
        });
    }

    // Difficulty label
    let difficulty;
    if (i <= 5) difficulty = 'tutorial';
    else if (i <= 20) difficulty = 'easy';
    else if (i <= 50) difficulty = 'medium';
    else if (i <= 70) difficulty = 'hard';
    else if (i <= 80) difficulty = 'expert';
    else difficulty = 'extreme';

    LEVELS.push({
        id: i,
        name: levelNames[i - 1] || `Bölüm ${i}`,
        difficulty,
        isBossLevel: isBoss,
        isSpike: config.isSpike,
        planets,
        aiSpeed: config.aiSpeed,
        enemyType: getEnemyType(i),
        powerUpInventory: config.powerUps
    });
}

export const getLevelById = (id) => LEVELS.find(l => l.id === id);
export const getTotalLevels = () => LEVELS.length;
export const getBossLevels = () => LEVELS.filter(l => l.isBossLevel);
