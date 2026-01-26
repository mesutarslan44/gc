// Settings Screen for Galaxy Conquest
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import soundManager from '../utils/SoundManager';
import hapticsManager from '../utils/HapticsManager';
import GalaxyBackground from '../components/GalaxyBackground';
import theme from '../constants/theme';
import { ProgressManager, UNLOCKABLES } from '../utils/ProgressManager';

const SETTINGS_KEY = '@galaxy_conquest_settings';

const defaultSettings = {
    soundEnabled: true,
    hapticEnabled: true,
    showTutorial: true,
    difficulty: 'normal',
};

const SettingsScreen = ({ navigation }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [unlocks, setUnlocks] = useState({ ships: ['default'], themes: ['default'] });
    const [active, setActive] = useState({ ship: 'default', theme: 'default' });

    useEffect(() => {
        loadSettings();
        loadCustomization();
    }, []);

    const loadCustomization = async () => {
        const unlocksData = await ProgressManager.getUnlocks();
        setUnlocks(unlocksData);
        const activeData = await ProgressManager.getActive();
        setActive(activeData);
    };

    const selectItem = async (type, itemId) => {
        hapticsManager.selection();
        await ProgressManager.setActive(type, itemId);
        setActive(prev => ({ ...prev, [type]: itemId }));
        Alert.alert('✅ Aktif', `${type === 'ship' ? 'Gemi' : 'Tema'} değiştirildi!`);
    };

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const loadedSettings = JSON.parse(stored);
                setSettings(loadedSettings);
                // Sync managers
                soundManager.setEnabled(loadedSettings.soundEnabled ?? true);
                hapticsManager.setEnabled(loadedSettings.hapticEnabled ?? true);
            }
        } catch (error) {
            console.log('Settings load error:', error);
        }
    };

    const saveSettings = async (newSettings) => {
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
            // Sync managers immediately
            soundManager.setEnabled(newSettings.soundEnabled);
            hapticsManager.setEnabled(newSettings.hapticEnabled);
        } catch (error) {
            console.log('Settings save error:', error);
        }
    };

    const toggleSetting = (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        saveSettings(newSettings);
    };

    const resetProgress = () => {
        Alert.alert(
            'İlerlemeyi Sıfırla',
            'Tüm ilerlemeniz silinecek. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Başarılı', 'İlerleme sıfırlandı!');
                        } catch (error) {
                            Alert.alert('Hata', 'Sıfırlama başarısız oldu.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Ayarlar</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Sound Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔊 Ses & Titreşim</Text>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Ses Efektleri</Text>
                                <Text style={styles.settingDesc}>Oyun içi ses efektleri</Text>
                            </View>
                            <Switch
                                value={settings.soundEnabled}
                                onValueChange={() => toggleSetting('soundEnabled')}
                                trackColor={{ false: '#444', true: theme.colors.primary }}
                                thumbColor={settings.soundEnabled ? theme.colors.white : '#888'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Titreşim</Text>
                                <Text style={styles.settingDesc}>Haptic geri bildirim</Text>
                            </View>
                            <Switch
                                value={settings.hapticEnabled}
                                onValueChange={() => toggleSetting('hapticEnabled')}
                                trackColor={{ false: '#444', true: theme.colors.primary }}
                                thumbColor={settings.hapticEnabled ? theme.colors.white : '#888'}
                            />
                        </View>
                    </View>

                    {/* Customization Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎨 Özelleştirme</Text>

                        <Text style={styles.subsectionTitle}>Aktif Gemi</Text>
                        <View style={styles.itemRow}>
                            {UNLOCKABLES.ships.filter(s => unlocks.ships?.includes(s.id)).map(ship => (
                                <TouchableOpacity
                                    key={ship.id}
                                    style={[
                                        styles.selectableItem,
                                        active.ship === ship.id && styles.selectedItem,
                                    ]}
                                    onPress={() => selectItem('ship', ship.id)}
                                >
                                    <Text style={styles.itemEmoji}>{ship.emoji}</Text>
                                    <Text style={styles.itemName}>{ship.name}</Text>
                                    {active.ship === ship.id && <Text style={styles.activeLabel}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.subsectionTitle}>Aktif Tema</Text>
                        <View style={styles.itemRow}>
                            {UNLOCKABLES.themes.filter(t => unlocks.themes?.includes(t.id)).map(thm => (
                                <TouchableOpacity
                                    key={thm.id}
                                    style={[
                                        styles.selectableItem,
                                        active.theme === thm.id && styles.selectedItem,
                                    ]}
                                    onPress={() => selectItem('theme', thm.id)}
                                >
                                    <Text style={styles.itemEmoji}>{thm.emoji}</Text>
                                    <Text style={styles.itemName}>{thm.name}</Text>
                                    {active.theme === thm.id && <Text style={styles.activeLabel}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Game Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎮 Oyun</Text>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Eğitim İpuçları</Text>
                                <Text style={styles.settingDesc}>Oyun içi ipuçlarını göster</Text>
                            </View>
                            <Switch
                                value={settings.showTutorial}
                                onValueChange={() => toggleSetting('showTutorial')}
                                trackColor={{ false: '#444', true: theme.colors.primary }}
                                thumbColor={settings.showTutorial ? theme.colors.white : '#888'}
                            />
                        </View>
                    </View>

                    {/* Data Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💾 Veri</Text>

                        <TouchableOpacity style={styles.dangerButton} onPress={resetProgress}>
                            <Text style={styles.dangerButtonText}>🗑️ İlerlemeyi Sıfırla</Text>
                        </TouchableOpacity>
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ℹ️ Hakkında</Text>
                        <View style={styles.aboutBox}>
                            <Text style={styles.aboutTitle}>Galaxy Conquest</Text>
                            <Text style={styles.aboutVersion}>Versiyon 1.0.0</Text>
                            <Text style={styles.aboutText}>
                                Galaksiyi fethet! Stratejik bir uzay savaşı oyunu.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    placeholder: {
        width: 44,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.white,
    },
    settingDesc: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginTop: 2,
    },
    dangerButton: {
        backgroundColor: 'rgba(255, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    dangerButtonText: {
        color: theme.colors.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    aboutBox: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    aboutTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    aboutVersion: {
        fontSize: 14,
        color: theme.colors.textDim,
        marginTop: 4,
    },
    aboutText: {
        fontSize: 14,
        color: theme.colors.textDim,
        textAlign: 'center',
        marginTop: 12,
    },
    subsectionTitle: {
        color: theme.colors.textDim,
        fontSize: 14,
        marginBottom: 8,
        marginTop: 12,
    },
    itemRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    selectableItem: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        minWidth: 80,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedItem: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
    },
    itemEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    itemName: {
        color: theme.colors.white,
        fontSize: 12,
    },
    activeLabel: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: 'bold',
        position: 'absolute',
        top: 4,
        right: 6,
    },
});

export default SettingsScreen;
