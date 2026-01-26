// Tutorial System for Galaxy Conquest
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import theme from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Tutorial steps for first-time players
export const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: 'Galaksi Fatihi\'ne Hoş Geldin! 🚀',
        message: 'Bu oyunda gezegenleri ele geçirerek galaksiyi fethedeceksin.',
        position: 'center',
        highlight: null,
    },
    {
        id: 'protection',
        title: '🛡️ Başlangıç Koruması',
        message: 'Oyunun başında kısa bir süre koruma altındasın. Bu sürede saldıramazsın ama asker biriktirebilirsin!',
        position: 'center',
        highlight: null,
    },
    {
        id: 'your_planet',
        title: 'Senin Gezegenen 🌍',
        message: 'Yeşil gezegenler sana ait. Üzerindeki sayı asker sayısını gösterir.',
        position: 'top',
        highlight: 'player',
        arrow: 'down',
    },
    {
        id: 'enemy_planet',
        title: 'Düşman Gezegeni 👾',
        message: 'Kırmızı gezegenler düşmana ait. Onları ele geçirmelisin!',
        position: 'bottom',
        highlight: 'enemy',
        arrow: 'up',
    },
    {
        id: 'neutral_planet',
        title: 'Nötr Gezegenler ⚪',
        message: 'Gri gezegenler kimseye ait değil. Kolay hedefler!',
        position: 'center',
        highlight: 'neutral',
    },
    {
        id: 'attack',
        title: 'Nasıl Saldırılır? ⚔️',
        message: 'Önce kendi gezegenine dokun, sonra hedef gezegene dokun. Askerlerin yarısı gönderilir.',
        position: 'center',
        highlight: null,
    },
    {
        id: 'powerups',
        title: 'Power-up\'lar ✨',
        message: 'Oyun sırasında power-up\'lar belirir. Topla ve avantaj kazan! Kalkan gücü düşman saldırısını 10 azaltır.',
        position: 'center',
        highlight: null,
    },
    {
        id: 'win',
        title: 'Kazanmak İçin 🏆',
        message: 'Tüm düşman gezegenlerini ele geçir! Bol şans!',
        position: 'center',
        highlight: null,
    },
];

const Tutorial = ({ currentStep, onNext, onSkip, planets }) => {
    const step = TUTORIAL_STEPS[currentStep];
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const arrowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start();

        // Arrow bounce animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(arrowAnim, { toValue: 10, duration: 500, useNativeDriver: true }),
                Animated.timing(arrowAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    }, [currentStep]);

    if (!step) return null;

    const isLast = currentStep === TUTORIAL_STEPS.length - 1;

    const getPositionStyle = () => {
        switch (step.position) {
            case 'top': return { top: 100 };
            case 'bottom': return { bottom: 150 };
            default: return { top: height * 0.35 };
        }
    };

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            {/* Highlight arrow for specific planet types */}
            {step.arrow && step.highlight && (
                <Animated.View
                    style={[
                        styles.arrow,
                        step.arrow === 'down' ? styles.arrowDown : styles.arrowUp,
                        { transform: [{ translateY: arrowAnim }] },
                    ]}
                >
                    <Text style={styles.arrowText}>{step.arrow === 'down' ? '👇' : '👆'}</Text>
                </Animated.View>
            )}

            {/* Tutorial card */}
            <Animated.View
                style={[
                    styles.card,
                    getPositionStyle(),
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <Text style={styles.stepIndicator}>
                    {currentStep + 1} / {TUTORIAL_STEPS.length}
                </Text>
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.message}>{step.message}</Text>

                <View style={styles.buttons}>
                    {!isLast && (
                        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                            <Text style={styles.skipText}>Atla</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.nextBtn, isLast && styles.startBtn]}
                        onPress={onNext}
                    >
                        <Text style={styles.nextText}>
                            {isLast ? 'Başla! 🚀' : 'Devam →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    arrow: {
        position: 'absolute',
        zIndex: 1001,
    },
    arrowDown: {
        top: 180,
        left: 80,
    },
    arrowUp: {
        bottom: 200,
        right: 100,
    },
    arrowText: {
        fontSize: 40,
    },
    card: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: 'rgba(20, 20, 50, 0.98)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    stepIndicator: {
        color: theme.colors.textDim,
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.white,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: theme.colors.textDim,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 12,
    },
    skipBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    skipText: {
        color: theme.colors.textDim,
        fontSize: 16,
    },
    nextBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
    },
    startBtn: {
        backgroundColor: theme.colors.success,
        paddingHorizontal: 40,
    },
    nextText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Tutorial;
