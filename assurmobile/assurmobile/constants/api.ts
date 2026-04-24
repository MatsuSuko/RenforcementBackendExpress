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
    LOGIN:                   `${BASE_URL}/login`,
    REGISTER:                `${BASE_URL}/register`,
    LOGOUT:                  `${BASE_URL}/logout`,
    FORGOT_PASSWORD:         `${BASE_URL}/forgot-password`,
    RESET_PASSWORD:          `${BASE_URL}/reset-password`,
    CHANGE_PASSWORD:         `${BASE_URL}/change-password`,
    SINISTRES:               `${BASE_URL}/sinistre`,
    SINISTRE:                (id: number) => `${BASE_URL}/sinistre/${id}`,
    SINISTRE_DOCUMENT:       (id: number) => `${BASE_URL}/sinistre/${id}/document`,
    SINISTRE_DOCUMENT_DELETE:(sinistreId: number, docId: number) => `${BASE_URL}/sinistre/${sinistreId}/document/${docId}`,
    DOCUMENT_DOWNLOAD:       (filename: string) => `${BASE_URL}/sinistre/download-docs/${filename}`,
    SINISTRE_REQUEST_DOCS:   (id: number) => `${BASE_URL}/sinistre/${id}/request-documents`,
    SINISTRE_REQUEST_RIB:    (id: number) => `${BASE_URL}/sinistre/${id}/request-rib`,
    DOSSIERS:                `${BASE_URL}/dossier`,
    DOSSIER:                 (id: number) => `${BASE_URL}/dossier/${id}`,
};
