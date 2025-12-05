import React, { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import Logo from '../Img/Logo-Paginas.png';
import api from '../Services/Api'; 

const AdicionarNota = ({ route, navigation }) => {
    const { idAluno, alunoNome, notaId, isEditing } = route.params || {};

    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const screenTitle = isEditing ? "Editar Nota" : "Lançar Nota";

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (isEditing && notaId) {
            const fetchNotaData = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/Notas/${notaId}`);
                    const nota = response.data;

                    setValor(nota.nota.toString()); 
                    setDescricao(nota.avaliacao);
                    setData(new Date(nota.dataAvaliacao)); 

                } catch (error) {
                    console.error("Erro ao carregar nota para edição:", error.response ? error.response.data : error.message);
                    Alert.alert("Erro", "Não foi possível carregar os dados da nota para edição.");
                    navigation.goBack();
                } finally {
                    setLoading(false);
                }
            };
            fetchNotaData();
        }
    }, [isEditing, notaId, navigation]);
    
    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || data;
        setShowDatePicker(Platform.OS === 'ios');
        setData(currentDate);
    };

    const handleConfirm = async () => {
        if (!valor || !descricao || !data) {
            Alert.alert("Atenção", "Todos os campos são obrigatórios.");
            return;
        }

        const valorNumerico = parseFloat(valor.replace(',', '.'));
        if (isNaN(valorNumerico)) {
             Alert.alert("Erro de Entrada", "O valor da nota deve ser um número válido.");
             return;
        }

        setLoading(true);

        const formattedDate = data.toISOString().split('T')[0];

        const notaData = {
            IdAluno: idAluno,
            Nota: valorNumerico, 
            DataAvaliacao: formattedDate, 
            Avaliacao: descricao
        };

        try {
            if (isEditing) {
                await api.put(`/Notas/${notaId}`, notaData);
                Alert.alert("Sucesso", "Nota atualizada com sucesso!");
            } else {

                await api.post('/Notas', notaData);
                Alert.alert("Sucesso", "Nota lançada com sucesso!");
            }

            navigation.goBack(); 

        } catch (error) {
            console.error("Erro ao salvar nota:", error.response ? error.response.data : error.message);
            const msg = isEditing ? "Falha ao atualizar nota." : "Falha ao lançar nota. Verifique os dados.";
            Alert.alert("Erro", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={26} color="#6A1B9A" />
                </TouchableOpacity>

                 <Image
                    source={Logo}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>
            
            <Text style={styles.title}>{screenTitle}</Text>
            <Text style={styles.subtitle}>Aluno: {alunoNome}</Text>
            
            <View style={styles.form}>
                
                {/* Descrição/Disciplina */}
                <TextInput
                    style={styles.input}
                    placeholder="Descrição (ex: Prova, Avaliação, etc.)"
                    placeholderTextColor="#999"
                    value={descricao}
                    onChangeText={setDescricao}
                    editable={!loading}
                />
                
                {/* Valor da Nota */}
                <TextInput
                    style={styles.input}
                    placeholder="Valor da nota (ex: 8.5)"
                    placeholderTextColor="#999"
                    value={valor}
                    onChangeText={setValor}
                    keyboardType="numeric"
                    editable={!loading}
                />

                {/* Data de Aplicação */}
                <TouchableOpacity 
                    style={styles.dateInputContainer} 
                    onPress={() => setShowDatePicker(true)}
                    disabled={loading}
                >
                    <TextInput
                        style={styles.dateInputText}
                        placeholder="Data da avaliação"
                        placeholderTextColor="#999"
                        value={data.toLocaleDateString('pt-BR')}
                        editable={false} 
                    />
                    <Icon name="calendar-today" size={24} color="#A7A7A7" style={styles.calendarIcon} />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        testID="datePicker"
                        value={data}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}
                
                {/* Botões de Ação */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={handleCancel}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>CANCELAR</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.confirmButton} 
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>CONFIRMAR</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1eefb',
        paddingHorizontal: 20,
    },
    customHeader: {
        backgroundColor: '#f1eefb',
        paddingVertical: 10,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingTop: 40,
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    logoImage: {
        width: 150, 
        height: 35,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#6A1B9A',
        marginTop: 20,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins',
        color: '#AB47BC',
        marginBottom: 20,
    },
    form: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        fontFamily: 'Poppins',
        borderColor: '#D1C4E9',
        borderWidth: 1,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderColor: '#D1C4E9',
        borderWidth: 1,
    },
    dateInputText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins',
        color: '#333',
    },
    calendarIcon: {
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 15,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
});

export default AdicionarNota;