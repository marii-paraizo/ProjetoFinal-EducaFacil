import React, { useState, useLayoutEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    Keyboard
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import api from '../Services/Api';
import Logo from '../Img/Logo-Paginas.png';

const AdicionarTurma = ({ navigation }) => {
    const [nome, setNome] = useState('');
    const [anoLetivo, setAnoLetivo] = useState('');
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    // --- Lógica de Confirmação ---
    const handleConfirm = async () => {
        const nomeTrimmed = nome.trim();
        const anoLetivoNum = parseInt(anoLetivo, 10);

        if (!nomeTrimmed || !anoLetivo) {
            Alert.alert("Atenção", "Todos os campos são obrigatórios.");
            return;
        }

        if (isNaN(anoLetivoNum) || anoLetivoNum < 2000 || anoLetivoNum > new Date().getFullYear() + 5) {
            Alert.alert("Atenção", "O Ano Letivo deve ser um ano válido (ex: 2025).");
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        const turmaData = {
            Nome: nomeTrimmed,
            AnoLetivo: anoLetivoNum
        };

        try {
            await api.post('/Turmas', turmaData);

            Alert.alert("Sucesso", `Turma '${nomeTrimmed}' criada com sucesso!`);
            navigation.goBack();

        } catch (error) {
            console.error("Erro ao criar turma:", error.response ? error.response.data : error.message);
            Alert.alert("Erro", "Falha ao cadastrar turma. Verifique a conexão ou se o nome já existe.");
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

            <Text style={styles.title}>Cadastrar Nova Turma</Text>

            <View style={styles.form}>

                {/* Nome da Turma */}
                <TextInput
                    style={styles.input}
                    placeholder="Nome da Turma (ex: 3º Ano A - Matutino)"
                    placeholderTextColor="#999"
                    value={nome}
                    onChangeText={setNome}
                    editable={!loading}
                />

                {/* Ano Letivo */}
                <TextInput
                    style={styles.input}
                    placeholder="Ano Letivo (ex: 2025)"
                    placeholderTextColor="#999"
                    value={anoLetivo}
                    onChangeText={setAnoLetivo}
                    keyboardType="numeric"
                    maxLength={4}
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
                            <Text style={styles.buttonText}>CADASTRAR</Text>
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
        marginBottom: 30,
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

export default AdicionarTurma;