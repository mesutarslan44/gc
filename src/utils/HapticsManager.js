import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@galaxy_conquest_settings';

class HapticsManager {
    constructor() {
        this.enabled = true;
        this.init();
    }

    async init() {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                this.enabled = settings.hapticEnabled ?? true;
            }
        } catch (error) {
            console.log('Haptics init error:', error);
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        // Settings are saved by SettingsScreen, but we can also sync here if needed.
        // For now, we rely on SettingsScreen to update this instance.
    }

    isEnabled() {
        return this.enabled;
    }

    selection() {
        if (this.enabled) {
            Haptics.selectionAsync().catch(() => { });
        }
    }

    impact(style = Haptics.ImpactFeedbackStyle.Medium) {
        if (this.enabled) {
            Haptics.impactAsync(style).catch(() => { });
        }
    }

    notification(type = Haptics.NotificationFeedbackType.Success) {
        if (this.enabled) {
            Haptics.notificationAsync(type).catch(() => { });
        }
    }
}

const hapticsManager = new HapticsManager();
export default hapticsManager;
