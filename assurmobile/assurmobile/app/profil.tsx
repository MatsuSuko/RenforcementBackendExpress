import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/utils/api';

const ROLE_LABELS: Record<string, string> = {
    superadmin:       '⭐ Super Administrateur',
    manager:          '👔 Manager',
    sinister_manager: '🔧 Gestionnaire sinistres',
    request_manager:  '📋 Gestionnaire requêtes',
    insured:          '👤 Assuré',
};

export default function ProfilScreen() {
    const router = useRouter();
    const { user, token, logout } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]         = useState('');
    const [confirmPwd, setConfirmPwd]           = useState('');
    const [showPwd, setShowPwd]                 = useState(false);
    const [loading, setLoading]                 = useState(false);

    const displayName = user?.firstname
        ? `${user.firstname} ${user.lastname}`
        : user?.username ?? '';

    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert('Erreur', 'Remplissez tous les champs');
            return;
        }
        if (newPassword !== confirmPwd) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Erreur', 'Le nouveau mot de passe doit faire au moins 6 caractères');
            return;
        }
        setLoading(true);
        try {
            await authApi.changePassword(currentPassword, newPassword, token!);
            Alert.alert('✅ Succès', 'Mot de passe modifié avec succès');
            setCurrentPassword(''); setNewPassword(''); setConfirmPwd('');
        } catch (e: any) {
            Alert.alert('Erreur', e.message || 'Impossible de modifier le mot de passe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor="#EA580C" />

            {/* ── Header ── */}
            <View style={s.header}>
                <View style={s.bubble} />
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Text style={s.backText}>‹  Accueil</Text>
                </TouchableOpacity>
                <View style={s.avatarWrap}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{initials}</Text>
                    </View>
                    <Text style={s.name}>{displayName}</Text>
                    <Text style={s.role}>{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.content}>

                {/* ── Infos ── */}
                <Text style={s.sectionTitle}>INFORMATIONS</Text>
                <View style={s.card}>
                    <Row label="Nom d'utilisateur" value={user?.username ?? '—'} />
                    <Row label="Email" value={user?.email ?? '—'} />
                    {user?.firstname ? <Row label="Prénom" value={user.firstname} /> : null}
                    {user?.lastname  ? <Row label="Nom"    value={user.lastname}  /> : null}
                </View>

                {/* ── Changer mdp ── */}
                <Text style={s.sectionTitle}>CHANGER LE MOT DE PASSE</Text>
                <View style={s.card}>
                    <TextInput
                        label="Mot de passe actuel"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showPwd}
                        mode="outlined"
                        outlineColor="#E2E8F0"
                        activeOutlineColor="#EA580C"
                        outlineStyle={{ borderRadius: 12 }}
                        style={s.input}
                        right={<TextInput.Icon icon={showPwd ? 'eye-off' : 'eye'} onPress={() => setShowPwd(v => !v)} />}
                    />
                    <TextInput
                        label="Nouveau mot de passe"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPwd}
                        mode="outlined"
                        outlineColor="#E2E8F0"
                        activeOutlineColor="#EA580C"
                        outlineStyle={{ borderRadius: 12 }}
                        style={s.input}
                    />
                    <TextInput
                        label="Confirmer le nouveau mot de passe"
                        value={confirmPwd}
                        onChangeText={setConfirmPwd}
                        secureTextEntry={!showPwd}
                        mode="outlined"
                        outlineColor="#E2E8F0"
                        activeOutlineColor="#EA580C"
                        outlineStyle={{ borderRadius: 12 }}
                        style={s.input}
                    />
                    <Button
                        mode="contained"
                        onPress={handleChangePassword}
                        loading={loading}
                        disabled={loading}
                        buttonColor="#EA580C"
                        style={s.btn}
                        contentStyle={{ paddingVertical: 6 }}
                        labelStyle={{ fontWeight: '700' }}
                    >
                        Modifier le mot de passe
                    </Button>
                </View>

                {/* ── Déconnexion ── */}
                <TouchableOpacity style={s.logoutBtn} onPress={logout}>
                    <Text style={s.logoutText}>⎋  Se déconnecter</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={s.row}>
            <Text style={s.rowLabel}>{label}</Text>
            <Text style={s.rowValue}>{value}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    header: {
        backgroundColor: '#EA580C', paddingTop: 54,
        paddingBottom: 28, paddingHorizontal: 20, overflow: 'hidden',
    },
    bubble: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
    },
    backBtn:  { marginBottom: 16 },
    backText: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '500' },
    avatarWrap: { alignItems: 'center', paddingVertical: 8 },
    avatar: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
        marginBottom: 12,
    },
    avatarText: { fontSize: 26, fontWeight: '800', color: '#fff' },
    name: { fontSize: 22, fontWeight: '800', color: '#fff' },
    role: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

    content: { padding: 20 },

    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginTop: 20, marginBottom: 10, marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff', borderRadius: 18, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    row: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    rowLabel: { fontSize: 14, color: '#64748B' },
    rowValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

    input: { backgroundColor: '#fff', marginBottom: 12 },
    btn:   { borderRadius: 12, marginTop: 4 },

    logoutBtn: {
        marginTop: 24, backgroundColor: '#FEE2E2',
        borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    },
    logoutText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});
