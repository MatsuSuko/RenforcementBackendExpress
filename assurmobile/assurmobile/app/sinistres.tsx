import { useState } from 'react';
import {
    View, FlatList, StyleSheet,
    TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import { Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSinistres, Sinistre } from '@/hooks/useSinistres';

// ── Types ──────────────────────────────────────────────────────────────────────
type Statut = 'tous' | 'en_cours' | 'complet' | 'clos';

const STATUTS: { key: Statut; label: string; color: string; bg: string; dot: string }[] = [
    { key: 'tous',     label: 'Tous',     color: '#1565C0', bg: '#EEF2FF', dot: '#1565C0' },
    { key: 'en_cours', label: 'En cours', color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' },
    { key: 'complet',  label: 'Complet',  color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
    { key: 'clos',     label: 'Clos',     color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
];

// ── Composants ─────────────────────────────────────────────────────────────────
function StatutPill({ statut }: { statut: string }) {
    const s = STATUTS.find(x => x.key === statut) ?? STATUTS[0];
    return (
        <View style={[pill.wrap, { backgroundColor: s.bg }]}>
            <View style={[pill.dot, { backgroundColor: s.dot }]} />
            <Text style={[pill.label, { color: s.color }]}>{s.label}</Text>
        </View>
    );
}
const pill = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dot:  { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    label: { fontSize: 12, fontWeight: '600' },
});

function SinistreCard({ item, onPress }: { item: Sinistre; onPress: () => void }) {
    const dateAcc = new Date(item.date_accident).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    return (
        <TouchableOpacity style={card.wrap} onPress={onPress} activeOpacity={0.82}>
            <View style={card.top}>
                <View style={card.plateBox}>
                    <Text style={card.plate}>{item.immatriculation}</Text>
                </View>
                <StatutPill statut={item.statut} />
            </View>

            <Text style={card.name}>
                {item.conducteur_prenom} {item.conducteur_nom}
            </Text>

            <Text style={card.contexte} numberOfLines={2}>{item.contexte}</Text>

            <View style={card.footer}>
                <View style={card.footerItem}>
                    <Text style={card.footerLabel}>📅 Accident</Text>
                    <Text style={card.footerValue}>{dateAcc}</Text>
                </View>
                <View style={card.footerItem}>
                    <Text style={card.footerLabel}>🚦 Responsabilité</Text>
                    <Text style={[card.footerValue, item.responsabilite_engagee && { color: '#DC2626' }]}>
                        {item.responsabilite_engagee ? `${item.pourcentage_responsabilite}%` : 'Non engagée'}
                    </Text>
                </View>
                <View style={card.footerItem}>
                    <Text style={card.footerLabel}>🔒 Assuré</Text>
                    <Text style={card.footerValue}>{item.conducteur_est_assure ? 'Oui' : 'Non'}</Text>
                </View>
            </View>

            <Text style={card.arrow}>Voir le détail →</Text>
        </TouchableOpacity>
    );
}
const card = StyleSheet.create({
    wrap: {
        backgroundColor: '#fff', borderRadius: 20, padding: 18,
        marginBottom: 14,
        shadowColor: '#1565C0', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
    },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    plateBox: {
        backgroundColor: '#EEF2FF', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 5,
        borderWidth: 1.5, borderColor: '#C7D2FE',
    },
    plate: { fontSize: 15, fontWeight: '800', color: '#1565C0', letterSpacing: 2 },
    name: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
    contexte: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 14, fontStyle: 'italic' },
    footer: { flexDirection: 'row', backgroundColor: '#F8FAFF', borderRadius: 12, padding: 12, gap: 4 },
    footerItem: { flex: 1, alignItems: 'center' },
    footerLabel: { fontSize: 10, color: '#94A3B8', marginBottom: 3 },
    footerValue: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
    arrow: { fontSize: 12, color: '#1565C0', fontWeight: '600', textAlign: 'right', marginTop: 10 },
});

// ── Écran principal ────────────────────────────────────────────────────────────
export default function SinistresScreen() {
    const router = useRouter();
    const { sinistres, isLoading, error, refetch } = useSinistres();
    const [filtre, setFiltre] = useState<Statut>('tous');
    const [search, setSearch] = useState('');

    const filtered = sinistres.filter(s => {
        const matchFiltre = filtre === 'tous' || s.statut === filtre;
        const q = search.toLowerCase();
        const matchSearch = !q
            || s.immatriculation.toLowerCase().includes(q)
            || s.conducteur_nom.toLowerCase().includes(q)
            || s.conducteur_prenom.toLowerCase().includes(q);
        return matchFiltre && matchSearch;
    });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />


            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerBubble} />
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backText}>‹</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Sinistres</Text>
                        <Text style={styles.headerSub}>{sinistres.length} sinistre{sinistres.length > 1 ? 's' : ''} au total</Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{filtered.length}</Text>
                    </View>
                </View>
            </View>

            {/* ── Recherche ── */}
            <View style={styles.searchWrap}>
                <Searchbar
                    placeholder="Immatriculation, conducteur..."
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchbar}
                    inputStyle={{ fontSize: 14 }}
                    iconColor="#1565C0"
                    elevation={0}
                />
            </View>

            {/* ── Filtres ── */}
            <View style={styles.filtresRow}>
                {STATUTS.map(s => (
                    <TouchableOpacity
                        key={s.key}
                        style={[styles.filtreBtn, filtre === s.key && styles.filtreBtnActive]}
                        onPress={() => setFiltre(s.key)}
                        activeOpacity={0.8}
                    >
                        {filtre === s.key && <View style={[styles.filtreDot, { backgroundColor: s.dot }]} />}
                        <Text style={[styles.filtreLabel, filtre === s.key && { color: '#1565C0', fontWeight: '700' }]}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Contenu ── */}
            {isLoading && !sinistres.length ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#1565C0" />
                    <Text style={styles.stateText}>Chargement...</Text>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorEmoji}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
                        <Text style={styles.retryLabel}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={i => i.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#1565C0" colors={['#1565C0']} />
                    }
                    renderItem={({ item }) => (
                        <SinistreCard item={item} onPress={() => router.push(`/sinistre/${item.id}` as any)} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Text style={{ fontSize: 48, marginBottom: 12 }}>📂</Text>
                            <Text style={styles.stateText}>Aucun sinistre trouvé</Text>
                        </View>
                    }
                />
            )}

            {/* ── Bouton flottant ── */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/sinistre/create')}
                activeOpacity={0.85}
            >
                <Text style={styles.fabIcon}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    /* ── Header ── */
    header: {
        backgroundColor: '#0D47A1',
        paddingTop: 54, paddingBottom: 24,
        paddingHorizontal: 20, overflow: 'hidden',
    },
    headerBubble: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    backText: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: -2 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: 36, height: 36, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    countText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    /* ── Recherche ── */
    searchWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    searchbar: { borderRadius: 14, backgroundColor: '#fff', elevation: 2 },

    /* ── Filtres ── */
    filtresRow: {
        flexDirection: 'row', paddingHorizontal: 16,
        paddingBottom: 12, gap: 8,
    },
    filtreBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', paddingHorizontal: 14,
        paddingVertical: 7, borderRadius: 20,
        borderWidth: 1.5, borderColor: 'transparent',
    },
    filtreBtnActive: {
        borderColor: '#C7D2FE', backgroundColor: '#EEF2FF',
    },
    filtreDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    filtreLabel: { fontSize: 13, color: '#64748B' },

    /* ── Liste ── */
    list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 },

    /* ── FAB ── */
    fab: {
        position: 'absolute', bottom: 28, right: 24,
        width: 58, height: 58, borderRadius: 18,
        backgroundColor: '#1565C0',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#1565C0', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    fabIcon: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },

    /* ── États ── */
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
    stateText: { color: '#94A3B8', fontSize: 16, marginTop: 8 },
    errorEmoji: { fontSize: 36, marginBottom: 8 },
    errorText: { color: '#DC2626', fontSize: 15, textAlign: 'center', marginBottom: 16 },
    retryBtn: { backgroundColor: '#1565C0', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    retryLabel: { color: '#fff', fontWeight: '700' },
});
