// Timed Mode Screen - Race against time to capture planets!
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GalaxyBackground from '../components/GalaxyBackground';
import Planet from '../components/Planet';
import Ship from '../components/Ship';
import Explosion from '../components/Explosion';
import Confetti from '../components/Confetti';
import theme from '../constants/theme';
import { calculateCombat, getTroopsToSend, calculateTravelTime } from '../game/gameLogic';

const { width } = Dimensions.get('window');
const GAME_DURATION = 120;

// Generate random planets for timed mode
const generateRandomPlanets = () => {
    const planets = [];
    const planetCount = 8 + Math.floor(Math.random() * 3);

    planets.push({
        id: 'p0',
        x: 50,
        y: 100,
        troops: 30,
        owner: 'player',
        size: 'medium',
    });

    for (let i = 1; i < planetCount; i++) {
        let x, y, validPosition;
        let attempts = 0;

        do {
            x = 30 + Math.random() * (width - 100);
            y = 50 + Math.random() * 350;
            validPosition = true;

            for (const p of planets) {
                const dist = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
                if (dist < 85) {
                    validPosition = false;
                    break;
                }
            }
            attempts++;
        } while (!validPosition && attempts < 50);

        const owner = i < 2 ? 'enemy' : (Math.random() < 0.5 ? 'neutral' : 'enemy');

        planets.push({
            id: `p${i}`,
            x,
            y,
            troops: 10 + Math.floor(Math.random() * 20),
            owner,
            size: Math.random() < 0.2 ? 'large' : 'medium',
        });
    }

    return planets;
};

