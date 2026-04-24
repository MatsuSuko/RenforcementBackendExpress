import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const MENU = [
    { icon: '🚗', label: 'Sinistres',   sub: 'Gérer les déclarations', route: '/sinistres',  accent: '#1565C0' },
    { icon: '📁', label: 'Dossiers',    sub: 'Suivre les dossiers',    route: '/dossiers',   accent: '#059669' },
    { icon: '👤', label: 'Mon profil',  sub: 'Mes informations',       route: '/profil',     accent: '#EA580C' },
    { icon: '⚙️', label: 'Paramètres', sub: 'Configuration',           route: '/parametres', accent: '#7C3AED' },
];

const ROLE_LABELS: Record<string, string> = {
    superadmin:       'Super Administrateur',
    manager:          'Manager',
    sinister_manager: 'Gestionnaire sinistres',
    request_manager:  'Gestionnaire requêtes',
    insured:          'Assuré',
};

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated) return <Redirect href="/login" />;

    const displayName = user?.firstname
        ? `${user.firstname} ${user.lastname}`
        : user?.username ?? '';

    const initials = displayName
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Header ── */}
                <View style={s.header}>
                    <View style={s.bubble1} />
                    <View style={s.bubble2} />

                    <View style={s.headerTop}>
                        <View style={s.avatar}>
                            <Text style={s.avatarText}>{initials}</Text>
                        </View>
                        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
                            <Text style={s.logoutText}>⎋  Déconnexion</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={s.greeting}>Bonjour 👋</Text>
                    <Text style={s.name}>{displayName}</Text>
                    <View style={s.rolePill}>
                        <Text style={s.roleText}>{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</Text>
                    </View>
                </View>

                {/* ── Corps ── */}
                <View style={s.body}>

                    {/* Carte de bienvenue */}
                    <View style={s.welcomeCard}>
                        <Text style={s.welcomeTitle}>Bienvenue sur AssurMoi 🛡️</Text>
                        <Text style={s.welcomeSub}>
                            Gérez vos sinistres et dossiers depuis cette application.
                        </Text>
                    </View>

                    {/* Menu en liste */}
                    <Text style={s.sectionLabel}>Navigation</Text>
                    <View style={s.menuList}>
                        {MENU.map((item, i) => (
                            <TouchableOpacity
                                key={item.route}
                                style={[s.menuItem, i < MENU.length - 1 && s.menuItemBorder]}
                                onPress={() => router.push(item.route as any)}
                                activeOpacity={0.7}
                            >
                                <View style={[s.menuIconBox, { backgroundColor: `${item.accent}18` }]}>
                                    <Text style={s.menuIcon}>{item.icon}</Text>
                                </View>
                                <View style={s.menuText}>
                                    <Text style={s.menuLabel}>{item.label}</Text>
                                    <Text style={s.menuSub}>{item.sub}</Text>
                                </View>
                                <Text style={[s.menuArrow, { color: item.accent }]}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4F6FB' },

    /* ── Header ── */
    header: {
        backgroundColor: '#0D47A1',
        paddingTop: 56, paddingBottom: 36,
        paddingHorizontal: 24, overflow: 'hidden',
    },
    bubble1: {
        position: 'absolute', width: 250, height: 250, borderRadius: 125,
        backgroundColor: 'rgba(255,255,255,0.06)', top: -70, right: -50,
    },
    bubble2: {
        position: 'absolute', width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -20,
    },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
    },
    avatar: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
    logoutBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    logoutText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
    greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 4 },
    name:     { color: '#fff', fontSize: 27, fontWeight: '800' },
    rolePill: {
        marginTop: 10, alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    },
    roleText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },

    /* ── Corps ── */
    body: { padding: 20, paddingBottom: 40 },

    /* Carte de bienvenue */
    welcomeCard: {
        backgroundColor: '#fff', borderRadius: 18,
        padding: 20, marginBottom: 28,
        borderLeftWidth: 4, borderLeftColor: '#1565C0',
        shadowColor: '#1565C0', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    welcomeTitle: { fontSize: 16, fontWeight: '700', color: '#0D1B3E', marginBottom: 6 },
    welcomeSub:   { fontSize: 13, color: '#64748B', lineHeight: 20 },

    /* Menu liste */
    sectionLabel: {
        fontSize: 11, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 12, marginLeft: 4,
    },
    menuList: {
        backgroundColor: '#fff', borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 18, paddingVertical: 16,
    },
    menuItemBorder: {
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    menuIconBox: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    menuIcon:  { fontSize: 22 },
    menuText:  { flex: 1 },
    menuLabel: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    menuSub:   { fontSize: 12, color: '#94A3B8' },
    menuArrow: { fontSize: 24, fontWeight: '300', marginLeft: 8 },
});
