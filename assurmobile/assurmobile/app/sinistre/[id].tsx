import { useEffect, useState } from 'react';
import {
    View, ScrollView, StyleSheet,
    TouchableOpacity, StatusBar,
} from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { sinistresApi } from '@/utils/fetchData';
import { Sinistre } from '@/hooks/useSinistres';

// ── Config statuts ──────────────────────────────────────────────────────────────
const STATUT_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    en_cours: { label: 'En cours',  color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' },
    complet:  { label: 'Complet',   color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
    clos:     { label: 'Clos',      color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
};

// ── Sous-composants ─────────────────────────────────────────────────────────────
function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <View style={row.wrap}>
            <Text style={row.label}>{label}</Text>
            <Text style={[row.value, highlight && row.highlighted]}>{value}</Text>
        </View>
    );
}
const row = StyleSheet.create({
    wrap:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    label:       { fontSize: 14, color: '#64748B', flex: 1 },
    value:       { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1, textAlign: 'right' },
    highlighted: { color: '#DC2626' },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={sec.wrap}>
            <Text style={sec.title}>{title}</Text>
            <View style={sec.card}>{children}</View>
        </View>
    );
}
const sec = StyleSheet.create({
    wrap:  { marginBottom: 20 },
    title: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
    card:  { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18, shadowColor: '#1565C0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
});

// ── Écran ───────────────────────────────────────────────────────────────────────
export default function SinistreDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    const router = useRouter();

    const [sinistre, setSinistre] = useState<Sinistre | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const data = await sinistresApi.getOne(Number(id), token!);
                setSinistre(data.sinistre);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetch_();
    }, [id, token]);

    if (isLoading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#1565C0" />
            <Text style={styles.loadingText}>Chargement du sinistre...</Text>
        </View>
    );

    if (error || !sinistre) return (
        <View style={styles.centered}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
            <Text style={styles.errorText}>{error || 'Sinistre introuvable'}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
                <Text style={styles.retryLabel}>← Retour</Text>
            </TouchableOpacity>
        </View>
    );

    const statut = STATUT_CFG[sinistre.statut] ?? STATUT_CFG.clos;
    const dateAcc  = new Date(sinistre.date_accident).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const heureAcc = new Date(sinistre.date_accident).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateApp  = new Date(sinistre.date_appel).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const heureApp = new Date(sinistre.date_appel).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerBubble} />
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹  Sinistres</Text>
                </TouchableOpacity>

                <View style={styles.plateRow}>
                    <View style={styles.plateBox}>
                        <View style={styles.plateFlagStrip} />
                        <Text style={styles.plateText}>{sinistre.immatriculation}</Text>
                    </View>
                    <View style={[styles.statutPill, { backgroundColor: statut.bg }]}>
                        <View style={[styles.statutDot, { backgroundColor: statut.dot }]} />
                        <Text style={[styles.statutLabel, { color: statut.color }]}>{statut.label}</Text>
                    </View>
                </View>

                <Text style={styles.sinisterId}>Sinistre #{sinistre.id}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── Conducteur ── */}
                <Section title="🧑 Conducteur">
                    <InfoRow label="Nom complet" value={`${sinistre.conducteur_prenom} ${sinistre.conducteur_nom}`} />
                    <Divider style={styles.divider} />
                    <InfoRow label="Assuré" value={sinistre.conducteur_est_assure ? '✅ Oui' : '❌ Non'} />
                </Section>

                {/* ── Accident ── */}
                <Section title="🚗 Accident">
                    <InfoRow label="Date" value={dateAcc} />
                    <Divider style={styles.divider} />
                    <InfoRow label="Heure" value={heureAcc} />
                </Section>

                {/* ── Appel ── */}
                <Section title="📞 Appel">
                    <InfoRow label="Date d'appel" value={dateApp} />
                    <Divider style={styles.divider} />
                    <InfoRow label="Heure d'appel" value={heureApp} />
                </Section>

                {/* ── Responsabilité ── */}
                <Section title="⚖️ Responsabilité">
                    <InfoRow
                        label="Responsabilité engagée"
                        value={sinistre.responsabilite_engagee ? 'Oui' : 'Non'}
                        highlight={sinistre.responsabilite_engagee}
                    />
                    {sinistre.responsabilite_engagee && (
                        <>
                            <Divider style={styles.divider} />
                            <InfoRow
                                label="Pourcentage"
                                value={`${sinistre.pourcentage_responsabilite}%`}
                                highlight
                            />
                        </>
                    )}
                </Section>

                {/* ── Contexte ── */}
                <Section title="📝 Contexte">
                    <View style={styles.contexteWrap}>
                        <Text style={styles.contexteText}>{sinistre.contexte}</Text>
                    </View>
                </Section>

                {/* ── Créateur ── */}
                {sinistre.Createur && (
                    <Section title="👤 Déclaré par">
                        <InfoRow
                            label="Agent"
                            value={`${sinistre.Createur.firstname} ${sinistre.Createur.lastname}`}
                        />
                    </Section>
                )}

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    loadingText: { color: '#94A3B8', marginTop: 12 },
    errorText:   { color: '#DC2626', fontSize: 15, textAlign: 'center', marginBottom: 16 },
    retryBtn:    { backgroundColor: '#1565C0', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    retryLabel:  { color: '#fff', fontWeight: '700' },

    /* ── Header ── */
    header: {
        backgroundColor: '#0D47A1',
        paddingTop: 54, paddingBottom: 28,
        paddingHorizontal: 20, overflow: 'hidden',
    },
    headerBubble: {
        position: 'absolute', width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -50,
    },
    backBtn: { marginBottom: 20 },
    backText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },

    plateRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
    plateBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden',
        paddingRight: 14,
    },
    plateFlagStrip: { width: 8, backgroundColor: '#003399', height: '100%', marginRight: 10 },
    plateText: { fontSize: 22, fontWeight: '900', color: '#111', letterSpacing: 2, paddingVertical: 6 },

    statutPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statutDot:  { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
    statutLabel: { fontSize: 13, fontWeight: '700' },

    sinisterId: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },

    /* ── Contenu ── */
    content: { padding: 16, paddingTop: 20 },
    divider: { backgroundColor: '#F1F5F9', height: 1 },
    contexteWrap: { paddingVertical: 16 },
    contexteText: { fontSize: 14, color: '#334155', lineHeight: 22 },
});
