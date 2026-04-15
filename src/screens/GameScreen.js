import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder, InteractionManager, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics'; // Use full import for constants
import AsyncStorage from '@react-native-async-storage/async-storage';
import hapticsManager from '../utils/HapticsManager';
import GalaxyBackground from '../components/GalaxyBackground';
import Planet from '../components/Planet';
import Ship from '../components/Ship';
import PowerUp from '../components/PowerUp';
import PowerUpInventory from '../components/PowerUpInventory';
import Explosion from '../components/Explosion';
import ActivePowerUps from '../components/ActivePowerUps';
import Tutorial, { TUTORIAL_STEPS } from '../components/Tutorial';
import LevelIntro, { LEVEL_INTROS } from '../components/LevelIntro';
import Confetti from '../components/Confetti';
import PowerUpTooltip from '../components/PowerUpTooltip';
import theme from '../constants/theme';
import { getLevelById, getTotalLevels } from '../game/levels';
import {
    calculateCombat,
    getTroopsToSend,
    calculateTravelTime,
    getPlanetRegenAmount,
    makeAIDecision,
    makeAIWaveDecisions,
    makeAllAIDecisions,
    getAITickRate,
    checkGameState
} from '../game/gameLogic';
import { generatePowerUp, hasActivePowerUp, POWER_UP_TYPES } from '../game/powerUps';
import { calculateGameScore, SCORE_VALUES } from '../game/scoreSystem';
import { ProgressManager, UNLOCKABLES } from '../utils/ProgressManager';
import { AchievementManager } from '../utils/AchievementManager';
import ThemeManager from '../utils/ThemeManager';
import { DailyQuestManager } from '../utils/DailyQuestManager';
import soundManager from '../utils/SoundManager';

const { width, height } = Dimensions.get('window');
const TUTORIAL_KEY = '@galaxy_conquest_tutorial_done';
const LEVEL_INTRO_SEEN_PREFIX = '@galaxy_conquest_level_intro_seen_';

const buildLinkKey = (a, b) => [a, b].sort().join('::');

const getDistance = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
};

