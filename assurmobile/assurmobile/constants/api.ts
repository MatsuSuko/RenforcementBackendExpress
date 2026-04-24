import { Platform } from 'react-native';
import { NGROK_URL, MAC_IP } from './config';

// Priorité : ngrok > réseau local > localhost (web)
const getBaseUrl = (): string => {
    if (NGROK_URL) return NGROK_URL;                        // ngrok actif (iPhone sans même Wi-Fi)
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000';  // émulateur Android
    if (Platform.OS === 'web') return 'http://localhost:3000';     // navigateur PC
    return `http://${MAC_IP}:3000`;                         // iPhone physique (même Wi-Fi)
};

const BASE_URL = getBaseUrl();

export const API = {
    BASE_URL,
    LOGIN:            `${BASE_URL}/login`,
    REGISTER:         `${BASE_URL}/register`,
    LOGOUT:           `${BASE_URL}/logout`,
    FORGOT_PASSWORD:  `${BASE_URL}/forgot-password`,
    RESET_PASSWORD:   `${BASE_URL}/reset-password`,
    SINISTRES:        `${BASE_URL}/sinistre`,
    SINISTRE:         (id: number) => `${BASE_URL}/sinistre/${id}`,
};
