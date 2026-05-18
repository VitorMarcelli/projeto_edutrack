import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { CreateSubjectScreen } from '../screens/app/CreateSubjectScreen';
import { TasksListScreen } from '../screens/app/TasksListScreen';
import { CreateTaskScreen } from '../screens/app/CreateTaskScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial caso já esteja logado no celular
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // Fica escutando mudanças na autenticação (login/logout/token expirar)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0056D2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          // Fluxo do Usuário Logado
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="CreateSubject" component={CreateSubjectScreen} />
            <Stack.Screen name="TasksList" component={TasksListScreen} />
            <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
          </>
        ) : (
          // Fluxo do Usuário Deslogado (Autenticação)
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
