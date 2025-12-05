import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../Services/Api'; 
import Logo from '../Img/Logo-Paginas.png';

const AdicionarAluno = ({ route, navigation }) => {
    const { idTurma, alunoId, isEditing } = route.params || {};

    const [nome, setNome] = useState('');
    const [dataNascimento, setDataNascimento] = useState(new Date());
    const [rm, setRm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const screenTitle = isEditing ? "Editar Aluno" : "Cadastrar Aluno na Turma";
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (isEditing && alunoId) {
            const fetchAlunoData = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/Alunos/${alunoId}`);
                    const aluno = response.data;
                    
                    setNome(aluno.nome);
                    setRm(aluno.rm ? String(aluno.rm) : ''); 
                    setDataNascimento(new Date(aluno.dataNascimento)); 

                } catch (error) {
                    console.error("Erro ao carregar aluno para edição:", error.response ? error.response.data : error.message);
                    Alert.alert("Erro", "Não foi possível carregar os dados do aluno para edição.");
                    navigation.goBack();
                } finally {
                    setLoading(false);
                }
            };
            fetchAlunoData();
        }
    }, [isEditing, alunoId, navigation]);

    
    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || dataNascimento;
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        setDataNascimento(currentDate);
    };

    const handleConfirm = async () => {
        if (!nome || !rm || !dataNascimento || !idTurma) {
            Alert.alert("Atenção", "Todos os campos (incluindo a turma) são obrigatórios.");
            return;
        }

        setLoading(true);
        const formattedDate = dataNascimento.toISOString().split('T')[0];

        const alunoData = {
            Nome: nome,
            Rm: rm,
            DataNascimento: formattedDate,
            IdTurma: idTurma 
        };

        try {
            if (isEditing) {
                await api.put(`/Alunos/${alunoId}`, alunoData);
                Alert.alert("Sucesso", "Aluno atualizado com sucesso!");
            } else {
                await api.post('/Alunos', alunoData);
                Alert.alert("Sucesso", "Aluno cadastrado com sucesso!");
            }

            navigation.goBack(); 

        } catch (error) {
            console.error("Erro ao salvar aluno:", error.response ? error.response.data : error.message);
            const msg = isEditing ? "Falha ao atualizar aluno." : "Falha ao cadastrar aluno. Verifique se o RM já existe ou se a Turma é válida.";
            Alert.alert("Erro", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    if (loading && isEditing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
        );
    }
    
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
            
            <View style={styles.form}>
                
                {/* Nome do aluno */}
                <TextInput
                    style={styles.input}
                    placeholder="Nome do aluno"
                    placeholderTextColor="#999"
                    value={nome}
                    onChangeText={setNome}
                    editable={!loading}
                />

                {/* Data de Nascimento */}
                <TouchableOpacity 
                    style={styles.dateInputContainer} 
                    onPress={() => setShowDatePicker(true)}
                    disabled={loading}
                >
                    <TextInput
                        style={styles.dateInputText}
                        placeholder="Data de nascimento"
                        placeholderTextColor="#999"
                        value={dataNascimento.toLocaleDateString('pt-BR')}
                        editable={false}
                    />
                    <Icon name="calendar-today" size={24} color="#A7A7A7" style={styles.calendarIcon} />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        testID="datePicker"
                        value={dataNascimento}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeDate}
                        maximumDate={new Date()}
                    />
                )}
                
                {/* RM */}
                <TextInput
                    style={styles.input}
                    placeholder="RM"
                    placeholderTextColor="#999"
                    value={rm}
                    onChangeText={setRm}
                    keyboardType="numeric"
                    editable={!loading}
                />

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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1eefb',
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
        marginBottom: 10,
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
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6A1B9A',
        fontFamily: 'Poppins',
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
        color: '#333',
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

export default AdicionarAluno;