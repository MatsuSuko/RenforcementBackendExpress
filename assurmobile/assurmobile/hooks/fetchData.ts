/**
 * fetchData.ts — Couche bas niveau pour les appels API
 * Même pattern que le prof, mais enrichi avec gestion d'erreur et TypeScript.
 *
 * Usage :
 *   fetchData('/sinistre', 'GET', undefined, true)        → JSON standard
 *   fetchDocument('/sinistre/1/document', 'POST', formData, true) → multipart
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/constants/api';

const TOKEN_KEY = '@assurmoi_token';

// ─── fetchData : requête JSON standard ────────────────────────────────────────
export async function fetchData<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: Record<string, any>,
    useToken = false,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (useToken) {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const url = path.startsWith('http') ? path : `${API.BASE_URL}${path}`;

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
    }

    return data as T;
}

// ─── fetchDocument : envoi multipart/form-data (upload de fichier) ─────────────
export async function fetchDocument<T = any>(
    path: string,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
    body?: FormData,
    useToken = false,
): Promise<T> {
    const headers: Record<string, string> = {};
    // Ne pas définir Content-Type : le browser l'ajoute automatiquement
    // avec le bon boundary pour le multipart

    if (useToken) {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const url = path.startsWith('http') ? path : `${API.BASE_URL}${path}`;

    const response = await fetch(url, {
        method,
        headers,
        body,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
    }

    return data as T;
}
