import { Platform } from 'react-native';

// IP de ton Mac sur le réseau local (pour iPhone physique)
const MAC_IP = '10.18.72.59';

const BASE_URL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'    // Android emulator
        : Platform.OS === 'web'
        ? 'http://localhost:3000'   // Navigateur web (test PC)
        : `http://${MAC_IP}:3000`;  // iPhone physique

export const API = {
    BASE_URL,
    LOGIN: `${BASE_URL}/login`,
    LOGOUT: `${BASE_URL}/logout`,
    FORGOT_PASSWORD: `${BASE_URL}/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/reset-password`,
};
