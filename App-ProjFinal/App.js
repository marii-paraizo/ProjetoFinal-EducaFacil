import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/MaterialIcons';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font'; 

SplashScreen.preventAutoHideAsync();

import PgInicial from './Screens/PgInicial'; 
import TurmasScreen from './Screens/TurmasScreen';
import PresencaScreen from './Screens/PresencaScreen'; 
import AlunosScreen from './Screens/AlunosScreen'; 
import NotasScreen from './Screens/NotasScreen'; 
import AdicionarAluno from './Screens/AdicionarAluno'; 
import AdicionarNota from './Screens/AdicionarNota'; 
import AdicionarTurma from './Screens/AdicionarTurma'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator(); 

function AppTabs() {
    return (
        <Tab.Navigator
            initialRouteName="TurmasTab" 
            screenOptions={{
                headerShown: false, 
                tabBarActiveTintColor: '#6A1B9A',
                tabBarStyle: {
                    backgroundColor: '#FF9800', 
                    height: 60, 
                    paddingBottom: 5,
                    paddingTop: 5,
                },
                tabBarInactiveTintColor: '#FFFFFF', 
                tabBarLabelStyle: {
                    fontFamily: 'Poppins-Bold', 
                },
            }}
        >
            <Tab.Screen
                name="TurmasTab" 
                component={TurmasScreen}
                options={{
                    title: 'Turmas',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="groups" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="PresencaTab"
                component={PresencaScreen}
                options={{
                    title: 'Presença',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="check-circle-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    const [fontsLoaded] = useFonts({
        'Poppins': require('./assets/fonts//Poppins/Poppins-Regular.ttf'),
        'Poppins-Bold': require('./assets/fonts//Poppins/Poppins-Bold.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; 
    }

    return (
        <NavigationContainer onLayout={onLayoutRootView}>
            <Stack.Navigator
                initialRouteName="Inicial"
                screenOptions={{
                    headerShown: false,
                }}
            >
                {/* Telas Principais */}
                <Stack.Screen name="Inicial" component={PgInicial} />
                <Stack.Screen name="AppTabs" component={AppTabs} />
                
                <Stack.Screen 
                    name="AlunosScreen" 
                    component={AlunosScreen} 
                    options={{ headerShown: true, title: 'Lista de Alunos' }}
                />
                <Stack.Screen 
                    name="NotasScreen" 
                    component={NotasScreen} 
                    options={{ headerShown: false }} 
                />

                <Stack.Screen 
                    name="AdicionarAluno" 
                    component={AdicionarAluno} 
                    options={{ headerShown: true, title: 'Cadastro de Aluno' }}
                />
                <Stack.Screen 
                    name="AdicionarNota" 
                    component={AdicionarNota} 
                    options={{ headerShown: true, title: 'Lançar Nota' }}
                />
                <Stack.Screen 
                    name="AdicionarTurma" 
                    component={AdicionarTurma} 
                    options={{ headerShown: true, title: 'Criar Turma' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}