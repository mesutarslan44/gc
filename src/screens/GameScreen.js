import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    makeAIDecision,
    makeAllAIDecisions,
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

    // Animation refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
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

    // Keep refs in sync with state
    useEffect(() => { planetsRef.current = planets; }, [planets]);
    useEffect(() => { selectedPlanetsRef.current = selectedPlanets; }, [selectedPlanets]);
    useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
    useEffect(() => { activePowerUpsRef.current = activePowerUps; }, [activePowerUps]);
    useEffect(() => { gameAreaLayoutRef.current = gameAreaLayout; }, [gameAreaLayout]);

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
        dragStartRef.current = null;
    };

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
                    setSelectedPlanets([touchedPlanet]);
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

                // Check if passing over other player planets to add them
                const hoverPlayerPlanet = findPlanetAt(touchX, touchY, true);
                if (hoverPlayerPlanet && !selectedPlanetsRef.current.find(p => p.id === hoverPlayerPlanet.id)) {
                    Haptics.selectionAsync();
                    setSelectedPlanets(prev => [...prev, hoverPlayerPlanet]);
                }

                // Check for ANY planet (target highlight)
                const anyHoverPlanet = findPlanetAt(touchX, touchY, false);
                if (anyHoverPlanet && !selectedPlanetsRef.current.find(p => p.id === anyHoverPlanet.id)) {
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
                    hapticsManager.impact(Haptics.ImpactFeedbackStyle.Medium);
                    selectedPlanetsRef.current.forEach(sourcePlanet => {
                        if (sourcePlanet.id !== targetPlanet.id && sourcePlanet.troops > 1) {
                            sendShips(sourcePlanet.id, targetPlanet.id, 'player');
                        }
                    });
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

            // Show level intro for first 5 levels (after tutorial is done)
            if (levelId <= 5 && LEVEL_INTROS[levelId]) {
                setShowLevelIntro(true);
            }
        };
        checkTutorial();
    }, [levelId]);

    // Initialize level
    useEffect(() => {
        if (level) {
            setPlanets(level.planets.map(p => ({ ...p })));
            setGameState('playing');
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
                    // FIX: Only player gets the regen bonus!
                    const regenAmount = (hasRegen && p.owner === 'player') ? 3 : 1;
                    return { ...p, troops: p.troops + regenAmount };
                }
                return p;
            }));
        }, 1500); // Fixed interval

        return () => clearInterval(regenIntervalRef.current);
    }, [gameState, showTutorial]); // Removed activePowerUps from deps

    // AI logic - uses ref to avoid resetting interval on every planets change
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
                // Classic mode
                const decision = makeAIDecision(planetsRef.current);
                if (decision) {
                    sendShips(decision.from, decision.to, 'enemy');
                }
            }
        }, level.aiSpeed);

        return () => clearInterval(aiIntervalRef.current);
    }, [gameState, level, showTutorial, freeForAll]); // Removed planets from deps - use ref instead

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
        if (showTutorial) return;
        Haptics.selectionAsync();

        // If we have planets selected
        if (selectedPlanets.length > 0) {
            // Check if this planet is already in selection
            const isAlreadySelected = selectedPlanets.find(p => p.id === planet.id);

            if (isAlreadySelected) {
                // TOGGLE: Remove from selection (deselect)
                const newSelection = selectedPlanets.filter(p => p.id !== planet.id);
                setSelectedPlanets(newSelection);
                if (newSelection.length === 0) {
                    setSelectedPlanet(null);
                } else {
                    setSelectedPlanet(newSelection[0]);
                }
            } else {
                // Planet is NOT in selection - SEND troops to it (works for own planets too!)
                hapticsManager.impact(Haptics.ImpactFeedbackStyle.Medium);
                selectedPlanets.forEach(sourcePlanet => {
                    if (sourcePlanet.id !== planet.id && sourcePlanet.troops > 1) {
                        sendShips(sourcePlanet.id, planet.id, 'player');
                    }
                });
                setSelectedPlanets([]);
                setSelectedPlanet(null);
            }
            return;
        }

        // Single select mode (backward compatible)
        if (selectedPlanet) {
            if (selectedPlanet.id !== planet.id && selectedPlanet.owner === 'player') {
                sendShips(selectedPlanet.id, planet.id, 'player');
            }
            setSelectedPlanet(null);
        } else {
            if (planet.owner === 'player' && planet.troops > 1) {
                setSelectedPlanet(planet);
                // Also add to multi-select for the new system
                setSelectedPlanets([planet]);
            }
        }
    };

    // Long press: Add planet to multi-selection
    const handlePlanetLongPress = (planet) => {
        if (showTutorial || gameState !== 'playing') return;
        if (planet.owner !== 'player' || planet.troops <= 1) return;

        hapticsManager.impact(Haptics.ImpactFeedbackStyle.Light);

        // Add to selection if not already there
        if (!selectedPlanets.find(p => p.id === planet.id)) {
            setSelectedPlanets(prev => [...prev, planet]);
            if (!selectedPlanet) {
                setSelectedPlanet(planet);
            }
        }
    };

    // Send ships from multiple selected planets to one target
    const sendFromMultiplePlanets = (targetPlanet) => {
        if (selectedPlanets.length === 0) return;

        hapticsManager.impact(Haptics.ImpactFeedbackStyle.Medium);

        selectedPlanets.forEach(sourcePlanet => {
            if (sourcePlanet.id !== targetPlanet.id && sourcePlanet.troops > 1) {
                sendShips(sourcePlanet.id, targetPlanet.id, 'player');
            }
        });

        setSelectedPlanets([]);
    };

    // Find planet at given coordinates
    const findPlanetAtPosition = (x, y) => {
        return planets.find(planet => {
            const dx = x - planet.x - 30; // Account for planet center
            const dy = y - planet.y - 30;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (planet.size || 50);
        });
    };

    // Handle drag start on a planet
    const handleDragStart = (planet, gestureState) => {
        if (showTutorial || gameState !== 'playing') return;
        if (planet.owner !== 'player' || planet.troops <= 1) return;

        hapticsManager.selection();
        dragStartRef.current = planet;
        setIsDragging(true);

        // Add to multi-select if not already selected
        if (!selectedPlanets.find(p => p.id === planet.id)) {
            setSelectedPlanets(prev => [...prev, planet]);
        }

        setDragLine({
            fromX: planet.x + 25,
            fromY: planet.y + 25,
            toX: planet.x + 25,
            toY: planet.y + 25
        });
    };

    // Handle drag move
    const handleDragMove = (gestureState) => {
        if (!isDragging || !dragStartRef.current) return;

        // Use dynamic game area offset instead of hardcoded value
        const touchX = gestureState.moveX - gameAreaLayout.x;
        const touchY = gestureState.moveY - gameAreaLayout.y;

        setDragLine(prev => prev ? { ...prev, toX: touchX, toY: touchY } : null);

        setDragLine(prev => prev ? { ...prev, toX: touchX, toY: touchY } : null);

        // Highlight potential target but DO NOT add to selection automatically
        // This fixes the issue where dragging across planets selects them all
        const hoverPlanet = findPlanetAtPosition(touchX, touchY);
        if (hoverPlanet && hoverPlanet.id !== dragStartRef.current?.id) {
            setHoverTarget(hoverPlanet.id);
        } else {
            setHoverTarget(null);
        }
    };

    // Handle drag end
    const handleDragEnd = (gestureState) => {
        if (!isDragging) return;

        // Use dynamic game area offset instead of hardcoded value
        const touchX = gestureState.moveX - gameAreaLayout.x;
        const touchY = gestureState.moveY - gameAreaLayout.y;

        const targetPlanet = findPlanetAtPosition(touchX, touchY);

        if (targetPlanet && selectedPlanets.length > 0) {
            // Send from all selected planets to target
            sendFromMultiplePlanets(targetPlanet);
        }

        setIsDragging(false);
        setDragLine(null);
        dragStartRef.current = null;
    };

    const sendShips = (fromId, toId, owner) => {
        // Use planetsRef to get current planets (avoids stale closure issues with AI)
        const currentPlanets = planetsRef.current;
        const fromPlanet = currentPlanets.find(p => p.id === fromId);
        const toPlanet = currentPlanets.find(p => p.id === toId);

        if (!fromPlanet || !toPlanet) return;
        if (fromPlanet.owner !== owner) return;

        const troopsToSend = getTroopsToSend(fromPlanet.troops);
        if (troopsToSend < 1) return;

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
                    return prev.filter(s => s.id !== ship.id);
                }

                setPlanets(prevPlanets => prevPlanets.map(p => {
                    if (p.id === shipToUse.targetId) {
                        const result = calculateCombat(effectiveTroops, p.troops, shipToUse.owner, p.owner);

                        if (result.newOwner !== p.owner) {
                            if (shipToUse.owner === 'player' && p.owner !== 'player') {
                                setScore(s => s + SCORE_VALUES.PLANET_CAPTURED);
                                setGameStats(gs => ({ ...gs, planetsCaptured: gs.planetsCaptured + 1 }));
                            }
                            const explosionColor = shipToUse.owner === 'player'
                                ? (activeTheme ? activeTheme.colors.player : theme.colors.player)
                                : (currentThemeColors && currentThemeColors[shipToUse.owner] ? currentThemeColors[shipToUse.owner] : theme.colors.enemy);
                            addExplosion(p.x, p.y, explosionColor, p.isBoss ? 'large' : 'medium');
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

    const handleRetry = () => {
        setPlanets(level.planets.map(p => ({ ...p })));
        setGameState('playing');
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
                        <Text style={styles.scoreText}>⭐ {score}</Text>
                        {/* Protection Banner - Enhanced Visibility */}
                        {protectionCountdown > 0 && (
                            <Animated.View style={[styles.protectionContainer, { transform: [{ scale: pulseAnim }] }]}>
                                <Text style={styles.protectionText}>🛡️ KORUMA AKTİF! 🛡️</Text>
                                <Text style={styles.protectionHint}>
                                    Saldırılar {protectionCountdown}s kilitli
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
                            isSelected={selectedPlanet?.id === planet.id || selectedPlanets.some(p => p.id === planet.id)}
                            isHoverTarget={hoverTarget === planet.id}
                            hasShield={
                                (planet.owner === 'player' && activePowerUps.some(p => p.id === 'shield' && Date.now() < p.expiresAt)) ||
                                (protectionCountdown > 0) // Also show shield during level start protection
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

                    {/* Multi-select indicator */}
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
                </View>

                {/* Power-up Inventory */}
                <PowerUpInventory
                    inventory={powerUpInventory}
                    onUsePowerUp={usePowerUpFromInventory}
                    disabled={gameState !== 'playing' || showTutorial}
                />

                {/* Instructions */}
                <View style={styles.instructions}>
                    <Text style={styles.instructionText}>
                        {selectedPlanet
                            ? '🎯 Hedef gezegene dokun'
                            : '👆 Kendi gezegenine dokun'}
                    </Text>
                </View>

                {/* Tutorial */}
                {showTutorial && (
                    <Tutorial
                        currentStep={tutorialStep}
                        onNext={handleTutorialNext}
                        onSkip={handleTutorialSkip}
                        planets={planets}
                    />
                )}

                {/* Level Intro Tips for first 5 levels */}
                {showLevelIntro && !showTutorial && (
                    <LevelIntro
                        levelId={levelId}
                        onContinue={() => setShowLevelIntro(false)}
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
                            <Text style={styles.modalEmoji}>
                                {gameState === 'win' ? '🏆' : '💥'}
                            </Text>
                            <Text style={styles.modalTitle}>
                                {gameState === 'win' ? 'Zafer!' : 'Yenildin!'}
                            </Text>
                            <Text style={styles.modalScore}>Skor: {score}</Text>
                            <View style={styles.modalStats}>
                                <Text style={styles.statText}>🌍 {gameStats.planetsCaptured} gezegen</Text>
                                <Text style={styles.statText}>✨ {gameStats.powerUpsCollected} power-up</Text>
                                <Text style={styles.statText}>🚀 {shipsSent} gemi</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    backBtn: {
        fontSize: 28,
        color: theme.colors.white,
        padding: 8,
    },
    headerCenter: {
        alignItems: 'center',
    },
    levelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    scoreText: {
        fontSize: 14,
        color: theme.colors.gold,
        marginTop: 2,
    },
    placeholder: {
        width: 44,
    },
    gameArea: {
        flex: 1,
        position: 'relative',
    },
    instructions: {
        padding: 16,
        alignItems: 'center',
    },
    instructionText: {
        color: theme.colors.textDim,
        fontSize: 16,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'rgba(20,20,40,0.95)',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        minWidth: 280,
    },
    modalEmoji: {
        fontSize: 64,
    },
    modalTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.white,
        marginTop: 16,
    },
    modalScore: {
        fontSize: 24,
        color: theme.colors.gold,
        marginTop: 8,
    },
    modalStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
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
        height: 5,
        backgroundColor: '#00d4ff',
        opacity: 1,
        borderRadius: 3,
        shadowColor: '#00d4ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    arrowHead: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#00d4ff',
        opacity: 1,
        shadowColor: '#00d4ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 10,
    },
    multiSelectBadge: {
        position: 'absolute',
        top: 10,
        left: '50%',
        marginLeft: -60,
        backgroundColor: 'rgba(0, 212, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
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
        color: '#00d4ff',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 212, 255, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    protectionHint: {
        color: 'rgba(0, 212, 255, 0.9)',
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
