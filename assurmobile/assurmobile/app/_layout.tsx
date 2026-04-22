import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider } from '@/contexts/AuthContext';

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#1565C0',
        secondary: '#42A5F5',
    },
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <PaperProvider theme={theme}>
                <Stack screenOptions={{ headerShown: false }} />
            </PaperProvider>
        </AuthProvider>
    );
}