const TimedModeScreen = ({ navigation }) => {
    const [planets, setPlanets] = useState(() => generateRandomPlanets());
    const [ships, setShips] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [planetsCaptured, setPlanetsCaptured] = useState(0);
    const [gameState, setGameState] = useState('playing');
    const [showConfetti, setShowConfetti] = useState(false);

    const shipIdCounter = useRef(0);
    const explosionIdCounter = useRef(0);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('ended');
                    setShowConfetti(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const regen = setInterval(() => {
            setPlanets(prev => prev.map(p =>
                p.owner !== 'neutral' ? { ...p, troops: p.troops + 1 } : p
            ));
        }, 1500);

        return () => clearInterval(regen);
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const ai = setInterval(() => {
            const enemyPlanets = planets.filter(p => p.owner === 'enemy' && p.troops > 15);
            const targets = planets.filter(p => p.owner !== 'enemy');

            if (enemyPlanets.length > 0 && targets.length > 0) {
                const from = enemyPlanets[Math.floor(Math.random() * enemyPlanets.length)];
                const to = targets[Math.floor(Math.random() * targets.length)];
                sendShips(from.id, to.id, 'enemy');
            }
        }, 3500);

        return () => clearInterval(ai);
    }, [planets, gameState]);

    const handlePlanetPress = (planet) => {
        if (gameState !== 'playing') return;
        Haptics.selectionAsync();

        if (selectedPlanet) {
            if (selectedPlanet.id !== planet.id && selectedPlanet.owner === 'player') {
                sendShips(selectedPlanet.id, planet.id, 'player');
            }
            setSelectedPlanet(null);
        } else if (planet.owner === 'player' && planet.troops > 1) {
            setSelectedPlanet(planet);
        }
    };

    const sendShips = (fromId, toId, owner) => {
        const from = planets.find(p => p.id === fromId);
        const to = planets.find(p => p.id === toId);
        if (!from || !to) return;

        const troops = getTroopsToSend(from.troops);
        if (troops < 1) return;

        setPlanets(prev => prev.map(p =>
            p.id === fromId ? { ...p, troops: p.troops - troops } : p
        ));

        setShips(prev => [...prev, {
            id: `ship-${shipIdCounter.current++}`,
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            troops,
            owner,
            targetId: toId,
            duration: calculateTravelTime(from.x, from.y, to.x, to.y),
            speedMultiplier: 1,
        }]);
    };

    const handleShipArrival = useCallback((ship) => {
        setShips(prev => prev.filter(s => s.id !== ship.id));

        setPlanets(prev => prev.map(p => {
            if (p.id === ship.targetId) {
                const result = calculateCombat(ship.troops, p.troops, ship.owner, p.owner);

                if (result.newOwner !== p.owner && ship.owner === 'player') {
                    setPlanetsCaptured(c => c + 1);
                    const id = `exp-${explosionIdCounter.current++}`;
                    setExplosions(e => [...e, { id, x: p.x, y: p.y, color: theme.colors.player, size: 'medium' }]);
                }

                return { ...p, owner: result.newOwner, troops: result.remainingTroops };
            }
            return p;
        }));
    }, []);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const playerPlanets = planets.filter(p => p.owner === 'player').length;

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.timerBox}>
                        <Text style={[styles.timer, timeLeft <= 10 && styles.timerLow]}>
                            ⏱️ {formatTime(timeLeft)}
                        </Text>
                    </View>
                    <View style={styles.stats}>
                        <Text style={styles.stat}>🌍 {playerPlanets}</Text>
                        <Text style={styles.stat}>⭐ {planetsCaptured}</Text>
                    </View>
                </View>

                <View style={styles.gameArea}>
                    {planets.map(planet => (
                        <Planet
                            key={planet.id}
                            x={planet.x}
                            y={planet.y}
                            troops={planet.troops}
                            owner={planet.owner}
                            size={planet.size}
                            isSelected={selectedPlanet?.id === planet.id}
                            onPress={() => handlePlanetPress(planet)}
                        />
                    ))}

                    {ships.map(ship => (
                        <Ship
                            key={ship.id}
                            {...ship}
                            onArrival={() => handleShipArrival(ship)}
                        />
                    ))}

                    {explosions.map(exp => (
                        <Explosion
                            key={exp.id}
                            {...exp}
                            onComplete={() => setExplosions(prev => prev.filter(e => e.id !== exp.id))}
                        />
                    ))}
                </View>

                {gameState === 'ended' && (
                    <View style={styles.modal}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>⏱️ Süre Doldu!</Text>
                            <Text style={styles.score}>{playerPlanets * 100 + planetsCaptured * 50}</Text>
                            <Text style={styles.modalInfo}>🌍 {playerPlanets} gezegen • ⭐ {planetsCaptured} fetih</Text>
                            <TouchableOpacity
                                style={styles.playAgain}
                                onPress={() => {
                                    setPlanets(generateRandomPlanets());
                                    setShips([]);
                                    setExplosions([]);
                                    setTimeLeft(GAME_DURATION);
                                    setPlanetsCaptured(0);
                                    setGameState('playing');
                                    setShowConfetti(false);
                                    setSelectedPlanet(null);
                                }}
                            >
                                <Text style={styles.playAgainText}>🔄 Tekrar Oyna</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.exitText}>Ana Menü</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {showConfetti && <Confetti />}
            </SafeAreaView>
        </GalaxyBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: { fontSize: 28, color: '#fff', padding: 8 },
    timerBox: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    timer: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    timerLow: { color: '#ef4444' },
    stats: { flexDirection: 'row', gap: 12 },
    stat: { color: '#fff', fontSize: 16, fontWeight: '600' },
    gameArea: { flex: 1, position: 'relative' },
    modal: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '85%',
        borderWidth: 2,
        borderColor: '#6366f1',
    },
    modalTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
    score: { fontSize: 48, fontWeight: 'bold', color: '#fbbf24', marginBottom: 10 },
    modalInfo: { color: '#fff', fontSize: 16, marginBottom: 20 },
    playAgain: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        marginBottom: 10,
    },
    playAgainText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    exitText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 10 },
});

export default TimedModeScreen;
