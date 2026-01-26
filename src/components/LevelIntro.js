// Level Intro component - Shows power-up tips for first 5 levels
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import theme from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Level-specific tips and power-up explanations
export const LEVEL_INTROS = {
    1: {
        title: 'Seviye 1: İlk Adım 🚀',
        tip: 'Temel oynanış',
        description: 'Kendi gezegenine dokun, sonra hedef gezegene dokun. Askerlerinin yarısı saldırıya gider!',
        emoji: '👆',
    },
    2: {
        title: 'Seviye 2: Genişleme 🌍',
        tip: 'Nötr gezegenler',
        description: 'Önce nötr (gri) gezegenleri ele geçir! Az asker gerektirir ve üs sayını artırır.',
        emoji: '⚪',
    },
    3: {
        title: 'Seviye 3: Power-Up\'lar ✨',
        tip: '🛡️ Kalkan Gücü',
        description: 'Kalkan power-up\'ı gezegenlerini 8 saniye düşman saldırılarından korur!',
        emoji: '🛡️',
        powerUp: 'shield',
    },
    4: {
        title: 'Seviye 4: Hız Avantajı ⚡',
        tip: '⚡ Hız Gücü',
        description: 'Hız power-up\'ı gemilerini 2 kat hızlandırır! Düşmandan önce hedeflere ulaş.',
        emoji: '⚡',
        powerUp: 'speed',
    },
    5: {
        title: 'Seviye 5: Çift Güç! 💥',
        tip: '💥 Çift Güç',
        description: 'Çift Güç power-up\'ı saldırılarını 2 kat güçlendirir! 10 askerle 20 asker gücüyle vur.',
        emoji: '💥',
        powerUp: 'double',
    },
};

// Additional tips for later levels (optional, shown randomly)
export const GAMEPLAY_TIPS = [
    { tip: '💡 Birden fazla gezegenden aynı anda saldır!', description: 'Sürükle-bırak ile çoklu seçim yap.' },
    { tip: '🚀 Hızlı Üretim power-up\'ı 3x asker üretir!', description: 'Asker sayını hızla artır.' },
    { tip: '💣 Bomba tüm düşmanlarda 10 asker azaltır!', description: 'Kritik anlarda kullan.' },
    { tip: '👥 Klonlama askerlerini 2x yapar!', description: 'Büyük saldırı öncesi kullan.' },
    { tip: '⏱️ Düşman sürekli güçlenir!', description: 'Hızlı hareket et, bekletme.' },
];

const LevelIntro = ({ levelId, onContinue }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const emojiAnim = useRef(new Animated.Value(0)).current;

    const intro = LEVEL_INTROS[levelId];

    // If no intro for this level, don't show
    if (!intro) {
        return null;
    }

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start();

        // Emoji bounce animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(emojiAnim, { toValue: -10, duration: 400, useNativeDriver: true }),
                Animated.timing(emojiAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <Animated.View
                style={[
                    styles.card,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                {/* Level badge */}
                <View style={styles.levelBadge}>
                    <Text style={styles.levelNumber}>{levelId}</Text>
                </View>

                {/* Animated emoji */}
                <Animated.Text
                    style={[
                        styles.bigEmoji,
                        { transform: [{ translateY: emojiAnim }] }
                    ]}
                >
                    {intro.emoji}
                </Animated.Text>

                {/* Title */}
                <Text style={styles.title}>{intro.title}</Text>

                {/* Tip highlight */}
                <View style={styles.tipBox}>
                    <Text style={styles.tipLabel}>💡 İPUCU</Text>
                    <Text style={styles.tipText}>{intro.tip}</Text>
                </View>

                {/* Description */}
                <Text style={styles.description}>{intro.description}</Text>

                {/* Power-up indicator if applicable */}
                {intro.powerUp && (
                    <View style={styles.powerUpHint}>
                        <Text style={styles.powerUpText}>
                            📱 Ekranın altındaki butonlardan kullanabilirsin!
                        </Text>
                    </View>
                )}

                {/* Continue button */}
                <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
                    <Text style={styles.continueText}>Anladım, Başla! 🚀</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    card: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(20, 20, 50, 0.98)',
        borderRadius: 24,
        padding: 28,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        maxWidth: 360,
    },
    levelBadge: {
        position: 'absolute',
        top: -20,
        backgroundColor: theme.colors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.white,
    },
    levelNumber: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    bigEmoji: {
        fontSize: 60,
        marginTop: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.white,
        textAlign: 'center',
        marginBottom: 16,
    },
    tipBox: {
        backgroundColor: 'rgba(0, 212, 255, 0.15)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 255, 0.3)',
        width: '100%',
    },
    tipLabel: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        textAlign: 'center',
    },
    tipText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: theme.colors.textDim,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    powerUpHint: {
        backgroundColor: 'rgba(255, 187, 36, 0.15)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 187, 36, 0.3)',
    },
    powerUpText: {
        color: theme.colors.gold || '#fbbf24',
        fontSize: 13,
        textAlign: 'center',
    },
    continueBtn: {
        backgroundColor: theme.colors.success,
        paddingVertical: 16,
        paddingHorizontal: 36,
        borderRadius: 14,
        marginTop: 8,
    },
    continueText: {
        color: theme.colors.white,
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default LevelIntro;
