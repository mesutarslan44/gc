// Active Power-up indicator bar
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ActivePowerUps = ({ powerUps }) => {
    if (!powerUps || powerUps.length === 0) return null;

    const now = Date.now();

    return (
        <View style={styles.container}>
            {powerUps.map((powerUp, index) => {
                const remaining = powerUp.expiresAt - now;
                const progress = remaining / powerUp.duration;

                if (progress <= 0) return null;

                return (
                    <View key={`${powerUp.id}-${index}`} style={styles.powerUpItem}>
                        <View style={[styles.iconContainer, { backgroundColor: powerUp.color + '40' }]}>
                            <Text style={styles.emoji}>{powerUp.emoji}</Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: `${progress * 100}%`,
                                        backgroundColor: powerUp.color,
                                    }
                                ]}
                            />
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 10,
        right: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        zIndex: 50,
    },
    powerUpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 4,
        paddingRight: 8,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    emoji: {
        fontSize: 14,
    },
    progressContainer: {
        width: 50,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
});

export default ActivePowerUps;