const buildPlanetLinks = (planets) => {
    if (!planets || planets.length < 2) return [];

    const idToPlanet = new Map(planets.map(planet => [planet.id, planet]));
    const links = new Set();
    const addLink = (fromId, toId) => {
        if (fromId === toId) return;
        links.add(buildLinkKey(fromId, toId));
    };

    const connected = new Set([planets[0].id]);
    while (connected.size < planets.length) {
        let best = null;
        planets.forEach(from => {
            if (!connected.has(from.id)) return;
            planets.forEach(to => {
                if (connected.has(to.id)) return;
                const distance = getDistance(from, to);
                if (!best || distance < best.distance) {
                    best = { fromId: from.id, toId: to.id, distance };
                }
            });
        });

        if (!best) break;
        addLink(best.fromId, best.toId);
        connected.add(best.toId);
    }

    const extraNeighbors = planets.length >= 9 ? 3 : 2;
    planets.forEach(from => {
        const nearest = planets
            .filter(to => to.id !== from.id)
            .map(to => ({ id: to.id, distance: getDistance(from, to) }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, extraNeighbors);

        nearest.forEach(target => addLink(from.id, target.id));
    });

    return Array.from(links).map((key) => {
        const [fromId, toId] = key.split('::');
        const from = idToPlanet.get(fromId);
        const to = idToPlanet.get(toId);
        return {
            fromId,
            toId,
            distance: from && to ? getDistance(from, to) : 0,
        };
    });
};

const GameScreen = ({ route, navigation }) => {
    const levelId = route?.params?.levelId || 1;
    const customLevel = route?.params?.customLevel;
    const isCustomGame = route?.params?.isCustomGame || false;
    const freeForAll = route?.params?.freeForAll || false; // NEW: FFA param
    const level = customLevel || getLevelById(levelId);

    // Dynamic enemy colors for FFA mode
    const FFA_COLORS = {
        enemy1: '#ff4444',
        enemy2: '#ff9900',
        enemy3: '#cc33ff',
        enemy4: '#33ccff',
        enemy5: '#ff33aa',
        enemy6: '#ffff33',
        player: theme.colors.player,
        neutral: theme.colors.neutral,
    };

    // Merge active themecolors with FFA colors
    const getThemeColors = () => {
        if (freeForAll) return FFA_COLORS;
        return activeTheme ? activeTheme.colors : null;
    };
    const currentThemeColors = getThemeColors();

    const [planets, setPlanets] = useState([]);
    const [ships, setShips] = useState([]);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [gameState, setGameState] = useState('playing');
    const [score, setScore] = useState(0);
    const [powerUps, setPowerUps] = useState([]);
    const [powerUpInventory, setPowerUpInventory] = useState({});
    const [activePowerUps, setActivePowerUps] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showLevelIntro, setShowLevelIntro] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [shipsSent, setShipsSent] = useState(0);
    const [currentTooltip, setCurrentTooltip] = useState(null);
    const [gameStats, setGameStats] = useState({
        planetsCaptured: 0,
        enemiesDefeated: 0,
        powerUpsCollected: 0,
        startTime: Date.now(),
    });

    // Multi-select and drag state
    const [selectedPlanets, setSelectedPlanets] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragLine, setDragLine] = useState(null);
    const [hoverTarget, setHoverTarget] = useState(null); // NEW: Highlight target planet
    const [protectionEndTime, setProtectionEndTime] = useState(0); // NEW: 5-second protection at level start
    const [protectionCountdown, setProtectionCountdown] = useState(0); // For visual countdown
    const [activeShipEmoji, setActiveShipEmoji] = useState('🚀');
    const [activeTheme, setActiveTheme] = useState(null);
    const [themeColors, setThemeColors] = useState(theme.colors);
    const [impactFlash, setImpactFlash] = useState(null);

    // Animation refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const cameraShakeAnim = useRef(new Animated.Value(0)).current;
    const battlefieldZoomAnim = useRef(new Animated.Value(1)).current;
    const dragStartRef = useRef(null);

    const aiIntervalRef = useRef(null);
    const regenIntervalRef = useRef(null);
    const powerUpIntervalRef = useRef(null);
    const shipIdCounter = useRef(0);
    const explosionIdCounter = useRef(0);
    const gameAreaRef = useRef(null);
    const [gameAreaLayout, setGameAreaLayout] = useState({ x: 0, y: 0, width: width, height: height });

    // Refs for PanResponder to access current state
    const planetsRef = useRef(planets);
    const selectedPlanetsRef = useRef(selectedPlanets);
    const isDraggingRef = useRef(isDragging);
    const activePowerUpsRef = useRef(activePowerUps);
    const gameAreaLayoutRef = useRef(gameAreaLayout);
    const linkSetRef = useRef(new Set());

    // Keep refs in sync with state
    useEffect(() => { planetsRef.current = planets; }, [planets]);
    useEffect(() => { selectedPlanetsRef.current = selectedPlanets; }, [selectedPlanets]);
    useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
    useEffect(() => { activePowerUpsRef.current = activePowerUps; }, [activePowerUps]);
    useEffect(() => { gameAreaLayoutRef.current = gameAreaLayout; }, [gameAreaLayout]);

    const primarySelectedPlanet = useMemo(
        () => selectedPlanets[0] || selectedPlanet || null,
        [selectedPlanet, selectedPlanets]
    );

    const planetById = useMemo(() => {
        const byId = new Map();
        planets.forEach((planet) => byId.set(planet.id, planet));
        return byId;
    }, [planets]);

    const planetLinks = useMemo(() => buildPlanetLinks(planets), [planets]);

    const linkSet = useMemo(() => {
        const set = new Set();
        planetLinks.forEach((link) => {
            set.add(buildLinkKey(link.fromId, link.toId));
        });
        return set;
    }, [planetLinks]);

    useEffect(() => {
        linkSetRef.current = linkSet;
    }, [linkSet]);

    const arePlanetsLinked = useCallback((fromId, toId) => {
        if (!fromId || !toId || fromId === toId) return false;
        return linkSet.has(buildLinkKey(fromId, toId));
    }, [linkSet]);

    const canSendFromTo = useCallback((sourcePlanet, targetPlanet) => {
        if (!sourcePlanet || !targetPlanet) return false;
        if (sourcePlanet.id === targetPlanet.id) return false;
        if (sourcePlanet.troops <= 1) return false;
        return arePlanetsLinked(sourcePlanet.id, targetPlanet.id);
    }, [arePlanetsLinked]);

    const battlefieldStats = useMemo(() => {
        const ownedByPlayer = planets.filter(p => p.owner === 'player').length;
        const ownedByEnemies = planets.filter(p => p.owner !== 'player' && p.owner !== 'neutral').length;
        const neutralPlanets = planets.filter(p => p.owner === 'neutral').length;
        const playerTroops = planets.filter(p => p.owner === 'player').reduce((sum, p) => sum + p.troops, 0);
        const enemyTroops = planets.filter(p => p.owner !== 'player' && p.owner !== 'neutral').reduce((sum, p) => sum + p.troops, 0);

        return {
            ownedByPlayer,
            ownedByEnemies,
            neutralPlanets,
            playerTroops,
            enemyTroops,
        };
    }, [planets]);

    const battleSummary = useMemo(() => {
        const elapsedMs = Date.now() - gameStats.startTime;
        const minutes = Math.floor(elapsedMs / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);
        return {
            elapsedLabel: `${minutes}:${String(seconds).padStart(2, '0')}`,
            efficiency: shipsSent > 0 ? Math.round((gameStats.planetsCaptured / shipsSent) * 100) : 0,
        };
    }, [gameStats.planetsCaptured, gameStats.startTime, shipsSent]);

    // Helper to find planet at position - increased threshold for cross-device compatibility
    const findPlanetAt = (x, y, playerOnly = false) => {
        return planetsRef.current.find(planet => {
            // Fix: Calculate distance from planet center properly
            // planet.x and planet.y are center coordinates
            const dx = x - planet.x;
            const dy = y - planet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // Increased threshold for more forgiving touch detection
            const sizeThreshold = (planet.size || 50) / 2 + 15;
            if (playerOnly) {
                return distance < sizeThreshold && planet.owner === 'player' && planet.troops > 1;
            }
            return distance < sizeThreshold;
        });
    };

    // Helper function to cleanup drag state
    const cleanupDragState = () => {
        setIsDragging(false);
        setDragLine(null);
        setHoverTarget(null);
        setSelectedPlanets([]);
        setSelectedPlanet(null);
        dragStartRef.current = null;
    };

    const applySelection = useCallback((nextPlanets) => {
        setSelectedPlanets(nextPlanets);
        setSelectedPlanet(nextPlanets[0] || null);
    }, []);

    const clearSelection = useCallback(() => {
        setHoverTarget(null);
        setSelectedPlanets([]);
        setSelectedPlanet(null);
    }, []);

    const sendSelectionToTarget = useCallback((targetPlanet, sourcesOverride = null) => {
        const sourcePlanets = sourcesOverride || selectedPlanetsRef.current;
        if (!targetPlanet || !sourcePlanets.length) {
            return;
        }

        const validSources = sourcePlanets.filter(sourcePlanet => canSendFromTo(sourcePlanet, targetPlanet));
        if (!validSources.length) {
            hapticsManager.notification(Haptics.NotificationFeedbackType.Warning);
            clearSelection();
            return;
        }

        hapticsManager.impact(Haptics.ImpactFeedbackStyle.Medium);

        validSources.forEach(sourcePlanet => {
            sendShips(sourcePlanet.id, targetPlanet.id, 'player');
        });

        clearSelection();
    }, [canSendFromTo, clearSelection]);

    // PanResponder for drag gesture - Optimized for all devices
    const panResponder = useRef(
        PanResponder.create({
            // Capture phase - ensures this responder gets priority
            onStartShouldSetPanResponderCapture: () => false, // Don't capture, let children handle first
            onMoveShouldSetPanResponderCapture: () => isDraggingRef.current, // Capture if already dragging

            // Regular handlers
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true, // Always respond to move

            onPanResponderGrant: (evt) => {
                // Use pageX/pageY for consistent coordinates across devices
                const layout = gameAreaLayoutRef.current;
                if (!layout || layout.x === undefined) return; // Safety check (x can be 0)

                const touchX = evt.nativeEvent.pageX - layout.x;
                const touchY = evt.nativeEvent.pageY - layout.y;

                const touchedPlanet = findPlanetAt(touchX, touchY, true);

                if (touchedPlanet) {
                    hapticsManager.selection();
                    dragStartRef.current = touchedPlanet;
                    setIsDragging(true);
                    applySelection([touchedPlanet]);
                    // Planet x,y are center coordinates
                    setDragLine({
                        fromX: touchedPlanet.x,
                        fromY: touchedPlanet.y,
                        toX: touchX,
                        toY: touchY,
                    });
                }
            },

            onPanResponderMove: (evt) => {
                if (!isDraggingRef.current || !dragStartRef.current) return;

                const layout = gameAreaLayoutRef.current;
                if (!layout || layout.x === undefined) return; // Safety check (x can be 0)

                const touchX = evt.nativeEvent.pageX - layout.x;
                const touchY = evt.nativeEvent.pageY - layout.y;

                setDragLine(prev => prev ? { ...prev, toX: touchX, toY: touchY } : null);

                // Little Wars hissi icin drag sirasinda otomatik multi-select yapmiyoruz.
                // Sadece hedef highlight oluyor; ek secim long press ile yapiliyor.
                const anyHoverPlanet = findPlanetAt(touchX, touchY, false);
                const hasLinkedSource = anyHoverPlanet && selectedPlanetsRef.current.some((sourcePlanet) => {
                    if (sourcePlanet.id === anyHoverPlanet.id || sourcePlanet.troops <= 1) return false;
                    return linkSetRef.current.has(buildLinkKey(sourcePlanet.id, anyHoverPlanet.id));
                });
                if (anyHoverPlanet && hasLinkedSource && !selectedPlanetsRef.current.find(p => p.id === anyHoverPlanet.id)) {
                    setHoverTarget(anyHoverPlanet.id);
                } else {
                    setHoverTarget(null);
                }
            },

            onPanResponderRelease: (evt) => {
                if (!isDraggingRef.current) return;

                const layout = gameAreaLayoutRef.current;
                if (!layout || layout.x === undefined) {
                    cleanupDragState();
                    return;
                }

                const touchX = evt.nativeEvent.pageX - layout.x;
                const touchY = evt.nativeEvent.pageY - layout.y;

                const targetPlanet = findPlanetAt(touchX, touchY, false);

                if (targetPlanet && selectedPlanetsRef.current.length > 0) {
                    const validSources = selectedPlanetsRef.current.filter((sourcePlanet) => {
                        if (sourcePlanet.id === targetPlanet.id || sourcePlanet.troops <= 1) return false;
                        return linkSetRef.current.has(buildLinkKey(sourcePlanet.id, targetPlanet.id));
                    });
                    if (validSources.length > 0) {
                        hapticsManager.impact(Haptics.ImpactFeedbackStyle.Medium);
                        validSources.forEach(sourcePlanet => {
                            sendShips(sourcePlanet.id, targetPlanet.id, 'player');
                        });
                    } else {
                        hapticsManager.notification(Haptics.NotificationFeedbackType.Warning);
                    }
                }

                cleanupDragState();
            },

            // Called when another responder takes over (e.g., scroll view)
            onPanResponderTerminate: () => {
                cleanupDragState();
            },

            // Called when gesture is released outside the view bounds
            onPanResponderEnd: () => {
                // Already handled by release, but ensure cleanup
                if (isDraggingRef.current) {
                    cleanupDragState();
                }
            },
        })
    ).current;

    // Check tutorial status and init sounds
    useEffect(() => {
        const checkTutorial = async () => {
            // Initialize sounds
            await soundManager.init();

            if (levelId === 1) {
                const done = await AsyncStorage.getItem(TUTORIAL_KEY);
                if (!done) {
                    setShowTutorial(true);
                    return; // Don't show level intro if tutorial is showing
                }
            }

            // Show level intro only once per level for configured cards
            if (LEVEL_INTROS[levelId]) {
                const seenIntro = await AsyncStorage.getItem(`${LEVEL_INTRO_SEEN_PREFIX}${levelId}`);
                if (!seenIntro) {
                    setShowLevelIntro(true);
                }
            }
        };
        checkTutorial();
    }, [levelId]);

    // Initialize level
    useEffect(() => {
        if (level) {
            setPlanets(level.planets.map(p => ({ ...p })));
            setGameState('playing');
            setSelectedPlanets([]);
            setSelectedPlanet(null);
            setShips([]);
            setPowerUps([]);
            setPowerUpInventory(level.powerUpInventory ? { ...level.powerUpInventory } : {});
            setActivePowerUps([]);
            setScore(0);
            setShowConfetti(false);
            setShipsSent(0);
            setCurrentTooltip(null);
            setGameStats({
                planetsCaptured: 0,
                enemiesDefeated: 0,
                powerUpsCollected: 0,
                startTime: Date.now(),
            });
            // Dynamic protection period based on level difficulty
            // Early levels: 10s, Mid levels: 7s, Late levels: 5s
            let protectionTime = 10000; // default 10 seconds
            if (levelId > 50) {
                protectionTime = 5000; // 5 seconds for hard levels
            } else if (levelId > 20) {
                protectionTime = 7000; // 7 seconds for medium levels
            }
            setProtectionEndTime(Date.now() + protectionTime);
            setProtectionCountdown(Math.ceil(protectionTime / 1000));
        }

        return () => {
            clearInterval(aiIntervalRef.current);
            clearInterval(regenIntervalRef.current);
            clearInterval(powerUpIntervalRef.current);
        };
    }, [levelId]);

    // Protection countdown timer & pulse animation
    // Protection countdown timer
    useEffect(() => {
        if (protectionCountdown <= 0) return;

        const timer = setInterval(() => {
            const remaining = Math.ceil((protectionEndTime - Date.now()) / 1000);
            if (remaining <= 0) {
                setProtectionCountdown(0);
                clearInterval(timer);
            } else {
                setProtectionCountdown(remaining);
            }
        }, 200);

        return () => clearInterval(timer);
    }, [protectionEndTime, protectionCountdown]);

    // Pulse animation logic - separate effect
    useEffect(() => {
        if (protectionCountdown > 0) {
            // Start pulsing
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                ])
            );
            pulse.start();

            return () => {
                pulse.stop();
                pulseAnim.setValue(1); // Reset
            };
        } else {
            // Ensure reset if countdown is 0
            pulseAnim.setValue(1);
        }
    }, [protectionCountdown > 0]); // Only run when active state changes

    // Load active customization (Ship & Theme)
    useEffect(() => {
        const loadCustomization = async () => {
            try {
                const activeData = await ProgressManager.getActive();

                // Set Ship
                const shipUnlock = UNLOCKABLES.ships.find(s => s.id === activeData.ship);
                if (shipUnlock) {
                    setActiveShipEmoji(shipUnlock.emoji);
                }

                // Set Theme
                const themeData = ThemeManager.getThemeById(activeData.theme);
                if (themeData) {
                    setActiveTheme(themeData);
                }
            } catch (error) {
                console.log('Error loading customization:', error);
            }
        };
        loadCustomization();
    }, []);

    // Power-up inventory usage
    const usePowerUpFromInventory = (powerUpId) => {
        if (gameState !== 'playing' || showTutorial) return;
        if (!powerUpInventory[powerUpId] || powerUpInventory[powerUpId] <= 0) return;

        // Check if still in protection period
        if (Date.now() < protectionEndTime) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return; // Power-ups disabled during protection
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Decrease inventory count
        setPowerUpInventory(prev => ({
            ...prev,
            [powerUpId]: prev[powerUpId] - 1,
        }));

        // Get power-up type info
        const powerUpType = Object.values(POWER_UP_TYPES).find(p => p.id === powerUpId);
        if (!powerUpType) return;

        // Show tooltip
        setCurrentTooltip(powerUpType);

        // Handle instant power-ups (bomb, clone)
        if (powerUpType.isInstant) {
            if (powerUpId === 'bomb') {
                // Bomb: reduce enemy troops by 10
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                setPlanets(prev => prev.map(p => {
                    if (p.owner === 'enemy') {
                        const newTroops = Math.max(1, p.troops - 10);
                        addExplosion(p.x + 25, p.y + 25, '#ef4444', 'small');
                        return { ...p, troops: newTroops };
                    }
                    return p;
                }));
            } else if (powerUpId === 'clone') {
                // Clone: double player troops
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setPlanets(prev => prev.map(p => {
                    if (p.owner === 'player') {
                        return { ...p, troops: p.troops * 2 };
                    }
                    return p;
                }));
            }
        } else {
            // Duration-based power-ups
            setActivePowerUps(prev => [
                ...prev,
                {
                    ...powerUpType,
                    startTime: Date.now(),
                    expiresAt: Date.now() + powerUpType.duration,
                },
            ]);

            // If speed power-up, accelerate existing player ships to 2x speed
            if (powerUpId === 'speed') {
                setShips(prev => prev.map(ship => {
                    if (ship.owner === 'player' && ship.speedMultiplier === 1) {
                        return { ...ship, speedMultiplier: 2 };
                    }
                    return ship;
                }));
            }

            // If double power-up, give existing player ships 2x damage
            if (powerUpId === 'double') {
                setShips(prev => prev.map(ship => {
                    if (ship.owner === 'player' && !ship.hasDoublePower) {
                        return { ...ship, hasDoublePower: true };
                    }
                    return ship;
                }));
            }
        }

        setGameStats(prev => ({
            ...prev,
            powerUpsCollected: prev.powerUpsCollected + 1,
        }));

        DailyQuestManager.updateProgress('powerup', 1);
    };

    // Clean expired power-ups
    useEffect(() => {
        const interval = setInterval(() => {
            setActivePowerUps(prev => prev.filter(p => Date.now() < p.expiresAt));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Troop regeneration
    useEffect(() => {
        if (showTutorial) return;

        // Use a stable interval, check power-up inside
        regenIntervalRef.current = setInterval(() => {
            if (gameState !== 'playing') return;

            setPlanets(prev => prev.map(p => {
                if (p.owner !== 'neutral') {
                    // Check for regen power-up using ref for stability
                    const hasRegen = activePowerUpsRef.current.some(pu => pu.id === 'regen' && Date.now() < pu.expiresAt);
                    const regenAmount = getPlanetRegenAmount(p, hasRegen);
                    return { ...p, troops: p.troops + regenAmount };
                }
                return p;
            }));
        }, 1600);

        return () => clearInterval(regenIntervalRef.current);
    }, [gameState, showTutorial]); // Removed activePowerUps from deps

    const enemyTickRate = useMemo(() => {
        return level ? getAITickRate(level, planets, 'enemy') : 2200;
    }, [level, planets]);

    // AI logic - uses ref to avoid stale closures while still adapting to battlefield state
    useEffect(() => {
        if (!level || showTutorial) return;

        aiIntervalRef.current = setInterval(() => {
            if (gameState !== 'playing') return;

            // Use planetsRef to get current planets without resetting interval
            if (freeForAll) {
                // In FFA mode, all enemies make decisions independently
                const enemyOwners = customLevel?.enemyOwners || ['enemy'];
                const decisions = makeAllAIDecisions(planetsRef.current, true, enemyOwners);

                decisions.forEach(decision => {
                    sendShips(decision.from, decision.to, decision.owner);
                });
            } else {
                const waveDecisions = makeAIWaveDecisions(planetsRef.current, 'enemy', false);
                if (waveDecisions.length) {
                    waveDecisions.forEach((decision, index) => {
                        setTimeout(() => {
                            sendShips(decision.from, decision.to, 'enemy');
                        }, index * 220);
                    });
                } else {
                    const decision = makeAIDecision(planetsRef.current);
                    if (decision) {
                        sendShips(decision.from, decision.to, 'enemy');
                    }
                }
            }
        }, enemyTickRate);

        return () => clearInterval(aiIntervalRef.current);
    }, [gameState, level, showTutorial, freeForAll, enemyTickRate]);

    // Check win/lose
    useEffect(() => {
        if (showTutorial) return;

        const state = checkGameState(planets, freeForAll);
        if (state !== 'playing' && gameState === 'playing') {
            setGameState(state);
            hapticsManager.notification(
                state === 'win'
                    ? Haptics.NotificationFeedbackType.Success
                    : Haptics.NotificationFeedbackType.Error
            );

            if (state === 'win') {
                soundManager.playVictory();
                setShowConfetti(true);

                // Calculate final score
                const completionTime = Date.now() - gameStats.startTime;
                const finalScore = calculateGameScore({
                    planetsCaptured: gameStats.planetsCaptured,
                    enemiesDefeated: gameStats.enemiesDefeated,
                    powerUpsCollected: gameStats.powerUpsCollected,
                    won: true,
                    perfectWin: false,
                    completionTime,
                });
                setScore(prev => prev + finalScore);

                // Save progress
                ProgressManager.recordGameResult({
                    won: true,
                    levelId,
                    isBossLevel: level?.isBossLevel,
                    score: finalScore,
                    planetsCaptured: gameStats.planetsCaptured,
                    shipsSent,
                    powerUpsCollected: gameStats.powerUpsCollected,
                    completionTime,
                });

                // Update daily quests
                DailyQuestManager.updateProgress('win', 1);
                DailyQuestManager.updateProgress('capture', gameStats.planetsCaptured);
                DailyQuestManager.updateProgress('ships', shipsSent);
                DailyQuestManager.updateProgress('levels', 1);
                if (level?.isBossLevel) {
                    DailyQuestManager.updateProgress('boss', 1);
                }
            } else {
                soundManager.playDefeat();
                ProgressManager.recordGameResult({
                    won: false,
                    levelId,
                    score: 0,
                    planetsCaptured: gameStats.planetsCaptured,
                    shipsSent,
                    powerUpsCollected: gameStats.powerUpsCollected,
                    completionTime: Date.now() - gameStats.startTime,
                });
            }

            // Check achievements after game ends
            const checkAndUnlockAchievements = async () => {
                const updatedProgress = await ProgressManager.getProgress();
                const newAchievements = await AchievementManager.checkAchievements(updatedProgress);

                // Add reward coins for newly unlocked achievements
                for (const achievement of newAchievements) {
                    if (achievement.reward) {
                        await ProgressManager.addCoins(achievement.reward);
                    }
                }
            };
            checkAndUnlockAchievements();
        }
    }, [planets, showTutorial]);

    const addExplosion = (x, y, color, size = 'medium') => {
        const id = `explosion-${explosionIdCounter.current++}`;
        setExplosions(prev => [...prev, { id, x, y, color, size }]);
    };

    const removeExplosion = (id) => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    };

    const triggerCameraShake = useCallback((intensity = 1) => {
        const amplitude = Math.max(4, Math.min(12, intensity * 5));
        Animated.sequence([
            Animated.timing(cameraShakeAnim, { toValue: amplitude, duration: 40, useNativeDriver: true }),
            Animated.timing(cameraShakeAnim, { toValue: -amplitude * 0.7, duration: 45, useNativeDriver: true }),
            Animated.timing(cameraShakeAnim, { toValue: amplitude * 0.35, duration: 35, useNativeDriver: true }),
            Animated.timing(cameraShakeAnim, { toValue: 0, duration: 35, useNativeDriver: true }),
        ]).start();
    }, [cameraShakeAnim]);

    const triggerBattlefieldZoom = useCallback((targetScale = 1.02) => {
        Animated.sequence([
            Animated.timing(battlefieldZoomAnim, { toValue: targetScale, duration: 100, useNativeDriver: true }),
            Animated.timing(battlefieldZoomAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        ]).start();
    }, [battlefieldZoomAnim]);

    const triggerImpactFlash = useCallback((x, y, color) => {
        const id = `flash-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setImpactFlash({ id, x, y, color });
        setTimeout(() => {
            setImpactFlash(current => (current?.id === id ? null : current));
        }, 220);
    }, []);

    const collectPowerUp = (powerUp) => {
        hapticsManager.impact(Haptics.ImpactFeedbackStyle.Medium);

        setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));

        // Play power-up sound
        soundManager.playPowerUp();

        // Show tooltip explaining what the power-up does
        setCurrentTooltip(powerUp.type);

        setActivePowerUps(prev => [
            ...prev,
            {
                ...powerUp.type,
                startTime: Date.now(),
                expiresAt: Date.now() + powerUp.type.duration,
            },
        ]);

        setScore(prev => prev + SCORE_VALUES.POWER_UP_COLLECTED);
        setGameStats(prev => ({
            ...prev,
            powerUpsCollected: prev.powerUpsCollected + 1,
        }));

        DailyQuestManager.updateProgress('powerup', 1);
        addExplosion(powerUp.x, powerUp.y, powerUp.type.color, 'small');
    };

    const handlePlanetPress = (planet) => {
        if (showTutorial || gameState !== 'playing') return;
        Haptics.selectionAsync();

        if (selectedPlanets.length > 0) {
            const isAlreadySelected = selectedPlanets.find(p => p.id === planet.id);
            const isOwnPlanet = planet.owner === 'player' && planet.troops > 1;

            if (isAlreadySelected) {
                applySelection(selectedPlanets.filter(p => p.id !== planet.id));
            } else if (isOwnPlanet) {
                if (!selectedPlanets.length || selectedPlanets.some(source => arePlanetsLinked(source.id, planet.id))) {
                    applySelection([...selectedPlanets, planet]);
                } else {
                    hapticsManager.notification(Haptics.NotificationFeedbackType.Warning);
                }
            } else {
                sendSelectionToTarget(planet, selectedPlanets);
            }

            return;
        }

        if (planet.owner === 'player' && planet.troops > 1) {
            applySelection([planet]);
        }
    };

    const handlePlanetLongPress = (planet) => {
        if (showTutorial || gameState !== 'playing') return;
        if (planet.owner !== 'player' || planet.troops <= 1) return;

        hapticsManager.impact(Haptics.ImpactFeedbackStyle.Light);

        if (!selectedPlanets.find(p => p.id === planet.id)) {
            if (selectedPlanets.length > 0 && !selectedPlanets.some(source => arePlanetsLinked(source.id, planet.id))) {
                hapticsManager.notification(Haptics.NotificationFeedbackType.Warning);
                return;
            }
            applySelection([...selectedPlanets, planet]);
        }
    };

    const sendShips = (fromId, toId, owner) => {
        // Use planetsRef to get current planets (avoids stale closure issues with AI)
        const currentPlanets = planetsRef.current;
        const fromPlanet = currentPlanets.find(p => p.id === fromId);
        const toPlanet = currentPlanets.find(p => p.id === toId);

        if (!fromPlanet || !toPlanet) return;
        if (fromPlanet.owner !== owner) return;
        if (!linkSetRef.current.has(buildLinkKey(fromId, toId))) return;

        const troopsToSend = getTroopsToSend(fromPlanet.troops, {
            aggressive: owner !== 'player',
        });
        if (troopsToSend < 1) return;

        triggerBattlefieldZoom(owner === 'player' ? 1.015 : 1.01);

        // Play attack sound for player
        if (owner === 'player') {
            soundManager.playAttack();
        }

        setPlanets(prev => prev.map(p =>
            p.id === fromId ? { ...p, troops: p.troops - troopsToSend } : p
        ));

        const shipId = `ship-${shipIdCounter.current++}`;
        const hasSpeed = hasActivePowerUp({ activePowerUps }, 'speed') && owner === 'player';
        const hasDouble = hasActivePowerUp({ activePowerUps }, 'double') && owner === 'player';
        const speedMultiplier = hasSpeed ? 2 : 1;
        const travelTime = calculateTravelTime(fromPlanet.x, fromPlanet.y, toPlanet.x, toPlanet.y);

        const newShip = {
            id: shipId,
            fromX: fromPlanet.x,
            fromY: fromPlanet.y,
            toX: toPlanet.x,
            toY: toPlanet.y,
            troops: troopsToSend,
            owner: owner,
            targetId: toId,
            duration: travelTime,
            speedMultiplier,
            hasDoublePower: hasDouble, // Store power-up status at send time
        };

        setShips(prev => [...prev, newShip]);
        if (owner === 'player') {
            setShipsSent(prev => prev + 1);
        }
    };

    const handleShipArrival = useCallback((ship) => {
        // Get the current ship state from the ships array (may have been updated with power-ups)
        setShips(prev => {
            const currentShip = prev.find(s => s.id === ship.id);
            const shipToUse = currentShip || ship; // Use current state if found, otherwise use passed ship

            // Process arrival with current ship state
            const targetPlanet = planets.find(p => p.id === shipToUse.targetId);
            if (targetPlanet) {
                // Shield checks current power-up state using ref for stability (like regen power-up)
                const hasShield = activePowerUpsRef.current.some(pu => pu.id === 'shield' && Date.now() < pu.expiresAt);

                // Shield now reduces attack by 10 instead of completely blocking
                let shieldReduction = 0;
                if (hasShield && targetPlanet.owner === 'player' && shipToUse.owner !== 'player') {
                    shieldReduction = 10;
                    addExplosion(targetPlanet.x, targetPlanet.y, '#00d4ff', 'small');
                    triggerImpactFlash(targetPlanet.x, targetPlanet.y, '#7ce5ff');
                }

                // Use the CURRENT power-up status (after any in-flight updates)
                const attackMultiplier = shipToUse.hasDoublePower ? 2 : 1;
                let effectiveTroops = (shipToUse.troops * attackMultiplier) - shieldReduction;
                effectiveTroops = Math.max(0, effectiveTroops); // Can't go negative

                // Check protection period - all planets have shields
                const isProtected = Date.now() < protectionEndTime;
                if (isProtected) {
                    // During protection, attacks do nothing
                    addExplosion(targetPlanet.x, targetPlanet.y, '#00d4ff', 'small');
                    triggerImpactFlash(targetPlanet.x, targetPlanet.y, '#7ce5ff');
                    return prev.filter(s => s.id !== ship.id);
                }

                setPlanets(prevPlanets => prevPlanets.map(p => {
                    if (p.id === shipToUse.targetId) {
                        const result = calculateCombat(effectiveTroops, p.troops, shipToUse.owner, p.owner);
                        const clashPower = Math.max(1, effectiveTroops / 18);
                        triggerCameraShake(result.newOwner !== p.owner ? clashPower * 1.2 : clashPower * 0.8);
                        triggerBattlefieldZoom(result.newOwner !== p.owner ? 1.03 : 1.018);

                        if (result.newOwner !== p.owner) {
                            if (shipToUse.owner === 'player' && p.owner !== 'player') {
                                setScore(s => s + SCORE_VALUES.PLANET_CAPTURED);
                                setGameStats(gs => ({ ...gs, planetsCaptured: gs.planetsCaptured + 1 }));
                            }
                            const explosionColor = shipToUse.owner === 'player'
                                ? (activeTheme ? activeTheme.colors.player : theme.colors.player)
                                : (currentThemeColors && currentThemeColors[shipToUse.owner] ? currentThemeColors[shipToUse.owner] : theme.colors.enemy);
                            addExplosion(p.x, p.y, explosionColor, p.isBoss ? 'large' : 'medium');
                            triggerImpactFlash(p.x, p.y, explosionColor);
                        } else if (effectiveTroops > 0) {
                            const clashColor = shipToUse.owner === 'player' ? '#7ce5ff' : '#ff9a9a';
                            addExplosion(p.x, p.y, clashColor, 'small');
                            triggerImpactFlash(p.x, p.y, clashColor);
                        }

                        return { ...p, owner: result.newOwner, troops: result.remainingTroops };
                    }
                    return p;
                }));
            }

            // Return filtered array (remove the arrived ship)
            return prev.filter(s => s.id !== ship.id);
        });
    }, [planets, activePowerUps]);

    const handleTutorialNext = () => {
        if (tutorialStep < TUTORIAL_STEPS.length - 1) {
            setTutorialStep(prev => prev + 1);
        } else {
            setShowTutorial(false);
            AsyncStorage.setItem(TUTORIAL_KEY, 'true');
            ProgressManager.markTutorialComplete();
        }
    };

    const handleTutorialSkip = () => {
        setShowTutorial(false);
        AsyncStorage.setItem(TUTORIAL_KEY, 'true');
        ProgressManager.markTutorialComplete();
    };

    const handleLevelIntroContinue = useCallback(() => {
        setShowLevelIntro(false);
        AsyncStorage.setItem(`${LEVEL_INTRO_SEEN_PREFIX}${levelId}`, 'true');
    }, [levelId]);

    const handleRetry = () => {
        setPlanets(level.planets.map(p => ({ ...p })));
        setGameState('playing');
        setSelectedPlanets([]);
        setSelectedPlanet(null);
        setShips([]);
        setPowerUps([]);
        setActivePowerUps([]);
        setScore(0);
        setShowConfetti(false);
        setShipsSent(0);
        setGameStats({
            planetsCaptured: 0,
            enemiesDefeated: 0,
            powerUpsCollected: 0,
            startTime: Date.now(),
        });
        // Reset power-up inventory to level defaults
        setPowerUpInventory(level.powerUpInventory ? { ...level.powerUpInventory } : {});

        // Reset protection period on retry (dynamic based on level)
        let protectionTime = 10000;
        if (levelId > 50) {
            protectionTime = 5000;
        } else if (levelId > 20) {
            protectionTime = 7000;
        }
        setProtectionEndTime(Date.now() + protectionTime);
        setProtectionCountdown(Math.ceil(protectionTime / 1000));
    };

    const handleNextLevel = () => {
        if (levelId < getTotalLevels()) {
            navigation.replace('Game', { levelId: levelId + 1 });
        } else {
            navigation.goBack();
        }
    };

    return (
        <GalaxyBackground themeColors={activeTheme?.colors}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.levelTitle}>{level?.name || 'Seviye'}</Text>
                        <View style={styles.headerStatsRow}>
                            <Text style={styles.scoreText}>⭐ {score}</Text>
                            <View style={styles.headerMiniDivider} />
                            <Text style={styles.headerStatChip}>🪐 {battlefieldStats.ownedByPlayer}</Text>
                            <Text style={styles.headerStatChip}>⚔️ {battlefieldStats.ownedByEnemies}</Text>
                            <Text style={styles.headerStatChip}>👥 {battlefieldStats.playerTroops}</Text>
                        </View>
                        {protectionCountdown > 0 && (
                            <Animated.View style={[styles.protectionContainer, { transform: [{ scale: pulseAnim }] }]}>
                                <Text style={styles.protectionText}>🛡️ Koruma aktif</Text>
                                <Text style={styles.protectionHint}>
                                    Saldırılar {protectionCountdown}s daha kapalı
                                </Text>
                            </Animated.View>
                        )}
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {/* Active Power-ups */}
                <ActivePowerUps powerUps={activePowerUps} />

                {/* Game Area */}
                <View
                    ref={gameAreaRef}
                    style={styles.gameArea}
                    {...panResponder.panHandlers}
                    onLayout={(event) => {
                        // Use InteractionManager to ensure layout is complete before measuring
                        InteractionManager.runAfterInteractions(() => {
                            if (gameAreaRef.current) {
                                gameAreaRef.current.measureInWindow((x, y, w, h) => {
                                    // Fallback: If measureInWindow returns invalid values, use layout event values
                                    if (x === undefined || y === undefined || w === 0 || h === 0) {
                                        const layout = event.nativeEvent.layout;
                                        // Approximate screen offset based on common header heights
                                        const estimatedY = Platform.OS === 'android' ? 120 : 100;
                                        setGameAreaLayout({
                                            x: 0,
                                            y: estimatedY,
                                            width: layout.width,
                                            height: layout.height
                                        });
                                    } else {
                                        setGameAreaLayout({ x, y, width: w, height: h });
                                    }
                                });
                            }
                        });
                    }}
                >
                    <Animated.View
                        pointerEvents="box-none"
                        style={[
                            styles.battlefieldLayer,
                            {
                                transform: [
                                    { translateX: cameraShakeAnim },
                                    { scale: battlefieldZoomAnim },
                                ],
                            },
                        ]}
                    >
                        {/* Power-ups */}
                        {powerUps.map(powerUp => (
                            <PowerUp
                                key={powerUp.id}
                                x={powerUp.x}
                                y={powerUp.y}
                                type={powerUp.type}
                                onCollect={() => collectPowerUp(powerUp)}
                            />
                        ))}

                        {/* Planet link network */}
                        {planetLinks.map((link) => {
                            const fromPlanet = planetById.get(link.fromId);
                            const toPlanet = planetById.get(link.toId);
                            if (!fromPlanet || !toPlanet) return null;

                            const dx = toPlanet.x - fromPlanet.x;
                            const dy = toPlanet.y - fromPlanet.y;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                            const isSourceSelected = selectedPlanets.some(p => p.id === link.fromId || p.id === link.toId);
                            const isHoverPath = hoverTarget && selectedPlanets.some((source) => {
                                const sourceMatches = source.id === link.fromId || source.id === link.toId;
                                const targetMatches = hoverTarget === link.fromId || hoverTarget === link.toId;
                                return sourceMatches && targetMatches;
                            });
                            const isActive = Boolean(isSourceSelected || isHoverPath);

                            return (
                                <View
                                    key={`link-${link.fromId}-${link.toId}`}
                                    pointerEvents="none"
                                    style={[
                                        styles.planetLink,
                                        isActive ? styles.planetLinkActive : null,
                                        {
                                            width: length,
                                            left: fromPlanet.x,
                                            top: fromPlanet.y,
                                            transform: [{ rotate: `${angle}deg` }],
                                        },
                                    ]}
                                />
                            );
                        })}

                        {/* Planets */}
                        {planets.map(planet => (
                            <Planet
                                key={planet.id}
                                x={planet.x}
                                y={planet.y}
                                troops={planet.troops}
                                owner={planet.owner}
                                size={planet.size}
                                isBoss={planet.isBoss}
                                isSelected={primarySelectedPlanet?.id === planet.id || selectedPlanets.some(p => p.id === planet.id)}
                                isHoverTarget={hoverTarget === planet.id}
                                hasShield={
                                    (planet.owner === 'player' && activePowerUps.some(p => p.id === 'shield' && Date.now() < p.expiresAt)) ||
                                    (protectionCountdown > 0)
                                }
                                onPress={() => handlePlanetPress(planet)}
                                onLongPress={() => handlePlanetLongPress(planet)}
                                themeColors={currentThemeColors}
                            />
                        ))}

                    {/* Drag arrow indicator */}
                    {isDragging && dragLine && (
                        <View
                            style={styles.dragLineContainer}
                            pointerEvents="none"
                        >
                            {(() => {
                                const dx = dragLine.toX - dragLine.fromX;
                                const dy = dragLine.toY - dragLine.fromY;
                                const length = Math.sqrt(dx * dx + dy * dy);
                                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                                if (length < 20) return null; // Don't show for very short drags

                                return (
                                    <>
                                        {/* Main line */}
                                        <View
                                            style={[
                                                styles.dragLine,
                                                {
                                                    width: length - 15,
                                                    left: dragLine.fromX,
                                                    top: dragLine.fromY - 2,
                                                    transform: [{ rotate: `${angle}deg` }],
                                                    transformOrigin: 'left center',
                                                }
                                            ]}
                                        />
                                        {/* Arrow head */}
                                        <View
                                            style={[
                                                styles.arrowHead,
                                                {
                                                    left: dragLine.toX - 12,
                                                    top: dragLine.toY - 10,
                                                    transform: [{ rotate: `${angle + 90}deg` }],
                                                }
                                            ]}
                                        />
                                    </>
                                );
                            })()}
                        </View>
                    )}

                    <View style={styles.battleHud} pointerEvents="none">
                        <View style={styles.battleHudLeft}>
                            <Text style={styles.battleHudTitle}>Saha durumu</Text>
                            <Text style={styles.battleHudText}>Nötr: {battlefieldStats.neutralPlanets}</Text>
                            <Text style={styles.battleHudText}>Düşman birlik: {battlefieldStats.enemyTroops}</Text>
                        </View>
                        <View style={styles.battleHudRight}>
                            <Text style={styles.battleHudHint}>
                                {selectedPlanets.length > 1
                                    ? `${selectedPlanets.length} gezegen birlesik saldiri icin hazir`
                                    : primarySelectedPlanet
                                        ? 'Bir hedef sec veya surukleyerek saldir'
                                        : 'Bir gezegeni sec, sonra hedefe dokun ya da surukle'}
                            </Text>
                        </View>
                    </View>

                    {selectedPlanets.length > 1 && (
                        <View style={styles.multiSelectBadge}>
                            <Text style={styles.multiSelectText}>
                                {selectedPlanets.length} gezegen seçili
                            </Text>
                        </View>
                    )}

                        {/* Ships */}
                        {ships.map(ship => (
                            <Ship
                                key={ship.id}
                                fromX={ship.fromX}
                                fromY={ship.fromY}
                                toX={ship.toX}
                                toY={ship.toY}
                                troops={ship.troops}
                                owner={ship.owner}
                                duration={ship.duration}
                                speedMultiplier={ship.speedMultiplier}
                                activeShipEmoji={activeShipEmoji}
                                themeColors={currentThemeColors}
                                scale={isCustomGame ? 0.7 : 1.0}
                                onArrival={() => handleShipArrival(ship)}
                            />
                        ))}

                        {/* Explosions */}
                        {explosions.map(exp => (
                            <Explosion
                                key={exp.id}
                                x={exp.x}
                                y={exp.y}
                                color={exp.color}
                                size={exp.size}
                                onComplete={() => removeExplosion(exp.id)}
                            />
                        ))}

                        {impactFlash && (
                            <View
                                pointerEvents="none"
                                style={[
                                    styles.impactFlash,
                                    {
                                        left: impactFlash.x - 34,
                                        top: impactFlash.y - 34,
                                        backgroundColor: impactFlash.color,
                                    },
                                ]}
                            />
                        )}
                    </Animated.View>
                </View>

                {/* Power-up Inventory */}
                <PowerUpInventory
                    inventory={powerUpInventory}
                    onUsePowerUp={usePowerUpFromInventory}
                    disabled={gameState !== 'playing' || showTutorial}
                />

                {/* Tutorial */}
                {showTutorial && (
                    <Tutorial
                        currentStep={tutorialStep}
                        onNext={handleTutorialNext}
                        onSkip={handleTutorialSkip}
                        planets={planets}
                    />
                )}

                {/* Level Intro Tips for levels with configured cards */}
                {showLevelIntro && !showTutorial && (
                    <LevelIntro
                        levelId={levelId}
                        onContinue={handleLevelIntroContinue}
                    />
                )}

                {/* Victory Confetti */}
                {showConfetti && <Confetti count={60} />}

                {/* Power-up Tooltip */}
                {currentTooltip && (
                    <PowerUpTooltip
                        powerUp={currentTooltip}
                        onComplete={() => setCurrentTooltip(null)}
                    />
                )}

                {/* Win/Lose Modal */}
                {gameState !== 'playing' && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={[styles.modalBadge, gameState === 'win' ? styles.modalBadgeWin : styles.modalBadgeLose]}>
                                <Text style={styles.modalBadgeText}>{gameState === 'win' ? 'SEVIYE TEMIZLENDI' : 'SAVAS KAYBEDILDI'}</Text>
                            </View>
                            <Text style={styles.modalEmoji}>
                                {gameState === 'win' ? '🏆' : '☄️'}
                            </Text>
                            <Text style={styles.modalTitle}>
                                {gameState === 'win' ? 'Zafer senin' : 'Hat tekrar kurulabilir'}
                            </Text>
                            <Text style={styles.modalSubtitle}>
                                {gameState === 'win'
                                    ? 'Saha kontrolunu aldin. Simdi baskiyi koruyup bir sonraki duzene gecebilirsin.'
                                    : 'Bu tur ritim sende degildi. Daha erken merkez kontrolu ve daha net hedef secimi deneyelim.'}
                            </Text>
                            <Text style={styles.modalScore}>Skor {score}</Text>

                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryValue}>{gameStats.planetsCaptured}</Text>
                                    <Text style={styles.summaryLabel}>ele gecirme</Text>
                                </View>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryValue}>{shipsSent}</Text>
                                    <Text style={styles.summaryLabel}>gemi gonderimi</Text>
                                </View>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryValue}>{battleSummary.elapsedLabel}</Text>
                                    <Text style={styles.summaryLabel}>sure</Text>
                                </View>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryValue}>%{battleSummary.efficiency}</Text>
                                    <Text style={styles.summaryLabel}>verim</Text>
                                </View>
                            </View>

                            <View style={styles.modalStats}>
                                <Text style={styles.statText}>✨ {gameStats.powerUpsCollected} power-up</Text>
                                <Text style={styles.statText}>⚔️ {battlefieldStats.ownedByEnemies} dusman gezegen</Text>
                            </View>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.retryBtn]}
                                    onPress={handleRetry}
                                >
                                    <Text style={styles.modalBtnText}>Tekrar</Text>
                                </TouchableOpacity>
                                {gameState === 'win' && levelId < getTotalLevels() && (
                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.nextBtn]}
                                        onPress={handleNextLevel}
                                    >
                                        <Text style={styles.modalBtnText}>Sonraki →</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.homeBtn]}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.modalBtnText}>Menü</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </GalaxyBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 6,
    },
    backBtn: {
        fontSize: 26,
        color: theme.colors.white,
        padding: 8,
    },
    headerCenter: {
        alignItems: 'center',
        backgroundColor: 'rgba(6, 12, 22, 0.58)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 8,
    },
    levelTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    headerStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    scoreText: {
        fontSize: 14,
        color: theme.colors.gold,
        fontWeight: '700',
    },
    headerMiniDivider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.14)',
        marginHorizontal: 8,
    },
    headerStatChip: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginHorizontal: 4,
    },
    placeholder: {
        width: 44,
    },
    gameArea: {
        flex: 1,
        position: 'relative',
    },
    battlefieldLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    impactFlash: {
        position: 'absolute',
        width: 68,
        height: 68,
        borderRadius: 34,
        opacity: 0.2,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    battleHud: {
        position: 'absolute',
        top: 10,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 9,
    },
    planetLink: {
        position: 'absolute',
        height: 2,
        borderRadius: 999,
        backgroundColor: 'rgba(158, 184, 255, 0.2)',
        transformOrigin: 'left center',
    },
    planetLinkActive: {
        backgroundColor: 'rgba(136, 210, 255, 0.85)',
        shadowColor: '#7fd0ff',
        shadowOpacity: 0.5,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
    },
    battleHudLeft: {
        backgroundColor: 'rgba(8, 14, 24, 0.66)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 110,
    },
    battleHudRight: {
        maxWidth: '62%',
        backgroundColor: 'rgba(8, 14, 24, 0.66)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    battleHudTitle: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    battleHudText: {
        color: theme.colors.textDim,
        fontSize: 12,
    },
    battleHudHint: {
        color: 'rgba(255,255,255,0.86)',
        fontSize: 12,
        lineHeight: 16,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'rgba(12,16,28,0.96)',
        paddingHorizontal: 28,
        paddingVertical: 30,
        borderRadius: 28,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.12)',
        minWidth: 300,
        maxWidth: 360,
    },
    modalBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 12,
    },
    modalBadgeWin: {
        backgroundColor: 'rgba(34,197,94,0.18)',
    },
    modalBadgeLose: {
        backgroundColor: 'rgba(239,68,68,0.18)',
    },
    modalBadgeText: {
        color: theme.colors.white,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    modalEmoji: {
        fontSize: 54,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.white,
        marginTop: 10,
    },
    modalSubtitle: {
        fontSize: 13,
        lineHeight: 20,
        color: theme.colors.textDim,
        textAlign: 'center',
        marginTop: 8,
    },
    modalScore: {
        fontSize: 22,
        color: theme.colors.gold,
        marginTop: 14,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 18,
        width: '100%',
    },
    summaryCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginBottom: 10,
        alignItems: 'center',
    },
    summaryValue: {
        color: theme.colors.white,
        fontSize: 22,
        fontWeight: '800',
    },
    summaryLabel: {
        color: theme.colors.textDim,
        fontSize: 11,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modalStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
        justifyContent: 'center',
    },
    statText: {
        fontSize: 13,
        color: theme.colors.textDim,
        marginHorizontal: 6,
        marginVertical: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 24,
        justifyContent: 'center',
    },
    modalBtn: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginHorizontal: 6,
        marginVertical: 4,
    },
    retryBtn: {
        backgroundColor: theme.colors.warning,
    },
    nextBtn: {
        backgroundColor: theme.colors.success,
    },
    homeBtn: {
        backgroundColor: theme.colors.primary,
    },
    modalBtnText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    dragLineContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    dragLine: {
        position: 'absolute',
        height: 4,
        backgroundColor: '#7ce5ff',
        opacity: 0.95,
        borderRadius: 3,
        shadowColor: '#7ce5ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.75,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    arrowHead: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 16,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#7ce5ff',
        opacity: 0.96,
        shadowColor: '#7ce5ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.75,
        shadowRadius: 6,
        elevation: 8,
    },
    multiSelectBadge: {
        position: 'absolute',
        top: 84,
        left: '50%',
        marginLeft: -82,
        backgroundColor: 'rgba(15, 106, 173, 0.92)',
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    multiSelectText: {
        color: theme.colors.white,
        fontSize: 13,
        fontWeight: 'bold',
    },
    protectionContainer: {
        alignItems: 'center',
        marginTop: 4,
    },
    protectionText: {
        color: '#7ce5ff',
        fontSize: 15,
        fontWeight: 'bold',
        textShadowColor: 'rgba(124, 229, 255, 0.55)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    protectionHint: {
        color: 'rgba(124, 229, 255, 0.85)',
        fontSize: 12,
        marginTop: 2,
        fontWeight: '600',
    },
    protectionBannerContainer: {
        alignItems: 'center',
        marginTop: 4,
        zIndex: 100, // Ensure it's on top
    },
});

export default GameScreen;
