import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, ActivityIndicator, Text } from 'react-native-paper';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#1565C0',
        secondary: '#42A5F5',
    },
};

// Écran de chargement pendant la vérification du token
function SplashScreen() {
    return (
        <View style={styles.splash}>
            <Text style={styles.splashLogo}>🛡️</Text>
            <Text style={styles.splashName}>AssurMoi</Text>
            <ActivityIndicator color="#fff" style={{ marginTop: 32 }} />
        </View>
    );
}

function RootNavigator() {
    const { isInitializing } = useAuth();
    if (isInitializing) return <SplashScreen />;
    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <PaperProvider theme={theme}>
                <RootNavigator />
            </PaperProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        backgroundColor: '#0D47A1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashLogo: { fontSize: 64, marginBottom: 12 },
    splashName: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
});
