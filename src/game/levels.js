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

// Planet positions - ilk fazda Little Wars hissi icin daha temiz koridorlar,
// daha net orta alanlar ve daha belirgin alt/ust hakimiyeti kuruyoruz.
const planetLayouts = [
    // Layout 1: Tek koridor
    [
        { x: 180, y: 500 }, { x: 180, y: 345 }, { x: 180, y: 150 },
        { x: 104, y: 255 }, { x: 256, y: 255 },
    ],
    // Layout 2: Elmas koridor
    [
        { x: 180, y: 504 }, { x: 98, y: 360 }, { x: 262, y: 360 },
        { x: 180, y: 245 }, { x: 180, y: 110 },
    ],
    // Layout 3: Genis acilis
    [
        { x: 80, y: 500 }, { x: 280, y: 500 }, { x: 180, y: 360 },
        { x: 108, y: 182 }, { x: 252, y: 182 },
    ],
    // Layout 4: Ucgen baski
    [
        { x: 180, y: 506 }, { x: 86, y: 372 }, { x: 274, y: 372 },
        { x: 132, y: 220 }, { x: 228, y: 220 }, { x: 180, y: 104 },
    ],
    // Layout 5: Kare agi
    [
        { x: 102, y: 498 }, { x: 258, y: 498 }, { x: 180, y: 370 },
        { x: 92, y: 238 }, { x: 268, y: 238 }, { x: 180, y: 118 },
    ],
    // Layout 6: Cift kanat
    [
        { x: 72, y: 504 }, { x: 288, y: 504 }, { x: 180, y: 388 },
        { x: 106, y: 260 }, { x: 254, y: 260 }, { x: 86, y: 126 }, { x: 274, y: 126 },
    ],
    // Layout 7: Yay formu
    [
        { x: 180, y: 500 }, { x: 92, y: 386 }, { x: 268, y: 386 },
        { x: 70, y: 248 }, { x: 290, y: 248 }, { x: 102, y: 120 }, { x: 258, y: 120 },
    ],
    // Layout 8: Derin baski
    [
        { x: 180, y: 510 }, { x: 74, y: 410 }, { x: 286, y: 410 },
        { x: 180, y: 306 }, { x: 98, y: 212 }, { x: 262, y: 212 },
        { x: 112, y: 112 }, { x: 248, y: 112 },
    ],
    // Layout 9: Orta yumak
    [
        { x: 124, y: 498 }, { x: 236, y: 498 }, { x: 180, y: 392 },
        { x: 108, y: 280 }, { x: 252, y: 280 }, { x: 180, y: 182 },
        { x: 124, y: 104 }, { x: 236, y: 104 },
    ],
    // Layout 10: Tam yayilim
    [
        { x: 70, y: 510 }, { x: 290, y: 510 }, { x: 180, y: 410 },
        { x: 92, y: 314 }, { x: 268, y: 314 }, { x: 180, y: 226 },
        { x: 76, y: 128 }, { x: 180, y: 96 }, { x: 284, y: 128 },
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
const MIN_PLANET_DISTANCE = 108;

const getLevelSpacing = (levelNum) => {
    if (levelNum <= 10) return 128;
    if (levelNum <= 20) return 120;
    if (levelNum <= 50) return 112;
    return MIN_PLANET_DISTANCE;
};

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
        const newX = Math.max(54, Math.min(306, originalX + dx));
        const newY = Math.max(96, Math.min(520, originalY + dy));
        if (isPositionSafe(newX, newY, existingPlanets, minDist)) {
            return { x: newX, y: newY };
        }
    }

    // Fallback - find any safe spot
    for (let attempts = 0; attempts < 20; attempts++) {
        const x = 68 + Math.random() * 224;
        const y = 112 + Math.random() * 384;
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
    const levelSpacing = getLevelSpacing(i);

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
            return Math.sqrt(dx * dx + dy * dy) > levelSpacing - 8;
        });
        positions.length = 0;
        positions.push(...safePositions);
    }

    // Player planet(s) - 2 planets after level 50 for balance
    const playerCount = i >= 50 ? 2 : 1;
    for (let p = 0; p < playerCount; p++) {
        let pos = positions[posIdx++] || { x: 60 + p * 240, y: 400 };
        pos = findSafePosition(pos.x, pos.y, planets, levelSpacing);
        planets.push({
            id: `p${planets.length + 1}`,
            x: pos.x,
            y: pos.y,
            troops: config.playerTroops + (isBoss ? 15 : 0),
            owner: 'player',
            size: i <= 20
                ? Math.round((40 + Math.floor(config.playerTroops / 16)) * 0.82)
                : Math.round((40 + Math.floor(config.playerTroops / 15)) * 0.85)
        });
    }

    // Neutral planets - scale slowly
    for (let n = 0; n < config.neutralCount && posIdx < positions.length; n++) {
        let pos = positions[posIdx++];
        pos = findSafePosition(pos.x, pos.y, planets, levelSpacing);
        const neutralTroops = i <= 5 ? 3 : Math.round(4 + Math.pow((i - 5) / 85, 0.6) * 14);
        planets.push({
            id: `p${planets.length + 1}`,
            x: pos.x,
            y: pos.y,
            troops: neutralTroops,
            owner: 'neutral',
            size: i <= 20
                ? Math.round((28 + Math.floor(i / 18)) * 0.8)
                : Math.round((28 + Math.floor(i / 15)) * 0.85)
        });
    }

    // Enemy planets
    for (let e = 0; e < config.enemyCount && posIdx < positions.length; e++) {
        let pos = positions[posIdx++];
        pos = findSafePosition(pos.x, pos.y, planets, levelSpacing);
        const enemyMultiplier = 0.75 + e * 0.15;
        planets.push({
            id: `p${planets.length + 1}`,
            x: pos.x,
            y: pos.y,
            troops: Math.round(config.enemyTroops * enemyMultiplier),
            owner: 'enemy',
            size: i <= 20
                ? Math.round((35 + Math.floor(config.enemyTroops / 10)) * 0.82)
                : Math.round((35 + Math.floor(config.enemyTroops / 8)) * 0.85)
        });
    }

    // Boss planet for every 10th level - SAFE POSITION
    if (isBoss) {
        const bossStrength = getBossStrength(i);
        const bossX = 180;
        const bossY = i < 50 ? 100 : 80;
        // Double-check boss doesn't overlap
        const safeBossPos = findSafePosition(bossX, bossY, planets, Math.max(90, levelSpacing - 12));
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

const EARLY_LEVEL_OVERRIDES = [
    {
        id: 1,
        planets: [
            { id: 'p1', x: 180, y: 508, troops: 40, owner: 'player', size: 33 },
            { id: 'p2', x: 180, y: 320, troops: 8, owner: 'neutral', size: 25 },
            { id: 'p3', x: 180, y: 122, troops: 15, owner: 'enemy', size: 30 },
        ],
    },
    {
        id: 2,
        planets: [
            { id: 'p1', x: 180, y: 510, troops: 39, owner: 'player', size: 33 },
            { id: 'p2', x: 112, y: 330, troops: 7, owner: 'neutral', size: 24 },
            { id: 'p3', x: 248, y: 330, troops: 7, owner: 'neutral', size: 24 },
            { id: 'p4', x: 180, y: 118, troops: 17, owner: 'enemy', size: 30 },
        ],
    },
    {
        id: 3,
        planets: [
            { id: 'p1', x: 96, y: 510, troops: 38, owner: 'player', size: 33 },
            { id: 'p2', x: 264, y: 510, troops: 34, owner: 'neutral', size: 31 },
            { id: 'p3', x: 180, y: 352, troops: 10, owner: 'neutral', size: 25 },
            { id: 'p4', x: 180, y: 120, troops: 18, owner: 'enemy', size: 30 },
        ],
    },
    {
        id: 4,
        planets: [
            { id: 'p1', x: 180, y: 514, troops: 38, owner: 'player', size: 33 },
            { id: 'p2', x: 108, y: 382, troops: 9, owner: 'neutral', size: 25 },
            { id: 'p3', x: 252, y: 382, troops: 9, owner: 'neutral', size: 25 },
            { id: 'p4', x: 180, y: 270, troops: 12, owner: 'neutral', size: 26 },
            { id: 'p5', x: 180, y: 118, troops: 19, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 5,
        planets: [
            { id: 'p1', x: 90, y: 510, troops: 38, owner: 'player', size: 33 },
            { id: 'p2', x: 270, y: 510, troops: 14, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 398, troops: 10, owner: 'neutral', size: 25 },
            { id: 'p4', x: 108, y: 232, troops: 12, owner: 'neutral', size: 26 },
            { id: 'p5', x: 252, y: 232, troops: 12, owner: 'neutral', size: 26 },
            { id: 'p6', x: 180, y: 112, troops: 20, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 6,
        planets: [
            { id: 'p1', x: 180, y: 514, troops: 37, owner: 'player', size: 33 },
            { id: 'p2', x: 92, y: 390, troops: 9, owner: 'neutral', size: 24 },
            { id: 'p3', x: 268, y: 390, troops: 9, owner: 'neutral', size: 24 },
            { id: 'p4', x: 180, y: 322, troops: 15, owner: 'neutral', size: 28 },
            { id: 'p5', x: 126, y: 186, troops: 14, owner: 'neutral', size: 27 },
            { id: 'p6', x: 234, y: 186, troops: 14, owner: 'enemy', size: 30 },
            { id: 'p7', x: 180, y: 96, troops: 21, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 7,
        planets: [
            { id: 'p1', x: 78, y: 512, troops: 36, owner: 'player', size: 33 },
            { id: 'p2', x: 282, y: 512, troops: 18, owner: 'neutral', size: 29 },
            { id: 'p3', x: 180, y: 412, troops: 12, owner: 'neutral', size: 26 },
            { id: 'p4', x: 92, y: 286, troops: 10, owner: 'neutral', size: 24 },
            { id: 'p5', x: 268, y: 286, troops: 16, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 186, troops: 15, owner: 'neutral', size: 27 },
            { id: 'p7', x: 180, y: 92, troops: 23, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 8,
        planets: [
            { id: 'p1', x: 180, y: 514, troops: 36, owner: 'player', size: 33 },
            { id: 'p2', x: 110, y: 426, troops: 11, owner: 'neutral', size: 25 },
            { id: 'p3', x: 250, y: 426, troops: 11, owner: 'neutral', size: 25 },
            { id: 'p4', x: 180, y: 332, troops: 14, owner: 'neutral', size: 27 },
            { id: 'p5', x: 96, y: 224, troops: 11, owner: 'neutral', size: 25 },
            { id: 'p6', x: 264, y: 224, troops: 17, owner: 'enemy', size: 29 },
            { id: 'p7', x: 124, y: 108, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p8', x: 236, y: 108, troops: 24, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 9,
        planets: [
            { id: 'p1', x: 124, y: 512, troops: 35, owner: 'player', size: 32 },
            { id: 'p2', x: 236, y: 512, troops: 18, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 412, troops: 13, owner: 'neutral', size: 26 },
            { id: 'p4', x: 104, y: 302, troops: 12, owner: 'neutral', size: 25 },
            { id: 'p5', x: 256, y: 302, troops: 17, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 208, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p7', x: 118, y: 96, troops: 13, owner: 'neutral', size: 25 },
            { id: 'p8', x: 242, y: 96, troops: 24, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 10,
        planets: [
            { id: 'p1', x: 88, y: 514, troops: 48, owner: 'player', size: 35 },
            { id: 'p2', x: 270, y: 514, troops: 28, owner: 'player', size: 33 },
            { id: 'p3', x: 180, y: 420, troops: 16, owner: 'neutral', size: 28 },
            { id: 'p4', x: 104, y: 300, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p5', x: 256, y: 300, troops: 16, owner: 'neutral', size: 27 },
            { id: 'p6', x: 180, y: 198, troops: 18, owner: 'neutral', size: 28 },
            { id: 'boss', x: 180, y: 82, troops: 55, owner: 'enemy', size: 42, isBoss: true },
        ],
        isBossLevel: true,
    },
    {
        id: 11,
        planets: [
            { id: 'p1', x: 180, y: 512, troops: 36, owner: 'player', size: 32 },
            { id: 'p2', x: 92, y: 410, troops: 10, owner: 'neutral', size: 24 },
            { id: 'p3', x: 268, y: 410, troops: 10, owner: 'neutral', size: 24 },
            { id: 'p4', x: 180, y: 338, troops: 18, owner: 'neutral', size: 28 },
            { id: 'p5', x: 92, y: 218, troops: 13, owner: 'neutral', size: 25 },
            { id: 'p6', x: 268, y: 218, troops: 20, owner: 'enemy', size: 29 },
            { id: 'p7', x: 180, y: 108, troops: 26, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 12,
        planets: [
            { id: 'p1', x: 92, y: 512, troops: 35, owner: 'player', size: 32 },
            { id: 'p2', x: 268, y: 512, troops: 19, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 430, troops: 12, owner: 'neutral', size: 25 },
            { id: 'p4', x: 120, y: 316, troops: 12, owner: 'neutral', size: 25 },
            { id: 'p5', x: 240, y: 316, troops: 16, owner: 'enemy', size: 28 },
            { id: 'p6', x: 92, y: 178, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p7', x: 268, y: 178, troops: 20, owner: 'enemy', size: 29 },
            { id: 'p8', x: 180, y: 92, troops: 27, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 13,
        planets: [
            { id: 'p1', x: 180, y: 512, troops: 34, owner: 'player', size: 32 },
            { id: 'p2', x: 86, y: 392, troops: 10, owner: 'neutral', size: 24 },
            { id: 'p3', x: 274, y: 392, troops: 10, owner: 'neutral', size: 24 },
            { id: 'p4', x: 180, y: 304, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p5', x: 100, y: 208, troops: 13, owner: 'neutral', size: 25 },
            { id: 'p6', x: 260, y: 208, troops: 18, owner: 'enemy', size: 28 },
            { id: 'p7', x: 124, y: 96, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p8', x: 236, y: 96, troops: 28, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 14,
        planets: [
            { id: 'p1', x: 80, y: 514, troops: 34, owner: 'player', size: 32 },
            { id: 'p2', x: 280, y: 514, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 430, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p4', x: 96, y: 330, troops: 13, owner: 'neutral', size: 25 },
            { id: 'p5', x: 264, y: 330, troops: 18, owner: 'enemy', size: 28 },
            { id: 'p6', x: 180, y: 240, troops: 17, owner: 'neutral', size: 27 },
            { id: 'p7', x: 96, y: 120, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p8', x: 264, y: 120, troops: 29, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 15,
        planets: [
            { id: 'p1', x: 180, y: 514, troops: 34, owner: 'player', size: 32 },
            { id: 'p2', x: 108, y: 428, troops: 12, owner: 'neutral', size: 25 },
            { id: 'p3', x: 252, y: 428, troops: 12, owner: 'neutral', size: 25 },
            { id: 'p4', x: 180, y: 350, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p5', x: 84, y: 244, troops: 14, owner: 'neutral', size: 25 },
            { id: 'p6', x: 276, y: 244, troops: 18, owner: 'enemy', size: 28 },
            { id: 'p7', x: 122, y: 118, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p8', x: 238, y: 118, troops: 30, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 16,
        planets: [
            { id: 'p1', x: 92, y: 514, troops: 34, owner: 'player', size: 32 },
            { id: 'p2', x: 268, y: 514, troops: 16, owner: 'neutral', size: 27 },
            { id: 'p3', x: 180, y: 432, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p4', x: 104, y: 332, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p5', x: 256, y: 332, troops: 18, owner: 'enemy', size: 28 },
            { id: 'p6', x: 180, y: 250, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p7', x: 104, y: 126, troops: 15, owner: 'neutral', size: 26 },
            { id: 'p8', x: 256, y: 126, troops: 31, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 17,
        planets: [
            { id: 'p1', x: 180, y: 516, troops: 33, owner: 'player', size: 32 },
            { id: 'p2', x: 86, y: 418, troops: 12, owner: 'neutral', size: 25 },
            { id: 'p3', x: 274, y: 418, troops: 12, owner: 'neutral', size: 25 },
            { id: 'p4', x: 180, y: 362, troops: 22, owner: 'neutral', size: 29 },
            { id: 'p5', x: 94, y: 250, troops: 15, owner: 'neutral', size: 26 },
            { id: 'p6', x: 266, y: 250, troops: 19, owner: 'enemy', size: 28 },
            { id: 'p7', x: 128, y: 124, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p8', x: 232, y: 124, troops: 31, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 18,
        planets: [
            { id: 'p1', x: 80, y: 516, troops: 33, owner: 'player', size: 32 },
            { id: 'p2', x: 280, y: 516, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 438, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p4', x: 112, y: 350, troops: 14, owner: 'neutral', size: 25 },
            { id: 'p5', x: 248, y: 350, troops: 20, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 276, troops: 22, owner: 'neutral', size: 29 },
            { id: 'p7', x: 92, y: 154, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p8', x: 268, y: 154, troops: 22, owner: 'enemy', size: 29 },
            { id: 'p9', x: 180, y: 92, troops: 32, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 19,
        planets: [
            { id: 'p1', x: 118, y: 516, troops: 33, owner: 'player', size: 32 },
            { id: 'p2', x: 242, y: 516, troops: 19, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 438, troops: 17, owner: 'neutral', size: 26 },
            { id: 'p4', x: 102, y: 338, troops: 14, owner: 'neutral', size: 25 },
            { id: 'p5', x: 258, y: 338, troops: 21, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 262, troops: 23, owner: 'neutral', size: 29 },
            { id: 'p7', x: 104, y: 150, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p8', x: 256, y: 150, troops: 24, owner: 'enemy', size: 29 },
            { id: 'p9', x: 180, y: 90, troops: 33, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 20,
        planets: [
            { id: 'p1', x: 88, y: 516, troops: 44, owner: 'player', size: 34 },
            { id: 'p2', x: 272, y: 516, troops: 26, owner: 'player', size: 32 },
            { id: 'p3', x: 180, y: 438, troops: 20, owner: 'neutral', size: 29 },
            { id: 'p4', x: 100, y: 330, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p5', x: 260, y: 330, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p6', x: 180, y: 246, troops: 24, owner: 'neutral', size: 29 },
            { id: 'p7', x: 112, y: 142, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p8', x: 248, y: 142, troops: 24, owner: 'enemy', size: 29 },
            { id: 'boss', x: 180, y: 76, troops: 66, owner: 'enemy', size: 44, isBoss: true },
        ],
        isBossLevel: true,
    },
    {
        id: 21,
        planets: [
            { id: 'p1', x: 180, y: 516, troops: 33, owner: 'player', size: 32 },
            { id: 'p2', x: 92, y: 430, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p3', x: 268, y: 430, troops: 14, owner: 'neutral', size: 26 },
            { id: 'p4', x: 180, y: 362, troops: 24, owner: 'neutral', size: 29 },
            { id: 'p5', x: 92, y: 258, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p6', x: 268, y: 258, troops: 21, owner: 'enemy', size: 29 },
            { id: 'p7', x: 126, y: 130, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p8', x: 234, y: 130, troops: 32, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 22,
        planets: [
            { id: 'p1', x: 92, y: 516, troops: 33, owner: 'player', size: 32 },
            { id: 'p2', x: 268, y: 516, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 446, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p4', x: 118, y: 354, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p5', x: 242, y: 354, troops: 22, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 274, troops: 25, owner: 'neutral', size: 29 },
            { id: 'p7', x: 96, y: 156, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p8', x: 264, y: 156, troops: 24, owner: 'enemy', size: 29 },
            { id: 'p9', x: 180, y: 92, troops: 34, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 23,
        planets: [
            { id: 'p1', x: 180, y: 518, troops: 32, owner: 'player', size: 32 },
            { id: 'p2', x: 78, y: 430, troops: 15, owner: 'neutral', size: 26 },
            { id: 'p3', x: 282, y: 430, troops: 15, owner: 'neutral', size: 26 },
            { id: 'p4', x: 180, y: 372, troops: 26, owner: 'neutral', size: 30 },
            { id: 'p5', x: 90, y: 276, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p6', x: 270, y: 276, troops: 22, owner: 'enemy', size: 29 },
            { id: 'p7', x: 118, y: 150, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p8', x: 242, y: 150, troops: 26, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 92, troops: 35, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 24,
        planets: [
            { id: 'p1', x: 82, y: 518, troops: 32, owner: 'player', size: 32 },
            { id: 'p2', x: 278, y: 518, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 452, troops: 19, owner: 'neutral', size: 27 },
            { id: 'p4', x: 104, y: 360, troops: 17, owner: 'neutral', size: 26 },
            { id: 'p5', x: 256, y: 360, troops: 23, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 286, troops: 26, owner: 'neutral', size: 30 },
            { id: 'p7', x: 94, y: 170, troops: 19, owner: 'neutral', size: 27 },
            { id: 'p8', x: 266, y: 170, troops: 25, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 96, troops: 36, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 25,
        planets: [
            { id: 'p1', x: 180, y: 518, troops: 32, owner: 'player', size: 32 },
            { id: 'p2', x: 102, y: 444, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p3', x: 258, y: 444, troops: 16, owner: 'neutral', size: 26 },
            { id: 'p4', x: 180, y: 378, troops: 28, owner: 'neutral', size: 30 },
            { id: 'p5', x: 88, y: 286, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p6', x: 272, y: 286, troops: 24, owner: 'enemy', size: 29 },
            { id: 'p7', x: 120, y: 164, troops: 21, owner: 'neutral', size: 28 },
            { id: 'p8', x: 240, y: 164, troops: 27, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 96, troops: 36, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 26,
        planets: [
            { id: 'p1', x: 84, y: 520, troops: 32, owner: 'player', size: 32 },
            { id: 'p2', x: 276, y: 520, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 456, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p4', x: 100, y: 370, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p5', x: 260, y: 370, troops: 24, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 296, troops: 28, owner: 'neutral', size: 30 },
            { id: 'p7', x: 92, y: 188, troops: 20, owner: 'neutral', size: 27 },
            { id: 'p8', x: 268, y: 188, troops: 27, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 100, troops: 37, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 27,
        planets: [
            { id: 'p1', x: 180, y: 520, troops: 31, owner: 'player', size: 32 },
            { id: 'p2', x: 94, y: 448, troops: 17, owner: 'neutral', size: 26 },
            { id: 'p3', x: 266, y: 448, troops: 17, owner: 'neutral', size: 26 },
            { id: 'p4', x: 180, y: 392, troops: 30, owner: 'neutral', size: 30 },
            { id: 'p5', x: 88, y: 300, troops: 19, owner: 'neutral', size: 27 },
            { id: 'p6', x: 272, y: 300, troops: 25, owner: 'enemy', size: 29 },
            { id: 'p7', x: 122, y: 178, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p8', x: 238, y: 178, troops: 28, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 108, troops: 38, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 28,
        planets: [
            { id: 'p1', x: 96, y: 520, troops: 31, owner: 'player', size: 32 },
            { id: 'p2', x: 264, y: 520, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 464, troops: 20, owner: 'neutral', size: 27 },
            { id: 'p4', x: 118, y: 378, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p5', x: 242, y: 378, troops: 26, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 314, troops: 30, owner: 'neutral', size: 30 },
            { id: 'p7', x: 94, y: 214, troops: 21, owner: 'neutral', size: 28 },
            { id: 'p8', x: 266, y: 214, troops: 28, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 138, troops: 26, owner: 'neutral', size: 28 },
            { id: 'p10', x: 180, y: 86, troops: 39, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 29,
        planets: [
            { id: 'p1', x: 180, y: 522, troops: 30, owner: 'player', size: 32 },
            { id: 'p2', x: 76, y: 450, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p3', x: 284, y: 450, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p4', x: 180, y: 402, troops: 31, owner: 'neutral', size: 30 },
            { id: 'p5', x: 90, y: 316, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p6', x: 270, y: 316, troops: 26, owner: 'enemy', size: 29 },
            { id: 'p7', x: 120, y: 206, troops: 23, owner: 'neutral', size: 28 },
            { id: 'p8', x: 240, y: 206, troops: 30, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 130, troops: 28, owner: 'neutral', size: 28 },
            { id: 'p10', x: 180, y: 84, troops: 40, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 30,
        planets: [
            { id: 'p1', x: 96, y: 522, troops: 42, owner: 'player', size: 34 },
            { id: 'p2', x: 264, y: 522, troops: 28, owner: 'player', size: 32 },
            { id: 'p3', x: 180, y: 450, troops: 22, owner: 'neutral', size: 29 },
            { id: 'p4', x: 100, y: 344, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p5', x: 260, y: 344, troops: 24, owner: 'neutral', size: 29 },
            { id: 'p6', x: 180, y: 268, troops: 30, owner: 'neutral', size: 31 },
            { id: 'p7', x: 112, y: 164, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p8', x: 248, y: 164, troops: 28, owner: 'enemy', size: 30 },
            { id: 'boss', x: 180, y: 78, troops: 74, owner: 'enemy', size: 45, isBoss: true },
        ],
        isBossLevel: true,
    },
    {
        id: 31,
        planets: [
            { id: 'p1', x: 180, y: 522, troops: 30, owner: 'player', size: 32 },
            { id: 'p2', x: 90, y: 454, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p3', x: 270, y: 454, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p4', x: 180, y: 404, troops: 32, owner: 'neutral', size: 31 },
            { id: 'p5', x: 88, y: 320, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p6', x: 272, y: 320, troops: 26, owner: 'enemy', size: 29 },
            { id: 'p7', x: 120, y: 212, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p8', x: 240, y: 212, troops: 30, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 132, troops: 30, owner: 'neutral', size: 29 },
            { id: 'p10', x: 180, y: 84, troops: 40, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 32,
        planets: [
            { id: 'p1', x: 82, y: 522, troops: 30, owner: 'player', size: 32 },
            { id: 'p2', x: 278, y: 522, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 462, troops: 22, owner: 'neutral', size: 29 },
            { id: 'p4', x: 104, y: 376, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p5', x: 256, y: 376, troops: 27, owner: 'enemy', size: 29 },
            { id: 'p6', x: 180, y: 306, troops: 32, owner: 'neutral', size: 31 },
            { id: 'p7', x: 96, y: 214, troops: 23, owner: 'neutral', size: 28 },
            { id: 'p8', x: 264, y: 214, troops: 29, owner: 'enemy', size: 30 },
            { id: 'p9', x: 126, y: 126, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p10', x: 234, y: 126, troops: 34, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 33,
        planets: [
            { id: 'p1', x: 180, y: 524, troops: 30, owner: 'player', size: 32 },
            { id: 'p2', x: 74, y: 462, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p3', x: 286, y: 462, troops: 18, owner: 'neutral', size: 27 },
            { id: 'p4', x: 180, y: 416, troops: 34, owner: 'neutral', size: 31 },
            { id: 'p5', x: 88, y: 336, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p6', x: 272, y: 336, troops: 28, owner: 'enemy', size: 30 },
            { id: 'p7', x: 118, y: 236, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p8', x: 242, y: 236, troops: 31, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 158, troops: 32, owner: 'neutral', size: 29 },
            { id: 'p10', x: 180, y: 88, troops: 42, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 34,
        planets: [
            { id: 'p1', x: 88, y: 524, troops: 30, owner: 'player', size: 32 },
            { id: 'p2', x: 272, y: 524, troops: 25, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 470, troops: 24, owner: 'neutral', size: 29 },
            { id: 'p4', x: 108, y: 390, troops: 21, owner: 'neutral', size: 28 },
            { id: 'p5', x: 252, y: 390, troops: 29, owner: 'enemy', size: 30 },
            { id: 'p6', x: 180, y: 324, troops: 34, owner: 'neutral', size: 31 },
            { id: 'p7', x: 100, y: 232, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p8', x: 260, y: 232, troops: 31, owner: 'enemy', size: 30 },
            { id: 'p9', x: 128, y: 136, troops: 25, owner: 'neutral', size: 28 },
            { id: 'p10', x: 232, y: 136, troops: 35, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 35,
        planets: [
            { id: 'p1', x: 180, y: 524, troops: 29, owner: 'player', size: 32 },
            { id: 'p2', x: 96, y: 470, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p3', x: 264, y: 470, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p4', x: 180, y: 426, troops: 36, owner: 'neutral', size: 31 },
            { id: 'p5', x: 88, y: 352, troops: 23, owner: 'neutral', size: 28 },
            { id: 'p6', x: 272, y: 352, troops: 29, owner: 'enemy', size: 30 },
            { id: 'p7', x: 120, y: 252, troops: 25, owner: 'neutral', size: 28 },
            { id: 'p8', x: 240, y: 252, troops: 32, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 172, troops: 34, owner: 'neutral', size: 30 },
            { id: 'p10', x: 180, y: 92, troops: 44, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 36,
        planets: [
            { id: 'p1', x: 90, y: 524, troops: 29, owner: 'player', size: 32 },
            { id: 'p2', x: 270, y: 524, troops: 26, owner: 'neutral', size: 28 },
            { id: 'p3', x: 180, y: 478, troops: 25, owner: 'neutral', size: 29 },
            { id: 'p4', x: 108, y: 402, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p5', x: 252, y: 402, troops: 30, owner: 'enemy', size: 30 },
            { id: 'p6', x: 180, y: 338, troops: 36, owner: 'neutral', size: 31 },
            { id: 'p7', x: 96, y: 246, troops: 25, owner: 'neutral', size: 28 },
            { id: 'p8', x: 264, y: 246, troops: 32, owner: 'enemy', size: 30 },
            { id: 'p9', x: 128, y: 146, troops: 26, owner: 'neutral', size: 28 },
            { id: 'p10', x: 232, y: 146, troops: 36, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 37,
        planets: [
            { id: 'p1', x: 180, y: 526, troops: 29, owner: 'player', size: 32 },
            { id: 'p2', x: 74, y: 478, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p3', x: 286, y: 478, troops: 20, owner: 'neutral', size: 28 },
            { id: 'p4', x: 180, y: 438, troops: 37, owner: 'neutral', size: 32 },
            { id: 'p5', x: 86, y: 366, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p6', x: 274, y: 366, troops: 31, owner: 'enemy', size: 30 },
            { id: 'p7', x: 118, y: 266, troops: 26, owner: 'neutral', size: 29 },
            { id: 'p8', x: 242, y: 266, troops: 33, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 184, troops: 35, owner: 'neutral', size: 30 },
            { id: 'p10', x: 180, y: 94, troops: 45, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 38,
        planets: [
            { id: 'p1', x: 94, y: 526, troops: 29, owner: 'player', size: 32 },
            { id: 'p2', x: 266, y: 526, troops: 27, owner: 'neutral', size: 29 },
            { id: 'p3', x: 180, y: 486, troops: 26, owner: 'neutral', size: 29 },
            { id: 'p4', x: 112, y: 414, troops: 23, owner: 'neutral', size: 28 },
            { id: 'p5', x: 248, y: 414, troops: 31, owner: 'enemy', size: 30 },
            { id: 'p6', x: 180, y: 352, troops: 38, owner: 'neutral', size: 32 },
            { id: 'p7', x: 100, y: 260, troops: 26, owner: 'neutral', size: 29 },
            { id: 'p8', x: 260, y: 260, troops: 33, owner: 'enemy', size: 30 },
            { id: 'p9', x: 132, y: 158, troops: 28, owner: 'neutral', size: 29 },
            { id: 'p10', x: 228, y: 158, troops: 37, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 39,
        planets: [
            { id: 'p1', x: 180, y: 526, troops: 28, owner: 'player', size: 32 },
            { id: 'p2', x: 86, y: 484, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p3', x: 274, y: 484, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p4', x: 180, y: 446, troops: 39, owner: 'neutral', size: 32 },
            { id: 'p5', x: 88, y: 378, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p6', x: 272, y: 378, troops: 32, owner: 'enemy', size: 30 },
            { id: 'p7', x: 120, y: 276, troops: 27, owner: 'neutral', size: 29 },
            { id: 'p8', x: 240, y: 276, troops: 34, owner: 'enemy', size: 30 },
            { id: 'p9', x: 180, y: 196, troops: 36, owner: 'neutral', size: 30 },
            { id: 'p10', x: 180, y: 96, troops: 46, owner: 'enemy', size: 31 },
        ],
    },
    {
        id: 40,
        planets: [
            { id: 'p1', x: 88, y: 528, troops: 46, owner: 'player', size: 34 },
            { id: 'p2', x: 272, y: 528, troops: 30, owner: 'player', size: 33 },
            { id: 'p3', x: 180, y: 456, troops: 24, owner: 'neutral', size: 29 },
            { id: 'p4', x: 98, y: 362, troops: 22, owner: 'neutral', size: 28 },
            { id: 'p5', x: 262, y: 362, troops: 26, owner: 'neutral', size: 29 },
            { id: 'p6', x: 180, y: 288, troops: 34, owner: 'neutral', size: 31 },
            { id: 'p7', x: 110, y: 186, troops: 24, owner: 'neutral', size: 28 },
            { id: 'p8', x: 250, y: 186, troops: 30, owner: 'enemy', size: 30 },
            { id: 'boss', x: 180, y: 80, troops: 82, owner: 'enemy', size: 47, isBoss: true },
        ],
        isBossLevel: true,
    },
];

const MID_CAMPAIGN_TEMPLATES = [
    {
        playerSingle: [{ x: 180, y: 522 }],
        playerDual: [{ x: 92, y: 522 }, { x: 268, y: 522 }],
        neutralSlots: [
            { x: 116, y: 448 }, { x: 244, y: 448 }, { x: 180, y: 374 },
            { x: 96, y: 286 }, { x: 264, y: 286 }, { x: 180, y: 212 },
        ],
        enemySlots: [{ x: 92, y: 186 }, { x: 118, y: 128 }, { x: 242, y: 128 }, { x: 180, y: 88 }],
        bossSlot: { x: 180, y: 74 },
    },
    {
        playerSingle: [{ x: 84, y: 522 }],
        playerDual: [{ x: 84, y: 522 }, { x: 276, y: 522 }],
        neutralSlots: [
            { x: 180, y: 462 }, { x: 108, y: 378 }, { x: 252, y: 378 },
            { x: 180, y: 304 }, { x: 98, y: 224 }, { x: 262, y: 224 },
        ],
        enemySlots: [{ x: 180, y: 198 }, { x: 132, y: 142 }, { x: 228, y: 142 }, { x: 180, y: 96 }],
        bossSlot: { x: 180, y: 76 },
    },
    {
        playerSingle: [{ x: 276, y: 522 }],
        playerDual: [{ x: 96, y: 522 }, { x: 276, y: 522 }],
        neutralSlots: [
            { x: 180, y: 472 }, { x: 92, y: 404 }, { x: 268, y: 404 },
            { x: 180, y: 326 }, { x: 114, y: 246 }, { x: 246, y: 246 },
        ],
        enemySlots: [{ x: 132, y: 210 }, { x: 90, y: 154 }, { x: 270, y: 154 }, { x: 180, y: 94 }],
        bossSlot: { x: 180, y: 78 },
    },
    {
        playerSingle: [{ x: 180, y: 524 }],
        playerDual: [{ x: 112, y: 524 }, { x: 248, y: 524 }],
        neutralSlots: [
            { x: 86, y: 448 }, { x: 274, y: 448 }, { x: 180, y: 396 },
            { x: 124, y: 304 }, { x: 236, y: 304 }, { x: 180, y: 224 },
        ],
        enemySlots: [{ x: 228, y: 210 }, { x: 104, y: 138 }, { x: 256, y: 138 }, { x: 180, y: 90 }],
        bossSlot: { x: 180, y: 72 },
    },
];

const getMidCampaignFlow = (levelId) => {
    if (levelId <= 44) {
        return {
            aiSpeed: 4050 - (levelId - 41) * 120,
            playerCount: 1,
            playerTroops: 30,
            neutralCount: 6,
            neutralTroopsBase: 22,
            enemyCount: 3,
            enemyTroopsBase: 30,
            isBoss: false,
        };
    }

    if (levelId <= 49) {
        return {
            aiSpeed: 3600 - (levelId - 45) * 90,
            playerCount: 1,
            playerTroops: 29,
            neutralCount: 5,
            neutralTroopsBase: 24,
            enemyCount: 4,
            enemyTroopsBase: 32,
            isBoss: false,
        };
    }

    if (levelId === 50) {
        return {
            aiSpeed: 3300,
            playerCount: 2,
            playerTroops: 42,
            neutralCount: 4,
            neutralTroopsBase: 25,
            enemyCount: 2,
            enemyTroopsBase: 34,
            isBoss: true,
            bossTroops: 92,
            powerUpInventory: { shield: 2, speed: 2, double: 1, regen: 2 },
        };
    }

    if (levelId <= 55) {
        return {
            aiSpeed: 3450 - (levelId - 51) * 100,
            playerCount: 2,
            playerTroops: 34,
            neutralCount: 4,
            neutralTroopsBase: 27,
            enemyCount: 4,
            enemyTroopsBase: 37,
            isBoss: false,
        };
    }

    if (levelId <= 59) {
        return {
            aiSpeed: 3020 - (levelId - 56) * 80,
            playerCount: 2,
            playerTroops: 33,
            neutralCount: 4,
            neutralTroopsBase: 29,
            enemyCount: 4,
            enemyTroopsBase: 40,
            isBoss: false,
        };
    }

    return {
        aiSpeed: 2880,
        playerCount: 2,
        playerTroops: 45,
        neutralCount: 4,
        neutralTroopsBase: 30,
        enemyCount: 2,
        enemyTroopsBase: 41,
        isBoss: true,
        bossTroops: 122,
        powerUpInventory: { shield: 2, speed: 2, double: 1, regen: 2 },
    };
};

const buildMidCampaignOverride = (levelId) => {
    const template = MID_CAMPAIGN_TEMPLATES[(levelId - 41) % MID_CAMPAIGN_TEMPLATES.length];
    const flow = getMidCampaignFlow(levelId);
    const planets = [];

    const playerSlots = flow.playerCount === 2 ? template.playerDual : template.playerSingle;
    playerSlots.forEach((slot, index) => {
        planets.push({
            id: `p${planets.length + 1}`,
            x: slot.x,
            y: slot.y,
            troops: Math.round(flow.playerTroops * (index === 0 ? 1 : 0.74)),
            owner: 'player',
            size: index === 0 ? 33 : 31,
        });
    });

    for (let i = 0; i < flow.neutralCount && i < template.neutralSlots.length; i++) {
        const slot = template.neutralSlots[i];
        planets.push({
            id: `p${planets.length + 1}`,
            x: slot.x,
            y: slot.y,
            troops: flow.neutralTroopsBase + i * 2 + (levelId % 2 === 0 ? 1 : 0),
            owner: 'neutral',
            size: 29,
        });
    }

    for (let i = 0; i < flow.enemyCount && i < template.enemySlots.length; i++) {
        const slot = template.enemySlots[i];
        planets.push({
            id: `p${planets.length + 1}`,
            x: slot.x,
            y: slot.y,
            troops: Math.round(flow.enemyTroopsBase * (1 + i * 0.15)),
            owner: 'enemy',
            size: 31,
        });
    }

    if (flow.isBoss) {
        planets.push({
            id: 'boss',
            x: template.bossSlot.x,
            y: template.bossSlot.y,
            troops: flow.bossTroops,
            owner: 'enemy',
            size: levelId === 50 ? 50 : 54,
            isBoss: true,
        });
    }

    return {
        id: levelId,
        planets,
        aiSpeed: flow.aiSpeed,
        isBossLevel: flow.isBoss,
        ...(flow.powerUpInventory ? { powerUpInventory: flow.powerUpInventory } : {}),
    };
};

const MID_CAMPAIGN_OVERRIDES = [];
for (let levelId = 41; levelId <= 60; levelId++) {
    MID_CAMPAIGN_OVERRIDES.push(buildMidCampaignOverride(levelId));
}

[...EARLY_LEVEL_OVERRIDES, ...MID_CAMPAIGN_OVERRIDES].forEach((override) => {
    const index = LEVELS.findIndex((level) => level.id === override.id);
    if (index >= 0) {
        LEVELS[index] = {
            ...LEVELS[index],
            ...override,
        };
    }
});

export const getLevelById = (id) => LEVELS.find(l => l.id === id);
export const getTotalLevels = () => LEVELS.length;
export const getBossLevels = () => LEVELS.filter(l => l.isBossLevel);
