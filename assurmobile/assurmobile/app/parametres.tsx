import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ParametresScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const [notifs, setNotifs] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

            {/* ── Header ── */}
            <View style={s.header}>
                <View style={s.bubble} />
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Text style={s.backText}>‹  Accueil</Text>
                </TouchableOpacity>
                <Text style={s.title}>⚙️ Paramètres</Text>
                <Text style={s.sub}>Configuration de l'application</Text>
            </View>

            <ScrollView contentContainerStyle={s.content}>

                {/* ── Préférences ── */}
                <Text style={s.sectionTitle}>PRÉFÉRENCES</Text>
                <View style={s.card}>
                    <View style={s.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.rowLabel}>Notifications</Text>
                            <Text style={s.rowSub}>Recevoir les alertes de l'app</Text>
                        </View>
                        <Switch value={notifs} onValueChange={setNotifs} color="#7C3AED" />
                    </View>
                    <View style={[s.row, { borderBottomWidth: 0 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.rowLabel}>Mode sombre</Text>
                            <Text style={s.rowSub}>Thème sombre de l'interface</Text>
                        </View>
                        <Switch value={darkMode} onValueChange={setDarkMode} color="#7C3AED" />
                    </View>
                </View>

                {/* ── À propos ── */}
                <Text style={s.sectionTitle}>À PROPOS</Text>
                <View style={s.card}>
                    <InfoRow label="Application" value="AssurMoi" />
                    <InfoRow label="Version"     value="1.0.0" />
                    <InfoRow label="Plateforme"  value="React Native + Expo" />
                    <InfoRow label="Backend"     value="Node.js + Express" last />
                </View>

                {/* ── Compte ── */}
                <Text style={s.sectionTitle}>COMPTE</Text>
                <View style={s.card}>
                    <TouchableOpacity
                        style={[s.row, { borderBottomWidth: 0 }]}
                        onPress={() => Alert.alert(
                            'Déconnexion',
                            'Voulez-vous vraiment vous déconnecter ?',
                            [
                                { text: 'Annuler', style: 'cancel' },
                                { text: 'Déconnecter', style: 'destructive', onPress: logout },
                            ]
                        )}
                    >
                        <Text style={[s.rowLabel, { color: '#DC2626' }]}>Se déconnecter</Text>
                        <Text style={{ color: '#DC2626', fontSize: 20 }}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
    return (
        <View style={[s.row, last && { borderBottomWidth: 0 }]}>
            <Text style={s.rowLabel}>{label}</Text>
            <Text style={s.rowValue}>{value}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    header: {
        backgroundColor: '#7C3AED', paddingTop: 54,
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

    content: { padding: 20 },

    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginTop: 20, marginBottom: 10, marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    row: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    rowLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    rowSub:   { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    rowValue: { fontSize: 14, color: '#64748B' },
});
