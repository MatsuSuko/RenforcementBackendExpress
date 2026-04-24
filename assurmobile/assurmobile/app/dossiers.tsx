import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { dossiersApi } from '@/utils/api';

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
    initialise:              { label: 'Initialisé',         color: '#1E40AF', bg: '#DBEAFE' },
    expertise_en_attente:    { label: 'Expertise en attente', color: '#92400E', bg: '#FEF3C7' },
    expertise_planifiee:     { label: 'Expertise planifiée', color: '#7C2D12', bg: '#FED7AA' },
    expertise_realisee:      { label: 'Expertise réalisée',  color: '#065F46', bg: '#D1FAE5' },
    intervention_en_cours:   { label: 'Intervention',        color: '#7E22CE', bg: '#F3E8FF' },
    vehicule_restitue:       { label: 'Véhicule restitué',   color: '#065F46', bg: '#D1FAE5' },
    en_attente_facturation:  { label: 'Facturation',         color: '#92400E', bg: '#FEF3C7' },
    en_attente_reglement:    { label: 'Règlement',           color: '#9A3412', bg: '#FEE2E2' },
    clos:                    { label: 'Clos',                color: '#374151', bg: '#F3F4F6' },
};

export default function DossiersScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [dossiers, setDossiers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const data = await dossiersApi.getAll(token!);
            setDossiers(data.dossiers);
        } catch (e: any) {
            setError(e.message || 'Erreur de chargement');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => { setRefreshing(true); load(); };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor="#059669" />

            {/* ── Header ── */}
            <View style={s.header}>
                <View style={s.bubble} />
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Text style={s.backText}>‹  Accueil</Text>
                </TouchableOpacity>
                <Text style={s.title}>📁 Dossiers</Text>
                <Text style={s.sub}>{dossiers.length} dossier{dossiers.length !== 1 ? 's' : ''}</Text>
            </View>

            {isLoading ? (
                <View style={s.centered}>
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : error ? (
                <View style={s.centered}>
                    <Text style={s.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={s.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
                >
                    {dossiers.length === 0 ? (
                        <View style={s.empty}>
                            <Text style={{ fontSize: 48, marginBottom: 12 }}>📁</Text>
                            <Text style={s.emptyTitle}>Aucun dossier</Text>
                            <Text style={s.emptySub}>Les dossiers apparaîtront ici</Text>
                        </View>
                    ) : (
                        dossiers.map(d => {
                            const cfg = STATUT_CFG[d.statut] ?? { label: d.statut, color: '#374151', bg: '#F3F4F6' };
                            const sinistre = d.Sinistre;
                            const agent = d.ChargeSuivi;
                            return (
                                <View key={d.id} style={s.card}>
                                    <View style={s.cardTop}>
                                        <Text style={s.numero}>{d.numero_dossier}</Text>
                                        <View style={[s.pill, { backgroundColor: cfg.bg }]}>
                                            <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                                        </View>
                                    </View>
                                    {sinistre && (
                                        <Text style={s.meta}>🚗 {sinistre.immatriculation}</Text>
                                    )}
                                    {agent && (
                                        <Text style={s.meta}>👤 {agent.firstname} {agent.lastname}</Text>
                                    )}
                                    {d.scenario && (
                                        <Text style={s.meta}>
                                            📋 {d.scenario === 'reparable' ? 'Réparable' : 'Perte totale'}
                                        </Text>
                                    )}
                                    <Text style={s.date}>Créé le {new Date(d.created_at).toLocaleDateString('fr-FR')}</Text>
                                </View>
                            );
                        })
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    header: {
        backgroundColor: '#059669', paddingTop: 54,
        paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden',
    },
    bubble: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
    },
    backBtn:  { marginBottom: 16 },
    backText: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '500' },
    title: { fontSize: 26, fontWeight: '800', color: '#fff' },
    sub:   { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#DC2626', fontSize: 15 },

    list: { padding: 16 },

    card: {
        backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    numero:  { fontSize: 15, fontWeight: '800', color: '#0D1B3E' },
    pill:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    pillText: { fontSize: 11, fontWeight: '700' },
    meta:    { fontSize: 13, color: '#64748B', marginBottom: 4 },
    date:    { fontSize: 11, color: '#94A3B8', marginTop: 6 },

    empty:      { alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#64748B', marginBottom: 8 },
    emptySub:   { fontSize: 14, color: '#94A3B8' },
});
