import { useState } from 'react';
import {
    View, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, Switch, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { sinistresApi } from '@/utils/fetchData';

// ── Helpers ────────────────────────────────────────────────────────────────────
function toISODate(d: string): string {
    // Convertit "31/03/2026" → "2026-03-31T00:00:00.000Z"
    const [day, month, year] = d.split('/');
    return new Date(`${year}-${month}-${day}`).toISOString();
}

function isValidDate(d: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return false;
    const [day, month, year] = d.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// ── Sous-composant label de section ───────────────────────────────────────────
function SectionTitle({ children }: { children: string }) {
    return <Text style={styles.sectionTitle}>{children}</Text>;
}

// ── Écran ──────────────────────────────────────────────────────────────────────
export default function CreateSinistreScreen() {
    const router = useRouter();
    const { token } = useAuth();

    const [form, setForm] = useState({
        immatriculation: '',
        conducteur_nom: '',
        conducteur_prenom: '',
        conducteur_est_assure: true,
        date_accident: '',
        date_appel: '',
        contexte: '',
        responsabilite_engagee: false,
        pourcentage_responsabilite: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (key: keyof typeof form) => (val: any) =>
        setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async () => {
        setError('');
        const { immatriculation, conducteur_nom, conducteur_prenom, date_accident, date_appel, contexte } = form;

        if (!immatriculation || !conducteur_nom || !conducteur_prenom || !date_accident || !date_appel || !contexte) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }
        if (!isValidDate(date_accident)) {
            setError('Date d\'accident invalide (format JJ/MM/AAAA)');
            return;
        }
        if (!isValidDate(date_appel)) {
            setError('Date d\'appel invalide (format JJ/MM/AAAA)');
            return;
        }

        setIsLoading(true);
        try {
            await sinistresApi.create({
                immatriculation: immatriculation.toUpperCase(),
                conducteur_nom,
                conducteur_prenom,
                conducteur_est_assure: form.conducteur_est_assure,
                date_accident: toISODate(date_accident),
                date_appel: toISODate(date_appel),
                contexte,
                responsabilite_engagee: form.responsabilite_engagee,
                pourcentage_responsabilite: form.responsabilite_engagee
                    ? parseInt(form.pourcentage_responsabilite) || 0
                    : 0,
            }, token!);

            router.back();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerBubble} />
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹  Annuler</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouveau sinistre</Text>
                <Text style={styles.headerSub}>Remplissez les informations du sinistre</Text>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                    {/* ── Véhicule ── */}
                    <SectionTitle>🚗 Véhicule</SectionTitle>
                    <View style={styles.card}>
                        <TextInput
                            label="Immatriculation *"
                            value={form.immatriculation}
                            onChangeText={set('immatriculation')}
                            autoCapitalize="characters"
                            mode="outlined"
                            outlineColor="#E2E8F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 12 }}
                            style={styles.input}
                            placeholder="AB-123-CD"
                        />
                    </View>

                    {/* ── Conducteur ── */}
                    <SectionTitle>🧑 Conducteur</SectionTitle>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <TextInput
                                label="Prénom *"
                                value={form.conducteur_prenom}
                                onChangeText={set('conducteur_prenom')}
                                mode="outlined"
                                outlineColor="#E2E8F0"
                                activeOutlineColor="#1565C0"
                                outlineStyle={{ borderRadius: 12 }}
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label="Nom *"
                                value={form.conducteur_nom}
                                onChangeText={set('conducteur_nom')}
                                mode="outlined"
                                outlineColor="#E2E8F0"
                                activeOutlineColor="#1565C0"
                                outlineStyle={{ borderRadius: 12 }}
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Conducteur assuré</Text>
                            <Switch
                                value={form.conducteur_est_assure}
                                onValueChange={set('conducteur_est_assure')}
                                color="#1565C0"
                            />
                        </View>
                    </View>

                    {/* ── Dates ── */}
                    <SectionTitle>📅 Dates</SectionTitle>
                    <View style={styles.card}>
                        <TextInput
                            label="Date d'accident * (JJ/MM/AAAA)"
                            value={form.date_accident}
                            onChangeText={set('date_accident')}
                            keyboardType="numeric"
                            mode="outlined"
                            outlineColor="#E2E8F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 12 }}
                            style={styles.input}
                            placeholder="31/03/2026"
                        />
                        <TextInput
                            label="Date d'appel * (JJ/MM/AAAA)"
                            value={form.date_appel}
                            onChangeText={set('date_appel')}
                            keyboardType="numeric"
                            mode="outlined"
                            outlineColor="#E2E8F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 12 }}
                            style={styles.input}
                            placeholder="01/04/2026"
                        />
                    </View>

                    {/* ── Responsabilité ── */}
                    <SectionTitle>⚖️ Responsabilité</SectionTitle>
                    <View style={styles.card}>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Responsabilité engagée</Text>
                            <Switch
                                value={form.responsabilite_engagee}
                                onValueChange={set('responsabilite_engagee')}
                                color="#1565C0"
                            />
                        </View>
                        {form.responsabilite_engagee && (
                            <TextInput
                                label="Pourcentage de responsabilité (%)"
                                value={form.pourcentage_responsabilite}
                                onChangeText={set('pourcentage_responsabilite')}
                                keyboardType="numeric"
                                mode="outlined"
                                outlineColor="#E2E8F0"
                                activeOutlineColor="#1565C0"
                                outlineStyle={{ borderRadius: 12 }}
                                style={[styles.input, { marginTop: 12 }]}
                                right={<TextInput.Affix text="%" />}
                            />
                        )}
                    </View>

                    {/* ── Contexte ── */}
                    <SectionTitle>📝 Contexte</SectionTitle>
                    <View style={styles.card}>
                        <TextInput
                            label="Description de l'accident *"
                            value={form.contexte}
                            onChangeText={set('contexte')}
                            multiline
                            numberOfLines={5}
                            mode="outlined"
                            outlineColor="#E2E8F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 12 }}
                            style={[styles.input, { minHeight: 120 }]}
                        />
                    </View>

                    {/* ── Erreur ── */}
                    {!!error && (
                        <View style={styles.errorWrap}>
                            <HelperText type="error" visible style={styles.errorMsg}>⚠️  {error}</HelperText>
                        </View>
                    )}

                    {/* ── Bouton ── */}
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                        buttonColor="#1565C0"
                        style={styles.btn}
                        contentStyle={styles.btnContent}
                        labelStyle={styles.btnLabel}
                    >
                        {isLoading ? 'Enregistrement...' : '✓  Créer le sinistre'}
                    </Button>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    header: {
        backgroundColor: '#0D47A1', paddingTop: 54,
        paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden',
    },
    headerBubble: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40,
    },
    backBtn: { marginBottom: 16 },
    backText: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '500' },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
    headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

    content: { padding: 16, paddingBottom: 32 },

    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginTop: 16, marginBottom: 10, marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff', borderRadius: 18,
        padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    row: { flexDirection: 'row' },
    input: { backgroundColor: '#fff', marginBottom: 0 },
    switchRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 6,
    },
    switchLabel: { fontSize: 15, color: '#1E293B', fontWeight: '500' },

    errorWrap: { backgroundColor: '#FEE2E2', borderRadius: 12, paddingHorizontal: 12, marginTop: 12 },
    errorMsg:  { fontSize: 13, color: '#B91C1C' },

    btn: {
        marginTop: 20, borderRadius: 14,
        shadowColor: '#1565C0', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    btnContent: { paddingVertical: 8 },
    btnLabel:   { fontSize: 16, fontWeight: '700' },
});
