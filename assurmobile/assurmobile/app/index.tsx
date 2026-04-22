import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Bienvenue sur AssurMoi 👋</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Vous êtes connecté.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        padding: 24,
    },
    title: {
        fontWeight: 'bold',
        color: '#1565C0',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#555',
    },
});
