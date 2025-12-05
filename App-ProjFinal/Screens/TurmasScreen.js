import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';

import api from '../Services/Api'; 
import Logo from '../Img/Logo-Paginas.png';

const TurmasScreen = ({ navigation }) => {
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleCreateTurma = () => {
        navigation.navigate('AdicionarTurma'); 
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: () => (
                <Image
                    source={Logo}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            ),
            headerRight: () => (
                <TouchableOpacity onPress={handleCreateTurma} style={styles.headerAddButton}>
                    <Icon name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            ),
            headerStyle: {
                backgroundColor: '#f1eefb',
                borderBottomWidth: 0, 
                elevation: 0, 
                shadowOpacity: 0, 
            },
        });
    }, [navigation]);

    const fetchTurmas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/Turmas');

            const turmasMapeadas = response.data.map(t => ({
                id: t.idTurma, 
                name: t.nome, 
                detail: `Ano: ${t.anoLetivo} - ${t.quantidadeAlunos} alunos`, 
                idTurma: t.idTurma 
            }));

            setTurmas(turmasMapeadas); 
            
        } catch (error) {
            console.error("Erro ao buscar turmas:", error.response ? error.response.data : error.message);
            Alert.alert(
                "Erro de Conexão", 
                "Não foi possível carregar as turmas. Verifique o endpoint /Turmas e as configurações de rede/HTTPS."
            );
            setTurmas([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchTurmas();
        });
        return unsubscribe;
    }, [navigation, fetchTurmas]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTurmas();
    };

    const handleTurmaPress = (turma) => {
        navigation.navigate('AlunosScreen', { 
            selectedTurmaId: turma.id, 
            selectedTurmaName: turma.name 
        });
    };

    const handleDeleteTurma = (turmaId, turmaNome) => {
    Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja excluir a turma "${turmaNome}"?`,
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Excluir", 
                onPress: async () => {
                    try {
                        await api.delete(`/Turmas/${turmaId}`); 
                        
                        setTurmas(prev => prev.filter(t => t.id !== turmaId));
                        
                        Alert.alert("Sucesso", `Turma ${turmaNome} excluída.`);
                    } catch (error) {
                        console.error("Erro ao excluir turma:", error.message);
                        const msgErro = error.response && error.response.status === 409
                            ? "Não é possível excluir. A turma possui alunos vinculados."
                            : "Falha ao excluir turma.";
                        Alert.alert("Erro", msgErro);
                    }
                },
                style: "destructive"
            }
        ]
    );
};

    const renderItem = ({ item }) => (
        <View style={styles.turmaItemWrapper}>
            <TouchableOpacity 
                style={styles.turmaItem} 
                onPress={() => handleTurmaPress(item)}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.turmaNome}>{item.name || 'Nome da Turma Não Definido'}</Text>
                    <Text style={styles.turmaDetalhe}>
                        {item.detail || 'Detalhe Não Definido'} 
                    </Text>
                </View>
                {/* Botão de Navegação */}
                <Icon name="arrow-forward-ios" size={20} color="#6A1B9A" style={styles.navIcon} />
            </TouchableOpacity>

            {/* Botão de Excluir (Lixeira) */}
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteTurma(item.id, item.name)}
            >
                <Icon name="delete" size={24} color="#D32F2F" />
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>Carregando turmas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={turmas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A1B9A']} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="groups" size={60} color="#A7A7A7" />
                        <Text style={styles.emptyText}>Nenhuma turma cadastrada.</Text>
                        <Text style={styles.emptyTextHint}>Use o botão (+) acima para adicionar.</Text>
                    </View>
                )}
            />
        </View>
    );
};

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1eefb',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1eefb',
    },
    headerAddButton: {
        backgroundColor: '#FF9800',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 10,
    },
    logoImage: {
        width: 150,
        height: 35,
        marginLeft: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6A1B9A',
        fontFamily: 'Poppins',
    },
    listContent: {
        padding: 10,
    },
    turmaItemWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginVertical: 5,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    turmaItem: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    turmaNome: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#333',
    },
    turmaDetalhe: {
        fontSize: 14,
        fontFamily: 'Poppins',
        color: '#777',
        marginTop: 2,
    },
    navIcon: {
        marginLeft: 10,
    },
    deleteButton: { 
        paddingHorizontal: 15,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEBEE', 
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        fontFamily: 'Poppins',
        marginTop: 15,
    },
    emptyTextHint: {
        fontSize: 14,
        color: '#aaa',
        fontFamily: 'Poppins',
        marginTop: 5,
    },
});

export default TurmasScreen;