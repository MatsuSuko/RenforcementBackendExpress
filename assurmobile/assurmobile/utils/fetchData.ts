import { API } from '@/constants/api';

// ─── Helper de base ────────────────────────────────────────────────────────────
async function request<T>(
    url: string,
    options: RequestInit = {},
    token?: string | null,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
    return data as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (username: string, password: string) =>
        request<{ token: string }>(API.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

    register: (body: { username: string; firstname: string; lastname: string; email: string; password: string }) =>
        request<{ token: string }>(API.REGISTER, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    logout: (token: string) =>
        request<{ message: string }>(API.LOGOUT, { method: 'POST' }, token),
};

// ─── Sinistres ─────────────────────────────────────────────────────────────────
export const sinistresApi = {
    getAll: (token: string) =>
        request<{ sinistres: any[] }>(API.SINISTRES, {}, token),

    getOne: (id: number, token: string) =>
        request<{ sinistre: any }>(API.SINISTRE(id), {}, token),

    create: (body: Record<string, any>, token: string) =>
        request<{ sinistre: any }>(API.SINISTRES, {
            method: 'POST',
            body: JSON.stringify(body),
        }, token),

    update: (id: number, body: Record<string, any>, token: string) =>
        request<{ message: string }>(API.SINISTRE(id), {
            method: 'PUT',
            body: JSON.stringify(body),
        }, token),

    delete: (id: number, token: string) =>
        request<{ message: string }>(API.SINISTRE(id), { method: 'DELETE' }, token),
};
