/**
 * profileManager.js - Gestor de perfiles seguros infantiles y salud digital
 * Sin recopilación de datos sensibles (cumplimiento estricto App Store Guideline 5.1.1).
 */

export class ProfileManager {
    constructor() {
        this.STORAGE_KEY = 'gloop_child_profile_v1';
        this.defaultProfile = {
            nickname: 'Pequeño Explorador',
            ageGroup: '7-9', // '5-7', '7-9', '10-12'
            screenLimitMinutes: 30,
            sessionMinutesUsed: 0,
            badges: ['curioso_primer_dia'],
            soundMuted: false,
            darkMode: false
        };
        this.profile = this.loadProfile();
        this.sessionStartTime = Date.now();
    }

    loadProfile() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                return { ...this.defaultProfile, ...JSON.parse(raw) };
            }
        } catch (e) {}
        return { ...this.defaultProfile };
    }

    saveProfile(updates) {
        this.profile = { ...this.profile, ...updates };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
            return true;
        } catch (e) {
            return false;
        }
    }

    isScreenTimeExceeded() {
        if (!this.profile.screenLimitMinutes || this.profile.screenLimitMinutes <= 0) {
            return false; // Ilimitado
        }
        const elapsedMinutes = (Date.now() - this.sessionStartTime) / (1000 * 60);
        return elapsedMinutes >= this.profile.screenLimitMinutes;
    }

    getRemainingMinutes() {
        if (!this.profile.screenLimitMinutes) return null;
        const elapsed = (Date.now() - this.sessionStartTime) / (1000 * 60);
        return Math.max(0, Math.round(this.profile.screenLimitMinutes - elapsed));
    }
}
