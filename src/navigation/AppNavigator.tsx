import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '../store/useStore';
import { UserRole } from '../types';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';
import { NewTicketScreen } from '../screens/client/NewTicketScreen';
import { TechnicianHomeScreen } from '../screens/technician/TechnicianHomeScreen';
import { ClientsByTechScreen } from '../screens/technician/ClientsByTechScreen';
import { ClientTicketsScreen } from '../screens/technician/ClientTicketsScreen';
import { TicketDetailScreen } from '../screens/shared/TicketDetailScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { RateTicketScreen } from '../screens/shared/RateTicketScreen';
import { TicketCard } from '../components/cards/TicketCard';

import { Colors, Typography } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MyTicketsScreen({ navigation }: any) {
  const { getMyTickets, setSelectedTicket } = useStore();
  const myTickets = getMyTickets();
  const sorted = [...myTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      {sorted.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 64 }}>
          <Text style={{ color: Colors.textSecondary, fontSize: Typography.base }}>Nenhum chamado ainda.</Text>
        </View>
      ) : sorted.map((ticket: any) => (
        <TicketCard key={ticket.id} ticket={ticket} onPress={(t: any) => { setSelectedTicket(t); navigation.navigate('TicketDetail', { ticketId: t.id }); }} />
      ))}
    </ScrollView>
  );
}

function ClientTabs() {
  const { getUnreadCount } = useStore();
  const unread = getUnreadCount();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: Typography.md },
        tabBarStyle: { backgroundColor: Colors.white, borderTopColor: Colors.border, paddingBottom: 4 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, { default: string; active: string }> = {
            ClientHome: { default: 'home-outline', active: 'home' },
            MyTickets: { default: 'list-outline', active: 'list' },
            Profile: { default: 'person-outline', active: 'person' },
          };
          const set = icons[route.name];
          return <Ionicons name={(focused ? set?.active : set?.default) as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ClientHome" component={ClientHomeScreen} options={{ title: 'Início', headerTitle: 'ISAAC' }} />
      <Tab.Screen name="MyTickets" component={MyTicketsScreen} options={{ title: 'Meus chamados', headerTitle: 'Meus chamados' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil', headerTitle: 'Meu perfil' }} />
    </Tab.Navigator>
  );
}

function TechnicianTabs() {
  const { getUnreadCount } = useStore();
  const unread = getUnreadCount();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: Typography.md },
        tabBarStyle: { backgroundColor: Colors.white, borderTopColor: Colors.border, paddingBottom: 4 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, { default: string; active: string }> = {
            TechnicianHome: { default: 'home-outline', active: 'home' },
            ClientsByTech: { default: 'people-outline', active: 'people' },
            Profile: { default: 'person-outline', active: 'person' },
          };
          const set = icons[route.name];
          return <Ionicons name={(focused ? set?.active : set?.default) as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TechnicianHome" component={TechnicianHomeScreen} options={{ title: 'Chamados', headerTitle: 'ISAAC' }} />
      <Tab.Screen name="ClientsByTech" component={ClientsByTechScreen} options={{ title: 'Clientes', headerTitle: 'Clientes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil', headerTitle: 'Meu perfil' }} />
    </Tab.Navigator>
  );
}

const headerOpts = {
  headerShown: true,
  headerBackTitle: 'Voltar',
  headerStyle: { backgroundColor: Colors.white },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: '700' as const },
};

export function AppNavigator() {
  const { isAuthenticated, user } = useStore();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ ...headerOpts, headerTitle: 'Criar conta' }} />
          </>
        ) : user?.role === UserRole.CLIENT ? (
          <>
            <Stack.Screen name="ClientTabs" component={ClientTabs} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ ...headerOpts, headerTitle: 'Chamado' }} />
            <Stack.Screen name="NewTicket" component={NewTicketScreen} options={{ ...headerOpts, headerTitle: 'Novo chamado' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ ...headerOpts, headerTitle: 'Notificações' }} />
            <Stack.Screen name="RateTicket" component={RateTicketScreen} options={{ ...headerOpts, headerTitle: 'Avaliar atendimento' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="TechnicianTabs" component={TechnicianTabs} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ ...headerOpts, headerTitle: 'Chamado' }} />
            <Stack.Screen name="ClientTickets" component={ClientTicketsScreen} options={({ route }: any) => ({ ...headerOpts, headerTitle: route.params?.clientName || 'Chamados' })} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ ...headerOpts, headerTitle: 'Notificações' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
