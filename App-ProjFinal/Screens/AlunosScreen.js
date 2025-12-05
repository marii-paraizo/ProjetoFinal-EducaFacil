import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import api from '../Services/Api';
import Logo from '../Img/Logo-Paginas.png';

const AlunosScreen = ({ route, navigation }) => {
    const { selectedTurmaId, selectedTurmaName } = route.params;

    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleCreateAluno = () => {
        navigation.navigate('AdicionarAluno', {
            idTurma: selectedTurmaId,
            isEditing: false
        });
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
                // Botão Amarelo Sólido para Adicionar Aluno
                <TouchableOpacity onPress={handleCreateAluno} style={styles.headerAddButton}>
                    <Icon name="person-add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            ),
            headerStyle: {
                // NOVO FUNDO DO CABEÇALHO
                backgroundColor: '#f1eefb',
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
            },
        });
    }, [navigation, selectedTurmaName, selectedTurmaId]);

    const fetchAlunos = useCallback(async () => {
        if (!selectedTurmaId) return;

        try {
            setLoading(true);
            const response = await api.get(`/Alunos/PorTurma/${selectedTurmaId}`);

            const alunosMapeados = response.data.map(a => ({
                id: a.idAluno,
                name: a.nome,
                rm: a.rm,
                detail: `RM: ${a.rm} - Nasc: ${a.dataNascimento}`,
                idTurma: a.idTurma
            }));

            setAlunos(alunosMapeados);

        } catch (error) {
            console.error("Erro ao buscar alunos:", error.response ? error.response.data : error.message);
            Alert.alert(
                "Erro de Conexão",
                `Não foi possível carregar os alunos da turma ${selectedTurmaName}. Verifique o endpoint /Alunos/Turma/{id}.`
            );
            setAlunos([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedTurmaId, selectedTurmaName]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchAlunos();
        });
        return unsubscribe;
    }, [navigation, fetchAlunos]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAlunos();
    };

    const handleAlunoPress = (aluno) => {
        navigation.navigate('NotasScreen', {
            selectedAlunoId: aluno.id,
            selectedAlunoName: aluno.name
        });
    };

    const handleEditAluno = (aluno) => {
        navigation.navigate('AdicionarAluno', {
            idTurma: aluno.idTurma,
            alunoId: aluno.id,
            isEditing: true
        });
    };

    const handleDeleteAluno = (alunoId, alunoNome) => {
        Alert.alert(
            "Confirmar Exclusão",
            `Tem certeza que deseja excluir o(a) aluno(a) "${alunoNome}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await api.delete(`/Alunos/${alunoId}`);

                            setAlunos(prev => prev.filter(a => a.id !== alunoId));

                            Alert.alert("Sucesso", `Aluno(a) ${alunoNome} excluído(a).`);
                        } catch (error) {
                            console.error("Erro ao excluir aluno:", error.message);
                            const msgErro = error.response && error.response.status === 404
                                ? "Aluno não encontrado ou já excluído."
                                : "Falha ao excluir aluno. Verifique a conexão.";
                            Alert.alert("Erro", msgErro);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.alunoItemWrapper}>

            {/* Informações do Aluno  */}
            <TouchableOpacity
                style={styles.alunoItem}
                onPress={() => handleAlunoPress(item)}
            >
                <Icon name="person" size={24} color="#6A1B9A" style={{ marginRight: 10 }} />
                <View style={styles.textContainer}>
                    <Text style={styles.alunoNome}>{item.name || 'Nome Não Definido'}</Text>
                    <Text style={styles.alunoDetalhe}>{item.detail || 'Detalhe Não Definido'}</Text>
                </View>

                {/* Ícone de Navegação */}
                <Icon name="arrow-forward-ios" size={20} color="#6A1B9A" style={styles.navIcon} />
            </TouchableOpacity>

            {/* Botão de Edição (Lápis) */}
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditAluno(item)}
            >
                <Icon name="edit" size={24} color="#FF9800" />
            </TouchableOpacity>

            {/* Botão de Excluir (Lixeira) */}
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAluno(item.id, item.name)}
            >
                <Icon name="delete" size={24} color="#D32F2F" />
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>Carregando alunos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.turmaTitle}>
                {selectedTurmaName} ({alunos.length} alunos)
            </Text>

            <FlatList
                data={alunos}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A1B9A']} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="person-off" size={60} color="#A7A7A7" />
                        <Text style={styles.emptyText}>Nenhum aluno nesta turma.</Text>
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
    logoImage: {
        width: 150,
        height: 35,
        marginLeft: 10,
    },
    headerAddButton: {
        backgroundColor: '#FF9800',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6A1B9A',
        fontFamily: 'Poppins',
    },
    turmaTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#6A1B9A',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 5,
    },
    listContent: {
        padding: 10,
    },
    alunoItemWrapper: {
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
    alunoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    alunoNome: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#333',
    },
    alunoDetalhe: {
        fontSize: 14,
        fontFamily: 'Poppins',
        color: '#777',
        marginTop: 2,
    },
    navIcon: {
        marginLeft: 10,
    },
    editButton: {
        paddingHorizontal: 15,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
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

export default AlunosScreen;