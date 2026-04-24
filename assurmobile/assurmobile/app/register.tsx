import { useState } from 'react';
import {
    View, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { authApi } from '@/utils/fetchData';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (key: keyof typeof form) => (val: string) => {
        setForm(f => ({ ...f, [key]: val }));
        setError('');
    };

    const handleRegister = async () => {
        setError('');
        const { firstname, lastname, username, email, password, confirmPassword } = form;

        if (!username || !email || !password) {
            setError('Nom d\'utilisateur, email et mot de passe sont obligatoires');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Créer le compte
            await authApi.register({ username: username.trim(), firstname, lastname, email, password });
            // 2. Se connecter automatiquement avec les identifiants
            await login(username.trim(), password);
            router.replace('/');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création du compte');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
            <KeyboardAvoidingView
                style={s.root}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>

                    {/* ── Zone haute ── */}
                    <View style={s.topZone}>
                        <View style={s.bubble1} /><View style={s.bubble2} />
                        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                            <Text style={s.backText}>‹  Retour</Text>
                        </TouchableOpacity>
                        <View style={s.logoWrap}>
                            <View style={s.logoBox}>
                                <Text style={s.logoIcon}>🛡️</Text>
                            </View>
                            <Text style={s.appName}>Créer un compte</Text>
                            <Text style={s.appTagline}>Rejoignez AssurMoi en quelques secondes</Text>
                        </View>
                    </View>

                    {/* ── Formulaire ── */}
                    <View style={s.sheet}>
                        <View style={s.handle} />

                        {/* Prénom + Nom */}
                        <View style={s.row}>
                            <TextInput
                                label="Prénom"
                                value={form.firstname}
                                onChangeText={set('firstname')}
                                mode="outlined"
                                outlineColor="#DDE3F0"
                                activeOutlineColor="#1565C0"
                                outlineStyle={{ borderRadius: 14 }}
                                style={[s.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label="Nom"
                                value={form.lastname}
                                onChangeText={set('lastname')}
                                mode="outlined"
                                outlineColor="#DDE3F0"
                                activeOutlineColor="#1565C0"
                                outlineStyle={{ borderRadius: 14 }}
                                style={[s.input, { flex: 1 }]}
                            />
                        </View>

                        <TextInput
                            label="Nom d'utilisateur *"
                            value={form.username}
                            onChangeText={set('username')}
                            autoCapitalize="none"
                            autoCorrect={false}
                            mode="outlined"
                            left={<TextInput.Icon icon="account-outline" color="#1565C0" />}
                            outlineColor="#DDE3F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 14 }}
                            style={s.input}
                        />

                        <TextInput
                            label="Email *"
                            value={form.email}
                            onChangeText={set('email')}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            mode="outlined"
                            left={<TextInput.Icon icon="email-outline" color="#1565C0" />}
                            outlineColor="#DDE3F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 14 }}
                            style={s.input}
                        />

                        <TextInput
                            label="Mot de passe *"
                            value={form.password}
                            onChangeText={set('password')}
                            secureTextEntry={!showPassword}
                            mode="outlined"
                            left={<TextInput.Icon icon="lock-outline" color="#1565C0" />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    color="#999"
                                    onPress={() => setShowPassword(v => !v)}
                                />
                            }
                            outlineColor="#DDE3F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 14 }}
                            style={s.input}
                        />

                        <TextInput
                            label="Confirmer le mot de passe *"
                            value={form.confirmPassword}
                            onChangeText={set('confirmPassword')}
                            secureTextEntry={!showPassword}
                            mode="outlined"
                            left={<TextInput.Icon icon="lock-check-outline" color="#1565C0" />}
                            outlineColor="#DDE3F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 14 }}
                            style={s.input}
                        />

                        {!!error && (
                            <View style={s.errorWrap}>
                                <HelperText type="error" visible style={s.errorMsg}>⚠️  {error}</HelperText>
                            </View>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            loading={isLoading}
                            disabled={isLoading}
                            buttonColor="#1565C0"
                            style={s.btn}
                            contentStyle={s.btnContent}
                            labelStyle={s.btnLabel}
                        >
                            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                        </Button>

                        <View style={s.footer}>
                            <Text style={s.footerText}>Déjà un compte ? </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={s.footerLink}>Se connecter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0D47A1' },
    scroll: { flexGrow: 1 },

    topZone: {
        backgroundColor: '#0D47A1',
        paddingTop: 54, paddingBottom: 24,
        paddingHorizontal: 24, overflow: 'hidden',
    },
    bubble1: {
        position: 'absolute', width: 280, height: 280, borderRadius: 140,
        backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -60,
    },
    bubble2: {
        position: 'absolute', width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: -20,
    },
    backBtn: { marginBottom: 20 },
    backText: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '500' },
    logoWrap: { alignItems: 'center', paddingBottom: 8 },
    logoBox: {
        width: 68, height: 68, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    logoIcon: { fontSize: 32 },
    appName: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    appTagline: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 },

    sheet: {
        flex: 1, backgroundColor: '#F4F6FB',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 24, paddingTop: 14, paddingBottom: 48,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#DDE3F0', alignSelf: 'center', marginBottom: 24,
    },
    row: { flexDirection: 'row', marginBottom: 0 },
    input: { marginBottom: 14, backgroundColor: '#fff' },

    errorWrap: { backgroundColor: '#FEE2E2', borderRadius: 12, paddingHorizontal: 12, marginBottom: 8 },
    errorMsg: { fontSize: 13, color: '#B91C1C' },

    btn: {
        marginTop: 6, borderRadius: 14,
        shadowColor: '#1565C0', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    btnContent: { paddingVertical: 8 },
    btnLabel: { fontSize: 16, fontWeight: '700' },

    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    footerText: { color: '#94A3B8', fontSize: 14 },
    footerLink: { color: '#1565C0', fontSize: 14, fontWeight: '700' },
});
