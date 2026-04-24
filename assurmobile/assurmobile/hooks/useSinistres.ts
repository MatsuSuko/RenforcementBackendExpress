import { useState, useEffect, useCallback } from 'react';
import { sinistresApi } from '@/utils/fetchData';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Createur {
    id: number;
    firstname: string;
    lastname: string;
}

export interface Sinistre {
    id: number;
    immatriculation: string;
    conducteur_nom: string;
    conducteur_prenom: string;
    conducteur_est_assure: boolean;
    date_appel: string;
    date_accident: string;
    contexte: string;
    responsabilite_engagee: boolean;
    pourcentage_responsabilite: number;
    statut: 'en_cours' | 'complet' | 'clos';
    created_at: string;
    updated_at: string;
    Createur: Createur | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useSinistres() {
    const { token } = useAuth();
    const [sinistres, setSinistres] = useState<Sinistre[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState<string | null>(null);

    const fetchSinistres = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await sinistresApi.getAll(token);
            setSinistres(data.sinistres);
        } catch (err: any) {
            setError(err.message || 'Impossible de charger les sinistres');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchSinistres(); }, [fetchSinistres]);

    return { sinistres, isLoading, error, refetch: fetchSinistres };
}
