import { API } from '@/constants/api';

// ─── Helper JSON ───────────────────────────────────────────────────────────────
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

// ─── Helper multipart (upload) ─────────────────────────────────────────────────
async function upload<T>(url: string, formData: FormData, token: string): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
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

    changePassword: (current_password: string, new_password: string, token: string) =>
        request<{ message: string }>(API.CHANGE_PASSWORD, {
            method: 'PUT',
            body: JSON.stringify({ current_password, new_password }),
        }, token),
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

// ─── Dossiers ──────────────────────────────────────────────────────────────────
export const dossiersApi = {
    getAll: (token: string) =>
        request<{ dossiers: any[] }>(API.DOSSIERS, {}, token),

    getOne: (id: number, token: string) =>
        request<{ dossier: any }>(API.DOSSIER(id), {}, token),
};

// ─── Documents sinistre ────────────────────────────────────────────────────────
export type DocumentType = 'attestation_assurance' | 'carte_grise' | 'piece_identite';

export const documentsApi = {
    // Upload un fichier attaché à un sinistre
    upload: (sinistreId: number, file: { uri: string; name: string; mimeType?: string }, type: DocumentType, token: string) => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.name ?? 'document',
            type: file.mimeType ?? 'application/octet-stream',
        } as any);
        formData.append('type', type);
        return upload<{ message: string; document: any }>(
            API.SINISTRE_DOCUMENT(sinistreId),
            formData,
            token,
        );
    },

    // URL de téléchargement d'un fichier
    downloadUrl: (filename: string) => API.DOCUMENT_DOWNLOAD(filename),

    // Supprimer un document
    delete: (sinistreId: number, docId: number, token: string) =>
        request<{ message: string }>(API.SINISTRE_DOCUMENT_DELETE(sinistreId, docId), { method: 'DELETE' }, token),

    // Demande de documents par mail
    requestDocuments: (sinistreId: number, types: string[], token: string) =>
        request<{ message: string }>(API.SINISTRE_REQUEST_DOCS(sinistreId), {
            method: 'POST',
            body: JSON.stringify({ types }),
        }, token),

    // Demande de RIB par mail
    requestRib: (sinistreId: number, token: string) =>
        request<{ message: string }>(API.SINISTRE_REQUEST_RIB(sinistreId), { method: 'POST' }, token),
};
