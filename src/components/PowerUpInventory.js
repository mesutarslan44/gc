// Power-up Inventory Component - Shows available power-ups to use
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../constants/theme';
import { POWER_UP_TYPES } from '../game/powerUps';

const PowerUpInventory = ({ inventory, onUsePowerUp, disabled }) => {
    const powerUpList = Object.entries(inventory).filter(([_, count]) => count > 0);

    if (powerUpList.length === 0) return null;

    const getPowerUpInfo = (id) => {
        return Object.values(POWER_UP_TYPES).find(p => p.id === id);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎒 Güçler</Text>
            <View style={styles.itemsRow}>
                {powerUpList.map(([id, count]) => {
                    const powerUp = getPowerUpInfo(id);
                    if (!powerUp) return null;

                    return (
                        <TouchableOpacity
                            key={id}
                            style={[
                                styles.item,
                                { borderColor: powerUp.color },
                                disabled && styles.itemDisabled,
                            ]}
                            onPress={() => !disabled && onUsePowerUp(id)}
                            disabled={disabled}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.emoji}>{powerUp.emoji}</Text>
                            <View style={[styles.countBadge, { backgroundColor: powerUp.color }]}>
                                <Text style={styles.count}>{count}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80,
        left: 10,
        right: 10,
        alignItems: 'center',
        zIndex: 50,
    },
    title: {
        color: theme.colors.textDim,
        fontSize: 12,
        marginBottom: 6,
    },
    itemsRow: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
    },
    item: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDisabled: {
        opacity: 0.5,
    },
    emoji: {
        fontSize: 26,
    },
    countBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    count: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default PowerUpInventory;
