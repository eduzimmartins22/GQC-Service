import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '../store/useStore';
import { UserRole } from '../types';

import { LoginScreen }           from '../screens/auth/LoginScreen';
import { RegisterScreen }        from '../screens/auth/RegisterScreen';
import { ResetPasswordScreen }   from '../screens/auth/ResetPasswordScreen';
import { ClientHomeScreen }      from '../screens/client/ClientHomeScreen';
import { NewTicketScreen }       from '../screens/client/NewTicketScreen';
import { NewInstallationScreen }  from '../screens/client/NewInstallationScreen';
import { TechnicianHomeScreen }  from '../screens/technician/TechnicianHomeScreen';
import { ClientsByTechScreen }   from '../screens/technician/ClientsByTechScreen';
import { ClientTicketsScreen }   from '../screens/technician/ClientTicketsScreen';
import { TicketDetailScreen }    from '../screens/shared/TicketDetailScreen';
import { ProfileScreen }         from '../screens/shared/ProfileScreen';
import { NotificationsScreen }   from '../screens/shared/NotificationsScreen';
import { RateTicketScreen }      from '../screens/shared/RateTicketScreen';
import { TrackingScreen }        from '../screens/shared/TrackingScreen';
import { ChatScreen }            from '../screens/shared/ChatScreen';
import { TicketCard }            from '../components/cards/TicketCard';

import { Colors, Typography } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function MyTicketsScreen({ navigation }: any) {
  const { getMyTickets, setSelectedTicket } = useStore();
  const sorted = [...getMyTickets()].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      {sorted.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 64 }}>
          <Text style={{ color: Colors.textSecondary, fontSize: Typography.base }}>Nenhum chamado ainda.</Text>
        </View>
      ) : sorted.map((ticket: any) => (
        <TicketCard key={ticket.id} ticket={ticket}
          onPress={(t: any) => { setSelectedTicket(t); navigation.navigate('TicketDetail', { ticketId: t.id }); }} />
      ))}
    </ScrollView>
  );
}

function ClientTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: Colors.white },
      headerTintColor: Colors.primary,
      headerTitleStyle: { fontWeight: '700', fontSize: Typography.md },
      tabBarStyle: { backgroundColor: Colors.white, borderTopColor: Colors.border, paddingBottom: 4 },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textTertiary,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ color, focused }) => {
        const icons: Record<string, any> = {
          ClientHome: focused ? 'home'   : 'home-outline',
          MyTickets:  focused ? 'list'   : 'list-outline',
          Profile:    focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="ClientHome" component={ClientHomeScreen} options={{ title: 'Início',        headerTitle: 'GCQ Manutenções' }} />
      <Tab.Screen name="MyTickets"  component={MyTicketsScreen}  options={{ title: 'Meus chamados', headerTitle: 'Meus chamados' }} />
      <Tab.Screen name="Profile"    component={ProfileScreen}    options={{ title: 'Perfil',         headerTitle: 'Meu perfil' }} />
    </Tab.Navigator>
  );
}

function TechnicianTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: Colors.white },
      headerTintColor: Colors.primary,
      headerTitleStyle: { fontWeight: '700', fontSize: Typography.md },
      tabBarStyle: { backgroundColor: Colors.white, borderTopColor: Colors.border, paddingBottom: 4 },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textTertiary,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ color, focused }) => {
        const icons: Record<string, any> = {
          TechnicianHome: focused ? 'home'   : 'home-outline',
          ClientsByTech:  focused ? 'people' : 'people-outline',
          Profile:        focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="TechnicianHome" component={TechnicianHomeScreen} options={{ title: 'Chamados', headerTitle: 'GCQ Manutenções' }} />
      <Tab.Screen name="ClientsByTech"  component={ClientsByTechScreen}  options={{ title: 'Clientes', headerTitle: 'Clientes' }} />
      <Tab.Screen name="Profile"        component={ProfileScreen}         options={{ title: 'Perfil',   headerTitle: 'Meu perfil' }} />
    </Tab.Navigator>
  );
}

const hdr = {
  headerShown: true, headerBackTitle: 'Voltar',
  headerStyle: { backgroundColor: Colors.white },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: '700' as const },
};

export function AppNavigator() {
  const { isAuthenticated, user, hydrate } = useStore();

  // Load persisted data from AsyncStorage on app start
  useEffect(() => { hydrate(); }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ ...hdr, headerTitle: 'Criar conta' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ ...hdr, headerTitle: 'Recuperar senha' }} />
          </>
        ) : user?.role === UserRole.CLIENT ? (
          <>
            <Stack.Screen name="ClientTabs"   component={ClientTabs} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen}  options={{ ...hdr, headerTitle: 'Chamado' }} />
            <Stack.Screen name="NewTicket"    component={NewTicketScreen}     options={{ ...hdr, headerTitle: 'Novo chamado' }} />
            <Stack.Screen name="NewInstallation" component={NewInstallationScreen} options={{ ...hdr, headerTitle: 'Nova instalação' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ ...hdr, headerTitle: 'Notificações' }} />
            <Stack.Screen name="RateTicket"   component={RateTicketScreen}    options={{ ...hdr, headerTitle: 'Avaliar atendimento' }} />
            <Stack.Screen name="Tracking"     component={TrackingScreen}      options={{ headerShown: false }} />
            <Stack.Screen name="Chat"         component={ChatScreen}          options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="TechnicianTabs" component={TechnicianTabs} />
            <Stack.Screen name="TicketDetail"   component={TicketDetailScreen}  options={{ ...hdr, headerTitle: 'Chamado' }} />
            <Stack.Screen name="ClientTickets"  component={ClientTicketsScreen} options={({ route }: any) => ({ ...hdr, headerTitle: route.params?.clientName ?? 'Chamados' })} />
            <Stack.Screen name="Notifications"  component={NotificationsScreen} options={{ ...hdr, headerTitle: 'Notificações' }} />
            <Stack.Screen name="Tracking"       component={TrackingScreen}      options={{ headerShown: false }} />
            <Stack.Screen name="Chat"           component={ChatScreen}          options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
