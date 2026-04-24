import { useEffect, useState, useCallback } from 'react';
import {
    View, ScrollView, StyleSheet, TouchableOpacity,
    StatusBar, Alert, Linking, Modal, Platform,
} from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/contexts/AuthContext';
import { sinistresApi, documentsApi, DocumentType } from '@/utils/api';
import { Sinistre } from '@/hooks/useSinistres';

// ── Config ─────────────────────────────────────────────────────────────────────
const STATUT_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    en_cours: { label: 'En cours',  color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' },
    complet:  { label: 'Complet',   color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
    clos:     { label: 'Clos',      color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
};

const DOC_TYPES: { key: DocumentType; label: string; icon: string }[] = [
    { key: 'attestation_assurance', label: 'Attestation d\'assurance', icon: '📋' },
    { key: 'carte_grise',           label: 'Carte grise',              icon: '🚗' },
    { key: 'piece_identite',        label: 'Pièce d\'identité',        icon: '🪪' },
];

// ── Sous-composants ────────────────────────────────────────────────────────────
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

// ── Écran ──────────────────────────────────────────────────────────────────────
export default function SinistreDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    const router = useRouter();

    const [sinistre, setSinistre]           = useState<Sinistre | null>(null);
    const [isLoading, setIsLoading]         = useState(true);
    const [error, setError]                 = useState('');
    const [uploading, setUploading]         = useState(false);
    const [deletingId, setDeletingId]       = useState<number | null>(null);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [sendingMail, setSendingMail]     = useState<'docs' | 'rib' | null>(null);

    const load = useCallback(async () => {
        try {
            const data = await sinistresApi.getOne(Number(id), token!);
            setSinistre(data.sinistre);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [id, token]);

    useEffect(() => { load(); }, [load]);

    // ── Sélection du type puis pick du fichier ──
    const handleSelectType = async (type: DocumentType) => {
        setShowTypePicker(false);

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const file = result.assets[0];
            setUploading(true);

            await documentsApi.upload(
                Number(id),
                {
                    uri: file.uri,
                    name: file.name ?? 'document',
                    mimeType: file.mimeType ?? 'application/octet-stream',
                },
                type,
                token!,
            );

            await load();
            Alert.alert('✅ Succès', 'Document uploadé avec succès');
        } catch (e: any) {
            Alert.alert('Erreur upload', e.message || 'Impossible d\'uploader le fichier');
        } finally {
            setUploading(false);
        }
    };

    // ── Supprimer document ──
    const handleDelete = (docId: number, filename: string) => {
        Alert.alert(
            'Supprimer le document',
            `Voulez-vous supprimer ce fichier ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive',
                    onPress: async () => {
                        setDeletingId(docId);
                        try {
                            await documentsApi.delete(Number(id), docId, token!);
                            await load();
                        } catch (e: any) {
                            Alert.alert('Erreur', e.message);
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ],
        );
    };

    // ── Ouvrir document ──
    const handleOpen = (filename: string) => {
        const url = documentsApi.downloadUrl(filename);
        Linking.openURL(url).catch(() =>
            Alert.alert('Erreur', 'Impossible d\'ouvrir le fichier')
        );
    };

    // ── Demande de documents par mail ──
    const handleRequestDocs = async () => {
        setSendingMail('docs');
        try {
            await documentsApi.requestDocuments(Number(id), ['attestation_assurance', 'carte_grise', 'piece_identite'], token!);
            Alert.alert('✅ Mail envoyé', 'La demande de documents a été envoyée par email.');
        } catch (e: any) {
            Alert.alert('Erreur', e.message);
        } finally {
            setSendingMail(null);
        }
    };

    // ── Demande de RIB par mail ──
    const handleRequestRib = async () => {
        setSendingMail('rib');
        try {
            await documentsApi.requestRib(Number(id), token!);
            Alert.alert('✅ Mail envoyé', 'La demande de RIB a été envoyée par email.');
        } catch (e: any) {
            Alert.alert('Erreur', e.message);
        } finally {
            setSendingMail(null);
        }
    };

    // ── Rendu états ──
    if (isLoading) return (
        <View style={s.centered}>
            <ActivityIndicator size="large" color="#1565C0" />
            <Text style={s.stateText}>Chargement...</Text>
        </View>
    );

    if (error || !sinistre) return (
        <View style={s.centered}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
            <Text style={s.errorText}>{error || 'Sinistre introuvable'}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
                <Text style={s.retryLabel}>← Retour</Text>
            </TouchableOpacity>
        </View>
    );

    const statut   = STATUT_CFG[sinistre.statut] ?? STATUT_CFG.clos;
    const dateAcc  = new Date(sinistre.date_accident).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const heureAcc = new Date(sinistre.date_accident).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateApp  = new Date(sinistre.date_appel).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const heureApp = new Date(sinistre.date_appel).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const docs     = (sinistre as any).Documents ?? [];

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* ── Modal sélection type document ── */}
            <Modal
                visible={showTypePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTypePicker(false)}
            >
                <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
                    <View style={s.modalSheet}>
                        <View style={s.modalHandle} />
                        <Text style={s.modalTitle}>📎 Type de document</Text>
                        <Text style={s.modalSub}>Choisissez le type de document à ajouter</Text>
                        {DOC_TYPES.map(dt => (
                            <TouchableOpacity
                                key={dt.key}
                                style={s.modalOption}
                                onPress={() => handleSelectType(dt.key)}
                            >
                                <Text style={s.modalOptionIcon}>{dt.icon}</Text>
                                <Text style={s.modalOptionLabel}>{dt.label}</Text>
                                <Text style={s.modalOptionArrow}>›</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={s.modalCancel} onPress={() => setShowTypePicker(false)}>
                            <Text style={s.modalCancelText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── Header ── */}
            <View style={s.header}>
                <View style={s.headerBubble} />
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Text style={s.backText}>‹  Sinistres</Text>
                </TouchableOpacity>
                <View style={s.plateRow}>
                    <View style={s.plateBox}>
                        <View style={s.plateFlagStrip} />
                        <Text style={s.plateText}>{sinistre.immatriculation}</Text>
                    </View>
                    <View style={[s.statutPill, { backgroundColor: statut.bg }]}>
                        <View style={[s.statutDot, { backgroundColor: statut.dot }]} />
                        <Text style={[s.statutLabel, { color: statut.color }]}>{statut.label}</Text>
                    </View>
                </View>
                <Text style={s.sinisterId}>Sinistre #{sinistre.id}</Text>
            </View>

            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

                {/* ── Conducteur ── */}
                <Section title="🧑 Conducteur">
                    <InfoRow label="Nom complet" value={`${sinistre.conducteur_prenom} ${sinistre.conducteur_nom}`} />
                    <Divider style={s.divider} />
                    <InfoRow label="Assuré" value={sinistre.conducteur_est_assure ? '✅ Oui' : '❌ Non'} />
                </Section>

                {/* ── Accident ── */}
                <Section title="🚗 Accident">
                    <InfoRow label="Date" value={dateAcc} />
                    <Divider style={s.divider} />
                    <InfoRow label="Heure" value={heureAcc} />
                </Section>

                {/* ── Appel ── */}
                <Section title="📞 Appel">
                    <InfoRow label="Date d'appel" value={dateApp} />
                    <Divider style={s.divider} />
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
                            <Divider style={s.divider} />
                            <InfoRow label="Pourcentage" value={`${sinistre.pourcentage_responsabilite}%`} highlight />
                        </>
                    )}
                </Section>

                {/* ── Contexte ── */}
                <Section title="📝 Contexte">
                    <View style={s.contexteWrap}>
                        <Text style={s.contexteText}>{sinistre.contexte}</Text>
                    </View>
                </Section>

                {/* ── Créateur ── */}
                {sinistre.Createur && (
                    <Section title="👤 Déclaré par">
                        <InfoRow label="Agent" value={`${sinistre.Createur.firstname} ${sinistre.Createur.lastname}`} />
                    </Section>
                )}

                {/* ── Documents ── */}
                <View style={s.docsSection}>
                    <View style={s.docsHeader}>
                        <Text style={s.docsSectionTitle}>📎 DOCUMENTS</Text>
                        <TouchableOpacity
                            style={[s.uploadBtn, uploading && { opacity: 0.6 }]}
                            onPress={() => setShowTypePicker(true)}
                            disabled={uploading}
                        >
                            {uploading
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={s.uploadBtnText}>＋ Ajouter</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    <View style={s.docsCard}>
                        {docs.length === 0 ? (
                            <View style={s.emptyDocs}>
                                <Text style={s.emptyDocsIcon}>📂</Text>
                                <Text style={s.emptyDocsText}>Aucun document joint</Text>
                                <Text style={s.emptyDocsSub}>Appuyez sur «＋ Ajouter» pour joindre un fichier</Text>
                            </View>
                        ) : (
                            docs.map((doc: any, i: number) => {
                                const typeConfig = DOC_TYPES.find(t => t.key === doc.type);
                                const uploadDate = new Date(doc.uploaded_at).toLocaleDateString('fr-FR');
                                const isDeleting = deletingId === doc.id;
                                const filename   = doc.chemin_fichier.split('-').slice(1).join('-') || doc.chemin_fichier;
                                return (
                                    <View key={doc.id}>
                                        {i > 0 && <Divider style={s.divider} />}
                                        <View style={s.docRow}>
                                            <View style={s.docIconBox}>
                                                <Text style={s.docIcon}>{typeConfig?.icon ?? '📄'}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={s.docInfo}
                                                onPress={() => handleOpen(doc.chemin_fichier)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={s.docType}>{typeConfig?.label ?? doc.type}</Text>
                                                <Text style={s.docMeta}>{filename}  ·  {uploadDate}</Text>
                                                <Text style={s.docOpen}>Appuyer pour ouvrir →</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={s.docDeleteBtn}
                                                onPress={() => handleDelete(doc.id, filename)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting
                                                    ? <ActivityIndicator size="small" color="#DC2626" />
                                                    : <Text style={s.docDeleteIcon}>🗑️</Text>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </View>

                {/* ── Actions mail ── */}
                <View style={s.docsSection}>
                    <Text style={s.docsSectionTitle}>📧 NOTIFICATIONS</Text>
                    <View style={s.actionsCard}>
                        <TouchableOpacity
                            style={[s.actionRow, { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }]}
                            onPress={handleRequestDocs}
                            disabled={sendingMail !== null}
                        >
                            {sendingMail === 'docs'
                                ? <ActivityIndicator size="small" color="#1565C0" style={{ marginRight: 14 }} />
                                : <Text style={s.actionIcon}>📄</Text>
                            }
                            <View style={{ flex: 1 }}>
                                <Text style={s.actionLabel}>Demander les documents</Text>
                                <Text style={s.actionSub}>Envoie un email à l'assuré</Text>
                            </View>
                            <Text style={s.actionArrow}>›</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={s.actionRow}
                            onPress={handleRequestRib}
                            disabled={sendingMail !== null}
                        >
                            {sendingMail === 'rib'
                                ? <ActivityIndicator size="small" color="#059669" style={{ marginRight: 14 }} />
                                : <Text style={s.actionIcon}>🏦</Text>
                            }
                            <View style={{ flex: 1 }}>
                                <Text style={s.actionLabel}>Demander le RIB</Text>
                                <Text style={s.actionSub}>Envoie un email à l'assuré</Text>
                            </View>
                            <Text style={s.actionArrow}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    stateText: { color: '#94A3B8', marginTop: 12 },
    errorText: { color: '#DC2626', fontSize: 15, textAlign: 'center', marginBottom: 16 },
    retryBtn:  { backgroundColor: '#1565C0', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    retryLabel: { color: '#fff', fontWeight: '700' },

    /* ── Header ── */
    header: {
        backgroundColor: '#0D47A1', paddingTop: 54,
        paddingBottom: 28, paddingHorizontal: 20, overflow: 'hidden',
    },
    headerBubble: {
        position: 'absolute', width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -50,
    },
    backBtn:   { marginBottom: 20 },
    backText:  { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
    plateRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
    plateBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', paddingRight: 14 },
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

    /* ── Documents ── */
    docsSection: { marginBottom: 20 },
    docsHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10, paddingHorizontal: 4,
    },
    docsSectionTitle: {
        fontSize: 12, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 1,
    },
    uploadBtn: {
        backgroundColor: '#1565C0', paddingHorizontal: 14,
        paddingVertical: 7, borderRadius: 10,
        minWidth: 90, alignItems: 'center',
    },
    uploadBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

    docsCard: {
        backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
        shadowColor: '#1565C0', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    emptyDocs: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
    emptyDocsIcon: { fontSize: 36, marginBottom: 8 },
    emptyDocsText: { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 4 },
    emptyDocsSub:  { fontSize: 12, color: '#94A3B8', textAlign: 'center' },

    docRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    },
    docIconBox: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
    },
    docIcon:      { fontSize: 20 },
    docInfo:      { flex: 1 },
    docType:      { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    docMeta:      { fontSize: 11, color: '#94A3B8', marginBottom: 2 },
    docOpen:      { fontSize: 11, color: '#1565C0', fontWeight: '600' },
    docDeleteBtn: { padding: 8 },
    docDeleteIcon: { fontSize: 18 },

    /* ── Actions notifications ── */
    actionsCard: {
        backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    actionRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    actionIcon:  { fontSize: 22, marginRight: 14 },
    actionLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    actionSub:   { fontSize: 12, color: '#94A3B8' },
    actionArrow: { fontSize: 22, color: '#CBD5E1', marginLeft: 8 },

    /* ── Modal type doc ── */
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#DDE3F0', alignSelf: 'center', marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0D1B3E', marginBottom: 4 },
    modalSub:   { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
    modalOption: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    modalOptionIcon:  { fontSize: 24, marginRight: 14 },
    modalOptionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
    modalOptionArrow: { fontSize: 22, color: '#CBD5E1' },
    modalCancel: {
        marginTop: 16, backgroundColor: '#F1F5F9',
        borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    },
    modalCancelText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
});
