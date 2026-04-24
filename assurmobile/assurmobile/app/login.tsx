import { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        try {
            await login(username.trim(), password);
            router.replace('/');
        } catch (err: any) {
            setError(err.message || 'Identifiants incorrects');
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {/* ── Zone haute ── */}
                    <View style={styles.topZone}>
                        <View style={styles.bubble1} />
                        <View style={styles.bubble2} />
                        <View style={styles.bubble3} />

                        <View style={styles.logoWrap}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoIcon}>🛡️</Text>
                            </View>
                            <Text style={styles.appName}>AssurMoi</Text>
                            <Text style={styles.appTagline}>Votre assurance, simplifiée</Text>
                        </View>
                    </View>

                    {/* ── Formulaire ── */}
                    <View style={styles.formSheet}>
                        <View style={styles.handle} />

                        <Text style={styles.formTitle}>Connexion</Text>
                        <Text style={styles.formSub}>
                            Entrez vos identifiants pour accéder à votre espace.
                        </Text>

                        <TextInput
                            label="Nom d'utilisateur"
                            value={username}
                            onChangeText={t => { setUsername(t); setError(''); }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            mode="outlined"
                            left={<TextInput.Icon icon="account-circle-outline" color="#1565C0" />}
                            outlineColor="#DDE3F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 14 }}
                            style={styles.input}
                        />

                        <TextInput
                            label="Mot de passe"
                            value={password}
                            onChangeText={t => { setPassword(t); setError(''); }}
                            secureTextEntry={!passwordVisible}
                            mode="outlined"
                            left={<TextInput.Icon icon="lock-outline" color="#1565C0" />}
                            right={
                                <TextInput.Icon
                                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                                    color="#999"
                                    onPress={() => setPasswordVisible(v => !v)}
                                />
                            }
                            outlineColor="#DDE3F0"
                            activeOutlineColor="#1565C0"
                            outlineStyle={{ borderRadius: 14 }}
                            style={styles.input}
                        />

                        {!!error && (
                            <View style={styles.errorWrap}>
                                <Text style={styles.errorIcon}>⚠️</Text>
                                <HelperText type="error" visible style={styles.errorMsg}>
                                    {error}
                                </HelperText>
                            </View>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={isLoading}
                            disabled={isLoading}
                            buttonColor="#1565C0"
                            style={styles.btn}
                            contentStyle={styles.btnContent}
                            labelStyle={styles.btnLabel}
                        >
                            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                        </Button>

                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Pas encore de compte ? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text style={styles.registerLink}>S'inscrire</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>© 2026 AssurMoi</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0D47A1' },
    scroll: { flexGrow: 1 },

    /* ── Zone haute ── */
    topZone: {
        height: height * 0.36,
        backgroundColor: '#0D47A1',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bubble1: {
        position: 'absolute', width: 320, height: 320, borderRadius: 160,
        backgroundColor: 'rgba(255,255,255,0.06)', top: -100, right: -80,
    },
    bubble2: {
        position: 'absolute', width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.04)', bottom: -50, left: -30,
    },
    bubble3: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.06)', top: 20, left: 40,
    },
    logoWrap: { alignItems: 'center' },
    logoBox: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    logoIcon: { fontSize: 38 },
    appName: {
        fontSize: 34, fontWeight: '800', color: '#fff',
        letterSpacing: 1.5,
    },
    appTagline: {
        fontSize: 13, color: 'rgba(255,255,255,0.65)',
        marginTop: 6, letterSpacing: 0.3,
    },

    /* ── Formulaire ── */
    formSheet: {
        flex: 1,
        backgroundColor: '#F4F6FB',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 28,
        paddingTop: 16,
        paddingBottom: 40,
        marginTop: -8,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#DDE3F0',
        alignSelf: 'center', marginBottom: 28,
    },
    formTitle: {
        fontSize: 28, fontWeight: '800', color: '#0D1B3E',
        marginBottom: 6,
    },
    formSub: {
        fontSize: 14, color: '#7B8DB0',
        marginBottom: 28, lineHeight: 20,
    },
    input: {
        marginBottom: 14,
        backgroundColor: '#fff',
        fontSize: 15,
    },

    /* ── Erreur ── */
    errorWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 12, paddingHorizontal: 12,
        marginBottom: 8,
    },
    errorIcon: { fontSize: 14, marginRight: 4 },
    errorMsg: { flex: 1, fontSize: 13, color: '#B91C1C' },

    /* ── Bouton ── */
    btn: {
        marginTop: 8, borderRadius: 14,
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 10,
        elevation: 6,
    },
    btnContent: { paddingVertical: 8 },
    btnLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },

    /* ── Inscription ── */
    registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
    registerText: { color: '#94A3B8', fontSize: 14 },
    registerLink: { color: '#1565C0', fontSize: 14, fontWeight: '700' },

    /* ── Footer ── */
    footer: { alignItems: 'center', marginTop: 24 },
    footerText: { fontSize: 12, color: '#B0BAD0' },
});
