import { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
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
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* ── Fond haut ── */}
            <View style={styles.topBackground}>
                {/* Cercles décoratifs */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <Text style={styles.logoEmoji}>🛡️</Text>
                    </View>
                    <Text style={styles.logoText}>AssurMoi</Text>
                    <Text style={styles.logoSubtitle}>Votre assurance, simplifiée</Text>
                </View>
            </View>

            {/* ── Carte formulaire ── */}
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Connexion</Text>
                    <Text style={styles.cardSubtitle}>Bienvenue ! Entrez vos identifiants.</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            label="Nom d'utilisateur"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            left={<TextInput.Icon icon="account-outline" color="#1565C0" />}
                            mode="outlined"
                            outlineColor="#E0E7FF"
                            activeOutlineColor="#1565C0"
                            style={styles.input}
                            contentStyle={styles.inputContent}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            label="Mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!passwordVisible}
                            left={<TextInput.Icon icon="lock-outline" color="#1565C0" />}
                            right={
                                <TextInput.Icon
                                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                                    color="#888"
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                />
                            }
                            mode="outlined"
                            outlineColor="#E0E7FF"
                            activeOutlineColor="#1565C0"
                            style={styles.input}
                            contentStyle={styles.inputContent}
                        />
                    </View>

                    {!!error && (
                        <View style={styles.errorBox}>
                            <HelperText type="error" visible style={styles.errorText}>
                                ⚠️  {error}
                            </HelperText>
                        </View>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        buttonColor="#1565C0"
                    >
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </Button>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ou</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Button
                        mode="outlined"
                        onPress={() => router.push('/forgot-password')}
                        style={styles.forgotButton}
                        textColor="#1565C0"
                        labelStyle={styles.forgotLabel}
                    >
                        Mot de passe oublié ?
                    </Button>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    © 2026 AssurMoi — Tous droits réservés
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
    },

    /* ── Fond haut bleu ── */
    topBackground: {
        height: height * 0.38,
        backgroundColor: '#1565C0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.07)',
        top: -80,
        right: -60,
    },
    circle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -60,
        left: -40,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoEmoji: {
        fontSize: 36,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1.5,
    },
    logoSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 4,
        letterSpacing: 0.5,
    },

    /* ── Carte ── */
    scroll: {
        flexGrow: 1,
        backgroundColor: '#F5F7FF',
    },
    card: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -24,
        paddingHorizontal: 28,
        paddingTop: 36,
        paddingBottom: 28,
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 28,
    },

    /* ── Inputs ── */
    inputWrapper: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#FAFBFF',
        borderRadius: 12,
    },
    inputContent: {
        fontSize: 15,
    },

    /* ── Erreur ── */
    errorBox: {
        backgroundColor: '#FFF0F0',
        borderRadius: 10,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 13,
    },

    /* ── Bouton principal ── */
    button: {
        marginTop: 8,
        borderRadius: 12,
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    /* ── Divider ── */
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E8EAF6',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#aaa',
        fontSize: 13,
    },

    /* ── Bouton secondaire ── */
    forgotButton: {
        borderRadius: 12,
        borderColor: '#C5CAE9',
    },
    forgotLabel: {
        fontSize: 14,
        fontWeight: '500',
    },

    /* ── Footer ── */
    footer: {
        textAlign: 'center',
        color: '#bbb',
        fontSize: 12,
        paddingVertical: 24,
        backgroundColor: '#F5F7FF',
    },
});
