import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons'; 
import api from '../Services/Api';
import Logo from '../Img/Logo-Paginas.png';

const NotasScreen = ({ route, navigation }) => {
    const { selectedAlunoId, selectedAlunoName } = route.params;

    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedNotas, setSelectedNotas] = useState([]);

    const [presencaData, setPresencaData] = useState({
        aulasTotais: 0,
        faltas: 0,
        presencaPercentual: 0,
    });
    
    // --- Funções de Cálculo e Seleção ---
    const calculateAverage = () => {
        if (selectedNotas.length === 0) return 0.0;
        const total = selectedNotas.reduce((sum, id) => {
            const nota = notas.find(n => n.id === id);
            return sum + (nota ? parseFloat(nota.valor) : 0);
        }, 0);
        return (total / selectedNotas.length).toFixed(2);
    };

    const handleToggleSelectNota = (notaId) => {
        setSelectedNotas(prev => 
            prev.includes(notaId)
                ? prev.filter(id => id !== notaId) 
                : [...prev, notaId] 
        );
    };

    const handleToggleSelectionMode = () => {
        setIsSelectionMode(prev => !prev);
        setSelectedNotas([]); 
    };

    const handleCreateNota = () => {
        navigation.navigate('AdicionarNota', { 
            idAluno: selectedAlunoId, 
            isEditing: false,
            alunoNome: selectedAlunoName
        }); 
    };

    const handleDeleteSelected = async () => {
        if (selectedNotas.length === 0) {
            Alert.alert("Atenção", "Selecione pelo menos uma nota para excluir.");
            return;
        }

        Alert.alert(
            "Confirmar Exclusão",
            `Tem certeza que deseja excluir as ${selectedNotas.length} notas selecionadas?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    onPress: async () => {
                        try {
                            await api.delete('/Notas/deletar', { data: selectedNotas });
                            
                            Alert.alert("Sucesso", `${selectedNotas.length} notas excluídas.`);
                            
                            setIsSelectionMode(false);
                            setSelectedNotas([]);
                            fetchNotasAndPresenca();

                        } catch (error) {
                            console.error("Erro ao excluir notas:", error.message);
                            Alert.alert("Erro", "Falha ao excluir notas.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };
    
    const handleDeleteNota = (notaId, notaValor) => { };
    
    const fetchPresenca = useCallback(async () => {
        if (!selectedAlunoId) return;
        try {
            const response = await api.get(`/Presencas/aluno/${selectedAlunoId}/resumo`);
            setPresencaData(response.data);
        } catch (error) {
            console.error("Erro ao buscar presença:", error.response ? error.response.data : error.message);
            setPresencaData({ aulasTotais: 0, faltas: 0, presencaPercentual: 0 });
        }
    }, [selectedAlunoId]);

    const fetchNotasAndPresenca = useCallback(async () => {

        console.log(2)
        setLoading(true);
        setRefreshing(true);
        await Promise.all([
            fetchNotas(), 
            fetchPresenca()
        ]);
        setLoading(false);
        setRefreshing(false);
    }, []);
    // }, [fetchNotas, fetchPresenca]);
    
    const fetchNotas = useCallback(async () => {

        console.log(3) 

        if (!selectedAlunoId) return;

        try {

            console.log('selectedAlunoId')    
            console.log(selectedAlunoId)    

            const response = await api.get(`/Notas/Aluno/${selectedAlunoId}`);

            const notasMapeadas = response.data.map(n => ({
                id: n.idNota, 
                alunoId: n.idAluno, 
                valor: n.nota,
                data: n.dataAvaliacao, 
                descricao: n.avaliacao,
                detail: `Data: ${n.dataAvaliacao}` 
            }));

            setNotas(notasMapeadas); 
            
        } catch (error) {
            console.error("Erro ao buscar notas:", error.response ? error.response.data : error.message);
            setNotas([]);
        } 
    }, [selectedAlunoId, selectedAlunoName]);


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log(1)
            fetchNotasAndPresenca();
        });
        navigation.setOptions({ headerShown: false }); 
        return unsubscribe;
    }, [navigation, fetchNotasAndPresenca]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotasAndPresenca();
    };


    // --- Cards ---

    const PresencaCard = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Resumo de Presença</Text>
            <View style={styles.cardRow}>
                <View>
                    <Text style={styles.cardLabel}>% de Presença:</Text>
                    <Text style={[styles.largeCardValue, presencaData.presencaPercentual < 75 ? styles.textWarning : styles.textSuccess]}>
                        {presencaData.presencaPercentual.toFixed(1)}%
                    </Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.cardSubValue}>Aulas Dadas: {presencaData.aulasTotais}</Text>
                    <Text style={styles.cardSubValue}>Faltas: {presencaData.faltas}</Text>
                </View>
            </View>
        </View>
    );

    const MediaCard = () => {
        const media = calculateAverage();
        const showCard = isSelectionMode;
        
        if (!showCard) return null;

        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>⭐ Média das Notas Selecionadas</Text>
                <View style={styles.cardRow}>
                    <View>
                        <Text style={styles.cardLabel}>Média Calculada:</Text>
                        <Text style={[styles.largeCardValue, parseFloat(media) >= 6 ? styles.textSuccess : styles.textWarning]}>
                            {media}
                        </Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                         <Text style={styles.cardSubValue}>Notas selecionadas: {selectedNotas.length}</Text>

                        <TouchableOpacity 
                            onPress={handleDeleteSelected} 
                            style={[styles.deleteSelectedButton, selectedNotas.length === 0 && styles.deleteButtonDisabled]}
                            disabled={selectedNotas.length === 0}
                        >
                            <Icon name="delete-sweep" size={20} color="#FFFFFF" />
                            <Text style={styles.deleteSelectedText}>Excluir ({selectedNotas.length})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedNotas.includes(item.id);
        
        return (
            <TouchableOpacity 
                style={[styles.notaItemWrapper, isSelected && styles.selectedItemWrapper]}
                onPress={() => isSelectionMode && handleToggleSelectNota(item.id)}
                activeOpacity={isSelectionMode ? 0.8 : 1}
            >
                <View style={[styles.notaItem, isSelectionMode && styles.selectionModeItem]}>
                    
                    {isSelectionMode ? (
                        <Icon 
                            name={isSelected ? "check-box" : "check-box-outline-blank"} 
                            size={24} 
                            color={isSelected ? "#6A1B9A" : "#888"} 
                            style={{ marginRight: 10 }} 
                        />
                    ) : (
                        <Icon name="grade" size={24} color="#FF9800" style={{ marginRight: 10 }} />
                    )}
                    
                    {/* Descrição e Detalhe */}
                    <View style={styles.textContainer}>
                        <Text style={styles.itemDescricao}>{item.descricao || 'Sem Descrição'}</Text>
                        <Text style={styles.itemDetalhe}>{item.detail}</Text>
                    </View>

                    {/* Valor da Nota */}
                    <View style={styles.notaValorContainer}>
                         <Text style={styles.itemNotaValor}>{item.valor}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>Carregando dados do aluno...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.customHeader}>
                {/* Botão de Voltar */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={26} color="#6A1B9A" />
                </TouchableOpacity>

                 <Image
                    source={Logo}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.alunoTitle}>
                {selectedAlunoName}
            </Text>

            <View style={styles.cardsContainer}>
                <PresencaCard />
                <MediaCard />
            </View>
            
            <View style={styles.actionButtonsContainer}>
                 {/* Botão de ADICIONAR NOTA */}
                {!isSelectionMode && (
                    <TouchableOpacity onPress={handleCreateNota} style={styles.addButton}>
                        <Icon name="add-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Adicionar Nota</Text>
                    </TouchableOpacity>
                )}

                 {/* Botão de SELECIONAR NOTAS  */}
                <TouchableOpacity onPress={handleToggleSelectionMode} style={isSelectionMode ? styles.cancelButton : styles.selectButton}>
                    <Icon name={isSelectionMode ? "close" : "check-box"} size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{isSelectionMode ? "Cancelar Seleção" : "Selecionar Notas"}</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Notas */}
            <FlatList
                data={notas}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A1B9A']} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="edit-note" size={60} color="#A7A7A7" />
                        <Text style={styles.emptyText}>Nenhuma nota lançada para este aluno.</Text>
                        <Text style={styles.emptyTextHint}>Use o botão "Adicionar Nota" acima.</Text>
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
        paddingTop: 0,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1eefb', 
    },
    customHeader: {
        backgroundColor: '#f1eefb',
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingTop: 40,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    logoImage: {
        width: 150, 
        height: 35,
    },
    alunoTitle: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold',
        color: '#6A1B9A',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f1eefb', 
        borderBottomWidth: 2,
        borderBottomColor: '#D1C4E9',
    },
    cardsContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#6A1B9A',
        marginBottom: 8,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#555',
    },
    largeCardValue: {
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        marginTop: 5,
    },
    cardSubValue: {
         fontSize: 14,
         fontFamily: 'Poppins',
         color: '#777',
    },
    textSuccess: {
        color: '#4CAF50',
    },
    textWarning: {
        color: '#D32F2F',
    },
    deleteSelectedButton: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D32F2F', 
        padding: 8,
        borderRadius: 5,
    },
    deleteButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
    deleteSelectedText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Bold',
        marginLeft: 5,
        fontSize: 14,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#f1eefb', 
        borderBottomWidth: 1,
        borderBottomColor: '#D1C4E9',
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF9800', 
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 5,
    },
    selectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6A1B9A', 
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 5,
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D32F2F', 
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        marginLeft: 5,
    },

    listContent: {
        padding: 10,
        paddingBottom: 50,
    },
    notaItemWrapper: {
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
    selectedItemWrapper: {
        borderWidth: 2,
        borderColor: '#6A1B9A',
    },
    notaItem: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    selectionModeItem: {
        paddingVertical: 10,
    },
    textContainer: {
        flex: 1, 
        marginRight: 10,
        flexDirection: 'column', 
    },
    itemDescricao: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#333',
    },
    itemDetalhe: {
        fontSize: 12,
        fontFamily: 'Poppins',
        color: '#777',
        marginTop: 2,
    },
    notaValorContainer: {
        minWidth: 50, 
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    itemNotaValor: {
        fontSize: 24, 
        fontFamily: 'Poppins-Bold',
        color: '#6A1B9A', 
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
        fontFamily: 'Poppins',
        color: '#999',
        marginTop: 15,
    },
    emptyTextHint: {
        fontSize: 14,
        fontFamily: 'Poppins',
        color: '#aaa',
        marginTop: 5,
    },
});

export default NotasScreen;